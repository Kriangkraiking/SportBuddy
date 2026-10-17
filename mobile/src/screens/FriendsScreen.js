import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
  Image,
  RefreshControl,
  TextInput,
  ActivityIndicator,
} from 'react-native';
// ✏️ แก้ไข: ใช้ AppIcon (Lucide ตาม Figma) แทน Ionicons ตรงๆ — API เดียวกัน
import Ionicons from '../components/AppIcon';
import * as Clipboard from 'expo-clipboard';
import { useFocusEffect } from '@react-navigation/native';
import {
  listFriendsRequest,
  listBuddyRequests,
  respondBuddyRequest,
  findByUidRequest,
  sendBuddyRequest,
} from '../api/buddies';
import { resolveAssetUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
// ➕ เพิ่ม: header ไล่เฉดฟ้ากลางตาม Figma (มุมเหลี่ยม) + ระดับฝีมือ
import SkyHeader from '../components/SkyHeader';
import { skillLevelLabel } from '../constants/options';
import colors from '../theme/colors';
// ✏️ แก้ไข: ย้ายไฟล์สไตล์จาก screens/ ไปไว้โฟลเดอร์ src/Style/ แยกต่างหาก ให้แยกส่วน UI ชัดเจนขึ้น
import styles from '../Style/FriendsScreen.styles';

const TABS = [
  { key: 'search', label: 'ค้นหา' },
  { key: 'friends', label: 'เพื่อน' },
  { key: 'incoming', label: 'คำขอที่ได้รับ' },
  { key: 'outgoing', label: 'คำขอที่ส่งไป' },
];

function Avatar({ person, size = 48 }) {
  const style = { width: size, height: size, borderRadius: size / 2 };
  if (person?.avatar) {
    return <Image source={{ uri: resolveAssetUrl(person.avatar) }} style={style} />;
  }
  return (
    <View style={[style, styles.avatarFallback]}>
      <Text style={styles.avatarFallbackText}>{person?.name?.[0]?.toUpperCase() || '?'}</Text>
    </View>
  );
}

// ➕ เพิ่ม: สรุปกีฬา/ระดับของคนหนึ่งคนเป็นบรรทัดเดียว เช่น "แบดมินตัน • มือพอได้" ใช้ในการ์ดเพื่อน/คำขอ
const sportSummary = (person) => {
  const first = person?.sports?.[0];
  if (!first) return '';
  return first.level ? `${first.name} • ${skillLevelLabel(first.level)}` : first.name;
};

export default function FriendsScreen({ navigation }) {
  const { user } = useAuth();
  const [tab, setTab] = useState('search');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  // ➕ เพิ่ม: คำค้นหาในรายชื่อเพื่อน (กรองฝั่งแอป ไม่ยิง API เพิ่ม)
  const [friendQuery, setFriendQuery] = useState('');

  const [uidInput, setUidInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [foundUser, setFoundUser] = useState(null);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [friendsData, requestsData] = await Promise.all([listFriendsRequest(), listBuddyRequests()]);
      setFriends(friendsData.friends);
      setRequests(requestsData.requests);
    } catch (err) {
      Alert.alert('โหลดข้อมูลไม่สำเร็จ', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const incoming = requests.filter((r) => r.status === 'pending' && r.to?._id === user?.id);
  const outgoing = requests.filter((r) => r.status === 'pending' && r.from?._id === user?.id);
  const visibleFriends = friendQuery.trim()
    ? friends.filter((f) => f.name?.toLowerCase().includes(friendQuery.trim().toLowerCase()))
    : friends;

  const handleCopyUid = async () => {
    if (!user?.uid) return;
    await Clipboard.setStringAsync(user.uid);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleSearchUid = async () => {
    const uid = uidInput.trim().toUpperCase();
    if (!uid) return;
    setSearching(true);
    setSearchError(null);
    setFoundUser(null);
    try {
      const data = await findByUidRequest(uid);
      setFoundUser(data.user);
    } catch (err) {
      setSearchError(err.response?.data?.message || 'ไม่พบผู้ใช้ที่มี UID นี้');
    } finally {
      setSearching(false);
    }
  };

  const handleAddFriend = async () => {
    if (!foundUser) return;
    setSendingRequest(true);
    try {
      await sendBuddyRequest({ to: foundUser.id });
      Alert.alert('ส่งคำขอแล้ว', `ส่งคำขอเป็นเพื่อนถึง ${foundUser.name} แล้ว`);
      setFoundUser(null);
      setUidInput('');
      await load();
    } catch (err) {
      Alert.alert('ส่งคำขอไม่สำเร็จ', err.response?.data?.message || err.message);
    } finally {
      setSendingRequest(false);
    }
  };

  const handleRespond = async (requestId, status) => {
    setBusyId(requestId);
    try {
      await respondBuddyRequest(requestId, status);
      await load();
    } catch (err) {
      Alert.alert('ทำรายการไม่สำเร็จ', err.response?.data?.message || err.message);
    } finally {
      setBusyId(null);
    }
  };

  const refresh = <RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />;

  // ✏️ แก้ไข: layout ตาม Figma "เพื่อน" — SkyHeader (ย้อนกลับ + หัวข้อ + ตรา), แท็บ pill ขาว, เนื้อหาแต่ละแท็บ
  // (logic โหลด/ค้นหา UID/ส่งคำขอ/ตอบรับ-ปฏิเสธเดิมไม่เปลี่ยน; ไม่ใส่ปุ่ม "เปิดแชท" ข้างชื่อเพื่อนเพราะแอปยังไม่มีแชทส่วนตัว)
  return (
    <View style={styles.container}>
      <SkyHeader rounded={0}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={10}>
            <Ionicons name="arrow-back" size={20} color={colors.white} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>เพื่อน</Text>
            <Text style={styles.headerSubtitle}>ชวนเพื่อนมาเล่น เติมความสนุกให้ทุกแมตช์</Text>
          </View>
          <View style={styles.headerBadge}>
            <Ionicons name="people" size={24} color={colors.white} />
          </View>
        </View>
      </SkyHeader>

      <View style={styles.tabRow}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            activeOpacity={0.75}
            style={[styles.tabButton, tab === t.key && styles.tabButtonActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
            {t.key === 'incoming' && incoming.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{incoming.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'search' && (
        <ScrollView contentContainerStyle={[styles.body, { paddingBottom: 32 }]} keyboardShouldPersistTaps="handled">
          <View style={styles.myUidCard}>
            <View style={styles.myUidTop}>
              <View style={{ gap: 3 }}>
                <Text style={styles.myUidLabel}>UID ของคุณ</Text>
                <Text style={styles.myUidValue}>{user?.uid ? `UID ${user.uid}` : '...'}</Text>
              </View>
              <TouchableOpacity style={styles.copyButton} activeOpacity={0.8} onPress={handleCopyUid}>
                <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} color={colors.primaryDark} />
                <Text style={styles.copyButtonText}>{copied ? 'คัดลอกแล้ว' : 'คัดลอก'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.myUidHint}>แชร์รหัสนี้ให้เพื่อน แล้วมาเล่นด้วยกัน</Text>
          </View>

          <View style={styles.searchRow}>
            <Ionicons name="search-outline" size={20} color={colors.primaryDark} />
            <TextInput
              style={styles.searchInput}
              value={uidInput}
              onChangeText={setUidInput}
              placeholder="กรอก UID ของเพื่อน"
              placeholderTextColor={colors.muted}
              autoCapitalize="characters"
              autoCorrect={false}
              onSubmitEditing={handleSearchUid}
              returnKeyType="search"
            />
            {searching ? (
              <ActivityIndicator size="small" color={colors.primaryDark} />
            ) : (
              !!uidInput && (
                <TouchableOpacity hitSlop={8} onPress={() => { setUidInput(''); setFoundUser(null); setSearchError(null); }}>
                  <Ionicons name="close" size={18} color={colors.muted} />
                </TouchableOpacity>
              )
            )}
          </View>

          {!!searchError && <Text style={styles.searchErrorText}>{searchError}</Text>}

          {foundUser && (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTitle}>พบผู้เล่น 1 คน</Text>
                <Text style={styles.summaryNote}>ค้นหาด้วย UID</Text>
              </View>
              <View style={styles.card}>
                <View style={styles.cardRow}>
                  <Avatar person={foundUser} size={56} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.name} numberOfLines={1}>{foundUser.name}</Text>
                    <Text style={styles.sub}>UID: {foundUser.uid}</Text>
                  </View>
                </View>
                {!!foundUser.sports?.length && (
                  <View style={styles.chipRow}>
                    {foundUser.sports.slice(0, 3).map((s) => (
                      <View key={s.name} style={styles.chip}>
                        <Text style={styles.chipText}>{s.name}</Text>
                      </View>
                    ))}
                  </View>
                )}
                <TouchableOpacity
                  style={styles.primaryButton}
                  activeOpacity={0.8}
                  onPress={handleAddFriend}
                  disabled={sendingRequest}
                >
                  <Ionicons name="person-add-outline" size={18} color={colors.ctaText} />
                  <Text style={styles.primaryButtonText}>{sendingRequest ? 'กำลังส่ง...' : 'เพิ่มเพื่อน'}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.hintRow}>
                <Ionicons name="shield-checkmark-outline" size={18} color={colors.primaryDark} />
                <Text style={styles.hintText}>เพิ่มเพื่อนเพื่อชวนเข้ากลุ่มและนัดเล่นกีฬา</Text>
              </View>
            </>
          )}
        </ScrollView>
      )}

      {tab === 'friends' && (
        <FlatList
          data={visibleFriends}
          keyExtractor={(item) => item.id}
          refreshControl={refresh}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            friends.length > 0 ? (
              <View style={{ gap: 18, marginBottom: 6 }}>
                <View style={styles.searchRow}>
                  <Ionicons name="search-outline" size={20} color={colors.primaryDark} />
                  <TextInput
                    style={styles.searchInput}
                    value={friendQuery}
                    onChangeText={setFriendQuery}
                    placeholder="ค้นหาในรายชื่อเพื่อน"
                    placeholderTextColor={colors.muted}
                  />
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryTitle}>เพื่อนของคุณ · {friends.length}</Text>
                </View>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={styles.friendCard}>
              <Avatar person={item} />
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={styles.nameSm} numberOfLines={1}>{item.name}</Text>
                {!!sportSummary(item) && <Text style={styles.sub} numberOfLines={1}>{sportSummary(item)}</Text>}
              </View>
            </View>
          )}
          ListEmptyComponent={
            friends.length === 0 ? (
              <View style={styles.emptyBox}>
                {/* ✏️ แก้ไข: ใช้ภาพประกอบไม้แบดจาก Figma แทนไอคอนวงกลม */}
                <Image source={require('../../assets/illustrations/friends-empty.jpg')} style={styles.emptyArt} resizeMode="cover" />
                <View style={{ gap: 8 }}>
                  <Text style={styles.emptyTitle}>เพื่อนร่วมสนามคนแรก รอคุณอยู่</Text>
                  <Text style={styles.emptyText}>
                    เริ่มจากค้นหา UID ของเพื่อน{'\n'}หรือพบคนที่ชอบกีฬาเดียวกัน{'\n'}แล้วชวนกันออกไปเล่น!
                  </Text>
                </View>
                <TouchableOpacity style={[styles.primaryButton, { alignSelf: 'stretch' }]} onPress={() => setTab('search')}>
                  <Ionicons name="person-add-outline" size={18} color={colors.ctaText} />
                  <Text style={styles.primaryButtonText}>ค้นหาเพื่อน</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCopyUid}>
                  <Text style={styles.emptyLink}>{copied ? 'คัดลอกแล้ว' : 'คัดลอก UID ของคุณเพื่อชวนเพื่อน'}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.empty}>ไม่พบเพื่อนที่ชื่อตรงกับคำค้นหา</Text>
            )
          }
          ListFooterComponent={
            friends.length > 0 ? <Text style={styles.footerNote}>เพื่อนที่เล่นด้วยกัน ทำให้ทุกวันสนุกขึ้น</Text> : null
          }
        />
      )}

      {tab === 'incoming' && (
        <FlatList
          data={incoming}
          keyExtractor={(item) => item._id}
          refreshControl={refresh}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            incoming.length > 0 ? (
              <View style={[styles.summaryRow, { marginBottom: 6 }]}>
                <Text style={styles.summaryTitleLg}>คำขอใหม่ · {incoming.length} คน</Text>
                <Text style={styles.summaryNote}>ล่าสุดก่อน</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <Avatar person={item.from} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.nameSm} numberOfLines={1}>{item.from?.name}</Text>
                  <Text style={styles.sub} numberOfLines={1}>อยากเป็นเพื่อนเล่น{item.sport}กับคุณ</Text>
                </View>
              </View>
              <View style={styles.respondRow}>
                <TouchableOpacity
                  style={[styles.primaryButton, { flex: 1 }]}
                  activeOpacity={0.8}
                  disabled={busyId === item._id}
                  onPress={() => handleRespond(item._id, 'accepted')}
                >
                  <Ionicons name="checkmark" size={18} color={colors.ctaText} />
                  <Text style={styles.primaryButtonText}>ยืนยัน</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.secondaryButton, { flex: 1 }]}
                  activeOpacity={0.8}
                  disabled={busyId === item._id}
                  onPress={() => handleRespond(item._id, 'declined')}
                >
                  <Text style={styles.secondaryButtonText}>ปฏิเสธ</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="mail-open-outline" size={28} color={colors.primaryDark} />
              </View>
              <Text style={styles.empty}>ไม่มีคำขอเป็นเพื่อนที่รอตอบรับ</Text>
            </View>
          }
          ListFooterComponent={
            incoming.length > 0 ? <Text style={styles.footerNote}>เริ่มต้นมิตรภาพใหม่ แล้วไปเล่นด้วยกัน</Text> : null
          }
        />
      )}

      {tab === 'outgoing' && (
        <FlatList
          data={outgoing}
          keyExtractor={(item) => item._id}
          refreshControl={refresh}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            outgoing.length > 0 ? (
              <View style={[styles.summaryRow, { marginBottom: 6 }]}>
                <Text style={styles.summaryTitleLg}>รอการตอบรับ · {outgoing.length} คน</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <Avatar person={item.to} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.nameSm} numberOfLines={1}>{item.to?.name}</Text>
                  <Text style={styles.sub} numberOfLines={1}>
                    ส่งคำขอเล่น{item.sport}แล้ว
                  </Text>
                </View>
              </View>
              <View style={styles.pendingRow}>
                <Ionicons name="time-outline" size={17} color={colors.primaryDark} />
                <Text style={styles.pendingText}>รอการตอบรับ</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="paper-plane-outline" size={28} color={colors.primaryDark} />
              </View>
              <Text style={styles.empty}>ยังไม่มีคำขอที่ส่งไปรอตอบรับ</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
