const EventEmitter = require('events');

class CortexEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100);
  }
  emit(eventName, data) {
    if (process.env.NODE_ENV === 'development') {
      const preview = data ? JSON.stringify(data).slice(0, 80) : '';
      console.log('[EVENT] ' + String(eventName).padEnd(40) + ' ' + preview);
    }
    return super.emit(eventName, data);
  }
}

const eventBus = new CortexEventBus();

const EVENTS = {
  EMPRESA_CRIADA:              'crm.empresa.criada',
  EMPRESA_ATUALIZADA:          'crm.empresa.atualizada',
  EMPRESA_REMOVIDA:            'crm.empresa.removida',
  EMPRESA_STATUS_ALTERADO:     'crm.empresa.status_alterado',
  CONTATO_CRIADO:              'crm.contato.criado',
  CONTATO_ATUALIZADO:          'crm.contato.atualizado',
  CONTATO_REMOVIDO:            'crm.contato.removido',
  TAREFA_CRIADA:               'crm.tarefa.criada',
  TAREFA_ATUALIZADA:           'crm.tarefa.atualizada',
  TAREFA_CONCLUIDA:            'crm.tarefa.concluida',
  TAREFA_VENCIDA:              'crm.tarefa.vencida',
  TAREFA_REMOVIDA:             'crm.tarefa.removida',
  OBSERVACAO_CRIADA:           'crm.observacao.criada',
  OBSERVACAO_ATUALIZADA:       'crm.observacao.atualizada',
  PIPELINE_EMPRESA_MOVIDA:     'crm.pipeline.empresa_movida',
  USUARIO_CRIADO:              'auth.usuario.criado',
  USUARIO_ATUALIZADO:          'auth.usuario.atualizado',
  USUARIO_LOGIN:               'auth.usuario.login',
  USUARIO_LOGOUT:              'auth.usuario.logout',
  USUARIO_SENHA_ALTERADA:      'auth.usuario.senha_alterada',
  NOTIFICACAO_CRIADA:          'notificacao.criada',
  NOTIFICACAO_LIDA:            'notificacao.lida',
  IA_ANALISE_SOLICITADA:       'ia.analise.solicitada',
  IA_RESPOSTA_GERADA:          'ia.resposta.gerada',
  IA_LEAD_CLASSIFICADO:        'ia.lead.classificado',
  AUTOMACAO_DISPARADA:         'automacao.disparada',
  AUTOMACAO_CONCLUIDA:         'automacao.concluida',
  WHATSAPP_MSG_RECEBIDA:       'integracao.whatsapp.msg_recebida',
  WHATSAPP_MSG_ENVIADA:        'integracao.whatsapp.msg_enviada',
  INSTAGRAM_MSG_RECEBIDA:      'integracao.instagram.msg_recebida',
  GOOGLE_MAPS_LEAD_ENCONTRADO: 'integracao.google_maps.lead_encontrado',
  EMAIL_RECEBIDO:              'integracao.email.recebido',
  EMAIL_ENVIADO:               'integracao.email.enviado',
  WEBHOOK_RECEBIDO:            'webhook.recebido',
  WEBHOOK_ENVIADO:             'webhook.enviado',
};

module.exports = eventBus;
module.exports.EVENTS = EVENTS;
