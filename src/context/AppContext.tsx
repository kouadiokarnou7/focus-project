"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";

export interface Task {
  id: string;
  name: string;
  description?: string;
  priority: "low" | "medium" | "high" | "deep_work";
  estimatedPomodoros: number; // Stored in minutes in database
  completedPomodoros: number; // Stored in minutes completed in database
  status: string;
  createdAt: string;
  dueDate?: string; // Date et heure de rappel de démarrage (Start Reminder)
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
  viewingTask: Task | null;
  setViewingTask: (task: Task | null) => void;

  // Column States for Kanban
  columns: { id: string; title: string }[];
  addColumn: (title: string) => void;
  updateColumn: (id: string, title: string) => void;
  deleteColumn: (id: string) => void;

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
  // Auth & Task API Hooks
  const { user } = useAuth();
  const {
    fetchTasks,
    fetchColumns,
    createTask: apiCreateTask,
    updateTask: apiUpdateTask,
    deleteTask: apiDeleteTask,
    createColumn: apiCreateColumn,
    updateColumn: apiUpdateColumn,
    deleteColumn: apiDeleteColumn,
  } = useTasks();

  const [hasHydrated, setHasHydrated] = useState(false);

  // Navigation & UI state
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);

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
  const endTimeRef = useRef<number | null>(null);
  const timeLeftRef = useRef<number>(timeLeft);
  
  const isTimerLoadedRef = useRef(false);
  const isInitialMount = useRef(true);

  // Sync timeLeftRef with timeLeft
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // Sync Timer settings with selected mode duration
  useEffect(() => {
    if (!isTimerLoadedRef.current) return;
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    let target = timerSettings.focus;
    if (mode === "short_break") target = timerSettings.shortBreak;
    if (mode === "long_break") target = timerSettings.longBreak;
    
    setTimeLeft(target);
    setTotalDuration(target);
    setIsRunning(false);
  }, [mode, timerSettings]);

  // Set timer duration dynamically based on selected active task
  useEffect(() => {
    if (isRunning) return;
    if (activeTaskId) {
      const activeTask = tasks.find((t) => t.id === activeTaskId);
      if (activeTask && activeTask.estimatedPomodoros) {
        const taskMinutes = activeTask.estimatedPomodoros;
        setTimeLeft(taskMinutes * 60);
        setTotalDuration(taskMinutes * 60);
      }
    } else {
      // Revert to default focus settings
      setTimeLeft(timerSettings.focus);
      setTotalDuration(timerSettings.focus);
    }
  }, [activeTaskId, tasks, isRunning, timerSettings.focus]);

  // Load tasks and columns from Supabase or localStorage
  useEffect(() => {
    setHasHydrated(true);
    
    const loadInitialData = async () => {
      if (user) {
        // Logged in: Fetch from Supabase
        const dbTasks = await fetchTasks();
        const dbColumns = await fetchColumns();
        
        setTasks(dbTasks);
        if (dbColumns && dbColumns.length > 0) {
          setColumnsState(dbColumns.map((col: any) => ({
            id: col.id || col.title.toLowerCase().replace(/\s+/g, '_'),
            title: col.title
          })));
        }
      } else {
        // Guest mode: Fallback to localStorage
        if (typeof window !== "undefined") {
          const storedTasks = localStorage.getItem("focusflow_tasks");
          if (storedTasks) {
            try {
              setTasks(JSON.parse(storedTasks));
            } catch (e) {}
          }
          const storedColumns = localStorage.getItem("focusflow_columns");
          if (storedColumns) {
            try {
              setColumnsState(JSON.parse(storedColumns));
            } catch (e) {}
          }
        }
      }
      
      // Load settings, theme, and stats from localStorage (same for both modes)
      if (typeof window !== "undefined") {
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

        // Load timer state from localStorage
        const storedTimer = localStorage.getItem("focusflow_timer_state");
        if (storedTimer) {
          try {
            const parsed = JSON.parse(storedTimer);
            if (parsed.mode) setMode(parsed.mode);
            if (parsed.totalDuration) setTotalDuration(parsed.totalDuration);
            
            let time = parsed.timeLeft;
            if (parsed.isRunning && parsed.lastUpdated) {
              const elapsed = Math.floor((Date.now() - parsed.lastUpdated) / 1000);
              time = Math.max(0, parsed.timeLeft - elapsed);
            }
            setTimeLeft(time);
            setIsRunning(parsed.isRunning && time > 0);
          } catch (e) {}
        }
        isTimerLoadedRef.current = true;
      }
    };

    loadInitialData();
  }, [user, fetchTasks, fetchColumns]);

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    if (hasHydrated) {
      const stateToSave = {
        timeLeft,
        mode,
        totalDuration,
        isRunning,
        lastUpdated: Date.now()
      };
      localStorage.setItem("focusflow_timer_state", JSON.stringify(stateToSave));
    }
  }, [timeLeft, mode, totalDuration, isRunning, hasHydrated]);

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
      
      const hexToRgb = (hex: string) => {
        try {
          const bigint = parseInt(hex.replace('#', ''), 16);
          const r = (bigint >> 16) & 255;
          const g = (bigint >> 8) & 255;
          const b = bigint & 255;
          return `${r}, ${g}, ${b}`;
        } catch (e) {
          return "59, 130, 246"; // default blue
        }
      };

      root.style.setProperty('--app-general-color-rgb', hexToRgb(themeSettings.generalColor));
      root.style.setProperty('--app-action-color-rgb', hexToRgb(themeSettings.actionColor));
      
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
      endTimeRef.current = Date.now() + timeLeftRef.current * 1000;

      const tick = () => {
        const remaining = Math.max(0, Math.ceil((endTimeRef.current! - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0) {
          handleTimerComplete();
        }
      };

      timerIntervalRef.current = setInterval(tick, 1000);

      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          tick();
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      window.addEventListener("focus", handleVisibilityChange);

      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("focus", handleVisibilityChange);
      };
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
      if (activeTaskId) {
        const activeTask = tasks.find((t) => t.id === activeTaskId);
        if (activeTask) {
          const sessionMinutes = Math.round(totalDuration / 60);
          const updatedCompleted = activeTask.completedPomodoros + sessionMinutes;
          const autoCompleted = updatedCompleted >= activeTask.estimatedPomodoros;
          const newStatus = autoCompleted ? "completed" : activeTask.status;

          if (user) {
            apiUpdateTask(activeTaskId, {
              completedPomodoros: updatedCompleted,
              status: newStatus,
            });
          }

          saveTasks(
            tasks.map((t) => {
              if (t.id === activeTaskId) {
                return {
                  ...t,
                  completedPomodoros: updatedCompleted,
                  status: newStatus,
                };
              }
              return t;
            })
          );
        }
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

      if (newCompleted > 0 && newCompleted % 4 === 0) {
        setMode("long_break");
      } else {
        setMode("short_break");
      }
    } else {
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
    
    // Override if active task is selected
    if (activeTaskId && mode === "focus") {
      const activeTask = tasks.find((t) => t.id === activeTaskId);
      if (activeTask && activeTask.estimatedPomodoros) {
        target = activeTask.estimatedPomodoros * 60;
      }
    }
    
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
  const addTask = async (taskInput: Omit<Task, "id" | "completedPomodoros" | "createdAt">) => {
    let newTask: Task;
    if (user) {
      const { data, error } = await apiCreateTask(taskInput, user.id);
      if (data && !error) {
        newTask = {
          ...taskInput,
          id: data.id,
          completedPomodoros: 0,
          createdAt: data.created_at || new Date().toISOString(),
          dueDate: data.due_date
        };
      } else {
        return;
      }
    } else {
      newTask = {
        ...taskInput,
        id: "task-" + Date.now(),
        completedPomodoros: 0,
        createdAt: new Date().toISOString(),
      };
    }
    const updated = [...tasks, newTask];
    saveTasks(updated);
  };

  const toggleTaskCompleted = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const completedColId = columns[columns.length - 1]?.id || "completed";
    const defaultColId = columns[0]?.id || "todo";

    const isCompletedNow = task.status !== completedColId;
    const newStatus = isCompletedNow ? completedColId : defaultColId;

    if (user) {
      await apiUpdateTask(id, { status: newStatus });
    }
    const updated = tasks.map((t) => {
      if (t.id === id) {
        return { ...t, status: newStatus };
      }
      return t;
    });
    saveTasks(updated);
  };

  const deleteTask = async (id: string) => {
    if (user) {
      await apiDeleteTask(id);
    }
    const updated = tasks.filter((t) => t.id !== id);
    saveTasks(updated);
    if (activeTaskId === id) {
      setActiveTaskId(null);
    }
  };

  const updateTaskStatus = async (id: string, status: string) => {
    if (user) {
      await apiUpdateTask(id, { status });
    }
    const updated = tasks.map((t) => {
      if (t.id === id) {
        return { ...t, status };
      }
      return t;
    });
    saveTasks(updated);
  };

  const addColumn = async (title: string) => {
    if (user) {
      const { data, error } = await apiCreateColumn(title, columns.length, user.id);
      if (data && !error) {
        setColumnsState((prev) => [...prev, { id: data.id, title: data.title }]);
      }
    } else {
      const newId = title.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
      setColumnsState((prev) => [...prev, { id: newId, title }]);
    }
  };

  const updateColumn = async (id: string, title: string) => {
    if (user) {
      await apiUpdateColumn(id, title);
    }
    setColumnsState((prev) =>
      prev.map((col) => (col.id === id ? { ...col, title } : col))
    );
  };

  const deleteColumn = async (id: string) => {
    const colIndex = columns.findIndex((col) => col.id === id);
    if (colIndex < 3) return; // Prevent deleting defaults

    if (user) {
      await apiDeleteColumn(id);
    }

    // Move tasks in deleted column back to the first column
    const defaultColId = columns[0].id;
    const updatedTasks = tasks.map((t) => {
      if (t.status === id) {
        if (user) {
          apiUpdateTask(t.id, { status: defaultColId });
        }
        return { ...t, status: defaultColId };
      }
      return t;
    });
    saveTasks(updatedTasks);

    setColumnsState((prev) => prev.filter((col) => col.id !== id));
  };

  const editTask = async (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => {
    if (user) {
      await apiUpdateTask(id, updates);
    }
    const updated = tasks.map((t) => {
      if (t.id === id) {
        return { ...t, ...updates };
      }
      return t;
    });
    saveTasks(updated);
  };

  // Task Start Reminder Notifications Scheduler
  useEffect(() => {
    if (!hasHydrated) return;

    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }

    const checkDueDates = () => {
      const now = new Date();
      tasks.forEach(async (task) => {
        if (task.status === "completed" || !task.dueDate) return;
        
        const reminderTime = new Date(task.dueDate);
        
        // Notify if current time has reached or passed the reminder time
        if (now >= reminderTime) {
          const notifiedKey = `notified_${task.id}`;
          if (sessionStorage.getItem(notifiedKey)) return;
          sessionStorage.setItem(notifiedKey, "true");

          // 1. In-App Notification (standard alert)
          alert(`⏰ COMMENCER TÂCHE : Il est temps de démarrer la tâche "${task.name}" !`);

          // 2. Browser Push Notification
          if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            new Notification(`pomoBEAK - Rappel de Démarrage`, {
              body: `Il est temps de commencer la tâche : "${task.name}"`,
              icon: "/favicon.ico"
            });
          }

          // 3. Email Notification API Call
          if (user?.email) {
            try {
              await fetch("/api/send-reminder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: user.email,
                  taskName: task.name,
                  dueDate: task.dueDate
                })
              });
            } catch (err) {
              console.error("Failed to send email reminder:", err);
            }
          }
        }
      });
    };

    checkDueDates();
    const interval = setInterval(checkDueDates, 30000);
    return () => clearInterval(interval);
  }, [tasks, hasHydrated, user]);

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
        updateColumn,
        deleteColumn,

        themeSettings,
        setThemeSettings,

        isAddTaskOpen,
        setIsAddTaskOpen,
        editingTask,
        setEditingTask,
        viewingTask,
        setViewingTask,

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
