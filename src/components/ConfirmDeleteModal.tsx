"use client";

import React from "react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  taskName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  taskName,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 font-sans">
      {/* Backdrop */}
      <div
        onClick={onCancel}
        className="absolute inset-0 bg-black/50 backdrop-blur-[25px] transition-all"
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-surface-glass backdrop-blur-2xl border border-border-glass rounded-xl shadow-2xl overflow-hidden z-10">
        {/* Red ambient glow */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-error/15 rounded-full blur-[50px] pointer-events-none"></div>

        {/* Icon + Title */}
        <div className="px-6 pt-6 pb-4 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-error/10 border border-error/20 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-error text-[28px]">delete_forever</span>
          </div>
          <h2 className="text-base font-bold text-on-surface tracking-tight mb-1">
            Supprimer cette tâche ?
          </h2>
          <p className="text-xs text-on-surface-variant leading-relaxed max-w-[260px]">
            La tâche <span className="font-semibold text-on-surface">"{taskName}"</span> sera définitivement supprimée. Cette action est irréversible.
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-lg text-xs font-semibold text-on-surface-variant bg-surface-glass border border-border-glass hover:bg-surface-container transition-all cursor-pointer active:scale-95"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 rounded-lg text-xs font-bold text-white bg-error hover:bg-error/90 shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};
