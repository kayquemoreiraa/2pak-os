const { pool } = require('./config/database');

async function inspecionar() {
    try {
        // Algumas bibliotecas exigem .promise() caso o pool não esteja configurado assim por padrão
        const db = pool.promise ? pool.promise() : pool;

        const [rows] = await db.query('SELECT organizacao_id, COUNT(*) as total FROM empresas GROUP BY organizacao_id');
        console.log('--- RELATÓRIO DE ORGANIZAÇÕES (empresas) ---');
        console.table(rows);
        
        const [total] = await db.query('SELECT COUNT(*) as total_geral FROM empresas');
        console.log('--- TOTAL DE REGISTROS NA TABELA ---');
        console.table(total);
    } catch (err) {
        console.error('Erro ao consultar:', err.message);
    } finally {
        process.exit();
    }
}

inspecionar();
