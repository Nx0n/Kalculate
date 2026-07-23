import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import Card from '../components/Card';
import createProfileStyles from '../styles/ProfileStyles';
import { signOut } from '../services/profileService';

export default function ProfileScreen({ isDark, profile, saveProfile, addWeight }) {
  const styles = createProfileStyles(isDark);
  const [name, setName] = useState(profile?.display_name || '');
  const [height, setHeight] = useState(profile?.height_cm ? String(profile.height_cm) : '');
  const [weight, setWeight] = useState(profile?.current_weight_kg ? String(profile.current_weight_kg) : '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setName(profile?.display_name || '');
    setHeight(profile?.height_cm ? String(profile.height_cm) : '');
    setWeight(profile?.current_weight_kg ? String(profile.current_weight_kg) : '');
  }, [profile]);

  const save = async () => {
    const heightCm = Number(height);
    const weightKg = Number(weight);
    if (!name.trim() || heightCm <= 0 || weightKg <= 0) {
      setMessage('กรอกชื่อ ส่วนสูง และน้ำหนักให้ถูกต้อง');
      return;
    }
    try {
      setSaving(true);
      setMessage('');
      await saveProfile({ display_name: name.trim(), height_cm: heightCm });
      if (weightKg !== Number(profile?.current_weight_kg)) await addWeight({ weightKg });
      setMessage('บันทึกแล้ว');
    } catch (error) {
      setMessage(error.message || 'บันทึกข้อมูลไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  return <View>
    <Text style={styles.title}>Profile</Text>
    <Text style={styles.subtitle}>ข้อมูลส่วนตัวสำหรับคำนวณแคลอรี่และเป้าหมาย</Text>
    <Card isDark={isDark}>
      <Text style={styles.cardLabel}>ชื่อที่แสดง</Text>
      <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="ชื่อ" placeholderTextColor={styles.placeholder.color} />
      <Text style={styles.cardLabel}>ส่วนสูง (ซม.)</Text>
      <TextInput value={height} onChangeText={setHeight} style={styles.input} placeholder="ส่วนสูง" placeholderTextColor={styles.placeholder.color} keyboardType="decimal-pad" />
      <Text style={styles.cardLabel}>น้ำหนักปัจจุบัน (กก.)</Text>
      <TextInput value={weight} onChangeText={setWeight} style={styles.input} placeholder="น้ำหนัก" placeholderTextColor={styles.placeholder.color} keyboardType="decimal-pad" />
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <Pressable onPress={save} style={[styles.button, saving && styles.disabled]} disabled={saving}>{saving ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>บันทึกโปรไฟล์</Text>}</Pressable>
    </Card>
    <Card isDark={isDark}><Text style={styles.cardLabel}>เป้าหมาย</Text><Text style={styles.cardValue}>{profile?.goal === 'lose_weight' ? 'ลดน้ำหนัก' : profile?.goal === 'gain_weight' ? 'เพิ่มน้ำหนัก' : 'คงน้ำหนัก'}</Text><Text style={styles.cardMeta}>กิจกรรม: {profile?.activity_level || '-'}</Text></Card>
    <Pressable onPress={signOut} style={styles.signOutButton}><Text style={styles.signOutText}>ออกจากระบบ</Text></Pressable>
  </View>;
}
