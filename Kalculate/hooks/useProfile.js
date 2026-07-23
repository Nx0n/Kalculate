import { useCallback, useEffect, useRef, useState } from 'react';
import { getMyProfile, addWeightLog, getWeightHistory, updateMyProfile } from '../services/profileService';

// hook นี้จัดการข้อมูลโปรไฟล์และประวัติน้ำหนักของผู้ใช้
export default function useProfile(enabled = true) {
  const [profile, setProfile] = useState(null);
  const [weightHistory, setWeightHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!enabled) {
      if (isMountedRef.current) {
        setProfile(null);
        setWeightHistory([]);
        setError(null);
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [profileData, historyData] = await Promise.all([getMyProfile(), getWeightHistory({ limit: 30 })]);
      if (isMountedRef.current) {
        setProfile(profileData);
        setWeightHistory(historyData);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'ไม่สามารถโหลดข้อมูลโปรไฟล์ได้');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [enabled]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const saveProfile = useCallback(async (profileData) => {
    try {
      setError(null);
      const updatedProfile = await updateMyProfile(profileData);
      if (isMountedRef.current) {
        setProfile(updatedProfile);
      }
      return updatedProfile;
    } catch (err) {
      const message = err.message || 'บันทึกข้อมูลโปรไฟล์ไม่สำเร็จ';
      if (isMountedRef.current) {
        setError(message);
      }
      throw new Error(message);
    }
  }, []);

  const addWeight = useCallback(async ({ weightKg, loggedAt }) => {
    try {
      setError(null);
      const result = await addWeightLog({ weightKg, loggedAt });
      const nextHistory = await getWeightHistory({ limit: 30 });
      if (isMountedRef.current) {
        setWeightHistory(nextHistory);
        setProfile((currentProfile) => currentProfile ? { ...currentProfile, current_weight_kg: result.weightKg } : currentProfile);
      }
      return result;
    } catch (err) {
      const message = err.message || 'บันทึกน้ำหนักไม่สำเร็จ';
      if (isMountedRef.current) {
        setError(message);
      }
      throw new Error(message);
    }
  }, []);

  return {
    profile,
    loading,
    error,
    refreshProfile,
    saveProfile,
    addWeight,
    weightHistory,
  };
}
