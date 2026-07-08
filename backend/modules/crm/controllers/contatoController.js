const contatoModel = require('../models/contatoModel');

async function listar(req, res) {
  try {
    const { empresa_id } = req.query;
    if (!empresa_id) {
      return res.status(400).json({ erro: 'O parametro "empresa_id" e obrigatorio.' });
    }
    const contatos = await contatoModel.findAll(empresa_id);
    res.status(200).json(contatos);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar contatos.', detalhes: error.message });
  }
}

async function buscarPorId(req, res) {
  try {
    const contato = await contatoModel.findById(req.params.id);
    if (!contato) {
      return res.status(404).json({ erro: 'Contato nao encontrado.' });
    }
    res.status(200).json(contato);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar contato.', detalhes: error.message });
  }
}

async function criar(req, res) {
  try {
    const { nome, empresa_id } = req.body;
    if (!nome || nome.trim() === '') {
      return res.status(400).json({ erro: 'O campo "nome" e obrigatorio.' });
    }
    if (!empresa_id) {
      return res.status(400).json({ erro: 'O campo "empresa_id" e obrigatorio.' });
    }
    const novoContato = await contatoModel.create(req.body);
    res.status(201).json(novoContato);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar contato.', detalhes: error.message });
  }
}

async function atualizar(req, res) {
  try {
    const contato = await contatoModel.findById(req.params.id);
    if (!contato) {
      return res.status(404).json({ erro: 'Contato nao encontrado.' });
    }
    const { nome } = req.body;
    if (!nome || nome.trim() === '') {
      return res.status(400).json({ erro: 'O campo "nome" e obrigatorio.' });
    }
    const contatoAtualizado = await contatoModel.update(req.params.id, req.body);
    res.status(200).json(contatoAtualizado);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar contato.', detalhes: error.message });
  }
}

async function deletar(req, res) {
  try {
    const contato = await contatoModel.findById(req.params.id);
    if (!contato) {
      return res.status(404).json({ erro: 'Contato nao encontrado.' });
    }
    await pool.query('DELETE FROM contatos WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao remover contato.', detalhes: error.message });
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, deletar };
