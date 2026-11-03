import React, { useState } from 'react';
import { Plus, Loader2, Calendar, Flag, X } from 'lucide-react';

/**
 * Componente TaskInput
 * Permite cadastrar tarefas com título, data de vencimento opcional e nível de prioridade.
 * 
 * Regras do usuário:
 * 1. Data/hora: por padrão sem data específica.
 * 2. Prioridade: por padrão 'baixa', com opções 'media', 'alta' e 'urgente'.
 */
export function TaskInput({ onAddTask, isAdding }) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('baixa');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle || isAdding) return;

    await onAddTask({
      title: trimmedTitle,
      due_date: dueDate ? dueDate : null,
      priority: priority,
    });

    // Reseta o formulário para os valores padrão
    setTitle('');
    setDueDate('');
    setPriority('baixa');
  };

  // Cores de destaque para cada prioridade no seletor
  const priorityColorMap = {
    baixa: 'text-slate-600 bg-slate-100 border-slate-200',
    media: 'text-amber-700 bg-amber-50 border-amber-200',
    alta: 'text-orange-700 bg-orange-50 border-orange-200',
    urgente: 'text-rose-700 bg-rose-50 border-rose-200 font-semibold',
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-sm">
      {/* Campo principal de texto + Botão Adicionar */}
      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="O que você precisa fazer?"
          disabled={isAdding}
          className="flex-1 bg-slate-50/70 border border-slate-200/70 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 text-base transition-all"
        />

        <button
          type="submit"
          disabled={!title.trim() || isAdding}
          className="inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-4 sm:px-5 py-2.5 rounded-xl transition-all shadow-sm shrink-0"
        >
          {isAdding ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span className="hidden sm:inline">Adicionar</span>
            </>
          )}
        </button>
      </div>

      {/* Opções secundárias: Data de Vencimento e Prioridade */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs sm:text-sm">
        {/* Campo de Data (Opcional - por padrão vazio) */}
        <div className="flex items-center gap-2 text-slate-600">
          <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="text-slate-500 font-medium">Vencimento:</span>
          <div className="relative inline-flex items-center">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={isAdding}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:border-indigo-500 text-xs sm:text-sm cursor-pointer"
            />
            {dueDate && (
              <button
                type="button"
                onClick={() => setDueDate('')}
                title="Limpar data (sem data específica)"
                className="ml-1 p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {!dueDate && (
            <span className="text-xs text-slate-400 italic hidden sm:inline">
              (Sem data específica)
            </span>
          )}
        </div>

        {/* Campo de Prioridade (Padrão: Baixa) */}
        <div className="flex items-center gap-2">
          <Flag className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="text-slate-500 font-medium">Prioridade:</span>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            disabled={isAdding}
            className={`rounded-lg px-2.5 py-1 border text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-200 cursor-pointer transition ${priorityColorMap[priority]}`}
          >
            <option value="baixa">Baixa (Padrão)</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>
      </div>
    </form>
  );
}
