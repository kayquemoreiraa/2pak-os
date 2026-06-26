const { pool } = require('../config/database');

async function getEmpresasSemInteracao(dias) {
  const limite = dias || 7;
  const [rows] = await pool.query(
    `SELECT
       e.id,
       e.nome_fantasia,
       e.segmento,
       e.origem_lead,
       s.nome AS status_atual,
       e.data_criacao,
       MAX(o.data_criacao) AS ultima_observacao,
       DATEDIFF(NOW(), COALESCE(MAX(o.data_criacao), e.data_criacao)) AS dias_sem_contato
     FROM empresas e
     LEFT JOIN status_prospeccao s ON e.status_atual_id = s.id
     LEFT JOIN observacoes o ON o.empresa_id = e.id
     WHERE e.ativo = TRUE
     GROUP BY e.id, e.nome_fantasia, e.segmento, e.origem_lead, s.nome, e.data_criacao
     HAVING dias_sem_contato >= ?
     ORDER BY dias_sem_contato DESC`,
    [limite]
  );
  return rows;
}

module.exports = { getEmpresasSemInteracao };