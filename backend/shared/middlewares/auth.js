const jwt          = require('jsonwebtoken');
const usuarioModel = require('../models/usuarioModel');

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ erro: 'Token de autenticacao nao fornecido.' });
    }
    const token   = header.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await usuarioModel.findById(decoded.id);
    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ erro: 'Usuario nao encontrado ou inativo.' });
    }
    req.usuario = usuario;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ erro: 'Token expirado. Faca login novamente.' });
    }
    return res.status(401).json({ erro: 'Token invalido.' });
  }
}

module.exports = auth;
