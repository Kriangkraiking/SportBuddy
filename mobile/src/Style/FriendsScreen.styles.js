import { StyleSheet } from 'react-native';
import colors from '../theme/colors';
import { fonts } from '../theme/typography';
import { radius, shadow } from '../theme/shape';

// ✏️ แก้ไข: เขียนใหม่ทั้งไฟล์ตาม Figma "เพื่อน" (ค้นหาผู้เล่น / รายชื่อเพื่อน / คำขอที่ได้รับ / คำขอที่ส่งไป / ยังไม่มีเพื่อน) —
// header ฟ้า (SkyHeader มุมเหลี่ยม) + แท็บ pill ขาว (แท็บที่เลือก = primaryDark) + การ์ด/ปุ่มเหลือง ตามชีตองค์ประกอบ
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

  // ----- แท็บ -----
  tabRow: {
    flexDirection: 'row',
    gap: 2,
    height: 48,
    padding: 4,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 999,
    backgroundColor: colors.card,
  },
  tabButton: { flex: 1, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  tabButtonActive: { backgroundColor: colors.primaryDark },
  tabText: { fontFamily: fonts.medium, fontSize: 12, color: colors.muted },
  tabTextActive: { fontFamily: fonts.bold, color: colors.white },
  tabBadge: {
    position: 'absolute',
    top: 2,
    right: 6,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    paddingHorizontal: 3,
    backgroundColor: colors.cta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeText: { fontFamily: fonts.extraBold, fontSize: 8, color: colors.ctaText },

  // ----- เนื้อหา -----
  body: { paddingHorizontal: 20, paddingTop: 18, gap: 18 },
  listContent: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 32, gap: 12, flexGrow: 1 },

  // UID ของคุณ
  myUidCard: { gap: 8, padding: 16, borderRadius: radius.card, backgroundColor: colors.primaryLight },
  myUidTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  myUidLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.primaryDark },
  myUidValue: { fontFamily: fonts.bold, fontSize: 18, color: colors.ctaText },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 999,
    backgroundColor: colors.card,
  },
  copyButtonText: { fontFamily: fonts.bold, fontSize: 12, color: colors.primaryDark },
  myUidHint: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },

  // ช่องค้นหา (pill)
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, paddingVertical: 0, fontFamily: fonts.regular, fontSize: 14, color: colors.text },
  searchErrorText: { fontFamily: fonts.regular, fontSize: 12, color: colors.danger, marginTop: -8 },

  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryTitle: { fontFamily: fonts.bold, fontSize: 14, color: colors.text },
  summaryTitleLg: { fontFamily: fonts.bold, fontSize: 16, color: colors.text },
  summaryNote: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },

  // ----- การ์ด -----
  card: { padding: 16, gap: 12, borderRadius: radius.card, backgroundColor: colors.card, ...shadow.card },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: colors.card,
    ...shadow.card,
  },
  avatarFallback: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarFallbackText: { color: colors.white, fontFamily: fonts.bold, fontSize: 16 },
  name: { fontFamily: fonts.bold, fontSize: 16, color: colors.text },
  nameSm: { fontFamily: fonts.bold, fontSize: 14, color: colors.text },
  sub: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  chip: { height: 30, paddingHorizontal: 12, borderRadius: 999, backgroundColor: colors.primaryLight, justifyContent: 'center' },
  chipText: { fontFamily: fonts.regular, fontSize: 12, color: colors.primaryDark },

  // ปุ่ม
  primaryButton: {
    flexDirection: 'row',
    gap: 8,
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: colors.cta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { fontFamily: fonts.bold, fontSize: 14, color: colors.ctaText },
  secondaryButton: {
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: { fontFamily: fonts.bold, fontSize: 14, color: colors.ctaText },
  respondRow: { flexDirection: 'row', gap: 10 },
  pendingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pendingText: { fontFamily: fonts.regular, fontSize: 12, color: colors.primaryDark },
  pendingBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.primaryLight },
  pendingBadgeText: { fontFamily: fonts.bold, fontSize: 11, color: colors.primaryDark },

  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 6 },
  hintText: { flex: 1, fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  footerNote: { textAlign: 'center', fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 4 },

  // ----- ยังไม่มีข้อมูล -----
  emptyBox: { alignItems: 'center', gap: 18, paddingTop: 28 },
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
  emptyLink: { fontFamily: fonts.regular, fontSize: 12, color: colors.primaryDark },
  emptyIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { textAlign: 'center', color: colors.muted, fontFamily: fonts.regular, fontSize: 13, lineHeight: 20 },
});
