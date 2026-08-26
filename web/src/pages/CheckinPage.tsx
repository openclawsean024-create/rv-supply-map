import { useState, useEffect } from 'react'
import { SPOTS } from '../data/spots'

const CHECKIN_KEY = 'rv-supply-map:checkin'
const GPS_KEY = 'rv-supply-map:last-gps'

interface Checkin {
  spotId: string
  at: number
  lat?: number
  lng?: number
}

export default function CheckinPage() {
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [userGps, setUserGps] = useState<{ lat: number; lng: number } | null>(null)
  const [spotId, setSpotId] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHECKIN_KEY)
      setCheckins(raw ? JSON.parse(raw) : [])
      const gps = localStorage.getItem(GPS_KEY)
      if (gps) setUserGps(JSON.parse(gps))
    } catch {}
  }, [])

  const requestGps = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const gps = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserGps(gps)
        try { localStorage.setItem(GPS_KEY, JSON.stringify(gps)) } catch {}
      },
      (err) => alert('GPS 定位失敗: ' + err.message),
      { timeout: 5000 }
    )
  }

  const submitCheckin = () => {
    if (!spotId) return
    const c: Checkin = {
      spotId,
      at: Date.now(),
      lat: userGps?.lat,
      lng: userGps?.lng,
    }
    const updated = [...checkins, c]
    setCheckins(updated)
    try { localStorage.setItem(CHECKIN_KEY, JSON.stringify(updated)) } catch {}
    setSpotId('')
    setNote('')
    alert('✅ 打卡成功!')
  }

  const clearAll = () => {
    if (!confirm('確定清除所有打卡紀錄?')) return
    setCheckins([])
    try { localStorage.removeItem(CHECKIN_KEY) } catch {}
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
        📍 即時打卡
      </h1>

      {/* GPS + 打卡 form */}
      <div
        className="rounded-2xl p-5 mb-4"
        style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}
      >
        <h2 className="font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          新增打卡
        </h2>

        <div className="flex gap-2 mb-3">
          <button
            onClick={requestGps}
            className="px-4 py-2 rounded text-sm font-medium"
            style={{
              backgroundColor: userGps ? 'var(--accent-bg)' : 'var(--bg-button-primary)',
              color: userGps ? 'var(--accent)' : '#fff',
              border: userGps ? '1px solid var(--accent)' : 'none',
            }}
            data-testid="checkin-gps"
          >
            {userGps ? '📍 已定位' : '📍 取得 GPS'}
          </button>
          {userGps && (
            <span className="text-xs self-center" style={{ color: 'var(--text-muted)' }}>
              {userGps.lat.toFixed(4)}, {userGps.lng.toFixed(4)}
            </span>
          )}
        </div>

        <select
          value={spotId}
          onChange={e => setSpotId(e.target.value)}
          className="w-full px-3 py-2 rounded text-sm border mb-3"
          style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
          data-testid="spot-select"
        >
          <option value="">選擇據點...</option>
          {SPOTS.map(s => (
            <option key={s.id} value={s.id}>
              {s.area} - {s.name}
            </option>
          ))}
        </select>

        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="即時現況備註(選填):例:週六午後人潮多、水龍頭正常、電力 110V 充足..."
          className="w-full px-3 py-2 rounded text-sm border mb-3"
          style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', minHeight: '60px' }}
          data-testid="checkin-note"
        />

        <button
          onClick={submitCheckin}
          disabled={!spotId}
          className="w-full px-4 py-3 rounded-lg text-sm font-bold disabled:opacity-50"
          style={{ backgroundColor: 'var(--bg-button-primary)', color: '#fff' }}
          data-testid="checkin-submit"
        >
          ✅ 送出
        </button>
        <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          💡 打卡資料只存在你的瀏覽器(localStorage),未來可加後端讓全車泊社群共享
        </p>
      </div>

      {/* 打卡歷史 */}
      <div
        className="rounded-2xl p-5"
        style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>
            我的打卡紀錄({checkins.length})
          </h2>
          {checkins.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs"
              style={{ color: 'var(--text-muted)' }}
              data-testid="clear-checkin"
            >
              清除全部
            </button>
          )}
        </div>
        {checkins.length === 0 ? (
          <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
            還沒有打卡紀錄
          </div>
        ) : (
          <ul className="space-y-2" data-testid="checkin-list">
            {[...checkins].reverse().map((c, i) => {
              const spot = SPOTS.find(s => s.id === c.spotId)
              return (
                <li
                  key={i}
                  className="rounded-xl p-3"
                  style={{ backgroundColor: 'var(--bg-soft)', border: '1px solid var(--border-default)' }}
                  data-testid={`checkin-item-${i}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xl">📍</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {spot?.name ?? c.spotId}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(c.at).toLocaleString('zh-Hant')}
                      </div>
                      {c.lat && (
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          GPS: {c.lat.toFixed(4)}, {c.lng?.toFixed(4)}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}