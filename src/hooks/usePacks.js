import { useState, useEffect, useCallback } from 'react'

export const FREE_PACKS    = 10
export const AD_REWARD     = 3
export const SHARE_REWARD  = 2
const COOLDOWN_MS          = 15 * 60 * 1000          // 15 min
const LS_KEY             = 'cripz-packs'

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) }
  catch { return null }
}

export function usePacks() {
  const [left, setLeft] = useState(() => {
    const s = loadSaved()
    if (!s) return FREE_PACKS
    if (s.resetAt && Date.now() >= s.resetAt) return FREE_PACKS
    return s.left ?? FREE_PACKS
  })

  const [resetAt, setResetAt] = useState(() => {
    const s = loadSaved()
    if (!s) return null
    if (s.resetAt && Date.now() >= s.resetAt) return null
    return s.resetAt ?? null
  })

  // Persist whenever left/resetAt changes
  useEffect(() => {
    if (left === FREE_PACKS && !resetAt) {
      localStorage.removeItem(LS_KEY)
    } else {
      localStorage.setItem(LS_KEY, JSON.stringify({ left, resetAt }))
    }
  }, [left, resetAt])

  // Auto-reset when cooldown timer fires
  useEffect(() => {
    if (!resetAt) return
    const ms = resetAt - Date.now()
    if (ms <= 0) {
      setLeft(prev => Math.max(prev, FREE_PACKS))
      setResetAt(null)
      return
    }
    // clamp to JS max timeout (~24.8 days)
    const t = setTimeout(() => {
      setLeft(prev => Math.max(prev, FREE_PACKS))
      setResetAt(null)
    }, Math.min(ms, 2_147_483_647))
    return () => clearTimeout(t)
  }, [resetAt])

  const consumePack = useCallback(() => {
    setLeft(prev => Math.max(0, prev - 1))
    // Set the 24 h reset window on the first consumption of the day
    setResetAt(r => r ?? Date.now() + COOLDOWN_MS)
  }, [])

  const rewardAd = useCallback(() => {
    setLeft(prev => prev + AD_REWARD)
  }, [])

  const rewardShare = useCallback(() => {
    setLeft(prev => prev + SHARE_REWARD)
  }, [])

  return {
    packsLeft:  left,
    onCooldown: left === 0,
    resetAt,
    rewardAd,
    rewardShare,
    consumePack,
  }
}
