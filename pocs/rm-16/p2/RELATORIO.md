# PoC P2 — Sessões e autenticação (ADR-007), RM-16

Executada em 20/11/2026 na branch `poc/rm-16`, em `pocs/rm-16/p2/`, fora do workspace pnpm. Só dados fictícios, banco local em Docker, sem serviço em nuvem nem conta nova (PC-06). Reaproveita o contêiner `poc-rm16-pg` com um banco novo `p2`; `p3` e `p5` não foram tocados.

**Pergunta** (`criterios-de-poc.md`, P2): o desenho de JWT curto (15 min, `sub` e `sid`), refresh opaco rotativo guardado como hash, cookie httpOnly na web e `expo-secure-store` no app funciona?

**Veredito: APROVADA.** Todos os critérios de aprovação passaram com evidência executável e nenhum critério de reprovação ocorreu. Duas ressalvas pesam na revisão de segurança, e nenhuma reprova a PoC:

1. A política implementada é a **estrita** (sem exceção ao reuso, como manda o ADR-007, linha 91). Ela cumpre a segurança, mas derruba a sessão legítima quando a resposta de uma renovação se perde ou quando dois processos renovam juntos (seções 4 e 6).
2. Não houve prova em aparelho (`expo-secure-store`) nem teste de várias abas na web (seção 7).

## 1. Versões e fontes

| Item | Versão | Fonte |
| --- | --- | --- |
| jose | 6.2.17 | Registro npm; JWT HS256 com `kid`, `iss`, `aud`, `currentDate` injetável |
| argon2 | 0.45.2 | Registro npm; Argon2id com os parâmetros padrão do pacote. O binário vem pré-compilado (Windows x64); o pnpm 12 acusa `ERR_PNPM_IGNORED_BUILDS`, mas o pacote funciona sem rodar script |
| @nestjs/jwt | 12.0.5 | Registro npm; só na comparação (seção 5) |
| better-auth | 1.7.26 | Só consultado no npm; **não instalado nem testado** (seção 5) |
| NestJS | 12.5.1 (`common`, `core`, `platform-express`, `testing`) | Igual ao `backend/apps/api/package.json` |
| Kysely + postgres.js | 0.29.9 + `kysely-postgres-js` 5.1.0 + postgres 4.1.1 | Recomendação da P5 |
| vitest / supertest | 5.1.0 / 7.3.2 | Igual ao `backend/apps/api` (os testes usam `fetch` do Node 26 e o servidor HTTP real) |
| TypeScript | 6.0.3 | `tsc --noEmit` sem erros |
| Node | 26.13.1 via `fnm exec` | — |
| PostgreSQL | 17.12, banco `p2`, contêiner `poc-rm16-pg` | Papéis da P3: `migrador` (dono), `app_user` (a "API", sem BYPASSRLS e não dono), `fixtures` (BYPASSRLS, só testes) |

Documentos de referência: ADR-007 (linhas 33-44, 77-79, 91), segurança (linha 287 e seção 10), guia da API (seção 3, cadeia de guards) e `openapi/comum.yaml` (`/v1/acesso/renovar`).

## 2. Como reproduzir

```sh
cd pocs/rm-16/p2
fnm exec --using 26.13.1 -- pnpm.cmd install --ignore-workspace      # em sh: pnpm install --ignore-workspace
fnm exec --using 26.13.1 -- node scripts/subir.mjs                    # recria o banco p2: esquema + massa (20.000 vínculos)
fnm exec --using 26.13.1 -- node node_modules/vitest/vitest.mjs run --no-file-parallelism --reporter=verbose
fnm exec --using 26.13.1 -- node node_modules/typescript/bin/tsc --noEmit -p .
```

Pré-requisito: o contêiner `poc-rm16-pg` no ar (`sh ../p3/subir.sh`). Nenhum segredo vai ao Git: o chaveiro JWT é gerado em memória a cada teste (`randomBytes`) e as senhas do banco são as fictícias da P3. A PoC não altera o contêiner além de criar o banco `p2`.

**Arquivos**

| Arquivo | Conteúdo |
| --- | --- |
| `sql/01-esquema.sql` | Esquema, RLS e privilégios mínimos (update só nas colunas necessárias, sem delete) |
| `scripts/subir.mjs` | Recria o banco `p2` e carrega a massa fictícia |
| `src/tokens.ts` | Chaveiro com `kid` e emissão/verificação com jose |
| `src/sessoes.service.ts` | Login, rotação estrita, revogação, troca de senha e exclusão LGPD |
| `src/papel.service.ts` | Papel efetivo no servidor, com cache em processo |
| `src/guards.ts`, `src/controllers.ts`, `src/app.ts` | Guards NestJS (autenticação, contexto, papel), proteção CSRF, cookie, CORS e rotas |
| `src/infra.ts` | Kysely + postgres.js e `comContexto` (transação com `set_config` local) |
| `src/cliente.ts` | Cliente de sessão (app e web) com single-flight e adaptador do `expo-secure-store` |
| `test/*.test.ts` | 6 arquivos, 49 testes |
| `resultados/suite.txt`, `carga.txt`, `comparacao-jwt.txt` | Saídas reais de 20/11/2026 |

## 3. Desenho implementado

- **Esquema.** `usuario` (Argon2id), `vinculo` (um papel por usuário e condomínio), `substituicao` (a substituição do síndico é dado), `condominio` (com `plano`), `sessao`, `refresh_token` (só o hash SHA-256) e `aviso` (recurso de tenant para provar a RLS).
- **RLS.** `vinculo` e `substituicao` só devolvem linhas do próprio usuário (`app.usuario_id`); `condominio` só os que ele integra; `aviso` por `app.condominio_id`. `usuario`, `sessao` e `refresh_token` ficam **sem RLS**, porque a renovação acontece antes de se conhecer usuário ou tenant; a proteção delas é o privilégio por coluna (o teste de catálogo prova isso).
- **Cadeia por requisição** (guia, seção 3): `AutenticacaoGuard` (JWT válido e `sid` vivo, 401) e `ContextoGuard` (`X-Condominio-Id` com vínculo e papel efetivo hoje, 403). O papel exigido vem do decorator `@Papeis`. Depois, `comContexto` abre a transação com `set_config` local de `app.usuario_id`, `app.condominio_id` e `app.papel`, e a RLS é a última barreira. Recurso de outro condomínio responde 404.
- **Papel com cache.** Uma consulta por requisição (transação, `set_config` e um join) com cache em processo (padrão 5 s, configurável). A checagem da sessão (`sid`) **não** usa cache: uma consulta por chave primária a cada requisição.
- **Refresh.** Token opaco de 256 bits (`rt_` + base64url), só o hash no banco, rotativo, validade de 30 dias a partir de cada emissão. A rotação é um `UPDATE ... WHERE usado_em IS NULL` atômico.
- **Web.** Refresh em cookie `rt` com `HttpOnly; Secure; SameSite=Lax; Path=/v1/acesso`, nunca no corpo; o access vai no corpo e fica só em memória. CSRF: `Origin` na lista de origens e cabeçalho próprio `X-CondomiFacil-Web: 1`; CORS restrito, com credenciais. App: refresh no corpo, guardado pelo cliente no `expo-secure-store`.

## 4. Critérios de aprovação

Saída real: `resultados/suite.txt`, **49 testes, 49 aprovados** (6 arquivos), e `tsc --noEmit` sem erros.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| JWT de 15 min com `sub` e `sid` | **Aprovado** | `sessoes.test.ts`: claims exatamente `sub`, `sid`, `iss`, `aud`, `iat` e `exp` (sem papel nem condomínio), `exp - iat = 900`, cabeçalho HS256 com `kid`. Vale aos 899 s e dá 401 aos 901 s (relógio controlado). Recusa `alg: none`, assinatura adulterada, chave errada, `kid` desconhecido e emissor errado. Um `sid` de outra sessão com `sub` alheio dá 401 (sessão e usuário precisam casar) |
| `kid` e rotação de chave | **Aprovado** | Após `rotacionar`, tokens novos saem com `k2` e os antigos valem enquanto `k1` existir; depois de `aposentar('k1')` dão 401 |
| Refresh opaco, só o hash no banco | **Aprovado** | O banco tem a linha pelo SHA-256, e nenhuma linha contém o texto do token. Formato `rt_` + 43 caracteres (256 bits) |
| Rotação | **Aprovado** | Cada renovação devolve outro refresh, na mesma sessão. O antigo fica marcado como usado |
| Replay indevido revoga a sessão | **Aprovado** | Reusar o refresh antigo dá 401 e revoga a sessão (`motivo = reuso_refresh`). O sucessor e o access em curso morrem junto, na hora |
| Renovação concorrente coberta | **Aprovado** | 3 rodadas de 8 usos simultâneos do mesmo token: exatamente 1 resposta 200 e 7 respostas 401, e nenhum token duplicado é emitido (2 linhas por sessão: login e uma rotação). A perdedora cai no ramo de reuso e revoga a sessão; o vencedor também cai (custo da política estrita, seção 6). A atomicidade vem do `UPDATE` condicional: a segunda transação espera o lock da linha e reavalia o predicado |
| Troca de papel vale dentro do tempo de cache | **Aprovado** | Janela de 5 s. Papel rebaixado por outra instância: aos 0 s e aos 4,9 s ainda vale o antigo (limite documentado); aos 5,1 s, 403. Vale também para vínculo desativado, para a substituição do síndico (ativar e desativar sem código novo) e para mudança de plano. Com cache de 0 ms, a mudança vale na próxima requisição. **Nunca há permissão antiga além da janela** (critério de reprovação, não ocorreu) |
| `X-Condominio-Id` sem vínculo é recusado | **Aprovado** | Ausente, malformado (inclusive `' or 1=1 --`), de condomínio existente sem vínculo, inexistente e vínculo inativo: sempre 403, com corpo idêntico para "existe" e "não existe" (não confirma existência) |
| Suporte fora do Gestão + Suporte não abre contexto | **Aprovado** | O mesmo usuário de suporte abre contexto no condomínio `gestao_suporte` e recebe 403 no `essencial`; no plano Gestão + Suporte também não ganha o papel de síndico (403 em rota de síndico). Se o plano muda, passa a valer ao fim da janela |
| RLS como última barreira, com o papel real da aplicação | **Aprovado** | `app_user`: sem contexto, zero linhas; com `app.usuario_id`, só as linhas do usuário (nem o condomínio alheio aparece); escrita em outro tenant dá 42501. Dois condomínios: cada um vê só os seus avisos e o aviso do outro dá 404. Catálogo: só `refresh_token`, `sessao` e `usuario` ficam sem RLS; `app_user` não é superusuário, não tem BYPASSRLS nem é dono; não consegue alterar o `hash`, nem apagar sessão, nem apagar vínculo (42501) |
| Logout revoga | **Aprovado** | Access e refresh dão 401 na hora; as outras sessões do usuário continuam |
| Troca de senha revoga | **Aprovado** | Todas as sessões antigas (access e refresh) dão 401, uma nova sessão abre, a senha antiga não entra mais e a nova entra. Senha atual errada: 401 e nada é revogado |
| Exclusão LGPD revoga | **Aprovado** | Todas as sessões morrem (access e refresh), o login falha, o e-mail é anonimizado e `senha_hash` fica nulo. O fluxo de renovação também confere `excluido_em`. A exclusão dos dados de negócio e a retenção ficam fora da PoC |
| Cookie httpOnly na web | **Aprovado** | `Set-Cookie: rt=...; HttpOnly; Secure; SameSite=Lax; Path=/v1/acesso; Max-Age=2592000`. O corpo da resposta não traz refresh e o access nunca vai em cookie. O estado serializado do cliente web não contém `rt_` (o jar do navegador simulado está fora do alcance do código do cliente) |
| Proteção CSRF no cookie | **Aprovado** | Sem `Origin`, `Origin` de terceiro, `Origin: null` ou sem o cabeçalho próprio, a resposta é 403 **e o token não é consumido** (a renovação legítima seguinte funciona). O login web tem a mesma exigência (testado); a troca de senha web também a tem no código, sem teste próprio. CORS: preflight de origem de terceiro não recebe `Access-Control-Allow-Origin`; a origem do painel recebe a própria origem e `credentials: true`, nunca curinga |
| Replay na web | **Aprovado** | O cookie antigo reaproveitado dá 401, revoga a sessão e manda limpar o cookie (`Max-Age=0`). Logout limpa e revoga |
| Custo da consulta de papel contra o RNF-01 | **Aprovado, com a ressalva da seção 7** | `resultados/carga.txt`: a consulta isolada (transação, `set_config`, join sob RLS) tem p50 1,05 ms, p95 1,69 ms e p99 2,15 ms em 2.000 execuções sobre 20.000 vínculos e 250 condomínios; `EXPLAIN` com índices, 0,076 ms de execução. Requisição HTTP completa (`GET /v1/recursos`: JWT, sessão, papel e consulta de aviso sob RLS), 3.000 requisições com 20 em paralelo, falhas 0: **sem cache p95 34,55 ms** (718 req/s, 3.100 consultas de papel) e **com cache de 5 s p95 18,97 ms** (1.301 req/s, 1 consulta). Meta: p95 < 500 ms. Diferença do cache: cerca de 15 ms no p95 e quase o dobro de vazão |
| Cliente do app com `expo-secure-store` | **Aprovado como lógica; prova em aparelho pendente** | `cliente.test.ts` usa um dublê com a mesma assinatura do `expo-secure-store`: o refresh vai para o armazenamento seguro, o access fica em memória e o novo refresh é gravado **antes** de usar o novo access. Com o app reaberto (memória perdida), a renovação pelo armazenamento restaura a sessão. 6 chamadas com access vencido geram **uma** renovação (single-flight) e todas passam. Pendente: provar em aparelho (seção 7) |

Critérios de reprovação: **nenhum ocorreu** (permissão antiga além da janela, reuso aceito, token acessível ao JavaScript na web, sessão irrevogável).

**Sensibilidade dos testes.** Cada mutação abaixo foi aplicada ao código e a suíte correspondente falhou; o código foi restaurado em seguida:

| Mutação | Resultado |
| --- | --- |
| Reuso não revoga a sessão | 3 testes falham (replay, concorrência, perda de resposta) |
| Verificação de CSRF desligada | 2 testes falham (CSRF e login CSRF) |
| Cache de papel que não expira | 5 testes falham (troca de papel, vínculo, substituição e outros) |
| Condição do plano do suporte removida | 2 testes falham |
| `sid` não consultado a cada requisição | 5 testes falham (logout, replay, `sid` forjado e outros) |

## 5. Comparação de alternativas

**Biblioteca**

| Aspecto | jose 6.2.17 + tabela própria + argon2 (principal) | @nestjs/jwt 12.0.5 + guards próprios | better-auth 1.7.26 |
| --- | --- | --- | --- |
| Aderência ao ADR-007 | Total: JWT só com `sub` e `sid`, refresh rotativo e tabela de sessões próprios | Total, com a mesma tabela e os mesmos guards. O pacote só assina e verifica | **Não avaliada na prática; sem aderência provável.** Pelo que o pacote descreve, o modelo dele é sessão de servidor com cookie, que é a opção C do ADR (descartada). Não instalei nem testei; confirmar na revisão se alguém quiser reabrir a escolha |
| Testes de recusa | Todos passaram | Todos passaram **quando o guard fixa** `algorithms`, `issuer` e `audience` | — |
| Armadilha | O guard fixa o algoritmo na verificação (`algorithms: ['HS256']`) | **Sem opções, `verifyAsync` aceita HS512 e qualquer emissor e audiência** (teste `comparacao-nestjs-jwt.test.ts`). A segurança depende de todo guard lembrar das opções | — |
| Rotação por `kid` | Chaveiro em ~15 linhas | Exige `secretOrKeyProvider` próprio lendo o cabeçalho à mão | — |
| Custo por operação (5.000x, só para dimensionar) | assina 39 µs, verifica 37 µs | assina 23 µs, verifica 21 µs | — |
| Dependências | Uma biblioteca, sem dependências transitivas | Embrulha `jsonwebtoken` | — |

**Recomendação:** jose, pela opção segura por padrão e pelo `kid`. O `@nestjs/jwt` também serve, desde que a verificação passe por uma única função com as opções fixas (como o `Chaveiro.verificar`). A diferença de desempenho é irrelevante diante de uma consulta ao banco (1 ms).

**Passport-jwt:** não usado, como orientado (última release em 12/2022).

**Retry legítimo após resposta perdida** (ADR-007, linha 91; só comparar, sem fixar duração). A PoC implementa a política estrita, e o teste "perda de resposta da renovação" mostra o custo: o retry com o token antigo é indistinguível de roubo e a sessão cai. Alternativas para a revisão de segurança, **nenhuma implementada**:

| Alternativa | Como funciona | Prós | Contras e riscos |
| --- | --- | --- | --- |
| A. Estrita (implementada) | Qualquer reuso revoga a sessão | Simples, sem janela e sem estado extra; sempre fecha com falha | Resposta perdida, dois processos do aparelho ou várias abas derrubam a sessão legítima (o login se repete) |
| B. Tolerância no servidor por tempo | Reuso do token anterior vale uma vez, enquanto o sucessor não foi usado, e emite outro; passado esse prazo, é replay | Cobre rede instável sem mudar o cliente | Cria uma janela em que token roubado também renova; exige definir a duração (o ADR não fixa) e guardar quem é o "sucessor não usado" |
| C. Chave de idempotência da renovação | O cliente manda um `renovacao_id`; o servidor guarda o resultado cifrado por um tempo e devolve o mesmo resultado ao repetir | Retry idêntico devolve o mesmo resultado, sem emitir par novo | Guarda um refresh em claro (cifrado) por um tempo; mais estado e mais superfície |
| D. Próximo refresh proposto pelo cliente | O cliente gera o segredo seguinte e manda só o hash; o servidor grava o hash como sucessor. Se a resposta se perde, o cliente já tem o segredo e repete com o mesmo hash | O servidor não guarda segredo; a resposta perdida não obriga a reemitir refresh | Um atacante que copie a requisição inteira ainda renova o access; exige limite de tempo mesmo assim; muda o contrato (`/v1/acesso/renovar`); não testado |
| E. Mitigação só no cliente | Single-flight por processo (implementado), trava entre abas (`Web Locks API`) e entre processos do aparelho (arquivo ou chave de bloqueio) | Não amplia a janela do servidor | Não cobre a resposta perdida, só a concorrência local |

A concorrência local é coberta pela alternativa E e foi provada para um processo (6 chamadas, 1 renovação). Dois processos do mesmo aparelho sem trava derrubaram a sessão no teste (`cliente.test.ts`).

## 6. Achados que viram regra da fase 2

1. **Regra de entrada de dados:** o `comContexto` (de `src/infra.ts`) é a única porta para dados de tenant, com `set_config` local na transação, conforme a P3 e a P5. A guarda por conexão da P5 **não foi reproduzida aqui**: nesta PoC o acesso ao Kysely é direto nos serviços de autenticação.
2. **O plano de autenticação precisa de uma segunda entrada sancionada.** Renovar e fazer login acontecem antes de existir usuário ou tenant, então rodam fora do `TenantContext`. A regra "nada fora do TenantContext" da P5 precisa de uma exceção explícita e estreita (um módulo `autenticacao`, com privilégios por coluna e sem acesso a tabelas de tenant), senão ela bloqueia o próprio login. O catálogo de RLS da fase 2 deve listar essas tabelas como exceção, como o teste de catálogo desta PoC faz.
3. **Verificação do JWT numa função só**, com algoritmo, emissor, audiência e `exp` obrigatórios fixos (armadilha do `@nestjs/jwt`, seção 5).
4. **Revogação sem cache.** A checagem de `sid` a cada requisição custa uma consulta por chave primária e dá revogação imediata. Cachear essa checagem cria uma segunda janela de defasagem (para logout e exclusão LGPD) que o ADR não discute. Se o custo importar, cachear com a mesma janela do papel, e isso precisa de decisão explícita.
5. **Recusa antes de consumir.** A verificação CSRF acontece antes de tocar no token; do contrário, um ataque forçaria a rotação.

## 7. Riscos e limitações para a revisão de segurança

- **A política estrita derruba sessões legítimas** (resposta perdida, dois processos, várias abas). A decisão sobre o retry é do Pedro e da revisão (ADR-007, linha 91).
- **Várias abas na web não foram testadas.** Cada aba tem sua memória e o mesmo cookie; duas abas renovando juntas fazem replay entre si. O single-flight só vale dentro de uma aba. Precisa de trava entre abas (`Web Locks API` ou `BroadcastChannel`) ou da alternativa B.
- **Cache de papel por processo.** A janela de 5 s vale por instância; é um parâmetro da PoC, não uma decisão. Com várias instâncias, a defasagem máxima continua sendo o tempo do cache, pois nenhuma instância avisa a outra. Não medi invalidação ativa (por evento) nem recomendo substituir a janela por ela sem decisão.
- **Carga não segue o RNF-17.** A medição é de laço fechado, 20 conexões, no Docker local do Windows, com a massa de 20.000 vínculos, sem as 10 portarias nem o desenho de dados real. Os números dimensionam o custo do papel (cerca de 1 ms isolado e cerca de 15 ms de p95 sob saturação), mas não substituem a carga da fase 2 com Kysely, que a P5 também deixou pendente. A latência de rede até o Supabase não foi medida.
- **Argon2 com parâmetros padrão do pacote** (64 MiB de memória, 3 passes, 4 paralelismos). Não ajustei nem medi o consumo de memória com logins simultâneos, o que importa no plano gratuito do Render (512 MiB). Cada login em paralelo aloca 64 MiB.
- **Não testado:**
  - ligação ao aparelho do refresh (ADR-007, linha 40; o `X-Dispositivo-Id` do cliente seria forjável, e a ligação real exige atestação ou chave no aparelho);
  - pausa de 15 min após 5 senhas erradas, código de primeiro acesso, recuperação de senha e limites de taxa (SEG-04);
  - limpeza de refresh e sessões antigas (rotina de retenção);
  - `expo-secure-store` em aparelho, que fica como limitação: a lógica do cliente está provada com dublê e **a prova em dispositivo não foi feita** (a P4 usa o emulador, e não houve dev build);
  - Secure do cookie em HTTPS real: os testes rodam em HTTP e provam o cabeçalho, não o comportamento do navegador (que exige HTTPS fora de `localhost`);
  - o contrato: `sair` com `204`, o corpo do `/v1/acesso/entrar` e as respostas de erro são da PoC, não seguem o OpenAPI nem a taxonomia de erros do contrato. O `/v1/eu/senha` usa `cliente` no corpo para escolher cookie ou corpo, e o contrato real precisa decidir como o servidor distingue web de app.
- **Chave simétrica (HS256).** Qualquer processo que verifica também poderia emitir. Hoje só a API verifica; o worker e o WebSocket que verificarem JWT passam a ter a chave de emissão. Rever EdDSA ou ES256 se mais componentes verificarem. O segredo fica fora do Git (variável de ambiente no Render, gerada fora do repositório).
- **403 no contexto.** O guia manda 403 para contexto sem vínculo e o ADR manda 404 para recurso de outro condomínio. A PoC segue o guia e devolve corpo idêntico para "existe" e "não existe". Se a revisão preferir 404 também no contexto, a troca é de uma linha.
- **Ambiente.** Windows com Docker Desktop. Os testes de concorrência dependem de um banco real (não usam mocks) e rodam em arquivos em série (`--no-file-parallelism`), porque compartilham o banco `p2` e o relógio falso é por servidor.
