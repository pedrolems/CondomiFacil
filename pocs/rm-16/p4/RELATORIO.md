# PoC P4 — Persistência offline e fila (ADR-003 e ADR-014) — Relatório

Data: 20/11/2026. Autor: subagente de frontend. Só dados fictícios. Pasta descartável, fora do workspace pnpm.

## Veredito

**APROVADA** para a principal: **expo-sqlite 58.0.18 com SQLCipher + outbox própria** cumpre SEG-09 e RNF-06/07/08/16 nos critérios do doc, no emulador Android. Nenhum critério de reprovação ocorreu (sem perda, sem duplicação efetiva, sem banco legível sem chave, e a falha de cifra é ruidosa). op-sqlite e WatermelonDB **não foram avaliados** (a regra os reserva para reprovação da principal).

Ressalvas que **não derrubam** a aprovação, mas o orquestrador deve levar ao Pedro: iOS não testado; aparelho real não testado; build do repositório no Windows exige caminho curto; `eas-cli` não foi executado; o build foi `release` depurável, não o dev client com Metro (detalhes em "Riscos e limitações").

## Como reproduzir

Pré-requisitos: Node 26.13.1 (fnm), pnpm 12.21.0, JDK do Android Studio, SDK em `%LOCALAPPDATA%\Android\Sdk`, AVD `CondomiFacil_API36` com `hw.ramSize=3072` (valor anterior: `2048`, em `C:\Users\pedro\.android\avd\CondomiFacil_API36.avd\config.ini`).

```powershell
cd pocs\rm-16\p4
# 1. instalar (lockfile próprio, fora do workspace)
fnm exec --using 26.13.1 -- cmd /c "pnpm install --ignore-workspace --node-linker=hoisted"
fnm exec --using 26.13.1 -- cmd /c "pnpm typecheck"          # tsc: sem erros
fnm exec --using 26.13.1 -- cmd /c "pnpm teste:servidor"     # 4 testes do servidor (node:test): 4 passam

# 2. build nativo (Windows: de um caminho curto, ver "Riscos")
.\scripts\espelho.ps1                      # copia o código para C:\p4b e instala lá
cd C:\p4b
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"; $env:ANDROID_HOME="$env:LOCALAPPDATA\Android\Sdk"
$env:PATH="$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"; $env:CI="1"
fnm exec --using 26.13.1 -- cmd /c "npx expo run:android --variant release --no-bundler"

# 3. emulador e servidor de sync
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -avd CondomiFacil_API36 -no-snapshot-load
fnm exec --using 26.13.1 -- node servidor/servidor.mjs     # porta 4545; o app acessa por 10.0.2.2

# 4. cenários (o app consulta GET /plano e roda o cenário; resultados em resultados\*.json)
.\scripts\executar.ps1 -Cenarios cifra,queda,adr014,logout,perf
# diverg e kill: passos manuais descritos abaixo (uiautomator / force-stop)
```

Arquitetura da PoC: `src/db.ts` (abre o banco com `PRAGMA key`, valida cifra, chaves por arquivo no SecureStore), `src/outbox.ts` (fila, envio em lote, divergências), `src/cenarios.ts` (cenários), `src/App.tsx` (indicador de pendências, hora da última sincronização e diálogo bloqueante), `servidor/nucleo.mjs` (sync mínimo: deduplica por `op_id`, confere ordem por `seq`, injeta queda, regra de ADR-014).

Desenho: **dois arquivos por `(usuario_id, condominio_id)`**, `fila_*.db` (outbox protegida) e `cache_*.db` (apagável), **cada um com chave própria de 256 bits** (`PRAGMA key = "x'<hex>'"`) em `expo-secure-store`. Operação = `op_id` (UUID), `tipo`, `carga`, `registrado_em` (relógio do aparelho), `seq` autoincremental. Só marca `enviada` depois da resposta do servidor.

## Critérios

| # | Critério | Resultado | Evidência |
| --- | --- | --- | --- |
| 1 | Banco ilegível sem a chave | **Aprovado** | Ver 1 abaixo |
| 2 | 10.000 operações em aparelho de 3 GB: tempo e memória | **Aprovado** (emulador) | Ver 2 |
| 3 | Queda no meio do envio, reenvio idempotente por `op_id` | **Aprovado** | Ver 3 |
| 4 | Ordem preservada | **Aprovado** | Ver 3 |
| 5 | Divergência RN-OF-04 com diálogo bloqueante | **Aprovado** | Ver 5 |
| 6 | Cache apagado no logout, fila separada e protegida | **Aprovado** | Ver 6 |
| 7 | Dev build compatível com EAS | **Aprovado só na configuração** (EAS não rodado, como combinado) | Ver 7 |
| R | Reprovação: perda/duplicação; banco legível; cifra que falha sem aviso | **Nenhuma ocorreu** | Ver 3, 1 e 1b |

### 1. Banco ilegível sem a chave

Arquivo tirado com `adb exec-out run-as ... cat files/SQLite/fila_cifra_cond1.db` e inspecionado fora do aparelho (`scripts/inspecionar_banco.py`, saída em `resultados/cifra_inspecao.txt`):

```
tamanho 45056 primeiros 16 bytes 7b4e5ee60d82d7266484a71c30628ed1
comeca com "SQLite format 3"? False
contem MARCADOR-FICTICIO-ZEBRA-42? False | contem "entrada_visitante"? False | contem "CREATE TABLE"? False
sqlite3 padrao do Python 3.50.4 -> DatabaseError file is not a database
```

No aparelho (saída do cenário `cifra` na execução com SQLCipher; o `cifra.json` dessa execução foi sobrescrito pela execução do build sem SQLCipher, então estes valores vêm do console da execução, não de arquivo): `PRAGMA cipher_version` = `4.17.0 community`; com chave errada, `Error: file is not a database`; abrindo o arquivo sem `PRAGMA key`, `Error code 26: file is not a database`. O marcador foi gravado na fila antes do `wal_checkpoint`, e não aparece nos bytes.

**1b. Cifra que falha sem aviso.** `abrir()` lança erro se (a) `PRAGMA cipher_version` não retorna valor ou (b) os 16 primeiros bytes do arquivo são o cabeçalho de SQLite plano. Provado com um segundo build com `useSQLCipher: false`: o app falhou alto, `resultados/cifra_sem_sqlcipher.json`:
`"erro": "Error: SQLCipher ausente neste build: banco NAO esta criptografado"`.

Achado: o `expo-sqlite` reaproveita a conexão aberta do mesmo arquivo. Antes de testar chave errada é preciso fechar a conexão (a primeira versão do teste "abriu" com chave errada por causa disso, o que é um falso positivo do teste, não do SQLCipher). Consequência para o código real: o logout precisa fechar os handles (ver 6).

### 2. 10.000 operações, 3 GB

Emulador com `MemTotal: 3042744 kB` (3 GB). Cenário `perf` (`resultados/perf.json`, memória amostrada a cada 2 s por `dumpsys meminfo`, `resultados/mem_perf.txt`):

| Medida | Resultado |
| --- | --- |
| Enfileirar 10.000 operações, **uma transação por registro** (como o porteiro: 1 toque = 1 operação) | 105,9 s, **10,6 ms/op** |
| Reabrir o banco com 10.000 pendentes (abrir + checar cifra + contar) | **32 ms** |
| Enviar as 10.000 em lotes de 500 (localhost via 10.0.2.2) | 40,9 s; 10.000 aplicadas, 0 pendentes |
| Servidor ao final | 10.000 únicas, 0 duplicatas, ordem crescente |
| Memória do app (PSS) | base 98–101 MB; **pico 113 MB**; RSS pico 247 MB |

Leitura: o custo é dominado pelo commit por operação (WAL + SQLCipher + emulador), 10,6 ms por toque é imperceptível. Não houve estouro de memória. O tamanho do arquivo com 10.000 operações não foi medido.

### 3 e 4. Queda no meio do envio, idempotência e ordem

**Queda simulada** (`queda.json`): 2.000 operações; o servidor aplica 250 do primeiro lote de 500 e destrói a conexão sem responder, duas vezes seguidas (a segunda vence a repetição automática do OkHttp do React Native).

```
tent1: ok=false, erro="fetch failed: java.io.IOException: unexpected end of stream on http://10.0.2.2:4545/..."
pendentes no aparelho após a queda: 2000   (nada marcado como enviado)
servidor após a queda: unicas=500, duplicatasRecebidas=250, violacoesOrdem=0
tent2 (reenvio): enviadas=2000, ok=true
final: pendentes=0; servidor unicas=2000, duplicatasRecebidas=750, violacoesOrdem=0, ordemCrescente=true
```

Fato único: 2.000 únicas para 2.000 operações, as 750 repetições foram descartadas pelo `op_id`.

**Morte do processo** (`kill_b.json`; `force-stop` com o app no meio do envio, lotes de 100 com 400 ms de atraso no servidor, 3.000 operações): o servidor já tinha 700 únicas; ao reabrir o app, `pendentes_ao_retomar=2400` (600 confirmadas), reenviou; final `unicas=3000, duplicatasRecebidas=100, violacoesOrdem=0, ordemCrescente=true, pendFinal=0`. As 100 repetições são o lote aplicado mas não confirmado quando o processo morreu: não perdeu nem duplicou.

**Ordem**: em todas as execuções `violacoesOrdem=0` e `ordemCrescente=true`: o servidor aplicou na ordem de `seq` da fila, inclusive após reenvios.

Achado: **o React Native refaz POST automaticamente quando a conexão cai** (OkHttp). Sem idempotência por `op_id` o reenvio duplicaria sem o app saber. A idempotência no servidor é obrigatória, não opcional.

### 5. Divergência RN-OF-04 (diálogo bloqueante)

Servidor marca `v-77` como cancelado pelo morador. O app registra offline 3 entradas (`v-1`, `v-77`, `v-2`) e sincroniza: resultado `divergente` para `v-77` (`diverg.json`: `divergentes=1`, as outras 2 `aplicada`; a divergente é persistida na fila).

Na tela (uiautomator no emulador, sem dependência de captura de imagem):

- Diálogo aparece: "Divergência no registro offline | Visitante v-77 foi cancelado pelo morador. Confirme por interfone. | Confirmei por interfone".
- Tecla **Voltar** (`input keyevent 4`): o diálogo **continua**, sem botão de fechar.
- Toque em "Confirmei por interfone": diálogo some; a tela volta a "Pendências: 0" e "Última sincronização: 17:49:06" (RNF-06/08). `diverg_verificar.json`: `confirmada_por="porteiro_ficticio"`, `confirmada_em` preenchido, 0 divergências abertas. Quem e quando ficam registrados.
- Nenhuma chamada ao servidor com destino ao síndico (RN-OF-05): o PoC não tem esse canal.

Limitação: o botão tem 51 px de altura no dump (nó do texto); alvo de toque de 56 dp da portaria não foi verificado, a tela é mínima.

### 6. Logout, cache apagado, fila separada e protegida

Cenário `logout` (`logout.json`): usuário fictício com cache (200 visitantes) e fila (5 operações).

```
antes:  cache=true fila=true pend=5
depois: cache=false fila=true                       (arquivo do cache apagado e a chave dele removida do SecureStore)
pendDepoisDoLogout=5                                (fila reaberta com a própria chave, 5 operações intactas)
pendOutroUsuario=0                                  (outro usuário tem outro arquivo, fila vazia)
outroUsuarioComChaveDele="Error: file is not a database"   (chave do outro usuário não abre a fila do primeiro)
```

A fila é um arquivo cifrado separado, com chave própria, **que não é apagada no logout** (ADR-003 linha 92, RN-OF-06). Pendências de desenho que a PoC não decide: retenção, quem pode ler a fila após logout (hoje a chave continua no SecureStore do aparelho) e tratamento operacional.

### 7. Dev build compatível com EAS

- `eas.json` com perfil `development` (`developmentClient: true`, `distribution: internal`, APK), `preview` e `production`; `app.json` com os plugins `expo-secure-store`, `expo-sqlite` (`useSQLCipher: true`), `expo-dev-client`, `expo-build-properties` e identificadores de pacote.
- `npx expo config` resolve os plugins; `npx expo prebuild` (o mesmo passo que o EAS Build executa) e o Gradle compilaram, com `useSQLCipher` propagado para `gradle.properties` (`expo.sqlite.useSQLCipher=true`/`false` conforme o plugin).
- `npx expo-doctor`: **20/20 checks passed, no issues detected**.
- **Não executado:** `eas-cli` (validação do `eas.json` pelo próprio EAS e qualquer build em nuvem), conforme PC-08 (sem conta, sem EAS em nuvem). A tentativa de chamar `eas config` foi bloqueada pelo sistema de permissões e não foi forçada.

## ADR-014 — observações (sem decidir)

O servidor da PoC implementa a proposta e foi exercitado pelo aparelho (`adr014.json`) e por testes unitários (`servidor/nucleo.test.mjs`, 4 passam). Resultados com `registrado_em` do aparelho:

| Caso | Observação |
| --- | --- |
| Duas conclusões do mesmo ciclo, a de horário posterior chegou antes | A de menor `registrado_em` virou efetiva ao chegar depois; a outra ficou "superada", ambas registradas. Funciona sem novo ciclo. |
| Empate exato de `registrado_em` | Com desempate por chegada, a primeira a chegar fica efetiva; a outra vai para superadas. Determinístico e testável. A regra de desempate **não está aprovada pelo produto**. |
| Relógio no futuro (+48 h) | Perde para qualquer conclusão honesta: o servidor só vê o horário, não há limite de desvio na PoC. |
| Relógio atrasado (-24 h) | **Vence** a conclusão honesta de 1 h atrás. Rejeitar horário futuro não resolve relógio atrasado (como o ADR já alerta). O servidor guarda `desvio_ms = registrado_em - recebido_em`, mas o desvio só é calculado na chegada e não prova nada sobre quando a conclusão aconteceu. |

Conclusão técnica da prova: a infraestrutura (op_id, `registrado_em`, `recebido_em`, ordem estável) sustenta a regra da RN-CH-04 e a correção em ordem inversa. **Desempate exato e política de relógio incorreto continuam condicionados e por decidir.** A PoC mediu um aparelho só: "duas pessoas" foram duas operações do mesmo aparelho (a lógica é do servidor e independe disso). Também não foram simuladas as avaliações da RN-CH-15/17 (janela, histórico), por serem regras de servidor/banco.

## Riscos e limitações

- **iOS não testado** (sem Mac). SQLCipher em iOS vem do mesmo plugin, mas nada foi provado ali.
- **Web sem SQLCipher** (limitação do `expo-sqlite`): a web, se algum dia precisar offline, não cumpre SEG-09 com essa pilha. O app de portaria e limpeza é nativo.
- **Emulador x86_64 com 3 GB, não aparelho real.** CPU do host, sem o armazenamento (eMMC/UFS) e o ARM de um aparelho de entrada; tempos de commit e de SQLCipher em aparelho real devem ser medidos antes do piloto (RNF-02). A memória (113 MB de PSS) tem folga grande.
- **Build do Windows no caminho do repositório não funciona:** o caminho `OneDrive\Documentos\CondomiFacil\pocs\rm-16\p4\node_modules\...` passa do limite de ~260 caracteres no ninja/CMake do `expo-sqlite` e do `expo-modules-core` (erro `mkdir ... No such file or directory`, "has 262 characters"). Mesmo com `node-linker=hoisted`, `subst` e junction não resolvem (o Gradle resolve o caminho real). Solução usada: `scripts/espelho.ps1` copia o código para `C:\p4b` e constrói lá. Em Linux/CI isso não ocorre; para a fase 3 convém um caminho de trabalho curto no Windows ou ativar `LongPathsEnabled` (mudança de sistema, não feita).
- **`node-linker=hoisted`** foi usado porque o layout isolado do pnpm (`node_modules/.pnpm/<nome>@<versão>_<hash>/...`) deixa o caminho ainda mais longo. Foi aplicado pela flag `--node-linker=hoisted`; o `.npmrc` da pasta tem a mesma linha, mas o npm avisa "Unknown project config" e não confirmei se o pnpm 12 o lê (a flag garante).
- **Variante do build:** foi `expo run:android --variant release --no-bundler` (JS embutido, sem Metro) com um plugin local `plugins/debuggable.js` que marca o APK como depurável **só para o `adb run-as` extrair o banco**. O **dev client com Metro (variante debug) não foi construído**, mas a camada nativa (SQLCipher, SecureStore) é a mesma e `expo-dev-client` está no build. Não exclui o fluxo debug do ADR-011; a fase 3 deve confirmá-lo no CI.
- **SDK Android:** nenhuma licença foi aceita por mim (`licenses/android-sdk-license` intacta, 09/02/2026); o Gradle baixou sozinho, sob essa licença já aceita, o Build-Tools 36.0.0 e 37.0.0 e o CMake 3.22.1. Ficaram instalados no SDK.
- **`C:\p4b`** (espelho do build) **não foi removido**: o ambiente bloqueou `Remove-Item` nessa pasta. Pode ser apagada manualmente.
- **A fila e o cache usam o mesmo `usuario_id` do aparelho**; autorização de acesso à fila após logout, retenção e recuperação seguem sem desenho (ADR-003 linha 92; plano de testes CT-OF-02).
- **Não cobertos pela PoC:** fotos de conclusão e upload (ADR-003), pull incremental por cursor, recuo exponencial e disparo ao voltar ao primeiro plano, virada do dia por rotina do servidor, relógio injetável na camada offline (o `enfileirar` aceita `agora`, mas rede/relógio não estão abstraídos), WatermelonDB e op-sqlite.
- Hex de cor solto na `App.tsx` da PoC (descartável, fora do design system).
- O servidor de sync é em memória e descartável; não é referência de contrato.

## Arquivos

`package.json`, `pnpm-lock.yaml`, `.npmrc`, `.gitignore`, `app.json`, `eas.json`, `index.js`, `tsconfig.json`, `plugins/debuggable.js`, `src/{db,outbox,cenarios}.ts`, `src/App.tsx`, `servidor/{nucleo,servidor}.mjs`, `servidor/nucleo.test.mjs`, `scripts/{executar,espelho}.ps1`, `scripts/inspecionar_banco.py`, `resultados/*.json|txt` (saídas reais). `android/`, `node_modules/`, `*.log` e `resultados/*.db` ficam fora do git.
