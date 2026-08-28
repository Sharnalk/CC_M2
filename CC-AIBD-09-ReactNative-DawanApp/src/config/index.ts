import { Platform } from 'react-native';

const DAWAN_API = 'https://dawan.org/public/training';

// En mode web de développement, le navigateur bloque l'appel direct à dawan.org
// (CORS : l'API est tierce et n'autorise pas notre origine). On passe alors par
// le proxy du serveur Metro, défini dans metro.config.js, qui relaie la requête
// côté serveur. Sur téléphone, l'appel se fait directement, sans intermédiaire.
const useWebDevProxy = Platform.OS === 'web' && __DEV__;

export const CONFIG = {
  API_BASE_URL: useWebDevProxy ? '/dawan-api' : DAWAN_API,

  // Envoi des demandes de devis (Resend). La clé est lue depuis .env, jamais
  // commitée. Sans clé, ResendEmailService bascule en envoi simulé : la
  // démonstration du formulaire reste possible sans compte.
  RESEND_API_KEY: process.env.EXPO_PUBLIC_RESEND_API_KEY || '',
  // Même contrainte CORS que pour l'API Dawan : en mode web de développement,
  // le POST vers api.resend.com est bloqué par le navigateur. On passe par le
  // proxy Metro, qui relaie l'appel côté serveur.
  RESEND_ENDPOINT: useWebDevProxy ? '/resend-api/emails' : 'https://api.resend.com/emails',
  SENDER_EMAIL: 'onboarding@resend.dev', // expéditeur du bac à sable Resend
  RECEIVER_EMAIL: process.env.EXPO_PUBLIC_RECEIVER_EMAIL || 'anas.jiyar1@gmail.com',
};
