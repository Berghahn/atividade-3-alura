import React from 'react';
import { TaskItem } from './TaskItem';
import { Inbox, CheckCircle, ListPlus, Loader2 } from 'lucide-react';

/**
 * Componente TaskList
 * Gerencia a renderização de várias tarefas ou o estado vazio correspondente.
 * 
 * @param {Array} tasks - Lista de tarefas já filtradas
 * @param {string} currentFilter - 'all' | 'pending' | 'completed'
 * @param {boolean} isLoading - Se está carregando dados pela primeira vez
 * @param {function} onToggle - Ação de alternar status
 * @param {function} onDelete - Ação de excluir tarefa
 */
export function TaskList({ tasks, currentFilter, isLoading, onToggle, onDelete }) {
  // Estado de carregamento inicial
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white/70 rounded-2xl border border-slate-200/60">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
        <p className="text-sm font-medium">Carregando suas tarefas...</p>
      </div>
    );
  }

  // Estado vazio quando não há nenhuma tarefa para o filtro atual
  if (tasks.length === 0) {
    let emptyIcon = <Inbox className="w-12 h-12 text-slate-300" />;
    let emptyTitle = 'Nenhuma tarefa cadastrada';
    let emptySubtitle = 'Adicione uma nova atividade acima para começar o seu dia!';

    if (currentFilter === 'pending') {
      emptyIcon = <CheckCircle className="w-12 h-12 text-emerald-400" />;
      emptyTitle = 'Tudo em dia!';
      emptySubtitle = 'Você não possui nenhuma tarefa pendente no momento.';
    } else if (currentFilter === 'completed') {
      emptyIcon = <ListPlus className="w-12 h-12 text-slate-300" />;
      emptyTitle = 'Nenhuma tarefa concluída ainda';
      emptySubtitle = 'Marque suas tarefas finalizadas clicando no quadrado ao lado delas.';
    }

    return (
      <div className="flex flex-col items-center justify-center py-14 px-4 text-center bg-white/60 backdrop-blur-xs rounded-2xl border border-dashed border-slate-200">
        <div className="mb-3 p-3 bg-slate-50 rounded-2xl">{emptyIcon}</div>
        <h3 className="text-base font-semibold text-slate-700 mb-1">{emptyTitle}</h3>
        <p className="text-sm text-slate-400 max-w-sm">{emptySubtitle}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
