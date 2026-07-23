import { StyleSheet, Platform } from 'react-native';

export default function createFoodStyles(isDark) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
    },
    contentContainer: {
      padding: 24,
      paddingBottom: 100,
    },
    headerSection: {
      marginBottom: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: isDark ? '#f8fafc' : '#0f172a',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 15,
      color: '#10b981',
      fontWeight: '700',
      marginBottom: 16,
    },
    goalCard: {
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      borderRadius: 24,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#f1f5f9',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    goalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    goalTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: isDark ? '#f8fafc' : '#1e293b',
    },
    goalValue: {
      fontSize: 14,
      color: '#10b981',
      fontWeight: '700',
    },
    progressContainer: {
      height: 10,
      backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
      borderRadius: 5,
      overflow: 'hidden',
      marginBottom: 10,
    },
    progressBar: {
      height: '100%',
      backgroundColor: '#10b981',
      borderRadius: 5,
    },
    progressLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    progressText: {
      fontSize: 12,
      color: isDark ? '#94a3b8' : '#64748b',
      fontWeight: '500',
    },
    categoryTabs: {
      flexDirection: 'row',
      backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
      borderRadius: 16,
      padding: 4,
      marginBottom: 20,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 12,
    },
    activeTab: {
      backgroundColor: isDark ? '#334155' : '#ffffff',
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#94a3b8' : '#64748b',
    },
    activeTabText: {
      color: isDark ? '#f8fafc' : '#0f172a',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: isDark ? '#f1f5f9' : '#1e293b',
      marginBottom: 12,
    },
    databaseButton: {
      backgroundColor: '#10b981',
      borderStyle: 'dashed',
      justifyContent: 'center',
      height: 60,
      marginBottom: 24,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 20,
      borderWidth: 2,
      borderColor: '#10b981',
    },
    databaseButtonText: {
      color: 'white',
      fontWeight: '700',
      fontSize: 16,
      marginLeft: 10,
    },
    popularGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 24,
    },
    foodItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      borderRadius: 20,
      padding: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#f1f5f9',
    },
    foodIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    foodInfo: {
      flex: 1,
    },
    foodName: {
      fontSize: 15,
      fontWeight: '600',
      color: isDark ? '#f8fafc' : '#0f172a',
    },
    foodDetail: {
      fontSize: 12,
      color: isDark ? '#94a3b8' : '#64748b',
      marginTop: 2,
    },
    loggedSection: {
      marginTop: 10,
    },
    loggedItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      borderRadius: 16,
      padding: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#f1f5f9',
    },
    foodCalories: {
      fontSize: 13,
      color: '#10b981',
      fontWeight: '600',
      marginTop: 2,
    },
    deleteBtn: {
      padding: 8,
    },
    emptyText: {
      textAlign: 'center',
      color: isDark ? '#64748b' : '#94a3b8',
      fontSize: 14,
      paddingVertical: 20,
      fontStyle: 'italic',
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
    },
    modalSearchBar: {
      marginTop: 15,
      marginBottom: 16,
    },
    searchInput: {
      flex: 1,
      marginLeft: 10,
      fontSize: 16,
      color: isDark ? '#f8fafc' : '#0f172a',
    },
    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      height: '85%',
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      padding: 24,
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalSectionTitle: {
      marginBottom: 0,
    },
    loader: {
      marginVertical: 10,
    }
  });
}
