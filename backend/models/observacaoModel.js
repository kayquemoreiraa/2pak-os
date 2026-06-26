const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

async function findAll(empresa_id) {
  const [rows] = await pool.query(
    `SELECT * FROM observacoes
     WHERE empresa_id = ?
     ORDER BY data_criacao DESC`,
    [empresa_id]
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    'SELECT * FROM observacoes WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function create(dados) {
  const id = uuidv4();
  await pool.query(
    `INSERT INTO observacoes (id, empresa_id, contato_id, conteudo)
     VALUES (?, ?, ?, ?)`,
    [
      id,
      dados.empresa_id,
      dados.contato_id || null,
      dados.conteudo,
    ]
  );
  return findById(id);
}

async function update(id, dados) {
  await pool.query(
    'UPDATE observacoes SET conteudo = ? WHERE id = ?',
    [dados.conteudo, id]
  );
  return findById(id);
}

async function remove(id) {
  const [resultado] = await pool.query(
    'DELETE FROM observacoes WHERE id = ?',
    [id]
  );
  return resultado.affectedRows > 0;
}

module.exports = { findAll, findById, create, update, remove };