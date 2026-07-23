import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Card from '../components/Card';
import createProfileStyles from '../styles/ProfileStyles';

export default function ProfileScreen({ isDark, user, onLogout, onEdit }) {
  const styles = createProfileStyles(isDark);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Feather name="user" size={40} color={isDark ? '#94a3b8' : '#64748b'} />
        </View>
        <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>

        <TouchableOpacity
          style={{
            marginTop: 12,
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            borderWidth: 1,
            borderColor: isDark ? '#334155' : '#e2e8f0'
          }}
          onPress={onEdit}
        >
          <Feather name="edit-2" size={14} color={isDark ? '#cbd5e1' : '#475569'} />
          <Text style={{ color: isDark ? '#cbd5e1' : '#475569', fontWeight: '600', fontSize: 13 }}>แก้ไขโปรไฟล์</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>ตั้งค่าข้อมูล</Text>
      <Text style={styles.subtitle}>ข้อมูลส่วนตัว สำหรับคำนวณแคลอรีและเป้าหมาย</Text>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Card isDark={isDark}>
            <Text style={styles.cardLabel}>ส่วนสูง</Text>
            <Text style={styles.cardValue}>{user?.height} <Text style={{ fontSize: 14, fontWeight: '400' }}>cm</Text></Text>
          </Card>
        </View>
        <View style={{ flex: 1 }}>
          <Card isDark={isDark}>
            <Text style={styles.cardLabel}>น้ำหนัก</Text>
            <Text style={styles.cardValue}>{user?.weight} <Text style={{ fontSize: 14, fontWeight: '400' }}>kg</Text></Text>
          </Card>
        </View>
      </View>

      <Card isDark={isDark}>
        <Text style={styles.cardLabel}>วันเกิด</Text>
        <Text style={styles.cardValue}>{user?.birthDate || '-'}</Text>
      </Card>

      <TouchableOpacity
        style={{
          marginTop: 20,
          padding: 16,
          backgroundColor: '#ef4444',
          borderRadius: 16,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 8
        }}
        onPress={onLogout}
      >
        <Feather name="log-out" size={20} color="white" />
        <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>ออกจากระบบ</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
