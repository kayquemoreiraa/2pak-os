module.exports = {
  up: async (pool) => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id CHAR(36) NOT NULL PRIMARY KEY,
        organizacao_id CHAR(36) NULL,
        nome VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL,
        senha_hash VARCHAR(255) NOT NULL,
        papel ENUM('admin','gestor','sdr','operacional') NOT NULL DEFAULT 'sdr',
        ativo BOOLEAN NOT NULL DEFAULT TRUE,
        ultimo_login TIMESTAMP NULL,
        data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_usuarios_email (email),
        KEY idx_usuarios_papel (papel),
        KEY idx_usuarios_organizacao (organizacao_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  },
  down: async (pool) => {
    await pool.query('DROP TABLE IF EXISTS usuarios');
  },
};
