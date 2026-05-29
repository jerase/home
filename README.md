<div align="center">

# 🎲 Jeu Home
### La version haïtienne du jeu

**Implémenté par Jacques ERASE**

[![Licence Propriétaire](https://img.shields.io/badge/licence-Propriétaire-red.svg)](#licence)
[![Version](https://img.shields.io/badge/version-1.0-blue.svg)](#)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF.svg)](https://vitejs.dev)

> Jeu de plateau haïtien pour 2 à 4 joueurs — version web et Android

🔗 **Démo en ligne** : *URL Vercel à venir*

</div>

---

## ⚠️ Propriété intellectuelle

Ce projet est protégé par une **licence propriétaire**.  
Toute reproduction, modification ou distribution est **strictement interdite**  
sans autorisation écrite préalable de l'auteur.

Voir le fichier [LICENSE](./LICENSE) pour les détails complets.

**© 2026 Jacques ERASE — erasedave@gmail.com**

---

## Présentation

**Jeu Home** est une implémentation web du jeu de plateau haïtien *Home*,  
inspiré du Parchísí. Chaque joueur doit amener ses 4 pions de sa zone  
de départ jusqu'à la case centrale, en parcourant le circuit dans le sens  
antihoraire.

### Fonctionnalités

- 🎮 **2 à 4 joueurs** — humains ou contrôlés par l'IA
- 🤖 **Intelligence artificielle** avec stratégie à 5 niveaux de priorité
- 📱 **Interface responsive** — mobile, tablette, desktop
- 🔄 **Perspective égocentrique** — ta zone est toujours en bas
- ⚡ **Règles complètes** — Cinq_Points, Six, Trois_Doubles, barrages, cases protégées
- 🏆 **Écran de victoire** animé
- 📐 **Plateau SVG** fidèle à l'original haïtien
- 🤖 **Mode 2 joueurs** avec disposition face-à-face

---

## Règles du jeu

### Principe

Chaque joueur possède 4 pions placés dans sa zone de départ.  
Le premier à amener ses 4 pions sur la **case centrale** remporte la partie.

### Résultats du dé

| Résultat | Effet |
|---|---|
| **5** — Cinq_Points | Faire entrer un pion en jeu depuis la zone de départ |
| **6** | Avancer de 12 cases et relancer le dé |
| **6 × 3** — Trois_Doubles | Pénalité : le pion le plus avancé retourne en zone de départ |
| **1 à 4** | Avancer un pion du nombre de cases indiqué |

### Règles spéciales

| Règle | Description |
|---|---|
| **Case protégée** | Rond blanc sur le plateau — aucune capture possible, aucun atterrissage adverse autorisé |
| **Barrage** | 2 pions de même couleur sur une même case — infranchissable par tous les pions |
| **Capture** | Atterrir sur une case adverse non protégée renvoie ce pion en zone de départ |
| **Couloir d'arrivée** | Le pion doit atteindre la case centrale avec le nombre exact |

---

## Stack technique

| Technologie | Version | Rôle |
|---|---|---|
| [React](https://react.dev) | 18 | Interface utilisateur |
| [Vite](https://vitejs.dev) | 5 | Bundler et serveur de développement |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Styles utilitaires |
| [Vitest](https://vitest.dev) | 4 | Tests automatisés |
| [Capacitor](https://capacitorjs.com) | — | Empaquetage Android |

---

## Installation et développement

### Prérequis

- [Node.js](https://nodejs.org) >= 18
- npm >= 9

### Démarrer en local

```bash
# Cloner le dépôt
git clone https://github.com/TON_USERNAME/home.git
cd home

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

L'application est accessible sur `http://localhost:5173`.

### Scripts disponibles

```bash
npm run dev           # Serveur de développement (hot reload)
npm run build         # Build de production → dossier dist/
npm run preview       # Prévisualiser le build de production
npm run clean         # Nettoyer dist/ et le cache Vite
npm test              # Lancer les tests une fois
npm run test:watch    # Tests en mode surveillance
npm run test:coverage # Rapport de couverture de code
```

---

## Tests automatisés

Le projet inclut **67 tests automatisés** avec [Vitest](https://vitest.dev).

```bash
npm test
```

| Fichier | Tests | Couverture |
|---|---|---|
| `gameRules.test.js` | 41 tests | Toutes les règles du jeu |
| `aiStrategy.test.js` | 7 tests | Les 5 priorités de l'IA |
| `useGameState.test.js` | 19 tests | Toutes les actions du reducer |

---

## Structure du projet

```
home/
├── LICENSE                         Licence propriétaire
├── README.md                       Ce fichier
├── index.html                      Point d'entrée HTML
├── package.json                    Dépendances et scripts
├── vite.config.js                  Configuration Vite + Tailwind + Vitest
└── src/
    ├── index.css                   Tailwind 4 + animations CSS
    ├── main.jsx                    Montage React
    ├── App.jsx                     Routage entre écrans
    ├── logic/
    │   ├── constants.js            Circuits, cases, coordonnées SVG
    │   ├── gameRules.js            Moteur de règles du jeu
    │   ├── aiStrategy.js           Stratégie de l'IA
    │   └── __tests__/              Tests de la logique métier
    ├── hooks/
    │   ├── useGameState.js         État global (useReducer)
    │   ├── useAI.js                Pilotage automatique de l'IA
    │   └── __tests__/              Tests du reducer
    └── components/
        ├── screens/
        │   ├── SetupScreen.jsx     Écran de configuration
        │   ├── GameScreen.jsx      Écran de jeu principal
        │   └── VictoryScreen.jsx   Écran de victoire
        ├── board/
        │   ├── Board.jsx           Plateau SVG
        │   └── Pawn.jsx            Pion SVG animé
        └── ui/
            ├── Dice.jsx            Dé + bouton lancer
            └── PlayerPanel.jsx     Panneaux des joueurs
```

---

## Déploiement Vercel

Le projet est déployé automatiquement sur **Vercel** à chaque push sur `main`.

### Configuration Vercel

| Paramètre | Valeur |
|---|---|
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### Mettre à jour le déploiement

```bash
git add .
git commit -m "Description de la modification"
git push
```

Vercel redéploie automatiquement en moins d'une minute.

---

## Android (Capacitor)

Le projet est compatible avec **Capacitor** pour générer une application Android.

```bash
# Build du projet web
npm run build

# Synchroniser avec Android
npx cap sync

# Ouvrir dans Android Studio
npx cap open android
```

Voir la [documentation Capacitor](https://capacitorjs.com/docs) pour plus de détails.

---

## Licence

Ce projet est protégé par une **licence propriétaire**.  
Voir le fichier [LICENSE](./LICENSE) pour les termes complets.

L'usage personnel et non commercial est autorisé.  
Toute utilisation commerciale, reproduction ou distribution est interdite  
sans autorisation écrite de l'auteur.

---

<div align="center">

**© 2026 Jacques ERASE — Tous droits réservés**  
📧 [erasedave@gmail.com](mailto:erasedave@gmail.com)

</div>
