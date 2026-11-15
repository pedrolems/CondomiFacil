# Configuração de ferramentas

Único pacote reservado para presets de TypeScript, ESLint e Prettier. Decisão de Pedro em 14/11/2026; ver [ADR-015](../../docs/03-arquitetura/adr/015-workspaces-e-contratos-compartilhados.md).

Compartilhar regras comuns e oferecer presets específicos para Node/NestJS e Expo/React Native; cada consumidor mantém suas opções de plataforma. Consumidores futuros declaram `@condomifacil/config` em `devDependencies` com `workspace:*`. Dependências externas de ferramentas recebem versões compatíveis fixadas na implementação.

Não contém variáveis de ambiente, URLs de serviços, credenciais ou parâmetros de negócio. A leitura/validação de ambiente do backend continua em `backend/apps/api/src/compartilhado/config/`; a configuração pública Expo permanece no app. Não existem presets, versões ou scripts executáveis nesta preparação.
