import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import Card from '../components/Card';
import FoodImageSearch from '../components/FoodImageSearch';
import useDailyNutrition from '../hooks/useDailyNutrition';
import { getFoodWithServings, searchFoods } from '../services/foodService';
import { calculateAge, calculateBmr, calculateTargetCalories, calculateTdee } from '../services/nutritionService';
import createDashboardStyles from '../styles/DashboardStyles';

const mealTypes = [
  ['breakfast', 'มื้อเช้า'],
  ['lunch', 'มื้อกลางวัน'],
  ['dinner', 'มื้อเย็น'],
  ['snack', 'ของว่าง'],
];

function getToday() { return new Date().toISOString().slice(0, 10); }
function foodName(food) { return food.name_th || food.name_en || 'อาหาร'; }

export default function DashboardScreen({ isDark, profile }) {
  const styles = createDashboardStyles(isDark);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedServing, setSelectedServing] = useState(null);
  const [mealType, setMealType] = useState('breakfast');
  const [quantity, setQuantity] = useState('1');
  const [saving, setSaving] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  const { data, loading, error, addItem, updateItemQuantity, removeItem } = useDailyNutrition(getToday());

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      setResults([]);
      setSearching(false);
      return undefined;
    }

    let active = true;
    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        const foods = await searchFoods(trimmedQuery);
        if (active) setResults(foods);
      } catch (searchError) {
        if (active) setFormMessage(searchError.message || 'ค้นหาอาหารไม่สำเร็จ');
      } finally {
        if (active) setSearching(false);
      }
    }, 350);

    return () => { active = false; clearTimeout(timer); };
  }, [query]);

  let targetCalories = null;
  try {
    const bmr = calculateBmr({ sex: profile.sex, age: calculateAge(profile.birth_date), weightKg: profile.current_weight_kg, heightCm: profile.height_cm });
    targetCalories = calculateTargetCalories(calculateTdee(bmr, profile.activity_level), profile.goal, profile.weekly_weight_change_kg, profile.sex);
  } catch {}

  const selectFood = async (food, estimatedGrams = null) => {
    try {
      setSaving(true);
      setFormMessage('');
      const foodWithServings = await getFoodWithServings(food.id);
      if (!foodWithServings?.servings?.length) {
        setFormMessage('อาหารรายการนี้ยังไม่มีหน่วยบริโภคให้เลือก');
        return;
      }
      setSelectedFood(foodWithServings);
      setSelectedServing(foodWithServings.servings[0]);
      if (Number.isFinite(Number(estimatedGrams)) && Number(estimatedGrams) > 0) {
        setQuantity(String(Number((Number(estimatedGrams) / Number(foodWithServings.servings[0].grams)).toFixed(2))));
      }
      setResults([]);
    } catch (selectError) {
      setFormMessage(selectError.message || 'โหลดหน่วยบริโภคไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const addFood = async () => {
    const numericQuantity = Number(quantity);
    if (!selectedServing || !Number.isFinite(numericQuantity) || numericQuantity <= 0) {
      setFormMessage('เลือกหน่วยบริโภคและระบุจำนวนที่มากกว่า 0');
      return;
    }
    try {
      setSaving(true);
      setFormMessage('');
      await addItem({ mealType, servingId: selectedServing.id, quantity: numericQuantity });
      setSelectedFood(null);
      setSelectedServing(null);
      setQuantity('1');
      setQuery('');
    } catch (addError) {
      setFormMessage(addError.message || 'บันทึกอาหารไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const changeQuantity = async (item, nextQuantity) => {
    if (nextQuantity <= 0) return;
    try {
      setFormMessage('');
      await updateItemQuantity({ itemId: item.id, quantity: nextQuantity });
    } catch (updateError) {
      setFormMessage(updateError.message || 'แก้ไขจำนวนไม่สำเร็จ');
    }
  };

  const deleteItem = async (itemId) => {
    try {
      setFormMessage('');
      await removeItem(itemId);
    } catch (deleteError) {
      setFormMessage(deleteError.message || 'ลบรายการไม่สำเร็จ');
    }
  };

  const totals = data?.totals;
  return <View>
    <Text style={styles.title}>Dashboard</Text>
    <Text style={styles.subtitle}>บันทึกและติดตามโภชนาการของคุณในวันนี้</Text>
    {loading ? <ActivityIndicator /> : error ? <Text style={styles.error}>{error}</Text> : <View style={styles.grid}>
      <Card isDark={isDark}><Text style={styles.cardLabel}>พลังงานวันนี้</Text><Text style={styles.cardValue}>{totals?.caloriesKcal || 0} kcal</Text><Text style={styles.cardMeta}>เป้าหมาย {targetCalories || '-'} kcal</Text></Card>
      <Card isDark={isDark}><Text style={styles.cardLabel}>โปรตีน</Text><Text style={styles.cardValue}>{totals?.proteinG || 0} g</Text><Text style={styles.cardMeta}>จากรายการอาหารที่บันทึก</Text></Card>
    </View>}

    <Card isDark={isDark}>
      <Text style={styles.sectionTitle}>เพิ่มอาหาร</Text>
      <TextInput value={query} onChangeText={setQuery} placeholder="ค้นหาอาหารอย่างน้อย 2 ตัวอักษร" placeholderTextColor={styles.placeholder.color} style={styles.input} />
      {searching ? <ActivityIndicator /> : null}
      {results.map((food) => <Pressable key={food.id} onPress={() => selectFood(food)} style={styles.searchResult}><Text style={styles.resultName}>{foodName(food)}</Text><Text style={styles.cardMeta}>{food.category}{food.brand_name ? ` · ${food.brand_name}` : ''}</Text></Pressable>)}

      {selectedFood ? <View style={styles.selection}>
        <Text style={styles.resultName}>{foodName(selectedFood)}</Text>
        <Text style={styles.fieldLabel}>หน่วยบริโภค</Text>
        <View style={styles.optionWrap}>{selectedFood.servings.map((serving) => <Pressable key={serving.id} onPress={() => setSelectedServing(serving)} style={[styles.option, selectedServing?.id === serving.id && styles.optionSelected]}><Text style={[styles.optionText, selectedServing?.id === serving.id && styles.optionTextSelected]}>{serving.serving_name} ({serving.grams} g)</Text></Pressable>)}</View>
        <Text style={styles.fieldLabel}>มื้ออาหาร</Text>
        <View style={styles.optionWrap}>{mealTypes.map(([value, label]) => <Pressable key={value} onPress={() => setMealType(value)} style={[styles.option, mealType === value && styles.optionSelected]}><Text style={[styles.optionText, mealType === value && styles.optionTextSelected]}>{label}</Text></Pressable>)}</View>
        <Text style={styles.fieldLabel}>จำนวน</Text>
        <TextInput value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" style={styles.input} placeholder="1" placeholderTextColor={styles.placeholder.color} />
        {selectedServing ? <Text style={styles.cardMeta}>{selectedServing.calories_kcal * (Number(quantity) || 0)} kcal · โปรตีน {selectedServing.protein_g * (Number(quantity) || 0)} g</Text> : null}
        <Pressable onPress={addFood} disabled={saving} style={[styles.primaryButton, saving && styles.disabled]}>{saving ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>เพิ่มลงมื้ออาหาร</Text>}</Pressable>
      </View> : null}
      <FoodImageSearch styles={styles} onFoodSelected={selectFood} />
      {formMessage ? <Text style={styles.error}>{formMessage}</Text> : null}
    </Card>

    <Text style={styles.sectionTitle}>รายการอาหารวันนี้</Text>
    {mealTypes.map(([type, label]) => <Card key={type} isDark={isDark}>
      <Text style={styles.resultName}>{label}</Text>
      {data?.meals?.[type]?.length ? data.meals[type].map((item) => <View key={item.id} style={styles.mealItem}>
        <View style={styles.mealDetails}><Text style={styles.resultName}>{item.food_name}</Text><Text style={styles.cardMeta}>{item.calories_kcal} kcal · {item.serving_name}</Text></View>
        <View style={styles.quantityControls}><Pressable onPress={() => changeQuantity(item, Number(item.quantity) - 1)} style={styles.iconButton}><Text style={styles.iconButtonText}>−</Text></Pressable><Text style={styles.quantityText}>{item.quantity}</Text><Pressable onPress={() => changeQuantity(item, Number(item.quantity) + 1)} style={styles.iconButton}><Text style={styles.iconButtonText}>+</Text></Pressable><Pressable onPress={() => deleteItem(item.id)} style={styles.deleteButton}><Text style={styles.deleteText}>ลบ</Text></Pressable></View>
      </View>) : <Text style={styles.cardMeta}>ยังไม่มีรายการ</Text>}
    </Card>)}
  </View>;
}
