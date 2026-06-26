require('dotenv').config();
const { pool } = require('../config/database');

// ----------------------------------------------------------------
// Migration — criação das tabelas do CRM (Fase 1)
//
// Este script espelha exatamente as entidades descritas em
// docs/data-model.md. Cada statement usa "CREATE TABLE IF NOT
// EXISTS", o que torna o script IDEMPOTENTE: rodar mais de uma vez
// não causa erro nem duplica nada — tabelas já existentes são
// simplesmente ignoradas.
//
// IDs: usamos CHAR(36) para armazenar UUIDs (ex:
// "550e8400-e29b-41d4-a716-446655440000"), mas o valor do UUID é
// gerado pela aplicação (futuros models), não pelo banco. Essa
// escolha evita depender de uma versão específica do MySQL (gerar
// UUID como valor padrão de coluna só funciona em versões mais
// recentes) e mantém o controle da geração do ID na camada Node.
//
// Ordem de criação: respeitamos a ordem de dependência das chaves
// estrangeiras (FK). Uma tabela só pode referenciar outra que já
// exista:
//   1. usuarios              (sem dependências)
//   2. status_prospeccao     (sem dependências)
//   3. empresas               (depende de usuarios, status_prospeccao)
//   4. contatos                (depende de empresas)
//   5. historico_status        (depende de empresas, status_prospeccao, usuarios)
//   6. observacoes              (depende de empresas, contatos, usuarios)
//   7. tarefas                   (depende de empresas, contatos, usuarios)
//   8. historico_interacoes       (depende de empresas, contatos, usuarios, tarefas)
//
// Catálogos simples (segmento, origem_lead, tipo de interação, tipo
// de tarefa) ficaram como VARCHAR nesta fase, em vez de tabelas
// próprias — diferente de "status_prospeccao", que precisa de
// histórico e ordem de funil, e por isso já nasce como tabela.
// Podem evoluir para tabelas de catálogo em uma fase futura, se a
// operação precisar de mais controle (cores, ordenação, etc).
// ----------------------------------------------------------------

const migrations = [
  {
    name: 'usuarios',
    sql: `
      CREATE TABLE IF NOT EXISTS usuarios (
        id CHAR(36) NOT NULL PRIMARY KEY,
        nome VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL,
        papel VARCHAR(50) NOT NULL DEFAULT 'SDR',
        ativo BOOLEAN NOT NULL DEFAULT TRUE,
        data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_usuarios_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: 'status_prospeccao',
    sql: `
      CREATE TABLE IF NOT EXISTS status_prospeccao (
        id CHAR(36) NOT NULL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        ordem_funil INT NOT NULL,
        cor_hex VARCHAR(7) NULL,
        ativo BOOLEAN NOT NULL DEFAULT TRUE,
        UNIQUE KEY uk_status_prospeccao_nome (nome)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: 'empresas',
    sql: `
      CREATE TABLE IF NOT EXISTS empresas (
        id CHAR(36) NOT NULL PRIMARY KEY,
        nome_fantasia VARCHAR(150) NOT NULL,
        razao_social VARCHAR(150) NULL,
        cnpj VARCHAR(18) NULL,
        segmento VARCHAR(100) NULL,
        porte ENUM('micro', 'pequena', 'media', 'grande') NULL,
        site VARCHAR(255) NULL,
        origem_lead VARCHAR(100) NULL,
        responsavel_id CHAR(36) NULL,
        status_atual_id CHAR(36) NULL,
        ativo BOOLEAN NOT NULL DEFAULT TRUE,
        data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_empresas_cnpj (cnpj),
        KEY idx_empresas_nome_fantasia (nome_fantasia),
        CONSTRAINT fk_empresas_responsavel
          FOREIGN KEY (responsavel_id) REFERENCES usuarios (id)
          ON DELETE SET NULL,
        CONSTRAINT fk_empresas_status_atual
          FOREIGN KEY (status_atual_id) REFERENCES status_prospeccao (id)
          ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: 'contatos',
    sql: `
      CREATE TABLE IF NOT EXISTS contatos (
        id CHAR(36) NOT NULL PRIMARY KEY,
        empresa_id CHAR(36) NOT NULL,
        nome VARCHAR(150) NOT NULL,
        cargo VARCHAR(100) NULL,
        email VARCHAR(150) NULL,
        telefone VARCHAR(30) NULL,
        linkedin_url VARCHAR(255) NULL,
        contato_principal BOOLEAN NOT NULL DEFAULT FALSE,
        ativo BOOLEAN NOT NULL DEFAULT TRUE,
        data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY idx_contatos_email (email),
        CONSTRAINT fk_contatos_empresa
          FOREIGN KEY (empresa_id) REFERENCES empresas (id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: 'historico_status',
    sql: `
      CREATE TABLE IF NOT EXISTS historico_status (
        id CHAR(36) NOT NULL PRIMARY KEY,
        empresa_id CHAR(36) NOT NULL,
        status_anterior_id CHAR(36) NULL,
        status_novo_id CHAR(36) NOT NULL,
        usuario_id CHAR(36) NULL,
        motivo TEXT NULL,
        data_alteracao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_historico_status_empresa
          FOREIGN KEY (empresa_id) REFERENCES empresas (id)
          ON DELETE CASCADE,
        CONSTRAINT fk_historico_status_anterior
          FOREIGN KEY (status_anterior_id) REFERENCES status_prospeccao (id)
          ON DELETE SET NULL,
        CONSTRAINT fk_historico_status_novo
          FOREIGN KEY (status_novo_id) REFERENCES status_prospeccao (id)
          ON DELETE RESTRICT,
        CONSTRAINT fk_historico_status_usuario
          FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
          ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: 'observacoes',
    sql: `
      CREATE TABLE IF NOT EXISTS observacoes (
        id CHAR(36) NOT NULL PRIMARY KEY,
        empresa_id CHAR(36) NOT NULL,
        contato_id CHAR(36) NULL,
        usuario_id CHAR(36) NULL,
        conteudo TEXT NOT NULL,
        data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_observacoes_empresa
          FOREIGN KEY (empresa_id) REFERENCES empresas (id)
          ON DELETE CASCADE,
        CONSTRAINT fk_observacoes_contato
          FOREIGN KEY (contato_id) REFERENCES contatos (id)
          ON DELETE SET NULL,
        CONSTRAINT fk_observacoes_usuario
          FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
          ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: 'tarefas',
    sql: `
      CREATE TABLE IF NOT EXISTS tarefas (
        id CHAR(36) NOT NULL PRIMARY KEY,
        empresa_id CHAR(36) NOT NULL,
        contato_id CHAR(36) NULL,
        titulo VARCHAR(200) NOT NULL,
        descricao TEXT NULL,
        tipo VARCHAR(50) NULL,
        prioridade ENUM('baixa', 'media', 'alta') NOT NULL DEFAULT 'media',
        status ENUM('pendente', 'em_andamento', 'concluida', 'cancelada')
          NOT NULL DEFAULT 'pendente',
        data_vencimento DATETIME NULL,
        data_conclusao DATETIME NULL,
        responsavel_id CHAR(36) NULL,
        criado_por_id CHAR(36) NULL,
        data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY idx_tarefas_status (status),
        KEY idx_tarefas_data_vencimento (data_vencimento),
        CONSTRAINT fk_tarefas_empresa
          FOREIGN KEY (empresa_id) REFERENCES empresas (id)
          ON DELETE CASCADE,
        CONSTRAINT fk_tarefas_contato
          FOREIGN KEY (contato_id) REFERENCES contatos (id)
          ON DELETE SET NULL,
        CONSTRAINT fk_tarefas_responsavel
          FOREIGN KEY (responsavel_id) REFERENCES usuarios (id)
          ON DELETE SET NULL,
        CONSTRAINT fk_tarefas_criado_por
          FOREIGN KEY (criado_por_id) REFERENCES usuarios (id)
          ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
  {
    name: 'historico_interacoes',
    sql: `
      CREATE TABLE IF NOT EXISTS historico_interacoes (
        id CHAR(36) NOT NULL PRIMARY KEY,
        empresa_id CHAR(36) NOT NULL,
        contato_id CHAR(36) NULL,
        usuario_id CHAR(36) NULL,
        tipo_interacao VARCHAR(50) NOT NULL,
        resumo TEXT NOT NULL,
        resultado VARCHAR(50) NULL,
        tarefa_origem_id CHAR(36) NULL,
        data_interacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY idx_historico_interacoes_data (data_interacao),
        CONSTRAINT fk_historico_interacoes_empresa
          FOREIGN KEY (empresa_id) REFERENCES empresas (id)
          ON DELETE CASCADE,
        CONSTRAINT fk_historico_interacoes_contato
          FOREIGN KEY (contato_id) REFERENCES contatos (id)
          ON DELETE SET NULL,
        CONSTRAINT fk_historico_interacoes_usuario
          FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
          ON DELETE SET NULL,
        CONSTRAINT fk_historico_interacoes_tarefa
          FOREIGN KEY (tarefa_origem_id) REFERENCES tarefas (id)
          ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `,
  },
];

// ----------------------------------------------------------------
// Executa cada CREATE TABLE em sequência, na ordem do array acima.
// Se uma tabela falhar (ex: erro de sintaxe, FK apontando para
// algo que ainda não existe), o script para imediatamente e
// reporta exatamente qual tabela falhou, em vez de continuar e
// deixar o banco num estado parcial sem aviso.
// ----------------------------------------------------------------
async function runMigrations() {
  console.log('Iniciando migrations do CRM 2Pak Studio...\n');

  for (const migration of migrations) {
    try {
      await pool.query(migration.sql);
      console.log(`✔ Tabela "${migration.name}" criada (ou já existente).`);
    } catch (error) {
      console.error(`✘ Erro ao criar a tabela "${migration.name}":`);
      console.error(error.message);
      await pool.end();
      process.exit(1);
    }
  }

  console.log('\nMigrations concluídas com sucesso.');
  await pool.end();
  process.exit(0);
}

runMigrations();