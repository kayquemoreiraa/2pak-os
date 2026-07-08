const jwt = require('jsonwebtoken');
const { pool } = require('../../../config/database');
const supabase = pool.supabase;

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
      return res.status(400).json({ erro: 'Os campos "email" e "senha" são obrigatórios.' });
    }

    // Autenticação real com criptografia de ponta do Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      senha
    });

    if (authError) {
      if (authError.message.includes('Email not confirmed')) {
        return res.status(403).json({ erro: 'Acesso bloqueado. Verifique seu Gmail para confirmar sua identidade antes de entrar.' });
      }
      return res.status(401).json({ erro: 'Credenciais inválidas ou não autorizadas.' });
    }

    // Busca os metadados do perfil do usuário na tabela de usuários para pegar o papel (role)
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('id, nome, email, role, organizacao_id, ativo')
      .eq('id', authData.user.id)
      .single();

    if (userError || !usuario || !usuario.ativo) {
      return res.status(403).json({ erro: 'Usuário inativo ou sem permissões no Cortex OS.' });
    }

    const token = gerarToken({
      id: usuario.id,
      email: usuario.email,
      papel: usuario.role,
      organizacao_id: usuario.organizacao_id
    });

    res.status(200).json({
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.role, organizacao_id: usuario.organizacao_id },
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro de cibersegurança ao processar login.', detalhes: error.message });
  }
}

async function me(req, res) {
  try {
    res.status(200).json(req.usuario);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar dados da sessão ativa.' });
  }
}

async function alterarSenha(req, res) {
  try {
    const { nova_senha } = req.body;
    if (!nova_senha || nova_senha.length < 8) {
      return res.status(400).json({ erro: 'A nova senha deve ter pelo menos 8 caracteres.' });
    }

    const { error } = await supabase.auth.updateUser({ password: nova_senha });
    if (error) throw error;

    res.status(200).json({ mensagem: 'Senha alterada com sucesso na infraestrutura de segurança.' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao alterar senha criptografada.', detalhes: error.message });
  }
}

module.exports = { login, me, alterarSenha };
