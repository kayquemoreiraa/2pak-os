const { pool } = require('../../../config/database');
const { v4: uuidv4 } = require('uuid');

async function findAll(organizacao_id) {
  const [rows] = await pool.query(
    `SELECT * FROM empresas
     WHERE ativo = TRUE
       AND organizacao_id = ?
     ORDER BY data_criacao DESC`,
    [organizacao_id]
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM empresas WHERE id = ?', [id]);
  return rows[0] || null;
}

async function findByPlaceId(place_id) {
  const [rows] = await pool.query('SELECT id FROM empresas WHERE place_id = ?', [place_id]);
  return rows[0] || null;
}

async function create(dados) {
  const id = uuidv4();
  await pool.query(
    `INSERT INTO empresas
       (id, nome_fantasia, razao_social, cnpj, segmento, porte, site, origem_lead, 
        status_atual_id, organizacao_id, criado_por_id, ativo, telefone, endereco, cidade, place_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      dados.nome_fantasia,
      dados.razao_social    || null,
      dados.cnpj            || null,
      dados.segmento        || null,
      dados.porte           || null,
      dados.site            || null,
      dados.origem_lead     || null,
      dados.status_atual_id || null,
      dados.organizacao_id  || null,
      dados.criado_por_id   || null,
      true,
      dados.telefone        || null,
      dados.endereco        || null,
      dados.cidade          || null,
      dados.place_id        || null,
    ]
  );
  return findById(id);
}

async function update(id, dados) {
  await pool.query(
    `UPDATE empresas SET
       nome_fantasia   = ?,
       razao_social    = ?,
       cnpj            = ?,
       segmento        = ?,
       porte           = ?,
       site            = ?,
       origem_lead     = ?,
       status_atual_id = ?,
       telefone        = ?,
       endereco        = ?,
       cidade          = ?,
       place_id        = ?
     WHERE id = ?`,
    [
      dados.nome_fantasia,
      dados.razao_social    || null,
      dados.cnpj            || null,
      dados.segmento        || null,
      dados.porte           || null,
      dados.site            || null,
      dados.origem_lead     || null,
      dados.status_atual_id || null,
      dados.telefone        || null,
      dados.endereco        || null,
      dados.cidade          || null,
      dados.place_id        || null,
      id,
    ]
  );
  return findById(id);
}

async function softDelete(id) {
  const [res] = await pool.query('UPDATE empresas SET ativo = FALSE WHERE id = ?', [id]);
  return res.affectedRows > 0;
}

module.exports = { findAll, findById, create, update, softDelete, findByPlaceId };
