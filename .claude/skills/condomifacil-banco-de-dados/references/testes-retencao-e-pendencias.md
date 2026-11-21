# Testes, retenção e pendências

Fontes: [ADR-001](../../../../docs/03-arquitetura/adr/001-multi-tenant-rls.md) (linha 75), [estratégia de migrations e seeds](../../../../docs/04-banco-de-dados/03-estrategia-de-migrations-e-seeds.md) (seção 8.1), [MER/DER](../../../../docs/04-banco-de-dados/01-mer-e-der.md) (seções 6.2, 9 e 10), [política de acesso](../../../../docs/04-banco-de-dados/02-politica-de-acesso-a-dados.md) (seção 7), [LGPD](../../../../docs/07-seguranca/lgpd.md), [plano de testes](../../../../docs/08-qualidade/01-plano-de-testes.md), [critérios de PoC](../../../../docs/03-arquitetura/criterios-de-poc.md).

## 1. Testes de banco (Proposta, com evidência das PoCs)

Banco de teste: PostgreSQL 17 em Docker com digest fixado (versão principal do Supabase). Comando único de instalação limpa: **Pendente**.

| Grupo | Casos |
| --- | --- |
| Catálogo de RLS | Toda tabela de condomínio com RLS habilitada, forçada e com política; exceções (`sessao`, `desafio_acesso`, `controle_login`) listadas |
| Identidade | `app_user` sem BYPASSRLS e não dono |
| Isolamento | Dois condomínios em leitura e escrita; sem contexto, zero linhas; vazamento no pool, inclusive após erro e rollback; 404 para outro condomínio |
| Concorrência (conexões independentes) | Duas reservas na mesma faixa; duas conclusões offline; duas baixas pelo mesmo webhook; fechamento de mês com pagamento chegando |
| Migrations | Instalação limpa; atualização com dados; repetição sem reaplicar; alteração detectada; `validate` estrito; falha sem efeito parcial |
| Fixtures | Recusadas fora de banco descartável; recriar o cenário dá o mesmo estado |

Evidência descartável (não é produto): P3 34/34 (PostgreSQL 17.12 em Docker), P5a 9/9, P5b 46/46. Relatórios: [P3](../../../../pocs/rm-16/p3/RELATORIO.md), [P5](../../../../pocs/rm-16/p5/RELATORIO.md).

## 2. Anonimização e retenção (MER seção 6.2, linhas 805-817; política seção 7; LGPD)

| Regra | Estado |
| --- | --- |
| Visitante anonimizado após retenção padrão de 6 meses, configurável | Proposta |
| Saída do morador encerra vínculos e mantém o histórico | Proposta |
| Exclusão global anonimiza a identidade; preserva votos e reclamações sem identificação; não exclui identidade com vínculos em outros condomínios | Proposta |
| Cópia de dados em até 15 dias, sem identidade de reclamante nem voto | Proposta |
| Hash ou HMAC não anonimiza; chave HMAC fica fora do banco | Proposta |
| Avulso financeiro em mês aberto pode ser excluído com auditoria | Proposta; diverge do MER 4.11 |
| Restauração de backup reaplica as exclusões | Proposta |
| Prazos de auditoria, arquivos, notificações, pesquisa, finanças e quarentena | **Pendente** (P-09); não invente prazo |

## 3. Pendências do MER (seção 9, linhas 878-899)

| ID | Tema | Estado |
| --- | --- | --- |
| P-01, P-02, P-13, P-14, P-15 | Diversas | Resolvidas (08/11/2026) |
| P-03 | Substituição do voto do inquilino com sigilo | Aberta; bloqueia votos |
| P-04 | Desempate offline | Parcial (ADR-014, condicionado) |
| P-05 | Fuso horário | Aberta; no recorte da fase 2, decidida por E3 A (21/11/2026): `timestamptz` e `condominio.fuso_horario` padrão `America/Sao_Paulo`, sem rotinas |
| P-06 | Asaas: KYC e chargeback | Aberta |
| P-07 | Fila offline | Parcial |
| P-08 | Fontes financeiras | Direção aprovada (12/11/2026) |
| P-09 | Retenção | Aberta |
| P-10 | Cardinalidades | Aberta fora do recorte; no recorte da fase 2, decidida por E2 A (21/11/2026): blocos opcionais e uma administradora operacional vigente |
| P-11 | Episódio e reversão | Parcial |
| P-12 | Identificador da pesquisa | Aberta |
| P-16 | Nome da coluna `assinatura_verificada` | Aberta |

## 4. Decisões de dados do pacote da fase 2 (aprovadas em A)

Aprovadas por Pedro em 20/11/2026 (opção A): E1 (recorte), E6 (identidades), E7 (sem SECURITY DEFINER), E17 (idempotência, 24 h). Aprovadas por Pedro em 21/11/2026 (opção A): E2 (cardinalidades), E3 (fuso e `timestamptz`), E4 (`registrado_por_id` nulo em carga versionada), E5 (primeiro Admin como fixture), E18 (job `banco` no CI), E19 (desempenho da lista do dia da portaria sob RLS: não mitigar na fase 2, reavaliar na fase 3), além de E8 a E16 e E20 a E22. Com E1 a E22 aprovadas em A, o código da fase 2 está liberado na ordem RM-25 e RM-24, RM-20 e RM-21, RM-23 e RM-22, com commit por pacote RM aprovado por Pedro. Detalhes e opções no [pacote técnico](../../../../docs/09-infra/pacote-tecnico-fase-2.md), seção 7. 
