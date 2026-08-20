# Plan: harden Estudos-Eyshila and release safely

## Goal

Corrigir os defeitos de integridade, autenticação, revisão de conteúdo, persistência e operações de prova identificados na auditoria; validar localmente; aplicar a migração no Supabase; enviar a branch ao GitHub; e publicar uma versão verificável na Vercel.

## Constraints

- Preservar as alterações pendentes já existentes no checkout atual.
- Não marcar questões clínicas como publicadas sem revisão humana comprovável.
- Não expor segredos em arquivos versionados, logs ou respostas.
- Usar transações/RPCs do Postgres para operações que precisam ser atômicas.
- Separar evidência local, evidência do Supabase, evidência do GitHub e evidência da Vercel.

## Tasks

- [ ] Criar testes de regressão para o contrato do seed, elegibilidade de conteúdo, autenticação/prontidão, payloads de persistência e idempotência.
- [ ] Corrigir o seed para montar componentes de questões em estado draft e publicar somente após todas as validações do banco.
- [ ] Impedir que conteúdo draft ou marcado para revisão apareça nos modos de estudo/prática em produção, com estado explícito para o usuário.
- [ ] Impedir hidratação tardia de uma conta sobre outra e substituir gravações integrais concorrentes por merge transacional no Supabase.
- [ ] Revogar escrita direta de exposições pelo cliente e mover início/envio de prova para RPCs transacionais restritas ao service role.
- [ ] Endurecer fallback de autenticação, readiness, mensagens de erro e textos que fazem alegações excessivas de oficialidade/privacidade.
- [ ] Rodar lint, testes, build, auditoria de dependências, verificação de diff e smoke test local.
- [ ] Aplicar e verificar a migração no Supabase; rodar advisors de segurança/performance; executar seed apenas para conteúdo realmente aprovado.
- [ ] Commitar somente os arquivos pertencentes à correção, fazer push da branch e publicar produção na Vercel.
- [ ] Validar health/readiness e rotas públicas após o deploy e registrar qualquer bloqueio remanescente.

## Verification checklist

- `npm.cmd run lint`
- `npm.cmd test`
- `npm.cmd run build`
- `npm.cmd audit --omit=dev`
- `git diff --check`
- Smoke local de `/api/health`, `/api/ready`, `/api/blueprint` e rotas protegidas.
- Consulta Supabase de migrações, políticas/grants e funções RPC.
- Advisors Supabase de segurança e performance.
- Status do commit/push no GitHub.
- Status, URL e smoke check do deployment de produção na Vercel.
