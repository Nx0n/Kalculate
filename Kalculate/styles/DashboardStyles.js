import { StyleSheet } from 'react-native';

export default function createDashboardStyles(isDark) {
  return StyleSheet.create({
    title: {
      fontSize: 32,
      fontWeight: '800',
      marginBottom: 8,
      color: isDark ? '#f8fafc' : '#0f172a',
    },
    subtitle: {
      color: isDark ? '#cbd5e1' : '#475569',
      marginBottom: 20,
      lineHeight: 22,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    cardLabel: {
      fontSize: 14,
      color: isDark ? '#94a3b8' : '#6b7280',
      marginBottom: 6,
    },
    cardValue: {
      fontSize: 28,
      fontWeight: '700',
      color: isDark ? '#f8fafc' : '#111827',
    },
    cardMeta: {
      marginTop: 8,
      color: isDark ? '#94a3b8' : '#6b7280',
      fontSize: 13,
    },
  });
}
