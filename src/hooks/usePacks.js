import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

export const FREE_PACKS   = 10
export const AD_REWARD    = 3
export const SHARE_REWARD = 2
const COOLDOWN_MS         = 15 * 60 * 1000
const LS_KEY              = 'cripz-packs'

/*
  Supabase table required (run once in SQL editor):

  CREATE TABLE user_packs (
    user_id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    packs_left smallint NOT NULL DEFAULT 10,
    reset_at   timestamptz
  );
  ALTER TABLE user_packs ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Users manage own packs" ON user_packs
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
*/

function loadLS() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) } catch { return null }
}

function parseLS() {
  const s = loadLS()
  if (!s) return { left: FREE_PACKS, resetAt: null }
  if (s.resetAt && Date.now() >= s.resetAt) return { left: FREE_PACKS, resetAt: null }
  return { left: s.left ?? FREE_PACKS, resetAt: s.resetAt ?? null }
}

export function usePacks(user) {
  const [left, setLeft]       = useState(FREE_PACKS)
  const [resetAt, setResetAt] = useState(null)
  const [packsReady, setPacksReady] = useState(false)

  // Refs so persist callback always has fresh values without stale closures
  const leftRef    = useRef(FREE_PACKS)
  const resetAtRef = useRef(null)
  const userRef    = useRef(user)
  useEffect(() => { userRef.current = user }, [user])

  // ── Load state from server (logged-in) or localStorage (anonymous) ──────────
  useEffect(() => {
    setPacksReady(false)

    if (user) {
      supabase
        .from('user_packs')
        .select('packs_left, reset_at')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          let l = FREE_PACKS, r = null
          if (data) {
            const rMs = data.reset_at ? new Date(data.reset_at).getTime() : null
            if (!rMs || Date.now() < rMs) {
              l = data.packs_left ?? FREE_PACKS
              r = rMs
            }
          }
          leftRef.current    = l
          resetAtRef.current = r
          setLeft(l)
          setResetAt(r)
          setPacksReady(true)
        })
    } else {
      const { left: l, resetAt: r } = parseLS()
      leftRef.current    = l
      resetAtRef.current = r
      setLeft(l)
      setResetAt(r)
      setPacksReady(true)
    }
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Persist helper ───────────────────────────────────────────────────────────
  const persist = useCallback((newLeft, newResetAt) => {
    leftRef.current    = newLeft
    resetAtRef.current = newResetAt
    const u = userRef.current
    if (u) {
      supabase.from('user_packs').upsert({
        user_id:    u.id,
        packs_left: newLeft,
        reset_at:   newResetAt ? new Date(newResetAt).toISOString() : null,
      }, { onConflict: 'user_id' })
        .then(({ error }) => { if (error) console.error('Pack sync error:', error) })
    } else {
      if (newLeft === FREE_PACKS && !newResetAt) {
        localStorage.removeItem(LS_KEY)
      } else {
        localStorage.setItem(LS_KEY, JSON.stringify({ left: newLeft, resetAt: newResetAt }))
      }
    }
  }, [])

  // ── Auto-reset when cooldown timer fires ─────────────────────────────────────
  useEffect(() => {
    if (!resetAt) return
    const ms = resetAt - Date.now()
    if (ms <= 0) {
      setLeft(FREE_PACKS); setResetAt(null)
      persist(FREE_PACKS, null)
      return
    }
    const t = setTimeout(() => {
      setLeft(FREE_PACKS); setResetAt(null)
      persist(FREE_PACKS, null)
    }, Math.min(ms, 2_147_483_647))
    return () => clearTimeout(t)
  }, [resetAt, persist])

  // ── Actions ──────────────────────────────────────────────────────────────────
  const consumePack = useCallback(() => {
    const newLeft  = Math.max(0, leftRef.current - 1)
    const newReset = resetAtRef.current ?? Date.now() + COOLDOWN_MS
    setLeft(newLeft)
    if (!resetAtRef.current) setResetAt(newReset)
    persist(newLeft, newReset)
  }, [persist])

  const rewardAd = useCallback(() => {
    console.log('[usePacks] rewardAd called — leftRef.current:', leftRef.current, '| AD_REWARD:', AD_REWARD)
    const newLeft = leftRef.current + AD_REWARD
    console.log('[usePacks] rewardAd — setting left to:', newLeft, '| resetAt stays:', resetAtRef.current)
    setLeft(newLeft)
    persist(newLeft, resetAtRef.current)
    console.log('[usePacks] rewardAd — persist called, done')
  }, [persist])

  const rewardShare = useCallback(() => {
    const newLeft = leftRef.current + SHARE_REWARD
    setLeft(newLeft)
    persist(newLeft, resetAtRef.current)
  }, [persist])

  console.log('[usePacks] return — left:', left, '| onCooldown:', left === 0, '| resetAt:', resetAt)
  return {
    packsLeft:  left,
    onCooldown: left === 0,
    resetAt,
    packsReady,
    rewardAd,
    rewardShare,
    consumePack,
  }
}
