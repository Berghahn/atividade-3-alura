import React from 'react';
import { ArrowUpDown, Filter } from 'lucide-react';

/**
 * Componente TaskFilter
 * Responsável por:
 * 1. Filtrar tarefas por estado (Todas / Pendentes / Concluídas).
 * 2. Filtrar tarefas por nível de prioridade (Todas / Urgente / Alta / Média / Baixa).
 * 3. Ordenar a listagem (Mais próximas de vencer / Maior prioridade / Mais recentes).
 * 
 * @param {string} currentFilter - 'all' | 'pending' | 'completed'
 * @param {function} onFilterChange - Alterna o filtro de estado
 * @param {object} counts - { all: number, pending: number, completed: number }
 * @param {string} currentSort - 'due_date' | 'priority' | 'recent'
 * @param {function} onSortChange - Alterna a ordem de listagem
 * @param {string} priorityFilter - 'all' | 'urgente' | 'alta' | 'media' | 'baixa'
 * @param {function} onPriorityFilterChange - Alterna o filtro por prioridade
 */
export function TaskFilter({
  currentFilter,
  onFilterChange,
  counts,
  currentSort,
  onSortChange,
  priorityFilter,
  onPriorityFilterChange,
}) {
  const tabs = [
    { id: 'all', label: 'Todas', count: counts.all },
    { id: 'pending', label: 'Pendentes', count: counts.pending },
    { id: 'completed', label: 'Concluídas', count: counts.completed },
  ];

  return (
    <div className="space-y-3 mb-5">
      {/* Linha 1: Abas de Estado (Todas / Pendentes / Concluídas) e Seletor de Ordenação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Abas de status */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/70 max-w-fit">
          {tabs.map((tab) => {
            const isActive = currentFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onFilterChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-xs px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'bg-slate-200/70 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Seletor de Ordenação */}
        <div className="flex items-center gap-2 text-xs sm:text-sm self-start sm:self-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span className="text-slate-500 font-medium">Ordenar:</span>
          <select
            value={currentSort}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 font-medium rounded-lg px-2.5 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 shadow-xs cursor-pointer"
          >
            <option value="due_date">📅 Próximas de vencer (Padrão)</option>
            <option value="priority">🚩 Por Prioridade (Urgente primeiro)</option>
            <option value="recent">🕒 Mais recentes criadas</option>
          </select>
        </div>
      </div>

      {/* Linha 2: Filtro rápido por Prioridade */}
      <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
        <div className="flex items-center gap-1 text-slate-400 font-medium">
          <Filter className="w-3 h-3 text-slate-400" />
          <span>Filtrar prioridade:</span>
        </div>

        {[
          { id: 'all', label: 'Todas' },
          { id: 'urgente', label: '🔴 Urgente' },
          { id: 'alta', label: '🟠 Alta' },
          { id: 'media', label: '🟡 Média' },
          { id: 'baixa', label: '⚪ Baixa' },
        ].map((item) => {
          const isSelected = priorityFilter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onPriorityFilterChange(item.id)}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
