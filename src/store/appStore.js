// saflash — Zustand global store
import { create } from 'zustand';

const useAppStore = create((set, get) => ({
  // ── User ──────────────────────────────────
  onboardingDone: false,
  setOnboardingDone: (done) => set({ onboardingDone: done }),

  // ── Study Session ─────────────────────────
  currentSession: null, // { type: 'word'|'phrase', cards: [], currentIndex: 0 }
  startSession: (sessionType, cards) =>
    set({
      currentSession: {
        type: sessionType,
        cards,
        currentIndex: 0,
        ratings: [],
        startTime: Date.now(),
      },
    }),

  advanceCard: (rating) => {
    const { currentSession } = get();
    if (!currentSession) return;
    const ratings = [...currentSession.ratings, rating];
    if (currentSession.currentIndex + 1 >= currentSession.cards.length) {
      // Session complete
      set({
        currentSession: {
          ...currentSession,
          ratings,
          completed: true,
          endTime: Date.now(),
        },
      });
    } else {
      set({
        currentSession: {
          ...currentSession,
          currentIndex: currentSession.currentIndex + 1,
          ratings,
        },
      });
    }
  },

  clearSession: () => set({ currentSession: null }),

  // ── Config cache ──────────────────────────
  dailyGoal: 20,
  setDailyGoal: (goal) => set({ dailyGoal: goal }),

  notifications: true,
  setNotifications: (enabled) => set({ notifications: enabled }),

  soundEnabled: true,
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),

  // ── Stats cache (updated after study) ─────
  streakDays: 0,
  setStreakDays: (days) => set({ streakDays: days }),

  totalStudied: 0,
  setTotalStudied: (total) => set({ totalStudied: total }),

  todayCards: 0,
  setTodayCards: (count) => set({ todayCards: count }),
}));

export default useAppStore;
