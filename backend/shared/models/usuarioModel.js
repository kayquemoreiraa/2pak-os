const { pool } = require('../../config/database');
const supabase = pool.supabase;

const usuarioModel = {
  // Busca o usuário por e-mail trazendo a senha para validação no login
  findByEmailComSenha: async (email) => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nome, email, senha, role, organizacao_id, ativo')
      .eq('email', email)
      .eq('ativo', true)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    // Adapta o campo "senha" do banco para "senha_hash" e "role" para "papel" esperado pelo controller
    return {
      id: data.id,
      nome: data.nome,
      email: data.email,
      senha_hash: data.senha,
      papel: data.role,
      organizacao_id: data.organizacao_id
    };
  },

  // Busca um usuário pelo ID
  findById: async (id) => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nome, email, role, organizacao_id, ativo')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      nome: data.nome,
      email: data.email,
      papel: data.role,
      organizacao_id: data.organizacao_id,
      ativo: data.ativo
    };
  },

  // Lista todos os usuários de uma organização
  findAll: async (organizacao_id) => {
    let query = supabase.from('usuarios').select('id, nome, email, role, organizacao_id, ativo');
    
    if (organizacao_id) {
      query = query.eq('organizacao_id', organizacao_id);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.map(u => ({
      id: u.id,
      nome: u.nome,
      email: u.email,
      papel: u.role,
      organizacao_id: u.organizacao_id,
      ativo: u.ativo
    }));
  },

  // Cria um novo usuário de forma real e segura
  create: async ({ nome, email, senha_hash, papel, organizacao_id }) => {
    const { data, error } = await supabase
      .from('usuarios')
      .insert([
        { nome, email, senha: senha_hash, role: papel, organizacao_id }
      ])
      .select()
      .single();

    if (error) {
      // Replica o código de erro de e-mail duplicado para o controller disparar o HTTP 409
      if (error.code === '23505') {
        const dupError = new Error('Email duplicado');
        dupError.code = 'ER_DUP_ENTRY';
        throw dupError;
      }
      throw error;
    }

    return {
      id: data.id,
      nome: data.nome,
      email: data.email,
      papel: data.role,
      organizacao_id: data.organizacao_id
    };
  },

  // Atualiza dados cadastrais
  update: async (id, { nome, papel, ativo }) => {
    const { data, error } = await supabase
      .from('usuarios')
      .update({ nome, role: papel, ativo })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      nome: data.nome,
      email: data.email,
      papel: data.role,
      ativo: data.ativo
    };
  },

  // Atualiza senha do usuário
  updateSenha: async (id, novoHash) => {
    const { error } = await supabase
      .from('usuarios')
      .update({ senha: novoHash })
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // Registra metadados de último login (opcional, simulado)
  updateUltimoLogin: async (id) => {
    // Como a tabela estruturada não possui essa coluna estrita, mantemos a resolução de sucesso
    return true;
  },

  // Desativação lógica (Soft Delete)
  softDelete: async (id) => {
    const { error } = await supabase
      .from('usuarios')
      .update({ ativo: false })
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

module.exports = usuarioModel;
