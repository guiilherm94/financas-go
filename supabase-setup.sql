-- FinançasGO - Setup SQL (Versão Corrigida para Supabase)
-- NOTA: Removi a linha "ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;" 
-- pois não temos permissão para modificar tabelas do schema auth

-- Criar tabela de usuários estendida
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'expired')),
  subscription_plan TEXT CHECK (subscription_plan IN ('monthly', 'yearly')),
  subscription_end_date TIMESTAMPTZ,
  mercadopago_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de categorias
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  emoji TEXT NOT NULL DEFAULT '💰',
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de contas
CREATE TABLE public.accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'investment', 'cash')),
  balance DECIMAL(15,2) DEFAULT 0,
  emoji TEXT NOT NULL DEFAULT '🏦',
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de cartões
CREATE TABLE public.cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  limit_amount DECIMAL(15,2) DEFAULT 0,
  closing_day INTEGER NOT NULL CHECK (closing_day >= 1 AND closing_day <= 31),
  due_day INTEGER NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
  emoji TEXT NOT NULL DEFAULT '💳',
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de transações
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer', 'card')),
  amount DECIMAL(15,2) NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  card_id UUID REFERENCES public.cards(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_type TEXT CHECK (recurring_type IN ('daily', 'weekly', 'monthly', 'yearly')),
  parent_transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  invoice_group_id TEXT,
  is_paid BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de assinaturas do Mercado Pago
CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  mercadopago_subscription_id TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('monthly', 'yearly')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'authorized', 'paused', 'cancelled')),
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Criar índices para performance
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(date);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_categories_user_id ON public.categories(user_id);
CREATE INDEX idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX idx_cards_user_id ON public.cards(user_id);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_mercadopago_id ON public.subscriptions(mercadopago_subscription_id);

-- Configurar Row Level Security (RLS)

-- Política para users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Política para categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own categories" ON public.categories FOR ALL USING (auth.uid() = user_id);

-- Política para accounts
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own accounts" ON public.accounts FOR ALL USING (auth.uid() = user_id);

-- Política para cards
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own cards" ON public.cards FOR ALL USING (auth.uid() = user_id);

-- Política para transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id);

-- Política para subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service can manage all subscriptions" ON public.subscriptions FOR ALL USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Função para criar usuário automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Trigger para criar usuário automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Inserir categorias padrão para novos usuários
CREATE OR REPLACE FUNCTION public.create_default_categories_for_user(user_uuid UUID)
RETURNS void AS $$
BEGIN
  -- Categorias de receita padrão
  INSERT INTO public.categories (user_id, name, type, emoji, color) VALUES
    (user_uuid, 'Salário', 'income', '💰', '#6366f1'),
    (user_uuid, 'Investimentos', 'income', '📈', '#10b981'),
    (user_uuid, 'Freelance', 'income', '💻', '#f59e0b'),
    (user_uuid, 'Vendas', 'income', '💵', '#8b5cf6'),
    (user_uuid, 'Bonus', 'income', '💸', '#ec4899'),
    (user_uuid, 'Aluguel', 'income', '🏠', '#6366f1'),
    (user_uuid, 'Dividendos', 'income', '📊', '#10b981');

  -- Categorias de despesa padrão
  INSERT INTO public.categories (user_id, name, type, emoji, color) VALUES
    (user_uuid, 'Alimentação', 'expense', '🍔', '#ef4444'),
    (user_uuid, 'Transporte', 'expense', '🚗', '#6366f1'),
    (user_uuid, 'Moradia', 'expense', '🏠', '#10b981'),
    (user_uuid, 'Lazer', 'expense', '🎬', '#f59e0b'),
    (user_uuid, 'Saúde', 'expense', '💊', '#8b5cf6'),
    (user_uuid, 'Educação', 'expense', '📚', '#ec4899'),
    (user_uuid, 'Vestuário', 'expense', '👕', '#f97316'),
    (user_uuid, 'Tecnologia', 'expense', '📱', '#06b6d4');
END;
$$ language plpgsql security definer;

-- Trigger para criar categorias padrão para novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user_categories()
RETURNS trigger AS $$
BEGIN
  PERFORM public.create_default_categories_for_user(NEW.id);
  RETURN NEW;
END;
$$ language plpgsql security definer;

CREATE TRIGGER on_user_created_categories
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_categories();

-- Função para calcular saldo de conta com base nas transações
CREATE OR REPLACE FUNCTION public.calculate_account_balance(account_uuid UUID, end_date DATE DEFAULT CURRENT_DATE)
RETURNS DECIMAL(15,2) AS $$
DECLARE
  initial_balance DECIMAL(15,2);
  transaction_sum DECIMAL(15,2);
BEGIN
  -- Buscar saldo inicial da conta
  SELECT balance INTO initial_balance 
  FROM public.accounts 
  WHERE id = account_uuid;
  
  -- Calcular soma das transações até a data especificada
  SELECT COALESCE(SUM(
    CASE 
      WHEN type = 'income' THEN amount
      WHEN type = 'expense' THEN -amount
      ELSE 0
    END
  ), 0) INTO transaction_sum
  FROM public.transactions 
  WHERE account_id = account_uuid 
    AND date <= end_date 
    AND is_paid = true;
    
  RETURN COALESCE(initial_balance, 0) + COALESCE(transaction_sum, 0);
END;
$$ language plpgsql security definer;

-- Função para calcular gastos do cartão no mês
CREATE OR REPLACE FUNCTION public.calculate_card_usage(card_uuid UUID, target_month INTEGER, target_year INTEGER)
RETURNS DECIMAL(15,2) AS $$
DECLARE
  usage_sum DECIMAL(15,2);
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO usage_sum
  FROM public.transactions 
  WHERE card_id = card_uuid 
    AND type = 'card'
    AND EXTRACT(MONTH FROM date) = target_month
    AND EXTRACT(YEAR FROM date) = target_year;
    
  RETURN usage_sum;
END;
$$ language plpgsql security definer;

-- Comentários das tabelas
COMMENT ON TABLE public.users IS 'Tabela de usuários estendida com informações de assinatura';
COMMENT ON TABLE public.categories IS 'Categorias de receitas e despesas dos usuários';
COMMENT ON TABLE public.accounts IS 'Contas bancárias e de investimento dos usuários';
COMMENT ON TABLE public.cards IS 'Cartões de crédito dos usuários';
COMMENT ON TABLE public.transactions IS 'Transações financeiras dos usuários';
COMMENT ON TABLE public.subscriptions IS 'Assinaturas do Mercado Pago';
