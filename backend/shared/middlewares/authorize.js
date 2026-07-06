const HIERARQUIA = { admin: 4, gestor: 3, sdr: 2, operacional: 1 };

function authorize(...papeis) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ erro: 'Nao autenticado.' });
    }
    const nivelUsuario = HIERARQUIA[req.usuario.papel] || 0;
    const nivelMinimo  = Math.max(...papeis.map((p) => HIERARQUIA[p] || 0));
    if (nivelUsuario < nivelMinimo) {
      return res.status(403).json({
        erro:               'Permissao insuficiente para esta acao.',
        papel_atual:        req.usuario.papel,
        papeis_necessarios: papeis,
      });
    }
    next();
  };
}

module.exports = authorize;
