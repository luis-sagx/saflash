// saflash — Words repository
import { getDatabase } from './database';

export async function getWords({ category, difficulty, limit, offset } = {}) {
  const db = getDatabase();
  let sql = 'SELECT * FROM words WHERE 1=1';
  const params = [];

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (difficulty) {
    sql += ' AND difficulty = ?';
    params.push(difficulty);
  }

  sql += ' ORDER BY frequency_rank ASC';

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

export async function searchWords(query) {
  const db = getDatabase();
  const searchTerm = `%${query}%`;
  return db.getAllAsync(
    `SELECT * FROM words
     WHERE english_word LIKE ? OR spanish_trans LIKE ?
     ORDER BY frequency_rank ASC
     LIMIT 50`,
    [searchTerm, searchTerm]
  );
}

export async function getWordsByCategory(category) {
  return getWords({ category });
}

export async function getWordById(id) {
  const db = getDatabase();
  return db.getFirstAsync('SELECT * FROM words WHERE id = ?', [id]);
}

export async function getWordCategories(difficulty = null) {
  const db = getDatabase();
  const diffClause = difficulty ? ' WHERE difficulty = ?' : '';
  return db.getAllAsync(
    `SELECT category, COUNT(*) as count
     FROM words${diffClause}
     GROUP BY category
     ORDER BY count DESC`,
    difficulty ? [difficulty] : []
  );
}

export async function getWordsForStudy(cardType = 'word', limit = 20, category = null, difficulty = null) {
  const db = getDatabase();
  const table = cardType === 'word' ? 'words' : 'phrases';
  // Only the words table has a frequency_rank column; phrases order by id.
  const orderCol = cardType === 'word' ? 'w.frequency_rank' : 'w.id';
  const catClause = category ? ' AND w.category = ?' : '';
  const diffClause = difficulty ? ' AND w.difficulty = ?' : '';
  const extraParams = [
    ...(category ? [category] : []),
    ...(difficulty ? [difficulty] : []),
  ];

  // 1. Due cards (highest priority)
  const due = await db.getAllAsync(
    `SELECT w.*, up.status, up.ease_factor, up.interval_days, up.next_review, up.last_review, up.is_favorite
     FROM ${table} w
     INNER JOIN user_progress up ON up.card_id = w.id AND up.card_type = ?
     WHERE up.next_review <= date('now') AND up.status != 'new' AND up.status != 'known'${catClause}${diffClause}
     ORDER BY up.next_review ASC
     LIMIT ?`,
    [cardType, ...extraParams, limit]
  );

  // 2. Fill remaining slots with new cards
  const remaining = limit - due.length;
  let newCards = [];
  if (remaining > 0) {
    newCards = await db.getAllAsync(
      `SELECT w.*, up.status, up.ease_factor, up.interval_days, up.next_review, up.last_review, up.is_favorite
       FROM ${table} w
       LEFT JOIN user_progress up ON up.card_id = w.id AND up.card_type = ?
       WHERE (up.card_id IS NULL OR up.status = 'new')${catClause}${diffClause}
       ORDER BY ${orderCol} ASC
       LIMIT ?`,
      [cardType, ...extraParams, remaining]
    );
  }

  return [...due, ...newCards];
}

export async function getFavoriteWords() {
  const db = getDatabase();
  return db.getAllAsync(
    `SELECT w.*, up.status, up.is_favorite
     FROM words w
     INNER JOIN user_progress up ON up.card_id = w.id AND up.card_type = 'word'
     WHERE up.is_favorite = 1
     ORDER BY w.frequency_rank ASC`
  );
}

export async function getRecentlyStudiedWords(limit = 5) {
  const db = getDatabase();
  return db.getAllAsync(
    `SELECT w.*, up.status, up.last_review
     FROM words w
     INNER JOIN user_progress up ON up.card_id = w.id AND up.card_type = 'word'
     WHERE up.last_review IS NOT NULL
     ORDER BY up.last_review DESC
     LIMIT ?`,
    [limit]
  );
}

export async function getTotalWordsCount() {
  const db = getDatabase();
  const result = await db.getFirstAsync('SELECT COUNT(*) as total FROM words');
  return result.total;
}

export async function getKnownWordsCount() {
  const db = getDatabase();
  const result = await db.getFirstAsync(
    `SELECT COUNT(*) as total FROM user_progress
     WHERE card_type = 'word' AND status = 'known'`
  );
  return result.total;
}

export async function getCategoryImage(category) {
  const CATEGORY_HEADERS = {
    basics: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
    verbs_common: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800',
    verbs_action: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800',
    family: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
    body: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
    health: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
    food_drink: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
    clothing: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800',
    home: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
    nature: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    animals: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800',
    colors_shapes: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800',
    numbers_time: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800',
    emotions: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
    work_business: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800',
    technology: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
    transport: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
    education: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800',
    sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
    arts_culture: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    shopping: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
    travel: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
    social: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
    adjectives: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800',
    adverbs: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800',
    other: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
  };
  return CATEGORY_HEADERS[category] || null;
}
