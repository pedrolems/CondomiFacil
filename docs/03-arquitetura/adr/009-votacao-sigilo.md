# ADR-009: Votação com registro separado do conteúdo e limite de sigilo aceito

- **Estado:** Proposto
- **Data:** 06/11/2026
- **Decisores:** Pedro Lemos
- **Depende de:** parecer jurídico (SEG-16, marco 2 do roadmap)
- **Relacionado a:** [ADR-001](001-multi-tenant-rls.md), [ADR-010](010-anonimato-identidade-separada.md)

## Contexto

O módulo de votações cobre reuniões, pautas, votações, eleições e atas (RF-VO-01 a 11). O que já está decidido:

- Um voto por unidade, do proprietário, ou de procurador do mesmo condomínio (no máximo 1 unidade além da sua) (RN-VO-01).
- Voto secreto, com resultado só após o encerramento.
- SEG-06 exige registrar que a unidade votou **separado** do conteúdo do voto.
- Votos presenciais são registrados por unidade, com histórico de quem registrou (RN-VO-11).
- Unidade em atraso não vota (RN-FI-11).
- Quórum e empate publicados como tal (RN-VO-17); ata e lista de presença em PDF (RF-VO-09).
- O proprietário pode substituir o voto do inquilino em pauta sem despesa extraordinária (RN-VO-18).
- A votação guarda cópia das regras vigentes na criação (RN-GE-03).

O problema: provar que cada unidade votou uma vez e que o resultado confere, sem permitir ligar uma pessoa ao conteúdo do voto. Sem sistema criptográfico de votação, quem tem acesso direto ao banco (DBA) pode tentar correlacionar. O SEG-16 prevê parecer jurídico antes do lançamento e ele **pode exigir mais rigor** de sigilo (arquitetura 9.2).

## Opções consideradas

| Opção | Prós | Contras |
| --- | --- | --- |
| **A. Registro e conteúdo em tabelas separadas, sem chave entre elas, mesma transação** | Simples; atende SEG-06; um voto por unidade garantido por unicidade; auditável quanto a quem votou e ao resultado | Sem prova criptográfica de sigilo; correlação possível por quem acesse o banco e observe ordem ou horário |
| **B. Voto criptografado ou esquema criptográfico verificável** | Sigilo e verificabilidade mais fortes | Complexidade alta para o MVP; não está em nenhum requisito; exige especialistas |
| **C. Um só registro com voto e unidade, ocultado só na camada de API** | Muito simples | Não atende SEG-06; vaza por qualquer bug ou acesso ao banco |

## Decisão (proposta)

Opção **A**, com o limite de sigilo **declarado**, dependente do parecer jurídico.

| Elemento | Mecanismo |
| --- | --- |
| "A unidade votou" | Tabela `voto_registro` (votação, unidade, quem votou, canal online ou presencial, momento), com unicidade `(votacao_id, unidade_id)`: um voto por unidade, inclusive em corrida |
| Conteúdo do voto | Tabela `voto_conteudo` (votação, opção) **sem** unidade, usuário nem horário preciso, e **sem chave estrangeira** para `voto_registro` |
| Gravação | As duas inserções na mesma transação. `voto_conteudo` usa identificador aleatório e a leitura é sempre agregada, para reduzir correlação por ordem de inserção |
| Resultado | Calculado e publicado só após o encerramento; consulta bloqueada antes, **também por RLS**; contagem sobre `voto_conteudo` |
| Voto presencial | Registro de quem lançou (RN-VO-11); unidade que já votou online não vota de novo, exceto a substituição do inquilino pelo proprietário (RN-VO-18) |
| Regras aplicadas | Cópia das regras vigentes na criação: quórum, quem vota, elegibilidade (RN-GE-03) |
| Inadimplência | Impedimento de votar checado no servidor; o motivo aparece só a quem vota e aos responsáveis financeiros (RN-FI-11) |
| Auditoria | Registra abertura, encerramento, votos presenciais e inelegibilidades aplicadas |

**Limite aceito, declarado:** quem tem acesso direto ao banco poderia correlacionar a unidade que vota em momento próximo a outro voto com o conteúdo gravado. O desenho reduz esse risco, mas **não** dá prova criptográfica de sigilo. Verificável: quem votou (registro), quantas opções e o resultado. Não verificável: o conteúdo individual.

Para o conteúdo individual do voto, aplicam-se os cuidados de log da [ADR-010](010-anonimato-identidade-separada.md): nunca registrar corpo de requisição de voto em log de aplicação nem em Sentry.

## Consequências

**Positivas**

- Atende SEG-06 com mecanismo simples e testável.
- Garante um voto por unidade no banco, mesmo com requisições concorrentes.
- As regras ficam em dados, o que permite endurecer o sigilo sem reescrever o módulo.

**Negativas**

- Sigilo não é demonstrável criptograficamente. A defesa contra DBA mal-intencionado é organizacional e de acesso, não matemática.
- A auditoria não consegue revelar o voto individual por contestação.

**Riscos**

- Questionamento jurídico do sigilo (arquitetura 9.4). Mitigação: o limite está registrado aqui e o parecer decide.
- O parecer pode exigir mais rigor. Nesse caso, a opção B voltaria à mesa e esta ADR seria substituída.
- Votação pequena (poucas unidades) facilita correlação por exclusão.

## Critérios de validação e o que falta para aceitar

- **Parecer jurídico (SEG-16)** dizendo se o limite de sigilo basta para eleição e votações de assembleia.
- Testes: não é possível ler resultado antes do encerramento (nem por RLS); duas requisições simultâneas da mesma unidade resultam em um voto; `voto_conteudo` não tem coluna de unidade, usuário nem horário preciso.
- Revisão de quem tem acesso direto ao banco em produção e do registro desse acesso.
- Aprovação do Pedro.

## Referências

- `docs/03-arquitetura/01-arquitetura.md`: seções 3.10, 7 (SEG-06, SEG-16), 9.2, 9.4.
- `docs/01-produto/02-prd.md`: SEG-06, SEG-16; RF-VO-01 a 11.
- `docs/01-produto/03-regras-de-negocio.md`: RN-VO-01, RN-VO-11, RN-VO-17, RN-VO-18, RN-FI-11, RN-GE-03.

## Direção de Pedro em 12/11/2026

Preservar simultaneamente voto secreto e substituição pelo proprietário. Mecanismo exige proposta de segurança/jurídica; nenhuma associação identidade-opção está aprovada. A direção de 12/11 previa administradora/suporte; substituída em 13/11 pela sequência de RN-VO-13 em qualquer plano; segundo empate ou ausência de elegível é inconclusivo sem vencedor automático. Este registro não aceita integralmente o ADR. [Decisões consolidadas](../../01-produto/05-decisoes-de-complementacao.md).


## Atualização de autogestão e eleições — 13/11/2026

Regra aprovada por Pedro: **Essencial admite autogestão**, sem administradora e sem contratar Gestão + Suporte (RN-PL-08); não é terceiro plano nem novo perfil. Gestão e administração ficam no condomínio, concentradas nos órgãos locais aprovados por Pedro. **Distribuição conservadora proposta, a validar:** síndico executa, subsíndico em substituição assume, conselho fiscal mantém fiscalização e as atribuições específicas das RN. A exceção financeira de RN-FI-29 permite ao executor da autogestão operar finanças; não concede ao conselho edição financeira irrestrita. Leitura fiscal continua agregada e fontes individuais permanecem restritas à finalidade autorizada. Suporte não recebe acesso ao Essencial, nem a reclamações e scores em qualquer plano.

**Condução eleitoral em qualquer plano:** síndico em exercício; na ausência ou vacância, subsíndico; sem ambos, conselho fiscal; sem todos, proprietário designado com permissão temporária restrita à eleição. Administradora vinculada e suporte legitimamente autorizado também podem conduzir, sem serem pré-requisito. Autorização é contextual por condomínio, mandato, ausência/vacância e concessão; revalidar em cada leitura e ação. Proprietário designado recebe somente o escopo daquela eleição, sem gestão, finanças, reclamações ou autoconcessão. Auditoria registra ações, nunca voto individual; resultado só após encerramento. A restrição eleitoral anterior de 12/11/2026 fica substituída por RN-VO-13/RN-CD-13 atualizadas.

**Proposta técnica a revisar:** separar modalidade de gestão do plano comercial e manter histórico de vigência; políticas de autorização por ação (Strategy), reutilizando serviços de domínio (Information Expert, baixo acoplamento) nas interfaces de síndico, conselho e comum. Não atribuir o papel Administradora ao síndico para reutilizar DTOs. Persistir concessão eleitoral com condomínio, eleição, proprietário, início/fim, origem da designação e revogação, sem prazo arbitrário. Modelo físico, operação de concessão e campos ainda dependem de validação. Não há banco, migrações ou backend implementados.

**Pendências antes do MVP:** comprovar primeiro responsável sem autoridade prévia; registrar ausência/vacância sem autodeclaração privilegiada; definir qual conselheiro atua; designar/revogar proprietário e tratar perda de vínculo ou retorno do titular durante eleição; validar mandatos e mudança de modalidade; revisar a matriz completa de cadastros, cobrança, conciliação, pagamentos e finanças da autogestão. A interface comum contrata condução eleitoral; as 82 operações propostas de `/v1/sindico/gestao/` cobrem cadastros/configurações, cobrança, conciliação e finanças com DTOs específicos referenciados, sem login de administradora. Caminhos, distribuição e DTOs exigem revisão antes de implementar; mandatos/substituições e concessão inicial permanecem lacunas bloqueadoras. Critérios: titular/sub fora condição e conselho sem condição devem ser recusados; proprietário temporário não alcança finanças; suporte é recusado no Essencial; não há resultado parcial. Ver [decisões e questões detalhadas](../../01-produto/06-autogestao-e-conducao-eleitoral.md). Esta atualização não aceita ADRs ou contratos inteiros.
