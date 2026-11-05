/* Acesso e conta — fluxos 3.1, 3.2 e 3.3 */
'use strict';
const A = { tries: 0, codeTries: 5, mode: 'primeiro', onbRole: 'morador', resendIn: 0 };

def('acesso', 'boas-vindas', 'Boas-vindas', 'Entrada', () => ({
  noTop: true, noTabs: true, banner: '',
  body: `<div class="onb" style="padding-top:96px"><span class="app-icon">C</span><h1 class="t-title-lg wordmark">CondomiFacil</h1>
    <p class="t-body muted" style="margin:0">Reservas, visitantes, chamados e a vida do condomínio num lugar só.</p></div>`,
  footer: `${btn('Entrar', { block: true, size: 'lg', on: 'acesso/login' })}${btn('Primeiro acesso', { v: 'secondary', block: true, on: () => { A.mode = 'primeiro'; go('acesso/email'); } })}`,
}));

def('acesso', 'login', 'Login', 'Login e recuperação (3.2)', () => {
  const locked = A.tries >= 5;
  return {
    noTabs: true, top: { title: 'Entrar', back: 'acesso/boas-vindas' },
    body: `<div class="stack-5">
      ${locked ? banner('danger', 'lock', 'Por segurança, o acesso foi pausado por 15 minutos. Você pode redefinir a senha agora.', { inline: true }) : ''}
      ${field('E-mail', input('email', { type: 'email', value: FORM.email ?? 'ana.lima@email.com', attr: 'autocomplete="email"' }))}
      ${field('Senha', input('senha', { type: 'password', ph: '', attr: 'autocomplete="current-password"' }), { error: A.err })}
      ${field('Entrar como (protótipo)', `<select class="select" data-bind="role">${Object.entries(PROFILES).filter(([k]) => k !== 'acesso').map(([k, v]) => `<option value="${k}" ${FORM.role === k ? 'selected' : ''}>${v.name}</option>`).join('')}</select>`, { help: 'No app real, o perfil vem do cadastro. Digite qualquer senha com 8 ou mais caracteres; "errada" simula senha incorreta.' })}
      <div class="row wrap">${btn('Esqueci minha senha', { v: 'text', on: () => { A.mode = 'recuperar'; go('acesso/email'); } })}${btn('Simular sem internet', { v: 'text', on: 'acesso/sem-internet' })}</div>
    </div>`,
    footer: btn('Entrar', { block: true, size: 'lg', disabled: locked, on: () => {
      const s = FORM.senha || '';
      if (s === 'desativada') { go('acesso/desativado'); return; }
      if (s.length < 8 || s === 'errada') { A.tries++; A.err = A.tries >= 5 ? '' : 'E-mail ou senha incorretos.'; rerender(); return; }
      A.tries = 0; A.err = ''; const role = FORM.role || 'morador';
      if (S.termsPending) { A.after = role; go('acesso/novo-aceite'); return; }
      go(role + '/' + PROFILES[role].home); setTimeout(() => toast('Bem-vinda de volta, Ana.'), 50);
    } }) + (locked ? `<p class="disabled-reason">${ic('info')}Aguarde 15 minutos ou redefina a senha.</p>` + btn('Simular fim da pausa', { v: 'text', block: true, on: () => { A.tries = 0; rerender(); } }) : ''),
  };
});

def('acesso', 'email', 'Informar e-mail', 'Primeiro acesso (3.1)', () => ({
  noTabs: true, top: { title: A.mode === 'recuperar' ? 'Redefinir senha' : 'Primeiro acesso', back: A.mode === 'recuperar' ? 'acesso/login' : 'acesso/boas-vindas' },
  body: `<div class="stack-5"><h2 class="t-title-md">Qual é o seu e-mail?</h2>
    <p class="t-body muted" style="margin:0">Use o e-mail que você informou à administradora ou ao síndico. Vamos enviar um código de 6 dígitos.</p>
    ${field('E-mail', input('email', { type: 'email', value: FORM.email ?? 'ana.lima@email.com', attr: 'autocomplete="email"' }), { error: A.emailErr })}</div>`,
  footer: btn('Enviar código', { block: true, size: 'lg', on: () => {
    if (!/.+@.+\..+/.test(FORM.email ?? 'ana.lima@email.com')) { A.emailErr = 'Informe um e-mail válido, como nome@email.com.'; rerender(); return; }
    A.emailErr = ''; A.codeTries = 5; A.codeErr = ''; A.resendIn = 60; go('acesso/codigo');
  } }),
}));

def('acesso', 'codigo', 'Código de verificação', 'Primeiro acesso (3.1)', () => {
  const dead = A.codeTries <= 0;
  return {
    noTabs: true, top: { title: 'Código de verificação', back: 'acesso/email' },
    body: `<div class="stack-5">
      ${banner('info', 'mail', `Se o e-mail <b>${esc(FORM.email || 'ana.lima@email.com')}</b> estiver cadastrado, um código foi enviado.`, { inline: true })}
      <div class="field"><label for="otp0">Código de 6 dígitos</label>
        <div class="otp" role="group" aria-label="Código de verificação">${[0, 1, 2, 3, 4, 5].map(i => `<input id="otp${i}" inputmode="numeric" maxlength="1" autocomplete="${i === 0 ? 'one-time-code' : 'off'}" aria-label="Dígito ${i + 1}" ${dead ? 'disabled' : ''}>`).join('')}</div>
        ${A.codeErr ? `<span class="error-msg" role="alert">${ic('circle-x')}${A.codeErr}</span>` : `<span class="help">Código válido por 15 minutos. Dica do protótipo: 123456.</span>`}
      </div>
      <p class="help" style="margin:0">Não recebeu? Confira o e-mail digitado ou procure a administradora ou o síndico.</p>
      ${btn(A.resendIn > 0 && !dead ? `Pedir novo código (${A.resendIn} s)` : 'Pedir novo código', { v: 'text', disabled: A.resendIn > 0 && !dead, on: () => { A.codeTries = 5; A.codeErr = ''; A.resendIn = 60; rerender(); toast('Novo código enviado. O anterior não vale mais.'); } })}
      ${A.resendIn > 0 && !dead ? btn('Pular espera (protótipo)', { v: 'text', on: () => { A.resendIn = 0; rerender(); } }) : ''}
    </div>`,
    footer: btn('Continuar', { block: true, size: 'lg', disabled: dead, on: () => {
      const code = [...document.querySelectorAll('.otp input')].map(i => i.value).join('');
      if (code === '123456') { go(A.mode === 'recuperar' ? 'acesso/senha' : 'acesso/senha'); return; }
      A.codeTries--;
      A.codeErr = A.codeTries > 0 ? `Código incorreto. Você tem mais ${A.codeTries} ${A.codeTries === 1 ? 'tentativa' : 'tentativas'}.` : 'Este código não vale mais. Peça um novo.';
      if (A.codeTries <= 0) A.resendIn = 0;
      rerender();
    } }),
    after: () => {
      const ins = [...document.querySelectorAll('.otp input')];
      ins.forEach((el, i) => {
        el.addEventListener('input', () => { el.value = el.value.replace(/\D/g, ''); if (el.value && ins[i + 1]) ins[i + 1].focus(); });
        el.addEventListener('keydown', e => { if (e.key === 'Backspace' && !el.value && ins[i - 1]) ins[i - 1].focus(); });
        el.addEventListener('paste', e => { const t = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6); if (t) { e.preventDefault(); t.split('').forEach((d, j) => ins[j] && (ins[j].value = d)); } });
      });
      if (ins[0] && !ins[0].disabled) ins[0].focus();
    },
  };
});

def('acesso', 'senha', 'Criar senha', 'Primeiro acesso (3.1)', () => {
  const s = FORM.nova || '', c = FORM.conf || '';
  const req = [[s.length >= 8, 'Pelo menos 8 caracteres'], [s.length > 0 && s === c, 'Confirmação igual à senha']];
  return {
    noTabs: true, top: { title: A.mode === 'recuperar' ? 'Nova senha' : 'Criar senha', back: 'acesso/codigo' },
    body: `<div class="stack-5">
      ${field('Senha', input('nova', { type: 'password', attr: 'autocomplete="new-password"' }))}
      ${field('Confirmar senha', input('conf', { type: 'password', attr: 'autocomplete="new-password"' }))}
      <div class="stack-2">${req.map(([ok, t]) => `<div class="row t-body-sm ${ok ? 'c-success' : (A.pwTried ? 'c-danger' : 'muted')}">${ic(ok ? 'circle-check' : A.pwTried ? 'circle-x' : 'circle-minus')}${t}</div>`).join('')}</div>
      ${A.mode === 'recuperar' ? banner('info', 'info', 'Ao salvar, as outras sessões abertas da sua conta serão encerradas.', { inline: true }) : ''}
    </div>`,
    footer: btn(A.mode === 'recuperar' ? 'Salvar nova senha' : 'Criar senha', { block: true, size: 'lg', on: () => {
      const s2 = FORM.nova || '', c2 = FORM.conf || '';
      if (s2.length < 8 || s2 !== c2) { A.pwTried = true; rerender(); return; }
      A.pwTried = false;
      if (A.mode === 'recuperar') { go('morador/inicio'); setTimeout(() => toast('Senha alterada. As outras sessões foram encerradas.'), 50); }
      else go('acesso/termos');
    } }),
  };
});

const DOCS = [['termos', 'Termos de uso'], ['privacidade', 'Política de privacidade'], ['regimento', 'Regimento interno do Residencial Jardim Azul'], ['como', 'Como funciona (score, reclamações e reservas)']];
def('acesso', 'termos', 'Aceite de termos', 'Primeiro acesso (3.1)', () => {
  const ac = FORM.aceites || [];
  const all = DOCS.every(([k]) => ac.includes(k));
  return {
    noTabs: true, top: { title: 'Documentos do condomínio', back: 'acesso/senha' },
    body: `<div class="stack"><p class="t-body muted" style="margin:0">Leia e aceite cada documento para começar a usar o CondomiFacil.</p>
      ${DOCS.map(([k, l]) => choice('aceites', k, `Li e aceito: <b>${l}</b>`, { multi: true, right: `<a href="#" ${cb(() => sheet(`<h2 class="t-title-md">${l}</h2><p class="t-body" style="max-width:640px">Versão 1.0 · 04/11/2026. Texto de exemplo do documento. No app real, aqui aparece o conteúdo completo, com até cerca de 70 caracteres por linha para facilitar a leitura.</p>`))} class="t-label-sm">Ler</a>` })).join('')}
      ${A.termsErr ? banner('warning', 'triangle-alert', 'Para usar o CondomiFacil, é preciso aceitar os documentos do seu condomínio.', { inline: true }) : ''}</div>`,
    footer: `${btn('Aceitar e continuar', { block: true, size: 'lg', disabled: !all, on: () => { A.termsErr = false; go('acesso/perfil-onboarding'); } })}
      ${all ? '' : `<p class="disabled-reason">${ic('info')}Marque os ${DOCS.length} documentos para continuar.</p>`}
      ${btn('Agora não', { v: 'text', block: true, on: () => { A.termsErr = true; rerender(); } })}`,
  };
});

def('acesso', 'perfil-onboarding', 'Escolher perfil do onboarding', 'Primeiro acesso (3.1)', () => ({
  noTabs: true, top: { title: 'Onboarding de qual perfil?', back: 'acesso/termos' },
  body: `<div class="stack"><p class="t-body muted" style="margin:0">No app real o perfil vem do pré-cadastro. Escolha qual onboarding ver.</p>
    ${Object.entries(ONB).map(([k]) => row({ icon: PROFILES[k].icon, title: PROFILES[k].name, on: () => { A.onbRole = k; go('acesso/onboarding/1'); } })).join('')}</div>`,
}));

const ONB = {
  morador: [['calendar-days', 'Reserve as áreas comuns', 'Veja os horários livres e reserve em poucos toques. Áreas pagas aceitam Pix e cartão.'], ['users', 'Avise a portaria', 'Cadastre visitantes e eles entram mais rápido. A portaria recebe na hora.'], ['gauge', 'Seu score', 'Boa convivência mantém seu score alto. Toda perda vem com motivo e direito a recurso.'], ['bell', 'Tudo no seu celular', 'Encomendas, comunicados e votações chegam por notificação.']],
  subsindico: [['layout-dashboard', 'Gestão da subsíndica', 'Na aba Gestão ficam as reclamações contra o síndico, a manutenção, as sugestões de comunicado e as reuniões.'], ['pencil-line', 'Sugira comunicados', 'Escreva o comunicado e o síndico revisa e envia.'], ['user-round-cog', 'Substituição', 'Quando o síndico se ausentar, você passa a ter todas as funções dele até a desativação.']],
  sindico: [['layout-dashboard', 'Gestão num lugar só', 'Reclamações, chamados, comunicados e reuniões ficam na aba Gestão.'], ['scale', 'Julgue com processo', 'Converse com o alvo antes de decidir. O app libera a decisão quando o processo foi cumprido.'], ['vote', 'Reuniões e votações', 'Convoque, abra a votação online e registre os votos presenciais.']],
  portaria: [['users', 'Esperados de hoje', 'A lista abre pronta. Toque em Entrada e pronto: errou, toque em Desfazer.'], ['wifi-off', 'Sem internet também', 'A lista do dia fica salva. Os registros são enviados quando a conexão voltar.'], ['graduation-cap', 'Treine sem medo', 'No modo treinamento, nada é real e ninguém é avisado.']],
  limpeza: [['spray-can', 'Sua fila de chamados', 'Os chamados aparecem por prazo. Conclua direto no cartão.'], ['camera', 'Foto opcional', 'Mostre como ficou com uma foto ao concluir.'], ['clipboard-check', 'Vistorias', 'Depois de cada reserva, registre a vistoria da área.']],
  admin: [['rocket', 'Implante o condomínio', 'Estrutura, conta bancária, pessoas e regras, nessa ordem.'], ['receipt', 'Cobrança', 'Configure a taxa, lance extras e acompanhe a inadimplência.'], ['inbox', 'Solicitações do síndico', 'Atenda ou recuse com motivo.']],
  proprietario: [['house', 'Sua unidade', 'Acompanhe o contrato de locação e as ocorrências da unidade, sem ver a rotina do inquilino.'], ['receipt', 'Suas cobranças', 'Pague as despesas extraordinárias e acompanhe as ordinárias, que são do inquilino.'], ['vote', 'Assembleias', 'Quem vota pela unidade é você. Se não puder participar, indique um procurador, que pode ser o inquilino.']],
};
def('acesso', 'onboarding', 'Onboarding', 'Primeiro acesso (3.1)', ctx => {
  const steps = ONB[A.onbRole] || ONB.morador; const n = Math.min(+ctx.arg || 1, steps.length); const [icon, t, d] = steps[n - 1];
  const finish = () => { go(A.onbRole + '/' + PROFILES[A.onbRole].home); setTimeout(() => toast('Tudo pronto. Você pode rever o tutorial em Menu > Como usar o app.'), 50); };
  return {
    noTop: true, noTabs: true, banner: '',
    body: `<div class="onb"><div class="t-label-sm muted">${n} de ${steps.length}</div><span class="onb-ico">${ic(icon)}</span><h1 class="t-title-lg">${t}</h1><p class="t-body muted" style="margin:0;max-width:300px">${d}</p></div>`,
    footer: `${btn('Continuar', { block: true, size: 'lg', on: () => n < steps.length ? go('acesso/onboarding/' + (n + 1)) : finish() })}${btn('Pular', { v: 'text', block: true, on: finish })}`,
  };
}, { arg: '1' });

def('acesso', 'novo-aceite', 'Novo aceite de termos', 'Novo aceite e troca de unidade (3.3)', () => ({
  noTabs: true, top: { title: 'Os termos mudaram' }, banner: banner('info', 'file-text', 'Os termos mudaram. Leia e aceite para continuar.'),
  body: `<div class="stack"><h2 class="t-title-sm">O que mudou no Regimento interno (versão 1.1)</h2>
    <div class="card"><div class="t-body-sm"><b>Art. 12.</b> O horário de silêncio passa a ser das 22h às 7h em todos os dias, inclusive fins de semana.</div></div>
    <div class="card"><div class="t-body-sm"><b>Art. 18.</b> A churrasqueira pode ser reservada por até 6 horas seguidas.</div></div>
    ${choice('aceiteNovo', 'ok', 'Li e aceito o Regimento interno, versão 1.1', { multi: true })}</div>`,
  footer: `${btn('Aceitar e continuar', { block: true, size: 'lg', disabled: !(FORM.aceiteNovo || []).includes('ok'), on: () => { S.termsPending = false; const r = A.after || 'morador'; go(r + '/' + PROFILES[r].home); setTimeout(() => toast('Aceite registrado.'), 50); } })}
    ${btn('Agora não', { v: 'text', block: true, on: () => dialog({ title: 'Continuar sem aceitar?', text: 'Você continua conectado, mas não consegue usar o app até aceitar a nova versão.', actions: [{ label: 'Ler de novo', v: 'primary' }, { label: 'Sair do app', v: 'secondary', on: () => go('acesso/boas-vindas') }] }) })}`,
}));

def('acesso', 'desativado', 'Acesso desativado', 'Login e recuperação (3.2)', () => ({
  noTabs: true, top: { title: 'Entrar', back: 'acesso/login' },
  body: empty('circle-x', 'Seu acesso a este condomínio foi encerrado. Se for um engano, fale com a administradora.', btn('Voltar ao login', { v: 'secondary', on: 'acesso/login' })),
}));

def('acesso', 'sem-internet', 'Erro de conexão', 'Login e recuperação (3.2)', () => ({
  noTabs: true, top: { title: 'Entrar', back: 'acesso/login' },
  body: empty('wifi-off', 'Não foi possível conectar. Verifique a internet e tente de novo.', btn('Tentar de novo', { v: 'secondary', icon: 'refresh-cw', on: 'acesso/login' })),
}));
