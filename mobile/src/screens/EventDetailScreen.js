import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, Image, TextInput, Modal, ActivityIndicator } from 'react-native';
// ✏️ แก้ไข: ใช้ AppIcon (Lucide ตาม Figma) แทน Ionicons ตรงๆ — API เดียวกัน
import Ionicons from '../components/AppIcon';
import { useFocusEffect } from '@react-navigation/native';
import {
  getEventRequest,
  joinEventRequest,
  leaveEventRequest,
  deleteEventRequest,
  completeEventRequest,
  // ➕ เพิ่ม: host อนุมัติ/ปฏิเสธคำขอเข้าร่วม
  approveJoinRequestRequest,
  declineJoinRequestRequest,
} from '../api/events';
// ➕ เพิ่ม: ระบบรีวิวหลังกิจกรรมจบ
import { createReviewRequest, listEventReviewsRequest } from '../api/reviews';
// ➕ เพิ่ม: ระบบบล็อกผู้เล่นส่วนตัว (เฉพาะ host บล็อกผู้เข้าร่วมได้) + ดูโปรไฟล์คนที่ขอเข้าร่วม
import { blockUserRequest, getUserByIdRequest } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { resolveAssetUrl } from '../api/client';
import StarRating from '../components/StarRating';
import { skillLevelLabel, SPORTS } from '../constants/options';
// ➕ เพิ่ม: header ไล่เฉดฟ้ากลางตาม Figma
import SkyHeader from '../components/SkyHeader';
import colors from '../theme/colors';
// ✏️ แก้ไข: ย้ายไฟล์สไตล์จาก screens/ ไปไว้โฟลเดอร์ src/Style/ แยกต่างหาก ให้แยกส่วน UI ชัดเจนขึ้น
import styles from '../Style/EventDetailScreen.styles';

export default function EventDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [busy, setBusy] = useState(false);
  // ➕ เพิ่ม: state สำหรับระบบรีวิวหลังกิจกรรมจบ
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  // ➕ เพิ่ม: state หน้าต่างเล็กๆ โชว์โปรไฟล์ (ฝีมือ/กีฬา) ของคนที่ขอเข้าร่วม ให้ host เช็คก่อนอนุมัติ
  const [viewingProfile, setViewingProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const openProfile = async (userId) => {
    setLoadingProfile(true);
    try {
      const data = await getUserByIdRequest(userId);
      setViewingProfile(data.user);
    } catch (err) {
      Alert.alert('โหลดโปรไฟล์ไม่สำเร็จ', err.response?.data?.message || err.message);
    } finally {
      setLoadingProfile(false);
    }
  };

  const load = useCallback(async () => {
    try {
      const data = await getEventRequest(id);
      setEvent(data.event);
      if (data.event.status === 'completed') {
        const reviewData = await listEventReviewsRequest(id);
        setReviews(reviewData.reviews || []);
      }
    } catch (err) {
      Alert.alert('โหลดข้อมูลไม่สำเร็จ', err.response?.data?.message || err.message);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // ✏️ แก้ไข: หน้าโหลดมี SkyHeader + ปุ่มย้อนกลับเหมือนหน้าจริง (เดิมแสดงแค่ข้อความ "กำลังโหลด...") เพราะซ่อม header ของ native-stack แล้ว
  if (!event) {
    return (
      <View style={styles.container}>
        <SkyHeader>
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={10}>
              <Ionicons name="arrow-back" size={20} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>รายละเอียดกิจกรรม</Text>
          </View>
        </SkyHeader>
        <View style={styles.loadingWrap}>
          <Text style={styles.muted}>กำลังโหลด...</Text>
        </View>
      </View>
    );
  }

  const isJoined = event.participants?.some((p) => p._id === user?.id);
  // ➕ เพิ่ม: กดขอเข้าร่วมไปแล้วแต่ host ยังไม่อนุมัติ
  const isPending = event.pendingParticipants?.some((p) => p._id === user?.id);
  const isHost = event.host?._id === user?.id;
  const isCompleted = event.status === 'completed';

  // ➕ เพิ่ม: หาว่าฉันยังต้องรีวิวใครอีกบ้าง — host รีวิวได้ทุกคนที่เข้าร่วม, ผู้เข้าร่วมรีวิวได้แค่ host
  const reviewedTargetIds = new Set(
    reviews.filter((r) => r.from._id === user?.id).map((r) => r.to._id)
  );
  // ✏️ แก้ไข: host ถูกใส่เป็น participants[0] ตั้งแต่สร้างกิจกรรม เดิมเลยไม่ได้กรองตัวเองออก ทำให้ currentTarget
  // ของ host เป็น "ตัวเอง" เสมอ (ส่งรีวิวไม่ได้ — backend ตอบ "รีวิวตัวเองไม่ได้") และไม่เคยไล่ถึงผู้เล่นคนอื่นเลย
  const pendingTargets = isHost
    ? (event.participants || []).filter((p) => p._id !== user?.id && !reviewedTargetIds.has(p._id))
    : isJoined && event.host && !reviewedTargetIds.has(event.host._id)
    ? [event.host]
    : [];
  const currentTarget = pendingTargets[0] || null;

  const handleComplete = () => {
    // ✏️ แก้ไข: บอกเรื่องเวลารีวิว 5 นาทีให้ชัดเจนก่อนกด เพราะ eventCleanupJob จะลบกิจกรรมทิ้งจริงหลังจากนั้น
    Alert.alert(
      'จบกิจกรรมนี้?',
      'หลังจบกิจกรรมแล้ว ผู้จัดและผู้เข้าร่วมจะมีเวลา 5 นาทีให้รีวิวกัน จากนั้นกิจกรรมนี้จะถูกลบออกจากระบบถาวร ย้อนกลับไม่ได้',
      [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'จบกิจกรรม',
        onPress: async () => {
          setBusy(true);
          try {
            await completeEventRequest(id);
            await load();
          } catch (err) {
            Alert.alert('ทำรายการไม่สำเร็จ', err.response?.data?.message || err.message);
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  const submitReview = async () => {
    if (!currentTarget) return;
    if (reviewRating < 1) {
      Alert.alert('ให้คะแนนก่อน', 'กรุณาเลือกจำนวนดาว 1-5 ดาว');
      return;
    }
    setSubmittingReview(true);
    try {
      await createReviewRequest(id, { to: currentTarget._id, rating: reviewRating, comment: reviewComment.trim() });
      setReviewRating(0);
      setReviewComment('');
      await load();
    } catch (err) {
      Alert.alert('ส่งรีวิวไม่สำเร็จ', err.response?.data?.message || err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  // ✏️ แก้ไข: เข้าร่วมตอนนี้เป็นแค่ "ส่งคำขอ" ต้องรอ host อนุมัติ — ปุ่มเดียวกันนี้ใช้ยกเลิกคำขอที่รออยู่
  // (isPending) หรือออกจากกิจกรรมที่เข้าร่วมแล้วจริง (isJoined) ก็ได้ ฝั่ง backend endpoint /leave รองรับทั้งคู่
  const toggleJoin = async () => {
    setBusy(true);
    try {
      if (isJoined || isPending) {
        await leaveEventRequest(id);
      } else {
        await joinEventRequest(id);
      }
      await load();
    } catch (err) {
      Alert.alert('ทำรายการไม่สำเร็จ', err.response?.data?.message || err.message);
    } finally {
      setBusy(false);
    }
  };

  // ➕ เพิ่ม: host อนุมัติ/ปฏิเสธคำขอเข้าร่วม
  const handleApprove = async (participant) => {
    setBusy(true);
    try {
      await approveJoinRequestRequest(id, participant._id);
      await load();
    } catch (err) {
      Alert.alert('อนุมัติไม่สำเร็จ', err.response?.data?.message || err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDecline = async (participant) => {
    setBusy(true);
    try {
      await declineJoinRequestRequest(id, participant._id);
      await load();
    } catch (err) {
      Alert.alert('ปฏิเสธไม่สำเร็จ', err.response?.data?.message || err.message);
    } finally {
      setBusy(false);
    }
  };

  // ➕ เพิ่ม: host บล็อกผู้เข้าร่วมที่มีพฤติกรรมไม่เหมาะสม — บล็อกแล้วคนนั้นเข้าร่วม event ในอนาคตของ host คนนี้ไม่ได้อีก
  const handleBlock = (participant) => {
    Alert.alert(
      `บล็อก ${participant.name}?`,
      'คนนี้จะเข้าร่วมกิจกรรมในอนาคตของคุณไม่ได้อีก (ไม่กระทบกิจกรรมนี้ที่เข้าร่วมอยู่แล้ว)',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'บล็อก',
          style: 'destructive',
          onPress: async () => {
            try {
              await blockUserRequest(participant._id);
              Alert.alert('บล็อกแล้ว', `บล็อก ${participant.name} เรียบร้อย`);
            } catch (err) {
              Alert.alert('บล็อกไม่สำเร็จ', err.response?.data?.message || err.message);
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert('ลบกิจกรรมนี้?', 'การลบไม่สามารถย้อนกลับได้', [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ลบกิจกรรม',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await deleteEventRequest(id);
            navigation.goBack();
          } catch (err) {
            Alert.alert('ลบไม่สำเร็จ', err.response?.data?.message || err.message);
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  // ✏️ แก้ไข: layout ใหม่ทั้งหมดตาม Figma "รายละเอียดกิจกรรม" — SkyHeader (ย้อนกลับ + ชื่อหน้า + ชิปกีฬา + สถานะ/ปุ่มผู้จัด),
  // เนื้อหา (ชื่อ, การ์ดข้อมูล, เกี่ยวกับแมตช์, ผู้จัด, คำขอเข้าร่วม[ผู้จัด], เพื่อนร่วมแมตช์ + progress), แถบปุ่มล่าง
  // (แชทกลุ่ม + ปุ่มหลักเหลือง: ผู้จัด = "แก้ไขกิจกรรม", ผู้เล่น = เข้าร่วม/ออก/รออนุมัติ) — logic ทั้งหมดด้านบนไม่เปลี่ยน
  const spotsLeft = Math.max((event.maxParticipants || 0) - (event.participants?.length || 0), 0);
  const eventDate = new Date(event.dateTime);
  const dateLabel = eventDate.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const timeLabel = eventDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false });
  const sportIcon = SPORTS.find((s) => s.label === event.sport)?.icon || 'football-outline';
  const capacityPct = Math.min(100, Math.round(((event.participants?.length || 0) / (event.maxParticipants || 1)) * 100));
  const canChat = isJoined || isHost;

  const renderAvatar = (p, avatarStyle, imageStyle, textStyle) => (
    <View style={avatarStyle}>
      {p?.avatar ? (
        <Image source={{ uri: resolveAssetUrl(p.avatar) }} style={imageStyle} />
      ) : (
        <Text style={textStyle}>{p?.name?.[0]?.toUpperCase() || '?'}</Text>
      )}
    </View>
  );

  return (
    // ✏️ แก้ไข: ห่อด้วย Fragment เพราะเพิ่ม Modal โปรไฟล์เป็น sibling ของ View หลักด้านล่าง
    <>
      <View style={styles.container}>
        <SkyHeader extraBottom={8}>
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={10}>
              <Ionicons name="arrow-back" size={20} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>รายละเอียดกิจกรรม</Text>
          </View>
          <View style={styles.topRow}>
            <View style={styles.sportChip}>
              <Ionicons name={sportIcon} size={17} color={colors.white} />
              <Text style={styles.sportChipText}>{event.sport}</Text>
            </View>
            {isHost ? (
              <View style={styles.hostActions}>
                {/* ➕ เพิ่ม: ปุ่ม "จบกิจกรรม" (host action ไม่ใช้ colors.cta) ให้กดได้ตราบใดที่ยังไม่จบ/ยกเลิก */}
                {!isCompleted && event.status !== 'cancelled' && (
                  <TouchableOpacity style={styles.hostActionButton} onPress={handleComplete} disabled={busy}>
                    <Ionicons name="checkmark-done-outline" size={16} color={colors.white} />
                    <Text style={styles.hostActionText}>จบกิจกรรม</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.hostActionButton}
                  onPress={() => navigation.navigate('CreateEvent', { event })}
                >
                  <Ionicons name="create-outline" size={16} color={colors.white} />
                  <Text style={styles.hostActionText}>แก้ไข</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.hostActionButton} onPress={handleDelete} disabled={busy}>
                  <Ionicons name="trash-outline" size={16} color={colors.white} />
                  <Text style={styles.hostActionText}>ลบ</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.spotsText}>{spotsLeft > 0 ? `ว่างอีก ${spotsLeft} ที่` : 'เต็มแล้ว'}</Text>
            )}
          </View>
        </SkyHeader>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>{event.title}</Text>

          <View style={styles.metaCard}>
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={17} color={colors.primaryDark} />
              <Text style={styles.metaText}>
                {dateLabel} • {timeLabel} น.
              </Text>
            </View>
            {!!event.location?.address && (
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={17} color={colors.primaryDark} />
                <Text style={styles.metaText}>{event.location.address}</Text>
              </View>
            )}
            <View style={styles.metaRow}>
              <Ionicons name="stats-chart-outline" size={17} color={colors.primaryDark} />
              <Text style={styles.metaText}>
                {skillLevelLabel(event.skillLevel)} • รับสูงสุด {event.maxParticipants} คน
              </Text>
            </View>
          </View>

          {!!event.description && (
            <View style={styles.aboutBox}>
              <Text style={styles.sectionTitle}>เกี่ยวกับแมตช์นี้</Text>
              <Text style={styles.description}>{event.description}</Text>
            </View>
          )}

          {!!event.host && (
            <View style={styles.hostRow}>
              {renderAvatar(event.host, styles.hostAvatar, styles.hostAvatarImage, styles.hostAvatarText)}
              <View style={{ flex: 1 }}>
                <Text style={styles.hostName}>
                  {event.host.name}
                  {isHost ? ' (คุณ)' : ''}
                </Text>
                <Text style={styles.hostRole}>ผู้จัดกิจกรรม</Text>
              </View>
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
            </View>
          )}

          {/* ➕ เพิ่ม: host เห็นรายชื่อคนที่ขอเข้าร่วมแล้วรออนุมัติอยู่ กดอนุมัติ/ปฏิเสธได้ทีละคน */}
          {isHost && event.pendingParticipants?.length > 0 && (
            <View style={styles.requestsCard}>
              <View style={styles.headingRow}>
                <Text style={[styles.sectionTitle, { flex: 1 }]}>คำขอเข้าร่วม</Text>
                <Text style={styles.headingCount}>{event.pendingParticipants.length} คน</Text>
              </View>
              {event.pendingParticipants.map((p) => (
                <View key={p._id} style={styles.requestRow}>
                  {/* ✏️ แก้ไข: คลิกชื่อ/รูปเพื่อเช็คโปรไฟล์ฝีมือก่อนตัดสินใจอนุมัติ */}
                  <TouchableOpacity style={styles.requestPerson} onPress={() => openProfile(p._id)}>
                    {renderAvatar(p, styles.participantAvatar, styles.participantAvatarImage, styles.participantAvatarText)}
                    <Text style={styles.requestName} numberOfLines={1}>{p.name}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.circleButton, styles.declineButton]}
                    onPress={() => handleDecline(p)}
                    disabled={busy}
                  >
                    <Ionicons name="close" size={20} color={colors.danger} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.circleButton, styles.acceptButton]}
                    onPress={() => handleApprove(p)}
                    disabled={busy}
                  >
                    <Ionicons name="checkmark" size={20} color={colors.success} />
                  </TouchableOpacity>
                </View>
              ))}
              <View style={styles.requestLabels}>
                <Text style={styles.declineLabel}>ปฏิเสธ</Text>
                <Text style={styles.acceptLabel}>ยอมรับ</Text>
              </View>
            </View>
          )}

          <View style={styles.participantsBox}>
            <View style={styles.headingRow}>
              <Text style={[styles.sectionTitle, { flex: 1 }]}>เพื่อนร่วมแมตช์</Text>
              <Text style={styles.headingCount}>
                {event.participants?.length || 0}/{event.maxParticipants} คน
              </Text>
            </View>
            <View style={styles.participantList}>
              {(event.participants || []).map((p) => (
                <View key={p._id} style={styles.participantItem}>
                  {renderAvatar(p, styles.participantAvatar, styles.participantAvatarImage, styles.participantAvatarText)}
                  <Text style={styles.participantName} numberOfLines={1}>{p.name}</Text>
                  {/* ➕ เพิ่ม: ปุ่มบล็อก โชว์เฉพาะ host และไม่โชว์บนแถวของตัวเอง */}
                  {isHost && p._id !== user?.id && (
                    <TouchableOpacity onPress={() => handleBlock(p)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="person-remove-outline" size={16} color={colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
            <View style={styles.capacityTrack}>
              <View style={[styles.capacityFill, { width: `${capacityPct}%` }]} />
            </View>
          </View>

          {/* ➕ เพิ่ม: กิจกรรมจบแล้ว — ให้รีวิวคนที่ยังไม่ได้รีวิว (host รีวิวผู้เล่นทีละคน / ผู้เล่นรีวิว host) */}
          {isCompleted && currentTarget && (
            <View style={styles.reviewCard}>
              <Text style={styles.sectionTitle}>ให้คะแนน {currentTarget.name}</Text>
              {/* ➕ เพิ่ม: เตือนเรื่องเวลารีวิว 5 นาที ก่อนกิจกรรมนี้จะถูกลบทิ้งจริง */}
              <Text style={styles.reviewDeadlineHint}>เหลือเวลารีวิวประมาณ 5 นาทีหลังจบกิจกรรม จากนั้นกิจกรรมนี้จะถูกลบถาวร</Text>
              <View style={styles.reviewTargetRow}>
                {renderAvatar(currentTarget, styles.participantAvatar, styles.participantAvatarImage, styles.participantAvatarText)}
                <StarRating value={reviewRating} onChange={setReviewRating} size={26} />
              </View>
              <TextInput
                style={styles.reviewInput}
                placeholder="เขียนความเห็นเพิ่มเติม (ไม่บังคับ)"
                placeholderTextColor={colors.muted}
                value={reviewComment}
                onChangeText={setReviewComment}
                multiline
              />
              <TouchableOpacity style={styles.reviewSubmit} activeOpacity={0.8} onPress={submitReview} disabled={submittingReview}>
                <Text style={styles.primaryButtonText}>{submittingReview ? 'กำลังส่ง...' : 'ส่งรีวิว'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {isCompleted && reviews.length > 0 && (
            <View style={styles.reviewCard}>
              <Text style={styles.sectionTitle}>รีวิวของกิจกรรมนี้</Text>
              {reviews.map((r) => (
                <View key={r._id} style={styles.reviewRow}>
                  <View style={styles.reviewRowHeader}>
                    <Text style={styles.reviewRowName}>
                      {r.from.name} ➜ {r.to.name}
                    </Text>
                    <StarRating value={r.rating} size={14} />
                  </View>
                  {!!r.comment && <Text style={styles.reviewComment}>{r.comment}</Text>}
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* ✏️ แก้ไข: แถบปุ่มล่างคงที่ — ปุ่มแชทกลุ่ม (เห็นเมื่อเป็นผู้เข้าร่วม/ผู้จัด) + ปุ่มหลัก
            ผู้จัด = "แก้ไขกิจกรรม" (ตาม Figma; เดิมผู้จัดก็เห็นปุ่มออกจากแมตช์ซึ่งไม่สมเหตุสมผล)
            ผู้เล่น = 3 สถานะเดิม: ขอเข้าร่วม / รออนุมัติ (แตะเพื่อยกเลิก) / ออกจากแมตช์ */}
        {!isCompleted && (
          <View style={styles.actionBar}>
            {canChat && (
              <TouchableOpacity
                style={styles.chatButton}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('PartyChat', { id, title: event.title })}
              >
                <Ionicons name="chatbubbles-outline" size={19} color={colors.ctaText} />
                <Text style={styles.chatButtonText}>แชทกลุ่ม</Text>
              </TouchableOpacity>
            )}
            {isHost ? (
              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('CreateEvent', { event })}
              >
                <Ionicons name="create-outline" size={19} color={colors.ctaText} />
                <Text style={styles.primaryButtonText}>แก้ไขกิจกรรม</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.primaryButton, (isJoined || isPending) && styles.primaryButtonLeave]}
                activeOpacity={0.8}
                onPress={toggleJoin}
                disabled={busy}
              >
                <Text style={[styles.primaryButtonText, (isJoined || isPending) && styles.primaryButtonTextLeave]}>
                  {isJoined ? 'ออกจากแมตช์' : isPending ? 'รอการอนุมัติ (แตะเพื่อยกเลิก)' : 'ขอเข้าร่วมแมตช์'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* ➕ เพิ่ม: หน้าต่างเล็กๆ (popup) โชว์โปรไฟล์ฝีมือของคนที่ขอเข้าร่วม — เปิดจากการกดชื่อ/รูปในลิสต์คำขอเข้าร่วม */}
      <Modal
        visible={loadingProfile || !!viewingProfile}
        transparent
        animationType="fade"
        onRequestClose={() => setViewingProfile(null)}
      >
        <View style={styles.profileModalBackdrop}>
          <View style={styles.profileModalCard}>
            {loadingProfile ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              viewingProfile && (
                <>
                  <TouchableOpacity
                    style={styles.profileModalClose}
                    onPress={() => setViewingProfile(null)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close" size={22} color={colors.muted} />
                  </TouchableOpacity>

                  <View style={styles.profileModalAvatar}>
                    {viewingProfile.avatar ? (
                      <Image source={{ uri: resolveAssetUrl(viewingProfile.avatar) }} style={styles.profileModalAvatarImage} />
                    ) : (
                      <Text style={styles.profileModalAvatarText}>{viewingProfile.name?.[0]?.toUpperCase() || '?'}</Text>
                    )}
                  </View>
                  <Text style={styles.profileModalName}>{viewingProfile.name}</Text>
                  {!!viewingProfile.bio && <Text style={styles.profileModalBio}>{viewingProfile.bio}</Text>}

                  <Text style={styles.profileModalSectionTitle}>กีฬาที่เล่น</Text>
                  {viewingProfile.sports?.length > 0 ? (
                    <View style={styles.profileModalSportRow}>
                      {viewingProfile.sports.map((s) => (
                        <View key={s.name} style={styles.profileModalSportChip}>
                          <Text style={styles.profileModalSportChipText}>
                            {s.name} · {skillLevelLabel(s.level)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.profileModalEmpty}>ยังไม่ได้ระบุกีฬาที่เล่น</Text>
                  )}
                </>
              )
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}
