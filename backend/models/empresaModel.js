const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

async function findAll() {
  const [rows] = await pool.query(
    'SELECT * FROM empresas WHERE ativo = TRUE ORDER BY data_criacao DESC'
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM empresas WHERE id = ?', [id]);
  return rows[0] || null;
}

async function create(dados) {
  const id = uuidv4();

  await pool.query(
    `INSERT INTO empresas
      (id, nome_fantasia, razao_social, cnpj, segmento, porte, site, origem_lead, status_atual_id, ativo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      dados.nome_fantasia,
      dados.razao_social || null,
      dados.cnpj || null,
      dados.segmento || null,
      dados.porte || null,
      dados.site || null,
      dados.origem_lead || null,
      dados.status_atual_id || null,
      true,
    ]
  );

  return findById(id);
}

async function update(id, dados) {
  await pool.query(
    `UPDATE empresas SET
      nome_fantasia = ?,
      razao_social = ?,
      cnpj = ?,
      segmento = ?,
      porte = ?,
      site = ?,
      origem_lead = ?,
      status_atual_id = ?
     WHERE id = ?`,
    [
      dados.nome_fantasia,
      dados.razao_social || null,
      dados.cnpj || null,
      dados.segmento || null,
      dados.porte || null,
      dados.site || null,
      dados.origem_lead || null,
      dados.status_atual_id || null,
      id,
    ]
  );

  return findById(id);
}

async function softDelete(id) {
  const [resultado] = await pool.query(
    'UPDATE empresas SET ativo = FALSE WHERE id = ?',
    [id]
  );
  return resultado.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  softDelete,
};