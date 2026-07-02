import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 10,
    zIndex: 10,
  },
  darkBackground: {
    backgroundColor: '#0f172a',
    borderTopColor: '#334155',
  },
  lightBackground: {
    backgroundColor: '#ffffff',
    borderTopColor: '#e5e7eb',
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    minWidth: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#16a34a',
  },
  tabIcon: {
    color: '#475569',
    fontSize: 22,
  },
  tabIconDark: {
    color: '#cbd5e1',
    fontSize: 22,
  },
  tabIconActive: {
    color: '#ffffff',
    fontSize: 22,
  },
});
