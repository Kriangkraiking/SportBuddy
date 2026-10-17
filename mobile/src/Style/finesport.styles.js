import { StyleSheet } from 'react-native';
import colors from '../theme/colors';
import { fonts } from '../theme/typography';
import { radius, shadow } from '../theme/shape';

// ✏️ แก้ไข: เขียนใหม่ทั้งไฟล์ตาม Figma "ค้นหา" — SkyHeader (อวาตาร์ + คำทักทาย), การ์ดค้นหาลอยทับขอบ header
// (segment เพื่อน/กิจกรรมทั้งหมด + ช่องค้นหา + ชิปกีฬา), หัวข้อ "เพื่อนที่น่าไปเล่นด้วย" + จำนวน, การ์ดผลลัพธ์
export default StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // ----- Header -----
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 12, paddingBottom: 8 },
  heroAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAvatarText: { color: colors.white, fontFamily: fonts.bold, fontSize: 18 },
  heroAvatarImage: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: colors.white },
  heroGreeting: { fontSize: 22, fontFamily: fonts.bold, color: colors.white },
  heroSubtitle: { color: colors.white, fontSize: 12, fontFamily: fonts.regular },

  // ----- การ์ดค้นหา (ลอยทับขอบล่าง header) -----
  searchCard: {
    marginHorizontal: 24,
    marginTop: -40,
    padding: 16,
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.card,
    ...shadow.card,
  },
  tabRow: {
    flexDirection: 'row',
    height: 42,
    padding: 4,
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
  },
  tabButton: { flex: 1, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  tabButtonActive: { backgroundColor: colors.primaryDark },
  tabText: { color: colors.primaryDark, fontFamily: fonts.semiBold, fontSize: 13 },
  tabTextActive: { color: colors.white },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 48,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: 14,
  },
  input: { flex: 1, paddingVertical: 0, color: colors.text, fontSize: 14, fontFamily: fonts.regular },
  chipList: { flexGrow: 0 },
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

  // ----- หัวข้อผลลัพธ์ -----
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 12,
  },
  resultsLabel: { flex: 1, color: colors.text, fontFamily: fonts.bold, fontSize: 16 },
  countText: { color: colors.primaryDark, fontFamily: fonts.regular, fontSize: 12 },

  listContent: { paddingHorizontal: 24, paddingBottom: 32 },
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
});
