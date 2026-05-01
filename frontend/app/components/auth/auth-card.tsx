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
    <main className="grid min-h-screen place-items-center px-4 py-10 animate-fade-in relative overflow-hidden">
      {/* Decorative background elements can go here if needed */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-primary/10 blur-[100px] rounded-full mix-blend-multiply pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-secondary/10 blur-[120px] rounded-full mix-blend-multiply pointer-events-none" />

      <section className="glass-card w-full max-w-md rounded-2xl p-8 relative z-10 animate-slide-up">
        <div className="mb-8 text-center">
          <div className="bg-primary text-primary-content mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl font-bold shadow-lg animate-float">
            N
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-base-content">
            {mode === "login" ? "Bon retour" : "Créer un compte"}
          </h1>
          <p className="mt-2 text-sm text-base-content/70">
            Connectez-vous pour accéder à votre tableau de bord Nest
          </p>
        </div>

        <div className="tabs tabs-boxed mb-8 bg-base-100/50 p-1 backdrop-blur-md border border-base-200 shadow-inner rounded-xl w-full grid grid-cols-2">
          <button
            className={`tab rounded-lg h-10 ${
              mode === "login"
                ? "bg-white text-primary font-semibold shadow-sm"
                : "text-base-content/60 hover:text-base-content"
            }`}
            onClick={() => setMode("login")}
            type="button"
          >
            Connexion
          </button>
          <button
            className={`tab rounded-lg h-10 ${
              mode === "register"
                ? "bg-white text-primary font-semibold shadow-sm"
                : "text-base-content/60 hover:text-base-content"
            }`}
            onClick={() => setMode("register")}
            type="button"
          >
            Inscription
          </button>
        </div>

        <form className="space-y-5" onSubmit={submitForm}>
          {mode === "register" && (
            <div className="form-control animate-fade-in">
              <label className="label">
                <span className="label-text font-medium">Nom complet</span>
              </label>
              <input
                className="input input-bordered w-full bg-white/60 focus:bg-white focus:ring-2 focus:ring-primary/30 transition-all border-base-200"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Jean Dupont"
                required
                type="text"
                value={form.name}
              />
            </div>
          )}

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Email</span>
            </label>
            <input
              className="input input-bordered w-full bg-white/60 focus:bg-white focus:ring-2 focus:ring-primary/30 transition-all border-base-200"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              placeholder="jean@exemple.fr"
              required
              type="email"
              value={form.email}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Mot de passe</span>
            </label>
            <input
              className="input input-bordered w-full bg-white/60 focus:bg-white focus:ring-2 focus:ring-primary/30 transition-all border-base-200"
              minLength={6}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              placeholder="••••••••"
              required
              type="password"
              value={form.password}
            />
          </div>

          {authMutation.isError && (
            <div className="alert alert-error text-sm rounded-xl py-2 animate-fade-in">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{getApiErrorMessage(authMutation.error)}</span>
            </div>
          )}

          <button
            className="btn btn-primary w-full h-12 rounded-xl mt-2 shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all text-base border-0"
            disabled={authMutation.isPending}
            type="submit"
          >
            {authMutation.isPending ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : mode === "login" ? (
              "Se connecter"
            ) : (
              "Créer le compte"
            )}
          </button>
        </form>
      </section>
    </main>
  );
}
