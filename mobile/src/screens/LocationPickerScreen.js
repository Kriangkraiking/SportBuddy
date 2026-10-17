import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
// ➕ เพิ่ม: ใช้ safe area บนเพื่อวางปุ่มย้อนกลับ/ช่องค้นหาลอยไม่ให้ชนแถบสถานะ (หน้านี้ไม่มี header ของ native-stack แล้ว)
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
// ✏️ แก้ไข: ใช้ AppIcon (Lucide ตาม Figma) แทน Ionicons ตรงๆ — API เดียวกัน
import Ionicons from '../components/AppIcon';
import colors from '../theme/colors';
// ✏️ แก้ไข: ย้ายไฟล์สไตล์จาก screens/ ไปไว้โฟลเดอร์ src/Style/ แยกต่างหาก ให้แยกส่วน UI ชัดเจนขึ้น
import styles from '../Style/LocationPickerScreen.styles';

const DEFAULT_REGION = {
  latitude: 13.7563,
  longitude: 100.5018,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function LocationPickerScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  // ➕ เพิ่ม: ข้อความในช่องค้นหาสถานที่ (ค้นหาด้วย Location.geocodeAsync แล้วเลื่อนหมุดไปตำแหน่งแรกที่เจอ)
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [marker, setMarker] = useState(
    route.params?.initialLocation
      ? {
          latitude: route.params.initialLocation.coordinates[1],
          longitude: route.params.initialLocation.coordinates[0],
        }
      : null
  );
  const [address, setAddress] = useState(route.params?.initialLocation?.address || '');
  const [locating, setLocating] = useState(false);
  const [resolvingAddress, setResolvingAddress] = useState(false);

  useEffect(() => {
    if (!marker) {
      useCurrentLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resolveAddress = async (lat, lng) => {
    setResolvingAddress(true);
    try {
      const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (results?.[0]) {
        const r = results[0];
        const parts = [r.name, r.street, r.district, r.city].filter(Boolean);
        setAddress(parts.join(', ') || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      } else {
        setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }
    } catch (err) {
      setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } finally {
      setResolvingAddress(false);
    }
  };

  const useCurrentLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('ไม่ได้รับอนุญาต', 'กรุณาอนุญาตให้เข้าถึงตำแหน่งเพื่อใช้แผนที่');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const next = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setRegion({ ...next, latitudeDelta: 0.02, longitudeDelta: 0.02 });
      setMarker(next);
      resolveAddress(next.latitude, next.longitude);
    } catch (err) {
      Alert.alert('หาตำแหน่งไม่สำเร็จ', 'ลองแตะเลือกตำแหน่งบนแผนที่แทนได้เลย');
    } finally {
      setLocating(false);
    }
  };

  const onMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
    resolveAddress(latitude, longitude);
  };

  // ➕ เพิ่ม: ค้นหาสถานที่จากข้อความ (ช่องค้นหาตาม Figma) — geocodeAsync คืนพิกัดแล้วเลื่อนแผนที่ + หมุดไปตำแหน่งนั้น
  const searchPlace = async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    try {
      const results = await Location.geocodeAsync(q);
      if (!results?.length) {
        Alert.alert('ไม่พบสถานที่', 'ลองเปลี่ยนคำค้นหา หรือแตะเลือกตำแหน่งบนแผนที่แทนได้เลย');
        return;
      }
      const next = { latitude: results[0].latitude, longitude: results[0].longitude };
      setRegion({ ...next, latitudeDelta: 0.01, longitudeDelta: 0.01 });
      setMarker(next);
      resolveAddress(next.latitude, next.longitude);
    } catch (err) {
      Alert.alert('ค้นหาไม่สำเร็จ', 'ลองแตะเลือกตำแหน่งบนแผนที่แทนได้เลย');
    } finally {
      setSearching(false);
    }
  };

  const confirm = () => {
    if (!marker) {
      Alert.alert('ยังไม่ได้เลือกตำแหน่ง', 'แตะบนแผนที่เพื่อเลือกตำแหน่งก่อน');
      return;
    }
    route.params?.onSelect?.({
      address,
      coordinates: [marker.longitude, marker.latitude],
    });
    navigation.goBack();
  };

  // ✏️ แก้ไข: layout ตาม Figma "เลือกสถานที่" — แผนที่เต็มจอ + ปุ่มย้อนกลับ/ชื่อหน้า/ช่องค้นหาลอยด้านบน + ปุ่ม locate-me + bottom sheet ที่อยู่
  // (logic เลือกตำแหน่ง/ตำแหน่งปัจจุบัน/แปลงที่อยู่/ยืนยันเหมือนเดิม)
  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={region} region={marker ? undefined : region} onPress={onMapPress}>
        {marker && <Marker coordinate={marker} pinColor={colors.primaryDark} />}
      </MapView>

      <View style={[styles.topBar, { top: insets.top + 12 }]}>
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.primaryDark} />
          </TouchableOpacity>
          <Text style={styles.title}>เลือกสถานที่</Text>
        </View>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color={colors.primaryDark} />
          <TextInput
            style={styles.searchInput}
            placeholder="ค้นหาสถานที่"
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={searchPlace}
            returnKeyType="search"
          />
          {searching ? (
            <ActivityIndicator size="small" color={colors.primaryDark} />
          ) : (
            !!query && (
              <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
                <Ionicons name="close" size={18} color={colors.muted} />
              </TouchableOpacity>
            )
          )}
        </View>
      </View>

      <View style={styles.bottomSheet}>
        <TouchableOpacity
          style={[styles.locateButton, { top: -68 }]}
          onPress={useCurrentLocation}
          disabled={locating}
        >
          {locating ? (
            <ActivityIndicator color={colors.primaryDark} size="small" />
          ) : (
            <Ionicons name="locate" size={24} color={colors.primaryDark} />
          )}
        </TouchableOpacity>

        <View style={styles.handleWrap}>
          <View style={styles.handle} />
        </View>
        <View style={styles.addressRow}>
          <View style={styles.placeSymbol}>
            <Ionicons name="location-outline" size={20} color={colors.primaryDark} />
          </View>
          <Text style={styles.addressText} numberOfLines={3}>
            {resolvingAddress ? 'กำลังค้นหาที่อยู่...' : address || 'แตะบนแผนที่เพื่อเลือกตำแหน่ง'}
          </Text>
        </View>
        <Text style={styles.hint}>แตะบนแผนที่เพื่อปรับตำแหน่งหมุด</Text>
        <TouchableOpacity style={styles.confirmButton} onPress={confirm}>
          <Text style={styles.confirmButtonText}>ยืนยันตำแหน่งนี้</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
