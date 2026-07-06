require('dotenv').config();
const bcrypt   = require('bcryptjs');
const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const ORG_PADRAO_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const ADMIN_ID      = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
const ADMIN_EMAIL   = 'admin@cortexweb.com.br';
const ADMIN_SENHA   = 'Admin@2024';

const statusPadrao = [
  { nome: 'Novo Lead',        ordem_funil: 1, cor_hex: '#6366f1' },
  { nome: 'Qualificacao',     ordem_funil: 2, cor_hex: '#f59e0b' },
  { nome: 'Proposta Enviada', ordem_funil: 3, cor_hex: '#3b82f6' },
  { nome: 'Negociacao',       ordem_funil: 4, cor_hex: '#f97316' },
  { nome: 'Fechado',          ordem_funil: 5, cor_hex: '#22c55e' },
  { nome: 'Perdido',          ordem_funil: 6, cor_hex: '#ef4444' },
];

async function seedOrganizacao() {
  console.log('\n[1/3] Organizacao padrao...');
  const [existe] = await pool.query('SELECT id FROM organizacoes WHERE id = ?', [ORG_PADRAO_ID]);
  if (existe.length === 0) {
    await pool.query(
      'INSERT INTO organizacoes (id, nome, slug, plano, ativo) VALUES (?, ?, ?, ?, ?)',
      [ORG_PADRAO_ID, 'Cortex Web', 'cortex-web', 'professional', true]
    );
    console.log('[OK] Organizacao "Cortex Web" criada.');
  } else {
    console.log('[--] Organizacao ja existe, ignorado.');
  }
  const tabelas = ['status_prospeccao','empresas','contatos','observacoes','tarefas'];
  for (const tabela of tabelas) {
    try {
      const [res] = await pool.query(
        'UPDATE ' + tabela + ' SET organizacao_id = ? WHERE organizacao_id IS NULL',
        [ORG_PADRAO_ID]
      );
      if (res.affectedRows > 0) {
        console.log('[OK] ' + res.affectedRows + ' registro(s) em "' + tabela + '" vinculados.');
      }
    } catch (_) {}
  }
}

async function seedAdmin() {
  console.log('\n[2/3] Usuario admin padrao...');
  const [existe] = await pool.query('SELECT id FROM usuarios WHERE id = ?', [ADMIN_ID]);
  if (existe.length === 0) {
    const senha_hash = await bcrypt.hash(ADMIN_SENHA, 10);
    await pool.query(
      'INSERT INTO usuarios (id, organizacao_id, nome, email, senha_hash, papel, ativo) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [ADMIN_ID, ORG_PADRAO_ID, 'Admin Cortex', ADMIN_EMAIL, senha_hash, 'admin', true]
    );
    console.log('[OK] Admin criado: ' + ADMIN_EMAIL + ' / ' + ADMIN_SENHA);
    console.log('     ALTERE A SENHA APOS O PRIMEIRO LOGIN!');
  } else {
    console.log('[--] Admin ja existe, ignorado.');
  }
}

async function seedStatus() {
  console.log('\n[3/3] Status de prospeccao...');
  for (const status of statusPadrao) {
    const [res] = await pool.query(
      'INSERT IGNORE INTO status_prospeccao (id, nome, ordem_funil, cor_hex, ativo) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), status.nome, status.ordem_funil, status.cor_hex, true]
    );
    console.log(res.affectedRows > 0 ? '[OK] ' + status.nome : '[--] ' + status.nome + ' ja existe.');
  }
}

async function runSeed() {
  console.log('Cortex OS - Seed de Dados Iniciais');
  await seedOrganizacao();
  await seedAdmin();
  await seedStatus();
  console.log('\nSeed concluido com sucesso.\n');
  await pool.end();
  process.exit(0);
}

runSeed().catch(function(err) {
  console.error('[ERRO FATAL]', err.message);
  process.exit(1);
});
