const automacaoModel  = require('../models/automacaoModel');
const { pool }        = require('../../../config/database');
const { v4: uuidv4 }  = require('uuid');

// ----------------------------------------------------------------
// AutomacaoService ? Motor de Execucao de Automacoes
//
// Recebe um evento + payload, busca todas as automacoes ativas
// para aquele evento naquela organizacao, e executa cada acao
// definida nas regras.
//
// Acoes suportadas na v1:
//   criar_tarefa       ? cria uma tarefa vinculada a empresa
//   criar_notificacao  ? cria uma notificacao interna
//   mover_pipeline     ? move a empresa para um status
//
// Para adicionar uma nova acao: implemente o handler em HANDLERS
// e documente o schema de "dados" esperado.
// ----------------------------------------------------------------

const HANDLERS = {
  async criar_tarefa(dados, payload, organizacao_id) {
    const id = uuidv4();

    // Substitui variaveis do template: {{nome_fantasia}}, {{id}}, etc
    function interpolar(texto) {
      if (!texto) return texto;
      return texto.replace(/\{\{(\w+)\}\}/g, (_, chave) => payload[chave] || '');
    }

    await pool.query(
      `INSERT INTO tarefas
         (id, empresa_id, titulo, descricao, prioridade, status, organizacao_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        payload.id || null,
        interpolar(dados.titulo) || 'Tarefa automatica',
        interpolar(dados.descricao) || null,
        dados.prioridade || 'media',
        'pendente',
        organizacao_id,
      ]
    );
    return { acao: 'criar_tarefa', tarefa_id: id };
  },

  async criar_notificacao(dados, payload, organizacao_id) {
    const notificacaoModel = require('../../../shared/models/notificacaoModel');

    function interpolar(texto) {
      if (!texto) return texto;
      return texto.replace(/\{\{(\w+)\}\}/g, (_, chave) => payload[chave] || '');
    }

    const notificacao = await notificacaoModel.create({
      organizacao_id,
      usuario_id: null,
      tipo:       dados.tipo || 'automacao',
      titulo:     interpolar(dados.titulo) || 'Automacao disparada',
      mensagem:   interpolar(dados.mensagem) || null,
      link:       dados.link || null,
    });
    return { acao: 'criar_notificacao', notificacao_id: notificacao.id };
  },

  async mover_pipeline(dados, payload, organizacao_id) {
    if (!dados.status_id || !payload.id) return { acao: 'mover_pipeline', ignorado: true };
    await pool.query(
      'UPDATE empresas SET status_atual_id = ? WHERE id = ? AND organizacao_id = ?',
      [dados.status_id, payload.id, organizacao_id]
    );
    return { acao: 'mover_pipeline', empresa_id: payload.id, status_id: dados.status_id };
  },
};

async function executar(trigger_evento, organizacao_id, payload) {
  if (!organizacao_id) return;

  let automacoes = [];
  try {
    automacoes = await automacaoModel.findAtivasPorEvento(trigger_evento, organizacao_id);
  } catch (_) { return; }

  if (automacoes.length === 0) return;

  for (const automacao of automacoes) {
    const acoes    = typeof automacao.acoes === 'string'
      ? JSON.parse(automacao.acoes) : automacao.acoes;
    const resultados   = [];
    let   status       = 'sucesso';
    let   erroMensagem = null;

    for (const acao of acoes) {
      const handler = HANDLERS[acao.tipo];
      if (!handler) {
        resultados.push({ acao: acao.tipo, erro: 'Handler nao encontrado' });
        status = 'parcial';
        continue;
      }
      try {
        const resultado = await handler(acao.dados || {}, payload, organizacao_id);
        resultados.push(resultado);
      } catch (err) {
        resultados.push({ acao: acao.tipo, erro: err.message });
        status       = 'parcial';
        erroMensagem = err.message;
      }
    }

    // Log ass?ncrono ? n?o bloqueia
    automacaoModel.registrarLog(
      automacao.id, trigger_evento, payload, resultados, status, erroMensagem
    ).catch(() => {});

    if (process.env.NODE_ENV === 'development') {
      console.log('[AUTOMACAO] ' + automacao.nome + ' -> ' + status + ' (' + resultados.length + ' acoes)');
    }
  }
}

module.exports = { executar };
