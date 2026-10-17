import { StyleSheet } from 'react-native';
import colors from '../theme/colors';
import { fonts } from '../theme/typography';
import { radius, shadow } from '../theme/shape';

// ✏️ แก้ไข: เขียนใหม่ทั้งไฟล์ตาม Figma "จับคู่กีฬา" — SkyHeader (หัวข้อ + ไอคอน sparkles), การ์ดตั้งค่าการจับคู่ลอยทับ header
// (ชิปกีฬาเลื่อนแนวนอน, ชิประดับฝีมือ, วันที่สะดวก/ช่วงเวลา, ปุ่มเหลือง "จับคู่กีฬา"), หัวข้อผลลัพธ์ "กิจกรรมแนะนำ"/"เพื่อนแนะนำ"
export default StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // ----- Header -----
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 6, paddingBottom: 8 },
  headerTitle: { fontFamily: fonts.bold, fontSize: 22, color: colors.white },
  headerSubtitle: { fontFamily: fonts.regular, fontSize: 12, color: colors.white },

  scrollContent: { paddingHorizontal: 24, paddingBottom: 32, gap: 16 },

  // ----- การ์ดตั้งค่า -----
  // marginTop -56 = ชดเชย gap 16 ของ scrollContent เพื่อให้การ์ดลอยทับขอบ header เท่าเดิม
  card: {
    marginTop: -56,
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: 14,
    gap: 10,
    ...shadow.card,
  },
  field: { gap: 5 },
  label: { fontFamily: fonts.bold, color: colors.text, fontSize: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderInput,
  },
  chipActive: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  chipText: { color: colors.ctaText, fontFamily: fonts.regular, fontSize: 12 },
  chipTextActive: { color: colors.white, fontFamily: fonts.semiBold },
  dateTimeRow: { flexDirection: 'row', gap: 10 },
  dateTimeField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: 14,
  },
  dateTimeText: { flex: 1, color: colors.text, fontFamily: fonts.regular, fontSize: 14 },
  // ปุ่ม commit หลัก → เหลือง (cta) + ไอคอน shuffle
  button: {
    flexDirection: 'row',
    gap: 8,
    height: 52,
    backgroundColor: colors.cta,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: colors.ctaText, fontFamily: fonts.bold, fontSize: 14 },
  // ปุ่มรอง (เปิดหน้าปัดหาคู่ ไม่ใช่ปุ่ม commit หลักจึงไม่ใช้ colors.cta) ตามสไตล์ "ปุ่มรอง" ในชีต Figma
  secondaryButton: {
    flexDirection: 'row',
    gap: 8,
    height: 48,
    backgroundColor: colors.primaryLight,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: { color: colors.ctaText, fontFamily: fonts.bold, fontSize: 14 },

  // ----- ผลลัพธ์ -----
  section: { gap: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { flex: 1, color: colors.text, fontFamily: fonts.bold, fontSize: 16 },
  sectionLink: { color: colors.primaryDark, fontFamily: fonts.regular, fontSize: 12 },
  empty: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13, textAlign: 'center', paddingVertical: 8 },
});
