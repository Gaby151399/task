"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "./types";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  setSession: (session: {
    accessToken: string;
    refreshToken: string;
    user: User;
  }) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setSession: (session) => set(session),
      clearSession: () =>
        set({ accessToken: null, refreshToken: null, user: null }),
    }),
    {
      name: "nest-task-auth",
    },
  ),
);
