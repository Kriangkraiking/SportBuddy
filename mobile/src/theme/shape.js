// ➕ เพิ่ม: ค่ากลาง border radius + shadow ตามทิศทางดีไซน์ใหม่ (การ์ดโค้งมนสูง, เงานุ่มบางๆ ไม่มีเส้นขอบแข็ง,
// ปุ่ม/ชิปเป็น pill เต็มรูป) ใช้ร่วมกับ src/theme/colors.js — ไฟล์นี้ไม่ใช่ที่บังคับ (ไม่เหมือน colors.js ที่ห้าม
// hardcode สีนอกไฟล์) แต่แนะนำให้ใช้ค่าจากตรงนี้แทนการเดาตัวเลข radius/shadow เองในแต่ละไฟล์
export const radius = {
  chip: 999,
  button: 999,
  // ✏️ แก้ไข: การ์ดใน Figma ใหม่ใช้ radius 20 (เดิม 24) / cardSmall ลดตามสัดส่วน
  card: 20,
  cardSmall: 16,
  icon: 16,
};

// ✏️ แก้ไข: ตอน tab bar เป็น floating (position:'absolute') ค่านี้เคยต้องสูงถึง 110 เพื่อกันเนื้อหาโดนทับ
// ตอนนี้เปลี่ยน tab bar กลับไปเป็น docked แล้ว (ดู mobile/src/navigation/MainTabNavigator.js) React Navigation
// กันพื้นที่ให้เนื้อหาใต้ tab bar อัตโนมัติเอง ไม่จำเป็นต้องเผื่อเพื่อ "เลี่ยงโดนทับ" อีกต่อไป — ค่านี้เลยลดกลับมาเป็น
// ระยะห่างขอบล่างปกติทั่วไปแทน (เท่ากับที่ทุกหน้าเคยใช้ก่อนมี floating nav) ยังคงชื่อเดิมไว้เพื่อไม่ต้องแก้ import
// ในทุกหน้าที่อ้างถึงซ้ำอีกรอบ แต่ความหมายตอนนี้คือ "ระยะห่างขอบล่างที่สบายตา" ไม่ใช่ "ระยะกันโดนทับ" แล้ว
export const TAB_BAR_CLEARANCE = 40;

export const shadow = {
  // เงาการ์ดปกติ (ลอยเบาๆ เหนือพื้นหลัง)
  // ✏️ แก้ไข: เงาตาม Figma "0 8 24 rgba(77,168,218,0.15)" (เงาโทนฟ้า primary) เดิมเป็นเงาเขียวเข้ม opacity 0.06
  card: {
    shadowColor: '#4DA8DA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 4,
  },
  // เงาสำหรับองค์ประกอบลอย เช่น floating bottom nav, floating search card
  floating: {
    shadowColor: '#4DA8DA',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
};

export default { radius, shadow, TAB_BAR_CLEARANCE };
