const { pool } = require('../../config/database');
const { v4: uuidv4 } = require('uuid');

async function findByUsuario(usuario_id, organizacao_id) {
  const [rows] = await pool.query(
    `SELECT * FROM notificacoes
     WHERE (usuario_id = ? OR usuario_id IS NULL)
       AND organizacao_id = ?
     ORDER BY data_criacao DESC
     LIMIT 50`,
    [usuario_id, organizacao_id]
  );
  return rows;
}

async function countNaoLidas(usuario_id, organizacao_id) {
  const [[res]] = await pool.query(
    `SELECT COUNT(*) AS total FROM notificacoes
     WHERE (usuario_id = ? OR usuario_id IS NULL)
       AND organizacao_id = ?
       AND lida = FALSE`,
    [usuario_id, organizacao_id]
  );
  return res.total;
}

async function create(dados) {
  const id = uuidv4();
  await pool.query(
    'INSERT INTO notificacoes (id, organizacao_id, usuario_id, tipo, titulo, mensagem, link) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, dados.organizacao_id || null, dados.usuario_id || null, dados.tipo, dados.titulo, dados.mensagem || null, dados.link || null]
  );
  const [rows] = await pool.query('SELECT * FROM notificacoes WHERE id = ?', [id]);
  return rows[0];
}

async function marcarComoLida(id, usuario_id) {
  await pool.query(
    'UPDATE notificacoes SET lida = TRUE WHERE id = ? AND (usuario_id = ? OR usuario_id IS NULL)',
    [id, usuario_id]
  );
}

async function marcarTodasComoLidas(usuario_id, organizacao_id) {
  const [res] = await pool.query(
    'UPDATE notificacoes SET lida = TRUE WHERE (usuario_id = ? OR usuario_id IS NULL) AND organizacao_id = ? AND lida = FALSE',
    [usuario_id, organizacao_id]
  );
  return res.affectedRows;
}

module.exports = { findByUsuario, countNaoLidas, create, marcarComoLida, marcarTodasComoLidas };
