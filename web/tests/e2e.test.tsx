import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../src/App'
import { SPOTS, KIND_LABEL, type SpotKind } from '../src/data/spots'

function renderAt(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)
}

beforeEach(() => {
  localStorage.clear()
})

describe('Sprint 1 — RV Supply Map 核心', () => {
  it('首頁顯示地圖與所有 5 類據點總覽', () => {
    renderAt('/')
    expect(screen.getByTestId('map-svg')).toBeInTheDocument()
    expect(screen.getByTestId('spot-list')).toBeInTheDocument()
    // 全部按鈕存在
    expect(screen.getByTestId('filter-all')).toBeInTheDocument()
    expect(screen.getByTestId('filter-secret')).toBeInTheDocument()
    expect(screen.getByTestId('filter-campsite')).toBeInTheDocument()
    expect(screen.getByTestId('filter-charge')).toBeInTheDocument()
    expect(screen.getByTestId('filter-water')).toBeInTheDocument()
  })

  it('SPOTS 資料集 >= 20 個真實據點', () => {
    expect(SPOTS.length).toBeGreaterThanOrEqual(20)
  })

  it('KIND_LABEL 5 種分類齊全', () => {
    const kinds: SpotKind[] = ['secret', 'campsite', 'charge', 'water', 'supply']
    for (const k of kinds) {
      expect(KIND_LABEL[k]).toBeDefined()
      expect(KIND_LABEL[k].label).toBeTruthy()
      expect(KIND_LABEL[k].icon).toBeTruthy()
      expect(KIND_LABEL[k].color).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })

  it('每種 kind 至少 1 個 spot', () => {
    const kinds: SpotKind[] = ['secret', 'campsite', 'charge', 'water', 'supply']
    for (const k of kinds) {
      const count = SPOTS.filter(s => s.kind === k).length
      expect(count, `kind=${k}`).toBeGreaterThanOrEqual(1)
    }
  })

  it('篩選按鈕：點 secret 只剩車泊秘境', () => {
    renderAt('/')
    const btn = screen.getByTestId('filter-secret')
    fireEvent.click(btn)
    const expected = SPOTS.filter(s => s.kind === 'secret').length
    // 篩選後側欄 spot 數量會等於預期
    const list = screen.getByTestId('spot-list')
    const cards = within(list).getAllByTestId(/^spot-card-/)
    expect(cards.length).toBe(expected)
  })

  it('搜尋輸入會過濾 spot 列表', () => {
    renderAt('/')
    const input = screen.getByTestId('search-input')
    fireEvent.change(input, { target: { value: '台北' } })
    // 找到 N 個
    const counter = screen.getByTestId('search-count')
    const text = counter.textContent ?? ''
    const match = text.match(/找到 (\d+) 個據點/)
    expect(match).toBeTruthy()
    const n = Number(match![1])
    const expected = SPOTS.filter(s =>
      s.name.includes('台北') ||
      s.area.includes('台北') ||
      s.description.includes('台北')
    ).length
    expect(n).toBe(expected)
  })

  it('點 spot card 會顯示詳情', () => {
    renderAt('/')
    const firstCard = screen.getAllByTestId(/^spot-card-/)[0]
    fireEvent.click(firstCard)
    expect(screen.getByTestId('spot-detail')).toBeInTheDocument()
    // 詳情內有打卡按鈕（沒 GPS 時 disabled）
    const checkinBtn = screen.getByTestId('checkin-btn')
    expect(checkinBtn).toBeInTheDocument()
  })
})

describe('Sprint 2 — Kind 子頁面', () => {
  it('車泊秘境頁 (/secret) 顯示對應 kind 的 spot', () => {
    renderAt('/secret')
    const list = screen.getByTestId('kind-list')
    const cards = within(list).getAllByTestId(/^kind-card-/)
    const expected = SPOTS.filter(s => s.kind === 'secret').length
    expect(cards.length).toBe(expected)
  })

  it('露營區頁 (/campsite) 只顯示露營區', () => {
    renderAt('/campsite')
    const list = screen.getByTestId('kind-list')
    const cards = within(list).getAllByTestId(/^kind-card-/)
    const expected = SPOTS.filter(s => s.kind === 'campsite').length
    expect(cards.length).toBe(expected)
  })

  it('充電站頁 (/charge) 只顯示充電站', () => {
    renderAt('/charge')
    const list = screen.getByTestId('kind-list')
    const cards = within(list).getAllByTestId(/^kind-card-/)
    const expected = SPOTS.filter(s => s.kind === 'charge').length
    expect(cards.length).toBe(expected)
  })

  it('加水站頁 (/water) 只顯示加水站', () => {
    renderAt('/water')
    const list = screen.getByTestId('kind-list')
    const cards = within(list).getAllByTestId(/^kind-card-/)
    const expected = SPOTS.filter(s => s.kind === 'water').length
    expect(cards.length).toBe(expected)
  })
})

describe('Sprint 3 — 導覽列與路由', () => {
  it('側欄顯示 6 個導覽項目', () => {
    renderAt('/')
    expect(screen.getByTestId('nav-map')).toBeInTheDocument()
    expect(screen.getByTestId('nav-secret')).toBeInTheDocument()
    expect(screen.getByTestId('nav-campsite')).toBeInTheDocument()
    expect(screen.getByTestId('nav-charge')).toBeInTheDocument()
    expect(screen.getByTestId('nav-water')).toBeInTheDocument()
    expect(screen.getByTestId('nav-checkin')).toBeInTheDocument()
  })

  it('點 secret 連結會導到 /secret', () => {
    renderAt('/')
    const link = screen.getByTestId('nav-secret')
    fireEvent.click(link)
    expect(screen.getByTestId('kind-list')).toBeInTheDocument()
  })

  it('點 checkin 連結會導到 /checkin', () => {
    renderAt('/')
    const link = screen.getByTestId('nav-checkin')
    fireEvent.click(link)
    expect(screen.getByTestId('spot-select')).toBeInTheDocument()
    expect(screen.getByTestId('checkin-submit')).toBeInTheDocument()
  })

  it('CheckinPage 直接路由有 form 元素', () => {
    renderAt('/checkin')
    expect(screen.getByTestId('checkin-gps')).toBeInTheDocument()
    expect(screen.getByTestId('spot-select')).toBeInTheDocument()
    expect(screen.getByTestId('checkin-note')).toBeInTheDocument()
    expect(screen.getByTestId('checkin-submit')).toBeInTheDocument()
  })
})

describe('Sprint 4 — 資料完整性', () => {
  it('所有 spot 都有合法座標（台灣範圍）', () => {
    for (const s of SPOTS) {
      const [lat, lng] = s.coords
      expect(lat).toBeGreaterThanOrEqual(21.5)
      expect(lat).toBeLessThanOrEqual(25.5)
      expect(lng).toBeGreaterThanOrEqual(120.0)
      expect(lng).toBeLessThanOrEqual(122.0)
    }
  })

  it('所有 spot 都有 rating 1-5', () => {
    for (const s of SPOTS) {
      expect(s.rating).toBeGreaterThanOrEqual(1)
      expect(s.rating).toBeLessThanOrEqual(5)
    }
  })

  it('所有 spot 都有 source 標註', () => {
    const validSources = ['mobile01', 'chan-shuo', 'plugshare', 'gov']
    for (const s of SPOTS) {
      expect(validSources).toContain(s.source)
    }
  })

  it('id 不重複', () => {
    const ids = new Set(SPOTS.map(s => s.id))
    expect(ids.size).toBe(SPOTS.length)
  })
})
