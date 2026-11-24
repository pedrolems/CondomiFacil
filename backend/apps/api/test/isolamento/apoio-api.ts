// Apoio dos testes de banco da fundação da API (RM-24): o código sob teste conecta sempre como app_user.
import { amb, BANCO_TESTE } from './apoio.js';
import { conectar, senha } from '../../db/scripts/ambiente.js';
import type { OpcoesDoBanco } from '../../src/compartilhado/tenant/index.js';

/** Opções do app_user; `debug` recebe o texto de cada consulta que realmente é enviada ao servidor. */
export function opcoesApp(aoEnviar?: (texto: string) => void, max = 6): OpcoesDoBanco {
  return {
    host: amb.host,
    port: amb.porta,
    database: BANCO_TESTE,
    username: 'app_user',
    password: senha('app_user'),
    max,
    ...(aoEnviar ? { debug: (_c: number, texto: string) => aoEnviar(texto) } : {}),
  };
}

/** Só observação: superusuário ignora RLS para contar linhas de todos os condomínios. */
export const observador = () => conectar(amb, 'postgres', BANCO_TESTE);
