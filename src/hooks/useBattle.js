import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { RARITY_SCORE, computeCardStats, computeCardLevel, RIPZ_REWARDS } from '../data/gameData'

/*
  Supabase table required (run once in SQL editor):

  CREATE TABLE battles (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    challenger_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    challenger_deck jsonb NOT NULL DEFAULT '[]',
    opponent_name  text NOT NULL DEFAULT 'CPU',
    opponent_deck  jsonb NOT NULL DEFAULT '[]',
    challenger_score numeric NOT NULL DEFAULT 0,
    opponent_score   numeric NOT NULL DEFAULT 0,
    result         text NOT NULL DEFAULT 'pending',  -- 'win' | 'loss' | 'draw'
    ripz_earned    numeric NOT NULL DEFAULT 0,
    created_at     timestamptz NOT NULL DEFAULT now()
  );
  ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Users manage own battles" ON battles
    USING (auth.uid() = challenger_id) WITH CHECK (auth.uid() = challenger_id);
  CREATE INDEX ON battles (challenger_id, created_at DESC);
*/

// Score a single card for battle
function scoreCard(card) {
  const rarityScore = RARITY_SCORE[card.rarity] ?? 1
  const { power }   = computeCardStats(card.coin)
  const level       = computeCardLevel(card.count ?? 1)
  return rarityScore * (power / 50) * (1 + level * 0.1)
}

// Score a full deck
function scoreDeck(deck) {
  return deck.reduce((total, card) => total + scoreCard(card), 0)
}

// Generate an AI opponent deck from all available coins
function generateAIDeck(allCoins, allRarities) {
  const rarityNames = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'GOLDEN_COMMON', 'GOLDEN_RARE', 'GOLDEN_EPIC', 'GOLDEN_LEGENDARY']
  const deck = []
  for (let i = 0; i < 3; i++) {
    const coin   = allCoins[Math.floor(Math.random() * allCoins.length)]
    const rarity = rarityNames[Math.floor(Math.random() * 4)] // bias towards base rarities
    deck.push({ coin, rarity, count: Math.ceil(Math.random() * 6) })
  }
  return deck
}

// AI difficulty names
const AI_OPPONENTS = [
  { name: 'NOOB_BOT', multiplier: 0.6  },
  { name: 'DEGEN_CPU', multiplier: 0.85 },
  { name: 'WHALE_AI',  multiplier: 1.1  },
  { name: 'RUGGER_X',  multiplier: 1.3  },
]

export function useBattle(user, collection, coins, earnRipz, trackProgress) {
  const [battleHistory, setBattleHistory] = useState([])
  const [battling, setBattling]           = useState(false)
  const [lastResult, setLastResult]       = useState(null)
  const earnRef          = useRef(earnRipz)
  const trackRef         = useRef(trackProgress)
  useEffect(() => { earnRef.current = earnRipz }, [earnRipz])
  useEffect(() => { trackRef.current = trackProgress }, [trackProgress])

  // Load recent battle history
  useEffect(() => {
    if (!user) { setBattleHistory([]); setLastResult(null); return }
    supabase
      .from('battles')
      .select('id, opponent_name, challenger_score, opponent_score, result, ripz_earned, created_at')
      .eq('challenger_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => setBattleHistory(data ?? []))
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const startBattle = useCallback(async (deck) => {
    if (!user || battling || deck.length < 3 || coins.length === 0) return
    setBattling(true)

    // Pick AI opponent
    const opponent = AI_OPPONENTS[Math.floor(Math.random() * AI_OPPONENTS.length)]
    const aiDeck   = generateAIDeck(coins)

    // Score both decks
    const myScore  = scoreDeck(deck)
    const aiScore  = scoreDeck(aiDeck) * opponent.multiplier

    // Add small RNG variance (±15%)
    const myFinal  = myScore  * (0.85 + Math.random() * 0.3)
    const aiFinal  = aiScore  * (0.85 + Math.random() * 0.3)

    const won      = myFinal > aiFinal
    const draw     = Math.abs(myFinal - aiFinal) < 0.5
    const result   = draw ? 'draw' : won ? 'win' : 'loss'
    const ripz     = won ? RIPZ_REWARDS.WIN_BATTLE : RIPZ_REWARDS.LOSE_BATTLE

    const battleRecord = {
      challenger_id:    user.id,
      challenger_deck:  deck.map(c => ({ coin_id: c.coin.id, rarity: c.rarity, count: c.count ?? 1 })),
      opponent_name:    opponent.name,
      opponent_deck:    aiDeck.map(c => ({ coin_id: c.coin.id, rarity: c.rarity, count: c.count ?? 1 })),
      challenger_score: Math.round(myFinal * 100) / 100,
      opponent_score:   Math.round(aiFinal * 100) / 100,
      result,
      ripz_earned:      ripz,
    }

    const { data, error } = await supabase
      .from('battles')
      .insert(battleRecord)
      .select('id, opponent_name, challenger_score, opponent_score, result, ripz_earned, created_at')
      .single()

    if (!error && data) {
      setBattleHistory(prev => [data, ...prev].slice(0, 10))
      setLastResult({ ...data, myDeck: deck, aiDeck, opponentName: opponent.name })
      if (earnRef.current) await earnRef.current(ripz)
      if (won && trackRef.current) trackRef.current('battle_won', {})
    }

    setBattling(false)
  }, [user, battling, coins]) // eslint-disable-line react-hooks/exhaustive-deps

  const clearResult = useCallback(() => setLastResult(null), [])

  return { battleHistory, battling, lastResult, startBattle, clearResult, scoreDeck }
}
