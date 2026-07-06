require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const { testConnection }     = require('./config/database');
const { registrarListeners } = require('./shared/events/listeners');

const authModule         = require('./modules/auth');
const crmModule          = require('./modules/crm');
const notificacoesModule = require('./modules/notificacoes');
const webhooksModule     = require('./modules/webhooks');
const automacoesModule   = require('./modules/automacoes');

const notFound     = require('./shared/middlewares/notFound');
const errorHandler = require('./shared/middlewares/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok', service: 'Cortex OS', version: '0.4.0',
    timestamp: new Date().toISOString(),
  });
});

const v1 = express.Router();
v1.use('/', authModule);
v1.use('/', crmModule);
v1.use('/', notificacoesModule);
v1.use('/', webhooksModule);
v1.use('/', automacoesModule);

app.use('/api/v1', v1);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await testConnection();
    console.log('Conexao com MySQL estabelecida com sucesso.');
    registrarListeners();
    app.listen(PORT, () => {
      console.log('Cortex OS v0.4.0 rodando na porta ' + PORT);
      console.log('API: http://localhost:' + PORT + '/api/v1');
    });
  } catch (error) {
    console.error('Falha ao conectar ao MySQL:', error.message);
    process.exit(1);
  }
}

startServer();
module.exports = app;
