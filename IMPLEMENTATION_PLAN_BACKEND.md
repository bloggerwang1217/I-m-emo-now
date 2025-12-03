# 情感追蹤應用 - API 上傳機制實現計劃

## 概述
將「I'm Emo Now」應用從完全本地儲存的 CSV 匯出方式改為實時 API 上傳機制。

---

## 用戶需求確認

| 需求 | 決策 |
|------|------|
| **用戶身份識別** | 無需註冊 - 每設備自動生成唯一 device_id |
| **影片存儲位置** | MongoDB GridFS（內置大檔案支持） |
| **離線支持** | 本地上傳隊列 + 自動重試機制 |
| **API 架構** | 分離式：先上傳元資料 → 再上傳影片 |

---

## 前端必須修改的檔案

### 1. 新增檔案
- `utils/device.ts` - Device ID 管理
- `utils/api.ts` - API 服務層
- `utils/uploadQueue.ts` - 上傳隊列管理

### 2. 修改檔案
- `utils/database.ts` - 新增 upload_queue 表格
- `app/(drawer)/index.tsx` - 修改提交流程
- `app/(drawer)/history.tsx` - 添加上傳狀態顯示
- `app/(drawer)/settings.tsx` - 隊列管理介面
- `app/_layout.tsx` - 上傳服務初始化
- `package.json` - 新增依賴

### 3. 資料庫修改
此處的資料庫修改主要分為前端和後端：
- **前端 (SQLite)**: 主要涉及 `upload_queue` 表格的建立與管理，用於處理離線時的資料暫存。
- **後端 (MongoDB)**: 後端資料庫的結構設計，請參考下方「MongoDB 設定」->「Collections 設計」章節中的 NoSQL schema。對應的 Pydantic 資料模型將在 `models/session.py` 中定義。

---

## 後端實現架構

### 項目結構
```
backend/
├── main.py                 # 應用入口
├── models/
│   ├── __init__.py
│   └── session.py         # MongoDB 模型
├── routes/
│   ├── __init__.py
│   ├── sessions.py        # API 路由
│   └── health.py          # 健康檢查
├── config.py              # 設定管理
├── requirements.txt
└── .env                   # 環境變量
```

### `main.py` 範例
```python
from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

# 從環境變數讀取 URI
MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = "im_emo_now"  # 建議資料庫名稱與專案相關

app = FastAPI()

@app.on_event("startup")
async def startup_db_client():
    if not MONGODB_URI:
        raise ValueError("MONGODB_URI environment variable not set!")
    app.mongodb_client = AsyncIOMotorClient(MONGODB_URI)
    app.mongodb = app.mongodb_client[DB_NAME]
    print(f"Connected to MongoDB database: {DB_NAME}")

@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()
    print("MongoDB connection closed.")

@app.get("/items")
async def get_items():
    # 這是一個測試端點，您可以根據您的 collection 調整
    # 例如：sessions = await app.mongodb["sessions"].find().to_list(100)
    items = await app.mongodb["items"].find().to_list(100)
    return items

@app.get("/")
async def root():
    return {"message": "Welcome to I'm Emo Now API"}
```

### API 端點
- `POST /api/sessions` - 建立會話
- `POST /api/sessions/{session_id}/video` - 上傳影片
- `GET /api/sessions/{device_id}` - 取得設備會話
- `GET /api/sessions/{session_id}/video` - 下載影片
- `GET /api/sessions/export` - 匯出 CSV
- `DELETE /api/sessions/{session_id}` - 刪除會話
- `GET /health` - 健康檢查

### Requirements
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
motor[srv]>=3.0.0,<4.0.0
python-dotenv==1.0.0
python-multipart==0.0.6
pydantic==2.5.0
```

---

## MongoDB 設定

### Collections 設計

這個集合 (Collection) 負責儲存每一次使用者「打卡」時的所有關聯資訊，除了影片檔案本身以外。

#### sessions 集合

| 欄位名稱 | 資料類型 | 說明 |
| :--- | :--- | :--- |
| **`_id`** | `ObjectId` | **MongoDB 自動產生**。這是這筆資料在資料庫中的唯一識別碼。 |
| **`session_id`** | `String` | **由前端 App 產生**。這是前端為該次操作產生的 UUID，用於確保前端和後端之間的請求是唯一的，方便追蹤和除錯。 |
| **`device_id`** | `String` | **由前端 App 產生**。用來識別提交資料的裝置，這是您用來區分不同使用者的關鍵。 |
| **`emotion_score`**| `Number` | **核心資料**。使用者選擇的情緒分數 (1-5)。 |
| **`location`** | `Object` | **地理位置**。建議儲存為 GeoJSON 格式的點，方便未來進行地理位置查詢。如果沒有位置資訊，此欄位可為 `null`。<br> ```json { "type": "Point", "coordinates": [longitude, latitude] } ``` |
| **`user_timestamp`**| `ISODate` | **使用者提交時間**。使用者在 App 中完成情緒打卡的時間點。儲存為日期格式，方便按時間排序和分析。 |
| **`video_id`** | `ObjectId` | **關聯影片的 ID**。當影片成功上傳到 GridFS 後，會得到一個 `_id`，將這個 `_id` 儲存在這裡，就可以將這筆會話資料與影片檔案關聯起來。 |
| **`created_at`** | `ISODate` | **伺服器記錄建立時間**。這筆資料在**伺服器端**被建立的時間。 |
| **`updated_at`** | `ISODate` | **伺服器記錄更新時間**。這筆資料在**伺服器端**最後被修改的時間。 |

##### 範例資料
```json
{
  "_id": ObjectId("6388b3c5e8b3e8b3e8b3e8b3"),
  "session_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "device_id": "fedcba09-8765-4321-0987-654321fedcba",
  "emotion_score": 4,
  "location": {
    "type": "Point",
    "coordinates": [121.5644, 25.0330]
  },
  "user_timestamp": ISODate("2025-12-01T10:00:00.000Z"),
  "video_id": ObjectId("6388b3d5e8b3e8b3e8b3e8b4"),
  "created_at": ISODate("2025-12-01T10:01:05.123Z"),
  "updated_at": ISODate("2025-12-01T10:01:05.123Z")
}
```

#### 索引建議
```javascript
db.sessions.createIndex({ "device_id": 1 })
db.sessions.createIndex({ "timestamp": -1 })
db.sessions.createIndex({ "device_id": 1, "timestamp": -1 })
db.sessions.createIndex({ "created_at": 1 }, { expireAfterSeconds: 7776000 })
```

#### GridFS（自動建立）
- fs.files - 影片元資料
- fs.chunks - 影片二進制資料

---

## MongoDB Atlas 快速設定

1. **建立帳戶**：https://www.mongodb.com/cloud/atlas
2. **創建免費叢集**：Shared (Free)
3. **創建用戶**：Database → Users → Add Database User
4. **設定網絡訪問**：Allow access from anywhere
5. **取得連接字符串**：Clusters → Connect → Drivers

連接字串格式：
```
mongodb+srv://emo_now:<password>@<cluster>.mongodb.net/emo_now
```

---

## 部署檢查清單

### MongoDB Atlas
- [ ] 帳戶已建立
- [ ] 免費叢集已建立
- [ ] 資料庫用戶已建立
- [ ] 網絡訪問已設定
- [ ] 連接字符串已保存

### 後端（Linode）
- [ ] 購買/設定伺服器
- [ ] 安裝 Python 3.10+
- [ ] 安裝依賴
- [ ] 設定防火牆（開啟 8000、443 端口）
- [ ] 使用 systemd 運行 FastAPI
- [ ] 設定 HTTPS (Let's Encrypt)
- [ ] 測試 MongoDB Atlas 連接

### 前端
- [ ] 設定 API 基礎 URL
- [ ] 測試上傳場景
- [ ] 測試離線重連
- [ ] 構建發佈版本

---

## 關鍵技術決策

### 為何分離元資料和影片上傳？
- 元資料快速上傳，影片在後台上傳
- 失敗時只需重試影片部分
- 用戶能立即看到數據

### 為何使用 GridFS？
- MongoDB 原生支持
- 不需額外文件服務
- 自動分塊處理大檔案

### 為何使用 device_id？
- 無需登錄，零摩擦體驗
- 適合研究應用
- 未來可升級為用戶認證

---

## 安全考慮

### 檔案驗證
- ✅ 限制檔案大小（50-100MB）
- ✅ 驗證檔案類型（MIME type）
- ✅ 檔案名稱消毒

### API 保護
- ✅ 配置 HTTPS
- ✅ 速率限制
- ⚠️ 無認證（研究用途）

### 資料隱私
- ✅ 使用 HTTPS 加密 GPS 資料
- ✅ 設定 TTL 索引（90 天自動刪除）
- ⚠️ 無認證機制

---

## 實現步驟

### Phase 1: 前端基礎（第 1-2 天）
1. Device ID 管理模組
2. API 服務層
3. 上傳隊列管理
4. 資料庫新增表格
5. 網絡監聽整合

### Phase 2: 前端 UI（第 2-3 天）
1. 修改提交流程
2. 修改歷史頁
3. 修改設定頁
4. 測試離線場景

### Phase 3: 後端開發（第 3-5 天）
1. FastAPI 專案初始化
2. MongoDB 連接
3. 會話路由
4. 影片上傳（GridFS）
5. Linode 部署

### Phase 4: 集成測試（第 5-6 天）
1. 前後端端對端測試
2. 離線/重連測試
3. 影片完整性驗證
4. 性能和安全檢查

---

## 下一步改進（Phase 2+）

1. **用戶認證** - 支持跨設備同步
2. **資料可視化** - 情感趨勢分析
3. **影片分享** - 社交媒體集成
4. **AI 分析** - 情感識別
5. **研究工具** - 批量匯出和統計
