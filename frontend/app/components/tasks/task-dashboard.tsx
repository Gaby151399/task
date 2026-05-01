"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthCard } from "../auth/auth-card";
import { AppShell } from "../layout/app-shell";
import { getApiErrorMessage, tasksApi } from "../../lib/api";
import { useAuthStore } from "../../lib/auth-store";
import { TaskFilters as TaskFiltersType, TaskStatus } from "../../lib/types";
import { TaskFilters } from "./task-filters";
import { TaskForm } from "./task-form";
import { TaskList } from "./task-list";
import { TaskStats } from "./task-stats";

const INITIAL_FILTERS: TaskFiltersType = {
  status: "",
  search: "",
  from: "",
  to: "",
  page: 1,
  limit: 8,
};

export function TaskDashboard() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<TaskFiltersType>(INITIAL_FILTERS);

  const tasksQuery = useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => tasksApi.list(filters),
    enabled: Boolean(accessToken),
  });

  const createTaskMutation = useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: TaskStatus }) =>
      tasksApi.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: tasksApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const stats = useMemo(() => {
    const tasks = tasksQuery.data?.data ?? [];
    return {
      total: tasksQuery.data?.meta.total ?? 0,
      pending: tasks.filter((task) => task.status === "PENDING").length,
      progress: tasks.filter((task) => task.status === "IN_PROGRESS").length,
      completed: tasks.filter((task) => task.status === "COMPLETED").length,
    };
  }, [tasksQuery.data]);

  if (!accessToken) {
    return <AuthCard />;
  }

  return (
    <AppShell>
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <aside className="space-y-6">
          <TaskForm
            error={
              createTaskMutation.isError
                ? getApiErrorMessage(createTaskMutation.error)
                : null
            }
            isPending={createTaskMutation.isPending}
            onCreate={(payload) => createTaskMutation.mutate(payload)}
          />
          <TaskStats stats={stats} />
        </aside>

        <section className="space-y-4">
          <TaskFilters filters={filters} onChange={setFilters} />
          <TaskList
            data={tasksQuery.data}
            error={
              tasksQuery.isError ? getApiErrorMessage(tasksQuery.error) : null
            }
            isDeleting={deleteTaskMutation.isPending}
            isLoading={tasksQuery.isLoading}
            isUpdating={updateTaskMutation.isPending}
            onDelete={(id) => deleteTaskMutation.mutate(id)}
            onPageChange={(page) =>
              setFilters((current) => ({ ...current, page }))
            }
            onStatusChange={(id, status) =>
              updateTaskMutation.mutate({ id, status })
            }
          />
        </section>
      </div>
    </AppShell>
  );
}
