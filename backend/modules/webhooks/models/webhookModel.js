const { pool } = require('../../../config/database');
const { v4: uuidv4 } = require('uuid');

const WebhookModel = {
  async criarEndpoint(organizacaoId, dados) {
    const id = uuidv4();
    const secret = 'whsec_' + uuidv4().replace(/-/g, '');
    const { url, descricao, eventos } = dados;
    const eventosStr = Array.isArray(eventos) ? eventos.join(',') : eventos;
    await pool.query(
      `INSERT INTO webhook_endpoints (id, organizacao_id, url, descricao, eventos, secret, ativo)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, organizacaoId, url, descricao || null, eventosStr, secret, 1]
    );
    return { id, secret, url, descricao, eventos: eventosStr.split(',') };
  },

  async listarEndpoints(organizacaoId) {
    const [rows] = await pool.query(
      'SELECT id, url, descricao, eventos, ativo, criado_em FROM webhook_endpoints WHERE organizacao_id = ?',
      [organizacaoId]
    );
    return rows.map(r => ({ ...r, eventos: r.eventos.split(',') }));
  },

  async buscarPorId(id, organizacaoId) {
    const [rows] = await pool.query(
      'SELECT * FROM webhook_endpoints WHERE id = ? AND organizacao_id = ?',
      [id, organizacaoId]
    );
    if (rows.length === 0) return null;
    return { ...rows[0], eventos: rows[0].eventos.split(',') };
  },

  async deletarEndpoint(id, organizacaoId) {
    const [result] = await pool.query(
      'DELETE FROM webhook_endpoints WHERE id = ? AND organizacao_id = ?',
      [id, organizacaoId]
    );
    return result.affectedRows > 0;
  },

  async registrarLog(endpointId, evento, statusHttp, payload, resposta) {
    const id = uuidv4();
    await pool.query(
      `INSERT INTO webhook_logs
         (id, endpoint_id, evento, status_http, payload_enviado, resposta_recebida, sucesso)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id, endpointId, evento, statusHttp,
        JSON.stringify(payload), resposta || null,
        statusHttp >= 200 && statusHttp < 300 ? 1 : 0,
      ]
    );
    return id;
  },

  async buscarEndpointsPorEvento(evento, organizacaoId) {
    const [rows] = await pool.query(
      `SELECT * FROM webhook_endpoints
       WHERE organizacao_id = ? AND ativo = 1
         AND (eventos LIKE ? OR eventos = '*')`,
      [organizacaoId, '%' + evento + '%']
    );
    return rows.map(r => ({ ...r, eventos: r.eventos.split(',') }));
  },

  async listarLogs(organizacaoId, limite) {
    limite = limite || 50;
    const [rows] = await pool.query(
      `SELECT
         wl.id, wl.evento, wl.status_http,
         wl.payload_enviado, wl.resposta_recebida,
         wl.sucesso, wl.criado_em,
         we.url AS url_destino
       FROM webhook_logs wl
       JOIN webhook_endpoints we ON wl.endpoint_id = we.id
       WHERE we.organizacao_id = ?
       ORDER BY wl.criado_em DESC
       LIMIT ?`,
      [organizacaoId, limite]
    );
    return rows.map(r => ({
      ...r,
      payload_enviado: r.payload_enviado ? JSON.parse(r.payload_enviado) : null,
      sucesso: r.sucesso === 1,
    }));
  },
};

module.exports = WebhookModel;
