import { z } from 'zod';

const esquema = z.object({
  APP_ENV: z.enum(['dev', 'staging', 'production']),
  PORT: z.coerce.number().int().min(1).max(65535),
  // Lista separada por vírgula; vazio = nenhuma origem cross-origin permitida (nunca `*`).
  CORS_ALLOWED_ORIGINS: z
    .string()
    .default('')
    .transform((v) =>
      v
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.url())),
});

export type Config = z.infer<typeof esquema>;

/** Valida o ambiente; a mensagem lista só os nomes das variáveis, nunca os valores. */
export function lerConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const r = esquema.safeParse(env);
  if (r.success) return r.data;
  const nomes = [...new Set(r.error.issues.map((i) => String(i.path[0] ?? '?')))];
  throw new Error(`Configuração inválida ou ausente: ${nomes.join(', ')}`);
}
