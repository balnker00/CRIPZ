import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { RARITY_ORDER } from '../data/gameData'

/*
  This component reads across tables to build leaderboards.
  It does NOT require any new Supabase views — it queries existing tables.
  user_ripz_balance and battles tables must exist (see SQL queries).
*/

function useLeaderboard(tab) {
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setRows([])

    if (tab === 'ripz') {
      // Top $RIPZ holders
      supabase
        .from('user_ripz_balance')
        .select('user_id, balance')
        .order('balance', { ascending: false })
        .limit(20)
        .then(({ data }) => {
          setRows((data ?? []).map((r, i) => ({
            rank:  i + 1,
            label: `${r.user_id.slice(0, 8)}…`,
            value: `${Number(r.balance).toFixed(0)} $RIPZ`,
          })))
          setLoading(false)
        })
    } else if (tab === 'battles') {
      // Most battle wins (aggregate from battles table)
      supabase
        .from('battles')
        .select('challenger_id')
        .eq('result', 'win')
        .then(({ data }) => {
          const counts = {}
          ;(data ?? []).forEach(r => {
            counts[r.challenger_id] = (counts[r.challenger_id] ?? 0) + 1
          })
          const sorted = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
          setRows(sorted.map(([uid, wins], i) => ({
            rank:  i + 1,
            label: `${uid.slice(0, 8)}…`,
            value: `${wins} wins`,
          })))
          setLoading(false)
        })
    } else {
      // Collection size (total cards pulled) — from user_collection
      supabase
        .from('user_collection')
        .select('user_id, cards')
        .then(({ data }) => {
          const rows = (data ?? [])
            .map(r => {
              const total = (r.cards ?? []).reduce((s, c) => s + (c.count ?? 1), 0)
              return { user_id: r.user_id, total }
            })
            .sort((a, b) => b.total - a.total)
            .slice(0, 20)
          setRows(rows.map((r, i) => ({
            rank:  i + 1,
            label: `${r.user_id.slice(0, 8)}…`,
            value: `${r.total} cards`,
          })))
          setLoading(false)
        })
    }
  }, [tab])

  return { rows, loading }
}

export default function Leaderboard({ user }) {
  const [tab, setTab] = useState('collection')
  const { rows, loading } = useLeaderboard(tab)

  const tabs = [
    { id: 'collection', label: 'Collection' },
    { id: 'ripz',       label: '$RIPZ' },
    { id: 'battles',    label: 'Battles' },
  ]

  return (
    <div className="leaderboard-panel">
      <div className="leaderboard-header">// LEADERBOARD //</div>

      <div className="leaderboard-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`lb-tab-btn${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="lb-loading">loading rankings…</div>
      ) : rows.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <div className="empty-text">no data yet — be the first on the board</div>
        </div>
      ) : (
        <div className="lb-table">
          <div className="lb-row lb-header-row">
            <span className="lb-rank">#</span>
            <span className="lb-player">PLAYER</span>
            <span className="lb-value">SCORE</span>
          </div>
          {rows.map(row => (
            <div
              key={row.rank}
              className={`lb-row${row.rank <= 3 ? ' lb-top3' : ''}${user && row.label.startsWith(user.id?.slice(0, 8)) ? ' lb-self' : ''}`}
            >
              <span className="lb-rank">
                {row.rank === 1 ? '🥇' : row.rank === 2 ? '🥈' : row.rank === 3 ? '🥉' : row.rank}
              </span>
              <span className="lb-player">{row.label}</span>
              <span className="lb-value">{row.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
