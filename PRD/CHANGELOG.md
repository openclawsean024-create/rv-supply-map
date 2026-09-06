# Changelog

> 主要版本紀錄。細部 patch 請見 git history。

## v3.0.2 — 規格書 + E2E 對齊 RV Supply Map + GHA workflow 升級（2026-09-06 by Sean 10-repo-fleet Worker）

對齊 SPEC v3.0 契約（§1–§19 全部套用），把原本「OpenPTT Web Sprint 1」規劃收斂成「RV 露營車供水供電地圖」規格書：

### 加入
- **`PRD/SPEC.md`**：9 章 v3.0.2 等級入口規格書（10KB）
  - §1 產品概述（問題陳述 / persona / 價值主張 / Non-Goals）
  - §2 使用者場景與流程（7 個主要場景 + mermaid 流程圖）
  - §3 功能需求（19 個 FR，P0/P1/P2 三層）
  - §4 Non-Functional Requirements
  - §5 技術架構（含 module map + 降級策略）
  - §6 Definition of Done
  - §7 部署契約（GitHub Pages）
  - §8 Out of Scope
  - §9 變更日誌（本檔連結）
- **`PRD/CHANGELOG.md`**：v3.0.2 變更日誌（本檔）
- **`.github/workflows/ci.yml`**：4-job CI（typecheck / vitest / vite build / Pages deploy）
- **`.gitignore`**：補上 dist/ node_modules/

### 修正
- **`web/README.md`**：標題從「OpenPTT Web — Sprint 1」改成「RV Supply Map · Sprint 1」，反映實際程式碼內容（`MapPage.tsx` / `spots.ts` 都是 RV 車泊地圖）。原本 README 與程式碼有 mismatch（README 說 PTT，code 是 RV）。
- **`web/tests/e2e.test.tsx`**：原本是針對 PTT 看板功能（boards / articles / vote / subscribe / pin / comments）寫的 16 個 test，但 app 實際是 RV supply map — 7 個 test 找不到對應 DOM。改寫成 19 個對齊 RV 車泊地圖實際功能的 test：
  - Sprint 1 — RV Supply Map 核心（地圖 + 5 kind 篩選 + 搜尋 + 詳情）
  - Sprint 2 — Kind 子頁面（/secret /campsite /charge /water）
  - Sprint 3 — 導覽列與路由（6 個 nav item + 路由跳轉）
  - Sprint 4 — 資料完整性（座標範圍 / rating / source / id 不重複）

### 保留不動
- `web/src/pages/MapPage.tsx`（240 行 RV 地圖主頁）
- `web/src/pages/KindPage.tsx`（kind 子頁）
- `web/src/pages/CheckinPage.tsx`（打卡頁）
- `web/src/data/spots.ts`（30+ 真實據點）
- `web/src/components/Layout.tsx`（側欄 + drawer）
- `web/src/lib/`（createStore / favorites / theme / db / useFavorites）
- `web/src/data/boards.ts`（歷史 PTT 看板 mock data，未使用但保留）
- `web/public/dashboard.html`（307 行公開靜態站）
- `web/vite.config.ts`（base: /rv-supply-map/）
- `web/tsconfig.json`（strict）
- `web/vitest.config.ts`

### 驗證結果

| 檢查 | 結果 |
|---|---|
| `npm install --legacy-peer-deps` | ✅ 196 packages |
| `npm run typecheck` (tsc --noEmit strict) | ✅ 0 error |
| `npm test` (vitest) | ✅ **1 file / 19 tests** all pass (208ms) |
| `npm run build` (tsc + vite build) | ✅ dist/index.html 0.12KB + dist/dashboard.html 14.8KB |

### 升級動作
- 補：v3.0.2 SPEC.md（10KB）
- 補：v3.0.2 CHANGELOG.md
- 補：.github/workflows/ci.yml（4-job Pages deploy）
- 補：.gitignore
- 修：web/README.md（修正 OpenPTT → RV Supply Map）
- 修：web/tests/e2e.test.tsx（19 個對齊實際 RV 功能）

---

## v0.1.0 — Sprint 1 初版（2026-08 by Sean + Hermes Agent）

> 原 README 標題為「OpenPTT Web — Sprint 1」（誤標，實際程式碼是 RV 車泊地圖）

✅ 本機 dev server 可跑（Vite + React + TypeScript strict）
✅ 5 個看板 mock data（誤標，實為 30+ 車泊據點）
✅ 5 個 E2E 測試（誤對應 PTT 看板，實為 RV 地圖）

跳過驗收：
- ⚠️ Lighthouse Performance ≥ 90 — 本機跑，需手動驗證
- ⚠️ Vercel preview deploy — 改用 GitHub Pages
- ⚠️ Notion 同步 — 不在 scope
