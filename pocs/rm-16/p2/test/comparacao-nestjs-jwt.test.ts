// Comparacao: @nestjs/jwt 12.0.5 (jsonwebtoken) com guards proprios x jose 6.2.17 (implementacao principal).
import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { JwtService } from '@nestjs/jwt';
import { SignJWT, jwtVerify } from 'jose';
import { describe, expect, it } from 'vitest';

const segredo = randomBytes(32);
const nest = new JwtService({ secret: segredo });
const agora = Math.floor(Date.now() / 1000);
const opcoesVerify = { algorithms: ['HS256' as const], issuer: 'condomifacil', audience: 'condomifacil-api' };
const assinarNest = (alg: 'HS256' | 'HS512' = 'HS256', extra = {}) => nest.signAsync({ sid: 's1', sub: 'u1' }, { algorithm: alg, keyid: 'k1', issuer: 'condomifacil', audience: 'condomifacil-api', expiresIn: 900, ...extra });
const assinarJose = (alg = 'HS256') => new SignJWT({ sid: 's1' }).setProtectedHeader({ alg, kid: 'k1' }).setSubject('u1').setIssuer('condomifacil').setAudience('condomifacil-api').setExpirationTime('15m').sign(segredo);
const linhas: string[] = [];
const log = (l: string) => { linhas.push(l); console.log(l); };

describe('@nestjs/jwt como alternativa', () => {
  it('cobre os mesmos casos de recusa quando o guard fixa algoritmo, emissor e audiencia', async () => {
    const ok = await assinarNest();
    await expect(nest.verifyAsync(ok, opcoesVerify)).resolves.toMatchObject({ sub: 'u1', sid: 's1' });
    const none = `${Buffer.from('{"alg":"none"}').toString('base64url')}.${ok.split('.')[1]}.`;
    await expect(nest.verifyAsync(none, opcoesVerify)).rejects.toThrow();
    await expect(nest.verifyAsync(ok.slice(0, -2) + 'AA', opcoesVerify)).rejects.toThrow();
    await expect(nest.verifyAsync(ok, { ...opcoesVerify, clockTimestamp: agora + 901 })).rejects.toThrow(/expired/);
    await expect(nest.verifyAsync(await assinarNest('HS256', { issuer: 'outro' }), opcoesVerify)).rejects.toThrow();
  });

  it('armadilha: sem `algorithms` explicito aceita HS512 (e emissor/audiencia nao sao checados por padrao); a jose recusa por construcao quando o guard fixa o algoritmo', async () => {
    const hs512 = await assinarNest('HS512', { issuer: 'qualquer', audience: 'qualquer' });
    await expect(nest.verifyAsync(hs512)).resolves.toBeDefined(); // padrao do pacote: aceita
    await expect(nest.verifyAsync(hs512, opcoesVerify)).rejects.toThrow(); // so quando o guard lembra de fixar
    await expect(jwtVerify(await assinarJose('HS512'), segredo, { algorithms: ['HS256'], issuer: 'condomifacil', audience: 'condomifacil-api' })).rejects.toThrow();
    log('nestjs/jwt: verifyAsync sem opcoes aceitou HS512 com emissor/audiencia quaisquer; com algorithms+issuer+audience recusou');
  });

  it('rotacao por kid exige secretOrKeyProvider proprio (header lido a mao); com jose o chaveiro faz o mesmo em uma funcao', async () => {
    const chaves: Record<string, Buffer> = { k1: segredo, k2: randomBytes(32) };
    const prov = new JwtService({ secretOrKeyProvider: (_t, token) => chaves[JSON.parse(Buffer.from((token as string).split('.')[0]!, 'base64url').toString()).kid]! });
    await expect(prov.verifyAsync(await assinarNest(), opcoesVerify)).resolves.toBeDefined();
    const k2 = new JwtService({ secret: chaves['k2']! });
    await expect(prov.verifyAsync(await k2.signAsync({ sid: 's' }, { keyid: 'k2', subject: 'u', issuer: 'condomifacil', audience: 'condomifacil-api', expiresIn: 60 }), opcoesVerify)).resolves.toBeDefined();
  });

  it('desempenho: assinar e verificar 5.000 tokens (so para dimensionar; nao decide)', async () => {
    const N = 5000;
    const medir = async (f: () => Promise<unknown>) => { const t = performance.now(); for (let i = 0; i < N; i++) await f(); return (performance.now() - t) / N * 1000; };
    const tj = await assinarJose(); const tn = await assinarNest();
    const r = {
      joseSign: await medir(assinarJose), joseVerify: await medir(() => jwtVerify(tj, segredo, { algorithms: ['HS256'] })),
      nestSign: await medir(() => assinarNest()), nestVerify: await medir(() => nest.verifyAsync(tn, opcoesVerify)),
    };
    log(`microbench (us por operacao, ${N}x): jose assina ${r.joseSign.toFixed(1)} / verifica ${r.joseVerify.toFixed(1)}; @nestjs/jwt assina ${r.nestSign.toFixed(1)} / verifica ${r.nestVerify.toFixed(1)}`);
    writeFileSync(new URL('../resultados/comparacao-jwt.txt', import.meta.url), linhas.join('\n') + '\n');
    expect(r.joseVerify).toBeLessThan(5000); // 5 ms: ordem de grandeza folgada, a diferenca nao importa frente ao banco
  });
});
