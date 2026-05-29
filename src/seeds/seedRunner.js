// saflash — Seed runner: populates SQLite on first launch
import { getDatabase } from '../database/database';
import { WORDS_SEED } from './words_seed';
import { PHRASES_SEED } from './phrases_seed';
import { getConfig } from '../database/sessionRepository';

export async function runSeedsIfNeeded() {
  const db = getDatabase();

  const config = await getConfig();
  if (!config || config.first_launch !== 1) {
    return; // Already seeded
  }

  console.log('🌱 Running seed data population...');

  // ── Seed words ────────────────────────────
  const wordCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM words');
  if (wordCount.count === 0) {
    console.log(`   Inserting ${WORDS_SEED.length} words...`);
    await db.withTransactionAsync(async () => {
      for (let i = 0; i < WORDS_SEED.length; i += 100) {
        const batch = WORDS_SEED.slice(i, i + 100);
        const placeholders = batch.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
        const values = batch.flatMap(w => [
          w.english_word, w.spanish_trans, w.phonetic || null,
          w.category, w.subcategory || null, w.frequency_rank,
          w.difficulty || 'A1', w.image_url || null, w.audio_url || null,
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
    console.log(`   ✅ ${WORDS_SEED.length} words seeded`);
  }

  // ── Seed phrases ──────────────────────────
  const phraseCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM phrases');
  if (phraseCount.count === 0) {
    console.log(`   Inserting ${PHRASES_SEED.length} phrases...`);
    await db.withTransactionAsync(async () => {
      for (let i = 0; i < PHRASES_SEED.length; i += 100) {
        const batch = PHRASES_SEED.slice(i, i + 100);
        const placeholders = batch.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');
        const values = batch.flatMap(p => [
          p.phrase_en, p.phrase_es, p.category,
          p.context || null, p.difficulty || 'A1',
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
    console.log(`   ✅ ${PHRASES_SEED.length} phrases seeded`);
  }

  console.log('🎉 Seed data population complete!');
}
