import { View, Text } from 'react-native';
import Card from '../components/Card';
import createCalculatorStyles from '../styles/CalculatorStyles';

const calculatorData = {
  bmi: '22.3',
  bmiCategory: 'Normal',
  bmr: 1550,
  tdee: 2100,
  goal: 'Maintain',
  targetCalories: 2100,
  macros: {
    protein: 120,
    carbs: 250,
    fat: 70,
  },
};

export default function CalculatorScreen({ isDark }) {
  const styles = createCalculatorStyles(isDark);

  return (
    <View>
      <Text style={styles.title}>Calorie Calculator</Text>
      <Text style={styles.subtitle}>
        Based on the Mifflin-St Jeor equation and your activity level.
      </Text>
      <View style={styles.grid}>
        <Card isDark={isDark}>
          <Text style={styles.cardLabel}>BMI</Text>
          <Text style={styles.cardValue}>{calculatorData.bmi}</Text>
          <Text style={styles.badge}>{calculatorData.bmiCategory}</Text>
        </Card>
        <Card isDark={isDark}>
          <Text style={styles.cardLabel}>BMR (at rest)</Text>
          <Text style={styles.cardValue}>{calculatorData.bmr}</Text>
          <Text style={styles.cardMeta}>kcal/day</Text>
        </Card>
        <Card isDark={isDark}>
          <Text style={styles.cardLabel}>TDEE (maintenance)</Text>
          <Text style={styles.cardValue}>{calculatorData.tdee}</Text>
          <Text style={styles.cardMeta}>kcal/day</Text>
        </Card>
        <Card isDark={isDark}>
          <Text style={styles.cardLabel}>Daily target ({calculatorData.goal})</Text>
          <Text style={styles.cardValue}>{calculatorData.targetCalories}</Text>
          <Text style={styles.cardMeta}>kcal/day</Text>
        </Card>
      </View>
      <Card isDark={isDark} style={styles.macrosCard}>
        <Text style={styles.cardTitle}>Recommended daily macros</Text>
        <View style={styles.macroGrid}>
          <View style={styles.macroBlock}>
            <Text style={styles.cardLabel}>Protein</Text>
            <Text style={styles.cardValue}>{calculatorData.macros.protein} g</Text>
          </View>
          <View style={styles.macroBlock}>
            <Text style={styles.cardLabel}>Carbs</Text>
            <Text style={styles.cardValue}>{calculatorData.macros.carbs} g</Text>
          </View>
          <View style={styles.macroBlock}>
            <Text style={styles.cardLabel}>Fat</Text>
            <Text style={styles.cardValue}>{calculatorData.macros.fat} g</Text>
          </View>
        </View>
      </Card>
    </View>
  );
}
