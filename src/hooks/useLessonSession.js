// saflash — Fixed-card guided lesson session hook.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getLessonCards, completeLesson } from '../database/lessonsRepository';
import { getProgress, upsertProgress } from '../database/progressRepository';
import { saveSession, incrementTotalStudied, updateStreak, setCurrentLesson } from '../database/sessionRepository';
import { calculateNextReview, getDefaultProgress } from '../services/spacedRepetition';
import { scoreLesson } from '../services/lessonScoring.mjs';
import { RATING } from '../utils/constants';

export function useLessonSession(lessonId) {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(null);
  const [sessionStart, setSessionStart] = useState(Date.now());

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const lessonCards = await getLessonCards(lessonId);
      setCards(lessonCards);
      setCurrentIndex(0);
      setRatings([]);
      setCompleted(null);
      setSessionStart(Date.now());
    } catch (err) {
      console.error('Error loading lesson:', err);
      setError('No se pudo cargar la lección.');
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => ({
    easy: ratings.filter(r => r === RATING.EASY).length,
    medium: ratings.filter(r => r === RATING.MEDIUM).length,
    hard: ratings.filter(r => r === RATING.HARD).length,
  }), [ratings]);

  const scoreCard = useCallback(async (rating) => {
    const card = cards[currentIndex];
    if (!card) return;

    const progress = await getProgress(card.card_type, card.id);
    const updatedProgress = calculateNextReview(progress || getDefaultProgress(), rating);
    await upsertProgress(card.card_type, card.id, updatedProgress);

    const nextRatings = [...ratings, rating];
    setRatings(nextRatings);

    if (currentIndex + 1 < cards.length) {
      setCurrentIndex(index => index + 1);
      return;
    }

    const scored = scoreLesson(nextRatings);
    const { nextLessonId } = await completeLesson(lessonId, scored.accuracy, scored.stars);
    if (nextLessonId) await setCurrentLesson(nextLessonId);

    const durationSecs = Math.floor((Date.now() - sessionStart) / 1000);
    await saveSession({
      session_date: new Date().toISOString().split('T')[0],
      session_type: 'lesson',
      cards_studied: nextRatings.length,
      cards_correct: nextRatings.filter(r => r === RATING.EASY).length,
      cards_medium: nextRatings.filter(r => r === RATING.MEDIUM).length,
      cards_hard: nextRatings.filter(r => r === RATING.HARD).length,
      duration_secs: durationSecs,
    });
    await incrementTotalStudied(nextRatings.length);
    await updateStreak();

    setCurrentIndex(cards.length);
    setCompleted({ ...scored, durationSecs, nextLessonId });
  }, [cards, currentIndex, lessonId, ratings, sessionStart]);

  return {
    cards,
    currentCard: cards[currentIndex] || null,
    currentIndex,
    totalCards: cards.length,
    loading,
    error,
    stats,
    completed,
    isComplete: !!completed,
    scoreCard,
    reload: load,
  };
}
