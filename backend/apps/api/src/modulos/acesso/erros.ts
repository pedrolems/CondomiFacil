import { ErroDeAplicacao } from '../../compartilhado/erros/index.js';

export class AceiteVersaoDesatualizada extends ErroDeAplicacao {
  constructor() {
    super(
      422,
      'ACEITE_VERSAO_DESATUALIZADA',
      'Este documento foi atualizado. Leia a nova versão para aceitar.',
      [{ campo: 'documento_versao_ids', mensagem: 'Versão não vigente.' }],
    );
  }
}
