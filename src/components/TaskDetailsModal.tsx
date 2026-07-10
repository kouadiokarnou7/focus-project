"use client";

import React from "react";
import { useApp } from "@/context/AppContext";

export const TaskDetailsModal: React.FC = () => {
  const { viewingTask, setViewingTask } = useApp();

  if (!viewingTask) return null;

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "low": return "Faible";
      case "medium": return "Moyenne";
      case "high": return "Élevée";
      case "deep_work": return "Deep Work";
      default: return priority;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-error-container/20 text-error border-error/20";
      case "deep_work":
        return "bg-primary/10 text-primary border-primary/20";
      case "medium":
        return "bg-surface-container-highest text-on-surface-variant";
      default:
        return "bg-surface-glass text-on-surface-variant/70 border-border-glass";
    }
  };

  const formatReminder = (dateStr?: string) => {
    if (!dateStr) return "Aucun rappel configuré";
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 font-sans">
      {/* Backdrop */}
      <div 
        onClick={() => setViewingTask(null)}
        className="absolute inset-0 bg-black/60 backdrop-blur-[30px] transition-all"
      ></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-surface-glass backdrop-blur-2xl border border-border-glass rounded-xl shadow-2xl overflow-hidden z-10 p-6 flex flex-col gap-5">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-[60px] pointer-events-none"></div>

        {/* Header */}
        <div className="flex justify-between items-start border-b border-border-glass/40 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">info</span>
            <h2 className="text-base font-bold text-on-surface">Détails de la Tâche</h2>
          </div>
          <button 
            onClick={() => setViewingTask(null)}
            className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-full hover:bg-surface-glass cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="space-y-4 text-sm text-on-surface overflow-y-auto max-h-[60vh] pr-1">
          {/* Task Name */}
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant block mb-1">Nom de la tâche</span>
            <h3 className="text-base font-bold text-on-surface">{viewingTask.name}</h3>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-4 bg-surface-container/20 border border-border-glass/40 rounded-xl p-3">
            <div>
              <span className="text-[9px] font-bold tracking-wider uppercase text-on-surface-variant block mb-1">Priorité</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getPriorityBadge(viewingTask.priority)}`}>
                {getPriorityLabel(viewingTask.priority)}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-bold tracking-wider uppercase text-on-surface-variant block mb-1">Concentration</span>
              <div className="flex items-center gap-1 text-xs font-bold text-primary">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                <span>{viewingTask.completedPomodoros} / {viewingTask.estimatedPomodoros} min</span>
              </div>
            </div>
          </div>

          {/* Start Reminder Schedule */}
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant block mb-1">Rappel de démarrage planifié</span>
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
              <span className="material-symbols-outlined text-[16px] text-primary">notifications</span>
              <span>{formatReminder(viewingTask.dueDate)}</span>
            </div>
          </div>

          {/* Description Block */}
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant block mb-1">Description / Notes</span>
            {viewingTask.description ? (
              <div className="bg-surface-glass border border-border-glass rounded-lg p-3 text-xs text-on-surface-variant leading-relaxed max-h-[150px] overflow-y-auto whitespace-pre-wrap">
                {viewingTask.description}
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant italic">Aucune description fournie.</p>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-border-glass/40 pt-3 flex justify-end">
          <button
            onClick={() => setViewingTask(null)}
            className="px-5 py-2 rounded-lg text-xs font-bold bg-primary-container text-white shadow-glow-action-md hover:brightness-105 transition-all cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
