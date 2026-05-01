"use client";

import { ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../../lib/api";
import { useAuthStore } from "../../lib/auth-store";

export function AppShell({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearSession();
      queryClient.clear();
    },
  });

  return (
    <div className="min-h-screen bg-base-200">
      <header className="border-b border-base-300 bg-base-100">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Nest Tasks
            </p>
            <h1 className="text-2xl font-bold">Tableau de bord</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right text-sm">
              <p className="font-semibold">{user?.name}</p>
              <p className="text-base-content/60">{user?.email}</p>
            </div>
            <button
              className="btn btn-outline btn-sm"
              disabled={logoutMutation.isPending}
              onClick={() => logoutMutation.mutate()}
              type="button"
            >
              Deconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">{children}</div>
    </div>
  );
}
