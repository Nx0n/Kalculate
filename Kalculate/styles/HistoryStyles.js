import { StyleSheet } from 'react-native';

export default function createHistoryStyles(isDark) {
  return StyleSheet.create({
    title: {
      fontSize: 28,
      fontWeight: '800',
      marginBottom: 4,
      color: isDark ? '#f8fafc' : '#0f172a',
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 15,
      color: isDark ? '#94a3b8' : '#64748b',
      marginBottom: 32,
      lineHeight: 22,
    },
    cardLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: isDark ? '#94a3b8' : '#64748b',
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    cardValue: {
      fontSize: 24,
      fontWeight: '700',
      color: isDark ? '#f8fafc' : '#111827',
    },
    cardMeta: {
      marginTop: 6,
      color: isDark ? '#94a3b8' : '#64748b',
      fontSize: 13,
      fontWeight: '500',
    },
  });
}
