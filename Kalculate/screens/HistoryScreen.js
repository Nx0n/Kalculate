import { View, Text } from 'react-native';
import Card from '../components/Card';
import createScreenStyles from '../styles/ScreenStyles';

export default function HistoryScreen({ isDark }) {
  const styles = createScreenStyles(isDark);

  return (
    <View>
      <Text style={styles.title}>History</Text>
      <Text style={styles.subtitle}>บันทึกอาหารและกิจกรรมย้อนหลัง</Text>
      <Card isDark={isDark}>
        <Text style={styles.cardLabel}>Yesterday</Text>
        <Text style={styles.cardValue}>1940 kcal</Text>
        <Text style={styles.cardMeta}>Logged meal data</Text>
      </Card>
      <Card isDark={isDark}>
        <Text style={styles.cardLabel}>Two days ago</Text>
        <Text style={styles.cardValue}>2260 kcal</Text>
        <Text style={styles.cardMeta}>Logged meal data</Text>
      </Card>
    </View>
  );
}
