// Gerado por scripts/gerar.mjs a partir dos contratos. Não editar.
export type paths = Record<string, never>;
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** @description Carga mínima do aviso de visita. Nenhum dado pessoal (nome, documento, unidade) viaja aqui. */
        AvisoDeVisita: {
            /** @enum {string} */
            evento: "visitante.cadastrado" | "visitante.editado" | "visitante.cancelado";
            /**
             * Format: uuid
             * @description Identificador da visita. O cliente relê os dados pela API.
             */
            visita_id: string;
            /**
             * Format: date-time
             * @description Instante da mudança, ISO 8601 com deslocamento.
             */
            ocorrido_em: string;
        };
        /** @description Carga mínima do aviso de entrega esperada. Sem descrição, origem nem unidade. */
        AvisoDeEntregaEsperada: {
            /** @constant */
            evento: "entrega_esperada.editada";
            /** Format: uuid */
            entrega_esperada_id: string;
            /** Format: date-time */
            ocorrido_em: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
