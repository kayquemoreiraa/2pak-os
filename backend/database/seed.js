require('dotenv').config();
const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const statusPadrao = [
  { nome: 'Novo Lead',        ordem_funil: 1, cor_hex: '#6366f1' },
  { nome: 'Qualificacao',     ordem_funil: 2, cor_hex: '#f59e0b' },
  { nome: 'Proposta Enviada', ordem_funil: 3, cor_hex: '#3b82f6' },
  { nome: 'Negociacao',       ordem_funil: 4, cor_hex: '#f97316' },
  { nome: 'Fechado',          ordem_funil: 5, cor_hex: '#22c55e' },
  { nome: 'Perdido',          ordem_funil: 6, cor_hex: '#ef4444' },
];

async function runSeed() {
  console.log('Iniciando seed do 2Pak OS...\n');

  for (const status of statusPadrao) {
    try {
      const [resultado] = await pool.query(
        `INSERT IGNORE INTO status_prospeccao (id, nome, ordem_funil, cor_hex, ativo)
         VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), status.nome, status.ordem_funil, status.cor_hex, true]
      );

      if (resultado.affectedRows > 0) {
        console.log(`[OK] Status "${status.nome}" inserido.`);
      } else {
        console.log(`[--] Status "${status.nome}" ja existe, ignorado.`);
      }
    } catch (error) {
      console.error(`[ERRO] Ao inserir "${status.nome}": ${error.message}`);
      await pool.end();
      process.exit(1);
    }
  }

  console.log('\nSeed concluido com sucesso.');
  await pool.end();
  process.exit(0);
}

runSeed();
