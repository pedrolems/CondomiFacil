import { validarComum, type ComponentesComum } from '@condomifacil/shared-types';
import { ErroDeRede, RespostaForaDoContrato } from './erros';

export { ErroDeRede, RespostaForaDoContrato };

export type SaudeComum = ComponentesComum['schemas']['SaudeComum'];

/** A API respondeu, mas não com `200` (por exemplo `503`). */
export class ApiIndisponivel extends Error {}

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
