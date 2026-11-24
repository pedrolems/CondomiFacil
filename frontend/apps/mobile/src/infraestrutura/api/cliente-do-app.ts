import { Platform } from 'react-native';
import { armazenamentoDeRefresh } from '../seguranca/armazenamento-de-refresh';
import { identificadorDaInstalacao } from '../seguranca/identificador-da-instalacao';
import { criarTrava } from '../seguranca/trava';
import { ClienteSessao } from './cliente-sessao';

let cliente: ClienteSessao | undefined;

/** Cliente único do processo: a renovação single-flight só vale se todos usam o mesmo. */
export function obterClienteDoApp(): ClienteSessao {
  cliente ??= new ClienteSessao({
    // Leitura estática: o Metro só embute `process.env.EXPO_PUBLIC_*` escrito assim.
    baseUrl: process.env.EXPO_PUBLIC_API_URL ?? '',
    plataforma: Platform.OS === 'web' ? 'web' : Platform.OS === 'ios' ? 'ios' : 'android',
    armazenamento: armazenamentoDeRefresh,
    trava: criarTrava(),
    identificadorDaInstalacao,
  });
  return cliente;
}
