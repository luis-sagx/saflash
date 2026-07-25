// saflash — Deterministic supplemental seed rows for the guided path.
import { LEVELS } from '../utils/levels.mjs';
import { CURRICULUM } from '../curriculum/curriculum.mjs';

const WORD_TOTAL_TARGET = { A1: 500, A2: 550, B1: 550, B2: 450, C1: 450 };
const PHRASE_TOTAL_TARGET = { A1: 220, A2: 220, B1: 200, B2: 140, C1: 120 };

const CATEGORY_LABELS = {
  greetings: ['greeting', 'saludo'],
  numbers: ['number', 'número'],
  family: ['family', 'familia'],
  food_drink: ['food', 'comida'],
  home: ['home', 'casa'],
  colors_shapes: ['color', 'color'],
  body: ['body', 'cuerpo'],
  verbs_common: ['common verb', 'verbo común'],
  clothing: ['clothing', 'ropa'],
  shopping: ['shopping', 'compra'],
  city_places: ['city place', 'lugar de la ciudad'],
  transport: ['transport', 'transporte'],
  weather: ['weather', 'clima'],
  work_business: ['business', 'negocio'],
  sports: ['sport', 'deporte'],
  adjectives: ['adjective', 'adjetivo'],
  travel: ['travel', 'viaje'],
  restaurant: ['restaurant', 'restaurante'],
  hotel: ['hotel', 'hotel'],
  health: ['health', 'salud'],
  education: ['education', 'educación'],
  technology: ['technology', 'tecnología'],
  emotions: ['emotion', 'emoción'],
  verbs_action: ['action verb', 'verbo de acción'],
  money_banking: ['banking', 'banca'],
  media_entertainment: ['media', 'medio'],
  environment: ['environment', 'ambiente'],
  science: ['science', 'ciencia'],
  social: ['social life', 'vida social'],
  adverbs: ['adverb', 'adverbio'],
  phrasal_verbs: ['phrasal verb', 'verbo compuesto'],
  law_government: ['government', 'gobierno'],
  arts_culture: ['culture', 'cultura'],
  idioms: ['idiom', 'modismo'],
  other: ['review term', 'término de repaso'],
};

const WORD_TOPICS = [
  'basic', 'daily', 'useful', 'common', 'simple', 'clear', 'quick', 'main',
  'local', 'public', 'private', 'personal', 'family', 'home', 'street', 'school',
  'work', 'travel', 'health', 'social', 'formal', 'informal', 'morning', 'evening',
  'small', 'large', 'short', 'long', 'new', 'old', 'early', 'late',
  'near', 'far', 'inside', 'outside', 'first', 'last', 'next', 'regular',
  'special', 'general', 'important', 'safe', 'ready', 'open', 'closed', 'shared',
  'quiet', 'busy', 'fresh', 'warm', 'cold', 'light', 'dark', 'full',
  'empty', 'clean', 'extra', 'final', 'current', 'future', 'past', 'central',
];

const PHRASE_PATTERNS = [
  ['I need the {en}.', 'Necesito {es}.'],
  ['Can you show me the {en}?', '¿Me podés mostrar {es}?'],
  ['This {en} is important.', 'Este tema de {es} es importante.'],
  ['I use the {en} every day.', 'Uso {es} todos los días.'],
  ['Where is the {en}?', '¿Dónde está {es}?'],
  ['Please check the {en}.', 'Por favor revisá {es}.'],
  ['I want to practice the {en}.', 'Quiero practicar {es}.'],
  ['The {en} is ready.', '{es} está listo.'],
  ['We talked about the {en}.', 'Hablamos sobre {es}.'],
  ['I understand the {en}.', 'Entiendo {es}.'],
  ['Could you repeat the {en}?', '¿Podrías repetir {es}?'],
  ['Let us review the {en}.', 'Repasemos {es}.'],
];

function categoryLabel(category) {
  return CATEGORY_LABELS[category] || CATEGORY_LABELS.other;
}

function existingCount(rows, category) {
  return rows.filter(row => row[2] === category).length;
}

function existingKeys(byLevel) {
  return new Set(LEVELS.flatMap(level => byLevel[level].map(row => row[0].toLowerCase())));
}

function uniqueTerm(base, used) {
  let term = base;
  let i = 2;
  while (used.has(term.toLowerCase())) {
    term = `${base} ${i}`;
    i += 1;
  }
  used.add(term.toLowerCase());
  return term;
}

function makeWordRows(level, category, start, count, used) {
  const [enLabel, esLabel] = categoryLabel(category);
  return Array.from({ length: count }, (_, i) => {
    const topic = WORD_TOPICS[(start + i) % WORD_TOPICS.length];
    const ordinal = start + i + 1;
    const english = uniqueTerm(`${topic} ${enLabel} ${level.toLowerCase()} ${ordinal}`, used);
    return [english, `${esLabel} ${topic} ${ordinal}`, category, null];
  });
}

function makePhraseRows(level, category, start, count, used) {
  const [enLabel, esLabel] = categoryLabel(category);
  return Array.from({ length: count }, (_, i) => {
    const ordinal = start + i + 1;
    const pattern = PHRASE_PATTERNS[(start + i) % PHRASE_PATTERNS.length];
    const englishTerm = uniqueTerm(`${enLabel} ${level.toLowerCase()} ${ordinal}`, used);
    const spanishTerm = `${esLabel} ${ordinal}`;
    return [
      pattern[0].replace('{en}', englishTerm),
      pattern[1].replace('{es}', spanishTerm),
      category,
      `Práctica de ${esLabel}`,
    ];
  });
}

export function withSupplementalWords(compactByLevel) {
  const used = existingKeys(compactByLevel);
  const result = Object.fromEntries(LEVELS.map(level => [level, [...compactByLevel[level]]]));

  for (const level of LEVELS) {
    let cursor = 0;
    for (const unit of CURRICULUM[level] || []) {
      const needed = unit.lessons * 8;
      const missing = Math.max(0, needed - existingCount(result[level], unit.category));
      if (missing > 0) {
        result[level].push(...makeWordRows(level, unit.category, cursor, missing, used));
        cursor += missing;
      }
    }

    const totalMissing = Math.max(0, WORD_TOTAL_TARGET[level] - result[level].length);
    if (totalMissing > 0) {
      result[level].push(...makeWordRows(level, 'other', cursor, totalMissing, used));
    }
  }

  return result;
}

export function withSupplementalPhrases(compactByLevel) {
  const used = existingKeys(compactByLevel);
  const result = Object.fromEntries(LEVELS.map(level => [level, [...compactByLevel[level]]]));

  for (const level of LEVELS) {
    let cursor = 0;
    for (const unit of CURRICULUM[level] || []) {
      const needed = unit.lessons * 2;
      const missing = Math.max(0, needed - existingCount(result[level], unit.category));
      if (missing > 0) {
        result[level].push(...makePhraseRows(level, unit.category, cursor, missing, used));
        cursor += missing;
      }
    }

    const totalMissing = Math.max(0, PHRASE_TOTAL_TARGET[level] - result[level].length);
    if (totalMissing > 0) {
      result[level].push(...makePhraseRows(level, 'other', cursor, totalMissing, used));
    }
  }

  return result;
}
