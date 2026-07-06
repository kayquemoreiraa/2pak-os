const { pool } = require('../../../config/database');

async function getResumo() {
  const [[empresas]] = await pool.query(
    'SELECT COUNT(*) AS total FROM empresas WHERE ativo = TRUE'
  );

  const [[contatos]] = await pool.query(
    'SELECT COUNT(*) AS total FROM contatos WHERE ativo = TRUE'
  );

  const [[tarefasPendentes]] = await pool.query(
    "SELECT COUNT(*) AS total FROM tarefas WHERE status = 'pendente'"
  );

  const [[tarefasConcluidas]] = await pool.query(
    "SELECT COUNT(*) AS total FROM tarefas WHERE status = 'concluida'"
  );

  return {
    empresas: empresas.total,
    contatos: contatos.total,
    tarefas_pendentes: tarefasPendentes.total,
    tarefas_concluidas: tarefasConcluidas.total,
  };
}

module.exports = { getResumo };