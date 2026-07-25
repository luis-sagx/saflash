import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS } from '../src/utils/levels.mjs';
import { CURRICULUM } from '../src/curriculum/curriculum.mjs';
import { withSupplementalPhrases, withSupplementalWords } from '../src/seeds/supplementalContent.mjs';

function emptyByLevel() {
  return Object.fromEntries(LEVELS.map(level => [level, []]));
}

test('supplemental words do not mutate the source level arrays', () => {
  const source = emptyByLevel();
  const result = withSupplementalWords(source);

  assert.notEqual(result.A1, source.A1);
  assert.equal(source.A1.length, 0);
  assert.ok(result.A1.length > 0);
});

test('supplemental content fills every curriculum category when source is empty', () => {
  const words = withSupplementalWords(emptyByLevel());
  const phrases = withSupplementalPhrases(emptyByLevel());

  for (const level of LEVELS) {
    for (const unit of CURRICULUM[level]) {
      assert.equal(
        words[level].filter(row => row[2] === unit.category).length,
        unit.lessons * 8
      );
      assert.equal(
        phrases[level].filter(row => row[2] === unit.category).length,
        unit.lessons * 2
      );
    }
  }
});

test('supplemental content preserves existing rows before appended rows', () => {
  const source = emptyByLevel();
  source.A1 = [['hello', 'hola', 'greetings', null]];

  const result = withSupplementalWords(source);

  assert.deepEqual(result.A1[0], source.A1[0]);
  assert.ok(result.A1.some(row => row[2] === 'greetings' && row[0] !== 'hello'));
});
