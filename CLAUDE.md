@AGENTS.md

# CLAUDE.md — SportBuddy

ไฟล์นี้เสริมจาก `AGENTS.md` (โครงสร้าง/กฎของโปรเจกต์) เฉพาะส่วนที่เป็น**พฤติกรรมของ Claude**เวลาทำงานในโปรเจกต์นี้

## ความแม่นยำ (Precision)

- ห้ามมโนชื่อไฟล์ ฟังก์ชัน หรือ endpoint ที่ไม่ได้เช็คจริง — ถ้าไม่แน่ใจว่าไฟล์ไหนมี field/ฟังก์ชันอะไร ให้ `Read` ก่อนแก้เสมอ (โดยเฉพาะ Mongoose schema กับ React Navigation route names ที่พิมพ์ผิดแล้ว fail แบบเงียบ)
- คำสั่งจากผู้ใช้ที่กำกวม (เช่น "เพิ่มระบบแจ้งเตือน" โดยไม่บอกว่า trigger ไหนบ้าง) ให้อนุมานจาก pattern ที่มีอยู่แล้วในโปรเจกต์ก่อน (ดูว่า feature คล้ายๆ กันเคยทำยังไง) แทนที่จะเดาแบบสุ่ม ถ้ายังกำกวมจริงๆ ค่อยถามผู้ใช้
- ทุก endpoint ใหม่ต้องตอบ error message เป็นภาษาไทยให้สอดคล้องกับของเดิม (ดู pattern ใน `buddyController.js`, `messageController.js`)

## กฎบังคับ: Tag การแก้ไขทุกครั้ง

**เมื่อแก้โค้ด (ไม่ว่าจะเพิ่ม/แก้/ลบ) ต้องใส่ comment tag กำกับไว้ในโค้ดเสมอ** ว่าเปลี่ยนอะไรและทำไม ใช้รูปแบบนี้:

```js
// ➕ เพิ่ม: <อธิบายสั้นๆ ว่าเพิ่มอะไร>
// ✏️ แก้ไข: <อธิบายว่าทำไมต้องแก้ตรงนี้ / แก้บั๊กอะไร>
```

และเวลาสรุปให้ผู้ใช้ในแชท ต้องบอกด้วยว่า **แก้ไฟล์ไหน บรรทัด/ฟังก์ชันไหน แก้ยังไง** ไม่ใช่แค่บอกผลลัพธ์ปลายทาง (ผู้ใช้ต้องตามอ่าน diff ได้ทันทีว่าเปลี่ยนตรงไหนบ้างโดยไม่ต้องเปิดไฟล์เทียบเอง)

## Compound Engineering — บทเรียนจากความผิดพลาดที่เกิดขึ้นจริงในโปรเจกต์นี้

กฎข้อนี้สำคัญที่สุด: **ทุกครั้งที่ทำผิดแล้วต้องแก้ ให้เพิ่มมันเป็นกฎในไฟล์นี้ทันที** ห้ามปล่อยให้ผิดซ้ำ รายการด้านล่างคือของจริงที่เคยเกิดในโปรเจกต์นี้:

1. **Node v24 พัง Expo tooling** — `babel-preset-expo` resolve เวอร์ชันไม่ได้ (`ETARGET`) เพราะ Node เร็วเกินกว่า Expo SDK รองรับ แก้โดย pin `nvm use 20` สำหรับ mobile เท่านั้น (ดู AGENTS.md ข้อ 2)
2. **`errorHandler.js` เช็ค status code ผิด** — เดิมใช้ `res.statusCode !== 200 ? res.statusCode : 500` ทำให้ error ที่โยนหลัง `res.status(201)` (เช่น `jwt.sign` พังเพราะ `JWT_SECRET` undefined) ตอบกลับเป็น 201 แทนที่จะเป็น error จริง ต้องใช้ `err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500)` เท่านั้น
3. **Windows/Notepad ซ่อนนามสกุลไฟล์** — ผู้ใช้ "บันทึกเป็น .env" แต่จริงๆ ได้ `.env.txt` ทำให้ `JWT_SECRET` เป็น undefined ทั้งที่ไฟล์ดูเหมือนมีอยู่ ถ้าเจอ error แนว "secretOrPrivateKey must have a value" ให้เช็คชื่อไฟล์จริงก่อนเช็คเนื้อหา
4. **Sport ต้องเป็นค่าจาก `SPORTS` constant เท่านั้น** — เคยให้กรอก sport แบบ free-text แล้ว filter ไม่เจอ เพราะตัวสะกดไม่ตรงกัน (เช่น "แบดมินตัน" vs "Badminton") ทุกจุดที่เลือก/แสดง/กรองกีฬาต้องอ้างอิง `mobile/src/constants/options.js` เท่านั้น
5. **Babel preset resolution ต้องรันจาก cwd = `mobile/`** — สคริปต์ตรวจ syntax (`babel.transformFileSync` ผ่าน `@babel/core`) จะหา `@babel/preset-react` ไม่เจอถ้ารันจาก `/tmp` หรือที่อื่น แม้ package จะติดตั้งอยู่จริงก็ตาม ต้อง `cd mobile` ก่อนรันทุกครั้ง
6. **Background process ใน sandbox ไม่รอดข้าม tool call** — bash tool call แต่ละครั้งแยก process กันจริงๆ (unshare-pid) ห้ามพึ่งพา `nohup`/background job ข้ามการเรียกเครื่องมือ ให้รันงานที่ต้องรอผลแบบ synchronous ภายใน call เดียว
7. **`mongoose` require ครั้งแรกในเชลล์ใหม่อาจใช้เวลา ~20 วินาที** (cold filesystem cache บน mounted volume) — อย่าตีความว่า require ค้าง/พังทันทีที่ timeout สั้นๆ (เช่น 5-15s) ให้ลองใหม่ด้วย timeout ที่นานขึ้นก่อนสรุปว่ามีบั๊กจริง
8. **`.gitignore` ของ backend ต้องมี `uploads/`** — ไฟล์ avatar ที่ user อัปโหลดไม่ควรเข้า git
9. **สร้าง `babel.config.js` เองแล้ว Metro หา `babel-preset-expo` ไม่เจอ** — ปกติ Expo ใช้ babel config ภายในของตัวเอง (resolve `babel-preset-expo` แบบ relative จากใน `node_modules/expo/node_modules/babel-preset-expo` ได้เอง) แต่พอโปรเจกต์มี `babel.config.js` ของตัวเอง (เช่น ต้องเพิ่ม `react-native-reanimated/plugin`) Babel จะ resolve `'babel-preset-expo'` จาก root ของโปรเจกต์แทน ซึ่งไม่เจอเพราะมันถูก hoist ไปอยู่ใต้ `expo/node_modules/` ไม่ใช่ top-level ต้องเพิ่ม `babel-preset-expo` เป็น dependency ตรงๆ ใน `package.json` ของ mobile เอง (เช็คเวอร์ชันที่ vendor ไว้อยู่แล้วใน `node_modules/expo/node_modules/babel-preset-expo/package.json` ก่อนใส่ อย่าเดา)
10. **`react-native-reanimated` v4 (และ `react-native-worklets` ที่มันพึ่งพา) รันใน Expo Go ไม่ได้** — เป็น native module (TurboModule) ใหม่ที่ Expo Go (binary สำเร็จรูปจาก Store) ไม่ได้ฝังไว้ อาการคือ error `"Exception in HostFunction: TurboModule method 'installTurboModule'..."` ตอน runtime ในแอป (ไม่ขึ้นที่ terminal ของ `expo start`) เคยลองใช้ `react-native-reanimated-carousel` ทำแถบรูปเลื่อนอัตโนมัติแล้วเจอปัญหานี้ ต้องถอดออกแล้วเปลี่ยนไปใช้ `ScrollView` + `setInterval` (ดู `HomeMenuScreen.js`) แทน — ถ้าจำเป็นต้องใช้ reanimated จริงๆ ต้องเปลี่ยนไปใช้ custom dev client (`expo-dev-client` + `eas build`/`expo run:android`) แทน Expo Go ซึ่งเป็นการเปลี่ยน workflow ทั้งชุด ต้องถามผู้ใช้ก่อนเสมอ ห้ามตัดสินใจเปลี่ยนเอง
11. **ห้ามสร้าง/แก้ไข user ผ่าน MongoDB GUI (Compass ฯลฯ) ตรงๆ เด็ดขาด** — เคยมีผู้ใช้พิมพ์รหัสผ่านใส่ field `password` ตรงๆ ผ่าน Compass แล้ว login ไม่ได้เลยไม่ว่าจะพิมพ์รหัสถูกแค่ไหน เพราะ `pre('save')` hook ใน `User.js` ที่ทำหน้าที่ bcrypt-hash รหัสผ่านทำงานเฉพาะตอนแก้ผ่าน Mongoose (`.save()`/`.create()`) เท่านั้น ไม่ทำงานถ้าแก้ผ่าน GUI ตรงๆ ผลคือ `password` ในฐานข้อมูลเป็น plain text แล้ว `bcrypt.compare()` ตอน login เทียบไม่ตรงกันเสมอ วิธีแก้/ป้องกัน: ใช้ `backend/scripts/createAdmin.js` (สร้างใหม่) หรือ `backend/scripts/resetPassword.js` (ตั้งรหัสใหม่ให้ของเดิม) หรือสมัครผ่านแอปเท่านั้น — ทั้งสองสคริปต์นี้เรียกผ่าน Mongoose จริงเลยได้ hash ที่ถูกต้อง
12. **เวลา bulk-edit ด้วย sed/python อย่าต่อ `// comment` ท้ายบรรทัด property ที่ลงท้ายด้วย comma** — เคยแทรก `// ✏️ แก้ไข: ...` ต่อท้าย `{ color: x },` ทำให้ comma ถูกกลืนเป็น comment แล้ว StyleSheet พัง (`Unexpected token, expected ","`) ให้ใส่ comment บรรทัดแยกด้านบน หรือวาง comma ก่อน comment เสมอ แล้วรัน babel sweep ทุกครั้งหลัง bulk edit
13. **ใน tool Bash บน Windows อย่าฝัง Python/JS ยาวๆ ที่มีข้อความไทยและเครื่องหมาย quote ปนกันไว้ใน heredoc `<<'EOF'`** — เคยเจอ `unexpected EOF while looking for matching `'`` ทำให้คำสั่งทั้งก้อนไม่ถูกรันเลย (แต่ไฟล์ที่ควรเขียนก็ไม่ถูกเขียน ทำให้นึกว่าแก้แล้ว) ให้เขียนสคริปต์/เทมเพลตลงไฟล์ด้วยเครื่องมือ Write แล้วค่อยสั่ง `python <ไฟล์>` / `node <ไฟล์>` และลบไฟล์ชั่วคราวทิ้งหลังใช้ ทุกครั้งหลังแก้ให้ตรวจว่าไฟล์เปลี่ยนจริง

> เพิ่มรายการใหม่ต่อท้ายลิสต์นี้ทุกครั้งที่เจอปัญหาเดิมซ้ำ หรือแก้บั๊กที่ไม่ควรเกิดซ้ำอีก

## คำสั่งที่ Claude ใช้ตรวจสอบตัวเองได้ (ดูรายละเอียดเต็มใน AGENTS.md หัวข้อ Workflow)

```bash
# Backend — หลังแก้ไฟล์
node --check <ไฟล์ที่แก้>
JWT_SECRET=test node -e "require('./src/...')"

# Mobile — หลังแก้ไฟล์ (ต้องรันจาก cwd = mobile/)
cd mobile && node <path-to-syntax-check-script>.js
```

ยังไม่มี `npm test` / `npm run lint` จริงในโปรเจกต์ — ถ้าผู้ใช้ขอให้เพิ่ม ให้เพิ่ม script ใน `package.json` ของฝั่งที่เกี่ยวข้อง แล้วอัปเดตส่วนนี้ด้วย
