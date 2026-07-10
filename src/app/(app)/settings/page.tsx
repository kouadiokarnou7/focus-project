"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function SettingsPage() {

  const { timerSettings, setTimerSettings, themeSettings, setThemeSettings } = useApp();

  const [focusMin, setFocusMin] = useState(timerSettings.focus / 60);
  const [shortMin, setShortMin] = useState(timerSettings.shortBreak / 60);
  const [longMin, setLongMin] = useState(timerSettings.longBreak / 60);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoStartBreaks, setAutoStartBreaks] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setTimerSettings(focusMin, shortMin, longMin);
    
    // Simulate config save notify
    alert("Paramètres mis à jour avec succès !");
  };

  const testChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      if (themeSettings.soundTrack === "zen_chime") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      } else if (themeSettings.soundTrack === "digital_beep") {
        osc.type = "square";
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.1);
      } else {
        // Soft Bell
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2); // A5
      }
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch (e) {
      console.error(e);
    }
  };

  const handleColorChange = (type: "general" | "action", color: string) => {
    if (type === "general") {
      setThemeSettings({ ...themeSettings, generalColor: color });
    } else {
      setThemeSettings({ ...themeSettings, actionColor: color });
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full font-sans">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-on-surface tracking-tight">Paramètres Globaux</h2>
        <p className="text-xs text-on-surface-variant mt-1">Personnalisez votre expérience pomoBEAK et ajustez vos temps de cycle.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Durations config form */}
        <form onSubmit={handleSave} className="lg:col-span-8 glass-panel rounded-xl p-6 md:p-8 space-y-6">
          <h3 className="text-sm font-semibold tracking-wider text-on-surface-variant uppercase pb-2 border-b border-border-glass/40">Durées (Minutes)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Focus time */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant">Durée Focus</label>
              <div className="flex items-center justify-between bg-surface-glass border border-border-glass rounded-lg p-1.5">
                <button
                  type="button"
                  onClick={() => setFocusMin(Math.max(5, focusMin - 5))}
                  className="w-8 h-8 rounded flex items-center justify-center hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">remove</span>
                </button>
                <span className="font-mono font-bold text-primary">{focusMin} min</span>
                <button
                  type="button"
                  onClick={() => setFocusMin(Math.min(90, focusMin + 5))}
                  className="w-8 h-8 rounded flex items-center justify-center hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
              </div>
            </div>

            {/* Short break */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant">Pause Courte</label>
              <div className="flex items-center justify-between bg-surface-glass border border-border-glass rounded-lg p-1.5">
                <button
                  type="button"
                  onClick={() => setShortMin(Math.max(1, shortMin - 1))}
                  className="w-8 h-8 rounded flex items-center justify-center hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">remove</span>
                </button>
                <span className="font-mono font-bold text-secondary">{shortMin} min</span>
                <button
                  type="button"
                  onClick={() => setShortMin(Math.min(20, shortMin + 1))}
                  className="w-8 h-8 rounded flex items-center justify-center hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
              </div>
            </div>

            {/* Long break */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant">Pause Longue</label>
              <div className="flex items-center justify-between bg-surface-glass border border-border-glass rounded-lg p-1.5">
                <button
                  type="button"
                  onClick={() => setLongMin(Math.max(5, longMin - 5))}
                  className="w-8 h-8 rounded flex items-center justify-center hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">remove</span>
                </button>
                <span className="font-mono font-bold text-tertiary">{longMin} min</span>
                <button
                  type="button"
                  onClick={() => setLongMin(Math.min(60, longMin + 5))}
                  className="w-8 h-8 rounded flex items-center justify-center hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
              </div>
            </div>
          </div>

          <h3 className="text-sm font-semibold tracking-wider text-on-surface-variant uppercase pt-6 pb-2 border-b border-border-glass/40">Notifications & Auto-play</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-on-surface">Sonnerie à la fin des sessions</h4>
                <p className="text-[11px] text-on-surface-variant mt-0.5">Activer ou désactiver les alertes sonores.</p>
              </div>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-10 h-6 rounded-full transition-all relative ${soundEnabled ? "bg-primary" : "bg-surface-container"}`}
              >
                <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${soundEnabled ? "right-1" : "left-1"}`}></span>
              </button>
            </div>

            {soundEnabled && (
              <div className="flex items-center justify-between pt-2 border-t border-border-glass/20">
                <div>
                  <h4 className="text-xs font-bold text-on-surface">Choix de la sonnerie</h4>
                </div>
                <select 
                  value={themeSettings.soundTrack}
                  onChange={(e) => setThemeSettings({ ...themeSettings, soundTrack: e.target.value })}
                  className="bg-surface-glass border border-border-glass rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary glass-select"
                >
                  <option value="zen_chime">Zen Chime</option>
                  <option value="digital_beep">Digital Beep</option>
                  <option value="soft_bell">Soft Bell</option>
                </select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-on-surface">Démarrage automatique des pauses</h4>
                <p className="text-[11px] text-on-surface-variant mt-0.5">Lancer la pause immédiatement après la session sans confirmation.</p>
              </div>
              <button
                type="button"
                onClick={() => setAutoStartBreaks(!autoStartBreaks)}
                className={`w-10 h-6 rounded-full transition-all relative ${autoStartBreaks ? "bg-primary" : "bg-surface-container"}`}
              >
                <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${autoStartBreaks ? "right-1" : "left-1"}`}></span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold text-on-surface-variant">Tester le signal sonore</span>
              <button
                type="button"
                onClick={testChime}
                className="px-4 py-1.5 rounded bg-surface-container hover:bg-surface-glass border border-border-glass/40 text-xs font-bold transition-all"
              >
                Écouter l'aperçu
              </button>
            </div>
          </div>

          <h3 className="text-sm font-semibold tracking-wider text-on-surface-variant uppercase pt-6 pb-2 border-b border-border-glass/40">Apparence & Thèmes</h3>
          
          <div className="flex items-center justify-between py-4 border-b border-border-glass/20">
            <div>
              <h4 className="text-xs font-bold text-on-surface">Mode Sombre</h4>
              <p className="text-[11px] text-on-surface-variant mt-0.5">Basculer entre le thème clair et sombre.</p>
            </div>
            <button
              type="button"
              onClick={() => setThemeSettings({ ...themeSettings, colorMode: themeSettings.colorMode === "dark" ? "light" : "dark" })}
              className={`w-10 h-6 rounded-full transition-all relative ${themeSettings.colorMode === "dark" ? "bg-primary" : "bg-surface-container"}`}
            >
              <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${themeSettings.colorMode === "dark" ? "right-1" : "left-1"}`}></span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* General Color */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant">Couleur Générale (Thème)</label>
              <div className="flex items-center gap-4 bg-surface-glass border border-border-glass rounded-xl p-3">
                <input 
                  type="color" 
                  value={themeSettings.generalColor}
                  onChange={(e) => handleColorChange("general", e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-none p-0 bg-transparent"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-on-surface">Dominante</p>
                  <p className="text-xs text-on-surface-variant font-mono">{themeSettings.generalColor}</p>
                </div>
              </div>
            </div>

            {/* Action Color */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant">Couleur des Boutons d'Action</label>
              <div className="flex items-center gap-4 bg-surface-glass border border-border-glass rounded-xl p-3">
                <input 
                  type="color" 
                  value={themeSettings.actionColor}
                  onChange={(e) => handleColorChange("action", e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-none p-0 bg-transparent"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-on-surface">Boutons & Accents</p>
                  <p className="text-xs text-on-surface-variant font-mono">{themeSettings.actionColor}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              className="bg-primary-container text-white py-2.5 px-6 rounded-lg shadow-glow-action-md hover:brightness-105 transition-all text-xs font-bold active:scale-95"
            >
              Enregistrer les modifications
            </button>
          </div>
        </form>

        {/* Profile info sidebar card */}
        <div className="lg:col-span-4 glass-panel rounded-xl p-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full border border-border-glass overflow-hidden bg-surface-container mb-4">
            <img 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvdhUUJF2zY2KLlHY15CjB2yrdhT_oO0EI1Cc9ldt-OK4bqJWg5XAd3tPc4srHe_AiEjzr5hOiK5nBFVQFDy5Cb92CzLMWzHTpz51JDRPCzLTs3_2TV0T6Nq6nueLXnhoPsxKUNo5igHnoBFGM3J7tKy73J2diPeiJ0uBANklBZoH8V1nrfXZIkB6nkoqA3D6nAxJXghlp4DRnNRLiZOq1d0np8yjdVvG2RaJLaz3z0H2JXFg5r7OA3mcQaZxP6cfkPqKC3miJFdo" 
              alt="Avatar" 
            />
          </div>
          <h3 className="font-bold text-sm text-on-surface">Utilisateur Focus</h3>
          <p className="text-[10px] text-primary uppercase font-bold tracking-widest mt-1">Niveau 3 • Concentré</p>
          <div className="w-full mt-6 bg-surface-container p-3 rounded-lg border border-border-glass/40 flex justify-between text-left text-xs">
            <span className="text-on-surface-variant font-medium">Membre depuis</span>
            <span className="font-semibold text-on-surface">Juin 2026</span>
          </div>
          <button
            type="button"
            className="w-full mt-6 py-2 border border-dashed border-error/30 hover:border-error text-error hover:bg-error-container/10 transition-all rounded-lg text-xs font-semibold"
          >
            Réinitialiser les données locales
          </button>
        </div>
      </div>
    </div>
  );
}
