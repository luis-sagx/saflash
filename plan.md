# PLANIFICACIÓN COMPLETA — WordFlash English
### Aplicación Móvil de Flashcards para Aprender Inglés
**Stack:** React Native · Android · SQLite Embebido  
**Audiencia:** Hispanohablantes que quieren aprender inglés desde cero

---

## TABLA DE CONTENIDOS

1. [Descripción General del Proyecto](#1-descripción-general-del-proyecto)
2. [Arquitectura Técnica](#2-arquitectura-técnica)
3. [Diseño Visual y Sistema de Colores](#3-diseño-visual-y-sistema-de-colores)
4. [Estructura de la Base de Datos SQLite](#4-estructura-de-la-base-de-datos-sqlite)
5. [Módulo 1: Sección de Palabras (5,000 palabras)](#5-módulo-1-sección-de-palabras-5000-palabras)
6. [Módulo 2: Sección de Frases y Oraciones](#6-módulo-2-sección-de-frases-y-oraciones)
7. [Sistema de Flashcards y Algoritmo de Repetición](#7-sistema-de-flashcards-y-algoritmo-de-repetición)
8. [Imágenes y Recursos Visuales](#8-imágenes-y-recursos-visuales)
9. [Pantallas y Navegación Detallada](#9-pantallas-y-navegación-detallada)
10. [Componentes Reutilizables](#10-componentes-reutilizables)
11. [Estructura de Archivos del Proyecto](#11-estructura-de-archivos-del-proyecto)
12. [Dependencias y Configuración](#12-dependencias-y-configuración)
13. [Datos Semilla: Palabras y Frases](#13-datos-semilla-palabras-y-frases)
14. [Guía de Implementación Paso a Paso](#14-guía-de-implementación-paso-a-paso)

---

## 1. Descripción General del Proyecto

### 1.1 Nombre de la Aplicación
**WordFlash English** — Tu camino al inglés con tarjetas inteligentes

### 1.2 Visión del Producto
WordFlash English es una aplicación móvil nativa para Android, construida con React Native, que usa el método de tarjetas de memoria (flashcards) para enseñar inglés a hispanohablantes de forma progresiva, visual y entretenida. La app funciona completamente **offline** gracias a SQLite embebido, garantizando disponibilidad sin importar la conexión a internet.

### 1.3 Problema que Resuelve
- Millones de hispanohablantes quieren aprender inglés pero no saben por dónde empezar.
- Las apps existentes están en inglés, lo que crea una barrera adicional para principiantes.
- El método de flashcards con repetición espaciada es científicamente comprobado para memorización.
- Las 5,000 palabras más frecuentes del inglés cubren el 98% del habla cotidiana.

### 1.4 Características Principales

| Característica | Descripción |
|---|---|
| Flashcards de Palabras | 5,000 palabras con imagen, pronunciación, traducción y ejemplo de oración |
| Flashcards de Frases | 500+ frases cotidianas listas para usar en conversación real |
| Repetición Espaciada | Algoritmo tipo SM-2: muestra más las tarjetas difíciles |
| Progreso Visual | Estadísticas, racha diaria, porcentaje aprendido |
| Imágenes Ilustrativas | Cada palabra tiene URL de imagen de Unsplash (gratis, sin registro) |
| Sin Internet Obligatorio | Base de datos SQLite local, funciona 100% offline |
| Categorías Temáticas | Animales, comida, familia, trabajo, viajes, etc. |
| Favoritos | El usuario puede marcar tarjetas para revisión extra |

### 1.5 Alcance MVP (Versión 1.0)
1. Onboarding de 3 pantallas para nuevos usuarios
2. Pantalla de inicio con acceso a las 2 secciones principales
3. Sección Palabras: 5,000 palabras con flashcard completa
4. Sección Frases: 500 frases (ampliable a 1,000+)
5. Modo estudio: sesión de 20 tarjetas con evaluación
6. Pantalla de estadísticas y progreso
7. Sistema de favoritos
8. Configuración básica (interfaz completamente en español)

---

## 2. Arquitectura Técnica

### 2.1 Stack Tecnológico

| Capa | Tecnología | Propósito |
|---|---|---|
| UI / Frontend | React Native 0.73+ | Interfaz nativa Android |
| Navegación | React Navigation v6 | Manejo de pantallas y tabs |
| Base de Datos | expo-sqlite | Almacenamiento local offline |
| Estado Global | Zustand | Manejo de estado de la app |
| Animaciones | React Native Reanimated 3 | Flip de tarjetas, transiciones |
| Audio | expo-av + expo-speech | Pronunciación de palabras (TTS) |
| Imágenes | react-native-fast-image | Carga eficiente de imágenes por URL |
| Iconos | @expo/vector-icons (Ionicons) | Íconos consistentes |
| Notificaciones | expo-notifications | Recordatorio diario de estudio |
| Fuentes | @expo-google-fonts/nunito | Tipografía principal |
| Build | Expo EAS Build | Compilación para Android APK/AAB |

### 2.2 Arquitectura de Capas

```
┌─────────────────────────────────────────────┐
│  CAPA 1 — PRESENTACIÓN                       │
│  screens/ + components/  →  React Native UI  │
├─────────────────────────────────────────────┤
│  CAPA 2 — LÓGICA                             │
│  hooks/ + store/ + services/                 │
│  Reglas de negocio y algoritmo SM-2          │
├─────────────────────────────────────────────┤
│  CAPA 3 — DATOS                              │
│  database/ + seeds/                          │
│  SQLite local + datos semilla                │
└─────────────────────────────────────────────┘

Flujo:
Screen → Hook → Service → SQLite → datos regresan al Screen
```

### 2.3 Manejo del Estado
- **Estado local:** `useState` para formularios y animaciones de tarjeta
- **Estado global (Zustand):** usuario activo, progreso de sesión, configuración
- **Estado persistente:** todo en SQLite (progreso, favoritos, configuración)
- **NO se usa Redux** (innecesario para esta escala)

### 2.4 Flujo de Datos al Iniciar la App
1. `App.js` inicializa SQLite y crea tablas si no existen
2. Se verifica si es primer lanzamiento (tabla `user_config`)
3. Si es primer lanzamiento: ejecutar seeds (insertar 5,000 palabras + frases)
4. Navegar a `OnboardingScreen` o directamente a `HomeScreen`
5. `HomeScreen` carga estadísticas del usuario desde SQLite

---

## 3. Diseño Visual y Sistema de Colores

### 3.1 Identidad Visual
La app usa un diseño moderno, limpio y amigable. Los colores transmiten confianza (azul), aprendizaje (verde) y energía (naranja). La interfaz está completamente en **español** para eliminar barreras de entrada.

### 3.2 Paleta de Colores Completa

```js
// src/theme/colors.js
export const COLORS = {
  // Colores principales
  PRIMARY_BLUE:     '#1A73E8',  // Botones principales, headers, tabs activos
  PRIMARY_DARK:     '#1A1A2E',  // Texto principal, fondo reverso de tarjeta
  SUCCESS_GREEN:    '#0F9D58',  // Respuestas correctas, progreso, logros
  WARNING_ORANGE:   '#F4511E',  // Respuestas difíciles, alertas
  ACCENT_YELLOW:    '#FBBC04',  // Estrellas favoritas, rachas diarias

  // Fondos y superficies
  BACKGROUND_MAIN:  '#F8F9FA',  // Fondo principal de todas las pantallas
  SURFACE_WHITE:    '#FFFFFF',  // Cards, modales, inputs

  // Texto
  TEXT_PRIMARY:     '#202124',  // Texto principal del cuerpo
  TEXT_SECONDARY:   '#5F6368',  // Subtítulos, descripciones
  TEXT_HINT:        '#9AA0A6',  // Placeholders, texto deshabilitado

  // UI
  BORDER_COLOR:     '#DADCE0',  // Bordes de inputs y separadores
  LIGHT_BLUE:       '#E8F0FE',  // Badges de categoría, fondos suaves

  // Tarjeta flashcard
  CARD_FRONT_BG:    '#FFFFFF',  // Fondo frontal
  CARD_BACK_BG:     '#1A1A2E',  // Fondo reverso
  CARD_FRONT_TEXT:  '#202124',  // Texto frontal
  CARD_BACK_TEXT:   '#FFFFFF',  // Texto reverso
};
```

### 3.3 Tipografía

Usar **Nunito** (Google Fonts, gratuita). Es ideal para aprendizaje: letras redondeadas, altamente legible.

```js
// src/theme/typography.js
export const TYPOGRAPHY = {
  wordMain:        { fontFamily: 'Nunito_700Bold',   fontSize: 38 }, // Palabra en tarjeta
  translation:     { fontFamily: 'Nunito_400Regular', fontSize: 26 }, // Traducción
  example:         { fontFamily: 'Nunito_400Regular', fontSize: 17, fontStyle: 'italic' },
  screenTitle:     { fontFamily: 'Nunito_700Bold',   fontSize: 22 },
  body:            { fontFamily: 'Nunito_400Regular', fontSize: 16 },
  buttonLabel:     { fontFamily: 'Nunito_600SemiBold', fontSize: 16 },
  categoryBadge:   { fontFamily: 'Nunito_500Medium', fontSize: 13 },
  phonetic:        { fontFamily: 'Nunito_300Light',  fontSize: 16, fontStyle: 'italic' },
};
```

Instalar con: `npx expo install @expo-google-fonts/nunito expo-font`

### 3.4 Componente Flashcard — Especificación Visual Completa

#### LADO FRONTAL (Inglés)
```
┌─────────────────────────────────┐
│  [SUSTANTIVOS]                  │  ← Badge: fondo #E8F0FE, texto #1A73E8, pill redondo
│                                 │
│       [████ IMAGEN ████]        │  ← 180x180px, borderRadius: 12
│       [████████████████]        │
│                                 │
│           water                 │  ← Nunito Bold 38px, #202124
│        /ˈwɔːtər/                │  ← Nunito Italic 16px, #9AA0A6
│            🔊                   │  ← Ícono audio, tappable, #1A73E8
│                                 │
│   Toca para ver la traducción   │  ← 13px, #9AA0A6
└─────────────────────────────────┘
Fondo: #FFFFFF
Sombra: elevation 8, shadowOpacity 0.15
borderRadius: 20
Tamaño: width: '90%', height: 420
```

#### LADO REVERSO (Español)
```
┌─────────────────────────────────┐
│  water                          │  ← Nunito Bold 28px, #9AA0A6 (atenuado)
│                                 │
│           agua                  │  ← Nunito Bold 38px, #FFFFFF
│  ─────────────────────────────  │  ← Línea divisoria 1px #5F6368
│  "I drink a lot of water        │  ← Nunito Italic 17px, #E8F0FE
│   every day."                   │
│  "Tomo mucha agua todos los     │  ← Nunito Regular 15px, #9AA0A6
│   días."                        │
│                                 │
│ [Difícil🔴] [Bien 🟡] [Fácil🟢] │  ← Botones de calificación
└─────────────────────────────────┘
Fondo: #1A1A2E
Bordes y sombra: igual al frontal
```

#### Estilos de los botones de calificación:
```js
// Difícil
{ backgroundColor: '#F4511E', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 }
// Bien
{ backgroundColor: '#FBBC04', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 }
// Fácil
{ backgroundColor: '#0F9D58', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 }
// Texto de todos: Nunito Bold 14px, color #FFFFFF
```

### 3.5 Animación del Flip de Tarjeta

```js
// Usar React Native Reanimated 3
import Animated, {
  useSharedValue, withTiming, interpolate,
  useAnimatedStyle, Easing
} from 'react-native-reanimated';

const rotation = useSharedValue(0); // 0 = frontal, 180 = reverso

const flip = () => {
  rotation.value = withTiming(flipped ? 0 : 180, {
    duration: 400,
    easing: Easing.out(Easing.ease)
  });
  setFlipped(!flipped);
};

// Estilo del frontal
const frontAnimStyle = useAnimatedStyle(() => ({
  transform: [{ rotateY: `${interpolate(rotation.value, [0, 180], [0, 180])}deg` }],
  backfaceVisibility: 'hidden', // CRÍTICO en Android
}));

// Estilo del reverso
const backAnimStyle = useAnimatedStyle(() => ({
  transform: [{ rotateY: `${interpolate(rotation.value, [0, 180], [180, 360])}deg` }],
  backfaceVisibility: 'hidden', // CRÍTICO en Android
  position: 'absolute',
  top: 0, left: 0, right: 0, bottom: 0,
}));
```

---

## 4. Estructura de la Base de Datos SQLite

### 4.1 Tabla: `words` (5,000 palabras)

```sql
CREATE TABLE IF NOT EXISTS words (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  english_word    TEXT    NOT NULL,          -- Palabra en inglés (ej: 'water')
  spanish_trans   TEXT    NOT NULL,          -- Traducción (ej: 'agua')
  phonetic        TEXT,                      -- Fonética (ej: /ˈwɔːtər/)
  category        TEXT    NOT NULL,          -- Categoría (ej: 'food_drink')
  subcategory     TEXT,                      -- Subcategoría (ej: 'beverages')
  frequency_rank  INTEGER NOT NULL,          -- Rango de frecuencia (1 = más común)
  difficulty      TEXT    DEFAULT 'A1',      -- Nivel: A1, A2, B1, B2, C1
  image_url       TEXT,                      -- URL imagen Unsplash
  audio_url       TEXT,                      -- URL audio pronunciación
  example_en      TEXT,                      -- Oración ejemplo en inglés
  example_es      TEXT,                      -- Traducción del ejemplo
  is_seeded       INTEGER DEFAULT 1,         -- 1 si viene del seed inicial
  created_at      TEXT    DEFAULT (datetime('now'))
);
```

### 4.2 Tabla: `phrases` (frases y oraciones)

```sql
CREATE TABLE IF NOT EXISTS phrases (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  phrase_en       TEXT    NOT NULL,          -- Frase en inglés
  phrase_es       TEXT    NOT NULL,          -- Traducción al español
  category        TEXT    NOT NULL,          -- 'greeting', 'travel', 'work', etc.
  context         TEXT,                      -- Ej: 'Al llegar a un hotel'
  difficulty      TEXT    DEFAULT 'A1',      -- Nivel CEFR
  image_url       TEXT,                      -- Imagen contextual
  audio_url       TEXT,                      -- Audio de la frase
  is_seeded       INTEGER DEFAULT 1,
  created_at      TEXT    DEFAULT (datetime('now'))
);
```

### 4.3 Tabla: `user_progress` (progreso por tarjeta)

```sql
CREATE TABLE IF NOT EXISTS user_progress (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  card_type       TEXT    NOT NULL,          -- 'word' o 'phrase'
  card_id         INTEGER NOT NULL,          -- FK a words.id o phrases.id
  status          TEXT    DEFAULT 'new',     -- 'new' | 'learning' | 'reviewing' | 'known'
  ease_factor     REAL    DEFAULT 2.5,       -- Factor SM-2 (2.5 = normal)
  interval_days   INTEGER DEFAULT 1,         -- Días hasta próxima revisión
  repetitions     INTEGER DEFAULT 0,         -- Veces revisada correctamente
  next_review     TEXT,                      -- Fecha próxima revisión (ISO 8601)
  last_review     TEXT,                      -- Última vez revisada
  correct_count   INTEGER DEFAULT 0,         -- Respuestas correctas totales
  wrong_count     INTEGER DEFAULT 0,         -- Respuestas incorrectas totales
  is_favorite     INTEGER DEFAULT 0,         -- 1 = marcada como favorita
  UNIQUE(card_type, card_id)
);
```

### 4.4 Tabla: `study_sessions` (historial de sesiones)

```sql
CREATE TABLE IF NOT EXISTS study_sessions (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  session_date    TEXT    NOT NULL,          -- Fecha de la sesión
  session_type    TEXT    NOT NULL,          -- 'words' o 'phrases'
  cards_studied   INTEGER DEFAULT 0,         -- Tarjetas vistas
  cards_correct   INTEGER DEFAULT 0,         -- Calificadas como 'fácil'
  cards_medium    INTEGER DEFAULT 0,         -- Calificadas como 'bien'
  cards_hard      INTEGER DEFAULT 0,         -- Calificadas como 'difícil'
  duration_secs   INTEGER DEFAULT 0,         -- Duración en segundos
  created_at      TEXT    DEFAULT (datetime('now'))
);
```

### 4.5 Tabla: `user_config` (configuración)

```sql
CREATE TABLE IF NOT EXISTS user_config (
  id              INTEGER PRIMARY KEY DEFAULT 1,
  first_launch    INTEGER DEFAULT 1,         -- 1 = primer lanzamiento
  daily_goal      INTEGER DEFAULT 20,        -- Meta de tarjetas por día
  streak_days     INTEGER DEFAULT 0,         -- Racha actual en días
  last_study_date TEXT,                      -- Última fecha de estudio
  total_studied   INTEGER DEFAULT 0,         -- Total tarjetas estudiadas ever
  onboarding_done INTEGER DEFAULT 0,         -- 1 si completó onboarding
  notifications   INTEGER DEFAULT 1,         -- 1 si activadas
  notif_hour      INTEGER DEFAULT 9          -- Hora de notificación (0-23)
);
```

### 4.6 Índices para Performance

```sql
CREATE INDEX IF NOT EXISTS idx_words_category    ON words(category);
CREATE INDEX IF NOT EXISTS idx_words_difficulty  ON words(difficulty);
CREATE INDEX IF NOT EXISTS idx_words_frequency   ON words(frequency_rank);
CREATE INDEX IF NOT EXISTS idx_phrases_category  ON phrases(category);
CREATE INDEX IF NOT EXISTS idx_progress_review   ON user_progress(next_review);
CREATE INDEX IF NOT EXISTS idx_progress_status   ON user_progress(status);
CREATE INDEX IF NOT EXISTS idx_progress_card     ON user_progress(card_type, card_id);
```

### 4.7 Query Principal: Obtener tarjetas para la sesión de hoy

```sql
-- Palabras pendientes de revisión + nuevas (máximo 20)
SELECT
  w.*,
  up.status,
  up.ease_factor,
  up.interval_days,
  up.next_review,
  up.is_favorite
FROM words w
LEFT JOIN user_progress up
  ON up.card_id = w.id AND up.card_type = 'word'
WHERE
  up.next_review <= date('now')
  OR up.status IS NULL
  OR up.status = 'new'
ORDER BY
  up.status IS NULL DESC,   -- primero las nuevas
  up.next_review ASC        -- luego las más vencidas
LIMIT 20;
```

---

## 5. Módulo 1: Sección de Palabras (5,000 palabras)

### 5.1 Distribución por Nivel

| Rango | Cantidad | Nivel | Descripción |
|---|---|---|---|
| 1 – 500 | 500 | A1 | Vocabulario básico esencial: artículos, pronombres, verbos más comunes |
| 501 – 1,500 | 1,000 | A2 | Vida diaria: familia, comida, colores, números, emociones |
| 1,501 – 3,000 | 1,500 | B1 | Trabajo, viajes, salud, tecnología básica |
| 3,001 – 4,500 | 1,500 | B2 | Negocios, temas abstractos, vocabulario específico |
| 4,501 – 5,000 | 500 | C1 | Expresiones idiomáticas, palabras avanzadas |

### 5.2 Categorías Temáticas

| category | Subcategorías | Aprox. palabras |
|---|---|---|
| `basics` | articles, pronouns, prepositions, conjunctions, numbers | 350 |
| `verbs_common` | be, have, do, go, come, say, get, make, know, think | 400 |
| `verbs_action` | run, walk, eat, drink, sleep, work, play, read, write | 300 |
| `family` | parents, siblings, relatives, relationships | 80 |
| `body` | head, face, organs, limbs, senses | 150 |
| `health` | illness, medicine, hospital, symptoms, treatments | 200 |
| `food_drink` | fruits, vegetables, meals, beverages, cooking | 350 |
| `clothing` | garments, accessories, materials, styles | 150 |
| `home` | rooms, furniture, appliances, household items | 200 |
| `nature` | plants, weather, geography, environment | 300 |
| `animals` | pets, farm, wild, sea, insects, birds | 250 |
| `colors_shapes` | colors, geometric forms, dimensions | 80 |
| `numbers_time` | numbers, dates, time, calendar, seasons | 120 |
| `emotions` | feelings, moods, attitudes, character traits | 200 |
| `work_business` | jobs, office, finance, industry, economy | 350 |
| `technology` | computers, internet, devices, software, apps | 200 |
| `transport` | vehicles, travel, directions, maps | 180 |
| `education` | school, university, subjects, studying | 150 |
| `sports` | sports, games, competition, fitness | 150 |
| `arts_culture` | music, art, literature, cinema, entertainment | 180 |
| `shopping` | store, money, prices, products, buying | 120 |
| `travel` | tourism, hotel, airport, countries, vacation | 200 |
| `social` | greetings, courtesy, social interactions | 100 |
| `adjectives` | descriptive: big, small, happy, sad, fast, etc. | 400 |
| `adverbs` | very, always, never, often, quickly, etc. | 150 |
| `other` | high-frequency words sin categoría fija | 360 |

---

## 6. Módulo 2: Sección de Frases y Oraciones

### 6.1 Categorías de Frases

| Categoría | Ejemplos |
|---|---|
| `greetings` | Hello! / Good morning! / How are you? / Nice to meet you! |
| `courtesy` | Please / Thank you / You're welcome / Excuse me / I'm sorry |
| `questions` | What time is it? / Where is the bathroom? / How much does it cost? |
| `introductions` | My name is... / I am from... / I am a student / I work in... |
| `shopping` | How much is this? / Do you have this in my size? / I'd like to pay by card |
| `restaurant` | I'd like a table for two / What do you recommend? / The check, please |
| `travel` | Where is the nearest hotel? / I need a taxi / My flight is at 8am |
| `work` | I have a meeting at 3pm / Can you send me the report? / I'm on vacation |
| `health` | I don't feel well / I have a headache / I need to see a doctor |
| `directions` | Turn left / Go straight / It's on the right / How far is it? |
| `phone` | Can I call you later? / Could you speak more slowly? / I'll text you |
| `emotions` | I'm very happy / I'm a little tired / That's amazing! / I'm not sure |
| `time` | What time is it? / I'm running late / Let's meet at noon |
| `weather` | It's very hot today / It looks like rain / What's the weather forecast? |
| `family` | I have two brothers / My parents live in... / We are a big family |

---

## 7. Sistema de Flashcards y Algoritmo de Repetición

### 7.1 Implementación del Algoritmo SM-2

```js
// src/services/spacedRepetition.js

/**
 * Actualiza el progreso de una tarjeta según la calificación del usuario.
 * @param {Object} progress - Registro actual de user_progress
 * @param {number} rating - 1 = Difícil, 2 = Bien, 3 = Fácil
 * @returns {Object} - Nuevos valores para actualizar en SQLite
 */
export function calculateNextReview(progress, rating) {
  let { ease_factor, interval_days, repetitions } = progress;

  if (rating === 1) {
    // Difícil: reiniciar
    repetitions = 0;
    interval_days = 1;
    ease_factor = Math.max(1.3, ease_factor - 0.2);
  } else if (rating === 2) {
    // Bien: avanzar normalmente
    repetitions += 1;
    if (repetitions === 1) interval_days = 1;
    else if (repetitions === 2) interval_days = 6;
    else interval_days = Math.round(interval_days * ease_factor);
    // ease_factor no cambia
  } else if (rating === 3) {
    // Fácil: acelerar
    repetitions += 1;
    interval_days = Math.round(interval_days * ease_factor * 1.3);
    ease_factor = Math.min(3.0, ease_factor + 0.1);
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval_days);

  const newStatus =
    rating === 1 ? 'learning' :
    repetitions > 3 && rating === 3 ? 'known' : 'reviewing';

  return {
    ease_factor,
    interval_days,
    repetitions,
    next_review: nextReview.toISOString().split('T')[0],
    last_review: new Date().toISOString().split('T')[0],
    status: newStatus,
  };
}
```

### 7.2 Lógica de Selección de Tarjetas para la Sesión

```js
// src/hooks/useStudySession.js

async function loadSessionCards(type = 'word', limit = 20) {
  // 1. Tarjetas vencidas (más prioridad)
  const due = await db.getAllAsync(`
    SELECT * FROM ${type === 'word' ? 'words' : 'phrases'} w
    LEFT JOIN user_progress up ON up.card_id = w.id AND up.card_type = ?
    WHERE up.next_review <= date('now') AND up.status != 'new'
    ORDER BY up.next_review ASC
    LIMIT ?
  `, [type, limit]);

  // 2. Si hay espacio, rellenar con tarjetas nuevas
  const remaining = limit - due.length;
  let newCards = [];
  if (remaining > 0) {
    newCards = await db.getAllAsync(`
      SELECT * FROM ${type === 'word' ? 'words' : 'phrases'} w
      LEFT JOIN user_progress up ON up.card_id = w.id AND up.card_type = ?
      WHERE up.card_id IS NULL OR up.status = 'new'
      ORDER BY w.frequency_rank ASC
      LIMIT ?
    `, [type, remaining]);
  }

  return [...due, ...newCards];
}
```

### 7.3 Estados de una Tarjeta

| Estado | Descripción | Intervalo siguiente |
|---|---|---|
| `new` | Nunca vista | Aparece en próxima sesión disponible |
| `learning` | Vista pero calificada como Difícil | 1 día |
| `reviewing` | En proceso de aprendizaje | Crece según SM-2 (1 → 6 → 14 → ... días) |
| `known` | Dominada (3+ reps correctas con rating 3) | Largo (30+ días) |

---

## 8. Imágenes y Recursos Visuales

### 8.1 Estrategia de Imágenes
Todas las imágenes se cargan desde **Unsplash** (completamente gratis, sin registro, sin límite para apps). El componente `FastImage` maneja el cache automáticamente.

**Formato de URL:**
```
https://images.unsplash.com/photo-{PHOTO_ID}?w=400&q=80
```
- `w=400` → imagen de 400px de ancho (suficiente para tarjetas)
- `q=80` → calidad 80% (reduce peso sin afectar visualmente)

**Imagen de fallback (offline):** archivo local `assets/images/placeholder.png`
- Tamaño: 400x400px
- Fondo: `#F5F5F5`
- Ícono de imagen centrado en `#DADCE0`

### 8.2 Componente CardImage

```jsx
// src/components/CardImage.jsx
import { useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';

export default function CardImage({ uri, style }) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !uri) {
    return (
      <Image
        source={require('../../assets/images/placeholder.png')}
        style={[styles.image, style]}
      />
    );
  }

  return (
    <FastImage
      source={{
        uri,
        priority: FastImage.priority.normal,
        cache: FastImage.cacheControl.immutable,
      }}
      style={[styles.image, style]}
      resizeMode={FastImage.resizeMode.cover}
      onError={() => setHasError(true)}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: 180,
    height: 180,
    borderRadius: 12,
  },
});
```

### 8.3 URLs de Imágenes de Cabecera por Categoría

| Categoría | URL de imagen de cabecera |
|---|---|
| basics / palabras comunes | `https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800` |
| verbs / acciones | `https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800` |
| family | `https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800` |
| animals | `https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800` |
| food_drink | `https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800` |
| clothing | `https://images.unsplash.com/photo-1445205170230-053b83016050?w=800` |
| home | `https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800` |
| nature | `https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800` |
| work_business | `https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800` |
| technology | `https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800` |
| transport | `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800` |
| education | `https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800` |
| health | `https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800` |
| sports | `https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800` |
| arts_culture | `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800` |
| travel | `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800` |
| emotions | `https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800` |
| greetings / frases | `https://images.unsplash.com/photo-1573166364524-d9dbfd8bbf83?w=800` |

---

## 9. Pantallas y Navegación Detallada

### 9.1 Árbol de Navegación

```
AppNavigator (Stack)
├── SplashScreen           ← solo mientras carga DB y fuentes
├── OnboardingScreen       ← si onboarding_done === 0
└── MainTabs (Bottom Tab Navigator)
    ├── Tab 1: HomeScreen
    ├── Tab 2: WordsNavigator (Stack)
    │   ├── WordsScreen            ← lista de categorías + búsqueda
    │   ├── WordsCategoryScreen    ← palabras de una categoría
    │   └── StudyWordsScreen       ← sesión de estudio (flashcards)
    ├── Tab 3: PhrasesNavigator (Stack)
    │   ├── PhrasesScreen          ← lista de categorías
    │   ├── PhrasesCategoryScreen  ← frases de una categoría
    │   └── StudyPhrasesScreen     ← sesión de estudio
    ├── Tab 4: ProgressScreen      ← estadísticas y logros
    └── Tab 5: SettingsScreen      ← configuración
```

### 9.2 Barra de Navegación Inferior (MainTabs)

| Tab | Ícono (Ionicons) | Label | Color activo |
|---|---|---|---|
| Inicio | `home` | Inicio | `#1A73E8` |
| Palabras | `book` | Palabras | `#1A73E8` |
| Frases | `chatbubbles` | Frases | `#1A73E8` |
| Progreso | `bar-chart` | Progreso | `#1A73E8` |
| Ajustes | `settings` | Ajustes | `#1A73E8` |

### 9.3 Especificación de Cada Pantalla

---

#### `OnboardingScreen`
- 3 slides horizontales con FlatList horizontal + paginación (dots)
- **Slide 1:** imagen de libro/vocabulario · título: "5,000 Palabras en Inglés" · subtítulo: "Aprende el vocabulario más usado del mundo"
- **Slide 2:** imagen de burbuja de chat · título: "Frases Listas para Usar" · subtítulo: "Conversaciones reales para cada situación"
- **Slide 3:** imagen de gráfica · título: "Sigue Tu Progreso" · subtítulo: "El sistema recuerda lo que ya sabes"
- Botón "Saltar" en top-right en slides 1 y 2
- Botón "Empezar a Aprender" en slide 3 → `setOnboardingDone(true)` → navegar a `HomeScreen`
- Fondo: degradado suave `#E8F0FE → #FFFFFF`

---

#### `HomeScreen`
- **Header:** logo pequeño izquierda + "¡Hola! 👋" + fecha actual (en español)
- **Badge de racha:** 🔥 "X días seguidos" en `#FBBC04`
- **Card Palabras:** fondo `#1A73E8`, "5,000 Palabras", progreso "X/5000 aprendidas", botón "Estudiar"
- **Card Frases:** fondo `#0F9D58`, "Frases Comunes", progreso "X/500 frases", botón "Estudiar"
- **3 StatsCards:** "Hoy" / "Racha" / "Conocidas" con íconos
- **Meta diaria:** ProgressBar horizontal: X/20 tarjetas completadas hoy
- **Sección "Continuar":** últimas 3 tarjetas vistas con miniatura y opción de repasar

---

#### `WordsScreen`
- **Header:** barra de búsqueda full-width + título "Palabras"
- **FilterPills horizontales scrolleables:** Todos · A1 · A2 · B1 · B2 · ⭐ Favoritos
- **Grid 2 columnas:** card por categoría con imagen de cabecera, nombre en español, cantidad de palabras y barra de progreso
- **FAB verde** "▶ Estudiar todo" (bottom-right) — lanza sesión mezclando todas las categorías
- Búsqueda en tiempo real por palabra en inglés o español (query en SQLite con `LIKE`)

---

#### `WordsCategoryScreen`
- **Header:** nombre de la categoría + cantidad de palabras + imagen de cabecera
- **FlatList** de palabras en formato fila: imagen pequeña (50x50) · palabra · traducción · badge de nivel
- Tap en una fila → navega a `StudyWordsScreen` comenzando en esa palabra
- **FAB azul** "▶ Estudiar esta categoría"

---

#### `StudyWordsScreen` (Sesión de Estudio — pantalla principal de uso)
- **ProgressBar superior:** "7 / 20 tarjetas" con porcentaje
- **Botón X** arriba-izquierda para pausar/salir con confirmación
- **FlashCard centrada** (ver spec sección 3.4)
- **Primera vez:** tooltip "Toca la tarjeta para ver la traducción" (desaparece tras 3 segundos)
- **Tras el flip:** aparecen los 3 botones de calificación (Difícil / Bien / Fácil)
- **Gestos alternativos:** swipe left = Difícil · swipe right = Fácil (con react-native-gesture-handler)
- **Al terminar las 20 tarjetas:** pantalla `SessionSummary` con resumen y botón "Ver mi progreso"

---

#### `PhrasesScreen` y `PhrasesCategoryScreen`
- Mismo layout que `WordsScreen` y `WordsCategoryScreen`
- Las cards de categoría muestran "15 frases", "8 frases", etc.
- Las rows del listado muestran la frase en inglés + traducción al español (sin imagen pequeña)

---

#### `StudyPhrasesScreen`
- Idéntico a `StudyWordsScreen`
- **Frontal:** frase en inglés (texto más largo, Nunito Bold 24px en lugar de 38px)
- **Reverso:** traducción en español + contexto de uso (en qué situación usar la frase)
- Sin imagen (las frases no tienen imagen en el frontal, solo contexto de uso)

---

#### `ProgressScreen`
- **Resumen general:** "X/5000 palabras" · "X/500 frases" · "🔥 X días de racha"
- **Gráfica de barras (BarChart):** últimos 7 días, tarjetas estudiadas por día
- **Gráfica de distribución (PieChart o donut):** Nuevas / Aprendiendo / Repasando / Conocidas
- **Logros:** grid de badges desbloqueables con estado (bloqueado en gris, desbloqueado en color)

| Badge | Condición de desbloqueo |
|---|---|
| 🌱 Primeros Pasos | Estudiar 1 tarjeta |
| 🔥 Racha de 7 días | 7 días consecutivos estudiando |
| 💯 Cien palabras | 100 palabras en estado 'known' |
| 🚀 Quinientas palabras | 500 palabras en estado 'known' |
| 🏆 Mil palabras | 1,000 palabras en estado 'known' |
| 💬 Hablador | 50 frases en estado 'known' |

- **Historial de sesiones:** lista scrolleable con fecha, tipo (palabras/frases), cantidad y duración

---

#### `SettingsScreen`
- **Meta diaria:** picker con opciones 10 / 20 / 30 / 50 tarjetas
- **Notificaciones:** Switch ON/OFF + TimePicker para elegir la hora
- **Sonido:** Switch para pronunciación automática al ver tarjeta
- **Resetear progreso:** botón rojo con modal de confirmación ("¿Seguro? Esto borrará TODO tu progreso")
- **Acerca de:** versión de la app, enlace a política de privacidad

---

## 10. Componentes Reutilizables

### 10.1 Lista Completa

| Componente | Archivo | Props principales |
|---|---|---|
| `FlashCard` | `components/FlashCard.jsx` | `word`, `onRatingPress`, `showButtons` |
| `CardImage` | `components/CardImage.jsx` | `uri`, `style`, `fallbackIcon` |
| `CategoryCard` | `components/CategoryCard.jsx` | `category`, `count`, `progress`, `onPress` |
| `ProgressBar` | `components/ProgressBar.jsx` | `current`, `total`, `color`, `showLabel` |
| `RatingButtons` | `components/RatingButtons.jsx` | `onDifficult`, `onOkay`, `onEasy` |
| `StreakBadge` | `components/StreakBadge.jsx` | `days`, `style` |
| `SearchBar` | `components/SearchBar.jsx` | `value`, `onChangeText`, `placeholder` |
| `FilterPills` | `components/FilterPills.jsx` | `options`, `selected`, `onSelect` |
| `EmptyState` | `components/EmptyState.jsx` | `icon`, `title`, `subtitle`, `actionLabel`, `onAction` |
| `LoadingCard` | `components/LoadingCard.jsx` | `style` (skeleton shimmer) |
| `StatsCard` | `components/StatsCard.jsx` | `icon`, `value`, `label`, `color` |
| `AchievementBadge` | `components/AchievementBadge.jsx` | `id`, `title`, `unlocked` |
| `PronunciationButton` | `components/PronunciationButton.jsx` | `word`, `size` |
| `OnboardingSlide` | `components/OnboardingSlide.jsx` | `image`, `title`, `description` |
| `SessionSummary` | `components/SessionSummary.jsx` | `easy`, `okay`, `hard`, `onContinue` |

### 10.2 FlashCard — Código Completo de Referencia

```jsx
// src/components/FlashCard.jsx
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, withTiming, interpolate,
  useAnimatedStyle, Easing
} from 'react-native-reanimated';
import { COLORS } from '../theme/colors';
import CardImage from './CardImage';
import RatingButtons from './RatingButtons';
import PronunciationButton from './PronunciationButton';

export default function FlashCard({ card, cardType = 'word', onRatingPress }) {
  const rotation = useSharedValue(0);
  const [flipped, setFlipped] = useState(false);

  const flip = () => {
    rotation.value = withTiming(flipped ? 0 : 180, {
      duration: 400,
      easing: Easing.out(Easing.ease),
    });
    setFlipped(prev => !prev);
  };

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(rotation.value, [0, 180], [0, 180])}deg` }],
    backfaceVisibility: 'hidden',
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${interpolate(rotation.value, [0, 180], [180, 360])}deg` }],
    backfaceVisibility: 'hidden',
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  }));

  const wordText = cardType === 'word' ? card.english_word : card.phrase_en;
  const transText = cardType === 'word' ? card.spanish_trans : card.phrase_es;

  return (
    <TouchableOpacity onPress={flip} activeOpacity={1} style={styles.container}>
      {/* FRONTAL */}
      <Animated.View style={[styles.card, styles.cardFront, frontStyle]}>
        {card.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{card.category.toUpperCase()}</Text>
          </View>
        )}
        {card.image_url && (
          <CardImage uri={card.image_url} style={styles.image} />
        )}
        <Text style={styles.wordText}>{wordText}</Text>
        {card.phonetic && (
          <Text style={styles.phoneticText}>{card.phonetic}</Text>
        )}
        <PronunciationButton word={wordText} size={32} />
        <Text style={styles.tapHint}>Toca para ver la traducción</Text>
      </Animated.View>

      {/* REVERSO */}
      <Animated.View style={[styles.card, styles.cardBack, backStyle]}>
        <Text style={styles.wordTextBack}>{wordText}</Text>
        <Text style={styles.translationText}>{transText}</Text>
        <View style={styles.divider} />
        {card.example_en && (
          <Text style={styles.exampleText}>"{card.example_en}"</Text>
        )}
        {card.example_es && (
          <Text style={styles.exampleTransText}>{card.example_es}</Text>
        )}
        {flipped && (
          <RatingButtons onPress={onRatingPress} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { width: '90%', height: 420, alignSelf: 'center' },
  card: {
    width: '100%', height: '100%',
    borderRadius: 20, padding: 20,
    alignItems: 'center', justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8,
  },
  cardFront: { backgroundColor: COLORS.CARD_FRONT_BG },
  cardBack:  { backgroundColor: COLORS.CARD_BACK_BG },
  categoryBadge: {
    backgroundColor: COLORS.LIGHT_BLUE,
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 20, marginBottom: 12,
  },
  categoryText: { color: COLORS.PRIMARY_BLUE, fontSize: 13, fontFamily: 'Nunito_500Medium' },
  image: { width: 180, height: 180, borderRadius: 12, marginBottom: 16 },
  wordText: { fontSize: 38, fontFamily: 'Nunito_700Bold', color: COLORS.CARD_FRONT_TEXT },
  phoneticText: { fontSize: 16, fontFamily: 'Nunito_300Light', color: COLORS.TEXT_HINT, fontStyle: 'italic', marginTop: 4 },
  tapHint: { fontSize: 13, color: COLORS.TEXT_HINT, marginTop: 12 },
  wordTextBack: { fontSize: 28, fontFamily: 'Nunito_700Bold', color: COLORS.TEXT_HINT, marginBottom: 8 },
  translationText: { fontSize: 38, fontFamily: 'Nunito_700Bold', color: COLORS.CARD_BACK_TEXT, marginBottom: 16 },
  divider: { width: '80%', height: 1, backgroundColor: '#5F6368', marginBottom: 16 },
  exampleText: { fontSize: 17, fontFamily: 'Nunito_400Regular', color: '#E8F0FE', fontStyle: 'italic', textAlign: 'center', marginBottom: 8 },
  exampleTransText: { fontSize: 15, fontFamily: 'Nunito_400Regular', color: COLORS.TEXT_HINT, textAlign: 'center' },
});
```

---

## 11. Estructura de Archivos del Proyecto

```
wordflash-english/
├── App.js                           # Entry point: carga fuentes, init DB, Navigator
├── app.json                         # Config Expo
├── babel.config.js
├── package.json
│
├── src/
│   ├── navigation/
│   │   ├── AppNavigator.jsx         # Stack raíz (Splash → Onboarding → MainTabs)
│   │   ├── MainTabNavigator.jsx     # Bottom tabs (5 tabs)
│   │   ├── WordsNavigator.jsx       # Stack: WordsScreen → Category → Study
│   │   └── PhrasesNavigator.jsx     # Stack: PhrasesScreen → Category → Study
│   │
│   ├── screens/
│   │   ├── OnboardingScreen.jsx
│   │   ├── HomeScreen.jsx
│   │   ├── WordsScreen.jsx
│   │   ├── WordsCategoryScreen.jsx
│   │   ├── StudyWordsScreen.jsx
│   │   ├── PhrasesScreen.jsx
│   │   ├── PhrasesCategoryScreen.jsx
│   │   ├── StudyPhrasesScreen.jsx
│   │   ├── ProgressScreen.jsx
│   │   └── SettingsScreen.jsx
│   │
│   ├── components/
│   │   ├── FlashCard.jsx
│   │   ├── CardImage.jsx
│   │   ├── CategoryCard.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── RatingButtons.jsx
│   │   ├── StreakBadge.jsx
│   │   ├── SearchBar.jsx
│   │   ├── FilterPills.jsx
│   │   ├── EmptyState.jsx
│   │   ├── LoadingCard.jsx
│   │   ├── StatsCard.jsx
│   │   ├── AchievementBadge.jsx
│   │   ├── PronunciationButton.jsx
│   │   ├── OnboardingSlide.jsx
│   │   └── SessionSummary.jsx
│   │
│   ├── database/
│   │   ├── database.js              # openDatabase(), initDatabase(), createTables()
│   │   ├── wordsRepository.js       # getWords(), searchWords(), getWordsByCategory()
│   │   ├── phrasesRepository.js     # getPhrases(), getPhrasesByCategory()
│   │   ├── progressRepository.js    # getProgress(), updateProgress(), toggleFavorite()
│   │   └── sessionRepository.js     # saveSession(), getConfig(), updateConfig()
│   │
│   ├── seeds/
│   │   ├── words_seed.js            # Array con las 5,000 palabras (puede dividirse en a1/a2/b1...)
│   │   ├── phrases_seed.js          # Array con las 500+ frases
│   │   └── seedRunner.js            # runSeedsIfNeeded(): inserta si la DB está vacía
│   │
│   ├── hooks/
│   │   ├── useStudySession.js       # loadCards(), submitRating(), finishSession()
│   │   ├── useProgress.js           # stats, streak, achievements
│   │   ├── useWords.js              # words, categories, search
│   │   ├── usePhrases.js            # phrases, categories, search
│   │   ├── useStreak.js             # checkAndUpdateStreak()
│   │   └── useSettings.js           # config, updateDailyGoal(), toggleNotifications()
│   │
│   ├── services/
│   │   ├── spacedRepetition.js      # calculateNextReview(progress, rating)
│   │   ├── notifications.js         # scheduleDailyNotification(), cancelNotification()
│   │   └── audioService.js          # speak(word), playAudio(url)
│   │
│   ├── store/
│   │   └── appStore.js              # Zustand: session state, user config cache
│   │
│   ├── theme/
│   │   ├── colors.js                # COLORS object (ver sección 3.2)
│   │   ├── typography.js            # TYPOGRAPHY object (ver sección 3.3)
│   │   └── spacing.js               # SPACING: { xs:4, sm:8, md:16, lg:24, xl:32 }
│   │
│   └── utils/
│       ├── dateUtils.js             # isToday(), daysBetween(), formatDate()
│       ├── formatters.js            # formatStreak(), formatProgress()
│       └── constants.js             # DAILY_GOAL_DEFAULT=20, SESSION_SIZE=20, etc.
│
└── assets/
    ├── images/
    │   ├── placeholder.png          # Imagen fallback para palabras sin URL
    │   ├── onboarding-1.png         # Ilustración slide 1
    │   ├── onboarding-2.png         # Ilustración slide 2
    │   ├── onboarding-3.png         # Ilustración slide 3
    │   └── logo.png                 # Ícono de la app (1024x1024)
    ├── fonts/                       # Nunito (se cargan vía expo-google-fonts)
    └── sounds/
        ├── correct.mp3              # Sonido sutil al calificar "Fácil"
        └── wrong.mp3                # Sonido sutil al calificar "Difícil"
```

---

## 12. Dependencias y Configuración

### 12.1 package.json — Dependencias

```json
{
  "dependencies": {
    "expo": "~51.0.0",
    "react": "18.2.0",
    "react-native": "0.74.0",

    "@react-navigation/native": "^6.1.9",
    "@react-navigation/bottom-tabs": "^6.5.11",
    "@react-navigation/native-stack": "^6.9.17",
    "react-native-screens": "~3.31.1",
    "react-native-safe-area-context": "4.10.1",

    "expo-sqlite": "~13.4.0",

    "react-native-reanimated": "~3.10.1",
    "react-native-gesture-handler": "~2.16.1",

    "react-native-fast-image": "^8.6.3",

    "@expo-google-fonts/nunito": "^0.2.3",
    "expo-font": "~12.0.6",

    "expo-av": "~14.0.4",
    "expo-speech": "~12.0.2",

    "expo-notifications": "~0.28.9",

    "zustand": "^4.5.2",

    "@expo/vector-icons": "^14.0.2",

    "react-native-chart-kit": "^6.12.0",

    "date-fns": "^3.6.0"
  }
}
```

### 12.2 app.json

```json
{
  "expo": {
    "name": "WordFlash English",
    "slug": "wordflash-english",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/logo.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/images/logo.png",
      "resizeMode": "contain",
      "backgroundColor": "#1A73E8"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/logo.png",
        "backgroundColor": "#1A73E8"
      },
      "package": "com.wordflash.english",
      "permissions": [
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE",
        "SCHEDULE_EXACT_ALARM"
      ]
    },
    "plugins": [
      "expo-font",
      "expo-notifications",
      ["expo-sqlite", { "enableFTS": false }]
    ]
  }
}
```

### 12.3 babel.config.js (requerido para Reanimated)

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin', // SIEMPRE debe ser el último plugin
    ],
  };
};
```

### 12.4 App.js — Inicialización

```jsx
// App.js
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Nunito_300Light, Nunito_400Regular,
  Nunito_500Medium, Nunito_600SemiBold, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { initDatabase } from './src/database/database';
import { runSeedsIfNeeded } from './src/seeds/seedRunner';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/theme/colors';

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [fontsLoaded] = useFonts({
    Nunito_300Light, Nunito_400Regular,
    Nunito_500Medium, Nunito_600SemiBold, Nunito_700Bold
  });

  useEffect(() => {
    initDatabase()
      .then(() => runSeedsIfNeeded())
      .then(() => setDbReady(true))
      .catch(err => console.error('Error inicializando app:', err));
  }, []);

  if (!fontsLoaded || !dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.PRIMARY_BLUE }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
```

---

## 13. Datos Semilla: Palabras y Frases

### 13.1 Estructura del Array de Palabras (words_seed.js)

```js
// src/seeds/words_seed.js
// Cada objeto sigue exactamente los campos de la tabla `words`
export const WORDS_SEED = [
  {
    english_word: 'water',
    spanish_trans: 'agua',
    phonetic: '/ˈwɔːtər/',
    category: 'food_drink',
    subcategory: 'beverages',
    frequency_rank: 57,
    difficulty: 'A1',
    image_url: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400',
    example_en: 'I drink a lot of water every day.',
    example_es: 'Tomo mucha agua todos los días.',
  },
  // ... (continuar con todas las palabras)
];
```

### 13.2 Primeras 200 Palabras con URLs de Imagen

> **INSTRUCCIÓN PARA EL AGENTE IA:** Insertar exactamente estos datos en `words_seed.js`. Las palabras del 201 al 5,000 deben generarse siguiendo este mismo patrón, expandiendo por categorías: verbos (201-400), adjetivos (401-600), hogar (601-750), familia (751-900), trabajo (901-1100), salud (1101-1350), naturaleza (1351-1650), viajes (1651-1900), tecnología (1901-2100), emociones (2101-2400), comida avanzada (2401-2650), educación (2651-2900), deportes (2901-3100), etc.

| # | english_word | spanish_trans | category | difficulty | image_url |
|---|---|---|---|---|---|
| 1 | the | el/la/los/las | basics | A1 | https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400 |
| 2 | be | ser/estar | verbs_common | A1 | https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400 |
| 3 | to | a/para | basics | A1 | https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400 |
| 4 | of | de | basics | A1 | https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400 |
| 5 | and | y | basics | A1 | https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400 |
| 6 | a | un/una | basics | A1 | https://images.unsplash.com/photo-1493421419110-74f4e85ba126?w=400 |
| 7 | in | en | basics | A1 | https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400 |
| 8 | that | ese/esa/que | basics | A1 | https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400 |
| 9 | have | tener | verbs_common | A1 | https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400 |
| 10 | it | eso/él/ella | basics | A1 | https://images.unsplash.com/photo-1518533871897-f9a0f69daf04?w=400 |
| 11 | for | para/por | basics | A1 | https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400 |
| 12 | not | no | basics | A1 | https://images.unsplash.com/photo-1495121553079-4c61bcce1894?w=400 |
| 13 | on | en/sobre | basics | A1 | https://images.unsplash.com/photo-1505682634904-d7c8d95cdc50?w=400 |
| 14 | with | con | basics | A1 | https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400 |
| 15 | he | él | basics | A1 | https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400 |
| 16 | you | tú/usted | basics | A1 | https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400 |
| 17 | do | hacer | verbs_common | A1 | https://images.unsplash.com/photo-1484981138541-3d074aa97716?w=400 |
| 18 | this | este/esta | basics | A1 | https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=400 |
| 19 | but | pero | basics | A1 | https://images.unsplash.com/photo-1527430253228-e93688616381?w=400 |
| 20 | his | su (de él) | basics | A1 | https://images.unsplash.com/photo-1463453091185-61582044d556?w=400 |
| 21 | they | ellos/ellas | basics | A1 | https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400 |
| 22 | we | nosotros | basics | A1 | https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400 |
| 23 | say | decir | verbs_common | A1 | https://images.unsplash.com/photo-1573166364524-d9dbfd8bbf83?w=400 |
| 24 | she | ella | basics | A1 | https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400 |
| 25 | or | o | basics | A1 | https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400 |
| 26 | will | futuro/voluntad | verbs_common | A1 | https://images.unsplash.com/photo-1501139083538-0139583c060f?w=400 |
| 27 | my | mi/mis | basics | A1 | https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400 |
| 28 | all | todo/todos | basics | A1 | https://images.unsplash.com/photo-1505682634904-d7c8d95cdc50?w=400 |
| 29 | would | condicional | verbs_common | A2 | https://images.unsplash.com/photo-1501139083538-0139583c060f?w=400 |
| 30 | there | allí/hay | basics | A1 | https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400 |
| 31 | what | qué | basics | A1 | https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400 |
| 32 | get | obtener/conseguir | verbs_common | A1 | https://images.unsplash.com/photo-1501139083538-0139583c060f?w=400 |
| 33 | go | ir | verbs_common | A1 | https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400 |
| 34 | know | saber/conocer | verbs_common | A1 | https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400 |
| 35 | take | tomar/llevar | verbs_common | A1 | https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400 |
| 36 | think | pensar | verbs_common | A1 | https://images.unsplash.com/photo-1573166364524-d9dbfd8bbf83?w=400 |
| 37 | come | venir | verbs_common | A1 | https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400 |
| 38 | look | mirar/verse | verbs_common | A1 | https://images.unsplash.com/photo-1495121553079-4c61bcce1894?w=400 |
| 39 | want | querer | verbs_common | A1 | https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400 |
| 40 | see | ver | verbs_common | A1 | https://images.unsplash.com/photo-1495121553079-4c61bcce1894?w=400 |
| 41 | make | hacer/crear | verbs_common | A1 | https://images.unsplash.com/photo-1484981138541-3d074aa97716?w=400 |
| 42 | can | poder | verbs_common | A1 | https://images.unsplash.com/photo-1524781289445-ddf8d5695e71?w=400 |
| 43 | like | gustar/como | verbs_common | A1 | https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400 |
| 44 | time | tiempo | numbers_time | A1 | https://images.unsplash.com/photo-1495121553079-4c61bcce1894?w=400 |
| 45 | give | dar | verbs_common | A1 | https://images.unsplash.com/photo-1484981138541-3d074aa97716?w=400 |
| 46 | use | usar | verbs_common | A1 | https://images.unsplash.com/photo-1484981138541-3d074aa97716?w=400 |
| 47 | ask | preguntar | verbs_common | A1 | https://images.unsplash.com/photo-1573166364524-d9dbfd8bbf83?w=400 |
| 48 | find | encontrar | verbs_common | A1 | https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400 |
| 49 | leave | salir/dejar | verbs_common | A1 | https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400 |
| 50 | water | agua | food_drink | A1 | https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400 |
| 51 | house | casa | home | A1 | https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=400 |
| 52 | cat | gato | animals | A1 | https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400 |
| 53 | dog | perro | animals | A1 | https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400 |
| 54 | food | comida | food_drink | A1 | https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400 |
| 55 | eat | comer | verbs_action | A1 | https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400 |
| 56 | drink | beber | verbs_action | A1 | https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400 |
| 57 | sleep | dormir | verbs_action | A1 | https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400 |
| 58 | walk | caminar | verbs_action | A1 | https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400 |
| 59 | run | correr | verbs_action | A1 | https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400 |
| 60 | read | leer | verbs_action | A1 | https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400 |
| 61 | write | escribir | verbs_action | A1 | https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400 |
| 62 | school | escuela | education | A1 | https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400 |
| 63 | mother | madre | family | A1 | https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=400 |
| 64 | father | padre | family | A1 | https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400 |
| 65 | brother | hermano | family | A1 | https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=400 |
| 66 | sister | hermana | family | A1 | https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400 |
| 67 | friend | amigo/a | social | A1 | https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400 |
| 68 | love | amor/amar | emotions | A1 | https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400 |
| 69 | book | libro | education | A1 | https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400 |
| 70 | car | carro/auto | transport | A1 | https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400 |
| 71 | money | dinero | work_business | A1 | https://images.unsplash.com/photo-1554260570-e9689a3418b8?w=400 |
| 72 | phone | teléfono | technology | A1 | https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400 |
| 73 | door | puerta | home | A1 | https://images.unsplash.com/photo-1558618047-f4e90e8a36e6?w=400 |
| 74 | table | mesa | home | A1 | https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400 |
| 75 | chair | silla | home | A1 | https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400 |
| 76 | bed | cama | home | A1 | https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400 |
| 77 | sun | sol | nature | A1 | https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400 |
| 78 | moon | luna | nature | A1 | https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400 |
| 79 | tree | árbol | nature | A1 | https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400 |
| 80 | flower | flor | nature | A1 | https://images.unsplash.com/photo-1490750967868-88df5691cc5e?w=400 |
| 81 | bird | pájaro | animals | A1 | https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400 |
| 82 | fish | pez/pescado | animals | A1 | https://images.unsplash.com/photo-1498603993951-8a027a8a8f84?w=400 |
| 83 | apple | manzana | food_drink | A1 | https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400 |
| 84 | bread | pan | food_drink | A1 | https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400 |
| 85 | milk | leche | food_drink | A1 | https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400 |
| 86 | egg | huevo | food_drink | A1 | https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400 |
| 87 | rice | arroz | food_drink | A1 | https://images.unsplash.com/photo-1536304993881-ff86e0c9c14b?w=400 |
| 88 | shirt | camisa | clothing | A1 | https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400 |
| 89 | shoes | zapatos | clothing | A1 | https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400 |
| 90 | bag | bolsa/bolso | clothing | A1 | https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400 |
| 91 | city | ciudad | travel | A1 | https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400 |
| 92 | road | carretera | transport | A1 | https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400 |
| 93 | music | música | arts_culture | A1 | https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400 |
| 94 | sport | deporte | sports | A1 | https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400 |
| 95 | red | rojo | colors_shapes | A1 | https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=400 |
| 96 | blue | azul | colors_shapes | A1 | https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400 |
| 97 | green | verde | colors_shapes | A1 | https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400 |
| 98 | white | blanco | colors_shapes | A1 | https://images.unsplash.com/photo-1518519391248-f3e9fb58b8d9?w=400 |
| 99 | black | negro | colors_shapes | A1 | https://images.unsplash.com/photo-1531281827326-42085fcb15c6?w=400 |
| 100 | yellow | amarillo | colors_shapes | A1 | https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400 |
| 101 | year | año | numbers_time | A1 | https://images.unsplash.com/photo-1495121553079-4c61bcce1894?w=400 |
| 102 | day | día | numbers_time | A1 | https://images.unsplash.com/photo-1495121553079-4c61bcce1894?w=400 |
| 103 | week | semana | numbers_time | A1 | https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400 |
| 104 | month | mes | numbers_time | A1 | https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400 |
| 105 | morning | mañana (tiempo) | numbers_time | A1 | https://images.unsplash.com/photo-1495214783159-3503fd1b572d?w=400 |
| 106 | night | noche | numbers_time | A1 | https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400 |
| 107 | good | bueno | adjectives | A1 | https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400 |
| 108 | big | grande | adjectives | A1 | https://images.unsplash.com/photo-1505682634904-d7c8d95cdc50?w=400 |
| 109 | small | pequeño | adjectives | A1 | https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400 |
| 110 | happy | feliz | emotions | A1 | https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400 |
| 111 | sad | triste | emotions | A1 | https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400 |
| 112 | angry | enojado | emotions | A1 | https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400 |
| 113 | hot | caliente | adjectives | A1 | https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=400 |
| 114 | cold | frío | adjectives | A1 | https://images.unsplash.com/photo-1517857399897-60c05b1c2c7a?w=400 |
| 115 | new | nuevo | adjectives | A1 | https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400 |
| 116 | old | viejo | adjectives | A1 | https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400 |
| 117 | fast | rápido | adjectives | A1 | https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400 |
| 118 | slow | lento | adjectives | A1 | https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400 |
| 119 | beautiful | hermoso/a | adjectives | A1 | https://images.unsplash.com/photo-1490750967868-88df5691cc5e?w=400 |
| 120 | easy | fácil | adjectives | A1 | https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400 |
| 121 | hard | difícil/duro | adjectives | A1 | https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400 |
| 122 | open | abierto/abrir | adjectives | A1 | https://images.unsplash.com/photo-1558618047-f4e90e8a36e6?w=400 |
| 123 | buy | comprar | verbs_action | A1 | https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?w=400 |
| 124 | sell | vender | verbs_action | A1 | https://images.unsplash.com/photo-1554260570-e9689a3418b8?w=400 |
| 125 | pay | pagar | verbs_action | A1 | https://images.unsplash.com/photo-1554260570-e9689a3418b8?w=400 |
| 126 | help | ayudar | verbs_common | A1 | https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400 |
| 127 | start | empezar | verbs_common | A1 | https://images.unsplash.com/photo-1501139083538-0139583c060f?w=400 |
| 128 | stop | parar | verbs_common | A1 | https://images.unsplash.com/photo-1495121553079-4c61bcce1894?w=400 |
| 129 | play | jugar/tocar | verbs_action | A1 | https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400 |
| 130 | sing | cantar | verbs_action | A1 | https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400 |
| 131 | dance | bailar | verbs_action | A1 | https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=400 |
| 132 | speak | hablar | verbs_action | A1 | https://images.unsplash.com/photo-1573166364524-d9dbfd8bbf83?w=400 |
| 133 | listen | escuchar | verbs_action | A1 | https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400 |
| 134 | smile | sonreír | emotions | A1 | https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400 |
| 135 | cry | llorar | emotions | A1 | https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400 |
| 136 | doctor | médico | health | A1 | https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400 |
| 137 | hospital | hospital | health | A1 | https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400 |
| 138 | medicine | medicina | health | A1 | https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400 |
| 139 | teacher | maestro/profesor | education | A1 | https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400 |
| 140 | student | estudiante | education | A1 | https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400 |
| 141 | computer | computadora | technology | A1 | https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400 |
| 142 | internet | internet | technology | A1 | https://images.unsplash.com/photo-1518770660439-4636190af475?w=400 |
| 143 | work | trabajar/trabajo | work_business | A1 | https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400 |
| 144 | people | gente | social | A1 | https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400 |
| 145 | now | ahora | adverbs | A1 | https://images.unsplash.com/photo-1495121553079-4c61bcce1894?w=400 |
| 146 | also | también | adverbs | A1 | https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400 |
| 147 | very | muy | adverbs | A1 | https://images.unsplash.com/photo-1505682634904-d7c8d95cdc50?w=400 |
| 148 | always | siempre | adverbs | A1 | https://images.unsplash.com/photo-1495121553079-4c61bcce1894?w=400 |
| 149 | never | nunca | adverbs | A1 | https://images.unsplash.com/photo-1495121553079-4c61bcce1894?w=400 |
| 150 | maybe | quizás | adverbs | A2 | https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400 |
| 151 | today | hoy | numbers_time | A1 | https://images.unsplash.com/photo-1495121553079-4c61bcce1894?w=400 |
| 152 | tomorrow | mañana (próximo día) | numbers_time | A1 | https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400 |
| 153 | yesterday | ayer | numbers_time | A1 | https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400 |
| 154 | number | número | numbers_time | A1 | https://images.unsplash.com/photo-1518533871897-f9a0f69daf04?w=400 |
| 155 | one | uno | numbers_time | A1 | https://images.unsplash.com/photo-1518533871897-f9a0f69daf04?w=400 |
| 156 | two | dos | numbers_time | A1 | https://images.unsplash.com/photo-1518533871897-f9a0f69daf04?w=400 |
| 157 | three | tres | numbers_time | A1 | https://images.unsplash.com/photo-1518533871897-f9a0f69daf04?w=400 |
| 158 | ten | diez | numbers_time | A1 | https://images.unsplash.com/photo-1518533871897-f9a0f69daf04?w=400 |
| 159 | hundred | cien/ciento | numbers_time | A1 | https://images.unsplash.com/photo-1518533871897-f9a0f69daf04?w=400 |
| 160 | window | ventana | home | A1 | https://images.unsplash.com/photo-1558618047-f4e90e8a36e6?w=400 |
| 161 | kitchen | cocina | home | A1 | https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400 |
| 162 | bathroom | baño | home | A1 | https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400 |
| 163 | garden | jardín | home | A1 | https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400 |
| 164 | street | calle | transport | A1 | https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400 |
| 165 | hotel | hotel | travel | A1 | https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400 |
| 166 | airport | aeropuerto | travel | A1 | https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400 |
| 167 | train | tren | transport | A1 | https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400 |
| 168 | bus | autobús | transport | A1 | https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400 |
| 169 | bank | banco | work_business | A1 | https://images.unsplash.com/photo-1554260570-e9689a3418b8?w=400 |
| 170 | store | tienda | shopping | A1 | https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400 |
| 171 | market | mercado | shopping | A1 | https://images.unsplash.com/photo-1506617564039-2f3b650b7010?w=400 |
| 172 | price | precio | shopping | A1 | https://images.unsplash.com/photo-1554260570-e9689a3418b8?w=400 |
| 173 | orange | naranja | colors_shapes | A1 | https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400 |
| 174 | pink | rosa/rosado | colors_shapes | A1 | https://images.unsplash.com/photo-1490750967868-88df5691cc5e?w=400 |
| 175 | circle | círculo | colors_shapes | A1 | https://images.unsplash.com/photo-1518533871897-f9a0f69daf04?w=400 |
| 176 | horse | caballo | animals | A1 | https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400 |
| 177 | cow | vaca | animals | A1 | https://images.unsplash.com/photo-1546445534-3bd1de47f87d?w=400 |
| 178 | chicken | pollo/gallina | animals | A1 | https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400 |
| 179 | banana | banana/plátano | food_drink | A1 | https://images.unsplash.com/photo-1528825871115-3581a5387919?w=400 |
| 180 | orange (fruit) | naranja (fruta) | food_drink | A1 | https://images.unsplash.com/photo-1547519571434-8cad25507ddd?w=400 |
| 181 | coffee | café | food_drink | A1 | https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400 |
| 182 | tea | té | food_drink | A1 | https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400 |
| 183 | juice | jugo/zumo | food_drink | A1 | https://images.unsplash.com/photo-1497534446932-c925b458314e?w=400 |
| 184 | pants | pantalón | clothing | A1 | https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400 |
| 185 | dress | vestido | clothing | A1 | https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400 |
| 186 | hat | sombrero/gorra | clothing | A1 | https://images.unsplash.com/photo-1533827432537-70133748f5c8?w=400 |
| 187 | key | llave | home | A1 | https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400 |
| 188 | rain | lluvia | nature | A1 | https://images.unsplash.com/photo-1428592953211-077101b2021b?w=400 |
| 189 | snow | nieve | nature | A1 | https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=400 |
| 190 | mountain | montaña | nature | A1 | https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400 |
| 191 | sea | mar | nature | A1 | https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400 |
| 192 | river | río | nature | A1 | https://images.unsplash.com/photo-1487621167305-5d248087c724?w=400 |
| 193 | soccer | fútbol | sports | A1 | https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400 |
| 194 | swimming | natación | sports | A1 | https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400 |
| 195 | movie | película | arts_culture | A1 | https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400 |
| 196 | song | canción | arts_culture | A1 | https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400 |
| 197 | picture | foto/imagen | arts_culture | A1 | https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=400 |
| 198 | baby | bebé | family | A1 | https://images.unsplash.com/photo-1519340333755-56e9c1d04579?w=400 |
| 199 | child | niño/a | family | A1 | https://images.unsplash.com/photo-1502781252888-9143ba7f074e?w=400 |
| 200 | family | familia | family | A1 | https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400 |

### 13.3 Frases Semilla — 50 Frases Completas

```js
// src/seeds/phrases_seed.js
export const PHRASES_SEED = [
  { phrase_en: 'Hello! How are you?',              phrase_es: '¡Hola! ¿Cómo estás?',                    category: 'greetings',     difficulty: 'A1' },
  { phrase_en: 'Good morning!',                    phrase_es: '¡Buenos días!',                            category: 'greetings',     difficulty: 'A1' },
  { phrase_en: 'Good afternoon!',                  phrase_es: '¡Buenas tardes!',                          category: 'greetings',     difficulty: 'A1' },
  { phrase_en: 'Good evening!',                    phrase_es: '¡Buenas noches!',                          category: 'greetings',     difficulty: 'A1' },
  { phrase_en: 'Nice to meet you!',                phrase_es: '¡Mucho gusto!',                            category: 'greetings',     difficulty: 'A1' },
  { phrase_en: 'See you later!',                   phrase_es: '¡Hasta luego!',                            category: 'greetings',     difficulty: 'A1' },
  { phrase_en: 'Goodbye!',                         phrase_es: '¡Adiós!',                                  category: 'greetings',     difficulty: 'A1' },
  { phrase_en: 'Thank you very much!',             phrase_es: '¡Muchas gracias!',                         category: 'courtesy',      difficulty: 'A1' },
  { phrase_en: "You're welcome!",                  phrase_es: '¡De nada!',                                category: 'courtesy',      difficulty: 'A1' },
  { phrase_en: "I'm sorry.",                       phrase_es: 'Lo siento.',                               category: 'courtesy',      difficulty: 'A1' },
  { phrase_en: 'Excuse me.',                       phrase_es: 'Con permiso / Disculpe.',                  category: 'courtesy',      difficulty: 'A1' },
  { phrase_en: 'Please help me.',                  phrase_es: 'Por favor, ayúdame.',                      category: 'courtesy',      difficulty: 'A1' },
  { phrase_en: 'My name is Carlos.',               phrase_es: 'Mi nombre es Carlos.',                     category: 'introductions', difficulty: 'A1' },
  { phrase_en: 'I am from Mexico.',                phrase_es: 'Soy de México.',                           category: 'introductions', difficulty: 'A1' },
  { phrase_en: 'I am a student.',                  phrase_es: 'Soy estudiante.',                          category: 'introductions', difficulty: 'A1' },
  { phrase_en: 'I speak a little English.',        phrase_es: 'Hablo un poco de inglés.',                 category: 'introductions', difficulty: 'A1' },
  { phrase_en: 'What time is it?',                 phrase_es: '¿Qué hora es?',                            category: 'questions',     difficulty: 'A1' },
  { phrase_en: 'Where is the bathroom?',           phrase_es: '¿Dónde está el baño?',                     category: 'questions',     difficulty: 'A1' },
  { phrase_en: 'How much does this cost?',         phrase_es: '¿Cuánto cuesta esto?',                     category: 'shopping',      difficulty: 'A1' },
  { phrase_en: 'Do you accept credit cards?',      phrase_es: '¿Aceptan tarjetas de crédito?',            category: 'shopping',      difficulty: 'A1' },
  { phrase_en: "I'd like a table for two.",        phrase_es: 'Quisiera una mesa para dos.',               category: 'restaurant',    difficulty: 'A1' },
  { phrase_en: 'What do you recommend?',           phrase_es: '¿Qué recomienda?',                         category: 'restaurant',    difficulty: 'A1' },
  { phrase_en: 'The check, please.',               phrase_es: 'La cuenta, por favor.',                    category: 'restaurant',    difficulty: 'A1' },
  { phrase_en: 'I am allergic to nuts.',           phrase_es: 'Soy alérgico a las nueces.',               category: 'restaurant',    difficulty: 'A2' },
  { phrase_en: 'Where is the nearest hotel?',      phrase_es: '¿Dónde está el hotel más cercano?',        category: 'travel',        difficulty: 'A1' },
  { phrase_en: 'I need a taxi, please.',           phrase_es: 'Necesito un taxi, por favor.',              category: 'travel',        difficulty: 'A1' },
  { phrase_en: 'My flight is at 8 in the morning.',phrase_es: 'Mi vuelo es a las 8 de la mañana.',        category: 'travel',        difficulty: 'A1' },
  { phrase_en: 'I have a reservation.',            phrase_es: 'Tengo una reservación.',                   category: 'travel',        difficulty: 'A2' },
  { phrase_en: 'Turn left at the corner.',         phrase_es: 'Gire a la izquierda en la esquina.',       category: 'directions',    difficulty: 'A1' },
  { phrase_en: 'Go straight ahead.',               phrase_es: 'Siga recto.',                              category: 'directions',    difficulty: 'A1' },
  { phrase_en: 'It is on the right side.',         phrase_es: 'Está al lado derecho.',                    category: 'directions',    difficulty: 'A1' },
  { phrase_en: 'How far is the airport?',          phrase_es: '¿Qué tan lejos está el aeropuerto?',       category: 'directions',    difficulty: 'A2' },
  { phrase_en: "I don't feel well.",               phrase_es: 'No me siento bien.',                       category: 'health',        difficulty: 'A1' },
  { phrase_en: 'I have a headache.',               phrase_es: 'Tengo dolor de cabeza.',                   category: 'health',        difficulty: 'A1' },
  { phrase_en: 'I need to see a doctor.',          phrase_es: 'Necesito ver a un médico.',                category: 'health',        difficulty: 'A1' },
  { phrase_en: 'Call an ambulance!',               phrase_es: '¡Llame a una ambulancia!',                 category: 'health',        difficulty: 'A1' },
  { phrase_en: 'I have a meeting at 3pm.',         phrase_es: 'Tengo una reunión a las 3pm.',              category: 'work',          difficulty: 'A2' },
  { phrase_en: 'Can you send me the report?',      phrase_es: '¿Puedes enviarme el informe?',             category: 'work',          difficulty: 'A2' },
  { phrase_en: 'I am on vacation this week.',      phrase_es: 'Estoy de vacaciones esta semana.',         category: 'work',          difficulty: 'A2' },
  { phrase_en: "Let's schedule a call.",           phrase_es: 'Agendemos una llamada.',                   category: 'work',          difficulty: 'B1' },
  { phrase_en: "It's very hot today.",             phrase_es: 'Hace mucho calor hoy.',                    category: 'weather',       difficulty: 'A1' },
  { phrase_en: 'It looks like rain.',              phrase_es: 'Parece que va a llover.',                  category: 'weather',       difficulty: 'A1' },
  { phrase_en: 'What is the weather forecast?',    phrase_es: '¿Cuál es el pronóstico del tiempo?',       category: 'weather',       difficulty: 'A2' },
  { phrase_en: 'I am very happy today!',           phrase_es: '¡Estoy muy feliz hoy!',                   category: 'emotions',      difficulty: 'A1' },
  { phrase_en: 'I am a little tired.',             phrase_es: 'Estoy un poco cansado/a.',                 category: 'emotions',      difficulty: 'A1' },
  { phrase_en: "That's amazing!",                  phrase_es: '¡Eso es increíble!',                       category: 'emotions',      difficulty: 'A1' },
  { phrase_en: "I'm not sure.",                    phrase_es: 'No estoy seguro/a.',                       category: 'emotions',      difficulty: 'A2' },
  { phrase_en: 'Could you speak more slowly?',     phrase_es: '¿Podría hablar más despacio?',             category: 'phone',         difficulty: 'A2' },
  { phrase_en: 'I will call you later.',           phrase_es: 'Te llamaré más tarde.',                    category: 'phone',         difficulty: 'A2' },
  { phrase_en: "Let's meet at noon.",              phrase_es: 'Encontrémonos al mediodía.',               category: 'time',          difficulty: 'A2' },
];
```

### 13.4 seedRunner.js

```js
// src/seeds/seedRunner.js
import { db } from '../database/database';
import { WORDS_SEED } from './words_seed';
import { PHRASES_SEED } from './phrases_seed';

export async function runSeedsIfNeeded() {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Verificar si ya hay datos
      tx.executeSql(
        'SELECT COUNT(*) as count FROM words',
        [],
        (_, result) => {
          const count = result.rows.item(0).count;
          if (count === 0) {
            console.log('Base de datos vacía, insertando seeds...');
            insertInBatches(tx, WORDS_SEED, 'words');
            insertInBatches(tx, PHRASES_SEED, 'phrases');
            // Crear config inicial del usuario
            tx.executeSql(
              'INSERT OR IGNORE INTO user_config (id) VALUES (1)',
              []
            );
          }
        }
      );
    }, reject, resolve);
  });
}

function insertInBatches(tx, data, tableName) {
  const BATCH_SIZE = 50;
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    batch.forEach(item => {
      if (tableName === 'words') {
        tx.executeSql(
          `INSERT INTO words
           (english_word, spanish_trans, phonetic, category, subcategory,
            frequency_rank, difficulty, image_url, example_en, example_es)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [item.english_word, item.spanish_trans, item.phonetic || null,
           item.category, item.subcategory || null, item.frequency_rank,
           item.difficulty || 'A1', item.image_url || null,
           item.example_en || null, item.example_es || null]
        );
      } else {
        tx.executeSql(
          `INSERT INTO phrases
           (phrase_en, phrase_es, category, context, difficulty, image_url)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [item.phrase_en, item.phrase_es, item.category,
           item.context || null, item.difficulty || 'A1', item.image_url || null]
        );
      }
    });
  }
}
```

---

## 14. Guía de Implementación Paso a Paso

### Paso 1 — Crear el proyecto

```bash
npx create-expo-app wordflash-english --template blank
cd wordflash-english

# Base de datos y audio
npx expo install expo-sqlite expo-av expo-speech expo-notifications expo-font

# Fuentes
npx expo install @expo-google-fonts/nunito

# Animaciones y gestos
npx expo install react-native-reanimated react-native-gesture-handler

# Navegación
npx expo install react-native-screens react-native-safe-area-context
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack

# Utilidades
npm install zustand date-fns react-native-fast-image react-native-chart-kit @expo/vector-icons
```

### Paso 2 — Crear la estructura de carpetas

Crear todas las carpetas y archivos vacíos descritos en la Sección 11. Empezar por los más fundamentales: `theme/colors.js` → `database/database.js` → `seeds/`.

### Paso 3 — Implementar `theme/colors.js` y `theme/typography.js`

Copiar exactamente los valores de la Sección 3.2 y 3.3. Todos los demás archivos importarán de aquí.

### Paso 4 — Configurar `babel.config.js`

Agregar `react-native-reanimated/plugin` como último plugin (ver Sección 12.3). Sin esto, las animaciones de flip no funcionarán.

### Paso 5 — Crear la base de datos

Implementar `database/database.js` con todos los `CREATE TABLE` e índices de la Sección 4. Probar que `initDatabase()` corre sin errores antes de continuar.

### Paso 6 — Insertar los datos semilla

Crear `seeds/words_seed.js` con las primeras 200 palabras (Sección 13.2) y `seeds/phrases_seed.js` con las 50 frases (Sección 13.3). Implementar `seedRunner.js` con inserción por batches. **Probar que los datos se insertan correctamente antes de construir la UI.**

### Paso 7 — Implementar `App.js`

Usar el código de la Sección 12.4. Verificar que fuentes y DB cargan antes de mostrar la app.

### Paso 8 — Construir la navegación

Crear `AppNavigator`, `MainTabNavigator`, `WordsNavigator`, `PhrasesNavigator` según la Sección 9.1.

### Paso 9 — Construir el componente `FlashCard`

Usar el código completo de la Sección 10.2. **Este es el componente más crítico.** Probar el flip en un dispositivo real antes de continuar.

### Paso 10 — Construir pantallas en orden de impacto

1. `HomeScreen` — lo primero que ve el usuario
2. `StudyWordsScreen` — el core de la app
3. `WordsScreen` con grid de categorías
4. `PhrasesScreen` y `StudyPhrasesScreen`
5. `ProgressScreen`
6. `OnboardingScreen`
7. `SettingsScreen`

### Paso 11 — Integrar el algoritmo SM-2

Implementar `services/spacedRepetition.js` exactamente como en la Sección 7.1. Conectar los botones `RatingButtons` con `calculateNextReview()` y `progressRepository.updateProgress()`.

### Paso 12 — Notificaciones diarias

```js
// services/notifications.js
import * as Notifications from 'expo-notifications';

export async function scheduleDailyNotification(hour = 9) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '¡Es hora de practicar inglés! 🇺🇸',
      body: 'Estudia 20 tarjetas y mantén tu racha.',
    },
    trigger: {
      hour,
      minute: 0,
      repeats: true,
    },
  });
}
```

### Paso 13 — Build final

```bash
# Instalar EAS CLI
npm install -g eas-cli
eas login

# Configurar
eas build:configure

# APK para pruebas (sin Play Store)
eas build --platform android --profile preview

# AAB para Google Play
eas build --platform android --profile production
```

---

## ⚠️ Notas Críticas para el Agente IA Implementador

| Problema | Solución |
|---|---|
| **`backfaceVisibility` ignorado en Android** | Usar Reanimated 3. El bug existe en Reanimated 2. |
| **Babel no encuentra Reanimated** | El plugin `react-native-reanimated/plugin` DEBE ser el ÚLTIMO en babel.config.js |
| **App lenta en primera carga** | Mostrar ActivityIndicator mientras se insertan los seeds. Usar batches de 50 rows. |
| **Imágenes no cargan offline** | Siempre tener `placeholder.png` local. El componente `CardImage` ya maneja el fallback. |
| **SQLite bloquea el UI thread** | Todas las operaciones SQLite son callbacks. Nunca asumir que son síncronas. |
| **FlatList lenta con 5,000 items** | NUNCA cargar todos los items a la vez. Usar `LIMIT` en queries. Siempre paginación. |
| **Fuentes no cargan** | Verificar que `expo-font` está en `plugins` de `app.json`. |
| **Notificaciones no funcionan en Android 13+** | Pedir permiso con `Notifications.requestPermissionsAsync()` antes de programarlas. |
| **Colores inconsistentes** | SIEMPRE importar de `theme/colors.js`. Prohibido hardcodear HEX en StyleSheets. |
| **SM-2 incorrecto** | Probar: rating=1 siempre da interval=1. rating=3 siempre multiplica. ease_factor mín. 1.3. |


