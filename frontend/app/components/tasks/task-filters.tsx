"use client";

import { TASK_STATUS_LABELS, TASK_STATUSES } from "../../lib/task-options";
import { TaskFilters as TaskFiltersType, TaskStatus } from "../../lib/types";

type TaskFiltersProps = {
  filters: TaskFiltersType;
  onChange: (filters: TaskFiltersType) => void;
};

export function TaskFilters({ filters, onChange }: TaskFiltersProps) {
  const updateFilter = <Key extends keyof TaskFiltersType>(
    key: Key,
    value: TaskFiltersType[Key],
  ) => {
    onChange({ ...filters, [key]: value, page: 1 });
  };

  return (
    <section className="rounded-lg border border-base-300 bg-base-100 p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[1fr_170px_145px_145px]">
        <input
          className="input input-bordered"
          onChange={(event) => updateFilter("search", event.target.value)}
          placeholder="Rechercher par nom ou email"
          type="search"
          value={filters.search}
        />

        <select
          className="select select-bordered"
          onChange={(event) =>
            updateFilter("status", event.target.value as TaskStatus | "")
          }
          value={filters.status}
        >
          <option value="">Tous les statuts</option>
          {TASK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {TASK_STATUS_LABELS[status]}
            </option>
          ))}
        </select>

        <input
          className="input input-bordered"
          onChange={(event) => updateFilter("from", event.target.value)}
          type="date"
          value={filters.from}
        />

        <input
          className="input input-bordered"
          onChange={(event) => updateFilter("to", event.target.value)}
          type="date"
          value={filters.to}
        />
      </div>
    </section>
  );
}
