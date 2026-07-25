// saflash — Pure placement test generation and scoring.
import { LEVELS } from '../utils/levels.mjs';

const QUESTIONS_PER_LEVEL = 2;
const OPTIONS_PER_QUESTION = 4;

function byRank(words) {
  return [...words].sort((a, b) => (a.frequency_rank || 0) - (b.frequency_rank || 0));
}

function distractorsFor(answer, pool) {
  const sameCategory = pool.filter(
    word => word.english_word !== answer.english_word && word.category === answer.category
  );
  const fallback = pool.filter(word => word.english_word !== answer.english_word);
  return [...sameCategory, ...fallback]
    .filter((word, index, arr) => arr.findIndex(w => w.spanish_trans === word.spanish_trans) === index)
    .slice(0, OPTIONS_PER_QUESTION - 1)
    .map(word => word.spanish_trans);
}

function rotateOptions(options, seed) {
  const copy = [...options];
  const offset = seed % copy.length;
  return [...copy.slice(offset), ...copy.slice(0, offset)];
}

export function buildPlacementQuestions(wordsByLevel) {
  const questions = [];

  for (const level of LEVELS) {
    const pool = byRank(wordsByLevel[level] || []);
    const candidates = pool.slice(0, QUESTIONS_PER_LEVEL);

    candidates.forEach((answer, index) => {
      const options = [answer.spanish_trans, ...distractorsFor(answer, pool)].slice(0, OPTIONS_PER_QUESTION);
      if (options.length < OPTIONS_PER_QUESTION) return;
      questions.push({
        id: `${level}-${index}`,
        level,
        prompt: answer.english_word,
        answer: answer.spanish_trans,
        options: rotateOptions(options, index + level.length),
      });
    });
  }

  return questions;
}

export function scorePlacement(answersByLevel) {
  let highest = 'A1';

  for (const level of LEVELS) {
    const answers = answersByLevel[level] || [];
    const passed = answers.filter(Boolean).length >= 1;
    if (!passed) break;
    highest = level;
  }

  return highest;
}
