// saflash — Turns curriculum plus seed content into planned lessons.
import { LEVELS } from '../utils/levels.mjs';
import { WORDS_PER_LESSON, PHRASES_PER_LESSON } from './curriculum.mjs';

function sortByRank(items) {
  return [...items].sort((a, b) => (a.frequency_rank || 0) - (b.frequency_rank || 0));
}

function take(pool, category, count, used, keyOf) {
  const picked = [];
  const categoryItems = pool.filter(item => item.category === category && !used.has(keyOf(item)));

  for (const item of categoryItems) {
    if (picked.length === count) break;
    picked.push(item);
    used.add(keyOf(item));
  }

  let fellBack = false;
  if (picked.length < count) {
    const rest = pool.filter(item => !used.has(keyOf(item)));
    for (const item of rest) {
      if (picked.length === count) break;
      picked.push(item);
      used.add(keyOf(item));
      fellBack = true;
    }
  }

  return { picked, fellBack };
}

export function planLessons(curriculum, wordsByLevel, phrasesByLevel) {
  const lessons = [];
  const warnings = [];

  for (const level of LEVELS) {
    const units = curriculum[level] || [];
    const wordPool = sortByRank(wordsByLevel[level] || []);
    const phrasePool = sortByRank(phrasesByLevel[level] || []);
    const usedWords = new Set();
    const usedPhrases = new Set();

    units.forEach((unit, unitIndex) => {
      for (let lessonIndex = 0; lessonIndex < unit.lessons; lessonIndex += 1) {
        const wordPick = take(wordPool, unit.category, WORDS_PER_LESSON, usedWords, w => w.english_word);
        const phrasePick = take(phrasePool, unit.category, PHRASES_PER_LESSON, usedPhrases, p => p.phrase_en);

        if (wordPick.picked.length < WORDS_PER_LESSON || phrasePick.picked.length < PHRASES_PER_LESSON) {
          warnings.push(
            `${level} ${unit.category} lesson ${lessonIndex + 1}: not enough content ` +
            `(${wordPick.picked.length}/${WORDS_PER_LESSON} words, ` +
            `${phrasePick.picked.length}/${PHRASES_PER_LESSON} phrases)`
          );
          continue;
        }

        if (wordPick.fellBack || phrasePick.fellBack) {
          warnings.push(`${level} ${unit.category} lesson ${lessonIndex + 1}: used fallback content`);
        }

        lessons.push({
          level,
          unit_index: unitIndex,
          lesson_index: lessonIndex,
          unit_title: unit.title,
          category: unit.category,
          icon: unit.icon,
          words: wordPick.picked.map(w => w.english_word),
          phrases: phrasePick.picked.map(p => p.phrase_en),
        });
      }
    });
  }

  return { lessons, warnings };
}
