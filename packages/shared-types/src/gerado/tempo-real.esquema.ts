// Gerado por scripts/gerar.mjs a partir dos contratos. Não editar.
export const esquemaTempoReal = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "urn:condomifacil:contratos:tempo-real",
  "$defs": {
    "AvisoDeVisita": {
      "type": "object",
      "description": "Carga mínima do aviso de visita. Nenhum dado pessoal (nome, documento, unidade) viaja aqui.",
      "required": [
        "evento",
        "visita_id",
        "ocorrido_em"
      ],
      "properties": {
        "evento": {
          "type": "string",
          "enum": [
            "visitante.cadastrado",
            "visitante.editado",
            "visitante.cancelado"
          ]
        },
        "visita_id": {
          "type": "string",
          "format": "uuid",
          "description": "Identificador da visita. O cliente relê os dados pela API."
        },
        "ocorrido_em": {
          "type": "string",
          "format": "date-time",
          "description": "Instante da mudança, ISO 8601 com deslocamento."
        }
      }
    },
    "AvisoDeEntregaEsperada": {
      "type": "object",
      "description": "Carga mínima do aviso de entrega esperada. Sem descrição, origem nem unidade.",
      "required": [
        "evento",
        "entrega_esperada_id",
        "ocorrido_em"
      ],
      "properties": {
        "evento": {
          "type": "string",
          "const": "entrega_esperada.editada"
        },
        "entrega_esperada_id": {
          "type": "string",
          "format": "uuid"
        },
        "ocorrido_em": {
          "type": "string",
          "format": "date-time"
        }
      }
    }
  }
};
export const eventosTempoReal = {
  "visitante.cadastrado": "AvisoDeVisita",
  "visitante.editado": "AvisoDeVisita",
  "visitante.cancelado": "AvisoDeVisita",
  "entrega_esperada.editada": "AvisoDeEntregaEsperada"
} as const;
