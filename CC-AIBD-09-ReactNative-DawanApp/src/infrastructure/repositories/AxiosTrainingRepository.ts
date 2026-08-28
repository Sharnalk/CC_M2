import { Training } from '../../domain/types';
import httpClient from '../http/HttpClient';

export class AxiosTrainingRepository {
  async getTrainings(): Promise<Training[]> {
    try {
      const response = await httpClient.get<Training[]>('/');
      return response.data;
    } catch (error: any) {
      throw new Error(`Erreur lors du chargement du catalogue : ${error.message}`);
    }
  }

  async getTrainingDetail(slug: string): Promise<Training> {
    try {
      // Endpoint: /show/{slug}
      const response = await httpClient.get<Training>(`/show/${slug}`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Erreur lors du chargement des détails de la formation : ${error.message}`);
    }
  }
}
