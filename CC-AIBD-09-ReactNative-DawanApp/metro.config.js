const { getDefaultConfig } = require('expo/metro-config');
const https = require('https');

const config = getDefaultConfig(__dirname);

// --- Proxy de développement pour le mode web -------------------------------
// Dans un navigateur, l'appel direct à https://dawan.org est bloqué par la
// politique CORS : l'API est tierce et n'autorise pas notre origine. Cette
// restriction est propre au navigateur — sur téléphone (Expo Go), l'appel passe
// sans difficulté.
//
// Pour que la démonstration en mode web affiche de vraies données, le serveur de
// développement Metro relaie lui-même la requête : le trajet Metro -> dawan.org
// se fait de serveur à serveur, où CORS ne s'applique pas.
//
// Ce proxy n'existe QUE pendant le développement : il fait partie du serveur
// Metro, jamais du bundle livré.
const DAWAN_HOST = 'dawan.org';
const DAWAN_BASE_PATH = '/public/training';
const PROXY_PREFIX = '/dawan-api';

// Même problème pour l'envoi de devis : l'API Resend n'autorise pas les appels
// venant d'un navigateur. Ce second relais ne sert donc qu'à la démonstration
// web ; sur téléphone, ResendEmailService appelle api.resend.com directement.
const RESEND_HOST = 'api.resend.com';
const RESEND_PREFIX = '/resend-api';

const relayToResend = (req, res) => {
  // Requête préliminaire CORS envoyée par le navigateur avant le POST.
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    return res.end();
  }

  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => {
    const body = Buffer.concat(chunks);
    const upstream = https.request(
      {
        hostname: RESEND_HOST,
        path: req.url.slice(RESEND_PREFIX.length) || '/',
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': body.length,
          Authorization: req.headers.authorization || '',
        },
      },
      (upstreamRes) => {
        res.writeHead(upstreamRes.statusCode || 200, {
          'Content-Type': upstreamRes.headers['content-type'] || 'application/json',
          'Access-Control-Allow-Origin': '*',
        });
        upstreamRes.pipe(res);
      }
    );

    upstream.on('error', (err) => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: `Proxy Resend : ${err.message}` }));
    });

    upstream.end(body);
  });
};

config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => (req, res, next) => {
    if (req.url && req.url.startsWith(RESEND_PREFIX)) {
      return relayToResend(req, res);
    }

    if (!req.url || !req.url.startsWith(PROXY_PREFIX)) {
      return middleware(req, res, next);
    }

    // /dawan-api/show/xyz  ->  /public/training/show/xyz
    const suffix = req.url.slice(PROXY_PREFIX.length) || '/';
    const targetPath = DAWAN_BASE_PATH + (suffix.startsWith('/') ? suffix : `/${suffix}`);

    const upstream = https.request(
      {
        hostname: DAWAN_HOST,
        path: targetPath,
        method: 'GET',
        headers: { Accept: 'application/json', 'User-Agent': 'DawanApp-dev-proxy' },
      },
      (upstreamRes) => {
        // dawan.org redirige /public/training vers /public/training/ : on suit
        // la redirection ici plutôt que de la laisser au navigateur, qui la
        // transformerait en requête cross-origin et la rebloquerait.
        if (
          [301, 302, 307, 308].includes(upstreamRes.statusCode) &&
          upstreamRes.headers.location
        ) {
          const redirected = new URL(upstreamRes.headers.location, `https://${DAWAN_HOST}`);
          upstreamRes.resume();
          return https
            .get(
              {
                hostname: redirected.hostname,
                path: redirected.pathname + redirected.search,
                headers: { Accept: 'application/json', 'User-Agent': 'DawanApp-dev-proxy' },
              },
              (finalRes) => {
                res.writeHead(finalRes.statusCode || 200, {
                  'Content-Type': finalRes.headers['content-type'] || 'application/json',
                  'Access-Control-Allow-Origin': '*',
                });
                finalRes.pipe(res);
              }
            )
            .on('error', (err) => {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ message: `Proxy Dawan : ${err.message}` }));
            });
        }

        res.writeHead(upstreamRes.statusCode || 200, {
          'Content-Type': upstreamRes.headers['content-type'] || 'application/json',
          'Access-Control-Allow-Origin': '*',
        });
        upstreamRes.pipe(res);
      }
    );

    upstream.on('error', (err) => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: `Proxy Dawan : ${err.message}` }));
    });

    upstream.end();
  },
};

module.exports = config;
