# ADR-007: Autorização com papéis no servidor, JWT sem papéis e refresh rotativo

- **Estado:** Proposto
- **Data:** 06/11/2026
- **Decisores:** Pedro Lemos
- **Depende de:** revisão de segurança
- **Relacionado a:** [ADR-001](001-multi-tenant-rls.md), [ADR-008](008-orm-query-builder-migracoes.md)

## Contexto

O PRD seção 10 diz "JWT no armazenamento seguro do aparelho". Os documentos não definem o conteúdo do token nem como os vínculos do usuário chegam à autorização (lacuna 9.3).

Fatos que moldam a escolha:

- Ninguém se cadastra sozinho; pré-cadastro pela administradora ou suporte (RF-AD-01, RN-CD-01). Primeiro acesso por código de 6 dígitos, válido 15 min, 5 tentativas, reenvio após 60 s, senha com no mínimo 8 caracteres, pausa de 15 min após 5 senhas erradas (RF-AC-01, RN-CD-02, SEG-04). Senha com Argon2 ou bcrypt.
- Papéis **mudam**: substituição do síndico (RN-CD-12, RN-CD-28), fim de mandato, troca de morador habilitado (RN-CD-04). O subsíndico em substituição ganha as permissões de síndico, exceto ativar ou desativar a substituição.
- Um usuário tem vários vínculos (vários condomínios e unidades) e o app mostra uma unidade ativa por vez (RN-CD-05, RF-AC-04).
- A matriz de permissões está decidida no PRD seção 3. Regras de dono do dado por unidade em SEG-17.
- UF 15 define sessão expirada: volta ao login e depois à tela.
- A web não tem armazenamento seguro equivalente ao do aparelho.

## Opções consideradas

| Opção | Prós | Contras |
| --- | --- | --- |
| **A. JWT com papéis e condomínios dentro do token** | Sem consulta por requisição | Permissão velha até expirar o token; token cresce com vários vínculos; troca de papel (substituição) demora a valer |
| **B. JWT mínimo (`sub`, `sid`), papéis resolvidos no servidor a cada requisição** | Permissão sempre atual; token pequeno; revogação por sessão | Uma consulta por requisição, mitigável com cache em processo de poucos segundos |
| **C. Sessão de servidor por cookie** | Revogação simples | Não é o que o PRD indica; pior para o app nativo |

## Decisão (proposta)

Opção **B**.

**Tokens**

| Item | Proposta |
| --- | --- |
| Access token | JWT assinado, curto (15 min), só com `sub` (usuário) e `sid` (sessão). Sem papéis nem condomínios |
| Refresh token | Opaco e aleatório, guardado como hash no banco, **rotativo**: cada uso gera outro; replay indevido revoga a sessão; retry legítimo deve ter tolerância controlada conforme direção de 12/11/2026, com mecanismo e duração ainda sujeitos à revisão de segurança; ligado ao aparelho |
| Revogação | Tabela de sessões; sair da conta, troca de senha e exclusão LGPD revogam |
| App | Tokens no `expo-secure-store` |
| Web | Refresh token em cookie `httpOnly`, `Secure`, `SameSite=Lax`; access token só em memória, para evitar roubo por XSS. Exige proteção CSRF para o cookie de refresh |
| Chaves | Identificador de chave (`kid`) para rotação sem derrubar sessões |

**Autorização em quatro camadas** (matriz decidida no PRD 3):

1. **Contexto:** a requisição declara condomínio e unidade ativos (`X-Condominio-Id`, `X-Unidade-Id`); a API valida o vínculo do usuário com ambos.
2. **Perfil e papel por mandato:** guards do NestJS consultam o papel efetivo do usuário naquele condomínio, hoje. A substituição do síndico é dado (tabela de substituição), não código.
3. **Unidade:** regras de dono do dado (ex.: situação financeira só ao responsável financeiro, à administradora e ao síndico, SEG-17).
4. **RLS:** última barreira no banco ([ADR-001](001-multi-tenant-rls.md)); o papel resolvido vai para `app.papel`.

Outras decisões associadas: senha com Argon2id; comparação do código em tempo constante; limites de taxa por IP e e-mail nos endpoints de acesso (SEG-04) e por usuário nos demais; resposta 404, nunca 403 que confirme existência de recurso de outro condomínio. A ação sem permissão "nem aparece" no cliente, mas a API valida sempre.

## Consequências

**Positivas**

- Papel e mandato sempre atuais; a substituição do síndico vale na próxima requisição.
- Token pequeno, independente do número de vínculos.
- Sessões revogáveis de verdade, apesar do uso de JWT.

**Negativas**

- Uma consulta por requisição para resolver o papel. Mitigação: cache em processo de poucos segundos (com a janela de defasagem que isso implica).
- Mais peças de servidor: tabela de sessões, rotação, detecção de reuso.

**Riscos**

- Cache de papel mantém permissão antiga por alguns segundos após uma mudança.
- Rotação de refresh pode derrubar sessão legítima em rede instável, se a resposta da renovação se perder. Pedro aprovou em 12/11/2026 a direção de tolerância controlada a retry legítimo; mecanismo, janela e proteção contra replay continuam pendentes de revisão de segurança.
- Cookie na web exige CORS restrito e proteção CSRF bem feitos.
- Política de versões mínimas do cliente e limites de taxa são lacunas.

## Critérios de validação e o que falta para aceitar

- Revisão de segurança (`docs/07-seguranca`) do desenho de sessão, rotação e cookie.
- Medir o custo da consulta de papel por requisição contra RNF-01 e definir o tempo do cache.
- Testes: replay indevido de refresh revoga a sessão; retry legítimo exige mecanismo e janela ainda sujeitos à revisão; troca de papel vale dentro do tempo do cache; cabeçalho de condomínio sem vínculo é recusado; suporte sem plano Gestão + Suporte não abre contexto.
- Aprovação do Pedro.

## Referências

- `docs/03-arquitetura/01-arquitetura.md`: seções 3.2, 3.3, 3.3.1, 4.3, 4.4, 7 (SEG-03, SEG-04), 9.3.
- `docs/01-produto/02-prd.md`: seção 3 (permissões) e 10; SEG-03, SEG-04, SEG-17; RF-AC-01 a 04, RF-AD-01.
- `docs/01-produto/03-regras-de-negocio.md`: RN-CD-01, RN-CD-02, RN-CD-04, RN-CD-05, RN-CD-12, RN-CD-28.
- `docs/02-design/02-user-flows.md`: seções 3.1 a 3.3 e 15.

## Complementação de 12/11/2026

Direção aprovada por Pedro: distinguir retry legítimo após resposta perdida de replay indevido, com tolerância controlada. Não há duração arbitrária nem mecanismo aprovado nesta revisão. Até revisão, não implementar exceção ampla ao reuso. O contrato registra esse bloqueio. Esta decisão não aceita integralmente o ADR. Registro: [19 escolhas](../../01-produto/05-decisoes-de-complementacao.md), item 16A.


## Atualização de autogestão e eleições — 13/11/2026

Regra aprovada por Pedro: **Essencial admite autogestão**, sem administradora e sem contratar Gestão + Suporte (RN-PL-08); não é terceiro plano nem novo perfil. Gestão e administração ficam no condomínio, concentradas nos órgãos locais aprovados por Pedro. **Distribuição conservadora proposta, a validar:** síndico executa, subsíndico em substituição assume, conselho fiscal mantém fiscalização e as atribuições específicas das RN. A exceção financeira de RN-FI-29 permite ao executor da autogestão operar finanças; não concede ao conselho edição financeira irrestrita. Leitura fiscal continua agregada e fontes individuais permanecem restritas à finalidade autorizada. Suporte não recebe acesso ao Essencial, nem a reclamações e scores em qualquer plano.

**Condução eleitoral em qualquer plano:** síndico em exercício; na ausência ou vacância, subsíndico; sem ambos, conselho fiscal; sem todos, proprietário designado com permissão temporária restrita à eleição. Administradora vinculada e suporte legitimamente autorizado também podem conduzir, sem serem pré-requisito. Autorização é contextual por condomínio, mandato, ausência/vacância e concessão; revalidar em cada leitura e ação. Proprietário designado recebe somente o escopo daquela eleição, sem gestão, finanças, reclamações ou autoconcessão. Auditoria registra ações, nunca voto individual; resultado só após encerramento. A restrição eleitoral anterior de 12/11/2026 fica substituída por RN-VO-13/RN-CD-13 atualizadas.

**Proposta técnica a revisar:** separar modalidade de gestão do plano comercial e manter histórico de vigência; políticas de autorização por ação (Strategy), reutilizando serviços de domínio (Information Expert, baixo acoplamento) nas interfaces de síndico, conselho e comum. Não atribuir o papel Administradora ao síndico para reutilizar DTOs. Persistir concessão eleitoral com condomínio, eleição, proprietário, início/fim, origem da designação e revogação, sem prazo arbitrário. Modelo físico, operação de concessão e campos ainda dependem de validação. Não há banco, migrações ou backend implementados.

**Pendências antes do MVP:** comprovar primeiro responsável sem autoridade prévia; registrar ausência/vacância sem autodeclaração privilegiada; definir qual conselheiro atua; designar/revogar proprietário e tratar perda de vínculo ou retorno do titular durante eleição; validar mandatos e mudança de modalidade; revisar a matriz completa de cadastros, cobrança, conciliação, pagamentos e finanças da autogestão. A interface comum contrata condução eleitoral; as 82 operações propostas de `/v1/sindico/gestao/` cobrem cadastros/configurações, cobrança, conciliação e finanças com DTOs específicos referenciados, sem login de administradora. Caminhos, distribuição e DTOs exigem revisão antes de implementar; mandatos/substituições e concessão inicial permanecem lacunas bloqueadoras. Critérios: titular/sub fora condição e conselho sem condição devem ser recusados; proprietário temporário não alcança finanças; suporte é recusado no Essencial; não há resultado parcial. Ver [decisões e questões detalhadas](../../01-produto/06-autogestao-e-conducao-eleitoral.md). Esta atualização não aceita ADRs ou contratos inteiros.
