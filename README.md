# Portal de Estudos Eyshila Caxias

Aplicação React/Vite para preparação de Enfermagem para o ENARE, com autenticação Supabase, persistência de dados e geração de material didático por IA via OpenRouter.

## Requisitos

- Node.js 20 ou superior
- Uma instância Supabase configurada para autenticação e persistência
- Uma chave OpenRouter para os endpoints de IA

## Executar localmente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Configure as variáveis em `.env.local`:

   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-publica
   OPENROUTER_API_KEY=sua-chave-do-servidor
   OPENROUTER_MODEL=google/gemini-2.5-flash
   APP_URL=http://localhost:3000
   ```

3. Para habilitar os simulados seguros ENARE (`/api/exams/start` e `/api/exams/:id/submit`), adicione no servidor a chave `service_role`:

   ```env
   SUPABASE_URL=https://seu-projeto.supabase.co
   SUPABASE_ANON_KEY=sua-chave-publica
   SUPABASE_SECRET_KEY=sua-chave-service-role-do-servidor
   ```

4. Aplique a migration de integridade de aprendizagem antes do primeiro uso:

   ```bash
   supabase db push --db-url "$SUPABASE_DB_URL"
   ```

   Depois de revisar e aprovar o conteúdo, popule somente as questões elegíveis:

   ```bash
   npm run seed:supabase
   ```

5. Inicie o ambiente de desenvolvimento:

   ```bash
   npm run dev
   ```

Em produção, as rotas `/api/generate-study` e `/api/chat-study` exigem uma sessão autenticada do Supabase. A chave `service_role` nunca deve ser colocada no frontend, e os gabaritos dos simulados ficam fora do bundle do navegador.

## Validação

```bash
npm run lint
npm test
npm run build
```

O deploy de produção é feito pela Vercel.
