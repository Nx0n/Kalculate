import { TouchableOpacity, View, Text } from 'react-native';
import styles from '../styles/BottomTabBarStyles';

export default function BottomTabBar({ pages, activePage, onNavigate, isDark }) {
  return (
    <View style={[styles.tabBar, isDark ? styles.darkBackground : styles.lightBackground]}>
      {pages.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={[
            styles.tabButton,
            activePage === item.key && styles.tabButtonActive,
          ]}
          onPress={() => onNavigate(item.key)}
        >
          <Text
            style={
              activePage === item.key
                ? styles.tabIconActive
                : isDark
                ? styles.tabIconDark
                : styles.tabIcon
            }
          >
            {item.icon}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
