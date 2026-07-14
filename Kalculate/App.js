import { StatusBar } from 'expo-status-bar';
import { useMemo, useState, useEffect } from 'react';
import { ScrollView, Text, View, Switch, Alert } from 'react-native';
import BottomTabBar from './components/BottomTabBar';
import { pages } from './components/pages';
import createAppStyles from './styles/AppStyles';
import DashboardScreen from './screens/DashboardScreen';
import CalculatorScreen from './screens/CalculatorScreen';
import HistoryScreen from './screens/HistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import FoodScreen from './screens/FoodScreen';
import EditProfileScreen from './screens/EditProfileScreen';

const screenComponents = {
  Dashboard: DashboardScreen,
  Food: FoodScreen,
  Calculator: CalculatorScreen,
  History: HistoryScreen,
  Profile: ProfileScreen,
};

export default function App() {
  const [theme, setTheme] = useState('light');
  const [page, setPage] = useState('Dashboard');
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [currentUser, setCurrentUser] = useState(null);
  const [consumedToday, setConsumedToday] = useState(0);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const isDark = theme === 'dark';
  const styles = useMemo(() => createAppStyles(isDark), [isDark]);

  // Handle Login
  const handleLogin = (email, password) => {
    if (email && password) {
      setCurrentUser({
        firstName: 'สมชาย',
        lastName: 'ใจดี',
        email: email,
        weight: 70,
        height: 175,
        sex: 'male',
        birthDate: '1995-05-20',
        bmi: 22.9,
        bmiCategory: 'ปกติ'
      });
    } else {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกอีเมลและรหัสผ่าน');
    }
  };

  // Handle Register
  const handleRegister = (userData) => {
    setCurrentUser(userData);
    Alert.alert('สำเร็จ', 'สมัครสมาชิกและเข้าสู่ระบบเรียบร้อยแล้ว');
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setPage('Dashboard');
    setConsumedToday(0);
    setIsEditingProfile(false);
  };

  // Handle Adding Calories
  const handleAddCalories = (calories) => {
    setConsumedToday(prev => prev + calories);
    setPage('Dashboard'); // ย้ายไปหน้า Dashboard เพื่อดูสรุป
  };

  // Handle Update User
  const handleUpdateUser = (updatedData) => {
    setCurrentUser(updatedData);
    setIsEditingProfile(false);
    Alert.alert('สำเร็จ', 'อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว');
  };

  if (!currentUser) {
    if (authMode === 'login') {
      return (
        <>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <LoginScreen
            isDark={isDark}
            onLogin={handleLogin}
            onSwitchToRegister={() => setAuthMode('register')}
          />
        </>
      );
    }
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <RegisterScreen
          isDark={isDark}
          onRegister={handleRegister}
          onSwitchToLogin={() => setAuthMode('login')}
        />
      </>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.header}>
        <Text style={styles.brand}>🥗 Kalculate</Text>
        <View style={styles.headerActions}>
          <Text style={styles.themeLabel}>{isDark ? 'Dark' : 'Light'}</Text>
          <Switch
            value={isDark}
            onValueChange={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {page === 'Profile' && isEditingProfile ? (
          <EditProfileScreen
            isDark={isDark}
            user={currentUser}
            onUpdateUser={handleUpdateUser}
            onCancel={() => setIsEditingProfile(false)}
          />
        ) : (
          (() => {
            const CurrentScreen = screenComponents[page];
            return (
              <CurrentScreen
                isDark={isDark}
                user={currentUser}
                onLogout={handleLogout}
                consumedToday={consumedToday}
                onAddCalories={handleAddCalories}
                onEdit={() => setIsEditingProfile(true)}
              />
            );
          })()
        )}
      </ScrollView>

      <BottomTabBar
        pages={pages}
        activePage={page}
        onNavigate={(newPage) => {
          setPage(newPage);
          setIsEditingProfile(false); // Reset editing state when navigating
        }}
        isDark={isDark}
      />
    </View>
  );
}
