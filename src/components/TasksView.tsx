"use client";

import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useApp, Task } from "@/context/AppContext";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";

export const TasksView: React.FC = () => {
  const {
    tasks,
    activeTaskId,
    setActiveTaskId,
    toggleTaskCompleted,
    deleteTask,
    updateTaskStatus,
    setIsAddTaskOpen,
    setEditingTask,
    columns,
    addColumn,
  } = useApp();

  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Format category badge colors
  const getCategoryClass = (category: Task["category"]) => {
    switch (category) {
      case "development":
        return "bg-tertiary-container/15 text-tertiary";
      case "design":
        return "bg-secondary-container/15 text-secondary";
      case "research":
        return "bg-primary-container/10 text-primary";
      default:
        return "bg-surface-container-highest text-on-surface-variant";
    }
  };

  // Format category translated names
  const getCategoryLabel = (category: Task["category"]) => {
    switch (category) {
      case "development":
        return "Dev";
      case "design":
        return "Design";
      case "research":
        return "Recherche";
      case "admin":
        return "Admin";
      default:
        return "Marketing";
    }
  };

  // Format priority levels
  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return (
          <span className="px-2.5 py-1 rounded-full bg-error-container/20 text-error text-[10px] font-bold tracking-wide flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">flag</span>
            <span>Élevée</span>
          </span>
        );
      case "deep_work":
        return (
          <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold tracking-wide flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">bolt</span>
            <span>Deep Work</span>
          </span>
        );
      case "medium":
        return (
          <span className="px-2.5 py-1 rounded-full bg-surface-container-highest text-on-surface-variant text-[10px] font-bold tracking-wide flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">flag</span>
            <span>Moyenne</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-surface-glass text-on-surface-variant/70 text-[10px] font-bold tracking-wide flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">flag</span>
            <span>Faible</span>
          </span>
        );
    }
  };

  // Render Kanban task card
  const renderKanbanCard = (task: Task, index: number) => {
    const isActive = activeTaskId === task.id;
    return (
      <Draggable key={task.id} draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => setActiveTaskId(task.id)}
            className={`glass-panel p-4 rounded-xl cursor-pointer transition-all duration-200 group flex flex-col relative ${
              isActive
                ? "border-primary/40 shadow-[0_0_20px_rgba(255,107,26,0.12)] bg-surface-glass"
                : "hover:border-primary/30"
            } ${snapshot.isDragging ? "shadow-2xl ring-2 ring-primary/50 rotate-2 z-50 bg-surface-container" : ""}`}
          >
            {isActive && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md"></div>
            )}

            <div className="flex justify-between items-start mb-2.5">
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase ${getCategoryClass(task.category)}`}>
                {getCategoryLabel(task.category)}
              </span>
              
              {/* Edit & Delete - visible on hover */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingTask(task);
                  }}
                  className="w-6 h-6 rounded flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-glass transition-all cursor-pointer"
                  title="Modifier"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTaskToDelete(task);
                  }}
                  className="w-6 h-6 rounded flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/5 transition-all cursor-pointer"
                  title="Supprimer"
                >
                  <span className="material-symbols-outlined text-[14px]">delete</span>
                </button>
              </div>
            </div>

            <h4 className={`text-sm font-semibold mb-4 leading-snug ${isActive ? "text-primary" : "text-on-surface"}`}>
              {task.name}
            </h4>

            <div className="flex items-center justify-between mt-auto">
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className="material-symbols-outlined text-[14px] text-on-surface-variant cursor-grab">drag_indicator</span>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-bold bg-surface-container rounded-md px-2 py-0.5 border border-border-glass/40">
                <span>🍅</span>
                <span className="font-mono text-on-surface">{task.completedPomodoros}/{task.estimatedPomodoros}</span>
              </div>
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // The destination.droppableId is the status (e.g., todo, in_progress, custom)
    const newStatus = destination.droppableId;
    
    // Update task status
    updateTaskStatus(draggableId, newStatus);
  };


  return (
    <div className="flex flex-col flex-1 w-full h-full">
      {/* Header action panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">Gestion des Tâches</h2>
          <p className="text-xs text-on-surface-variant mt-1">Organisez votre charge de travail et vos sessions de concentration.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* View Toggle */}
          <div className="flex bg-surface-container-low rounded-lg p-0.5 border border-border-glass">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1 px-4 py-2 rounded-md font-bold text-[10px] tracking-widest transition-all ${
                viewMode === "list"
                  ? "bg-surface-glass text-primary shadow-[0_0_10px_rgba(255,107,26,0.15)]"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">list</span>
              <span>LISTE</span>
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1 px-4 py-2 rounded-md font-bold text-[10px] tracking-widest transition-all ${
                viewMode === "kanban"
                  ? "bg-surface-glass text-primary shadow-[0_0_10px_rgba(255,107,26,0.15)]"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">view_kanban</span>
              <span>KANBAN</span>
            </button>
          </div>

          <button
            onClick={() => setIsAddTaskOpen(true)}
            className="ml-auto sm:ml-0 bg-primary-container text-white py-2 px-4 rounded-lg shadow-[0_0_15px_rgba(255,107,26,0.15)] hover:bg-opacity-95 transition-all text-xs font-bold flex items-center gap-1.5 active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Nouvelle Tâche</span>
          </button>
        </div>
      </div>

      {/* Primary Display panels */}
      {viewMode === "list" ? (
        <div className="glass-panel rounded-xl overflow-hidden shadow-2xl">
          {/* Table Header */}
          <div className="grid grid-cols-[50px_1fr_120px_120px_100px_80px] gap-4 items-center px-6 py-3 border-b border-border-glass bg-surface-container/30 font-bold text-[10px] uppercase tracking-wider text-on-surface-variant">
            <div className="text-center">Statut</div>
            <div>Nom de la tâche</div>
            <div className="text-center">Catégorie</div>
            <div className="text-center">Priorité</div>
            <div className="text-right">Pomodoros</div>
            <div className="text-center">Actions</div>
          </div>

          {/* Table Body rows */}
          <div className="divide-y divide-border-glass">
            {tasks.length === 0 ? (
              <div className="px-6 py-12 text-center text-on-surface-variant text-sm">
                Aucune tâche pour le moment. Cliquez sur "Nouvelle Tâche" pour commencer !
              </div>
            ) : (
            tasks.map((task) => {
              const isActive = activeTaskId === task.id;
              const isCompleted = task.status === "completed";
              return (
                <div
                  key={task.id}
                  onClick={() => setActiveTaskId(task.id)}
                  className={`group grid grid-cols-[50px_1fr_120px_120px_100px_80px] gap-4 items-center px-6 py-4 hover:bg-surface-glass transition-colors cursor-pointer relative ${
                    isActive ? "bg-surface-glass/40" : ""
                  }`}
                >
                  {/* High priority luminous marker */}
                  {task.priority === "high" && !isCompleted && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md shadow-[0_0_10px_rgba(255,107,26,0.5)]"></div>
                  )}

                  {/* Complete check-off checkbox */}
                  <div className="flex justify-center items-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskCompleted(task.id);
                      }}
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                        isCompleted
                          ? "bg-primary border-primary shadow-[0_0_8px_rgba(255,107,26,0.3)]"
                          : "border-border-glass hover:border-primary/50"
                      }`}
                    >
                      {isCompleted && (
                        <span className="material-symbols-outlined text-[13px] text-white">check</span>
                      )}
                    </button>
                  </div>

                  {/* Task details */}
                  <div className="min-w-0">
                    <span className={`text-sm font-semibold truncate block ${
                      isCompleted ? "line-through text-on-surface-variant/50" : isActive ? "text-primary font-bold" : "text-on-surface"
                    }`}>
                      {task.name}
                    </span>
                    {task.description && (
                      <span className="text-xs text-on-surface-variant opacity-75 mt-0.5 block truncate max-w-xl">
                        {task.description}
                      </span>
                    )}
                  </div>

                  {/* Category tag */}
                  <div className="flex justify-center">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase ${getCategoryClass(task.category)}`}>
                      {getCategoryLabel(task.category)}
                    </span>
                  </div>

                  {/* Priority level flag */}
                  <div className="flex justify-center">
                    {getPriorityBadge(task.priority)}
                  </div>

                  {/* Pomodoros counter */}
                  <div className="flex justify-end items-center gap-1 text-xs text-primary font-medium">
                    <span className="material-symbols-outlined text-[15px]">timer</span>
                    <span className="font-mono text-on-surface">{task.completedPomodoros}/{task.estimatedPomodoros}</span>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex justify-center items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTask(task);
                      }}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-glass transition-all cursor-pointer"
                      title="Modifier"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTaskToDelete(task);
                      }}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error/5 transition-all cursor-pointer"
                      title="Supprimer"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              );
            })
            )}
          </div>
        </div>
      ) : (
        /* Kanban Board Columns */
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 items-start overflow-x-auto pb-4 w-full">
            {columns.map((column) => (
              <Droppable key={column.id} droppableId={column.id}>
                {(provided, snapshot) => (
                  <div 
                    ref={provided.innerRef} 
                    {...provided.droppableProps}
                    className={`glass-panel p-4 rounded-xl flex flex-col gap-4 min-w-[320px] max-w-[320px] h-[75vh] transition-colors ${snapshot.isDraggingOver ? "bg-surface-glass border-primary/30" : ""}`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-border-glass/40">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${column.id === 'in_progress' ? 'bg-primary shadow-[0_0_10px_rgba(255,107,26,0.6)]' : column.id === 'completed' ? 'bg-tertiary-container' : 'bg-on-surface-variant/40'}`}></span>
                        <h3 className={`text-sm font-bold ${column.id === 'in_progress' ? 'text-primary' : 'text-on-surface'}`}>{column.title}</h3>
                        <span className="bg-surface-glass px-2.5 py-0.5 rounded-full text-[10px] font-bold text-on-surface-variant font-mono">
                          {tasks.filter((t) => t.status === column.id).length}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
                      {tasks.filter((t) => t.status === column.id).map((t, index) => renderKanbanCard(t, index))}
                      {provided.placeholder}
                      
                      {/* Add task button only in the first column or 'todo' to keep UI clean, or all columns if desired */}
                      {column.id === columns[0].id && (
                        <button
                          onClick={() => setIsAddTaskOpen(true)}
                          className="py-3 mt-2 border border-dashed border-border-glass rounded-xl text-on-surface-variant hover:text-primary hover:border-primary/40 hover:bg-surface-glass transition-all flex items-center justify-center gap-1.5 text-xs font-semibold"
                        >
                          <span className="material-symbols-outlined text-[18px]">add</span>
                          <span>Ajouter Tâche</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}

             {/* Add Column Button */}
            <div className="min-w-[320px] h-full">
              {isAddingColumn ? (
                <div className="glass-panel p-4 rounded-xl flex flex-col gap-3">
                  <input
                    type="text"
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    placeholder="Nom de la colonne..."
                    className="bg-surface-container border border-border-glass rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary w-full"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newColumnTitle.trim()) {
                        addColumn(newColumnTitle.trim());
                        setNewColumnTitle("");
                        setIsAddingColumn(false);
                      }
                      if (e.key === 'Escape') {
                        setIsAddingColumn(false);
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (newColumnTitle.trim()) {
                          addColumn(newColumnTitle.trim());
                          setNewColumnTitle("");
                          setIsAddingColumn(false);
                        }
                      }}
                      className="bg-primary text-white text-xs font-bold py-1.5 px-3 rounded-md flex-1"
                    >
                      Ajouter
                    </button>
                    <button
                      onClick={() => setIsAddingColumn(false)}
                      className="bg-surface-container text-on-surface-variant text-xs font-bold py-1.5 px-3 rounded-md flex-1 border border-border-glass"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingColumn(true)}
                  className="w-full h-12 border-2 border-dashed border-border-glass rounded-xl text-on-surface-variant hover:text-primary hover:border-primary/40 hover:bg-surface-glass transition-all flex items-center justify-center gap-1.5 text-sm font-semibold"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  <span>Nouvelle Colonne</span>
                </button>
              )}
            </div>
          </div>
        </DragDropContext>
      )}

      <ConfirmDeleteModal
        isOpen={!!taskToDelete}
        taskName={taskToDelete?.name || ""}
        onConfirm={() => {
          if (taskToDelete) {
            deleteTask(taskToDelete.id);
            setTaskToDelete(null);
          }
        }}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
};
