module.exports = {
  up: async (pool) => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notificacoes (
        id CHAR(36) NOT NULL PRIMARY KEY,
        organizacao_id CHAR(36) NULL,
        usuario_id CHAR(36) NULL,
        tipo VARCHAR(50) NOT NULL,
        titulo VARCHAR(200) NOT NULL,
        mensagem TEXT NULL,
        lida BOOLEAN NOT NULL DEFAULT FALSE,
        link VARCHAR(255) NULL,
        data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY idx_notificacoes_usuario (usuario_id),
        KEY idx_notificacoes_lida (lida),
        KEY idx_notificacoes_organizacao (organizacao_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  },
  down: async (pool) => {
    await pool.query('DROP TABLE IF EXISTS notificacoes');
  },
};
