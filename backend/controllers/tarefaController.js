const tarefaModel = require('../models/tarefaModel');

async function listar(req, res) {
  try {
    const { empresa_id } = req.query;
    if (!empresa_id) {
      return res.status(400).json({ erro: 'O parametro "empresa_id" e obrigatorio.' });
    }
    const tarefas = await tarefaModel.findAll(empresa_id);
    res.status(200).json(tarefas);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar tarefas.', detalhes: error.message });
  }
}

async function listarGeral(req, res) {
  try {
    const tarefas = await tarefaModel.findAllGeral();
    res.status(200).json(tarefas);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar tarefas.', detalhes: error.message });
  }
}

async function buscarPorId(req, res) {
  try {
    const tarefa = await tarefaModel.findById(req.params.id);
    if (!tarefa) {
      return res.status(404).json({ erro: 'Tarefa nao encontrada.' });
    }
    res.status(200).json(tarefa);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar tarefa.', detalhes: error.message });
  }
}

async function criar(req, res) {
  try {
    const { titulo, empresa_id } = req.body;
    if (!titulo || titulo.trim() === '') {
      return res.status(400).json({ erro: 'O campo "titulo" e obrigatorio.' });
    }
    if (!empresa_id) {
      return res.status(400).json({ erro: 'O campo "empresa_id" e obrigatorio.' });
    }
    const novaTarefa = await tarefaModel.create(req.body);
    res.status(201).json(novaTarefa);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar tarefa.', detalhes: error.message });
  }
}

async function atualizar(req, res) {
  try {
    const tarefa = await tarefaModel.findById(req.params.id);
    if (!tarefa) {
      return res.status(404).json({ erro: 'Tarefa nao encontrada.' });
    }
    const { titulo } = req.body;
    if (!titulo || titulo.trim() === '') {
      return res.status(400).json({ erro: 'O campo "titulo" e obrigatorio.' });
    }
    const tarefaAtualizada = await tarefaModel.update(req.params.id, req.body);
    res.status(200).json(tarefaAtualizada);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar tarefa.', detalhes: error.message });
  }
}

async function deletar(req, res) {
  try {
    const tarefa = await tarefaModel.findById(req.params.id);
    if (!tarefa) {
      return res.status(404).json({ erro: 'Tarefa nao encontrada.' });
    }
    await tarefaModel.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao remover tarefa.', detalhes: error.message });
  }
}

module.exports = { listar, listarGeral, buscarPorId, criar, atualizar, deletar };
