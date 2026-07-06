const automacaoModel = require('../models/automacaoModel');

const EVENTOS_VALIDOS = [
  'crm.empresa.criada', 'crm.empresa.atualizada', 'crm.empresa.removida',
  'crm.contato.criado', 'crm.contato.atualizado',
  'crm.tarefa.criada',  'crm.tarefa.concluida',
  'crm.pipeline.empresa_movida',
  'crm.observacao.criada',
];

async function listar(req, res, next) {
  try {
    const automacoes = await automacaoModel.findAll(req.usuario.organizacao_id);
    res.status(200).json(automacoes);
  } catch (err) { next(err); }
}

async function buscarPorId(req, res, next) {
  try {
    const automacao = await automacaoModel.findById(req.params.id);
    if (!automacao) return res.status(404).json({ erro: 'Automacao nao encontrada.' });
    res.status(200).json(automacao);
  } catch (err) { next(err); }
}

async function criar(req, res, next) {
  try {
    const { nome, trigger_evento, acoes } = req.body;

    if (!nome || !trigger_evento || !acoes) {
      return res.status(400).json({ erro: 'nome, trigger_evento e acoes sao obrigatorios.' });
    }
    if (!Array.isArray(acoes) || acoes.length === 0) {
      return res.status(400).json({ erro: 'acoes deve ser um array com pelo menos uma acao.' });
    }
    if (!EVENTOS_VALIDOS.includes(trigger_evento)) {
      return res.status(400).json({ erro: 'trigger_evento invalido.', eventos_validos: EVENTOS_VALIDOS });
    }

    const automacao = await automacaoModel.create({
      nome,
      descricao:      req.body.descricao || null,
      trigger_evento,
      acoes,
      organizacao_id: req.usuario.organizacao_id,
      criado_por_id:  req.usuario.id,
    });
    res.status(201).json(automacao);
  } catch (err) { next(err); }
}

async function atualizar(req, res, next) {
  try {
    const automacao = await automacaoModel.findById(req.params.id);
    if (!automacao) return res.status(404).json({ erro: 'Automacao nao encontrada.' });

    const { nome, trigger_evento, acoes } = req.body;
    if (!nome || !trigger_evento || !acoes) {
      return res.status(400).json({ erro: 'nome, trigger_evento e acoes sao obrigatorios.' });
    }

    const atualizada = await automacaoModel.update(req.params.id, req.body);
    res.status(200).json(atualizada);
  } catch (err) { next(err); }
}

async function remover(req, res, next) {
  try {
    const automacao = await automacaoModel.findById(req.params.id);
    if (!automacao) return res.status(404).json({ erro: 'Automacao nao encontrada.' });
    await automacaoModel.remove(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
}

async function listarLogs(req, res, next) {
  try {
    const limite = parseInt(req.query.limite) || 50;
    const logs   = await automacaoModel.findLogs(req.usuario.organizacao_id, limite);
    res.status(200).json(logs);
  } catch (err) { next(err); }
}

async function listarEventos(req, res) {
  res.status(200).json({ eventos: EVENTOS_VALIDOS });
}

module.exports = { listar, buscarPorId, criar, atualizar, remover, listarLogs, listarEventos };
