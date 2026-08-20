import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function createCalculatorStyles(isDark) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
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
      color: '#10b981',
      fontWeight: '700',
      marginBottom: 24,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 24,
    },
    cardLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: isDark ? '#94a3b8' : '#64748b',
      marginBottom: 6,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    cardValue: {
      fontSize: 24,
      fontWeight: '800',
      color: isDark ? '#f8fafc' : '#0f172a',
    },
    cardMeta: {
      marginTop: 4,
      color: isDark ? '#94a3b8' : '#64748b',
      fontSize: 12,
      fontWeight: '500',
    },
    badge: {
      marginTop: 10,
      alignSelf: 'flex-start',
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 8,
      backgroundColor: '#10b981',
      color: 'white',
      fontSize: 11,
      fontWeight: '800',
      overflow: 'hidden',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: isDark ? '#f1f5f9' : '#1e293b',
      marginBottom: 16,
    },
    macrosCard: {
      padding: 24,
      borderRadius: 30,
      alignItems: 'center',
    },
    macroChartWrapper: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
    macroChartCenterText: {
      position: 'absolute',
      alignItems: 'center',
    },
    macroChartPercent: {
      fontSize: 28,
      fontWeight: '900',
      color: isDark ? '#f8fafc' : '#0f172a',
    },
    macroChartLabel: {
      fontSize: 12,
      color: isDark ? '#94a3b8' : '#64748b',
      fontWeight: '600',
    },
    macroLegend: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 10,
    },
    legendItem: {
      alignItems: 'center',
      gap: 6,
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    legendLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: isDark ? '#94a3b8' : '#64748b',
    },
    legendValue: {
      fontSize: 16,
      fontWeight: '800',
      color: isDark ? '#f8fafc' : '#0f172a',
    }
  });
}
