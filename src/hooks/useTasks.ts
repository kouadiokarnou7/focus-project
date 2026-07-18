'use client'

import { useState, useCallback, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Task } from '@/context/AppContext'

export function useTasks() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])

  // Columns API
  const fetchColumns = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('columns').select('*').order('position', { ascending: true })
    setLoading(false)
    if (error) {
      setError(error.message)
      return []
    }
    return data
  }, [supabase])

  const createColumn = useCallback(async (title: string, position: number, userId?: string) => {
    const payload: any = { title, position }
    if (userId) payload.user_id = userId
    
    const { data, error } = await supabase.from('columns').insert(payload).select().single()
    if (error) setError(error.message)
    return { data, error }
  }, [supabase])

  const updateColumn = useCallback(async (id: string, title: string) => {
    const { data, error } = await supabase.from('columns').update({ title }).eq('id', id).select().single()
    if (error) setError(error.message)
    return { data, error }
  }, [supabase])

  const deleteColumn = useCallback(async (id: string) => {
    const { error } = await supabase.from('columns').delete().eq('id', id)
    if (error) setError(error.message)
    return { error }
  }, [supabase])

  // Tasks API
  const fetchTasks = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
    setLoading(false)
    if (error) {
      setError(error.message)
      return []
    }
    // Transform snake_case from DB to camelCase for UI
    return data.map((t: any) => ({
      ...t,
      estimatedPomodoros: t.estimated_pomodoros,
      completedPomodoros: t.completed_pomodoros,
      createdAt: t.created_at,
      dueDate: t.due_date
    })) as Task[]
  }, [supabase])

  const createTask = useCallback(async (task: Omit<Task, 'id' | 'completedPomodoros' | 'createdAt'>, userId?: string) => {
    const dbTask: any = {
      name: task.name,
      description: task.description,
      priority: task.priority,
      estimated_pomodoros: task.estimatedPomodoros,
      status: task.status,
      due_date: task.dueDate
    }
    if (userId) {
      dbTask.user_id = userId
    }
    
    const { data, error } = await supabase.from('tasks').insert(dbTask).select().single()
    if (error) setError(error.message)
    return { data, error }
  }, [supabase])

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    const dbUpdates: any = { ...updates }
    if (updates.estimatedPomodoros !== undefined) dbUpdates.estimated_pomodoros = updates.estimatedPomodoros
    if (updates.completedPomodoros !== undefined) dbUpdates.completed_pomodoros = updates.completedPomodoros
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate
    
    delete dbUpdates.estimatedPomodoros
    delete dbUpdates.completedPomodoros
    delete dbUpdates.createdAt
    delete dbUpdates.dueDate
    delete dbUpdates.category

    const { data, error } = await supabase.from('tasks').update(dbUpdates).eq('id', id).select().single()
    if (error) setError(error.message)
    return { data, error }
  }, [supabase])

  const deleteTask = useCallback(async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) setError(error.message)
    return { error }
  }, [supabase])

  // Profiles API
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (error) setError(error.message)
    return { data, error }
  }, [supabase])

  const updateProfile = useCallback(async (userId: string, updates: {
    streak?: number;
    completed_sessions_today?: number;
    total_focus_time_today?: number;
  }) => {
    const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single()
    if (error) setError(error.message)
    return { data, error }
  }, [supabase])

  return {
    loading,
    error,
    fetchColumns,
    createColumn,
    updateColumn,
    deleteColumn,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    fetchProfile,
    updateProfile
  }
}
