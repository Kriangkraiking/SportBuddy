import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
// ✏️ แก้ไข: ใช้ AppIcon (Lucide ตาม Figma) แทน Ionicons ตรงๆ — API เดียวกัน
import Ionicons from './AppIcon';
import { useAuth } from '../context/AuthContext';
import { joinEventRequest, leaveEventRequest } from '../api/events';
import { resolveAssetUrl } from '../api/client';
import { SPORTS } from '../constants/options';
import colors from '../theme/colors';
import { fonts } from '../theme/typography';
import { radius, shadow } from '../theme/shape';

const sportIcon = (label) => SPORTS.find((s) => s.label === label)?.icon || 'football-outline';

export default function EventCard({ event, onPress, onChange }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  const joined = event.participants?.length || 0;
  const isJoined = (event.participants || []).some((p) => String(p?._id || p) === String(user?.id));
  const isFull = joined >= event.maxParticipants && !isJoined;
  const pct = Math.min(100, Math.round((joined / (event.maxParticipants || 1)) * 100));

  // ✏️ แก้ไข: รูปแบบวันที่ตาม Figma "ส. 17 ต.ค. • 18:00 น." (วันย่อ + วันที่ + เดือนย่อ) เดิมแสดงแค่ "17 ต.ค. · 18:00 น."
  const date = new Date(event.dateTime);
  const dateLabel = date.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' });
  const timeLabel = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false });

  const handleToggleJoin = async () => {
    if (isFull) return;
    setBusy(true);
    try {
      if (isJoined) {
        await leaveEventRequest(event._id);
      } else {
        await joinEventRequest(event._id);
      }
      onChange?.();
    } catch (err) {
      Alert.alert('ทำรายการไม่สำเร็จ', err.response?.data?.message || err.message);
    } finally {
      setBusy(false);
    }
  };

  // ✏️ แก้ไข: layout การ์ดใหม่ทั้งใบตาม Figma "กิจกรรม" — แถวบน: ไอคอนกีฬา + ชื่อกีฬา (ซ้าย) / สถานะ "เปิดรับเพื่อน" หรือ "เต็มแล้ว" (ขวา),
  // ชื่อกิจกรรม, แถววันที่/สถานที่แบบไอคอน, แถวอวาตาร์ซ้อน + "เข้าร่วมแล้ว N คน" + n/max, แถบ progress, ปุ่มเหลืองเต็มความกว้าง
  // (logic เข้าร่วม/ออกเดิมไม่เปลี่ยน)
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => onPress?.(event)}>
      <View style={styles.sportRow}>
        <View style={styles.sportTag}>
          <Ionicons name={sportIcon(event.sport)} size={20} color={colors.primaryDark} />
          <Text style={styles.sportName}>{event.sport}</Text>
        </View>
        <Text style={[styles.status, isFull && styles.statusFull]}>{isFull ? 'เต็มแล้ว' : 'เปิดรับเพื่อน'}</Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {event.title}
      </Text>

      <View style={styles.metaRow}>
        <Ionicons name="calendar-outline" size={17} color={colors.primaryDark} />
        <Text style={styles.metaText}>
          {dateLabel} • {timeLabel} น.
        </Text>
      </View>
      <View style={styles.metaRow}>
        <Ionicons name="location-outline" size={17} color={colors.primaryDark} />
        <Text style={styles.metaText} numberOfLines={1}>
          {event.location?.address || 'ไม่ระบุสถานที่'}
        </Text>
      </View>

      <View style={styles.capacityRow}>
        <View style={styles.avatarStack}>
          {(event.participants || []).slice(0, 3).map((p, idx) => (
            <View key={p?._id || p || idx} style={[styles.avatarChip, { marginLeft: idx === 0 ? 0 : -7 }]}>
              {p?.avatar ? (
                <Image source={{ uri: resolveAssetUrl(p.avatar) }} style={styles.avatarChipImage} />
              ) : (
                <Text style={styles.avatarChipText}>{p?.name?.[0]?.toUpperCase() || '?'}</Text>
              )}
            </View>
          ))}
        </View>
        <Text style={styles.capacityText}>เข้าร่วมแล้ว {joined} คน</Text>
        <Text style={styles.capacityCount}>
          {joined}/{event.maxParticipants}
        </Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%` }]} />
      </View>

      <TouchableOpacity
        style={[styles.ctaButton, isJoined && styles.ctaButtonJoined, isFull && styles.ctaButtonDisabled]}
        activeOpacity={0.8}
        disabled={busy || isFull}
        onPress={handleToggleJoin}
      >
        <Text
          style={[
            styles.ctaButtonText,
            isJoined && styles.ctaButtonTextJoined,
            isFull && styles.ctaButtonTextDisabled,
          ]}
        >
          {busy ? 'กำลังทำรายการ...' : isFull ? 'เต็มแล้ว' : isJoined ? 'ออกจากแมตช์' : 'เข้าร่วมแมตช์'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: 16,
    marginBottom: 16,
    gap: 10,
    ...shadow.card,
  },
  sportRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sportTag: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sportName: { color: colors.primaryDark, fontFamily: fonts.semiBold, fontSize: 12 },
  status: { color: colors.success, fontFamily: fonts.regular, fontSize: 12 },
  statusFull: { color: colors.danger },
  title: { color: colors.text, fontFamily: fonts.bold, fontSize: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12, flexShrink: 1 },
  capacityRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarStack: { flexDirection: 'row', alignItems: 'center' },
  avatarChip: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarChipImage: { width: '100%', height: '100%', borderRadius: 14 },
  avatarChipText: { color: colors.white, fontFamily: fonts.bold, fontSize: 11 },
  capacityText: { flex: 1, color: colors.muted, fontFamily: fonts.regular, fontSize: 12 },
  capacityCount: { color: colors.primaryDark, fontFamily: fonts.bold, fontSize: 12 },
  progressTrack: { height: 5, borderRadius: 999, backgroundColor: colors.primaryLight, overflow: 'hidden' },
  progressFill: { height: 5, borderRadius: 999, backgroundColor: colors.primary },
  ctaButton: {
    height: 52,
    backgroundColor: colors.cta,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: { color: colors.ctaText, fontFamily: fonts.bold, fontSize: 14 },
  ctaButtonJoined: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.primaryDark },
  ctaButtonTextJoined: { color: colors.primaryDark },
  ctaButtonDisabled: { backgroundColor: colors.border },
  ctaButtonTextDisabled: { color: colors.muted },
});
