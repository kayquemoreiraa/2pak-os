const observacaoModel = require('../models/observacaoModel');

async function listar(req, res) {
  try {
    const { empresa_id } = req.query;
    if (!empresa_id) {
      return res.status(400).json({ erro: 'O parametro "empresa_id" e obrigatorio.' });
    }
    const observacoes = await observacaoModel.findAll(empresa_id);
    res.status(200).json(observacoes);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar observacoes.', detalhes: error.message });
  }
}

async function buscarPorId(req, res) {
  try {
    const observacao = await observacaoModel.findById(req.params.id);
    if (!observacao) {
      return res.status(404).json({ erro: 'Observacao nao encontrada.' });
    }
    res.status(200).json(observacao);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar observacao.', detalhes: error.message });
  }
}

async function criar(req, res) {
  try {
    const { conteudo, empresa_id } = req.body;
    if (!conteudo || conteudo.trim() === '') {
      return res.status(400).json({ erro: 'O campo "conteudo" e obrigatorio.' });
    }
    if (!empresa_id) {
      return res.status(400).json({ erro: 'O campo "empresa_id" e obrigatorio.' });
    }
    const novaObservacao = await observacaoModel.create(req.body);
    res.status(201).json(novaObservacao);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar observacao.', detalhes: error.message });
  }
}

async function atualizar(req, res) {
  try {
    const observacao = await observacaoModel.findById(req.params.id);
    if (!observacao) {
      return res.status(404).json({ erro: 'Observacao nao encontrada.' });
    }
    const { conteudo } = req.body;
    if (!conteudo || conteudo.trim() === '') {
      return res.status(400).json({ erro: 'O campo "conteudo" e obrigatorio.' });
    }
    const observacaoAtualizada = await observacaoModel.update(req.params.id, req.body);
    res.status(200).json(observacaoAtualizada);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar observacao.', detalhes: error.message });
  }
}

async function deletar(req, res) {
  try {
    const observacao = await observacaoModel.findById(req.params.id);
    if (!observacao) {
      return res.status(404).json({ erro: 'Observacao nao encontrada.' });
    }
    await observacaoModel.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao remover observacao.', detalhes: error.message });
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, deletar };