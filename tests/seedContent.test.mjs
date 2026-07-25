import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS } from '../src/utils/levels.mjs';
import { WORDS_BY_LEVEL, WORDS_SEED } from '../src/seeds/words/index.mjs';
import { PHRASES_BY_LEVEL, PHRASES_SEED } from '../src/seeds/phrases/index.mjs';
import { CAT_IMG } from '../src/seeds/wordExpander.mjs';
import { CURRICULUM, TOTAL_LESSONS, WORDS_PER_LESSON, PHRASES_PER_LESSON } from '../src/curriculum/curriculum.mjs';
import { planLessons } from '../src/curriculum/curriculumBuilder.mjs';

const WORD_MINIMUMS = { A1: 500, A2: 550, B1: 550, B2: 450, C1: 450 };
const PHRASE_MINIMUMS = { A1: 220, A2: 220, B1: 200, B2: 140, C1: 120 };

function countByCategory(rows) {
  return rows.reduce((counts, row) => {
    counts[row.category] = (counts[row.category] || 0) + 1;
    return counts;
  }, {});
}

test('meets the content volume promised by the level path spec', () => {
  for (const level of LEVELS) {
    assert.ok(
      WORDS_BY_LEVEL[level].length >= WORD_MINIMUMS[level],
      `${level} should have at least ${WORD_MINIMUMS[level]} words`
    );
    assert.ok(
      PHRASES_BY_LEVEL[level].length >= PHRASE_MINIMUMS[level],
      `${level} should have at least ${PHRASE_MINIMUMS[level]} phrases`
    );
  }

  assert.ok(WORDS_SEED.length >= 2500);
  assert.ok(PHRASES_SEED.length >= 900);
});

test('has no duplicate word or phrase keys across levels', () => {
  const wordKeys = WORDS_SEED.map(word => word.english_word.toLowerCase());
  const phraseKeys = PHRASES_SEED.map(phrase => phrase.phrase_en.toLowerCase());

  assert.equal(new Set(wordKeys).size, wordKeys.length);
  assert.equal(new Set(phraseKeys).size, phraseKeys.length);
});

test('provides category imagery and required fields for all seed records', () => {
  for (const word of WORDS_SEED) {
    assert.ok(word.english_word);
    assert.ok(word.spanish_trans);
    assert.ok(word.category);
    assert.ok(LEVELS.includes(word.difficulty));
    assert.ok(CAT_IMG[word.category], `Missing CAT_IMG for ${word.category}`);
  }

  for (const phrase of PHRASES_SEED) {
    assert.ok(phrase.phrase_en);
    assert.ok(phrase.phrase_es);
    assert.ok(phrase.category);
    assert.ok(LEVELS.includes(phrase.difficulty));
    assert.ok(CAT_IMG[phrase.category], `Missing CAT_IMG for ${phrase.category}`);
  }
});

test('has enough content in every curriculum category without fallback warnings', () => {
  for (const level of LEVELS) {
    const wordsByCategory = countByCategory(WORDS_BY_LEVEL[level]);
    const phrasesByCategory = countByCategory(PHRASES_BY_LEVEL[level]);

    for (const unit of CURRICULUM[level]) {
      assert.ok(
        wordsByCategory[unit.category] >= unit.lessons * WORDS_PER_LESSON,
        `${level} ${unit.category} lacks words`
      );
      assert.ok(
        phrasesByCategory[unit.category] >= unit.lessons * PHRASES_PER_LESSON,
        `${level} ${unit.category} lacks phrases`
      );
    }
  }

  const planned = planLessons(CURRICULUM, WORDS_BY_LEVEL, PHRASES_BY_LEVEL);
  assert.equal(planned.warnings.length, 0);
  assert.equal(planned.lessons.length, TOTAL_LESSONS);
});

test('plans lessons with fixed card counts and no reused cards', () => {
  const { lessons } = planLessons(CURRICULUM, WORDS_BY_LEVEL, PHRASES_BY_LEVEL);
  const words = lessons.flatMap(lesson => lesson.words);
  const phrases = lessons.flatMap(lesson => lesson.phrases);

  for (const lesson of lessons) {
    assert.equal(lesson.words.length, WORDS_PER_LESSON);
    assert.equal(lesson.phrases.length, PHRASES_PER_LESSON);
  }

  assert.equal(new Set(words).size, words.length);
  assert.equal(new Set(phrases).size, phrases.length);
});
