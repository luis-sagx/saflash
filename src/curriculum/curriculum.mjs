// saflash — The guided path definition.
import { LEVELS } from '../utils/levels.mjs';

export const WORDS_PER_LESSON = 8;
export const PHRASES_PER_LESSON = 2;
export const LESSON_SIZE = WORDS_PER_LESSON + PHRASES_PER_LESSON;

export const CURRICULUM = {
  A1: [
    { title: 'Primeros pasos', icon: '👋', category: 'greetings', lessons: 6 },
    { title: 'Números', icon: '🔢', category: 'numbers', lessons: 6 },
    { title: 'Familia', icon: '👪', category: 'family', lessons: 6 },
    { title: 'Comida y bebida', icon: '🍎', category: 'food_drink', lessons: 6 },
    { title: 'La casa', icon: '🏠', category: 'home', lessons: 6 },
    { title: 'Colores y formas', icon: '🎨', category: 'colors_shapes', lessons: 6 },
    { title: 'El cuerpo', icon: '🧍', category: 'body', lessons: 6 },
    { title: 'Verbos esenciales', icon: '🏃', category: 'verbs_common', lessons: 6 },
  ],
  A2: [
    { title: 'Ropa', icon: '👕', category: 'clothing', lessons: 6 },
    { title: 'Compras', icon: '🛒', category: 'shopping', lessons: 6 },
    { title: 'La ciudad', icon: '🏙️', category: 'city_places', lessons: 6 },
    { title: 'Transporte', icon: '🚌', category: 'transport', lessons: 6 },
    { title: 'El clima', icon: '☀️', category: 'weather', lessons: 6 },
    { title: 'Trabajo', icon: '💼', category: 'work_business', lessons: 6 },
    { title: 'Deportes', icon: '⚽', category: 'sports', lessons: 6 },
    { title: 'Adjetivos', icon: '✨', category: 'adjectives', lessons: 6 },
  ],
  B1: [
    { title: 'Viajes', icon: '✈️', category: 'travel', lessons: 6 },
    { title: 'Restaurante', icon: '🍽️', category: 'restaurant', lessons: 6 },
    { title: 'Hotel', icon: '🏨', category: 'hotel', lessons: 6 },
    { title: 'Salud', icon: '🏥', category: 'health', lessons: 6 },
    { title: 'Educación', icon: '🎓', category: 'education', lessons: 6 },
    { title: 'Tecnología', icon: '💻', category: 'technology', lessons: 6 },
    { title: 'Emociones', icon: '💭', category: 'emotions', lessons: 6 },
    { title: 'Verbos de acción', icon: '🤸', category: 'verbs_action', lessons: 6 },
  ],
  B2: [
    { title: 'Dinero y banco', icon: '🏦', category: 'money_banking', lessons: 5 },
    { title: 'Medios y cultura', icon: '🎬', category: 'media_entertainment', lessons: 5 },
    { title: 'Medio ambiente', icon: '🌍', category: 'environment', lessons: 5 },
    { title: 'Ciencia', icon: '🔬', category: 'science', lessons: 5 },
    { title: 'Vida social', icon: '🗣️', category: 'social', lessons: 5 },
    { title: 'Adverbios', icon: '🔁', category: 'adverbs', lessons: 5 },
    { title: 'Phrasal verbs', icon: '🔗', category: 'phrasal_verbs', lessons: 5 },
  ],
  C1: [
    { title: 'Negocios', icon: '📊', category: 'work_business', lessons: 5 },
    { title: 'Ley y gobierno', icon: '⚖️', category: 'law_government', lessons: 5 },
    { title: 'Ciencia avanzada', icon: '🧪', category: 'science', lessons: 5 },
    { title: 'Arte y cultura', icon: '🎭', category: 'arts_culture', lessons: 5 },
    { title: 'Modismos', icon: '💬', category: 'idioms', lessons: 5 },
    { title: 'Matices', icon: '🧠', category: 'adjectives', lessons: 5 },
  ],
};

export function unitsForLevel(level) {
  return CURRICULUM[level] || [];
}

export const TOTAL_LESSONS = LEVELS.reduce(
  (sum, level) => sum + unitsForLevel(level).reduce((s, u) => s + u.lessons, 0),
  0
);
