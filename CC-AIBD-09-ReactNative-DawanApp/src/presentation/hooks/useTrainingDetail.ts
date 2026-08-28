import { useState, useEffect, useCallback } from 'react';
import { Training } from '../../domain/types';
import { AxiosTrainingRepository } from '../../infrastructure/repositories/AxiosTrainingRepository';

export const useTrainingDetail = (slug: string) => {
  const [training, setTraining] = useState<Training | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!slug) return;
    
    setLoading(true);
    setError(null);
    try {
      const repository = new AxiosTrainingRepository();
      const data = await repository.getTrainingDetail(slug);
      setTraining(data);
    } catch (err: any) {
      setError(err.message || 'Impossible de charger le détail de la formation.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return {
    training,
    loading,
    error,
    refresh: fetchDetail,
  };
};

export default useTrainingDetail;
