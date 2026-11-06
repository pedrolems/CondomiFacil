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
| Refresh token | Opaco e aleatório, guardado como hash no banco, **rotativo**: cada uso gera outro; reuso do antigo revoga a sessão; ligado ao aparelho |
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
- Rotação de refresh pode derrubar sessão legítima em rede instável, se a resposta da renovação se perder. A política exata de tolerância está em aberto.
- Cookie na web exige CORS restrito e proteção CSRF bem feitos.
- Política de versões mínimas do cliente e limites de taxa são lacunas.

## Critérios de validação e o que falta para aceitar

- Revisão de segurança (`docs/07-seguranca`) do desenho de sessão, rotação e cookie.
- Medir o custo da consulta de papel por requisição contra RNF-01 e definir o tempo do cache.
- Testes: reuso de refresh revoga a sessão; troca de papel vale dentro do tempo do cache; cabeçalho de condomínio sem vínculo é recusado; suporte sem plano Gestão + Suporte não abre contexto.
- Aprovação do Pedro.

## Referências

- `docs/03-arquitetura/01-arquitetura.md`: seções 3.2, 3.3, 3.3.1, 4.3, 4.4, 7 (SEG-03, SEG-04), 9.3.
- `docs/01-produto/02-prd.md`: seção 3 (permissões) e 10; SEG-03, SEG-04, SEG-17; RF-AC-01 a 04, RF-AD-01.
- `docs/01-produto/03-regras-de-negocio.md`: RN-CD-01, RN-CD-02, RN-CD-04, RN-CD-05, RN-CD-12, RN-CD-28.
- `docs/02-design/02-user-flows.md`: seções 3.1 a 3.3 e 15.
