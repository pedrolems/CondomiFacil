import { Redirect } from 'expo-router';
import { GuardaDeSessao, useDestinoInicial } from '../compartilhado/navegacao/GuardaDeSessao';

// Rota `/`: espera a restauração da sessão e segue para onde o estado manda.
function Destino() {
  return <Redirect href={useDestinoInicial()} />;
}

export default function Entrada() {
  // A guarda cuida da carga e da falha; aqui só se escolhe o destino.
  return (
    <GuardaDeSessao exige="anonima">
      <Destino />
    </GuardaDeSessao>
  );
}
