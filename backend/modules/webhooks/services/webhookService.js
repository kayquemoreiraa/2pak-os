const axios = require('axios');
const crypto = require('crypto');
const WebhookModel = require('../models/webhookModel');

const WebhookService = {
  /**
   * Dispara webhooks cadastrados para um determinado evento de uma organiza??o
   */
  async disparar(evento, organizacaoId, payload) {
    try {
      // 1. Busca todos os endpoints ativos daquela organiza??o que querem ouvir esse evento
      const endpoints = await WebhookModel.buscarEndpointsPorEvento(evento, organizacaoId);
      
      if (!endpoints || endpoints.length === 0) {
        return; // Ningu?m querendo ouvir esse evento nesta organiza??o
      }

      const stringifiedPayload = JSON.stringify(payload);

      // 2. Dispara de forma ass?ncrona para cada endpoint cadastrado
      for (const endpoint of endpoints) {
        // Criar a assinatura de seguran?a usando a chave secreta do webhook (whsec_...)
        const assinatura = crypto
          .createHmac('sha256', endpoint.secret)
          .update(stringifiedPayload)
          .digest('hex');

        // Executa o disparo em segundo plano para n?o travar a thread do banco/sistema
        axios.post(endpoint.url, payload, {
          timeout: 5000, // Desiste ap?s 5 segundos para evitar travamentos por lentid?o externa
          headers: {
            'Content-Type': 'application/json',
            'X-Cortex-Event': evento,
            'X-Cortex-Signature': `sha256=${assinatura}`,
            'User-Agent': 'CortexOS-Webhook-Engine/1.0'
          }
        })
        .then(async (res) => {
          // Resposta com sucesso da URL externa (Status 2xx)
          const respostaStr = typeof res.data === 'object' ? JSON.stringify(res.data) : String(res.data);
          await WebhookModel.registrarLog(endpoint.id, evento, res.status, payload, respostaStr.substring(0, 1000));
        })
        .catch(async (error) => {
          // Falha no disparo (Timeout, Erro 500, URL fora do ar)
          let statusHttp = null;
          let respostaErro = error.message;

          if (error.response) {
            statusHttp = error.response.status;
            respostaErro = typeof error.response.data === 'object' 
              ? JSON.stringify(error.response.data) 
              : String(error.response.data);
          }

          await WebhookModel.registrarLog(
            endpoint.id, 
            evento, 
            statusHttp, 
            payload, 
            `[ERRO DE DISPARO]: ${respostaErro.substring(0, 1000)}`
          );
        });
      }
    } catch (error) {
      console.error(`[Cortex Webhook Engine] Erro cr?tico no processamento do evento ${evento}:`, error.message);
    }
  }
};

module.exports = WebhookService;
