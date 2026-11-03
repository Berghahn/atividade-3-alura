<?php
/**
 * API REST de Tarefas (To-Do List) em PHP com Suporte a Data de Vencimento e Prioridade
 * 
 * Este arquivo gerencia todas as operações de tarefas:
 * - Listagem com ordenação inteligente (mais próximo do vencimento, maior prioridade, etc.)
 * - Criação de tarefas com data de vencimento opcional e nível de prioridade
 * - Atualização de status e exclusão
 */

// 1. Configurações de Cabeçalhos (Headers) e CORS
if (!headers_sent()) {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Content-Type: application/json; charset=utf-8");
}

// Trata requisições OPTIONS do navegador (CORS preflight)
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2. Inclui a conexão e migração automática do banco SQLite
require_once __DIR__ . '/database.php';

// Função auxiliar para capturar o corpo da requisição JSON enviado pelo React
if (!function_exists('getJsonInput')) {
    function getJsonInput() {
        $raw = file_get_contents('php://input');
        return json_decode($raw, true) ?? [];
    }
}

// Lista de prioridades válidas no sistema
$validPriorities = ['baixa', 'media', 'alta', 'urgente'];

try {
    switch ($method) {
        /**
         * GET: Retorna as tarefas ordenadas
         * Suporta parâmetro ?sort=due_date | priority | recent
         */
        case 'GET':
            $sort = $_GET['sort'] ?? 'due_date';

            // Monta a cláusula ORDER BY no SQL de acordo com a preferência
            if ($sort === 'priority') {
                // Ordenação por Prioridade: Urgente (1) -> Alta (2) -> Média (3) -> Baixa (4)
                $orderBy = "
                    completed ASC,
                    CASE priority
                        WHEN 'urgente' THEN 1
                        WHEN 'alta' THEN 2
                        WHEN 'media' THEN 3
                        WHEN 'baixa' THEN 4
                        ELSE 5
                    END ASC,
                    CASE WHEN due_date IS NULL OR due_date = '' THEN 1 ELSE 0 END ASC,
                    due_date ASC,
                    id DESC
                ";
            } elseif ($sort === 'recent') {
                // Ordenação por Mais Recentes (criação)
                $orderBy = "completed ASC, id DESC";
            } else {
                // Padrão: Mais Próximas de Vencer primeiro!
                // Tarefas pendentes primeiro.
                // Tarefas COM data de vencimento aparecem antes em ordem cronológica (mais próximas primeiro).
                // Tarefas SEM data aparecem em seguida ordenadas pelas mais recentes.
                $orderBy = "
                    completed ASC,
                    CASE WHEN due_date IS NULL OR due_date = '' THEN 1 ELSE 0 END ASC,
                    due_date ASC,
                    id DESC
                ";
            }

            $sql = "SELECT id, title, completed, due_date, priority, created_at FROM tasks ORDER BY {$orderBy}";
            $stmt = $pdo->query($sql);
            $tasks = $stmt->fetchAll();

            // Formatação consistente dos tipos de dados para o React
            $formattedTasks = array_map(function ($task) use ($validPriorities) {
                return [
                    'id' => (int) $task['id'],
                    'title' => $task['title'],
                    'completed' => (bool) $task['completed'],
                    'due_date' => !empty($task['due_date']) ? $task['due_date'] : null,
                    'priority' => in_array($task['priority'], $validPriorities) ? $task['priority'] : 'baixa',
                    'created_at' => $task['created_at']
                ];
            }, $tasks);

            echo json_encode($formattedTasks);
            break;

        /**
         * POST: Adiciona uma nova tarefa
         * Recebe JSON: { title: "...", due_date: "YYYY-MM-DD"|null, priority: "baixa"|"media"|"alta"|"urgente" }
         */
        case 'POST':
            $data = getJsonInput();
            $title = trim($data['title'] ?? '');
            
            // Tratamento da data de vencimento: se vazia ou não enviada, grava como NULL
            $dueDate = !empty($data['due_date']) ? trim($data['due_date']) : null;
            
            // Tratamento da prioridade: padrão 'baixa' se não fornecida ou inválida
            $priority = strtolower(trim($data['priority'] ?? 'baixa'));
            if (!in_array($priority, $validPriorities)) {
                $priority = 'baixa';
            }

            if (empty($title)) {
                http_response_code(400);
                echo json_encode(['error' => 'O título da tarefa não pode estar vazio.']);
                exit;
            }

            // Inserção segura usando Prepared Statements
            $stmt = $pdo->prepare("
                INSERT INTO tasks (title, completed, due_date, priority)
                VALUES (:title, 0, :due_date, :priority)
            ");
            $stmt->execute([
                ':title' => $title,
                ':due_date' => $dueDate,
                ':priority' => $priority
            ]);

            // Busca os dados recém-inseridos para devolver ao frontend
            $newId = (int) $pdo->lastInsertId();
            $newTaskStmt = $pdo->prepare("SELECT id, title, completed, due_date, priority, created_at FROM tasks WHERE id = :id");
            $newTaskStmt->execute([':id' => $newId]);
            $newTask = $newTaskStmt->fetch();

            http_response_code(201);
            echo json_encode([
                'id' => (int) $newTask['id'],
                'title' => $newTask['title'],
                'completed' => (bool) $newTask['completed'],
                'due_date' => !empty($newTask['due_date']) ? $newTask['due_date'] : null,
                'priority' => $newTask['priority'],
                'created_at' => $newTask['created_at']
            ]);
            break;

        /**
         * PATCH ou PUT: Atualiza status de conclusão ou outros campos da tarefa
         */
        case 'PATCH':
        case 'PUT':
            $data = getJsonInput();
            $id = isset($data['id']) ? (int) $data['id'] : null;

            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID da tarefa não informado.']);
                exit;
            }

            // Verifica se a tarefa existe
            $checkStmt = $pdo->prepare("SELECT * FROM tasks WHERE id = :id");
            $checkStmt->execute([':id' => $id]);
            $current = $checkStmt->fetch();

            if (!$current) {
                http_response_code(404);
                echo json_encode(['error' => 'Tarefa não encontrada.']);
                exit;
            }

            // Determina se completed foi alterado
            $completed = isset($data['completed']) 
                ? ($data['completed'] ? 1 : 0) 
                : ($current['completed'] ? 0 : 1);

            // Permite atualizar também prioridade ou data se forem enviadas
            $dueDate = array_key_exists('due_date', $data)
                ? (!empty($data['due_date']) ? trim($data['due_date']) : null)
                : $current['due_date'];

            $priority = array_key_exists('priority', $data) && in_array(strtolower($data['priority']), $validPriorities)
                ? strtolower($data['priority'])
                : $current['priority'];

            $updateStmt = $pdo->prepare("
                UPDATE tasks 
                SET completed = :completed, due_date = :due_date, priority = :priority 
                WHERE id = :id
            ");
            $updateStmt->execute([
                ':completed' => $completed,
                ':due_date' => $dueDate,
                ':priority' => $priority,
                ':id' => $id
            ]);

            echo json_encode([
                'success' => true,
                'id' => $id,
                'completed' => (bool) $completed,
                'due_date' => $dueDate,
                'priority' => $priority
            ]);
            break;

        /**
         * DELETE: Remove uma tarefa pelo ID
         */
        case 'DELETE':
            $data = getJsonInput();
            $id = isset($_GET['id']) ? (int) $_GET['id'] : (isset($data['id']) ? (int) $data['id'] : null);

            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID da tarefa não informado para exclusão.']);
                exit;
            }

            $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = :id");
            $stmt->execute([':id' => $id]);

            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'Tarefa não encontrada para excluir.']);
                exit;
            }

            echo json_encode(['success' => true, 'message' => 'Tarefa removida com sucesso.']);
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Método HTTP não permitido.']);
            break;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Erro interno no servidor ao processar requisição.',
        'details' => $e->getMessage()
    ]);
}
