import { StyleSheet } from 'react-native';
import colors from '../theme/colors';
import { fonts } from '../theme/typography';
import { radius, shadow } from '../theme/shape';

// ✏️ แก้ไข: เขียนใหม่ทั้งไฟล์ตาม Figma "สร้างกิจกรรมใหม่" — SkyHeader (ย้อนกลับ + ชื่อหน้า + คำอธิบาย), การ์ดฟอร์มลอยทับ header
// (ป้ายชื่อหัวข้อตัวหนา 12px เหนือทุกช่อง, ช่องพื้น background ขอบ borderInput radius 14), ชิปกีฬาเลื่อนแนวนอน,
// ตัวปรับจำนวนคน (− n คน +), แถบปุ่มล่างคงที่สีเหลือง
export default StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // ----- Header -----
  navRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 4 },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontFamily: fonts.bold, fontSize: 22, color: colors.white },
  headerSubtitle: { fontFamily: fonts.regular, fontSize: 12, color: colors.white },

  // ----- ฟอร์ม -----
  scrollContent: { paddingHorizontal: 24, paddingBottom: 24 },
  card: {
    marginTop: -64,
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: 16,
    gap: 12,
    ...shadow.card,
  },
  field: { gap: 5 },
  label: { fontFamily: fonts.bold, color: colors.text, fontSize: 12 },
  input: {
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: 14,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  textArea: { minHeight: 72, textAlignVertical: 'top' },
  fieldBox: {
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
  fieldBoxText: { flex: 1, color: colors.text, fontFamily: fonts.regular, fontSize: 14 },
  fieldBoxPlaceholder: { color: colors.muted },
  scheduleRow: { flexDirection: 'row', gap: 10 },

  sportChip: {
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
  sportChipActive: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  sportChipText: { color: colors.ctaText, fontFamily: fonts.regular, fontSize: 12 },
  sportChipTextActive: { color: colors.white, fontFamily: fonts.semiBold },

  mapLink: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  mapLinkText: { flex: 1, color: colors.primaryDark, fontFamily: fonts.regular, fontSize: 12 },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: 14,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: 14,
  },
  stepperValue: { color: colors.text, fontFamily: fonts.regular, fontSize: 14 },

  // ----- แถบปุ่มล่างคงที่ -----
  actionBar: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.borderInput,
  },
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
});
