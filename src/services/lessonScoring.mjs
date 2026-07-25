// saflash — Pure lesson scoring helpers.
import { RATING } from '../utils/constants.js';

export function accuracyFromRatings(ratings) {
  if (!ratings.length) return 0;
  const easy = ratings.filter(rating => rating === RATING.EASY).length;
  return easy / ratings.length;
}

export function starsFromAccuracy(accuracy) {
  if (accuracy >= 0.8) return 3;
  if (accuracy >= 0.5) return 2;
  return 1;
}

export function scoreLesson(ratings) {
  const accuracy = accuracyFromRatings(ratings);
  return {
    accuracy,
    stars: starsFromAccuracy(accuracy),
  };
}
