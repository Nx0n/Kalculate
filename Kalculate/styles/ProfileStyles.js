import { StyleSheet } from 'react-native';

export default function createProfileStyles(isDark) {
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
      color: isDark ? '#f8fafc' : '#0f172a',
    },
    profileHeader: {
      alignItems: 'center',
      marginBottom: 32,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 4,
      borderColor: isDark ? '#334155' : '#ffffff',
    },
    userName: {
      fontSize: 20,
      fontWeight: '700',
      color: isDark ? '#f8fafc' : '#0f172a',
    },
    userEmail: {
      fontSize: 14,
      color: isDark ? '#94a3b8' : '#64748b',
      marginTop: 4,
    }
  });
}
