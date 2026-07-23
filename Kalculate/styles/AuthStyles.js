import { StyleSheet } from 'react-native';

export default function createAuthStyles(isDark) {
  const foreground = isDark ? '#f8fafc' : '#0f172a';
  const muted = isDark ? '#cbd5e1' : '#475569';
  return StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: isDark ? '#0f172a' : '#f4f6f8' },
    brand: { fontSize: 24, fontWeight: '800', color: foreground, marginBottom: 28 },
    title: { fontSize: 30, fontWeight: '800', color: foreground, marginBottom: 8 },
    subtitle: { color: muted, lineHeight: 21, marginBottom: 28 },
    input: { borderWidth: 1, borderColor: isDark ? '#334155' : '#cbd5e1', backgroundColor: isDark ? '#1e293b' : '#ffffff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, color: foreground, marginBottom: 12, fontSize: 16 },
    placeholder: { color: isDark ? '#94a3b8' : '#64748b' },
    primaryButton: { backgroundColor: '#16a34a', borderRadius: 12, alignItems: 'center', paddingVertical: 15, marginTop: 8 },
    primaryButtonText: { color: '#ffffff', fontWeight: '800', fontSize: 16 },
    disabled: { opacity: 0.65 },
    link: { textAlign: 'center', color: '#16a34a', fontWeight: '700', paddingVertical: 18 },
    message: { color: muted, lineHeight: 20, marginBottom: 8 },
    fieldLabel: { color: foreground, fontWeight: '700', marginTop: 4, marginBottom: 8 },
    optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    optionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    option: { borderWidth: 1, borderColor: isDark ? '#475569' : '#cbd5e1', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
    optionSelected: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
    optionText: { color: muted, fontSize: 13 },
    optionTextSelected: { color: '#ffffff', fontWeight: '700' },
  });
}
