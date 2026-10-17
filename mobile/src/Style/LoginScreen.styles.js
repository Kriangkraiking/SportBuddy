import { StyleSheet } from 'react-native';
import colors from '../theme/colors';
import { fonts } from '../theme/typography';
import { radius, shadow } from '../theme/shape';

// ✏️ แก้ไข: เขียนใหม่ทั้งไฟล์ตาม Figma "เข้าสู่ระบบ" — header ฟ้า (SkyHeader) มีโลโก้ + ชื่อ SportBuddy (ฟอนต์ Prompt)
// + แท็กไลน์ + ไอคอนกีฬา 3 วง, การ์ดขาวลอยทับขอบล่างของ header, ปุ่มหลักเหลืองพร้อมลูกศร
export default StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingBottom: 32 },
  heroContent: { alignItems: 'center', paddingTop: 16 },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { fontFamily: fonts.brand, fontSize: 30, color: colors.white },
  tagline: { fontFamily: fonts.regular, fontSize: 14, color: colors.white, marginTop: 14 },
  sportsRow: { flexDirection: 'row', gap: 12, marginTop: 18 },
  sportBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: 24,
    marginHorizontal: 24,
    marginTop: -60,
    ...shadow.card,
  },
  cardTitle: { fontFamily: fonts.bold, fontSize: 22, color: colors.text },
  cardSubtitle: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginBottom: 18 },
  // ปุ่มหลักเหลือง (cta) + ตัวหนังสือ ctaText + ลูกศรขวา
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
});
