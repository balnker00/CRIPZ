import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

/*
  Supabase table required (run once in SQL editor):

  CREATE TABLE user_ripz_balance (
    user_id  uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    balance  numeric NOT NULL DEFAULT 0,
    updated_at timestamptz NOT NULL DEFAULT now()
  );
  ALTER TABLE user_ripz_balance ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Users manage own ripz" ON user_ripz_balance
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
*/

export function useRipz(user) {
  const [ripzBalance, setRipzBalance] = useState(0)
  const [ripzReady, setRipzReady]     = useState(false)
  const balanceRef = useRef(0)
  const userRef    = useRef(user)
  useEffect(() => { userRef.current = user }, [user])

  // Load balance when user changes
  useEffect(() => {
    if (!user) {
      balanceRef.current = 0
      setRipzBalance(0)
      setRipzReady(false)
      return
    }
    setRipzReady(false)
    supabase
      .from('user_ripz_balance')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        const b = Number(data?.balance ?? 0)
        balanceRef.current = b
        setRipzBalance(b)
        setRipzReady(true)
      })
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const earnRipz = useCallback(async (amount) => {
    if (!userRef.current || amount <= 0) return
    const newBalance = balanceRef.current + amount
    balanceRef.current = newBalance
    setRipzBalance(newBalance)
    await supabase
      .from('user_ripz_balance')
      .upsert(
        { user_id: userRef.current.id, balance: newBalance, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )
      .then(({ error }) => { if (error) console.error('earnRipz error:', error) })
  }, [])

  const spendRipz = useCallback(async (amount) => {
    if (!userRef.current || amount <= 0) return false
    if (balanceRef.current < amount) return false
    const newBalance = balanceRef.current - amount
    // Optimistic update
    balanceRef.current = newBalance
    setRipzBalance(newBalance)
    const { error } = await supabase
      .from('user_ripz_balance')
      .upsert(
        { user_id: userRef.current.id, balance: newBalance, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )
    if (error) {
      // Revert on failure
      console.error('spendRipz error:', error)
      balanceRef.current = balanceRef.current + amount
      setRipzBalance(balanceRef.current)
      return false
    }
    return true
  }, [])

  return { ripzBalance, ripzReady, earnRipz, spendRipz }
}
