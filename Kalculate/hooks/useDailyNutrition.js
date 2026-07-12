import { useCallback, useEffect, useRef, useState } from 'react';
import { addMealItem, deleteMealItem, getDailyNutrition, getMealsForDate, updateMealItemQuantity } from '../services/mealService';

// hook นี้จัดการข้อมูลโภชนาการรายวันและการเพิ่ม/ลบรายการอาหารในมื้อ
export default function useDailyNutrition(mealDate) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!mealDate || !/^\d{4}-\d{2}-\d{2}$/.test(mealDate)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const dailyData = await getDailyNutrition(mealDate);
      if (isMountedRef.current) {
        setData(dailyData);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'ไม่สามารถโหลดข้อมูลโภชนาการได้');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [mealDate]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(async ({ mealType, servingId, quantity = 1 }) => {
    try {
      setError(null);
      await addMealItem({ mealDate, mealType, servingId, quantity });
      await refresh();
    } catch (err) {
      const message = err.message || 'ไม่สามารถเพิ่มรายการอาหารได้';
      if (isMountedRef.current) {
        setError(message);
      }
      throw new Error(message);
    }
  }, [mealDate, refresh]);

  const updateItemQuantity = useCallback(async ({ itemId, quantity }) => {
    try {
      setError(null);
      await updateMealItemQuantity({ itemId, quantity });
      await refresh();
    } catch (err) {
      const message = err.message || 'ไม่สามารถอัปเดตรายการอาหารได้';
      if (isMountedRef.current) {
        setError(message);
      }
      throw new Error(message);
    }
  }, [refresh]);

  const removeItem = useCallback(async (itemId) => {
    try {
      setError(null);
      await deleteMealItem(itemId);
      await refresh();
    } catch (err) {
      const message = err.message || 'ไม่สามารถลบรายการอาหารได้';
      if (isMountedRef.current) {
        setError(message);
      }
      throw new Error(message);
    }
  }, [refresh]);

  return {
    data,
    loading,
    error,
    refresh,
    addItem,
    updateItemQuantity,
    removeItem,
  };
}
