import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Image } from 'react-native';
// ✏️ แก้ไข: ใช้ AppIcon (Lucide ตาม Figma) แทน Ionicons ตรงๆ — API เดียวกัน
import Ionicons from '../components/AppIcon';
import { useFocusEffect } from '@react-navigation/native';
import { listEventsRequest } from '../api/events';
import { listNotificationsRequest } from '../api/notifications';
import { resolveAssetUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';
// ➕ เพิ่ม: header ไล่เฉดฟ้ากลาง + รายการกีฬาทางการ (SPORTS) สำหรับชิปกีฬาโปรดและไอคอนกีฬา
import SkyHeader from '../components/SkyHeader';
import { SPORTS } from '../constants/options';
// ✏️ แก้ไข: ย้ายไฟล์สไตล์จาก screens/ ไปไว้โฟลเดอร์ src/Style/ แยกต่างหาก ให้แยกส่วน UI ชัดเจนขึ้น
import styles from '../Style/HomeMenuScreen.styles';
import { TAB_BAR_CLEARANCE } from '../theme/shape';

// ✏️ แก้ไข: รูปในการ์ด "แมตช์แนะนำ" ใช้ภาพกีฬาเดิมจาก assets/banners (ที่เคยใช้ทำแบนเนอร์เลื่อน) จับคู่ตามชื่อกีฬา
// ไม่มีรูปของกีฬานั้น (ว่ายน้ำ/เทนนิส/โยคะ/จักรยาน) จะ fallback เป็นรูปวิ่ง
const SPORT_IMAGES = {
  ฟุตบอล: require('../../assets/banners/banner-football.png'),
  บาสเกตบอล: require('../../assets/banners/banner-basketball.png'),
  แบดมินตัน: require('../../assets/banners/banner-badminton.png'),
  วิ่ง: require('../../assets/banners/banner-running.png'),
  วอลเลย์บอล: require('../../assets/banners/banner-volleyball.png'),
  ปิงปอง: require('../../assets/banners/banner-tabletennis.png'),
};

// ✏️ แก้ไข: เมนูตาม Figma (ไอคอน/ข้อความรอง) — ลำดับและ route เดิมทั้งหมด (key/onPress ไม่เปลี่ยน) เพิ่ม `cta` ให้ไอคอนพื้นเหลือง
const MENU_ITEMS = [
  {
    key: 'FindBuddy',
    icon: 'search-outline',
    title: 'ค้นหาเพื่อน',
    subtitle: 'เจอเพื่อนใหม่ที่ชอบกีฬาเหมือนกัน',
    onPress: (navigation) => navigation.navigate('FindBuddy'),
  },
  {
    key: 'Matching',
    icon: 'shuffle-outline',
    title: 'จับคู่กีฬา',
    subtitle: 'เลือกกีฬาที่ใช่ เจอคู่เล่นที่ลงตัว',
    onPress: (navigation) => navigation.navigate('Matching'),
  },
  {
    key: 'Events',
    icon: 'calendar-outline',
    title: 'กิจกรรมทั้งหมด',
    subtitle: 'แมตช์สนุก ๆ รอบตัวคุณ',
    onPress: (navigation) => navigation.navigate('Events'),
  },
  {
    key: 'CreateEvent',
    icon: 'add-circle-outline',
    cta: true,
    title: 'สร้างกิจกรรมใหม่',
    subtitle: 'ตั้งทีมของคุณ แล้วชวนเพื่อนมาเล่น',
    onPress: (navigation) => navigation.navigate('Events', { screen: 'CreateEvent' }),
  },
  {
    key: 'Friends',
    icon: 'people-outline',
    title: 'เพื่อน',
    subtitle: 'จัดการคำขอเป็นเพื่อนและดูเพื่อนของคุณ',
    onPress: (navigation) => navigation.navigate('Friends'),
  },
  {
    key: 'Profile',
    icon: 'person-outline',
    title: 'โปรไฟล์',
    subtitle: 'จัดการข้อมูลและกีฬาที่คุณชอบ',
    onPress: (navigation) => navigation.navigate('Profile'),
  },
];

export default function HomeMenuScreen({ navigation }) {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [eventsData, notificationsData] = await Promise.all([
        listEventsRequest(),
        listNotificationsRequest().catch(() => ({ unreadCount: 0 })),
      ]);
      setEvents(eventsData.events || []);
      setUnreadCount(notificationsData.unreadCount || 0);
    } catch (err) {
      // silent fail on the home dashboard preview
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // ➕ เพิ่ม: การ์ด "แมตช์แนะนำใกล้คุณ" — เลือกกิจกรรมแรกในรายการที่ยังไม่เต็ม (ถ้ามีกีฬาโปรดของผู้ใช้ให้ลองเลือกกีฬานั้นก่อน)
  // ยังไม่ได้คำนวณระยะทางจริง (ตอนนี้ endpoint ไม่ได้ส่งระยะมา) ใช้ลำดับที่ backend ส่งมา
  const favoriteNames = (user?.sports || []).map((s) => s.name);
  const openEvents = events.filter((e) => e.status !== 'full' && e.status !== 'completed' && e.status !== 'cancelled');
  const nearby = openEvents.find((e) => favoriteNames.includes(e.sport)) || openEvents[0];
  const joined = nearby?.participants?.length || 0;
  const remaining = nearby ? Math.max((nearby.maxParticipants || 0) - joined, 0) : 0;
  const nearbyTime = nearby
    ? new Date(nearby.dateTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false })
    : '';

  // ➕ เพิ่ม: ชิปกีฬาโปรดของผู้ใช้ (สูงสุด 3 อัน) ตัวแรก active — แตะแล้วไปหน้ากิจกรรม (กรองกีฬายังไม่รองรับ param จึงแค่เปิดหน้ารวม)
  const chips = (user?.sports || []).slice(0, 3);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: TAB_BAR_CLEARANCE }]}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
    >
      <SkyHeader extraBottom={40}>
        <View style={styles.greetingRow}>
          {/* ➕ เพิ่ม: แสดงรูปโปรไฟล์จริงของผู้ใช้ (ถ้าอัปโหลดไว้) ที่หน้าหลัก แตะเพื่อไปหน้าโปรไฟล์ได้เลย */}
          <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('Profile')}>
            {user?.avatar ? (
              <Image source={{ uri: resolveAssetUrl(user.avatar) }} style={styles.selfAvatarImage} />
            ) : (
              <View style={styles.selfAvatar}>
                <Text style={styles.selfAvatarText}>{user?.name?.[0]?.toUpperCase() || '?'}</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting} numberOfLines={1}>
              สวัสดี{user?.name ? `, ${user.name}` : ''} 👋
            </Text>
            <Text style={styles.subtitle}>วันนี้อยากเล่นกีฬาอะไรดี?</Text>
          </View>
          <TouchableOpacity
            style={styles.bellButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.white} />
            {unreadCount > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </SkyHeader>

      {/* ---------- การ์ดแมตช์แนะนำใกล้คุณ ---------- */}
      {nearby ? (
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.nearbyCard}
          onPress={() => navigation.navigate('Events', { screen: 'EventDetail', params: { id: nearby._id } })}
        >
          <View style={styles.nearbyBody}>
            <View style={styles.nearbyTagRow}>
              <Ionicons name="location-outline" size={12} color={colors.primaryDark} />
              <Text style={styles.nearbyTag}>แมตช์แนะนำใกล้คุณ</Text>
            </View>
            <Text style={styles.nearbyTitle} numberOfLines={1}>{nearby.title}</Text>
            <Text style={styles.nearbyMeta} numberOfLines={1}>
              {nearby.location?.address || 'ไม่ระบุสถานที่'} • {nearbyTime} น.
            </Text>
            <View style={styles.spacesRow}>
              <View style={styles.spacesDot} />
              <Text style={styles.spacesText}>
                เข้าร่วมแล้ว {joined} คน · ขาดอีก {remaining} คน
              </Text>
            </View>
          </View>
          <Image
            source={SPORT_IMAGES[nearby.sport] || SPORT_IMAGES['วิ่ง']}
            style={styles.nearbyImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.nearbyCard}>
          <View style={styles.nearbyEmpty}>
            <Ionicons name="calendar-outline" size={28} color={colors.muted} />
            <Text style={styles.nearbyEmptyText}>ยังไม่มีแมตช์แนะนำตอนนี้</Text>
          </View>
        </View>
      )}

      {/* ---------- ชิปกีฬาโปรด ---------- */}
      {chips.length > 0 && (
        <View style={styles.chipsRow}>
          {chips.map((s, i) => {
            const meta = SPORTS.find((x) => x.label === s.name);
            const active = i === 0;
            return (
              <TouchableOpacity
                key={s.name}
                activeOpacity={0.8}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => navigation.navigate('Events')}
              >
                <Ionicons
                  name={meta?.icon || 'football-outline'}
                  size={16}
                  color={active ? colors.white : colors.primaryDark}
                />
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{s.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* ---------- เมนูหลัก ---------- */}
      <View style={styles.menuHeading}>
        <Text style={styles.menuHeadingTitle}>เริ่มเล่นในแบบของคุณ</Text>
        <Text style={styles.menuHeadingCount}>{SPORTS.length} กีฬา</Text>
      </View>
      <View style={styles.menuCard}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => item.onPress(navigation)}
          >
            <View style={[styles.menuSymbol, item.cta && styles.menuSymbolCta]}>
              <Ionicons name={item.icon} size={21} color={item.cta ? colors.ctaText : colors.primaryDark} />
            </View>
            <View style={styles.menuCopy}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle} numberOfLines={1}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color={colors.muted} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
