import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { signIn, signUp } from '../services/profileService';
import createAuthStyles from '../styles/AuthStyles';

export default function AuthScreen({ isDark }) {
  const styles = createAuthStyles(isDark);
  const [mode, setMode] = useState('signIn');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const isSignUp = mode === 'signUp';

  const submit = async () => {
    try {
      setLoading(true);
      setMessage('');
      if (isSignUp) {
        const result = await signUp({ email: email.trim(), password, displayName: displayName.trim() });
        if (!result.session) {
          setMessage('สมัครสำเร็จ โปรดตรวจสอบอีเมลเพื่อยืนยันบัญชี แล้วกลับมาเข้าสู่ระบบ');
        }
      } else {
        await signIn({ email: email.trim(), password });
      }
    } catch (error) {
      setMessage(error.message || 'ไม่สามารถดำเนินการได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>🥗 Kalculate</Text>
      <Text style={styles.title}>{isSignUp ? 'สร้างบัญชี' : 'ยินดีต้อนรับกลับมา'}</Text>
      <Text style={styles.subtitle}>ติดตามอาหารและเป้าหมายของคุณด้วยข้อมูลจริง</Text>
      {isSignUp ? (
        <TextInput value={displayName} onChangeText={setDisplayName} placeholder="ชื่อที่แสดง" placeholderTextColor={styles.placeholder.color} style={styles.input} autoCapitalize="words" />
      ) : null}
      <TextInput value={email} onChangeText={setEmail} placeholder="อีเมล" placeholderTextColor={styles.placeholder.color} style={styles.input} autoCapitalize="none" keyboardType="email-address" />
      <TextInput value={password} onChangeText={setPassword} placeholder="รหัสผ่าน" placeholderTextColor={styles.placeholder.color} style={styles.input} secureTextEntry />
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <Pressable style={[styles.primaryButton, loading && styles.disabled]} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>{isSignUp ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}</Text>}
      </Pressable>
      <Pressable onPress={() => { setMode(isSignUp ? 'signIn' : 'signUp'); setMessage(''); }} disabled={loading}>
        <Text style={styles.link}>{isSignUp ? 'มีบัญชีแล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? สมัครสมาชิก'}</Text>
      </Pressable>
    </View>
  );
}
