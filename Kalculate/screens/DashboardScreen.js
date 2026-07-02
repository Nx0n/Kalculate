import { View, Text } from 'react-native';
import Card from '../components/Card';
import createDashboardStyles from '../styles/DashboardStyles';

export default function DashboardScreen({ isDark }) {
  const styles = createDashboardStyles(isDark);
  return (
    <View>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>สรุปตัวเลขสำคัญ และภาพรวมโภชนาการาของคุณ</Text>
      <View style={styles.grid}>
        <Card isDark={isDark}>
          <Text style={styles.cardLabel}>Today</Text>
          <Text style={styles.cardValue}>2100 kcal</Text>
          <Text style={styles.cardMeta}>เป้าหมายรายวัน</Text>
        </Card>
        <Card isDark={isDark}>
          <Text style={styles.cardLabel}>Protein</Text>
          <Text style={styles.cardValue}>120 g</Text>
          <Text style={styles.cardMeta}>ตามเป้า</Text>
        </Card>
      </View>
    </View>
  );
}
