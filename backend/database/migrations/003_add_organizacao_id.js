const TABELAS = ['status_prospeccao','empresas','contatos','observacoes','tarefas'];

module.exports = {
  up: async (pool) => {
    for (const tabela of TABELAS) {
      try {
        await pool.query(`ALTER TABLE ${tabela} ADD COLUMN organizacao_id CHAR(36) NULL AFTER id`);
        console.log('  + organizacao_id adicionado em "' + tabela + '"');
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log('  ~ organizacao_id ja existe em "' + tabela + '", ignorado');
        } else { throw err; }
      }
    }
  },
  down: async (pool) => {
    for (const tabela of TABELAS) {
      try { await pool.query('ALTER TABLE ' + tabela + ' DROP COLUMN organizacao_id'); } catch (_) {}
    }
  },
};
