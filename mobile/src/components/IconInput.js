import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
// ✏️ แก้ไข: ใช้ AppIcon (Lucide ตาม Figma) แทน Ionicons ตรงๆ — API เดียวกัน
import Ionicons from './AppIcon';
import colors from '../theme/colors';
import { fonts } from '../theme/typography';

// ✏️ แก้ไข: ปรับหน้าตาตาม Figma (หน้าเข้าสู่ระบบ/สมัครสมาชิก) — มี label ด้านบนช่อง (prop `label`, ไม่ใส่ก็ไม่แสดง),
// ช่องสูง 50 พื้น colors.background ขอบ colors.borderInput radius 14 ไอคอนสี primaryDark
// ➕ เพิ่ม: prop `error` (ข้อความ) → ขอบ/ไอคอนเป็นสีแดง พื้นแดงอ่อน และแสดงข้อความ error ใต้ช่อง ตามช่องอีเมลที่ผิดใน Figma
// ➕ เพิ่ม: prop `helper` แสดงข้อความช่วยเหลือสีเทาใต้ช่อง (เช่น เงื่อนไขรหัสผ่าน)
export default function IconInput({ icon, secure, style, label, error, helper, ...props }) {
  const [hidden, setHidden] = useState(!!secure);

  return (
    <View style={[styles.field, style]}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.wrap, !!error && styles.wrapError]}>
        {!!icon && (
          <Ionicons name={icon} size={20} color={error ? colors.danger : colors.primaryDark} style={styles.icon} />
        )}
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.muted}
          secureTextEntry={secure ? hidden : false}
          {...props}
        />
        {secure && (
          <TouchableOpacity onPress={() => setHidden((h) => !h)} hitSlop={8}>
            <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={19} color={colors.muted} />
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
      {!error && !!helper && <Text style={styles.helperText}>{helper}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 14 },
  label: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.text, marginBottom: 6 },
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 14,
    height: 50,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.borderInput,
  },
  // พื้น #FFF7F7 ใน Figma = แดงอ่อนมาก ใช้ dangerLight (เพิ่มใน colors.js)
  wrapError: { borderColor: colors.danger, backgroundColor: colors.dangerLight },
  icon: { marginRight: 10 },
  input: {
    flex: 1,
    paddingVertical: 0,
    color: colors.text,
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  errorText: { fontFamily: fonts.regular, fontSize: 12, color: colors.danger, marginTop: 6, lineHeight: 18 },
  helperText: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 6, lineHeight: 18 },
});
