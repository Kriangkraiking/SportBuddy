import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, FlatList, Platform } from 'react-native';
// ✏️ แก้ไข: ใช้ AppIcon (Lucide ตาม Figma) แทน Ionicons ตรงๆ — API เดียวกัน
import Ionicons from '../components/AppIcon';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createEventRequest, updateEventRequest } from '../api/events';
// ➕ เพิ่ม: header ไล่เฉดฟ้ากลางตาม Figma
import SkyHeader from '../components/SkyHeader';
import colors from '../theme/colors';
import { SPORTS } from '../constants/options';
// ✏️ แก้ไข: ย้ายไฟล์สไตล์จาก screens/ ไปไว้โฟลเดอร์ src/Style/ แยกต่างหาก ให้แยกส่วน UI ชัดเจนขึ้น
import styles from '../Style/CreateEventScreen.styles';

// ➕ เพิ่ม: ขอบเขตของตัวปรับจำนวนผู้เข้าร่วม (+/−) — อย่างน้อย 2 คน (host + อีก 1) สูงสุด 50
const MIN_PARTICIPANTS = 2;
const MAX_PARTICIPANTS = 50;

export default function CreateEventScreen({ navigation, route }) {
  const editingEvent = route.params?.event || null;
  const isEditing = !!editingEvent;

  const [title, setTitle] = useState(editingEvent?.title || '');
  const [sport, setSport] = useState(editingEvent?.sport || '');
  const [description, setDescription] = useState(editingEvent?.description || '');
  const [location, setLocation] = useState(
    editingEvent?.location?.address
      ? { address: editingEvent.location.address, coordinates: editingEvent.location.coordinates }
      : null
  ); // { address, coordinates: [lng, lat] }
  const [dateTime, setDateTime] = useState(
    editingEvent?.dateTime ? new Date(editingEvent.dateTime) : new Date(Date.now() + 24 * 60 * 60 * 1000)
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  // ✏️ แก้ไข: เก็บเป็นตัวเลขแทนสตริง เพราะใช้ตัวปรับ +/− ตาม Figma แทนช่องพิมพ์ตัวเลข
  const [maxParticipants, setMaxParticipants] = useState(editingEvent?.maxParticipants || 10);
  const [submitting, setSubmitting] = useState(false);

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

  // ✏️ แก้ไข: รูปแบบวันที่ตาม Figma "17 ต.ค. 2569" (ไม่มีวันในสัปดาห์) เพราะช่องวันที่แคบลงเหลือครึ่งแถว
  const dateLabel = dateTime.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeLabel = dateTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false });

  const handleCreate = async () => {
    if (!title || !sport) {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกชื่อกิจกรรมและกีฬา');
      return;
    }
    if (dateTime.getTime() < Date.now()) {
      Alert.alert('วันเวลาไม่ถูกต้อง', 'กรุณาเลือกวันเวลาที่ยังไม่ผ่านไป');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        sport,
        description,
        dateTime: dateTime.toISOString(),
        maxParticipants: maxParticipants || 10,
        location: location || undefined,
      };
      if (isEditing) {
        await updateEventRequest(editingEvent._id, payload);
      } else {
        await createEventRequest(payload);
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert(
        isEditing ? 'แก้ไขกิจกรรมไม่สำเร็จ' : 'สร้างกิจกรรมไม่สำเร็จ',
        err.response?.data?.message || err.message
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openLocationPicker = () =>
    navigation.navigate('LocationPicker', {
      initialLocation: location,
      onSelect: (loc) => setLocation(loc),
    });

  // ✏️ แก้ไข: layout ตาม Figma "สร้างกิจกรรมใหม่" — SkyHeader + การ์ดฟอร์ม (ป้ายหัวข้อเหนือช่อง) + แถบปุ่มล่างคงที่
  // logic (validate/สร้าง/แก้ไข/เลือกสถานที่/ตัวเลือกวันเวลา) ทั้งหมดเหมือนเดิม; ชนิดกีฬายังเลือกจาก SPORTS เท่านั้น
  return (
    <View style={styles.container}>
      {/* ✏️ แก้ไข: ย้าย SkyHeader เข้าไปอยู่ใน ScrollView — เดิม header อยู่นอก ScrollView แล้วการ์ดฟอร์มใช้ margin ลบดันขึ้นไปทับ
          header ทำให้หัวการ์ด (ช่องชื่อกิจกรรม) ถูก ScrollView ตัดและโดนแถบสีฟ้าบัง */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
      <SkyHeader extraBottom={64} style={{ marginHorizontal: -24 }}>
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={10}>
            <Ionicons name="arrow-back" size={20} color={colors.white} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{isEditing ? 'แก้ไขกิจกรรม' : 'สร้างกิจกรรมใหม่'}</Text>
            <Text style={styles.headerSubtitle}>ชวนเพื่อนมาเป็นทีมเดียวกัน</Text>
          </View>
        </View>
      </SkyHeader>

        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>ชื่อกิจกรรม</Text>
            <TextInput
              style={styles.input}
              placeholder="เช่น ฟุตบอลเย็นวันเสาร์"
              placeholderTextColor={colors.muted}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>ประเภทกีฬา</Text>
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
                    style={[styles.sportChip, active && styles.sportChipActive]}
                    onPress={() => setSport(item.label)}
                  >
                    <Ionicons name={item.icon} size={17} color={active ? colors.white : colors.primaryDark} />
                    <Text style={[styles.sportChipText, active && styles.sportChipTextActive]}>{item.label}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          <View style={styles.scheduleRow}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>วันที่</Text>
              <TouchableOpacity style={styles.fieldBox} onPress={() => setShowDatePicker(true)}>
                <Ionicons name="calendar-outline" size={18} color={colors.primaryDark} />
                <Text style={styles.fieldBoxText} numberOfLines={1}>{dateLabel}</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>เวลา</Text>
              <TouchableOpacity style={styles.fieldBox} onPress={() => setShowTimePicker(true)}>
                <Ionicons name="time-outline" size={18} color={colors.primaryDark} />
                <Text style={styles.fieldBoxText} numberOfLines={1}>{timeLabel} น.</Text>
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

          <View style={styles.field}>
            <Text style={styles.label}>สถานที่</Text>
            <TouchableOpacity style={styles.fieldBox} onPress={openLocationPicker}>
              <Ionicons name="location-outline" size={18} color={colors.primaryDark} />
              <Text style={[styles.fieldBoxText, !location && styles.fieldBoxPlaceholder]} numberOfLines={1}>
                {location?.address || 'เลือกสถานที่บนแผนที่'}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.mapLink} onPress={openLocationPicker}>
            <Ionicons name="map-outline" size={15} color={colors.primaryDark} />
            <Text style={styles.mapLinkText}>เลือกตำแหน่งบนแผนที่</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primaryDark} />
          </TouchableOpacity>

          <View style={styles.field}>
            <Text style={styles.label}>จำนวนผู้เข้าร่วมสูงสุด</Text>
            <View style={styles.stepper}>
              <TouchableOpacity
                hitSlop={10}
                onPress={() => setMaxParticipants((n) => Math.max(MIN_PARTICIPANTS, n - 1))}
              >
                <Ionicons name="remove" size={20} color={colors.primaryDark} />
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{maxParticipants} คน</Text>
              <TouchableOpacity
                hitSlop={10}
                onPress={() => setMaxParticipants((n) => Math.min(MAX_PARTICIPANTS, n + 1))}
              >
                <Ionicons name="add" size={20} color={colors.primaryDark} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>รายละเอียดกิจกรรม</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="รายละเอียดเพิ่มเติม"
              placeholderTextColor={colors.muted}
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={submitting}>
          {!submitting && <Ionicons name={isEditing ? 'checkmark' : 'add'} size={19} color={colors.ctaText} />}
          <Text style={styles.buttonText}>
            {submitting ? 'กำลังบันทึก...' : isEditing ? 'บันทึกการแก้ไข' : 'สร้างกิจกรรม'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
