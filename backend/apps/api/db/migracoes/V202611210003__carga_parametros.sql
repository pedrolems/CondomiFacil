-- Objetivo: carga versionada dos 36 parâmetros configuráveis da RN 13 (definições) e dos 35 padrões
--   de plataforma (todos menos reserva.valor, que não tem padrão). Também fixa o vocabulário de
--   parametro_definicao.tipo e cria a política explícita de INSERT do migrador nos dois catálogos.
-- Referência: Regras de Negócio, seção 13 (catálogo de parâmetros); MER/DER (parametro_definicao e
--   parametro_padrao); fase 2: E4 (origem carga_versionada); decisões de Pedro de 21/11/2026 (tipos,
--   enum e conjunto em minúsculas, percentuais em %, reserva.valor em centavos sem padrão,
--   regra 'RN 8.4', níveis, vigente_desde fixo e política FOR INSERT TO migrador).
-- Pré-condições: V202611210002 aplicada; catálogos vazios.
-- Compatibilidade: só acrescenta CHECK (tabela vazia), políticas e linhas; app_user continua só SELECT.
-- Risco de lock: ACCESS EXCLUSIVE breve em parametro_definicao pelo ADD CONSTRAINT (tabela vazia e
--   sem uso); demais operações são INSERT.
-- Recuperação: forward-only. Local/CI: recriar o banco ("pnpm db:instalar"). Ambiente
--   compartilhado: novos padrões entram por nova linha com vigência posterior, nunca editando esta.
set local lock_timeout = '5s';
set local statement_timeout = '60s';

alter table condomifacil.parametro_definicao
  add constraint parametro_definicao_tipo_check
  check (tipo in ('inteiro', 'decimal', 'centavos', 'booleano', 'enum', 'conjunto'));

-- Com a RLS forçada, o próprio dono só grava por política. Restrita ao migrador (cargas versionadas);
-- não concede nada ao app_user.
create policy parametro_definicao_carga_migrador on condomifacil.parametro_definicao
  for insert to migrador with check (true);
create policy parametro_padrao_carga_migrador on condomifacil.parametro_padrao
  for insert to migrador with check (true);

-- Ids determinísticos derivados da chave (reprodutíveis entre instalações).
insert into condomifacil.parametro_definicao
  (id, chave, tipo, minimo, maximo, niveis_permitidos, regra_id, descricao)
select md5('parametro_definicao:' || d.chave)::uuid, d.chave, d.tipo, d.minimo, d.maximo,
       case d.nivel when 'area' then array['plataforma', 'condominio', 'area']
                    else array['plataforma', 'condominio'] end,
       d.regra_id, d.descricao
from (values
  ('score.limite_bloqueio_gratuitas', 'inteiro', 0, 100, 'condominio', 'RN-SC-09', 'Score abaixo do qual reservas gratuitas ficam bloqueadas'),
  ('score.pontos_leve', 'inteiro', 1, 20, 'condominio', 'RN-SC-03', 'Pontos perdidos por infração leve'),
  ('score.pontos_media', 'inteiro', 5, 30, 'condominio', 'RN-SC-03', 'Pontos perdidos por infração média'),
  ('score.pontos_grave', 'inteiro', 10, 50, 'condominio', 'RN-SC-03', 'Pontos perdidos por infração grave'),
  ('score.penalidade_desproporcional', 'inteiro', 0, 20, 'condominio', 'RN-SC-03', 'Penalidade por reclamação desproporcional'),
  ('score.penalidade_falsa', 'inteiro', 0, 30, 'condominio', 'RN-SC-03', 'Penalidade por reclamação falsa'),
  ('reclamacao.prazo_decisao_dias', 'inteiro', 3, 60, 'condominio', 'RN-RC-06', 'Prazo de decisão da reclamação, em dias'),
  ('reclamacao.prazo_resposta_alvo_dias', 'inteiro', 2, 15, 'condominio', 'RN-RC-04', 'Prazo de resposta do alvo da reclamação, em dias'),
  ('reserva.tipo', 'enum', null, null, 'area', 'RN-RE-01', 'Tipo da reserva da área: gratuita ou paga'),
  ('reserva.valor', 'centavos', 100, 1000000, 'area', 'RN-RE-01', 'Valor da reserva paga, em centavos'),
  ('reserva.prazo_pagamento_horas', 'inteiro', 1, 72, 'area', 'RN-RE-03', 'Prazo de pagamento da reserva, em horas'),
  ('reserva.prazo_cancelamento_reembolso_horas', 'inteiro', 0, 168, 'area', 'RN-CA-02', 'Antecedência mínima de cancelamento com reembolso, em horas'),
  ('reserva.antecedencia_min_horas', 'inteiro', 0, 720, 'area', 'RN-RE-06', 'Antecedência mínima da reserva, em horas'),
  ('reserva.antecedencia_max_dias', 'inteiro', 1, 365, 'area', 'RN-RE-06', 'Antecedência máxima da reserva, em dias'),
  ('reserva.limite_mensal_por_unidade', 'inteiro', 1, 31, 'area', 'RN-RE-07', 'Limite mensal de reservas por unidade'),
  ('reserva.lembrete_antecedencia_horas', 'inteiro', 1, 72, 'condominio', 'RN-RE-14', 'Antecedência do lembrete de reserva, em horas'),
  ('chamado.prazo_limpeza_horas', 'inteiro', 1, 168, 'condominio', 'RN-CH-06', 'Prazo de atendimento de chamado de limpeza, em horas'),
  ('chamado.prazo_manutencao_resposta_horas', 'inteiro', 4, 168, 'condominio', 'RN-CH-06', 'Prazo de resposta de chamado de manutenção, em horas'),
  ('chamado.janela_avaliacao_dias', 'inteiro', 1, 30, 'condominio', 'RN-CH-17', 'Janela de avaliação do chamado, em dias'),
  ('encomenda.prazo_guarda_dias', 'inteiro', 7, 90, 'condominio', 'RN-EN-04', 'Prazo de guarda de encomenda, em dias'),
  ('entrega_esperada.limite_por_unidade', 'inteiro', 1, 30, 'condominio', 'RN-EN-08', 'Limite de entregas esperadas por unidade'),
  ('entrega_esperada.tolerancia_vinculo_dias', 'inteiro', 0, 7, 'condominio', 'RN-EN-13', 'Tolerância para vincular encomenda à entrega esperada, em dias'),
  ('visitante.retencao_meses', 'inteiro', 1, 12, 'condominio', 'RN 8.4', 'Retenção dos registros de visitantes, em meses'),
  ('visitante.lista_max_pessoas', 'inteiro', 10, 300, 'condominio', 'RN-VI-12', 'Máximo de pessoas por lista de visitantes'),
  ('mandato.reeleicao_permitida', 'booleano', null, null, 'condominio', 'RN-VO-05', 'Reeleição permitida no mandato'),
  ('cobranca.formas_pagamento', 'conjunto', null, null, 'condominio', 'RN-FI-02', 'Formas de pagamento aceitas: boleto, pix e cartao (ao menos uma)'),
  ('cobranca.dia_vencimento', 'inteiro', 1, 28, 'condominio', 'RN-FI-04', 'Dia de vencimento da taxa condominial'),
  ('cobranca.antecedencia_emissao_dias', 'inteiro', 5, 30, 'condominio', 'RN-FI-05', 'Antecedência de emissão da cobrança, em dias'),
  ('cobranca.multa_atraso_pct', 'decimal', 0, 2, 'condominio', 'RN-FI-06', 'Multa por atraso, em %'),
  ('cobranca.juros_mes_pct', 'decimal', 0, 1, 'condominio', 'RN-FI-06', 'Juros de mora ao mês, em %'),
  ('cobranca.desconto_pontualidade_pct', 'decimal', 0, 10, 'condominio', 'RN-FI-07', 'Desconto por pontualidade, em %'),
  ('cobranca.bloqueia_reserva_em_atraso', 'booleano', null, null, 'condominio', 'RN-FI-12', 'Bloqueio de reserva para unidade em atraso'),
  ('financeiro.dia_fechamento_mes', 'inteiro', 1, 28, 'condominio', 'RN-FI-28', 'Dia de fechamento do mês financeiro'),
  ('locacao.aviso_fim_contrato_dias', 'inteiro', 7, 90, 'condominio', 'RN-CD-21', 'Antecedência do aviso de fim de contrato de locação, em dias'),
  ('locacao.carencia_fim_contrato_dias', 'inteiro', 0, 30, 'condominio', 'RN-CD-21', 'Carência após o fim do contrato de locação, em dias'),
  ('locacao.temporada_permitida', 'booleano', null, null, 'condominio', 'RN-VI-10', 'Locação por temporada permitida')
) as d (chave, tipo, minimo, maximo, nivel, regra_id, descricao);

-- Padrões de plataforma (reserva.valor não tem padrão). registrado_em fixo, igual à vigência,
-- para a carga ser reprodutível. definicao_id pela mesma derivação (o migrador não tem política de
-- SELECT; a FK confere a existência).
insert into condomifacil.parametro_padrao
  (id, definicao_id, valor_json, vigente_desde, registrado_por_id, registrado_em, origem, versao_migracao)
select md5('parametro_padrao:' || p.chave || ':202611210003')::uuid,
       md5('parametro_definicao:' || p.chave)::uuid, p.valor::jsonb,
       timestamptz '2026-11-21 00:00 America/Sao_Paulo', null,
       timestamptz '2026-11-21 00:00 America/Sao_Paulo', 'carga_versionada', '202611210003'
from (values
  ('score.limite_bloqueio_gratuitas', '60'),
  ('score.pontos_leve', '5'),
  ('score.pontos_media', '10'),
  ('score.pontos_grave', '20'),
  ('score.penalidade_desproporcional', '5'),
  ('score.penalidade_falsa', '15'),
  ('reclamacao.prazo_decisao_dias', '15'),
  ('reclamacao.prazo_resposta_alvo_dias', '5'),
  ('reserva.tipo', '"gratuita"'),
  ('reserva.prazo_pagamento_horas', '24'),
  ('reserva.prazo_cancelamento_reembolso_horas', '12'),
  ('reserva.antecedencia_min_horas', '24'),
  ('reserva.antecedencia_max_dias', '60'),
  ('reserva.limite_mensal_por_unidade', '2'),
  ('reserva.lembrete_antecedencia_horas', '24'),
  ('chamado.prazo_limpeza_horas', '24'),
  ('chamado.prazo_manutencao_resposta_horas', '48'),
  ('chamado.janela_avaliacao_dias', '7'),
  ('encomenda.prazo_guarda_dias', '30'),
  ('entrega_esperada.limite_por_unidade', '10'),
  ('entrega_esperada.tolerancia_vinculo_dias', '3'),
  ('visitante.retencao_meses', '6'),
  ('visitante.lista_max_pessoas', '100'),
  ('mandato.reeleicao_permitida', 'true'),
  ('cobranca.formas_pagamento', '["boleto", "pix", "cartao"]'),
  ('cobranca.dia_vencimento', '10'),
  ('cobranca.antecedencia_emissao_dias', '15'),
  ('cobranca.multa_atraso_pct', '2'),
  ('cobranca.juros_mes_pct', '1'),
  ('cobranca.desconto_pontualidade_pct', '0'),
  ('cobranca.bloqueia_reserva_em_atraso', 'false'),
  ('financeiro.dia_fechamento_mes', '10'),
  ('locacao.aviso_fim_contrato_dias', '30'),
  ('locacao.carencia_fim_contrato_dias', '7'),
  ('locacao.temporada_permitida', 'false')
) as p (chave, valor);
