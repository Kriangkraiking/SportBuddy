import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
// ✏️ แก้ไข: ใช้ AppIcon (Lucide ตาม Figma) แทน Ionicons ตรงๆ — API เดียวกัน
import Ionicons from '../components/AppIcon';
import { useFocusEffect } from '@react-navigation/native';
import { listEventsRequest } from '../api/events';
import EventCard from '../components/EventCard';
// ➕ เพิ่ม: header ไล่เฉดฟ้ากลาง (EventsStack ซ่อน header ของ native-stack สำหรับหน้านี้แล้ว)
import SkyHeader from '../components/SkyHeader';
import colors from '../theme/colors';
import { SPORTS } from '../constants/options';
// ✏️ แก้ไข: ย้ายไฟล์สไตล์จาก screens/ ไปไว้โฟลเดอร์ src/Style/ แยกต่างหาก ให้แยกส่วน UI ชัดเจนขึ้น
import styles from '../Style/EventsScreen.styles';

// ➕ เพิ่ม: ชิป "ทั้งหมด" (sport = '') นำหน้ารายการกีฬา ตาม Figma — รายการกีฬาที่เหลือยังมาจาก SPORTS เท่านั้น
const FILTERS = [{ key: 'all', label: 'ทั้งหมด', icon: 'grid-outline', value: '' }].concat(
  SPORTS.map((s) => ({ key: s.key, label: s.label, icon: s.icon, value: s.label }))
);

export default function EventsScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [sport, setSport] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (overrideSport) => {
    const q = overrideSport !== undefined ? overrideSport : sport;
    setLoading(true);
    try {
      const data = await listEventsRequest(q ? { sport: q } : {});
      setEvents(data.events);
    } catch (err) {
      Alert.alert('โหลดกิจกรรมไม่สำเร็จ', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sport]);

  useFocusEffect(
    useCallback(() => {
      load();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  return (
    <View style={styles.container}>
      {/* ---------- Header ---------- */}
      <SkyHeader extraBottom={40}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>กิจกรรม</Text>
            <Text style={styles.headerSubtitle}>แมตช์สนุก ๆ กำลังรอคุณอยู่</Text>
          </View>
          <Ionicons name="sparkles-outline" size={25} color={colors.white} />
        </View>
      </SkyHeader>

      {/* ---------- Floating filter card ---------- */}
      <View style={styles.filterCard}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={(s) => s.key}
          contentContainerStyle={{ gap: 8, paddingRight: 4 }}
          renderItem={({ item }) => {
            const active = sport === item.value;
            return (
              <TouchableOpacity
                activeOpacity={0.75}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => {
                  setSport(item.value);
                  load(item.value);
                }}
              >
                <Ionicons name={item.icon} size={17} color={active ? colors.white : colors.primaryDark} />
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* ---------- Section label ---------- */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>แมตช์ที่มีให้เข้าร่วม</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{events.length}</Text>
        </View>
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item._id}
        refreshing={loading}
        onRefresh={() => load()}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPress={(e) => navigation.navigate('EventDetail', { id: e._id })}
            onChange={() => load()}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="calendar-outline" size={30} color={colors.primaryDark} />
            </View>
            <Text style={styles.empty}>ยังไม่มีแมตช์ วันนี้ ลองสร้างเองดูไหม?</Text>
          </View>
        }
      />

      {/* ---------- FAB: create match ---------- */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={() => navigation.navigate('CreateEvent')}>
        <Ionicons name="add" size={20} color={colors.ctaText} />
        <Text style={styles.fabText}>สร้างแมตช์ใหม่</Text>
      </TouchableOpacity>
    </View>
  );
}
