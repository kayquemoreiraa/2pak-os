const empresaModel = require('../models/empresaModel');
const contatoModel = require('../models/contatoModel');
const eventBus     = require('../../../shared/events');
const { EVENTS }   = require('../../../shared/events');

async function listar(req, res) {
  try {
    const empresas = await empresaModel.findAll(req.usuario.organizacao_id);
    res.status(200).json(empresas);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar empresas.', detalhes: error.message });
  }
}

async function buscarPorId(req, res) {
  try {
    const empresa = await empresaModel.findById(req.params.id);
    if (!empresa) return res.status(404).json({ erro: 'Empresa nao encontrada.'});
    res.status(200).json(empresa);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar empresa.', detalhes: error.message });
  }
}

async function criar(req, res) {
  try {
    const { nome_fantasia } = req.body;
    if (!nome_fantasia || nome_fantasia.trim() === '') {
      return res.status(400).json({ erro: 'O campo "nome_fantasia" e obrigatorio.' });
    }
    const novaEmpresa = await empresaModel.create({
      ...req.body,
      organizacao_id: req.usuario.organizacao_id,
      criado_por_id:  req.usuario.id,
    });
    eventBus.emit(EVENTS.EMPRESA_CRIADA, {
      organizacao_id: req.usuario.organizacao_id,
      nome_fantasia:  novaEmpresa.nome_fantasia,
      id:             novaEmpresa.id,
    });
    res.status(201).json(novaEmpresa);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Ja existe uma empresa com este CNPJ.' });
    }
    res.status(500).json({ erro: 'Erro ao criar empresa.', detalhes: error.message });
  }
}

async function atualizar(req, res) {
  try {
    const empresaExistente = await empresaModel.findById(req.params.id);
    if (!empresaExistente) return res.status(404).json({ erro: 'Empresa nao encontrada.' });
    const { nome_fantasia } = req.body;
    if (!nome_fantasia || nome_fantasia.trim() === '') {
      return res.status(400).json({ erro: 'O campo "nome_fantasia" e obrigatorio.' });
    }
    const empresaAtualizada = await empresaModel.update(req.params.id, req.body);
    eventBus.emit(EVENTS.EMPRESA_ATUALIZADA, {
      id:             req.params.id,
      organizacao_id: req.usuario.organizacao_id,
    });
    res.status(200).json(empresaAtualizada);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Ja existe uma empresa com este CNPJ.' });
    }
    res.status(500).json({ erro: 'Erro ao atualizar empresa.', detalhes: error.message });
  }
}

async function deletar(req, res) {
  try {
    const empresaExistente = await empresaModel.findById(req.params.id);
    if (!empresaExistente) return res.status(404).json({ erro: 'Empresa nao encontrada.' });
    
    // Exclui a empresa e os contatos vinculados
    await empresaModel.softDelete(req.params.id);
    if (contatoModel.deleteByEmpresaId) {
        await contatoModel.deleteByEmpresaId(req.params.id);
    }
    
    eventBus.emit(EVENTS.EMPRESA_REMOVIDA, {
      id:             req.params.id,
      organizacao_id: req.usuario.organizacao_id,
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao remover empresa.', detalhes: error.message });
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, deletar };
