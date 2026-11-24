// Configuração do acesso (RM-20). Segredos só por variável de ambiente; a mensagem de erro lista
// os nomes, nunca os valores. A API recusa subir sem eles (main.api.ts).
import { lerOrigens } from '../../compartilhado/config/config.js';

export interface ConfigAcesso {
  chaveJwt: Buffer;
  chaveHmac: Buffer;
  emissor: string;
  audiencia: string;
  /** Origens permitidas: a mesma lista normalizada do CORS e da proteção CSRF (ADR-007). Nunca curinga. */
  origensWeb: string[];
  ttlAcessoSegundos: number;
  /** Janela deslizante da sessão: cada renovação vale mais isto. */
  validadeSessaoDias: number;
  /** Teto absoluto desde `sessao.criada_em` (ADR-007): a renovação não passa dele. */
  tetoSessaoDias: number;
  /** Valores provisórios do limitador em memória (E16); a medição define os definitivos. */
  limiteIpPorMinuto: number;
  limiteEmailPorMinuto: number;
}

const CHAVE_MINIMA = 32;

function inteiro(v: string | undefined, padrao: number): number | undefined {
  if (v === undefined || v === '') return padrao;
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

export function lerConfigAcesso(env: NodeJS.ProcessEnv = process.env): ConfigAcesso {
  const invalidas: string[] = [];
  const texto = (nome: string, minimo = 1) => {
    const v = env[nome] ?? '';
    if (v.length < minimo) invalidas.push(nome);
    return v;
  };
  const chaveJwt = texto('JWT_SIGNING_KEY', CHAVE_MINIMA);
  const chaveHmac = texto('IDENTITY_HMAC_KEY', CHAVE_MINIMA);
  if (chaveJwt && chaveJwt === chaveHmac) invalidas.push('IDENTITY_HMAC_KEY');
  const emissor = texto('JWT_ISSUER');
  const audiencia = texto('JWT_AUDIENCE');
  const origensWeb = lerOrigens(env.CORS_ALLOWED_ORIGINS);
  if (!origensWeb) invalidas.push('CORS_ALLOWED_ORIGINS');
  const limiteIp = inteiro(env.RATE_LIMIT_IP_PER_MIN, 60);
  const limiteEmail = inteiro(env.RATE_LIMIT_EMAIL_PER_MIN, 10);
  if (limiteIp === undefined) invalidas.push('RATE_LIMIT_IP_PER_MIN');
  if (limiteEmail === undefined) invalidas.push('RATE_LIMIT_EMAIL_PER_MIN');
  if (invalidas.length > 0 || !origensWeb || limiteIp === undefined || limiteEmail === undefined) {
    throw new Error(`Configuração inválida ou ausente: ${[...new Set(invalidas)].join(', ')}`);
  }
  return {
    chaveJwt: Buffer.from(chaveJwt),
    chaveHmac: Buffer.from(chaveHmac),
    emissor,
    audiencia,
    origensWeb,
    ttlAcessoSegundos: 15 * 60,
    validadeSessaoDias: 30,
    tetoSessaoDias: 90,
    limiteIpPorMinuto: limiteIp,
    limiteEmailPorMinuto: limiteEmail,
  };
}

export const CONFIG_ACESSO = Symbol('CONFIG_ACESSO');
