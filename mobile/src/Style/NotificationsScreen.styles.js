import { StyleSheet } from 'react-native';
import colors from '../theme/colors';
import { fonts } from '../theme/typography';
import { radius, shadow } from '../theme/shape';

// ✏️ แก้ไข: เขียนใหม่ทั้งไฟล์ตาม Figma "การแจ้งเตือน" — SkyHeader (ย้อนกลับ + หัวข้อ + กระดิ่ง), หัวข้อกลุ่ม "วันนี้ • ยังไม่อ่าน N" + "อ่านทั้งหมด",
// การ์ดยังไม่อ่าน = พื้น primaryLight + จุดเหลือง, การ์ดอ่านแล้ว = ขาว, badge ไอคอนประเภทที่มุมอวาตาร์, หน้าว่างพร้อมปุ่ม "ค้นหากิจกรรม"
export default StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // ----- Header -----
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 4, paddingBottom: 6 },
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
  headerBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  listContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32, gap: 12, flexGrow: 1 },

  // ----- หัวข้อกลุ่ม -----
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 14, color: colors.text },
  sectionSubtle: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  markAllText: { fontFamily: fonts.bold, fontSize: 12, color: colors.primaryDark },

  // ----- การ์ด -----
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: colors.card,
    ...shadow.card,
  },
  cardUnread: { backgroundColor: colors.primaryLight, shadowOpacity: 0, elevation: 0 },
  avatarWrap: { width: 44, height: 48 },
  avatarImage: { width: 44, height: 44, borderRadius: 22 },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: { color: colors.white, fontFamily: fonts.bold, fontSize: 15 },
  badgeIcon: {
    position: 'absolute',
    left: 28,
    top: 29,
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIconUnread: { borderColor: colors.primaryLight },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 3 },
  title: { fontFamily: fonts.bold, fontSize: 13, color: colors.text },
  message: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, lineHeight: 18 },
  time: { fontFamily: fonts.regular, fontSize: 10, color: colors.muted },
  unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.cta, marginTop: 4 },

  // ----- หน้าว่าง -----
  emptyBox: { alignItems: 'center', gap: 18, paddingTop: 48 },
  emptyArt: {
    width: 258,
    height: 202,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 20, color: colors.text, textAlign: 'center' },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colors.muted, textAlign: 'center' },
  emptyButton: {
    flexDirection: 'row',
    gap: 8,
    height: 52,
    alignSelf: 'stretch',
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyButtonText: { fontFamily: fonts.bold, fontSize: 14, color: colors.white },
  emptyNote: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  emptyNoteText: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
});
