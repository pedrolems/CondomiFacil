# ADR-010: Anonimato com identidade em tabelas separadas, HMAC e limites mínimos

- **Estado:** Proposto
- **Data:** 06/11/2026
- **Decisores:** Pedro Lemos
- **Depende de:** parecer jurídico (SEG-16)
- **Relacionado a:** [ADR-001](001-multi-tenant-rls.md), [ADR-009](009-votacao-sigilo.md), [ADR-007](007-autorizacao-jwt-sem-papeis.md)

## Contexto

**Atualização de produto — 08/11/2026:** RN-SC-13/RN-SC-14 definem score de moradia por pessoa e vínculo de unidade, com início em 100 a cada novo vínculo, e score funcional de funcionário/síndico profissional sem unidade por pessoa/condomínio. RN-SC-02 define o score público do síndico morador pela unidade vinculada ao mandato. Isso não aceita os mecanismos técnicos propostos neste ADR; suas políticas devem autorizar o perfil de score correspondente e preservar a separação entre imóveis.

Várias funções exigem que a identidade de quem avalia ou reclama não vaze:

- Reclamações: o alvo não vê o reclamante (RN-RC-01, RN-RC-10); proprietário não residente vê só categoria, data, decisão e multa (RN-RC-16); reclamação gerada por vistoria tem o condomínio como reclamante (RN-RC-12).
- Score: visível só ao dono, com exceções; suporte da plataforma não vê scores nem reclamações (RN-SC-02, SEG-07, RN-CD-16).
- Pesquisa mensal: notas e comentários individuais só ao próprio funcionário, sem autor (RN-PE-08, RN-PE-09, RF-PE-04); nota do setor só com 2 ou mais funcionários avaliados.
- Avaliação do atendimento de chamado: funcionário vê média e comentários anônimos só com 3 ou mais avaliações (RN-CH-19 a RN-CH-21).
- Finanças: receitas de cobrança agregadas, sem unidade nem responsável (RN-FI-30, SEG-18).

O requisito é que a identidade **não possa vazar nem por bug de tela**. Só "esconder o campo" na UI ou no DTO não basta. O SEG-16 prevê parecer jurídico sobre score, reclamações, penalidades e eleições, que pode alterar fluxos e prazos.

## Opções consideradas

| Opção | Prós | Contras |
| --- | --- | --- |
| **A. Esconder o campo de autor no DTO** | Simples | Um bug de consulta ou de DTO vaza a identidade; o dado existe na mesma linha |
| **B. Identidade em tabela separada, com RLS própria, e tabelas de leitura sem coluna de autor** | Defesa em profundidade: o alvo nunca consulta a tabela de identidade; vazamento por tela exige falha no banco | Mais tabelas e junções controladas; exige testes por DTO |
| **C. Anonimização criptográfica forte (ex.: provas de conhecimento zero)** | Sigilo mais forte | Fora do escopo do MVP; nenhum requisito pede |

## Decisão (proposta)

Opção **B**, com os mecanismos abaixo (arquitetura 3.9.2).

| Dado | Mecanismo |
| --- | --- |
| Reclamante | `reclamacao_identidade` com RLS restrita ao julgador da reclamação e à administradora. A tabela de reclamação lida pelo alvo **não tem** coluna de autor; a API do alvo usa um DTO sem o campo e a consulta do alvo nunca faz junção com a tabela de identidade |
| Proprietário não residente | Visão (view) específica |
| Semáforo do prazo | Campo calculado só no DTO do julgador (RN-RC-19) |
| Score | Endpoint único com tabela de regras de visibilidade; nenhum outro endpoint devolve score; o suporte da plataforma não recebe permissão de banco nas tabelas de score e reclamação |
| Reclamação gerada por vistoria | A identidade aponta para o condomínio, nunca para quem fez a vistoria (RN-RC-12) |
| Pesquisa mensal | Tabela de respostas **sem** `avaliador_id`. A regra "um avaliador, uma resposta por funcionário e mês" é garantida por um **identificador derivado**: HMAC com chave só do servidor sobre avaliador + funcionário + mês. Impede duplicar sem revelar quem é |
| Nota do setor | Regra do mínimo de 2 funcionários aplicada no cálculo do fechamento (rotina 6), antes de gravar o que será exibido |
| Avaliação de chamado | Consulta do funcionário sobre visão agregada com `HAVING count >= 3`, data truncada ao mês; síndico e subsíndico leem pela rota do chamado |
| Finanças | Fontes individuais restritas e projeções agregadas **por dia e categoria**, sem unidade/responsável para síndico e conselho fiscal; direção aprovada por Pedro em 12/11/2026, sem aprovar estrutura física ou todo o ADR |

Cuidados adicionais:

- **Limites mínimos** (2 funcionários, 3 avaliações) aplicados **no servidor** e em testes. Evitar devolver contagens exatas abaixo do mínimo.
- **Logs:** nunca registrar corpo de requisição de reclamação, avaliação ou voto em log nem em Sentry (filtro de dados sensíveis no SDK).
- **LGPD:** a exclusão anonimiza o histórico mantendo votos e reclamações sem identificação (RF-LG-02); a cópia de dados do titular não inclui a identidade de quem reclamou dele.
- **Teste de vazamento:** para cada DTO e visão sensível, e para cada perfil, um teste garante a ausência de campos de identidade.
- **Chave do HMAC:** só no servidor, com identificador de chave para rotação. Detalhe da rotação não está definido.

## Consequências

**Positivas**

- Vazamento por tela ou DTO deixa de bastar para expor identidade.
- Regras de visibilidade ficam em um ponto (endpoint de score, visões), mais fáceis de testar e de ajustar após o parecer.
- Unicidade da pesquisa sem guardar quem respondeu.

**Negativas**

- Mais tabelas, visões e testes.
- Poucos avaliadores ainda permitem reidentificar por correlação de tempo ou volume; a defesa é parcial.

**Riscos**

- Reidentificação por correlação com poucas respostas (arquitetura 9.4). Mitigação: limites mínimos aplicados no servidor e testes de DTO.
- Perda ou vazamento da chave HMAC permitiria testar suposições de autoria. A chave fica em cofre, com rotação planejada.
- O parecer jurídico pode mudar reclamações, score e penalidades. As regras ficam em parâmetros e dados para ajustar sem reescrever.

## Critérios de validação e o que falta para aceitar

- **Parecer jurídico (SEG-16).**
- Testes automatizados de ausência de campos de identidade por DTO e por perfil (arquitetura 4.11, linha "Anonimato"), incluindo os limites 2 e 3.
- Teste de que suporte e admin da plataforma não leem reclamação nem score.
- Revisão de segurança do HMAC (escolha de algoritmo, custódia e rotação da chave).
- Aprovação do Pedro.

## Referências

- `docs/03-arquitetura/01-arquitetura.md`: seções 3.9.2, 4.11, 7 (SEG-07, SEG-18), 9.2, 9.4.
- `docs/01-produto/02-prd.md`: SEG-07, SEG-16, SEG-18; RF-PE-04, RF-LG-02.
- `docs/01-produto/03-regras-de-negocio.md`: RN-RC-01, RN-RC-10, RN-RC-12, RN-RC-16, RN-RC-19, RN-SC-02, RN-PE-08, RN-PE-09, RN-CH-19 a RN-CH-21, RN-FI-30, RN-CD-16.

## Complementação de 12/11/2026

Pedro aprovou fontes financeiras individuais restritas e agregação diária por categoria nas projeções autorizadas (item 17A do [registro](../../01-produto/05-decisoes-de-complementacao.md)). Moderação não revela reclamante/avaliador e acesso próprio ao caso após saída requer projeção revisada. Sigilo de voto, pesquisa, retenção e demais escolhas deste ADR continuam propostas sujeitas à revisão.
