const dashboardModel = require('../models/dashboardModel');

async function resumo(req, res) {
  try {
    const dados = await dashboardModel.getResumo();
    res.status(200).json(dados);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao carregar dashboard.', detalhes: error.message });
  }
}

module.exports = { resumo };