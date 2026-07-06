const followupModel = require('../models/followupModel');

async function listar(req, res) {
  try {
    const dias = parseInt(req.query.dias) || 7;
    const empresas = await followupModel.getEmpresasSemInteracao(dias);
    res.status(200).json({
      parametro: `Empresas sem contato ha mais de ${dias} dias`,
      total: empresas.length,
      empresas,
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar follow-ups.', detalhes: error.message });
  }
}

module.exports = { listar };