import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
// ✏️ แก้ไข: ใช้ AppIcon (Lucide ตาม Figma) แทน Ionicons ตรงๆ — API เดียวกัน
import Ionicons from '../components/AppIcon';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '../context/AuthContext';
// ✏️ แก้ไข: เพิ่ม listBlockedUsersRequest/unblockUserRequest เข้า import เดิมจาก api/auth (แทนที่จะแยก import ซ้ำ)
import { updateProfileRequest, uploadAvatarRequest, listBlockedUsersRequest, unblockUserRequest } from '../api/auth';
// ➕ เพิ่ม: โชว์รีวิวที่ผู้ใช้คนนี้เคยได้รับ
import { listUserReviewsRequest } from '../api/reviews';
import { resolveAssetUrl } from '../api/client';
import { SPORTS, SKILL_LEVELS } from '../constants/options';
import StarRating from '../components/StarRating';
// ➕ เพิ่ม: header ไล่เฉดฟ้ากลางตาม Figma
import SkyHeader from '../components/SkyHeader';
import colors from '../theme/colors';
// ✏️ แก้ไข: ย้ายไฟล์สไตล์จาก screens/ ไปไว้โฟลเดอร์ src/Style/ แยกต่างหาก ให้แยกส่วน UI ชัดเจนขึ้น
import styles from '../Style/ProfileScreen.styles';

export default function ProfileScreen({ navigation }) {
  const { user, setUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [sports, setSports] = useState(user?.sports || []); // [{ name, level }]
  const [location, setLocation] = useState(
    user?.location?.address ? { address: user.location.address, coordinates: user.location.coordinates } : null
  );
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uidCopied, setUidCopied] = useState(false);
  // ➕ เพิ่ม: state รีวิวที่ได้รับ
  const [receivedReviews, setReceivedReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  // ➕ เพิ่ม: state รายชื่อที่บล็อกไว้
  const [blockedUsers, setBlockedUsers] = useState([]);

  const loadReviews = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await listUserReviewsRequest(user.id);
      setReceivedReviews(data.reviews || []);
      setAverageRating(data.averageRating);
    } catch (err) {
      // ไม่ต้องโชว์ error รบกวนผู้ใช้ แค่ปล่อยให้ส่วนรีวิวว่างไว้
    }
  }, [user?.id]);

  const loadBlockedUsers = useCallback(async () => {
    try {
      const data = await listBlockedUsersRequest();
      setBlockedUsers(data.blockedUsers || []);
    } catch (err) {
      // เช่นเดียวกับรีวิว ไม่ต้องโชว์ error รบกวน แค่ปล่อยส่วนนี้ว่างไว้
    }
  }, []);

  useEffect(() => {
    loadReviews();
    loadBlockedUsers();
  }, [loadReviews, loadBlockedUsers]);

  const handleUnblock = async (blockedUser) => {
    try {
      await unblockUserRequest(blockedUser._id);
      setBlockedUsers((prev) => prev.filter((u) => u._id !== blockedUser._id));
    } catch (err) {
      Alert.alert('ปลดบล็อกไม่สำเร็จ', err.response?.data?.message || err.message);
    }
  };

  const handleCopyUid = async () => {
    if (!user?.uid) return;
    await Clipboard.setStringAsync(user.uid);
    setUidCopied(true);
    setTimeout(() => setUidCopied(false), 1800);
  };

  const uploadPickedImage = async (asset) => {
    setUploadingAvatar(true);
    try {
      const data = await uploadAvatarRequest({
        uri: asset.uri,
        name: asset.fileName || 'avatar.jpg',
        type: asset.mimeType || 'image/jpeg',
      });
      setUser(data.user);
    } catch (err) {
      Alert.alert('อัปโหลดรูปไม่สำเร็จ', err.response?.data?.message || err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('ไม่ได้รับอนุญาต', 'กรุณาอนุญาตให้เข้าถึงคลังภาพเพื่อเลือกรูปโปรไฟล์');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      await uploadPickedImage(result.assets[0]);
    }
  };

  const pickFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('ไม่ได้รับอนุญาต', 'กรุณาอนุญาตให้เข้าถึงกล้องเพื่อถ่ายรูปโปรไฟล์');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      await uploadPickedImage(result.assets[0]);
    }
  };

  const handleChangeAvatar = () => {
    Alert.alert('เปลี่ยนรูปโปรไฟล์', undefined, [
      { text: 'ถ่ายรูป', onPress: pickFromCamera },
      { text: 'เลือกจากคลังภาพ', onPress: pickFromLibrary },
      { text: 'ยกเลิก', style: 'cancel' },
    ]);
  };

  const isSportSelected = (label) => sports.some((s) => s.name === label);

  const toggleSport = (label) => {
    setSports((prev) => {
      if (prev.some((s) => s.name === label)) {
        return prev.filter((s) => s.name !== label);
      }
      return [...prev, { name: label, level: 'beginner' }];
    });
  };

  const setSportLevel = (label, level) => {
    setSports((prev) => prev.map((s) => (s.name === label ? { ...s, level } : s)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await updateProfileRequest({
        name,
        bio,
        sports,
        location: location ? { address: location.address, coordinates: location.coordinates } : undefined,
      });
      setUser(data.user);
      Alert.alert('บันทึกแล้ว', 'อัปเดตโปรไฟล์เรียบร้อย');
    } catch (err) {
      Alert.alert('บันทึกไม่สำเร็จ', err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  // ✏️ แก้ไข: layout ตาม Figma "โปรไฟล์" — logic เดิมทั้งหมด (อัปโหลดรูป/คัดลอก UID/เลือกกีฬา+ระดับ/ที่อยู่/บันทึก/รีวิว/บล็อก/ออกจากระบบ) ไม่เปลี่ยน
  // ชิปกีฬาใน header แสดงกีฬาที่เลือกอยู่ (ตัวแรก active); เลือก/ยกเลิกกีฬาทำในการ์ด "กีฬาโปรดและระดับฝีมือ" (ใช้ SPORTS เท่านั้น)
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <SkyHeader extraBottom={40} style={{ marginHorizontal: -24 }}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>โปรไฟล์</Text>
        </View>
        <View style={styles.identityRow}>
          <TouchableOpacity
            style={styles.avatarWrap}
            activeOpacity={0.85}
            onPress={handleChangeAvatar}
            disabled={uploadingAvatar}
          >
            {user?.avatar ? (
              <Image source={{ uri: resolveAssetUrl(user.avatar) }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{name?.[0]?.toUpperCase() || '?'}</Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={15} color={colors.ctaText} />
            </View>
          </TouchableOpacity>
          <View style={styles.accountInfo}>
            <Text style={styles.name} numberOfLines={1}>{name || 'ผู้ใช้'}</Text>
            <Text style={styles.email} numberOfLines={1}>{user?.email}</Text>
            {!!user?.uid && (
              <TouchableOpacity style={styles.uidChip} activeOpacity={0.8} onPress={handleCopyUid}>
                <Text style={styles.uidChipText}>UID: {user.uid}</Text>
                <Ionicons name={uidCopied ? 'checkmark' : 'copy-outline'} size={14} color={colors.white} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {uploadingAvatar && <Text style={styles.uploadingText}>กำลังอัปโหลดรูป...</Text>}
        {sports.length > 0 && (
          <View style={styles.headerChips}>
            {sports.map((s, i) => (
              <View key={s.name} style={[styles.headerChip, i === 0 && styles.headerChipActive]}>
                <Ionicons
                  name={SPORTS.find((x) => x.label === s.name)?.icon || 'football-outline'}
                  size={17}
                  color={i === 0 ? colors.white : colors.primaryDark}
                />
                <Text style={[styles.headerChipText, i === 0 && styles.headerChipTextActive]}>{s.name}</Text>
              </View>
            ))}
          </View>
        )}
      </SkyHeader>

      <View style={[styles.card, { marginTop: -56 }]}>
        <Text style={styles.cardTitle}>ข้อมูลทั่วไป</Text>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>ชื่อ</Text>
          <TextInput style={styles.fieldInput} value={name} onChangeText={setName} placeholderTextColor={colors.muted} />
        </View>

        <View style={[styles.fieldRow, styles.bioRow]}>
          <Text style={styles.fieldLabel}>แนะนำตัว</Text>
          <TextInput
            style={[styles.fieldInput, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            multiline
            placeholder="เล่าเกี่ยวกับตัวคุณสั้นๆ"
            placeholderTextColor={colors.muted}
          />
        </View>

        <TouchableOpacity
          style={styles.fieldRow}
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate('LocationPicker', {
              initialLocation: location,
              onSelect: (loc) => setLocation(loc),
            })
          }
        >
          <Text style={styles.fieldLabel}>ที่อยู่</Text>
          <Text style={[styles.fieldText, !location && styles.fieldPlaceholder]} numberOfLines={1}>
            {location?.address || 'เลือกที่อยู่บนแผนที่'}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.muted} />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>กีฬาโปรดและระดับฝีมือ</Text>
        <Text style={styles.helper}>เลือกกีฬาที่คุณเล่น (เลือกได้หลายชนิด)</Text>
        <View style={styles.sportGrid}>
          {SPORTS.map((s) => {
            const selected = isSportSelected(s.label);
            return (
              <TouchableOpacity
                key={s.key}
                style={[styles.sportChip, selected && styles.sportChipActive]}
                onPress={() => toggleSport(s.label)}
              >
                <Ionicons name={s.icon} size={17} color={selected ? colors.white : colors.primaryDark} />
                <Text style={[styles.sportChipText, selected && styles.sportChipTextActive]}>{s.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {sports.map((s) => (
          <View key={s.name} style={styles.levelRow}>
            <Text style={styles.levelSportName}>{s.name}</Text>
            <View style={styles.levelChipRow}>
              {SKILL_LEVELS.map((l) => (
                <TouchableOpacity
                  key={l.value}
                  style={[styles.levelChip, s.level === l.value && styles.levelChipActive]}
                  onPress={() => setSportLevel(s.name, l.value)}
                >
                  <Text style={[styles.levelChipText, s.level === l.value && styles.levelChipTextActive]}>
                    {l.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* ➕ เพิ่ม: รีวิวที่ได้รับจากกิจกรรมที่จบแล้ว โชว์เฉพาะตอนมีรีวิวอย่างน้อย 1 รายการ */}
      {receivedReviews.length > 0 && (
        <View style={styles.card}>
          <View style={styles.reviewSummaryRow}>
            <Text style={styles.cardTitle}>รีวิวที่คุณได้รับ</Text>
            <View style={styles.reviewSummaryScore}>
              <StarRating value={Math.round(averageRating || 0)} size={16} />
              <Text style={styles.reviewSummaryText}>
                {averageRating?.toFixed(1)} ({receivedReviews.length})
              </Text>
            </View>
          </View>
          {receivedReviews.map((r) => (
            <View key={r._id} style={styles.reviewRow}>
              <View style={styles.reviewRowHeader}>
                <Text style={styles.reviewRowName}>{r.from.name}</Text>
                <StarRating value={r.rating} size={13} />
              </View>
              <Text style={styles.reviewRowMeta}>{r.event?.title}</Text>
              {!!r.comment && <Text style={styles.reviewComment}>{r.comment}</Text>}
            </View>
          ))}
        </View>
      )}

      {/* ➕ เพิ่ม: รายชื่อผู้เล่นที่บล็อกไว้ ปลดบล็อกได้ โชว์เฉพาะตอนมีอย่างน้อย 1 คน */}
      {blockedUsers.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ผู้เล่นที่คุณบล็อกไว้</Text>
          <Text style={styles.helper}>คนเหล่านี้เข้าร่วมกิจกรรมในอนาคตของคุณไม่ได้</Text>
          {blockedUsers.map((b) => (
            <View key={b._id} style={styles.blockedRow}>
              <Text style={styles.reviewRowName}>{b.name}</Text>
              <TouchableOpacity onPress={() => handleUnblock(b)}>
                <Text style={styles.unblockText}>ปลดบล็อก</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Ionicons name="log-out-outline" size={17} color={colors.danger} />
        <Text style={styles.logoutText}>ออกจากระบบ</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
