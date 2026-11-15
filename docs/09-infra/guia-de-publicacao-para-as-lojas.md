# Guia de publicação para as lojas — CondomiFacil

**Data:** 14/11/2026. **Responsável pelo produto e pelas aprovações:** Pedro Lemos.

**Estado:** guia para a implementação futura. Hoje existem documentação e protótipo HTML; não há aplicativo nativo pronto, contas verificadas, certificados gerados ou publicação realizada por este documento. Os textos abaixo são modelos para revisão antes do lançamento. Publicar exige um binário funcional, backend disponível e recursos efetivamente implementados.

## 1. Escopo, fontes e sequência

Este guia cobre Google Play para Android e App Store para iOS, com interface em português do Brasil. A versão web da Vercel tem publicação própria e não substitui a distribuição nativa. A stack planejada é React Native, TypeScript e Expo, com API NestJS. EAS Build, EAS Submit e OTA continuam propostas do ADR-011; o guia não o aceita automaticamente.

| Documento do projeto | Aplicação neste guia |
| --- | --- |
| [PRD](../01-produto/02-prd.md) | Escopo do MVP, perfis, plataformas, segurança e requisitos não funcionais |
| [Frontend mobile](../06-frontend/frontend.md), seções 5 a 9 | Offline limitado, push, links, permissões, arquivos e pendências nativas |
| [ADR-011](../03-arquitetura/adr/011-ambientes-branches-eas-ota.md) | Builds por ambiente, distribuição e atualização compatível |
| [Infra e DevOps](infra-e-devops.md) | Ambientes, hospedagem, segredos, CI/CD, recuperação e gate do piloto |
| [Segurança](../07-seguranca/seguranca.md) e [LGPD](../07-seguranca/lgpd.md) | Dados coletados, direitos, exclusão, retenção, contas e fornecedores |
| [Plano de testes](../08-qualidade/01-plano-de-testes.md) | Critérios e evidências para autorizar uma versão |

Sequência recomendada: definir titularidade → criar e verificar contas → definir identificadores → preparar credenciais e binários → testar → preencher páginas e declarações → fornecer acesso à revisão → submeter → liberar com aprovação → acompanhar e atualizar.

As regras e taxas oficiais vinculadas neste guia foram consultadas em **14/11/2026**. Conferir novamente no momento da publicação: nomes dos menus, SDKs exigidos, formulários e políticas mudam. Nenhum prazo de aprovação das lojas é garantido.

## 2. Contas, titularidade e custos

### 2.1 Escolha do titular

**Recomendação:** usar contas de organização quando houver uma pessoa jurídica elegível que seja a titular do produto. Isso facilita continuidade, delegação e identificação comercial. A recomendação não define CNPJ, razão social ou tipo societário. Pedro precisa confirmar a titularidade antes de pagar inscrições ou registrar identificadores definitivos.

| Opção | Google Play | Apple |
| --- | --- | --- |
| Pessoa física | Identidade e contatos do titular; contas pessoais novas têm exigências adicionais de teste e dispositivo | O nome civil do titular aparece como vendedor; não usar nome fantasia no lugar do nome legal |
| Organização | Informações legais, representante e verificações; preparar D-U-N-S e correspondência dos dados cadastrais | Exige entidade elegível, D-U-N-S, autoridade para aceitar contratos, e-mail de trabalho e site funcional; o vendedor é a entidade legal |

A Apple distingue organização de empresário individual: ter CNPJ ou nome comercial não garante elegibilidade como organização. Confirmar o enquadramento no [cadastro Apple](https://developer.apple.com/help/account/membership/program-enrollment). Na Play, conferir a documentação e os dados públicos exigidos na [verificação da conta](https://support.google.com/googleplay/android-developer/answer/13634888?hl=pt-BR).

| Item | Referência consultada | Providência |
| --- | --- | --- |
| Google Play Console | US$ 25, inscrição única | Confirmar moeda, forma de pagamento e encargos no cadastro; [fonte Google](https://support.google.com/googleplay/android-developer/answer/6112435?hl=pt-BR) |
| Apple Developer Program | US$ 99 por ano, ou moeda local quando disponível | Prever renovação; não confundir com Enterprise; [fonte Apple](https://developer.apple.com/programs/whats-included/) |
| Expo/EAS, hospedagem, domínio e aparelhos | Dependem do plano e da operação | Estimar no orçamento RNF-18 antes de contratar; plano gratuito não garante capacidade ou disponibilidade |

As taxas acima são de inscrição, distintas de possíveis comissões, tributos e custos de pagamentos. Este documento não contrata serviços.

### 2.2 Preparar as contas

1. Pedro confirma pessoa física ou entidade, nome público, contatos, país e responsáveis. Separar contato privado de recuperação e contato público de suporte.
2. Criar conta Google e Apple Account sob controle do titular; ativar autenticação de dois fatores e guardar recuperação no cofre do produto. Evitar conta de funcionário ou prestador como única proprietária.
3. Inscrever-se no Play Console, aceitar contratos, pagar a taxa e concluir identidade/contatos e demais tarefas de verificação. Em conta pessoal nova, concluir também a [verificação de aparelho Android real](https://support.google.com/googleplay/android-developer/answer/14316361?hl=pt-BR) pelo aplicativo Play Console.
4. Inscrever-se no Apple Developer Program, enviar documentação e pagar após a validação aplicável. Acessar App Store Connect e resolver contratos pendentes; contratos bancários/fiscais dependem do modelo de venda, não devem ser preenchidos com dados inventados.
5. Criar a organização/projeto Expo se EAS for aprovado, adicionar equipe por convite e conceder somente as permissões necessárias nos três serviços. Não compartilhar senha do proprietário.
6. Registrar em inventário restrito titular, IDs de conta/equipe, responsáveis, contatos, renovação e recuperação. Guardar documentos de identidade, chaves e comprovantes fora do Git.

## 3. Identificadores, certificados e credenciais

### 3.1 Identidade do aplicativo

Antes do primeiro envio, definir `android.package`, `ios.bundleIdentifier`, nome público e identificador do projeto Expo. Os identificadores usam convenção de domínio invertido controlado pelo produto; ainda não há valor aprovado. Não copiar um identificador de exemplo para produção. Mudá-los depois pode representar outro aplicativo e comprometer atualizações, links e push.

Separar os identificadores dos aplicativos de desenvolvimento/teste quando necessário para convivência no mesmo aparelho. Registrar também Android App Links, iOS Universal Links, domínio associado, capacidades e certificados correspondentes. Publicação não concede acesso a um condomínio: o backend continua validando perfil, unidade, vínculo e mandato.

### 3.2 Android: duas chaves com funções diferentes

| Credencial | Função | Guarda e recuperação |
| --- | --- | --- |
| Chave de upload e keystore | Assina o AAB enviado à Play | EAS pode gerenciar, se autorizado; manter cópia cifrada, alias e senhas no cofre. Perda/comprometimento exige procedimento de redefinição da chave de upload |
| Chave de assinatura do aplicativo | Assina os APKs entregues aos aparelhos pelo Play App Signing | Gerenciada pelo Google na configuração recomendada para novo app; não é a mesma função da chave de upload |
| Certificados públicos e impressões digitais | Identificam as assinaturas em integrações e associação de links | Registrar SHA-256 da assinatura de distribuição e das variantes relevantes; certificado público não inclui chave privada |
| Conta de serviço para submissão automatizada | Autoriza API de publicação | Opcional; JSON é segredo, com acesso mínimo ao aplicativo. Não confundir com assinatura do app ou credenciais FCM |

Passo a passo: gerar ou importar keystore pelo gerenciador de credenciais aprovado → exportar cópia segura → gerar AAB assinado → configurar Play App Signing na primeira release → conferir certificados mostrados no console → registrar as impressões corretas nas integrações → testar instalação pela Play. Uma instalação assinada localmente pode ter impressão diferente da distribuída pela loja. Referência: [assinatura Android](https://developer.android.com/studio/publish/app-signing).

### 3.3 iOS: assinatura, perfil e push

| Item | Função e cuidado |
| --- | --- |
| App ID / Bundle ID | Identidade registrada no Apple Developer, com capacidades realmente usadas |
| Certificado Apple Distribution e chave privada | Assinam o binário de distribuição; guardar o conjunto recuperável, não só o certificado público |
| Provisioning profile de App Store | Associa equipe, app, certificado e capacidades para distribuição à loja/TestFlight; perfil ad hoc ou de simulador não o substitui |
| Chave APNs | Autentica envio de push Apple quando configurado; guardar arquivo privado, Key ID e Team ID. Não assina o aplicativo |
| Chave de API App Store Connect | Autoriza submissão/automação; segredo separado da chave APNs e da assinatura |

Passo a passo: registrar Bundle ID → habilitar capacidades necessárias, como push e links associados → criar/selecionar certificado e perfil corretos → configurar credencial APNs no fluxo de notificações → gerar IPA de loja → conferir equipe, Bundle ID e entitlements → instalar pelo TestFlight e testar push/links em aparelho físico. O EAS pode criar ou gerenciar credenciais mediante acesso autorizado; manter inventário e recuperação sob controle do produto. Referência: [credenciais no Expo](https://docs.expo.dev/app-signing/app-credentials/).

Não revogar certificados ou chaves sem avaliar outros aplicativos e serviços da equipe. Acompanhar validade de certificados/perfis e renovação da conta. Arquivos `.jks`, `.keystore`, `.p12`, `.p8`, `credentials.json` com segredos e JSON de conta de serviço não entram no Git, no app, em capturas ou em logs.

## 4. Preparação técnica e de conteúdo

### 4.1 Builds e ambientes

1. Implementar e validar os módulos da versão, inclusive backend NestJS, isolamento, exclusão de conta e atendimento. O protótipo e o Expo Go não comprovam assinatura, módulos nativos, offline cifrado ou push.
2. Fixar versões de Expo SDK, dependências e ferramentas. Conferir no console da Play o `targetSdkVersion` e na Apple o Xcode/SDK mínimo aceito; esses alvos não são a versão mínima de Android/iOS suportada pelo PRD. Referências: [requisitos de API Google](https://support.google.com/googleplay/android-developer/answer/11926878?hl=pt-BR) e [requisitos de submissão Apple](https://developer.apple.com/news/upcoming-requirements/).
3. Configurar ícones, splash, orientação, idioma, permissões nativas, links e configuração por ambiente. `EXPO_PUBLIC_*` é público: não incluir chaves de Asaas, banco, Storage, Resend ou publicação.
4. Definir `version`, `android.versionCode` e `ios.buildNumber`. Cada novo binário enviado precisa de numeração aceita pela loja; não reutilizar código de versão Android já usado.
5. Se EAS for aprovado, configurar o projeto e perfis com distribuição apropriada. O perfil `preview` pode produzir APK/ad hoc para instalação direta; **Play exige AAB de loja e TestFlight exige IPA de distribuição App Store**. Criar configuração de teste de loja com API de staging, ou ajustar o perfil de forma explícita, sem trocar silenciosamente o ambiente de produção.
6. Gerar, identificar e guardar artefato, commit, versão, ambiente, hash e resultado dos testes. Escolher o build pelo identificador, evitando envio acidental de um build antigo ou de ambiente errado.

Comandos orientativos para quando houver aplicativo e CLI EAS instalada em versão fixada; não são executados por este guia:

```text
eas login
eas build:configure
eas credentials --platform android
eas credentials --platform ios
eas build --platform android --profile production
eas build --platform ios --profile production
eas submit --platform android --id <ID_DO_BUILD_ANDROID>
eas submit --platform ios --id <ID_DO_BUILD_IOS>
```

O perfil `production` precisa ter sido configurado e aprovado antes desses comandos. Para testes contra staging, usar o perfil de distribuição de loja de teste previamente definido. A [preparação de build Expo](https://docs.expo.dev/build/setup/) orienta a configuração. Submissão envia o binário ao console, sem substituir formulários, revisão e autorização de liberação.

### 4.2 Privacidade, permissões e exclusão

| Área | O que preparar antes da submissão |
| --- | --- |
| Política pública | URL HTTPS real, acessível sem login, identificando titular, contato e práticas efetivas; revisar a minuta LGPD antes de publicar |
| Google Data safety | Inventário de dados enviados para fora do aparelho, finalidades, compartilhamento, proteção e exclusão, incluindo SDKs; não marcar “nenhum dado coletado” para app autenticado com backend sem verificar o fluxo |
| Apple App Privacy | Tipos de dados, finalidades, vínculo com identidade e eventual rastreamento, considerando SDKs e serviços; questionário separado da política textual |
| Manifestos Apple | Conferir `PrivacyInfo.xcprivacy`, razões de APIs cobertas e exigências de manifestos/assinaturas de SDKs incorporados |
| Permissões nativas | Só as necessárias; textos de finalidade em pt-BR e solicitação no contexto. Remover áudio, localização, contatos e acesso amplo a fotos se não houver função que justifique |
| Exclusão | Caminho fácil em Privacidade e dados para iniciar exclusão da conta global, distinto de sair do app ou encerrar vínculo com unidade; informar tratamento de dados cuja retenção seja legalmente necessária |

As declarações devem refletir o binário e o backend da release, não apenas o planejamento. Conferir [Data safety Google](https://support.google.com/googleplay/android-developer/answer/10787469?hl=pt-BR), [App Privacy Apple](https://developer.apple.com/app-store/app-privacy-details/) e [exigências de SDKs Apple](https://developer.apple.com/support/third-party-SDK-requirements/).

Para apps com criação de conta, a Google exige solicitação de exclusão no app e recurso web para solicitar exclusão da conta e dados; a Apple exige iniciar a exclusão dentro do app. Não oferecer apenas desativação ou exigir contato telefônico/e-mail como único fluxo na Apple. O caminho do produto precisa ser implementado e ensaiado, respeitando retenção justificada e reaplicação após backup. Referências: [exclusão Google](https://support.google.com/googleplay/android-developer/answer/13327111?hl=pt-BR) e [exclusão Apple](https://developer.apple.com/support/offering-account-deletion-in-your-app/).

### 4.3 Pagamentos, conteúdo e acesso à revisão

**Avaliação inicial, a confirmar no fluxo implementado:** taxa condominial e reserva de espaço físico correspondem a obrigações/serviços fora do consumo digital do aplicativo. A cobrança por Asaas precisa ser explicada à revisão. Isso não libera automaticamente venda de assinatura ou recursos digitais do CondomiFacil por pagamento externo. Caso a release ofereça compra/upgrade do plano SaaS dentro do app, revisar especificamente as regras antes de implementar ou submeter. Referências: [política de pagamentos Google](https://support.google.com/googleplay/android-developer/answer/9858738?hl=pt-BR) e [diretrizes Apple, seção 3.1](https://developer.apple.com/app-store/review/guidelines/).

Preencher classificação etária, público-alvo, publicidade, direitos de conteúdo e declarações financeiras aplicáveis conforme o produto real. Não escolher classificação infantil nem declarar produto financeiro regulado só pela presença de cobrança. Comunicados, comentários, fotos e reclamações exigem conferir regras de conteúdo gerado por usuário e mecanismos de tratamento de abuso; lacunas devem ser resolvidas antes da submissão, sem inventar função já implementada.

Preparar contas de demonstração para todos os perfis móveis e estados necessários à revisão. Não fornecer conta de morador, funcionário ou administrador real. Os revisores precisam conseguir entrar sem depender de convite manual ou de código que expire antes da análise; resolver isso com contas de teste estáveis e instruções completas, sem criar bypass geral de autenticação. Registrar credenciais somente nos campos protegidos da loja, fora deste documento.

Dev e staging continuam com dados fictícios, Asaas sandbox e e-mail falso. Para o binário de produção, definir e testar contexto demonstrativo isolado, somente com dados fictícios e efeitos externos controlados, acessível ao revisor no mesmo produto. Esse mecanismo ainda precisa de desenho e validação; não altera credenciais de pagamento de todo o ambiente, não expõe dados reais e não esconde comportamento da loja. Se ele não existir, a submissão fica bloqueada. Backend e contas devem permanecer disponíveis durante revisão e eventual reanálise; Render gratuito que dorme não comprova essa disponibilidade. Referência: [acesso para revisão Apple](https://developer.apple.com/help/app-review/before-submitting-for-review/complete-review/).

## 5. Passo a passo — Google Play

1. **Verificar a conta:** concluir as tarefas do Play Console e confirmar titularidade, contatos e dispositivo quando aplicável.
2. **Criar o aplicativo:** selecionar Criar app; preencher nome, português do Brasil, tipo aplicativo e preço de download. Confirmar com Pedro se será gratuito para baixar; isso é distinto de taxas do condomínio e do plano contratado. Aceitar as declarações apresentadas somente após conferência.
3. **Completar a ficha:** inserir nome, descrição curta/completa, categoria coerente, suporte, política de privacidade e materiais visuais. Usar os modelos da seção 7 apenas após revisar recursos disponíveis.
4. **Completar Conteúdo do app:** informar acesso à revisão, anúncios, público-alvo, classificação, Data safety, exclusão e demais declarações exibidas. Não deixar caminhos de revisão sem permissão ou dependentes de dados reais. Ver [preparação para revisão Google](https://support.google.com/googleplay/android-developer/answer/9859455?hl=pt-BR).
5. **Criar teste interno:** abrir a faixa interna, configurar Play App Signing, enviar AAB de distribuição de loja com ambiente de teste correto, preencher notas e convidar testadores. A instalação deve ocorrer pelo link da faixa, com conta Google incluída nos testes.
6. **Testar o binário instalado:** login e recuperação, permissões negadas, push, links, câmera/anexos, portaria/limpeza offline, sincronização, atualização sobre versão anterior e exclusão. Usar plano de testes e corrigir relatórios de pré-lançamento relevantes.
7. **Cumprir teste fechado, se exigido:** contas pessoais criadas após **13/11/2023** precisam de pelo menos **12 testadores inscritos continuamente por 14 dias** antes de solicitar acesso à produção. Teste interno não substitui esse requisito; cumprir o mínimo não aprova automaticamente a publicação. Registrar feedback e responder às perguntas de prontidão. [Regra Google](https://support.google.com/googleplay/android-developer/answer/14151465?hl=pt-BR).
8. **Preparar a release de produção:** após acesso autorizado, selecionar o AAB correto para produção, conferir versão, API, países/regiões, conteúdo e pendências. Se o build de teste apontava para staging, gerar e validar o candidato de produção.
9. **Revisar com Pedro e enviar:** apresentar build, textos, capturas, declarações e alcance; obter autorização de submissão/liberação. Quando disponível e adequado, usar publicação gerenciada para separar aprovação da loja e momento de entrada no ar.
10. **Acompanhar:** responder às exigências, corrigir a causa de rejeição e reenviar. Após liberação autorizada, conferir a página e instalação reais, monitorar Android vitals, falhas, backend e suporte. Atualizações podem usar liberação gradual conforme opções da faixa; não presumir esse recurso para o primeiro lançamento.

O primeiro upload manual é um caminho didático, **não uma obrigação permanente do EAS**: a documentação atual permite primeira release pelo EAS Submit. A automação futura exige conta de serviço e permissões verificadas. Referências: [envio manual Expo](https://docs.expo.dev/submit/android-manual/) e [envio Android Expo](https://docs.expo.dev/submit/android/).

## 6. Passo a passo — App Store

1. **Verificar a equipe:** Apple Developer Program ativo, contratos em ordem e acessos corretos ao App Store Connect.
2. **Registrar identidade e capacidades:** criar Bundle ID e preparar assinatura/perfil conforme seção 3. Não ativar capacidades sem necessidade documentada.
3. **Criar o registro do app:** em Apps, adicionar novo app iOS; preencher nome, idioma principal, Bundle ID e SKU interno único, definido pelo titular. Categoria, direitos e disponibilidade serão conferidos com a release.
4. **Gerar e enviar IPA:** usar build de distribuição App Store compatível com as exigências atuais; enviar pelo EAS Submit aprovado. No Windows, o serviço de build/submissão em nuvem evita depender de Xcode local; um fluxo local alternativo exige ferramentas Apple adequadas. Esperar processamento e resolver erros. [Envio iOS Expo](https://docs.expo.dev/submit/ios/).
5. **Tratar criptografia/exportação:** responder às perguntas com base em TLS, armazenamento local cifrado e bibliotecas efetivamente usadas, incluindo a PoC de SQLCipher se adotada. Não marcar isenção ou definir `usesNonExemptEncryption` por cópia de exemplo; obter enquadramento/documentação quando necessário.
6. **Distribuir pelo TestFlight:** completar informação beta e contato de feedback; criar grupos internos e externos. Convites externos podem exigir Beta App Review; builds de teste duram até **90 dias**. TestFlight não equivale a lançamento público. [Guia Apple](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/).
7. **Validar em aparelhos físicos:** testar o mesmo conjunto crítico da Play, além de entitlements, notificações e links iOS. Não usar somente simulador. Testadores externos recebem dados fictícios até revisão do piloto com dados reais.
8. **Completar a versão:** selecionar build processado, descrição, subtítulo, palavras-chave, screenshots, suporte, privacidade, App Privacy, classificação etária, conteúdo e disponibilidade. Informar requisitos adicionais se publicar fora do Brasil; não selecionar todos os países por padrão.
9. **Preencher App Review Information:** contato operacional, credenciais estáveis e instruções por perfil, contexto de demonstração, caminhos sensíveis e explicação de pagamentos. Rever a exclusão de conta e URLs sem login.
10. **Submeter com aprovação:** Pedro revisa build, conteúdo, declarações e alcance; selecionar liberação manual para controlar o momento após aprovação e enviar para App Review. Responder às solicitações no App Store Connect sem esconder funcionalidades ou alterar o comportamento só durante a análise.
11. **Liberar e acompanhar:** após aprovação e autorização de Pedro, liberar; conferir a página, instalação, login e serviços, e acompanhar métricas de falhas e suporte. Em atualizações, avaliar liberação em fases e interrupção do avanço se houver falha.

## 7. Textos e materiais para as lojas

### 7.1 Como usar os modelos

Os modelos descrevem funcionalidades planejadas do MVP. **Antes de copiar, remover qualquer recurso que não esteja implementado, testado e disponível na release**, e ajustar os textos ao público e aos perfis realmente atendidos. Não publicar placeholders nem telas do protótipo como se fossem capturas do app nativo. Não prometer anonimato absoluto, aprovação jurídica, ausência de falhas ou funcionamento offline de todo o aplicativo.

| Campo | Limite consultado | Modelo |
| --- | --- | --- |
| Nome nas duas lojas | 30 caracteres | `CondomiFacil` |
| Descrição curta Google | 80 caracteres | `Reservas, visitantes e comunicados para a rotina do seu condomínio.` |
| Subtítulo Apple | 30 caracteres | `A rotina do seu condomínio` |
| Texto promocional Apple | 170 caracteres | `Acompanhe comunicados, organize visitas e consulte reservas em um só lugar. Recursos disponíveis conforme seu perfil e o condomínio cadastrado.` |
| Palavras-chave Apple | Adotar até 100 bytes, conforme referência técnica | `condominio,morador,sindico,portaria,reserva,visitante,encomenda,comunicado` |
| Descrição completa | 4.000 caracteres por loja | Texto abaixo |

Limites: [ficha Google](https://support.google.com/googleplay/android-developer/answer/9859152?hl=pt-BR), [informações do app Apple](https://developer.apple.com/help/app-store-connect/reference/app-information/app-information) e [campos de versão Apple](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information/). A Apple menciona 100 caracteres na orientação comercial e 100 bytes na referência técnica de palavras-chave; o modelo usa somente ASCII e atende a ambos. Recontar após qualquer edição.

**Descrição completa proposta para ambas as lojas:**

```text
O CondomiFacil reúne ferramentas para a rotina de condomínios brasileiros e aproxima moradores, portaria e gestão.

Conforme seu perfil e os recursos disponíveis no condomínio, você pode:

• Consultar comunicados e acompanhar informações do condomínio.
• Organizar visitas e consultar autorizações de entrada.
• Consultar áreas comuns e acompanhar suas reservas.
• Acompanhar encomendas e entregas esperadas.
• Abrir chamados e acompanhar o atendimento.
• Consultar cobranças sob sua responsabilidade.
• Acompanhar assembleias e participar de votações quando habilitado.

Cada pessoa acessa as funções autorizadas para seu vínculo com o condomínio. O acesso depende de cadastro e habilitação pela gestão responsável.

O aplicativo exige internet para a maior parte das funções. Recursos offline específicos da portaria e da limpeza dependem de preparação prévia e sincronização posterior; pagamentos e votações exigem conexão.

O download não substitui a contratação do serviço pelo condomínio. Taxas condominiais e valores de reservas são apresentados nos respectivos fluxos, quando aplicáveis.

Precisa de ajuda para acessar? Procure a gestão do seu condomínio ou utilize o canal de suporte informado nesta página.
```

### 7.2 Novidades e instruções de teste

Google: manter notas da release dentro do limite exibido no console, atualmente até 500 caracteres por idioma, conforme [preparação da release](https://support.google.com/googleplay/android-developer/answer/9859348?hl=pt-BR). Apple: o campo Novidades tem até 4.000 caracteres e é exigido para atualizações, sem aparecer como campo obrigatório da primeira versão. Não anunciar correção não realizada.

**Modelo Google para primeira versão, após confirmar o escopo:**

```text
Primeira versão do CondomiFacil. Acesse os recursos habilitados para seu perfil e acompanhe a rotina do seu condomínio.
```

**Modelo de atualização para ambas, preenchido antes de usar:**

```text
Nesta versão:
• [MELHORIA DISPONÍVEL E CAMINHO PARA ENCONTRÁ-LA]
• [PROBLEMA CORRIGIDO E EFEITO PARA A PESSOA]
```

**Modelo TestFlight — O que testar:**

```text
Use somente as contas e os dados fictícios fornecidos pela equipe. Teste login, comunicados, reservas, permissões de câmera e notificações. Nos perfis de portaria e limpeza, teste também as operações offline habilitadas e a sincronização ao reconectar. Não use dados pessoais reais nem faça pagamentos reais. Envie feedback pelo TestFlight, informando tela, passos e resultado esperado, sem anexar senhas ou dados de terceiros.
```

### 7.3 Notas privadas para revisão

Preencher os campos em colchetes no console, nunca com segredos neste Git. Oferecer somente perfis móveis existentes na release; painéis exclusivos da web não viram recurso mobile por este texto. A Google pede instruções de acesso em inglês quando necessário à sua revisão; o bloco em inglês é material para o revisor e não muda o idioma do aplicativo.

```text
CondomiFacil is a condominium management app for Brazil. The app interface is in Brazilian Portuguese. Access depends on the user's role and condominium membership.

Review environment: [EXPLAIN THE ISOLATED DEMONSTRATION CONTEXT ACCESSIBLE IN THIS BUILD]. All demonstration residents, visitors, units and records are fictitious. The backend remains available during review.

Sign in using the credentials entered in the store's protected access fields. Additional mobile roles: [ROLE AND CREDENTIALS IN THE PROTECTED CONSOLE ONLY]. Select condominium [DEMO NAME] and unit [DEMO UNIT], where applicable.

Steps to review:
1. [EXACT LOGIN STEPS, INCLUDING ANY ADDITIONAL REQUIREMENT]
2. [PATH TO EACH RESTRICTED FEATURE AND REQUIRED ROLE]
3. [PATH TO ACCOUNT DELETION AND SAFE DEMO ACCOUNT TO USE]
4. [HOW TO REVIEW RESERVATIONS AND PAYMENTS WITHOUT REAL TRANSACTIONS]

Payment context: [DESCRIBE ONLY THE ACTUAL FLOW]. Condominium dues and charges for physical common-area reservations are distinct from the purchase of digital app features. Explain any SaaS purchase flow separately if present.

This build was tested on [DEVICE MODELS AND OS VERSIONS]. Review contact: [NAME, EMAIL AND PHONE IN THE CONSOLE].
```

O correspondente em português deve informar: finalidade do app, vínculo/perfil, condomínio fictício, credenciais nos campos protegidos, passos exatos de login e das funções restritas, exclusão, pagamentos de demonstração, aparelhos testados e contato. Não declarar ausência de OTP, publicidade, rastreamento ou compras sem comprovar no build. Referências: [acesso Google](https://support.google.com/googleplay/android-developer/answer/9859455?hl=en) e [informação de revisão Apple](https://developer.apple.com/help/app-review/before-submitting-for-review/complete-review/).

### 7.4 URLs, permissões e imagens

| Material | Preparação |
| --- | --- |
| Política de privacidade | `[URL_HTTPS_DA_POLITICA_PUBLICADA]`; substituir por página final acessível sem conta |
| Suporte | `[URL_HTTPS_DE_SUPORTE]` e contato operacional real; não deixar site vazio |
| Exclusão web | `[URL_HTTPS_PARA_SOLICITAR_EXCLUSAO]`; identificar app/titular e explicar dados excluídos, retenções justificadas e procedimento |
| Marketing, se usado | `[URL_HTTPS_DO_PRODUTO]`; opcional conforme loja, sem criar site neste pedido |
| Copyright Apple | `[ANO] [TITULAR DOS DIREITOS]`; confirmar titularidade, sem inventar razão social |
| Finalidade da câmera | `Usamos a câmera para anexar uma foto ao registro que você está preenchendo.` |
| Finalidade de fotos, se necessária | `Usamos as fotos que você escolher para anexá-las ao registro.`; preferir seletor do sistema e não pedir biblioteca inteira sem necessidade |

Os textos nativos finais dependem das permissões realmente declaradas e das APIs de cada sistema; configuração nativa não substitui explicação contextual. Não adicionar microfone para exibir Pix ou anexar apenas fotografia.

Preparar ícone Android de loja 512 × 512 e imagem de destaque 1024 × 500; capturas reais com dados fictícios, no mínimo duas para a ficha Play, respeitando formatos e tamanhos de [materiais Google](https://support.google.com/googleplay/android-developer/answer/9866151?hl=pt-BR). Para iOS, usar ícone e capturas correspondentes aos dispositivos efetivamente suportados, seguindo as [especificações Apple](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/); suporte a iPad implica verificar seus materiais e layout.

Roteiro sugerido para capturas: início/comunicados → reserva → visitantes → chamado → encomendas. Manter perfis corretos e apresentar a experiência real. Não incluir nomes/documentos reais, reclamações privadas, votos individuais, valores bancários ou credenciais. Produzir imagens nas resoluções exigidas; este pedido entrega o guia e textos, não os arquivos gráficos.

## 8. Aprovação, atualização e operação

Antes de submeter, apresentar a Pedro a versão exata, plataforma, commit/artefato, testes, capturas, textos, declarações de privacidade, credenciais de revisão em canal seguro, países e forma de liberação. Aprovação de commit/branch não equivale a aprovação de submissão ou lançamento; preservar a regra de Git do projeto.

| Verificação de saída | Evidência necessária |
| --- | --- |
| Aplicativo funcional | Fluxos da release testados em Android/iOS reais, sem placeholder ou tela vazia |
| Backend e dados | Disponibilidade durante revisão e operação; revisão ADR-004 antes de usuários reais; dados fictícios nos testes |
| Credenciais | Titularidade, assinatura, recuperação e rotação conferidas; nenhum segredo no bundle ou Git |
| Privacidade | URLs finais, inventário de SDKs, questionários coerentes e exclusão funcionando |
| Conteúdo | Textos/capturas correspondem à versão; classificação e declarações preenchidas |
| Revisão | Acesso estável por perfil e pagamento demonstrável sem efeitos reais indevidos |
| Operação | Suporte, monitoramento, procedimento de incidente e retorno aprovados |

Após o lançamento, manter API compatível com versões antigas, acompanhar falhas, notificações, sincronização e avaliações. Para corrigir, subir novo binário com numeração adequada e notas verificáveis. Interromper rollout reduz exposição futura, mas não remove a versão já instalada; retorno pode exigir novo build e ações no backend.

OTA, se aprovado no ADR-011, respeita canal, ambiente e `runtimeVersion`, e não serve para contornar revisão nem para trocar código nativo. Mudanças de SDK, permissões, capacidades e módulos nativos exigem novo binário. Atualizar declarações e páginas quando o tratamento de dados ou os recursos mudarem.

Pendências antes da execução: titularidade/entidade, contas e custos, identificadores e domínio, aceitação do fluxo EAS, infraestrutura do piloto, desenho do acesso demonstrativo, privacidade/pareceres pendentes e escopo real da primeira release. Este documento cria orientação de publicação, sem alterar regras de produto, aceitar ADRs, abrir contas ou enviar aplicativos às lojas.
