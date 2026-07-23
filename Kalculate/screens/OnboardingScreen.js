import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import createAuthStyles from '../styles/AuthStyles';

const activityOptions = [
  ['sedentary', 'นั่งเป็นส่วนใหญ่'],
  ['light', 'เคลื่อนไหวเล็กน้อย'],
  ['moderate', 'ออกกำลังกายปานกลาง'],
  ['active', 'ออกกำลังกายมาก'],
  ['very_active', 'ออกกำลังกายหนักมาก'],
];

const goalOptions = [
  ['lose_weight', 'ลดน้ำหนัก'],
  ['maintain', 'คงน้ำหนัก'],
  ['gain_weight', 'เพิ่มน้ำหนัก'],
];

export default function OnboardingScreen({ isDark, profile, saveProfile }) {
  const styles = createAuthStyles(isDark);
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [sex, setSex] = useState(profile?.sex || '');
  const [birthDate, setBirthDate] = useState(profile?.birth_date || '');
  const [heightCm, setHeightCm] = useState(profile?.height_cm ? String(profile.height_cm) : '');
  const [weightKg, setWeightKg] = useState(profile?.current_weight_kg ? String(profile.current_weight_kg) : '');
  const [activityLevel, setActivityLevel] = useState(profile?.activity_level || 'moderate');
  const [goal, setGoal] = useState(profile?.goal || 'maintain');
  const [weeklyChange, setWeeklyChange] = useState(profile?.weekly_weight_change_kg ? String(profile.weekly_weight_change_kg) : '0.25');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async () => {
    const height = Number(heightCm);
    const weight = Number(weightKg);
    if (!displayName.trim() || !sex || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || height <= 0 || weight <= 0) {
      setMessage('กรอกชื่อ เพศ วันเกิด (YYYY-MM-DD) ส่วนสูง และน้ำหนักให้ครบถ้วน');
      return;
    }
    try {
      setSaving(true);
      setMessage('');
      await saveProfile({
        display_name: displayName.trim(), sex, birth_date: birthDate, height_cm: height,
        current_weight_kg: weight, activity_level: activityLevel, goal,
        weekly_weight_change_kg: goal === 'maintain' ? 0 : Math.abs(Number(weeklyChange) || 0.25),
      });
    } catch (error) {
      setMessage(error.message || 'บันทึกข้อมูลไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>🥗 Kalculate</Text>
      <Text style={styles.title}>ตั้งค่าโปรไฟล์ของคุณ</Text>
      <Text style={styles.subtitle}>ข้อมูลนี้ใช้คำนวณ BMI, BMR และเป้าหมายแคลอรี่</Text>
      <TextInput value={displayName} onChangeText={setDisplayName} placeholder="ชื่อที่แสดง" placeholderTextColor={styles.placeholder.color} style={styles.input} />
      <View style={styles.optionRow}>{[['male', 'ชาย'], ['female', 'หญิง']].map(([value, label]) => <Pressable key={value} onPress={() => setSex(value)} style={[styles.option, sex === value && styles.optionSelected]}><Text style={[styles.optionText, sex === value && styles.optionTextSelected]}>{label}</Text></Pressable>)}</View>
      <TextInput value={birthDate} onChangeText={setBirthDate} placeholder="วันเกิด (YYYY-MM-DD)" placeholderTextColor={styles.placeholder.color} style={styles.input} />
      <TextInput value={heightCm} onChangeText={setHeightCm} placeholder="ส่วนสูง (ซม.)" placeholderTextColor={styles.placeholder.color} style={styles.input} keyboardType="decimal-pad" />
      <TextInput value={weightKg} onChangeText={setWeightKg} placeholder="น้ำหนักปัจจุบัน (กก.)" placeholderTextColor={styles.placeholder.color} style={styles.input} keyboardType="decimal-pad" />
      <Text style={styles.fieldLabel}>กิจกรรม</Text>
      <View style={styles.optionWrap}>{activityOptions.map(([value, label]) => <Pressable key={value} onPress={() => setActivityLevel(value)} style={[styles.option, activityLevel === value && styles.optionSelected]}><Text style={[styles.optionText, activityLevel === value && styles.optionTextSelected]}>{label}</Text></Pressable>)}</View>
      <Text style={styles.fieldLabel}>เป้าหมาย</Text>
      <View style={styles.optionRow}>{goalOptions.map(([value, label]) => <Pressable key={value} onPress={() => setGoal(value)} style={[styles.option, goal === value && styles.optionSelected]}><Text style={[styles.optionText, goal === value && styles.optionTextSelected]}>{label}</Text></Pressable>)}</View>
      {goal !== 'maintain' ? <TextInput value={weeklyChange} onChangeText={setWeeklyChange} placeholder="เปลี่ยนน้ำหนักต่อสัปดาห์ (กก.)" placeholderTextColor={styles.placeholder.color} style={styles.input} keyboardType="decimal-pad" /> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <Pressable style={[styles.primaryButton, saving && styles.disabled]} onPress={submit} disabled={saving}>{saving ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>บันทึกและเริ่มใช้งาน</Text>}</Pressable>
    </View>
  );
}
