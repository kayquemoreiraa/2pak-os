const bcrypt       = require('bcryptjs');
const usuarioModel = require('../../../shared/models/usuarioModel');
const eventBus     = require('../../../shared/events');
const { EVENTS }   = require('../../../shared/events');

async function listar(req, res) {
  try {
    const usuarios = await usuarioModel.findAll(req.usuario.organizacao_id);
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar usuarios.', detalhes: error.message });
  }
}

async function buscarPorId(req, res) {
  try {
    const usuario = await usuarioModel.findById(req.params.id);
    if (!usuario) return res.status(404).json({ erro: 'Usuario nao encontrado.' });
    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar usuario.', detalhes: error.message });
  }
}

async function criar(req, res) {
  try {
    const { nome, email, senha, papel } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Os campos "nome", "email" e "senha" sao obrigatorios.' });
    }
    if (senha.length < 8) {
      return res.status(400).json({ erro: 'A senha deve ter pelo menos 8 caracteres.' });
    }
    const papeis_validos = ['admin','gestor','sdr','operacional'];
    if (papel && !papeis_validos.includes(papel)) {
      return res.status(400).json({ erro: 'Papel invalido.', papeis_validos });
    }
    const senha_hash  = await bcrypt.hash(senha, 10);
    const novoUsuario = await usuarioModel.create({
      nome, email, senha_hash,
      papel:          papel || 'sdr',
      organizacao_id: req.usuario.organizacao_id,
    });
    eventBus.emit(EVENTS.USUARIO_CRIADO, { usuario_id: novoUsuario.id, criado_por_id: req.usuario.id, papel: novoUsuario.papel });
    res.status(201).json(novoUsuario);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Ja existe um usuario com este email.' });
    }
    res.status(500).json({ erro: 'Erro ao criar usuario.', detalhes: error.message });
  }
}

async function atualizar(req, res) {
  try {
    const usuario = await usuarioModel.findById(req.params.id);
    if (!usuario) return res.status(404).json({ erro: 'Usuario nao encontrado.' });
    const ehAdmin          = req.usuario.papel === 'admin';
    const ehProprioUsuario = req.usuario.id === req.params.id;
    if (!ehAdmin && !ehProprioUsuario) {
      return res.status(403).json({ erro: 'Sem permissao para editar este usuario.' });
    }
    if (!req.body.nome || req.body.nome.trim() === '') {
      return res.status(400).json({ erro: 'O campo "nome" e obrigatorio.' });
    }
    const papel = ehAdmin ? (req.body.papel || usuario.papel) : usuario.papel;
    const ativo = ehAdmin ? (req.body.ativo !== undefined ? req.body.ativo : usuario.ativo) : usuario.ativo;
    const atualizado = await usuarioModel.update(req.params.id, { nome: req.body.nome, papel, ativo });
    eventBus.emit(EVENTS.USUARIO_ATUALIZADO, { usuario_id: req.params.id, atualizado_por: req.usuario.id });
    res.status(200).json(atualizado);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar usuario.', detalhes: error.message });
  }
}

async function deletar(req, res) {
  try {
    if (req.usuario.id === req.params.id) {
      return res.status(400).json({ erro: 'Voce nao pode desativar sua propria conta.' });
    }
    const usuario = await usuarioModel.findById(req.params.id);
    if (!usuario) return res.status(404).json({ erro: 'Usuario nao encontrado.' });
    await usuarioModel.softDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao remover usuario.', detalhes: error.message });
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, deletar };
