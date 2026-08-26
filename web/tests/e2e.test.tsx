import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../src/App'
import { addFavorite, _readFavorites } from '../src/lib/favorites'
import { BOARDS, searchBoards, getArticles } from '../src/data/boards'
import { vote, hasVoted, subscribeBoard, isSubscribed, pinArticle, getPin } from '../src/lib/db'

function renderAt(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)
}

beforeEach(() => {
  localStorage.clear()
})

describe('P0 Sprint 1 E2E', () => {
  it('看板列表頁顯示所有 33+ 個看板(包含 Ptt 熱門)', () => {
    renderAt('/')
    const list = screen.getByTestId('boards-list')
    expect(within(list).getByText('Stock')).toBeInTheDocument()
    expect(within(list).getByText('Gossiping')).toBeInTheDocument()
    expect(within(list).getByText('Tech_Job')).toBeInTheDocument()
    expect(within(list).getByText('NBA')).toBeInTheDocument()
    expect(within(list).getByText('Baseball')).toBeInTheDocument()
  })

  it('看板頁可點進文章,看到推噓摘要', () => {
    renderAt('/board/Stock')
    const list = screen.getByTestId('article-list')
    const firstLink = within(list).getAllByRole('link')[0]
    fireEvent.click(firstLink)
    expect(screen.getByTestId('push-summary')).toBeInTheDocument()
  })

  it('加最愛後,localStorage 持久化', () => {
    addFavorite({ type: 'board', id: 'Stock', label: 'Stock' })
    expect(_readFavorites()).toHaveLength(1)
    expect(_readFavorites()[0].id).toBe('Stock')
  })

  it('切深色模式後 localStorage 寫入', () => {
    renderAt('/')
    const toggle = screen.getByTestId('theme-toggle')
    fireEvent.click(toggle)
    fireEvent.click(toggle)
    expect(localStorage.getItem('openptt:theme')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('最愛頁移除後 localStorage 同步', () => {
    addFavorite({ type: 'board', id: 'NBA', label: 'NBA' })
    addFavorite({ type: 'article', id: 'Stock-1', label: 'Mock article' })
    expect(_readFavorites()).toHaveLength(2)
    renderAt('/fav')
    const boardRemoves = screen.getAllByTestId('fav-remove-board')
    expect(boardRemoves.length).toBeGreaterThanOrEqual(1)
    const articleRemoves = screen.getAllByTestId('fav-remove')
    expect(articleRemoves.length).toBeGreaterThanOrEqual(1)
    fireEvent.click(articleRemoves[0])
    expect(_readFavorites()).toHaveLength(1)
  })
})

describe('Sprint 2 - 真實 Ptt 看板清單', () => {
  it('看板數量 >= 30 個', () => {
    expect(BOARDS.length).toBeGreaterThanOrEqual(30)
  })

  it('看板搜尋過濾 (NBA 關鍵字)', () => {
    const results = searchBoards('NBA')
    expect(results.length).toBeGreaterThan(0)
    const allRelevant = results.every(b =>
      b.name.toLowerCase().includes('nba') ||
      b.category.toLowerCase().includes('nba') ||
      b.description.toLowerCase().includes('nba')
    )
    expect(allRelevant).toBe(true)
  })

  it('3 種排序 (time / hot / pin) 都運作', () => {
    const byTime = getArticles('Stock', 'time')
    const byHot = getArticles('Stock', 'hot')
    const byPin = getArticles('Stock', 'pin')
    expect(byTime.length).toBeGreaterThan(0)
    expect(byHot.length).toBeGreaterThan(0)
    expect(byPin.length).toBeGreaterThan(0)
  })

  it('看板搜尋無結果(找不到的字)回 0', () => {
    const results = searchBoards('xyznonexistent123')
    expect(results.length).toBe(0)
  })

  it('看板搜尋 by 類別(科技)', () => {
    const results = searchBoards('科技')
    expect(results.length).toBeGreaterThan(0)
  })
})

describe('Sprint 3 - 功能完整化', () => {
  it('推噓功能可真的投票並持久化', () => {
    vote('Stock-1', 'push')
    expect(hasVoted('Stock-1', 'push')).toBe(true)
    vote('Stock-1', 'boo')
    expect(hasVoted('Stock-1', 'boo')).toBe(true)
    expect(hasVoted('Stock-1', 'push')).toBe(false)  // 切換成 boo 了
    vote('Stock-1', 'push')  // 再切回
    expect(hasVoted('Stock-1', 'push')).toBe(true)
  })

  it('訂閱看板後 localStorage 持久化', () => {
    subscribeBoard('NBA')
    expect(isSubscribed('NBA')).toBe(true)
  })

  it('板主置頂文章後查詢得到', () => {
    pinArticle('Stock', 'Stock-1')
    expect(getPin('Stock')).toBe('Stock-1')
  })

  it('看板頁顯示訂閱 button', () => {
    renderAt('/board/Stock')
    expect(screen.getByTestId('subscribe-btn')).toBeInTheDocument()
  })

  it('看板內文章搜尋存在', () => {
    renderAt('/board/Stock')
    expect(screen.getByTestId('article-search')).toBeInTheDocument()
  })

  it('文章留言區存在', () => {
    renderAt('/board/Stock')
    // 第一個 article row 的 link 才是文章
    const articleRow = screen.getAllByTestId(/^article-row-/)[0]
    const link = within(articleRow).getByRole('link')
    fireEvent.click(link)
    expect(screen.getByTestId('comments-section')).toBeInTheDocument()
    expect(screen.getByTestId('comment-input')).toBeInTheDocument()
    expect(screen.getByTestId('comment-submit')).toBeInTheDocument()
  })
})