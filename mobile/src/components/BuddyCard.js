import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
// ✏️ แก้ไข: ใช้ AppIcon (Lucide ตาม Figma) แทน Ionicons ตรงๆ — API เดียวกัน
import Ionicons from './AppIcon';
import { resolveAssetUrl } from '../api/client';
import { skillLevelLabel } from '../constants/options';
import colors from '../theme/colors';
import { fonts } from '../theme/typography';
import { radius, shadow } from '../theme/shape';

// ✏️ แก้ไข: layout การ์ดเพื่อนใหม่ตาม Figma "ค้นหา" — แถวบน: อวาตาร์ 56 + ชื่อ + (ไอคอนหมุด + เมือง) + ไอคอน badge-check,
// แถวแท็กกีฬา (สูงสุด 2) + ระดับฝีมือ (ตัวหนังสือเทา), ปุ่มเหลืองเต็มความกว้าง "ขอเป็นเพื่อน" พร้อมไอคอน user-plus
// (ยังไม่มีข้อมูลระยะทางจาก backend จึงแสดงแค่เมือง ไม่ใส่ "• 1.2 กม." ตาม Figma)
export default function BuddyCard({ buddy, onConnect }) {
  const sports = buddy.sports || [];
  const level = sports[0]?.level;

  return (
    <View style={styles.card}>
      <View style={styles.infoRow}>
        <View style={styles.avatarRing}>
          {buddy.avatar ? (
            <Image source={{ uri: resolveAssetUrl(buddy.avatar) }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{buddy.name?.[0]?.toUpperCase() || '?'}</Text>
            </View>
          )}
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.name} numberOfLines={1}>{buddy.name}</Text>
          {!!buddy.location?.city && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={17} color={colors.primaryDark} />
              <Text style={styles.sub} numberOfLines={1}>{buddy.location.city}</Text>
            </View>
          )}
        </View>
        <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
      </View>

      {sports.length > 0 && (
        <View style={styles.chipRow}>
          {sports.slice(0, 2).map((s) => (
            <View key={s.name} style={styles.chip}>
              <Text style={styles.chipText}>{s.name}</Text>
            </View>
          ))}
          {!!level && <Text style={styles.levelText}>{skillLevelLabel(level)}</Text>}
        </View>
      )}

      <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={() => onConnect?.(buddy)}>
        <Ionicons name="person-add-outline" size={19} color={colors.ctaText} />
        <Text style={styles.buttonText}>ขอเป็นเพื่อน</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    ...shadow.card,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: { width: 56, height: 56, borderRadius: 28 },
  // ✏️ แก้ไข: พื้นฟ้า primary → ตัวหนังสือขาว (ธีมใหม่ตาม mockup)
  avatarText: { color: colors.white, fontFamily: fonts.bold, fontSize: 18 },
  name: { fontFamily: fonts.bold, fontSize: 16, color: colors.text },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sub: { flexShrink: 1, color: colors.muted, fontSize: 12, fontFamily: fonts.regular },
  chipRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chip: { backgroundColor: colors.primaryLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  chipText: { color: colors.primaryDark, fontSize: 12, fontFamily: fonts.regular },
  levelText: { color: colors.muted, fontSize: 12, fontFamily: fonts.regular },
  button: {
    flexDirection: 'row',
    gap: 8,
    height: 52,
    backgroundColor: colors.cta,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: colors.ctaText, fontFamily: fonts.bold, fontSize: 14 },
});
