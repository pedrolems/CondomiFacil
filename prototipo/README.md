# Protótipo navegável — CondomiFacil

Protótipo em HTML, CSS e JavaScript puro, feito a partir de `docs/02-design/01-design-system.md` (tokens, componentes, padrões de tela) e `docs/02-design/02-user-flows.md` (fluxos e mensagens de erro).

## Como abrir

Abra `index.html` no navegador (duplo clique funciona). Se preferir um servidor local:

```bash
cd prototipo
python -m http.server 8765
# http://localhost:8765
```

Precisa de internet só para a fonte Inter e os ícones Lucide (CDN).

## Estrutura

| Arquivo | Conteúdo |
| --- | --- |
| `css/tokens.css` | Tokens do Design System (seções 4 a 9), temas claro e escuro |
| `css/components.css` | Componentes da seção 10 (botão, campo, selo, cartão, faixa, folha, diálogo, calendário, score…) |
| `css/app.css` | Moldura do protótipo: hub, painel lateral, aparelho e painel web |
| `js/core.js` | Rotas (`#/perfil/tela/arg`), layout, componentes e camadas |
| `js/data.js` | Dados fictícios em memória |
| `js/telas/acesso.js` | Fluxos 3.1 a 3.3: primeiro acesso, login, recuperação, termos, onboarding |
| `js/telas/morador.js` | Morador (e telas que o síndico reaproveita) e proprietário não residente |
| `js/telas/sindico.js` | Aba Gestão do síndico |
| `js/telas/funcionarios.js` | Portaria, limpeza e manutenção |
| `js/telas/admin.js` | Painel web da administradora |

## Perfis

- **Acesso e conta:** primeiro acesso (código: `123456`), login (senha `errada` ou `desativada` simula erros), novo aceite.
- **Morador:** Início · Reservas · Visitantes · Chamados · Menu.
- **Síndico:** Início · Gestão · Reservas · Visitantes · Menu.
- **Administradora:** painel web com navegação lateral.
- **Portaria:** Visitantes · Encomendas · Áreas · Menu (sem internet, divergência e modo treinamento).
- **Limpeza:** Chamados · Áreas · Menu.
- **Manutenção:** *proposta*; o PRD não tem esse perfil (hoje o síndico acompanha empresas cadastradas).
- **Proprietário não residente:** entra direto em Cobranças.

O painel à esquerda lista todas as telas do perfil, troca o tema e simula situações (score baixo, unidade em atraso, termos novos, sem internet).
