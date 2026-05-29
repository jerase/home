# 🎲 Jeu Home — La version haïtienne du jeu

> Implémenté par **Jacques ERASE**

Application web du jeu de plateau **Home**, version haïtienne américaine du Parchísí.  
Jouable sur navigateur, mobile et Android.

🔗 **Démo en ligne** : [https://home.vercel.app](https://home.vercel.app)

---

## Présentation

**Jeu Home** est un jeu de plateau pour 2 à 4 joueurs, inspiré du Parchísí haïtien.  
Chaque joueur doit amener ses 4 pions de sa zone de départ jusqu'à la case centrale, en suivant le circuit dans le sens antihoraire.

### Fonctionnalités

- 🎮 2 à 4 joueurs (humains ou IA)
- 🤖 Intelligence artificielle avec stratégie définie (capture, fuite, protection)
- 📱 Interface responsive — mobile, tablette, desktop
- 🔄 Perspective égocentrique : ta zone est toujours en bas
- ⚡ Gestion complète des règles : Cinq_Points, Six, Trois_Doubles, barrages, cases protégées
- 🏆 Écran de victoire

---

## Règles du jeu

| Résultat du dé | Effet |
|---|---|
| **5** (Cinq_Points) | Faire entrer un pion en jeu sur sa case de départ |
| **6** | Avancer de 12 cases et relancer le dé |
| **6 × 3** (Trois_Doubles) | Pénalité : le pion le plus avancé retourne en zone de départ |
| **1 à 4** | Avancer un pion du nombre indiqué |

**Cases protégées** (rond blanc) : aucune capture possible, aucun atterrissage adverse autorisé.  
**Barrage** : 2 pions de même couleur sur la même case — infranchissable par tous.

---

## Stack technique

| Technologie | Version | Rôle |
|---|---|---|
| React | 18 | Interface utilisateur |
| Vite | 5 | Bundler et serveur de développement |
| Tailwind CSS | 4 | Styles utilitaires |
| Capacitor | — | Empaquetage Android |

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
npm run dev      # Serveur de développement (hot reload)
npm run build    # Build de production → dossier dist/
npm run preview  # Prévisualiser le build de production
npm run clean    # Nettoyer dist/ et le cache Vite
```

---

## Déploiement sur Vercel

Le projet est déployé automatiquement sur **Vercel** à chaque push sur la branche `main`.

### Configuration Vercel

Vercel détecte automatiquement le projet Vite. Aucune configuration manuelle n'est nécessaire.

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

## Structure du projet

```
home/
├── index.html                      Point d'entrée HTML
├── package.json                    Dépendances et scripts
├── vite.config.js                  Configuration Vite + Tailwind
└── src/
    ├── index.css                   Tailwind 4 + animations CSS
    ├── main.jsx                    Montage React
    ├── App.jsx                     Routage entre écrans
    ├── logic/
    │   ├── constants.js            Circuits, cases, coordonnées SVG
    │   ├── gameRules.js            Moteur de règles du jeu
    │   └── aiStrategy.js          Stratégie de l'IA
    ├── hooks/
    │   ├── useGameState.js         État global (useReducer)
    │   └── useAI.js               Pilotage automatique de l'IA
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

## Android (Capacitor)

Le projet est compatible avec **Capacitor** pour générer une app Android.

```bash
# Après avoir installé Capacitor dans le projet
npm run build
npx cap sync
npx cap open android
```

Voir la [documentation Capacitor](https://capacitorjs.com/docs) pour plus de détails.

---

## Licence

Projet privé — © Jacques ERASE. Tous droits réservés.
