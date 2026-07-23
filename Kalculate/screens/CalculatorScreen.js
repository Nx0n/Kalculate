import { View, Text } from 'react-native';
import Card from '../components/Card';
import createCalculatorStyles from '../styles/CalculatorStyles';
import { calculateAge, calculateBmi, calculateBmr, calculateMacroTargets, calculateTargetCalories, calculateTdee, getBmiCategory } from '../services/nutritionService';

export default function CalculatorScreen({ isDark, profile }) {
  const styles = createCalculatorStyles(isDark);
  try {
    const age = calculateAge(profile.birth_date);
    const bmi = calculateBmi({ weightKg: profile.current_weight_kg, heightCm: profile.height_cm });
    const bmr = calculateBmr({ sex: profile.sex, age, weightKg: profile.current_weight_kg, heightCm: profile.height_cm });
    const tdee = calculateTdee(bmr, profile.activity_level);
    const targetCalories = calculateTargetCalories(tdee, profile.goal, profile.weekly_weight_change_kg, profile.sex);
    const macros = calculateMacroTargets(targetCalories);
    const goalLabel = profile.goal === 'lose_weight' ? 'ลดน้ำหนัก' : profile.goal === 'gain_weight' ? 'เพิ่มน้ำหนัก' : 'คงน้ำหนัก';
    return <View>
      <Text style={styles.title}>Calorie Calculator</Text>
      <Text style={styles.subtitle}>คำนวณด้วย Mifflin-St Jeor จากข้อมูลโปรไฟล์ของคุณ</Text>
      <View style={styles.grid}>
        <Card isDark={isDark}><Text style={styles.cardLabel}>BMI</Text><Text style={styles.cardValue}>{bmi}</Text><Text style={styles.badge}>{getBmiCategory(bmi)}</Text></Card>
        <Card isDark={isDark}><Text style={styles.cardLabel}>BMR (ขณะพัก)</Text><Text style={styles.cardValue}>{bmr}</Text><Text style={styles.cardMeta}>kcal/day</Text></Card>
        <Card isDark={isDark}><Text style={styles.cardLabel}>TDEE (รักษาน้ำหนัก)</Text><Text style={styles.cardValue}>{tdee}</Text><Text style={styles.cardMeta}>kcal/day</Text></Card>
        <Card isDark={isDark}><Text style={styles.cardLabel}>เป้าหมายต่อวัน ({goalLabel})</Text><Text style={styles.cardValue}>{targetCalories}</Text><Text style={styles.cardMeta}>kcal/day</Text></Card>
      </View>
      <Card isDark={isDark} style={styles.macrosCard}><Text style={styles.cardTitle}>สารอาหารต่อวันที่แนะนำ</Text><View style={styles.macroGrid}>
        <View style={styles.macroBlock}><Text style={styles.cardLabel}>Protein</Text><Text style={styles.cardValue}>{macros.proteinG} g</Text></View>
        <View style={styles.macroBlock}><Text style={styles.cardLabel}>Carbs</Text><Text style={styles.cardValue}>{macros.carbsG} g</Text></View>
        <View style={styles.macroBlock}><Text style={styles.cardLabel}>Fat</Text><Text style={styles.cardValue}>{macros.fatG} g</Text></View>
      </View></Card>
    </View>;
  } catch {
    return <View><Text style={styles.title}>Calorie Calculator</Text><Text style={styles.subtitle}>กรอกข้อมูลโปรไฟล์ให้ครบเพื่อคำนวณเป้าหมายของคุณ</Text></View>;
  }
}
