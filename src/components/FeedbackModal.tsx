"use client";

import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setSubmitError("Veuillez sélectionner une note entre 1 et 5 étoiles.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.from("feedbacks").insert({
        user_id: user?.id || null,
        rating,
        comment: comment.trim() || null,
      });

      if (error) {
        throw new Error(error.message);
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        // Reset states and close
        setRating(0);
        setComment("");
        setSubmitSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error("Error submitting feedback:", err);
      setSubmitError("Une erreur est survenue lors de l'envoi de votre avis. Réessayez.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop blur overlay */}
      <div 
        className="absolute inset-0 bg-[#0A0A0F]/70 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 md:p-8 flex flex-col relative z-10 overflow-hidden shadow-glow-action-lg animate-scale-up">
        {/* Glow orb */}
        <div className="absolute -top-[50px] -right-[50px] w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none"></div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {submitSuccess ? (
          <div className="flex flex-col items-center justify-center text-center py-8 space-y-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-glow-general-sm animate-bounce">
              <span className="material-symbols-outlined text-[32px]">thumb_up</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface">Merci pour votre avis !</h3>
            <p className="text-xs text-on-surface-variant max-w-[280px]">Votre retour nous aide à perfectionner pomoBEAK pour tout le monde.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-bold text-on-surface tracking-tight">Votre avis compte</h3>
              <p className="text-xs text-on-surface-variant mt-1">Aidez-nous à faire de pomoBEAK le meilleur compagnon de productivité.</p>
            </div>

            {/* Stars Selector */}
            <div className="flex flex-col items-center gap-2 py-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Note d'Évaluation</span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                  >
                    <span 
                      className="material-symbols-outlined text-[32px] transition-colors duration-150"
                      style={{ 
                        color: (hoveredRating || rating) >= star ? "#ffb690" : "rgba(255,255,255,0.08)",
                        fontVariationSettings: (hoveredRating || rating) >= star ? "'FILL' 1" : undefined
                      }}
                    >
                      star
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Area */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">Votre commentaire (optionnel)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Dites-nous ce que vous appréciez ou ce que nous pourrions améliorer..."
                rows={4}
                className="w-full bg-surface-glass border border-border-glass rounded-xl p-3 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-all resize-none"
              />
            </div>

            {submitError && (
              <p className="text-xs text-error font-medium text-center bg-error-container/10 border border-error-container/20 py-2 px-3 rounded-lg">
                {submitError}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-surface-glass hover:bg-surface-container border border-border-glass text-xs font-bold text-on-surface rounded-lg transition-all cursor-pointer active:scale-95"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-primary-container text-white text-xs font-bold rounded-lg shadow-glow-action-sm hover:brightness-105 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting ? "Envoi..." : "Envoyer mon avis"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
