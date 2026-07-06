module.exports = {
  up: async (pool) => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS webhook_logs (
        id                CHAR(36)  NOT NULL PRIMARY KEY,
        endpoint_id       CHAR(36)  NOT NULL,
        evento            VARCHAR(100) NOT NULL,
        status_http       INT       NULL,
        payload_enviado   TEXT      NULL,
        resposta_recebida TEXT      NULL,
        sucesso           BOOLEAN   NOT NULL DEFAULT FALSE,
        criado_em         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY idx_webhook_logs_endpoint (endpoint_id),
        KEY idx_webhook_logs_evento (evento),
        KEY idx_webhook_logs_sucesso (sucesso)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  },
  down: async (pool) => {
    await pool.query('DROP TABLE IF EXISTS webhook_logs');
  },
};
