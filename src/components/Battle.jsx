import { useState, useMemo } from 'react'
import Card from './Card'
import { computeCardStats, computeCardLevel, RARITY_SCORE, RIPZ_REWARDS } from '../data/gameData'

function calcCardScore(card) {
  const rarityScore = RARITY_SCORE[card.rarity] ?? 1
  const { power }   = computeCardStats(card.coin)
  const level       = computeCardLevel(card.count ?? 1)
  return Math.round(rarityScore * (power / 50) * (1 + level * 0.1) * 100) / 100
}

export default function Battle({ user, collection, coins, battleHistory, battling, lastResult, onStartBattle, onClearResult }) {
  const [selectedDeck, setSelectedDeck] = useState([])
  const [deckView, setDeckView]         = useState(false)

  // Only non-listed cards available for battle
  const available = useMemo(
    () => collection.filter(c => !c.listing_id && c.coin),
    [collection]
  )

  function toggleCard(card) {
    setSelectedDeck(prev => {
      const idx = prev.findIndex(c => c.id === card.id)
      if (idx >= 0) return prev.filter((_, i) => i !== idx)
      if (prev.length >= 3) return prev
      return [...prev, card]
    })
  }

  function handleBattle() {
    if (selectedDeck.length < 3 || battling) return
    onStartBattle(selectedDeck)
    setSelectedDeck([])
    setDeckView(false)
  }

  if (!user) {
    return (
      <div className="battle-empty">
        <div className="empty-icon">⚔</div>
        <div className="empty-text">login to challenge opponents and earn $RIPZ</div>
      </div>
    )
  }

  if (lastResult) {
    const won  = lastResult.result === 'win'
    const draw = lastResult.result === 'draw'
    return (
      <div className="battle-result-panel">
        <div className={`battle-result-banner ${won ? 'banner-win' : draw ? 'banner-draw' : 'banner-loss'}`}>
          {won ? '⚔ VICTORY' : draw ? '// DRAW //' : '✕ DEFEAT'}
        </div>
        <div className="battle-result-scores">
          <div className="battle-score-block">
            <div className="battle-score-label">YOUR SCORE</div>
            <div className="battle-score-val">{lastResult.challenger_score.toFixed(1)}</div>
          </div>
          <div className="battle-vs-sep">VS</div>
          <div className="battle-score-block">
            <div className="battle-score-label">{lastResult.opponentName || lastResult.opponent_name}</div>
            <div className="battle-score-val">{lastResult.opponent_score.toFixed(1)}</div>
          </div>
        </div>
        <div className="battle-result-ripz">
          {won
            ? `+${RIPZ_REWARDS.WIN_BATTLE} $RIPZ earned`
            : `+${RIPZ_REWARDS.LOSE_BATTLE} $RIPZ (consolation)`}
        </div>
        <button className="battle-continue-btn" onClick={onClearResult}>
          CONTINUE
        </button>
      </div>
    )
  }

  return (
    <div className="battle-panel">
      <div className="battle-header">
        <div className="battle-title">// CARD BATTLE //</div>
        <div className="battle-subtitle">Select 3 cards · Auto-resolve · Earn $RIPZ</div>
      </div>

      {/* Deck selector toggle */}
      <div className="battle-deck-info">
        <div className="battle-deck-label">
          DECK ({selectedDeck.length}/3)
          {selectedDeck.length === 3 && <span className="battle-deck-ready"> — READY</span>}
        </div>
        <button
          className="battle-toggle-btn"
          onClick={() => setDeckView(v => !v)}
        >
          {deckView ? 'HIDE CARDS' : 'SELECT CARDS'}
        </button>
      </div>

      {/* Selected deck preview */}
      {selectedDeck.length > 0 && (
        <div className="battle-deck-preview">
          {selectedDeck.map(card => (
            <div key={card.id} className="battle-deck-card" onClick={() => toggleCard(card)}>
              <div className={`battle-mini-card rarity-${card.rarity.toLowerCase().replace('_', '-')}`}>
                <div className="battle-mini-name">{card.coin['TICKER']}</div>
                <div className="battle-mini-score">{calcCardScore(card)}</div>
              </div>
              <div className="battle-mini-remove">✕</div>
            </div>
          ))}
        </div>
      )}

      {/* Card picker */}
      {deckView && (
        <div className="battle-card-picker">
          <div className="battle-picker-hint">
            Click a card to add/remove from your deck. Max 3 cards.
          </div>
          <div className="battle-picker-grid">
            {available.length === 0 ? (
              <div className="empty-text" style={{ gridColumn: '1/-1', padding: '1rem 0' }}>
                No cards available — open some packs first
              </div>
            ) : (
              available.slice(0, 30).map(card => {
                const inDeck = selectedDeck.some(c => c.id === card.id)
                return (
                  <div
                    key={card.id}
                    className={`battle-picker-item${inDeck ? ' in-deck' : ''}`}
                    onClick={() => toggleCard(card)}
                  >
                    <div className="battle-picker-ticker">{card.coin['TICKER']}</div>
                    <div className="battle-picker-rarity">{card.rarity.replace('GOLDEN_', '★ ')}</div>
                    <div className="battle-picker-score">⚡{calcCardScore(card)}</div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      <button
        className="battle-start-btn"
        onClick={handleBattle}
        disabled={selectedDeck.length < 3 || battling || available.length === 0}
      >
        {battling ? 'BATTLING...' : selectedDeck.length < 3 ? `SELECT ${3 - selectedDeck.length} MORE` : '⚔ BATTLE NOW'}
      </button>

      {/* Battle history */}
      {battleHistory.length > 0 && (
        <div className="battle-history">
          <div className="battle-history-title">// RECENT BATTLES //</div>
          {battleHistory.map(b => (
            <div key={b.id} className={`battle-history-row result-${b.result}`}>
              <span className="bh-result">{b.result === 'win' ? '✓ WIN' : b.result === 'draw' ? '= DRAW' : '✕ LOSS'}</span>
              <span className="bh-vs">vs {b.opponent_name}</span>
              <span className="bh-scores">{b.challenger_score.toFixed(1)} vs {b.opponent_score.toFixed(1)}</span>
              <span className="bh-ripz">+{b.ripz_earned} $RIPZ</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
