const alteracoes = [
  { tabela: 'empresas',   colunas: ['responsavel_id','criado_por_id'] },
  { tabela: 'contatos',   colunas: ['responsavel_id','criado_por_id'] },
  { tabela: 'tarefas',    colunas: ['responsavel_id','criado_por_id'] },
  { tabela: 'observacoes', colunas: ['criado_por_id'] },
];

module.exports = {
  up: async (pool) => {
    for (const { tabela, colunas } of alteracoes) {
      for (const coluna of colunas) {
        try {
          await pool.query('ALTER TABLE ' + tabela + ' ADD COLUMN ' + coluna + ' CHAR(36) NULL');
          await pool.query('ALTER TABLE ' + tabela + ' ADD CONSTRAINT fk_' + tabela + '_' + coluna + ' FOREIGN KEY (' + coluna + ') REFERENCES usuarios (id) ON DELETE SET NULL');
          console.log('  + ' + coluna + ' adicionado em "' + tabela + '"');
        } catch (err) {
          if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('  ~ ' + coluna + ' ja existe em "' + tabela + '", ignorado');
          } else { throw err; }
        }
      }
    }
  },
  down: async (pool) => {
    for (const { tabela, colunas } of alteracoes) {
      for (const coluna of colunas) {
        try {
          await pool.query('ALTER TABLE ' + tabela + ' DROP FOREIGN KEY fk_' + tabela + '_' + coluna);
          await pool.query('ALTER TABLE ' + tabela + ' DROP COLUMN ' + coluna);
        } catch (_) {}
      }
    }
  },
};
