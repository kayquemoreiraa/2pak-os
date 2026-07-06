module.exports = {
  up: async (pool) => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS automacoes (
        id             CHAR(36)  NOT NULL PRIMARY KEY,
        organizacao_id CHAR(36)  NOT NULL,
        nome           VARCHAR(200) NOT NULL,
        descricao      TEXT      NULL,
        trigger_evento VARCHAR(100) NOT NULL,
        acoes          JSON      NOT NULL,
        ativo          BOOLEAN   NOT NULL DEFAULT TRUE,
        criado_por_id  CHAR(36)  NULL,
        data_criacao   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_automacoes_org   (organizacao_id),
        KEY idx_automacoes_evento (trigger_evento),
        KEY idx_automacoes_ativo  (ativo)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS automacao_logs (
        id             CHAR(36)  NOT NULL PRIMARY KEY,
        automacao_id   CHAR(36)  NOT NULL,
        trigger_evento VARCHAR(100) NOT NULL,
        payload_entrada JSON     NULL,
        acoes_executadas JSON    NULL,
        status         ENUM('sucesso','erro','parcial') NOT NULL DEFAULT 'sucesso',
        erro_mensagem  TEXT      NULL,
        data_execucao  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY idx_automacao_logs_automacao (automacao_id),
        KEY idx_automacao_logs_status    (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  },
  down: async (pool) => {
    await pool.query('DROP TABLE IF EXISTS automacao_logs');
    await pool.query('DROP TABLE IF EXISTS automacoes');
  },
};
