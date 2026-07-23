import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { analyzeFoodImage, validateFoodImage } from '../services/foodImageService';
import { searchFoods } from '../services/foodService';

function foodName(food) {
  return food.name_th || food.name_en || 'อาหาร';
}

export default function FoodImageSearch({ styles, onFoodSelected }) {
  const [asset, setAsset] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [matches, setMatches] = useState([]);
  const [message, setMessage] = useState('');

  const chooseImage = async (source) => {
    try {
      setMessage('');
      setMatches([]);
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) throw new Error('ต้องอนุญาตการใช้กล้องก่อนถ่ายรูปอาหาร');
      }
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7, allowsEditing: false })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7, allowsEditing: false });
      if (result.canceled || !result.assets?.[0]) return;
      validateFoodImage(result.assets[0]);
      setAsset(result.assets[0]);
    } catch (error) {
      setMessage(error.message || 'ไม่สามารถเลือกรูปได้');
    }
  };

  const runAnalysis = async () => {
    if (!asset) return;
    try {
      setAnalyzing(true);
      setMessage('กำลังวิเคราะห์รูปอาหาร...');
      setMatches([]);
      const items = await analyzeFoodImage(asset);
      if (!items.length) {
        setMessage('ไม่พบอาหารในรูปนี้ กรุณาลองถ่ายรูปอาหารให้ชัดขึ้น');
        return;
      }
      const results = await Promise.all(items.map(async (item) => ({
        ...item,
        foods: await searchFoods(item.name, { limit: 5 }),
      })));
      setMatches(results);
      setMessage(results.every((item) => item.foods.length === 0)
        ? 'ตรวจพบอาหาร แต่ไม่พบรายการที่ตรงในฐานข้อมูล กรุณาค้นหาด้วยตนเอง'
        : 'เลือกอาหารและหน่วยบริโภคก่อนบันทึก');
    } catch (error) {
      setMessage(error.message || 'วิเคราะห์รูปไม่สำเร็จ');
    } finally {
      setAnalyzing(false);
    }
  };

  const clear = () => {
    setAsset(null);
    setMatches([]);
    setMessage('');
  };

  return <View style={styles.imageSearch}>
    <Text style={styles.fieldLabel}>ค้นหาอาหารจากรูป</Text>
    <Text style={styles.cardMeta}>AI ใช้ช่วยแนะนำเท่านั้น คุณต้องเลือกอาหาร หน่วยบริโภค และจำนวนก่อนบันทึก</Text>
    <View style={styles.optionWrap}>
      <Pressable onPress={() => chooseImage('camera')} disabled={analyzing} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>ถ่ายรูป</Text></Pressable>
      <Pressable onPress={() => chooseImage('library')} disabled={analyzing} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>เลือกรูป</Text></Pressable>
    </View>
    {asset ? <View>
      <Image source={{ uri: asset.uri }} style={styles.imagePreview} accessibilityLabel="ตัวอย่างรูปอาหาร" />
      <View style={styles.optionWrap}>
        <Pressable onPress={runAnalysis} disabled={analyzing} style={[styles.primaryButton, styles.analyzeButton, analyzing && styles.disabled]}>{analyzing ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>วิเคราะห์รูป</Text>}</Pressable>
        <Pressable onPress={clear} disabled={analyzing} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>ล้างรูป</Text></Pressable>
      </View>
    </View> : null}
    {message ? <Text style={message.startsWith('กำลัง') || message.startsWith('เลือก') ? styles.cardMeta : styles.error}>{message}</Text> : null}
    {matches.map((item, index) => <View key={`${item.name}-${index}`} style={styles.aiMatch}>
      <Text style={styles.resultName}>{item.name}</Text>
      <Text style={styles.cardMeta}>ความมั่นใจ {Math.round(item.confidence * 100)}% · ประมาณ {item.estimated_grams} g{item.note ? ` · ${item.note}` : ''}</Text>
      {item.foods.map((food) => <Pressable key={food.id} onPress={() => onFoodSelected(food, item.estimated_grams)} style={styles.searchResult}>
        <Text style={styles.resultName}>{foodName(food)}</Text>
        <Text style={styles.cardMeta}>เลือกเพื่อกำหนดหน่วยบริโภคและจำนวน</Text>
      </Pressable>)}
      {!item.foods.length ? <Text style={styles.cardMeta}>ไม่พบรายการที่ตรงในฐานข้อมูล</Text> : null}
    </View>)}
  </View>;
}
