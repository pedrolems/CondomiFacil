// Log em JSON, uma linha por evento (backend §4.8). Nenhum campo passa sem `sanitizar`.
import { UUID } from '../uuid.js';

const PROIBIDOS = new Set([
  'nome',
  'email',
  'documento',
  'cpf',
  'cnpj',
  'telefone',
  'celular',
  'senha',
  'password',
  'token',
  'refreshtoken',
  'accesstoken',
  'authorization',
  'cookie',
  'corpo',
  'body',
  'relato',
  'descricao',
  'avaliacao',
  'comentario',
  'voto',
]);

const MASCARA = '[removido]';
// Dados pessoais que escapam em texto livre (mensagem de erro do driver, por exemplo).
// Bordas (?<![\w-]) e (?![\w-]): nunca mascarar dentro de UUID, hash ou outro identificador.
const B0 = String.raw`(?<![\w-])`;
const B1 = String.raw`(?![\w-])`;
const PADROES: [RegExp, string][] = [
  [/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, '[email]'],
  // Telefone antes do documento (11 dígitos sem formato batem nos dois): DDD entre parênteses ou
  // separado por espaço; ou 11 dígitos sem formato (DDD + 9...).
  [
    new RegExp(`${B0}(?:\\+?55\\s?)?(?:\\(\\d{2}\\)\\s?|\\d{2}\\s)9?\\d{4}-?\\d{4}${B1}`, 'g'),
    '[telefone]',
  ],
  [new RegExp(`${B0}(?:\\+?55)?\\d{2}9\\d{8}${B1}`, 'g'), '[telefone]'],
  [new RegExp(`${B0}\\d{3}\\.?\\d{3}\\.?\\d{3}-?\\d{2}${B1}`, 'g'), '[documento]'],
  [new RegExp(`${B0}\\d{2}\\.?\\d{3}\\.?\\d{3}\\/?\\d{4}-?\\d{2}${B1}`, 'g'), '[documento]'],
  [/\bBearer\s+[\w.~+/-]+=*/gi, 'Bearer [token]'],
];

export function mascararTexto(texto: string): string {
  return PADROES.reduce((t, [re, sub]) => t.replace(re, sub), texto);
}

/** Só o tipo (e o código do driver): a mensagem pode trazer nome ou outro dado que nenhum padrão pega. */
export function descreverErro(e: Error): string {
  const codigo = (e as { code?: unknown }).code;
  return typeof codigo === 'string' ? `${e.name} (${codigo})` : e.name;
}

const chaveNormalizada = (k: string) => k.toLowerCase().replace(/[^a-z]/g, '');
// Por substring: nome_completo, nomeSocial, email_destinatario... também são proibidos.
const proibida = (k: string) => {
  const n = chaveNormalizada(k);
  return [...PROIBIDOS].some((p) => n.includes(p));
};

/** Remove os campos proibidos (em qualquer profundidade) e mascara dados pessoais em textos. */
export function sanitizar(valor: unknown, profundidade = 0): unknown {
  if (typeof valor === 'string') return UUID.test(valor) ? valor : mascararTexto(valor);
  if (valor === null || typeof valor !== 'object') return valor;
  if (valor instanceof Date) return valor.toISOString();
  if (profundidade > 8) return MASCARA;
  if (valor instanceof Error) return descreverErro(valor);
  if (Array.isArray(valor)) return valor.map((v) => sanitizar(v, profundidade + 1));
  return Object.fromEntries(
    Object.entries(valor).map(([k, v]) => [
      k,
      proibida(k) ? MASCARA : sanitizar(v, profundidade + 1),
    ]),
  );
}

export type Campos = Record<string, unknown>;

export class LoggerJson {
  constructor(
    private readonly escrever: (linha: string) => void = (l) => process.stdout.write(`${l}\n`),
  ) {}

  info(evento: string, campos: Campos = {}): void {
    this.registrar('info', evento, campos);
  }

  erro(evento: string, campos: Campos = {}): void {
    this.registrar('erro', evento, campos);
  }

  private registrar(nivel: string, evento: string, campos: Campos): void {
    this.escrever(
      JSON.stringify({
        nivel,
        evento,
        em: new Date().toISOString(),
        ...(sanitizar(campos) as Campos),
      }),
    );
  }
}
