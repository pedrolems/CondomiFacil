# Modelo e convenções

Fonte principal: [MER/DER](../../../../docs/04-banco-de-dados/01-mer-e-der.md), **Proposta** de 08/11/2026, não aceita pelo Pedro. Recorte da fase 2: [pacote técnico](../../../../docs/09-infra/pacote-tecnico-fase-2.md), seção 3.1, **Proposta** (E1). Nada disto está **Implementado**.

## 1. Convenções de nome e tipo (MER seção 2)

| Tema | Convenção | Estado |
| --- | --- | --- |
| Nomes | Português, `snake_case`, sem acento (linha 47) | Proposta |
| Dado sensível | Sufixo `_protegido` (linhas 364 e 638) | Proposta |
| Chave | `id uuid` PK em toda entidade; associação usa PK composta (linhas 61-63) | Proposta |
| Entidade de condomínio (C) | `condominio_id uuid NOT NULL` + `UQ(condominio_id, id)`; FK C->C composta `(condominio_id, x_id) -> destino(condominio_id, id)` (linha 61) | Proposta |
| FK para `usuario` | Não concede acesso; exige vínculo | Proposta |
| Dinheiro | Inteiro com sufixo `_centavos` (linha 66) | Proposta; precisão de frações, percentuais e arredondamento **Pendente** |
| Tempo | `instante` x `data` (linha 64) | Proposta; fuso **Pendente** (P-05, ADR-012; E3 sugere `timestamptz` e `condominio.fuso_horario` padrão `America/Sao_Paulo`) |
| Estados | Texto (linha 73); a PoC usa `text` + CHECK | Enum x CHECK x tabela **Pendente** |
| Exclusão | Sem soft delete universal: cancelar, encerrar, revogar e estornar são estados ou datas de fim (política seção 2.1; MER linha 389); `anonimizado_em?` em `usuario` e `arquivo` | Proposta |
| Colunas padrão | Não há conjunto uniforme; `criado_em` etc. "quando úteis" (linha 63) | Proposta |
| Vigência | Intervalo `[inicio, fim)` (linha 69) | Proposta |
| Autoria | Histórica e imutável (`registrado_por_id` etc., linha 71) | Proposta |
| Idempotência | `chave_idempotencia` UQ por condomínio; `op_id` UK em `operacao_sync` | Proposta |
| Regras congeladas | `regras_aplicadas json` imutável (linha 322) | Proposta |
| Nomes de índices e constraints | Não definidos | **Pendente**; não invente padrão sem perguntar |

Entidades globais (G) no MER: `usuario`, `sessao`, `desafio_acesso`, `controle_login`, `atribuicao_plataforma`, `documento`, `documento_versao`, `aceite`, `pedido_lgpd`, `dispositivo`, `administradora`, `usuario_administradora`, `plano`, `preco_plano`, `parametro_definicao`, `parametro_padrao`, `categoria_reclamacao`, `categoria_financeira`, `auditoria_plataforma`, `evento_gateway_quarentena`. Lista consolidada de G com e sem RLS: **não existe** (ver [RLS e identidades](rls-e-identidades.md)).

## 2. Domínios do MER (seção 4, cerca de 131 entidades)

| Seção | Domínio |
| --- | --- |
| 4.1 | Identidade, acesso e aceites |
| 4.2 | Unidades, locação, trabalho e gestão (`condominio`, `bloco`, `unidade`, `portaria`, `vinculo_unidade`, `episodio_moradia`, `habilitacao_unidade`, `contrato_locacao`, `versao_locacao`, `mandato`, `substituicao`, `funcionario`, `administracao_condominio`...) |
| 4.3 | Planos, solicitações e parâmetros |
| 4.4 | Reservas, vistorias e visitantes |
| 4.5 | Encomendas |
| 4.6 | Chamados |
| 4.7 | Reclamações e score |
| 4.8 | Pesquisa e comunicação |
| 4.9 | Reuniões, eleições e votos (`voto_registro` separado de `voto_conteudo`) |
| 4.10 | Cobrança e pagamentos |
| 4.11 | Finanças gerenciais |
| 4.12 | Arquivos, notificações, auditoria, sincronização e `evento_saida` |

## 3. Recorte da fase 2 (pacote seção 3.1; E1 aprovada por Pedro em 20/11/2026)

Dentro: `parametro_definicao`, `parametro_padrao`, `parametro_condominio`, `auditoria`, `auditoria_plataforma`, `evento_saida`, `usuario`, `sessao`, `desafio_acesso`, `controle_login`, `documento`, `documento_versao`, `aceite`, `condominio`, `bloco`, `unidade`, `portaria`, `portaria_bloco`, `vinculo_condominio`, `vinculo_unidade`, `episodio_moradia`, `habilitacao_unidade`, `contrato_locacao`, `versao_locacao`, `mandato`, `substituicao`, `funcionario`, `plano`, `preco_plano`, `assinatura_condominio`, `administradora`, `usuario_administradora`, `administracao_condominio`, `solicitacao`, `autorizacao_suporte`, `acesso_suporte`, `atribuicao_plataforma`.

Condicional: `arquivo` (E11). Nova, fora do MER: tabela de idempotência (E17).

Fora: `parametro_area`, `pedido_lgpd`, `dispositivo`, `operacao_sync`, notificações, `execucao_rotina` e as entidades das fases 3 e 4.

Fora do recorte também: `lotacao_funcionario` e `funcionario_portaria` (E1).

## 4. Invariantes (MER seção 5, linhas 744-777; Proposta)

| Área | Invariante | Mecanismo sugerido |
| --- | --- | --- |
| Tenant | Nenhuma FK cruza condomínio | FK composta com `condominio_id` |
| Habilitação | No máximo um habilitado por unidade; exatamente um em ocupada regular; zero em desocupada (exceção RN-CD-18) | UNIQUE parcial + verificação na transação |
| Locação | Inquilino = `contrato_locacao.inquilino_vinculo_id` (P-14); versão de locação imutável | FK; sem UPDATE |
| Reservas | Sem sobreposição nos estados que bloqueiam; limite mensal serializado | EXCLUDE com gist (`btree_gist`); bloqueio na transação |
| Portaria offline | Entrada offline com recibo único | UNIQUE |
| Chamados | Uma conclusão efetiva por ciclo (menor horário do celular, RN-CH-04) | UNIQUE parcial; desempate em ADR-014 (condicionado) |
| Reclamação | XOR de alvo | CHECK |
| Score | 0..100, com antes/depois e chave idempotente; novo episódio começa em 100 | CHECK + UNIQUE |
| Pesquisa | Uma resposta por pessoa/funcionário/mês | UNIQUE |
| Documento | Só com versão publicada | Transação |
| Votação | Abre com pelo menos 2 opções na mesma transação; opções imutáveis (P-15); um voto efetivo por votação/unidade; `voto_conteudo` sem FK para `voto_registro` (voto secreto) | Transação, UNIQUE, ausência deliberada de FK |
| Cobrança | Congela responsável e regras; webhook repetido não soma; crédito não ultrapassa saldo; devolução não supera recebido | `regras_aplicadas`, UNIQUE de evento, CHECK/transação |
| Finanças | Mês fechado não muda valores (só estorno, com bloqueio do mês); UQ de recorrência/competência; comentário financeiro imutável | Bloqueio + UNIQUE + sem UPDATE |
| Provedor externo | Intenção idempotente + confirmação | Chave idempotente + estado |
| Exclusão | Nunca `ON DELETE CASCADE` sobre voto, reclamação ou dinheiro (linha 914) | FK `RESTRICT` |

A PoC P3 (`pocs/rm-16/p3/sql/01-esquema.sql`) mostra a forma de FK composta, EXCLUDE e RLS; é descartável, não é modelo aceito.
