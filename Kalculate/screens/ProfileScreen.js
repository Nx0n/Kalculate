import { View, Text } from 'react-native';
import Card from '../components/Card';
import createScreenStyles from '../styles/ScreenStyles';

export default function ProfileScreen({ isDark }) {
  const styles = createScreenStyles(isDark);

  return (
    <View>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>ข้อมูลส่วนตัว สำหรับคำนวณแคลอรีและเป้าหมาย</Text>
      <Card isDark={isDark}>
        <Text style={styles.cardLabel}>Name</Text>
        <Text style={styles.cardValue}>User Name</Text>
      </Card>
      <Card isDark={isDark}>
        <Text style={styles.cardLabel}>Height</Text>
        <Text style={styles.cardValue}>170 cm</Text>
      </Card>
      <Card isDark={isDark}>
        <Text style={styles.cardLabel}>Weight</Text>
        <Text style={styles.cardValue}>68 kg</Text>
      </Card>
    </View>
  );
}
