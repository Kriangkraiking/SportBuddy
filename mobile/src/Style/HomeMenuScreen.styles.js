import { StyleSheet } from 'react-native';
import colors from '../theme/colors';
import { fonts } from '../theme/typography';
import { radius, shadow } from '../theme/shape';

// ✏️ แก้ไข: เขียนใหม่ทั้งไฟล์ตาม Figma "หน้าหลัก" — SkyHeader มีคำทักทาย + กระดิ่ง, การ์ด "แมตช์แนะนำใกล้คุณ" ลอยทับขอบ header,
// แถวชิปกีฬาโปรด, หัวข้อ "เริ่มเล่นในแบบของคุณ", เมนูแบบลิสต์แนวตั้งในการ์ดขาวใบเดียว
// (เอาแบนเนอร์เลื่อนอัตโนมัติ + เมนูกริด 2 คอลัมน์ + รายการกิจกรรมที่กำลังจะถึงออก ตามที่ผู้ใช้เลือก "ตาม Figma ทั้งหมด")
export default StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 24 },

  // ----- Header -----
  greetingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 6 },
  selfAvatarImage: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: colors.white },
  selfAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selfAvatarText: { color: colors.white, fontFamily: fonts.bold, fontSize: 18 },
  greeting: { fontSize: 22, fontFamily: fonts.bold, color: colors.white },
  subtitle: { color: colors.white, fontFamily: fonts.regular, fontSize: 14 },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.cta,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  bellBadgeText: { color: colors.ctaText, fontFamily: fonts.extraBold, fontSize: 8 },

  // ----- การ์ดแมตช์แนะนำใกล้คุณ (ลอยทับขอบล่าง header) -----
  nearbyCard: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 24,
    marginTop: -40,
    padding: 12,
    minHeight: 140,
    backgroundColor: colors.card,
    borderRadius: radius.card,
    ...shadow.card,
  },
  nearbyBody: { flex: 1, paddingTop: 2, gap: 5 },
  nearbyTagRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  nearbyTag: { color: colors.primaryDark, fontFamily: fonts.semiBold, fontSize: 11 },
  nearbyTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 17 },
  nearbyMeta: { color: colors.muted, fontFamily: fonts.regular, fontSize: 11 },
  spacesRow: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingTop: 3 },
  spacesDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  spacesText: { color: colors.primaryDark, fontFamily: fonts.semiBold, fontSize: 11 },
  nearbyImage: { width: 104, height: 116, borderRadius: 14 },
  nearbyEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  nearbyEmptyText: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13 },

  // ----- ชิปกีฬาโปรด -----
  chipsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 24, marginTop: 20 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 13,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderInput,
  },
  chipActive: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  chipText: { color: colors.ctaText, fontFamily: fonts.medium, fontSize: 12 },
  chipTextActive: { color: colors.white },

  // ----- เมนูหลัก -----
  menuHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 10,
  },
  menuHeadingTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 16 },
  menuHeadingCount: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12 },
  menuCard: {
    marginHorizontal: 24,
    paddingHorizontal: 14,
    backgroundColor: colors.card,
    borderRadius: radius.card,
    ...shadow.card,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 56 },
  menuSymbol: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ไอคอน "สร้างกิจกรรมใหม่" ใน Figma ใช้พื้นเหลืองอ่อน (ctaLight) เพราะเป็นปุ่ม commit หลักของแอป
  menuSymbolCta: { backgroundColor: colors.ctaLight },
  menuCopy: { flex: 1 },
  menuTitle: { color: colors.text, fontFamily: fonts.semiBold, fontSize: 14 },
  menuSubtitle: { color: colors.muted, fontFamily: fonts.regular, fontSize: 11 },
});
