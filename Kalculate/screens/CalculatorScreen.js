import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import Card from '../components/Card';
import createCalculatorStyles from '../styles/CalculatorStyles';
import {
  calculateBmi,
  getBmiCategory,
  calculateBmr,
  calculateTdee,
  calculateAge,
  calculateSmartTargetCalories,
  calculateHealthMacroTargets
} from '../services/nutritionService';

export default function CalculatorScreen({ isDark, user }) {
  const styles = createCalculatorStyles(isDark);

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

      const smartTarget = calculateSmartTargetCalories({ bmi, tdee, sex });
      const macros = calculateHealthMacroTargets(smartTarget.targetCalories, bmi);

      return {
        bmi,
        bmiCategory,
        bmr,
        tdee,
        targetCalories: smartTarget.targetCalories,
        recommendation: smartTarget.recommendation,
        macros: {
          protein: macros.proteinG,
          carbs: macros.carbsG,
          fat: macros.fatG,
        }
      };
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [user]);

  if (!stats) {
    return (
      <View style={{ flex: 1, padding: 24 }}>
        <Text style={styles.title}>ไม่พบข้อมูล</Text>
        <Text style={styles.subtitle}>กรุณาเข้าสู่ระบบหรือตั้งค่าข้อมูลส่วนตัวเพื่อคำนวณ</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>วิเคราะห์สุขภาพ</Text>
      <Text style={[styles.subtitle, { color: '#10b981', fontWeight: '700' }]}>
        {stats.recommendation}
      </Text>

      <View style={styles.grid}>
        <View style={{ width: '48%' }}>
          <Card isDark={isDark}>
            <Text style={styles.cardLabel}>BMI</Text>
            <Text style={styles.cardValue}>{stats.bmi}</Text>
            <Text style={[styles.badge, { backgroundColor: '#10b981', color: 'white' }]}>{stats.bmiCategory}</Text>
          </Card>
        </View>
        <View style={{ width: '48%' }}>
          <Card isDark={isDark}>
            <Text style={styles.cardLabel}>BMR (ขณะพัก)</Text>
            <Text style={styles.cardValue}>{stats.bmr}</Text>
            <Text style={styles.cardMeta}>kcal/วัน</Text>
          </Card>
        </View>
        <View style={{ width: '48%' }}>
          <Card isDark={isDark}>
            <Text style={styles.cardLabel}>TDEE (ใช้จริง)</Text>
            <Text style={styles.cardValue}>{stats.tdee}</Text>
            <Text style={styles.cardMeta}>kcal/วัน</Text>
          </Card>
        </View>
        <View style={{ width: '48%' }}>
          <Card isDark={isDark} style={{ borderColor: '#10b981', borderWidth: 2 }}>
            <Text style={styles.cardLabel}>แคลอรี่ที่แนะนำ</Text>
            <Text style={[styles.cardValue, { color: '#10b981' }]}>{stats.targetCalories}</Text>
            <Text style={styles.cardMeta}>เพื่อสุขภาพที่ดี</Text>
          </Card>
        </View>
      </View>

      <Card isDark={isDark} style={styles.macrosCard}>
        <Text style={styles.cardTitle}>สัดส่วนสารอาหารที่เหมาะสมกับ BMI</Text>
        <View style={styles.macroGrid}>
          <View style={styles.macroBlock}>
            <Text style={styles.cardLabel}>โปรตีน</Text>
            <Text style={styles.cardValue}>{stats.macros.protein} g</Text>
          </View>
          <View style={styles.macroBlock}>
            <Text style={styles.cardLabel}>คาร์บ</Text>
            <Text style={styles.cardValue}>{stats.macros.carbs} g</Text>
          </View>
          <View style={styles.macroBlock}>
            <Text style={styles.cardLabel}>ไขมัน</Text>
            <Text style={styles.cardValue}>{stats.macros.fat} g</Text>
          </View>
        </View>
        <Text style={{ marginTop: 12, fontSize: 12, color: isDark ? '#94a3b8' : '#64748b', textAlign: 'center', fontStyle: 'italic' }}>
          *คำนวณสัดส่วนโปรตีนสูงขึ้นตามค่า BMI เพื่อรักษามวลกล้ามเนื้อและควบคุมน้ำหนัก
        </Text>
      </Card>
    </ScrollView>
  );
}
