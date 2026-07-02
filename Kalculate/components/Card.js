import { Text, View } from 'react-native';
import styles from '../styles/CardStyles';

export default function Card({ title, children, style, isDark }) {
  return (
    <View
      style={[
        styles.card,
        isDark ? styles.cardDark : styles.cardLight,
        style,
      ]}
    >
      {title ? <Text style={styles.cardTitle}>{title}</Text> : null}
      {children}
    </View>
  );
}
