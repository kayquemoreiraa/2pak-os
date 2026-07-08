const eventBus = require('../../../shared/events');
const { EVENTS } = require('../../../shared/events');
const pipelineModel = require('../models/pipelineModel');

// Envolvemos tudo em um bloco para garantir que NENHUM erro saia daqui
eventBus.on(EVENTS.TAREFA_CRIADA, async (data) => {
    try {
        if (data?.empresa_id) {
            await pipelineModel.moverEmpresa(data.empresa_id, 1);
        }
    } catch (err) {
        // Logamos mas não deixamos o erro propagar
        console.error('ERRO_SILENCIOSO_CRIADA:', err.message);
    }
});

eventBus.on(EVENTS.TAREFA_ATUALIZADA, async (data) => {
    try {
        // Apenas log simples para teste
        console.log('Evento TAREFA_ATUALIZADA capturado com sucesso');
    } catch (err) {
        console.error('ERRO_SILENCIOSO_ATUALIZADA:', err.message);
    }
});
