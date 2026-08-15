# APIS — Associação Piauiense de Síndicos

Site institucional + painel administrativo, no mesmo conceito do
SINDICONDOMÍNIOS-PI, com layout e identidade visual próprios (azul,
inspirado na logo da APIS).

## Como rodar localmente

```bash
npm install
npm run dev
```

## Painel administrativo

Acesse em `/#/admin/login` (link também no rodapé do site).

O login é controlado por `src/lib/authService.js`, usando as variáveis
de ambiente `VITE_ADMIN_EMAIL` e `VITE_ADMIN_PASSWORD` (defina-as no
`.env` local e como variáveis de ambiente na Vercel/host de produção
antes de publicar — sem elas configuradas, os valores padrão do código
ficam ativos, então não deixe de configurar em produção).

O painel permite gerenciar: Notícias/Cursos, Eventos, Documentos,
Diretoria e Parceiros — os mesmos tipos de conteúdo do site do
SINDICONDOMÍNIOS-PI.

## Conteúdo institucional

Todo o texto real (missão, visão, valores, objetivos estatutários,
categorias de associados, requisitos de filiação, estrutura da
diretoria) foi extraído do Estatuto Social consolidado (18/06/2026) e
está centralizado em `src/data/siteContent.js` — um único lugar para
revisar ou atualizar.

Dados pendentes de preenchimento (não inventados):
- Nomes de Vice-Presidência, Secretaria, Diretoria Financeira e
  Diretoria Administrativa (só Presidência e Diretoria Jurídica
  constavam assinados no estatuto)
- Fotos reais da diretoria (hoje usa iniciais como placeholder)
- Logos reais dos parceiros (hoje usa nomes em texto)

## Persistência de dados

Funciona com localStorage automaticamente (sem configuração). Para
persistência real entre dispositivos, configure o Supabase — copie
`.env.example` para `.env` e preencha as chaves, depois crie as
tabelas: `news`, `events`, `documents`, `board_members`, `partners`.

## Build de produção

```bash
npm run build
```
