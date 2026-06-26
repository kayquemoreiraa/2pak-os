const statusModel = require('../models/statusProspeccaoModel');

async function listar(req, res) {
  try {
    const status = await statusModel.findAll();
    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar status.', detalhes: error.message });
  }
}

async function buscarPorId(req, res) {
  try {
    const status = await statusModel.findById(req.params.id);
    if (!status) {
      return res.status(404).json({ erro: 'Status nao encontrado.' });
    }
    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar status.', detalhes: error.message });
  }
}

async function criar(req, res) {
  try {
    const { nome, ordem_funil } = req.body;
    if (!nome || nome.trim() === '') {
      return res.status(400).json({ erro: 'O campo "nome" e obrigatorio.' });
    }
    if (ordem_funil === undefined || ordem_funil === null) {
      return res.status(400).json({ erro: 'O campo "ordem_funil" e obrigatorio.' });
    }
    const novoStatus = await statusModel.create(req.body);
    res.status(201).json(novoStatus);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Ja existe um status com este nome.' });
    }
    res.status(500).json({ erro: 'Erro ao criar status.', detalhes: error.message });
  }
}

async function atualizar(req, res) {
  try {
    const status = await statusModel.findById(req.params.id);
    if (!status) {
      return res.status(404).json({ erro: 'Status nao encontrado.' });
    }
    const { nome, ordem_funil } = req.body;
    if (!nome || nome.trim() === '') {
      return res.status(400).json({ erro: 'O campo "nome" e obrigatorio.' });
    }
    if (ordem_funil === undefined || ordem_funil === null) {
      return res.status(400).json({ erro: 'O campo "ordem_funil" e obrigatorio.' });
    }
    const statusAtualizado = await statusModel.update(req.params.id, req.body);
    res.status(200).json(statusAtualizado);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar status.', detalhes: error.message });
  }
}

async function deletar(req, res) {
  try {
    const status = await statusModel.findById(req.params.id);
    if (!status) {
      return res.status(404).json({ erro: 'Status nao encontrado.' });
    }
    await statusModel.softDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao remover status.', detalhes: error.message });
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, deletar };