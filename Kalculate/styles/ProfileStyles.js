import { StyleSheet } from 'react-native';

export default function createProfileStyles(isDark) {
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
    cardMeta: { marginTop: 8, color: isDark ? '#94a3b8' : '#6b7280', fontSize: 13 },
    input: { borderWidth: 1, borderColor: isDark ? '#334155' : '#cbd5e1', borderRadius: 10, color: isDark ? '#f8fafc' : '#0f172a', padding: 12, marginBottom: 14, backgroundColor: isDark ? '#1e293b' : '#ffffff' },
    placeholder: { color: isDark ? '#94a3b8' : '#64748b' },
    button: { alignItems: 'center', backgroundColor: '#16a34a', padding: 13, borderRadius: 10 },
    buttonText: { color: '#ffffff', fontWeight: '800' },
    disabled: { opacity: 0.65 },
    message: { color: isDark ? '#cbd5e1' : '#475569', marginBottom: 10 },
    signOutButton: { alignItems: 'center', padding: 14 },
    signOutText: { color: '#dc2626', fontWeight: '700' },
  });
}
