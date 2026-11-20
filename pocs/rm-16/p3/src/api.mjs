// Regra mínima de 404 (arquitetura 4.11; plano de testes CT-IS-01): recurso de outro condomínio
// e recurso inexistente produzem a MESMA resposta, porque a RLS devolve zero linhas nos dois casos.
// O cabeçalho X-Condominio-Id faz as vezes do contexto já autenticado e validado (P2 fora daqui).
import { createServer } from 'node:http';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NAO_ENCONTRADO = JSON.stringify({ codigo: 'recurso_nao_encontrado', mensagem: 'Recurso não encontrado.' });

export function criarApi(db) {
  return createServer(async (req, res) => {
    const m = /^\/v1\/visitas\/([^/]+)$/.exec(req.url ?? '');
    const condominioId = req.headers['x-condominio-id'];
    const responder = (status, corpo) => {
      res.writeHead(status, { 'content-type': 'application/json' }).end(corpo);
    };
    if (req.method !== 'GET' || !m) return responder(404, NAO_ENCONTRADO);
    // Sem contexto válido a requisição nem chega ao banco (na API real: 401/403 de autenticação).
    if (typeof condominioId !== 'string' || !UUID.test(condominioId)) return responder(401, '{"codigo":"nao_autenticado"}');
    // ID malformado é tratado como inexistente, sem 400 que diferencie formatos.
    if (!UUID.test(m[1])) return responder(404, NAO_ENCONTRADO);
    try {
      const linhas = await db.comTenant({ condominioId, papel: 'porteiro' }, (q) =>
        q('select id, unidade_id, nome_visitante, dia, estado from app.visita where id = $1', [m[1]]),
      );
      // Zero linhas = 404, nunca 403: não confirma a existência do recurso em outro condomínio.
      return linhas.length ? responder(200, JSON.stringify(linhas[0])) : responder(404, NAO_ENCONTRADO);
    } catch {
      return responder(500, '{"codigo":"erro_interno"}');
    }
  });
}
