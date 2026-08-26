import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SPOTS, KIND_LABEL, type Spot, type SpotKind } from '../data/spots'

const KIND_FILTERS: { kind: SpotKind | 'all'; label: string; icon: string }[] = [
  { kind: 'all', label: '全部', icon: '🌐' },
  { kind: 'secret', label: '車泊秘境', icon: '🌙' },
  { kind: 'campsite', label: '露營區', icon: '🏕️' },
  { kind: 'charge', label: '充電站', icon: '⚡' },
  { kind: 'water', label: '加水站', icon: '💧' },
]

// 台灣範圍(簡化座標邊界)
// 經度 120.0 - 122.0, 緯度 22.0 - 25.5
const TAIWAN_BOUNDS = { west: 120.0, east: 122.0, south: 21.5, north: 25.5 }

const CHECKIN_KEY = 'rv-supply-map:checkin'
const GPS_KEY = 'rv-supply-map:last-gps'

export default function MapPage() {
  const [filter, setFilter] = useState<SpotKind | 'all'>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Spot | null>(null)
  const [userGps, setUserGps] = useState<{ lat: number; lng: number } | null>(null)
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle')

  // load last GPS
  useEffect(() => {
    try {
      const raw = localStorage.getItem(GPS_KEY)
      if (raw) setUserGps(JSON.parse(raw))
    } catch {}
  }, [])

  // 過濾
  const filtered = useMemo(() => {
    let list = SPOTS
    if (filter !== 'all') list = list.filter(s => s.kind === filter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.area.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      )
    }
    return list
  }, [filter, search])

  // 座標 → SVG 座標
  const projectCoords = (lat: number, lng: number) => {
    const W = 800, H = 500
    const x = ((lng - TAIWAN_BOUNDS.west) / (TAIWAN_BOUNDS.east - TAIWAN_BOUNDS.west)) * W
    // 緯度反過來(北在上)
    const y = ((TAIWAN_BOUNDS.north - lat) / (TAIWAN_BOUNDS.north - TAIWAN_BOUNDS.south)) * H
    return { x, y }
  }

  // 取得 GPS
  const requestGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus('denied')
      return
    }
    setGpsStatus('requesting')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const gps = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserGps(gps)
        try { localStorage.setItem(GPS_KEY, JSON.stringify(gps)) } catch {}
        setGpsStatus('granted')
      },
      () => setGpsStatus('denied'),
      { timeout: 5000 }
    )
  }

  // 打卡
  const checkIn = (spotId: string) => {
    try {
      const raw = localStorage.getItem(CHECKIN_KEY)
      const list: { spotId: string; at: number; lat?: number; lng?: number }[] = raw ? JSON.parse(raw) : []
      list.push({ spotId, at: Date.now(), lat: userGps?.lat, lng: userGps?.lng })
      localStorage.setItem(CHECKIN_KEY, JSON.stringify(list))
      alert(`✅ 已在「${SPOTS.find(s => s.id === spotId)?.name}」打卡!`)
    } catch {}
  }

  return (
    <div className="max-w-7xl">
      {/* 招呼 */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          🚐 露營車供水供電地圖
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          整合 Mobile01 車泊分享 + 蟬說車泊 + PlugShare 充電站 · 共 {SPOTS.length} 個據點
        </p>
      </div>

      {/* 篩選列 */}
      <div
        className="rounded-2xl p-4 mb-4"
        style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex flex-wrap gap-2 mb-3" data-testid="kind-filters">
          {KIND_FILTERS.map(f => {
            const active = filter === f.kind
            const count = f.kind === 'all' ? SPOTS.length : SPOTS.filter(s => s.kind === f.kind).length
            return (
              <button
                key={f.kind}
                onClick={() => setFilter(f.kind)}
                className="px-3 py-1.5 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: active ? 'var(--bg-button-primary)' : 'var(--bg-soft)',
                  color: active ? '#fff' : 'var(--text-primary)',
                  border: active ? 'none' : '1px solid var(--border-default)',
                }}
                data-testid={`filter-${f.kind}`}
              >
                {f.icon} {f.label} ({count})
              </button>
            )
          })}
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="🔍 搜尋地點 / 縣市 / 描述..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 rounded text-sm border"
            style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
            data-testid="search-input"
          />
          <button
            onClick={requestGps}
            disabled={gpsStatus === 'requesting'}
            className="px-3 py-2 rounded text-sm font-medium disabled:opacity-50"
            style={{
              backgroundColor: userGps ? 'var(--accent-bg)' : 'var(--bg-button-primary)',
              color: userGps ? 'var(--accent)' : '#fff',
              border: userGps ? '1px solid var(--accent)' : 'none',
            }}
            data-testid="gps-btn"
          >
            {gpsStatus === 'requesting' ? '⏳ 定位中...' : userGps ? '📍 已定位' : '📍 取得 GPS'}
          </button>
        </div>
        {search && (
          <div className="mt-2 text-xs" style={{ color: 'var(--text-secondary)' }} data-testid="search-count">
            找到 {filtered.length} 個據點
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 地圖 */}
        <div
          className="lg:col-span-2 rounded-2xl p-4"
          style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}
        >
          <div
            className="relative w-full overflow-hidden rounded-xl"
            style={{ backgroundColor: '#DDEEFF', aspectRatio: '8/5' }}
            data-testid="map-svg"
          >
            <svg viewBox="0 0 800 500" className="w-full h-full">
              {/* 簡化台灣輪廓(島嶼形狀) */}
              <path
                d="M 320 60 L 380 80 L 400 110 L 420 130 L 440 140 L 460 160 L 470 200 L 460 230 L 440 270 L 410 310 L 380 350 L 350 400 L 320 430 L 300 450 L 280 440 L 270 410 L 290 380 L 310 340 L 320 300 L 340 260 L 350 230 L 360 200 L 360 170 L 350 140 L 340 110 L 330 80 Z"
                fill="#E8F0FE"
                stroke="#0288D1"
                strokeWidth="1.5"
                opacity="0.85"
              />
              {/* 基隆 */}
              <circle cx="445" cy="155" r="3" fill="#666" />
              {/* 高雄 */}
              <circle cx="350" cy="420" r="3" fill="#666" />
              {/* 台北 */}
              <text x="455" y="155" fontSize="11" fill="#333">台北</text>
              <text x="360" y="430" fontSize="11" fill="#333">高雄</text>

              {/* 用戶 GPS */}
              {userGps && (
                <g>
                  {(() => {
                    const { x, y } = projectCoords(userGps.lat, userGps.lng)
                    return (
                      <g>
                        <circle cx={x} cy={y} r="10" fill="#0288D1" opacity="0.3">
                          <animate attributeName="r" values="6;14;6" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                        </circle>
                        <circle cx={x} cy={y} r="5" fill="#0288D1" stroke="#fff" strokeWidth="2" />
                      </g>
                    )
                  })()}
                </g>
              )}

              {/* 景點標記 */}
              {filtered.map(spot => {
                const { x, y } = projectCoords(spot.coords[0], spot.coords[1])
                const meta = KIND_LABEL[spot.kind]
                const isSelected = selected?.id === spot.id
                return (
                  <g
                    key={spot.id}
                    onClick={() => setSelected(spot)}
                    style={{ cursor: 'pointer' }}
                    data-testid={`map-marker-${spot.id}`}
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 9 : 6}
                      fill={meta.color}
                      stroke="#fff"
                      strokeWidth={isSelected ? 2.5 : 1.5}
                    />
                    <text x={x} y={y + 2} fontSize="7" textAnchor="middle" fill="#fff" fontWeight="bold">
                      {meta.icon}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
          <div className="mt-2 text-xs flex items-center gap-3 flex-wrap" style={{ color: 'var(--text-muted)' }}>
            {Object.entries(KIND_LABEL).map(([k, v]) => (
              <span key={k} className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: v.color }} />
                {v.icon} {v.label}
              </span>
            ))}
          </div>
        </div>

        {/* 側欄列表 */}
        <div
          className="rounded-2xl p-4 lg:max-h-[600px] lg:overflow-y-auto"
          style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}
          data-testid="spot-list"
        >
          <h3 className="font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            據點清單 ({filtered.length})
          </h3>
          {filtered.length === 0 ? (
            <div className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
              沒有符合的據點
            </div>
          ) : (
            <ul className="space-y-2">
              {filtered.map(spot => {
                const meta = KIND_LABEL[spot.kind]
                return (
                  <li
                    key={spot.id}
                    onClick={() => setSelected(spot)}
                    className="rounded-xl p-3 cursor-pointer"
                    style={{
                      backgroundColor: selected?.id === spot.id ? 'var(--accent-bg)' : 'var(--bg-soft)',
                      border: selected?.id === spot.id ? '1px solid var(--accent)' : '1px solid var(--border-default)',
                    }}
                    data-testid={`spot-card-${spot.id}`}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: meta.color + '20' }}
                      >
                        {meta.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                          {spot.name}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {spot.area} · {'⭐'.repeat(spot.rating)}
                        </div>
                        <div className="flex gap-1 mt-1.5 text-xs flex-wrap">
                          {spot.hasWater && (
                            <span
                              className="px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: '#E0F2FE', color: '#0288D1' }}
                            >
                              💧 水
                            </span>
                          )}
                          {spot.hasPower && (
                            <span
                              className="px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: '#FFF3E0', color: '#E65100' }}
                            >
                              ⚡ 電
                            </span>
                          )}
                          {spot.isFree && (
                            <span
                              className="px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}
                            >
                              免費
                            </span>
                          )}
                          {spot.isLegal && (
                            <span
                              className="px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}
                            >
                              合法
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {/* 選中詳情 */}
      {selected && (
        <div
          className="mt-4 rounded-2xl p-5"
          style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}
          data-testid="spot-detail"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-2xl w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: KIND_LABEL[selected.kind].color + '20' }}
                >
                  {KIND_LABEL[selected.kind].icon}
                </span>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                    {selected.name}
                  </h3>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {selected.area} · {'⭐'.repeat(selected.rating)} · 打卡 {selected.checkins} 次
                  </div>
                </div>
              </div>
              <div className="mt-2 flex gap-2 flex-wrap text-xs">
                {selected.hasWater && (
                  <span className="px-2 py-0.5 rounded font-medium" style={{ backgroundColor: '#E0F2FE', color: '#0288D1' }}>💧 有水</span>
                )}
                {selected.hasPower && (
                  <span className="px-2 py-0.5 rounded font-medium" style={{ backgroundColor: '#FFF3E0', color: '#E65100' }}>⚡ 有電</span>
                )}
                <span className="px-2 py-0.5 rounded font-medium" style={{ backgroundColor: selected.isFree ? '#E8F5E9' : '#FFF3E0', color: selected.isFree ? '#2E7D32' : '#E65100' }}>
                  {selected.isFree ? '免費' : '收費'}
                </span>
                <span className="px-2 py-0.5 rounded font-medium" style={{ backgroundColor: selected.isLegal ? '#E8F5E9' : '#FFEBEE', color: selected.isLegal ? '#2E7D32' : '#C62828' }}>
                  {selected.isLegal ? '✓ 合法' : '⚠ 風險'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-xl w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--bg-soft)', color: 'var(--text-muted)' }}
              aria-label="close"
            >
              ×
            </button>
          </div>
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
            {selected.description}
          </p>
          <div className="text-xs mb-3 p-3 rounded" style={{ backgroundColor: '#FFF8E1', color: '#5D4037' }}>
            💡 <strong>備註:</strong> {selected.notes}
          </div>
          <div className="text-xs flex items-center justify-between flex-wrap gap-2" style={{ color: 'var(--text-muted)' }}>
            <div>
              📍 座標 {selected.coords[0].toFixed(4)}, {selected.coords[1].toFixed(4)} · 來源 {selected.source}
            </div>
            <button
              onClick={() => checkIn(selected.id)}
              disabled={!userGps}
              className="px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
              style={{ backgroundColor: 'var(--bg-button-primary)', color: '#fff' }}
              data-testid="checkin-btn"
            >
              {userGps ? '📍 在此打卡' : '需先取得 GPS'}
            </button>
          </div>
          <div className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            最後更新 {selected.lastUpdate} · 來源 {selected.source}
          </div>
        </div>
      )}

      {/* 統計資訊 */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
        {KIND_FILTERS.slice(1).map(f => {
          const count = SPOTS.filter(s => s.kind === f.kind).length
          return (
            <div
              key={f.kind}
              className="rounded-xl p-3 text-center"
              style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}
            >
              <div className="text-2xl">{f.icon}</div>
              <div className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{count}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.label}</div>
            </div>
          )
        })}
      </div>

      {/* 子頁面連結 */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
        {KIND_FILTERS.slice(1).map(f => (
          <Link
            key={f.kind}
            to={`/${f.kind === 'secret' ? 'secret' : f.kind === 'campsite' ? 'campsite' : f.kind}`}
            className="rounded-xl p-3 text-center"
            style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}
            data-testid={`link-${f.kind}`}
          >
            <div className="text-sm font-medium">
              查看 {f.label} ({SPOTS.filter(s => s.kind === f.kind).length}) →
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}