import { criarServidor } from './nucleo.mjs';

criarServidor().listen(4545, '0.0.0.0', () => console.log('servidor P4 em :4545'));
