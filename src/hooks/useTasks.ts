'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Task } from '@/context/AppContext'

export function useTasks() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

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

  const createColumn = async (title: string, position: number) => {
    const { data, error } = await supabase.from('columns').insert({ title, position }).select().single()
    if (error) setError(error.message)
    return { data, error }
  }

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
      createdAt: t.created_at
    })) as Task[]
  }, [supabase])

  const createTask = async (task: Omit<Task, 'id' | 'completedPomodoros' | 'createdAt'>) => {
    const dbTask = {
      name: task.name,
      description: task.description,
      category: task.category,
      priority: task.priority,
      estimated_pomodoros: task.estimatedPomodoros,
      status: task.status
    }
    
    const { data, error } = await supabase.from('tasks').insert(dbTask).select().single()
    if (error) setError(error.message)
    return { data, error }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const dbUpdates: any = { ...updates }
    if (updates.estimatedPomodoros !== undefined) dbUpdates.estimated_pomodoros = updates.estimatedPomodoros
    if (updates.completedPomodoros !== undefined) dbUpdates.completed_pomodoros = updates.completedPomodoros
    
    delete dbUpdates.estimatedPomodoros
    delete dbUpdates.completedPomodoros
    delete dbUpdates.createdAt

    const { data, error } = await supabase.from('tasks').update(dbUpdates).eq('id', id).select().single()
    if (error) setError(error.message)
    return { data, error }
  }

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) setError(error.message)
    return { error }
  }

  return {
    loading,
    error,
    fetchColumns,
    createColumn,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask
  }
}
