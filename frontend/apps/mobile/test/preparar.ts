jest.mock('expo-router', () => {
  const { createElement } = jest.requireActual<typeof import('react')>('react');
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  const { mockRoteador, mockParametros } =
    jest.requireActual<typeof import('./roteador')>('./roteador');
  return {
    // `Stack.Screen` só registra as opções, para conferir o título da barra.
    Stack: {
      Screen: ({ options }: { options?: { title?: string } }) => {
        mockRoteador.titulo = options?.title;
        return null;
      },
    },
    useRouter: () => mockRoteador,
    useLocalSearchParams: () => mockParametros,
    // O redirecionamento vira um texto, para a guarda poder ser conferida.
    Redirect: ({ href }: { href: string }) => createElement(Text, null, `redirecionou:${href}`),
  };
});
