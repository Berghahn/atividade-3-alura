import React, { useState, useEffect } from 'react';
import { TaskHeader } from './components/TaskHeader';
import { TaskInput } from './components/TaskInput';
import { TaskFilter } from './components/TaskFilter';
import { TaskList } from './components/TaskList';
import { fetchTasks, createTask, toggleTask, deleteTask } from './services/api';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Componente Principal: App
 * 
 * Centraliza o estado e a lógica de negócios da aplicação:
 * - Lista de tarefas (`tasks`)
 * - Filtro de status (`filter`: 'all' | 'pending' | 'completed')
 * - Filtro por prioridade (`priorityFilter`: 'all' | 'urgente' | 'alta' | 'media' | 'baixa')
 * - Ordenação ativa (`sortBy`: 'due_date' | 'priority' | 'recent')
 */
export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  // Por padrão, ordena pelas tarefas mais próximas do vencimento
  const [sortBy, setSortBy] = useState('due_date');

  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Carrega as tarefas na inicialização da aplicação
  useEffect(() => {
    loadTasks(sortBy);
  }, []);

  /**
   * Busca as tarefas do backend PHP com o critério de ordenação selecionado
   */
  const loadTasks = async (currentSort = sortBy) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchTasks(currentSort);
      setTasks(data);
    } catch (err) {
      setErrorMessage(
        'Não foi possível conectar ao servidor PHP. Certifique-se de que o backend está ativo: php -S localhost:8000 -t backend'
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Altera a ordem de listagem (Mais próximas de vencer / Maior prioridade / Mais recentes)
   */
  const handleSortChange = async (newSort) => {
    setSortBy(newSort);
    await loadTasks(newSort);
  };

  /**
   * 1. Adicionar uma nova tarefa (com data e prioridade)
   */
  const handleAddTask = async (taskData) => {
    setIsAdding(true);
    setErrorMessage(null);
    try {
      await createTask(taskData);
      // Recarrega a lista para posicionar a nova tarefa conforme o critério de ordenação ativo
      await loadTasks(sortBy);
    } catch (err) {
      setErrorMessage(err.message || 'Erro ao adicionar tarefa.');
    } finally {
      setIsAdding(false);
    }
  };

  /**
   * 2. Marcar tarefa como concluída / pendente
   */
  const handleToggleTask = async (id, nextCompleted) => {
    try {
      await toggleTask(id, nextCompleted);
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, completed: nextCompleted } : task
        )
      );
    } catch (err) {
      setErrorMessage('Erro ao alterar o status da tarefa.');
    }
  };

  /**
   * 3. Remover uma tarefa
   */
  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      setErrorMessage('Erro ao excluir tarefa.');
    }
  };

  // Totais para o cabeçalho e abas
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  // Aplica os filtros na listagem
  const filteredTasks = tasks.filter((task) => {
    // Filtro por Status (Todas / Pendentes / Concluídas)
    if (filter === 'pending' && task.completed) return false;
    if (filter === 'completed' && !task.completed) return false;

    // Filtro por Prioridade (Todas / Urgente / Alta / Média / Baixa)
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

    return true;
  });

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        {/* Banner de erro de conexão com instruções */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-sm shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold mb-1">Aviso de Conexão</p>
              <p className="text-rose-700/90 leading-relaxed">{errorMessage}</p>
            </div>
            <button
              onClick={() => loadTasks(sortBy)}
              className="px-3 py-1 bg-white hover:bg-rose-100/60 border border-rose-300 text-rose-700 font-medium rounded-lg text-xs flex items-center gap-1.5 shrink-0 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Tentar novamente
            </button>
          </div>
        )}

        {/* Cartão Principal */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-5 sm:p-8">
          {/* Cabeçalho */}
          <TaskHeader
            totalTasks={totalTasks}
            completedTasks={completedTasks}
          />

          {/* Formulário com Título, Data Opcional e Prioridade */}
          <TaskInput
            onAddTask={handleAddTask}
            isAdding={isAdding}
          />

          {/* Barra de Filtros de Status, Filtro de Prioridade e Ordenação */}
          <TaskFilter
            currentFilter={filter}
            onFilterChange={setFilter}
            counts={{
              all: totalTasks,
              pending: pendingTasks,
              completed: completedTasks,
            }}
            currentSort={sortBy}
            onSortChange={handleSortChange}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
          />

          {/* Lista de Tarefas */}
          <TaskList
            tasks={filteredTasks}
            currentFilter={filter}
            isLoading={isLoading}
            onToggle={handleToggleTask}
            onDelete={handleDeleteTask}
          />
        </div>

        {/* Rodapé */}
        <footer className="mt-6 text-center text-xs text-slate-400">
          <p>
            Desenvolvido com <span className="font-medium text-slate-600">React</span>,{' '}
            <span className="font-medium text-slate-600">Tailwind CSS</span> e{' '}
            <span className="font-medium text-slate-600">PHP + SQLite</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
