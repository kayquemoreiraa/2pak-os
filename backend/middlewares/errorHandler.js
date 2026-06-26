function errorHandler(err, req, res, next) {
  const status = err.status || 500;

  const resposta = {
    erro: err.message || 'Erro interno do servidor.',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === 'development') {
    resposta.stack = err.stack;
  }

  console.error(`[ERRO] ${req.method} ${req.originalUrl} -> ${status}: ${err.message}`);

  res.status(status).json(resposta);
}

module.exports = errorHandler;