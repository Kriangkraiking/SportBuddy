import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, Alert, Image } from 'react-native';
// ✏️ แก้ไข: ใช้ AppIcon (Lucide ตาม Figma) แทน Ionicons ตรงๆ — API เดียวกัน
import Ionicons from '../components/AppIcon';
import { useFocusEffect } from '@react-navigation/native';
import {
  listNotificationsRequest,
  markNotificationReadRequest,
  markAllNotificationsReadRequest,
} from '../api/notifications';
import { resolveAssetUrl } from '../api/client';
// ➕ เพิ่ม: header ไล่เฉดฟ้ากลางตาม Figma
import SkyHeader from '../components/SkyHeader';
import colors from '../theme/colors';
// ✏️ แก้ไข: ย้ายไฟล์สไตล์จาก screens/ ไปไว้โฟลเดอร์ src/Style/ แยกต่างหาก ให้แยกส่วน UI ชัดเจนขึ้น
import styles from '../Style/NotificationsScreen.styles';

const POLL_INTERVAL_MS = 15000;

// ✏️ แก้ไข: badge ไอคอนมุมอวาตาร์ตาม Figma เป็นวงกลมขาว + ไอคอนสีของประเภท (เดิมเป็นวงสีทึบ + ไอคอนขาว)
// ➕ เพิ่ม: ประเภทใหม่ที่ backend ส่งมาแล้วแต่แอปยังไม่รู้จัก (เดิมตกไป fallback กระดิ่ง): buddy_matched, review_received,
// event_join_requested, event_join_approved — ต้องตรงกับ enum ใน backend/src/models/Notification.js
const TYPE_META = {
  friend_request: { icon: 'person-add', color: colors.primaryDark },
  friend_accepted: { icon: 'people', color: colors.primaryDark },
  event_joined: { icon: 'calendar', color: colors.primaryDark },
  event_reminder: { icon: 'alarm', color: colors.ctaDark },
  buddy_matched: { icon: 'heart', color: colors.danger },
  review_received: { icon: 'star', color: colors.primaryDark },
  event_join_requested: { icon: 'person-add', color: colors.primaryDark },
  event_join_approved: { icon: 'checkmark-circle', color: colors.success },
};

const timeAgo = (dateString) => {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'เมื่อสักครู่';
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hours / 24);
  return `${days} วันที่แล้ว`;
};

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async (isInitial) => {
    try {
      const data = await listNotificationsRequest();
      setNotifications(data.notifications);
    } catch (err) {
      // silent fail on background polls
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      load(true);
      const interval = setInterval(() => {
        if (!cancelled) load(false);
      }, POLL_INTERVAL_MS);
      return () => {
        cancelled = true;
        clearInterval(interval);
      };
    }, [load])
  );

  const handleMarkAllRead = async () => {
    if (!notifications.some((n) => !n.read)) return;
    setMarkingAll(true);
    try {
      await markAllNotificationsReadRequest();
      await load(false);
    } catch (err) {
      Alert.alert('ทำรายการไม่สำเร็จ', err.response?.data?.message || err.message);
    } finally {
      setMarkingAll(false);
    }
  };

  const handlePressItem = async (item) => {
    if (!item.read) {
      setNotifications((prev) => prev.map((n) => (n._id === item._id ? { ...n, read: true } : n)));
      markNotificationReadRequest(item._id).catch(() => {});
    }

    // ✏️ แก้ไข: ครอบคลุมประเภทใหม่ — แมตช์/คำขอเป็นเพื่อนไปหน้าเพื่อน, ที่เกี่ยวกับกิจกรรมไปหน้ากิจกรรม (ถ้ายังมีกิจกรรมอยู่)
    if (item.type === 'friend_request' || item.type === 'friend_accepted' || item.type === 'buddy_matched') {
      navigation.navigate('Friends');
    } else if (
      ['event_joined', 'event_reminder', 'event_join_requested', 'event_join_approved'].includes(item.type) &&
      item.event
    ) {
      navigation.navigate('Events', { screen: 'EventDetail', params: { id: item.event._id } });
    }
  };

  const unreadItems = notifications.filter((n) => !n.read);
  const readItems = notifications.filter((n) => n.read);
  const unreadCount = unreadItems.length;

  // ➕ เพิ่ม: แปลงรายการเป็นแถวเดียวต่อ item (หัวข้อกลุ่ม + การ์ด) ให้ FlatList เรนเดอร์ครั้งเดียวตาม Figma:
  // กลุ่ม "วันนี้ • ยังไม่อ่าน N" (พื้นฟ้าอ่อน + จุดเหลือง) แล้วกลุ่ม "ก่อนหน้านี้" (การ์ดขาว)
  const rows = [];
  if (unreadItems.length) {
    rows.push({ kind: 'header', key: 'h-unread', unread: true });
    unreadItems.forEach((n) => rows.push({ kind: 'item', key: n._id, item: n }));
  }
  if (readItems.length) {
    rows.push({ kind: 'header', key: 'h-read', unread: false });
    readItems.forEach((n) => rows.push({ kind: 'item', key: n._id, item: n }));
  }

  const renderItem = ({ item: row }) => {
    if (row.kind === 'header') {
      return (
        <View style={styles.sectionRow}>
          <Text style={row.unread ? styles.sectionTitle : styles.sectionSubtle}>
            {row.unread ? `วันนี้ • ยังไม่อ่าน ${unreadCount}` : 'ก่อนหน้านี้'}
          </Text>
          {row.unread && (
            <TouchableOpacity onPress={handleMarkAllRead} disabled={markingAll}>
              <Text style={styles.markAllText}>{markingAll ? 'กำลังทำรายการ...' : 'อ่านทั้งหมด'}</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    const item = row.item;
    const meta = TYPE_META[item.type] || { icon: 'notifications', color: colors.primaryDark };
    return (
      <TouchableOpacity
        style={[styles.card, !item.read && styles.cardUnread]}
        activeOpacity={0.8}
        onPress={() => handlePressItem(item)}
      >
        {/* ✏️ แก้ไข: ถ้าการแจ้งเตือนมี fromUser ให้โชว์รูปโปรไฟล์จริงของคนนั้นพร้อม badge ไอคอนบอกประเภทที่มุมล่างขวา
            แทนไอคอนสีพื้นๆ อย่างเดียว */}
        {item.fromUser ? (
          <View style={styles.avatarWrap}>
            {item.fromUser.avatar ? (
              <Image source={{ uri: resolveAssetUrl(item.fromUser.avatar) }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>{item.fromUser.name?.[0]?.toUpperCase() || '?'}</Text>
              </View>
            )}
            <View style={[styles.badgeIcon, !item.read && styles.badgeIconUnread]}>
              <Ionicons name={meta.icon} size={11} color={meta.color} />
            </View>
          </View>
        ) : (
          <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name={meta.icon} size={20} color={meta.color} />
          </View>
        )}
        <View style={styles.body}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  // ✏️ แก้ไข: layout ตาม Figma "การแจ้งเตือน" (logic โหลด/poll/อ่านทั้งหมด/แตะไปหน้าที่เกี่ยวข้องเดิมไม่เปลี่ยน)
  return (
    <View style={styles.container}>
      <SkyHeader rounded={0}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={10}>
            <Ionicons name="arrow-back" size={20} color={colors.white} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>การแจ้งเตือน</Text>
            <Text style={styles.headerSubtitle}>ทุกความเคลื่อนไหว ไม่พลาดทุกนัดสำคัญ</Text>
          </View>
          <View style={styles.headerBadge}>
            <Ionicons name="notifications-outline" size={24} color={colors.white} />
          </View>
        </View>
      </SkyHeader>

      <FlatList
        data={rows}
        keyExtractor={(row) => row.key}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => load(true)} tintColor={colors.primary} />}
        renderItem={renderItem}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyBox}>
              {/* ✏️ แก้ไข: ใช้ภาพประกอบกระดิ่งจาก Figma แทนไอคอนวงกลม */}
              <Image source={require('../../assets/illustrations/notifications-empty.jpg')} style={styles.emptyArt} resizeMode="cover" />
              <View style={{ gap: 8 }}>
                <Text style={styles.emptyTitle}>ตอนนี้ยังไม่มีการแจ้งเตือน</Text>
                <Text style={styles.emptyText}>
                  เมื่อมีคำขอเป็นเพื่อนหรือนัดหมายใหม่{'\n'}เราจะแจ้งให้คุณรู้ที่นี่{'\n'}ระหว่างนี้ ไปหาเพื่อนเล่นกีฬากัน!
                </Text>
              </View>
              <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate('Events')}>
                <Ionicons name="search" size={18} color={colors.white} />
                <Text style={styles.emptyButtonText}>ค้นหากิจกรรม</Text>
              </TouchableOpacity>
              <View style={styles.emptyNote}>
                <Ionicons name="notifications-outline" size={18} color={colors.primaryDark} />
                <Text style={styles.emptyNoteText}>คุณจะไม่พลาดนัดสำคัญกับเพื่อน</Text>
              </View>
            </View>
          )
        }
      />
    </View>
  );
}
