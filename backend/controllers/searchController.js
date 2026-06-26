const empresaModel = require('../models/empresaModel');

async function pesquisar(req, res) {
  try {
    const termo = req.query.q;

    if (!termo || termo.trim() === '') {
      return res.status(400).json({
        erro: 'Informe um termo de pesquisa.'
      });
    }

    const empresas = await empresaModel.findAll();

    const resultados = empresas.filter((empresa) =>
      empresa.nome_fantasia
        ?.toLowerCase()
        .includes(termo.toLowerCase())
    );

    res.status(200).json(resultados);

  } catch (error) {

    res.status(500).json({
      erro: 'Erro ao pesquisar.',
      detalhes: error.message
    });
  }
}

module.exports = {
  pesquisar
};