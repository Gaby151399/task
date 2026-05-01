"use client";

import { FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi, getApiErrorMessage } from "../../lib/api";
import { useAuthStore } from "../../lib/auth-store";

type AuthMode = "login" | "register";

export function AuthCard() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const setSession = useAuthStore((state) => state.setSession);

  const authMutation = useMutation({
    mutationFn: () =>
      mode === "login"
        ? authApi.login({ email: form.email, password: form.password })
        : authApi.register(form),
    onSuccess: setSession,
  });

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    authMutation.mutate();
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Nest Tasks
          </p>
          <h1 className="mt-2 text-3xl font-bold text-base-content">
            {mode === "login" ? "Connexion" : "Creer un compte"}
          </h1>
          <p className="mt-2 text-sm text-base-content/65">
            Connecte le frontend Next a ton API Nest avec une session JWT.
          </p>
        </div>

        <div className="tabs tabs-box mb-6">
          <button
            className={`tab flex-1 ${mode === "login" ? "tab-active" : ""}`}
            onClick={() => setMode("login")}
            type="button"
          >
            Login
          </button>
          <button
            className={`tab flex-1 ${mode === "register" ? "tab-active" : ""}`}
            onClick={() => setMode("register")}
            type="button"
          >
            Register
          </button>
        </div>

        <form className="space-y-4" onSubmit={submitForm}>
          {mode === "register" ? (
            <label className="form-control">
              <span className="label-text mb-2">Nom</span>
              <input
                className="input input-bordered"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                required
                type="text"
                value={form.name}
              />
            </label>
          ) : null}

          <label className="form-control">
            <span className="label-text mb-2">Email</span>
            <input
              className="input input-bordered"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              required
              type="email"
              value={form.email}
            />
          </label>

          <label className="form-control">
            <span className="label-text mb-2">Mot de passe</span>
            <input
              className="input input-bordered"
              minLength={6}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              required
              type="password"
              value={form.password}
            />
          </label>

          {authMutation.isError ? (
            <div className="alert alert-error text-sm">
              {getApiErrorMessage(authMutation.error)}
            </div>
          ) : null}

          <button
            className="btn btn-primary w-full"
            disabled={authMutation.isPending}
            type="submit"
          >
            {authMutation.isPending
              ? "Traitement..."
              : mode === "login"
                ? "Se connecter"
                : "Creer le compte"}
          </button>
        </form>
      </section>
    </main>
  );
}
