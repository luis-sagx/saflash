import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getLevelSuggestion } from '../src/services/levelAdjustment.mjs';

test('suggests moving up after three very easy lessons', () => {
  assert.deepEqual(
    getLevelSuggestion({ level: 'A2', recentAccuracies: [0.95, 0.9, 1], completedCount: 7, dismissedAt: -1 }),
    { direction: 'up', level: 'B1' }
  );
});

test('suggests moving down after three difficult lessons', () => {
  assert.deepEqual(
    getLevelSuggestion({ level: 'B1', recentAccuracies: [0.4, 0.35, 0.2], completedCount: 7, dismissedAt: -1 }),
    { direction: 'down', level: 'A2' }
  );
});

test('does not suggest at the bounds or within ten dismissed lessons', () => {
  assert.equal(
    getLevelSuggestion({ level: 'C1', recentAccuracies: [1, 1, 1], completedCount: 11, dismissedAt: -1 }),
    null
  );
  assert.equal(
    getLevelSuggestion({ level: 'B1', recentAccuracies: [1, 1, 1], completedCount: 15, dismissedAt: 10 }),
    null
  );
});

test('does not suggest with fewer than three completed lesson accuracies', () => {
  assert.equal(
    getLevelSuggestion({ level: 'B1', recentAccuracies: [1, 1], completedCount: 2, dismissedAt: -1 }),
    null
  );
});

test('does not suggest when recent performance is in the middle band', () => {
  assert.equal(
    getLevelSuggestion({ level: 'B1', recentAccuracies: [0.7, 0.6, 0.5], completedCount: 3, dismissedAt: -1 }),
    null
  );
});
