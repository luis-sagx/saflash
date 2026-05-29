// saflash — Phrases hook
import { useState, useEffect, useCallback } from 'react';
import {
  getPhrases,
  getPhrasesByCategory,
  getPhraseCategories,
  getKnownPhrasesCount,
} from '../database/phrasesRepository';

export function usePhrases() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const cats = await getPhraseCategories();
      setCategories(cats);
    } catch (err) {
      console.error('Error loading phrase categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return { categories, loading, refresh: loadCategories };
}

export function useCategoryPhrases(category) {
  const [phrases, setPhrases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) return;
    getPhrasesByCategory(category)
      .then(data => {
        setPhrases(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading category phrases:', err);
        setLoading(false);
      });
  }, [category]);

  return { phrases, loading };
}

export function useKnownPhrasesCount() {
  const [knownCount, setKnownCount] = useState(0);

  useEffect(() => {
    getKnownPhrasesCount().then(setKnownCount).catch(() => {});
  }, []);

  return knownCount;
}
