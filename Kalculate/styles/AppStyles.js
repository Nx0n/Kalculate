import { StyleSheet } from 'react-native';

export default function createAppStyles(isDark) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0f172a' : '#f4f6f8',
    },
    header: {
      paddingTop: 48,
      paddingHorizontal: 20,
      paddingBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#334155' : '#e5e7eb',
    },
    brand: {
      fontSize: 20,
      fontWeight: '800',
      color: isDark ? '#f8fafc' : '#0f172a',
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    themeLabel: {
      marginRight: 8,
      color: isDark ? '#cbd5e1' : '#475569',
      fontSize: 14,
    },
    content: {
      padding: 20,
      paddingBottom: 140,
    },
  });
}
