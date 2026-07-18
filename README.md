# SportBuddy

แอปหาเพื่อนเล่นกีฬา — React Native (Expo) + Node.js/Express + MongoDB

## โครงสร้างโปรเจกต์

```
SportBuddy/
├── backend/     Node.js + Express API (MongoDB/Mongoose)
└── mobile/      React Native app (Expo)
```

## ฟีเจอร์ที่มีให้

- สมัครสมาชิก/ล็อกอิน ด้วย Email + Password (JWT)
- ค้นหาเพื่อนเล่นกีฬาตามชนิดกีฬา (และระยะทาง ถ้ามีพิกัด)
- ส่งคำขอเป็นเพื่อน (buddy request) และตอบรับ/ปฏิเสธ
- สร้าง/ดู/เข้าร่วม/ออกจากกิจกรรมกีฬา (events)
- แก้ไขโปรไฟล์ส่วนตัว (ชื่อ, กีฬาที่ชอบ, bio)

## เริ่มต้นใช้งาน — Backend

ต้องมี Node.js (v18+) และ MongoDB (local หรือ MongoDB Atlas)

```bash
cd backend
npm install
cp .env.example .env
# แก้ไข .env ใส่ MONGO_URI และ JWT_SECRET ของคุณ
npm run dev
```

Backend จะรันที่ `http://localhost:5000` — ทดสอบด้วย `GET http://localhost:5000/api/health`

### MongoDB

- Local: ติดตั้ง MongoDB Community Server แล้วใช้ `MONGO_URI=mongodb://localhost:27017/sportbuddy`
- Cloud (แนะนำ): สร้าง free cluster ที่ MongoDB Atlas แล้วนำ connection string มาใส่ใน `.env`

### API หลัก

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| POST | /api/auth/register | สมัครสมาชิก |
| POST | /api/auth/login | ล็อกอิน |
| GET | /api/auth/me | ข้อมูลผู้ใช้ปัจจุบัน |
| PUT | /api/users/me | แก้ไขโปรไฟล์ |
| GET | /api/buddies/search | ค้นหาเพื่อนเล่นกีฬา |
| POST | /api/buddies/request | ส่งคำขอเป็นบัดดี้ |
| PUT | /api/buddies/request/:id | ตอบรับ/ปฏิเสธคำขอ |
| GET | /api/buddies/requests | รายการคำขอทั้งหมด |
| GET | /api/events | รายการกิจกรรม |
| POST | /api/events | สร้างกิจกรรม |
| GET | /api/events/:id | รายละเอียดกิจกรรม |
| POST | /api/events/:id/join | เข้าร่วมกิจกรรม |
| POST | /api/events/:id/leave | ออกจากกิจกรรม |

## เริ่มต้นใช้งาน — Mobile (React Native / Expo)

ต้องมี Node.js และแอป **Expo Go** บนมือถือ (หรือ Android/iOS simulator)

```bash
cd mobile
npm install
npm start
```

จากนั้นสแกน QR code ด้วยแอป Expo Go บนมือถือ

### ตั้งค่า URL ของ backend

แก้ไขไฟล์ `mobile/src/api/client.js`:

```js
export const API_BASE_URL = 'http://localhost:5000/api';
```

- **มือถือจริง / Expo Go**: ใช้ IP ของเครื่องคอมพิวเตอร์ในวง LAN เดียวกัน เช่น `http://192.168.1.10:5000/api`
- **Android Emulator**: ใช้ `http://10.0.2.2:5000/api`
- **iOS Simulator**: ใช้ `http://localhost:5000/api` ได้ตามปกติ

## ขั้นตอนถัดไป (แนะนำให้ต่อยอด)

- เพิ่ม push notification เมื่อมีคำขอบัดดี้ใหม่หรือมีคนเข้าร่วมกิจกรรม
- เพิ่ม image upload สำหรับรูปโปรไฟล์ (เช่น ผ่าน Cloudinary/S3)
- เพิ่มระบบแผนที่ (react-native-maps) เพื่อเลือกตำแหน่งจริงแทนการพิมพ์ที่อยู่
- เพิ่ม pagination สำหรับรายการ events/buddies ที่มีจำนวนมาก
- เขียน automated tests (Jest) ทั้งฝั่ง backend และ mobile
