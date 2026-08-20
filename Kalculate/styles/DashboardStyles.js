import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

export default function createDashboardStyles(isDark) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
    },
    contentContainer: {
      paddingHorizontal: 24,
      paddingTop: 10,
      paddingBottom: 120,
    },
    header: {
      marginBottom: 24,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: 26,
      fontWeight: '800',
      color: isDark ? '#f8fafc' : '#0f172a',
      letterSpacing: -0.5,
    },
    recommendationBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#064e3b' : '#dcfce7',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      gap: 6,
    },
    recommendationText: {
      fontSize: 13,
      color: '#10b981',
      fontWeight: '700',
    },
    chartSection: {
      padding: 30,
      alignItems: 'center',
      borderRadius: 35,
      marginBottom: 24,
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.04,
          shadowRadius: 20,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    chartWrapper: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    chartTextWrapper: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    chartValue: {
      fontSize: 52,
      fontWeight: '900',
      color: isDark ? '#f8fafc' : '#0f172a',
      letterSpacing: -1,
    },
    chartLabel: {
      fontSize: 14,
      color: isDark ? '#94a3b8' : '#64748b',
      fontWeight: '600',
      marginTop: -4,
    },
    chartStatsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      marginTop: 24,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: isDark ? '#334155' : '#f1f5f9',
    },
    chartStatItem: {
      alignItems: 'center',
    },
    chartStatLabel: {
      fontSize: 10,
      color: isDark ? '#94a3b8' : '#64748b',
      fontWeight: '700',
      textTransform: 'uppercase',
      marginBottom: 4,
      letterSpacing: 0.5,
    },
    chartStatValue: {
      fontSize: 18,
      fontWeight: '800',
      color: isDark ? '#f8fafc' : '#1e293b',
    },
    chartStatDivider: {
      width: 1,
      height: 30,
      backgroundColor: isDark ? '#334155' : '#f1f5f9',
    },
    summaryButton: {
      backgroundColor: '#10b981',
      paddingVertical: 16,
      borderRadius: 22,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
      marginBottom: 24,
      ...Platform.select({
        ios: {
          shadowColor: '#10b981',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.25,
          shadowRadius: 15,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    summaryButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '800',
    },
    summaryCard: {
      padding: 24,
      borderRadius: 30,
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      marginBottom: 24,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#e2e8f0',
    },
    summaryTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: isDark ? '#f8fafc' : '#0f172a',
      marginBottom: 16,
    },
    summaryItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 14,
      marginBottom: 16,
    },
    summaryText: {
      fontSize: 15,
      color: isDark ? '#f8fafc' : '#0f172a',
      marginBottom: 4,
    },
    summaryTipText: {
      fontSize: 13,
      color: isDark ? '#94a3b8' : '#64748b',
      lineHeight: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: isDark ? '#f1f5f9' : '#1e293b',
      marginBottom: 16,
      marginTop: 8,
    },
    macroCard: {
      padding: 20,
      borderRadius: 24,
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
    },
    macroRow: {
      marginBottom: 18,
    },
    macroHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    macroTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    macroDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    macroLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#cbd5e1' : '#475569',
    },
    macroValue: {
      fontSize: 13,
      fontWeight: '700',
      color: isDark ? '#f8fafc' : '#0f172a',
    },
    progressBarBg: {
      height: 10,
      backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
      borderRadius: 5,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 5,
    },
    bmiCard: {
      marginTop: 12,
      padding: 18,
      borderRadius: 24,
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
    },
    bmiContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: isDark ? '#94a3b8' : '#64748b',
      textTransform: 'uppercase',
      marginBottom: 2,
    },
    bmiValueText: {
      fontSize: 22,
      fontWeight: '800',
      color: isDark ? '#f8fafc' : '#0f172a',
    },
    bmiBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    bmiBadgeText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#10b981',
    },
  });
}
