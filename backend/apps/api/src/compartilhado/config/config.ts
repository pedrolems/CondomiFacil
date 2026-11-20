const AMBIENTES = ['dev', 'staging', 'production'] as const;

export interface Config {
  APP_ENV: (typeof AMBIENTES)[number];
  PORT: number;
  CORS_ALLOWED_ORIGINS: string[];
}

function urlValida(v: string): boolean {
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
}

/** Valida o ambiente; a mensagem lista só os nomes das variáveis, nunca os valores. */
export function lerConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const invalidas: string[] = [];

  const appEnv = AMBIENTES.find((a) => a === env.APP_ENV);
  if (!appEnv) invalidas.push('APP_ENV');

  const port = Number(env.PORT);
  if (env.PORT === undefined || !Number.isInteger(port) || port < 1 || port > 65535) {
    invalidas.push('PORT');
  }

  // Lista separada por vírgula; vazio = nenhuma origem cross-origin permitida (nunca `*`).
  const origens = (env.CORS_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  if (!origens.every(urlValida)) invalidas.push('CORS_ALLOWED_ORIGINS');

  if (invalidas.length > 0 || !appEnv) {
    throw new Error(`Configuração inválida ou ausente: ${invalidas.join(', ')}`);
  }
  return { APP_ENV: appEnv, PORT: port, CORS_ALLOWED_ORIGINS: origens };
}
