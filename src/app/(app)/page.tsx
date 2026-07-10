"use client";

import React from "react";
import { useApp, Task } from "@/context/AppContext";
import { TaskDetailsModal } from "@/components/TaskDetailsModal";

export default function DashboardPage() {
  const {
    timeLeft,
    isRunning,
    mode,
    totalDuration,
    toggleTimer,
    resetTimer,
    skipTimer,
    tasks,
    activeTaskId,
    setActiveTaskId,
    streak,
    completedSessionsToday,
    totalFocusTimeToday,
    toggleTaskCompleted,
    setIsAddTaskOpen,
    setViewingTask,
  } = useApp();

  // Format timeLeft to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Format total focus time
  const formatFocusTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Find active task name
  const activeTask = tasks.find((t) => t.id === activeTaskId);

  // SVG Progress Ring calculations
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = timeLeft / totalDuration;
  const strokeDashoffset = circumference * (1 - progressRatio);

  // Upcoming non-completed tasks (exclude completed and limit to 3)
  const upcomingTasks = tasks
    .filter((t) => t.status !== "completed")
    .slice(0, 3);

  // Determine timer ring stroke color
  const getRingColor = () => {
    if (mode === "focus") return "#ffb596";
    if (mode === "short_break") return "#c0c1ff";
    return "#8dcdff";
  };

  // Active status color
  const getModeTitle = () => {
    if (mode === "focus") return "Session Concentrée";
    if (mode === "short_break") return "Courte Pause";
    return "Longue Pause";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
      {/* Left Column (Timer and tasks summary) */}
      <div className="lg:col-span-8 flex flex-col gap-6 w-full">
        {/* Timer Card */}
        <div className="glass-panel-active rounded-xl p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[400px]">
          {/* Ambient overlay glow behind active timer */}
          <div className="absolute inset-0 bg-primary opacity-5 mix-blend-screen blur-3xl pointer-events-none"></div>

          <h2 className="text-sm font-semibold tracking-wider text-on-surface-variant mb-6 z-10 uppercase">
            {getModeTitle()}
          </h2>

          {/* Circular Countdown Progress Ring */}
          <div className="relative w-60 h-60 md:w-64 md:h-64 flex items-center justify-center z-10 mb-8 select-none">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Track Circle */}
              <circle
                cx="50"
                cy="50"
                fill="transparent"
                r={radius}
                stroke="rgba(255, 255, 255, 0.03)"
                strokeWidth="5.5"
              />
              {/* Progress Count ring */}
              <circle
                className="timer-circle"
                cx="50"
                cy="50"
                fill="transparent"
                r={radius}
                stroke={getRingColor()}
                strokeWidth="5.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  filter: `drop-shadow(0 0 8px ${getRingColor()})`
                }}
              />
            </svg>
            {/* Numeric display in mono-font */}
            <div className="font-mono text-5xl md:text-6xl font-semibold text-on-background drop-shadow-[0_0_12px_rgba(255,255,255,0.15)]">
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center gap-6 z-10">
            {/* Reset */}
            <button
              onClick={resetTimer}
              className="w-11 h-11 rounded-full glass-panel flex items-center justify-center text-on-surface-variant hover:text-primary transition-all duration-200 active:scale-90"
              title="Réinitialiser"
            >
              <span className="material-symbols-outlined text-[20px]">restart_alt</span>
            </button>
            {/* Play/Pause */}
            <button
              onClick={toggleTimer}
              className="w-16 h-16 rounded-full bg-primary-container text-white flex items-center justify-center shadow-glow-action-lg hover:shadow-glow-action-xl transition-all duration-300 active:scale-95 hover:scale-105"
            >
              <span className="material-symbols-outlined text-[30px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isRunning ? "pause" : "play_arrow"}
              </span>
            </button>
            {/* Skip */}
            <button
              onClick={skipTimer}
              className="w-11 h-11 rounded-full glass-panel flex items-center justify-center text-on-surface-variant hover:text-primary transition-all duration-200 active:scale-90"
              title="Passer à l'étape suivante"
            >
              <span className="material-symbols-outlined text-[20px]">skip_next</span>
            </button>
          </div>

          {/* Active Task Chip */}
          <div className="mt-8 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2 z-10 max-w-full">
            <span className={`w-2 h-2 rounded-full bg-primary ${isRunning ? "animate-pulse" : ""}`}></span>
            <span className="text-[11px] font-bold tracking-wider uppercase text-primary truncate max-w-[250px]">
              {activeTask ? `Actif: ${activeTask.name} (${activeTask.estimatedPomodoros} min)` : "Aucune tâche sélectionnée"}
            </span>
          </div>
        </div>

        {/* Upcoming Tasks Section */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-lg font-semibold text-on-background">
              Prochaines priorités
            </h3>
            <button
              onClick={() => setIsAddTaskOpen(true)}
              className="bg-primary-container text-white py-1.5 px-3 rounded-lg shadow-sm hover:brightness-105 transition-all text-xs font-bold flex items-center gap-1 active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              <span>Créer Tâche</span>
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setActiveTaskId(task.id)}
                  className={`glass-panel p-4 rounded-xl flex items-center gap-4 group transition-all duration-200 cursor-pointer ${
                    activeTaskId === task.id ? "border-primary/45 bg-surface-glass" : ""
                  }`}
                >
                  {/* Custom check marker click trigger */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskCompleted(task.id);
                    }}
                    className="w-6 h-6 rounded-full border border-on-surface-variant/40 group-hover:border-primary flex items-center justify-center transition-all animate-none shrink-0"
                  >
                    <span className="material-symbols-outlined text-[15px] text-transparent group-hover:text-primary/50">
                      check
                    </span>
                  </button>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-semibold truncate ${
                      activeTaskId === task.id ? "text-primary" : "text-on-background"
                    }`}>
                      {task.name}
                    </h4>
                    <p className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant opacity-75 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span>Priorité : {task.priority === "low" ? "Faible" : task.priority === "medium" ? "Moyenne" : task.priority === "high" ? "Élevée" : "Deep Work"}</span>
                      {task.dueDate && (
                        <>
                          <span>•</span>
                          <span className={`flex items-center gap-0.5 ${new Date(task.dueDate) < new Date() ? 'text-error font-bold' : ''}`}>
                            <span className="material-symbols-outlined text-[11px]">{new Date(task.dueDate) < new Date() ? 'warning' : 'calendar_today'}</span>
                            <span>{new Date(task.dueDate).toLocaleDateString("fr-FR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium bg-surface-container px-2.5 py-1 rounded-md border border-border-glass/40 shrink-0">
                    <span className="material-symbols-outlined text-[14px] text-primary">schedule</span>
                    <span className="font-mono">{task.completedPomodoros}/{task.estimatedPomodoros} min</span>
                  </div>

                  {/* View Details Eye Icon Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewingTask(task);
                    }}
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-md flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-glass transition-all cursor-pointer shrink-0"
                    title="Voir les détails"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                  </button>
                </div>
              ))
            ) : (
              <div className="glass-panel p-6 rounded-xl text-center text-on-surface-variant">
                Toutes les tâches sont terminées !
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column (Metrics and Daily stats graph) */}
      <div className="lg:col-span-4 flex flex-col gap-6 w-full">
        {/* Performance Metrics Panel */}
        <div className="glass-panel rounded-xl p-6 flex flex-col h-full min-h-[460px]">
          <h3 className="text-lg font-semibold text-on-background mb-6">Progrès Quotidien</h3>

          {/* Quick Metrics grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="glass-panel p-4 rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant">
                Temps de focus
              </span>
              <span className="text-2xl font-bold text-primary font-mono leading-none mt-1">
                {formatFocusTime(totalFocusTimeToday)}
              </span>
            </div>
            <div className="glass-panel p-4 rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant">
                Tâches faites
              </span>
              <span className="text-2xl font-bold text-on-background font-mono leading-none mt-1">
                {tasks.filter((t) => t.status === "completed").length}
              </span>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex-1 flex flex-col justify-end gap-3 relative pb-4 min-h-[160px]">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none rounded-lg"></div>
            <div className="flex items-end justify-between h-36 px-2 z-10">
              <div className="flex flex-col items-center gap-2 w-full">
                <div className="w-full max-w-[20px] bg-primary/25 rounded-t-sm h-[40%]"></div>
                <span className="text-[10px] font-bold text-on-surface-variant/50">L</span>
              </div>
              <div className="flex flex-col items-center gap-2 w-full">
                <div className="w-full max-w-[20px] bg-primary/45 rounded-t-sm h-[70%]"></div>
                <span className="text-[10px] font-bold text-on-surface-variant/50">M</span>
              </div>
              <div className="flex flex-col items-center gap-2 w-full">
                <div className="w-full max-w-[20px] bg-primary/80 rounded-t-sm h-[90%] shadow-glow-general-sm"></div>
                <span className="text-[10px] font-bold text-on-surface-variant/50">M</span>
              </div>
              <div className="flex flex-col items-center gap-2 w-full">
                <div className="w-full max-w-[20px] bg-primary rounded-t-sm h-[60%] shadow-glow-general-md"></div>
                <span className="text-[10px] font-bold text-primary font-bold">J</span>
              </div>
              <div className="flex flex-col items-center gap-2 w-full">
                <div className="w-full max-w-[20px] bg-primary/15 rounded-t-sm h-[20%]"></div>
                <span className="text-[10px] font-bold text-on-surface-variant/50">V</span>
              </div>
            </div>
          </div>

          {/* Gamification Streak Footer */}
          <div className="mt-auto pt-6 border-t border-border-glass flex items-center justify-between">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_fire_department
              </span>
              <span className="text-sm font-semibold">{streak} Jours consécutifs</span>
            </div>
            <div className="text-[10px] font-bold tracking-widest text-primary uppercase cursor-pointer hover:underline">
              Détails
            </div>
          </div>
        </div>
      </div>

      <TaskDetailsModal />
    </div>
  );
}
