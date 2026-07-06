const bcrypt       = require('bcryptjs');
const jwt          = require('jsonwebtoken');
const usuarioModel = require('../../../shared/models/usuarioModel');
const eventBus     = require('../../../shared/events');
const { EVENTS }   = require('../../../shared/events');

function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, papel: usuario.papel, organizacao_id: usuario.organizacao_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

async function login(req, res) {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ erro: 'Os campos "email" e "senha" sao obrigatorios.' });
    }
    const usuario = await usuarioModel.findByEmailComSenha(email);
    if (!usuario) return res.status(401).json({ erro: 'Credenciais invalidas.' });
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) return res.status(401).json({ erro: 'Credenciais invalidas.' });
    await usuarioModel.updateUltimoLogin(usuario.id);
    const token = gerarToken(usuario);
    eventBus.emit(EVENTS.USUARIO_LOGIN, { usuario_id: usuario.id, email: usuario.email, papel: usuario.papel });
    res.status(200).json({
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.papel, organizacao_id: usuario.organizacao_id },
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao realizar login.', detalhes: error.message });
  }
}

async function me(req, res) {
  try {
    res.status(200).json(req.usuario);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar dados do usuario.' });
  }
}

async function alterarSenha(req, res) {
  try {
    const { senha_atual, nova_senha } = req.body;
    if (!senha_atual || !nova_senha) {
      return res.status(400).json({ erro: 'Os campos "senha_atual" e "nova_senha" sao obrigatorios.' });
    }
    if (nova_senha.length < 8) {
      return res.status(400).json({ erro: 'A nova senha deve ter pelo menos 8 caracteres.' });
    }
    const usuario     = await usuarioModel.findByEmailComSenha(req.usuario.email);
    const senhaValida = await bcrypt.compare(senha_atual, usuario.senha_hash);
    if (!senhaValida) return res.status(401).json({ erro: 'Senha atual incorreta.' });
    const novoHash = await bcrypt.hash(nova_senha, 10);
    await usuarioModel.updateSenha(req.usuario.id, novoHash);
    eventBus.emit(EVENTS.USUARIO_SENHA_ALTERADA, { usuario_id: req.usuario.id });
    res.status(200).json({ mensagem: 'Senha alterada com sucesso.' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao alterar senha.', detalhes: error.message });
  }
}

module.exports = { login, me, alterarSenha };
