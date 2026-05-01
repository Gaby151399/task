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
      <div className="grid min-h-72 place-items-center rounded-lg border border-base-300 bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <section className="overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-sm">
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Tâche</th>
              <th>Statut</th>
              <th>Createur</th>
              <th>Date</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td className="min-w-72">
                  <p className="font-semibold">{task.title}</p>
                  <p className="mt-1 max-w-xl text-sm text-base-content/65">
                    {task.description}
                  </p>
                </td>
                <td>
                  <div className="flex flex-col gap-2">
                    <span
                      className={`badge ${TASK_STATUS_BADGES[task.status]}`}
                    >
                      {TASK_STATUS_LABELS[task.status]}
                    </span>
                    <select
                      className="select select-bordered select-xs w-36"
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
                <td>
                  <p className="font-medium">{task.user.name}</p>
                  <p className="text-sm text-base-content/60">
                    {task.user.email}
                  </p>
                </td>
                <td className="whitespace-nowrap text-sm">
                  {new Intl.DateTimeFormat("fr-FR", {
                    dateStyle: "medium",
                  }).format(new Date(task.createdAt))}
                </td>
                <td className="text-right">
                  <button
                    className="btn btn-error btn-outline btn-sm"
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
        <div className="border-t border-base-300 px-4 py-12 text-center text-base-content/60">
          Aucune tâche ne correspond aux filtres.
        </div>
      ) : null}

      {meta ? (
        <footer className="flex flex-col gap-3 border-t border-base-300 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-base-content/65">
            {meta.total} résultat{meta.total > 1 ? "s" : ""} · page{" "}
            {meta.page} / {Math.max(meta.totalPages, 1)}
          </p>
          <div className="join">
            <button
              className="btn join-item btn-sm"
              disabled={meta.page <= 1}
              onClick={() => onPageChange(meta.page - 1)}
              type="button"
            >
              Precedent
            </button>
            <button
              className="btn join-item btn-sm"
              disabled={meta.page >= meta.totalPages}
              onClick={() => onPageChange(meta.page + 1)}
              type="button"
            >
              Suivant
            </button>
          </div>
        </footer>
      ) : null}
    </section>
  );
}
