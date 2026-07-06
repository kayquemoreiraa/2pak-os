const eventBus           = require('./index');
const { EVENTS }         = require('./index');
const notificacaoModel   = require('../models/notificacaoModel');
const WebhookService     = require('../../modules/webhooks/services/webhookService');
const AutomacaoService   = require('../../modules/automacoes/services/automacaoService');

// ----------------------------------------------------------------
// Listeners do CortexEventBus
//
// Cada listener faz tres coisas:
//   1. Grava notificacao interna (quando relevante)
//   2. Executa automacoes configuradas pela organizacao
//   3. Dispara webhooks externos cadastrados
// ----------------------------------------------------------------

function registrarListeners() {

  eventBus.on(EVENTS.EMPRESA_CRIADA, async (dados) => {
    try {
      await notificacaoModel.create({
        organizacao_id: dados.organizacao_id,
        usuario_id:     null,
        tipo:           'empresa',
        titulo:         'Nova empresa cadastrada',
        mensagem:       '"' + dados.nome_fantasia + '" foi adicionada ao CRM.',
        link:           '/empresas',
      });
    } catch (_) {}

    AutomacaoService.executar(EVENTS.EMPRESA_CRIADA, dados.organizacao_id, dados);

    WebhookService.disparar('empresa.criada', dados.organizacao_id, {
      evento: 'empresa.criada', empresa_id: dados.id,
      nome: dados.nome_fantasia, timestamp: new Date().toISOString(),
    });
  });

  eventBus.on(EVENTS.EMPRESA_ATUALIZADA, async (dados) => {
    AutomacaoService.executar(EVENTS.EMPRESA_ATUALIZADA, dados.organizacao_id, dados);
    WebhookService.disparar('empresa.atualizada', dados.organizacao_id, {
      evento: 'empresa.atualizada', empresa_id: dados.id, timestamp: new Date().toISOString(),
    });
  });

  eventBus.on(EVENTS.EMPRESA_REMOVIDA, async (dados) => {
    AutomacaoService.executar(EVENTS.EMPRESA_REMOVIDA, dados.organizacao_id, dados);
    WebhookService.disparar('empresa.removida', dados.organizacao_id, {
      evento: 'empresa.removida', empresa_id: dados.id, timestamp: new Date().toISOString(),
    });
  });

  eventBus.on(EVENTS.PIPELINE_EMPRESA_MOVIDA, async (dados) => {
    try {
      await notificacaoModel.create({
        organizacao_id: dados.organizacao_id,
        usuario_id:     null,
        tipo:           'pipeline',
        titulo:         'Empresa movida no pipeline',
        mensagem:       '"' + dados.nome_fantasia + '" foi movida para "' + dados.status_novo + '".',
        link:           '/pipeline',
      });
    } catch (_) {}
    AutomacaoService.executar(EVENTS.PIPELINE_EMPRESA_MOVIDA, dados.organizacao_id, dados);
    WebhookService.disparar('pipeline.empresa_movida', dados.organizacao_id, {
      evento: 'pipeline.empresa_movida', empresa_id: dados.empresa_id,
      status_novo_id: dados.status_novo_id, timestamp: new Date().toISOString(),
    });
  });

  eventBus.on(EVENTS.TAREFA_CRIADA, async (dados) => {
    try {
      await notificacaoModel.create({
        organizacao_id: dados.organizacao_id,
        usuario_id:     dados.responsavel_id || null,
        tipo:           'tarefa',
        titulo:         'Nova tarefa criada',
        mensagem:       '"' + dados.titulo + '" foi criada.',
        link:           '/tarefas',
      });
    } catch (_) {}
    AutomacaoService.executar(EVENTS.TAREFA_CRIADA, dados.organizacao_id, dados);
    WebhookService.disparar('tarefa.criada', dados.organizacao_id, {
      evento: 'tarefa.criada', tarefa_id: dados.id,
      titulo: dados.titulo, timestamp: new Date().toISOString(),
    });
  });

  eventBus.on(EVENTS.TAREFA_CONCLUIDA, async (dados) => {
    try {
      await notificacaoModel.create({
        organizacao_id: dados.organizacao_id,
        usuario_id:     null,
        tipo:           'tarefa',
        titulo:         'Tarefa concluida',
        mensagem:       '"' + dados.titulo + '" foi marcada como concluida.',
        link:           '/tarefas',
      });
    } catch (_) {}
    AutomacaoService.executar(EVENTS.TAREFA_CONCLUIDA, dados.organizacao_id, dados);
    WebhookService.disparar('tarefa.concluida', dados.organizacao_id, {
      evento: 'tarefa.concluida', tarefa_id: dados.id,
      titulo: dados.titulo, timestamp: new Date().toISOString(),
    });
  });

  eventBus.on(EVENTS.CONTATO_CRIADO, async (dados) => {
    AutomacaoService.executar(EVENTS.CONTATO_CRIADO, dados.organizacao_id, dados);
    WebhookService.disparar('contato.criado', dados.organizacao_id, {
      evento: 'contato.criado', contato_id: dados.id,
      nome: dados.nome, timestamp: new Date().toISOString(),
    });
  });

  eventBus.on(EVENTS.USUARIO_CRIADO, async (dados) => {
    try {
      await notificacaoModel.create({
        organizacao_id: dados.organizacao_id,
        usuario_id:     null,
        tipo:           'usuario',
        titulo:         'Novo usuario adicionado',
        mensagem:       'Um novo membro foi adicionado a plataforma.',
        link:           null,
      });
    } catch (_) {}
  });

  console.log('[CortexEventBus] Listeners registrados com sucesso.');
}

module.exports = { registrarListeners };
