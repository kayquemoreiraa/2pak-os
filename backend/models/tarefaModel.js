const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

function formatarData(data) {
  if (!data) return null;
  return new Date(data).toISOString().slice(0, 19).replace('T', ' ');
}

async function findAll(empresa_id) {
  const [rows] = await pool.query(
    `SELECT t.*, e.nome_fantasia AS empresa_nome
     FROM tarefas t
     LEFT JOIN empresas e ON t.empresa_id = e.id
     WHERE t.empresa_id = ?
     ORDER BY
       FIELD(t.prioridade, 'alta', 'media', 'baixa'),
       t.data_vencimento ASC`,
    [empresa_id]
  );
  return rows;
}

async function findAllGeral() {
  const [rows] = await pool.query(
    `SELECT t.*, e.nome_fantasia AS empresa_nome
     FROM tarefas t
     LEFT JOIN empresas e ON t.empresa_id = e.id
     ORDER BY
       FIELD(t.prioridade, 'alta', 'media', 'baixa'),
       t.data_vencimento ASC`
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    'SELECT * FROM tarefas WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function create(dados) {
  const id = uuidv4();
  await pool.query(
    `INSERT INTO tarefas
      (id, empresa_id, contato_id, titulo, descricao, prioridade, status, data_vencimento)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      dados.empresa_id,
      dados.contato_id || null,
      dados.titulo,
      dados.descricao || null,
      dados.prioridade || 'media',
      dados.status || 'pendente',
      formatarData(dados.data_vencimento),
    ]
  );
  return findById(id);
}

async function update(id, dados) {
  const novoStatus = dados.status || 'pendente';
  await pool.query(
    `UPDATE tarefas SET
      titulo = ?,
      descricao = ?,
      prioridade = ?,
      status = ?,
      data_vencimento = ?,
      data_conclusao = ?,
      contato_id = ?
     WHERE id = ?`,
    [
      dados.titulo,
      dados.descricao || null,
      dados.prioridade || 'media',
      novoStatus,
      formatarData(dados.data_vencimento),
      novoStatus === 'concluida' ? formatarData(new Date()) : null,
      dados.contato_id || null,
      id,
    ]
  );
  return findById(id);
}

async function remove(id) {
  const [resultado] = await pool.query(
    'DELETE FROM tarefas WHERE id = ?',
    [id]
  );
  return resultado.affectedRows > 0;
}

module.exports = { findAll, findAllGeral, findById, create, update, remove };
