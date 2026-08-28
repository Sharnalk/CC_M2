import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { CONFIG } from '../../config';

// 
class HttpClient {
  private readonly instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: CONFIG.API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.initializeRequestInterceptor();
    this.initializeResponseInterceptor();
  }

  private initializeRequestInterceptor() {
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  private initializeResponseInterceptor() {
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        let errorMessage = 'Une erreur réseau inattendue est survenue.';
        
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data as any;
          errorMessage = data?.message || `Erreur serveur (${status})`;
        } else if (error.request) {
          // Request was made but no response was received
          errorMessage = 'Impossible de contacter le serveur. Veuillez vérifier votre connexion internet.';
        } else {
          errorMessage = error.message;
        }

        const customizedError = new Error(errorMessage);
        (customizedError as any).status = error.response?.status;
        (customizedError as any).originalError = error;

        return Promise.reject(customizedError);
      }
    );
  }

  public getInstance(): AxiosInstance {
    return this.instance;
  }
}

export const httpClient = new HttpClient().getInstance();
export default httpClient;
