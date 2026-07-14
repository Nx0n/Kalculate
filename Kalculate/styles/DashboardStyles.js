import { StyleSheet } from 'react-native';

export default function createDashboardStyles(isDark) {
  return StyleSheet.create({
    container: {
      paddingTop: 10,
    },
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
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    cardLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: isDark ? '#94a3b8' : '#64748b',
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    cardValue: {
      fontSize: 32,
      fontWeight: '800',
      color: isDark ? '#f8fafc' : '#0f172a',
    },
    cardMeta: {
      marginTop: 8,
      color: isDark ? '#10b981' : '#059669',
      fontSize: 13,
      fontWeight: '600',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: isDark ? '#f1f5f9' : '#1e293b',
      marginTop: 24,
      marginBottom: 16,
    }
  });
}
