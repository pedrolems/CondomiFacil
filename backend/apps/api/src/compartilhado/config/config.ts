const AMBIENTES = ['dev', 'staging', 'production'] as const;

export interface Config {
  APP_ENV: (typeof AMBIENTES)[number];
  PORT: number;
  CORS_ALLOWED_ORIGINS: string[];
}

/**
 * Lista única de origens (CORS e CSRF do cliente web): http(s) apenas, normalizadas para
 * esquema + host + porta, sem barra final nem repetição. `undefined` se algum item for inválido.
 */
export function lerOrigens(valor: string | undefined): string[] | undefined {
  try {
    const origens = (valor ?? '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean)
      .map((o) => {
        const u = new URL(o);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error('esquema');
        return u.origin;
      });
    return [...new Set(origens)];
  } catch {
    return undefined;
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
  const origens = lerOrigens(env.CORS_ALLOWED_ORIGINS);
  if (!origens) invalidas.push('CORS_ALLOWED_ORIGINS');

  if (invalidas.length > 0 || !appEnv || !origens) {
    throw new Error(`Configuração inválida ou ausente: ${invalidas.join(', ')}`);
  }
  return { APP_ENV: appEnv, PORT: port, CORS_ALLOWED_ORIGINS: origens };
}
