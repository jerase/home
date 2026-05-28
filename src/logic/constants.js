// ============================================================
// FICHIER : constants.js
// RÔLE    : Toutes les données statiques du jeu.
//           Aucune logique ici — uniquement des constantes.
//           Importé par gameRules.js, aiStrategy.js et les composants.
// ============================================================


// ============================================================
// JOUEURS ET COULEURS
// Règle : 2 à 4 joueurs, chacun avec une couleur unique.
// Chaque couleur correspond à une zone fixe sur le plateau.
// ============================================================

// Liste de toutes les couleurs possibles dans l'ordre antihoraire du plateau.
// Ordre antihoraire : jaune (haut) → vert (gauche) → bleu (bas) → rouge (droite)
export const PLAYERS = ["jaune", "vert", "bleu", "rouge"];

// Codes hexadécimaux pour le rendu SVG des pions et zones
export const PLAYER_COLORS = {
  jaune: "#FFD700",
  rouge: "#E74C3C",
  bleu:  "#2980B9",
  vert:  "#27AE60",
};

// Noms affichés dans l'interface (majuscule, en français)
export const PLAYER_LABELS = {
  jaune: "Jaune",
  rouge: "Rouge",
  bleu:  "Bleu",
  vert:  "Vert",
};

// Zone du plateau associée à chaque couleur.
// Utilisé pour récupérer le bon circuit selon la couleur du joueur.
export const PLAYER_ZONE = {
  jaune: "haut",    // zone de départ en haut du plateau
  vert:  "gauche",  // zone de départ à gauche
  bleu:  "bas",     // zone de départ en bas
  rouge: "droite",  // zone de départ à droite
};


// ============================================================
// CIRCUITS DE JEU
//
// Règle : Un pion parcourt 70 cases dans le sens antihoraire
//         avant d'entrer dans son couloir d'arrivée, puis
//         atteint la case "centre" au 71e déplacement.
//
// Chaque joueur a son propre circuit qui commence à sa case
// de départ et se termine par "centre".
//
// IMPORTANT : Le couloir d'arrivée est inclus dans le circuit
//             (cases colorées à la fin du tableau).
//             Pas de logique séparée pour le couloir — c'est
//             juste la continuation du même tableau.
//
// Nomenclature des cases :
//   "h-m-g4" = zone Haut, colonne Milieu, rangée Gauche, case 4
//   "g-m-h7" = zone Gauche, colonne Milieu, rangée Haut, case 7
//   "b-m-m7" = zone Bas, colonne Milieu, Milieu, case 7
// ============================================================

// Circuit du joueur JAUNE (zone de départ : HAUT)
// Parcours : Haut → Gauche → Bas → Droite → couloir jaune → centre
export const CIRCUIT_HAUT = [
  // ── Sortie de la zone HAUT (cases de départ gauche) ──
  "h-m-g4","h-m-g5","h-m-g6","h-m-g7",

  // ── Côté GAUCHE du plateau (de haut en bas) ──
  "g-m-h7","g-m-h6","g-m-h5","g-m-h4","g-m-h3","g-m-h2","g-m-h1","g-m-h0",
  "g-m-m0",  // case protégée milieu gauche
  "g-m-b0","g-m-b1","g-m-b2","g-m-b3","g-m-b4","g-m-b5","g-m-b6","g-m-b7",

  // ── Côté BAS du plateau (de gauche à droite) ──
  "b-m-g0","b-m-g1","b-m-g2","b-m-g3","b-m-g4","b-m-g5","b-m-g6","b-m-g7",
  "b-m-m7",  // case protégée milieu bas
  "b-m-d7","b-m-d6","b-m-d5","b-m-d4","b-m-d3","b-m-d2","b-m-d1","b-m-d0",

  // ── Côté DROITE du plateau (de bas en haut) ──
  "d-m-b0","d-m-b1","d-m-b2","d-m-b3","d-m-b4","d-m-b5","d-m-b6","d-m-b7",
  "d-m-m7",  // case protégée milieu droite
  "d-m-h7","d-m-h6","d-m-h5","d-m-h4","d-m-h3","d-m-h2","d-m-h1","d-m-h0",

  // ── Retour côté HAUT (de droite vers le couloir) ──
  "h-m-d7","h-m-d6","h-m-d5","h-m-d4","h-m-d3","h-m-d2","h-m-d1","h-m-d0",

  // ── COULOIR D'ARRIVÉE jaune (cases colorées jaunes, de l'entrée vers le centre) ──
  // Règle : le pion doit atteindre "centre" avec le nombre exact de cases
  "h-m-m0","h-m-m1","h-m-m2","h-m-m3","h-m-m4","h-m-m5","h-m-m6","h-m-m7",

  // ── CASE CENTRALE (arrivée, 71e position) ──
  "centre",
];

// Circuit du joueur VERT (zone de départ : GAUCHE)
// Parcours : Gauche → Bas → Droite → Haut → couloir vert → centre
export const CIRCUIT_GAUCHE = [
  // ── Sortie de la zone GAUCHE ──
  "g-m-b4","g-m-b5","g-m-b6","g-m-b7",

  // ── Côté BAS ──
  "b-m-g0","b-m-g1","b-m-g2","b-m-g3","b-m-g4","b-m-g5","b-m-g6","b-m-g7",
  "b-m-m7",
  "b-m-d7","b-m-d6","b-m-d5","b-m-d4","b-m-d3","b-m-d2","b-m-d1","b-m-d0",

  // ── Côté DROITE ──
  "d-m-b0","d-m-b1","d-m-b2","d-m-b3","d-m-b4","d-m-b5","d-m-b6","d-m-b7",
  "d-m-m7",
  "d-m-h7","d-m-h6","d-m-h5","d-m-h4","d-m-h3","d-m-h2","d-m-h1","d-m-h0",

  // ── Côté HAUT ──
  "h-m-d7","h-m-d6","h-m-d5","h-m-d4","h-m-d3","h-m-d2","h-m-d1","h-m-d0",
  "h-m-m0",
  "h-m-g0","h-m-g1","h-m-g2","h-m-g3","h-m-g4","h-m-g5","h-m-g6","h-m-g7",

  // ── Retour côté GAUCHE ──
  "g-m-h7","g-m-h6","g-m-h5","g-m-h4","g-m-h3","g-m-h2","g-m-h1","g-m-h0",

  // ── COULOIR D'ARRIVÉE vert ──
  "g-m-m0","g-m-m1","g-m-m2","g-m-m3","g-m-m4","g-m-m5","g-m-m6","g-m-m7",

  "centre",
];

// Circuit du joueur BLEU (zone de départ : BAS)
// Parcours : Bas → Droite → Haut → Gauche → couloir bleu → centre
export const CIRCUIT_BAS = [
  // ── Sortie de la zone BAS ──
  "b-m-d3","b-m-d2","b-m-d1","b-m-d0",

  // ── Côté DROITE ──
  "d-m-b0","d-m-b1","d-m-b2","d-m-b3","d-m-b4","d-m-b5","d-m-b6","d-m-b7",
  "d-m-m7",
  "d-m-h7","d-m-h6","d-m-h5","d-m-h4","d-m-h3","d-m-h2","d-m-h1","d-m-h0",

  // ── Côté HAUT ──
  "h-m-d7","h-m-d6","h-m-d5","h-m-d4","h-m-d3","h-m-d2","h-m-d1","h-m-d0",
  "h-m-m0",
  "h-m-g0","h-m-g1","h-m-g2","h-m-g3","h-m-g4","h-m-g5","h-m-g6","h-m-g7",

  // ── Côté GAUCHE ──
  "g-m-h7","g-m-h6","g-m-h5","g-m-h4","g-m-h3","g-m-h2","g-m-h1","g-m-h0",
  "g-m-m0",
  "g-m-b0","g-m-b1","g-m-b2","g-m-b3","g-m-b4","g-m-b5","g-m-b6","g-m-b7",

  // ── Retour côté BAS ──
  "b-m-g0","b-m-g1","b-m-g2","b-m-g3","b-m-g4","b-m-g5","b-m-g6","b-m-g7",

  // ── COULOIR D'ARRIVÉE bleu (direction inversée : de b-m-m7 vers b-m-m0) ──
  "b-m-m7","b-m-m6","b-m-m5","b-m-m4","b-m-m3","b-m-m2","b-m-m1","b-m-m0",

  "centre",
];

// Circuit du joueur ROUGE (zone de départ : DROITE)
// Parcours : Droite → Haut → Gauche → Bas → couloir rouge → centre
export const CIRCUIT_DROITE = [
  // ── Sortie de la zone DROITE ──
  "d-m-h3","d-m-h2","d-m-h1","d-m-h0",

  // ── Côté HAUT ──
  "h-m-d7","h-m-d6","h-m-d5","h-m-d4","h-m-d3","h-m-d2","h-m-d1","h-m-d0",
  "h-m-m0",
  "h-m-g0","h-m-g1","h-m-g2","h-m-g3","h-m-g4","h-m-g5","h-m-g6","h-m-g7",

  // ── Côté GAUCHE ──
  "g-m-h7","g-m-h6","g-m-h5","g-m-h4","g-m-h3","g-m-h2","g-m-h1","g-m-h0",
  "g-m-m0",
  "g-m-b0","g-m-b1","g-m-b2","g-m-b3","g-m-b4","g-m-b5","g-m-b6","g-m-b7",

  // ── Côté BAS ──
  "b-m-g0","b-m-g1","b-m-g2","b-m-g3","b-m-g4","b-m-g5","b-m-g6","b-m-g7",
  "b-m-m7",
  "b-m-d7","b-m-d6","b-m-d5","b-m-d4","b-m-d3","b-m-d2","b-m-d1","b-m-d0",

  // ── Retour côté DROITE ──
  "d-m-b0","d-m-b1","d-m-b2","d-m-b3","d-m-b4","d-m-b5","d-m-b6","d-m-b7",

  // ── COULOIR D'ARRIVÉE rouge (direction inversée : de d-m-m7 vers d-m-m0) ──
  "d-m-m7","d-m-m6","d-m-m5","d-m-m4","d-m-m3","d-m-m2","d-m-m1","d-m-m0",

  "centre",
];

// Accès rapide aux circuits par zone (clé = zone, valeur = tableau de cases)
export const CIRCUITS_BY_ZONE = {
  haut:   CIRCUIT_HAUT,
  gauche: CIRCUIT_GAUCHE,
  bas:    CIRCUIT_BAS,
  droite: CIRCUIT_DROITE,
};


// ============================================================
// CASES DE DÉPART
// Règle : Un pion entre en jeu sur la case de départ de sa couleur
//         uniquement lorsque le joueur obtient un Cinq_Points (dé = 5)
//         ou lors d'un Trois_Doubles (3 fois 6 consécutifs).
//
// La case de départ est toujours l'index 0 du circuit du joueur.
// ============================================================
export const START_CELLS = {
  jaune: "h-m-g4",  // case de départ jaune sur le circuit HAUT
  vert:  "g-m-b4",  // case de départ vert sur le circuit GAUCHE
  bleu:  "b-m-d3",  // case de départ bleu sur le circuit BAS
  rouge: "d-m-h3",  // case de départ rouge sur le circuit DROITE
};


// ============================================================
// COULOIRS D'ARRIVÉE
//
// Règle : Après avoir parcouru le circuit commun, un pion entre
//         dans le couloir coloré de sa couleur. Il doit atteindre
//         la case "centre" avec le nombre EXACT de cases.
//         Si le dé donne trop, le pion ne bouge pas.
//
// Les cases du couloir sont déjà incluses dans les circuits ci-dessus.
// On les liste ici séparément pour identifier rapidement si un pion
// est "en couloir" (status = 'corridor') ou encore sur le circuit commun.
// ============================================================
export const COULOIR = {
  // Couloir jaune : de h-m-m0 (entrée) vers h-m-m7 (avant le centre)
  jaune: ["h-m-m0","h-m-m1","h-m-m2","h-m-m3","h-m-m4","h-m-m5","h-m-m6","h-m-m7"],
  // Couloir vert : de g-m-m0 vers g-m-m7
  vert:  ["g-m-m0","g-m-m1","g-m-m2","g-m-m3","g-m-m4","g-m-m5","g-m-m6","g-m-m7"],
  // Couloir bleu : direction inversée, de b-m-m7 vers b-m-m0
  bleu:  ["b-m-m7","b-m-m6","b-m-m5","b-m-m4","b-m-m3","b-m-m2","b-m-m1","b-m-m0"],
  // Couloir rouge : direction inversée, de d-m-m7 vers d-m-m0
  rouge: ["d-m-m7","d-m-m6","d-m-m5","d-m-m4","d-m-m3","d-m-m2","d-m-m1","d-m-m0"],
};

// Set (ensemble) de toutes les cases couloir toutes couleurs confondues.
// Permet de vérifier rapidement en O(1) si une case est un couloir.
export const ALL_COULOIR_CELLS = new Set(
  Object.values(COULOIR).flat()
);


// ============================================================
// CASES PROTÉGÉES
//
// Règle : Sur une case protégée (rond blanc sur le plateau) :
//   1. Aucune capture ne peut avoir lieu.
//   2. Un pion ne peut pas atterrir sur une case protégée
//      qui contient déjà un pion adverse (même un seul).
//
// Il y a 12 cases protégées en tout, 3 par zone.
// ============================================================
export const PROTECTED_CELLS = new Set([
  // Zone HAUT : case de départ jaune, entrée couloir jaune, case protégée droite
  "h-m-g4", "h-m-m0", "h-m-d4",
  // Zone BAS  : case de départ bleu, case protégée gauche, case milieu bas
  "b-m-g3", "b-m-m7", "b-m-d3",
  // Zone GAUCHE : case protégée haut, entrée couloir vert, case de départ vert
  "g-m-h4", "g-m-m0", "g-m-b4",
  // Zone DROITE : case de départ rouge, case milieu droite, case protégée bas
  "d-m-h3", "d-m-m7", "d-m-b3",
]);


// ============================================================
// COORDONNÉES SVG DE CHAQUE CASE
//
// Le plateau SVG a un viewBox de "0 0 370 370".
// Chaque case est représentée par son centre (cx, cy) en pixels SVG.
// Ces coordonnées servent à positionner les pions sur le plateau.
//
// Cases verticales (zones haut/bas) : largeur 40px, hauteur 15px
// Cases horizontales (zones gauche/droite) : largeur 15px, hauteur 40px
// ============================================================
export const CELL_COORDINATES = {
  // ── Zone HAUT : 3 colonnes × 8 rangées ──
  "h-m-g0":{ cx:145,cy:12  }, "h-m-g1":{ cx:145,cy:27  }, "h-m-g2":{ cx:145,cy:42  },
  "h-m-g3":{ cx:145,cy:57  }, "h-m-g4":{ cx:145,cy:72  }, "h-m-g5":{ cx:145,cy:87  },
  "h-m-g6":{ cx:145,cy:102 }, "h-m-g7":{ cx:145,cy:117 },
  "h-m-m0":{ cx:185,cy:12  }, "h-m-m1":{ cx:185,cy:27  }, "h-m-m2":{ cx:185,cy:42  },
  "h-m-m3":{ cx:185,cy:57  }, "h-m-m4":{ cx:185,cy:72  }, "h-m-m5":{ cx:185,cy:87  },
  "h-m-m6":{ cx:185,cy:102 }, "h-m-m7":{ cx:185,cy:117 },
  "h-m-d0":{ cx:225,cy:12  }, "h-m-d1":{ cx:225,cy:27  }, "h-m-d2":{ cx:225,cy:42  },
  "h-m-d3":{ cx:225,cy:57  }, "h-m-d4":{ cx:225,cy:72  }, "h-m-d5":{ cx:225,cy:87  },
  "h-m-d6":{ cx:225,cy:102 }, "h-m-d7":{ cx:225,cy:117 },
  // ── Zone BAS : 3 colonnes × 8 rangées ──
  "b-m-g0":{ cx:145,cy:252 }, "b-m-g1":{ cx:145,cy:267 }, "b-m-g2":{ cx:145,cy:282 },
  "b-m-g3":{ cx:145,cy:297 }, "b-m-g4":{ cx:145,cy:312 }, "b-m-g5":{ cx:145,cy:327 },
  "b-m-g6":{ cx:145,cy:342 }, "b-m-g7":{ cx:145,cy:357 },
  "b-m-m0":{ cx:185,cy:252 }, "b-m-m1":{ cx:185,cy:267 }, "b-m-m2":{ cx:185,cy:282 },
  "b-m-m3":{ cx:185,cy:297 }, "b-m-m4":{ cx:185,cy:312 }, "b-m-m5":{ cx:185,cy:327 },
  "b-m-m6":{ cx:185,cy:342 }, "b-m-m7":{ cx:185,cy:357 },
  "b-m-d0":{ cx:225,cy:252 }, "b-m-d1":{ cx:225,cy:267 }, "b-m-d2":{ cx:225,cy:282 },
  "b-m-d3":{ cx:225,cy:297 }, "b-m-d4":{ cx:225,cy:312 }, "b-m-d5":{ cx:225,cy:327 },
  "b-m-d6":{ cx:225,cy:342 }, "b-m-d7":{ cx:225,cy:357 },
  // ── Zone GAUCHE : 8 colonnes × 3 rangées ──
  "g-m-h0":{ cx:12, cy:145 }, "g-m-h1":{ cx:27, cy:145 }, "g-m-h2":{ cx:42, cy:145 },
  "g-m-h3":{ cx:57, cy:145 }, "g-m-h4":{ cx:72, cy:145 }, "g-m-h5":{ cx:87, cy:145 },
  "g-m-h6":{ cx:102,cy:145 }, "g-m-h7":{ cx:117,cy:145 },
  "g-m-m0":{ cx:12, cy:185 }, "g-m-m1":{ cx:27, cy:185 }, "g-m-m2":{ cx:42, cy:185 },
  "g-m-m3":{ cx:57, cy:185 }, "g-m-m4":{ cx:72, cy:185 }, "g-m-m5":{ cx:87, cy:185 },
  "g-m-m6":{ cx:102,cy:185 }, "g-m-m7":{ cx:117,cy:185 },
  "g-m-b0":{ cx:12, cy:225 }, "g-m-b1":{ cx:27, cy:225 }, "g-m-b2":{ cx:42, cy:225 },
  "g-m-b3":{ cx:57, cy:225 }, "g-m-b4":{ cx:72, cy:225 }, "g-m-b5":{ cx:87, cy:225 },
  "g-m-b6":{ cx:102,cy:225 }, "g-m-b7":{ cx:117,cy:225 },
  // ── Zone DROITE : 8 colonnes × 3 rangées ──
  "d-m-h0":{ cx:252,cy:145 }, "d-m-h1":{ cx:267,cy:145 }, "d-m-h2":{ cx:282,cy:145 },
  "d-m-h3":{ cx:297,cy:145 }, "d-m-h4":{ cx:312,cy:145 }, "d-m-h5":{ cx:327,cy:145 },
  "d-m-h6":{ cx:342,cy:145 }, "d-m-h7":{ cx:357,cy:145 },
  "d-m-m0":{ cx:252,cy:185 }, "d-m-m1":{ cx:267,cy:185 }, "d-m-m2":{ cx:282,cy:185 },
  "d-m-m3":{ cx:297,cy:185 }, "d-m-m4":{ cx:312,cy:185 }, "d-m-m5":{ cx:327,cy:185 },
  "d-m-m6":{ cx:342,cy:185 }, "d-m-m7":{ cx:357,cy:185 },
  "d-m-b0":{ cx:252,cy:225 }, "d-m-b1":{ cx:267,cy:225 }, "d-m-b2":{ cx:282,cy:225 },
  "d-m-b3":{ cx:297,cy:225 }, "d-m-b4":{ cx:312,cy:225 }, "d-m-b5":{ cx:327,cy:225 },
  "d-m-b6":{ cx:342,cy:225 }, "d-m-b7":{ cx:357,cy:225 },
  // ── Case centrale (zone d'arrivée) ──
  "centre": { cx:185,cy:185 },
};


// ============================================================
// POSITIONS DES PIONS DANS LES ZONES DE DÉPART (SVG)
//
// Avant d'entrer en jeu, les 4 pions de chaque joueur sont
// disposés en grille 2×2 dans le coin de leur couleur.
// ============================================================
export const HOME_POSITIONS = {
  jaune: [{ cx:45, cy:45 },{ cx:85, cy:45 },{ cx:45, cy:85 },{ cx:85, cy:85 }],
  rouge: [{ cx:285,cy:45 },{ cx:325,cy:45 },{ cx:285,cy:85 },{ cx:325,cy:85 }],
  bleu:  [{ cx:285,cy:285},{ cx:325,cy:285},{ cx:285,cy:325},{ cx:325,cy:325}],
  vert:  [{ cx:45, cy:285},{ cx:85, cy:285},{ cx:45, cy:325},{ cx:85, cy:325}],
};


// ============================================================
// PARAMÈTRES DE L'IA
// ============================================================

// Délai en millisecondes entre les actions de l'IA (lancer du dé, déplacement).
// Ce délai rend le jeu lisible : on voit la face du dé avant que l'IA joue.
export const AI_DELAY_MS = 1200;

// Seuil de pions en jeu pour que l'IA préfère avancer plutôt que rentrer un pion.
// Si l'IA a déjà 2 pions ou plus en jeu, elle avance plutôt que d'en rentrer un nouveau.
export const MIN_PAWNS_TO_SKIP_ENTRY = 2;
