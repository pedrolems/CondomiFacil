// Gerado por scripts/gerar.mjs a partir dos contratos. Não editar.
export const esquemaComum = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "urn:condomifacil:contratos:comum",
  "$defs": {
    "SaudeComum": {
      "type": "object",
      "description": "Estado mínimo da API (Proposta, BL-DV-03). Sem dados de tenant nem detalhes internos.",
      "required": [
        "estado",
        "versao"
      ],
      "properties": {
        "estado": {
          "type": "string",
          "enum": [
            "disponivel"
          ],
          "description": "Sempre `disponivel` no `200`; indisponibilidade responde `503`."
        },
        "versao": {
          "type": "string",
          "description": "Versão da API em execução (Proposta). Não inclui versão de dependências.",
          "examples": [
            "0.1.0"
          ]
        }
      }
    },
    "DispositivoInfoComum": {
      "type": "object",
      "description": "Aparelho que abre a sessão; a sessão fica ligada a ele (ADR-007).",
      "required": [
        "identificador_instalacao",
        "plataforma"
      ],
      "properties": {
        "identificador_instalacao": {
          "type": "string",
          "description": "Identificador da instalação do app no aparelho (Proposta).",
          "examples": [
            "inst-8f3a2c1d-aparelho-exemplo"
          ]
        },
        "plataforma": {
          "type": "string",
          "enum": [
            "android",
            "ios",
            "web"
          ],
          "description": "Plataforma do cliente (Proposta; a web aparece em RF-AC-06)."
        }
      }
    },
    "PedirCodigoComum": {
      "type": "object",
      "required": [
        "email",
        "finalidade"
      ],
      "properties": {
        "email": {
          "type": "string",
          "format": "email",
          "examples": [
            "ana.exemplo@example.com"
          ]
        },
        "finalidade": {
          "type": "string",
          "enum": [
            "primeiro_acesso",
            "recuperacao_senha"
          ],
          "description": "Finalidade do desafio de acesso (MER `desafio_acesso.finalidade`; valores Proposta)."
        }
      }
    },
    "RespostaCodigoComum": {
      "type": "object",
      "required": [
        "mensagem",
        "pode_pedir_novo_codigo_em"
      ],
      "properties": {
        "mensagem": {
          "type": "string",
          "description": "Mensagem única, igual para e-mail cadastrado ou não (RN-CD-02)."
        },
        "pode_pedir_novo_codigo_em": {
          "$ref": "#/$defs/DataHora",
          "description": "Instante em que um novo código pode ser pedido (60 s depois). Calculado igual para qualquer e-mail."
        }
      }
    },
    "AtivarComum": {
      "type": "object",
      "required": [
        "email",
        "codigo",
        "nova_senha",
        "dispositivo"
      ],
      "properties": {
        "email": {
          "type": "string",
          "format": "email"
        },
        "codigo": {
          "type": "string",
          "pattern": "^[0-9]{6}$",
          "description": "Código de 6 dígitos (RN-CD-02).",
          "examples": [
            "483920"
          ]
        },
        "nova_senha": {
          "type": "string",
          "minLength": 8,
          "writeOnly": true,
          "description": "Senha com no mínimo 8 caracteres (RF-AC-01). Nunca é devolvida."
        },
        "dispositivo": {
          "$ref": "#/$defs/DispositivoInfoComum"
        }
      }
    },
    "RedefinirSenhaComum": {
      "type": "object",
      "required": [
        "email",
        "codigo",
        "nova_senha",
        "dispositivo"
      ],
      "properties": {
        "email": {
          "type": "string",
          "format": "email"
        },
        "codigo": {
          "type": "string",
          "pattern": "^[0-9]{6}$",
          "examples": [
            "102938"
          ]
        },
        "nova_senha": {
          "type": "string",
          "minLength": 8,
          "writeOnly": true
        },
        "dispositivo": {
          "$ref": "#/$defs/DispositivoInfoComum"
        }
      }
    },
    "EntrarComum": {
      "type": "object",
      "required": [
        "email",
        "senha",
        "dispositivo"
      ],
      "properties": {
        "email": {
          "type": "string",
          "format": "email"
        },
        "senha": {
          "type": "string",
          "writeOnly": true
        },
        "dispositivo": {
          "$ref": "#/$defs/DispositivoInfoComum"
        }
      }
    },
    "TrocarSenhaComum": {
      "type": "object",
      "required": [
        "senha_atual",
        "nova_senha"
      ],
      "properties": {
        "senha_atual": {
          "type": "string",
          "writeOnly": true,
          "description": "Senha em uso. Nunca é devolvida."
        },
        "nova_senha": {
          "type": "string",
          "minLength": 8,
          "writeOnly": true,
          "description": "Senha com no mínimo 8 caracteres (RF-AC-09). Nunca é devolvida."
        }
      }
    },
    "RenovarComum": {
      "type": "object",
      "properties": {
        "refresh_token": {
          "type": "string",
          "description": "Refresh token opaco. Obrigatório no app (sem `X-CondomiFacil-Web`); na web vem do cookie `rt` e o campo é omitido."
        }
      }
    },
    "SairComum": {
      "type": "object",
      "properties": {
        "dispositivo_id": {
          "$ref": "#/$defs/Uuid",
          "description": "Aparelho cujo token de push deve ser removido junto com a sessão (opcional)."
        }
      }
    },
    "SessaoAbertaComum": {
      "type": "object",
      "required": [
        "token_acesso",
        "token_acesso_expira_em",
        "aceites_pendentes"
      ],
      "properties": {
        "token_acesso": {
          "type": "string",
          "description": "JWT de 15 minutos, só com `sub` e `sid`, sem papéis nem condomínios (ADR-007)."
        },
        "token_acesso_expira_em": {
          "$ref": "#/$defs/DataHora"
        },
        "refresh_token": {
          "type": [
            "string",
            "null"
          ],
          "description": "Opaco e rotativo. Nulo na web (`X-CondomiFacil-Web: 1`): nesse caso vai só no cookie `rt`."
        },
        "aceites_pendentes": {
          "type": "boolean",
          "description": "Verdadeiro se há documento a aceitar antes de usar o app (RN-CD-03); ver `GET /v1/acesso/aceites`."
        }
      }
    },
    "DocumentoPendenteComum": {
      "type": "object",
      "required": [
        "documento_versao_id",
        "documento_id",
        "tipo",
        "titulo",
        "numero",
        "vigente_desde"
      ],
      "properties": {
        "documento_versao_id": {
          "$ref": "#/$defs/Uuid"
        },
        "documento_id": {
          "$ref": "#/$defs/Uuid"
        },
        "tipo": {
          "type": "string",
          "description": "Tipo do documento: termos de uso, política de privacidade, regimento do condomínio e \"Como funciona\" (RN-CD-03). Os códigos exatos são Proposta.",
          "examples": [
            "termos_de_uso",
            "politica_de_privacidade",
            "regimento",
            "como_funciona"
          ]
        },
        "titulo": {
          "type": "string"
        },
        "numero": {
          "type": "integer",
          "description": "Número da versão (MER `documento_versao.numero`)."
        },
        "condominio_id": {
          "type": [
            "string",
            "null"
          ],
          "format": "uuid",
          "description": "Nulo nos documentos globais; preenchido no regimento do condomínio."
        },
        "publicado_em": {
          "$ref": "#/$defs/DataHora"
        },
        "vigente_desde": {
          "$ref": "#/$defs/DataHora"
        },
        "conteudo_texto": {
          "type": [
            "string",
            "null"
          ],
          "description": "Texto da versão; exatamente um entre `conteudo_texto` e `arquivo_id` (MER)."
        },
        "arquivo_id": {
          "type": [
            "string",
            "null"
          ],
          "format": "uuid",
          "description": "Arquivo da versão, lido por `POST /v1/arquivos/{arquivo_id}/leituras`."
        }
      }
    },
    "RegistrarAceitesComum": {
      "type": "object",
      "required": [
        "documento_versao_ids"
      ],
      "properties": {
        "documento_versao_ids": {
          "type": "array",
          "minItems": 1,
          "items": {
            "$ref": "#/$defs/Uuid"
          },
          "description": "Versões vigentes que o usuário aceita agora."
        }
      }
    },
    "AceitesRegistradosComum": {
      "type": "object",
      "required": [
        "aceitos",
        "pendentes_restantes"
      ],
      "properties": {
        "aceitos": {
          "type": "array",
          "items": {
            "type": "object",
            "required": [
              "documento_versao_id",
              "aceito_em"
            ],
            "properties": {
              "documento_versao_id": {
                "$ref": "#/$defs/Uuid"
              },
              "aceito_em": {
                "$ref": "#/$defs/DataHora"
              }
            }
          }
        },
        "pendentes_restantes": {
          "type": "integer",
          "minimum": 0
        }
      }
    },
    "TemaComum": {
      "type": "string",
      "enum": [
        "aparelho",
        "claro",
        "escuro"
      ],
      "description": "\"Igual ao aparelho\" (`aparelho`, padrão), \"Claro\" (`claro`) e \"Escuro\" (`escuro`) (RF-AC-05). Códigos Proposta."
    },
    "PerfilComum": {
      "type": "object",
      "required": [
        "id",
        "nome",
        "email",
        "tema_preferido"
      ],
      "properties": {
        "id": {
          "$ref": "#/$defs/Uuid"
        },
        "nome": {
          "type": "string"
        },
        "email": {
          "type": "string",
          "format": "email"
        },
        "tema_preferido": {
          "$ref": "#/$defs/TemaComum"
        }
      }
    },
    "AtualizarPerfilComum": {
      "type": "object",
      "required": [
        "tema_preferido"
      ],
      "properties": {
        "tema_preferido": {
          "$ref": "#/$defs/TemaComum"
        }
      }
    },
    "PapelEfetivoComum": {
      "type": "object",
      "required": [
        "papel",
        "interface"
      ],
      "properties": {
        "papel": {
          "type": "string",
          "enum": [
            "morador",
            "proprietario_nao_residente",
            "sindico",
            "subsindico",
            "conselho_fiscal",
            "portaria",
            "limpeza",
            "administradora",
            "suporte",
            "admin_plataforma"
          ],
          "description": "Papel efetivo hoje naquele condomínio (Proposta de nomenclatura; perfis do PRD 3). Síndico morador e profissional se distinguem em `funcao_mandato`."
        },
        "interface": {
          "type": "string",
          "enum": [
            "morador",
            "proprietario-nao-residente",
            "sindico",
            "conselho-fiscal",
            "portaria",
            "limpeza",
            "administradora",
            "plataforma"
          ],
          "description": "Prefixo de caminho que o cliente usa para este papel (`/v1/<interface>/...`; guia, seção 4)."
        },
        "funcao_mandato": {
          "type": [
            "string",
            "null"
          ],
          "description": "Função do mandato vigente, quando houver (MER `mandato.funcao`)."
        },
        "em_substituicao": {
          "type": [
            "boolean",
            "null"
          ],
          "description": "Para o subsíndico: verdadeiro durante a substituição do síndico (RN-CD-12, RN-CD-28)."
        }
      }
    },
    "UnidadeContextoComum": {
      "type": "object",
      "required": [
        "unidade_id",
        "identificacao",
        "tipo_vinculo"
      ],
      "properties": {
        "unidade_id": {
          "$ref": "#/$defs/Uuid"
        },
        "identificacao": {
          "type": "string"
        },
        "bloco_nome": {
          "type": [
            "string",
            "null"
          ]
        },
        "tipo_vinculo": {
          "type": "string",
          "enum": [
            "proprietario_representante",
            "inquilino",
            "dependente"
          ],
          "description": "MER `vinculo_unidade.tipo` (códigos Proposta)."
        },
        "morador_habilitado": {
          "type": "boolean",
          "description": "Verdadeiro se é o morador habilitado da unidade (RN-CD-04)."
        }
      }
    },
    "ContextoComum": {
      "type": "object",
      "description": "Um condomínio onde o usuário tem vínculo vigente, com papéis e unidades.",
      "required": [
        "condominio_id",
        "condominio_nome",
        "vinculo_condominio_id",
        "papeis",
        "unidades"
      ],
      "properties": {
        "condominio_id": {
          "$ref": "#/$defs/Uuid"
        },
        "condominio_nome": {
          "type": "string"
        },
        "vinculo_condominio_id": {
          "$ref": "#/$defs/Uuid"
        },
        "papeis": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/PapelEfetivoComum"
          }
        },
        "unidades": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/UnidadeContextoComum"
          },
          "description": "Vazia para quem não tem unidade (funcionário, síndico profissional, administradora)."
        }
      }
    },
    "SessaoComum": {
      "type": "object",
      "required": [
        "id",
        "expira_em",
        "atual"
      ],
      "properties": {
        "id": {
          "$ref": "#/$defs/Uuid"
        },
        "dispositivo_identificador": {
          "type": [
            "string",
            "null"
          ]
        },
        "expira_em": {
          "$ref": "#/$defs/DataHora"
        },
        "atual": {
          "type": "boolean",
          "description": "Verdadeiro para a sessão que fez esta chamada."
        }
      }
    },
    "RegistrarDispositivoComum": {
      "type": "object",
      "required": [
        "identificador_instalacao",
        "plataforma",
        "token_push"
      ],
      "properties": {
        "identificador_instalacao": {
          "type": "string"
        },
        "plataforma": {
          "type": "string",
          "enum": [
            "android",
            "ios"
          ],
          "description": "Push só no app (Expo Push e FCM); a web não registra token (Proposta)."
        },
        "token_push": {
          "type": "string",
          "writeOnly": true,
          "description": "Token do Expo Push. Guardado protegido; nunca devolvido."
        }
      }
    },
    "DispositivoComum": {
      "type": "object",
      "required": [
        "id",
        "identificador_instalacao",
        "plataforma",
        "ultima_atividade"
      ],
      "properties": {
        "id": {
          "$ref": "#/$defs/Uuid"
        },
        "identificador_instalacao": {
          "type": "string"
        },
        "plataforma": {
          "type": "string",
          "enum": [
            "android",
            "ios"
          ]
        },
        "ultima_atividade": {
          "$ref": "#/$defs/DataHora"
        }
      }
    },
    "TipoNotificacaoComum": {
      "type": "string",
      "enum": [
        "visitante",
        "encomenda",
        "reserva",
        "lembrete_reserva",
        "chamado",
        "comunicado",
        "votacao",
        "reclamacao",
        "decisao_reclamacao",
        "divergencia_sincronizacao"
      ],
      "description": "Os sete tipos de RF-NO-01 (visitante, encomenda, reserva, chamado, comunicado, votação, reclamação), o lembrete de reserva (RN-RE-14, opcional) e os dois obrigatórios (`decisao_reclamacao` e `divergencia_sincronizacao`, US-NO-01). Códigos Proposta."
    },
    "PreferenciaNotificacaoComum": {
      "type": "object",
      "required": [
        "tipo",
        "habilitada",
        "obrigatoria"
      ],
      "properties": {
        "tipo": {
          "$ref": "#/$defs/TipoNotificacaoComum"
        },
        "habilitada": {
          "type": "boolean"
        },
        "obrigatoria": {
          "type": "boolean",
          "description": "Verdadeiro nos tipos que não podem ser desligados (US-NO-01). A lista é fixa em código no servidor."
        },
        "motivo_obrigatoria": {
          "type": [
            "string",
            "null"
          ],
          "description": "Texto do motivo exibido no interruptor travado (UF 14.1; texto Proposta)."
        }
      }
    },
    "PreferenciasNotificacaoComum": {
      "type": "object",
      "required": [
        "preferencias"
      ],
      "properties": {
        "preferencias": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/PreferenciaNotificacaoComum"
          },
          "description": "Lista completa e fixa de tipos; não é paginada."
        }
      }
    },
    "AtualizarPreferenciasNotificacaoComum": {
      "type": "object",
      "required": [
        "condominio_id",
        "preferencias"
      ],
      "properties": {
        "condominio_id": {
          "$ref": "#/$defs/Uuid"
        },
        "preferencias": {
          "type": "array",
          "minItems": 1,
          "items": {
            "type": "object",
            "required": [
              "tipo",
              "habilitada"
            ],
            "properties": {
              "tipo": {
                "$ref": "#/$defs/TipoNotificacaoComum"
              },
              "habilitada": {
                "type": "boolean"
              }
            }
          }
        }
      }
    },
    "NotificacaoComum": {
      "type": "object",
      "required": [
        "id",
        "condominio_id",
        "tipo",
        "texto_seguro",
        "criada_em"
      ],
      "properties": {
        "id": {
          "$ref": "#/$defs/Uuid"
        },
        "condominio_id": {
          "$ref": "#/$defs/Uuid"
        },
        "tipo": {
          "$ref": "#/$defs/TipoNotificacaoComum"
        },
        "texto_seguro": {
          "type": "string",
          "description": "Texto sem dados sensíveis (arquitetura 3.7). Nunca traz situação financeira nem quem reclamou."
        },
        "criada_em": {
          "$ref": "#/$defs/DataHora"
        },
        "lida_em": {
          "type": [
            "string",
            "null"
          ],
          "format": "date-time"
        },
        "referencia": {
          "type": [
            "object",
            "null"
          ],
          "description": "Referência de navegação; não concede autorização (MER `referencia_restrita`).",
          "properties": {
            "entidade": {
              "type": "string"
            },
            "id": {
              "$ref": "#/$defs/Uuid"
            }
          }
        }
      }
    },
    "CriarPedidoLgpdComum": {
      "type": "object",
      "required": [
        "tipo"
      ],
      "properties": {
        "tipo": {
          "type": "string",
          "enum": [
            "copia_dados",
            "exclusao_conta"
          ],
          "description": "Valores Proposta (MER `pedido_lgpd.tipo`)."
        },
        "senha": {
          "type": "string",
          "writeOnly": true,
          "description": "Obrigatória em `exclusao_conta`: confirmação com a senha (UF 14.1)."
        }
      }
    },
    "PedidoLgpdComum": {
      "type": "object",
      "required": [
        "id",
        "tipo",
        "estado",
        "solicitado_em"
      ],
      "properties": {
        "id": {
          "$ref": "#/$defs/Uuid"
        },
        "tipo": {
          "type": "string",
          "enum": [
            "copia_dados",
            "exclusao_conta"
          ]
        },
        "estado": {
          "type": "string",
          "description": "Estado do pedido (MER `pedido_lgpd.estado`). Os valores não estão definidos nos docs: lacuna.",
          "examples": [
            "solicitado"
          ]
        },
        "solicitado_em": {
          "$ref": "#/$defs/DataHora"
        },
        "concluido_em": {
          "type": [
            "string",
            "null"
          ],
          "format": "date-time"
        },
        "prazo_envio_ate": {
          "type": [
            "string",
            "null"
          ],
          "format": "date-time",
          "description": "Na cópia: limite de 15 dias para o envio por e-mail (RF-LG-01)."
        },
        "administradora_avisada": {
          "type": [
            "boolean",
            "null"
          ],
          "description": "Na exclusão: verdadeiro se a pessoa era morador habilitado, proprietário ou responsável financeiro e a administradora foi avisada (RN-CD-18)."
        }
      }
    },
    "ModuloArquivoComum": {
      "type": "string",
      "enum": [
        "etiqueta_encomenda",
        "foto_chamado",
        "foto_conclusao_chamado",
        "checklist_vistoria",
        "comprovante_lancamento",
        "ata_reuniao",
        "lista_presenca",
        "comprovante_pagamento",
        "foto_area",
        "documento_visitante"
      ],
      "description": "Usos de arquivo da arquitetura 3.8 (etiqueta de encomenda, foto de chamado, fotos de conclusão, checklist de vistoria RF-RE-08, comprovante de lançamento RN-FI-24, ata e lista de presença RF-VO-09, comprovante de pagamento externo RF-FI-10, fotos de áreas) mais o documento do visitante. Códigos Proposta."
    },
    "PedirEnvioArquivoComum": {
      "type": "object",
      "required": [
        "modulo",
        "tipo_midia",
        "tamanho_bytes"
      ],
      "properties": {
        "modulo": {
          "$ref": "#/$defs/ModuloArquivoComum"
        },
        "tipo_midia": {
          "type": "string",
          "description": "Tipo de mídia declarado; a API valida pelo conteúdo na confirmação. A lista de tipos aceitos é lacuna.",
          "examples": [
            "application/pdf",
            "image/jpeg"
          ]
        },
        "tamanho_bytes": {
          "type": "integer",
          "minimum": 1
        },
        "hash_conteudo": {
          "type": [
            "string",
            "null"
          ],
          "description": "Hash do conteúdo, conferido na confirmação. Formato do hash: lacuna."
        },
        "alvo": {
          "type": [
            "object",
            "null"
          ],
          "description": "Objeto ao qual o arquivo será anexado, para a API autorizar a ação (MER `anexo_dominio`). Os demais usos ligam o arquivo pela operação de domínio.",
          "required": [
            "tipo",
            "id"
          ],
          "properties": {
            "tipo": {
              "type": "string",
              "enum": [
                "reserva",
                "vistoria",
                "reclamacao",
                "chamado"
              ]
            },
            "id": {
              "$ref": "#/$defs/Uuid"
            }
          }
        }
      }
    },
    "EnvioArquivoComum": {
      "type": "object",
      "required": [
        "arquivo_id",
        "metodo",
        "url_envio",
        "expira_em"
      ],
      "properties": {
        "arquivo_id": {
          "$ref": "#/$defs/Uuid"
        },
        "metodo": {
          "type": "string",
          "enum": [
            "PUT"
          ]
        },
        "url_envio": {
          "type": "string",
          "format": "uri",
          "description": "URL assinado de envio. Expira em minutos (número: lacuna)."
        },
        "cabecalhos": {
          "type": "object",
          "additionalProperties": {
            "type": "string"
          },
          "description": "Cabeçalhos que o cliente deve repetir no PUT."
        },
        "expira_em": {
          "$ref": "#/$defs/DataHora"
        }
      }
    },
    "ArquivoComum": {
      "type": "object",
      "required": [
        "id",
        "modulo",
        "tipo_midia",
        "tamanho_bytes",
        "criado_em"
      ],
      "properties": {
        "id": {
          "$ref": "#/$defs/Uuid"
        },
        "modulo": {
          "$ref": "#/$defs/ModuloArquivoComum"
        },
        "tipo_midia": {
          "type": "string"
        },
        "tamanho_bytes": {
          "type": "integer"
        },
        "hash_conteudo": {
          "type": [
            "string",
            "null"
          ]
        },
        "criado_em": {
          "$ref": "#/$defs/DataHora"
        }
      }
    },
    "LeituraArquivoComum": {
      "type": "object",
      "required": [
        "arquivo_id",
        "url_leitura",
        "expira_em"
      ],
      "properties": {
        "arquivo_id": {
          "$ref": "#/$defs/Uuid"
        },
        "url_leitura": {
          "type": "string",
          "format": "uri",
          "description": "URL assinado de curta duração; nunca permanente."
        },
        "expira_em": {
          "$ref": "#/$defs/DataHora"
        }
      }
    },
    "ScoreComum": {
      "type": "object",
      "required": [
        "escopo",
        "titular_tipo",
        "condominio_id",
        "saldo"
      ],
      "properties": {
        "escopo": {
          "type": "string",
          "enum": [
            "proprio",
            "sindico",
            "funcionario",
            "reclamacao"
          ]
        },
        "titular_tipo": {
          "type": "string",
          "enum": [
            "moradia",
            "funcional"
          ],
          "description": "Score de moradia (por pessoa e vínculo de unidade) ou funcional (por pessoa e condomínio) (RN-SC-13, RN-SC-14)."
        },
        "condominio_id": {
          "$ref": "#/$defs/Uuid"
        },
        "unidade": {
          "type": [
            "object",
            "null"
          ],
          "description": "Unidade do score de moradia, identificada, só em `escopo=proprio` (RF-RS-11). Nula no score funcional e nos escopos `sindico`, `funcionario` e `reclamacao` (Proposta; ver lacunas).",
          "required": [
            "unidade_id",
            "identificacao"
          ],
          "properties": {
            "unidade_id": {
              "$ref": "#/$defs/Uuid"
            },
            "identificacao": {
              "type": "string"
            },
            "bloco_nome": {
              "type": [
                "string",
                "null"
              ]
            }
          }
        },
        "saldo": {
          "type": "integer",
          "minimum": 0,
          "maximum": 100,
          "description": "De 0 a 100 (RN-SC-01). Só o número: sem cor de verde ou vermelho; o score é referência, não julgamento público."
        },
        "proxima_recuperacao_em": {
          "type": [
            "string",
            "null"
          ],
          "format": "date",
          "description": "Data da próxima recuperação de +5 pontos (RN-SC-08). Só no escopo `proprio`."
        },
        "reservas_gratuitas_liberadas": {
          "type": [
            "boolean",
            "null"
          ],
          "description": "Só no score de moradia do próprio: falso com saldo igual ou menor que o limite configurável (padrão 60), só naquela unidade (RN-SC-09)."
        },
        "situacao_texto": {
          "type": [
            "string",
            "null"
          ],
          "description": "Explicação em texto da situação, sem depender de cor (WCAG 1.4.1)."
        },
        "funcionario_id": {
          "type": [
            "string",
            "null"
          ],
          "format": "uuid",
          "description": "Eco do pedido em `escopo=funcionario`."
        },
        "reclamacao_id": {
          "type": [
            "string",
            "null"
          ],
          "format": "uuid",
          "description": "Eco do pedido em `escopo=reclamacao`."
        },
        "parte": {
          "type": [
            "string",
            "null"
          ],
          "enum": [
            "reclamante",
            "alvo",
            null
          ],
          "description": "Eco do pedido em `escopo=reclamacao`. Não traz a identidade do reclamante."
        }
      }
    },
    "ListaScoresFuncionariosComum": {
      "type": "object",
      "description": "Página de scores funcionais, em `GET /v1/score` com `escopo=funcionarios` (Proposta). Cada item é um `ScoreComum` com `escopo=funcionario` e `funcionario_id`. Sem nome, sem autor de reclamação nem de avaliação.",
      "required": [
        "dados",
        "paginacao"
      ],
      "properties": {
        "dados": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/ScoreComum"
          }
        },
        "paginacao": {
          "$ref": "#/$defs/Paginacao"
        }
      }
    },
    "MovimentoScoreComum": {
      "type": "object",
      "required": [
        "id",
        "registrado_em",
        "origem_tipo",
        "pontos_efetivos",
        "saldo_depois",
        "motivo"
      ],
      "properties": {
        "id": {
          "$ref": "#/$defs/Uuid"
        },
        "registrado_em": {
          "$ref": "#/$defs/DataHora"
        },
        "origem_tipo": {
          "type": "string",
          "description": "Origem do movimento (MER `movimento_score.origem_tipo`: decisão, recurso, pesquisa, apuração de faltas, recuperação). Os códigos não estão definidos nos docs: lacuna.",
          "examples": [
            "reclamacao_validada",
            "recuperacao"
          ]
        },
        "pontos_efetivos": {
          "type": "integer",
          "description": "Pontos que valeram depois do limite de 0 a 100."
        },
        "saldo_depois": {
          "type": "integer",
          "minimum": 0,
          "maximum": 100
        },
        "motivo": {
          "type": "string",
          "description": "Motivo exibido ao dono. Nunca revela quem reclamou (RN-SC-12)."
        }
      }
    },
    "CriarDenunciaComum": {
      "type": "object",
      "required": [
        "origem",
        "motivo"
      ],
      "properties": {
        "origem": {
          "type": "object",
          "required": [
            "tipo",
            "id"
          ],
          "properties": {
            "tipo": {
              "type": "string",
              "enum": [
                "mensagem_comunicado",
                "reclamacao",
                "avaliacao_atendimento",
                "resposta_pesquisa"
              ],
              "description": "Tipo do conteúdo denunciado (MER `denuncia_conteudo`: exatamente uma origem acessível ao denunciante). Códigos Proposta; a lista acompanha novos tipos."
            },
            "id": {
              "$ref": "#/$defs/Uuid"
            }
          }
        },
        "motivo": {
          "type": "string",
          "minLength": 1,
          "description": "Motivo da denúncia (MER `motivo`)."
        }
      }
    },
    "DenunciaComum": {
      "type": "object",
      "description": "Não traz destinatário, estado nem autor do conteúdo (estado e ações do destinatário: lacuna).",
      "required": [
        "id",
        "origem",
        "motivo",
        "criada_em"
      ],
      "properties": {
        "id": {
          "$ref": "#/$defs/Uuid"
        },
        "origem": {
          "type": "object",
          "required": [
            "tipo",
            "id"
          ],
          "properties": {
            "tipo": {
              "type": "string"
            },
            "id": {
              "$ref": "#/$defs/Uuid"
            }
          }
        },
        "motivo": {
          "type": "string"
        },
        "criada_em": {
          "$ref": "#/$defs/DataHora"
        }
      }
    },
    "NotasSetoresComum": {
      "type": "object",
      "required": [
        "competencia",
        "setores"
      ],
      "properties": {
        "competencia": {
          "type": "string",
          "description": "Mês no formato aaaa-mm."
        },
        "setores": {
          "type": "array",
          "items": {
            "type": "object",
            "required": [
              "setor",
              "publicada"
            ],
            "properties": {
              "setor": {
                "type": "string"
              },
              "publicada": {
                "type": "boolean",
                "description": "Falso com menos de 2 funcionários avaliados (RN-PE-08)."
              },
              "nota": {
                "type": [
                  "number",
                  "null"
                ],
                "description": "Média das médias dos funcionários avaliados (RN-PE-07). Nula se não publicada. Casas decimais e arredondamento: lacuna."
              },
              "rotulo": {
                "type": [
                  "string",
                  "null"
                ],
                "description": "Texto exibido quando a nota não é publicada (UF 9.4)."
              }
            }
          }
        }
      }
    },
    "CriarRecursoComum": {
      "type": "object",
      "required": [
        "reclamacao_id",
        "justificativa"
      ],
      "properties": {
        "reclamacao_id": {
          "$ref": "#/$defs/Uuid",
          "description": "Reclamação decidida; o recurso liga-se à decisão dela (MER `recurso_reclamacao.decisao_id`, UQ por decisão)."
        },
        "justificativa": {
          "type": "string",
          "minLength": 1
        }
      }
    },
    "RecursoComum": {
      "type": "object",
      "description": "Nunca traz a identidade do reclamante nem o corpo da reclamação (ADR-010).",
      "required": [
        "id",
        "reclamacao_id",
        "solicitado_em",
        "justificativa",
        "estado_reclamacao"
      ],
      "properties": {
        "id": {
          "$ref": "#/$defs/Uuid"
        },
        "reclamacao_id": {
          "$ref": "#/$defs/Uuid"
        },
        "solicitado_em": {
          "$ref": "#/$defs/DataHora"
        },
        "justificativa": {
          "type": "string"
        },
        "julgador_papel": {
          "type": [
            "string",
            "null"
          ],
          "enum": [
            "sindico",
            "subsindico",
            "administradora",
            "conselho_fiscal",
            null
          ],
          "description": "Papel de quem julga, pela tabela 5.3; nulo se o recurso está pendente por falta de julgador (RN-RC-14)."
        },
        "resultado": {
          "type": [
            "string",
            "null"
          ],
          "enum": [
            "aceito",
            "negado",
            null
          ]
        },
        "decidido_em": {
          "type": [
            "string",
            "null"
          ],
          "format": "date-time"
        },
        "fundamentacao": {
          "type": [
            "string",
            "null"
          ]
        },
        "estado_reclamacao": {
          "$ref": "#/$defs/EstadoReclamacao"
        }
      }
    },
    "DecidirRecursoComum": {
      "type": "object",
      "required": [
        "resultado",
        "fundamentacao"
      ],
      "properties": {
        "resultado": {
          "type": "string",
          "enum": [
            "aceito",
            "negado"
          ]
        },
        "fundamentacao": {
          "type": "string",
          "minLength": 1
        }
      }
    },
    "DataHora": {
      "type": "string",
      "format": "date-time",
      "description": "Data e hora em ISO 8601 com deslocamento de fuso (Proposta).",
      "examples": [
        "2026-11-10T14:30:00-03:00"
      ]
    },
    "Erro": {
      "type": "object",
      "description": "Formato único de erro (Proposta; `01-backend.md` 4.5). O texto de `mensagem` é o que o\ncliente pode mostrar ao usuário; os valores de `codigo` estão no guia, seção 8. O erro nunca\ndevolve corpo de reclamação, avaliação ou voto (ADR-010).\n",
      "required": [
        "codigo",
        "mensagem",
        "request_id"
      ],
      "properties": {
        "codigo": {
          "type": "string",
          "pattern": "^[A-Z][A-Z0-9_]*$",
          "description": "Código estável em `SNAKE_MAIUSCULO`, definido em `shared-types`. O cliente decide por ele, não pela mensagem.",
          "examples": [
            "SESSAO_EXPIRADA"
          ]
        },
        "mensagem": {
          "type": "string",
          "description": "Texto em português do Brasil, pronto para exibição."
        },
        "detalhes": {
          "type": "array",
          "description": "Detalhes por campo ou por regra, quando houver (entrada inválida, faixa de parâmetro).",
          "items": {
            "type": "object",
            "required": [
              "mensagem"
            ],
            "properties": {
              "campo": {
                "type": "string",
                "description": "Nome do campo do corpo ou do parâmetro, em `snake_case`."
              },
              "mensagem": {
                "type": "string"
              },
              "codigo": {
                "type": "string",
                "pattern": "^[A-Z][A-Z0-9_]*$"
              }
            }
          }
        },
        "request_id": {
          "type": "string",
          "description": "Mesmo valor do cabeçalho `X-Request-Id` da resposta. Serve para suporte e para o Sentry.",
          "examples": [
            "req_01JD9ZQ3K8M2T7V5W0X4Y6A1BC"
          ]
        }
      }
    },
    "Uuid": {
      "type": "string",
      "format": "uuid",
      "description": "Identificador UUID. Todo identificador da API é UUID (Proposta).",
      "examples": [
        "3f6c1a52-8b1e-4d3a-9a0e-5c1d2b7e9f10"
      ]
    },
    "Paginacao": {
      "type": "object",
      "description": "Bloco de paginação por cursor opaco devolvido em toda lista (Proposta).",
      "required": [
        "proximo_cursor",
        "tem_mais"
      ],
      "properties": {
        "proximo_cursor": {
          "type": [
            "string",
            "null"
          ],
          "description": "Cursor opaco para pedir a próxima página em `?cursor=`. Nulo quando `tem_mais` é falso.",
          "examples": [
            "eyJpZCI6IjNmNmMxYTUyIn0"
          ]
        },
        "tem_mais": {
          "type": "boolean",
          "description": "Indica se há mais itens depois desta página."
        }
      },
      "examples": [
        {
          "proximo_cursor": "eyJpZCI6IjNmNmMxYTUyIn0",
          "tem_mais": true
        }
      ]
    },
    "Data": {
      "type": "string",
      "format": "date",
      "description": "Data em ISO 8601, sem hora (`aaaa-mm-dd`). Nos textos de interface vale dd/mm/aaaa.",
      "examples": [
        "2026-11-10"
      ]
    },
    "EstadoReclamacao": {
      "type": "string",
      "description": "Estado da reclamação (RN 5.5). Correspondência: `pendente` Pendente; `aberta` Aberta;\n`em_conversa_com_o_alvo` Em conversa com o alvo; `validada` Validada; `negada` Negada;\n`em_recurso` Em recurso; `recurso_aceito` Recurso aceito; `encerrada` Encerrada. O semáforo\nde prazo não é estado (RN-RC-19). Nenhum DTO de estado expõe a identidade do autor.\n",
      "enum": [
        "pendente",
        "aberta",
        "em_conversa_com_o_alvo",
        "validada",
        "negada",
        "em_recurso",
        "recurso_aceito",
        "encerrada"
      ],
      "examples": [
        "aberta"
      ]
    },
    "CandidaturaSindico": {
      "type": "object",
      "required": [
        "id",
        "cargo",
        "candidato_nome",
        "unidade_identificacao",
        "estado",
        "motivo_inelegibilidade"
      ],
      "properties": {
        "id": {
          "$ref": "#/$defs/Uuid"
        },
        "cargo": {
          "type": "string",
          "enum": [
            "sindico",
            "subsindico"
          ]
        },
        "candidato_nome": {
          "type": "string"
        },
        "unidade_identificacao": {
          "type": "string"
        },
        "estado": {
          "type": "string",
          "description": "Ciclo da candidatura não definido nos docs (lacuna); códigos como `aceita` são Proposta, sem fonte literal."
        },
        "motivo_inelegibilidade": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    },
    "EleicaoSindico": {
      "type": "object",
      "required": [
        "id",
        "candidaturas_inicio",
        "candidaturas_fim",
        "estado",
        "candidaturas",
        "resultado"
      ],
      "properties": {
        "resultado_inconclusivo": {
          "type": [
            "object",
            "null"
          ],
          "description": "Somente após encerramento. Decisão de 12/11/2026: segundo empate ou ausência de elegível, sem vencedor automático; encaminhado ao condutor legitimado vigente de RN-VO-13, sem exigir administradora ou suporte pago (atualização de 13/11/2026).",
          "required": [
            "motivo"
          ],
          "properties": {
            "motivo": {
              "type": "string",
              "enum": [
                "segundo_turno_empatado",
                "sem_candidato_elegivel"
              ],
              "description": "Códigos propostos; não enumera todo o ciclo eleitoral."
            }
          }
        },
        "id": {
          "$ref": "#/$defs/Uuid"
        },
        "candidaturas_inicio": {
          "$ref": "#/$defs/DataHora"
        },
        "candidaturas_fim": {
          "$ref": "#/$defs/DataHora"
        },
        "estado": {
          "type": "string",
          "description": "Ciclo da eleição não definido nos docs (lacuna); códigos como `candidaturas_abertas` são Proposta, sem fonte literal."
        },
        "candidaturas": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/CandidaturaSindico"
          }
        },
        "resultado": {
          "type": [
            "array",
            "null"
          ],
          "description": "Só depois do encerramento (RF-VO-07).",
          "items": {
            "type": "object",
            "required": [
              "cargo",
              "candidatura_id",
              "classificacao",
              "quantidade_votos"
            ],
            "properties": {
              "cargo": {
                "type": "string",
                "enum": [
                  "sindico",
                  "subsindico"
                ]
              },
              "candidatura_id": {
                "$ref": "#/$defs/Uuid"
              },
              "classificacao": {
                "type": "integer"
              },
              "quantidade_votos": {
                "type": "integer"
              }
            }
          }
        }
      }
    },
    "AbrirEleicaoSindico": {
      "type": "object",
      "required": [
        "candidaturas_inicio",
        "candidaturas_fim"
      ],
      "properties": {
        "candidaturas_inicio": {
          "$ref": "#/$defs/DataHora"
        },
        "candidaturas_fim": {
          "$ref": "#/$defs/DataHora"
        }
      }
    },
    "req_comumPedirCodigo": {
      "$ref": "#/$defs/PedirCodigoComum"
    },
    "res_comumPedirCodigo_202": {
      "$ref": "#/$defs/RespostaCodigoComum"
    },
    "res_comumPedirCodigo_400": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumPedirCodigo_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumPedirCodigo_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumPedirCodigo_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumPedirCodigo_503": {
      "$ref": "#/$defs/Erro"
    },
    "req_comumAtivar": {
      "$ref": "#/$defs/AtivarComum"
    },
    "res_comumAtivar_200": {
      "$ref": "#/$defs/SessaoAbertaComum"
    },
    "res_comumAtivar_400": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumAtivar_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumAtivar_422": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumAtivar_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumAtivar_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumAtivar_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumAtivar_503": {
      "$ref": "#/$defs/Erro"
    },
    "req_comumEntrar": {
      "$ref": "#/$defs/EntrarComum"
    },
    "res_comumEntrar_200": {
      "$ref": "#/$defs/SessaoAbertaComum"
    },
    "res_comumEntrar_400": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumEntrar_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumEntrar_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumEntrar_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumEntrar_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumEntrar_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumEntrar_503": {
      "$ref": "#/$defs/Erro"
    },
    "req_comumRedefinirSenha": {
      "$ref": "#/$defs/RedefinirSenhaComum"
    },
    "res_comumRedefinirSenha_200": {
      "$ref": "#/$defs/SessaoAbertaComum"
    },
    "res_comumRedefinirSenha_400": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumRedefinirSenha_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumRedefinirSenha_422": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumRedefinirSenha_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumRedefinirSenha_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumRedefinirSenha_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumRedefinirSenha_503": {
      "$ref": "#/$defs/Erro"
    },
    "req_comumRenovar": {
      "$ref": "#/$defs/RenovarComum"
    },
    "res_comumRenovar_200": {
      "$ref": "#/$defs/SessaoAbertaComum"
    },
    "res_comumRenovar_400": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumRenovar_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumRenovar_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumRenovar_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumRenovar_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumRenovar_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumRenovar_503": {
      "$ref": "#/$defs/Erro"
    },
    "req_comumSair": {
      "$ref": "#/$defs/SairComum"
    },
    "res_comumSair_400": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumSair_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumSair_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumSair_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumSair_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumSair_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumSair_503": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarAceitesPendentes_200": {
      "type": "object",
      "required": [
        "dados",
        "paginacao"
      ],
      "properties": {
        "dados": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/DocumentoPendenteComum"
          }
        },
        "paginacao": {
          "$ref": "#/$defs/Paginacao"
        }
      }
    },
    "res_comumListarAceitesPendentes_400": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarAceitesPendentes_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarAceitesPendentes_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarAceitesPendentes_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarAceitesPendentes_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarAceitesPendentes_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarAceitesPendentes_503": {
      "$ref": "#/$defs/Erro"
    },
    "req_comumRegistrarAceites": {
      "$ref": "#/$defs/RegistrarAceitesComum"
    },
    "res_comumRegistrarAceites_201": {
      "$ref": "#/$defs/AceitesRegistradosComum"
    },
    "res_comumRegistrarAceites_400": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumRegistrarAceites_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumRegistrarAceites_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumRegistrarAceites_422": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumRegistrarAceites_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumRegistrarAceites_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumRegistrarAceites_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumRegistrarAceites_503": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumObterPerfil_200": {
      "$ref": "#/$defs/PerfilComum"
    },
    "res_comumObterPerfil_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumObterPerfil_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumObterPerfil_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumObterPerfil_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumObterPerfil_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumObterPerfil_503": {
      "$ref": "#/$defs/Erro"
    },
    "req_comumAtualizarPerfil": {
      "$ref": "#/$defs/AtualizarPerfilComum"
    },
    "res_comumAtualizarPerfil_200": {
      "$ref": "#/$defs/PerfilComum"
    },
    "res_comumAtualizarPerfil_400": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumAtualizarPerfil_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumAtualizarPerfil_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumAtualizarPerfil_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumAtualizarPerfil_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumAtualizarPerfil_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumAtualizarPerfil_503": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarContextos_200": {
      "type": "object",
      "required": [
        "dados",
        "paginacao"
      ],
      "properties": {
        "dados": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/ContextoComum"
          }
        },
        "paginacao": {
          "$ref": "#/$defs/Paginacao"
        }
      }
    },
    "res_comumListarContextos_400": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarContextos_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarContextos_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarContextos_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarContextos_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarContextos_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarContextos_503": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarSessoes_200": {
      "type": "object",
      "required": [
        "dados",
        "paginacao"
      ],
      "properties": {
        "dados": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/SessaoComum"
          }
        },
        "paginacao": {
          "$ref": "#/$defs/Paginacao"
        }
      }
    },
    "res_comumListarSessoes_400": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarSessoes_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarSessoes_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarSessoes_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarSessoes_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarSessoes_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarSessoes_503": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumEncerrarSessao_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumEncerrarSessao_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumEncerrarSessao_404": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumEncerrarSessao_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumEncerrarSessao_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumEncerrarSessao_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumEncerrarSessao_503": {
      "$ref": "#/$defs/Erro"
    },
    "req_comumTrocarSenha": {
      "$ref": "#/$defs/TrocarSenhaComum"
    },
    "res_comumTrocarSenha_400": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumTrocarSenha_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumTrocarSenha_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumTrocarSenha_422": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumTrocarSenha_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumTrocarSenha_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumTrocarSenha_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumTrocarSenha_503": {
      "$ref": "#/$defs/Erro"
    },
    "req_comumRegistrarDispositivo": {
      "$ref": "#/$defs/RegistrarDispositivoComum"
    },
    "res_comumRegistrarDispositivo_200": {
      "$ref": "#/$defs/DispositivoComum"
    },
    "res_comumRegistrarDispositivo_400": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumRegistrarDispositivo_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumRegistrarDispositivo_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumRegistrarDispositivo_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumRegistrarDispositivo_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumRegistrarDispositivo_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumRegistrarDispositivo_503": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumRemoverDispositivo_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumRemoverDispositivo_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumRemoverDispositivo_404": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumRemoverDispositivo_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumRemoverDispositivo_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumRemoverDispositivo_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumRemoverDispositivo_503": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarPreferenciasNotificacao_200": {
      "$ref": "#/$defs/PreferenciasNotificacaoComum"
    },
    "res_comumListarPreferenciasNotificacao_400": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarPreferenciasNotificacao_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarPreferenciasNotificacao_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarPreferenciasNotificacao_404": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarPreferenciasNotificacao_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarPreferenciasNotificacao_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarPreferenciasNotificacao_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarPreferenciasNotificacao_503": {
      "$ref": "#/$defs/Erro"
    },
    "req_comumAtualizarPreferenciasNotificacao": {
      "$ref": "#/$defs/AtualizarPreferenciasNotificacaoComum"
    },
    "res_comumAtualizarPreferenciasNotificacao_200": {
      "$ref": "#/$defs/PreferenciasNotificacaoComum"
    },
    "res_comumAtualizarPreferenciasNotificacao_400": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumAtualizarPreferenciasNotificacao_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumAtualizarPreferenciasNotificacao_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumAtualizarPreferenciasNotificacao_404": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumAtualizarPreferenciasNotificacao_422": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumAtualizarPreferenciasNotificacao_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumAtualizarPreferenciasNotificacao_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumAtualizarPreferenciasNotificacao_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumAtualizarPreferenciasNotificacao_503": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarNotificacoes_200": {
      "type": "object",
      "required": [
        "dados",
        "paginacao"
      ],
      "properties": {
        "dados": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/NotificacaoComum"
          }
        },
        "paginacao": {
          "$ref": "#/$defs/Paginacao"
        }
      }
    },
    "res_comumListarNotificacoes_400": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarNotificacoes_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarNotificacoes_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarNotificacoes_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarNotificacoes_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarNotificacoes_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarNotificacoes_503": {
      "$ref": "#/$defs/Erro"
    },
    "req_comumCriarPedidoLgpd": {
      "$ref": "#/$defs/CriarPedidoLgpdComum"
    },
    "res_comumCriarPedidoLgpd_202": {
      "$ref": "#/$defs/PedidoLgpdComum"
    },
    "res_comumCriarPedidoLgpd_400": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumCriarPedidoLgpd_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumCriarPedidoLgpd_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumCriarPedidoLgpd_422": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumCriarPedidoLgpd_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumCriarPedidoLgpd_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumCriarPedidoLgpd_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumCriarPedidoLgpd_503": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarPedidosLgpd_200": {
      "type": "object",
      "required": [
        "dados",
        "paginacao"
      ],
      "properties": {
        "dados": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/PedidoLgpdComum"
          }
        },
        "paginacao": {
          "$ref": "#/$defs/Paginacao"
        }
      }
    },
    "res_comumListarPedidosLgpd_400": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarPedidosLgpd_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarPedidosLgpd_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarPedidosLgpd_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarPedidosLgpd_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarPedidosLgpd_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarPedidosLgpd_503": {
      "$ref": "#/$defs/Erro"
    },
    "req_comumPedirEnvioArquivo": {
      "$ref": "#/$defs/PedirEnvioArquivoComum"
    },
    "res_comumPedirEnvioArquivo_201": {
      "$ref": "#/$defs/EnvioArquivoComum"
    },
    "res_comumPedirEnvioArquivo_400": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumPedirEnvioArquivo_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumPedirEnvioArquivo_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumPedirEnvioArquivo_404": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumPedirEnvioArquivo_422": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumPedirEnvioArquivo_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumPedirEnvioArquivo_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumPedirEnvioArquivo_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumPedirEnvioArquivo_503": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumConfirmarEnvioArquivo_200": {
      "$ref": "#/$defs/ArquivoComum"
    },
    "res_comumConfirmarEnvioArquivo_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumConfirmarEnvioArquivo_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumConfirmarEnvioArquivo_404": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumConfirmarEnvioArquivo_422": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumConfirmarEnvioArquivo_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumConfirmarEnvioArquivo_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumConfirmarEnvioArquivo_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumConfirmarEnvioArquivo_503": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumPedirLeituraArquivo_200": {
      "$ref": "#/$defs/LeituraArquivoComum"
    },
    "res_comumPedirLeituraArquivo_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumPedirLeituraArquivo_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumPedirLeituraArquivo_404": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumPedirLeituraArquivo_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumPedirLeituraArquivo_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumPedirLeituraArquivo_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumPedirLeituraArquivo_503": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumObterScore_200": {
      "oneOf": [
        {
          "$ref": "#/$defs/ScoreComum"
        },
        {
          "$ref": "#/$defs/ListaScoresFuncionariosComum"
        }
      ]
    },
    "res_comumObterScore_400": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumObterScore_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumObterScore_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumObterScore_404": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumObterScore_422": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumObterScore_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumObterScore_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumObterScore_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumObterScore_503": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarMovimentosScore_200": {
      "type": "object",
      "required": [
        "dados",
        "paginacao"
      ],
      "properties": {
        "dados": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/MovimentoScoreComum"
          }
        },
        "paginacao": {
          "$ref": "#/$defs/Paginacao"
        }
      }
    },
    "res_comumListarMovimentosScore_400": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarMovimentosScore_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarMovimentosScore_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarMovimentosScore_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarMovimentosScore_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarMovimentosScore_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarMovimentosScore_503": {
      "$ref": "#/$defs/Erro"
    },
    "req_comumCriarRecurso": {
      "$ref": "#/$defs/CriarRecursoComum"
    },
    "res_comumCriarRecurso_201": {
      "$ref": "#/$defs/RecursoComum"
    },
    "res_comumCriarRecurso_400": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumCriarRecurso_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumCriarRecurso_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumCriarRecurso_404": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumCriarRecurso_409": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumCriarRecurso_422": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumCriarRecurso_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumCriarRecurso_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumCriarRecurso_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumCriarRecurso_503": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumObterRecurso_200": {
      "$ref": "#/$defs/RecursoComum"
    },
    "res_comumObterRecurso_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumObterRecurso_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumObterRecurso_404": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumObterRecurso_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumObterRecurso_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumObterRecurso_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumObterRecurso_503": {
      "$ref": "#/$defs/Erro"
    },
    "req_comumDecidirRecurso": {
      "$ref": "#/$defs/DecidirRecursoComum"
    },
    "res_comumDecidirRecurso_200": {
      "$ref": "#/$defs/RecursoComum"
    },
    "res_comumDecidirRecurso_400": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumDecidirRecurso_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumDecidirRecurso_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumDecidirRecurso_404": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumDecidirRecurso_409": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumDecidirRecurso_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumDecidirRecurso_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumDecidirRecurso_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumDecidirRecurso_503": {
      "$ref": "#/$defs/Erro"
    },
    "req_comumDenunciarConteudo": {
      "$ref": "#/$defs/CriarDenunciaComum"
    },
    "res_comumDenunciarConteudo_201": {
      "$ref": "#/$defs/DenunciaComum"
    },
    "res_comumDenunciarConteudo_400": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumDenunciarConteudo_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumDenunciarConteudo_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumDenunciarConteudo_404": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumDenunciarConteudo_422": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumDenunciarConteudo_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumDenunciarConteudo_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumDenunciarConteudo_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumDenunciarConteudo_503": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumConsultarNotasDosSetores_200": {
      "$ref": "#/$defs/NotasSetoresComum"
    },
    "res_comumConsultarNotasDosSetores_400": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumConsultarNotasDosSetores_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumConsultarNotasDosSetores_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumConsultarNotasDosSetores_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumConsultarNotasDosSetores_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumConsultarNotasDosSetores_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumConsultarNotasDosSetores_503": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarDenunciasRecebidas_200": {
      "type": "object",
      "required": [
        "dados",
        "paginacao"
      ],
      "properties": {
        "dados": {
          "type": "array",
          "items": {
            "type": "object",
            "required": [
              "id",
              "conteudo_projetado",
              "motivo"
            ],
            "properties": {
              "id": {
                "$ref": "#/$defs/Uuid"
              },
              "conteudo_projetado": {
                "type": "string",
                "description": "Texto com identidades protegidas removidas; não é o objeto original."
              },
              "motivo": {
                "type": "string"
              }
            }
          }
        },
        "paginacao": {
          "$ref": "#/$defs/Paginacao"
        }
      }
    },
    "res_comumListarDenunciasRecebidas_400": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarDenunciasRecebidas_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarDenunciasRecebidas_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarDenunciasRecebidas_404": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarDenunciasRecebidas_409": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarDenunciasRecebidas_422": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarDenunciasRecebidas_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarDenunciasRecebidas_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarDenunciasRecebidas_503": {
      "$ref": "#/$defs/Erro"
    },
    "req_comumDecidirDenuncia": {
      "type": "object",
      "required": [
        "resultado",
        "motivo"
      ],
      "properties": {
        "resultado": {
          "type": "string",
          "enum": [
            "sem_acao",
            "ocultar"
          ],
          "description": "Códigos propostos para os resultados aprovados."
        },
        "motivo": {
          "type": "string",
          "minLength": 1
        }
      }
    },
    "res_comumDecidirDenuncia_400": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumDecidirDenuncia_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumDecidirDenuncia_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumDecidirDenuncia_404": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumDecidirDenuncia_409": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumDecidirDenuncia_422": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumDecidirDenuncia_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumDecidirDenuncia_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumDecidirDenuncia_503": {
      "$ref": "#/$defs/Erro"
    },
    "req_comumAbrirEleicao": {
      "$ref": "#/$defs/AbrirEleicaoSindico"
    },
    "res_comumAbrirEleicao_201": {
      "$ref": "#/$defs/EleicaoSindico"
    },
    "res_comumAbrirEleicao_400": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumAbrirEleicao_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumAbrirEleicao_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumAbrirEleicao_422": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumAbrirEleicao_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumAbrirEleicao_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumAbrirEleicao_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumAbrirEleicao_503": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarEleicoes_200": {
      "type": "object",
      "required": [
        "dados",
        "paginacao"
      ],
      "properties": {
        "dados": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/EleicaoSindico"
          }
        },
        "paginacao": {
          "$ref": "#/$defs/Paginacao"
        }
      }
    },
    "res_comumListarEleicoes_400": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarEleicoes_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarEleicoes_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarEleicoes_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarEleicoes_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarEleicoes_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumListarEleicoes_503": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumEncerrarEleicao_400": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumEncerrarEleicao_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumEncerrarEleicao_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumEncerrarEleicao_404": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumEncerrarEleicao_409": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumEncerrarEleicao_422": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumEncerrarEleicao_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumEncerrarEleicao_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumEncerrarEleicao_503": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumObterEleicao_200": {
      "$ref": "#/$defs/EleicaoSindico"
    },
    "res_comumObterEleicao_401": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumObterEleicao_403": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumObterEleicao_404": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumObterEleicao_426": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumObterEleicao_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumObterEleicao_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumObterEleicao_503": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumConsultarSaude_200": {
      "$ref": "#/$defs/SaudeComum"
    },
    "res_comumConsultarSaude_429": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumConsultarSaude_500": {
      "$ref": "#/$defs/Erro"
    },
    "res_comumConsultarSaude_503": {
      "$ref": "#/$defs/Erro"
    }
  }
};
