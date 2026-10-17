# AGENTS.md — SportBuddy

คู่มือสำหรับ AI agent ที่เข้ามาทำงานในโปรเจกต์นี้ (พนักงานใหม่ทุกคน อ่านไฟล์นี้ก่อนแตะโค้ดบรรทัดแรก)

SportBuddy คือแอปหาเพื่อนเล่นกีฬา/จัดกิจกรรมกีฬา ประกอบด้วย 2 โปรเจกต์ย่อยที่แยก process กันแต่คุยกันผ่าน REST API:

```
sportbuddy/
├── backend/   Node.js + Express API (MongoDB / Mongoose)
└── mobile/    React Native app (Expo, Android/iOS/Expo Go)
```

---

## 1. Tech Stack (เวอร์ชันจริง — อย่าเดา ให้เช็ค package.json เสมอถ้าไม่แน่ใจ)

### Backend (`/backend`)
- Node.js 18+ (runtime ของ backend เอง ไม่จำเป็นต้องตรงกับ mobile)
- Express 4.19
- MongoDB ผ่าน Mongoose 8.24
- jsonwebtoken 9.0 (JWT auth, Bearer token)
- bcryptjs 2.4 (hash รหัสผ่าน)
- multer 2.2 (upload รูปโปรไฟล์ → `backend/uploads/avatars`)
- cors 4.19, dotenv 16.4
- dev only: nodemon 3.1
- ติดตั้งไว้แต่ **ยังไม่ได้ต่อสายใช้งานจริง**: `express-validator` — ถ้าจะใช้ต้องเดินสาย middleware เอง อย่าสมมติว่ามันทำงานอยู่แล้ว

### Mobile (`/mobile`)
- React 19.1 + React Native 0.81.5
- **Expo SDK 54** (`~54.0.35`) — ดู "กฎเหล็ก" หัวข้อ Node version ด้านล่าง สำคัญมาก
- React Navigation 7 (`bottom-tabs`, `native`, `native-stack`)
- axios 1.18 (HTTP client เดียวที่ใช้ทั้งแอป — ห้ามใช้ `fetch` ตรงๆ)
- expo-image-picker, expo-location, expo-linear-gradient, expo-clipboard, react-native-maps, @react-native-community/datetimepicker, @react-native-async-storage/async-storage

ไม่มี TypeScript ในโปรเจกต์นี้ — ทั้ง backend และ mobile เป็น JavaScript (.js) ล้วน อย่าเปลี่ยนเป็น .ts/.tsx โดยไม่ถามผู้ใช้ก่อน

---

## 2. Project Map — ไฟล์ประเภทไหนอยู่ตรงไหน

### Backend

| อยู่ที่ | คืออะไร |
|---|---|
| `backend/server.js` | entrypoint, mount ทุก route, สั่ง connect DB แล้ว start reminder job |
| `backend/src/config/db.js` | เชื่อมต่อ MongoDB |
| `backend/src/models/*.js` | Mongoose schema เท่านั้น (User, Event, BuddyRequest, Message, Notification) |
| `backend/src/controllers/*.js` | logic ของแต่ละ route handler |
| `backend/src/routes/*.js` | Express router หนึ่งไฟล์ต่อหนึ่ง resource, mount ใน `server.js` |
| `backend/src/middleware/auth.js` | `protect` — ตรวจ JWT + โหลด `req.user` (มี logic เติม UID ให้ user เก่าด้วย ห้ามลบ) |
| `backend/src/middleware/upload.js` | multer config สำหรับ avatar upload |
| `backend/src/middleware/errorHandler.js` | error handler กลาง — ดูกฎเหล็กด้านล่างก่อนแก้ไฟล์นี้ |
| `backend/src/utils/notification.js` | **จุดเดียว** ที่สร้าง Notification ได้ ห้าม `Notification.create()` ตรงๆ จาก controller อื่น |
| `backend/src/jobs/eventReminderJob.js` | cron แบบ `setInterval`, เตือนกิจกรรมที่ใกล้เริ่ม |
| `backend/uploads/` | ไฟล์ที่ผู้ใช้อัปโหลด (avatar) — เป็น generated data ห้ามแก้มือ |

### Mobile

| อยู่ที่ | คืออะไร |
|---|---|
| `mobile/src/screens/*.js` | หนึ่งไฟล์ต่อหนึ่งหน้าจอเต็ม |
| `mobile/src/components/*.js` | UI ที่ใช้ซ้ำ (EventCard, BuddyCard, IconInput ฯลฯ) |
| `mobile/src/navigation/MainTabNavigator.js` | นิยาม 5 แท็บหลัก แต่ละแท็บ (ยกเว้น FindBuddy) ห่อด้วย native-stack ของตัวเอง |
| `mobile/src/api/*.js` | axios wrapper หนึ่งไฟล์ต่อหนึ่ง backend resource — ทุกฟังก์ชัน return `r.data` เสมอ |
| `mobile/src/context/AuthContext.js` | state ของ auth (user/token), persist ผ่าน AsyncStorage |
| `mobile/src/theme/colors.js` | **แหล่งความจริงเดียว** ของสีทั้งแอป (เขียวมรกต + เหลืองทอง) |
| `mobile/src/constants/options.js` | รายการ `SPORTS` / `SKILL_LEVELS` ที่เป็นทางการ — ทุกจุดที่เลือก/กรองกีฬาต้องใช้ list นี้ |

---

## 3. กฎเหล็ก / ขอบเขต (Boundaries) — ห้ามทำเด็ดขาด

1. **ห้าม commit secret ใดๆ** — `.env`, JWT_SECRET, connection string ที่มี credentials ต้องไม่ลงไปใน git
2. **Node version ของ mobile ต้องเป็น v20.x เท่านั้น** (ผ่าน `nvm use 20`) — โปรเจกต์นี้เคยพังเพราะ Node v24 เข้ากันไม่ได้กับ tooling ของ Expo SDK 54 ห้ามเปลี่ยนโดยไม่ถามผู้ใช้ก่อน (backend รันบน Node เวอร์ชันไหนก็ได้ ≥18 ไม่เกี่ยวกัน)
3. **ห้ามใส่ค่าสี hex ตรงๆ** ในไฟล์หน้าจอ/component — ต้อง import จาก `src/theme/colors.js` เสมอ สีเหลือง (`colors.cta`) สงวนไว้เฉพาะปุ่ม "commit" หลัก (เข้าร่วมแมตช์, เพิ่มเพื่อน, บันทึก) เท่านั้น ห้ามใช้กับปุ่มแก้ไข/ลบ/host action
4. **ห้ามสร้างช่องกรอกกีฬาแบบ free-text ใหม่** — ต้องใช้ `SPORTS` จาก `constants/options.js` เสมอ (เคยมีบั๊กกรองกีฬาไม่เจอเพราะ sport เป็น free-text มาก่อน)
5. **ห้ามสร้าง Notification ตรงจาก controller** — ต้องเรียกผ่านฟังก์ชันใน `backend/src/utils/notification.js` เท่านั้น เพื่อให้ข้อความ/รูปแบบการแจ้งเตือนอยู่จุดเดียว
6. **ห้ามแก้ logic การเติม UID อัตโนมัติ** ใน `middleware/auth.js` (self-heal สำหรับ user เก่าที่สมัครก่อนมีระบบ UID) เว้นแต่จะมี migration script รองรับแทน
7. **ห้ามแตะ `/node_modules` หรือ `/backend/uploads`** โดยตรง — เป็นของที่ generate/อัปโหลดมา ไม่ใช่ source code
8. **ห้ามลบ/ปิด test ที่พังเพื่อให้ผ่าน** — ต้องแก้โค้ดให้ test ผ่านจริง (ดูหัวข้อ Workflow — ตอนนี้ยังไม่มี automated test suite แต่กฎนี้บังคับใช้ทันทีที่มีการเพิ่ม test เข้ามา)
9. Backend กับ mobile คุยกันผ่าน REST เท่านั้น (`mobile/src/api/client.js` → `API_BASE_URL`) — ห้าม import โค้ด backend เข้ามาใน mobile หรือกลับกัน

---

## 4. Workflow การทำงาน

โปรเจกต์นี้ **ยังไม่มี automated test suite** (ไม่มี Jest ทั้งสองฝั่ง) ดังนั้นขั้นตอนตรวจสอบตัวเองก่อนบอกว่า "เสร็จ" คือ:

1. **Backend**: หลังแก้ไฟล์ใดใน `backend/`
   - รัน `node --check <ไฟล์>` กับทุกไฟล์ที่แก้
   - รัน module-resolution smoke test: `JWT_SECRET=test node -e "require('./src/...')"` เพื่อจับ error ตอน require (import วน, พิมพ์ผิด ฯลฯ)
2. **Mobile**: หลังแก้ไฟล์ใดใน `mobile/`
   - รัน syntax check ผ่าน `@babel/core` + `@babel/preset-react` กับทุกไฟล์ใน `mobile/src` และ `App.js`
   - **สำคัญ**: ต้องรันคำสั่งนี้จาก cwd = `mobile/` เท่านั้น ไม่งั้น babel จะหา `@babel/preset-react` ไม่เจอ (ดูรายละเอียดใน CLAUDE.md หัวข้อ Compound Engineering)
3. เมื่อมี dependency ใหม่ ให้แก้ `package.json` แล้ว **บอกผู้ใช้ให้รัน `npm install` (backend) หรือ `npx expo install <pkg>` (mobile) เอง** — อย่าพยายามรัน `npm install` เต็มรูปแบบใน sandbox เพราะ install ยาวๆ มักถูกตัดขาด/ไม่เสถียร ให้ verify ด้วย syntax/resolution check แทน
4. ถ้างานเกี่ยวกับ TDD ในอนาคต (เมื่อมี test suite แล้ว): **เขียน failing test ก่อนเสมอ แล้วค่อยเขียนโค้ดจริงให้ test ผ่าน** ห้ามเขียนโค้ดก่อนแล้วค่อยเขียน test ตามทีหลัง

### คำสั่งที่ใช้บ่อย

```bash
# Backend
cd backend
npm install
npm run dev      # nodemon, auto-restart
npm start        # production-style start

# Mobile
cd mobile
npm install                    # หรือ npx expo install <package>
npx expo start                 # แล้วสแกน QR ด้วย Expo Go
npm run android
npm run ios
```

ยังไม่มี script `lint` หรือ `test` ใน `package.json` ทั้งสองฝั่ง — อย่าอ้างอิงคำสั่งที่ไม่มีจริง ถ้าจำเป็นต้องเพิ่ม ให้เพิ่มแล้วบันทึกไว้ในไฟล์นี้ด้วย