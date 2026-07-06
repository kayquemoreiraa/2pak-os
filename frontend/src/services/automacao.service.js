// Camada de serviço de Automações
export const AutomacaoService = {
  listar: async () => {
    // Simulando chamada de API
    return [
      { id: 1, nome: 'Notificar no Slack', gatilho: 'NOVO_LEAD', acao: 'ENVIAR_WEBHOOK', ativo: true },
      { id: 2, nome: 'Processar via IA', gatilho: 'VENDA_FECHADA', acao: 'ANALISE_IA', ativo: true }
    ];
  },

  criar: async (dados) => {
    console.log("Criando nova automação:", dados);
    return { success: true, ...dados };
  },

  remover: async (id) => {
    console.log("Removendo automação:", id);
    return { success: true };
  }
};

