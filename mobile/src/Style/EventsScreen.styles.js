import { StyleSheet } from 'react-native';
import colors from '../theme/colors';
import { fonts } from '../theme/typography';
import { radius, shadow } from '../theme/shape';

// ✏️ แก้ไข: เขียนใหม่ทั้งไฟล์ตาม Figma "กิจกรรม" — SkyHeader (หัวข้อ + ไอคอน sparkles), การ์ดชิปกรองกีฬาลอยทับขอบ header,
// หัวข้อ "แมตช์ที่มีให้เข้าร่วม" + badge จำนวน, ปุ่มลอย "สร้างแมตช์ใหม่" สีเหลืองมุมขวาล่าง
export default StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // ----- Header -----
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 6, paddingBottom: 8 },
  headerTitle: { fontFamily: fonts.bold, fontSize: 22, color: colors.white },
  headerSubtitle: { fontFamily: fonts.regular, fontSize: 12, color: colors.white },

  // ----- การ์ดชิปกรองกีฬา (ลอยทับขอบล่าง header) -----
  filterCard: {
    marginHorizontal: 24,
    marginTop: -40,
    padding: 14,
    backgroundColor: colors.card,
    borderRadius: radius.card,
    ...shadow.card,
  },
  filterChip: {
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
  filterChipActive: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  filterChipText: { color: colors.ctaText, fontFamily: fonts.regular, fontSize: 12 },
  filterChipTextActive: { color: colors.white, fontFamily: fonts.semiBold },

  // ----- หัวข้อรายการ -----
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: { flex: 1, color: colors.text, fontFamily: fonts.bold, fontSize: 16 },
  countBadge: {
    height: 26,
    minWidth: 30,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: { color: colors.primaryDark, fontFamily: fonts.bold, fontSize: 12 },

  listContent: { paddingHorizontal: 24, paddingBottom: 110 },
  emptyBox: { alignItems: 'center', marginTop: 32, gap: 12, paddingHorizontal: 24 },
  emptyIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { textAlign: 'center', color: colors.muted, fontFamily: fonts.regular, fontSize: 13, lineHeight: 20 },

  // ----- ปุ่มลอย "สร้างแมตช์ใหม่" (commit หลักของหน้านี้ → เหลือง cta) -----
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 52,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: colors.cta,
    ...shadow.floating,
  },
  fabText: { color: colors.ctaText, fontFamily: fonts.bold, fontSize: 14 },
});
