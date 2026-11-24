import { useState } from 'react';
import { Banner, Choice, Text } from '@condomifacil/ui';
import { Pagina } from '../../../compartilhado/componentes/Pagina';
import { ErroDeRede } from '../../../infraestrutura/api/erros';
import { useMontado } from '../../../modulos/acesso/hooks';
import { textoDoErro } from '../../../modulos/acesso/mensagens';
import type { TemaPreferido } from '../../../modulos/acesso/operacoes';
import { useSessao } from '../../../modulos/acesso/SessaoProvider';

const OPCOES: { valor: TemaPreferido; rotulo: string; descricao?: string }[] = [
  { valor: 'aparelho', rotulo: 'Igual ao aparelho', descricao: 'Segue o tema do celular.' },
  { valor: 'claro', rotulo: 'Claro' },
  { valor: 'escuro', rotulo: 'Escuro' },
];

// RF-AC-05: a escolha é salva na conta (vale em qualquer aparelho) e aplicada pelos tokens.
export default function Aparencia() {
  const { perfil, atualizarTema } = useSessao();
  const montado = useMontado();
  const [aviso, setAviso] = useState<{ tom: 'success' | 'warning' | 'danger'; texto: string }>();
  const atual = perfil?.tema_preferido ?? 'aparelho';

  async function escolher(tema: TemaPreferido) {
    if (tema === atual) return;
    setAviso(undefined);
    try {
      await atualizarTema(tema);
      if (montado.current) setAviso({ tom: 'success', texto: 'Aparência salva.' });
    } catch (e) {
      if (montado.current)
        setAviso({ tom: e instanceof ErroDeRede ? 'warning' : 'danger', texto: textoDoErro(e) });
    }
  }

  return (
    <Pagina>
      <Text variante="titleMd" accessibilityRole="header">
        Aparência
      </Text>
      {aviso && <Banner anunciar tom={aviso.tom} texto={aviso.texto} />}
      {OPCOES.map((o) => (
        <Choice
          key={o.valor}
          tipo="radio"
          rotulo={o.rotulo}
          descricao={o.descricao}
          marcado={atual === o.valor}
          onChange={() => void escolher(o.valor)}
        />
      ))}
    </Pagina>
  );
}
