require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');
const empresaRoutes = require('./routes/empresaRoutes');
const contatoRoutes = require('./routes/contatoRoutes');
const tarefaRoutes = require('./routes/tarefaRoutes');
const observacaoRoutes = require('./routes/observacaoRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const pipelineRoutes = require('./routes/pipelineRoutes');
const statusProspeccaoRoutes = require('./routes/statusProspeccaoRoutes');
const followupRoutes = require('./routes/followupRoutes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: '2Pak OS - Backend',
    timestamp: new Date().toISOString(),
  });
});

app.use('/empresas', empresaRoutes);
app.use('/contatos', contatoRoutes);
app.use('/tarefas', tarefaRoutes);
app.use('/observacoes', observacaoRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/pipeline', pipelineRoutes);
app.use('/status-prospeccao', statusProspeccaoRoutes);
app.use('/followup', followupRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await testConnection();
    console.log('Conexao com o MySQL estabelecida com sucesso.');
    app.listen(PORT, () => {
      console.log(`2Pak OS rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Falha ao conectar ao MySQL. O servidor nao foi iniciado.');
    console.error(error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
