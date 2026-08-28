import { useState, useEffect, useCallback, useMemo } from 'react';
import { Training } from '../../domain/types';
import { AxiosTrainingRepository } from '../../infrastructure/repositories/AxiosTrainingRepository';

export const useTrainings = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<string>('all');

  const fetchTrainings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const repository = new AxiosTrainingRepository();
      const data = await repository.getTrainings();
      setTrainings(data);
    } catch (err: any) {
      setError(err.message || 'Impossible de récupérer les formations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  // Client-side search and filtering
  const filteredTrainings = useMemo(() => {
    return trainings.filter((training) => {
      const titleMatch = training.title.toLowerCase().includes(searchQuery.toLowerCase());
      const descMatch = training.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
      const objectivesMatch = training.objectives.toLowerCase().includes(searchQuery.toLowerCase());
      const queryMatch = titleMatch || descMatch || objectivesMatch;

      if (!queryMatch) return false;

      const durValue = Number.parseInt(training.duration, 10);
      if (Number.isNaN(durValue)) return true;

      switch (selectedDuration) {
        case '1':
          return durValue === 1;
        case 'short':
          return durValue >= 2 && durValue <= 3;
        case 'long':
          return durValue >= 4;
        case 'all':
        default:
          return true;
      }
    });
  }, [trainings, searchQuery, selectedDuration]);

  return {
    trainings: filteredTrainings,
    allTrainingsCount: trainings.length,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedDuration,
    setSelectedDuration,
    refresh: fetchTrainings,
  };
};

export default useTrainings;
