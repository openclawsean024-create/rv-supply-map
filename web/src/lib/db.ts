// OpenPTT 全域狀態 store — 推噓 / 訂閱 / 板主置頂
import { create } from './createStore'

export interface PushVote { kind: 'push' | 'boo' | 'arrow'; articleId: string; at: number }
export interface BoardSubscription { board: string; subscribedAt: number }
export interface BoardPin { board: string; articleId: string; pinnedAt: number }

interface DB {
  // 用戶推噓紀錄
  votes: PushVote[]
  // 看板訂閱
  subscriptions: BoardSubscription[]
  // 板主手動置頂(可被推翻)
  pins: BoardPin[]
}

const KEY = 'openptt:db:v1'

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const p = JSON.parse(raw)
      if (p && Array.isArray(p.votes)) return p
    }
  } catch {}
  return { votes: [], subscriptions: [], pins: [] }
}

function save(db: DB) {
  try { localStorage.setItem(KEY, JSON.stringify(db)) } catch {}
}

export const useDB = create<DB>((set) => {
  // 初始化時讀取
  const initial = load()
  set(initial)

  return {
    votes: initial.votes,
    subscriptions: initial.subscriptions,
    pins: initial.pins,
  }
})

// Push / Boo / Arrow 動作(同一篇文章同一動作只算一次)
export function vote(articleId: string, kind: 'push' | 'boo' | 'arrow') {
  const db = load()
  // 已投票同 kind → 取消(同篇文章只能一個動作)
  if (db.votes.some(v => v.articleId === articleId && v.kind === kind)) {
    db.votes = db.votes.filter(v => !(v.articleId === articleId && v.kind === kind))
  } else {
    // 移除其他 kind,改成新 kind
    db.votes = db.votes.filter(v => v.articleId !== articleId)
    db.votes.push({ articleId, kind, at: Date.now() })
  }
  save(db)
  // notify store
  notifySubscribers()
  return db.votes
}

export function hasVoted(articleId: string, kind: 'push' | 'boo' | 'arrow'): boolean {
  const db = load()
  return db.votes.some(v => v.articleId === articleId && v.kind === kind)
}

export function voteDelta(articleId: string, basePushes: number, baseBoos: number, baseArrows: number) {
  const v = load().votes.find(x => x.articleId === articleId)
  let p = basePushes, b = baseBoos, a = baseArrows
  if (v) {
    if (v.kind === 'push') p += 1
    if (v.kind === 'boo') b += 1
    if (v.kind === 'arrow') a += 1
  }
  return { pushes: p, boos: b, arrows: a }
}

// 訂閱看板
export function subscribeBoard(board: string) {
  const db = load()
  if (db.subscriptions.some(s => s.board === board)) return
  db.subscriptions.push({ board, subscribedAt: Date.now() })
  save(db)
  notifySubscribers()
}

export function unsubscribeBoard(board: string) {
  const db = load()
  db.subscriptions = db.subscriptions.filter(s => s.board !== board)
  save(db)
  notifySubscribers()
}

export function isSubscribed(board: string): boolean {
  return load().subscriptions.some(s => s.board === board)
}

export function getSubscriptions(): BoardSubscription[] {
  return load().subscriptions
}

// 板主手動置頂(同一看板只能一個)
export function pinArticle(board: string, articleId: string) {
  const db = load()
  db.pins = db.pins.filter(p => p.board !== board)
  db.pins.push({ board, articleId, pinnedAt: Date.now() })
  save(db)
  notifySubscribers()
}

export function unpinArticle(board: string, articleId: string) {
  const db = load()
  db.pins = db.pins.filter(p => !(p.board === board && p.articleId === articleId))
  save(db)
  notifySubscribers()
}

export function getPin(board: string): string | undefined {
  return load().pins.find(p => p.board === board)?.articleId
}

// 簡易通知(store)
type L = () => void
const subs = new Set<L>()
export function subscribeDB(l: L) { subs.add(l); return () => { subs.delete(l) } }
function notifySubscribers() {
  subs.forEach(l => l())
}

// 當前用戶(預設 visitor,可改)
const USER_KEY = 'openptt:user'
export function getCurrentUser(): string {
  try { return localStorage.getItem(USER_KEY) || 'visitor' } catch { return 'visitor' }
}
export function setCurrentUser(name: string) {
  try { localStorage.setItem(USER_KEY, name) } catch {}
}