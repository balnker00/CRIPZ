import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { DAILY_MISSIONS } from '../data/gameData'

/*
  Supabase table required (run once in SQL editor):

  CREATE TABLE user_missions (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mission_id   text NOT NULL,
    completed_at timestamptz NOT NULL DEFAULT now(),
    ripz_earned  numeric NOT NULL DEFAULT 0
  );
  ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Users manage own missions" ON user_missions
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  CREATE INDEX ON user_missions (user_id, completed_at);
*/

function todayUTC() {
  return new Date().toISOString().split('T')[0]
}

export function useMissions(user, earnRipz) {
  const [completedToday, setCompletedToday]   = useState(new Set())
  const [dailyCardCount, setDailyCardCount]   = useState(0)
  const completedRef = useRef(new Set())
  const dailyCardRef = useRef(0)
  const earnRef      = useRef(earnRipz)
  useEffect(() => { earnRef.current = earnRipz }, [earnRipz])

  // Load today's completions from DB
  useEffect(() => {
    if (!user) {
      completedRef.current = new Set()
      setCompletedToday(new Set())
      setDailyCardCount(0)
      dailyCardRef.current = 0
      return
    }
    const today = todayUTC()
    supabase
      .from('user_missions')
      .select('mission_id')
      .eq('user_id', user.id)
      .gte('completed_at', `${today}T00:00:00.000Z`)
      .lte('completed_at', `${today}T23:59:59.999Z`)
      .then(({ data }) => {
        const done = new Set((data ?? []).map(r => r.mission_id))
        completedRef.current = done
        setCompletedToday(new Set(done))
      })
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const completeMission = useCallback(async (missionId) => {
    if (!user || completedRef.current.has(missionId)) return
    const mission = DAILY_MISSIONS.find(m => m.id === missionId)
    if (!mission) return

    // Optimistic update
    completedRef.current = new Set([...completedRef.current, missionId])
    setCompletedToday(new Set(completedRef.current))

    // Persist + earn reward
    await supabase.from('user_missions').insert({
      user_id:      user.id,
      mission_id:   missionId,
      completed_at: new Date().toISOString(),
      ripz_earned:  mission.reward,
    }).then(({ error }) => {
      if (error) console.error('completeMission error:', error)
    })
    if (earnRef.current) await earnRef.current(mission.reward)
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  // Called after events (pack open, battle win, etc.)
  const trackProgress = useCallback((event, data) => {
    if (!user) return

    if (event === 'login') {
      completeMission('daily_login')
    }

    if (event === 'pack_opened') {
      completeMission('open_pack')
      // Track count-based "collect 5" mission
      const newCount = dailyCardRef.current + (data?.cards?.length ?? 0)
      dailyCardRef.current = newCount
      setDailyCardCount(newCount)
      if (newCount >= 5) completeMission('collect_5')

      // Rarity-based missions
      if (data?.cards) {
        for (const card of data.cards) {
          const isGolden  = card.rarity.startsWith('GOLDEN_')
          const base      = isGolden ? card.rarity.replace('GOLDEN_', '') : card.rarity
          if (isGolden)                                   completeMission('pull_golden')
          if (['RARE','EPIC','LEGENDARY'].includes(base)) completeMission('pull_rare')
          if (base === 'EPIC')                            completeMission('pull_epic')
          if (base === 'LEGENDARY')                       completeMission('pull_legendary')
        }
      }
    }

    if (event === 'battle_won') {
      completeMission('win_battle')
    }
  }, [user, completeMission]) // eslint-disable-line react-hooks/exhaustive-deps

  const missions = DAILY_MISSIONS.map(m => ({
    ...m,
    completed: completedToday.has(m.id),
  }))

  return { missions, completeMission, trackProgress, dailyCardCount }
}
