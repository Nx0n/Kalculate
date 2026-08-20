import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import Card from '../components/Card';
import createDashboardStyles from '../styles/DashboardStyles';
import {
  calculateBmi,
  getBmiCategory,
  calculateBmr,
  calculateTdee,
  calculateAge,
  calculateSmartTargetCalories,
  calculateHealthMacroTargets,
  calculateNutritionSummary
} from '../services/nutritionService';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ isDark, user, consumedToday = 0, meals = {} }) {
  const styles = createDashboardStyles(isDark);
  const [showSummary, setShowSummary] = useState(false);

  // คำนวณสรุปสารอาหารจริงจากรายการที่ทาน
  const consumedMacros = useMemo(() => {
    const allItems = meals ? Object.values(meals).flat() : [];
    return calculateNutritionSummary(allItems);
  }, [meals]);

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
        goal: smartTarget.targetCalories,
        recommendation: smartTarget.recommendation,
        macros
      };
    } catch (e) {
      return {
        bmi: 0,
        bmiCategory: '-',
        goal: 2000,
        recommendation: 'รักษาสุขภาพของคุณ',
        macros: { proteinG: 150, carbsG: 200, fatG: 60 }
      };
    }
  }, [user]);

  const dailyGoal = stats?.goal || 2000;
  const remaining = Math.max(dailyGoal - consumedToday, 0);
  const percentConsumed = Math.min((consumedToday / (dailyGoal || 1)), 1);

  // ระบบวิเคราะห์คำแนะนำรายวันแยกตามสารอาหาร (โปรตีน, คาร์บ, ไขมัน)
  const dailyAnalysis = useMemo(() => {
    if (!stats) return [];
    const analysis = [];
    const check = (label, current, target, code) => {
      const ratio = current / target;
      if (current === 0) return { label, status: 'ยังไม่ได้ทาน', color: '#94a3b8', icon: 'minus-circle', type: 'empty', code };
      if (ratio < 0.75) return { label, status: 'น้อยเกินไป', color: '#3b82f6', icon: 'arrow-down-circle', type: 'low', code, tip: 'ควรเพิ่มปริมาณ' };
      if (ratio > 1.15) return { label, status: 'มากเกินไป', color: '#ef4444', icon: 'alert-circle', type: 'high', code, tip: 'ควรปรับลดลง' };
      return { label, status: 'เหมาะสมแล้ว', color: '#10b981', icon: 'check-circle', type: 'good', code, tip: 'สมดุลดีมาก' };
    };

    analysis.push(check('โปรตีน', consumedMacros.proteinG, stats.macros.proteinG, 'protein'));
    analysis.push(check('คาร์บ', consumedMacros.carbsG, stats.macros.carbsG, 'carbs'));
    analysis.push(check('ไขมัน', consumedMacros.fatG, stats.macros.fatG, 'fat'));

    return analysis;
  }, [consumedMacros, stats]);

  // สร้างข้อความแนะนำภาพรวม (Coach Message) ที่วิเคราะห์ไขมัน โปรตีน คาร์บ โดยตรง
  const coachMessage = useMemo(() => {
    if (consumedToday === 0) return "วันนี้ยังไม่มีการบันทึกอาหาร เริ่มบันทึกมื้อแรกเพื่อรับคำแนะนำสุขภาพจากเรานะครับ";

    const tooLow = dailyAnalysis.filter(a => a.type === 'low').map(a => a.label);
    const tooHigh = dailyAnalysis.filter(a => a.type === 'high').map(a => a.label);

    let msg = "";
    if (percentConsumed > 1.1) msg = "วันนี้แคลอรี่รวมค่อนข้างสูง ";
    else if (percentConsumed < 0.6 && consumedToday > 0) msg = "วันนี้แคลอรี่ที่ได้รับยังค่อนข้างต่ำ ";
    else if (consumedToday > 0) msg = "วันนี้คุณรักษาสมดุลพลังงานได้ดีมาก! ";

    if (tooHigh.length > 0) msg += `แต่มีการทาน ${tooHigh.join(' และ ')} มากเกินไปนิด ลองปรับลดในมื้อถัดไปนะครับ `;
    if (tooLow.length > 0) msg += `พยายามเพิ่ม ${tooLow.join(' และ ')} อีกหน่อยเพื่อให้ร่างกายได้รับสารอาหารที่ครบถ้วนครับ`;

    if (tooHigh.length === 0 && tooLow.length === 0 && consumedToday > 0) {
      msg = "สุดยอด! วันนี้คุณจัดการสัดส่วนอาหารทั้ง โปรตีน คาร์บ และไขมัน ได้อย่างสมดุลที่สุด รักษาระดับนี้ไว้นะครับ";
    }

    return msg;
  }, [dailyAnalysis, consumedToday, percentConsumed]);

  // Donut Chart Config
  const size = width * 0.65;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentConsumed * circumference);

  const getProgressWidth = (current, target) => {
    const pct = Math.min((current / (target || 1)) * 100, 100);
    return `${pct}%`;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>สวัสดี, {user?.firstName || 'คุณ'}</Text>
          <View style={styles.recommendationBadge}>
            <Feather name="award" size={14} color="#10b981" />
            <Text style={styles.recommendationText}>{stats?.recommendation}</Text>
          </View>
        </View>
      </View>

      {/* กราฟวงกลมสรุปแคลอรี่ */}
      <View style={styles.chartSection}>
        <View style={styles.chartWrapper}>
          <Svg width={size} height={size}>
            <Circle cx={size / 2} cy={size / 2} r={radius} stroke={isDark ? '#334155' : '#f1f5f9'} strokeWidth={strokeWidth} fill="none" />
            <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#10b981" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" fill="none" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
          </Svg>
          <View style={styles.chartTextWrapper}>
            <Text style={styles.chartValue}>{Math.round(remaining)}</Text>
            <Text style={styles.chartLabel}>kcal คงเหลือ</Text>
          </View>
        </View>

        <View style={styles.chartStatsRow}>
          <View style={styles.chartStatItem}>
            <Text style={styles.chartStatLabel}>เป้าหมาย</Text>
            <Text style={styles.chartStatValue}>{dailyGoal}</Text>
          </View>
          <View style={styles.chartStatDivider} />
          <View style={styles.chartStatItem}>
            <Text style={styles.chartStatLabel}>ทานแล้ว</Text>
            <Text style={styles.chartStatValue}>{Math.round(consumedToday)}</Text>
          </View>
        </View>
      </View>

      {/* ปุ่มสรุปวิเคราะห์รายวัน */}
      <TouchableOpacity
        style={styles.summaryButton}
        onPress={() => setShowSummary(!showSummary)}
        activeOpacity={0.8}
      >
        <Feather name={showSummary ? "chevron-up" : "bar-chart-2"} size={20} color="white" />
        <Text style={styles.summaryButtonText}>
          {showSummary ? "ปิดหน้ารายงาน" : "ดูสรุปวิเคราะห์โภชนาการวันนี้"}
        </Text>
      </TouchableOpacity>

      {/* หน้าต่างสรุปการวิเคราะห์ (แสดงเมื่อกดปุ่ม) */}
      {showSummary && (
        <View style={styles.summaryCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 }}>
            <View style={{ backgroundColor: '#10b981', padding: 6, borderRadius: 10 }}>
              <Feather name="star" size={16} color="white" />
            </View>
            <Text style={styles.summaryTitle}>Health Coach Insight</Text>
          </View>

          <Text style={[styles.summaryTipText, { color: isDark ? '#f8fafc' : '#1e293b', fontSize: 14, marginBottom: 15 }]}>
            {coachMessage}
          </Text>

          <View style={{ height: 1, backgroundColor: isDark ? '#334155' : '#f1f5f9', marginBottom: 15 }} />

          {dailyAnalysis.map((item, index) => (
            <View key={index} style={styles.summaryItem}>
              <Feather name={item.icon} size={18} color={item.color} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[styles.summaryText, { fontWeight: '800' }]}>{item.label}</Text>
                  <Text style={{ color: item.color, fontWeight: '700', fontSize: 12 }}>{item.status}</Text>
                </View>
                <Text style={styles.summaryTipText}>{item.tip}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>สารอาหารที่ได้รับวันนี้</Text>

      <Card isDark={isDark} style={styles.macroCard}>
        {[
          { label: 'โปรตีน', current: consumedMacros.proteinG, target: stats?.macros?.proteinG, color: '#f59e0b' },
          { label: 'คาร์บ', current: consumedMacros.carbsG, target: stats?.macros?.carbsG, color: '#3b82f6' },
          { label: 'ไขมัน', current: consumedMacros.fatG, target: stats?.macros?.fatG, color: '#ef4444' }
        ].map((item, index) => (
          <View key={index} style={[styles.macroRow, index === 2 && { marginBottom: 0 }]}>
            <View style={styles.macroHeader}>
              <View style={styles.macroTitleContainer}>
                <View style={[styles.macroDot, { backgroundColor: item.color }]} />
                <Text style={styles.macroLabel}>{item.label}</Text>
              </View>
              <Text style={styles.macroValue}>
                {Math.round(item.current)} / {item.target}g
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, {
                width: getProgressWidth(item.current, item.target),
                backgroundColor: item.color
              }]} />
            </View>
          </View>
        ))}
      </Card>

      <Card isDark={isDark} style={styles.bmiCard}>
        <View style={styles.bmiContent}>
          <View>
            <Text style={styles.cardLabel}>สถานะดัชนีมวลกาย (BMI)</Text>
            <Text style={styles.bmiValueText}>{stats?.bmi || '-'}</Text>
          </View>
          <View style={[styles.bmiBadge, { backgroundColor: isDark ? '#064e3b' : '#dcfce7' }]}>
            <Text style={styles.bmiBadgeText}>{stats?.bmiCategory}</Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}
