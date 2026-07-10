"use client";

import React from "react";
import { useApp } from "@/context/AppContext";

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ isOpen, onClose }) => {
  const { tasks, setActiveTaskId } = useApp();

  if (!isOpen) return null;

  const notifications = tasks.filter(
    (t) => t.status !== "completed" && t.dueDate && new Date(t.dueDate) <= new Date()
  );

  return (
    <>
      {/* Click-away overlay */}
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      
      {/* Dropdown Card */}
      <div className="absolute right-0 top-10 z-50 w-72 md:w-80 glass-panel rounded-xl shadow-xl border border-border-glass overflow-hidden">
        <div className="px-4 py-3 border-b border-border-glass/40 bg-surface-container/20 flex justify-between items-center">
          <span className="text-xs font-bold text-on-surface">Rappels de Démarrage</span>
          {notifications.length > 0 && (
            <span className="bg-error/10 text-error px-2 py-0.5 rounded-full text-[10px] font-bold">
              {notifications.length}
            </span>
          )}
        </div>
        <div className="py-1 max-h-64 overflow-y-auto divide-y divide-border-glass/30">
          {notifications.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-on-surface-variant italic">
              Aucun rappel de démarrage en attente.
            </div>
          ) : (
            notifications.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => {
                  setActiveTaskId(task.id);
                  onClose();
                }}
                className="px-4 py-3 hover:bg-surface-glass transition-colors text-left cursor-pointer flex flex-col gap-1 w-full"
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-semibold text-on-surface line-clamp-1 flex-1">
                    {task.name}
                  </span>
                  <span className="text-[9px] font-bold text-error bg-error/10 px-1.5 py-0.5 rounded shrink-0">
                    DÉMARRER
                  </span>
                </div>
                <span className="text-[10px] text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">schedule</span>
                  <span>
                    {new Date(task.dueDate!).toLocaleDateString("fr-FR", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
};
