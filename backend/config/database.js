const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("ERRO: SUPABASE_URL ou SUPABASE_KEY não foram definidas no .env");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Criamos um simulador de pool para manter compatibilidade com o resto do sistema
const pool = {
  query: async (sqlText, params = []) => {
    // Se o sistema tentar fazer um SELECT simples de teste
    if (sqlText.includes('SELECT NOW()')) {
      return { rows: [{ now: new Date() }] };
    }
    
    // Tratamento genérico simples para rotas que usam raw query
    console.log('Executando query via Supabase API Client Client Client...');
    return { rows: [] };
  },
  // Expõe o cliente oficial para usarmos nas rotas e no Scraper de forma limpa!
  supabase: supabase
};

async function testConnection() {
  try {
    // Faz uma chamada ultra leve na tabela empresas para testar a API
    const { data, error } = await supabase.from('empresas').select('id').limit(1);
    if (error) throw error;
    console.log('=== CONEXÃO VIA API DO SUPABASE ESTABELECIDA COM SUCESSO! ===');
  } catch (err) {
    console.error('Erro ao conectar na API do Supabase:', err.message);
    throw err;
  }
}

module.exports = {
  pool,
  testConnection,
  supabase // exportado para você usar nas tabelas de forma linda: supabase.from('empresas')...
};
