module.exports = {
  up: async (pool) => {
    const colunas = [
      { nome: 'senha_hash',      ddl: 'ADD COLUMN senha_hash VARCHAR(255) NULL' },
      { nome: 'ultimo_login',    ddl: 'ADD COLUMN ultimo_login TIMESTAMP NULL' },
      { nome: 'data_atualizacao', ddl: 'ADD COLUMN data_atualizacao TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' },
    ];

    for (const col of colunas) {
      try {
        await pool.query('ALTER TABLE usuarios ' + col.ddl);
        console.log('  + ' + col.nome + ' adicionado em "usuarios"');
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log('  ~ ' + col.nome + ' ja existe em "usuarios", ignorado');
        } else {
          throw err;
        }
      }
    }

    try {
      await pool.query(
        "ALTER TABLE usuarios MODIFY COLUMN papel ENUM('admin','gestor','sdr','operacional') NOT NULL DEFAULT 'sdr'"
      );
      console.log('  + papel atualizado para ENUM correto em "usuarios"');
    } catch (_) {}
  },

  down: async (pool) => {
    try {
      await pool.query('ALTER TABLE usuarios DROP COLUMN senha_hash');
      await pool.query('ALTER TABLE usuarios DROP COLUMN ultimo_login');
      await pool.query('ALTER TABLE usuarios DROP COLUMN data_atualizacao');
    } catch (_) {}
  },
};
