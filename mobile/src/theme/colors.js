// ✏️ แก้ไข: เปลี่ยนทิศทางดีไซน์ทั้งระบบจากมินท์เขียว+ขาว → ฟ้า (sky blue) + เหลืองทอง ตาม mockup ใหม่ของผู้ใช้
// ("เปลี่ยน ux&ui ตามนี้") คง key เดิมทั้งหมดไว้ (primary/cta/background/...) เพื่อไม่ต้องแก้ call site หลายสิบไฟล์
// ที่ import token เหล่านี้อยู่แล้ว — เปลี่ยนแค่ค่า hex ข้างใน ค่า hex ตรงกับชีต "ชุดองค์ประกอบ" ใน Figma (file 7eIUC0gwGxqt4xqJo47KZX):
// สีหลัก #4DA8DA / สีเข้ม #2B7FB8 / สีอ่อน #E6F4FC / สีการกระทำ #FFD166 / ข้อความ #14213D / สำเร็จ #3DBE8B / แจ้งเตือน #EF5B5B
// (primaryVivid เป็นค่าที่เพิ่มเองสำหรับต้น gradient — ไม่มีในชีต)
export default {
  // ---- Primary: Sky Blue (header ไล่เฉด, ชิปที่เลือก, pill แท็บ active, ปุ่มรอง) ----
  // ตาม Figma ตัวหนังสือบนพื้น primary ใช้ขาว (ปุ่มหลัก/bubble แชท); ชิปที่ "เลือกแล้ว" ใช้พื้น primaryDark (#2B7FB8) + ตัวหนังสือขาว
  primary: '#4DA8DA', // blue.500 (#4DA8DA = "สีหลัก" ในชีต Figma) — พื้นหลัง header, ชิปที่เลือก, pill แท็บ active (ตัวหนังสือบนพื้นนี้ใช้ white)
  primaryDark: '#2B7FB8', // blue.700 — ตัวหนังสือ/ลิงก์/ไอคอนสีฟ้าบนพื้นขาว (ผ่าน contrast), ปลายทางของ gradient
  primaryVivid: '#6BBBE5', // blue.400 — ต้นทางของ gradient header (สว่างกว่า), progress bar fill
  primaryLight: '#E6F4FC', // blue.100 — พื้นหลังชิป/วงกลมไอคอน/พื้นช่องกรอก/กล่องข้อความ

  // ---- CTA: เหลืองทอง (สงวนไว้เฉพาะปุ่ม "commit" หลัก: เข้าร่วมแมตช์, เพิ่มเพื่อน, บันทึก, สร้างกิจกรรม) ----
  // ✏️ แก้ไข: กลับมาใช้เหลืองแยกจากสีหลักอีกครั้ง (ตอนชุดมินท์ cta ถูกรวมเข้ากับ primary) ตัวหนังสือบนปุ่มเหลืองใช้ ctaText (navy เข้ม)
  cta: '#FFD166',
  ctaDark: '#E8B33A',
  ctaLight: '#FFF5D9',
  ctaText: '#12476B',

  // ---- Neutrals ----
  // background ฟ้าอ่อนมาก (ตามพื้นหลังหน้าจอใน mockup) การ์ดเป็นขาวล้วนลอยบนพื้นนี้
  background: '#F5FAFE',
  card: '#FFFFFF',
  text: '#14213D', // navy เข้ม — หัวข้อ/ตัวหนังสือหลัก (ตรงกับสี navy ในชีตสีของ mockup)
  muted: '#6B7C93', // เทาอมฟ้า — ตัวหนังสือรอง/placeholder/ไอคอนไม่ active
  border: '#E4EDF4',
  // ➕ เพิ่ม: เส้นขอบช่องกรอก/ชิปบนพื้นขาว (#DDEBF4 ใน Figma หน้าเข้าสู่ระบบ/หน้าหลัก) เข้มกว่า border เล็กน้อย
  borderInput: '#DDEBF4',
  // กันไม่ให้ต้องใส่ '#fff' ตรงๆ ในไฟล์หน้าจอ/component ตามกฎห้าม hardcode สี
  white: '#FFFFFF',

  // ---- Semantic ----
  success: '#3DBE8B',
  danger: '#EF5B5B',
  // ➕ เพิ่ม: พื้นช่องกรอกที่ error (#FFF7F7 ใน Figma หน้าสมัครสมาชิก)
  dangerLight: '#FFF7F7',
  // ➕ เพิ่ม: พื้นปุ่มกลมปฏิเสธ/ยอมรับคำขอเข้าร่วม (#FFF0F0 / #E6F8F1 ใน Figma หน้ารายละเอียดกิจกรรม • ผู้จัด)
  dangerSoft: '#FFF0F0',
  successSoft: '#E6F8F1',
  warning: '#FFB020', // เหลืองอำพัน — badge แจ้งเตือน/rating

  // พื้นหลังสีเข้มสำหรับของที่ต้องตัดกับพื้นสว่าง (เดิมใช้กับ pill แท็บ active; ตอนนี้ pill แท็บเป็นสีฟ้า primary แล้ว
  // แต่ยังคง key นี้ไว้เพราะมีที่อื่นอ้างถึง)
  navDark: '#14213D',
};
