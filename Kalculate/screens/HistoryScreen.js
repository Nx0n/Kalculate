import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import Card from '../components/Card';
import createHistoryStyles from '../styles/HistoryStyles';
import { getNutritionHistory } from '../services/mealService';

function dateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export default function HistoryScreen({ isDark }) {
  const styles = createHistoryStyles(isDark);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let live = true;
    getNutritionHistory({ startDate: dateDaysAgo(6), endDate: dateDaysAgo(0) })
      .then((data) => { if (live) setHistory(data.slice().reverse()); })
      .catch((err) => { if (live) setError(err.message); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, []);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>ประวัติ</Text>
      <Text style={styles.subtitle}>สรุปอาหารย้อนหลัง 7 วัน</Text>

      {loading ? (
        <ActivityIndicator color="#10b981" />
      ) : error ? (
        <Text style={styles.cardMeta}>{error}</Text>
      ) : history.length === 0 ? (
        <Text style={styles.cardMeta}>ยังไม่มีประวัติการบันทึกอาหาร</Text>
      ) : (
        history.map((day) => (
          <Card isDark={isDark} key={day.date}>
            <Text style={styles.cardLabel}>{day.date}</Text>
            <Text style={styles.cardValue}>{day.totals.caloriesKcal} kcal</Text>
            <Text style={styles.cardMeta}>โปรตีน {day.totals.proteinG}g · คาร์บ {day.totals.carbsG}g · ไขมัน {day.totals.fatG}g</Text>
          </Card>
        ))
      )}
    </ScrollView>
  );
}
