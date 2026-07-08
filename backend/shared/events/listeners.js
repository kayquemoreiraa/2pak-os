const { EVENTS } = require('./index');
const eventBus = require('./index'); // Importa a própria instância do bus
const AutomacaoService = require('../../modules/automacoes/services/automacaoService');

const registrarListeners = () => {
    console.log('--- REGISTRANDO LISTENERS (AUTO-INICIALIZADO) ---');
    
    eventBus.on(EVENTS.TAREFA_ATUALIZADA, async (dados) => {
        try {
            const orgId = dados?.organizacao_id || null;
            if (orgId) {
                await AutomacaoService.executar(EVENTS.TAREFA_ATUALIZADA, orgId, dados);
            }
        } catch (err) {
            console.error('Erro no Listener de Tarefa:', err.message);
        }
    });
};

module.exports = { registrarListeners };
