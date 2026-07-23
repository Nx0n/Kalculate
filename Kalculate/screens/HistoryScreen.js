import { ActivityIndicator, Text, View } from 'react-native';
import Card from '../components/Card';
import useNutritionHistory from '../hooks/useNutritionHistory';
import createHistoryStyles from '../styles/HistoryStyles';

function formatDate(date) { return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${date}T00:00:00`)); }
function getDateBefore(days) { const value = new Date(); value.setDate(value.getDate() - days); return value.toISOString().slice(0, 10); }

export default function HistoryScreen({ isDark }) {
  const styles = createHistoryStyles(isDark);
  const { history, loading, error } = useNutritionHistory({ startDate: getDateBefore(13), endDate: getDateBefore(0) });
  const recent = [...history].reverse();
  return <View>
    <Text style={styles.title}>History</Text>
    <Text style={styles.subtitle}>รายการแคลอรี่จากมื้ออาหารที่บันทึกไว้</Text>
    {loading ? <ActivityIndicator /> : error ? <Text style={styles.cardMeta}>{error}</Text> : recent.length ? recent.map((entry) => <Card key={entry.date} isDark={isDark}><Text style={styles.cardLabel}>{formatDate(entry.date)}</Text><Text style={styles.cardValue}>{entry.totals.caloriesKcal} kcal</Text><Text style={styles.cardMeta}>โปรตีน {entry.totals.proteinG} g</Text></Card>) : <Card isDark={isDark}><Text style={styles.cardMeta}>ยังไม่มีมื้ออาหารที่บันทึกใน 14 วันที่ผ่านมา</Text></Card>}
  </View>;
}
