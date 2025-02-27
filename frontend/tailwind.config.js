module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Ajoute tous les fichiers JSX/TSX dans le dossier src
    "./public/index.html", // Ajoute le fichier HTML principal
  ],
  theme: {
    extend: {}, // Tu peux étendre ou personnaliser le thème ici
  },
  plugins: [], // Tu peux ajouter des plugins Tailwind ici
}; 