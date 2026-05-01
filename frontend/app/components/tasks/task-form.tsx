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
    <section className="rounded-lg border border-base-300 bg-base-100 p-5 shadow-sm">
      <h2 className="text-lg font-bold">Nouvelle tâche</h2>
      <form className="mt-4 space-y-4" onSubmit={submitForm}>
        <label className="form-control">
          <span className="label-text mb-2">Titre</span>
          <input
            className="input input-bordered"
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            required
            type="text"
            value={form.title}
          />
        </label>

        <label className="form-control">
          <span className="label-text mb-2">Description</span>
          <textarea
            className="textarea textarea-bordered min-h-28"
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            required
            value={form.description}
          />
        </label>

        <label className="form-control">
          <span className="label-text mb-2">Statut</span>
          <select
            className="select select-bordered"
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
        </label>

        {error ? <div className="alert alert-error text-sm">{error}</div> : null}

        <button className="btn btn-primary w-full" disabled={isPending}>
          {isPending ? "Creation..." : "Ajouter la tâche"}
        </button>
      </form>
    </section>
  );
}
