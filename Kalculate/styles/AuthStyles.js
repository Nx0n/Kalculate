import { StyleSheet, Platform } from 'react-native';

export default function createAuthStyles(isDark) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
      paddingHorizontal: 24,
      justifyContent: 'center',
    },
    header: {
      marginBottom: 40,
      alignItems: 'center',
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
      color: isDark ? '#f8fafc' : '#0f172a',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: isDark ? '#94a3b8' : '#64748b',
    },
    form: {
      gap: 16,
    },
    inputContainer: {
      gap: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#cbd5e1' : '#475569',
      marginLeft: 4,
    },
    input: {
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: Platform.OS === 'ios' ? 16 : 12,
      fontSize: 16,
      color: isDark ? '#f8fafc' : '#0f172a',
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#e2e8f0',
    },
    row: {
      flexDirection: 'row',
      gap: 12,
    },
    button: {
      backgroundColor: '#10b981',
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 24,
      ...Platform.select({
        ios: {
          shadowColor: '#10b981',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '700',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 24,
      gap: 4,
    },
    footerText: {
      color: isDark ? '#94a3b8' : '#64748b',
      fontSize: 14,
    },
    footerLink: {
      color: '#10b981',
      fontSize: 14,
      fontWeight: '700',
    },
    errorText: {
      color: '#ef4444',
      fontSize: 13,
      marginTop: 4,
      textAlign: 'center',
    }
  });
}
