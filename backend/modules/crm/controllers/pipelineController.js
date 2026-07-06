const pipelineModel = require('../models/pipelineModel');

async function listar(req, res) {
  try {
    const pipeline = await pipelineModel.getPipeline();
    res.status(200).json(pipeline);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao carregar pipeline.', detalhes: error.message });
  }
}

async function mover(req, res) {
  try {
    const { empresa_id, status_id } = req.body;
    if (!empresa_id || !status_id) {
      return res.status(400).json({ erro: 'Os campos "empresa_id" e "status_id" sao obrigatorios.' });
    }
    const moveu = await pipelineModel.moverEmpresa(empresa_id, status_id);
    if (!moveu) {
      return res.status(404).json({ erro: 'Empresa nao encontrada ou ja inativa.' });
    }
    res.status(200).json({ mensagem: 'Empresa movida no pipeline com sucesso.' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao mover empresa no pipeline.', detalhes: error.message });
  }
}

module.exports = { listar, mover };