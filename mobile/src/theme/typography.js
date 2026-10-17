// ➕ เพิ่ม: ไฟล์กลาง font family (Noto Sans Thai) + type scale ตามทิศทางดีไซน์ใหม่ (geometric sans, ตัวหนา
// สำหรับตัวเลข/หัวข้อ, ตัวปกติสำหรับเนื้อหา) ต้องโหลดฟอนต์ผ่าน useFonts ใน App.js ก่อนเสมอ
// (ดู mobile/App.js) ไม่งั้นชื่อ font family พวกนี้จะ fallback เป็นฟอนต์ระบบเฉยๆ ไม่ error แต่ไม่ใช่ฟอนต์จริง
// ✏️ แก้ไข: เปลี่ยนจาก Poppins → Noto Sans Thai ตาม Figma (คง key เดิม regular/medium/semiBold/bold/extraBold
// เพื่อไม่ต้องแก้ call site) + เพิ่ม brand = Prompt SemiBold ใช้กับโลโก้ "SportBuddy" เท่านั้น
export const fonts = {
  regular: 'NotoSansThai_400Regular',
  medium: 'NotoSansThai_500Medium',
  semiBold: 'NotoSansThai_600SemiBold',
  bold: 'NotoSansThai_700Bold',
  extraBold: 'NotoSansThai_800ExtraBold',
  brand: 'Prompt_600SemiBold',
};

// type scale ตาม design system: ตัวเลขแดชบอร์ด/หัวข้อใหญ่ใช้น้ำหนักหนัก ส่วนเนื้อหาใช้ปกติ/กลาง
export const type = {
  display: { fontFamily: fonts.bold, fontSize: 30 },
  h1: { fontFamily: fonts.semiBold, fontSize: 22 },
  h2: { fontFamily: fonts.semiBold, fontSize: 17 },
  cardTitle: { fontFamily: fonts.medium, fontSize: 15 },
  body: { fontFamily: fonts.regular, fontSize: 14 },
  caption: { fontFamily: fonts.medium, fontSize: 12 },
};

export default { fonts, type };
