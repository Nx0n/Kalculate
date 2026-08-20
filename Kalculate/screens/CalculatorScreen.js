import React, { useMemo } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
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

const { width } = Dimensions.get('window');

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
          ratios: macros.ratios
        }
      };
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [user]);

  if (!stats) {
    return (
      <View style={{ flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={styles.title}>ไม่พบข้อมูล</Text>
        <Text style={styles.subtitle}>กรุณาเข้าสู่ระบบหรือตั้งค่าข้อมูลส่วนตัวเพื่อคำนวณ</Text>
      </View>
    );
  }

  // Multi-segment Donut Chart Config
  const size = width * 0.5;
  const strokeWidth = 25;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const { proteinRatio, carbRatio, fatRatio } = stats.macros.ratios;

  // Calculate offsets for segments
  const proteinOffset = circumference * (1 - proteinRatio);
  const carbOffset = circumference * (1 - carbRatio);
  const fatOffset = circumference * (1 - fatRatio);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>วิเคราะห์ร่างกาย</Text>
      <Text style={styles.subtitle}>{stats.recommendation}</Text>

      <View style={styles.grid}>
        <View style={{ width: '48%' }}>
          <Card isDark={isDark}>
            <Text style={styles.cardLabel}>ดัชนีมวลกาย</Text>
            <Text style={styles.cardValue}>{stats.bmi}</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{stats.bmiCategory}</Text></View>
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
          <Card isDark={isDark} style={{ borderColor: '#10b981', borderWidth: 1.5 }}>
            <Text style={styles.cardLabel}>แคลอรี่ที่แนะนำ</Text>
            <Text style={[styles.cardValue, { color: '#10b981' }]}>{stats.targetCalories}</Text>
            <Text style={styles.cardMeta}>เพื่อเป้าหมายสุขภาพ</Text>
          </Card>
        </View>
      </View>

      <Text style={styles.sectionTitle}>สัดส่วนอาหารที่เหมาะสม</Text>

      <Card isDark={isDark} style={styles.macrosCard}>
        <View style={styles.macroChartWrapper}>
          <Svg width={size} height={size}>
            <G rotation="-90" origin={`${size/2}, ${size/2}`}>
              {/* Carbs Segment (Start at 0) */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#3b82f6"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - carbRatio)}
                fill="none"
              />
              {/* Protein Segment (Start after Carbs) */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#f59e0b"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - proteinRatio)}
                fill="none"
                transform={`rotate(${360 * carbRatio} ${size / 2} ${size / 2})`}
              />
              {/* Fat Segment (Start after Protein) */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#ef4444"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - fatRatio)}
                fill="none"
                transform={`rotate(${360 * (carbRatio + proteinRatio)} ${size / 2} ${size / 2})`}
              />
            </G>
          </Svg>
          <View style={styles.macroChartCenterText}>
            <Text style={styles.macroChartPercent}>100%</Text>
            <Text style={styles.macroChartLabel}>เป้าหมาย</Text>
          </View>
        </View>

        <View style={styles.macroLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
            <Text style={styles.legendLabel}>โปรตีน</Text>
            <Text style={styles.legendValue}>{stats.macros.protein}g</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} />
            <Text style={styles.legendLabel}>คาร์บ</Text>
            <Text style={styles.legendValue}>{stats.macros.carbs}g</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.legendLabel}>ไขมัน</Text>
            <Text style={styles.legendValue}>{stats.macros.fat}g</Text>
          </View>
        </View>
      </Card>

      <Text style={{ marginTop: 24, fontSize: 13, color: isDark ? '#94a3b8' : '#64748b', textAlign: 'center', lineHeight: 20 }}>
        *สัดส่วนนี้ถูกคำนวณเพื่อให้สอดคล้องกับค่า BMI ของคุณเพื่อผลลัพธ์ด้านสุขภาพที่ยั่งยืน
      </Text>
    </ScrollView>
  );
}
