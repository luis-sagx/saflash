// saflash — SM-2 Spaced Repetition Algorithm
// Based on SuperMemo SM-2, adapted for flashcard rating

/**
 * Calculates the next review date and updated SM-2 values.
 *
 * @param {Object} progress - Current user_progress record
 * @param {number} progress.ease_factor - Current ease factor (default 2.5)
 * @param {number} progress.interval_days - Current interval in days
 * @param {number} progress.repetitions - Number of successful repetitions
 * @param {number} progress.correct_count - Total correct answers
 * @param {number} progress.wrong_count - Total wrong answers
 * @param {number} rating - User rating: 1 = Difícil (hard), 2 = Bien (medium), 3 = Fácil (easy)
 * @returns {Object} Updated progress fields
 */
export function calculateNextReview(progress, rating) {
  let {
    ease_factor = 2.5,
    interval_days = 1,
    repetitions = 0,
    correct_count = 0,
    wrong_count = 0,
  } = progress;

  if (rating === 1) {
    // ── Hard: reset interval, decrease ease factor ──
    repetitions = 0;
    interval_days = 1;
    ease_factor = Math.max(1.3, ease_factor - 0.2);
    wrong_count += 1;
  } else if (rating === 2) {
    // ── Medium: normal progression ──
    repetitions += 1;
    if (repetitions === 1) {
      interval_days = 1;
    } else if (repetitions === 2) {
      interval_days = 6;
    } else {
      interval_days = Math.round(interval_days * ease_factor);
    }
    correct_count += 1;
    // ease_factor stays the same for medium rating
  } else if (rating === 3) {
    // ── Easy: accelerated progression ──
    repetitions += 1;
    interval_days = Math.round(interval_days * ease_factor * 1.3);
    ease_factor = Math.min(3.0, ease_factor + 0.1);
    correct_count += 1;
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval_days);

  // Determine card status
  const newStatus =
    rating === 1
      ? 'learning'
      : repetitions >= 3 && rating === 3
        ? 'known'
        : 'reviewing';

  return {
    status: newStatus,
    ease_factor: Math.round(ease_factor * 100) / 100,
    interval_days,
    repetitions,
    next_review: nextReview.toISOString().split('T')[0],
    last_review: new Date().toISOString().split('T')[0],
    correct_count,
    wrong_count,
  };
}

/**
 * Determines which cards are due for review today.
 * Used for badge/notification logic outside the session loading query.
 */
export function isDue(progress) {
  if (!progress || progress.status === 'new') {
    return true;
  }
  if (!progress.next_review) {
    return true;
  }
  const today = new Date().toISOString().split('T')[0];
  return progress.next_review <= today;
}

/**
 * SM-2 default values for a brand new card (never studied).
 */
export function getDefaultProgress() {
  return {
    status: 'new',
    ease_factor: 2.5,
    interval_days: 1,
    repetitions: 0,
    next_review: null,
    last_review: null,
    correct_count: 0,
    wrong_count: 0,
    is_favorite: 0,
  };
}
