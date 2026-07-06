module.exports = {
  up: async (pool) => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS organizacoes (
        id CHAR(36) NOT NULL PRIMARY KEY,
        nome VARCHAR(150) NOT NULL,
        slug VARCHAR(100) NOT NULL,
        plano ENUM('starter','professional','enterprise') NOT NULL DEFAULT 'starter',
        ativo BOOLEAN NOT NULL DEFAULT TRUE,
        data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_organizacoes_slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  },
  down: async (pool) => {
    await pool.query('DROP TABLE IF EXISTS organizacoes');
  },
};
