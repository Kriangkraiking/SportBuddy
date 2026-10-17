import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
// ✏️ แก้ไข: ใช้ AppIcon (Lucide ตาม Figma) แทน Ionicons ตรงๆ — API เดียวกัน
import Ionicons from '../components/AppIcon';
import { useFocusEffect } from '@react-navigation/native';
import { listMessagesRequest, sendMessageRequest } from '../api/messages';
// ➕ เพิ่ม: ดึงข้อมูลกิจกรรมมาแสดงแถบสรุป (วันเวลา/สถานที่/จำนวนคน) ใต้ header ตาม Figma
import { getEventRequest } from '../api/events';
import { SPORTS } from '../constants/options';
import { resolveAssetUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';
// ✏️ แก้ไข: ย้ายไฟล์สไตล์จาก screens/ ไปไว้โฟลเดอร์ src/Style/ แยกต่างหาก ให้แยกส่วน UI ชัดเจนขึ้น
import styles from '../Style/PartyChatScreen.styles';

const POLL_INTERVAL_MS = 4000;

export default function PartyChatScreen({ route, navigation }) {
  const { id: eventId } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const listRef = useRef(null);
  // ➕ เพิ่ม: ข้อมูลกิจกรรมสำหรับแถบสรุปและหัวข้อ (โหลดครั้งเดียว ล้มเหลวก็ไม่กระทบแชท)
  const [event, setEvent] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getEventRequest(eventId)
      .then((data) => {
        if (!cancelled) setEvent(data.event);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  // ✏️ แก้ไข: หัวข้อ header ตาม Figma — "แชทกลุ่ม" ตัวหนา + บรรทัดรอง "ชื่อกิจกรรม • สมาชิก N คน"
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View>
          <Text style={styles.headerTitle}>แชทกลุ่ม</Text>
          {!!event && (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {event.title} • สมาชิก {event.participants?.length || 0} คน
            </Text>
          )}
        </View>
      ),
    });
  }, [navigation, event]);

  const load = useCallback(
    async (isInitial) => {
      try {
        const data = await listMessagesRequest(eventId);
        setMessages(data.messages);
        setErrorMessage(null);
      } catch (err) {
        setErrorMessage(err.response?.data?.message || 'โหลดแชทไม่สำเร็จ');
      } finally {
        if (isInitial) setLoading(false);
      }
    },
    [eventId]
  );

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

  useEffect(() => {
    if (messages.length) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSending(true);
    setText('');
    try {
      await sendMessageRequest(eventId, trimmed);
      await load(false);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'ส่งข้อความไม่สำเร็จ');
      setText(trimmed);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primaryDark} />
      </View>
    );
  }

  if (errorMessage && messages.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="lock-closed-outline" size={32} color={colors.muted} />
        <Text style={styles.errorText}>{errorMessage}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {!!event && (
        <View style={styles.eventBanner}>
          <View style={styles.eventBannerIcon}>
            <Ionicons
              name={SPORTS.find((x) => x.label === event.sport)?.icon || 'sport-football'}
              size={20}
              color={colors.primaryDark}
            />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.eventBannerTitle} numberOfLines={1}>
              {new Date(event.dateTime).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })} •{' '}
              {new Date(event.dateTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false })} น.
            </Text>
            <Text style={styles.eventBannerSub} numberOfLines={1}>
              {event.location?.address || 'ไม่ระบุสถานที่'} • {event.participants?.length || 0}/{event.maxParticipants} คน
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.primaryDark} />
        </View>
      )}

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="chatbubbles-outline" size={30} color={colors.primaryDark} />
            <Text style={styles.empty}>ยังไม่มีข้อความ ทักทายเพื่อนร่วมแมตช์ได้เลย!</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isMine = item.sender?._id === user?.id;
          return (
            <View style={[styles.messageRow, isMine && styles.messageRowMine]}>
              {/* ✏️ แก้ไข: แสดงรูปโปรไฟล์จริงของผู้ส่ง (ถ้ามีอัปโหลดไว้) แทนที่จะโชว์แค่ตัวอักษรแรกของชื่อ */}
              {!isMine && (
                <View style={styles.avatar}>
                  {item.sender?.avatar ? (
                    <Image source={{ uri: resolveAssetUrl(item.sender.avatar) }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>{item.sender?.name?.[0]?.toUpperCase() || '?'}</Text>
                  )}
                </View>
              )}
              <View style={{ maxWidth: '75%' }}>
                {!isMine && <Text style={styles.senderName}>{item.sender?.name}</Text>}
                <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
                  <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>{item.text}</Text>
                </View>
                <Text style={[styles.time, isMine && styles.timeMine]}>
                  {new Date(item.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          );
        }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="พิมพ์ข้อความ..."
          placeholderTextColor={colors.muted}
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, (!text.trim() || sending) && styles.sendButtonDisabled]}
          activeOpacity={0.8}
          onPress={handleSend}
          disabled={!text.trim() || sending}
        >
          {/* ✏️ แก้ไข: ปุ่มส่งพื้นมินท์ใหม่สว่างขึ้น ไอคอนขาวอ่านไม่ออก เปลี่ยนเป็น ink เข้ม */}
          <Ionicons name="send" size={18} color={colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
