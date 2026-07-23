import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import createFoodStyles from '../styles/FoodStyles';
import { searchFoods, getFoodWithServings } from '../services/foodService';
import { addMealItem, deleteMealItem } from '../services/mealService';
import { calculateBmr, calculateTdee, calculateAge, calculateBmi, calculateSmartTargetCalories } from '../services/nutritionService';

const today = () => new Date().toISOString().slice(0, 10);
const mealCategories = [
  { key: 'breakfast', label: 'เช้า' },
  { key: 'lunch', label: 'กลางวัน' },
  { key: 'dinner', label: 'เย็น' },
  { key: 'snack', label: 'ว่าง' },
];

const POPULAR_FOODS = [
  { id: 'p1', name_th: 'ข้าวผัดกะเพราไก่ไข่ดาว', calories: 630, category: 'อาหารจานเดียว' },
  { id: 'p2', name_th: 'ข้าวมันไก่', calories: 590, category: 'อาหารจานเดียว' },
  { id: 'p3', name_th: 'ผัดไทยกุ้งสด', calories: 480, category: 'เมนูเส้น' },
  { id: 'p4', name_th: 'ส้มตำไทย', calories: 120, category: 'เมนูยำ/ตำ' },
  { id: 'p5', name_th: 'อกไก่ย่าง', calories: 165, category: 'โปรตีน' },
  { id: 'p6', name_th: 'ไข่ต้ม (1 ฟอง)', calories: 75, category: 'โปรตีน' },
  { id: 'p7', name_th: 'ก๋วยเตี๋ยวเส้นเล็กน้ำใส', calories: 350, category: 'เมนูเส้น' },
  { id: 'p8', name_th: 'ข้าวไข่เจียว', calories: 445, category: 'อาหารจานเดียว' },
];

export default function FoodScreen({ isDark, user, consumedToday = 0, meals = {}, onNutritionChanged }) {
  const styles = createFoodStyles(isDark);
  const [activeTab, setActiveTab] = useState('breakfast');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const healthStats = useMemo(() => {
    try {
      const bmi = calculateBmi({ weightKg: user.weight, heightCm: user.height });
      const bmr = calculateBmr({ sex: user.sex, age: calculateAge(user.birthDate), weightKg: user.weight, heightCm: user.height });
      const tdee = calculateTdee(bmr, user.activityLevel || 'moderate');
      const smartTarget = calculateSmartTargetCalories({ bmi, tdee, sex: user.sex });
      return { goal: smartTarget.targetCalories, recommendation: smartTarget.recommendation };
    } catch {
      return { goal: 2000, recommendation: 'รักษาสุขภาพของคุณ' };
    }
  }, [user]);

  useEffect(() => {
    if (!isModalVisible) return;
    let live = true;
    const timer = setTimeout(async () => {
      if (!searchQuery.trim()) {
        if (live) setSearchResults([]);
        return;
      }
      try {
        setLoading(true);
        const result = await searchFoods(searchQuery);
        if (live) setSearchResults(result);
      } catch (error) {
        if (live) Alert.alert('ค้นหาไม่สำเร็จ', error.message);
      } finally {
        if (live) setLoading(false);
      }
    }, 400);
    return () => { live = false; clearTimeout(timer); };
  }, [searchQuery, isModalVisible]);

  const handleAddFood = async (food) => {
    try {
      setLoading(true);
      let foodIdToRecord = food.id;

      if (food.id.startsWith('p')) {
        const dbMatches = await searchFoods(food.name_th);
        if (dbMatches.length > 0) {
          foodIdToRecord = dbMatches[0].id;
        } else {
          setLoading(false);
          Alert.alert(
            'ไม่พบข้อมูลโภชนาการ',
            `ขออภัย ระบบยังไม่มีข้อมูลที่ละเอียดของ "${food.name_th}" ในฐานข้อมูลออนไลน์ กรุณาลองค้นหาเมนูที่ใกล้เคียงที่สุดจากช่องค้นหาแทนครับ`
          );
          return;
        }
      }

      const detail = await getFoodWithServings(foodIdToRecord);
      const serving = detail?.servings?.[0];

      if (!serving) throw new Error('อาหารนี้ยังไม่มีข้อมูลหน่วยบริโภคในฐานข้อมูล');

      await addMealItem({
        mealDate: today(),
        mealType: activeTab,
        servingId: serving.id
      });

      await onNutritionChanged?.();

      if (isModalVisible) {
        setIsModalVisible(false);
        setSearchQuery('');
        setSearchResults([]);
      }

      Alert.alert('บันทึกสำเร็จ', `เพิ่ม "${food.name_th || detail.name_th}" เรียบร้อยแล้ว`);
    } catch (error) {
      Alert.alert('บันทึกไม่สำเร็จ', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    Alert.alert('ยืนยันการลบ', 'คุณต้องการลบรายการอาหารนี้ใช่หรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ลบ',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMealItem(itemId);
            await onNutritionChanged?.();
          } catch (error) {
            Alert.alert('ลบไม่สำเร็จ', error.message);
          }
        },
      },
    ]);
  };

  const progress = Math.min(consumedToday / healthStats.goal, 1);
  const currentLoggedMeals = meals[activeTab] || [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerSection}>
        <Text style={styles.title}>บันทึกอาหาร</Text>
        <Text style={styles.subtitle}>{healthStats.recommendation}</Text>
      </View>

      <View style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <Text style={styles.goalTitle}>แคลอรี่เป้าหมาย</Text>
          <Text style={styles.goalValue}>{Math.round(consumedToday)} / {healthStats.goal} kcal</Text>
        </View>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressText}>ทานไปแล้ว {Math.round(progress * 100)}%</Text>
          <Text style={styles.progressText}>เหลืออีก {Math.max(0, Math.round(healthStats.goal - consumedToday))} kcal</Text>
        </View>
      </View>

      <View style={styles.categoryTabs}>
        {mealCategories.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.tab, activeTab === cat.key && styles.activeTab]}
            onPress={() => setActiveTab(cat.key)}
          >
            <Text style={[styles.tabText, activeTab === cat.key && styles.activeTabText]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.databaseButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Feather name="database" size={20} color="white" />
        <Text style={styles.databaseButtonText}>เลือกจากฐานข้อมูลอาหาร</Text>
      </TouchableOpacity>

      <View style={styles.popularSection}>
        <Text style={styles.sectionTitle}>เมนูแนะนำ</Text>
        <View style={styles.popularGrid}>
          {POPULAR_FOODS.map((food) => (
            <TouchableOpacity
              key={food.id}
              style={[styles.foodItem, styles.popularFoodItem]}
              onPress={() => handleAddFood(food)}
            >
              <View style={styles.foodIcon}>
                <Feather name="coffee" size={18} color="#10b981" />
              </View>
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{food.name_th}</Text>
                <Text style={styles.foodDetail}>{food.category} · {food.calories} kcal</Text>
              </View>
              <Feather name="plus-circle" size={20} color="#10b981" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.loggedSection}>
        <Text style={styles.sectionTitle}>รายการที่บันทึกแล้ว ({mealCategories.find(c => c.key === activeTab)?.label})</Text>
        {currentLoggedMeals.length > 0 ? (
          currentLoggedMeals.map((item) => (
            <View key={item.id} style={styles.loggedItem}>
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{item.food_name}</Text>
                <Text style={styles.foodCalories}>{Math.round(item.calories_kcal)} kcal</Text>
              </View>
              <TouchableOpacity onPress={() => handleDeleteItem(item.id)} style={styles.deleteBtn}>
                <Feather name="trash-2" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>ยังไม่ได้บันทึกรายการอาหารในมื้อนี้</Text>
        )}
      </View>

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.sectionTitle, styles.modalSectionTitle]}>ฐานข้อมูลอาหาร</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Feather name="x" size={24} color={isDark ? '#f8fafc' : '#0f172a'} />
              </TouchableOpacity>
            </View>

            <View style={[styles.searchBar, styles.modalSearchBar]}>
              <Feather name="search" size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <TextInput
                style={styles.searchInput}
                placeholder="พิมพ์ชื่ออาหารภาษาไทย..."
                placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={true}
              />
            </View>

            {loading && <ActivityIndicator color="#10b981" style={styles.loader} />}

            <ScrollView showsVerticalScrollIndicator={false}>
              {searchResults.map((item) => (
                <TouchableOpacity key={item.id} style={styles.foodItem} onPress={() => handleAddFood(item)}>
                  <View style={styles.foodIcon}>
                    <Feather name="plus" size={20} color="#10b981" />
                  </View>
                  <View style={styles.foodInfo}>
                    <Text style={styles.foodName}>{item.name_th || item.name_en}</Text>
                    <Text style={styles.foodDetail}>{item.brand_name || 'ทั่วไป'}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              {searchQuery.trim() !== '' && !loading && searchResults.length === 0 && (
                <Text style={styles.emptyText}>ไม่พบข้อมูลอาหาร</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
