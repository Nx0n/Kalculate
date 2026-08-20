import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Modal, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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

export default function FoodScreen({ isDark, user, consumedToday = 0, meals = {}, onNutritionChanged }) {
  const styles = createFoodStyles(isDark);
  const [activeTab, setActiveTab] = useState('breakfast');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [selectedImageLabel, setSelectedImageLabel] = useState('');

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

  const analyzeImageForFood = async (imageAsset) => {
    if (!imageAsset?.uri) {
      throw new Error('ไม่พบไฟล์รูปภาพ');
    }

    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.EXPO_PUBLIC_AI_API_KEY;
    const aiEndpoint = process.env.EXPO_PUBLIC_AI_ENDPOINT || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    if (!apiKey) {
      throw new Error('ยังไม่มี Gemini API key ที่ถูกตั้งค่า');
    }

    const imageBase64 = imageAsset.base64 || imageAsset.uri?.split(',')[1];
    if (!imageBase64) {
      throw new Error('รูปภาพไม่สามารถแปลงเป็นข้อมูล base64 สำหรับ Gemini ได้');
    }

    try {
      const response = await fetch(`${aiEndpoint}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'ดูภาพอาหารนี้ แล้วตอบเป็นชื่อเมนูอาหารภาษาไทยที่สั้นและชัดเจนที่สุดเพียงคำเดียวหรือวลีสั้น ๆ ไม่ต้องอธิบายและไม่ต้องมีคำอื่น ๆ',
                },
                {
                  inlineData: {
                    mimeType: imageAsset.type || 'image/jpeg',
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${errorText}`);
      }

      const data = await response.json();
      const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleaned = content.replace(/[`\n\r]/g, '').trim();
      if (!cleaned) {
        throw new Error('Gemini ไม่ได้ตอบกลับคำที่ใช้ค้นหา');
      }
      return cleaned;
    } catch (error) {
      throw new Error(error?.message || 'ไม่สามารถวิเคราะห์ภาพด้วย Gemini ได้');
    }
  };

  const handleImageSearch = async (source) => {
    try {
      const permission = source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('ไม่สามารถเข้าถึงรูปภาพได้', 'กรุณาอนุญาตให้เข้าถึงกล้องหรือแกลเลอรีก่อนใช้ฟีเจอร์นี้');
        return;
      }

      const pickerResult = source === 'camera'
        ? await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8, base64: true })
        : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.8, base64: true });

      if (pickerResult.canceled) {
        return;
      }

      const asset = pickerResult.assets?.[0];
      if (!asset?.uri) {
        return;
      }

      setSelectedImageUri(asset.uri);
      setSelectedImageLabel(asset.fileName || 'รูปที่เลือก');
      setLoading(true);
      setSearchQuery('');
      setSearchResults([]);

      const detectedQuery = await analyzeImageForFood(asset);
      const normalizedQuery = detectedQuery.trim();
      setSearchQuery(normalizedQuery);

      const results = await searchFoods(normalizedQuery);
      setSearchResults(results);

      if (!results.length) {
        Alert.alert('ไม่พบผลลัพธ์', `ระบบยังไม่พบเมนูที่ตรงกับคำว่า "${normalizedQuery}" จากฐานข้อมูล`);
      }
    } catch (error) {
      Alert.alert('วิเคราะห์รูปภาพไม่สำเร็จ', error.message || 'กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const openImagePickerOptions = () => {
    Alert.alert('เลือกรูปภาพ', 'คุณต้องการใช้รูปภาพจากตัวเลือกใด', [
      { text: 'ถ่ายรูป', onPress: () => handleImageSearch('camera') },
      { text: 'เลือกจากแกลเลอรี', onPress: () => handleImageSearch('library') },
      { text: 'ยกเลิก', style: 'cancel' },
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
        <Text style={styles.databaseButtonText}>เลือกรายการอาหาร</Text>
      </TouchableOpacity>

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
              <Text style={[styles.sectionTitle, styles.modalSectionTitle]}>รายการอาหาร</Text>
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

            {selectedImageUri ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: selectedImageUri }} style={styles.imagePreview} />
                <Text style={styles.imagePreviewLabel}>{selectedImageLabel || 'รูปที่เลือก'}</Text>
              </View>
            ) : null}

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
            <TouchableOpacity style={styles.cameraButton} onPress={openImagePickerOptions}>
              <Feather name="camera" size={22} color="#fff" />
              <Text style={styles.cameraButtonText}>เพิ่มจากรูปภาพ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
