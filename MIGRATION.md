# Script de Migração - FinançasGO HTML para Supabase

Este script ajuda a migrar dados do sistema HTML original para o novo sistema com Supabase.

## Como usar

1. Abra o arquivo HTML original no navegador
2. Abra o Console do Desenvolvedor (F12)
3. Cole e execute o script abaixo
4. Copie o JSON gerado
5. Use na nova aplicação

```javascript
// Script de Migração - FinançasGO
// Execute no console do navegador com o arquivo HTML original aberto

function migrateFinancasGoData() {
  console.log('🔄 Iniciando migração de dados do FinançasGO...');
  
  try {
    // Tentar acessar dados do IndexedDB primeiro
    let migratedData = {};
    
    // Função para carregar do localStorage como fallback
    function loadFromLocalStorage(key) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.warn(`Erro ao carregar ${key} do localStorage:`, error);
        return null;
      }
    }
    
    // Carregar dados principais
    const financeData = loadFromLocalStorage('finance_data');
    const userData = loadFromLocalStorage('finance_user');
    const licenseData = loadFromLocalStorage('finance_license');
    
    if (!financeData) {
      console.error('❌ Nenhum dado encontrado no localStorage');
      return null;
    }
    
    console.log('📊 Dados encontrados:', financeData);
    
    // Estruturar dados para migração
    migratedData = {
      user: userData || {
        name: 'Usuário Migrado',
        email: 'usuario@financasgo.com'
      },
      
      // Categorias de receita
      incomeCategories: (financeData.categories?.income || []).map(cat => ({
        name: cat.name,
        emoji: cat.emoji,
        color: cat.color,
        type: 'income'
      })),
      
      // Categorias de despesa  
      expenseCategories: (financeData.categories?.expense || []).map(cat => ({
        name: cat.name,
        emoji: cat.emoji,
        color: cat.color,
        type: 'expense'
      })),
      
      // Contas
      accounts: (financeData.accounts || []).map(acc => ({
        name: acc.name,
        type: acc.type || 'checking',
        balance: acc.balance || acc.initialBalance || 0,
        emoji: acc.emoji || '🏦',
        color: acc.color || '#6366f1'
      })),
      
      // Cartões
      cards: (financeData.cards || []).map(card => ({
        name: card.name,
        limit: card.limit || 0,
        closing_day: card.closingDay || 5,
        due_day: card.dueDay || 15,
        emoji: card.emoji || '💳',
        color: card.color || '#6366f1'
      })),
      
      // Transações
      transactions: (financeData.transactions || []).map(trans => ({
        type: trans.type,
        amount: trans.amount,
        description: trans.description || trans.name,
        category_id: trans.category, // Será mapeado depois
        account_id: trans.account,   // Será mapeado depois
        card_id: trans.card,         // Será mapeado depois
        date: trans.date,
        is_paid: trans.completed !== false,
        is_recurring: trans.isRecurring || false,
        recurring_type: trans.recurringType || null
      })),
      
      // Metadados
      migrationInfo: {
        originalSystem: 'FinançasGO HTML v1.2.7',
        migratedAt: new Date().toISOString(),
        totalTransactions: financeData.transactions?.length || 0,
        totalCategories: {
          income: financeData.categories?.income?.length || 0,
          expense: financeData.categories?.expense?.length || 0
        },
        totalAccounts: financeData.accounts?.length || 0,
        totalCards: financeData.cards?.length || 0
      }
    };
    
    console.log('✅ Migração concluída com sucesso!');
    console.log('📋 Resumo:', migratedData.migrationInfo);
    
    // Gerar JSON para download
    const jsonString = JSON.stringify(migratedData, null, 2);
    
    // Criar arquivo para download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financasgo-migration-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('💾 Arquivo de migração baixado!');
    console.log('📄 Use este JSON na nova aplicação para importar seus dados.');
    
    return migratedData;
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    return null;
  }
}

// Executar migração
const dadosMigrados = migrateFinancasGoData();

if (dadosMigrados) {
  console.log('🎉 Migração bem-sucedida!');
  console.log('📊 Dados migrados:', dadosMigrados);
  console.log('');
  console.log('📋 PRÓXIMOS PASSOS:');
  console.log('1. ✅ Arquivo JSON foi baixado automaticamente');
  console.log('2. 🚀 Acesse sua nova aplicação FinançasGO');
  console.log('3. 📁 Vá em Configurações > Importar Dados');
  console.log('4. 📤 Faça upload do arquivo JSON baixado');
  console.log('5. ✨ Seus dados serão importados automaticamente!');
} else {
  console.log('❌ Falha na migração. Verifique se há dados no localStorage.');
}
```

## Instruções Detalhadas

### 1. Preparação
- ✅ Certifique-se que o arquivo HTML original está funcionando
- ✅ Abra o arquivo no navegador
- ✅ Verifique se seus dados estão visíveis na aplicação

### 2. Executar Migração
1. Pressione `F12` para abrir DevTools
2. Vá na aba `Console`
3. Cole todo o script acima
4. Pressione `Enter` para executar
5. Aguarde a execução (poucos segundos)

### 3. Resultado Esperado
```
🔄 Iniciando migração de dados do FinançasGO...
📊 Dados encontrados: {transactions: Array(50), categories: {...}, ...}
✅ Migração concluída com sucesso!
📋 Resumo: {originalSystem: "FinançasGO HTML v1.2.7", ...}
💾 Arquivo de migração baixado!
🎉 Migração bem-sucedida!
```

### 4. Importar na Nova Aplicação
1. Acesse sua nova aplicação FinançasGO
2. Faça login na sua conta
3. Vá em `Configurações` > `Dados` > `Importar`
4. Faça upload do arquivo JSON baixado
5. Confirme a importação

## Estrutura do Arquivo Migrado

```json
{
  "user": {
    "name": "Nome do Usuário",
    "email": "email@exemplo.com"
  },
  "incomeCategories": [...],
  "expenseCategories": [...],
  "accounts": [...],
  "cards": [...],
  "transactions": [...],
  "migrationInfo": {
    "originalSystem": "FinançasGO HTML v1.2.7",
    "migratedAt": "2025-01-01T00:00:00.000Z",
    "totalTransactions": 100,
    "totalCategories": {...},
    "totalAccounts": 3,
    "totalCards": 2
  }
}
```

## Resolução de Problemas

### ❌ "Nenhum dado encontrado"
- Verifique se você está no arquivo HTML correto
- Confirme se há dados visíveis na aplicação original
- Tente recarregar a página e executar novamente

### ❌ Erro durante execução
- Abra um novo console (Ctrl+Shift+J)
- Execute o script em partes menores
- Verifique se não há errors anteriores no console

### ❌ Download não funciona
- Copie manualmente o JSON do console
- Salve em um arquivo `.json` 
- Use este arquivo para importação

### ❌ Dados incompletos
- Verifique se todas as seções estão preenchidas no original
- Execute a migração novamente
- Confira os logs do console para detalhes

## ⚠️ Importante

- **Backup**: Mantenha o arquivo HTML original como backup
- **Validação**: Confira se todos os dados foram migrados corretamente
- **Teste**: Teste a nova aplicação antes de descartar a antiga
- **Suporte**: Em caso de problemas, entre em contato com o suporte

## 🎯 Dicas de Migração

1. **Migre durante baixo uso**: Evite migrar durante reconciliações importantes
2. **Valide dados**: Compare totais antes e depois da migração  
3. **Categorias**: Verifique se todas as categorias foram criadas corretamente
4. **Saldos**: Confirme se os saldos das contas estão corretos
5. **Histórico**: Verifique se transações antigas estão preservadas

---

**Sucesso na migração! 🚀 Bem-vindo ao novo FinançasGO!**
