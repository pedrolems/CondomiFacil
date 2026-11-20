// Cliente de sessao da PoC: logica que o app (expo-secure-store) e a web (cookie httpOnly) usariam.
// Nao depende de React Native: o armazenamento e o fetch sao injetados.

export interface Armazenamento {
  ler(): Promise<string | null>;
  gravar(valor: string): Promise<void>;
  apagar(): Promise<void>;
}

/** Adaptador para o expo-secure-store (getItemAsync/setItemAsync/deleteItemAsync). Nao executado em aparelho nesta PoC. */
export const doSecureStore = (ss: { getItemAsync(k: string): Promise<string | null>; setItemAsync(k: string, v: string): Promise<void>; deleteItemAsync(k: string): Promise<void> },
  chave = 'condomifacil.refresh'): Armazenamento => ({
  ler: () => ss.getItemAsync(chave), gravar: (v) => ss.setItemAsync(chave, v), apagar: () => ss.deleteItemAsync(chave),
});

export class SessaoExpirada extends Error {}

export class ClienteSessao {
  private access: string | null = null; // so em memoria, nos dois modos
  private renovando: Promise<void> | null = null;
  renovacoes = 0;
  constructor(private o: { base: string; fetch: typeof fetch; modo: 'app' | 'web'; armazenamento?: Armazenamento; condominioId?: string }) {}

  private cabecalhos(extra: Record<string, string> = {}) {
    return { 'content-type': 'application/json', ...(this.o.modo === 'web' ? { 'x-condomifacil-web': '1' } : {}), ...extra };
  }

  private async aceitar(r: Response) {
    const j = (await r.json()) as { access_token: string; refresh_token?: string };
    // App: grava o novo refresh ANTES de usar o novo access (rotativo: o antigo ja morreu no servidor).
    if (this.o.modo === 'app') await this.o.armazenamento!.gravar(j.refresh_token!);
    this.access = j.access_token;
  }

  async entrar(email: string, senha: string) {
    const r = await this.o.fetch(`${this.o.base}/v1/acesso/entrar`, { method: 'POST', headers: this.cabecalhos(),
      body: JSON.stringify({ email, senha, cliente: this.o.modo }), credentials: 'include' });
    if (!r.ok) throw new SessaoExpirada(`login ${r.status}`);
    await this.aceitar(r);
  }

  /** Single-flight: chamadas simultaneas com access vencido compartilham UMA renovacao (evita auto-replay). */
  private renovar(): Promise<void> {
    this.renovando ??= (async () => {
      this.renovacoes++;
      const corpo = this.o.modo === 'app' ? { refresh_token: await this.o.armazenamento!.ler() } : {};
      if (this.o.modo === 'app' && !corpo.refresh_token) throw new SessaoExpirada('sem refresh');
      const r = await this.o.fetch(`${this.o.base}/v1/acesso/renovar`, { method: 'POST', headers: this.cabecalhos(), body: JSON.stringify(corpo), credentials: 'include' });
      if (!r.ok) {
        this.access = null;
        if (this.o.modo === 'app') await this.o.armazenamento!.apagar();
        throw new SessaoExpirada(`renovar ${r.status}`); // UF 15: volta ao login e depois a tela
      }
      await this.aceitar(r);
    })().finally(() => { this.renovando = null; });
    return this.renovando;
  }

  async chamar(caminho: string, init: RequestInit = {}): Promise<Response> {
    const enviar = () => this.o.fetch(`${this.o.base}${caminho}`, { ...init, credentials: 'include', headers: this.cabecalhos({
      ...(this.access ? { authorization: `Bearer ${this.access}` } : {}), ...(this.o.condominioId ? { 'x-condominio-id': this.o.condominioId } : {}) }) });
    if (!this.access) await this.renovar(); // recarregou a pagina/app: access em memoria perdido
    let r = await enviar();
    if (r.status === 401) { await this.renovar(); r = await enviar(); }
    return r;
  }
}
