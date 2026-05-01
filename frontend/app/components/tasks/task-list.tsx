"use client";

import {
  TASK_STATUS_BADGES,
  TASK_STATUS_LABELS,
  TASK_STATUSES,
} from "../../lib/task-options";
import { PaginatedTasks, TaskStatus } from "../../lib/types";

type TaskListProps = {
  data?: PaginatedTasks;
  error: string | null;
  isDeleting: boolean;
  isLoading: boolean;
  isUpdating: boolean;
  onDelete: (id: number) => void;
  onPageChange: (page: number) => void;
  onStatusChange: (id: number, status: TaskStatus) => void;
};

// Custom refined badges depending on status
const STATUS_COLORS: Record<TaskStatus, string> = {
  PENDING: "bg-warning/10 text-warning border-warning/30",
  IN_PROGRESS: "bg-info/10 text-info border-info/30",
  COMPLETED: "bg-success/10 text-success border-success/30",
};

export function TaskList({
  data,
  error,
  isDeleting,
  isLoading,
  isUpdating,
  onDelete,
  onPageChange,
  onStatusChange,
}: TaskListProps) {
  const tasks = data?.data ?? [];
  const meta = data?.meta;

  if (isLoading) {
    return (
      <div className="glass-card grid min-h-72 place-items-center rounded-2xl animate-pulse">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-error rounded-xl shadow-sm">{error}</div>;
  }

  return (
    <section className="glass-card overflow-hidden rounded-2xl shadow-lg border border-white/40">
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr className="bg-base-200/50 text-base-content/70 text-sm font-semibold tracking-wide border-b border-base-300">
              <th className="pl-6 py-4">Tâche</th>
              <th className="py-4">Statut</th>
              <th className="py-4">Créateur</th>
              <th className="py-4">Date</th>
              <th className="pr-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-200/50">
            {tasks.map((task) => (
              <tr 
                key={task.id} 
                className="hover:bg-white/60 transition-colors duration-200 group"
              >
                <td className="pl-6 py-5 min-w-72">
                  <p className="font-bold text-base-content group-hover:text-primary transition-colors">{task.title}</p>
                  <p className="mt-1 max-w-xl text-sm text-base-content/60 leading-relaxed font-medium">
                    {task.description}
                  </p>
                </td>
                <td className="py-5">
                  <div className="flex flex-col gap-2.5 items-start">
                    <span
                      className={`badge border badge-sm py-3 px-3 font-semibold tracking-wide ${STATUS_COLORS[task.status]}`}
                    >
                      {TASK_STATUS_LABELS[task.status]}
                    </span>
                    <select
                      className="select select-bordered select-xs w-36 bg-white/50 focus:bg-white shadow-sm border-base-200/60 rounded-lg text-xs font-medium"
                      disabled={isUpdating}
                      onChange={(event) =>
                        onStatusChange(
                          task.id,
                          event.target.value as TaskStatus,
                        )
                      }
                      value={task.status}
                    >
                      {TASK_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {TASK_STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="py-5">
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="bg-primary/10 text-primary rounded-full w-8 h-8 font-bold text-xs ring-1 ring-primary/20">
                        <span>{task.user.name.charAt(0).toUpperCase()}</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{task.user.name}</p>
                      <p className="text-xs text-base-content/50 font-medium">
                        {task.user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-5 whitespace-nowrap text-sm text-base-content/70 font-medium tracking-tight">
                  {new Intl.DateTimeFormat("fr-FR", {
                    dateStyle: "medium",
                  }).format(new Date(task.createdAt))}
                </td>
                <td className="pr-6 py-5 text-right">
                  <button
                    className="btn btn-ghost text-error hover:bg-error hover:text-error-content btn-sm rounded-lg opacity-80 hover:opacity-100 transition-all font-semibold"
                    disabled={isDeleting}
                    onClick={() => onDelete(task.id)}
                    type="button"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tasks.length === 0 ? (
        <div className="px-4 py-16 text-center">
          <div className="bg-base-200/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <p className="text-base-content/50 font-medium">Aucune tâche ne correspond aux filtres.</p>
        </div>
      ) : null}

      {meta ? (
        <footer className="flex flex-col gap-4 bg-base-100/30 border-t border-base-200/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-base-content/60">
            <span className="font-bold text-base-content">{meta.total}</span> résultat{meta.total > 1 ? "s" : ""} <span className="opacity-40 px-1">|</span> Page <span className="font-bold text-base-content">{meta.page}</span> sur {Math.max(meta.totalPages, 1)}
          </p>
          <div className="join shadow-sm rounded-lg">
            <button
              className="btn join-item btn-sm bg-white/70 hover:bg-white border-base-200/50"
              disabled={meta.page <= 1}
              onClick={() => onPageChange(meta.page - 1)}
              type="button"
            >
              «
            </button>
            <button
              className="btn join-item btn-sm bg-white/70 hover:bg-white border-base-200/50"
              disabled={meta.page >= meta.totalPages}
              onClick={() => onPageChange(meta.page + 1)}
              type="button"
            >
              »
            </button>
          </div>
        </footer>
      ) : null}
    </section>
  );
}
