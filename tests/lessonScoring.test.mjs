import { test } from 'node:test';
import assert from 'node:assert/strict';
import { accuracyFromRatings, starsFromAccuracy } from '../src/services/lessonScoring.mjs';
import { RATING } from '../src/utils/constants.js';

test('converts easy rating ratio into lesson stars', () => {
  assert.equal(starsFromAccuracy(0.8), 3);
  assert.equal(starsFromAccuracy(0.5), 2);
  assert.equal(starsFromAccuracy(0.49), 1);
});

test('computes accuracy from easy ratings only', () => {
  const accuracy = accuracyFromRatings([
    RATING.EASY,
    RATING.MEDIUM,
    RATING.EASY,
    RATING.HARD,
  ]);

  assert.equal(accuracy, 0.5);
});

test('handles an empty rating list as zero accuracy and one star', () => {
  assert.equal(accuracyFromRatings([]), 0);
  assert.equal(starsFromAccuracy(0), 1);
});
