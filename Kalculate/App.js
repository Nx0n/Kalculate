import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View, Switch } from 'react-native';
import BottomTabBar from './components/BottomTabBar';
import { pages } from './components/pages';
import createAppStyles from './styles/AppStyles';
import DashboardScreen from './screens/DashboardScreen';
import CalculatorScreen from './screens/CalculatorScreen';
import HistoryScreen from './screens/HistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import AuthScreen from './screens/AuthScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import useAuth from './hooks/useAuth';
import useProfile from './hooks/useProfile';

const screenComponents = {
  Dashboard: DashboardScreen,
  Calculator: CalculatorScreen,
  History: HistoryScreen,
  Profile: ProfileScreen,
};

export default function App() {
  const [theme, setTheme] = useState('light');
  const [page, setPage] = useState('Dashboard');
  const isDark = theme === 'dark';
  const styles = useMemo(() => createAppStyles(isDark), [isDark]);
  const CurrentScreen = screenComponents[page];
  const { session, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, saveProfile, refreshProfile, addWeight } = useProfile(Boolean(session));

  if (authLoading) {
    return <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}><ActivityIndicator /></View>;
  }

  if (!session) {
    return <AuthScreen isDark={isDark} />;
  }

  if (profileLoading) {
    return <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}><ActivityIndicator /></View>;
  }

  const isOnboarded = profile?.sex && profile?.birth_date && profile?.height_cm && profile?.current_weight_kg && profile?.activity_level && profile?.goal;
  if (!isOnboarded) {
    return <ScrollView contentContainerStyle={{ flexGrow: 1 }}><OnboardingScreen isDark={isDark} profile={profile} saveProfile={async (data) => { await saveProfile(data); await refreshProfile(); }} /></ScrollView>;
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
        <CurrentScreen isDark={isDark} profile={profile} saveProfile={saveProfile} refreshProfile={refreshProfile} addWeight={addWeight} />
      </ScrollView>

      <BottomTabBar
        pages={pages}
        activePage={page}
        onNavigate={setPage}
        isDark={isDark}
      />
    </View>
  );
}
