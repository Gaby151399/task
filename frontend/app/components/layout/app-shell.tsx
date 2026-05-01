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
    <div className="min-h-screen">
      <header className="fixed inset-x-0 top-0 z-50 glass-header">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-content grid h-8 w-8 place-items-center rounded-lg font-bold shadow-md">
              N
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Nest Tasks
              </p>
              <h1 className="text-lg font-bold leading-tight">Tableau de bord</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden flex-col items-end sm:flex">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-base-content/60">{user?.email}</p>
            </div>
            <button
              className="btn btn-outline btn-sm animate-fade-in hover:shadow-md hover:btn-error"
              disabled={logoutMutation.isPending}
              onClick={() => logoutMutation.mutate()}
              type="button"
            >
              {logoutMutation.isPending ? "Déconnexion..." : "Déconnexion"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 lg:px-8 animate-slide-up">
        {children}
      </main>
    </div>
  );
}
