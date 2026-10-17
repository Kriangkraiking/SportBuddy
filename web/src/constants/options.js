// ➕ เพิ่ม: รายการกีฬาสำหรับ dropdown ในฟอร์มจัดการสนาม (ไม่ใช่ช่องกรอกอิสระ)
// มีเก็บแยกจาก mobile/src/constants/options.js เพราะ backend/mobile/web ห้าม import โค้ดข้ามกัน (ดู AGENTS.md ข้อ 9)
// ต้องแก้ให้ตรงกันเองถ้าจะเพิ่ม/ลบชนิดกีฬา
export const SPORTS = [
  { key: 'football', label: 'ฟุตบอล' },
  { key: 'basketball', label: 'บาสเกตบอล' },
  { key: 'badminton', label: 'แบดมินตัน' },
  { key: 'running', label: 'วิ่ง' },
  { key: 'swimming', label: 'ว่ายน้ำ' },
  { key: 'tennis', label: 'เทนนิส' },
  { key: 'volleyball', label: 'วอลเลย์บอล' },
  { key: 'tabletennis', label: 'ปิงปอง' },
  { key: 'yoga', label: 'โยคะ' },
  { key: 'cycling', label: 'ปั่นจักรยาน' },
];
