"use client";

import React from "react";
import { useApp } from "@/context/AppContext";

export const StatsView: React.FC = () => {
  const { totalFocusTimeToday, completedSessionsToday, tasks, streak } = useApp();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Format total focus time
  const formatFocusTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  // Calculate real category distribution from actual tasks
  const categoryMap: Record<string, { name: string; count: number; color: string }> = {};
  tasks.forEach((t) => {
    if (!categoryMap[t.category]) {
      const colorMap: Record<string, string> = {
        design: "bg-secondary",
        development: "bg-tertiary",
        research: "bg-primary",
        admin: "bg-on-surface-variant/40",
        marketing: "bg-primary/60",
      };
      const labelMap: Record<string, string> = {
        design: "Design",
        development: "Développement",
        research: "Recherche",
        admin: "Administratif",
        marketing: "Marketing",
      };
      categoryMap[t.category] = {
        name: labelMap[t.category] || t.category,
        count: 0,
        color: colorMap[t.category] || "bg-on-surface-variant/40",
      };
    }
    categoryMap[t.category].count++;
  });

  const categories = Object.values(categoryMap)
    .sort((a, b) => b.count - a.count)
    .map((cat) => ({
      ...cat,
      percentage: totalTasks > 0 ? Math.round((cat.count / totalTasks) * 100) : 0,
    }));

  return (
    <div className="flex flex-col gap-6 w-full font-sans">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-on-surface tracking-tight">Analyses de Performance</h2>
        <p className="text-xs text-on-surface-variant mt-1">Suivez votre progression et analysez vos habitudes de concentration.</p>
      </div>

      {/* Grid: 3 Quick Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-xl flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant">Focus Cumulé</span>
            <span className="material-symbols-outlined text-primary text-xl">schedule</span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-primary font-mono">{formatFocusTime(totalFocusTimeToday)}</span>
            <span className="text-xs text-on-surface-variant block mt-1">{completedSessionsToday} sessions aujourd'hui</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant">Sessions Complétées</span>
            <span className="material-symbols-outlined text-secondary text-xl">check_box</span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-secondary font-mono">{completedSessionsToday}</span>
            <span className="text-xs text-on-surface-variant block mt-1">{streak} jours consécutifs 🔥</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant">Taux de Complétion</span>
            <span className="material-symbols-outlined text-tertiary text-xl">leaderboard</span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-tertiary font-mono">{completionRate}%</span>
            <span className="text-xs text-on-surface-variant block mt-1">{completedTasks} sur {totalTasks} tâches faites</span>
          </div>
        </div>
      </div>

      {/* Main Stats body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Category distribution */}
        <div className="lg:col-span-6 glass-panel rounded-xl p-6 flex flex-col">
          <h3 className="text-sm font-semibold tracking-wider text-on-surface-variant uppercase mb-6">Répartition par Catégorie</h3>
          <div className="space-y-5 flex-1 flex flex-col justify-center">
            {categories.length > 0 ? (
              categories.map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-on-surface">{cat.name}</span>
                    <span className="text-on-surface-variant font-mono">{cat.count} tâches ({cat.percentage}%)</span>
                  </div>
                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${cat.percentage}%` }}></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-on-surface-variant text-sm py-8">
                Créez des tâches pour voir la répartition par catégorie.
              </div>
            )}
          </div>
        </div>

        {/* Insights card */}
        <div className="lg:col-span-6 glass-panel rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-on-surface-variant uppercase mb-4">Analyses & Conseils</h3>
            <div className="space-y-4">
              <div className="flex gap-3 items-start p-3 bg-surface-container/20 rounded-lg border border-border-glass/40">
                <span className="material-symbols-outlined text-primary text-xl">bolt</span>
                <div>
                  <h4 className="text-xs font-bold text-on-surface">Créneau de productivité maximale</h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">Vos sessions de concentration les plus longues et efficaces se situent entre 09:00 et 11:30.</p>
                </div>
              </div>
              
              <div className="flex gap-3 items-start p-3 bg-surface-container/20 rounded-lg border border-border-glass/40">
                <span className="material-symbols-outlined text-secondary text-xl">spa</span>
                <div>
                  <h4 className="text-xs font-bold text-on-surface">Qualité des temps de repos</h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">Prendre de vraies courtes pauses actives (s'étirer, boire de l'eau) améliore votre focus de 15% le bloc suivant.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border-glass/60 text-center">
            <p className="text-xs italic text-on-surface-variant">"La concentration est le secret de la force." - Emerson</p>
          </div>
        </div>
      </div>
    </div>
  );
};
