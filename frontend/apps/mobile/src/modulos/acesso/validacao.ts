export const EMAIL_VALIDO = /^\S+@\S+\.\S+$/;
export const TAMANHO_MINIMO_DA_SENHA = 8;

/** Requisitos da senha (RF-AC-01): mínimo de 8 caracteres e confirmação igual. */
export function requisitosDaSenha(senha: string, confirmacao: string) {
  return [
    { texto: 'Pelo menos 8 caracteres', atendido: senha.length >= TAMANHO_MINIMO_DA_SENHA },
    { texto: 'Confirmação igual à senha', atendido: senha.length > 0 && senha === confirmacao },
  ];
}
