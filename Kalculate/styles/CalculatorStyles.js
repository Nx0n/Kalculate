import { StyleSheet } from 'react-native';

export default function createCalculatorStyles(isDark) {
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
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
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
      fontSize: 28,
      fontWeight: '800',
      color: isDark ? '#f8fafc' : '#0f172a',
    },
    cardMeta: {
      marginTop: 6,
      color: isDark ? '#94a3b8' : '#64748b',
      fontSize: 13,
      fontWeight: '500',
    },
    badge: {
      marginTop: 12,
      alignSelf: 'flex-start',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: isDark ? '#065f46' : '#dcfce7',
      color: isDark ? '#34d399' : '#059669',
      fontSize: 12,
      fontWeight: '700',
      overflow: 'hidden',
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: isDark ? '#f8fafc' : '#0f172a',
      marginBottom: 16,
    },
    macrosCard: {
      marginTop: 8,
    },
    macroGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    macroBlock: {
      flex: 1,
      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
      borderRadius: 20,
      padding: 16,
      alignItems: 'center',
    },
  });
}
