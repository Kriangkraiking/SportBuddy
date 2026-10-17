import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
// ✏️ แก้ไข: เปลี่ยนฟอนต์จาก Poppins → Noto Sans Thai (ตัวหนังสือทั่วไป) + Prompt (โลโก้ SportBuddy) ตาม Figma
// (Poppins ไม่มีตัวอักษรไทย ข้อความไทยเคย fallback เป็นฟอนต์ระบบ) ต้องรัน `npm install` ใน mobile/ ก่อนเปิดแอป
// เพราะเพิ่ม @expo-google-fonts/noto-sans-thai และ @expo-google-fonts/prompt ใน package.json แล้ว
import { useFonts } from 'expo-font';
import {
  NotoSansThai_400Regular,
  NotoSansThai_500Medium,
  NotoSansThai_600SemiBold,
  NotoSansThai_700Bold,
  NotoSansThai_800ExtraBold,
} from '@expo-google-fonts/noto-sans-thai';
import { Prompt_600SemiBold } from '@expo-google-fonts/prompt';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import colors from './src/theme/colors';

// ✏️ แก้ไข: ถอด react-native-reanimated-carousel ออกทั้งชุด (react-native-reanimated v4 / react-native-worklets
// เป็น native module ที่รันใน Expo Go ไม่ได้ ต้อง custom dev client) เลยไม่ต้องห่อ GestureHandlerRootView แล้ว
// ➕ เพิ่ม: โหลดฟอนต์ก่อน render แอปจริง (ถ้าฟอนต์ยังไม่โหลดจะแสดงหน้าว่างพื้นหลังสีธีมไว้ก่อน)
export default function App() {
  const [fontsLoaded] = useFonts({
    NotoSansThai_400Regular,
    NotoSansThai_500Medium,
    NotoSansThai_600SemiBold,
    NotoSansThai_700Bold,
    NotoSansThai_800ExtraBold,
    Prompt_600SemiBold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </AuthProvider>
  );
}
