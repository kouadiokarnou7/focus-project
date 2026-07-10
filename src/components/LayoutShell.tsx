"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/app/actions/auth";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import Image from "next/image";
interface LayoutShellProps {
  children: React.ReactNode;
}

export const LayoutShell: React.FC<LayoutShellProps> = ({ children }) => {
  const { toggleTimer, isRunning, mode, tasks, setActiveTaskId } = useApp();
  const { user } = useAuth();
  const pathname = usePathname();
  
  // Profile and Notifications dropdown states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // Sidebar collapsed state (desktop/tablets)
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Collapse automatically on medium screens (tablets) on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    }
  }, []);

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
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-border-glass/40 flex items-center justify-center shadow-glow-general-sm bg-white/5">
            <Image src="/image1.png" alt="pomoBEAK Logo" className="w-full h-full object-cover rounded-lg" width={32} height={32} />
          </div>
          <h1 className="text-lg font-bold tracking-tighter text-primary">pomoBEAK</h1>
        </div>

        {/* Center: Current mode indicator (desktop) */}
        <div className="hidden md:flex items-center gap-2 text-xs">
          <span className={`w-2 h-2 rounded-full ${isRunning ? "bg-primary animate-pulse" : "bg-on-surface-variant/30"}`}></span>
          <span className="text-on-surface-variant font-semibold">{getModeLabel()}</span>
          <span className="text-on-surface-variant/40 font-mono">
            {isRunning ? "Session active" : "En attente"}
          </span>
        </div>

        {/* Right: Notifications bell & Profile dropdown (On ALL screens) */}
        <div className="flex items-center gap-3">
          {/* Notifications bell dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="w-9 h-9 rounded-lg bg-surface-glass border border-border-glass flex items-center justify-center text-on-surface-variant hover:text-primary transition-all cursor-pointer relative"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {tasks.some(t => t.status !== "completed" && t.dueDate && new Date(t.dueDate) <= new Date()) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error animate-pulse"></span>
              )}
            </button>

            <NotificationsDropdown 
              isOpen={isNotificationsOpen} 
              onClose={() => setIsNotificationsOpen(false)} 
            />
          </div>

          {/* Profile Dropdown Trigger */}
          <div className="relative">
            {user ? (
              <>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-8 h-8 rounded-full bg-primary-container/30 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary overflow-hidden cursor-pointer shrink-0"
                  title="Menu profil"
                >
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    getUserInitials()
                  )}
                </button>
                
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                    <div className="absolute right-0 top-10 z-50 w-48 glass-panel rounded-xl shadow-xl border border-border-glass overflow-hidden">
                      <div className="px-3 py-2 border-b border-border-glass/40 bg-surface-container/20">
                        <p className="text-xs font-bold text-on-surface truncate">{user.user_metadata?.full_name || "Utilisateur"}</p>
                      </div>
                      <div className="py-1">
                        <NextLink
                          href="/settings"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs text-on-surface hover:bg-surface-glass transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">settings</span>
                          <span className="font-medium">Paramètres</span>
                        </NextLink>
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
              <NextLink
                href="/login"
                className="text-xs bg-primary-container text-white py-1.5 px-3 rounded-lg font-bold shadow-sm"
              >
                Connexion
              </NextLink>
            )}
          </div>
        </div>
      </header>

      {/* ========== BODY: SIDEBAR + MAIN ========== */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation (Desktop, with collapsible transition) */}
        <aside className={`hidden md:flex flex-col py-4 px-3 bg-surface-glass/50 backdrop-blur-xl border-r border-border-glass flex-shrink-0 transition-all duration-300 ${isCollapsed ? "w-16" : "w-60"}`}>
          {/* Collapse/Expand Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="items-center justify-center w-8 h-8 rounded-full bg-surface-glass border border-border-glass hover:bg-primary/5 transition-all text-on-surface-variant hover:text-primary cursor-pointer self-center lg:self-end mb-4 flex"
            title={isCollapsed ? "Déplier la barre" : "Replier la barre"}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isCollapsed ? "chevron_right" : "chevron_left"}
            </span>
          </button>

          {/* Navigation Tabs */}
          <nav className="flex-1 flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.id || (item.id !== "/" && pathname.startsWith(item.id));
              return (
                <NextLink
                  key={item.id}
                  href={item.id}
                  className={`flex items-center rounded-lg transition-all duration-200 active:scale-[0.98] ${isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5 text-left w-full"} ${
                    isActive
                      ? "text-primary font-bold bg-primary/8 border-l-2 border-primary"
                      : "text-on-surface-variant hover:bg-surface-glass hover:text-primary"
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span 
                    className="material-symbols-outlined text-[20px]" 
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : undefined }}
                  >
                    {item.icon}
                  </span>
                  {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                </NextLink>
              );
            })}
          </nav>

          {/* User Profile & Timer Control at bottom of Sidebar */}
          <div className="mt-auto pt-4 border-t border-border-glass flex flex-col gap-3 relative">
            {/* Quick Timer Control */}
            <button
              onClick={toggleTimer}
              className={`flex items-center justify-center gap-2 rounded-lg font-bold text-sm transition-all duration-300 active:scale-95 cursor-pointer ${isCollapsed ? "p-2.5" : "py-2.5 px-3 w-full"} ${
                isRunning 
                  ? "bg-surface-glass border border-border-glass text-primary hover:bg-primary/5" 
                  : "bg-primary-container text-white shadow-glow-general-sm hover:shadow-glow-general-md"
              }`}
              title={isCollapsed ? (isRunning ? "Pause" : "Démarrer") : undefined}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isRunning ? "pause" : "play_arrow"}
              </span>
              {!isCollapsed && <span>{isRunning ? "Pause" : "Démarrer"}</span>}
            </button>

            {/* Profile Direct link to settings */}
            {user ? (
              <NextLink
                href="/settings"
                className={`flex items-center rounded-lg hover:bg-surface-glass transition-all cursor-pointer ${isCollapsed ? "justify-center p-2" : "gap-2.5 py-2 px-2 text-left w-full"}`}
                title={isCollapsed ? "Mon Profil" : undefined}
              >
                <div className="w-8 h-8 rounded-full bg-primary-container/30 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary overflow-hidden shrink-0">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    getUserInitials()
                  )}
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-on-surface truncate">
                      {user.user_metadata?.full_name || "Utilisateur"}
                    </p>
                    <p className="text-[10px] text-on-surface-variant truncate">
                      {user.email}
                    </p>
                  </div>
                )}
              </NextLink>
            ) : (
              <div className={`flex flex-col gap-2 ${isCollapsed ? "items-center" : "p-1"}`}>
                <NextLink
                  href="/login"
                  className={`text-xs text-center text-on-surface-variant hover:text-on-surface font-semibold py-2 rounded-lg border border-border-glass/40 hover:bg-surface-glass transition-all ${isCollapsed ? "w-8 h-8 flex items-center justify-center border-dashed" : "w-full"}`}
                  title={isCollapsed ? "Connexion" : undefined}
                >
                  {isCollapsed ? <span className="material-symbols-outlined text-[18px]">login</span> : "Connexion"}
                </NextLink>
              </div>
            )}
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
            <NextLink
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
            </NextLink>
          );
        })}
      </nav>
    </div>
  );
};
