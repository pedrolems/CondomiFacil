/** Identificador anônimo de instalação (não é segredo); `inst-` + UUID quando o ambiente tem `crypto`. */
export function novoIdentificador(): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  return `inst-${uuid ?? `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`}`;
}
