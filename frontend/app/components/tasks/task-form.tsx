"use client";

import { FormEvent, useState } from "react";
import { TASK_STATUS_LABELS, TASK_STATUSES } from "../../lib/task-options";
import { TaskPayload, TaskStatus } from "../../lib/types";

type TaskFormProps = {
  error: string | null;
  isPending: boolean;
  onCreate: (payload: TaskPayload) => void;
};

export function TaskForm({ error, isPending, onCreate }: TaskFormProps) {
  const [form, setForm] = useState<TaskPayload>({
    title: "",
    description: "",
    status: "PENDING",
  });

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onCreate(form);
    setForm({ title: "", description: "", status: "PENDING" });
  };

  return (
    <section className="glass-card rounded-2xl p-6 shadow-lg border border-white/40 sticky top-24">
      <h2 className="text-xl font-bold flex items-center gap-2 text-base-content">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-primary">
          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
        </svg>
        Nouvelle tâche
      </h2>
      
      <form className="mt-6 space-y-5" onSubmit={submitForm}>
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Titre de la tâche</span>
          </label>
          <input
            className="input input-bordered w-full bg-white/60 focus:bg-white focus:ring-2 focus:ring-primary/30 transition-all border-base-200/60 rounded-xl"
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            placeholder="Ex: Refonte du tableau de bord"
            required
            type="text"
            value={form.title}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Description détaillée</span>
          </label>
          <textarea
            className="textarea textarea-bordered min-h-32 w-full bg-white/60 focus:bg-white focus:ring-2 focus:ring-primary/30 transition-all border-base-200/60 rounded-xl resize-none"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            placeholder="Détaillez les objectifs de cette tâche..."
            required
            value={form.description}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Statut initial</span>
          </label>
          <select
            className="select select-bordered w-full bg-white/60 focus:bg-white focus:ring-2 focus:ring-primary/30 transition-all border-base-200/60 rounded-xl font-medium"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                status: event.target.value as TaskStatus,
              }))
            }
            value={form.status}
          >
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {TASK_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="alert alert-error text-sm rounded-xl py-2 animate-fade-in shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        )}

        <button 
          className="btn btn-primary w-full h-12 rounded-xl mt-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all text-base border-0 font-bold" 
          disabled={isPending}
        >
          {isPending ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            "Créer la tâche"
          )}
        </button>
      </form>
    </section>
  );
}
