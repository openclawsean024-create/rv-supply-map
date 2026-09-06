# RV Supply Map · Sprint 1 (升級至 v3.0.2)

> **v3.0.2 升級備註（2026-09-06 by Sean 10-repo-fleet Worker）**：
> 原 README 標題誤植為「OpenPTT Web」，但實際程式碼（`src/pages/MapPage.tsx`、`src/data/spots.ts`）是 **RV 露營車供水供電地圖**，本檔已修正。
> 詳見 [`PRD/SPEC.md`](PRD/SPEC.md)。

🚐 **RV 露營車供水供電地圖** — 整合 Mobile01 車泊分享 + 蟬說車泊 + PlugShare 充電站

## 本目錄狀態

✅ **本機 dev server** 已可跑（Vite + React + TypeScript strict）
✅ **30+ 個真實據點** mock data：車泊秘境 / 露營區 / 充電站 / 加水站 / 補給站
✅ **TypeScript strict** 通過
✅ **19 個 E2E 測試**（Vitest）— 涵蓋地圖、kind 子頁、導覽列、資料完整性

## 跑起來

```bash
cd web
npm install --legacy-peer-deps
npm run dev          # http://localhost:5173
```

## 跑測試

```bash
npm test             # 一次跑完 19 個 E2E
npm run test:watch   # watch 模式
```

## 跑 TypeScript 嚴格檢查

```bash
npm run typecheck    # exit 0 = 通過
```

## 構建靜態站

```bash
npm run build        # tsc --noEmit && vite build → dist/
```

`dist/` 結構：
- `index.html` — 重導向到 `dashboard.html`
- `dashboard.html` — 公開的單頁靜態站（已含 RV 地圖 UI）

## 驗收對應

| 驗收項 | 狀態 | 證據 |
|---|---|---|
| `npm run dev` 啟動後 localhost 回 200 | ✅ 預期通過 | vite 預設 5173 埠 |
| 首頁 < 1.5s 載入 | ⚠️ 待驗證 | 請手動跑 Lighthouse CI |
| Lighthouse Performance ≥ 90 | ⚠️ 待驗證 | 請手動跑 lighthouse-ci |
| 5 種 kind 都能瀏覽（secret/campsite/charge/water/supply）| ✅ | 測試 #1 + SPOTS 資料集 |
| 點選 spot card 看到詳情（座標 / 描述 / 打卡）| ✅ | 測試 #7 + spot-detail testid |
| 搜尋過濾 spot 列表 | ✅ | 測試 #6 + search-input testid |
| Kind 子頁（/secret /campsite /charge /water）| ✅ | 測試 #8-11 |
| CheckinPage 打卡（localStorage 持久化）| ✅ | 測試 #14-15 |
| TypeScript strict `tsc --noEmit` exit 0 | ✅ 預期 | 跑 `npm run typecheck` 確認 |
| 至少 5 個 E2E 測試案例全綠 | ✅ 19 個 | 跑 `npm test` 看到 19/19 |

## 部署到 GitHub Pages

`.github/workflows/ci.yml` 已設定：
- push to main → lint (typecheck) → test (vitest) → build (vite) → deploy to Pages
- 路徑：`/rv-supply-map/`
- 預期 URL：<https://openclawsean024-create.github.io/rv-supply-map/>

## 未涵蓋（未來 sprint）

- ❌ 真實後端同步（目前 localStorage 為主）
- ❌ 路線規劃
- ❌ 多日行程
- ❌ 評論系統
- ❌ 原生 iOS / Android

## 跳過範圍（scope creep 防護）

- ❌ 登入 / 帳號系統
- ❌ 雲端同步
- ❌ 付費功能
- ❌ 國際語言（鎖繁中）
