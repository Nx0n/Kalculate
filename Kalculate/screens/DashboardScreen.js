import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Card from '../components/Card';
import createDashboardStyles from '../styles/DashboardStyles';
import {
  calculateBmi,
  getBmiCategory,
  calculateBmr,
  calculateTdee,
  calculateAge,
  calculateSmartTargetCalories,
  calculateHealthMacroTargets
} from '../services/nutritionService';

export default function DashboardScreen({ isDark, user, consumedToday = 0 }) {
  const styles = createDashboardStyles(isDark);

  // คำนวณข้อมูลสุขภาพและเป้าหมายที่ฉลาดขึ้น
  const stats = useMemo(() => {
    if (!user) return null;
    try {
      const weight = Number(user.weight);
      const height = Number(user.height);
      const age = calculateAge(user.birthDate || '1995-01-01');
      const sex = user.sex || 'male';

      const bmi = calculateBmi({ weightKg: weight, heightCm: height });
      const bmiCategory = getBmiCategory(bmi);
      const bmr = calculateBmr({ sex, age, weightKg: weight, heightCm: height });
      const tdee = calculateTdee(bmr, user.activityLevel || 'moderate');

      // ใช้ฟังก์ชันใหม่ที่คำนวณตาม BMI เพื่อสุขภาพ
      const smartTarget = calculateSmartTargetCalories({ bmi, tdee, sex });
      const macros = calculateHealthMacroTargets(smartTarget.targetCalories, bmi);

      return {
        bmi,
        bmiCategory,
        goal: smartTarget.targetCalories,
        recommendation: smartTarget.recommendation,
        macros
      };
    } catch (e) {
      return { bmi: 0, bmiCategory: '-', goal: 2000, recommendation: 'รักษาสุขภาพ', macros: { proteinG: 120, carbsG: 250, fatG: 60 } };
    }
  }, [user]);

  const dailyGoal = stats?.goal || 2000;
  const remaining = Math.max(dailyGoal - consumedToday, 0);
  const percentConsumed = Math.min(Math.round((consumedToday / dailyGoal) * 100), 100);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>สวัสดี, {user?.firstName || 'คุณ'}</Text>
      <Text style={[styles.subtitle, { color: '#10b981', fontWeight: '700' }]}>
        {stats?.recommendation}
      </Text>

      <View style={styles.grid}>
        <View style={{ width: '48%' }}>
          <Card isDark={isDark}>
            <Text style={styles.cardLabel}>BMI ของคุณ</Text>
            <Text style={styles.cardValue}>{stats?.bmi || '-'}</Text>
            <Text style={{ ...styles.cardMeta, color: '#10b981', fontSize: 11 }}>{stats?.bmiCategory || '-'}</Text>
          </Card>
        </View>
        <View style={{ width: '48%' }}>
          <Card isDark={isDark}>
            <Text style={styles.cardLabel}>คงเหลือ</Text>
            <Text style={styles.cardValue}>{remaining}</Text>
            <Text style={{ ...styles.cardMeta, color: isDark ? '#94a3b8' : '#64748b' }}>แคลอรี่</Text>
          </Card>
        </View>
      </View>

      <Text style={styles.sectionTitle}>สรุปโภชนาการวันนี้</Text>
      <Card isDark={isDark}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={styles.cardLabel}>แคลอรี่ที่ได้รับ</Text>
            <Text style={{ ...styles.cardValue, fontSize: 24 }}>{consumedToday} / {dailyGoal} kcal</Text>
          </View>
          <Feather name="activity" size={24} color="#10b981" />
        </View>
        <View style={{ height: 8, backgroundColor: isDark ? '#334155' : '#f1f5f9', borderRadius: 4, marginTop: 12, overflow: 'hidden' }}>
          <View style={{ height: 8, backgroundColor: '#10b981', borderRadius: 4, width: `${percentConsumed}%` }} />
        </View>
      </Card>

      <Text style={styles.sectionTitle}>สารอาหารที่เหมาะสมกับคุณ</Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Card isDark={isDark} style={{ padding: 12 }}>
            <Text style={[styles.cardLabel, { fontSize: 10 }]}>โปรตีน</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: isDark ? '#f8fafc' : '#0f172a' }}>
              {stats?.macros?.proteinG}g
            </Text>
          </Card>
        </View>
        <View style={{ flex: 1 }}>
          <Card isDark={isDark} style={{ padding: 12 }}>
            <Text style={[styles.cardLabel, { fontSize: 10 }]}>คาร์บ</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: isDark ? '#f8fafc' : '#0f172a' }}>
              {stats?.macros?.carbsG}g
            </Text>
          </Card>
        </View>
        <View style={{ flex: 1 }}>
          <Card isDark={isDark} style={{ padding: 12 }}>
            <Text style={[styles.cardLabel, { fontSize: 10 }]}>ไขมัน</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: isDark ? '#f8fafc' : '#0f172a' }}>
              {stats?.macros?.fatG}g
            </Text>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}
