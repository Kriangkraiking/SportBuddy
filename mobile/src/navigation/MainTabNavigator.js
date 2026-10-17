import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// ✏️ แก้ไข: ใช้ AppIcon (Lucide ตาม Figma) แทน Ionicons ตรงๆ — API เดียวกัน
import Ionicons from '../components/AppIcon';

import { resolveAssetUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { fonts } from '../theme/typography';
import HomeMenuScreen from '../screens/HomeMenuScreen';
// ✏️ แก้ไข: ไฟล์ HomeScreen.js ถูกเปลี่ยนชื่อเป็น finesport.js แล้ว ต้องแก้ path import ตรงนี้
// ไม่งั้น bundler จะหาไฟล์ '../screens/HomeScreen' ไม่เจอ (module not found) และแอปพังตอนเปิด
import HomeScreen from '../screens/finesport';
import EventsScreen from '../screens/EventsScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import CreateEventScreen from '../screens/CreateEventScreen';
import LocationPickerScreen from '../screens/LocationPickerScreen';
import MatchingScreen from '../screens/MatchingScreen';
// ➕ เพิ่ม: หน้าปัดหาคู่กีฬาแบบ Tinder เข้าถึงจากหน้า "จับคู่กีฬา"
import SwipeMatchScreen from '../screens/SwipeMatchScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FriendsScreen from '../screens/FriendsScreen';
import PartyChatScreen from '../screens/PartyChatScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import colors from '../theme/colors';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const EventsStack = createNativeStackNavigator();
const MatchingStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

// ➕ เพิ่ม: ตัวเลือก header ขาวสำหรับหน้าแชทกลุ่ม (ใช้ร่วมทั้ง EventsStack และ MatchingStack)
const chatHeaderOptions = {
  title: 'แชทกลุ่ม',
  headerStyle: { backgroundColor: colors.card },
  headerTintColor: colors.text,
  headerTitleStyle: { fontFamily: fonts.bold },
};

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        // ✏️ แก้ไข: header ของ stack เปลี่ยนจากขาว → ฟ้า primary ตัวหนังสือขาว ตาม mockup ใหม่ (แถบหัวหน้าจอสีฟ้า)
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontFamily: fonts.semiBold },
        headerShadowVisible: false,
      }}
    >
      <HomeStack.Screen name="HomeMenu" component={HomeMenuScreen} options={{ headerShown: false }} />
      {/* ✏️ แก้ไข: หน้าเพื่อน/แจ้งเตือนมี SkyHeader + ปุ่มย้อนกลับของตัวเองตาม Figma */}
      <HomeStack.Screen name="Friends" component={FriendsScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
    </HomeStack.Navigator>
  );
}

function EventsStackNavigator() {
  return (
    <EventsStack.Navigator
      screenOptions={{
        // ✏️ แก้ไข: header ของ stack เปลี่ยนจากขาว → ฟ้า primary ตัวหนังสือขาว ตาม mockup ใหม่ (แถบหัวหน้าจอสีฟ้า)
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontFamily: fonts.semiBold },
        headerShadowVisible: false,
      }}
    >
      {/* ✏️ แก้ไข: หน้ารายการกิจกรรมมี SkyHeader ของตัวเองตาม Figma เลยซ่อน header ของ native-stack */}
      <EventsStack.Screen name="EventsList" component={EventsScreen} options={{ headerShown: false }} />
      <EventsStack.Screen name="EventDetail" component={EventDetailScreen} options={{ headerShown: false }} />
      <EventsStack.Screen
        name="CreateEvent"
        component={CreateEventScreen}
        // ✏️ แก้ไข: หน้าสร้าง/แก้ไขกิจกรรมมี SkyHeader + ปุ่มย้อนกลับของตัวเองตาม Figma (ชื่อหน้าสลับตามโหมดแก้ไขในหน้าเอง)
        options={{ headerShown: false }}
      />
      <EventsStack.Screen
        name="LocationPicker"
        component={LocationPickerScreen}
        // ✏️ แก้ไข: หน้าเลือกสถานที่วาดปุ่มย้อนกลับ/ชื่อหน้าเองลอยบนแผนที่ตาม Figma
        options={{ headerShown: false, presentation: 'modal' }}
      />
      {/* ✏️ แก้ไข: Figma หน้าแชทกลุ่มใช้ header ขาว (ไม่ใช่ฟ้าเหมือนหน้าอื่น) ตัวหนังสือ navy */}
      <EventsStack.Screen name="PartyChat" component={PartyChatScreen} options={chatHeaderOptions} />
    </EventsStack.Navigator>
  );
}

function MatchingStackNavigator() {
  return (
    <MatchingStack.Navigator
      screenOptions={{
        // ✏️ แก้ไข: header ของ stack เปลี่ยนจากขาว → ฟ้า primary ตัวหนังสือขาว ตาม mockup ใหม่ (แถบหัวหน้าจอสีฟ้า)
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontFamily: fonts.semiBold },
        headerShadowVisible: false,
      }}
    >
      {/* ✏️ แก้ไข: หน้าจับคู่/ปัดหาคู่มี SkyHeader ของตัวเองตาม Figma */}
      <MatchingStack.Screen name="MatchingHome" component={MatchingScreen} options={{ headerShown: false }} />
      <MatchingStack.Screen name="SwipeMatch" component={SwipeMatchScreen} options={{ headerShown: false }} />
      {/* ✏️ แก้ไข: หน้ารายละเอียดกิจกรรมมี SkyHeader + ปุ่มย้อนกลับของตัวเองตาม Figma */}
      <MatchingStack.Screen name="EventDetail" component={EventDetailScreen} options={{ headerShown: false }} />
      <MatchingStack.Screen name="CreateEvent" component={CreateEventScreen} options={{ headerShown: false }} />
      <MatchingStack.Screen
        name="LocationPicker"
        component={LocationPickerScreen}
        // ✏️ แก้ไข: หน้าเลือกสถานที่วาดปุ่มย้อนกลับ/ชื่อหน้าเองลอยบนแผนที่ตาม Figma
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <MatchingStack.Screen name="PartyChat" component={PartyChatScreen} options={chatHeaderOptions} />
    </MatchingStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        // ✏️ แก้ไข: header ของ stack เปลี่ยนจากขาว → ฟ้า primary ตัวหนังสือขาว ตาม mockup ใหม่ (แถบหัวหน้าจอสีฟ้า)
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontFamily: fonts.semiBold },
        headerShadowVisible: false,
      }}
    >
      {/* ✏️ แก้ไข: หน้าโปรไฟล์มี SkyHeader ของตัวเองตาม Figma */}
      <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen
        name="LocationPicker"
        component={LocationPickerScreen}
        options={{ headerShown: false, presentation: 'modal' }}
      />
    </ProfileStack.Navigator>
  );
}

const ICONS = {
  Home: 'home',
  // ✏️ แก้ไข: ไอคอนแท็บตาม Figma — ค้นหา = แว่นขยาย (search), จับคู่ = shuffle
  FindBuddy: 'search',
  Matching: 'shuffle',
  Events: 'calendar',
  Profile: 'person',
};

// ➕ เพิ่ม: ป้ายชื่อแท็บ — เดิมมาจาก options.title ของแต่ละ Tab.Screen แต่ตอนนี้ label render เองใน
// tabBarIcon (โชว์ใต้ไอคอนทุกแท็บ) เลยต้องมี map แยกไว้ใช้เอง
const LABELS = {
  Home: 'หน้าหลัก',
  FindBuddy: 'ค้นหา',
  Matching: 'จับคู่',
  Events: 'กิจกรรม',
  Profile: 'โปรไฟล์',
};

export default function MainTabNavigator() {
  // ➕ เพิ่ม: ดึงรูปโปรไฟล์ผู้ใช้ปัจจุบัน เพื่อใช้แสดงแทนไอคอน person ธรรมดาที่แท็บโปรไฟล์
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        // ✏️ แก้ไข: ผู้ใช้ขอให้เปลี่ยนกลับจาก floating (position:'absolute' ลอยเหนือขอบจอ) เป็น docked
        // อยู่กับที่เหมือนเดิม (ดู styles.tabBar ด้านล่าง) — ทำให้ React Navigation กันพื้นที่ให้เนื้อหาอัตโนมัติ
        // อีกครั้ง ไม่ต้องพึ่ง paddingBottom พิเศษในแต่ละหน้าเพื่อเลี่ยงโดนทับแบบตอนเป็น floating แล้ว
        // (ยังคงสไตล์ pill เข้มของแท็บ active ไว้เหมือนเดิม แค่เปลี่ยนตำแหน่ง/รูปทรงแถบทั้งแถบ)
        // ✏️ แก้ไข: แถบนำทางตาม Figma "แถบนำทางห้าเมนู" — ทุกแท็บมีไอคอน + ป้ายชื่อ (10px) ใต้ไอคอน,
        // แท็บที่เลือกเป็นตัวหนา สี primaryDark และมีขีดบ่งชี้ 3px สี primary ใต้ป้าย (ไม่ใช้ pill แล้ว)
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
        tabBarIcon: ({ focused }) => {
          const iconNode =
            route.name === 'Profile' && user?.avatar ? (
              <Image source={{ uri: resolveAssetUrl(user.avatar) }} style={tabAvatarStyles.image} />
            ) : (
              // ✏️ แก้ไข: ไอคอนแท็บที่เลือกอยู่อยู่ในกรอบสี่เหลี่ยมมนสี primaryDark ไอคอนขาว ตามหน้า "ค้นหา"/"กิจกรรม" ใน Figma
              // ✏️ แก้ไข: Figma หน้า "หน้าหลัก" แท็บ active เป็นบ้านทึบสี primaryDark ไม่มีกรอบ ส่วนแท็บอื่นที่ active (ค้นหา/กิจกรรม/จับคู่) มีกรอบสี่เหลี่ยมมน
              route.name === 'Home' && focused ? (
                <View style={styles.iconBox}>
                  <Ionicons name="home" size={24} color={colors.primaryDark} />
                </View>
              ) : (
                <View style={[styles.iconBox, focused && styles.iconBoxActive]}>
                  <Ionicons
                    name={focused ? ICONS[route.name] : `${ICONS[route.name]}-outline`}
                    size={focused ? 16 : 22}
                    color={focused ? colors.white : colors.muted}
                  />
                </View>
              )
            );

          return (
            <View style={styles.tabIconWrap}>
              {iconNode}
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]} numberOfLines={1}>
                {LABELS[route.name]}
              </Text>
              <View style={[styles.indicator, focused && styles.indicatorActive]} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="FindBuddy" component={HomeScreen} />
      <Tab.Screen name="Events" component={EventsStackNavigator} />
      <Tab.Screen name="Matching" component={MatchingStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
}

const tabAvatarStyles = StyleSheet.create({
  image: { width: 24, height: 24, borderRadius: 12 },
});

const styles = StyleSheet.create({
  // ✏️ แก้ไข: แถบ docked ขาว เส้นขอบบนบางๆ (#E4EDF4 = colors.border) สูง 68 พอสำหรับไอคอน+ป้าย+ขีดบ่งชี้ (Figma: เมนูสูง 65)
  tabBar: {
    height: 68,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 6,
  },
  tabItem: { paddingVertical: 0, height: 68, justifyContent: 'center' },
  tabIconWrap: { alignItems: 'center', justifyContent: 'center', gap: 3, minWidth: 56 },
  iconBox: { width: 24, height: 24, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  iconBoxActive: { backgroundColor: colors.primaryDark },
  tabLabel: { color: colors.muted, fontFamily: fonts.regular, fontSize: 10 },
  tabLabelActive: { color: colors.primaryDark, fontFamily: fonts.bold },
  indicator: { width: 18, height: 3, borderRadius: 4, backgroundColor: 'transparent' },
  indicatorActive: { backgroundColor: colors.primary },
});
