import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { ScrollView, Text, View, Switch } from 'react-native';
import BottomTabBar from './components/BottomTabBar';
import { pages } from './components/pages';
import createAppStyles from './styles/AppStyles';
import DashboardScreen from './screens/DashboardScreen';
import CalculatorScreen from './screens/CalculatorScreen';
import HistoryScreen from './screens/HistoryScreen';
import ProfileScreen from './screens/ProfileScreen';

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
        <CurrentScreen isDark={isDark} />
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
