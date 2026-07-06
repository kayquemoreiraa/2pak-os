const WebhookModel = require('../models/webhookModel');

const WebhookController = {
  async criar(req, res, next) {
    try {
      const { url, eventos, descricao } = req.body;
      if (!url || !eventos) {
        return res.status(400).json({ erro: 'URL e eventos sao obrigatorios.' });
      }
      const endpoint = await WebhookModel.criarEndpoint(
        req.usuario.organizacao_id,
        { url, eventos, descricao }
      );
      return res.status(201).json(endpoint);
    } catch (error) { next(error); }
  },

  async listar(req, res, next) {
    try {
      const endpoints = await WebhookModel.listarEndpoints(req.usuario.organizacao_id);
      return res.status(200).json(endpoints);
    } catch (error) { next(error); }
  },

  async deletar(req, res, next) {
    try {
      const deletado = await WebhookModel.deletarEndpoint(
        req.params.id, req.usuario.organizacao_id
      );
      if (!deletado) return res.status(404).json({ erro: 'Webhook nao encontrado.' });
      return res.status(200).json({ mensagem: 'Webhook deletado com sucesso.' });
    } catch (error) { next(error); }
  },

  async listarLogs(req, res, next) {
    try {
      const limite = parseInt(req.query.limite) || 50;
      const logs = await WebhookModel.listarLogs(req.usuario.organizacao_id, limite);
      return res.status(200).json(logs);
    } catch (error) { next(error); }
  },
};

module.exports = WebhookController;
