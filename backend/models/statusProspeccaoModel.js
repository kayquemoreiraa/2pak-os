const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

async function findAll() {
  const [rows] = await pool.query(
    `SELECT * FROM status_prospeccao
     WHERE ativo = TRUE
     ORDER BY ordem_funil ASC`
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    'SELECT * FROM status_prospeccao WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function create(dados) {
  const id = uuidv4();
  await pool.query(
    `INSERT INTO status_prospeccao (id, nome, ordem_funil, cor_hex, ativo)
     VALUES (?, ?, ?, ?, ?)`,
    [
      id,
      dados.nome,
      dados.ordem_funil,
      dados.cor_hex || null,
      true,
    ]
  );
  return findById(id);
}

async function update(id, dados) {
  await pool.query(
    `UPDATE status_prospeccao SET
      nome = ?,
      ordem_funil = ?,
      cor_hex = ?
     WHERE id = ?`,
    [
      dados.nome,
      dados.ordem_funil,
      dados.cor_hex || null,
      id,
    ]
  );
  return findById(id);
}

async function softDelete(id) {
  const [resultado] = await pool.query(
    'UPDATE status_prospeccao SET ativo = FALSE WHERE id = ?',
    [id]
  );
  return resultado.affectedRows > 0;
}

module.exports = { findAll, findById, create, update, softDelete };