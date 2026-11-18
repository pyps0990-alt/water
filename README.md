# 水電工程網站平台

React (Vite) + Tailwind CSS v4 + Firebase。規格見開發手冊 v1.0。

## Phase 1 內容
| 檔案 | 用途 |
|---|---|
| `src/index.css` | 品牌色票（手冊 §2.1）、16px／1.6 行高、`:focus-visible` |
| `src/lib/firebase.ts` | Firebase 初始化（`VITE_USE_EMULATORS=true` 時連本機模擬器） |
| `src/lib/source.ts` | 擷取 `?source=` 並在 session 中保留 |
| `src/types/models.ts` | Firestore 四個集合的型別與 6 階段狀態 |
| `firestore.rules` / `storage.rules` | 權限規則（見下） |
| `functions/src/index.ts` | `createCase`、`getCaseStatus`（asia-east1） |
| `legacy/` | 舊版 LIFF 報價單小幫手（保留參考） |

### 與手冊的差異
- **案件改由 `createCase` Function 建立**：前端不能直接寫 `cases`。Function 在同一個 transaction 中驗證欄位、檢查 `maxWeeklyCases`、配發 `WE-YYYYMMDD-NN`、累加 `schedules/{日期}.bookedCount`。
- 管理員白名單另外要求 `email_verified`。
- 照片上傳路徑 `case-uploads/{隨機ID}/`：只能新增、不可覆寫，僅限 webp/jpeg/png 且 < 5MB，只有管理員可讀。

## Phase 2 內容
- **客戶前台**（`src/pages/Home.tsx`）：服務分類頁籤、未承接項目、評論、證照、服務流程、30 天檔期表、場勘表單、進度查詢；手機底部有快捷列（預約／進度／檔期）。
- **照片**：瀏覽器端壓成 WebP（≤1600px、約 200KB），上傳到 `case-uploads/`；`createCase` 只接受真的存在的照片路徑（存在 `problemReport.photoPaths`）。
- **A4 列印引擎**（`src/print/`）：固定列高的分頁（`paginate.ts`）、每頁浮水印、騎縫章半圓定位在紙張邊緣中點。範例：`/print/demo?rows=30`。
- 公開頁面用 Firestore Lite，照片上傳與查詢功能按需載入；首頁 JS 約 138KB（gzip）。
- 未填 Firebase 網頁設定時，頁面以預設內容顯示，預約與查詢會提示暫停服務。

## 開發
```bash
cp .env.example .env.local   # 填入 Firebase Web 設定
npm install && (cd functions && npm install)
npm run emulators            # 本機模擬器
npm run dev
npm run test:rules           # 9 項權限規則測試
npm run test:functions       # createCase / getCaseStatus 煙霧測試
npm run test:unit            # 分頁與金額計算
```

## 上線前待辦
1. 在 `.firebaserc` 填入專案 ID。
2. 在 `firestore.rules`、`storage.rules` 換成真正的管理員 Gmail。
3. 建立 `system_settings/global`（`scripts/seed-settings.json` 是範本）。
4. `npm run build && npx firebase deploy`
