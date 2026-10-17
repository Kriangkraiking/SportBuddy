import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
// ✏️ แก้ไข: ใช้ AppIcon (Lucide ตาม Figma) แทน Ionicons ตรงๆ — API เดียวกัน
import Ionicons from '../components/AppIcon';
import { useAuth } from '../context/AuthContext';
import IconInput from '../components/IconInput';
// ➕ เพิ่ม: header ไล่เฉดฟ้ากลาง + รายการกีฬาทางการ (SPORTS) สำหรับ dropdown กีฬาโปรด
import SkyHeader from '../components/SkyHeader';
import { SPORTS } from '../constants/options';
import colors from '../theme/colors';
// ✏️ แก้ไข: ย้ายไฟล์สไตล์จาก screens/ ไปไว้โฟลเดอร์ src/Style/ แยกต่างหาก ให้แยกส่วน UI ชัดเจนขึ้น
import styles from '../Style/RegisterScreen.styles';

// ➕ เพิ่ม: regex สำหรับตรวจรูปแบบอีเมล (ต้องมี @ และโดเมนที่มีจุด)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ➕ เพิ่ม: ฟังก์ชันตรวจสอบแต่ละฟิลด์ แยกออกมาเพื่อเรียกซ้ำได้ทั้งตอนพิมพ์และตอนกดสมัคร
const validateName = (value) => {
  if (!value.trim()) return 'กรุณากรอกชื่อ';
  return '';
};

const validateEmail = (value) => {
  if (!value.trim()) return 'กรุณากรอกอีเมล';
  if (!EMAIL_REGEX.test(value.trim())) return 'รูปแบบอีเมลไม่ถูกต้อง เช่น name@example.com';
  return '';
};

// ➕ เพิ่ม: เงื่อนไขรหัสผ่าน — อย่างน้อย 6 ตัวอักษร และต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว
const validatePassword = (value) => {
  if (!value) return 'กรุณากรอกรหัสผ่าน';
  if (value.length < 6) return 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
  if (!/[A-Z]/.test(value)) return 'รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว (A-Z)';
  return '';
};

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sport, setSport] = useState('');
  // ➕ เพิ่ม: เปิด/ปิด modal เลือกกีฬาโปรด (แทนช่องพิมพ์อิสระเดิม ที่ผิดกฎ "ห้าม free-text กีฬา" ข้อ 4)
  const [sportPickerOpen, setSportPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ➕ เพิ่ม: state เก็บข้อความ error รายฟิลด์ และสถานะว่าฟิลด์ไหนถูกแตะ (touched) แล้วบ้าง
  // ใช้ touched เพื่อไม่ให้ error โผล่ทันทีตั้งแต่หน้าจอเพิ่งเปิด ต้องรอให้ผู้ใช้คลิกออกจากช่องก่อน
  const [errors, setErrors] = useState({ name: '', email: '', password: '' });
  const [touched, setTouched] = useState({ name: false, email: false, password: false });

  // ➕ เพิ่ม: อัปเดตค่า + ถ้าฟิลด์นั้นถูกแตะไปแล้ว ให้ตรวจสอบใหม่ทันทีขณะพิมพ์ (inline validation)
  const handleChange = (field, validator, setValue) => (value) => {
    setValue(value);
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validator(value) }));
    }
  };

  // ➕ เพิ่ม: ตอนออกจากช่อง (blur) ให้ทำเครื่องหมายว่าแตะแล้ว และตรวจสอบค่าปัจจุบันทันที
  const handleBlur = (field, validator, value) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validator(value) }));
  };

  const handleRegister = async () => {
    // ➕ เพิ่ม: ตรวจสอบทุกฟิลด์ก่อนส่งฟอร์ม แทนการเช็คแค่ "กรอกครบหรือยัง" แบบเดิม
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setTouched({ name: true, email: true, password: true });
    setErrors({ name: nameError, email: emailError, password: passwordError });

    if (nameError || emailError || passwordError) {
      Alert.alert('ข้อมูลไม่ถูกต้อง', 'กรุณาตรวจสอบข้อมูลที่กรอกอีกครั้ง');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name,
        email,
        password,
        sports: sport ? [{ name: sport, level: 'beginner' }] : [],
      });
    } catch (err) {
      Alert.alert('สมัครสมาชิกไม่สำเร็จ', err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedSport = SPORTS.find((s) => s.label === sport);

  // ✏️ แก้ไข: layout ตาม Figma "สมัครสมาชิก" — SkyHeader (ปุ่มย้อนกลับ + โลโก้ + หัวข้อ) + การ์ดฟอร์มลอยทับ header
  // ช่องมี label ด้านบน, error/helper แสดงใต้ช่องผ่าน prop ของ IconInput, กีฬาโปรดเป็น dropdown, ปุ่มเหลืองมีลูกศร
  // (logic validate/สมัครเดิมไม่เปลี่ยน)
  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <SkyHeader extraBottom={72}>
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')} hitSlop={10}>
              <Ionicons name="arrow-back" size={20} color={colors.white} />
            </TouchableOpacity>
            <View style={styles.identityRow}>
              <View style={styles.logoBadge}>
                <Ionicons name="football-outline" size={22} color={colors.primaryDark} />
              </View>
              <Text style={styles.logo}>SportBuddy</Text>
            </View>
          </View>
          <View style={styles.intro}>
            <Text style={styles.introTitle}>สมัครสมาชิก</Text>
            <Text style={styles.introSubtitle}>มาเป็นเพื่อนร่วมทีมกันเถอะ</Text>
          </View>
        </SkyHeader>

        <View style={styles.card}>
          <IconInput
            label="ชื่อผู้ใช้"
            icon="person-outline"
            placeholder="ชื่อของคุณ"
            value={name}
            onChangeText={handleChange('name', validateName, setName)}
            onBlur={handleBlur('name', validateName, name)}
            error={touched.name ? errors.name : ''}
          />

          <IconInput
            label="อีเมล"
            icon="mail-outline"
            placeholder="email@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={handleChange('email', validateEmail, setEmail)}
            onBlur={handleBlur('email', validateEmail, email)}
            error={touched.email ? errors.email : ''}
          />

          <IconInput
            label="รหัสผ่าน"
            icon="lock-closed-outline"
            placeholder="รหัสผ่าน"
            secure
            value={password}
            onChangeText={handleChange('password', validatePassword, setPassword)}
            onBlur={handleBlur('password', validatePassword, password)}
            error={touched.password ? errors.password : ''}
            helper="ต้องมีอย่างน้อย 6 ตัวอักษร และมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว"
          />

          {/* ✏️ แก้ไข: กีฬาโปรดเปลี่ยนจากช่องพิมพ์อิสระ → dropdown เลือกจาก SPORTS (ตามกฎข้อ 4 และ Figma) */}
          <Text style={styles.fieldLabel}>กีฬาโปรด</Text>
          <TouchableOpacity style={styles.picker} activeOpacity={0.8} onPress={() => setSportPickerOpen(true)}>
            <Ionicons name={selectedSport?.icon || 'football-outline'} size={20} color={colors.primaryDark} />
            <Text style={[styles.pickerText, !selectedSport && styles.pickerPlaceholder]}>
              {selectedSport ? selectedSport.label : 'เลือกกีฬาที่ชอบ'}
            </Text>
            <Ionicons name="chevron-down" size={19} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={submitting}>
            <Text style={styles.buttonText}>{submitting ? 'กำลังสร้างบัญชี...' : 'สมัครสมาชิก'}</Text>
            {!submitting && <Ionicons name="arrow-forward" size={18} color={colors.ctaText} />}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>
              มีบัญชีแล้ว? <Text style={styles.linkStrong}>เข้าสู่ระบบ</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={sportPickerOpen} transparent animationType="slide" onRequestClose={() => setSportPickerOpen(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setSportPickerOpen(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>เลือกกีฬาโปรด</Text>
            <ScrollView>
              {SPORTS.map((s) => (
                <TouchableOpacity
                  key={s.key}
                  style={[styles.sportRow, s.label === sport && styles.sportRowActive]}
                  onPress={() => {
                    setSport(s.label);
                    setSportPickerOpen(false);
                  }}
                >
                  <Ionicons name={s.icon} size={20} color={colors.primaryDark} />
                  <Text style={styles.sportRowText}>{s.label}</Text>
                  {s.label === sport && <Ionicons name="checkmark" size={18} color={colors.primaryDark} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}
