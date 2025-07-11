# 🚀 Passo a Passo - Deploy Online (GitHub + Vercel)

Este guia te permite testar o FinançasGO **sem instalar nada no seu computador**! Tudo será feito online usando GitHub e Vercel.

## 📋 Pré-requisitos

Você vai precisar de contas em:
- [ ] [GitHub](https://github.com) (gratuito)
- [ ] [Vercel](https://vercel.com) (gratuito)
- [ ] [Supabase](https://supabase.com) (gratuito)
- [ ] [Mercado Pago Developers](https://developers.mercadopago.com) (gratuito)

---

## 📂 PASSO 1: Criar Repositório no GitHub

### 1.1 Criar Novo Repositório
1. ✅ Acesse [github.com](https://github.com)
2. ✅ Clique no botão **"New"** (verde, no canto superior direito)
3. ✅ Preencha:
   - **Repository name**: `financasgo-saas`
   - **Description**: `Sistema de controle financeiro - Microsaas`
   - ✅ Marque **"Public"** (ou Private se preferir)
   - ✅ Marque **"Add a README file"**
4. ✅ Clique em **"Create repository"**

### 1.2 Upload dos Arquivos
1. ✅ Na página do seu repositório, clique em **"uploading an existing file"**
2. ✅ **Arraste TODOS os arquivos** da pasta `C:\Users\OS\Desktop\financasGO\` para a área de upload
   - ⚠️ **IMPORTANTE**: Não faça upload do arquivo `.env.local` (contém senhas)
   - ⚠️ **IMPORTANTE**: Não faça upload da pasta `node_modules` (se existir)
3. ✅ Aguarde o upload completar (pode demorar alguns minutos)
4. ✅ No campo **"Commit changes"**, escreva: `Inicial - FinançasGO Microsaas`
5. ✅ Clique em **"Commit changes"**

---

## 🗄️ PASSO 2: Configurar Supabase

### 2.1 Criar Projeto
1. ✅ Acesse [supabase.com](https://supabase.com)
2. ✅ Clique em **"Start your project"**
3. ✅ Faça login com GitHub (recomendado) ou crie conta
4. ✅ Clique em **"New Project"**
5. ✅ Preencha:
   - **Name**: `financasgo-db`
   - **Database Password**: Crie uma senha forte (anote!)
   - **Region**: `South America (São Paulo)`
6. ✅ Clique em **"Create new project"**
7. ✅ Aguarde 2-3 minutos (preparação do banco)

### 2.2 Configurar Banco de Dados
1. ✅ Quando o projeto estiver pronto, clique na aba **"SQL Editor"** (lateral esquerda)
2. ✅ Clique em **"New query"**
3. ✅ **COPIE TODO O CONTEÚDO** do arquivo `supabase-setup.sql` do seu projeto
4. ✅ **COLE NO EDITOR** do Supabase
5. ✅ Clique em **"RUN"** (botão azul)
6. ✅ Aguarde a execução (deve aparecer "Success")

### 2.3 Obter Credenciais
1. ✅ Clique em **"Settings"** (engrenagem na lateral)
2. ✅ Clique em **"API"**
3. ✅ **ANOTE** estas informações (vamos usar depois):
   ```
   Project URL: https://xxx.supabase.co
   anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## 💳 PASSO 3: Configurar Mercado Pago

### 3.1 Criar Aplicação
1. ✅ Acesse [developers.mercadopago.com](https://developers.mercadopago.com)
2. ✅ Faça login com sua conta Mercado Pago
3. ✅ Clique em **"Criar aplicação"**
4. ✅ Preencha:
   - **Nome**: `FinançasGO`
   - **Descrição**: `Sistema de controle financeiro`
   - **Categoria**: `Serviços financeiros`
   - **Modelo de integração**: `Checkout Pro`
5. ✅ Clique em **"Criar aplicação"**

### 3.2 Obter Credenciais de TESTE
1. ✅ Na página da aplicação criada
2. ✅ Vá na aba **"Credenciais de teste"**
3. ✅ **ANOTE** estas informações:
   ```
   Public Key: TEST-xxx
   Access Token: TEST-xxx
   ```
4. ⚠️ **IMPORTANTE**: Use sempre credenciais de TESTE primeiro!

---

## 🚀 PASSO 4: Deploy na Vercel

### 4.1 Conectar Repositório
1. ✅ Acesse [vercel.com](https://vercel.com)
2. ✅ Clique em **"Continue with GitHub"**
3. ✅ Autorize a Vercel a acessar seus repositórios
4. ✅ Clique em **"Import"** ao lado do repositório `financasgo-saas`

### 4.2 Configurar Variáveis de Ambiente
1. ✅ Na tela de configuração, clique em **"Environment Variables"**
2. ✅ Adicione **UMA POR UMA** as seguintes variáveis:

```bash
# SUPABASE (use os dados que você anotou)
NEXT_PUBLIC_SUPABASE_URL
# Cole: https://xxx.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY  
# Cole: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

SUPABASE_SERVICE_ROLE_KEY
# Cole: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# MERCADO PAGO (use credenciais de TESTE)
MERCADOPAGO_ACCESS_TOKEN
# Cole: TEST-xxx

NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
# Cole: TEST-xxx

# SEGURANÇA
WEBHOOK_SECRET
# Cole: minha_chave_secreta_123

# SITE URL (deixe vazio por enquanto)
NEXT_PUBLIC_SITE_URL
# Deixe vazio - será preenchido automaticamente
```

### 4.3 Fazer Deploy
1. ✅ Após adicionar todas as variáveis, clique em **"Deploy"**
2. ✅ Aguarde o build (3-5 minutos)
3. ✅ Se aparecer ✅ **"Deployment completed"**, está pronto!
4. ✅ Clique no link gerado (ex: `https://financasgo-saas.vercel.app`)

---

## ⚙️ PASSO 5: Configurações Finais

### 5.1 Atualizar SITE_URL na Vercel
1. ✅ Na página da Vercel, vá em **"Settings"** → **"Environment Variables"**
2. ✅ Encontre `NEXT_PUBLIC_SITE_URL`
3. ✅ Clique em **"Edit"** 
4. ✅ Cole a URL do seu site (ex: `https://financasgo-saas.vercel.app`)
5. ✅ Clique em **"Save"**
6. ✅ Vá na aba **"Deployments"** e clique **"Redeploy"** (force redeploy)

### 5.2 Configurar URLs no Supabase
1. ✅ Volte ao painel do Supabase
2. ✅ Vá em **"Authentication"** → **"URL Configuration"**
3. ✅ Preencha:
   - **Site URL**: `https://financasgo-saas.vercel.app`
   - **Redirect URLs**: `https://financasgo-saas.vercel.app/dashboard`
4. ✅ Clique em **"Save"**

### 5.3 Configurar Webhook no Mercado Pago
1. ✅ Volte ao painel do Mercado Pago
2. ✅ Na sua aplicação, vá em **"Webhooks"**
3. ✅ Clique em **"Configurar webhook"**
4. ✅ Preencha:
   - **URL**: `https://financasgo-saas.vercel.app/api/webhook`
   - **Eventos**: ✅ Marque apenas **"Subscriptions"**
5. ✅ Clique em **"Salvar"**

---

## 🧪 PASSO 6: Testar Tudo

### 6.1 Teste Básico
1. ✅ Acesse sua aplicação: `https://financasgo-saas.vercel.app`
2. ✅ Deve aparecer a página inicial com os planos
3. ✅ Clique em **"Começar Agora"** (qualquer plano)
4. ✅ Crie uma conta de teste
5. ✅ Deve redirecionar para o dashboard

### 6.2 Teste de Assinatura (OPCIONAL)
1. ✅ No dashboard, vá em **"Configurações"** → **"Assinatura"**
2. ✅ Clique em **"Assinar Mensal"** ou **"Assinar Anual"**
3. ✅ Deve abrir o Mercado Pago
4. ✅ Use um **cartão de teste** do MP:
   - **Cartão**: `4111 1111 1111 1111`
   - **Vencimento**: `11/25`
   - **CVV**: `123`
   - **Nome**: `APRO` (aprovação automática)

### 6.3 Verificar Funcionalidades
1. ✅ **Dashboard**: Gráficos e estatísticas aparecem?
2. ✅ **Transações**: Consegue criar/editar/excluir?
3. ✅ **Categorias**: Consegue personalizar?
4. ✅ **Contas**: Consegue adicionar contas?
5. ✅ **Cartões**: Consegue adicionar cartões?
6. ✅ **Simulador**: Calculadoras funcionam?
7. ✅ **Configurações**: Consegue exportar dados?

---

## 🐛 Resolução de Problemas

### ❌ **Build falhou na Vercel**
1. ✅ Verifique se todos os arquivos foram enviados ao GitHub
2. ✅ Confirme se as variáveis de ambiente estão corretas
3. ✅ Vá em **"Functions"** → **"View Function Logs"** para ver o erro

### ❌ **Erro de "Invalid redirect URL"**
1. ✅ Verifique se a URL no Supabase está igual à da Vercel
2. ✅ Confirme se tem `/dashboard` no final da redirect URL
3. ✅ Teste fazer logout e login novamente

### ❌ **Webhook não funciona**
1. ✅ Verifique se a URL do webhook está correta
2. ✅ Confirme se tem `/api/webhook` no final
3. ✅ Teste fazer uma compra de teste

### ❌ **Página em branco**
1. ✅ Abra F12 → Console e veja se há erros
2. ✅ Verifique se as variáveis do Supabase estão corretas
3. ✅ Tente recarregar a página

---

## 🎉 Pronto! Seu Microsaas Está no Ar!

Se chegou até aqui, parabéns! 🎊 Seu FinançasGO está funcionando e pronto para:

### ✅ **O que você tem agora:**
- 🌐 **Site funcionando** na Vercel
- 💾 **Banco de dados** configurado no Supabase  
- 💳 **Pagamentos** configurados no Mercado Pago
- 🔐 **Autenticação** funcionando
- 📊 **Todas as funcionalidades** operacionais

### 🚀 **Próximos passos sugeridos:**
1. **Teste com amigos** para validar
2. **Configure domínio próprio** (opcional)
3. **Mude para credenciais de produção** do MP
4. **Faça marketing** e comece a vender!

### 📞 **Suporte:**
Se tiver problemas:
1. ✅ Verifique este guia novamente
2. ✅ Confira logs da Vercel
3. ✅ Teste cada componente separadamente

---

## 💰 **Seu Microsaas Está Pronto para Gerar Receita!**

**URL do seu projeto**: `https://financasgo-saas.vercel.app`

🎯 **Meta**: Conquistar os primeiros usuários pagantes em 30 dias!

**Boa sorte com seu novo negócio! 🚀💰**
