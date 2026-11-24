import {
  ClienteSessao,
  type ArmazenamentoDeRefresh,
  type Trava,
} from '../src/infraestrutura/api/cliente-sessao';
import { ErroApi, ErroDeRede, SessaoEncerrada } from '../src/infraestrutura/api/erros';
import { criarTravaEmProcesso } from '../src/infraestrutura/seguranca/trava';

const QUINZE_MIN = 15 * 60_000;
let relogio = Date.parse('2026-11-24T12:00:00Z');
const agora = () => relogio;

const json = (status: number, corpo?: unknown, cabecalhos?: Record<string, string>) =>
  new Response(corpo === undefined ? null : JSON.stringify(corpo), { status, headers: cabecalhos });

const sessao = (n: number, refresh: string | null = `rt-${n}`, pendentes = false) => ({
  token_acesso: `acesso-${n}`,
  token_acesso_expira_em: new Date(relogio + QUINZE_MIN).toISOString(),
  refresh_token: refresh,
  aceites_pendentes: pendentes,
});

type Chamada = { caminho: string; init: RequestInit };

/** Servidor falso: `rotas` responde por "METODO caminho"; tudo o que sai fica em `eventos`. */
function montar(opcoes: {
  plataforma?: 'android' | 'web';
  refreshInicial?: string | null;
  saidaPendente?: boolean;
  eventos?: string[];
  trava?: Trava;
  rotas: Record<string, (chamada: Chamada, vez: number) => Response | Promise<Response>>;
}) {
  const eventos = opcoes.eventos ?? [];
  let guardado = opcoes.refreshInicial ?? null;
  let marca = opcoes.saidaPendente ?? false;
  const armazenamento: ArmazenamentoDeRefresh & {
    gravar: jest.Mock;
    ler: jest.Mock;
    limpar: jest.Mock;
  } = {
    saidaPendente: async () => marca,
    marcarSaidaPendente: async () => {
      marca = true;
    },
    limparSaidaPendente: async () => {
      marca = false;
    },
    ler: jest.fn(async () => {
      eventos.push('ler');
      return guardado;
    }),
    gravar: jest.fn(async (t: string) => {
      eventos.push(`gravar:${t}`);
      guardado = t;
    }),
    limpar: jest.fn(async () => {
      eventos.push('limpar');
      guardado = null;
    }),
  };
  const chamadas: Chamada[] = [];
  const vezes: Record<string, number> = {};
  const fetchFalso = jest.fn(async (url: string | URL | Request, init: RequestInit = {}) => {
    const caminho = String(url).replace('http://api.teste', '');
    const chave = `${init.method ?? 'GET'} ${caminho.split('?')[0]}`;
    const auth = (init.headers as Record<string, string>)?.Authorization ?? '';
    eventos.push(`fetch:${chave}${auth ? ` [${auth.replace('Bearer ', '')}]` : ''}`);
    chamadas.push({ caminho, init });
    vezes[chave] = (vezes[chave] ?? 0) + 1;
    const rota = opcoes.rotas[chave];
    if (!rota) throw new Error(`rota não prevista: ${chave}`);
    return rota({ caminho, init }, vezes[chave]);
  });
  const cliente = new ClienteSessao({
    baseUrl: 'http://api.teste',
    plataforma: opcoes.plataforma ?? 'android',
    armazenamento,
    trava: opcoes.trava ?? criarTravaEmProcesso(),
    identificadorDaInstalacao: async () => 'inst-teste',
    fetch: fetchFalso as unknown as typeof fetch,
    agora,
  });
  return { cliente, armazenamento, chamadas, eventos, fetchFalso, vezes, marca: () => marca };
}

const cabecalho = (c: Chamada, nome: string) => (c.init.headers as Record<string, string>)[nome];

beforeEach(() => {
  relogio = Date.parse('2026-11-24T12:00:00Z');
});

describe('renovação single-flight', () => {
  test('N chamadas com o acesso vencido geram 1 renovação e todas usam o token novo', async () => {
    const { cliente, vezes, chamadas } = montar({
      rotas: {
        'POST /v1/acesso/entrar': () => json(200, sessao(1)),
        'POST /v1/acesso/renovar': () =>
          new Promise((r) => setTimeout(() => r(json(200, sessao(2))), 10)),
        'GET /v1/eu': () => json(200, { ok: true }),
      },
    });
    await cliente.abrirSessaoCom('/v1/acesso/entrar', { email: 'a@b.co', senha: 'x' });
    relogio += QUINZE_MIN + 1000; // acesso vencido

    await Promise.all(Array.from({ length: 5 }, () => cliente.requisitar('GET', '/v1/eu')));

    expect(vezes['POST /v1/acesso/renovar']).toBe(1);
    const autorizacoes = chamadas
      .filter((c) => c.caminho === '/v1/eu')
      .map((c) => cabecalho(c, 'Authorization'));
    expect(autorizacoes).toEqual(Array(5).fill('Bearer acesso-2'));
  });

  test('um 401 numa chamada renova uma vez e repete; outro 401 limpa a sessão', async () => {
    let negar = true;
    const { cliente, vezes } = montar({
      rotas: {
        'POST /v1/acesso/entrar': () => json(200, sessao(1)),
        'POST /v1/acesso/renovar': () => json(200, sessao(2)),
        'GET /v1/eu': (c) =>
          negar && cabecalho(c, 'Authorization') === 'Bearer acesso-1'
            ? json(401, { codigo: 'SESSAO_EXPIRADA', mensagem: 'x', request_id: 'req_1' })
            : json(200, { ok: true }),
      },
    });
    await cliente.abrirSessaoCom('/v1/acesso/entrar', { email: 'a@b.co', senha: 'x' });
    await expect(cliente.requisitar('GET', '/v1/eu')).resolves.toEqual({ ok: true });
    expect(vezes['POST /v1/acesso/renovar']).toBe(1);

    negar = false;
    const q = montar({
      rotas: {
        'POST /v1/acesso/entrar': () => json(200, sessao(1)),
        'POST /v1/acesso/renovar': () => json(200, sessao(2)),
        'GET /v1/eu': () =>
          json(401, { codigo: 'SESSAO_EXPIRADA', mensagem: 'x', request_id: 'r' }),
      },
    });
    await q.cliente.abrirSessaoCom('/v1/acesso/entrar', { email: 'a@b.co', senha: 'x' });
    await expect(q.cliente.requisitar('GET', '/v1/eu')).rejects.toBeInstanceOf(SessaoEncerrada);
    expect(q.cliente.estado.tipo).toBe('anonima');
    expect(q.armazenamento.limpar).toHaveBeenCalled();
  });
});

describe('refresh no app', () => {
  test('grava o refresh novo antes de usar o acesso novo', async () => {
    const eventos: string[] = [];
    const { cliente } = montar({
      eventos,
      refreshInicial: 'rt-1',
      rotas: {
        'POST /v1/acesso/renovar': () => json(200, sessao(2)),
        'GET /v1/eu': () => json(200, {}),
      },
    });
    await cliente.restaurar();
    await cliente.requisitar('GET', '/v1/eu');
    expect(eventos.indexOf('gravar:rt-2')).toBeGreaterThan(-1);
    expect(eventos.indexOf('gravar:rt-2')).toBeLessThan(
      eventos.indexOf('fetch:GET /v1/eu [acesso-2]'),
    );
  });

  test('se a gravação falha, o acesso novo não entra em uso', async () => {
    const { cliente, armazenamento } = montar({
      refreshInicial: 'rt-1',
      rotas: { 'POST /v1/acesso/renovar': () => json(200, sessao(2)) },
    });
    armazenamento.gravar.mockRejectedValue(new Error('keychain indisponível'));
    await cliente.restaurar();
    expect(cliente.estado.tipo).toBe('falha-ao-restaurar');
  });

  test('a renovação manda o refresh lido do armazenamento seguro, sem cabeçalho de web', async () => {
    const { cliente, chamadas } = montar({
      refreshInicial: 'rt-guardado',
      rotas: { 'POST /v1/acesso/renovar': () => json(200, sessao(2)) },
    });
    await cliente.restaurar();
    expect(JSON.parse(String(chamadas[0]?.init.body))).toEqual({ refresh_token: 'rt-guardado' });
    expect(cabecalho(chamadas[0]!, 'X-CondomiFacil-Web')).toBeUndefined();
    expect(cliente.estado).toEqual({ tipo: 'autenticada', aceitesPendentes: false });
  });

  test('sem refresh guardado a sessão fica anônima, sem chamar a API', async () => {
    const { cliente, fetchFalso } = montar({ refreshInicial: null, rotas: {} });
    await cliente.restaurar();
    expect(cliente.estado.tipo).toBe('anonima');
    expect(fetchFalso).not.toHaveBeenCalled();
  });
});

describe('401 na renovação, logout e erros', () => {
  test('401 de renovação limpa acesso, refresh e cache, e avisa quem escuta', async () => {
    const { cliente, armazenamento } = montar({
      refreshInicial: 'rt-1',
      rotas: {
        'POST /v1/acesso/renovar': () =>
          json(401, { codigo: 'SESSAO_EXPIRADA', mensagem: 'x', request_id: 'req_1' }),
      },
    });
    const limpeza = jest.fn();
    cliente.aoLimparSessao(limpeza);
    await cliente.restaurar();
    expect(cliente.estado.tipo).toBe('anonima');
    expect(armazenamento.limpar).toHaveBeenCalled();
    expect(limpeza).toHaveBeenCalledTimes(1);
    await expect(cliente.requisitar('GET', '/v1/eu')).rejects.toBeInstanceOf(SessaoEncerrada);
  });

  test('sair revoga no servidor e apaga acesso, refresh e cache', async () => {
    const { cliente, armazenamento, chamadas } = montar({
      rotas: {
        'POST /v1/acesso/entrar': () => json(200, sessao(1)),
        'POST /v1/acesso/sair': () => json(204),
      },
    });
    const limpeza = jest.fn();
    cliente.aoLimparSessao(limpeza);
    await cliente.abrirSessaoCom('/v1/acesso/entrar', { email: 'a@b.co', senha: 'x' });
    await cliente.sair();
    expect(cabecalho(chamadas[1]!, 'Authorization')).toBe('Bearer acesso-1');
    expect(armazenamento.limpar).toHaveBeenCalled();
    expect(limpeza).toHaveBeenCalled();
    expect(cliente.estado.tipo).toBe('anonima');
  });

  test('sair limpa o aparelho mesmo sem internet', async () => {
    const { cliente, armazenamento } = montar({
      rotas: {
        'POST /v1/acesso/entrar': () => json(200, sessao(1)),
        'POST /v1/acesso/sair': () => {
          throw new TypeError('Network request failed');
        },
      },
    });
    await cliente.abrirSessaoCom('/v1/acesso/entrar', { email: 'a@b.co', senha: 'x' });
    await cliente.sair();
    expect(armazenamento.limpar).toHaveBeenCalled();
    expect(cliente.estado.tipo).toBe('anonima');
  });

  test('erro do contrato vira ErroApi com código, Retry-After e request_id', async () => {
    const { cliente } = montar({
      rotas: {
        'POST /v1/acesso/entrar': () =>
          json(
            429,
            { codigo: 'ACESSO_PAUSADO', mensagem: 'pausado', request_id: 'req_9' },
            { 'Retry-After': '900' },
          ),
      },
    });
    const erro = await cliente
      .abrirSessaoCom('/v1/acesso/entrar', { email: 'a@b.co', senha: 'x' })
      .catch((e: unknown) => e);
    expect(erro).toBeInstanceOf(ErroApi);
    expect(erro).toMatchObject({
      status: 429,
      codigo: 'ACESSO_PAUSADO',
      requestId: 'req_9',
      esperarSegundos: 900,
    });
    expect(cliente.estado.tipo).toBe('restaurando');
  });

  test('renovação com 5xx ou 429 não apaga a sessão nem repete', async () => {
    const { cliente, armazenamento, vezes } = montar({
      refreshInicial: 'rt-1',
      rotas: {
        'POST /v1/acesso/renovar': () =>
          json(503, { codigo: 'INDISPONIVEL', mensagem: 'x', request_id: 'r' }),
      },
    });
    await cliente.restaurar();
    expect(cliente.estado.tipo).toBe('falha-ao-restaurar');
    expect(armazenamento.limpar).not.toHaveBeenCalled();
    expect(vezes['POST /v1/acesso/renovar']).toBe(1);
  });
});

describe('retry da renovação (regra de 30 s do servidor)', () => {
  test('resposta perdida: repete uma vez com o mesmo refresh e dá certo', async () => {
    const { cliente, chamadas } = montar({
      refreshInicial: 'rt-1',
      rotas: {
        'POST /v1/acesso/renovar': (_c, vez) => {
          if (vez === 1) throw new TypeError('Network request failed');
          return json(200, sessao(2));
        },
      },
    });
    await cliente.restaurar();
    expect(cliente.estado.tipo).toBe('autenticada');
    expect(chamadas).toHaveLength(2);
    expect(chamadas[1]?.init.body).toBe(chamadas[0]?.init.body);
  });

  test('duas falhas de rede: para, mantém o refresh e não inventa terceiro retry', async () => {
    const { cliente, armazenamento, vezes } = montar({
      refreshInicial: 'rt-1',
      rotas: {
        'POST /v1/acesso/renovar': () => {
          throw new TypeError('Network request failed');
        },
      },
    });
    await cliente.restaurar();
    expect(vezes['POST /v1/acesso/renovar']).toBe(2);
    expect(cliente.estado.tipo).toBe('falha-ao-restaurar');
    expect(armazenamento.limpar).not.toHaveBeenCalled();
  });

  test('passados 30 s da primeira tentativa, não repete', async () => {
    const { cliente, vezes } = montar({
      refreshInicial: 'rt-1',
      rotas: {
        'POST /v1/acesso/renovar': () => {
          relogio += 31_000;
          throw new TypeError('Network request failed');
        },
      },
    });
    await cliente.restaurar();
    expect(vezes['POST /v1/acesso/renovar']).toBe(1);
  });
});

describe('várias abas na web (trava compartilhada)', () => {
  test('duas abas com acesso vencido nunca renovam ao mesmo tempo', async () => {
    const trava = criarTravaEmProcesso(); // faz o papel do Web Locks, compartilhado entre as abas
    let emVoo = 0;
    let maximo = 0;
    let n = 1;
    const rotas = {
      'POST /v1/acesso/entrar': () => json(200, sessao(1, null)),
      'POST /v1/acesso/renovar': async () => {
        emVoo += 1;
        maximo = Math.max(maximo, emVoo);
        await new Promise((r) => setTimeout(r, 10));
        emVoo -= 1;
        n += 1;
        return json(200, sessao(n, null));
      },
      'GET /v1/eu': () => json(200, {}),
    };
    const abaA = montar({ plataforma: 'web', trava, rotas }).cliente;
    const abaB = montar({ plataforma: 'web', trava, rotas }).cliente;
    await abaA.abrirSessaoCom('/v1/acesso/entrar', { email: 'a@b.co', senha: 'x' });
    await abaB.abrirSessaoCom('/v1/acesso/entrar', { email: 'a@b.co', senha: 'x' });
    relogio += QUINZE_MIN + 1000;

    await Promise.all([abaA.requisitar('GET', '/v1/eu'), abaB.requisitar('GET', '/v1/eu')]);

    expect(maximo).toBe(1);
    expect(n).toBe(3); // cada aba renovou uma vez, em fila
  });
});

describe('web: o refresh nunca passa pelo JavaScript', () => {
  test('entrar e renovar usam cookie, cabeçalho de web e nenhum refresh no corpo ou no storage', async () => {
    const { cliente, armazenamento, chamadas } = montar({
      plataforma: 'web',
      rotas: {
        // Mesmo que o servidor mandasse o refresh no corpo, o cliente web o ignora.
        'POST /v1/acesso/entrar': () => json(200, sessao(1, 'rt-vazado')),
        'POST /v1/acesso/renovar': () => json(200, sessao(2, null)),
        'GET /v1/eu': () => json(200, {}),
        'POST /v1/acesso/sair': () => json(204),
      },
    });
    await cliente.abrirSessaoCom('/v1/acesso/entrar', { email: 'a@b.co', senha: 'x' });
    relogio += QUINZE_MIN + 1000;
    await cliente.requisitar('GET', '/v1/eu');
    await cliente.sair();

    const [entrar, renovar, eu, sair] = chamadas;
    for (const c of [entrar!, renovar!, sair!]) {
      expect(cabecalho(c, 'X-CondomiFacil-Web')).toBe('1');
      expect(c.init.credentials).toBe('include');
    }
    expect(renovar!.init.body).toBeUndefined();
    expect(String(entrar!.init.body)).not.toContain('rt-');
    expect(cabecalho(eu!, 'X-CondomiFacil-Web')).toBeUndefined();
    expect(eu!.init.credentials).toBeUndefined();
    expect(armazenamento.ler).not.toHaveBeenCalled();
    expect(armazenamento.gravar).not.toHaveBeenCalled();
  });

  test('restaurar na web tenta o cookie e, sem sessão, fica anônima', async () => {
    const { cliente } = montar({
      plataforma: 'web',
      rotas: {
        'POST /v1/acesso/renovar': () =>
          json(401, { codigo: 'SESSAO_EXPIRADA', mensagem: 'x', request_id: 'r' }),
      },
    });
    await cliente.restaurar();
    expect(cliente.estado.tipo).toBe('anonima');
  });
});

describe('web: sair sem internet (saída pendente)', () => {
  const semRede = () => {
    throw new TypeError('Network request failed');
  };
  const entrar = { 'POST /v1/acesso/entrar': () => json(200, sessao(1, null)) };

  test('sair sem internet limpa o aparelho e grava a marca; sair com sucesso não grava', async () => {
    const a = montar({ plataforma: 'web', rotas: { ...entrar, 'POST /v1/acesso/sair': semRede } });
    await a.cliente.abrirSessaoCom('/v1/acesso/entrar', { email: 'a@b.co', senha: 'x' });
    await a.cliente.sair();
    expect(a.cliente.estado.tipo).toBe('anonima');
    expect(a.marca()).toBe(true);

    const b = montar({
      plataforma: 'web',
      rotas: { ...entrar, 'POST /v1/acesso/sair': () => json(204) },
    });
    await b.cliente.abrirSessaoCom('/v1/acesso/entrar', { email: 'a@b.co', senha: 'x' });
    await b.cliente.sair();
    expect(b.marca()).toBe(false);
  });

  test('com a marca, a abertura não abre sessão: renova só para o sair e apaga a marca ao confirmar', async () => {
    const estados: string[] = [];
    const { cliente, chamadas, marca } = montar({
      plataforma: 'web',
      saidaPendente: true,
      rotas: {
        'POST /v1/acesso/renovar': () => json(200, sessao(2, null)),
        'POST /v1/acesso/sair': () => json(204),
      },
    });
    cliente.assinar(() => estados.push(cliente.estado.tipo));
    await cliente.restaurar();
    expect(chamadas.map((c) => c.caminho)).toEqual(['/v1/acesso/renovar', '/v1/acesso/sair']);
    expect(cabecalho(chamadas[1]!, 'Authorization')).toBe('Bearer acesso-2');
    expect(estados).not.toContain('autenticada');
    expect(cliente.estado.tipo).toBe('anonima');
    expect(marca()).toBe(false);
  });

  test('sem internet de novo: a marca fica e a sessão não é retomada', async () => {
    const { cliente, marca } = montar({
      plataforma: 'web',
      saidaPendente: true,
      rotas: { 'POST /v1/acesso/renovar': semRede },
    });
    await cliente.restaurar();
    expect(cliente.estado.tipo).toBe('falha-ao-restaurar');
    expect(marca()).toBe(true);
  });

  test('renovação com 401 (sessão já morta) apaga a marca', async () => {
    const { cliente, marca, vezes } = montar({
      plataforma: 'web',
      saidaPendente: true,
      rotas: {
        'POST /v1/acesso/renovar': () =>
          json(401, { codigo: 'SESSAO_EXPIRADA', mensagem: 'x', request_id: 'r' }),
      },
    });
    await cliente.restaurar();
    expect(cliente.estado.tipo).toBe('anonima');
    expect(marca()).toBe(false);
    expect(vezes['POST /v1/acesso/sair']).toBeUndefined();
  });

  test('um novo login apaga a marca antiga', async () => {
    const { cliente, marca } = montar({ plataforma: 'web', saidaPendente: true, rotas: entrar });
    await cliente.abrirSessaoCom('/v1/acesso/entrar', { email: 'a@b.co', senha: 'x' });
    expect(marca()).toBe(false);
  });
});

test('sem URL da API a chamada falha como erro de rede', async () => {
  const cliente = new ClienteSessao({
    baseUrl: '',
    plataforma: 'android',
    armazenamento: {
      ler: async () => null,
      gravar: async () => undefined,
      limpar: async () => undefined,
    },
    trava: criarTravaEmProcesso(),
    identificadorDaInstalacao: async () => 'x',
  });
  await expect(cliente.publica('POST', '/v1/acesso/codigo', {})).rejects.toBeInstanceOf(ErroDeRede);
});
