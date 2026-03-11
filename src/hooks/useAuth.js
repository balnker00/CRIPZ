import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser]           = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleAuth(mode, username, password) {
    const email = `${username.toLowerCase().replace(/\s+/g, '_')}@cripz.game`
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      })
      return error
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return error
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  const username = user?.user_metadata?.username ?? user?.email?.split('@')[0] ?? null

  return { user, authLoading, username, handleAuth, signOut }
}
