function notFound(req, res, next) {
  const erro = new Error(`Rota nao encontrada: ${req.method} ${req.originalUrl}`);
  erro.status = 404;
  next(erro);
}

module.exports = notFound;