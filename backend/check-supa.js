require('dotenv').config();
const supabase = require('./config/supabaseClient');

async function testar() {
    try {
        console.log('Testando conexão com Supabase...');
        // Tenta buscar algo simples ou apenas verificar a conexão
        const { error } = await supabase.from('empresas').select('id').limit(1);
        if (error) throw error;
        console.log('✅ Supabase conectado com sucesso!');
    } catch (err) {
        console.error('❌ Erro de conexão com Supabase:', err.message);
    }
}
testar();