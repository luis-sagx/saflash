// saflash — Study session hook
import { useState, useCallback, useEffect } from 'react';
import { getWordsForStudy } from '../database/wordsRepository';
import { upsertProgress, getProgress } from '../database/progressRepository';
import { saveSession, incrementTotalStudied, updateStreak } from '../database/sessionRepository';
import { calculateNextReview, getDefaultProgress } from '../services/spacedRepetition';
import useAppStore from '../store/appStore';
import { CARD_TYPE, RATING } from '../utils/constants';

export function useStudySession(cardType = CARD_TYPE.WORD, sessionSize = 20, category = null) {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionStats, setSessionStats] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
    sessionStart: null,
  });

  const startSession = useAppStore(s => s.startSession);

  const loadCards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const sessionCards = await getWordsForStudy(cardType, sessionSize, category);
      setCards(sessionCards);
      setCurrentIndex(0);
      setSessionStats({
        easy: 0,
        medium: 0,
        hard: 0,
        sessionStart: Date.now(),
      });

      if (sessionCards.length > 0) {
        startSession(cardType, sessionCards);
      }
    } catch (err) {
      setError('No se pudieron cargar las tarjetas. Verificá que la base de datos esté inicializada.');
      console.error('Error loading study cards:', err);
    } finally {
      setLoading(false);
    }
  }, [cardType, sessionSize, category, startSession]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const currentCard = cards[currentIndex] || null;
  const totalCards = cards.length;
  const isLastCard = currentIndex >= totalCards - 1;
  const isComplete = currentIndex >= totalCards;

  const scoreCard = useCallback(async (rating) => {
    if (!currentCard) return;

    // Get or create progress record
    let progress = await getProgress(cardType, currentCard.id);
    const baseProgress = progress || getDefaultProgress();

    // Calculate new SM-2 values
    const updatedProgress = calculateNextReview(baseProgress, rating);

    // Save to database
    await upsertProgress(cardType, currentCard.id, updatedProgress);

    // Update session stats
    setSessionStats(prev => ({
      ...prev,
      easy: rating === RATING.EASY ? prev.easy + 1 : prev.easy,
      medium: rating === RATING.MEDIUM ? prev.medium + 1 : prev.medium,
      hard: rating === RATING.HARD ? prev.hard + 1 : prev.hard,
    }));

    // Advance to next card
    if (!isLastCard) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(prev => prev + 1); // Will trigger isComplete
    }
  }, [currentCard, cardType, isLastCard]);

  const finishSession = useCallback(async () => {
    const durationSecs = Math.floor(
      (Date.now() - (sessionStats.sessionStart || Date.now())) / 1000
    );
    const totalStudied = sessionStats.easy + sessionStats.medium + sessionStats.hard;

    if (totalStudied === 0) return;

    // Save session record
    await saveSession({
      session_date: new Date().toISOString().split('T')[0],
      session_type: cardType,
      cards_studied: totalStudied,
      cards_correct: sessionStats.easy,
      cards_medium: sessionStats.medium,
      cards_hard: sessionStats.hard,
      duration_secs: durationSecs,
    });

    // Update global stats
    await incrementTotalStudied(totalStudied);
    await updateStreak();
  }, [sessionStats, cardType]);

  const resetSession = useCallback(() => {
    setCurrentIndex(0);
    setCards([]);
    setSessionStats({ easy: 0, medium: 0, hard: 0, sessionStart: null });
    loadCards();
  }, [loadCards]);

  return {
    cards,
    currentCard,
    currentIndex,
    totalCards,
    loading,
    error,
    sessionStats,
    isLastCard,
    isComplete,
    scoreCard,
    finishSession,
    resetSession,
    loadCards,
  };
}
