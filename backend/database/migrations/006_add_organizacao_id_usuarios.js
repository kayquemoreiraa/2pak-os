module.exports = {
  up: async (pool) => {
    try {
      await pool.query(
        'ALTER TABLE usuarios ADD COLUMN organizacao_id CHAR(36) NULL AFTER id'
      );
      console.log('  + organizacao_id adicionado em "usuarios"');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('  ~ organizacao_id ja existe em "usuarios", ignorado');
      } else {
        throw err;
      }
    }
  },
  down: async (pool) => {
    try {
      await pool.query('ALTER TABLE usuarios DROP COLUMN organizacao_id');
    } catch (_) {}
  },
};
