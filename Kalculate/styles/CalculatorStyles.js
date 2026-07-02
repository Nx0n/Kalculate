import { StyleSheet } from 'react-native';

export default function createCalculatorStyles(isDark) {
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
    badge: {
      marginTop: 10,
      alignSelf: 'flex-start',
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 999,
      backgroundColor: isDark ? '#1e293b' : '#e5e7eb',
      color: isDark ? '#cbd5e1' : '#475569',
      fontSize: 12,
      fontWeight: '700',
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: isDark ? '#f8fafc' : '#111827',
      marginBottom: 12,
    },
    macrosCard: {
      marginTop: 8,
    },
    macroGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
    },
    macroBlock: {
      flex: 1,
      minWidth: '30%',
      marginBottom: 12,
      backgroundColor: isDark ? '#1e293b' : '#f8fafc',
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#e5e7eb',
    },
  });
}
