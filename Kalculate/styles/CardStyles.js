import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 120,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
  },
  cardLight: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardDark: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
});
