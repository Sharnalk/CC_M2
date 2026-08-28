import axios from 'axios';
import { QuoteRequest } from '../../domain/types';
import { CONFIG } from '../../config';

/**
 * Envoi d'une demande de devis par email, via l'API Resend.
 *
 * Deux modes, décidés par la présence de la clé d'API :
 *  - clé fournie dans .env  -> envoi réel à CONFIG.RECEIVER_EMAIL ;
 *  - clé absente            -> envoi simulé (latence puis succès), ce qui
 *    permet de faire tourner l'application et les tests sans compte Resend.
 *
 * La clé est lue depuis l'environnement et n'est jamais commitée. Elle reste
 * toutefois embarquée dans le bundle au build (préfixe EXPO_PUBLIC_) : en
 * production, cet appel devrait passer par un back-end qui détient le secret.
 */
const SIMULATED_LATENCY_MS = 1500;

export class ResendEmailService {
  async sendQuoteRequest(request: QuoteRequest): Promise<void> {
    if (!CONFIG.RESEND_API_KEY) {
      console.warn('Clé Resend absente : envoi simulé.');
      await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
      return;
    }

    try {
      await axios.post(
        CONFIG.RESEND_ENDPOINT,
        {
          from: CONFIG.SENDER_EMAIL,
          to: CONFIG.RECEIVER_EMAIL,
          reply_to: request.clientEmail,
          subject: `[Devis] ${request.trainingTitle}`,
          html: this.buildHtml(request),
        },
        {
          headers: {
            Authorization: `Bearer ${CONFIG.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error: any) {
      const serverMessage = error.response?.data?.message || error.message;
      throw new Error(`Échec de l'envoi de la demande : ${serverMessage}`);
    }
  }

  /** Corps HTML de l'email reçu par le service commercial. */
  private buildHtml(request: QuoteRequest): string {
    const { clientName, clientEmail, clientPhone, companyName, message } = request;
    const { trainingTitle, trainingSlug } = request;

    const row = (label: string, value: string) => `
      <tr>
        <td style="padding: 6px 12px 6px 0; font-weight: bold; width: 150px;">${label}</td>
        <td style="padding: 6px 0;">${value}</td>
      </tr>`;

    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #d11919; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Demande de devis</h1>
        </div>
        <div style="padding: 24px; background-color: #ffffff;">
          <h2 style="color: #d11919; border-bottom: 2px solid #f0f0f0; padding-bottom: 8px; margin-top: 0; font-size: 16px;">Client</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            ${row('Nom complet', clientName)}
            ${row('Email', `<a href="mailto:${clientEmail}">${clientEmail}</a>`)}
            ${row('Téléphone', clientPhone)}
            ${companyName ? row('Entreprise', companyName) : ''}
          </table>

          <h2 style="color: #d11919; border-bottom: 2px solid #f0f0f0; padding-bottom: 8px; font-size: 16px;">Formation</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            ${row('Titre', `<strong>${trainingTitle}</strong>`)}
            ${row('Slug', `<code style="font-size: 13px; color: #666;">${trainingSlug}</code>`)}
          </table>

          ${message ? `
          <h2 style="color: #d11919; border-bottom: 2px solid #f0f0f0; padding-bottom: 8px; font-size: 16px;">Message</h2>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; border-left: 4px solid #d11919; white-space: pre-wrap;">${message}</div>` : ''}
        </div>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #777;">
          Envoyé automatiquement depuis l'application mobile DawanApp.
        </div>
      </div>`;
  }
}
