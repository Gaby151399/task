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
    <section className="glass-panel rounded-2xl p-4 shadow-sm relative z-20">
      <div className="grid gap-4 md:grid-cols-[1fr_180px_160px_160px]">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input
            className="input input-bordered w-full pl-10 bg-white/60 focus:bg-white focus:ring-2 focus:ring-primary/30 transition-all border-base-200/60 rounded-xl"
            onChange={(event) => updateFilter("search", event.target.value)}
            placeholder="Rechercher une tâche, un créateur..."
            type="search"
            value={filters.search}
          />
        </div>

        <select
          className="select select-bordered w-full bg-white/60 focus:bg-white focus:ring-2 focus:ring-primary/30 transition-all border-base-200/60 rounded-xl font-medium"
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

        <div className="relative">
          <input
            className="input input-bordered w-full bg-white/60 focus:bg-white focus:ring-2 focus:ring-primary/30 transition-all border-base-200/60 rounded-xl text-sm"
            onChange={(event) => updateFilter("from", event.target.value)}
            type="date"
            value={filters.from}
            title="Date de début"
          />
        </div>

        <div className="relative">
          <input
            className="input input-bordered w-full bg-white/60 focus:bg-white focus:ring-2 focus:ring-primary/30 transition-all border-base-200/60 rounded-xl text-sm"
            onChange={(event) => updateFilter("to", event.target.value)}
            type="date"
            value={filters.to}
            title="Date de fin"
          />
        </div>
      </div>
    </section>
  );
}
