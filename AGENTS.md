# AGENTS.md — SportBuddy

คู่มือสำหรับ AI agent ที่เข้ามาทำงานในโปรเจกต์นี้ (พนักงานใหม่ทุกคน อ่านไฟล์นี้ก่อนแตะโค้ดบรรทัดแรก)

SportBuddy คือแอปหาเพื่อนเล่นกีฬา/จัดกิจกรรมกีฬา ประกอบด้วย 3 โปรเจกต์ย่อยที่แยก process กันแต่คุยกันผ่าน REST API:

```
sportbuddy/
├── backend/   Node.js + Express API (MongoDB / Mongoose)
├── mobile/    React Native app (Expo, Android/iOS/Expo Go)
└── web/       React + Vite admin panel (จัดการ user/facility ฝั่งแอดมิน)
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

### Web (`/web`)
- React 18.2 + react-dom 18.2 (JSX ธรรมดา ไฟล์ `.jsx`)
- Vite 5.2 (dev server + build), plugin `@vitejs/plugin-react`
- react-router-dom 6.30 (`BrowserRouter`/`Routes`/`Route`) — mount ใน `web/src/App.jsx`
- react-bootstrap 2.10 + bootstrap 5.3 (import CSS ตรงจาก `bootstrap/dist/css/bootstrap.min.css` ใน `main.jsx`) — คอมโพเนนต์ UI หลักของหน้าแอดมิน (Navbar, Table, Card, Spinner, Form, Button ฯลฯ)
- axios 1.19 — **มี api client กลางแล้วที่ `web/src/api/client.js`** (เทียบเท่า `mobile/src/api/client.js`) แนบ `Authorization: Bearer <token>` ให้อัตโนมัติจาก `web/src/utils/auth.js` และเด้งไป `/login` เองถ้าเจอ 401/403 — ห้ามเรียก `axios` ตรงๆ ใน page component อีก ให้เพิ่มฟังก์ชันใน `web/src/api/*.js` แทน (ตาม pattern เดียวกับ mobile)
- **ระบบ login/สิทธิ์แอดมัน**: `web/src/pages/Login.jsx` ใช้ endpoint `/api/auth/login` เดียวกับมือถือ (JWT เดียวกัน) แต่บล็อกถ้า `user.role !== 'admin'` — ไม่มี endpoint ให้ self-promote เป็น admin ได้ ต้องตั้ง `role: 'admin'` ให้ user เองผ่าน MongoDB โดยตรงเท่านั้น route `/` และ `/users` ถูกห่อด้วย `web/src/components/RequireAdmin.jsx` (เช็ค session ใน localStorage ผ่าน `web/src/utils/auth.js`)
- ESLint 8 (react/react-hooks/react-refresh plugins) ติดตั้งไว้เป็น devDependency + มี `.oxlintrc.json` (oxlint) อยู่คู่กันด้วย — **แต่ `npm run lint` ใน `web/package.json` รันไม่ผ่านจริง** เพราะไม่มีไฟล์ config ของ ESLint เลย (เช็คแล้ว: `ESLint couldn't find a configuration file`) ดูหัวข้อ Workflow ข้อ 3
- `@types/react`, `@types/react-dom` ติดตั้งไว้เป็น devDependency (ใช้เพื่อ editor intellisense เฉยๆ) **โปรเจกต์นี้ไม่ได้ใช้ TypeScript จริง** ไม่มีไฟล์ `.ts`/`.tsx` เลย
- ยังไม่มีธีมสีกลางแบบ `mobile/src/theme/colors.js` — ใช้สี default ของ Bootstrap (`text-primary`/`text-warning`/`bg-dark` ฯลฯ) ปนกับ hex ตรงๆ บางจุดใน `web/src/pages/styles/*.css` (เช่น `#ff5722`) และยังไม่ได้ปรับให้ตรงกับโทนสีเขียวมรกต+เหลืองทองที่ mobile ใช้

ไม่มี TypeScript ในโปรเจกต์นี้ — ทั้ง backend, mobile และ web เป็น JavaScript (.js/.jsx) ล้วน อย่าเปลี่ยนเป็น .ts/.tsx โดยไม่ถามผู้ใช้ก่อน

---

## 2. Project Map — ไฟล์ประเภทไหนอยู่ตรงไหน

### Backend

| อยู่ที่ | คืออะไร |
|---|---|
| `backend/server.js` | entrypoint, mount ทุก route, สั่ง connect DB แล้ว start reminder job |
| `backend/src/config/db.js` | เชื่อมต่อ MongoDB |
| `backend/src/models/*.js` | Mongoose schema เท่านั้น (User, Event, BuddyRequest, Message, Notification, Review, Swipe, Facility) |
| `backend/src/controllers/*.js` | logic ของแต่ละ route handler |
| `backend/src/routes/*.js` | Express router หนึ่งไฟล์ต่อหนึ่ง resource, mount ใน `server.js` |
| `backend/src/middleware/auth.js` | `protect` — ตรวจ JWT + โหลด `req.user` (มี logic เติม UID ให้ user เก่าด้วย ห้ามลบ) |
| `backend/src/middleware/upload.js` | multer config สำหรับ avatar upload |
| `backend/src/middleware/errorHandler.js` | error handler กลาง — ดูกฎเหล็กด้านล่างก่อนแก้ไฟล์นี้ |
| `backend/src/utils/notification.js` | **จุดเดียว** ที่สร้าง Notification ได้ ห้าม `Notification.create()` ตรงๆ จาก controller อื่น |
| `Event.pendingParticipants` (ใน `models/Event.js`) | **การเข้าร่วมกิจกรรมต้องรอ host อนุมัติเสมอ** — กด join (`POST /:id/join`) แค่ย้ายไปคิวนี้ก่อน ไม่กิน `maxParticipants` จนกว่า host จะกด `POST /:id/approve/:userId` ถึงย้ายไป `participants` จริงแล้วแจ้งเตือนผู้เล่น (`notifyEventJoinApproved`) — `POST /:id/decline/:userId` ปฏิเสธได้แต่ไม่แจ้งเตือน (ตาม pattern เดียวกับ `BuddyRequest` ที่แจ้งแค่ตอน accept) ปุ่ม "ออกจากแมตช์" ในแอปใช้ endpoint `/:id/leave` ตัวเดียวกันได้ทั้งยกเลิกคำขอที่รออยู่และออกจากกิจกรรมที่เข้าร่วมแล้ว |
| `User.blockedUsers` + `POST/DELETE /api/users/:id/block` | **Blacklist ผู้เล่น — เฉพาะผู้จัดเท่านั้น (บังคับที่ backend ใน `userController.blockUser`)**: ผู้สั่งต้องเป็น host ของกิจกรรมที่ผู้เล่นคนนั้นอยู่ใน `participants`/`pendingParticipants` จริง ไม่งั้น 403 — ผลคือผู้เล่นที่ถูกบล็อกขอเข้าร่วมกิจกรรมของ host คนนั้นไม่ได้อีก (เช็คใน `eventController.joinEvent`) ไม่กระทบกิจกรรมที่เข้าร่วมอยู่แล้ว ส่วน unblock ทำได้เสมอจากรายการของตัวเอง |
| `Review` + `POST /api/events/:id/reviews` | รีวิวหลังกิจกรรม `completed` เท่านั้น: host รีวิวได้เฉพาะผู้เล่นใน `participants` (ไม่รวมตัวเอง — host ถูกใส่เป็น `participants[0]` ตั้งแต่สร้างกิจกรรม ฝั่งแอปต้องกรอง host ออกจากรายชื่อที่ต้องรีวิวเสมอ) ผู้เล่นรีวิวได้เฉพาะ host ไม่มีรีวิวข้ามผู้เล่นด้วยกัน |
| `backend/src/jobs/eventReminderJob.js` | cron แบบ `setInterval` (เช็คทุก 5 นาที) แจ้งเตือน (`event_reminder`) host + ผู้เข้าร่วมที่ **อนุมัติแล้วทุกคน** ก่อนกิจกรรมเริ่ม **2 ชั่วโมง** (`REMINDER_WINDOW_MINUTES = 120`) ครั้งเดียวต่อกิจกรรม (`reminderSent`) — คนที่ยังรออนุมัติ (`pendingParticipants`) ไม่ได้รับ, แก้เวลากิจกรรมแล้ว `reminderSent` รีเซ็ตให้เตือนใหม่ |
| `backend/src/jobs/eventCleanupJob.js` | cron แบบ `setInterval` (เช็คทุก 1 นาที) ลบกิจกรรมที่ `status: 'completed'` มาเกิน 5 นาทีทิ้งถาวร (ให้เวลารีวิวกันก่อน) พร้อมลบแชทกลุ่มของกิจกรรมนั้นด้วย — **ตั้งใจไม่ลบ Review ที่เกิดขึ้นแล้วตาม** ปล่อยให้ `event` ใน Review เป็นค่าว่างไปแทน |
| `backend/uploads/` | ไฟล์ที่ผู้ใช้อัปโหลด (avatar) — เป็น generated data ห้ามแก้มือ |
| `backend/src/models/Facility.js`, `backend/src/controllers/facilityController.js`, `backend/src/routes/facilityRoutes.js` | Facility Management — CRUD สนาม **ฝั่งแอดมินเว็บเท่านั้น** ทุก endpoint (`/api/facilities`) ต้อง `protect` + `requireAdmin` ยังไม่เชื่อมกับแอปมือถือ/การสร้างกิจกรรม |
| `backend/scripts/*.js` | สคริปต์ one-off รันมือ ไม่ใช่ route (`createAdmin.js` สมัคร+ตั้ง admin, `setAdmin.js` ตั้ง role ให้ user เดิม, `resetPassword.js` ตั้งรหัสผ่านใหม่ผ่าน Mongoose `.save()` จริง — ห้ามแก้ user ผ่าน MongoDB GUI ตรงๆ ดูกฎเหล็กข้อ 11 ใน CLAUDE.md) |

### Mobile

| อยู่ที่ | คืออะไร |
|---|---|
| `mobile/src/screens/*.js` | หนึ่งไฟล์ต่อหนึ่งหน้าจอเต็ม |
| `mobile/src/components/*.js` | UI ที่ใช้ซ้ำ (EventCard, BuddyCard, IconInput ฯลฯ) |
| `mobile/src/navigation/MainTabNavigator.js` | นิยาม 5 แท็บหลัก แต่ละแท็บ (ยกเว้น FindBuddy) ห่อด้วย native-stack ของตัวเอง |
| `mobile/src/api/*.js` | axios wrapper หนึ่งไฟล์ต่อหนึ่ง backend resource — ทุกฟังก์ชัน return `r.data` เสมอ |
| `mobile/src/context/AuthContext.js` | state ของ auth (user/token), persist ผ่าน AsyncStorage |
| `mobile/src/theme/colors.js` | **แหล่งความจริงเดียว** ของสีทั้งแอป (ฟ้า + เหลือง + navy ตาม Figma) |
| `mobile/src/constants/options.js` | รายการ `SPORTS` / `SKILL_LEVELS` ที่เป็นทางการ — ทุกจุดที่เลือก/กรองกีฬาต้องใช้ list นี้ |

### Web

| อยู่ที่ | คืออะไร |
|---|---|
| `web/src/main.jsx` | entrypoint, mount `<App />`, import CSS ของ Bootstrap ที่นี่จุดเดียว |
| `web/src/App.jsx` | นิยาม route ทั้งหมดด้วย `react-router-dom` (`/login` เปิดได้ทุกคน, `/` และ `/users` ห่อด้วย `RequireAdmin`) |
| `web/src/pages/*.jsx` | หนึ่งไฟล์ต่อหนึ่งหน้าแอดมินเต็ม (`Homepage.jsx` = dashboard, `UserManagement.jsx` = ตาราง user, `Login.jsx` = หน้า login, `FacilityManagement.jsx` = ตาราง+ฟอร์ม CRUD สนาม) |
| `web/src/pages/styles/*.css` | CSS เฉพาะของแต่ละหน้า import ตรงในไฟล์ page นั้น |
| `web/src/components/RequireAdmin.jsx` | ห่อ route ที่ต้องเป็นแอดมินเท่านั้น เด้งไป `/login` ถ้าไม่ผ่าน |
| `web/src/api/*.js` | axios wrapper หนึ่งไฟล์ต่อหนึ่ง backend resource เหมือน mobile (`client.js` = instance กลาง, `auth.js` = login, `facilities.js` = CRUD สนาม) |
| `web/src/constants/options.js` | รายการ `SPORTS` สำหรับ dropdown ในฟอร์มจัดการสนาม — คนละไฟล์กับ `mobile/src/constants/options.js` (import ข้าม backend/mobile/web กันไม่ได้ ดูกฎเหล็กข้อ 9) ถ้าจะแก้รายการกีฬาต้องแก้ทั้งสองที่ |
| `web/src/utils/auth.js` | จัดการ session (user+token) ใน localStorage — `saveSession`/`clearSession`/`getToken`/`isAdmin` |
| `web/src/App.css`, `web/src/index.css` | เศษ CSS จาก Vite template ตอนสร้างโปรเจกต์ครั้งแรก `App.css` ไม่ได้ถูก import ใช้งานจริงแล้ว (dead code) |

---

## 3. กฎเหล็ก / ขอบเขต (Boundaries) — ห้ามทำเด็ดขาด

1. **ห้าม commit secret ใดๆ** — `.env`, JWT_SECRET, connection string ที่มี credentials ต้องไม่ลงไปใน git
2. **Node version ของ mobile ต้องเป็น v20.x เท่านั้น** (ผ่าน `nvm use 20`) — โปรเจกต์นี้เคยพังเพราะ Node v24 เข้ากันไม่ได้กับ tooling ของ Expo SDK 54 ห้ามเปลี่ยนโดยไม่ถามผู้ใช้ก่อน (backend รันบน Node เวอร์ชันไหนก็ได้ ≥18 ไม่เกี่ยวกัน)
3. **ห้ามใส่ค่าสี hex ตรงๆ** ในไฟล์หน้าจอ/component — ต้อง import จาก `src/theme/colors.js` เสมอ
   - ✏️ **อัปเดตทิศทางดีไซน์ (2026-10-17):** รีดีไซน์ mobile ทั้งแอปตาม Figma ของผู้ใช้ (file `7eIUC0gwGxqt4xqJo47KZX`, 22 หน้า + ชีต "ชุดองค์ประกอบ") — พาเลตต์ **ฟ้า+เหลือง+navy**: `primary` #4DA8DA (สีหลัก), `primaryDark` #2B7FB8 (สีเข้ม), `primaryLight` #E6F4FC (สีอ่อน), `cta` #FFD166 (สีการกระทำ), `text` #14213D, `ctaText` #12476B, `success` #3DBE8B, `danger` #EF5B5B, `background` #F5FAFE, `borderInput` #DDEBF4 — ค่าตรงกับชีต Figma ปรับได้ที่ `mobile/src/theme/colors.js` ไฟล์เดียว
   - **กฎ contrast/การใช้สีปัจจุบัน:** ชิป/แท็บที่ "เลือกแล้ว" ใช้พื้น `primaryDark` + ตัวหนังสือ `white`; ปุ่มรอง/ช่องค้นหา/ชิปทั่วไปใช้พื้น `primaryLight` หรือขาว + ตัวหนังสือ `ctaText`/`primaryDark`; พื้นฟ้า `primary` (bubble แชทของฉัน, ปุ่มหลักสีฟ้า) ใช้ตัวหนังสือ `white`; `colors.cta` (เหลือง) สงวนไว้เฉพาะปุ่ม "commit" หลัก (เข้าร่วมแมตช์, เพิ่มเพื่อน/ขอเป็นเพื่อน, บันทึก, เข้าสู่ระบบ/สมัคร, สร้างกิจกรรม, ยืนยันสถานที่, ♥ ในหน้าปัด) คู่กับ `ctaText` ห้ามใช้กับปุ่มแก้ไข/ลบ/host action
   - **ไอคอน:** ใช้ Lucide ตาม Figma ผ่าน `mobile/src/components/AppIcon.js` (API เดียวกับ Ionicons — `import Ionicons from '.../components/AppIcon'` ห้าม import `@expo/vector-icons` ตรงๆ ในหน้าจอ) ไอคอนกีฬามาจากฟิลด์ `icon` ใน `constants/options.js` (ชื่อ `sport-*`) — ลูกฟุตบอล/บาสเกตบอล/ลูกขนไก่-เทนนิสเป็น SVG ที่ export จาก Figma เก็บใน `constants/sportSvgs.js` ต้องติดตั้ง `lucide-react-native` + `react-native-svg` (`npx expo install react-native-svg` ให้ได้เวอร์ชันที่ตรงกับ SDK 54) ภาพประกอบหน้าว่างอยู่ที่ `mobile/assets/illustrations/`
   - **ฟอนต์:** Noto Sans Thai (`fonts.regular/medium/semiBold/bold/extraBold` ใน `theme/typography.js`) + Prompt SemiBold (`fonts.brand` ใช้กับโลโก้ "SportBuddy" เท่านั้น) — ต้อง `npm install` ใน `mobile/` ให้ได้ `@expo-google-fonts/noto-sans-thai` และ `@expo-google-fonts/prompt` ก่อนเปิดแอป
   - **โครงหน้าจอ:** ทุกหน้าหลักใช้ `components/SkyHeader.js` (header ไล่เฉดฟ้า + วงกลมตกแต่ง) ซ่อน header ของ native-stack ใน `MainTabNavigator.js` (`headerShown: false`) ยกเว้นหน้าแชทกลุ่มที่ Figma ใช้ header ขาว; แท็บล่างมีป้ายชื่อทุกแท็บ แท็บที่เลือกมีกรอบไอคอน `primaryDark` + ขีดบ่งชี้ `primary`
   - **ช่องว่างที่ Figma มีแต่ backend ยังไม่รองรับ (ยังไม่ได้ทำ):** แชทส่วนตัว (ปุ่ม "เริ่มแชทกับ…"/"เปิดแชท" ใน modal จับคู่สำเร็จและหน้ารายชื่อเพื่อน), % เข้ากันได้/อายุ/ระยะทางบนการ์ดปัด, สถานะออนไลน์ของเพื่อน, เวลาเริ่ม-สิ้นสุดของกิจกรรม (มีแค่ `dateTime`)
4. **ห้ามสร้างช่องกรอกกีฬาแบบ free-text ใหม่** — ต้องใช้ `SPORTS` จาก `constants/options.js` เสมอ (เคยมีบั๊กกรองกีฬาไม่เจอเพราะ sport เป็น free-text มาก่อน)
5. **ห้ามสร้าง Notification ตรงจาก controller** — ต้องเรียกผ่านฟังก์ชันใน `backend/src/utils/notification.js` เท่านั้น เพื่อให้ข้อความ/รูปแบบการแจ้งเตือนอยู่จุดเดียว
6. **ห้ามแก้ logic การเติม UID อัตโนมัติ** ใน `middleware/auth.js` (self-heal สำหรับ user เก่าที่สมัครก่อนมีระบบ UID) เว้นแต่จะมี migration script รองรับแทน
7. **ห้ามแตะ `/node_modules` หรือ `/backend/uploads`** โดยตรง — เป็นของที่ generate/อัปโหลดมา ไม่ใช่ source code
8. **ห้ามลบ/ปิด test ที่พังเพื่อให้ผ่าน** — ต้องแก้โค้ดให้ test ผ่านจริง (ดูหัวข้อ Workflow — ตอนนี้ยังไม่มี automated test suite แต่กฎนี้บังคับใช้ทันทีที่มีการเพิ่ม test เข้ามา)
9. Backend กับ mobile/web คุยกันผ่าน REST เท่านั้น (`mobile/src/api/client.js` และ `web/src/api/client.js` ต่างก็เป็น axios instance กลางของฝั่งตัวเอง) — ห้าม import โค้ด backend เข้ามาใน mobile/web หรือกลับกัน
10. **ห้ามสร้าง endpoint ให้ user self-promote เป็น admin ได้เด็ดขาด** — `role: 'admin'` ใน `User` model ต้องตั้งผ่าน MongoDB โดยตรงเท่านั้น (ดู `backend/src/middleware/admin.js`) endpoint ที่ต้องเป็นแอดมินเท่านั้น (`GET /api/users`, `DELETE /api/users/:id`, `PUT /api/users/admin/:id`, `GET /api/dashboard`, ทุกเส้นทางใน `/api/facilities`) ต้องมีทั้ง `protect` และ `requireAdmin` เสมอ ห้ามมีเส้นทางไหนไม่มี auth เลยแบบที่เคยเป็นมาก่อน

---

## 4. Workflow การทำงาน

โปรเจกต์นี้ **ยังไม่มี automated test suite** (ไม่มี Jest ทั้งสามฝั่ง) ดังนั้นขั้นตอนตรวจสอบตัวเองก่อนบอกว่า "เสร็จ" คือ:

1. **Backend**: หลังแก้ไฟล์ใดใน `backend/`
   - รัน `node --check <ไฟล์>` กับทุกไฟล์ที่แก้
   - รัน module-resolution smoke test: `JWT_SECRET=test node -e "require('./src/...')"` เพื่อจับ error ตอน require (import วน, พิมพ์ผิด ฯลฯ)
2. **Mobile**: หลังแก้ไฟล์ใดใน `mobile/`
   - รัน syntax check ผ่าน `@babel/core` + `@babel/preset-react` กับทุกไฟล์ใน `mobile/src` และ `App.js`
   - **สำคัญ**: ต้องรันคำสั่งนี้จาก cwd = `mobile/` เท่านั้น ไม่งั้น babel จะหา `@babel/preset-react` ไม่เจอ (ดูรายละเอียดใน CLAUDE.md หัวข้อ Compound Engineering)
3. **Web**: หลังแก้ไฟล์ใดใน `web/`
   - รัน `cd web && npm run build` (`vite build`) เป็น smoke test — เช็คแล้วรันผ่านจริง จะ error ทันทีถ้า resolve import/module ไม่ได้
   - **`npm run lint` ที่มีอยู่ใน `package.json` ตอนนี้พังอยู่** — ติดตั้ง eslint + plugin ไว้ครบแต่**ไม่มีไฟล์ config เลย** (ไม่มีทั้ง `.eslintrc.*` และ `eslint.config.js`) รันแล้วจะเจอ `ESLint couldn't find a configuration file` ทันที อย่าอ้างอิงว่าใช้ lint เช็คได้จนกว่าจะมีคนสร้าง config ไฟล์นี้ขึ้นมาจริง
4. เมื่อมี dependency ใหม่ ให้แก้ `package.json` แล้ว **บอกผู้ใช้ให้รัน `npm install` (backend/web) หรือ `npx expo install <pkg>` (mobile) เอง** — อย่าพยายามรัน `npm install` เต็มรูปแบบใน sandbox เพราะ install ยาวๆ มักถูกตัดขาด/ไม่เสถียร ให้ verify ด้วย syntax/resolution check แทน
5. ถ้างานเกี่ยวกับ TDD ในอนาคต (เมื่อมี test suite แล้ว): **เขียน failing test ก่อนเสมอ แล้วค่อยเขียนโค้ดจริงให้ test ผ่าน** ห้ามเขียนโค้ดก่อนแล้วค่อยเขียน test ตามทีหลัง

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

# Web
cd web
npm install
npm run dev       # vite dev server (default http://localhost:5173)
npm run build     # build production
npm run preview   # preview build ที่ทำไว้
npm run lint      # ตอนนี้พังอยู่ ไม่มีไฟล์ config ของ ESLint (ดู Workflow ข้อ 3)
```

ยังไม่มี script `lint` หรือ `test` ใน `package.json` ของ backend/mobile เลย — อย่าอ้างอิงคำสั่งที่ไม่มีจริง ฝั่ง `web` มี script `lint` นิยามไว้ก็จริงแต่รันไม่ผ่าน (ไม่มีไฟล์ config ของ ESLint — ดู Workflow ข้อ 3) ถ้าจำเป็นต้องเพิ่ม/ซ่อม lint หรือเพิ่ม test ให้ฝั่งไหน ให้ทำแล้วบันทึกไว้ในไฟล์นี้ด้วย
