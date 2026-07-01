// saflash — Words hook
import { useState, useEffect, useCallback } from 'react';
import {
  getWords,
  getWordCategories,
  searchWords,
  getFavoriteWords,
  getRecentlyStudiedWords,
  getKnownWordsCount,
} from '../database/wordsRepository';

export function useWords(difficulty = null) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const cats = await getWordCategories(difficulty);
      setCategories(cats);
    } catch (err) {
      console.error('Error loading word categories:', err);
    } finally {
      setLoading(false);
    }
  }, [difficulty]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return { categories, loading, refresh: loadCategories };
}

export function useWordSearch() {
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const search = useCallback(async (query) => {
    if (!query || query.trim().length === 0) {
      setResults([]);
      return;
    }
    try {
      setSearching(true);
      const data = await searchWords(query.trim());
      setResults(data);
    } catch (err) {
      console.error('Error searching words:', err);
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  return { results, searching, search, clearSearch: () => setResults([]) };
}

export function useCategoryWords(category, difficulty = null) {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) return;
    setLoading(true);
    getWords({ category, difficulty })
      .then(data => {
        setWords(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading category words:', err);
        setLoading(false);
      });
  }, [category, difficulty]);

  return { words, loading };
}

export function useFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getFavoriteWords();
      setFavorites(data);
    } catch (err) {
      console.error('Error loading favorites:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return { favorites, loading, refresh: loadFavorites };
}

export function useRecentWords() {
  const [recentWords, setRecentWords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentlyStudiedWords(5)
      .then(data => {
        setRecentWords(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading recent words:', err);
        setLoading(false);
      });
  }, []);

  return { recentWords, loading };
}

export function useKnownCount() {
  const [knownCount, setKnownCount] = useState(0);

  useEffect(() => {
    getKnownWordsCount().then(setKnownCount).catch(() => {});
  }, []);

  return knownCount;
}
