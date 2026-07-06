'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Supabase sends a confirmation email by default if Email Confirmations are enabled in the dashboard.
  // This satisfies the "2FA by email" verification step during registration.
  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Veuillez vérifier votre boîte mail pour confirmer votre inscription (2FA).' }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  redirect('/login')
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  
  // Dynamically determine the URL based on the request host (works on Vercel and Localhost automatically)
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https'
  const appUrl = `${protocol}://${host}`
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${appUrl}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data?.url) {
    redirect(data.url)
  }
  
  return { error: 'Une erreur inconnue est survenue.' }
}
