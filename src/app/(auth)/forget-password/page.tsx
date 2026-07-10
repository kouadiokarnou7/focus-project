"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { resetPassword } from "@/app/actions/auth";

export default function ForgetPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const res = await resetPassword(formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setSuccess(res.success);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-obsidian p-4 relative overflow-hidden">
      {/* Ambient background glow effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="ambient-orb w-[600px] h-[600px] bg-primary/20 -top-[200px] -right-[200px]"></div>
        <div className="ambient-orb w-[500px] h-[500px] bg-secondary/10 -bottom-[100px] -left-[100px]" style={{ animationDelay: "-4s" }}></div>
      </div>

      <div className="w-full max-w-md relative z-10 glass-panel p-8 sm:p-10 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-container/20 border border-primary/30 shadow-[0_0_20px_rgba(255,107,26,0.3)] mb-6">
            <span className="material-symbols-outlined text-primary text-[32px]">lock_reset</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2">Mot de passe oublié ?</h1>
          <p className="text-on-surface-variant text-sm">Saisissez votre email pour recevoir un lien de réinitialisation</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-xs font-semibold">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl text-primary text-xs font-semibold">
            {success}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">Adresse Email</label>
            <input 
              type="email" 
              name="email"
              required
              placeholder="vous@exemple.com"
              className="w-full bg-surface-glass border border-border-glass rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <button 
            type="submit"
            disabled={isPending}
            className="w-full bg-primary-container hover:bg-opacity-90 text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_0_20px_rgba(255,107,26,0.2)] transition-all active:scale-[0.98] mt-2 cursor-pointer disabled:opacity-50"
          >
            {isPending ? "Envoi..." : "Envoyer le lien"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-on-surface-variant">
          Retourner à la{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            page de connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
