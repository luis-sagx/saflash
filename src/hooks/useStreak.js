// saflash — Streak hook
import { useState, useEffect, useCallback } from 'react';
import { getConfig, updateStreak as updateStreakDB } from '../database/sessionRepository';
import useAppStore from '../store/appStore';

export function useStreak() {
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const setStreakDays = useAppStore(s => s.setStreakDays);

  const loadStreak = useCallback(async () => {
    try {
      const config = await getConfig();
      const days = config?.streak_days || 0;
      setStreak(days);
      setStreakDays(days);
    } catch (err) {
      console.error('Error loading streak:', err);
    } finally {
      setLoading(false);
    }
  }, [setStreakDays]);

  useEffect(() => {
    loadStreak();
  }, [loadStreak]);

  const checkAndUpdateStreak = useCallback(async () => {
    try {
      const newStreak = await updateStreakDB();
      setStreak(newStreak);
      setStreakDays(newStreak);
      return newStreak;
    } catch (err) {
      console.error('Error updating streak:', err);
      return streak;
    }
  }, [streak, setStreakDays]);

  return { streak, loading, checkAndUpdateStreak, refresh: loadStreak };
}
