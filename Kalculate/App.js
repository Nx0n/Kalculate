import { StatusBar } from 'expo-status-bar';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { Text, View, Switch, Alert, ActivityIndicator } from 'react-native';
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
import { supabase } from './lib/supabase';
import { addWeightLog, getMyProfile, signIn, signOut, signUp, updateMyProfile } from './services/profileService';
import { getDailyNutrition, getMealsForDate } from './services/mealService';

const screenComponents = {
  Dashboard: DashboardScreen,
  Food: FoodScreen,
  Calculator: CalculatorScreen,
  History: HistoryScreen,
  Profile: ProfileScreen,
};

const todayDate = () => new Date().toISOString().slice(0, 10);

function toAppUser(authUser, profile) {
  const names = (profile?.display_name || authUser.user_metadata?.display_name || '').trim().split(/\s+/);
  return {
    id: authUser.id,
    email: authUser.email,
    firstName: names[0] || 'คุณ',
    lastName: names.slice(1).join(' '),
    weight: Number(profile?.current_weight_kg || 0),
    height: Number(profile?.height_cm || 0),
    birthDate: profile?.birth_date || '',
    sex: profile?.sex || 'male',
    activityLevel: profile?.activity_level || 'moderate',
  };
}

export default function App() {
  const [theme, setTheme] = useState('light');
  const [page, setPage] = useState('Dashboard');
  const [authMode, setAuthMode] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [consumedToday, setConsumedToday] = useState(0);
  const [todaysMeals, setTodaysMeals] = useState({ breakfast: [], lunch: [], dinner: [], snack: [] });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isBooting, setIsBooting] = useState(true);

  const isDark = theme === 'dark';
  const styles = useMemo(() => createAppStyles(isDark), [isDark]);

  const loadUser = useCallback(async (authUser) => {
    const profile = await getMyProfile();
    setCurrentUser(toAppUser(authUser, profile));
  }, []);

  const refreshDailyData = useCallback(async () => {
    try {
      const date = todayDate();
      const daily = await getDailyNutrition(date);
      const meals = await getMealsForDate(date);
      setConsumedToday(daily.totals.caloriesKcal);
      setTodaysMeals(meals);
    } catch (error) {
      console.error('Failed to refresh daily data:', error);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && active) {
        try {
          await loadUser(session.user);
          await refreshDailyData();
        } catch (error) {
          Alert.alert('โหลดข้อมูลไม่สำเร็จ', error.message);
        }
      }
      if (active) setIsBooting(false);
    };
    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (!session?.user) {
        setCurrentUser(null);
        setConsumedToday(0);
        setTodaysMeals({ breakfast: [], lunch: [], dinner: [], snack: [] });
        return;
      }
      loadUser(session.user).catch((error) => Alert.alert('โหลดข้อมูลไม่สำเร็จ', error.message));
      refreshDailyData();
    });

    return () => { active = false; subscription.unsubscribe(); };
  }, [loadUser, refreshDailyData]);

  const handleLogin = async (email, password) => {
    try {
      const { user } = await signIn({ email: email.trim(), password });
      await loadUser(user);
      await refreshDailyData();
    } catch (error) { Alert.alert('เข้าสู่ระบบไม่สำเร็จ', error.message); }
  };

  const handleRegister = async (form) => {
    try {
      const displayName = `${form.firstName} ${form.lastName}`.trim();
      const { data } = await signUp({ email: form.email.trim(), password: form.password, displayName });
      if (!data.session || !data.user) {
        Alert.alert('ตรวจสอบอีเมล', 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ');
        setAuthMode('login');
        return;
      }
      await updateMyProfile({
        display_name: displayName,
        birth_date: form.birthDate,
        height_cm: Number(form.height),
        current_weight_kg: Number(form.weight),
        sex: form.sex || 'male',
        activity_level: 'moderate'
      });
      await addWeightLog({ weightKg: form.weight });
      await loadUser(data.user);
      await refreshDailyData();
      Alert.alert('สำเร็จ', 'สมัครสมาชิกเรียบร้อยแล้ว');
    } catch (error) { Alert.alert('สมัครสมาชิกไม่สำเร็จ', error.message); }
  };

  const handleUpdateUser = async (updated) => {
    try {
      const profile = await updateMyProfile({
        display_name: `${updated.firstName} ${updated.lastName}`.trim(),
        birth_date: updated.birthDate,
        height_cm: Number(updated.height),
        current_weight_kg: Number(updated.weight),
        sex: updated.sex || 'male',
        activity_level: updated.activityLevel || 'moderate'
      });
      if (Number(updated.weight) !== Number(currentUser.weight)) {
        await addWeightLog({ weightKg: updated.weight });
      }
      setCurrentUser((user) => toAppUser({ ...user, user_metadata: {} }, profile));
      setIsEditingProfile(false);
      Alert.alert('สำเร็จ', 'อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว');
    } catch (error) { Alert.alert('บันทึกไม่สำเร็จ', error.message); }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setPage('Dashboard');
      setIsEditingProfile(false);
    } catch (error) {
      Alert.alert('ออกจากระบบไม่สำเร็จ', error.message);
    }
  };

  if (isBooting) return (
    <View style={[styles.container, { justifyContent: 'center' }]}>
      <ActivityIndicator size="large" color="#10b981" />
    </View>
  );

  if (!currentUser) return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {authMode === 'login' ? (
        <LoginScreen isDark={isDark} onLogin={handleLogin} onSwitchToRegister={() => setAuthMode('register')} />
      ) : (
        <RegisterScreen isDark={isDark} onRegister={handleRegister} onSwitchToLogin={() => setAuthMode('login')} />
      )}
    </>
  );

  const CurrentScreen = screenComponents[page];
  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.header}>
        <Text style={styles.brand}>🥗 Kalculate</Text>
        <View style={styles.headerActions}>
          <Text style={styles.themeLabel}>{isDark ? 'Dark' : 'Light'}</Text>
          <Switch value={isDark} onValueChange={() => setTheme(isDark ? 'light' : 'dark')} />
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {page === 'Profile' && isEditingProfile ? (
          <EditProfileScreen isDark={isDark} user={currentUser} onUpdateUser={handleUpdateUser} onCancel={() => setIsEditingProfile(false)} />
        ) : (
          <CurrentScreen
            isDark={isDark}
            user={currentUser}
            onLogout={handleLogout}
            consumedToday={consumedToday}
            meals={todaysMeals}
            onNutritionChanged={refreshDailyData}
            onEdit={() => setIsEditingProfile(true)}
          />
        )}
      </View>

      <BottomTabBar
        pages={pages}
        activePage={page}
        onNavigate={(next) => { setPage(next); setIsEditingProfile(false); }}
        isDark={isDark}
      />
    </View>
  );
}
