"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

export interface Task {
  id: string;
  name: string;
  description?: string;
  category: "development" | "design" | "research" | "admin" | "marketing";
  priority: "low" | "medium" | "high" | "deep_work";
  estimatedPomodoros: number;
  completedPomodoros: number;
  status: string;
  createdAt: string;
}

export type TimerMode = "focus" | "short_break" | "long_break";

interface AppContextType {
  // Timer States
  timeLeft: number;
  isRunning: boolean;
  mode: TimerMode;
  totalDuration: number;
  toggleTimer: () => void;
  resetTimer: () => void;
  skipTimer: () => void;
  setTimerSettings: (focusMin: number, shortMin: number, longMin: number) => void;
  timerSettings: { focus: number; shortBreak: number; longBreak: number };

  // Theme States
  themeSettings: { generalColor: string; actionColor: string; colorMode: "light" | "dark"; soundTrack: string };
  setThemeSettings: (theme: { generalColor: string; actionColor: string; colorMode: "light" | "dark"; soundTrack: string }) => void;

  // Task States
  tasks: Task[];
  activeTaskId: string | null;
  setActiveTaskId: (id: string | null) => void;
  addTask: (task: Omit<Task, "id" | "completedPomodoros" | "createdAt">) => void;
  editTask: (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => void;
  toggleTaskCompleted: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTaskStatus: (id: string, status: string) => void;

  // UI States
  isAddTaskOpen: boolean;
  setIsAddTaskOpen: (isOpen: boolean) => void;
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;

  // Column States for Kanban
  columns: { id: string; title: string }[];
  addColumn: (title: string) => void;

  // Stats
  streak: number;
  completedSessionsToday: number;
  totalFocusTimeToday: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Melodic chime using Web Audio API
const playChime = (soundTrack: string) => {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    
    if (soundTrack === "zen_chime") {
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
    } else if (soundTrack === "digital_beep") {
      osc1.type = "square";
      osc1.frequency.setValueAtTime(800, ctx.currentTime);
      osc1.frequency.setValueAtTime(1000, ctx.currentTime + 0.1);
    } else {
      // soft_bell
      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc1.frequency.setValueAtTime(880, ctx.currentTime + 0.2); // A5
    }

    gain1.gain.setValueAtTime(0.08, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.45);
    
  } catch (e) {
    console.error("Failed to play chime sound:", e);
  }
};


export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasHydrated, setHasHydrated] = useState(false);
  
  // Navigation & UI state
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Load configuration from settings
  const [timerSettings, setSettingsState] = useState({
    focus: 25 * 60, // in seconds
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  });

  const [themeSettings, setThemeSettingsState] = useState<{ generalColor: string; actionColor: string; colorMode: "light" | "dark"; soundTrack: string }>({
    generalColor: "#3b82f6", // Default Blue
    actionColor: "#2563eb",  // Default Darker Blue
    colorMode: "light",
    soundTrack: "zen_chime", // default sound
  });

  // Timer states
  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState(timerSettings.focus);
  const [totalDuration, setTotalDuration] = useState(timerSettings.focus);
  const [isRunning, setIsRunning] = useState(false);

  // Tasks states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  
  const [columns, setColumnsState] = useState<{id: string; title: string}[]>([
    { id: "todo", title: "À Faire" },
    { id: "in_progress", title: "En Cours" },
    { id: "completed", title: "Terminées" }
  ]);

  // Stats states (start at 0, loaded from storage)
  const [streak, setStreak] = useState(0);
  const [completedSessionsToday, setCompletedSessionsToday] = useState(0);
  const [totalFocusTimeToday, setTotalFocusTimeToday] = useState(0);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync Timer settings with selected mode duration
  useEffect(() => {
    let target = timerSettings.focus;
    if (mode === "short_break") target = timerSettings.shortBreak;
    if (mode === "long_break") target = timerSettings.longBreak;
    
    setTimeLeft(target);
    setTotalDuration(target);
    setIsRunning(false);
  }, [mode, timerSettings]);

  // Load from local storage on mount
  useEffect(() => {
    setHasHydrated(true);
    if (typeof window !== "undefined") {
      const storedTasks = localStorage.getItem("focusflow_tasks");
      if (storedTasks) {
        try {
          setTasks(JSON.parse(storedTasks));
        } catch (e) {
          // If parsing fails, start with empty array
        }
      }

      const storedStats = localStorage.getItem("focusflow_stats");
      if (storedStats) {
        try {
          const parsed = JSON.parse(storedStats);
          if (parsed.streak !== undefined) setStreak(parsed.streak);
          if (parsed.completedSessionsToday !== undefined) setCompletedSessionsToday(parsed.completedSessionsToday);
          if (parsed.totalFocusTimeToday !== undefined) setTotalFocusTimeToday(parsed.totalFocusTimeToday);
        } catch (e) {}
      }

      const storedTheme = localStorage.getItem("focusflow_theme");
      if (storedTheme) {
        try {
          setThemeSettingsState(JSON.parse(storedTheme));
        } catch (e) {}
      }

      const storedColumns = localStorage.getItem("focusflow_columns");
      if (storedColumns) {
        try {
          setColumnsState(JSON.parse(storedColumns));
        } catch (e) {}
      }
    }
  }, []);

  // Apply theme dynamically to CSS variables and dark mode class
  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      
      // Toggle dark mode class
      if (themeSettings.colorMode === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }

      root.style.setProperty('--app-general-color', themeSettings.generalColor);
      root.style.setProperty('--app-action-color', themeSettings.actionColor);
      
      // Also override original primary variables to ensure backward compatibility in some components
      root.style.setProperty('--color-primary', themeSettings.generalColor);
      root.style.setProperty('--color-primary-container', themeSettings.actionColor);
    }
  }, [themeSettings]);

  // Persist columns
  useEffect(() => {
    if (hasHydrated) {
      localStorage.setItem("focusflow_columns", JSON.stringify(columns));
    }
  }, [columns, hasHydrated]);

  // Save tasks to local storage
  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    if (typeof window !== "undefined") {
      localStorage.setItem("focusflow_tasks", JSON.stringify(newTasks));
    }
  };

  // Timer Tick implementation
  useEffect(() => {
    if (isRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRunning, mode, activeTaskId]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    playChime(themeSettings.soundTrack);

    if (mode === "focus") {
      // Add Pomodoro to active task
      if (activeTaskId) {
        saveTasks(
          tasks.map((t) => {
            if (t.id === activeTaskId) {
              const updatedCompleted = t.completedPomodoros + 1;
              const autoCompleted = updatedCompleted >= t.estimatedPomodoros;
              return {
                ...t,
                completedPomodoros: updatedCompleted,
                status: autoCompleted ? "completed" : t.status,
              };
            }
            return t;
          })
        );
      }

      // Update daily stats
      const focusSec = totalDuration;
      const newFocusTime = totalFocusTimeToday + focusSec;
      const newCompleted = completedSessionsToday + 1;
      
      setTotalFocusTimeToday(newFocusTime);
      setCompletedSessionsToday(newCompleted);

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "focusflow_stats",
          JSON.stringify({
            streak,
            completedSessionsToday: newCompleted,
            totalFocusTimeToday: newFocusTime,
          })
        );
      }

      // Transition to break
      // Take short break by default, long break every 4 focus sessions
      if (newCompleted > 0 && newCompleted % 4 === 0) {
        setMode("long_break");
      } else {
        setMode("short_break");
      }
    } else {
      // Transition back to focus
      setMode("focus");
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    let target = timerSettings.focus;
    if (mode === "short_break") target = timerSettings.shortBreak;
    if (mode === "long_break") target = timerSettings.longBreak;
    setTimeLeft(target);
  };

  const skipTimer = () => {
    setIsRunning(false);
    if (mode === "focus") {
      setMode("short_break");
    } else {
      setMode("focus");
    }
  };

  const setTimerSettings = (focusMin: number, shortMin: number, longMin: number) => {
    const updated = {
      focus: focusMin * 60,
      shortBreak: shortMin * 60,
      longBreak: longMin * 60,
    };
    setSettingsState(updated);
  };

  const setThemeSettings = (theme: { generalColor: string; actionColor: string; colorMode: "light" | "dark"; soundTrack: string }) => {
    setThemeSettingsState(theme);
    if (typeof window !== "undefined") {
      localStorage.setItem("focusflow_theme", JSON.stringify(theme));
    }
  };

  // Task operators
  const addTask = (taskInput: Omit<Task, "id" | "completedPomodoros" | "createdAt">) => {
    const newTask: Task = {
      ...taskInput,
      id: "task-" + Date.now(),
      completedPomodoros: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [...tasks, newTask];
    saveTasks(updated);
  };

  const toggleTaskCompleted = (id: string) => {
    const updated = tasks.map((t) => {
      if (t.id === id) {
        const isCompletedNow = t.status !== "completed";
        return {
          ...t,
          status: isCompletedNow ? "completed" : "todo",
        };
      }
      return t;
    });
    saveTasks(updated);
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    saveTasks(updated);
    if (activeTaskId === id) {
      setActiveTaskId(null);
    }
  };

  const updateTaskStatus = (id: string, status: string) => {
    const updated = tasks.map((t) => {
      if (t.id === id) {
        return { ...t, status };
      }
      return t;
    });
    saveTasks(updated);
  };

  const addColumn = (title: string) => {
    const newId = title.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
    setColumnsState(prev => [...prev, { id: newId, title }]);
  };

  const editTask = (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => {
    const updated = tasks.map((t) => {
      if (t.id === id) {
        return { ...t, ...updates };
      }
      return t;
    });
    saveTasks(updated);
  };

  return (
    <AppContext.Provider
      value={{
        timeLeft,
        isRunning,
        mode,
        totalDuration,
        toggleTimer,
        resetTimer,
        skipTimer,
        setTimerSettings,
        timerSettings,
        
        tasks,
        activeTaskId,
        setActiveTaskId,
        addTask,
        editTask,
        toggleTaskCompleted,
        deleteTask,
        updateTaskStatus,

        columns,
        addColumn,

        themeSettings,
        setThemeSettings,

        isAddTaskOpen,
        setIsAddTaskOpen,
        editingTask,
        setEditingTask,

        streak,
        completedSessionsToday,
        totalFocusTimeToday,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
