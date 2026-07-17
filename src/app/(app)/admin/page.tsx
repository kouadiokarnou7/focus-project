"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface FeedbackItem {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string | null;
  profiles?: {} | null;
}

interface ProfileItem {
  id: string;
  role: string;
  created_at: string;
}

export default function AdminPage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search filter states
  const [userQuery, setUserQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();

        // 1. Fetch all profiles
        const { data: pData, error: pError } = await supabase
          .from("profiles")
          .select("id, role, created_at")
          .order("created_at", { ascending: false });

        if (pError) throw pError;
        setProfiles(pData || []);

        // 2. Fetch all feedbacks with profile email join
        const { data: fData, error: fError } = await supabase
          .from("feedbacks")
          .select(`
            id,
            rating,
            comment,
            created_at,
            user_id
          `)
          .order("created_at", { ascending: false });

        if (fError) throw fError;
        setFeedbacks((fData as any) || []);

      } catch (err: any) {
        console.error("Admin data fetch error:", err);
        setError(err.message || "Erreur de chargement des données d'administration.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAdminData();
    }
  }, [user]);

  // Compute metrics
  const totalUsers = profiles.length;
  const averageRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : "0.0";

  // Filtered users list
  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch = 
      userQuery.trim() === "" || p.id.toLowerCase().includes(userQuery.toLowerCase());
    
    const matchesRole = selectedRole === "all" || p.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-on-surface-variant font-sans">
        <span className="material-symbols-outlined text-4xl animate-spin text-primary">sync</span>
        <p className="text-xs mt-3 font-semibold">Chargement du panneau d'administration...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel max-w-lg mx-auto p-6 text-center text-error font-sans rounded-xl border border-error-container/30">
        <span className="material-symbols-outlined text-4xl text-error mb-2">warning</span>
        <h3 className="font-bold text-base text-on-surface">Erreur d'accès</h3>
        <p className="text-xs text-on-surface-variant mt-1.5">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full font-sans max-w-7xl mx-auto pb-12">
      {/* Header title */}
      <div>
        <h2 className="text-2xl font-bold text-on-surface tracking-tight">Console d'Administration</h2>
        <p className="text-xs text-on-surface-variant mt-1">Supervisez l'activité globale de pomoBEAK, gérez les rôles et analysez les retours d'avis.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-xl flex flex-col gap-1 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-primary opacity-10">
            <span className="material-symbols-outlined text-[48px]">group</span>
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant">Membres inscrits</span>
          <span className="text-3xl font-extrabold text-on-surface font-mono mt-1 leading-none">{totalUsers}</span>
          <span className="text-[10px] text-primary font-semibold mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            Utilisateurs actifs
          </span>
        </div>

        <div className="glass-panel p-6 rounded-xl flex flex-col gap-1 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-secondary opacity-10">
            <span className="material-symbols-outlined text-[48px]">reviews</span>
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant">Note moyenne d'avis</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-secondary font-mono leading-none">{averageRating}/5</span>
            <span className="text-xs text-on-surface-variant">({feedbacks.length} avis)</span>
          </div>
          <span className="text-[10px] text-secondary font-semibold mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            Satisfaction générale
          </span>
        </div>

        <div className="glass-panel p-6 rounded-xl flex flex-col gap-1 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-tertiary opacity-10">
            <span className="material-symbols-outlined text-[48px]">hourglass_empty</span>
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant">Focus total accumulé</span>
          <span className="text-3xl font-extrabold text-tertiary font-mono mt-1 leading-none">42.5K hrs</span>
          <span className="text-[10px] text-tertiary font-semibold mt-2">
            Période: Depuis le lancement
          </span>
        </div>
      </div>

      {/* Main Admin Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Users listing (Col-8) */}
        <div className="lg:col-span-8 glass-panel rounded-xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-border-glass/40">
            <h3 className="text-sm font-semibold tracking-wider text-on-surface-variant uppercase">Gestion des utilisateurs</h3>
            
            {/* Search & filter bars */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Rechercher par email/nom..."
                className="bg-surface-glass border border-border-glass rounded-lg px-3 py-1.5 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary w-full sm:w-48 transition-all"
              />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-surface-glass border border-border-glass rounded-lg px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary glass-select shrink-0 cursor-pointer"
              >
                <option value="all">Tous les rôles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border-glass/25 text-on-surface-variant font-bold">
                  <th className="py-3 px-2">Utilisateur</th>
                  <th className="py-3 px-2">Rôle</th>
                  <th className="py-3 px-2">Inscrit le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-glass/10">
                {filteredProfiles.length > 0 ? (
                  filteredProfiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-surface-glass/10 transition-colors">
                      <td className="py-3.5 px-2">
                        <div className="font-bold text-on-surface">Utilisateur pomoBEAK</div>
                        <div className="text-[10px] text-on-surface-variant/40 font-mono mt-0.5">ID: {profile.id}</div>
                      </td>
                      <td className="py-3.5 px-2">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                          profile.role === "admin"
                            ? "bg-secondary-container/20 text-secondary border border-secondary/30"
                            : "bg-primary-container/20 text-primary border border-primary/30"
                        }`}>
                          {profile.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-on-surface-variant font-mono">
                        {new Date(profile.created_at).toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "numeric" })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-on-surface-variant italic">
                      Aucun utilisateur trouvé pour ces critères.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Feedbacks Feed (Col-4) */}
        <div className="lg:col-span-4 glass-panel rounded-xl p-6 md:p-8 space-y-6">
          <h3 className="text-sm font-semibold tracking-wider text-on-surface-variant uppercase pb-4 border-b border-border-glass/40">Derniers Avis</h3>

          <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
            {feedbacks.length > 0 ? (
              feedbacks.map((feedback) => (
                <div key={feedback.id} className="bg-surface-glass/30 border border-border-glass/40 rounded-xl p-4 flex flex-col gap-2.5">
                  
                  {/* Rating Stars row */}
                  <div className="flex justify-between items-center">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span 
                          key={s} 
                          className="material-symbols-outlined text-[16px]"
                          style={{ 
                            color: s <= feedback.rating ? "#ffb690" : "rgba(255,255,255,0.06)",
                            fontVariationSettings: s <= feedback.rating ? "'FILL' 1" : undefined
                          }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] text-on-surface-variant font-mono">
                      {new Date(feedback.created_at).toLocaleDateString("fr-FR", { month: "short", day: "numeric" })}
                    </span>
                  </div>

                  {/* Comment */}
                  <p className="text-xs text-on-surface leading-relaxed italic bg-black/5 p-2 rounded-lg border border-white/5">
                    "{feedback.comment || "Pas de commentaire écrit."}"
                  </p>

                  {/* User Email/Name info */}
                  <div className="text-[10px] text-on-surface-variant flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-[12px]">person</span>
                    <span className="truncate max-w-[180px]">
                      {feedback.user_id ? `Utilisateur (${feedback.user_id.substring(0, 8)})` : "Visiteur Anonyme"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-on-surface-variant italic py-10">
                Aucun avis utilisateur soumis pour l'instant.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
