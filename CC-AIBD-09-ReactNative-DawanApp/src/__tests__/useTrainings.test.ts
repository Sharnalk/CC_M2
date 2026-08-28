import { renderHook, act } from '@testing-library/react-native';
import { useTrainings } from '../presentation/hooks/useTrainings';
import { AxiosTrainingRepository } from '../infrastructure/repositories/AxiosTrainingRepository';

jest.mock('../infrastructure/repositories/AxiosTrainingRepository');

const mockTrainingsList = [
  {
    title: 'React Native',
    slug: 'react-native',
    duration: '5',
    standardPrice: 2000,
    objectives: 'Build mobile apps',
    prerequisites: 'JS',
  },
  {
    title: 'Docker Initiation',
    slug: 'docker-initiation',
    duration: '2',
    standardPrice: 1200,
    objectives: 'Learn containers',
    prerequisites: 'Linux',
  },
  {
    title: 'Kubernetes Advanced',
    slug: 'kubernetes-advanced',
    duration: '1',
    standardPrice: 700,
    objectives: 'K8s administration',
    prerequisites: 'Docker',
  },
];

describe('useTrainings custom hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches trainings on mount and handles filtering', async () => {
    const getTrainingsMock = jest.fn().mockResolvedValue(mockTrainingsList);
    (AxiosTrainingRepository as jest.Mock).mockImplementation(() => ({
      getTrainings: getTrainingsMock,
    }));

    const { result, rerender } = renderHook(() => useTrainings());

    // Initially loading
    expect(result.current.loading).toBe(true);

    // Wait for the hook to finish fetching
    await act(async () => {
      await Promise.resolve(); // Resolves internal useEffect mount cycle
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.trainings).toHaveLength(3);

    // Test text search
    act(() => {
      result.current.setSearchQuery('Docker');
    });
    expect(result.current.trainings).toHaveLength(1);
    expect(result.current.trainings[0].title).toBe('Docker Initiation');

    // Reset search
    act(() => {
      result.current.setSearchQuery('');
    });
    expect(result.current.trainings).toHaveLength(3);

    // Test duration filter: 1 Jour
    act(() => {
      result.current.setSelectedDuration('1');
    });
    expect(result.current.trainings).toHaveLength(1);
    expect(result.current.trainings[0].title).toBe('Kubernetes Advanced');

    // Test duration filter: 2-3 Jours
    act(() => {
      result.current.setSelectedDuration('short');
    });
    expect(result.current.trainings).toHaveLength(1);
    expect(result.current.trainings[0].title).toBe('Docker Initiation');

    // Test duration filter: 4+ Jours
    act(() => {
      result.current.setSelectedDuration('long');
    });
    expect(result.current.trainings).toHaveLength(1);
    expect(result.current.trainings[0].title).toBe('React Native');
  });

  it('handles network error gracefully', async () => {
    const getTrainingsMock = jest.fn().mockRejectedValue(new Error('Network failure'));
    (AxiosTrainingRepository as jest.Mock).mockImplementation(() => ({
      getTrainings: getTrainingsMock,
    }));

    const { result } = renderHook(() => useTrainings());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Network failure');
    expect(result.current.trainings).toHaveLength(0);
  });
});
