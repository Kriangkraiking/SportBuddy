import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
// ✏️ แก้ไข: ใช้ AppIcon (Lucide ตาม Figma) แทน Ionicons ตรงๆ — API เดียวกัน
import Ionicons from '../components/AppIcon';
import { useAuth } from '../context/AuthContext';
import IconInput from '../components/IconInput';
// ➕ เพิ่ม: header ไล่เฉดฟ้ากลาง ใช้ร่วมทุกหน้าตาม Figma
import SkyHeader from '../components/SkyHeader';
import colors from '../theme/colors';
// ✏️ แก้ไข: ย้ายไฟล์สไตล์จาก screens/ ไปไว้โฟลเดอร์ src/Style/ แยกต่างหาก ให้แยกส่วน UI ชัดเจนขึ้น
import styles from '../Style/LoginScreen.styles';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      Alert.alert('เข้าสู่ระบบไม่สำเร็จ', err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ✏️ แก้ไข: layout ใหม่ตาม Figma "เข้าสู่ระบบ" — SkyHeader (โลโก้ + แท็กไลน์ + ไอคอนกีฬา) + การ์ดขาวลอยทับ header
  // ช่องกรอกมี label "อีเมล"/"รหัสผ่าน" ด้านบน ปุ่มเหลืองมีลูกศร ลิงก์สมัครสมาชิกอยู่ในการ์ด (logic เดิมไม่เปลี่ยน)
  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <SkyHeader extraBottom={64}>
          <View style={styles.heroContent}>
            <View style={styles.identityRow}>
              <View style={styles.logoBadge}>
                <Ionicons name="football-outline" size={30} color={colors.primaryDark} />
              </View>
              <Text style={styles.logo}>SportBuddy</Text>
            </View>
            <Text style={styles.tagline}>หาเพื่อนเล่นกีฬา ง่ายแค่ปลายนิ้ว</Text>
            <View style={styles.sportsRow}>
              {['basketball-outline', 'footsteps-outline', 'tennisball-outline'].map((icon) => (
                <View key={icon} style={styles.sportBadge}>
                  <Ionicons name={icon} size={20} color={colors.white} />
                </View>
              ))}
            </View>
          </View>
        </SkyHeader>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>เข้าสู่ระบบ</Text>
          <Text style={styles.cardSubtitle}>เพื่อนร่วมทีมคนต่อไป กำลังรอคุณอยู่</Text>

          <IconInput
            label="อีเมล"
            icon="mail-outline"
            placeholder="อีเมล"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <IconInput
            label="รหัสผ่าน"
            icon="lock-closed-outline"
            placeholder="รหัสผ่าน"
            secure
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={submitting}>
            <Text style={styles.buttonText}>{submitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</Text>
            {!submitting && <Ionicons name="arrow-forward" size={18} color={colors.ctaText} />}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>
              ยังไม่มีบัญชี? <Text style={styles.linkStrong}>สมัครสมาชิก</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
