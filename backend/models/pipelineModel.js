const { pool } = require('../config/database');

async function getPipeline() {
  const [status] = await pool.query(
    `SELECT * FROM status_prospeccao
     WHERE ativo = TRUE
     ORDER BY ordem_funil ASC`
  );

  const [empresas] = await pool.query(
    `SELECT e.*, s.nome AS status_nome
     FROM empresas e
     LEFT JOIN status_prospeccao s ON e.status_atual_id = s.id
     WHERE e.ativo = TRUE
     ORDER BY e.data_criacao DESC`
  );

  return status.map(s => ({
    id: s.id,
    nome: s.nome,
    ordem_funil: s.ordem_funil,
    cor_hex: s.cor_hex,
    empresas: empresas.filter(e => e.status_atual_id === s.id),
  }));
}

async function moverEmpresa(empresa_id, status_id) {
  const [resultado] = await pool.query(
    'UPDATE empresas SET status_atual_id = ? WHERE id = ? AND ativo = TRUE',
    [status_id, empresa_id]
  );
  return resultado.affectedRows > 0;
}

module.exports = { getPipeline, moverEmpresa };