const notificacaoModel = require('../../../shared/models/notificacaoModel');
const eventBus         = require('../../../shared/events');
const { EVENTS }       = require('../../../shared/events');

async function listar(req, res) {
  try {
    const notificacoes = await notificacaoModel.findByUsuario(
      req.usuario.id,
      req.usuario.organizacao_id
    );
    const naoLidas = await notificacaoModel.countNaoLidas(
      req.usuario.id,
      req.usuario.organizacao_id
    );
    res.status(200).json({ nao_lidas: naoLidas, notificacoes });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar notificacoes.', detalhes: error.message });
  }
}

async function marcarLida(req, res) {
  try {
    await notificacaoModel.marcarComoLida(req.params.id, req.usuario.id);
    eventBus.emit(EVENTS.NOTIFICACAO_LIDA, { notificacao_id: req.params.id });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao marcar notificacao.', detalhes: error.message });
  }
}

async function marcarTodasLidas(req, res) {
  try {
    const total = await notificacaoModel.marcarTodasComoLidas(
      req.usuario.id,
      req.usuario.organizacao_id
    );
    eventBus.emit(EVENTS.NOTIFICACAO_TODAS_LIDAS, { usuario_id: req.usuario.id });
    res.status(200).json({ mensagem: total + ' notificacao(oes) marcada(s) como lida(s).' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao marcar notificacoes.', detalhes: error.message });
  }
}

module.exports = { listar, marcarLida, marcarTodasLidas };
