import React, { useCallback, useState } from 'react';
import { View, Text, TextInput, FlatList, Alert, TouchableOpacity, Image } from 'react-native';
// ✏️ แก้ไข: ใช้ AppIcon (Lucide ตาม Figma) แทน Ionicons ตรงๆ — API เดียวกัน
import Ionicons from '../components/AppIcon';
import { useFocusEffect } from '@react-navigation/native';
import { searchBuddiesRequest, sendBuddyRequest } from '../api/buddies';
import { listEventsRequest } from '../api/events';
import { resolveAssetUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import BuddyCard from '../components/BuddyCard';
import EventCard from '../components/EventCard';
// ➕ เพิ่ม: header ไล่เฉดฟ้ากลางตาม Figma
import SkyHeader from '../components/SkyHeader';
import colors from '../theme/colors';
import { SPORTS } from '../constants/options';
// ✏️ แก้ไข: ย้ายไฟล์สไตล์จาก screens/ ไปไว้โฟลเดอร์ src/Style/ แยกต่างหาก ให้แยกส่วน UI ชัดเจนขึ้น
import styles from '../Style/finesport.styles';


export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [tab, setTab] = useState('buddies'); // 'buddies' | 'events'
  const [sport, setSport] = useState('');
  const [buddies, setBuddies] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchBuddies = useCallback(
    async (overrideSport) => {
      const q = overrideSport !== undefined ? overrideSport : sport;
      setLoading(true);
      try {
        const data = await searchBuddiesRequest(q ? { sport: q } : {});
        setBuddies(data.buddies);
        setSearched(true);
      } catch (err) {
        Alert.alert('ค้นหาไม่สำเร็จ', err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    },
    [sport]
  );

  const loadEvents = useCallback(
    async (overrideSport) => {
      const q = overrideSport !== undefined ? overrideSport : sport;
      setLoading(true);
      try {
        const data = await listEventsRequest(q ? { sport: q } : {});
        setEvents(data.events);
        setSearched(true);
      } catch (err) {
        Alert.alert('โหลดกิจกรรมไม่สำเร็จ', err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    },
    [sport]
  );

  const runSearch = useCallback(
    (overrideSport) => (tab === 'buddies' ? searchBuddies(overrideSport) : loadEvents(overrideSport)),
    [tab, searchBuddies, loadEvents]
  );

  useFocusEffect(
    useCallback(() => {
      if (tab === 'events') loadEvents();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab])
  );

  const handleConnect = async (buddy) => {
    try {
      await sendBuddyRequest({ to: buddy.id, sport: sport || buddy.sports?.[0]?.name || 'General' });
      Alert.alert('ส่งคำขอแล้ว', `ส่งคำขอเป็นเพื่อนไปหา ${buddy.name} แล้ว`);
    } catch (err) {
      Alert.alert('ส่งคำขอไม่สำเร็จ', err.response?.data?.message || err.message);
    }
  };

  const resultCount = tab === 'buddies' ? buddies.length : events.length;

  // ✏️ แก้ไข: layout ตาม Figma "ค้นหา" — SkyHeader (อวาตาร์ + คำทักทาย) + การ์ดค้นหาลอยทับ header (segment, ช่องค้นหา + ไอคอนปรับแต่ง,
  // ชิปกีฬา) + หัวข้อผลลัพธ์พร้อมจำนวน (logic ค้นหา/โหลดเดิมไม่เปลี่ยน — เอาปุ่ม "ค้นหา" ออก ใช้ปุ่ม search บนคีย์บอร์ด/แตะชิปแทน)
  return (
    <View style={styles.container}>
      <SkyHeader extraBottom={40}>
        <View style={styles.headerRow}>
          {/* ✏️ แก้ไข: โชว์รูปโปรไฟล์จริงถ้ามีอัปโหลดไว้ แทนตัวอักษรแรกของชื่ออย่างเดียว */}
          {user?.avatar ? (
            <Image source={{ uri: resolveAssetUrl(user.avatar) }} style={styles.heroAvatarImage} />
          ) : (
            <View style={styles.heroAvatar}>
              <Text style={styles.heroAvatarText}>{user?.name?.[0]?.toUpperCase() || '?'}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.heroGreeting} numberOfLines={1}>
              สวัสดี{user?.name ? `, ${user.name}` : ''} 👋
            </Text>
            <Text style={styles.heroSubtitle}>หาเพื่อนใหม่ แล้วไปเล่นกีฬากัน</Text>
          </View>
        </View>
      </SkyHeader>

      {/* ---------- Floating search card ---------- */}
      <View style={styles.searchCard}>
        <View style={styles.tabRow}>
          <TouchableOpacity
            activeOpacity={0.75}
            style={[styles.tabButton, tab === 'buddies' && styles.tabButtonActive]}
            onPress={() => setTab('buddies')}
          >
            <Text style={[styles.tabText, tab === 'buddies' && styles.tabTextActive]}>เพื่อน</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.75}
            style={[styles.tabButton, tab === 'events' && styles.tabButtonActive]}
            onPress={() => {
              setTab('events');
              loadEvents();
            }}
          >
            <Text style={[styles.tabText, tab === 'events' && styles.tabTextActive]}>กิจกรรมทั้งหมด</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={20} color={colors.primaryDark} />
          <TextInput
            style={styles.input}
            placeholder={tab === 'buddies' ? 'ค้นหาชื่อเพื่อนหรือกีฬา' : 'ค้นหากิจกรรมตามชนิดกีฬา'}
            placeholderTextColor={colors.muted}
            value={sport}
            onChangeText={setSport}
            onSubmitEditing={() => runSearch()}
            returnKeyType="search"
          />
          <TouchableOpacity activeOpacity={0.7} hitSlop={8} onPress={() => runSearch()}>
            <Ionicons name={loading ? 'hourglass-outline' : 'options-outline'} size={20} color={colors.primaryDark} />
          </TouchableOpacity>
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={SPORTS}
          keyExtractor={(s) => s.key}
          style={styles.chipList}
          contentContainerStyle={{ gap: 8, paddingRight: 4 }}
          renderItem={({ item }) => {
            const active = sport === item.label;
            return (
              <TouchableOpacity
                activeOpacity={0.75}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => {
                  const next = active ? '' : item.label;
                  setSport(next);
                  runSearch(next);
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
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsLabel}>{tab === 'buddies' ? 'เพื่อนที่น่าไปเล่นด้วย' : 'กิจกรรมที่พบ'}</Text>
        {searched && <Text style={styles.countText}>{resultCount} {tab === 'buddies' ? 'คน' : 'กิจกรรม'}</Text>}
      </View>

      {/* ---------- Results ---------- */}
      {tab === 'buddies' ? (
        <FlatList
          data={buddies}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <BuddyCard buddy={item} onConnect={handleConnect} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="people-outline" size={30} color={colors.primaryDark} />
              </View>
              <Text style={styles.empty}>
                {searched ? 'ไม่พบเพื่อนเล่นกีฬา ลองเปลี่ยนคำค้นหาดู' : 'ค้นหาด้านบนเพื่อหาเพื่อนเล่นกีฬาใกล้คุณ'}
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item._id}
          refreshing={loading}
          onRefresh={() => loadEvents()}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={(e) => navigation.navigate('Events', { screen: 'EventDetail', params: { id: e._id } })}
              onChange={() => loadEvents()}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="calendar-outline" size={30} color={colors.primaryDark} />
              </View>
              <Text style={styles.empty}>ไม่พบกิจกรรมที่ตรงกับเงื่อนไข</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
