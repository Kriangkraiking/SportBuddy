import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, FlatList, Platform } from 'react-native';
// ✏️ แก้ไข: ใช้ AppIcon (Lucide ตาม Figma) แทน Ionicons ตรงๆ — API เดียวกัน
import Ionicons from '../components/AppIcon';
import DateTimePicker from '@react-native-community/datetimepicker';
import { matchRequest } from '../api/match';
import { sendBuddyRequest } from '../api/buddies';
import EventCard from '../components/EventCard';
import BuddyCard from '../components/BuddyCard';
// ➕ เพิ่ม: header ไล่เฉดฟ้ากลางตาม Figma
import SkyHeader from '../components/SkyHeader';
import colors from '../theme/colors';
import { SPORTS, SKILL_LEVELS } from '../constants/options';
// ✏️ แก้ไข: ย้ายไฟล์สไตล์จาก screens/ ไปไว้โฟลเดอร์ src/Style/ แยกต่างหาก ให้แยกส่วน UI ชัดเจนขึ้น
import styles from '../Style/MatchingScreen.styles';

const LEVELS = [{ value: 'all', label: 'ทุกระดับ' }, ...SKILL_LEVELS];

export default function MatchingScreen({ navigation }) {
  const [sport, setSport] = useState('');
  const [skillLevel, setSkillLevel] = useState('all');
  const [dateTime, setDateTime] = useState(new Date(Date.now() + 60 * 60 * 1000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onChangeDate = (event, selected) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (event.type === 'dismissed' || !selected) return;
    const next = new Date(dateTime);
    next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
    setDateTime(next);
  };

  const onChangeTime = (event, selected) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (event.type === 'dismissed' || !selected) return;
    const next = new Date(dateTime);
    next.setHours(selected.getHours(), selected.getMinutes());
    setDateTime(next);
  };

  // ✏️ แก้ไข: รูปแบบวันที่ตาม Figma "17 ต.ค. 2569" (เพิ่มปี พ.ศ.) เวลาแบบ 24 ชม.
  const dateLabel = dateTime.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeLabel = dateTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false });

  const findMatches = async () => {
    // ✏️ แก้ไข: เอาช่อง "หรือพิมพ์ชนิดกีฬาเอง" ออก (ผิดกฎโปรเจกต์ข้อ 4 ห้าม free-text กีฬา และ Figma ไม่มีช่องนี้) ต้องเลือกจากชิปเท่านั้น
    if (!sport) {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณาเลือกชนิดกีฬา');
      return;
    }
    setLoading(true);
    try {
      const data = await matchRequest({
        sport,
        skillLevel,
        dateTime: dateTime.toISOString(),
      });
      setResult(data);
    } catch (err) {
      Alert.alert('ค้นหาไม่สำเร็จ', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ➕ เพิ่ม: เปิดหน้าปัดหาคู่กีฬาแบบ Tinder ด้วยชนิดกีฬา/ระดับที่เลือกไว้ในฟอร์มนี้
  const openSwipeMatch = () => {
    if (!sport) {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณาเลือกชนิดกีฬาก่อน');
      return;
    }
    navigation.navigate('SwipeMatch', { sport, skillLevel });
  };

  const handleConnect = async (buddy) => {
    try {
      await sendBuddyRequest({ to: buddy.id, sport });
      Alert.alert('ส่งคำขอแล้ว', `ส่งคำขอเป็นเพื่อนไปหา ${buddy.name} แล้ว`);
    } catch (err) {
      Alert.alert('ส่งคำขอไม่สำเร็จ', err.response?.data?.message || err.message);
    }
  };

  // ✏️ แก้ไข: layout ตาม Figma "จับคู่กีฬา" (logic ค้นหา/ปัดหาคู่/ขอเป็นเพื่อนเดิมไม่เปลี่ยน)
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <SkyHeader extraBottom={40} style={{ marginHorizontal: -24 }}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>จับคู่กีฬา</Text>
              <Text style={styles.headerSubtitle}>เลือกสิ่งที่ชอบ เจอเพื่อนที่ใช่</Text>
            </View>
            <Ionicons name="sparkles-outline" size={25} color={colors.white} />
          </View>
        </SkyHeader>

        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>อยากเล่นกีฬาอะไร?</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={SPORTS}
              keyExtractor={(s) => s.key}
              contentContainerStyle={{ gap: 8, paddingRight: 4 }}
              renderItem={({ item }) => {
                const active = sport === item.label;
                return (
                  <TouchableOpacity
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setSport(item.label)}
                  >
                    <Ionicons name={item.icon} size={17} color={active ? colors.white : colors.primaryDark} />
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.label}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>ระดับฝีมือ</Text>
            <View style={styles.chipRow}>
              {LEVELS.map((l) => {
                const active = skillLevel === l.value;
                return (
                  <TouchableOpacity
                    key={l.value}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setSkillLevel(l.value)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{l.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.dateTimeRow}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>วันที่สะดวก</Text>
              <TouchableOpacity style={styles.dateTimeField} onPress={() => setShowDatePicker(true)}>
                <Ionicons name="calendar-outline" size={17} color={colors.primaryDark} />
                <Text style={styles.dateTimeText} numberOfLines={1}>{dateLabel}</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>ช่วงเวลา</Text>
              <TouchableOpacity style={styles.dateTimeField} onPress={() => setShowTimePicker(true)}>
                <Ionicons name="time-outline" size={17} color={colors.primaryDark} />
                <Text style={styles.dateTimeText} numberOfLines={1}>{timeLabel} น.</Text>
              </TouchableOpacity>
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={dateTime}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              minimumDate={new Date()}
              onChange={onChangeDate}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              value={dateTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              is24Hour
              onChange={onChangeTime}
            />
          )}

          <TouchableOpacity style={styles.button} onPress={findMatches} disabled={loading}>
            {!loading && <Ionicons name="shuffle-outline" size={19} color={colors.ctaText} />}
            <Text style={styles.buttonText}>{loading ? 'กำลังค้นหา...' : 'จับคู่กีฬา'}</Text>
          </TouchableOpacity>

          {/* ➕ เพิ่ม: ทางเลือกปัดหาคู่กีฬาแบบ Tinder ใช้ sport/skillLevel ที่เลือกไว้ด้านบน (Figma มีลิงก์ "ลองปัดจับคู่ →" ในส่วนเพื่อนแนะนำ) */}
          <TouchableOpacity style={styles.secondaryButton} onPress={openSwipeMatch}>
            <Ionicons name="albums-outline" size={17} color={colors.ctaText} />
            <Text style={styles.secondaryButtonText}>ปัดหาคู่เล่น</Text>
          </TouchableOpacity>
        </View>

        {result && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>กิจกรรมแนะนำ</Text>
              </View>
              {result.events.length === 0 ? (
                <Text style={styles.empty}>ไม่พบกิจกรรมที่ตรงกับเงื่อนไข</Text>
              ) : (
                result.events.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    onPress={(e) => navigation.navigate('EventDetail', { id: e._id })}
                    onChange={findMatches}
                  />
                ))
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>เพื่อนแนะนำ</Text>
                <TouchableOpacity onPress={openSwipeMatch}>
                  <Text style={styles.sectionLink}>ลองปัดจับคู่ →</Text>
                </TouchableOpacity>
              </View>
              {result.buddies.length === 0 ? (
                <Text style={styles.empty}>ไม่พบเพื่อนเล่นที่ตรงกับเงื่อนไข</Text>
              ) : (
                result.buddies.map((buddy) => (
                  <BuddyCard key={buddy.id} buddy={buddy} onConnect={handleConnect} />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
