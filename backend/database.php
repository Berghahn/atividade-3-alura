<?php
/**
 * Conexão com o Banco de Dados SQLite e Migração Automática
 * 
 * Este arquivo é responsável por:
 * 1. Conectar ao SQLite usando a extensão PDO nativa do PHP.
 * 2. Criar automaticamente o arquivo 'tasks.db' se não existir.
 * 3. Criar a tabela 'tasks' com os campos:
 *    - id (chave primária)
 *    - title (texto da atividade)
 *    - completed (0 para pendente, 1 para concluída)
 *    - due_date (data de vencimento, opcional - padrão NULL)
 *    - priority (prioridade: 'baixa', 'media', 'alta', 'urgente' - padrão 'baixa')
 *    - created_at (data e hora de cadastro)
 * 4. Migração automática: se o banco já existia antes das novas colunas,
 *    ele adiciona as colunas 'due_date' e 'priority' sem perder nenhum dado anterior!
 */

$dbPath = __DIR__ . '/tasks.db';

try {
    // 1. Inicializa a conexão PDO com o SQLite
    $pdo = new PDO("sqlite:" . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // 2. Cria a tabela base se ainda não existir
    $createTableQuery = "
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            completed INTEGER NOT NULL DEFAULT 0,
            due_date TEXT DEFAULT NULL,
            priority TEXT NOT NULL DEFAULT 'baixa',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    ";
    $pdo->exec($createTableQuery);

    // 3. Verificação de Migração: garante compatibilidade com bancos já existentes
    // PRAGMA table_info retorna a lista de todas as colunas da tabela
    $columnsStmt = $pdo->query("PRAGMA table_info(tasks)");
    $existingColumns = array_column($columnsStmt->fetchAll(), 'name');

    // Se a coluna 'due_date' não existia no banco antigo, adiciona agora
    if (!in_array('due_date', $existingColumns)) {
        $pdo->exec("ALTER TABLE tasks ADD COLUMN due_date TEXT DEFAULT NULL");
    }

    // Se a coluna 'priority' não existia no banco antigo, adiciona com valor padrão 'baixa'
    if (!in_array('priority', $existingColumns)) {
        $pdo->exec("ALTER TABLE tasks ADD COLUMN priority TEXT NOT NULL DEFAULT 'baixa'");
    }

} catch (PDOException $e) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(500);
    echo json_encode([
        'error' => 'Falha ao conectar ou migrar o banco de dados SQLite',
        'details' => $e->getMessage()
    ]);
    exit;
}
