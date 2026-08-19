# Finan — Controle Financeiro Pessoal

App web de controle financeiro pessoal, mobile-first, com login individual, lançamentos rápidos de
entrada/saída, controle de metas de investimento e controle de "empréstimos a mim mesmo".

**Stack:** React + Vite + TailwindCSS · Supabase (Postgres + Auth + RLS) · Recharts · Vercel

## 1. Rodando localmente

```bash
npm install
cp .env.example .env   # preencha com as chaves do seu projeto Supabase
npm run dev
```

O app sobe em `http://localhost:5173`.

### Enviando mudanças para o GitHub (e deploy automático no Vercel)

Depois de editar o código, salve e envie tudo com um único comando:

```bash
npm run save -- "descreva aqui o que você mudou"
```

Isso faz `git add` + `git commit` + `git push` de uma vez. O repositório está em
[github.com/MrThurZz/finan](https://github.com/MrThurZz/finan), conectado ao projeto
[finan](https://vercel.com/arthur-9a49/finan) na Vercel — cada envio ao branch `master` dispara um
novo deploy de produção automaticamente.

## 2. Configurando o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Em **SQL Editor**, cole e execute o conteúdo de [`supabase/schema.sql`](./supabase/schema.sql).
   Isso cria as 5 tabelas (`categories`, `transactions`, `self_loans`, `investment_goals`,
   `investment_contributions`), os índices, as policies de Row Level Security (`auth.uid() = user_id`
   em todas as tabelas) e um trigger que popula categorias padrão automaticamente quando um usuário
   se cadastra.
3. Em **Project Settings → API**, copie a **Project URL** e a **anon public key**.
4. Cole esses valores no seu `.env` (local) e nas variáveis de ambiente do Vercel (produção):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Em **Authentication → Providers**, o login por e-mail/senha já vem habilitado por padrão. Não é
   necessário nenhum provedor OAuth.
6. Em **Authentication → URL Configuration**, adicione a URL do seu site (local e/ou produção) em
   *Site URL* e *Redirect URLs* para o fluxo de "esqueci minha senha" funcionar corretamente.

### Sobre RLS

Todas as tabelas têm RLS habilitado com policies de `select`/`insert`/`update`/`delete` restritas a
`auth.uid() = user_id`. Isso significa que cada usuário só enxerga e manipula seus próprios dados —
não é necessário nenhum filtro adicional no código do front-end.

## 3. Deploy no Vercel

O projeto já está publicado em **https://finan-gamma.vercel.app**, conectado ao GitHub — todo push
para `master` gera um novo deploy de produção automaticamente. Para configurar do zero em outra conta:

1. Suba este repositório para o GitHub.
2. No Vercel, **Add New → Project** e importe o repositório (o framework Vite é detectado
   automaticamente; build command `npm run build`, output `dist`).
3. Em **Settings → Environment Variables**, adicione (em Production, Preview e Development):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Faça o deploy. O [`vercel.json`](./vercel.json) já inclui o rewrite de SPA (`/* → /index.html`)
   necessário para as rotas do React Router funcionarem em produção.

> Havia um site no Netlify (`fi-nan.netlify.app`) usado antes da migração; ele ficou parado por um
> bloqueio de créditos da conta free e não é mais usado por este projeto.

## 4. Estrutura do projeto

```
src/
  components/   componentes de UI reutilizáveis (formulários, modais, layout, ícones)
  contexts/     AuthContext (sessão do Supabase Auth)
  hooks/        hooks de dados (React Query) por tabela: transactions, categories, goals, self_loans
  lib/          cliente Supabase e helpers de formatação (moeda, data pt-BR)
  pages/        telas: Dashboard, Investimentos, Meta (detalhe), Devo a mim, Categorias, Relatórios
supabase/
  schema.sql    schema completo + RLS + trigger de categorias padrão
```

## 5. Regras de negócio implementadas

- **Sem recorrência automática de salário** — cada entrada é lançada manualmente.
- **Parcelamento no crédito** — ao marcar uma saída como Crédito e ativar "Parcelado", o valor
  informado é o **valor de cada parcela** (não o total). O sistema cria N registros em
  `transactions`, um por mês seguinte, todos com o mesmo `grupo_parcelamento_id` e com
  `parcela_atual`/`parcela_total` preenchidos (exibido como "2/3" na listagem). Ao excluir, é
  possível excluir apenas uma parcela ou o grupo inteiro.
- **Saldo** — o "Saldo projetado" no Dashboard soma todas as entradas e saídas já lançadas,
  incluindo parcelas futuras. Lançamentos com data futura aparecem com opacidade reduzida e a
  marcação "futuro" na listagem para diferenciá-los do que já ocorreu.
- **Devo a mim mesmo** — é um registro 100% manual (`self_loans`), desacoplado de
  `investment_contributions`. O fluxo sugerido: registre o resgate do investimento normalmente na
  meta (valor negativo em "Aportes") e, à parte, crie um registro em "Devo a mim mesmo" anotando que
  você precisa devolver aquele valor.
