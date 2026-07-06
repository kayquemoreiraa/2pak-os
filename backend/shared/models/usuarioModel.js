const { pool } = require('../../config/database');
const { v4: uuidv4 } = require('uuid');

const CAMPOS_PUBLICOS = 'id, organizacao_id, nome, email, papel, ativo, ultimo_login, data_criacao, data_atualizacao';

async function findAll(organizacao_id) {
  const [rows] = await pool.query(
    'SELECT ' + CAMPOS_PUBLICOS + ' FROM usuarios WHERE organizacao_id = ? ORDER BY nome ASC',
    [organizacao_id]
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    'SELECT ' + CAMPOS_PUBLICOS + ' FROM usuarios WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function findByEmailComSenha(email) {
  const [rows] = await pool.query(
    'SELECT * FROM usuarios WHERE email = ? AND ativo = TRUE',
    [email]
  );
  return rows[0] || null;
}

async function create(dados) {
  const id = uuidv4();
  await pool.query(
    'INSERT INTO usuarios (id, organizacao_id, nome, email, senha_hash, papel, ativo) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, dados.organizacao_id, dados.nome, dados.email, dados.senha_hash, dados.papel || 'sdr', true]
  );
  return findById(id);
}

async function update(id, dados) {
  await pool.query(
    'UPDATE usuarios SET nome = ?, papel = ?, ativo = ? WHERE id = ?',
    [dados.nome, dados.papel, dados.ativo !== undefined ? dados.ativo : true, id]
  );
  return findById(id);
}

async function updateSenha(id, senha_hash) {
  await pool.query('UPDATE usuarios SET senha_hash = ? WHERE id = ?', [senha_hash, id]);
}

async function updateUltimoLogin(id) {
  await pool.query('UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?', [id]);
}

async function softDelete(id) {
  const [res] = await pool.query('UPDATE usuarios SET ativo = FALSE WHERE id = ?', [id]);
  return res.affectedRows > 0;
}

module.exports = { findAll, findById, findByEmailComSenha, create, update, updateSenha, updateUltimoLogin, softDelete };
