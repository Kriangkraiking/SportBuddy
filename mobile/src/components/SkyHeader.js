import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';

// ➕ เพิ่ม: header ไล่เฉดฟ้า + วงกลมตกแต่งมุมขวาบน/ซ้ายล่าง ตามเลเยอร์ "Sky header" ใน Figma ทุกหน้า
// (Figma ใช้ SVG แต่ไม่มี react-native-svg ในโปรเจกต์ เลยทำเป็น LinearGradient + View วงกลมแทน ไม่ต้องเพิ่ม dependency)
// `extra` = ระยะที่ header ต้องยื่นลงไปใต้เนื้อหา เพื่อให้การ์ดขาวลอยทับขอบล่างได้แบบใน Figma (เช่น หน้าเข้าสู่ระบบ)
export default function SkyHeader({ children, style, extraBottom = 0, rounded = 36 }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.wrap,
        { paddingTop: insets.top + 8, paddingBottom: 20 + extraBottom, borderBottomLeftRadius: rounded, borderBottomRightRadius: rounded },
        style,
      ]}
    >
      <LinearGradient
        colors={[colors.primaryVivid, colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={[styles.ring, styles.ringBig]} />
      <View pointerEvents="none" style={[styles.ring, styles.ringSmall]} />
      <View pointerEvents="none" style={styles.blobLeft} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', paddingHorizontal: 24 },
  // วงแหวนบางโปร่งใสมุมขวาบน (เลียนแบบ Sky header ใน Figma)
  ring: { position: 'absolute', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', borderRadius: 999 },
  ringBig: { width: 260, height: 260, top: -150, right: -90 },
  ringSmall: { width: 170, height: 170, top: -100, right: -45 },
  blobLeft: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    left: -110,
    bottom: -120,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
});
