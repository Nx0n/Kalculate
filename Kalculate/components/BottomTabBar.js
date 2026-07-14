import { TouchableOpacity, View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import styles from '../styles/BottomTabBarStyles';

export default function BottomTabBar({ pages, activePage, onNavigate, isDark }) {
  return (
    <View style={[styles.tabBar, isDark ? styles.darkBackground : styles.lightBackground]}>
      {pages.map((item) => {
        const isActive = activePage === item.key;
        const iconColor = isActive
          ? '#10b981'
          : (isDark ? '#94a3b8' : '#64748b');

        return (
          <TouchableOpacity
            key={item.key}
            style={styles.tabButton}
            onPress={() => onNavigate(item.key)}
            activeOpacity={0.7}
          >
            <Feather
              name={item.icon}
              size={22}
              color={iconColor}
            />
            <Text style={[
              styles.tabLabel,
              { color: iconColor },
              isActive && styles.tabLabelActive
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
