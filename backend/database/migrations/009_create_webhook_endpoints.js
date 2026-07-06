
// 🛰️ Rota de Telemetria (Injetada automaticamente para o Cockpit)
router.get('/logs', (req, res) => {
  try {
    const logsMockados = [
      {
        id: 1,
        status_code: 200,
        evento: "empresa.criada",
        url_destino: "https://webhook.site/d3b07384-d113-40e8-a320-c2306d860124",
        tentativas: 1,
        criado_em: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        payload: { event: "empresa.criada", tenantId: "tenant_01", data: { id: 99, nome: "Córtex Indústrias", cnpj: "00.000.000/0001-00" } },
        resposta_servidor: "HTTP/1.1 200 OK\nContent-Type: application/json\n\n{\"success\": true}"
      },
      {
        id: 2,
        status_code: 500,
        evento: "tarefa.criada",
        url_destino: "https://n8n.meusistema.com/webhook/v1/comercial",
        tentativas: 3,
        criado_em: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        payload: { event: "tarefa.criada", data: { id: 452, titulo: "Ligar para lead quente", prioridade: "alta" } },
        resposta_servidor: "HTTP/1.1 500 Internal Server Error\n\nTimeout executando a Stack do Workflow no n8n."
      }
    ];
    return res.json(logsMockados);
  } catch (error) {
    return res.status(500).json({ erro: "Erro na telemetria" });
  }
});
module.exports = {
  up: async (pool) => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS webhook_endpoints (
        id             CHAR(36)     NOT NULL PRIMARY KEY,
        organizacao_id CHAR(36)     NOT NULL,
        url            VARCHAR(500) NOT NULL,
        descricao      VARCHAR(200) NULL,
        eventos        TEXT         NOT NULL,
        secret         VARCHAR(100) NOT NULL,
        ativo          BOOLEAN      NOT NULL DEFAULT TRUE,
        criado_em      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY idx_webhook_endpoints_org (organizacao_id),
        KEY idx_webhook_endpoints_ativo (ativo)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  },
  down: async (pool) => {
    await pool.query('DROP TABLE IF EXISTS webhook_endpoints');
  },
};

