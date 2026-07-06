const fs   = require('fs');
const path = require('path');

async function criarTabelaControle(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      nome         VARCHAR(255) NOT NULL,
      executada_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uk_migrations_nome (nome)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

async function getMigracoesExecutadas(pool) {
  const [rows] = await pool.query('SELECT nome FROM _migrations ORDER BY id ASC');
  return rows.map((r) => r.nome);
}

async function runMigrations(pool) {
  console.log('2Pak OS - Sistema de Migrations Incrementais\n');
  await criarTabelaControle(pool);
  const executadas   = await getMigracoesExecutadas(pool);
  const migracoesDir = path.join(__dirname, 'migrations');

  if (!fs.existsSync(migracoesDir)) {
    console.log('Pasta migrations/ nao encontrada.');
    return;
  }

  const arquivos = fs.readdirSync(migracoesDir).filter((f) => f.endsWith('.js')).sort();
  if (arquivos.length === 0) { console.log('Nenhum arquivo de migration encontrado.'); return; }

  let novas = 0;
  for (const arquivo of arquivos) {
    if (executadas.includes(arquivo)) {
      console.log('[--] ' + arquivo + ' (ja executada)');
      continue;
    }
    try {
      const migration = require(path.join(migracoesDir, arquivo));
      if (typeof migration.up !== 'function') throw new Error('O arquivo nao exporta a funcao "up".');
      await migration.up(pool);
      await pool.query('INSERT INTO _migrations (nome) VALUES (?)', [arquivo]);
      console.log('[OK] ' + arquivo);
      novas++;
    } catch (error) {
      console.error('\n[ERRO] Falha em: ' + arquivo);
      console.error(error.message);
      throw error;
    }
  }

  if (novas === 0) {
    console.log('\nBanco de dados ja esta atualizado.');
  } else {
    console.log('\n' + novas + ' migration(s) executada(s) com sucesso.');
  }
}

module.exports = { runMigrations };
