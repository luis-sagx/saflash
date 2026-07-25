import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planLessons } from '../src/curriculum/curriculumBuilder.mjs';

function words(n, category, level) {
  return Array.from({ length: n }, (_, i) => ({
    english_word: `${category}-w${i}`,
    category,
    difficulty: level,
    frequency_rank: i + 1,
  }));
}

function phrases(n, category, level) {
  return Array.from({ length: n }, (_, i) => ({
    phrase_en: `${category}-p${i}`,
    category,
    difficulty: level,
    frequency_rank: i + 1,
  }));
}

const CURRICULUM = {
  A1: [{ title: 'Saludos', icon: '👋', category: 'greetings', lessons: 2 }],
};

test('splits content into lessons of 8 words and 2 phrases', () => {
  const { lessons, warnings } = planLessons(
    CURRICULUM,
    { A1: words(16, 'greetings', 'A1') },
    { A1: phrases(4, 'greetings', 'A1') }
  );

  assert.equal(warnings.length, 0);
  assert.equal(lessons.length, 2);
  assert.equal(lessons[0].words.length, 8);
  assert.equal(lessons[0].phrases.length, 2);
  assert.deepEqual(lessons[0].words, [
    'greetings-w0', 'greetings-w1', 'greetings-w2', 'greetings-w3',
    'greetings-w4', 'greetings-w5', 'greetings-w6', 'greetings-w7',
  ]);
  assert.deepEqual(lessons[0].phrases, ['greetings-p0', 'greetings-p1']);
});

test('does not reuse a card across lessons', () => {
  const { lessons } = planLessons(
    CURRICULUM,
    { A1: words(16, 'greetings', 'A1') },
    { A1: phrases(4, 'greetings', 'A1') }
  );

  const all = lessons.flatMap(l => l.words);
  assert.equal(new Set(all).size, all.length);
});

test('carries unit metadata and indexes onto every lesson', () => {
  const { lessons } = planLessons(
    CURRICULUM,
    { A1: words(16, 'greetings', 'A1') },
    { A1: phrases(4, 'greetings', 'A1') }
  );

  assert.equal(lessons[0].level, 'A1');
  assert.equal(lessons[0].unit_index, 0);
  assert.equal(lessons[0].lesson_index, 0);
  assert.equal(lessons[1].lesson_index, 1);
  assert.equal(lessons[0].unit_title, 'Saludos');
  assert.equal(lessons[0].icon, '👋');
  assert.equal(lessons[0].category, 'greetings');
});

test('falls back to other categories and warns when a category runs dry', () => {
  const { lessons, warnings } = planLessons(
    CURRICULUM,
    { A1: [...words(8, 'greetings', 'A1'), ...words(8, 'other', 'A1')] },
    { A1: [...phrases(2, 'greetings', 'A1'), ...phrases(2, 'other', 'A1')] }
  );

  assert.equal(lessons.length, 2);
  assert.equal(lessons[1].words.length, 8);
  assert.ok(warnings.length > 0);
  assert.match(warnings[0], /greetings/);
});

test('drops a lesson entirely when there is not enough content anywhere', () => {
  const { lessons, warnings } = planLessons(
    CURRICULUM,
    { A1: words(8, 'greetings', 'A1') },
    { A1: phrases(2, 'greetings', 'A1') }
  );

  assert.equal(lessons.length, 1);
  assert.ok(warnings.some(w => /not enough/i.test(w)));
});
