module.exports = {
  up: async (pool) => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS status_prospeccao (
        id CHAR(36) NOT NULL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        ordem_funil INT NOT NULL,
        cor_hex VARCHAR(7) NULL,
        ativo BOOLEAN NOT NULL DEFAULT TRUE,
        UNIQUE KEY uk_status_prospeccao_nome (nome)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS empresas (
        id CHAR(36) NOT NULL PRIMARY KEY,
        nome_fantasia VARCHAR(150) NOT NULL,
        razao_social VARCHAR(150) NULL,
        cnpj VARCHAR(18) NULL,
        segmento VARCHAR(100) NULL,
        porte ENUM('micro','pequena','media','grande') NULL,
        site VARCHAR(255) NULL,
        origem_lead VARCHAR(100) NULL,
        status_atual_id CHAR(36) NULL,
        ativo BOOLEAN NOT NULL DEFAULT TRUE,
        data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_empresas_cnpj (cnpj),
        KEY idx_empresas_nome_fantasia (nome_fantasia),
        CONSTRAINT fk_empresas_status_atual FOREIGN KEY (status_atual_id) REFERENCES status_prospeccao (id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    await pool.query(`
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
        CONSTRAINT fk_contatos_empresa FOREIGN KEY (empresa_id) REFERENCES empresas (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS observacoes (
        id CHAR(36) NOT NULL PRIMARY KEY,
        empresa_id CHAR(36) NOT NULL,
        contato_id CHAR(36) NULL,
        conteudo TEXT NOT NULL,
        data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_observacoes_empresa FOREIGN KEY (empresa_id) REFERENCES empresas (id) ON DELETE CASCADE,
        CONSTRAINT fk_observacoes_contato FOREIGN KEY (contato_id) REFERENCES contatos (id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tarefas (
        id CHAR(36) NOT NULL PRIMARY KEY,
        empresa_id CHAR(36) NOT NULL,
        contato_id CHAR(36) NULL,
        titulo VARCHAR(200) NOT NULL,
        descricao TEXT NULL,
        prioridade ENUM('baixa','media','alta') NOT NULL DEFAULT 'media',
        status ENUM('pendente','em_andamento','concluida','cancelada') NOT NULL DEFAULT 'pendente',
        data_vencimento DATETIME NULL,
        data_conclusao DATETIME NULL,
        data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY idx_tarefas_status (status),
        KEY idx_tarefas_data_vencimento (data_vencimento),
        CONSTRAINT fk_tarefas_empresa FOREIGN KEY (empresa_id) REFERENCES empresas (id) ON DELETE CASCADE,
        CONSTRAINT fk_tarefas_contato FOREIGN KEY (contato_id) REFERENCES contatos (id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  },
  down: async (pool) => {
    await pool.query('DROP TABLE IF EXISTS tarefas');
    await pool.query('DROP TABLE IF EXISTS observacoes');
    await pool.query('DROP TABLE IF EXISTS contatos');
    await pool.query('DROP TABLE IF EXISTS empresas');
    await pool.query('DROP TABLE IF EXISTS status_prospeccao');
  },
};
