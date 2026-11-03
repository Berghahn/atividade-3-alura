/**
 * Módulo de comunicação com o Backend PHP (API REST)
 * 
 * Centraliza as requisições HTTP para buscar, criar, atualizar e excluir tarefas.
 */

const API_URL = '/api.php';

/**
 * 1. Busca tarefas com opção de ordenação
 * @param {string} sortBy - 'due_date' (padrão) | 'priority' | 'recent'
 */
export async function fetchTasks(sortBy = 'due_date') {
  try {
    const response = await fetch(`${API_URL}?sort=${encodeURIComponent(sortBy)}`);
    if (!response.ok) {
      throw new Error(`Erro no servidor: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    throw error;
  }
}

/**
 * 2. Adiciona uma nova tarefa
 * @param {object} taskData - { title: string, due_date: string|null, priority: string }
 */
export async function createTask({ title, due_date = null, priority = 'baixa' }) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        due_date,
        priority,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao criar tarefa');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao adicionar tarefa:', error);
    throw error;
  }
}

/**
 * 3. Alterna o estado de concluído da tarefa (PATCH)
 * @param {number} id - ID da tarefa
 * @param {boolean} nextCompleted - Novo estado (true ou false)
 */
export async function toggleTask(id, nextCompleted) {
  try {
    const response = await fetch(API_URL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        completed: nextCompleted,
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao atualizar tarefa');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao atualizar status da tarefa:', error);
    throw error;
  }
}

/**
 * 4. Exclui uma tarefa do banco de dados (DELETE)
 * @param {number} id - ID da tarefa a remover
 */
export async function deleteTask(id) {
  try {
    const response = await fetch(`${API_URL}?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erro ao remover tarefa');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao remover tarefa:', error);
    throw error;
  }
}
