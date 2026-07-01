// saflash — Phrases hook
import { useState, useEffect, useCallback } from 'react';
import {
  getPhrases,
  getPhraseCategories,
  getKnownPhrasesCount,
} from '../database/phrasesRepository';

export function usePhrases(difficulty = null) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const cats = await getPhraseCategories(difficulty);
      setCategories(cats);
    } catch (err) {
      console.error('Error loading phrase categories:', err);
    } finally {
      setLoading(false);
    }
  }, [difficulty]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return { categories, loading, refresh: loadCategories };
}

export function useCategoryPhrases(category, difficulty = null) {
  const [phrases, setPhrases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) return;
    setLoading(true);
    getPhrases({ category, difficulty })
      .then(data => {
        setPhrases(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading category phrases:', err);
        setLoading(false);
      });
  }, [category, difficulty]);

  return { phrases, loading };
}

export function useKnownPhrasesCount() {
  const [knownCount, setKnownCount] = useState(0);

  useEffect(() => {
    getKnownPhrasesCount().then(setKnownCount).catch(() => {});
  }, []);

  return knownCount;
}
