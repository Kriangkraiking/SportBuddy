import React from 'react';
import { View, TouchableOpacity } from 'react-native';
// ✏️ แก้ไข: ใช้ AppIcon (Lucide ตาม Figma) แทน Ionicons ตรงๆ — API เดียวกัน
import Ionicons from './AppIcon';
import colors from '../theme/colors';

// ➕ เพิ่ม: แถวดาวให้คะแนน 1-5 — ใส่ onChange เพื่อให้กดเลือกดาวได้ (ตอนเขียนรีวิว)
// ไม่ใส่ onChange เพื่อโชว์คะแนนอย่างเดียว (ตอนแสดงรีวิวที่มีอยู่แล้ว)
export default function StarRating({ value, onChange, size = 20 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity key={n} onPress={() => onChange?.(n)} disabled={!onChange} activeOpacity={onChange ? 0.6 : 1}>
          <Ionicons name={n <= value ? 'star' : 'star-outline'} size={size} color={colors.cta} />
        </TouchableOpacity>
      ))}
    </View>
  );
}
