# FinançasGO - Microsaas de Controle Financeiro

Um sistema completo de controle financeiro pessoal desenvolvido como microsaas, com integração do Mercado Pago para assinaturas recorrentes e Supabase para banco de dados.

## 🚀 Funcionalidades

### ✅ Implementadas
- **Dashboard Completo**: Visão geral das finanças com gráficos e estatísticas
- **Gestão de Transações**: Receitas, despesas e transferências
- **Categorias Personalizáveis**: Organize suas transações por categoria
- **Contas Bancárias**: Gerencie múltiplas contas (corrente, poupança, investimentos)
- **Cartões de Crédito**: Controle de limites e faturas
- **Simulador Financeiro**: 
  - Simulador de investimentos (juros compostos)
  - Simulador de financiamentos
  - Planejamento de aposentadoria
  - Simulador de metas financeiras
- **Sistema de Assinaturas**: 
  - Plano Mensal: R$ 4,90/mês
  - Plano Anual: R$ 39,90/ano (economia de 32%)
  - Trial de 7 dias
- **Autenticação Completa**: Login/cadastro com Supabase Auth
- **Tema Escuro/Claro**: Interface adaptável
- **Exportação de Dados**: Backup completo em JSON
- **Responsivo**: Funciona em desktop e mobile

### 🎨 Interface
- Design moderno com Tailwind CSS
- Componentes interativos
- Notificações em tempo real
- Gráficos e estatísticas visuais
- Experiência mobile otimizada

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Pagamentos**: Mercado Pago (Assinaturas Recorrentes)
- **Deploy**: Vercel (recomendado)

## 📋 Pré-requisitos

- Node.js 18+ 
- Conta no Supabase
- Conta no Mercado Pago
- Git

## ⚡ Instalação e Configuração

### 1. Clone o Repositório
```bash
git clone [seu-repositorio]
cd financasGO
npm install
```

### 2. Configure o Supabase

#### 2.1 Crie um projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta/projeto
3. Vá em Settings > API para obter as chaves

#### 2.2 Execute o SQL de configuração
1. No painel do Supabase, vá em SQL Editor
2. Cole o conteúdo do arquivo `supabase-setup.sql`
3. Execute o script para criar todas as tabelas e configurações

#### 2.3 Configure a URL de redirecionamento
1. No Supabase, vá em Authentication > URL Configuration
2. Adicione as URLs:
   - Site URL: `http://localhost:3000` (dev) / `https://seudominio.com` (prod)
   - Redirect URLs: 
     - `http://localhost:3000/dashboard`
     - `https://seudominio.com/dashboard`

### 3. Configure o Mercado Pago

#### 3.1 Crie uma conta de desenvolvedor
1. Acesse [developers.mercadopago.com](https://developers.mercadopago.com)
2. Crie uma aplicação
3. Obtenha as credenciais de teste e produção

#### 3.2 Configure o Webhook
1. No painel do Mercado Pago, configure o webhook para:
   - URL: `https://seudominio.com/api/webhook`
   - Eventos: `subscription`

### 4. Variáveis de Ambiente

Copie `.env.local` e configure:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_publica_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_supabase

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=seu_access_token_mercadopago
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=sua_chave_publica_mercadopago

# Webhook Security
WEBHOOK_SECRET=uma_chave_secreta_aleatoria

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Execute o Projeto

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

Acesse: http://localhost:3000

## 🚀 Deploy na Vercel

### 1. Conecte o Repositório
1. Acesse [vercel.com](https://vercel.com)
2. Conecte seu repositório GitHub
3. Configure as variáveis de ambiente

### 2. Configure as Variáveis
No painel da Vercel, adicione todas as variáveis do `.env.local`

### 3. Atualize URLs
Após o deploy, atualize:
- URLs no Supabase (Settings > Authentication)
- Webhook URL no Mercado Pago
- `NEXT_PUBLIC_SITE_URL` na Vercel

## 💳 Configuração de Pagamentos

### Fluxo de Assinatura
1. Usuário seleciona plano (mensal/anual)
2. Sistema cria assinatura no Mercado Pago
3. Usuário é redirecionado para pagamento
4. Webhook confirma pagamento
5. Sistema ativa assinatura no banco

### Testando Pagamentos
Use as credenciais de teste do Mercado Pago e os cartões de teste disponíveis na documentação.

## 🗄️ Estrutura do Banco de Dados

### Principais Tabelas
- `users`: Usuários e status de assinatura
- `transactions`: Transações financeiras
- `categories`: Categorias de receitas/despesas
- `accounts`: Contas bancárias
- `cards`: Cartões de crédito
- `subscriptions`: Assinaturas do Mercado Pago

### Row Level Security (RLS)
Todas as tabelas possuem RLS ativado, garantindo que usuários só acessem seus próprios dados.

## 🔧 Personalização

### Alterando Preços
1. Modifique os valores em `src/app/page.tsx`
2. Atualize a API em `src/app/api/subscription/create/route.ts`
3. Ajuste o webhook em `src/app/api/webhook/route.ts`

### Adicionando Funcionalidades
1. Crie novas páginas em `src/app/dashboard/`
2. Adicione rotas no `src/components/Sidebar.tsx`
3. Implemente a lógica de negócio
4. Atualize o banco se necessário

### Customizando Tema
- Modifique as cores em `tailwind.config.js`
- Atualize as variáveis CSS em `src/app/globals.css`

## 📊 Monitoramento

### Métricas Importantes
- Taxa de conversão de trial para pago
- Churn rate mensal
- Revenue por usuário (ARPU)
- Uso das funcionalidades

### Logs
- Verificar logs do Supabase para erros de banco
- Monitorar webhook do Mercado Pago
- Acompanhar métricas da Vercel

## 🐛 Troubleshooting

### Problemas Comuns

**Erro de autenticação**
- Verifique as URLs de redirecionamento no Supabase
- Confirme as chaves de API

**Webhook não funcionando**
- Teste a URL do webhook
- Verifique os logs do Mercado Pago
- Confirme a assinatura do webhook

**Erro no banco de dados**
- Execute novamente o script SQL
- Verifique as permissões RLS
- Confirme a conexão com Supabase

## 📚 Recursos Adicionais

- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação do Mercado Pago](https://www.mercadopago.com.br/developers)
- [Documentação do Next.js](https://nextjs.org/docs)
- [Documentação do Tailwind CSS](https://tailwindcss.com/docs)

## 📄 Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para suporte técnico ou dúvidas sobre implementação, abra uma issue no repositório.

---

Desenvolvido com ❤️ para ajudar pessoas a organizarem suas finanças pessoais.
