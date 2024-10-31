# Utiliser une image de base Node.js
FROM node:14

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier le fichier package.json et package-lock.json dans le répertoire de travail
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers de l'application dans le répertoire de travail
COPY . .

# Construire l'application React
RUN npm run build

# Utiliser une image de base Nginx pour servir l'application
FROM nginx:alpine

# Copier les fichiers de build dans le répertoire de travail de Nginx
COPY --from=0 /app/build /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Commande pour démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
