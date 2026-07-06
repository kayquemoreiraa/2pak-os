const { pool } = require('../../../config/database');
const { v4: uuidv4 } = require('uuid');

async function findAll(empresa_id) {
  const [rows] = await pool.query(
    `SELECT * FROM contatos
     WHERE empresa_id = ? AND ativo = TRUE
     ORDER BY contato_principal DESC, nome ASC`,
    [empresa_id]
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    'SELECT * FROM contatos WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function create(dados) {
  const id = uuidv4();
  await pool.query(
    `INSERT INTO contatos
      (id, empresa_id, nome, cargo, email, telefone, linkedin_url, contato_principal, ativo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      dados.empresa_id,
      dados.nome,
      dados.cargo || null,
      dados.email || null,
      dados.telefone || null,
      dados.linkedin_url || null,
      dados.contato_principal || false,
      true,
    ]
  );
  return findById(id);
}

async function update(id, dados) {
  await pool.query(
    `UPDATE contatos SET
      nome = ?,
      cargo = ?,
      email = ?,
      telefone = ?,
      linkedin_url = ?,
      contato_principal = ?
     WHERE id = ?`,
    [
      dados.nome,
      dados.cargo || null,
      dados.email || null,
      dados.telefone || null,
      dados.linkedin_url || null,
      dados.contato_principal || false,
      id,
    ]
  );
  return findById(id);
}

async function softDelete(id) {
  const [resultado] = await pool.query(
    'UPDATE contatos SET ativo = FALSE WHERE id = ?',
    [id]
  );
  return resultado.affectedRows > 0;
}

module.exports = { findAll, findById, create, update, softDelete };