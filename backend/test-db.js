const supabase = require('./config/supabaseClient');

async function testar() {
    console.log('Tentando conectar ao Supabase...');
    const { data, error } = await supabase.from('empresas').select('*').limit(1);
    
    if (error) {
        console.error('Erro de conexão:', error.message);
    } else {
        console.log('Conexão funcionando! Tudo ok.');
        console.log('Dados recebidos:', data);
    }
}
testar();
