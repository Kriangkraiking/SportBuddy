# DEPLOY.md — SportBuddy (Backend บน Render + APK ด้วย EAS)

ลำดับที่ถูกต้อง: **1) MongoDB Atlas → 2) Backend บน Render → 3) สร้าง admin → 4) Google Maps key → 5) Build APK**
(ต้องได้ URL ของ backend ก่อน จึงจะ build APK ที่ใช้งานได้)

> ราคา/โควตาของแพ็กฟรีเปลี่ยนได้ ตรวจหน้า pricing ของ Render / MongoDB Atlas / Expo อีกครั้งก่อนเริ่ม

---

## 1. MongoDB Atlas (ฐานข้อมูล)

1. สมัคร https://www.mongodb.com/cloud/atlas → สร้าง Cluster แพ็กฟรี (M0) เลือกภูมิภาคใกล้ (เช่น Singapore)
2. **Database Access** → Add New Database User → ตั้ง username/password (ใช้ตัวอักษร+ตัวเลข หลีกเลี่ยงอักขระพิเศษ ถ้าใช้ต้อง URL-encode เช่น `@` = `%40`)
3. **Network Access** → Add IP Address → `0.0.0.0/0` (Render ไม่มี IP คงที่ในแพ็กฟรี)
4. **Database → Connect → Drivers** คัดลอก connection string หน้าตาแบบ
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/sportbuddy?retryWrites=true&w=majority`
   แทน `USER`/`PASSWORD` และ **ใส่ชื่อฐานข้อมูล `/sportbuddy`** ก่อน `?` (ถ้าไม่ใส่จะไปสร้างฐานข้อมูลชื่อ `test`)

## 2. Backend บน Render

### 2.1 เตรียมโค้ด
- Render ดึงโค้ดจาก GitHub — ต้อง **commit + push** โค้ด `backend/` ล่าสุดขึ้น repo ก่อน (ตอนนี้มีไฟล์ที่ยังไม่ commit เยอะ เช่น `backend/src/models/Review.js`, `facilityController.js`, `eventCleanupJob.js`)
- ห้าม push ไฟล์ `.env` (มีอยู่ใน `backend/.gitignore` แล้ว)

### 2.2 สร้าง Web Service
1. https://render.com → New → **Web Service** → เชื่อม GitHub → เลือก repo `SportBuddy`
2. ตั้งค่า:
   | ช่อง | ค่า |
   |---|---|
   | Name | `sportbuddy-api` (ได้ URL `https://sportbuddy-api.onrender.com`) |
   | Region | Singapore |
   | **Root Directory** | `backend` |
   | Runtime | Node |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Instance Type | Free (ทดลอง) หรือ Starter ขึ้นไป (ใช้จริง) |
3. **Environment Variables** (Advanced → Add):
   | Key | Value |
   |---|---|
   | `MONGO_URI` | connection string จากข้อ 1.4 |
   | `JWT_SECRET` | สตริงสุ่มยาวๆ (สร้างด้วย `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) |
   | `JWT_EXPIRES_IN` | `7d` |
   | `NODE_VERSION` | `20` |
   (ไม่ต้องตั้ง `PORT` — Render ตั้งให้เอง และโค้ดอ่าน `process.env.PORT` อยู่แล้ว)
4. **Health Check Path** = `/api/health`
5. กด Create Web Service รอ build เสร็จ แล้วเปิด `https://<ชื่อ>.onrender.com/api/health` ต้องได้ `{"status":"ok",...}`

### 2.3 ข้อจำกัดของแพ็กฟรี (สำคัญกับโปรเจกต์นี้)
- **เซิร์ฟเวอร์หลับเมื่อไม่มีคนใช้ ~15 นาที** ปลุกครั้งแรกช้า 30–60 วินาที และตอนหลับ job `eventReminderJob` (แจ้งเตือน 2 ชม.ก่อนเริ่ม) กับ `eventCleanupJob` (ลบกิจกรรมหลังจบ 5 นาที) จะไม่ทำงาน
  - ทางลด: ตั้ง https://uptimerobot.com ยิง `GET /api/health` ทุก 5 นาทีเพื่อไม่ให้หลับ — หรือใช้แพ็กเสียเงิน
- **ดิสก์ไม่ถาวร** รูปโปรไฟล์ใน `backend/uploads/` จะหายทุกครั้งที่ deploy/restart ทางแก้: เพิ่ม Persistent Disk (ต้องแพ็กเสียเงิน, mount ที่ `/opt/render/project/src/backend/uploads`) หรือย้ายไปเก็บที่ Cloudinary/S3 (ต้องแก้ `middleware/upload.js`)
- แอปตั้ง timeout request ไว้ 10 วินาที (`mobile/src/api/client.js`) คำขอแรกหลังเซิร์ฟเวอร์หลับอาจ timeout ให้กดลองใหม่

## 3. สร้างบัญชี admin (ครั้งเดียว)

ห้ามสร้าง/แก้ user ผ่าน Atlas/Compass โดยตรง (รหัสผ่านจะไม่ถูก hash — ดูบทเรียนข้อ 11 ใน CLAUDE.md) ให้รันสคริปต์จากเครื่องตัวเองโดยชี้ไป Atlas:

```bash
cd backend
# PowerShell
$env:MONGO_URI="mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/sportbuddy?retryWrites=true&w=majority"
node scripts/createAdmin.js you@example.com "ชื่อแอดมิน" "รหัสผ่านที่มีตัวพิมพ์ใหญ่1ตัว"
```
(อาร์กิวเมนต์ = อีเมล, ชื่อ, รหัสผ่าน; รหัสผ่านต้องยาว ≥ 6 และมีตัวพิมพ์ใหญ่ ≥ 1 ตัว) ถ้ามีบัญชีอยู่แล้วและแค่จะตั้งเป็น admin ใช้ `scripts/setAdmin.js` แทน — เสร็จแล้วปิด terminal เพื่อล้างตัวแปร `MONGO_URI`

## 4. Google Maps API key (แผนที่ใน APK)

Expo Go มี key ให้ในตัว แต่ APK จริงไม่มี ถ้าไม่ใส่หน้า "เลือกสถานที่" จะเป็นแผนที่ว่าง

1. https://console.cloud.google.com → สร้าง Project → **APIs & Services → Library** → เปิด **Maps SDK for Android**
2. **Credentials → Create credentials → API key**
3. (แนะนำ) Restrict key: Application restrictions = Android apps → ใส่ package `com.sportbuddy.app` + SHA-1 ของ keystore (ดูได้จาก `eas credentials`) และ API restrictions = Maps SDK for Android
4. แก้ `mobile/app.json` → `expo.android.config.googleMaps.apiKey` แทนค่า `YOUR_GOOGLE_MAPS_API_KEY`
   (Google บังคับให้ผูกบัตรเครดิตเพื่อเปิดใช้ แต่มีโควตาฟรีรายเดือนสำหรับ Maps SDK for Android)

## 5. Build APK

1. แก้ `mobile/eas.json` ทั้ง 2 profile: เปลี่ยน `EXPO_PUBLIC_API_URL` จาก `https://YOUR-SERVICE.onrender.com/api` เป็น URL จริงของคุณ (ต้องลงท้าย `/api`)
2. ใช้ Node 20 แล้วรัน:
   ```bash
   cd mobile
   npm install
   npm install -g eas-cli
   eas login            # บัญชี Expo (สมัครฟรีที่ expo.dev)
   eas build:configure  # ครั้งแรก ตอบ Yes ให้ผูกโปรเจกต์
   eas build -p android --profile preview
   ```
   (ครั้งแรก EAS จะถามให้สร้าง Android keystore ให้ — ตอบ Yes แล้วเก็บไว้ ห้ามทำหาย ไม่งั้นอัปเดตแอปเดิมไม่ได้)
3. รอ ~10–20 นาที จะได้ลิงก์ดาวน์โหลด `.apk` (ดูได้ที่ https://expo.dev → Projects → Builds) ส่งลิงก์ให้คนอื่นโหลดได้เลย
4. บนมือถือ: เปิดลิงก์ → ดาวน์โหลด → เปิดไฟล์ → อนุญาต "ติดตั้งจากแหล่งที่ไม่รู้จัก"

## 6. เช็กลิสต์หลังติดตั้ง
- [ ] สมัคร/ล็อกอินได้ (ถ้าเด้ง timeout = เซิร์ฟเวอร์ Render กำลังตื่น ลองใหม่)
- [ ] สร้างกิจกรรม + เลือกสถานที่บนแผนที่ได้ (แผนที่ขึ้น = Maps key ถูกต้อง)
- [ ] อัปโหลดรูปโปรไฟล์ได้ (และรู้ว่ารูปจะหายถ้าไม่มี Disk/Cloud storage)
- [ ] เว็บแอดมิน (`web/`) ต้องชี้ API ไป URL Render เช่นกัน — แก้ที่ `web/src/api/client.js`
