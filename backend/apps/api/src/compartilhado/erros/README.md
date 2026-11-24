# apps/api/src/compartilhado/erros

Hierarquia de erros e filtro global conforme contrato da API. Não importar módulos de domínio.

Implementado (RM-24): hierarquia `ErroDeAplicacao` com os códigos transversais do guia §8 e `FiltroDeErros` global (`{ codigo, mensagem, detalhes?, request_id }`; 500 sem detalhe interno).
