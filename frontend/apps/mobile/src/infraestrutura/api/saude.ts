import { validarComum, type ComponentesComum } from '@condomifacil/shared-types';

export type SaudeComum = ComponentesComum['schemas']['SaudeComum'];

/** Sem resposta utilizável da rede: URL ausente, falha de conexão ou tempo esgotado. */
export class ErroDeRede extends Error {}
/** A API respondeu, mas não com `200` (por exemplo `503`). */
export class ApiIndisponivel extends Error {}
/** `200` com corpo que o contrato `SaudeComum` não aceita. */
export class RespostaForaDoContrato extends Error {}

const TEMPO_LIMITE_MS = 10_000;

/** GET /v1/saude (comumConsultarSaude); a resposta é validada em execução pelo contrato gerado. */
export async function consultarSaude(): Promise<SaudeComum> {
  // Leitura estática: o Metro só embute `process.env.EXPO_PUBLIC_*` escrito assim.
  const base = process.env.EXPO_PUBLIC_API_URL;
  if (!base) throw new ErroDeRede('EXPO_PUBLIC_API_URL não definida');

  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);
  let resposta: Response;
  try {
    resposta = await fetch(`${base}/v1/saude`, { signal: controle.signal });
  } catch (e) {
    throw new ErroDeRede(e instanceof Error ? e.message : 'falha de rede');
  } finally {
    clearTimeout(timer);
  }
  if (!resposta.ok) throw new ApiIndisponivel(`HTTP ${resposta.status}`);

  const corpo: unknown = await resposta.json().catch(() => undefined);
  const r = validarComum('SaudeComum', corpo);
  if (!r.valido) throw new RespostaForaDoContrato('corpo fora do contrato SaudeComum');
  return corpo as SaudeComum;
}
