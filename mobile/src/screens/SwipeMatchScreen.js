import React, { useCallback, useRef, useState } from 'react';
import { View, Text, Image, Animated, PanResponder, TouchableOpacity, Dimensions, Alert, Modal } from 'react-native';
// ✏️ แก้ไข: ใช้ AppIcon (Lucide ตาม Figma) แทน Ionicons ตรงๆ — API เดียวกัน
import Ionicons from '../components/AppIcon';
import { useFocusEffect } from '@react-navigation/native';
import { resolveAssetUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getMatchCandidatesRequest, swipeMatchRequest } from '../api/match';
// ➕ เพิ่ม: header ไล่เฉดฟ้ากลาง + รายการกีฬา (ไอคอนบนชิป) + skillLevelLabel
import SkyHeader from '../components/SkyHeader';
import { SPORTS, skillLevelLabel } from '../constants/options';
import colors from '../theme/colors';
import styles from '../Style/SwipeMatchScreen.styles';

// ➕ เพิ่ม: หน้าปัดหาคู่กีฬาแบบ Tinder — ใช้ Animated + PanResponder ของ RN เอง
// (ไม่เพิ่ม dependency ใหม่อย่าง react-native-deck-swiper) รับ sport/skillLevel มาจาก MatchingScreen
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;

// ✏️ แก้ไข: การ์ดโปรไฟล์ตาม Figma — รูปด้านบน (scrim + ชื่อ/เมืองซ้อนบนรูป) แล้วด้านล่างชิปกีฬา (ตัวแรก active) + ระดับฝีมือ + bio
// (ไม่มีข้อมูลอายุ/ระยะทาง/% เข้ากันได้จาก backend จึงไม่แสดงส่วนเหล่านั้น)
function CandidateCard({ candidate }) {
  const sports = candidate.sports || [];
  const level = sports[0]?.level;
  return (
    <>
      <View style={styles.portrait}>
        {candidate.avatar ? (
          <Image source={{ uri: resolveAssetUrl(candidate.avatar) }} style={styles.avatarImage} resizeMode="cover" />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarFallbackText}>{candidate.name?.[0]?.toUpperCase() || '?'}</Text>
          </View>
        )}
        <View style={styles.scrim} />
        <View style={styles.identity}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{candidate.name}</Text>
            <Ionicons name="checkmark-circle-outline" size={22} color={colors.white} />
          </View>
          {!!candidate.location?.city && <Text style={styles.locationText}>{candidate.location.city}</Text>}
        </View>
      </View>
      <View style={styles.details}>
        <View style={styles.chipRow}>
          {sports.slice(0, 3).map((s, i) => (
            <View key={s.name} style={[styles.chip, i === 0 && styles.chipActive]}>
              <Ionicons
                name={SPORTS.find((x) => x.label === s.name)?.icon || 'football-outline'}
                size={17}
                color={i === 0 ? colors.white : colors.primaryDark}
              />
              <Text style={[styles.chipText, i === 0 && styles.chipTextActive]}>{s.name}</Text>
            </View>
          ))}
          {!!level && (
            <View style={styles.chip}>
              <Text style={styles.chipText}>{skillLevelLabel(level)}</Text>
            </View>
          )}
        </View>
        {!!candidate.bio && <Text style={styles.bio} numberOfLines={3}>{candidate.bio}</Text>}
      </View>
    </>
  );
}

export default function SwipeMatchScreen({ route, navigation }) {
  const { sport, skillLevel } = route.params || {};
  const [candidates, setCandidates] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;
  // ➕ เพิ่ม: เก็บคนที่จับคู่สำเร็จไว้แสดงใน modal จับคู่สำเร็จ ตาม Figma (แทน Alert เดิม)
  const [matchedUser, setMatchedUser] = useState(null);
  const { user: me } = useAuth();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMatchCandidatesRequest({ sport, skillLevel });
      setCandidates(data.candidates || []);
      setIndex(0);
    } catch (err) {
      Alert.alert('โหลดรายชื่อไม่สำเร็จ', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [sport, skillLevel]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const respond = useCallback(
    async (direction, candidate) => {
      if (!candidate) return;
      try {
        const result = await swipeMatchRequest({ to: candidate.id, sport, direction });
        if (result.matched) {
          setMatchedUser(candidate);
        }
      } catch (err) {
        Alert.alert('ส่งผลปัดไม่สำเร็จ', err.response?.data?.message || err.message);
      }
      position.setValue({ x: 0, y: 0 });
      setIndex((i) => i + 1);
    },
    [sport, position]
  );

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 6,
      onPanResponderMove: Animated.event([null, { dx: position.x, dy: position.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gesture) => {
        const swipedCandidate = candidates[index];
        if (gesture.dx > SWIPE_THRESHOLD) {
          Animated.timing(position, {
            toValue: { x: SCREEN_WIDTH + 100, y: gesture.dy },
            duration: 220,
            useNativeDriver: false,
          }).start(() => respond('right', swipedCandidate));
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          Animated.timing(position, {
            toValue: { x: -SCREEN_WIDTH - 100, y: gesture.dy },
            duration: 220,
            useNativeDriver: false,
          }).start(() => respond('left', swipedCandidate));
        } else {
          Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
  });
  const likeOpacity = position.x.interpolate({
    inputRange: [20, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const nopeOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, -20],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const current = candidates[index];
  const upNext = candidates[index + 1];

  const buttonSwipe = (direction) => {
    const swipedCandidate = candidates[index];
    Animated.timing(position, {
      toValue: { x: direction === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100, y: 0 },
      duration: 220,
      useNativeDriver: false,
    }).start(() => respond(direction, swipedCandidate));
  };

  // ✏️ แก้ไข: layout ตาม Figma "จับคู่ • ปัดหาเพื่อน" — SkyHeader + สำรับการ์ด + ปุ่ม ✕/♥ + ข้อความแนะนำ + modal จับคู่สำเร็จ
  // (logic ปัด/โหลด/ส่งผลเดิมไม่เปลี่ยน; ปุ่มหลักของ modal ไปหน้า "เพื่อน" แทน "เริ่มแชท" เพราะแอปยังไม่มีแชทส่วนตัว มีแต่แชทกลุ่มของกิจกรรม)
  return (
    <View style={styles.container}>
      <SkyHeader extraBottom={64}>
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={10}>
            <Ionicons name="arrow-back" size={20} color={colors.white} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>เจอเพื่อนที่ใช่</Text>
            <Text style={styles.headerSubtitle}>ปัดขวา แล้วออกไปเล่นด้วยกัน</Text>
          </View>
          <Ionicons name="sparkles-outline" size={25} color={colors.white} />
        </View>
      </SkyHeader>

      <View style={styles.body}>
        <View style={styles.deck}>
          {!loading && !current && (
            <View style={styles.emptyBox}>
              <Ionicons name="people-outline" size={40} color={colors.muted} />
              <Text style={styles.emptyText}>
                ตอนนี้ยังไม่มีคนให้ปัดเพิ่มแล้ว{'\n'}ลองเปลี่ยนกีฬาหรือโหลดใหม่อีกครั้ง
              </Text>
              <TouchableOpacity style={styles.reloadButton} onPress={load}>
                <Text style={styles.reloadButtonText}>โหลดใหม่</Text>
              </TouchableOpacity>
            </View>
          )}

          {upNext && <View style={[styles.card, styles.cardBehind]} />}

          {current && (
            <Animated.View
              {...panResponder.panHandlers}
              style={[
                styles.card,
                { transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }] },
              ]}
            >
              <CandidateCard candidate={current} />
              <Animated.View style={[styles.badge, styles.likeBadge, { opacity: likeOpacity }]}>
                <Text style={styles.likeBadgeText}>ใช่เลย</Text>
              </Animated.View>
              <Animated.View style={[styles.badge, styles.nopeBadge, { opacity: nopeOpacity }]}>
                <Text style={styles.nopeBadgeText}>ข้าม</Text>
              </Animated.View>
            </Animated.View>
          )}
        </View>

        {current && (
          <>
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.skipButton} onPress={() => buttonSwipe('left')}>
                <Ionicons name="close" size={30} color={colors.muted} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.likeButton} onPress={() => buttonSwipe('right')}>
                <Ionicons name="heart" size={32} color={colors.primaryDark} />
              </TouchableOpacity>
            </View>
            <Text style={styles.hint}>ปัดซ้ายเพื่อข้าม • ปัดขวาเพื่อชวนเล่นกีฬา</Text>
          </>
        )}
      </View>

      {/* ➕ เพิ่ม: modal "จับคู่สำเร็จ!" ตาม Figma — แสดงเมื่อทั้งสองฝ่ายปัดขวาให้กัน */}
      <Modal visible={!!matchedUser} transparent animationType="fade" onRequestClose={() => setMatchedUser(null)}>
        <View style={styles.modalBackdrop}>
          {!!matchedUser && (
            <View style={styles.modalCard}>
              <TouchableOpacity style={styles.modalClose} onPress={() => setMatchedUser(null)} hitSlop={10}>
                <Ionicons name="close" size={20} color={colors.muted} />
              </TouchableOpacity>
              <View style={styles.celebrationBadge}>
                <Ionicons name="sparkles-outline" size={15} color={colors.ctaText} />
                <Text style={styles.celebrationBadgeText}>ได้เพื่อนร่วมทีมแล้ว</Text>
              </View>
              <View style={styles.portraits}>
                <View style={styles.halo} />
                <View style={styles.portrait96}>
                  {me?.avatar ? (
                    <Image source={{ uri: resolveAssetUrl(me.avatar) }} style={styles.portrait96Image} />
                  ) : (
                    <Text style={styles.portrait96Text}>{me?.name?.[0]?.toUpperCase() || '?'}</Text>
                  )}
                </View>
                <View style={styles.portrait96}>
                  {matchedUser.avatar ? (
                    <Image source={{ uri: resolveAssetUrl(matchedUser.avatar) }} style={styles.portrait96Image} />
                  ) : (
                    <Text style={styles.portrait96Text}>{matchedUser.name?.[0]?.toUpperCase() || '?'}</Text>
                  )}
                </View>
                <View style={styles.connectionHeart}>
                  <Ionicons name="heart" size={26} color={colors.primaryDark} />
                </View>
              </View>
              <View style={{ gap: 6 }}>
                <Text style={styles.celebrationTitle}>จับคู่สำเร็จ!</Text>
                <Text style={styles.celebrationText}>
                  คุณกับ{matchedUser.name}ชอบ{sport}เหมือนกัน{'\n'}ทักทายเพื่อนใหม่ แล้วนัดไปเล่นกันเลย
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalPrimary}
                onPress={() => {
                  setMatchedUser(null);
                  navigation.navigate('Home', { screen: 'Friends' });
                }}
              >
                <Ionicons name="people-outline" size={19} color={colors.ctaText} />
                <Text style={styles.modalPrimaryText}>ดูเพื่อนของฉัน</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMatchedUser(null)}>
                <Text style={styles.modalSecondary}>ค้นหาเพื่อนต่อ</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}
