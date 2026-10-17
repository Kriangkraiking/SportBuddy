import { StyleSheet } from 'react-native';
import colors from '../theme/colors';
import { fonts } from '../theme/typography';
import { radius, shadow } from '../theme/shape';

// ✏️ แก้ไข: เขียนใหม่ทั้งไฟล์ตาม Figma "สมัครสมาชิก" — SkyHeader มีปุ่มย้อนกลับ + โลโก้ + หัวข้อ "สมัครสมาชิก",
// การ์ดขาวลอยทับ header, ช่องกีฬาโปรดเป็น dropdown (เลือกจาก SPORTS เท่านั้น ตามกฎข้อ 4)
export default StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingBottom: 32 },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: 16, height: 52 },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { fontFamily: fonts.brand, fontSize: 21, color: colors.white },
  intro: { paddingTop: 4 },
  introTitle: { fontFamily: fonts.bold, fontSize: 22, color: colors.white },
  introSubtitle: { fontFamily: fonts.regular, fontSize: 12, color: colors.primaryLight },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: 20,
    marginHorizontal: 24,
    marginTop: -72,
    ...shadow.card,
  },
  // ช่อง dropdown กีฬาโปรด (หน้าตาเหมือน IconInput แต่เป็นปุ่ม)
  fieldLabel: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.text, marginBottom: 6 },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 50,
    paddingHorizontal: 14,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: 14,
    marginBottom: 14,
  },
  pickerText: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.text },
  pickerPlaceholder: { color: colors.muted },
  button: {
    flexDirection: 'row',
    gap: 8,
    height: 52,
    backgroundColor: colors.cta,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: { color: colors.ctaText, fontFamily: fonts.bold, fontSize: 14 },
  link: { textAlign: 'center', color: colors.muted, fontFamily: fonts.regular, fontSize: 13, marginTop: 18 },
  linkStrong: { color: colors.primaryDark, fontFamily: fonts.semiBold },
  // modal เลือกกีฬา
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(20,33,61,0.45)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    paddingTop: 18,
    paddingBottom: 28,
    maxHeight: '70%',
  },
  modalTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.text, paddingHorizontal: 20, marginBottom: 8 },
  sportRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 12 },
  sportRowActive: { backgroundColor: colors.primaryLight },
  sportRowText: { flex: 1, fontFamily: fonts.medium, fontSize: 14, color: colors.text },
});
