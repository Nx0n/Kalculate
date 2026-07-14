import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import createAuthStyles from '../styles/AuthStyles';

export default function LoginScreen({ isDark, onLogin, onSwitchToRegister }) {
  const styles = createAuthStyles(isDark);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>ยินดีต้อนรับ</Text>
          <Text style={styles.subtitle}>เข้าสู่ระบบเพื่อใช้งาน Kalculate</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>อีเมล</Text>
            <TextInput
              style={styles.input}
              placeholder="example@email.com"
              placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>รหัสผ่าน</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={() => onLogin(email, password)}>
            <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>ยังไม่มีบัญชี?</Text>
            <TouchableOpacity onPress={onSwitchToRegister}>
              <Text style={styles.footerLink}>สมัครสมาชิก</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
