import { StyleSheet, Platform } from 'react-native';

export default function createFoodStyles(isDark) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    headerSection: {
      marginBottom: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: isDark ? '#f8fafc' : '#0f172a',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 15,
      color: isDark ? '#94a3b8' : '#64748b',
      marginBottom: 16,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: Platform.OS === 'ios' ? 12 : 8,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#e2e8f0',
      marginBottom: 20,
    },
    searchInput: {
      flex: 1,
      marginLeft: 10,
      fontSize: 16,
      color: isDark ? '#f8fafc' : '#0f172a',
    },
    goalCard: {
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      borderRadius: 24,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#f1f5f9',
    },
    goalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    goalTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: isDark ? '#f8fafc' : '#1e293b',
    },
    goalValue: {
      fontSize: 14,
      color: '#10b981',
      fontWeight: '600',
    },
    progressContainer: {
      height: 12,
      backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
      borderRadius: 6,
      overflow: 'hidden',
      marginBottom: 12,
    },
    progressBar: {
      height: '100%',
      backgroundColor: '#10b981',
      borderRadius: 6,
    },
    progressLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    progressText: {
      fontSize: 13,
      color: isDark ? '#94a3b8' : '#64748b',
      fontWeight: '500',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: isDark ? '#f1f5f9' : '#1e293b',
      marginBottom: 16,
    },
    foodItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#f1f5f9',
    },
    foodIcon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    foodInfo: {
      flex: 1,
    },
    foodName: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#f8fafc' : '#0f172a',
      marginBottom: 2,
    },
    foodDetail: {
      fontSize: 13,
      color: isDark ? '#94a3b8' : '#64748b',
    },
    addBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#10b981',
      justifyContent: 'center',
      alignItems: 'center',
    }
  });
}
