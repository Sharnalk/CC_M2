import { AxiosTrainingRepository } from '../infrastructure/repositories/AxiosTrainingRepository';
import httpClient from '../infrastructure/http/HttpClient';

jest.mock('../infrastructure/http/HttpClient', () => {
  return {
    get: jest.fn(),
  };
});

const mockTrainings = [
  {
    title: 'Vue.js Initiation',
    slug: 'vuejs-initiation',
    duration: '3',
    standardPrice: 1100,
    objectives: 'Learn Vue',
    prerequisites: 'JS',
  },
];

const mockDetail = {
  id: 12,
  title: 'Vue.js Initiation',
  slug: 'vuejs-initiation',
  duration: '3',
  standardPrice: 1100,
  plan: '<h4>Vue Basics</h4>',
  objectives: 'Learn Vue',
  prerequisites: 'JS',
  reference: 'VUE-12',
};

describe('AxiosTrainingRepository', () => {
  let repository: AxiosTrainingRepository;

  beforeEach(() => {
    repository = new AxiosTrainingRepository();
    jest.clearAllMocks();
  });

  it('fetches trainings catalog successfully', async () => {
    (httpClient.get as jest.Mock).mockResolvedValueOnce({ data: mockTrainings });

    const result = await repository.getTrainings();
    expect(httpClient.get).toHaveBeenCalledWith('/');
    expect(result).toEqual(mockTrainings);
  });

  it('fetches training detail successfully', async () => {
    (httpClient.get as jest.Mock).mockResolvedValueOnce({ data: mockDetail });

    const result = await repository.getTrainingDetail('vuejs-initiation');
    expect(httpClient.get).toHaveBeenCalledWith('/show/vuejs-initiation');
    expect(result).toEqual(mockDetail);
  });

  it('handles error propagation gracefully when fetching fails', async () => {
    const mockError = new Error('Network Timeout');
    (httpClient.get as jest.Mock).mockRejectedValueOnce(mockError);

    await expect(repository.getTrainings()).rejects.toThrow(
      'Erreur lors du chargement du catalogue : Network Timeout'
    );
  });
});
