/**
 * Types du domaine.
 *
 * L'API Dawan renvoie deux vues d'une même formation : une vue « catalogue »
 * (liste) et une vue « détail » (/show/{slug}). Elles partagent l'essentiel des
 * champs, seules quelques colonnes diffèrent — elles sont donc optionnelles ici
 * plutôt que dupliquées dans deux interfaces quasi identiques.
 */
export interface Training {
  // Champs présents dans les deux vues
  title: string;
  edofTitle: string | null;
  duration: string;
  description: string | null;
  slug: string;
  alias: string;
  fullAlias: string;
  path: string;
  type: string;
  standardPrice: number;
  customPrice: number;
  customPriceExtra: number;
  remotelyPrice: number;
  objectives: string;
  prerequisites: string;

  // Spécifiques à la vue catalogue
  cpfCode?: string | null;
  formacode?: number | null;
  trainingOrder?: number;
  certification?: unknown | null;

  // Spécifiques à la vue détail (/show/{slug})
  id?: number;
  plan?: string; // Programme de formation, en HTML
  audience?: string;
  reference?: string;
}

export interface QuoteRequest {
  trainingTitle: string;
  trainingSlug: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  companyName?: string;
  message?: string;
}
