"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";

export const EditTaskModal: React.FC = () => {
  const { editingTask, setEditingTask, editTask } = useApp();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "deep_work">("medium");
  const [sessionDuration, setSessionDuration] = useState<number>(25);
  const [customDuration, setCustomDuration] = useState<string>("");
  const [dueDate, setDueDate] = useState("");

  // Populate form when editingTask changes
  useEffect(() => {
    if (editingTask) {
      setName(editingTask.name);
      setDescription(editingTask.description || "");
      setPriority(editingTask.priority);
      
      const duration = editingTask.estimatedPomodoros || 25;
      setSessionDuration(duration);
      if ([15, 30, 45, 60].includes(duration)) {
        setCustomDuration("");
      } else {
        setCustomDuration(duration.toString());
      }

      if (editingTask.dueDate) {
        const date = new Date(editingTask.dueDate);
        const pad = (num: number) => num.toString().padStart(2, '0');
        const formatted = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
        setDueDate(formatted);
      } else {
        setDueDate("");
      }
    }
  }, [editingTask]);

  if (!editingTask) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    editTask(editingTask.id, {
      name: name.trim(),
      description: description.trim() || undefined,
      priority,
      estimatedPomodoros: sessionDuration, // Stored in estimated_pomodoros as minutes
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    });

    setEditingTask(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 font-sans">
      {/* Backdrop */}
      <div 
        onClick={() => setEditingTask(null)}
        className="absolute inset-0 bg-black/50 backdrop-blur-[35px] transition-all"
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-md bg-surface-glass backdrop-blur-2xl border border-border-glass rounded-xl shadow-2xl overflow-hidden z-10">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-secondary/10 rounded-full blur-[60px] pointer-events-none"></div>

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-border-glass flex justify-between items-center bg-surface-container/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-surface-glass border border-border-glass flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-[18px]">edit</span>
            </div>
            <h2 className="text-base font-bold text-on-surface tracking-tight">Modifier la Tâche</h2>
          </div>
          <button 
            onClick={() => setEditingTask(null)}
            className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-full hover:bg-surface-glass cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            {/* Name */}
            <div className="group">
              <label htmlFor="editTaskName" className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant block mb-2">
                Nom de la Tâche
              </label>
              <input
                id="editTaskName"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-glass border border-border-glass rounded-lg px-4 py-2 text-sm text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            {/* Session Duration Selection */}
            <div>
              <label className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant block mb-2">
                Durée de Session (minutes)
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {([15, 30, 45, 60] as const).map((mins) => {
                  const isSelected = sessionDuration === mins && !customDuration;
                  return (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        setSessionDuration(mins);
                        setCustomDuration("");
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary/50 bg-primary/10 text-primary"
                          : "border-border-glass bg-surface-glass text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {mins} min
                    </button>
                  );
                })}

                {/* Custom Duration Input */}
                <div className="flex items-center gap-1.5 ml-1">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase">Perso:</span>
                  <input
                    type="number"
                    min="15"
                    max="180"
                    value={customDuration}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomDuration(val);
                      if (val) {
                        const parsed = parseInt(val);
                        if (!isNaN(parsed)) {
                          setSessionDuration(Math.max(15, Math.min(180, parsed)));
                        }
                      } else {
                        setSessionDuration(25);
                      }
                    }}
                    placeholder="25"
                    className="w-16 bg-surface-glass border border-border-glass rounded-lg px-2 py-1 text-xs text-on-surface text-center focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <span className="text-xs text-on-surface-variant">min</span>
                </div>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant block mb-2">
                Priorité
              </label>
              <div className="flex flex-wrap gap-2">
                {(["low", "medium", "high", "deep_work"] as const).map((p) => {
                  const isSelected = priority === p;
                  const getLabel = () => {
                    if (p === "low") return "Faible";
                    if (p === "medium") return "Moyenne";
                    if (p === "high") return "Élevée";
                    return "Deep Work";
                  };
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary/50 bg-primary/10 text-primary"
                          : "border-border-glass bg-surface-glass text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>}
                      <span>{getLabel()}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reminder Date & Time */}
            <div className="group">
              <label htmlFor="editDueDate" className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant block mb-2">
                Planifier un Rappel de Démarrage (Optionnel)
              </label>
              <input
                id="editDueDate"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-surface-glass border border-border-glass rounded-lg px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
              />
            </div>

            {/* Description (Textarea, placed at the bottom) */}
            <div className="group">
              <label htmlFor="editTaskDesc" className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant block mb-2">
                Description
              </label>
              <textarea
                id="editTaskDesc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ajouter des notes ou consignes sur la tâche..."
                className="w-full bg-surface-glass border border-border-glass rounded-lg px-4 py-2.5 text-sm text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="p-5 pt-3.5 flex justify-end gap-3 border-t border-border-glass bg-surface-container/20">
            <button
              type="button"
              onClick={() => setEditingTask(null)}
              className="px-5 py-2.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-glass transition-all cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg text-xs font-bold bg-primary-container text-white shadow-glow-action-md hover:brightness-105 transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
            >
              <span>Enregistrer</span>
              <span className="material-symbols-outlined text-[16px]">check</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
