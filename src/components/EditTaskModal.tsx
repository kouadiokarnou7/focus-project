"use client";

import React, { useState, useEffect } from "react";
import { useApp, Task } from "@/context/AppContext";

export const EditTaskModal: React.FC = () => {
  const { editingTask, setEditingTask, editTask } = useApp();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Task["category"]>("design");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [estPomodoros, setEstPomodoros] = useState(3);

  // Populate form when editingTask changes
  useEffect(() => {
    if (editingTask) {
      setName(editingTask.name);
      setDescription(editingTask.description || "");
      setCategory(editingTask.category);
      setPriority(editingTask.priority);
      setEstPomodoros(editingTask.estimatedPomodoros);
    }
  }, [editingTask]);

  if (!editingTask) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    editTask(editingTask.id, {
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      priority,
      estimatedPomodoros: estPomodoros,
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
      <div className="relative w-full max-w-lg bg-surface-glass backdrop-blur-2xl border border-border-glass rounded-xl shadow-2xl overflow-hidden z-10">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-secondary/10 rounded-full blur-[60px] pointer-events-none"></div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-border-glass flex justify-between items-center bg-surface-container/20">
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
          <div className="p-6 space-y-5">
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

            {/* Description */}
            <div className="group">
              <label htmlFor="editTaskDesc" className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant block mb-2">
                Description
              </label>
              <input
                id="editTaskDesc"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-surface-glass border border-border-glass rounded-lg px-4 py-2 text-sm text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            {/* Category */}
            <div className="group">
              <label htmlFor="editCategory" className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant block mb-2">
                Catégorie
              </label>
              <div className="relative">
                <select
                  id="editCategory"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Task["category"])}
                  className="glass-select w-full bg-surface-glass border border-border-glass rounded-lg px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="development">Développement</option>
                  <option value="design">Design</option>
                  <option value="research">Recherche</option>
                  <option value="admin">Administratif</option>
                  <option value="marketing">Marketing</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[20px]">expand_more</span>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant block mb-2">
                Priorité
              </label>
              <div className="flex flex-wrap gap-2">
                {(["low", "medium", "high", "deep_work"] as Task["priority"][]).map((p) => {
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

            {/* Pomodoro estimation */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container/20 border border-border-glass">
              <div>
                <label className="text-[10px] font-bold tracking-wider uppercase text-on-surface block mb-0.5">
                  Effort Estimé
                </label>
                <span className="text-[11px] text-on-surface-variant">Sessions de focus de 25min</span>
              </div>
              <div className="flex items-center gap-3 bg-surface-glass p-1 rounded-lg border border-border-glass">
                <button
                  type="button"
                  onClick={() => setEstPomodoros(Math.max(1, estPomodoros - 1))}
                  className="w-8 h-8 rounded-md flex items-center justify-center text-on-surface-variant hover:text-primary transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">remove</span>
                </button>
                <div className="w-8 text-center font-mono text-base font-bold text-primary">
                  {estPomodoros.toString().padStart(2, "0")}
                </div>
                <button
                  type="button"
                  onClick={() => setEstPomodoros(Math.min(10, estPomodoros + 1))}
                  className="w-8 h-8 rounded-md flex items-center justify-center text-on-surface-variant hover:text-primary transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 pt-4 flex justify-end gap-3 border-t border-border-glass bg-surface-container/20">
            <button
              type="button"
              onClick={() => setEditingTask(null)}
              className="px-5 py-2.5 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-glass transition-all cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg text-xs font-bold bg-primary-container text-white shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:brightness-105 transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
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
