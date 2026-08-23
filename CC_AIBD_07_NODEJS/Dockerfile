# Image simple, un seul étage : Node 18 + pnpm, on installe, on copie, on lance.
FROM node:18-alpine

WORKDIR /app

# Copier d'abord juste les fichiers de dépendances : Docker met cette étape en
# cache tant que package.json/pnpm-lock.yaml ne changent pas, donc "docker build"
# ne réinstalle pas tout à chaque modif de code.
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copier le reste du code
COPY . .

EXPOSE 5000

CMD ["node", "src/server.js"]
