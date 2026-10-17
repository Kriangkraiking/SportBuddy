import { StyleSheet } from 'react-native';
import colors from '../theme/colors';
import { fonts } from '../theme/typography';
import { shadow } from '../theme/shape';

// ✏️ แก้ไข: เขียนใหม่ทั้งไฟล์ตาม Figma "เลือกสถานที่" — แผนที่เต็มจอ มีปุ่มย้อนกลับขาวกลม + ชื่อหน้าลอยด้านบน, ช่องค้นหาลอย (pill ขาว),
// ปุ่ม locate-me ลอยมุมขวา, bottom sheet ขาวมุมบนโค้ง 28 มีที่อยู่ที่เลือก + ปุ่มยืนยันสีเหลือง
export default StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  map: { flex: 1 },

  topBar: { position: 'absolute', left: 24, right: 24 },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  title: { flex: 1, fontFamily: fonts.bold, fontSize: 22, color: colors.text },
  searchBox: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: colors.card,
    ...shadow.card,
  },
  searchInput: { flex: 1, paddingVertical: 0, color: colors.text, fontFamily: fonts.regular, fontSize: 14 },

  locateButton: {
    position: 'absolute',
    right: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },

  bottomSheet: {
    backgroundColor: colors.card,
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 14,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    ...shadow.floating,
  },
  handleWrap: { alignItems: 'center' },
  handle: { width: 36, height: 4, borderRadius: 999, backgroundColor: colors.borderInput },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  placeSymbol: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressText: { flex: 1, color: colors.text, fontFamily: fonts.bold, fontSize: 16, lineHeight: 24 },
  hint: { color: colors.primaryDark, fontFamily: fonts.regular, fontSize: 12 },
  // ปุ่มยืนยันสถานที่เป็นปุ่ม commit หลัก → เหลือง (cta) + ตัวหนังสือ navy
  confirmButton: {
    height: 52,
    backgroundColor: colors.cta,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: { color: colors.ctaText, fontFamily: fonts.bold, fontSize: 14 },
});
