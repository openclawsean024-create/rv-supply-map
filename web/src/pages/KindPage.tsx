import { SPOTS, KIND_LABEL, type Spot, type SpotKind } from '../data/spots'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'

export default function KindPage({ kind }: { kind: SpotKind }) {
  const meta = KIND_LABEL[kind]
  const items: Spot[] = useMemo(() => SPOTS.filter(s => s.kind === kind), [kind])

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <span className="text-3xl">{meta.icon}</span>
          {meta.label}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          共 {items.length} 個據點
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}>
          目前沒有據點
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3" data-testid="kind-list">
          {items.map(spot => (
            <div
              key={spot.id}
              className="rounded-2xl p-4"
              style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}
              data-testid={`kind-card-${spot.id}`}
            >
              <div className="flex items-start gap-3 mb-2">
                <span
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: meta.color + '20' }}
                >
                  {meta.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base truncate" style={{ color: 'var(--text-primary)' }}>
                    {spot.name}
                  </h3>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {spot.area} · {'⭐'.repeat(spot.rating)}
                  </div>
                </div>
              </div>
              <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                {spot.description}
              </p>
              <div className="flex gap-1.5 text-xs flex-wrap">
                {spot.hasWater && (
                  <span className="px-2 py-0.5 rounded" style={{ backgroundColor: '#E0F2FE', color: '#0288D1' }}>💧 水</span>
                )}
                {spot.hasPower && (
                  <span className="px-2 py-0.5 rounded" style={{ backgroundColor: '#FFF3E0', color: '#E65100' }}>⚡ 電</span>
                )}
                {spot.isFree && (
                  <span className="px-2 py-0.5 rounded" style={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}>免費</span>
                )}
                {spot.isLegal && (
                  <span className="px-2 py-0.5 rounded" style={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}>合法</span>
                )}
              </div>
              <div className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                打卡 {spot.checkins} 次 · 來源 {spot.source}
              </div>
              <Link
                to="/"
                className="mt-2 inline-block text-xs"
                style={{ color: 'var(--accent)' }}
              >
                在地圖查看 →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}