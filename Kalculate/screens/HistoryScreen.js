import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Card from '../components/Card';
import createHistoryStyles from '../styles/HistoryStyles';
import createDashboardStyles from '../styles/DashboardStyles';
import { getNutritionHistory, getMealsForDate } from '../services/mealService';
import {
  calculateBmi,
  getBmiCategory,
  calculateBmr,
  calculateTdee,
  calculateAge,
  calculateSmartTargetCalories,
  calculateHealthMacroTargets
} from '../services/nutritionService';

function dateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export default function HistoryScreen({ isDark, user }) {
  const styles = createHistoryStyles(isDark);
  const dashboardStyles = createDashboardStyles(isDark);

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for Daily Detail Modal
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayMeals, setDayMeals] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    let live = true;
    getNutritionHistory({ startDate: dateDaysAgo(30), endDate: dateDaysAgo(0) })
      .then((data) => { if (live) setHistory(data.slice().reverse()); })
      .catch((err) => { if (live) setError(err.message); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, []);

  const handleOpenDetail = async (day) => {
    setSelectedDay(day);
    setLoadingDetail(true);
    try {
      const meals = await getMealsForDate(day.date);
      setDayMeals(meals);
    } catch (err) {
      Alert.alert('ผิดพลาด', 'ไม่สามารถดึงข้อมูลรายการอาหารได้');
    } finally {
      setLoadingDetail(false);
    }
  };

  // ระบบวิเคราะห์คำแนะนำสำหรับวันที่เลือก
  const analysisResult = useMemo(() => {
    if (!selectedDay || !user) return { coachMsg: '', items: [] };

    try {
      const weight = Number(user.weight);
      const height = Number(user.height);
      const age = calculateAge(user.birthDate || '1995-01-01');
      const sex = user.sex || 'male';

      const bmi = calculateBmi({ weightKg: weight, heightCm: height });
      const bmr = calculateBmr({ sex, age, weightKg: weight, heightCm: height });
      const tdee = calculateTdee(bmr, user.activityLevel || 'moderate');
      const smartTarget = calculateSmartTargetCalories({ bmi, tdee, sex });
      const targetMacros = calculateHealthMacroTargets(smartTarget.targetCalories, bmi);

      const check = (label, current, target) => {
        const ratio = current / target;
        if (current === 0) return { label, status: 'ไม่มีข้อมูล', color: '#94a3b8', icon: 'minus-circle', type: 'empty' };
        if (ratio < 0.8) return { label, status: 'น้อยไป', color: '#3b82f6', icon: 'arrow-down-circle', type: 'low' };
        if (ratio > 1.15) return { label, status: 'มากไป', color: '#ef4444', icon: 'alert-circle', type: 'high' };
        return { label, status: 'พอดี', color: '#10b981', icon: 'check-circle', type: 'good' };
      };

      const analysisItems = [
        check('โปรตีน', selectedDay.totals.proteinG, targetMacros.proteinG),
        check('คาร์บ', selectedDay.totals.carbsG, targetMacros.carbsG),
        check('ไขมัน', selectedDay.totals.fatG, targetMacros.fatG),
      ];

      // สร้างข้อความแนะนำ
      const tooHigh = analysisItems.filter(a => a.type === 'high').map(a => a.label);
      const tooLow = analysisItems.filter(a => a.type === 'low').map(a => a.label);

      let msg = "ในวันนั้นคุณรักษาสมดุลได้ค่อนข้างดีครับ";
      if (tooHigh.length > 0) msg = `วันนั้นมีการทาน ${tooHigh.join(' และ ')} ค่อนข้างสูงกว่าที่กำหนดครับ`;
      else if (tooLow.length > 0) msg = `วันนั้นร่างกายได้รับ ${tooLow.join(' และ ')} น้อยไปนิดครับ`;
      if (selectedDay.totals.caloriesKcal === 0) msg = "ไม่มีการบันทึกข้อมูลการทานในวันนี้";

      return { coachMsg: msg, items: analysisItems };
    } catch (e) {
      return { coachMsg: '', items: [] };
    }
  }, [selectedDay, user]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>ประวัติ</Text>
        <Text style={styles.subtitle}>ดูข้อมูลการทานย้อนหลัง 30 วัน</Text>

        {loading ? (
          <ActivityIndicator color="#10b981" style={{ marginTop: 20 }} />
        ) : error ? (
          <Text style={styles.cardMeta}>{error}</Text>
        ) : history.length === 0 ? (
          <Text style={styles.emptyText}>ยังไม่มีประวัติการบันทึกอาหาร</Text>
        ) : (
          history.map((day) => (
            <TouchableOpacity key={day.date} onPress={() => handleOpenDetail(day)} activeOpacity={0.7}>
              <Card isDark={isDark} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={[styles.cardLabel, { marginBottom: 2 }]}>{day.date}</Text>
                    <Text style={styles.cardValue}>{Math.round(day.totals.caloriesKcal)} <Text style={{ fontSize: 14, fontWeight: '400' }}>kcal</Text></Text>
                  </View>
                  <View style={{ backgroundColor: isDark ? '#1e293b' : '#f1f5f9', padding: 8, borderRadius: 12 }}>
                    <Feather name="chevron-right" size={20} color="#10b981" />
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Modal แสดงรายละเอียดประวัติรายวัน */}
      <Modal visible={!!selectedDay} animationType="slide" transparent={true} onRequestClose={() => setSelectedDay(null)}>
        <View style={localStyles.modalOverlay}>
          <View style={[localStyles.modalContent, { backgroundColor: isDark ? '#1e293b' : '#ffffff' }]}>
            <View style={localStyles.modalHeader}>
              <View>
                <Text style={styles.title}>บันทึกของวันที่</Text>
                <Text style={styles.subtitle}>{selectedDay?.date}</Text>
              </View>
              <TouchableOpacity onPress={() => { setSelectedDay(null); setDayMeals(null); }} style={localStyles.closeBtn}>
                <Feather name="x" size={24} color={isDark ? '#f8fafc' : '#0f172a'} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
              {/* สรุปพลังงาน */}
              <View style={[dashboardStyles.chartSection, { padding: 25, marginBottom: 20 }]}>
                <Text style={dashboardStyles.chartStatLabel}>พลังงานรวมที่ทาน</Text>
                <Text style={[dashboardStyles.chartValue, { fontSize: 42 }]}>{Math.round(selectedDay?.totals.caloriesKcal || 0)}</Text>
                <Text style={dashboardStyles.chartLabel}>kcal</Text>
              </View>

              {/* Health Coach Insight */}
              <View style={[dashboardStyles.summaryCard, { marginBottom: 24 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 }}>
                  <Feather name="info" size={18} color="#10b981" />
                  <Text style={[dashboardStyles.summaryTitle, { marginBottom: 0 }]}>คำแนะนำจากโค้ช</Text>
                </View>
                <Text style={[dashboardStyles.summaryTipText, { color: isDark ? '#f8fafc' : '#1e293b', fontSize: 14, fontStyle: 'italic' }]}>
                  "{analysisResult.coachMsg}"
                </Text>

                <View style={{ flexDirection: 'row', gap: 8, marginTop: 15 }}>
                  {analysisResult.items.map((item, idx) => (
                    <View key={idx} style={{ flex: 1, alignItems: 'center', backgroundColor: isDark ? '#0f172a' : '#f1f5f9', padding: 10, borderRadius: 14 }}>
                      <Feather name={item.icon} size={16} color={item.color} />
                      <Text style={{ fontSize: 11, fontWeight: '700', marginTop: 4, color: isDark ? '#94a3b8' : '#64748b' }}>{item.label}</Text>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: item.color }}>{item.status}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <Text style={styles.sectionTitle}>รายการอาหารที่ทาน</Text>
              {loadingDetail ? (
                <ActivityIndicator color="#10b981" />
              ) : dayMeals ? (
                Object.entries(dayMeals).map(([type, items]) => (
                  items.length > 0 && (
                    <View key={type} style={{ marginBottom: 20 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 }}>
                        <View style={{ width: 4, height: 16, backgroundColor: '#10b981', borderRadius: 2 }} />
                        <Text style={{ fontSize: 15, fontWeight: '800', color: isDark ? '#f8fafc' : '#0f172a' }}>
                          {type === 'breakfast' ? 'มื้อเช้า' : type === 'lunch' ? 'มื้อกลางวัน' : type === 'dinner' ? 'มื้อเย็น' : 'ของว่าง'}
                        </Text>
                      </View>
                      {items.map((item) => (
                        <View key={item.id} style={localStyles.foodRow}>
                          <Text style={{ color: isDark ? '#cbd5e1' : '#475569', flex: 1, fontSize: 14 }}>{item.food_name}</Text>
                          <Text style={{ color: '#10b981', fontWeight: '700', fontSize: 14 }}>{Math.round(item.calories_kcal)} kcal</Text>
                        </View>
                      ))}
                    </View>
                  )
                ))
              ) : (
                <Text style={styles.emptyText}>ไม่มีรายการอาหาร</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const localStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '88%',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  closeBtn: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    padding: 8,
    borderRadius: 12,
  },
  foodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.05)',
  }
});
