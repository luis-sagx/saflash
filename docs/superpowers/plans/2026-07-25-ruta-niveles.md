# Ruta de niveles y expansión de contenido — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir saflash en un recorrido guiado por niveles A1–C1, con selección de nivel en el onboarding, lecciones desbloqueables con estrellas, cambio de nivel a pedido, y contenido expandido a ~2.500 palabras y ~900 frases.

**Architecture:** La lógica pura (planificación de lecciones, test de ubicación, puntaje, ajuste de nivel) vive en módulos `.mjs` sin dependencias de React Native ni de SQLite, y se prueba con `node --test`. El acceso a datos queda en repositorios que consumen esa lógica. La ruta se materializa una vez en las tablas `lessons` / `lesson_cards` durante el sembrado, de modo que el contenido de una lección nunca cambia después de creada.

**Tech Stack:** Expo SDK 56, React Native 0.85, React 19, expo-sqlite, zustand, React Navigation 7, `node --test` (nativo, sin dependencias nuevas).

## Desviación respecto del spec

El spec dejó fuera "infraestructura de testing automatizado". Este plan igual prueba la
lógica pura con `node --test`, que viene incluido en Node y no agrega ninguna dependencia
ni archivo de configuración. La exclusión del spec se interpreta como "no montar Jest ni
testing de componentes React Native", que sigue en pie: no hay tests de pantallas.

Si preferís cero tests, se pueden borrar los pasos de test de las tareas 9, 13, 16 y 20 —
el resto del plan no depende de ellos.

## Global Constraints

- Idioma de toda la interfaz: español rioplatense (voseo), consistente con el código actual ("Aprendé", "Seguí tu progreso").
- Comentarios de código en inglés, textos de UI en español. Es la convención vigente en el repo.
- Cero dependencias npm nuevas.
- Estilos siempre desde `src/theme/` (`COLORS`, `SPACING`, `RADIUS`, `SHADOW`, `FONT_FAMILY`). Nunca colores ni tamaños literales.
- Niveles válidos, en orden: `A1`, `A2`, `B1`, `B2`, `C1`.
- Tamaño de lección: 10 tarjetas = 8 palabras + 2 frases. Constantes `WORDS_PER_LESSON = 8`, `PHRASES_PER_LESSON = 2`, `LESSON_SIZE = 10`.
- Umbrales de estrellas sobre el ratio de calificaciones "Fácil": ≥ 0.80 → 3 estrellas, ≥ 0.50 → 2, resto → 1.
- Umbrales de sugerencia de nivel: ratio promedio de las últimas 3 lecciones ≥ 0.90 → sugerir subir, ≤ 0.40 → sugerir bajar. Descartar silencia por 10 lecciones.
- **Módulos `.mjs`:** todo archivo de lógica pura o de datos de semilla usa extensión `.mjs` y **extensiones explícitas en sus imports** (`import { LEVELS } from '../utils/levels.mjs'`). Node lo exige para ESM; Metro lo acepta sin problema (`mjs` está en los `sourceExts` por defecto de Expo). Los archivos `.jsx`/`.js` de React Native también importan estos módulos con la extensión explícita.
- Node 18 o superior para `node --test` (la máquina de desarrollo tiene v24.18.0).
- Migraciones de esquema siempre con `addColumnIfMissing` o `CREATE TABLE IF NOT EXISTS`. Nunca borrar ni recrear tablas con datos de usuario.
- Cada tarea termina en un commit. Mensajes en inglés, formato Conventional Commits.

## Estructura de archivos

**Lógica pura y datos (`.mjs`, probables con Node):**

| Archivo | Responsabilidad |
|---|---|
| `src/utils/levels.mjs` | Lista de niveles, etiquetas, `nextLevel` / `prevLevel` |
| `src/seeds/wordExpander.mjs` | Fonética aproximada, ejemplos, imágenes de categoría, expansión de filas compactas |
| `src/seeds/words/{a1,a2,b1,b2,c1}.mjs` | Datos compactos de palabras, un archivo por nivel |
| `src/seeds/words/index.mjs` | Concatena niveles, asigna `frequency_rank`, expone `WORDS_SEED` y `wordsForLevel` |
| `src/seeds/phrases/{a1,a2,b1,b2,c1}.mjs` | Datos compactos de frases, un archivo por nivel |
| `src/seeds/phrases/index.mjs` | Igual que el de palabras |
| `src/curriculum/curriculum.mjs` | Definición de unidades y lecciones por nivel |
| `src/curriculum/curriculumBuilder.mjs` | `planLessons`: reparte palabras y frases en lecciones. Sin base de datos |
| `src/services/placementService.mjs` | Genera el test de ubicación y calcula el nivel |
| `src/services/lessonScoring.mjs` | Ratio de "Fácil" → estrellas |
| `src/services/levelAdjustment.mjs` | Sugerencia de subir o bajar de nivel |

**Acceso a datos:**

| Archivo | Responsabilidad |
|---|---|
| `src/database/database.js` | *(modificado)* tablas y columnas nuevas |
| `src/database/lessonsRepository.js` | Persistir el curriculum, leer la ruta, completar lecciones |
| `src/database/sessionRepository.js` | *(modificado)* accesores de nivel |
| `src/seeds/seedRunner.js` | *(modificado)* sembrado por nivel + construcción del curriculum |

**UI:**

| Archivo | Responsabilidad |
|---|---|
| `src/screens/LevelPickScreen.jsx` | Elegir nivel, en onboarding o al cambiarlo |
| `src/screens/PlacementTestScreen.jsx` | Test de ubicación de 10 preguntas |
| `src/screens/PathScreen.jsx` | La ruta: unidades, nodos, botón Continuar |
| `src/screens/StudyLessonScreen.jsx` | Sesión de 10 tarjetas de una lección |
| `src/components/HomeHeader.jsx` | Saludo, racha, meta diaria, estadísticas (extraído de HomeScreen) |
| `src/components/LessonNode.jsx` | Nodo de lección: bloqueada / actual / completada |
| `src/components/UnitHeader.jsx` | Cabecera de unidad |
| `src/components/LevelSuggestionCard.jsx` | Tarjeta de sugerencia de cambio de nivel |
| `src/hooks/useLessonPath.js` | Carga la ruta y el estado de progreso |
| `src/hooks/useLessonSession.js` | Sesión de estudio con mazo fijo |
| `src/navigation/PathNavigator.jsx` | Stack de la pestaña Inicio: PathScreen + StudyLessonScreen |

**Verificación:**

| Archivo | Responsabilidad |
|---|---|
| `scripts/validate-content.mjs` | Chequea semillas y curriculum sin tocar la base |
| `tests/*.test.mjs` | Tests de la lógica pura |

**Eliminados:** `src/seeds/words_seed.js`, `src/seeds/phrases_seed.js`, `src/screens/HomeScreen.jsx`.

---

### Task 1: Reorganizar las semillas por nivel

Refactor puro: mismo contenido, otra estructura. Sin agregar ni una palabra. Así, si algo
se rompe, se sabe que fue la reorganización y no el contenido nuevo.

**Files:**
- Create: `src/utils/levels.mjs`
- Create: `src/seeds/wordExpander.mjs`
- Create: `src/seeds/words/{a1,a2,b1,b2,c1,index}.mjs`
- Create: `src/seeds/phrases/{a1,a2,b1,b2,c1,index}.mjs`
- Create: `scripts/validate-content.mjs`
- Modify: `src/seeds/seedRunner.js`
- Modify: `src/utils/constants.js`
- Modify: `package.json` (scripts)
- Delete: `src/seeds/words_seed.js`, `src/seeds/phrases_seed.js`

**Interfaces:**
- Produces:
  - `LEVELS: string[]`, `LEVEL_LABELS: Record<string,string>`, `nextLevel(level): string|null`, `prevLevel(level): string|null`, `levelIndex(level): number` — desde `src/utils/levels.mjs`
  - `CAT_IMG: Record<string,string>`, `guessPhonetic(word): string`, `makeExample(en, es): [string, string]`, `expandWord(row, level, rank): object` — desde `src/seeds/wordExpander.mjs`
  - `WORDS_SEED: object[]`, `WORDS_BY_LEVEL: Record<string, object[]>`, `wordsForLevel(level): object[]` — desde `src/seeds/words/index.mjs`
  - `PHRASES_SEED: object[]`, `PHRASES_BY_LEVEL: Record<string, object[]>`, `phrasesForLevel(level): object[]` — desde `src/seeds/phrases/index.mjs`

- [ ] **Step 1: Crear `src/utils/levels.mjs`**

```js
// saflash — CEFR level helpers (pure, shared by seeds and UI)

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];

export const LEVEL_LABELS = {
  A1: 'Principiante',
  A2: 'Básico',
  B1: 'Intermedio',
  B2: 'Intermedio alto',
  C1: 'Avanzado',
};

// Shown on the level picker: how the user describes themselves.
// Only these four are offered; C1 is reached through the test or from B2.
export const LEVEL_SELF_DESCRIPTIONS = {
  A1: 'Nunca estudié inglés',
  A2: 'Sé lo básico',
  B1: 'Me defiendo',
  B2: 'Nivel alto',
};

export function levelIndex(level) {
  return LEVELS.indexOf(level);
}

export function nextLevel(level) {
  const i = levelIndex(level);
  if (i < 0 || i === LEVELS.length - 1) return null;
  return LEVELS[i + 1];
}

export function prevLevel(level) {
  const i = levelIndex(level);
  if (i <= 0) return null;
  return LEVELS[i - 1];
}

export function isValidLevel(level) {
  return LEVELS.includes(level);
}
```

- [ ] **Step 2: Crear `src/seeds/wordExpander.mjs`**

Mover, sin cambios de lógica, `CAT_IMG`, `guessPhonetic` y `makeExample` desde
`src/seeds/words_seed.js` (líneas 5–87). Agregar al final `expandWord`:

```js
// saflash — Expands compact seed rows into full word records.
// Moved verbatim from the old words_seed.js: CAT_IMG, guessPhonetic, makeExample.

export const CAT_IMG = {
  // …copiar tal cual desde words_seed.js líneas 6-35…
};

export function guessPhonetic(word) {
  // …copiar tal cual desde words_seed.js líneas 38-74…
}

export function makeExample(en, es) {
  // …copiar tal cual desde words_seed.js líneas 81-87…
}

/**
 * @param {[string, string, string, string|null]} row - [english, spanish, category, subcategory]
 * @param {string} level - CEFR level, implied by the file the row lives in
 * @param {number} rank - global frequency_rank, assigned by the seed index
 */
export function expandWord(row, level, rank) {
  const [english, spanish, category, subcategory] = row;
  const [exEn, exEs] = makeExample(english, spanish);
  return {
    english_word: english,
    spanish_trans: spanish,
    phonetic: guessPhonetic(english),
    category,
    subcategory: subcategory || null,
    frequency_rank: rank,
    difficulty: level,
    // Left null on purpose: the per-word emoji shows immediately and a real
    // photo is fetched + cached on first view (see enrichmentService).
    image_url: null,
    audio_url: null,
    example_en: exEn,
    example_es: exEs,
  };
}

export function expandPhrase(row, level, rank) {
  const [phraseEn, phraseEs, category, context] = row;
  return {
    phrase_en: phraseEn,
    phrase_es: phraseEs,
    category,
    context: context || null,
    difficulty: level,
    image_url: CAT_IMG[category] || CAT_IMG.other,
    audio_url: null,
    frequency_rank: rank,
  };
}
```

- [ ] **Step 3: Repartir las palabras existentes en archivos por nivel**

Cada archivo exporta un arreglo de filas de **cuatro** elementos — el nivel ya no va en la
fila, lo da el archivo:

```js
// src/seeds/words/a1.mjs
// saflash — A1 words. Row format: [english, spanish, category, subcategory|null]

export const A1_WORDS = [
  ['A', 'vocal A', 'vowels', null],
  ['E', 'vocal E', 'vowels', null],
  ['zero', 'cero', 'numbers', null],
  ['one', 'uno', 'numbers', null],
  // …resto de las filas 'A1' de WORDS_COMPACT, en el mismo orden…
];
```

Repartí las 1.115 filas de `WORDS_COMPACT` según su quinto elemento (el nivel), sacando
ese quinto elemento, hacia `a1.mjs`, `a2.mjs`, `b1.mjs`, `b2.mjs`. `c1.mjs` arranca vacío:

```js
// src/seeds/words/c1.mjs
// saflash — C1 words. Row format: [english, spanish, category, subcategory|null]

export const C1_WORDS = [];
```

Preservá el orden relativo original dentro de cada nivel: de ahí sale `frequency_rank`, y
con él el orden de las lecciones.

- [ ] **Step 4: Crear `src/seeds/words/index.mjs`**

```js
// saflash — Word seed index: concatenates levels and assigns frequency ranks.
import { LEVELS } from '../../utils/levels.mjs';
import { expandWord } from '../wordExpander.mjs';
import { A1_WORDS } from './a1.mjs';
import { A2_WORDS } from './a2.mjs';
import { B1_WORDS } from './b1.mjs';
import { B2_WORDS } from './b2.mjs';
import { C1_WORDS } from './c1.mjs';

export const WORDS_COMPACT_BY_LEVEL = {
  A1: A1_WORDS,
  A2: A2_WORDS,
  B1: B1_WORDS,
  B2: B2_WORDS,
  C1: C1_WORDS,
};

// Ranks run A1 -> C1 so that "most frequent" also means "most elementary".
function build() {
  const byLevel = {};
  let rank = 1;
  for (const level of LEVELS) {
    byLevel[level] = WORDS_COMPACT_BY_LEVEL[level].map(row =>
      expandWord(row, level, rank++)
    );
  }
  return byLevel;
}

export const WORDS_BY_LEVEL = build();

export const WORDS_SEED = LEVELS.flatMap(level => WORDS_BY_LEVEL[level]);

export function wordsForLevel(level) {
  return WORDS_BY_LEVEL[level] || [];
}
```

- [ ] **Step 5: Repartir las frases igual**

Formato de fila: `[phrase_en, phrase_es, category, context|null]`. Repartí las ~530 filas
de `PHRASE_DATA` según su nivel. `src/seeds/phrases/index.mjs` es el espejo del de
palabras:

```js
// saflash — Phrase seed index: concatenates levels and assigns frequency ranks.
import { LEVELS } from '../../utils/levels.mjs';
import { expandPhrase } from '../wordExpander.mjs';
import { A1_PHRASES } from './a1.mjs';
import { A2_PHRASES } from './a2.mjs';
import { B1_PHRASES } from './b1.mjs';
import { B2_PHRASES } from './b2.mjs';
import { C1_PHRASES } from './c1.mjs';

export const PHRASES_COMPACT_BY_LEVEL = {
  A1: A1_PHRASES,
  A2: A2_PHRASES,
  B1: B1_PHRASES,
  B2: B2_PHRASES,
  C1: C1_PHRASES,
};

function build() {
  const byLevel = {};
  let rank = 1;
  for (const level of LEVELS) {
    byLevel[level] = PHRASES_COMPACT_BY_LEVEL[level].map(row =>
      expandPhrase(row, level, rank++)
    );
  }
  return byLevel;
}

export const PHRASES_BY_LEVEL = build();

export const PHRASES_SEED = LEVELS.flatMap(level => PHRASES_BY_LEVEL[level]);

export function phrasesForLevel(level) {
  return PHRASES_BY_LEVEL[level] || [];
}
```

- [ ] **Step 6: Escribir `scripts/validate-content.mjs`**

Esta es la red de seguridad de todas las tareas de contenido. En esta tarea sólo chequea
las semillas; la tarea 9 le agrega los chequeos del curriculum.

```js
// saflash — Content validator. Runs on the seed modules only, no database.
// Usage: node scripts/validate-content.mjs
import { LEVELS } from '../src/utils/levels.mjs';
import { WORDS_BY_LEVEL, WORDS_SEED } from '../src/seeds/words/index.mjs';
import { PHRASES_BY_LEVEL, PHRASES_SEED } from '../src/seeds/phrases/index.mjs';
import { CAT_IMG } from '../src/seeds/wordExpander.mjs';

const errors = [];

function check(condition, message) {
  if (!condition) errors.push(message);
}

// ── Duplicates ────────────────────────────
const seenWords = new Map();
for (const w of WORDS_SEED) {
  const key = w.english_word.toLowerCase();
  check(!seenWords.has(key), `Duplicate word "${w.english_word}" (${seenWords.get(key)} and ${w.difficulty})`);
  seenWords.set(key, w.difficulty);
}

const seenPhrases = new Set();
for (const p of PHRASES_SEED) {
  const key = p.phrase_en.toLowerCase();
  check(!seenPhrases.has(key), `Duplicate phrase "${p.phrase_en}"`);
  seenPhrases.add(key);
}

// ── Required fields ───────────────────────
for (const w of WORDS_SEED) {
  check(!!w.spanish_trans, `Word "${w.english_word}" has no translation`);
  check(!!w.category, `Word "${w.english_word}" has no category`);
  check(LEVELS.includes(w.difficulty), `Word "${w.english_word}" has invalid level "${w.difficulty}"`);
  check(!!CAT_IMG[w.category], `Category "${w.category}" (word "${w.english_word}") has no CAT_IMG entry`);
}
for (const p of PHRASES_SEED) {
  check(!!p.phrase_es, `Phrase "${p.phrase_en}" has no translation`);
  check(LEVELS.includes(p.difficulty), `Phrase "${p.phrase_en}" has invalid level "${p.difficulty}"`);
  check(!!CAT_IMG[p.category], `Category "${p.category}" (phrase "${p.phrase_en}") has no CAT_IMG entry`);
}

// ── Ranks are unique and contiguous ───────
const ranks = WORDS_SEED.map(w => w.frequency_rank);
check(new Set(ranks).size === ranks.length, 'Duplicate frequency_rank among words');

// ── Report ────────────────────────────────
console.log('Words per level:', Object.fromEntries(LEVELS.map(l => [l, WORDS_BY_LEVEL[l].length])));
console.log('Phrases per level:', Object.fromEntries(LEVELS.map(l => [l, PHRASES_BY_LEVEL[l].length])));
console.log(`Total: ${WORDS_SEED.length} words, ${PHRASES_SEED.length} phrases`);

if (errors.length) {
  console.error(`\n❌ ${errors.length} problem(s):`);
  for (const e of errors.slice(0, 50)) console.error('  -', e);
  if (errors.length > 50) console.error(`  …and ${errors.length - 50} more`);
  process.exit(1);
}
console.log('\n✅ Content valid');
```

- [ ] **Step 7: Agregar los scripts de npm**

En `package.json`, dentro de `"scripts"`:

```json
"validate": "node scripts/validate-content.mjs",
"test": "node --test tests/"
```

- [ ] **Step 8: Correr el validador — debe pasar**

Run: `npm run validate`
Expected: imprime el conteo por nivel, total 1115 palabras y ~530 frases, y `✅ Content valid`.

Si aparecen duplicados, son duplicados que ya existían en el seed original: borrá la
aparición del nivel más alto y dejá la del nivel más bajo.

- [ ] **Step 9: Actualizar `seedRunner.js` para las rutas nuevas**

Sólo los imports, la lógica queda igual (la tarea 11 la reescribe):

```js
import { WORDS_SEED } from './words/index.mjs';
import { PHRASES_SEED } from './phrases/index.mjs';
```

- [ ] **Step 10: Actualizar `src/utils/constants.js`**

```js
// saflash — App constants
export { LEVELS, LEVEL_LABELS, LEVEL_SELF_DESCRIPTIONS } from './levels.mjs';

export const SESSION_SIZE = 20;

export const DAILY_GOAL_DEFAULT = 20;
export const DAILY_GOAL_OPTIONS = [10, 20, 30, 50];

// Kept for the free-browse filter pills, which still speak in CEFR labels.
export const DIFFICULTY_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];

export const RATING = {
  HARD: 1,    // Difícil
  MEDIUM: 2,  // Bien
  EASY: 3,    // Fácil
};

export const CARD_TYPE = {
  WORD: 'word',
  PHRASE: 'phrase',
};

export const ONBOARDING_SLIDES = 3;
```

Las constantes de tamaño de lección **no** van acá: viven en `curriculum.mjs` (tarea 8),
que es quien las usa para repartir el contenido. Duplicarlas en dos archivos es la receta
para que un día no coincidan. Las pantallas que las necesiten las importan de ahí.

- [ ] **Step 11: Borrar los archivos viejos**

```bash
rm src/seeds/words_seed.js src/seeds/phrases_seed.js
```

- [ ] **Step 12: Verificar que la app arranca**

Run: `npx expo start --clear`
Expected: el bundler compila sin errores de resolución de módulos. Abrí la app en el
dispositivo o emulador; las pantallas Palabras y Frases muestran el mismo contenido de
antes. Si Metro no resuelve un `.mjs`, revisá que el import lleve la extensión explícita.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "refactor: split seed data into per-level modules

Word and phrase seeds move from two monolithic files into per-level .mjs
modules with a shared expander. Adds scripts/validate-content.mjs to check
duplicates, required fields, and category images without a database.

Content is unchanged: same 1115 words and same phrases, same order."
```

---

### Task 2: Contenido A1

**Files:**
- Modify: `src/seeds/words/a1.mjs`
- Modify: `src/seeds/phrases/a1.mjs`
- Modify: `src/seeds/wordExpander.mjs` (entradas nuevas en `CAT_IMG`)
- Modify: `src/utils/emojiMap.js` (entradas nuevas en `CATEGORY_EMOJI`)

**Interfaces:**
- Consumes: `expandWord`, `CAT_IMG` (Task 1)
- Produces: `A1_WORDS` con ≥ 500 filas, `A1_PHRASES` con ≥ 220 filas

**Objetivo del nivel:** que cada categoría que el curriculum usa en A1 tenga material de
sobra. Las ocho unidades de A1 (definidas en la tarea 8) son:

| Categoría | Palabras mínimas | Frases mínimas |
|---|---:|---:|
| `greetings` | 48 | 12 |
| `numbers` | 48 | 12 |
| `family` | 48 | 12 |
| `food_drink` | 48 | 12 |
| `home` | 48 | 12 |
| `colors_shapes` | 48 | 12 |
| `body` | 48 | 12 |
| `verbs_common` | 48 | 12 |

Mínimos totales del nivel: 384 palabras en esas ocho categorías, más el resto libre hasta
llegar a ≥ 500. Frases: 96 en esas categorías, más resto hasta ≥ 220.

- [ ] **Step 1: Agregar las categorías nuevas a `CAT_IMG`**

En `src/seeds/wordExpander.mjs`, dentro de `CAT_IMG`:

```js
  greetings: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400',
  weather: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=400',
  directions: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400',
  restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
  hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
  money_banking: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400',
  city_places: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400',
  chores: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
  hobbies: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400',
  media_entertainment: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400',
  science: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400',
  environment: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
  law_government: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400',
  idioms: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400',
  phrasal_verbs: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400',
```

- [ ] **Step 2: Agregar los emojis de esas categorías**

En `src/utils/emojiMap.js`, dentro de `CATEGORY_EMOJI`:

```js
  greetings: '👋', weather: '☀️', directions: '🧭', restaurant: '🍽️',
  hotel: '🏨', money_banking: '🏦', city_places: '🏙️', chores: '🧹',
  hobbies: '🎨', media_entertainment: '🎬', science: '🔬',
  environment: '🌍', law_government: '⚖️', idioms: '💬', phrasal_verbs: '🔗',
```

- [ ] **Step 3: Escribir las palabras A1 faltantes**

Agregá filas a `A1_WORDS` hasta cumplir la tabla de arriba. Formato y estilo:

```js
export const A1_WORDS = [
  // …filas existentes…

  // === greetings (48) ===
  ['hello', 'hola', 'greetings', null],
  ['goodbye', 'adiós', 'greetings', null],
  ['please', 'por favor', 'greetings', null],
  ['thanks', 'gracias', 'greetings', null],
  ['sorry', 'perdón', 'greetings', null],
  ['welcome', 'bienvenido', 'greetings', null],
  ['morning', 'mañana', 'greetings', null],
  ['afternoon', 'tarde', 'greetings', null],
  ['evening', 'noche', 'greetings', null],
  ['name', 'nombre', 'greetings', null],
  // …hasta 48…
];
```

Reglas para el contenido:

- Una palabra por fila, minúsculas salvo nombres propios.
- Traducción al español rioplatense, sin artículo ("mesa", no "la mesa").
- Una sola acepción por palabra: la más frecuente. Nada de "banco (asiento/entidad)".
- A1 = palabras concretas y de altísima frecuencia. Nada abstracto.
- Sin duplicar ninguna palabra ya presente en cualquier nivel — el validador lo corta.
- Cuando la palabra sea concreta y frecuente, revisá que `WORD_EMOJI` en
  `src/utils/emojiMap.js` la tenga; si no, agregala. No es obligatorio: hay fallback por
  categoría.

- [ ] **Step 4: Escribir las frases A1 faltantes**

```js
export const A1_PHRASES = [
  // …filas existentes…

  // === greetings (12) ===
  ['Good morning!', '¡Buen día!', 'greetings', 'Saludo hasta el mediodía'],
  ['How are you?', '¿Cómo estás?', 'greetings', 'Saludo informal'],
  ['Nice to meet you.', 'Encantado de conocerte.', 'greetings', 'Primera vez que se ven'],
  // …hasta 12…
];
```

Reglas: frases completas y usables tal cual, de 3 a 8 palabras en A1. El cuarto elemento
es el contexto en español — cuándo se usa —, no una repetición de la traducción.

- [ ] **Step 5: Validar**

Run: `npm run validate`
Expected: `A1` con ≥ 500 palabras y ≥ 220 frases, sin errores.

Si aparece un duplicado, borrá la fila nueva y elegí otra palabra.

- [ ] **Step 6: Commit**

```bash
git add src/seeds/words/a1.mjs src/seeds/phrases/a1.mjs src/seeds/wordExpander.mjs src/utils/emojiMap.js
git commit -m "feat(content): expand A1 vocabulary to 500 words and 220 phrases

Adds the greetings category and fills every A1 curriculum category to at
least 48 words and 12 phrases. Registers the 15 new categories in CAT_IMG
and the category emoji map."
```

---

### Task 3: Contenido A2

Idéntica a la tarea 2, sobre `a2.mjs`. Las categorías nuevas ya están registradas.

**Files:**
- Modify: `src/seeds/words/a2.mjs`, `src/seeds/phrases/a2.mjs`

**Interfaces:**
- Produces: `A2_WORDS` con ≥ 550 filas, `A2_PHRASES` con ≥ 220 filas

| Categoría | Palabras mínimas | Frases mínimas |
|---|---:|---:|
| `clothing` | 48 | 12 |
| `shopping` | 48 | 12 |
| `city_places` | 48 | 12 |
| `transport` | 48 | 12 |
| `weather` | 48 | 12 |
| `work_business` | 48 | 12 |
| `sports` | 48 | 12 |
| `adjectives` | 48 | 12 |

- [ ] **Step 1: Escribir las palabras A2 faltantes**

Mismo formato que la tarea 2:

```js
export const A2_WORDS = [
  // …filas existentes…

  // === weather (48) ===
  ['sunny', 'soleado', 'weather', null],
  ['cloudy', 'nublado', 'weather', null],
  ['rainy', 'lluvioso', 'weather', null],
  ['storm', 'tormenta', 'weather', null],
  ['wind', 'viento', 'weather', null],
  // …hasta 48…
];
```

A2 = vocabulario cotidiano fuera de casa: la calle, las compras, el trabajo simple. Sigue
siendo concreto pero ya no es sólo el entorno inmediato.

- [ ] **Step 2: Escribir las frases A2 faltantes**

Frases de 4 a 10 palabras, con al menos una estructura de pregunta o de pedido por
categoría ("How much does it cost?", "Can I try it on?").

- [ ] **Step 3: Validar**

Run: `npm run validate`
Expected: `A2` con ≥ 550 palabras y ≥ 220 frases, sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/seeds/words/a2.mjs src/seeds/phrases/a2.mjs
git commit -m "feat(content): expand A2 vocabulary to 550 words and 220 phrases"
```

---

### Task 4: Contenido B1

**Files:**
- Modify: `src/seeds/words/b1.mjs`, `src/seeds/phrases/b1.mjs`

**Interfaces:**
- Produces: `B1_WORDS` con ≥ 550 filas, `B1_PHRASES` con ≥ 200 filas

| Categoría | Palabras mínimas | Frases mínimas |
|---|---:|---:|
| `travel` | 48 | 12 |
| `restaurant` | 48 | 12 |
| `hotel` | 48 | 12 |
| `health` | 48 | 12 |
| `education` | 48 | 12 |
| `technology` | 48 | 12 |
| `emotions` | 48 | 12 |
| `verbs_action` | 48 | 12 |

- [ ] **Step 1: Escribir las palabras B1 faltantes**

```js
export const B1_WORDS = [
  // …filas existentes…

  // === hotel (48) ===
  ['reservation', 'reserva', 'hotel', null],
  ['check-in', 'registro de entrada', 'hotel', null],
  ['lobby', 'recepción', 'hotel', null],
  ['suite', 'suite', 'hotel', null],
  ['housekeeping', 'servicio de limpieza', 'hotel', null],
  // …hasta 48…
];
```

B1 = vocabulario para resolver situaciones: viajar, atenderse, estudiar, describir estados
internos. Empiezan a aparecer sustantivos abstractos frecuentes.

- [ ] **Step 2: Escribir las frases B1 faltantes**

Frases de 5 a 12 palabras. Al menos dos por categoría deben ser una transacción completa
("I'd like to book a room for two nights, please.").

- [ ] **Step 3: Validar**

Run: `npm run validate`
Expected: `B1` con ≥ 550 palabras y ≥ 200 frases, sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/seeds/words/b1.mjs src/seeds/phrases/b1.mjs
git commit -m "feat(content): expand B1 vocabulary to 550 words and 200 phrases"
```

---

### Task 5: Contenido B2

B2 hoy tiene 3 palabras. Es prácticamente un nivel desde cero.

**Files:**
- Modify: `src/seeds/words/b2.mjs`, `src/seeds/phrases/b2.mjs`

**Interfaces:**
- Produces: `B2_WORDS` con ≥ 450 filas, `B2_PHRASES` con ≥ 140 filas

Las siete unidades de B2 tienen 5 lecciones cada una → 40 palabras y 10 frases por categoría:

| Categoría | Palabras mínimas | Frases mínimas |
|---|---:|---:|
| `money_banking` | 40 | 10 |
| `media_entertainment` | 40 | 10 |
| `environment` | 40 | 10 |
| `science` | 40 | 10 |
| `social` | 40 | 10 |
| `adverbs` | 40 | 10 |
| `phrasal_verbs` | 40 | 10 |

- [ ] **Step 1: Escribir las palabras B2**

```js
export const B2_WORDS = [
  // …las 3 filas existentes…

  // === money_banking (40) ===
  ['mortgage', 'hipoteca', 'money_banking', null],
  ['interest', 'interés', 'money_banking', null],
  ['loan', 'préstamo', 'money_banking', null],
  ['savings', 'ahorros', 'money_banking', null],
  ['withdrawal', 'retiro', 'money_banking', null],
  // …hasta 40…

  // === phrasal_verbs (40) ===
  ['give up', 'rendirse', 'phrasal_verbs', null],
  ['look after', 'cuidar', 'phrasal_verbs', null],
  ['put off', 'posponer', 'phrasal_verbs', null],
  // …hasta 40…
];
```

B2 = vocabulario para opinar y argumentar. Abstracto, matizado, con colocaciones. Los
phrasal verbs van en la columna `english_word` con el espacio incluido; el emoji cae al de
la categoría, que es lo esperado.

- [ ] **Step 2: Escribir las frases B2**

Frases de 6 a 15 palabras. Al menos tres por categoría deben expresar opinión, contraste o
condición ("I'd rather wait until the market settles down.").

- [ ] **Step 3: Validar**

Run: `npm run validate`
Expected: `B2` con ≥ 450 palabras y ≥ 140 frases, sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/seeds/words/b2.mjs src/seeds/phrases/b2.mjs
git commit -m "feat(content): add B2 level with 450 words and 140 phrases

B2 previously had 3 words. Adds seven full categories including phrasal
verbs, which the curriculum needs for its B2 units."
```

---

### Task 6: Contenido C1

C1 no existe. Se crea entero.

**Files:**
- Modify: `src/seeds/words/c1.mjs`, `src/seeds/phrases/c1.mjs`

**Interfaces:**
- Produces: `C1_WORDS` con ≥ 450 filas, `C1_PHRASES` con ≥ 120 filas

Seis unidades × 5 lecciones → 40 palabras y 10 frases por categoría:

| Categoría | Palabras mínimas | Frases mínimas |
|---|---:|---:|
| `work_business` | 40 | 10 |
| `law_government` | 40 | 10 |
| `science` | 40 | 10 |
| `arts_culture` | 40 | 10 |
| `idioms` | 40 | 10 |
| `adjectives` | 40 | 10 |

Ojo: `work_business`, `science`, `arts_culture` y `adjectives` ya tienen palabras en otros
niveles. Estas 40 son **adicionales y de nivel C1**; el validador rechaza cualquier
repetición entre niveles.

- [ ] **Step 1: Escribir las palabras C1**

```js
export const C1_WORDS = [
  // === work_business (40) ===
  ['leverage', 'apalancamiento', 'work_business', null],
  ['stakeholder', 'parte interesada', 'work_business', null],
  ['procurement', 'adquisiciones', 'work_business', null],
  ['divestment', 'desinversión', 'work_business', null],
  // …hasta 40…

  // === idioms (40) ===
  ['break the ice', 'romper el hielo', 'idioms', null],
  ['hit the nail on the head', 'dar en el clavo', 'idioms', null],
  ['under the weather', 'sentirse mal', 'idioms', null],
  // …hasta 40…
];
```

C1 = registro formal, precisión léxica, modismos idiomáticos. La traducción del modismo es
el equivalente en español, no la traducción literal.

- [ ] **Step 2: Escribir las frases C1**

Frases de 8 a 20 palabras, en registro formal o idiomático, del tipo que aparece en una
reunión de trabajo, un artículo o una discusión.

- [ ] **Step 3: Validar el contenido completo**

Run: `npm run validate`
Expected: los cinco niveles con sus mínimos, total ≥ 2.500 palabras y ≥ 900 frases, sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/seeds/words/c1.mjs src/seeds/phrases/c1.mjs
git commit -m "feat(content): add C1 level with 450 words and 120 phrases

Completes the A1-C1 range: the seed now holds ~2500 words and ~900
phrases across 43 categories."
```

---

### Task 7: Esquema de base de datos

**Files:**
- Modify: `src/database/database.js`

**Interfaces:**
- Produces: tablas `lessons`, `lesson_cards`, `lesson_progress`; columnas `level`, `placement_done`, `current_lesson_id`, `suggestion_dismissed_at` en `user_config`

- [ ] **Step 1: Agregar las tablas nuevas**

En `src/database/database.js`, después del bloque de `user_config` (línea 110) y antes del
bloque de migraciones:

```js
  // ── Lessons: the guided path ───────────────
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS lessons (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      level        TEXT    NOT NULL,
      unit_index   INTEGER NOT NULL,
      lesson_index INTEGER NOT NULL,
      unit_title   TEXT    NOT NULL,
      category     TEXT    NOT NULL,
      icon         TEXT,
      UNIQUE(level, unit_index, lesson_index)
    );
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS lesson_cards (
      lesson_id  INTEGER NOT NULL REFERENCES lessons(id),
      card_type  TEXT    NOT NULL,
      card_id    INTEGER NOT NULL,
      position   INTEGER NOT NULL,
      PRIMARY KEY (lesson_id, position)
    );
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS lesson_progress (
      lesson_id    INTEGER PRIMARY KEY REFERENCES lessons(id),
      status       TEXT    DEFAULT 'locked',
      stars        INTEGER DEFAULT 0,
      accuracy     REAL    DEFAULT 0,
      completed_at TEXT
    );
  `);
```

- [ ] **Step 2: Agregar las columnas de `user_config`**

Junto a las migraciones existentes (línea 113):

```js
  await addColumnIfMissing(database, 'user_config', 'level', "TEXT DEFAULT 'A1'");
  await addColumnIfMissing(database, 'user_config', 'placement_done', 'INTEGER DEFAULT 0');
  await addColumnIfMissing(database, 'user_config', 'current_lesson_id', 'INTEGER');
  // Number of completed lessons at the moment the user dismissed a level
  // suggestion. -1 means "never dismissed".
  await addColumnIfMissing(database, 'user_config', 'suggestion_dismissed_at', 'INTEGER DEFAULT -1');
```

- [ ] **Step 3: Agregar los índices**

Dentro del bloque de índices existente:

```sql
    CREATE INDEX IF NOT EXISTS idx_lessons_level    ON lessons(level, unit_index, lesson_index);
    CREATE INDEX IF NOT EXISTS idx_lesson_cards     ON lesson_cards(lesson_id, position);
    CREATE INDEX IF NOT EXISTS idx_lesson_prog_stat ON lesson_progress(status);
```

- [ ] **Step 4: Verificar sobre una base existente**

Run: `npx expo start --clear`
Expected: la app arranca sin errores de SQL. Las columnas nuevas se agregan a la
`user_config` que ya existía, sin perder configuración. Confirmalo en la consola de Metro:
no debe haber ningún `SQLite error`.

- [ ] **Step 5: Commit**

```bash
git add src/database/database.js
git commit -m "feat(db): add lessons, lesson_cards and lesson_progress tables

Also adds level, placement_done, current_lesson_id and
suggestion_dismissed_at to user_config via the existing
addColumnIfMissing migration helper, so existing installs upgrade in
place."
```

---

### Task 8: Definición del curriculum

**Files:**
- Create: `src/curriculum/curriculum.mjs`

**Interfaces:**
- Produces: `CURRICULUM: Record<string, Unit[]>` donde `Unit = { title, icon, category, lessons }`; `TOTAL_LESSONS: number`; `unitsForLevel(level): Unit[]`

- [ ] **Step 1: Escribir `src/curriculum/curriculum.mjs`**

```js
// saflash — The guided path definition.
// Each unit maps to one content category at one level. `lessons` is how many
// lessons the unit holds; each lesson takes WORDS_PER_LESSON words and
// PHRASES_PER_LESSON phrases from that category and level.
import { LEVELS } from '../utils/levels.mjs';

export const WORDS_PER_LESSON = 8;
export const PHRASES_PER_LESSON = 2;
export const LESSON_SIZE = WORDS_PER_LESSON + PHRASES_PER_LESSON;

export const CURRICULUM = {
  A1: [
    { title: 'Primeros pasos',    icon: '👋', category: 'greetings',     lessons: 6 },
    { title: 'Números',           icon: '🔢', category: 'numbers',       lessons: 6 },
    { title: 'Familia',           icon: '👪', category: 'family',        lessons: 6 },
    { title: 'Comida y bebida',   icon: '🍎', category: 'food_drink',    lessons: 6 },
    { title: 'La casa',           icon: '🏠', category: 'home',          lessons: 6 },
    { title: 'Colores y formas',  icon: '🎨', category: 'colors_shapes', lessons: 6 },
    { title: 'El cuerpo',         icon: '🧍', category: 'body',          lessons: 6 },
    { title: 'Verbos esenciales', icon: '🏃', category: 'verbs_common',  lessons: 6 },
  ],
  A2: [
    { title: 'Ropa',              icon: '👕', category: 'clothing',      lessons: 6 },
    { title: 'Compras',           icon: '🛒', category: 'shopping',      lessons: 6 },
    { title: 'La ciudad',         icon: '🏙️', category: 'city_places',   lessons: 6 },
    { title: 'Transporte',        icon: '🚌', category: 'transport',     lessons: 6 },
    { title: 'El clima',          icon: '☀️', category: 'weather',       lessons: 6 },
    { title: 'Trabajo',           icon: '💼', category: 'work_business', lessons: 6 },
    { title: 'Deportes',          icon: '⚽', category: 'sports',        lessons: 6 },
    { title: 'Adjetivos',         icon: '✨', category: 'adjectives',    lessons: 6 },
  ],
  B1: [
    { title: 'Viajes',            icon: '✈️', category: 'travel',        lessons: 6 },
    { title: 'Restaurante',       icon: '🍽️', category: 'restaurant',    lessons: 6 },
    { title: 'Hotel',             icon: '🏨', category: 'hotel',         lessons: 6 },
    { title: 'Salud',             icon: '🏥', category: 'health',        lessons: 6 },
    { title: 'Educación',         icon: '🎓', category: 'education',     lessons: 6 },
    { title: 'Tecnología',        icon: '💻', category: 'technology',    lessons: 6 },
    { title: 'Emociones',         icon: '💭', category: 'emotions',      lessons: 6 },
    { title: 'Verbos de acción',  icon: '🤸', category: 'verbs_action',  lessons: 6 },
  ],
  B2: [
    { title: 'Dinero y banco',    icon: '🏦', category: 'money_banking',       lessons: 5 },
    { title: 'Medios y cultura',  icon: '🎬', category: 'media_entertainment', lessons: 5 },
    { title: 'Medio ambiente',    icon: '🌍', category: 'environment',         lessons: 5 },
    { title: 'Ciencia',           icon: '🔬', category: 'science',             lessons: 5 },
    { title: 'Vida social',       icon: '🗣️', category: 'social',              lessons: 5 },
    { title: 'Adverbios',         icon: '🔁', category: 'adverbs',             lessons: 5 },
    { title: 'Phrasal verbs',     icon: '🔗', category: 'phrasal_verbs',       lessons: 5 },
  ],
  C1: [
    { title: 'Negocios',          icon: '📊', category: 'work_business',  lessons: 5 },
    { title: 'Ley y gobierno',    icon: '⚖️', category: 'law_government', lessons: 5 },
    { title: 'Ciencia avanzada',  icon: '🧪', category: 'science',        lessons: 5 },
    { title: 'Arte y cultura',    icon: '🎭', category: 'arts_culture',   lessons: 5 },
    { title: 'Modismos',          icon: '💬', category: 'idioms',         lessons: 5 },
    { title: 'Matices',           icon: '🧠', category: 'adjectives',     lessons: 5 },
  ],
};

export function unitsForLevel(level) {
  return CURRICULUM[level] || [];
}

export const TOTAL_LESSONS = LEVELS.reduce(
  (sum, level) => sum + unitsForLevel(level).reduce((s, u) => s + u.lessons, 0),
  0
);
```

- [ ] **Step 2: Verificar el total**

Run: `node -e "import('./src/curriculum/curriculum.mjs').then(m => console.log(m.TOTAL_LESSONS))"`
Expected: `209`

- [ ] **Step 3: Commit**

```bash
git add src/curriculum/curriculum.mjs
git commit -m "feat(curriculum): define the A1-C1 unit and lesson structure

37 units across five levels, 209 lessons total. Each unit binds one
content category to one level."
```

---

### Task 9: Planificador de lecciones

El corazón de la ruta. Reparte palabras y frases en lecciones, sin tocar la base de datos —
por eso se puede probar con Node.

**Files:**
- Create: `src/curriculum/curriculumBuilder.mjs`
- Create: `tests/curriculumBuilder.test.mjs`
- Modify: `scripts/validate-content.mjs`

**Interfaces:**
- Consumes: `CURRICULUM`, `WORDS_PER_LESSON`, `PHRASES_PER_LESSON` (Task 8); `WORDS_BY_LEVEL`, `PHRASES_BY_LEVEL` (Task 1); `LEVELS` (Task 1)
- Produces: `planLessons(curriculum, wordsByLevel, phrasesByLevel): { lessons, warnings }`
  - `lessons: PlannedLesson[]` con `PlannedLesson = { level, unit_index, lesson_index, unit_title, category, icon, words: string[], phrases: string[] }`
  - `words` son `english_word`, `phrases` son `phrase_en`. Se usan claves de texto y no ids porque los ids los asigna SQLite recién al sembrar.
  - `warnings: string[]`

- [ ] **Step 1: Escribir el test que falla**

`tests/curriculumBuilder.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planLessons } from '../src/curriculum/curriculumBuilder.mjs';

// Small synthetic fixtures: two lessons' worth of content in one category.
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
```

- [ ] **Step 2: Correr el test — debe fallar**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/curriculum/curriculumBuilder.mjs'`

- [ ] **Step 3: Escribir `src/curriculum/curriculumBuilder.mjs`**

```js
// saflash — Turns the curriculum definition plus the seed content into a flat
// list of planned lessons. Pure: no database, no React Native.
import { LEVELS } from '../utils/levels.mjs';
import { WORDS_PER_LESSON, PHRASES_PER_LESSON } from './curriculum.mjs';

/**
 * Pulls up to `count` unused items of a category, most frequent first,
 * falling back to any unused item of the level when the category runs out.
 */
function take(pool, category, count, used, keyOf) {
  const picked = [];

  const fromCategory = pool.filter(
    item => item.category === category && !used.has(keyOf(item))
  );
  for (const item of fromCategory) {
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

const wordKey = w => w.english_word;
const phraseKey = p => p.phrase_en;

/**
 * @param {Record<string, Array>} curriculum - CURRICULUM from curriculum.mjs
 * @param {Record<string, Array>} wordsByLevel
 * @param {Record<string, Array>} phrasesByLevel
 * @returns {{ lessons: Array, warnings: string[] }}
 */
export function planLessons(curriculum, wordsByLevel, phrasesByLevel) {
  const lessons = [];
  const warnings = [];

  for (const level of LEVELS) {
    const units = curriculum[level] || [];
    if (units.length === 0) continue;

    // Sorting by frequency_rank makes the path start with the most useful
    // vocabulary of each category.
    const wordPool = [...(wordsByLevel[level] || [])].sort(
      (a, b) => a.frequency_rank - b.frequency_rank
    );
    const phrasePool = [...(phrasesByLevel[level] || [])].sort(
      (a, b) => a.frequency_rank - b.frequency_rank
    );

    const usedWords = new Set();
    const usedPhrases = new Set();

    units.forEach((unit, unitIndex) => {
      for (let lessonIndex = 0; lessonIndex < unit.lessons; lessonIndex++) {
        const w = take(wordPool, unit.category, WORDS_PER_LESSON, usedWords, wordKey);
        const p = take(phrasePool, unit.category, PHRASES_PER_LESSON, usedPhrases, phraseKey);

        if (w.picked.length < WORDS_PER_LESSON || p.picked.length < PHRASES_PER_LESSON) {
          warnings.push(
            `${level} "${unit.title}" lesson ${lessonIndex + 1}: not enough content ` +
            `(${w.picked.length}/${WORDS_PER_LESSON} words, ${p.picked.length}/${PHRASES_PER_LESSON} phrases)`
          );
          continue;
        }

        if (w.fellBack || p.fellBack) {
          warnings.push(
            `${level} "${unit.title}" lesson ${lessonIndex + 1}: ` +
            `category "${unit.category}" ran out, filled from other categories`
          );
        }

        lessons.push({
          level,
          unit_index: unitIndex,
          lesson_index: lessonIndex,
          unit_title: unit.title,
          category: unit.category,
          icon: unit.icon,
          words: w.picked.map(wordKey),
          phrases: p.picked.map(phraseKey),
        });
      }
    });
  }

  return { lessons, warnings };
}
```

- [ ] **Step 4: Correr los tests — deben pasar**

Run: `npm test`
Expected: `# pass 5`, `# fail 0`

- [ ] **Step 5: Enchufar el planificador al validador**

Al final de `scripts/validate-content.mjs`, antes del bloque `// ── Report ──`:

```js
// ── Curriculum ────────────────────────────
const { lessons, warnings } = planLessons(CURRICULUM, WORDS_BY_LEVEL, PHRASES_BY_LEVEL);

for (const w of warnings) errors.push(`Curriculum: ${w}`);

check(lessons.length === TOTAL_LESSONS,
  `Curriculum produced ${lessons.length} lessons, expected ${TOTAL_LESSONS}`);

for (const lesson of lessons) {
  const size = lesson.words.length + lesson.phrases.length;
  check(size === LESSON_SIZE,
    `${lesson.level} "${lesson.unit_title}" lesson ${lesson.lesson_index + 1} has ${size} cards, expected ${LESSON_SIZE}`);
}
```

Y arriba, con el resto de los imports:

```js
import { CURRICULUM, TOTAL_LESSONS, LESSON_SIZE } from '../src/curriculum/curriculum.mjs';
import { planLessons } from '../src/curriculum/curriculumBuilder.mjs';
```

Y en el reporte:

```js
console.log(`Curriculum: ${lessons.length} lessons`);
```

- [ ] **Step 6: Validar el contenido real contra el curriculum**

Run: `npm run validate`
Expected: `Curriculum: 209 lessons` y `✅ Content valid`.

Un error de tipo `category "X" ran out` significa que a esa categoría le faltan palabras en
ese nivel: volvé a la tarea de contenido del nivel y completala. Ese es exactamente el
control que las tablas de mínimos de las tareas 2 a 6 buscan garantizar.

- [ ] **Step 7: Commit**

```bash
git add src/curriculum/curriculumBuilder.mjs tests/curriculumBuilder.test.mjs scripts/validate-content.mjs
git commit -m "feat(curriculum): plan lessons from seed content

planLessons splits each unit's category into lessons of 8 words and 2
phrases, most frequent first, never reusing a card. Falls back to other
categories with a warning when a category runs dry. The content
validator now fails on any such warning."
```

---

### Task 10: Repositorio de lecciones

**Files:**
- Create: `src/database/lessonsRepository.js`
- Modify: `src/database/sessionRepository.js`

**Interfaces:**
- Consumes: `getDatabase` (existente); `PlannedLesson` (Task 9); `LEVELS`, `levelIndex` (Task 1)
- Produces, desde `lessonsRepository.js`:
  - `persistCurriculum(plannedLessons): Promise<number>` — inserta y devuelve cuántas lecciones creó
  - `getLessonCount(): Promise<number>`
  - `getPath(): Promise<PathUnit[]>` con `PathUnit = { level, unit_index, unit_title, icon, lessons: PathLesson[] }` y `PathLesson = { id, level, unit_index, lesson_index, category, status, stars, accuracy }`
  - `getLessonCards(lessonId): Promise<Card[]>` — filas completas de `words` / `phrases` con `card_type` agregado, en orden de `position`
  - `unlockUpTo(level): Promise<void>` — deja en `unlocked` todo lo de nivel ≤ `level`, en `locked` el resto, sin tocar lo `completed`
  - `completeLesson(lessonId, accuracy, stars): Promise<{ nextLessonId: number|null }>`
  - `getCurrentLesson(): Promise<PathLesson|null>`
  - `getRecentAccuracies(limit): Promise<number[]>`
  - `getCompletedCount(): Promise<number>`
- Produces, desde `sessionRepository.js`: `setLevel(level)`, `setPlacementDone()`, `setCurrentLesson(lessonId)`, `dismissLevelSuggestion(completedCount)`

- [ ] **Step 1: Escribir `src/database/lessonsRepository.js`**

```js
// saflash — Lessons repository: the guided path's persistence layer.
import { getDatabase } from './database';
import { LEVELS, levelIndex } from '../utils/levels.mjs';

/**
 * Writes the planned curriculum into `lessons` and `lesson_cards`.
 * Card text keys are resolved to database ids here, because ids only exist
 * once the seed has been inserted.
 */
export async function persistCurriculum(plannedLessons) {
  const db = getDatabase();

  const wordRows = await db.getAllAsync('SELECT id, english_word FROM words');
  const phraseRows = await db.getAllAsync('SELECT id, phrase_en FROM phrases');
  const wordIds = new Map(wordRows.map(r => [r.english_word, r.id]));
  const phraseIds = new Map(phraseRows.map(r => [r.phrase_en, r.id]));

  let created = 0;

  await db.withTransactionAsync(async () => {
    for (const lesson of plannedLessons) {
      const result = await db.runAsync(
        `INSERT INTO lessons
          (level, unit_index, lesson_index, unit_title, category, icon)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [lesson.level, lesson.unit_index, lesson.lesson_index,
         lesson.unit_title, lesson.category, lesson.icon]
      );
      const lessonId = result.lastInsertRowId;

      let position = 0;
      for (const word of lesson.words) {
        const id = wordIds.get(word);
        if (id == null) continue;
        await db.runAsync(
          'INSERT INTO lesson_cards (lesson_id, card_type, card_id, position) VALUES (?, ?, ?, ?)',
          [lessonId, 'word', id, position++]
        );
      }
      for (const phrase of lesson.phrases) {
        const id = phraseIds.get(phrase);
        if (id == null) continue;
        await db.runAsync(
          'INSERT INTO lesson_cards (lesson_id, card_type, card_id, position) VALUES (?, ?, ?, ?)',
          [lessonId, 'phrase', id, position++]
        );
      }

      await db.runAsync(
        "INSERT INTO lesson_progress (lesson_id, status) VALUES (?, 'locked')",
        [lessonId]
      );
      created++;
    }
  });

  return created;
}

export async function getLessonCount() {
  const db = getDatabase();
  const row = await db.getFirstAsync('SELECT COUNT(*) as count FROM lessons');
  return row?.count ?? 0;
}

/**
 * The whole path, grouped by unit, ordered level -> unit -> lesson.
 */
export async function getPath() {
  const db = getDatabase();
  const rows = await db.getAllAsync(`
    SELECT l.id, l.level, l.unit_index, l.lesson_index, l.unit_title,
           l.category, l.icon,
           COALESCE(p.status, 'locked') AS status,
           COALESCE(p.stars, 0)         AS stars,
           COALESCE(p.accuracy, 0)      AS accuracy
    FROM lessons l
    LEFT JOIN lesson_progress p ON p.lesson_id = l.id
    ORDER BY l.level, l.unit_index, l.lesson_index
  `);

  // SQLite orders 'A1' < 'A2' < 'B1' < 'B2' < 'C1' lexicographically, which
  // happens to match the CEFR order. Re-sort anyway so the invariant is
  // explicit rather than accidental.
  rows.sort((a, b) =>
    levelIndex(a.level) - levelIndex(b.level) ||
    a.unit_index - b.unit_index ||
    a.lesson_index - b.lesson_index
  );

  const units = [];
  let current = null;
  for (const row of rows) {
    if (!current || current.level !== row.level || current.unit_index !== row.unit_index) {
      current = {
        level: row.level,
        unit_index: row.unit_index,
        unit_title: row.unit_title,
        icon: row.icon,
        lessons: [],
      };
      units.push(current);
    }
    current.lessons.push({
      id: row.id,
      level: row.level,
      unit_index: row.unit_index,
      lesson_index: row.lesson_index,
      category: row.category,
      status: row.status,
      stars: row.stars,
      accuracy: row.accuracy,
    });
  }
  return units;
}

export async function getLessonCards(lessonId) {
  const db = getDatabase();
  const cards = await db.getAllAsync(
    'SELECT card_type, card_id, position FROM lesson_cards WHERE lesson_id = ? ORDER BY position',
    [lessonId]
  );

  const result = [];
  for (const card of cards) {
    const table = card.card_type === 'word' ? 'words' : 'phrases';
    const row = await db.getFirstAsync(`SELECT * FROM ${table} WHERE id = ?`, [card.card_id]);
    if (row) result.push({ ...row, card_type: card.card_type });
  }
  return result;
}

/**
 * Opens every lesson at or below `level` and closes everything above it,
 * leaving completed lessons untouched. Called when the user picks or changes
 * their level.
 */
export async function unlockUpTo(level) {
  const db = getDatabase();
  const allowed = LEVELS.slice(0, levelIndex(level) + 1);
  if (allowed.length === 0) return;

  const placeholders = allowed.map(() => '?').join(', ');

  await db.runAsync(
    `UPDATE lesson_progress SET status = 'unlocked'
     WHERE status = 'locked'
       AND lesson_id IN (SELECT id FROM lessons WHERE level IN (${placeholders}))`,
    allowed
  );

  await db.runAsync(
    `UPDATE lesson_progress SET status = 'locked'
     WHERE status = 'unlocked'
       AND lesson_id IN (SELECT id FROM lessons WHERE level NOT IN (${placeholders}))`,
    allowed
  );

  // The first lesson above the chosen level is the one the user grows into.
  const nextFirst = await db.getFirstAsync(
    `SELECT id FROM lessons WHERE level NOT IN (${placeholders})
     ORDER BY level, unit_index, lesson_index LIMIT 1`,
    allowed
  );
  if (nextFirst) {
    await db.runAsync(
      "UPDATE lesson_progress SET status = 'unlocked' WHERE lesson_id = ? AND status = 'locked'",
      [nextFirst.id]
    );
  }
}

/**
 * Marks a lesson done and opens the next one in path order.
 */
export async function completeLesson(lessonId, accuracy, stars) {
  const db = getDatabase();
  const today = new Date().toISOString().split('T')[0];

  // Keep the best result: replaying a lesson should never lower its stars.
  await db.runAsync(
    `UPDATE lesson_progress
     SET status = 'completed',
         stars = MAX(stars, ?),
         accuracy = ?,
         completed_at = ?
     WHERE lesson_id = ?`,
    [stars, accuracy, today, lessonId]
  );

  const lesson = await db.getFirstAsync('SELECT * FROM lessons WHERE id = ?', [lessonId]);
  if (!lesson) return { nextLessonId: null };

  const all = await db.getAllAsync(
    'SELECT id, level, unit_index, lesson_index FROM lessons'
  );
  all.sort((a, b) =>
    levelIndex(a.level) - levelIndex(b.level) ||
    a.unit_index - b.unit_index ||
    a.lesson_index - b.lesson_index
  );

  const position = all.findIndex(l => l.id === lessonId);
  const next = position >= 0 ? all[position + 1] : null;
  if (!next) return { nextLessonId: null };

  await db.runAsync(
    "UPDATE lesson_progress SET status = 'unlocked' WHERE lesson_id = ? AND status = 'locked'",
    [next.id]
  );
  return { nextLessonId: next.id };
}

/**
 * The lesson the "Continuar" button jumps to: the first one that is
 * unlocked but not completed.
 */
export async function getCurrentLesson() {
  const units = await getPath();
  for (const unit of units) {
    for (const lesson of unit.lessons) {
      if (lesson.status === 'unlocked') return lesson;
    }
  }
  return null;
}

export async function getRecentAccuracies(limit = 3) {
  const db = getDatabase();
  const rows = await db.getAllAsync(
    `SELECT accuracy FROM lesson_progress
     WHERE status = 'completed' AND completed_at IS NOT NULL
     ORDER BY completed_at DESC, lesson_id DESC
     LIMIT ?`,
    [limit]
  );
  return rows.map(r => r.accuracy);
}

export async function getCompletedCount() {
  const db = getDatabase();
  const row = await db.getFirstAsync(
    "SELECT COUNT(*) as count FROM lesson_progress WHERE status = 'completed'"
  );
  return row?.count ?? 0;
}
```

- [ ] **Step 2: Agregar los accesores de nivel a `sessionRepository.js`**

Al final del bloque `// ── User Config ──`:

```js
export async function setLevel(level) {
  return updateConfig({ level });
}

export async function setPlacementDone() {
  return updateConfig({ placement_done: 1 });
}

export async function setCurrentLesson(lessonId) {
  return updateConfig({ current_lesson_id: lessonId });
}

export async function dismissLevelSuggestion(completedCount) {
  return updateConfig({ suggestion_dismissed_at: completedCount });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/database/lessonsRepository.js src/database/sessionRepository.js
git commit -m "feat(db): add lessons repository

Persists the planned curriculum, reads the path grouped by unit, resolves
a lesson's cards, and handles unlocking and completion. Completing a
lesson keeps the best star count, so replaying never costs progress."
```

---

### Task 11: Sembrado por nivel y construcción de la ruta

**Files:**
- Modify: `src/seeds/seedRunner.js`

**Interfaces:**
- Consumes: `WORDS_BY_LEVEL`, `PHRASES_BY_LEVEL` (Task 1); `planLessons` (Task 9); `CURRICULUM` (Task 8); `persistCurriculum`, `getLessonCount` (Task 10)

- [ ] **Step 1: Reescribir `src/seeds/seedRunner.js`**

```js
// saflash — Seed runner: populates SQLite and builds the lesson path.
import { getDatabase } from '../database/database';
import { LEVELS } from '../utils/levels.mjs';
import { WORDS_BY_LEVEL } from './words/index.mjs';
import { PHRASES_BY_LEVEL } from './phrases/index.mjs';
import { CURRICULUM } from '../curriculum/curriculum.mjs';
import { planLessons } from '../curriculum/curriculumBuilder.mjs';
import { persistCurriculum, getLessonCount } from '../database/lessonsRepository';

const BATCH = 100;

/**
 * Seeds level by level instead of "is the table empty?", so an existing
 * install picks up newly added levels without losing user_progress.
 */
export async function runSeedsIfNeeded() {
  const db = getDatabase();

  for (const level of LEVELS) {
    await seedWordsForLevel(db, level);
    await seedPhrasesForLevel(db, level);
  }

  await buildPathIfNeeded();
}

async function seedWordsForLevel(db, level) {
  const existing = await db.getFirstAsync(
    'SELECT COUNT(*) as count FROM words WHERE difficulty = ?',
    [level]
  );
  const words = WORDS_BY_LEVEL[level] || [];
  if (existing.count > 0 || words.length === 0) return;

  console.log(`🌱 Seeding ${words.length} ${level} words...`);
  await db.withTransactionAsync(async () => {
    for (let i = 0; i < words.length; i += BATCH) {
      const batch = words.slice(i, i + BATCH);
      const placeholders = batch.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
      const values = batch.flatMap(w => [
        w.english_word, w.spanish_trans, w.phonetic || null,
        w.category, w.subcategory || null, w.frequency_rank,
        w.difficulty, w.image_url || null, w.audio_url || null,
        w.example_en || null, w.example_es || null,
      ]);
      await db.runAsync(
        `INSERT INTO words
          (english_word, spanish_trans, phonetic, category, subcategory,
           frequency_rank, difficulty, image_url, audio_url, example_en, example_es)
         VALUES ${placeholders}`,
        values
      );
    }
  });
}

async function seedPhrasesForLevel(db, level) {
  const existing = await db.getFirstAsync(
    'SELECT COUNT(*) as count FROM phrases WHERE difficulty = ?',
    [level]
  );
  const phrases = PHRASES_BY_LEVEL[level] || [];
  if (existing.count > 0 || phrases.length === 0) return;

  console.log(`🌱 Seeding ${phrases.length} ${level} phrases...`);
  await db.withTransactionAsync(async () => {
    for (let i = 0; i < phrases.length; i += BATCH) {
      const batch = phrases.slice(i, i + BATCH);
      const placeholders = batch.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');
      const values = batch.flatMap(p => [
        p.phrase_en, p.phrase_es, p.category,
        p.context || null, p.difficulty,
        p.image_url || null, p.audio_url || null,
      ]);
      await db.runAsync(
        `INSERT INTO phrases
          (phrase_en, phrase_es, category, context, difficulty, image_url, audio_url)
         VALUES ${placeholders}`,
        values
      );
    }
  });
}

/**
 * Builds the path once. Lesson membership is frozen after this runs, so
 * words added later never shift the contents of a completed lesson.
 */
async function buildPathIfNeeded() {
  const count = await getLessonCount();
  if (count > 0) return;

  const { lessons, warnings } = planLessons(CURRICULUM, WORDS_BY_LEVEL, PHRASES_BY_LEVEL);
  for (const warning of warnings) {
    console.warn(`⚠️  Curriculum: ${warning}`);
  }

  const created = await persistCurriculum(lessons);
  console.log(`🗺️  Path built: ${created} lessons`);
}
```

- [ ] **Step 2: Probar sobre base limpia**

Borrá la app del emulador (o `Clear storage` en Android) y corré:

Run: `npx expo start --clear`
Expected: en la consola de Metro aparecen las cinco líneas de `🌱 Seeding … words`, las
cinco de frases, y `🗺️  Path built: 209 lessons`. Ninguna línea `⚠️  Curriculum:`.

- [ ] **Step 3: Probar sobre base existente**

Reinstalá sobre una base de la versión anterior (sin borrar datos): las palabras A1–B1 que
ya estaban no se reinsertan, sí entran B2 y C1, y la ruta se construye completa.

Verificalo con:

Run: `npx expo start` y en la app, pantalla Palabras → debe listar ~2.500 palabras.
Expected: el contador total sube y las categorías nuevas aparecen en la lista.

- [ ] **Step 4: Commit**

```bash
git add src/seeds/seedRunner.js
git commit -m "feat(seeds): seed per level and build the lesson path

Seeding now checks each level separately instead of the whole table, so
existing installs receive newly added levels without touching
user_progress. The path is materialized once, right after seeding."
```

---

### Task 12: Estado de nivel en el store

**Files:**
- Modify: `src/store/appStore.js`

**Interfaces:**
- Produces: `level`, `setLevel`, `placementDone`, `setPlacementDone`, `currentLessonId`, `setCurrentLessonId` en `useAppStore`

- [ ] **Step 1: Agregar el estado de nivel**

En `src/store/appStore.js`, dentro del bloque `// ── User ──`:

```js
  // ── Level / path ──────────────────────────
  // Mirrors user_config.level so screens can read it without hitting SQLite.
  level: 'A1',
  setLevel: (level) => set({ level }),

  placementDone: false,
  setPlacementDone: (done) => set({ placementDone: done }),

  currentLessonId: null,
  setCurrentLessonId: (id) => set({ currentLessonId: id }),
```

- [ ] **Step 2: Cargar el nivel al arrancar**

En `src/navigation/AppNavigator.jsx`, dentro de `checkFirstLaunch`, después de
`setOnboardingDoneStore(done)`:

```js
      useAppStore.getState().setLevel(config?.level || 'A1');
      useAppStore.getState().setPlacementDone(config?.placement_done === 1);
      useAppStore.getState().setCurrentLessonId(config?.current_lesson_id ?? null);
```

- [ ] **Step 3: Commit**

```bash
git add src/store/appStore.js src/navigation/AppNavigator.jsx
git commit -m "feat(store): track level, placement status and current lesson"
```

---

### Task 13: Servicio del test de ubicación

**Files:**
- Create: `src/services/placementService.mjs`
- Create: `tests/placementService.test.mjs`

**Interfaces:**
- Consumes: `LEVELS` (Task 1); `WORDS_BY_LEVEL` (Task 1)
- Produces:
  - `QUESTIONS_PER_LEVEL = 2`
  - `buildPlacementTest(wordsByLevel, rng?): Question[]` con `Question = { level, prompt, options: string[], answer: string }`. `prompt` es la palabra en inglés, `options` son cuatro traducciones al español, `answer` es la correcta.
  - `scorePlacement(answers): string` con `answers = { level, correct }[]` → nivel CEFR

- [ ] **Step 1: Escribir el test que falla**

`tests/placementService.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPlacementTest, scorePlacement, QUESTIONS_PER_LEVEL } from '../src/services/placementService.mjs';
import { LEVELS } from '../src/utils/levels.mjs';

function fixture() {
  const byLevel = {};
  for (const level of LEVELS) {
    byLevel[level] = Array.from({ length: 20 }, (_, i) => ({
      english_word: `${level}-word-${i}`,
      spanish_trans: `${level}-trad-${i}`,
      category: i % 2 === 0 ? 'alpha' : 'beta',
      difficulty: level,
      frequency_rank: i + 1,
    }));
  }
  return byLevel;
}

// Deterministic "random" so the test never flakes.
const fixedRng = () => 0.5;

test('builds two questions per level', () => {
  const questions = buildPlacementTest(fixture(), fixedRng);
  assert.equal(questions.length, LEVELS.length * QUESTIONS_PER_LEVEL);
  for (const level of LEVELS) {
    assert.equal(questions.filter(q => q.level === level).length, QUESTIONS_PER_LEVEL);
  }
});

test('every question has four distinct options including the answer', () => {
  const questions = buildPlacementTest(fixture(), fixedRng);
  for (const q of questions) {
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options).size, 4);
    assert.ok(q.options.includes(q.answer));
  }
});

test('questions run from easiest to hardest', () => {
  const questions = buildPlacementTest(fixture(), fixedRng);
  const order = questions.map(q => q.level);
  assert.deepEqual(order, LEVELS.flatMap(l => [l, l]));
});

test('scores A1 when nothing is right', () => {
  const answers = LEVELS.flatMap(level => [
    { level, correct: false },
    { level, correct: false },
  ]);
  assert.equal(scorePlacement(answers), 'A1');
});

test('scores the highest level reached without skipping one', () => {
  const answers = [
    { level: 'A1', correct: true },  { level: 'A1', correct: true },
    { level: 'A2', correct: true },  { level: 'A2', correct: false },
    { level: 'B1', correct: false }, { level: 'B1', correct: false },
    // Passing C1 after failing B1 must not count.
    { level: 'B2', correct: true },  { level: 'B2', correct: true },
    { level: 'C1', correct: true },  { level: 'C1', correct: true },
  ];
  assert.equal(scorePlacement(answers), 'A2');
});

test('scores C1 when every level passes', () => {
  const answers = LEVELS.flatMap(level => [
    { level, correct: true },
    { level, correct: true },
  ]);
  assert.equal(scorePlacement(answers), 'C1');
});

test('ignores levels with no answers', () => {
  const answers = [
    { level: 'A1', correct: true }, { level: 'A1', correct: true },
    { level: 'A2', correct: true }, { level: 'A2', correct: true },
  ];
  assert.equal(scorePlacement(answers), 'A2');
});
```

- [ ] **Step 2: Correr — debe fallar**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/services/placementService.mjs'`

- [ ] **Step 3: Escribir `src/services/placementService.mjs`**

```js
// saflash — Placement test: ten multiple-choice questions, two per level.
// Pure: takes the seed content as an argument, no database access.
import { LEVELS } from '../utils/levels.mjs';

export const QUESTIONS_PER_LEVEL = 2;
export const OPTIONS_PER_QUESTION = 4;

// Passing a level means getting at least this many of its questions right.
const PASS_THRESHOLD = 1;

function pick(pool, count, rng) {
  const copy = [...pool];
  const picked = [];
  while (picked.length < count && copy.length > 0) {
    const index = Math.floor(rng() * copy.length) % copy.length;
    picked.push(copy.splice(index, 1)[0]);
  }
  return picked;
}

/**
 * Distractors come from the same level and, when possible, the same category
 * as the answer. Same-category distractors keep the question about vocabulary
 * instead of letting the user rule options out by topic.
 */
function buildQuestion(word, levelPool, rng) {
  const sameCategory = levelPool.filter(
    w => w.category === word.category && w.spanish_trans !== word.spanish_trans
  );
  const anyOther = levelPool.filter(w => w.spanish_trans !== word.spanish_trans);

  const source = sameCategory.length >= OPTIONS_PER_QUESTION - 1 ? sameCategory : anyOther;
  const distractors = pick(source, OPTIONS_PER_QUESTION - 1, rng);

  const options = [word.spanish_trans, ...distractors.map(w => w.spanish_trans)];
  const shuffled = pick(options, options.length, rng);

  return {
    level: word.difficulty,
    prompt: word.english_word,
    options: shuffled,
    answer: word.spanish_trans,
  };
}

export function buildPlacementTest(wordsByLevel, rng = Math.random) {
  const questions = [];

  for (const level of LEVELS) {
    const pool = wordsByLevel[level] || [];
    if (pool.length < OPTIONS_PER_QUESTION) continue;

    for (const word of pick(pool, QUESTIONS_PER_LEVEL, rng)) {
      questions.push(buildQuestion(word, pool, rng));
    }
  }

  return questions;
}

/**
 * The highest level the user passed, provided every level below it passed
 * too. A lucky guess at C1 after failing B1 does not promote anyone.
 */
export function scorePlacement(answers) {
  let result = LEVELS[0];

  for (const level of LEVELS) {
    const forLevel = answers.filter(a => a.level === level);
    if (forLevel.length === 0) break;

    const correct = forLevel.filter(a => a.correct).length;
    if (correct < PASS_THRESHOLD) break;

    result = level;
  }

  return result;
}
```

- [ ] **Step 4: Correr — deben pasar**

Run: `npm test`
Expected: `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add src/services/placementService.mjs tests/placementService.test.mjs
git commit -m "feat(placement): generate and score the placement test

Ten questions, two per level, with same-category distractors. Scoring
assigns the highest level passed without skipping a level, so a lucky
guess at a hard level cannot promote a beginner."
```

---

### Task 14: Pantalla de selección de nivel

**Files:**
- Create: `src/screens/LevelPickScreen.jsx`
- Modify: `src/navigation/AppNavigator.jsx`

**Interfaces:**
- Consumes: `LEVELS`, `LEVEL_LABELS`, `LEVEL_SELF_DESCRIPTIONS` (Task 1); `setLevel`, `setPlacementDone` (Task 10); `unlockUpTo`, `getCurrentLesson` (Task 10); `useAppStore` (Task 12)
- Produces: ruta de navegación `LevelPick`, con `route.params.mode` en `'onboarding'` o `'change'`

- [ ] **Step 1: Escribir `src/screens/LevelPickScreen.jsx`**

```jsx
// saflash — Level picker. Used both at onboarding and when changing level later.
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, DifficultyColors } from '../theme/colors';
import { RADIUS, SPACING, SHADOW } from '../theme/spacing';
import { FONT_FAMILY } from '../theme/typography';
import { LEVEL_LABELS, LEVEL_SELF_DESCRIPTIONS } from '../utils/levels.mjs';
import { setLevel, setPlacementDone, setCurrentLesson, setOnboardingDone } from '../database/sessionRepository';
import { unlockUpTo, getCurrentLesson } from '../database/lessonsRepository';
import useAppStore from '../store/appStore';

// C1 is not offered here: you get there through the test or by moving up from B2.
const PICKABLE = ['A1', 'A2', 'B1', 'B2'];

export default function LevelPickScreen({ navigation, route }) {
  const mode = route.params?.mode || 'onboarding';
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  const storeLevel = useAppStore(s => s.level);
  const setStoreLevel = useAppStore(s => s.setLevel);
  const setStorePlacementDone = useAppStore(s => s.setPlacementDone);
  const setStoreCurrentLesson = useAppStore(s => s.setCurrentLessonId);
  const setStoreOnboardingDone = useAppStore(s => s.setOnboardingDone);

  const handleConfirm = async () => {
    if (!selected || saving) return;
    setSaving(true);

    await setLevel(selected);
    await setPlacementDone();
    await unlockUpTo(selected);

    const lesson = await getCurrentLesson();
    await setCurrentLesson(lesson?.id ?? null);

    setStoreLevel(selected);
    setStorePlacementDone(true);
    setStoreCurrentLesson(lesson?.id ?? null);

    if (mode === 'onboarding') {
      await setOnboardingDone();
      setStoreOnboardingDone(true);
      navigation.replace('MainTabs');
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>
          {mode === 'onboarding' ? '¿Cuánto inglés sabés?' : 'Cambiar mi nivel'}
        </Text>
        <Text style={styles.subtitle}>
          Elegí la opción que más te represente. Podés cambiarla cuando quieras.
        </Text>

        {PICKABLE.map(level => {
          const isSelected = selected === level;
          const isCurrent = mode === 'change' && storeLevel === level;
          return (
            <TouchableOpacity
              key={level}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => setSelected(level)}
              activeOpacity={0.85}
            >
              <View style={[styles.badge, { backgroundColor: DifficultyColors[level] }]}>
                <Text style={styles.badgeText}>{level}</Text>
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{LEVEL_SELF_DESCRIPTIONS[level]}</Text>
                <Text style={styles.cardSubtitle}>
                  {LEVEL_LABELS[level]}{isCurrent ? ' · tu nivel actual' : ''}
                </Text>
              </View>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={24} color={COLORS.successGreen} />
              )}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={styles.testLink}
          onPress={() => navigation.navigate('PlacementTest', { mode })}
          activeOpacity={0.7}
        >
          <Ionicons name="clipboard-outline" size={18} color={COLORS.textSecondary} />
          <Text style={styles.testLinkText}>Prefiero hacer un test rápido</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryButton, (!selected || saving) && styles.primaryButtonDisabled]}
          onPress={handleConfirm}
          disabled={!selected || saving}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color={COLORS.surfaceWhite} />
            : <Text style={styles.primaryButtonText}>Empezar</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.warmParchment },
  content: { padding: SPACING.xl, paddingBottom: SPACING.xxxl },
  title: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 26,
    color: COLORS.deepOlive,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.base,
    backgroundColor: COLORS.surfaceWhite,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.borderSage,
    padding: SPACING.base,
    marginBottom: SPACING.md,
  },
  cardSelected: { borderColor: COLORS.deepOlive, ...SHADOW.button },
  badge: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 15,
    color: COLORS.surfaceWhite,
  },
  cardText: { flex: 1 },
  cardTitle: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 16,
    color: COLORS.deepOlive,
  },
  cardSubtitle: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  testLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.base,
    marginTop: SPACING.sm,
  },
  testLinkText: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 15,
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
  },
  footer: { padding: SPACING.xl, paddingTop: SPACING.md },
  primaryButton: {
    backgroundColor: COLORS.deepOlive,
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonDisabled: { backgroundColor: COLORS.borderSage },
  primaryButtonText: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 16,
    color: COLORS.surfaceWhite,
  },
});
```

- [ ] **Step 2: Registrar la ruta**

En `src/navigation/AppNavigator.jsx`, importá la pantalla y agregá dentro del `Stack.Navigator`:

```jsx
      <Stack.Screen name="LevelPick" component={LevelPickScreen} />
```

- [ ] **Step 3: Redirigir el fin del onboarding**

En `src/screens/OnboardingScreen.jsx`, `handleSkip` y `handleFinish` dejan de marcar el
onboarding como terminado — eso ahora pasa al confirmar el nivel:

```js
  const handleSkip = () => {
    navigation.replace('LevelPick', { mode: 'onboarding' });
  };

  const handleFinish = () => {
    navigation.replace('LevelPick', { mode: 'onboarding' });
  };
```

Y borrá los imports que quedan sin uso: `setOnboardingDone`, `incrementTotalStudied`,
`useAppStore` y `setOnboardingDoneStore`.

- [ ] **Step 4: Probar a mano**

Run: `npx expo start --clear`, con la app borrada del emulador.
Expected: los tres slides → "Empezar a Aprender" → aparece la selección de nivel. Tocar una
tarjeta la resalta; "Empezar" queda deshabilitado hasta elegir. Al confirmar, entra a la
app. Cerrá y volvé a abrir: no vuelve a pedir el onboarding.

- [ ] **Step 5: Commit**

```bash
git add src/screens/LevelPickScreen.jsx src/navigation/AppNavigator.jsx src/screens/OnboardingScreen.jsx
git commit -m "feat(onboarding): add the level picker

Onboarding now ends on a level choice instead of dropping the user into
the app. Confirming a level unlocks that level's lessons and points the
path at the first one."
```

---

### Task 15: Pantalla del test de ubicación

**Files:**
- Create: `src/screens/PlacementTestScreen.jsx`
- Modify: `src/navigation/AppNavigator.jsx`

**Interfaces:**
- Consumes: `buildPlacementTest`, `scorePlacement` (Task 13); `WORDS_BY_LEVEL` (Task 1); mismos accesores que la tarea 14
- Produces: ruta `PlacementTest`, con `route.params.mode`

- [ ] **Step 1: Escribir `src/screens/PlacementTestScreen.jsx`**

```jsx
// saflash — Placement test: ten questions, then a level.
import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, DifficultyColors } from '../theme/colors';
import { RADIUS, SPACING } from '../theme/spacing';
import { FONT_FAMILY } from '../theme/typography';
import ProgressBar from '../components/ProgressBar';
import { buildPlacementTest, scorePlacement } from '../services/placementService.mjs';
import { WORDS_BY_LEVEL } from '../seeds/words/index.mjs';
import { LEVEL_LABELS } from '../utils/levels.mjs';
import { setLevel, setPlacementDone, setCurrentLesson, setOnboardingDone } from '../database/sessionRepository';
import { unlockUpTo, getCurrentLesson } from '../database/lessonsRepository';
import useAppStore from '../store/appStore';

export default function PlacementTestScreen({ navigation, route }) {
  const mode = route.params?.mode || 'onboarding';

  // Built once per mount so answering never reshuffles the questions.
  const questions = useMemo(() => buildPlacementTest(WORDS_BY_LEVEL), []);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  const setStoreLevel = useAppStore(s => s.setLevel);
  const setStorePlacementDone = useAppStore(s => s.setPlacementDone);
  const setStoreCurrentLesson = useAppStore(s => s.setCurrentLessonId);
  const setStoreOnboardingDone = useAppStore(s => s.setOnboardingDone);

  const question = questions[index];

  const handleAnswer = (option) => {
    const next = [...answers, { level: question.level, correct: option === question.answer }];
    setAnswers(next);

    if (index + 1 < questions.length) {
      setIndex(index + 1);
    } else {
      setResult(scorePlacement(next));
    }
  };

  const handleAccept = async () => {
    await setLevel(result);
    await setPlacementDone();
    await unlockUpTo(result);

    const lesson = await getCurrentLesson();
    await setCurrentLesson(lesson?.id ?? null);

    setStoreLevel(result);
    setStorePlacementDone(true);
    setStoreCurrentLesson(lesson?.id ?? null);

    if (mode === 'onboarding') {
      await setOnboardingDone();
      setStoreOnboardingDone(true);
      navigation.replace('MainTabs');
    } else {
      navigation.navigate('MainTabs');
    }
  };

  // Quitting mid-test keeps whatever the user declared on the picker.
  const handleQuit = () => navigation.goBack();

  if (result) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Tu nivel es</Text>
          <View style={[styles.resultBadge, { backgroundColor: DifficultyColors[result] }]}>
            <Text style={styles.resultBadgeText}>{result}</Text>
          </View>
          <Text style={styles.resultTitle}>{LEVEL_LABELS[result]}</Text>
          <Text style={styles.resultText}>
            Vamos a empezar por acá. Si te resulta muy fácil o muy difícil, lo cambiás cuando quieras.
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleAccept} activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>Empezar a Aprender</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleQuit}>
          <Ionicons name="close" size={28} color={COLORS.oliveInk} />
        </TouchableOpacity>
        <View style={styles.progressWrapper}>
          <ProgressBar current={index} total={questions.length} color={COLORS.deepOlive} height={4} />
        </View>
        <Text style={styles.counter}>{index + 1} / {questions.length}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.question}>¿Qué significa</Text>
        <Text style={styles.word}>{question.prompt}?</Text>

        <View style={styles.options}>
          {question.options.map(option => (
            <TouchableOpacity
              key={option}
              style={styles.option}
              onPress={() => handleAnswer(option)}
              activeOpacity={0.8}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.warmParchment },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
  },
  progressWrapper: { flex: 1 },
  counter: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  body: { flex: 1, padding: SPACING.xl, justifyContent: 'center' },
  question: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  word: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 34,
    color: COLORS.deepOlive,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  options: { gap: SPACING.md },
  option: {
    backgroundColor: COLORS.surfaceWhite,
    borderWidth: 1,
    borderColor: COLORS.borderSage,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.lg,
  },
  optionText: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 16,
    color: COLORS.oliveInk,
    textAlign: 'center',
  },
  resultBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.base,
  },
  resultLabel: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  resultBadge: {
    width: 88,
    height: 88,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultBadgeText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 32,
    color: COLORS.surfaceWhite,
  },
  resultTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 24,
    color: COLORS.deepOlive,
  },
  resultText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  primaryButton: {
    backgroundColor: COLORS.deepOlive,
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    paddingHorizontal: SPACING.xxxl,
  },
  primaryButtonText: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 16,
    color: COLORS.surfaceWhite,
  },
});
```

- [ ] **Step 2: Registrar la ruta**

En `src/navigation/AppNavigator.jsx`:

```jsx
      <Stack.Screen name="PlacementTest" component={PlacementTestScreen} />
```

- [ ] **Step 3: Probar a mano**

Run: `npx expo start`, app borrada.
Expected: onboarding → "Prefiero hacer un test rápido" → diez preguntas, cada una con
cuatro opciones distintas y la barra de progreso avanzando. Al terminar, muestra el nivel y
entra a la app. Salir con la X a mitad de camino vuelve al selector sin haber cambiado nada.

- [ ] **Step 4: Commit**

```bash
git add src/screens/PlacementTestScreen.jsx src/navigation/AppNavigator.jsx
git commit -m "feat(onboarding): add the optional placement test screen"
```

---

### Task 16: Puntaje y ajuste de nivel

**Files:**
- Create: `src/services/lessonScoring.mjs`
- Create: `src/services/levelAdjustment.mjs`
- Create: `tests/levelAdjustment.test.mjs`

**Interfaces:**
- Consumes: `nextLevel`, `prevLevel` (Task 1)
- Produces:
  - `starsFor(easyRatio): 1|2|3` y `easyRatio(stats): number` desde `lessonScoring.mjs`, con `stats = { easy, medium, hard }`
  - `suggestLevelChange(level, recentRatios, lessonsSinceDismiss): Suggestion|null` desde `levelAdjustment.mjs`, con `Suggestion = { direction: 'up'|'down', from: string, to: string }`
  - Constantes `LOOKBACK_LESSONS = 3`, `DISMISS_LESSONS = 10`, `UP_THRESHOLD = 0.9`, `DOWN_THRESHOLD = 0.4`

- [ ] **Step 1: Escribir el test que falla**

`tests/levelAdjustment.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { starsFor, easyRatio } from '../src/services/lessonScoring.mjs';
import { suggestLevelChange, DISMISS_LESSONS } from '../src/services/levelAdjustment.mjs';

test('easyRatio is the share of easy ratings', () => {
  assert.equal(easyRatio({ easy: 8, medium: 1, hard: 1 }), 0.8);
  assert.equal(easyRatio({ easy: 0, medium: 0, hard: 10 }), 0);
  assert.equal(easyRatio({ easy: 0, medium: 0, hard: 0 }), 0);
});

test('stars follow the 0.8 / 0.5 thresholds', () => {
  assert.equal(starsFor(1), 3);
  assert.equal(starsFor(0.8), 3);
  assert.equal(starsFor(0.79), 2);
  assert.equal(starsFor(0.5), 2);
  assert.equal(starsFor(0.49), 1);
  assert.equal(starsFor(0), 1);
});

test('suggests moving up after three very easy lessons', () => {
  const s = suggestLevelChange('A2', [1, 0.9, 0.95], null);
  assert.deepEqual(s, { direction: 'up', from: 'A2', to: 'B1' });
});

test('suggests moving down after three hard lessons', () => {
  const s = suggestLevelChange('B1', [0.3, 0.4, 0.2], null);
  assert.deepEqual(s, { direction: 'down', from: 'B1', to: 'A2' });
});

test('stays quiet in the middle band', () => {
  assert.equal(suggestLevelChange('A2', [0.6, 0.7, 0.5], null), null);
});

test('needs three lessons before saying anything', () => {
  assert.equal(suggestLevelChange('A2', [1, 1], null), null);
});

test('only looks at the last three lessons', () => {
  const s = suggestLevelChange('A2', [1, 1, 1, 0, 0, 0], null);
  assert.deepEqual(s, { direction: 'up', from: 'A2', to: 'B1' });
});

test('never suggests above C1 or below A1', () => {
  assert.equal(suggestLevelChange('C1', [1, 1, 1], null), null);
  assert.equal(suggestLevelChange('A1', [0, 0, 0], null), null);
});

test('stays quiet for ten lessons after a dismissal', () => {
  assert.equal(suggestLevelChange('A2', [1, 1, 1], 0), null);
  assert.equal(suggestLevelChange('A2', [1, 1, 1], DISMISS_LESSONS - 1), null);
  assert.deepEqual(
    suggestLevelChange('A2', [1, 1, 1], DISMISS_LESSONS),
    { direction: 'up', from: 'A2', to: 'B1' }
  );
});
```

- [ ] **Step 2: Correr — debe fallar**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/services/lessonScoring.mjs'`

- [ ] **Step 3: Escribir `src/services/lessonScoring.mjs`**

```js
// saflash — Lesson scoring: how a session's ratings become stars.

export const THREE_STAR_RATIO = 0.8;
export const TWO_STAR_RATIO = 0.5;

/**
 * The share of cards the user rated "Fácil". One number that drives both the
 * star count and the level suggestion.
 */
export function easyRatio({ easy = 0, medium = 0, hard = 0 } = {}) {
  const total = easy + medium + hard;
  if (total === 0) return 0;
  return easy / total;
}

export function starsFor(ratio) {
  if (ratio >= THREE_STAR_RATIO) return 3;
  if (ratio >= TWO_STAR_RATIO) return 2;
  return 1;
}
```

- [ ] **Step 4: Escribir `src/services/levelAdjustment.mjs`**

```js
// saflash — Suggests moving up or down a level. Suggests only: the user decides.
import { nextLevel, prevLevel } from '../utils/levels.mjs';

export const LOOKBACK_LESSONS = 3;
export const DISMISS_LESSONS = 10;
export const UP_THRESHOLD = 0.9;
export const DOWN_THRESHOLD = 0.4;

/**
 * @param {string} level - the user's current level
 * @param {number[]} recentRatios - easy-rating ratios, most recent first
 * @param {number|null} lessonsSinceDismiss - lessons completed since the user
 *   dismissed a suggestion, or null if they never dismissed one
 */
export function suggestLevelChange(level, recentRatios, lessonsSinceDismiss) {
  if (lessonsSinceDismiss !== null && lessonsSinceDismiss < DISMISS_LESSONS) {
    return null;
  }
  if (!Array.isArray(recentRatios) || recentRatios.length < LOOKBACK_LESSONS) {
    return null;
  }

  const window = recentRatios.slice(0, LOOKBACK_LESSONS);
  const average = window.reduce((sum, r) => sum + r, 0) / window.length;

  if (average >= UP_THRESHOLD) {
    const to = nextLevel(level);
    return to ? { direction: 'up', from: level, to } : null;
  }

  if (average <= DOWN_THRESHOLD) {
    const to = prevLevel(level);
    return to ? { direction: 'down', from: level, to } : null;
  }

  return null;
}
```

- [ ] **Step 5: Correr — deben pasar**

Run: `npm test`
Expected: `# fail 0`, con los tres archivos de test corriendo.

- [ ] **Step 6: Commit**

```bash
git add src/services/lessonScoring.mjs src/services/levelAdjustment.mjs tests/levelAdjustment.test.mjs
git commit -m "feat(level): add lesson scoring and level-change suggestions

One number, the share of Fácil ratings, drives both the star count and
the suggestion to move up or down. Dismissing a suggestion silences it
for ten lessons."
```

---

### Task 17: Componentes de la ruta

**Files:**
- Create: `src/components/LessonNode.jsx`
- Create: `src/components/UnitHeader.jsx`
- Create: `src/components/HomeHeader.jsx`

**Interfaces:**
- Consumes: `DifficultyColors` (existente); `useProgress` (existente)
- Produces:
  - `<LessonNode lesson isCurrent onPress />` — `lesson` es un `PathLesson` (Task 10)
  - `<UnitHeader title icon level index total />`
  - `<HomeHeader />` — sin props, lee `useProgress` y el store

- [ ] **Step 1: Escribir `src/components/LessonNode.jsx`**

```jsx
// saflash — One lesson on the path: locked, current, or completed.
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, DifficultyColors } from '../theme/colors';
import { SPACING, SHADOW } from '../theme/spacing';
import { FONT_FAMILY } from '../theme/typography';

const SIZE = 64;

export default function LessonNode({ lesson, isCurrent, onPress }) {
  const locked = lesson.status === 'locked';
  const completed = lesson.status === 'completed';
  const levelColor = DifficultyColors[lesson.level] || COLORS.deepOlive;

  const circleStyle = [
    styles.circle,
    locked && styles.circleLocked,
    completed && { backgroundColor: levelColor },
    !locked && !completed && { backgroundColor: COLORS.surfaceWhite, borderColor: levelColor },
    isCurrent && styles.circleCurrent,
  ];

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={circleStyle}
        onPress={() => !locked && onPress(lesson)}
        disabled={locked}
        activeOpacity={0.85}
      >
        {locked && <Ionicons name="lock-closed" size={24} color={COLORS.textPlaceholder} />}
        {completed && <Ionicons name="checkmark" size={30} color={COLORS.surfaceWhite} />}
        {!locked && !completed && (
          <Text style={[styles.number, { color: levelColor }]}>{lesson.lesson_index + 1}</Text>
        )}
      </TouchableOpacity>

      {completed && (
        <View style={styles.stars}>
          {[1, 2, 3].map(n => (
            <Ionicons
              key={n}
              name={n <= lesson.stars ? 'star' : 'star-outline'}
              size={12}
              color={n <= lesson.stars ? COLORS.starYellow : COLORS.borderSage}
            />
          ))}
        </View>
      )}

      {isCurrent && <Text style={styles.currentLabel}>Acá vas</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', gap: SPACING.xs },
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
    ...SHADOW.button,
  },
  circleLocked: {
    backgroundColor: COLORS.lightSage,
    borderColor: COLORS.borderSage,
  },
  circleCurrent: {
    borderColor: COLORS.accentOrange,
    borderWidth: 4,
    ...SHADOW.card,
  },
  number: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 22,
  },
  stars: { flexDirection: 'row', gap: 2 },
  currentLabel: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 11,
    color: COLORS.accentOrange,
  },
});
```

- [ ] **Step 2: Escribir `src/components/UnitHeader.jsx`**

```jsx
// saflash — Section header separating one unit from the next on the path.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, DifficultyColors } from '../theme/colors';
import { RADIUS, SPACING } from '../theme/spacing';
import { FONT_FAMILY } from '../theme/typography';

export default function UnitHeader({ title, icon, level, index, total }) {
  const color = DifficultyColors[level] || COLORS.deepOlive;

  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>
          {level} · Unidad {index + 1} de {total}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.base,
    marginTop: SPACING.xl,
    marginBottom: SPACING.base,
  },
  icon: { fontSize: 28 },
  text: { flex: 1 },
  title: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 18,
    color: COLORS.surfaceWhite,
  },
  meta: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 12,
    color: COLORS.surfaceWhite,
    opacity: 0.85,
  },
});
```

- [ ] **Step 3: Extraer `src/components/HomeHeader.jsx` desde `HomeScreen.jsx`**

Es el bloque de saludo, racha, meta diaria y estadísticas de `HomeScreen.jsx` (líneas 43–65),
con su propia carga de datos:

```jsx
// saflash — Greeting, streak, daily goal and stats. Sits on top of the path.
import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../theme/colors';
import { RADIUS, SPACING } from '../theme/spacing';
import { FONT_FAMILY } from '../theme/typography';
import { useProgress } from '../hooks/useProgress';
import useAppStore from '../store/appStore';
import StreakBadge from './StreakBadge';
import ProgressBar from './ProgressBar';
import StatsCard from './StatsCard';
import { formatNumber } from '../utils/formatters';
import { getCurrentMonthYear } from '../utils/dateUtils';

export default function HomeHeader() {
  const { study, todayStudied, streak, dailyGoal, refresh } = useProgress();
  const dailyGoalStore = useAppStore(s => s.dailyGoal);
  const goal = dailyGoalStore || dailyGoal || 20;

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return (
    <View>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Hola! 👋</Text>
          <Text style={styles.date}>{getCurrentMonthYear()}</Text>
        </View>
        <StreakBadge days={streak} />
      </View>

      <View style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <Text style={styles.goalTitle}>Meta diaria</Text>
          <Text style={styles.goalCount}>{todayStudied} / {goal}</Text>
        </View>
        <ProgressBar current={todayStudied} total={goal} color={COLORS.successGreen} />
      </View>

      <View style={styles.statsRow}>
        <StatsCard icon="today" value={todayStudied} label="Hoy" color={COLORS.accentOrange} />
        <StatsCard icon="flame" value={`${streak}`} label="Racha" color={COLORS.amberGold} />
        <StatsCard
          icon="checkmark-done"
          value={formatNumber(study.knownCount)}
          label="Conocidas"
          color={COLORS.successGreen}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  greeting: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 26,
    color: COLORS.deepOlive,
  },
  date: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  goalCard: {
    backgroundColor: COLORS.surfaceWhite,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    marginBottom: SPACING.base,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  goalTitle: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 15,
    color: COLORS.deepOlive,
  },
  goalCount: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 15,
    color: COLORS.successGreen,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
});
```

- [ ] **Step 4: Commit**

```bash
git add src/components/LessonNode.jsx src/components/UnitHeader.jsx src/components/HomeHeader.jsx
git commit -m "feat(path): add lesson node, unit header and home header components"
```

---

### Task 18: La ruta

**Files:**
- Create: `src/hooks/useLessonPath.js`
- Create: `src/screens/PathScreen.jsx`
- Create: `src/navigation/PathNavigator.jsx`
- Modify: `src/navigation/MainTabNavigator.jsx`
- Delete: `src/screens/HomeScreen.jsx`

**Interfaces:**
- Consumes: `getPath`, `getCurrentLesson` (Task 10); `LessonNode`, `UnitHeader`, `HomeHeader` (Task 17)
- Produces:
  - `useLessonPath(): { units, currentLesson, loading, refresh }`
  - Ruta `Path` dentro de `PathNavigator`, y `StudyLesson` (registrada en la tarea 19)

- [ ] **Step 1: Escribir `src/hooks/useLessonPath.js`**

```js
// saflash — Loads the lesson path and the lesson to continue from.
import { useState, useCallback, useEffect } from 'react';
import { getPath, getCurrentLesson } from '../database/lessonsRepository';

export function useLessonPath() {
  const [units, setUnits] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const [loadedUnits, current] = await Promise.all([getPath(), getCurrentLesson()]);
      setUnits(loadedUnits);
      setCurrentLesson(current);
    } catch (err) {
      console.error('Error loading lesson path:', err);
      setUnits([]);
      setCurrentLesson(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { units, currentLesson, loading, refresh };
}
```

- [ ] **Step 2: Escribir `src/screens/PathScreen.jsx`**

```jsx
// saflash — The guided path: the app's home screen.
import React, { useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../theme/colors';
import { RADIUS, SPACING, SHADOW } from '../theme/spacing';
import { FONT_FAMILY } from '../theme/typography';
import { useLessonPath } from '../hooks/useLessonPath';
import HomeHeader from '../components/HomeHeader';
import UnitHeader from '../components/UnitHeader';
import LessonNode from '../components/LessonNode';

// Horizontal offsets that give the path its winding shape.
const OFFSETS = [0, 56, 84, 56, 0, -56, -84, -56];

export default function PathScreen({ navigation }) {
  const { units, currentLesson, loading, refresh } = useLessonPath();
  const scrollRef = useRef(null);
  const currentY = useRef(null);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // Scrolls to the current lesson once its position is known. Without this the
  // user lands at A1 lesson 1 every time, however far along the path they are.
  const scrollToCurrent = useCallback(() => {
    if (currentY.current == null) return;
    scrollRef.current?.scrollTo({
      y: Math.max(0, currentY.current - 160),
      animated: false,
    });
  }, []);

  const openLesson = (lesson) => {
    navigation.navigate('StudyLesson', { lessonId: lesson.id });
  };

  const handleContinue = () => {
    if (currentLesson) openLesson(currentLesson);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.deepOlive} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader />

        {/* Units render flat, not nested, so onLayout y is measured against the
            scroll content and can be used to jump straight to the current lesson. */}
        {units.map(unit => (
          <React.Fragment key={`${unit.level}-${unit.unit_index}`}>
            <UnitHeader
              title={unit.unit_title}
              icon={unit.icon}
              level={unit.level}
              index={unit.unit_index}
              total={units.filter(u => u.level === unit.level).length}
            />
            {unit.lessons.map((lesson, i) => {
              const isCurrent = currentLesson?.id === lesson.id;
              return (
                <View
                  key={lesson.id}
                  style={[styles.nodeRow, { marginLeft: OFFSETS[i % OFFSETS.length] }]}
                  onLayout={e => {
                    if (!isCurrent) return;
                    currentY.current = e.nativeEvent.layout.y;
                    scrollToCurrent();
                  }}
                >
                  <LessonNode lesson={lesson} isCurrent={isCurrent} onPress={openLesson} />
                </View>
              );
            })}
          </React.Fragment>
        ))}

        {units.length === 0 && (
          <Text style={styles.empty}>
            La ruta todavía no está lista. Cerrá y volvé a abrir la app.
          </Text>
        )}
      </ScrollView>

      {currentLesson && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.85}>
            <Ionicons name="play" size={20} color={COLORS.surfaceWhite} />
            <Text style={styles.continueText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.warmParchment },
  centered: {
    flex: 1,
    backgroundColor: COLORS.warmParchment,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: SPACING.base,
    paddingBottom: 96,
  },
  nodeRow: {
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  empty: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xxxl,
  },
  footer: {
    position: 'absolute',
    left: SPACING.base,
    right: SPACING.base,
    bottom: SPACING.base,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.deepOlive,
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    ...SHADOW.card,
  },
  continueText: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 16,
    color: COLORS.surfaceWhite,
  },
});
```

- [ ] **Step 3: Escribir `src/navigation/PathNavigator.jsx`**

```jsx
// saflash — Home tab stack: the path plus the lesson session.
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PathScreen from '../screens/PathScreen';
import StudyLessonScreen from '../screens/StudyLessonScreen';

const Stack = createNativeStackNavigator();

export default function PathNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Path" component={PathScreen} />
      <Stack.Screen
        name="StudyLesson"
        component={StudyLessonScreen}
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
}
```

Esta tarea deja `StudyLessonScreen` sin existir todavía: creá el archivo con un stub para
que el bundler no falle, y la tarea 19 lo completa.

```jsx
// src/screens/StudyLessonScreen.jsx — stub, completed in Task 19
import React from 'react';
import { View } from 'react-native';

export default function StudyLessonScreen() {
  return <View />;
}
```

- [ ] **Step 4: Cambiar la pestaña Inicio**

En `src/navigation/MainTabNavigator.jsx`, reemplazá el import de `HomeScreen` por
`PathNavigator` y la pantalla:

```jsx
import PathNavigator from './PathNavigator';
```

```jsx
      <Tab.Screen
        name="Home"
        component={PathNavigator}
        options={{ tabBarLabel: 'Inicio' }}
      />
```

- [ ] **Step 5: Borrar `HomeScreen.jsx`**

```bash
rm src/screens/HomeScreen.jsx
```

Verificá que nadie más lo importe:

Run: `grep -rn "HomeScreen" src/`
Expected: sin resultados.

- [ ] **Step 6: Probar a mano**

Run: `npx expo start --clear`
Expected: la pestaña Inicio muestra la cabecera de siempre y debajo el recorrido: cabecera
de unidad de colores, nodos alternados a izquierda y derecha, el primero con el anillo
naranja y "Acá vas", el resto con candado. El botón "Continuar" está fijo abajo. Tocar un
nodo bloqueado no hace nada. Al elegir un nivel alto (B1) la lista abre ya desplazada a la
primera lección de ese nivel, no arriba de todo.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(path): add the path screen as the home tab

Replaces HomeScreen with PathScreen, which keeps the old greeting and
stats header and adds the winding lesson path below it. Free browsing
stays available on the Palabras and Frases tabs."
```

---

### Task 19: Sesión de lección

**Files:**
- Create: `src/hooks/useLessonSession.js`
- Modify: `src/screens/StudyLessonScreen.jsx` (reemplaza el stub)

**Interfaces:**
- Consumes: `getLessonCards`, `completeLesson` (Task 10); `easyRatio`, `starsFor` (Task 16); `calculateNextReview`, `getDefaultProgress` (existente); `upsertProgress`, `getProgress` (existente); `saveSession`, `incrementTotalStudied`, `updateStreak`, `setCurrentLesson` (existente + Task 10)
- Produces:
  - `useLessonSession(lessonId): { cards, currentCard, currentIndex, totalCards, loading, error, stats, isComplete, scoreCard, finish }`
  - `finish(): Promise<{ stars, ratio, nextLessonId }>`

- [ ] **Step 1: Escribir `src/hooks/useLessonSession.js`**

```js
// saflash — Study session over a lesson's fixed deck.
// Differs from useStudySession only in where the deck comes from: ten frozen
// cards instead of an SM-2 queue. Ratings still land in user_progress, so
// spaced repetition keeps working in free-browse mode.
import { useState, useCallback, useEffect } from 'react';
import { getLessonCards, completeLesson } from '../database/lessonsRepository';
import { getProgress, upsertProgress } from '../database/progressRepository';
import { saveSession, incrementTotalStudied, updateStreak, setCurrentLesson } from '../database/sessionRepository';
import { calculateNextReview, getDefaultProgress } from '../services/spacedRepetition';
import { easyRatio, starsFor } from '../services/lessonScoring.mjs';
import { RATING } from '../utils/constants';

export function useLessonSession(lessonId) {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ easy: 0, medium: 0, hard: 0, startedAt: null });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const loaded = await getLessonCards(lessonId);
        if (cancelled) return;
        setCards(loaded);
        setCurrentIndex(0);
        setStats({ easy: 0, medium: 0, hard: 0, startedAt: Date.now() });
      } catch (err) {
        console.error('Error loading lesson cards:', err);
        if (!cancelled) setError('No se pudo cargar la lección.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [lessonId]);

  const currentCard = cards[currentIndex] || null;
  const totalCards = cards.length;
  const isComplete = totalCards > 0 && currentIndex >= totalCards;

  const scoreCard = useCallback(async (rating) => {
    if (!currentCard) return;

    const cardType = currentCard.card_type;
    const existing = await getProgress(cardType, currentCard.id);
    const updated = calculateNextReview(existing || getDefaultProgress(), rating);
    await upsertProgress(cardType, currentCard.id, updated);

    setStats(prev => ({
      ...prev,
      easy: rating === RATING.EASY ? prev.easy + 1 : prev.easy,
      medium: rating === RATING.MEDIUM ? prev.medium + 1 : prev.medium,
      hard: rating === RATING.HARD ? prev.hard + 1 : prev.hard,
    }));

    setCurrentIndex(prev => prev + 1);
  }, [currentCard]);

  /**
   * Writes the lesson result, unlocks the next lesson, and records the
   * session for the streak and daily goal.
   */
  const finish = useCallback(async () => {
    const studied = stats.easy + stats.medium + stats.hard;
    const ratio = easyRatio(stats);
    const stars = starsFor(ratio);

    const { nextLessonId } = await completeLesson(lessonId, ratio, stars);
    await setCurrentLesson(nextLessonId);

    if (studied > 0) {
      const durationSecs = Math.floor((Date.now() - (stats.startedAt || Date.now())) / 1000);
      await saveSession({
        session_date: new Date().toISOString().split('T')[0],
        session_type: 'lesson',
        cards_studied: studied,
        cards_correct: stats.easy,
        cards_medium: stats.medium,
        cards_hard: stats.hard,
        duration_secs: durationSecs,
      });
      await incrementTotalStudied(studied);
      await updateStreak();
    }

    return { stars, ratio, nextLessonId };
  }, [lessonId, stats]);

  return {
    cards,
    currentCard,
    currentIndex,
    totalCards,
    loading,
    error,
    stats,
    isComplete,
    scoreCard,
    finish,
  };
}
```

- [ ] **Step 2: Escribir `src/screens/StudyLessonScreen.jsx`**

Reemplaza el stub por completo:

```jsx
// saflash — A lesson: ten fixed cards, then stars.
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { RADIUS, SPACING } from '../theme/spacing';
import { FONT_FAMILY } from '../theme/typography';
import { useLessonSession } from '../hooks/useLessonSession';
import FlashCard from '../components/FlashCard';
import ProgressBar from '../components/ProgressBar';
import LoadingCard from '../components/LoadingCard';

export default function StudyLessonScreen({ navigation, route }) {
  const lessonId = route.params?.lessonId;
  const {
    currentCard,
    currentIndex,
    totalCards,
    loading,
    error,
    stats,
    isComplete,
    scoreCard,
    finish,
  } = useLessonSession(lessonId);

  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  // Runs once, the moment the last card is rated.
  useEffect(() => {
    if (!isComplete || result || saving) return;
    setSaving(true);
    finish()
      .then(setResult)
      .catch(err => console.error('Error finishing lesson:', err))
      .finally(() => setSaving(false));
  }, [isComplete, result, saving, finish]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color={COLORS.oliveInk} />
          </TouchableOpacity>
        </View>
        <LoadingCard />
      </SafeAreaView>
    );
  }

  if (error || totalCards === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.textPlaceholder} />
          <Text style={styles.emptyTitle}>{error || 'Esta lección no tiene tarjetas'}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.primaryButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isComplete) {
    if (!result) {
      return (
        <SafeAreaView style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.deepOlive} />
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.congrats}>🎉 ¡Lección completada!</Text>

          <View style={styles.stars}>
            {[1, 2, 3].map(n => (
              <Ionicons
                key={n}
                name={n <= result.stars ? 'star' : 'star-outline'}
                size={44}
                color={n <= result.stars ? COLORS.starYellow : COLORS.borderSage}
              />
            ))}
          </View>

          <Text style={styles.resultText}>
            {stats.easy} de {totalCards} te resultaron fáciles
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>
              {result.nextLessonId ? 'Volver a la ruta' : '¡Terminaste todo!'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={COLORS.oliveInk} />
        </TouchableOpacity>
        <View style={styles.progressWrapper}>
          <ProgressBar current={currentIndex} total={totalCards} color={COLORS.deepOlive} height={4} />
        </View>
        <Text style={styles.counter}>{currentIndex + 1} / {totalCards}</Text>
      </View>

      <View style={styles.cardArea}>
        <FlashCard
          card={currentCard}
          cardType={currentCard.card_type}
          onRatingPress={scoreCard}
        />
      </View>

      <Text style={styles.hint}>Toca la tarjeta para ver la traducción</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.warmParchment },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
  },
  progressWrapper: { flex: 1 },
  counter: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  cardArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hint: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 13,
    color: COLORS.textPlaceholder,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
    gap: SPACING.base,
    backgroundColor: COLORS.warmParchment,
  },
  congrats: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 24,
    color: COLORS.deepOlive,
    textAlign: 'center',
  },
  stars: { flexDirection: 'row', gap: SPACING.sm },
  resultText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.deepOlive,
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    paddingHorizontal: SPACING.xxxl,
  },
  primaryButtonText: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 16,
    color: COLORS.surfaceWhite,
  },
});
```

- [ ] **Step 3: Probar el ciclo completo a mano**

Run: `npx expo start`
Expected:
1. "Continuar" abre la primera lección.
2. Diez tarjetas, el contador va de 1/10 a 10/10.
3. Al calificar la décima, aparecen las estrellas.
4. Con las diez en "Fácil" → 3 estrellas. Con las diez en "Difícil" → 1 estrella.
5. "Volver a la ruta" muestra la lección 1 completada con sus estrellas y la 2 desbloqueada
   con el anillo naranja.
6. La racha y la meta diaria de la cabecera suben en 10.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useLessonSession.js src/screens/StudyLessonScreen.jsx
git commit -m "feat(path): add the lesson study session

Ten fixed cards per lesson instead of an SM-2 queue, but ratings still
write to user_progress so spaced repetition keeps working in free-browse
mode. Finishing awards stars and unlocks the next lesson."
```

---

### Task 20: Sugerencia de cambio de nivel

**Files:**
- Create: `src/components/LevelSuggestionCard.jsx`
- Modify: `src/screens/StudyLessonScreen.jsx`

**Interfaces:**
- Consumes: `suggestLevelChange` (Task 16); `getRecentAccuracies`, `getCompletedCount`, `unlockUpTo`, `getCurrentLesson` (Task 10); `setLevel`, `setCurrentLesson`, `dismissLevelSuggestion` (Task 10)
- Produces: `<LevelSuggestionCard suggestion onAccept onDismiss />`

- [ ] **Step 1: Escribir `src/components/LevelSuggestionCard.jsx`**

```jsx
// saflash — Offers a level change after a run of very easy or very hard lessons.
// Offers only: accepting is always the user's call.
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, DifficultyColors } from '../theme/colors';
import { RADIUS, SPACING } from '../theme/spacing';
import { FONT_FAMILY } from '../theme/typography';
import { LEVEL_LABELS } from '../utils/levels.mjs';

export default function LevelSuggestionCard({ suggestion, onAccept, onDismiss }) {
  const up = suggestion.direction === 'up';
  const color = DifficultyColors[suggestion.to] || COLORS.deepOlive;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Ionicons
          name={up ? 'trending-up' : 'trending-down'}
          size={22}
          color={color}
        />
        <Text style={styles.title}>
          {up ? '¿Te resulta muy fácil?' : '¿Te resulta muy difícil?'}
        </Text>
      </View>

      <Text style={styles.text}>
        {up
          ? `Venís muy bien. Podés pasar a ${suggestion.to} (${LEVEL_LABELS[suggestion.to]}).`
          : `No pasa nada. Probá con ${suggestion.to} (${LEVEL_LABELS[suggestion.to]}) y volvé cuando quieras.`}
      </Text>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.dismissButton]}
          onPress={onDismiss}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: COLORS.oliveInk }]}>Seguir igual</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: color }]}
          onPress={onAccept}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: COLORS.surfaceWhite }]}>
            Pasar a {suggestion.to}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceWhite,
    borderWidth: 1,
    borderColor: COLORS.borderSage,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    gap: SPACING.sm,
    width: '100%',
    maxWidth: 380,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  title: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 16,
    color: COLORS.deepOlive,
  },
  text: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  buttons: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs },
  button: {
    flex: 1,
    borderRadius: RADIUS.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dismissButton: { backgroundColor: COLORS.sageCream },
  buttonText: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 14,
  },
});
```

- [ ] **Step 2: Calcular la sugerencia al terminar la lección**

En `src/screens/StudyLessonScreen.jsx`, agregá los imports:

```jsx
import LevelSuggestionCard from '../components/LevelSuggestionCard';
import { suggestLevelChange } from '../services/levelAdjustment.mjs';
import { getRecentAccuracies, getCompletedCount, unlockUpTo, getCurrentLesson } from '../database/lessonsRepository';
import { setLevel, setCurrentLesson, dismissLevelSuggestion, getConfig } from '../database/sessionRepository';
import useAppStore from '../store/appStore';
```

Estado nuevo, junto a `result`:

```jsx
  const [suggestion, setSuggestion] = useState(null);
  const storeLevel = useAppStore(s => s.level);
  const setStoreLevel = useAppStore(s => s.setLevel);
  const setStoreCurrentLesson = useAppStore(s => s.setCurrentLessonId);
```

Y un efecto que corre cuando ya hay resultado:

```jsx
  // Evaluated after the lesson is written, so the just-finished lesson counts.
  useEffect(() => {
    if (!result || suggestion !== null) return;

    (async () => {
      const [ratios, completed, config] = await Promise.all([
        getRecentAccuracies(3),
        getCompletedCount(),
        getConfig(),
      ]);

      const dismissedAt = config?.suggestion_dismissed_at ?? -1;
      const sinceDismiss = dismissedAt < 0 ? null : completed - dismissedAt;

      setSuggestion(suggestLevelChange(storeLevel, ratios, sinceDismiss) || false);
    })();
  }, [result, suggestion, storeLevel]);
```

`suggestion` usa tres valores: `null` = todavía no se evaluó, `false` = no hay nada que
sugerir, objeto = hay sugerencia. Sin eso, el efecto se dispararía en loop.

- [ ] **Step 3: Mostrar la tarjeta en la pantalla de resultado**

Dentro del bloque `if (isComplete)`, entre `resultText` y el botón:

```jsx
          {suggestion && (
            <LevelSuggestionCard
              suggestion={suggestion}
              onAccept={handleAcceptSuggestion}
              onDismiss={handleDismissSuggestion}
            />
          )}
```

Y los dos manejadores, arriba del `return`:

```jsx
  const handleAcceptSuggestion = async () => {
    const to = suggestion.to;
    await setLevel(to);
    await unlockUpTo(to);

    const lesson = await getCurrentLesson();
    await setCurrentLesson(lesson?.id ?? null);

    setStoreLevel(to);
    setStoreCurrentLesson(lesson?.id ?? null);
    setSuggestion(false);
    navigation.goBack();
  };

  const handleDismissSuggestion = async () => {
    const completed = await getCompletedCount();
    await dismissLevelSuggestion(completed);
    setSuggestion(false);
  };
```

- [ ] **Step 4: Probar a mano**

Run: `npx expo start`
Expected: completá tres lecciones seguidas calificando todo "Fácil". Al terminar la tercera,
debajo de las estrellas aparece "¿Te resulta muy fácil?" con los dos botones. "Pasar a A2"
mueve la ruta al primer nivel A2. "Seguir igual" la cierra, y no vuelve a aparecer en las
siguientes lecciones.

Para probar el camino inverso, calificá todo "Difícil" tres lecciones seguidas estando en A2
o superior.

- [ ] **Step 5: Commit**

```bash
git add src/components/LevelSuggestionCard.jsx src/screens/StudyLessonScreen.jsx
git commit -m "feat(level): suggest a level change after three lessons

Shows an accept-or-dismiss card in the lesson summary when the last
three lessons ran very easy or very hard. Dismissing silences it for ten
lessons."
```

---

### Task 21: Cambiar de nivel desde Ajustes, y usuarios existentes

**Files:**
- Modify: `src/screens/SettingsScreen.jsx`
- Modify: `src/screens/PathScreen.jsx`
- Modify: `src/navigation/MainTabNavigator.jsx`

**Interfaces:**
- Consumes: `LEVEL_LABELS` (Task 1); `useAppStore` (Task 12); ruta `LevelPick` (Task 14)

- [ ] **Step 1: Agregar "Mi nivel" a Ajustes**

En `src/screens/SettingsScreen.jsx`, agregá los imports:

```jsx
import { LEVEL_LABELS } from '../utils/levels.mjs';
import useAppStore from '../store/appStore';
```

Dentro del componente:

```jsx
  const level = useAppStore(s => s.level);
```

Y como primera fila de la lista de ajustes, siguiendo el estilo de las filas existentes:

```jsx
      <TouchableOpacity
        style={styles.row}
        onPress={() => navigation.navigate('LevelPick', { mode: 'change' })}
        activeOpacity={0.7}
      >
        <View style={styles.rowLeft}>
          <Ionicons name="school-outline" size={22} color={COLORS.deepOlive} />
          <Text style={styles.rowLabel}>Mi nivel</Text>
        </View>
        <View style={styles.rowRight}>
          <Text style={styles.rowValue}>{level} · {LEVEL_LABELS[level]}</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textPlaceholder} />
        </View>
      </TouchableOpacity>
```

Si los nombres de estilos de `SettingsScreen.jsx` no son `row` / `rowLeft` / `rowLabel` /
`rowRight` / `rowValue`, usá los que ya tenga el archivo para sus filas: la fila nueva tiene
que verse igual que las de al lado, no traer estilos propios.

`SettingsScreen` está dentro del tab navigator, y `LevelPick` en el stack raíz. React
Navigation resuelve el nombre subiendo por los navegadores padres, así que
`navigation.navigate('LevelPick', …)` funciona sin configuración extra.

- [ ] **Step 2: Pedir el nivel a los usuarios que ya tenían la app**

En `src/screens/PathScreen.jsx`, agregá `useState` al import de React y `Modal` al de
React Native, más dos imports nuevos:

```jsx
import React, { useCallback, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { getConfig } from '../database/sessionRepository';
import useAppStore from '../store/appStore';
```

Estado y efecto:

```jsx
  const placementDone = useAppStore(s => s.placementDone);
  const setStorePlacementDone = useAppStore(s => s.setPlacementDone);
  const [needsLevel, setNeedsLevel] = useState(false);

  // Users who installed before the path existed never saw the level picker:
  // their onboarding_done is already 1. Ask them here, once.
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const config = await getConfig();
        const done = config?.placement_done === 1;
        setStorePlacementDone(done);
        setNeedsLevel(!done);
      })();
    }, [setStorePlacementDone])
  );
```

Y al final del `SafeAreaView`, antes de cerrarlo:

```jsx
      <Modal visible={needsLevel && !placementDone} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Elegí tu nivel</Text>
            <Text style={styles.modalText}>
              Agregamos un recorrido por niveles. Contanos cuánto inglés sabés y te ubicamos
              en el punto justo. Tu progreso actual no se pierde.
            </Text>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => {
                setNeedsLevel(false);
                navigation.navigate('LevelPick', { mode: 'change' });
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.continueText}>Elegir mi nivel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
```

El modal no tiene forma de cerrarse sin elegir: la ruta necesita un nivel para ubicar al
usuario.

Estilos nuevos:

```jsx
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  modalCard: {
    backgroundColor: COLORS.surfaceWhite,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    gap: SPACING.md,
    width: '100%',
    maxWidth: 380,
  },
  modalTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 20,
    color: COLORS.deepOlive,
  },
  modalText: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
  },
```

- [ ] **Step 3: Probar a mano**

Con una base existente (o poniendo `placement_done = 0` a mano):

Run: `npx expo start`
Expected: al entrar a Inicio aparece el modal, que sólo se cierra eligiendo nivel. Después,
Ajustes → "Mi nivel" muestra el nivel elegido y permite cambiarlo; al cambiarlo, la ruta se
reubica y las lecciones ya completadas siguen completadas.

- [ ] **Step 4: Commit**

```bash
git add src/screens/SettingsScreen.jsx src/screens/PathScreen.jsx
git commit -m "feat(level): let users change level, and ask existing installs

Adds a Mi nivel row to Settings. Users who upgrade from a version
without the path never saw the level picker, so the path asks them once
through a modal that cannot be dismissed without choosing."
```

---

### Task 22: Textos y verificación final

**Files:**
- Modify: `src/screens/OnboardingScreen.jsx`

- [ ] **Step 1: Corregir la promesa del primer slide**

En `src/screens/OnboardingScreen.jsx`, en el arreglo `slides`, reemplazá el objeto de
apertura y ajustá el tercero para que hable de la ruta:

```js
const slides = [
  {
    title: '2.500 Palabras Esenciales',
    description: 'Aprendé el vocabulario más usado del inglés con tarjetas inteligentes.',
  },
  {
    title: 'Frases Listas para Usar',
    description: 'Conversaciones reales para cada situación. Saludá, viajá, trabajá.',
  },
  {
    title: 'Un Camino Paso a Paso',
    description: 'Empezás en tu nivel y avanzás lección por lección, a tu ritmo.',
  },
];
```

- [ ] **Step 2: Correr toda la verificación automática**

Run: `npm run validate && npm test`
Expected: `✅ Content valid`, `Curriculum: 209 lessons`, y `# fail 0` en los tres archivos de test.

- [ ] **Step 3: Recorrido manual sobre base limpia**

Borrá la app del emulador. Run: `npx expo start --clear`

Verificá, en orden:

1. Tres slides, el primero dice "2.500 Palabras Esenciales".
2. "Empezar a Aprender" → selector de nivel. "Empezar" está deshabilitado hasta elegir.
3. Elegí "Me defiendo" (B1) → entra a la app, la ruta arranca en la primera lección de B1 y
   las lecciones de A1 y A2 están desbloqueadas más arriba.
4. "Continuar" abre la lección actual, no la primera de todas.
5. Completá la lección → estrellas → "Volver a la ruta" → la lección quedó completada con
   sus estrellas y la siguiente tiene el anillo naranja.
6. Meta diaria y racha subieron en 10.
7. Pestaña Palabras → sigue navegando por categorías, ahora con ~2.500 palabras y las
   categorías nuevas.
8. Ajustes → "Mi nivel" dice `B1 · Intermedio`. Cambialo a A1: la ruta se reubica en la
   primera lección A1 sin completar, y la lección que completaste sigue completada.

- [ ] **Step 4: Recorrido manual sobre base existente**

Instalá sobre una base de la versión anterior, sin borrar datos:

1. Al entrar a Inicio aparece el modal de elección de nivel.
2. Elegí un nivel → la ruta se arma completa.
3. Pestaña Progreso → la racha, el total estudiado y las tarjetas conocidas de antes siguen ahí.
4. Pestaña Palabras → aparecen B2 y C1 y las categorías nuevas.

- [ ] **Step 5: Recorrido manual del test de ubicación**

Borrá la app. Run: `npx expo start`

1. Onboarding → "Prefiero hacer un test rápido".
2. Diez preguntas, cada una con cuatro opciones distintas.
3. Respondé todo mal → el resultado es A1.
4. Repetí respondiendo todo bien → el resultado es C1.
5. Salí con la X a mitad de camino → vuelve al selector, sin haber cambiado nada.

- [ ] **Step 6: Commit**

```bash
git add src/screens/OnboardingScreen.jsx
git commit -m "fix(onboarding): tell the truth about the word count

The first slide promised 5,000 words when the seed held 1,115. It now
says 2,500, which is what ships. The third slide describes the guided
path instead of the review system."
```

---

## Notas de la auto-revisión

Tres cosas que este plan agrega sobre lo que el spec listaba, y por qué:

- **`src/services/lessonScoring.mjs`** — el spec metía el cálculo de estrellas dentro de la
  pantalla de resumen. Separarlo lo vuelve probable y lo deja disponible para
  `levelAdjustment`, que usa el mismo número.
- **`src/hooks/useLessonSession.js`** — el spec sólo nombraba `useLessonPath`. La sesión
  necesita su propio hook; meter esa lógica en la pantalla habría repetido lo que ya hace
  `useStudySession`.
- **`user_config.suggestion_dismissed_at`** — el spec pedía silenciar la sugerencia por diez
  lecciones sin decir dónde guardarlo. Esta columna lo guarda.

Y una decisión que el spec dejaba abierta: `completeLesson` guarda el **máximo** de estrellas,
no las últimas. Rehacer una lección para repasar nunca debería bajar el puntaje.
