const { pool } = require('../../../config/database');
const { v4: uuidv4 } = require('uuid');

async function findAll(organizacao_id) {
  const [rows] = await pool.query(
    `SELECT * FROM automacoes
     WHERE organizacao_id = ?
     ORDER BY data_criacao DESC`,
    [organizacao_id]
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM automacoes WHERE id = ?', [id]);
  return rows[0] || null;
}

async function findAtivasPorEvento(trigger_evento, organizacao_id) {
  const [rows] = await pool.query(
    `SELECT * FROM automacoes
     WHERE trigger_evento = ?
       AND organizacao_id = ?
       AND ativo = TRUE`,
    [trigger_evento, organizacao_id]
  );
  return rows;
}

async function create(dados) {
  const id = uuidv4();
  await pool.query(
    `INSERT INTO automacoes
       (id, organizacao_id, nome, descricao, trigger_evento, acoes, ativo, criado_por_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      dados.organizacao_id,
      dados.nome,
      dados.descricao || null,
      dados.trigger_evento,
      JSON.stringify(dados.acoes),
      true,
      dados.criado_por_id || null,
    ]
  );
  return findById(id);
}

async function update(id, dados) {
  await pool.query(
    `UPDATE automacoes SET
       nome           = ?,
       descricao      = ?,
       trigger_evento = ?,
       acoes          = ?,
       ativo          = ?
     WHERE id = ?`,
    [
      dados.nome,
      dados.descricao || null,
      dados.trigger_evento,
      JSON.stringify(dados.acoes),
      dados.ativo !== undefined ? dados.ativo : true,
      id,
    ]
  );
  return findById(id);
}

async function remove(id) {
  const [res] = await pool.query('DELETE FROM automacoes WHERE id = ?', [id]);
  return res.affectedRows > 0;
}

async function registrarLog(automacao_id, trigger_evento, payload, acoesExecutadas, status, erroMensagem) {
  const id = uuidv4();
  await pool.query(
    `INSERT INTO automacao_logs
       (id, automacao_id, trigger_evento, payload_entrada, acoes_executadas, status, erro_mensagem)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id, automacao_id, trigger_evento,
      JSON.stringify(payload),
      JSON.stringify(acoesExecutadas),
      status,
      erroMensagem || null,
    ]
  );
  return id;
}

async function findLogs(organizacao_id, limite) {
  const [rows] = await pool.query(
    `SELECT al.*, a.nome AS automacao_nome
     FROM automacao_logs al
     JOIN automacoes a ON al.automacao_id = a.id
     WHERE a.organizacao_id = ?
     ORDER BY al.data_execucao DESC
     LIMIT ?`,
    [organizacao_id, limite || 50]
  );
  return rows;
}

module.exports = { findAll, findById, findAtivasPorEvento, create, update, remove, registrarLog, findLogs };
