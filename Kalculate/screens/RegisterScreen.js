import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import createAuthStyles from '../styles/AuthStyles';
import { calculateBmi, getBmiCategory } from '../services/nutritionService';

export default function RegisterScreen({ isDark, onRegister, onSwitchToLogin }) {
  const styles = createAuthStyles(isDark);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    weight: '',
    height: '',
    birthDate: '', // Format: YYYY-MM-DD
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = () => {
    const { firstName, lastName, email, password, confirmPassword, weight, height, birthDate } = formData;

    if (!firstName || !lastName || !email || !password || !weight || !height || !birthDate) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('ข้อผิดพลาด', 'รหัสผ่านไม่ตรงกัน');
      return;
    }

    // คำนวณ BMI เบื้องต้นเพื่อแสดงผลหรือส่งต่อ
    try {
      const bmi = calculateBmi({ weightKg: weight, heightCm: height });
      const category = getBmiCategory(bmi);

      onRegister({
        ...formData,
        bmi,
        bmiCategory: category
      });
    } catch (error) {
      Alert.alert('ข้อผิดพลาด', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: 60, paddingBottom: 40 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>สร้างบัญชีใหม่</Text>
          <Text style={styles.subtitle}>เริ่มต้นการดูแลสุขภาพกับเรา</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>ชื่อจริง</Text>
              <TextInput
                style={styles.input}
                placeholder="สมชาย"
                placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                value={formData.firstName}
                onChangeText={(v) => handleInputChange('firstName', v)}
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>นามสกุล</Text>
              <TextInput
                style={styles.input}
                placeholder="ใจดี"
                placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                value={formData.lastName}
                onChangeText={(v) => handleInputChange('lastName', v)}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>อีเมล</Text>
            <TextInput
              style={styles.input}
              placeholder="example@email.com"
              placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
              value={formData.email}
              onChangeText={(v) => handleInputChange('email', v)}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>รหัสผ่าน</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                value={formData.password}
                onChangeText={(v) => handleInputChange('password', v)}
                secureTextEntry
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>ยืนยันรหัสผ่าน</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                value={formData.confirmPassword}
                onChangeText={(v) => handleInputChange('confirmPassword', v)}
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>น้ำหนัก (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="65"
                placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                value={formData.weight}
                onChangeText={(v) => handleInputChange('weight', v)}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.label}>ส่วนสูง (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="170"
                placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                value={formData.height}
                onChangeText={(v) => handleInputChange('height', v)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>วันเดือนปีเกิด</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD (เช่น 1995-05-20)"
              placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
              value={formData.birthDate}
              onChangeText={(v) => handleInputChange('birthDate', v)}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>สมัครสมาชิก</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>มีบัญชีอยู่แล้ว?</Text>
            <TouchableOpacity onPress={onSwitchToLogin}>
              <Text style={styles.footerLink}>เข้าสู่ระบบ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
