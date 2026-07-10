"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { login, signInWithGoogle } from "@/app/actions/auth";
import Image from "next/image";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const res = await login(formData);
      if (res?.error) {
        setError(res.error);
      }
    });
  };

  const handleGoogleSignIn = () => {
    startTransition(async () => {
      const res = await signInWithGoogle();
      if (res?.error) {
        setError(res.error);
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
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl overflow-hidden border border-border-glass bg-white/5 shadow-glow-general-md mb-6">
            <Image src="/image1.png" alt="pomoBEAK Logo" className="w-full h-full object-cover" width={64} height={64} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-2">Bon retour !</h1>
          <p className="text-on-surface-variant text-sm">Reconnectez-vous à votre espace pomoBEAK</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-8">
          <button 
            onClick={handleGoogleSignIn}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-surface-glass border border-border-glass rounded-xl hover:bg-surface-glass/80 transition-all font-medium text-on-surface shadow-sm hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] cursor-pointer disabled:opacity-50"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Continuer avec Google
          </button>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-glass"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-surface-container-high px-3 text-on-surface-variant rounded-full">Ou avec votre email</span>
          </div>
        </div>

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
          
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide">Mot de passe</label>
              <Link href="/forget-password" className="text-xs text-primary hover:underline">Oublié ?</Link>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                required
                placeholder="••••••••"
                className="w-full bg-surface-glass border border-border-glass rounded-xl pl-4 pr-12 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface focus:outline-none cursor-pointer flex items-center justify-center"
                title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isPending}
            className="w-full bg-primary-container hover:bg-opacity-90 text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_0_20px_rgba(255,107,26,0.2)] transition-all active:scale-[0.98] mt-2 cursor-pointer disabled:opacity-50"
          >
            {isPending ? "Connexion..." : "Se Connecter"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-on-surface-variant">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
