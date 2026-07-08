const { pool } = require('../../../config/database');
const supabase = pool.supabase;

async function criar(req, res) {
  const { nome, email, senha } = req.body;
  try {
    const { data, error } = await supabase.auth.signUp({
      email, password: senha, options: { data: { nome_completo: nome } }
    });

    if (error) return res.status(400).json({ erro: error.message });

    // Inserimos apenas o necessário. Repare que não enviamos "senha" aqui.
    const { error: profileError } = await supabase
      .from('usuarios')
      .insert([{ 
        auth_id: data.user.id, 
        nome: nome, 
        email: email, 
        role: 'admin', 
        ativo: true 
      }]);

    if (profileError) {
      console.error("ERRO NO PERFIL:", profileError);
      return res.status(500).json({ erro: 'Erro ao salvar perfil.' });
    }

    res.status(201).json({ mensagem: 'Conta criada com sucesso!' });
  } catch (err) { res.status(500).json({ erro: err.message }); }
}
module.exports = { criar, listar: (req,res)=>res.send(), buscarPorId: (req,res)=>res.send(), atualizar: (req,res)=>res.send(), deletar: (req,res)=>res.send() };
