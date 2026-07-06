import api from "./api";

export const webhookService = {
  // Busca todos os webhooks cadastrados para a organização
  listarEndpoints: async () => {
    const res = await api.get("/webhooks");
    return res.data;
  },

  // Cadastra um novo webhook
  criarEndpoint: async (dados) => {
    const res = await api.post("/webhooks", dados);
    return res.data;
  },

  // 🛰️ Telemetria: Busca o histórico de disparos e tentativas da organização
  listarLogs: async () => {
    const res = await api.get("/webhooks/logs");
    return res.data;
  },
};

