// saflash — Loads the guided lesson path.
import { useCallback, useEffect, useState } from 'react';
import { getCurrentLesson, getPath } from '../database/lessonsRepository';
import { getConfig } from '../database/sessionRepository';

export function useLessonPath() {
  const [units, setUnits] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [path, current, cfg] = await Promise.all([
        getPath(),
        getCurrentLesson(),
        getConfig(),
      ]);
      setUnits(path);
      setCurrentLesson(current);
      setConfig(cfg);
    } catch (err) {
      console.error('Error loading lesson path:', err);
      setError('No se pudo cargar la ruta.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { units, currentLesson, config, loading, error, refresh };
}
