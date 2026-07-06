require('dotenv').config();
const { pool }          = require('../config/database');
const { runMigrations } = require('./runner');

async function main() {
  try {
    await runMigrations(pool);
    await pool.end();
    process.exit(0);
  } catch (error) {
    await pool.end();
    process.exit(1);
  }
}

main();
