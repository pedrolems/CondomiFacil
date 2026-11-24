// Fachada para quem grava eventos (API e módulos). O despachante NÃO sai daqui: só o worker o importa.
export { registrarEvento, type NovoEvento } from './registrar-evento.js';
export { MANIPULADORES_DE_EVENTO, type ManipuladorDeEvento } from './manipulador.js';
