import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import createFoodStyles from '../styles/FoodStyles';
import {
  calculateBmr,
  calculateTdee,
  calculateAge,
  calculateBmi,
  calculateSmartTargetCalories
} from '../services/nutritionService';

// Mock food data
const MOCK_FOODS = [
  { id: '1', name: 'ข้าวผัดกะเพราไข่ดาว', calories: 550, detail: '1 จาน (300ก.)' },
  { id: '2', name: 'ก๋วยเตี๋ยวเรือเส้นเล็ก', calories: 350, detail: '1 ชาม' },
  { id: '3', name: 'อกไก่ย่าง', calories: 165, detail: '100ก.' },
  { id: '4', name: 'สลัดผักรวม', calories: 120, detail: '1 จาน' },
  { id: '5', name: 'ชานมไข่มุก', calories: 380, detail: '1 แก้ว' },
  { id: '6', name: 'แอปเปิ้ล', calories: 52, detail: '1 ลูกกลาง' },
  { id: '7', name: 'กาแฟดำ (ไม่ใส่น้ำตาล)', calories: 5, detail: '1 แก้ว' },
];

export default function FoodScreen({ isDark, user, onAddCalories, consumedToday = 0 }) {
  const styles = createFoodStyles(isDark);
  const [searchQuery, setSearchQuery] = useState('');

  // คำนวณแคลอรี่เป้าหมายที่ฉลาดขึ้นตาม BMI
  const healthStats = useMemo(() => {
    if (!user) return { goal: 2000, recommendation: '' };
    try {
      const weight = Number(user.weight);
      const height = Number(user.height);
      const age = calculateAge(user.birthDate || '1995-01-01');
      const sex = user.sex || 'male';

      const bmi = calculateBmi({ weightKg: weight, heightCm: height });
      const bmr = calculateBmr({ sex, age, weightKg: weight, heightCm: height });
      const tdee = calculateTdee(bmr, 'moderate');

      const smartTarget = calculateSmartTargetCalories({ bmi, tdee, sex });
      return {
        goal: smartTarget.targetCalories,
        recommendation: smartTarget.recommendation
      };
    } catch (e) {
      return { goal: 2000, recommendation: '' };
    }
  }, [user]);

  const dailyGoal = healthStats.goal;
  const progress = Math.min(consumedToday / dailyGoal, 1);
  const remaining = Math.max(dailyGoal - consumedToday, 0);

  const filteredFoods = MOCK_FOODS.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectFood = (food) => {
    Alert.alert(
      'ยืนยันรายการ',
      `คุณทาน "${food.name}" (${food.calories} kcal) ใช่หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ใช่, บันทึกเลย', onPress: () => onAddCalories(food.calories) }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>บันทึกอาหาร</Text>
        <Text style={[styles.subtitle, { color: '#10b981', fontWeight: '600' }]}>
          {healthStats.recommendation || 'เลือกอาหารที่คุณทานวันนี้'}
        </Text>
      </View>

      <View style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <Text style={styles.goalTitle}>เป้าหมายวันนี้</Text>
          <Text style={styles.goalValue}>{consumedToday} / {dailyGoal} kcal</Text>
        </View>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressText}>ทานไปแล้ว {Math.round(progress * 100)}%</Text>
          <Text style={styles.progressText}>เหลืออีก {remaining} kcal</Text>
        </View>
      </View>

      <View style={styles.searchBar}>
        <Feather name="search" size={20} color={isDark ? '#94a3b8' : '#64748b'} />
        <TextInput
          style={styles.searchInput}
          placeholder="ค้นหาอาหาร..."
          placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <Text style={styles.sectionTitle}>เมนูแนะนำ</Text>
      <FlatList
        data={filteredFoods}
        keyExtractor={item => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.foodItem}
            onPress={() => handleSelectFood(item)}
          >
            <View style={styles.foodIcon}>
              <Feather name="coffee" size={22} color="#10b981" />
            </View>
            <View style={styles.foodInfo}>
              <Text style={styles.foodName}>{item.name}</Text>
              <Text style={styles.foodDetail}>{item.detail}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', marginRight: 12 }}>
              <Text style={[styles.foodName, { color: '#10b981' }]}>{item.calories}</Text>
              <Text style={styles.foodDetail}>kcal</Text>
            </View>
            <View style={styles.addBtn}>
              <Feather name="plus" size={20} color="white" />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
