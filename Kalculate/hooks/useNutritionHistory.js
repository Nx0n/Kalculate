import { useCallback, useEffect, useRef, useState } from 'react';
import { getNutritionHistory } from '../services/mealService';

export default function useNutritionHistory({ startDate, endDate }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => () => { isMounted.current = false; }, []);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNutritionHistory({ startDate, endDate });
      if (isMounted.current) setHistory(data);
    } catch (err) {
      if (isMounted.current) setError(err.message || 'ไม่สามารถโหลดประวัติได้');
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => { refresh(); }, [refresh]);
  return { history, loading, error, refresh };
}
