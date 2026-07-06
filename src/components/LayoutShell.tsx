"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/app/actions/auth";

interface LayoutShellProps {
  children: React.ReactNode;
}

export const LayoutShell: React.FC<LayoutShellProps> = ({ children }) => {
  const { toggleTimer, isRunning, mode, setIsAddTaskOpen } = useApp();
  const { user } = useAuth();
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navItems = [
    { id: "/", label: "Tableau de bord", icon: "dashboard" },
    { id: "/tasks", label: "Tâches", icon: "check_circle" },
    { id: "/stats", label: "Statistiques", icon: "insights" },
    { id: "/settings", label: "Paramètres", icon: "settings" },
  ];

  const getModeLabel = () => {
    if (mode === "focus") return "Focus en cours";
    if (mode === "short_break") return "Courte pause";
    return "Longue pause";
  };

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await logout();
  };

  return (
    <div className="flex flex-col h-screen w-full relative z-10 overflow-hidden font-sans">
      {/* Ambient background glow effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="ambient-orb w-[600px] h-[600px] bg-primary/10 -top-[200px] -right-[200px]"></div>
        <div className="ambient-orb w-[500px] h-[500px] bg-secondary/5 -bottom-[100px] -left-[100px]" style={{ animationDelay: "-4s" }}></div>
      </div>

      {/* ========== TOP HEADER BAR ========== */}
      <header className="sticky top-0 z-50 w-full h-14 bg-surface-glass backdrop-blur-xl border-b border-border-glass flex items-center justify-between px-4 md:px-6">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-container/20 border border-primary/30 flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.15)]">
            <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>adjust</span>
          </div>
          <h1 className="text-lg font-bold tracking-tighter text-primary hidden sm:block">FocusFlow</h1>
        </div>

        {/* Center: Current mode indicator (desktop) */}
        <div className="hidden md:flex items-center gap-2 text-xs">
          <span className={`w-2 h-2 rounded-full ${isRunning ? "bg-primary animate-pulse" : "bg-on-surface-variant/30"}`}></span>
          <span className="text-on-surface-variant font-semibold">{getModeLabel()}</span>
          <span className="text-on-surface-variant/40 font-mono">
            {isRunning ? "Session active" : "En attente"}
          </span>
        </div>

        {/* Right: Profile Dropdown or Auth Buttons */}
        <div className="relative">
          {user ? (
            <>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-surface-glass transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-primary-container/30 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary overflow-hidden">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    getUserInitials()
                  )}
                </div>
                <span className="hidden md:block text-xs text-on-surface font-medium truncate max-w-[150px]">
                  {user.user_metadata?.full_name || user.email}
                </span>
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                  {isProfileOpen ? "expand_less" : "expand_more"}
                </span>
              </button>

              {/* Dropdown */}
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                  <div className="absolute right-0 top-12 z-50 w-56 glass-panel rounded-xl shadow-xl border border-border-glass overflow-hidden">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-border-glass/40 bg-surface-container/20">
                      <p className="text-xs font-bold text-on-surface truncate">
                        {user.user_metadata?.full_name || "Utilisateur"}
                      </p>
                      <p className="text-[10px] text-on-surface-variant truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>
                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        href="/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-xs text-on-surface hover:bg-surface-glass transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">settings</span>
                        <span className="font-medium">Paramètres</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-error hover:bg-error/5 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">logout</span>
                        <span className="font-medium">Se déconnecter</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-xs text-on-surface-variant hover:text-on-surface font-semibold px-2 py-1.5 transition-all"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="text-xs bg-primary-container text-white py-1.5 px-3 rounded-lg font-bold shadow-sm hover:brightness-105 transition-all active:scale-95"
              >
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* ========== BODY: SIDEBAR + MAIN ========== */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation (Desktop) */}
        <aside className="hidden md:flex w-[220px] flex-col py-4 px-3 bg-surface-glass/50 backdrop-blur-xl border-r border-border-glass flex-shrink-0">
          {/* Navigation Tabs */}
          <nav className="flex-1 flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.id || (item.id !== "/" && pathname.startsWith(item.id));
              return (
                <Link
                  key={item.id}
                  href={item.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 active:scale-[0.98] text-left w-full ${
                    isActive
                      ? "text-primary font-bold bg-primary/8 border-l-2 border-primary"
                      : "text-on-surface-variant hover:bg-surface-glass hover:text-primary"
                  }`}
                >
                  <span 
                    className="material-symbols-outlined text-[20px]" 
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : undefined }}
                  >
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Timer Control at bottom */}
          <div className="mt-auto pt-4 border-t border-border-glass">
            <button
              onClick={toggleTimer}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-bold text-sm transition-all duration-300 active:scale-95 cursor-pointer ${
                isRunning 
                  ? "bg-surface-glass border border-border-glass text-primary hover:bg-primary/5" 
                  : "bg-primary-container text-white shadow-[0_0_12px_rgba(59,130,246,0.15)] hover:shadow-[0_0_18px_rgba(59,130,246,0.25)]"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isRunning ? "pause" : "play_arrow"}
              </span>
              <span>{isRunning ? "Pause" : "Démarrer"}</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 h-full overflow-y-auto w-full relative z-10">
          <div className="p-4 md:p-6 max-w-[1200px] mx-auto min-h-full pb-24 md:pb-6 flex flex-col">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Floating Bottom Navigation Dock */}
      <nav className="md:hidden fixed bottom-3 left-3 right-3 rounded-xl z-50 bg-surface-container/80 backdrop-blur-2xl border border-border-glass shadow-2xl flex justify-around items-center p-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.id || (item.id !== "/" && pathname.startsWith(item.id));
          return (
            <Link
              key={item.id}
              href={item.id}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-150 active:scale-90 w-16 ${
                isActive
                  ? "bg-primary-container text-white shadow-lg"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span 
                className="material-symbols-outlined text-[20px] mb-0.5" 
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : undefined }}
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-semibold tracking-tight leading-none">
                {item.id === "/" ? "Timer" : item.id === "/tasks" ? "Tâches" : item.id === "/stats" ? "Stats" : "Plus"}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
