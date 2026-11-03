import React, { useState } from 'react';
import { Check, Trash2, Loader2, Calendar, AlertTriangle, Clock } from 'lucide-react';

/**
 * Componente TaskItem
 * Representa uma atividade na lista com:
 * - Checkbox de conclusão
 * - Título da tarefa
 * - Badge de data de vencimento (aviso de atrasada / hoje / data futura)
 * - Badge de prioridade (Urgente, Alta, Média, Baixa)
 * - Botão de exclusão
 */
export function TaskItem({ task, onToggle, onDelete }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Formata data ISO (YYYY-MM-DD) para formato brasileiro (DD/MM/AAAA)
  const formatDateBR = (isoDate) => {
    if (!isoDate) return '';
    try {
      const [year, month, day] = isoDate.split('-');
      return `${day}/${month}/${year}`;
    } catch {
      return isoDate;
    }
  };

  // Avalia se o vencimento está atrasado, é hoje ou no futuro
  const getDueStatus = () => {
    if (!task.due_date) return null;

    if (task.completed) {
      return {
        label: `Vencimento: ${formatDateBR(task.due_date)}`,
        badgeClass: 'bg-slate-100 text-slate-400 border-slate-200',
        icon: <Calendar className="w-3 h-3" />,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = task.due_date.split('-').map(Number);
    const dueDate = new Date(year, month - 1, day);
    dueDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((dueDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: `Atrasada (${formatDateBR(task.due_date)})`,
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
        icon: <AlertTriangle className="w-3 h-3 text-rose-600" />,
      };
    } else if (diffDays === 0) {
      return {
        label: 'Vence hoje!',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold',
        icon: <Clock className="w-3 h-3 text-amber-600" />,
      };
    } else if (diffDays === 1) {
      return {
        label: 'Vence amanhã',
        badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        icon: <Calendar className="w-3 h-3 text-indigo-500" />,
      };
    } else {
      return {
        label: `Vence em ${formatDateBR(task.due_date)}`,
        badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
        icon: <Calendar className="w-3 h-3 text-slate-400" />,
      };
    }
  };

  // Cores das badges de prioridade
  const priorityBadges = {
    baixa: {
      label: 'Baixa',
      className: 'bg-slate-100 text-slate-600 border-slate-200',
    },
    media: {
      label: 'Média',
      className: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    alta: {
      label: 'Alta',
      className: 'bg-orange-50 text-orange-800 border-orange-200 font-semibold',
    },
    urgente: {
      label: 'Urgente',
      className: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
    },
  };

  const currentPriority = priorityBadges[task.priority] || priorityBadges.baixa;
  const dueStatus = getDueStatus();

  const handleToggle = async () => {
    if (isUpdating || isDeleting) return;
    setIsUpdating(true);
    try {
      await onToggle(task.id, !task.completed);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (isUpdating || isDeleting) return;
    setIsDeleting(true);
    try {
      await onDelete(task.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`group flex items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border transition-all duration-200 bg-white ${
        task.completed
          ? 'border-slate-200/60 bg-slate-50/60 opacity-75'
          : 'border-slate-200/80 hover:border-indigo-300 hover:shadow-sm'
      }`}
    >
      {/* Checkbox de Conclusão */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={isUpdating || isDeleting}
        title={task.completed ? 'Marcar como pendente' : 'Marcar como concluída'}
        className={`w-6 h-6 mt-0.5 sm:mt-0 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
          task.completed
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'border-slate-300 hover:border-indigo-500 bg-white'
        }`}
      >
        {isUpdating ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
        ) : task.completed ? (
          <Check className="w-4 h-4 stroke-[3]" />
        ) : null}
      </button>

      {/* Conteúdo Central: Título e Badges */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm sm:text-base font-normal break-words transition-all ${
            task.completed ? 'line-through text-slate-400' : 'text-slate-800'
          }`}
        >
          {task.title}
        </p>

        {/* Badges de Data de Vencimento e Prioridade */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {/* Badge de Prioridade */}
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs ${
              task.completed ? 'bg-slate-100 text-slate-400 border-slate-200' : currentPriority.className
            }`}
          >
            {currentPriority.label}
          </span>

          {/* Badge de Data de Vencimento */}
          {dueStatus && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs ${dueStatus.badgeClass}`}
            >
              {dueStatus.icon}
              <span>{dueStatus.label}</span>
            </span>
          )}
        </div>
      </div>

      {/* Botão de Excluir */}
      <button
        type="button"
        onClick={handleDelete}
        disabled={isUpdating || isDeleting}
        title="Excluir tarefa"
        className="opacity-70 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all shrink-0"
      >
        {isDeleting ? (
          <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
