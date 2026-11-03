import React from 'react';
import { CheckCircle2, ListTodo } from 'lucide-react';

/**
 * Componente TaskHeader
 * Exibe o título principal, ícone e resumo da quantidade de tarefas concluídas.
 * 
 * @param {number} totalTasks - Quantidade total de tarefas cadastradas
 * @param {number} completedTasks - Quantidade de tarefas já finalizadas
 */
export function TaskHeader({ totalTasks, completedTasks }) {
  const pendingTasks = totalTasks - completedTasks;

  return (
    <header className="mb-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Título e Ícone */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <ListTodo className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Minha Lista de Tarefas
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Organize suas atividades diárias com foco e simplicidade
            </p>
          </div>
        </div>

        {/* Resumo de progresso em pílula */}
        <div className="flex items-center gap-2 bg-indigo-50/80 border border-indigo-100 px-4 py-2 rounded-full text-indigo-700 text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4 text-indigo-600" />
          <span>
            {completedTasks} de {totalTasks} concluídas
          </span>
          {pendingTasks > 0 && (
            <span className="text-xs bg-indigo-200/70 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
              {pendingTasks} pendente{pendingTasks > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
