// saflash — Suggests manual CEFR level adjustments from recent performance.
import { nextLevel, prevLevel } from '../utils/levels.mjs';

const WINDOW = 3;
const UP_THRESHOLD = 0.9;
const DOWN_THRESHOLD = 0.4;
const DISMISS_SILENCE_LESSONS = 10;

export function getLevelSuggestion({ level, recentAccuracies, completedCount, dismissedAt = -1 }) {
  if (!recentAccuracies || recentAccuracies.length < WINDOW) return null;
  if (dismissedAt >= 0 && completedCount - dismissedAt < DISMISS_SILENCE_LESSONS) return null;

  const window = recentAccuracies.slice(0, WINDOW);
  const average = window.reduce((sum, value) => sum + value, 0) / window.length;

  if (average >= UP_THRESHOLD) {
    const target = nextLevel(level);
    return target ? { direction: 'up', level: target } : null;
  }

  if (average <= DOWN_THRESHOLD) {
    const target = prevLevel(level);
    return target ? { direction: 'down', level: target } : null;
  }

  return null;
}
