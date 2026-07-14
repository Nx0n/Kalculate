import { StyleSheet, Platform } from 'react-native';

export default function createAppStyles(isDark) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
    },
    header: {
      paddingTop: Platform.OS === 'ios' ? 60 : 48,
      paddingHorizontal: 24,
      paddingBottom: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
    },
    brand: {
      fontSize: 24,
      fontWeight: '800',
      color: isDark ? '#f8fafc' : '#0f172a',
      letterSpacing: -0.5,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    themeLabel: {
      marginRight: 8,
      color: isDark ? '#94a3b8' : '#64748b',
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    content: {
      paddingHorizontal: 24,
      paddingBottom: 120,
    },
  });
}
