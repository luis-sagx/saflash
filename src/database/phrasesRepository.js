// saflash — Phrases repository
import { getDatabase } from './database';

export async function getPhrases({ category, difficulty, limit, offset } = {}) {
  const db = getDatabase();
  let sql = 'SELECT * FROM phrases WHERE 1=1';
  const params = [];

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (difficulty) {
    sql += ' AND difficulty = ?';
    params.push(difficulty);
  }

  sql += ' ORDER BY id ASC';

  if (limit != null) {
    sql += ' LIMIT ?';
    params.push(limit);
  }
  if (offset != null) {
    sql += ' OFFSET ?';
    params.push(offset);
  }

  return db.getAllAsync(sql, params);
}

export async function getPhrasesByCategory(category) {
  return getPhrases({ category });
}

export async function getPhraseById(id) {
  const db = getDatabase();
  return db.getFirstAsync('SELECT * FROM phrases WHERE id = ?', [id]);
}

export async function getPhraseCategories() {
  const db = getDatabase();
  return db.getAllAsync(
    `SELECT category, COUNT(*) as count
     FROM phrases
     GROUP BY category
     ORDER BY count DESC`
  );
}

export async function getTotalPhrasesCount() {
  const db = getDatabase();
  const result = await db.getFirstAsync('SELECT COUNT(*) as total FROM phrases');
  return result.total;
}

export async function getKnownPhrasesCount() {
  const db = getDatabase();
  const result = await db.getFirstAsync(
    `SELECT COUNT(*) as total FROM user_progress
     WHERE card_type = 'phrase' AND status = 'known'`
  );
  return result.total;
}

export const PHRASE_CATEGORY_HEADERS = {
  greetings:    'https://images.unsplash.com/photo-1573166364524-d9dbfd8bbf83?w=800',
  courtesy:     'https://images.unsplash.com/photo-1573166364524-d9dbfd8bbf83?w=800',
  questions:    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800',
  introductions:'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
  shopping:     'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
  restaurant:   'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
  travel:       'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
  work:         'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800',
  health:       'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
  directions:   'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
  phone:        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
  emotions:     'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
  time:         'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800',
  weather:      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
  family:       'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
};
