import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { RIPZ_REWARDS, RARITY_ORDER } from '../data/gameData'

/*
  Supabase tables required (run once in SQL editor — see full SQL at bottom of file):

  marketplace_listings + trade_history
  See the SQL queries provided in the app README.
*/

const STATUS_ACTIVE   = 'active'
const STATUS_SOLD     = 'sold'
const STATUS_CANCELLED = 'cancelled'

function rarityLabel(rarity) {
  if (!rarity) return '?'
  const isGolden = rarity.startsWith('GOLDEN_')
  return isGolden ? `★ ${rarity.replace('GOLDEN_', '')}` : rarity
}

function useListings(refreshKey) {
  const [listings, setListings] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    setLoading(true)
    supabase
      .from('marketplace_listings')
      .select(`
        id, seller_id, coin_id, is_golden, card_level, price, listed_at,
        coinz:coin_id ( id, NAME, TICKER, "IMAGE URL", "MARKET CAP", HOLDERS, "CREATED AT" )
      `)
      .eq('status', STATUS_ACTIVE)
      .order('listed_at', { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (error) console.error('listings fetch error:', error)
        setListings(data ?? [])
        setLoading(false)
      })
  }, [refreshKey])

  return { listings, loading, setListings }
}

function useMyListings(user, refreshKey) {
  const [myListings, setMyListings] = useState([])
  const [loading, setLoading]       = useState(false)

  useEffect(() => {
    if (!user) { setMyListings([]); return }
    setLoading(true)
    supabase
      .from('marketplace_listings')
      .select(`
        id, coin_id, is_golden, card_level, price, listed_at, status,
        coinz:coin_id ( id, NAME, TICKER, "IMAGE URL" )
      `)
      .eq('seller_id', user.id)
      .in('status', [STATUS_ACTIVE, STATUS_SOLD])
      .order('listed_at', { ascending: false })
      .limit(30)
      .then(({ data }) => {
        setMyListings(data ?? [])
        setLoading(false)
      })
  }, [user?.id, refreshKey]) // eslint-disable-line react-hooks/exhaustive-deps

  return { myListings, loading }
}

// ── List Card Modal ──────────────────────────────────────────────────────────
function ListModal({ collection, onClose, onConfirm }) {
  const [selectedCard, setSelectedCard] = useState(null)
  const [price, setPrice]               = useState('')
  const [submitting, setSubmitting]     = useState(false)
  const [error, setError]               = useState('')

  const available = useMemo(
    () => collection.filter(c => !c.listing_id && c.coin),
    [collection]
  )

  async function handleSubmit() {
    if (!selectedCard || !price || Number(price) <= 0) {
      setError('Select a card and enter a valid price')
      return
    }
    setSubmitting(true)
    setError('')
    await onConfirm(selectedCard, Number(price))
    setSubmitting(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-title">// LIST CARD FOR SALE //</div>

        <div className="list-modal-grid">
          {available.length === 0 ? (
            <div className="empty-text">No cards available to list</div>
          ) : (
            available.slice(0, 24).map(card => (
              <div
                key={card.id}
                className={`list-card-item${selectedCard?.id === card.id ? ' selected' : ''}`}
                onClick={() => setSelectedCard(card)}
              >
                <div className="lci-ticker">${card.coin['TICKER']}</div>
                <div className="lci-rarity">{rarityLabel(card.rarity)}</div>
              </div>
            ))
          )}
        </div>

        {selectedCard && (
          <div className="list-modal-selected">
            <span>Selected: </span>
            <strong>${selectedCard.coin['TICKER']}</strong>
            <span> · {rarityLabel(selectedCard.rarity)}</span>
          </div>
        )}

        <div className="list-modal-price-row">
          <label className="list-price-label">PRICE ($RIPZ):</label>
          <input
            type="number"
            min="1"
            step="1"
            className="list-price-input"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="e.g. 150"
          />
        </div>

        {error && <div className="modal-error">{error}</div>}

        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={onClose}>CANCEL</button>
          <button
            className="modal-btn-confirm"
            onClick={handleSubmit}
            disabled={!selectedCard || !price || submitting}
          >
            {submitting ? 'LISTING...' : 'LIST FOR SALE'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Buy Confirm Modal ────────────────────────────────────────────────────────
function BuyModal({ listing, ripzBalance, onClose, onConfirm }) {
  const [submitting, setSubmitting] = useState(false)
  const canAfford = ripzBalance >= listing.price

  async function handleBuy() {
    setSubmitting(true)
    await onConfirm(listing)
    setSubmitting(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-title">// CONFIRM PURCHASE //</div>
        <div className="buy-modal-info">
          <div className="buy-coin-name">{listing.coinz?.['NAME'] ?? '?'}</div>
          <div className="buy-coin-ticker">${listing.coinz?.['TICKER'] ?? '?'}</div>
          <div className="buy-rarity">{rarityLabel(listing.is_golden ? `GOLDEN_${listing.rarity ?? 'COMMON'}` : (listing.rarity ?? 'COMMON'))}</div>
          <div className="buy-price-row">
            <span>Price:</span>
            <strong className="buy-price-val">{listing.price} $RIPZ</strong>
          </div>
          <div className="buy-balance-row">
            <span>Your balance:</span>
            <span className={canAfford ? 'positive' : 'negative'}>{ripzBalance.toFixed(0)} $RIPZ</span>
          </div>
          {!canAfford && (
            <div className="modal-error">Insufficient $RIPZ balance</div>
          )}
        </div>
        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={onClose}>CANCEL</button>
          <button
            className="modal-btn-confirm"
            onClick={handleBuy}
            disabled={!canAfford || submitting}
          >
            {submitting ? 'BUYING...' : 'CONFIRM BUY'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Marketplace Component ────────────────────────────────────────────────
export default function Marketplace({ user, ripzBalance, earnRipz, spendRipz, collection, listCard, unlistCard, removeListedCard, receiveCard, showNotif }) {
  const [marketTab, setMarketTab]   = useState('browse')
  const [refreshKey, setRefreshKey] = useState(0)
  const [showListModal, setShowListModal]   = useState(false)
  const [buyTarget, setBuyTarget]           = useState(null)
  const [filterRarity, setFilterRarity]     = useState('ALL')
  const [sortBy, setSortBy]                 = useState('newest')

  const { listings, loading }     = useListings(refreshKey)
  const { myListings }            = useMyListings(user, refreshKey)

  function refresh() { setRefreshKey(k => k + 1) }

  // ── List a card ─────────────────────────────────────────────────────────
  async function handleListCard(card, price) {
    if (!user) return

    const isGolden = card.rarity.startsWith('GOLDEN_')
    const base     = isGolden ? card.rarity.replace('GOLDEN_', '') : card.rarity
    const level    = Math.min(10, Math.ceil((card.count ?? 1) / 3))

    const { data, error } = await supabase
      .from('marketplace_listings')
      .insert({
        seller_id:  user.id,
        coin_id:    card.coin.id,
        is_golden:  isGolden,
        rarity:     base,
        card_level: level,
        price,
        status:     STATUS_ACTIVE,
      })
      .select('id')
      .single()

    if (error) {
      console.error('listing error:', error)
      showNotif?.('Failed to list card')
      return
    }

    // Mark card as listed in user's collection
    listCard?.(card.coin.id, isGolden, data.id)
    setShowListModal(false)
    refresh()
    showNotif?.(`Listed $${card.coin['TICKER']} for ${price} $RIPZ`)
  }

  // ── Cancel a listing ──────────────────────────────────────────────────────
  async function handleCancelListing(listingId) {
    if (!user) return
    const { error } = await supabase
      .from('marketplace_listings')
      .update({ status: STATUS_CANCELLED })
      .eq('id', listingId)
      .eq('seller_id', user.id)

    if (error) { console.error('cancel error:', error); return }
    unlistCard?.(listingId)
    refresh()
    showNotif?.('Listing cancelled')
  }

  // ── Buy a card ────────────────────────────────────────────────────────────
  async function handleBuy(listing) {
    if (!user || !listing) return
    if (listing.seller_id === user.id) {
      showNotif?.("You can't buy your own listing")
      return
    }

    // 1. Deduct from buyer
    const success = await spendRipz?.(listing.price)
    if (!success) {
      showNotif?.('Insufficient $RIPZ balance')
      return
    }

    // 2. Mark listing as sold
    const { error: updateError } = await supabase
      .from('marketplace_listings')
      .update({ status: STATUS_SOLD })
      .eq('id', listing.id)
      .eq('status', STATUS_ACTIVE)

    if (updateError) {
      console.error('buy update error:', updateError)
      // Refund buyer on failure
      await earnRipz?.(listing.price)
      showNotif?.('Purchase failed — refunded')
      return
    }

    // 3. Credit seller (95%)
    const sellerCut = Math.floor(listing.price * RIPZ_REWARDS.SELL_FEE)
    await supabase
      .from('user_ripz_balance')
      .select('balance')
      .eq('user_id', listing.seller_id)
      .maybeSingle()
      .then(async ({ data }) => {
        const newBal = (Number(data?.balance ?? 0)) + sellerCut
        await supabase
          .from('user_ripz_balance')
          .upsert({ user_id: listing.seller_id, balance: newBal, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
      })

    // 4. Remove card from seller's collection listing
    removeListedCard?.(listing.id)

    // 5. Add card to buyer's collection
    receiveCard?.(listing.coin_id, listing.is_golden)

    // 6. Record trade history
    await supabase.from('trade_history').insert({
      listing_id: listing.id,
      buyer_id:   user.id,
      seller_id:  listing.seller_id,
      coin_id:    listing.coin_id,
      is_golden:  listing.is_golden,
      price:      listing.price,
    })

    setBuyTarget(null)
    refresh()
    showNotif?.(`Bought $${listing.coinz?.['TICKER'] ?? '?'} for ${listing.price} $RIPZ!`)
  }

  // ── Filtered + sorted listings ────────────────────────────────────────────
  const displayListings = useMemo(() => {
    let list = listings.filter(l => l.seller_id !== user?.id)
    if (filterRarity !== 'ALL') {
      if (filterRarity === 'GOLDEN') {
        list = list.filter(l => l.is_golden)
      } else {
        list = list.filter(l => l.rarity === filterRarity)
      }
    }
    if (sortBy === 'price_asc')  list = [...list].sort((a, b) => a.price - b.price)
    if (sortBy === 'price_desc') list = [...list].sort((a, b) => b.price - a.price)
    if (sortBy === 'rarity') {
      list = [...list].sort((a, b) => {
        const ra = (a.is_golden ? 'GOLDEN_' : '') + (a.rarity ?? 'COMMON')
        const rb = (b.is_golden ? 'GOLDEN_' : '') + (b.rarity ?? 'COMMON')
        return RARITY_ORDER.indexOf(rb) - RARITY_ORDER.indexOf(ra)
      })
    }
    return list
  }, [listings, filterRarity, sortBy, user?.id])

  if (!user) {
    return (
      <div className="market-empty">
        <div className="empty-icon">🏪</div>
        <div className="empty-text">login to access the $RIPZ marketplace</div>
      </div>
    )
  }

  return (
    <div className="market-panel">

      {/* Balance + List button */}
      <div className="market-top-bar">
        <div className="market-balance">
          <span className="market-balance-label">BALANCE:</span>
          <span className="market-balance-val">{ripzBalance.toFixed(0)} $RIPZ</span>
        </div>
        <button className="market-list-btn" onClick={() => setShowListModal(true)}>
          + LIST A CARD
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="market-tabs">
        {[['browse', 'BROWSE'], ['my_listings', 'MY LISTINGS']].map(([id, label]) => (
          <button
            key={id}
            className={`market-tab-btn${marketTab === id ? ' active' : ''}`}
            onClick={() => setMarketTab(id)}
          >
            {label}
            {id === 'my_listings' && myListings.filter(l => l.status === STATUS_ACTIVE).length > 0 && (
              <span className="tab-badge">{myListings.filter(l => l.status === STATUS_ACTIVE).length}</span>
            )}
          </button>
        ))}
      </div>

      {marketTab === 'browse' && (
        <>
          {/* Filters */}
          <div className="market-filters">
            <div className="filter-row" style={{ marginBottom: '0.5rem' }}>
              {['ALL', 'COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'GOLDEN'].map(r => (
                <button
                  key={r}
                  className={`filter-btn${filterRarity === r ? ' active' : ''}`}
                  onClick={() => setFilterRarity(r)}
                >
                  {r === 'GOLDEN' ? '★ GOLDEN' : r}
                </button>
              ))}
            </div>
            <div className="market-sort-row">
              <span className="market-sort-label">SORT:</span>
              {[['newest','NEWEST'],['price_asc','$ LOW'],['price_desc','$ HIGH'],['rarity','RARITY']].map(([v, l]) => (
                <button
                  key={v}
                  className={`filter-btn${sortBy === v ? ' active' : ''}`}
                  onClick={() => setSortBy(v)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="market-loading">scanning listings…</div>
          ) : displayListings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏪</div>
              <div className="empty-text">
                {listings.length === 0
                  ? 'no active listings — be the first to list a card'
                  : 'no listings match this filter'}
              </div>
            </div>
          ) : (
            <div className="market-grid">
              {displayListings.map(listing => (
                <div key={listing.id} className={`market-listing rarity-${((listing.is_golden ? 'GOLDEN_' : '') + (listing.rarity ?? 'COMMON')).toLowerCase().replace('_', '-')}`}>
                  <div className="ml-rarity">{rarityLabel((listing.is_golden ? 'GOLDEN_' : '') + (listing.rarity ?? 'COMMON'))}</div>
                  <div className="ml-ticker">${listing.coinz?.['TICKER'] ?? '?'}</div>
                  <div className="ml-name">{listing.coinz?.['NAME'] ?? '?'}</div>
                  <div className="ml-level">LV{listing.card_level ?? 1}</div>
                  <div className="ml-price">{listing.price} $RIPZ</div>
                  <button
                    className="ml-buy-btn"
                    onClick={() => setBuyTarget(listing)}
                  >
                    BUY
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {marketTab === 'my_listings' && (
        <div className="my-listings-panel">
          {myListings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <div className="empty-text">you have no listings — click "+ LIST A CARD" to start selling</div>
            </div>
          ) : (
            <div className="my-listings-list">
              {myListings.map(listing => (
                <div key={listing.id} className={`my-listing-row status-${listing.status}`}>
                  <span className="myl-ticker">${listing.coinz?.['TICKER'] ?? '?'}</span>
                  <span className="myl-rarity">{rarityLabel((listing.is_golden ? 'GOLDEN_' : '') + (listing.rarity ?? 'COMMON'))}</span>
                  <span className="myl-price">{listing.price} $RIPZ</span>
                  <span className={`myl-status status-tag-${listing.status}`}>{listing.status.toUpperCase()}</span>
                  {listing.status === STATUS_ACTIVE && (
                    <button
                      className="myl-cancel-btn"
                      onClick={() => handleCancelListing(listing.id)}
                    >
                      CANCEL
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showListModal && (
        <ListModal
          collection={collection}
          onClose={() => setShowListModal(false)}
          onConfirm={handleListCard}
        />
      )}
      {buyTarget && (
        <BuyModal
          listing={buyTarget}
          ripzBalance={ripzBalance}
          onClose={() => setBuyTarget(null)}
          onConfirm={handleBuy}
        />
      )}
    </div>
  )
}
