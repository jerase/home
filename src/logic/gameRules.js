// ============================================================
// FICHIER : gameRules.js
// RÔLE    : Moteur de règles du jeu — toute la logique métier.
//           Fonctions pures (pas de React, pas d'état global).
//           Importé par useGameState.js et aiStrategy.js.
//
// RÈGLES IMPLÉMENTÉES :
//   - Déplacement des pions (circuit, couloir, case centrale)
//   - Barrage (2 pions même couleur = case infranchissable)
//   - Cases protégées (pas de capture, pas d'atterrissage adverse)
//   - Capture d'un pion adverse
//   - Cinq_Points (dé = 5) : entrée en jeu
//   - Six (dé = 6) : avancer de 12 cases
//   - Trois_Doubles (3×6 consécutifs) : pénalité
//   - Victoire (4 pions sur "centre")
//   - Détection des menaces (pour l'IA)
// ============================================================

import {
  CIRCUITS_BY_ZONE, COULOIR, ALL_COULOIR_CELLS,
  START_CELLS, PROTECTED_CELLS, PLAYER_ZONE,
  MIN_PAWNS_TO_SKIP_ENTRY,
} from './constants.js';


// ============================================================
// FONCTIONS UTILITAIRES DE ZONE ET CIRCUIT
// ============================================================

// Retourne la zone du plateau ("haut", "gauche", "bas", "droite") pour une couleur donnée.
function getZone(color) {
  return PLAYER_ZONE[color];
}

// Retourne le tableau de cases (circuit complet) pour une couleur donnée.
// Le circuit contient 71 cases : 70 cases de parcours + "centre".
function getCircuit(color) {
  return CIRCUITS_BY_ZONE[getZone(color)];
}


// ============================================================
// UTILITAIRES SUR LES PIONS
// ============================================================

// Retourne les pions d'un joueur ayant un statut précis.
// Statuts possibles : 'home' | 'board' | 'corridor' | 'finished'
export function pawnsWithStatus(player, status) {
  return player.pawns.filter(p => p.status === status);
}

// Retourne tous les pions d'un joueur qui ont quitté la zone de départ,
// y compris ceux qui ont atteint le centre (finished).
// Utilisé pour les comptages généraux.
export function pawnsInPlay(player) {
  return player.pawns.filter(
    p => p.status === 'board' || p.status === 'corridor' || p.status === 'finished'
  );
}

// Retourne les pions d'un joueur qui sont actifs sur le plateau
// (en jeu mais pas encore au centre).
// Utilisé pour les règles de déplacement.
export function pawnsOnBoard(player) {
  return player.pawns.filter(p => p.status === 'board' || p.status === 'corridor');
}

// Retourne tous les pions (de tous les joueurs) présents sur une case donnée.
// Seuls les pions 'board' et 'corridor' occupent une case.
// Chaque pion retourné est enrichi de sa couleur et de l'id de son joueur.
export function pawnsOnCell(cellId, allPlayers) {
  return allPlayers.flatMap(pl =>
    pl.pawns
      .filter(p => (p.status === 'board' || p.status === 'corridor') && p.cellId === cellId)
      .map(p => ({ ...p, color: pl.color, playerId: pl.id }))
  );
}


// ============================================================
// RÈGLES SUR LES CASES
// ============================================================

// RÈGLE — BARRAGE :
// Un barrage est formé quand 2 pions de la MÊME couleur occupent la même case.
// Aucun pion (ami ou adverse) ne peut traverser ni atterrir sur un barrage.
export function isBarrage(cellId, allPlayers) {
  const occupants = pawnsOnCell(cellId, allPlayers);
  if (occupants.length < 2) return false;
  // Il y a au moins 2 pions : vérifie s'ils sont de la même couleur
  return occupants[0].color === occupants[1].color;
}

// RÈGLE — CASE PROTÉGÉE :
// Une case protégée est identifiable par un rond blanc sur le plateau.
// Retourne true si la case est dans la liste des cases protégées.
export function isProtected(cellId) {
  return PROTECTED_CELLS.has(cellId);
}

// Retourne true si une case fait partie du couloir d'arrivée d'une couleur donnée.
// Utile pour savoir si un pion est "en couloir" (protégé des captures).
export function isCouloir(cellId, color) {
  return COULOIR[color]?.includes(cellId) ?? false;
}

// RÈGLE — ATTERRISSAGE BLOQUÉ :
// Un pion ne peut PAS atterrir sur une case si :
//   1. La case contient un BARRAGE (2 pions même couleur), ami ou adverse.
//   2. La case est PROTÉGÉE ET contient au moins un pion adverse.
//
// Note : une case non protégée avec 1 pion adverse = capture possible = OK.
// Cette règle s'applique à TOUS les déplacements (dé 1-6, avance de 12, etc.).
function isLandingBlocked(targetCellId, movingColor, allPlayers) {
  // Cas 1 : barrage sur la case cible → toujours bloqué
  if (isBarrage(targetCellId, allPlayers)) return true;

  // Cas 2 : case protégée avec au moins un pion adverse → atterrissage interdit
  if (isProtected(targetCellId)) {
    const occupants = pawnsOnCell(targetCellId, allPlayers);
    if (occupants.some(p => p.color !== movingColor)) return true;
  }

  return false;
}

// Retourne true si la case de départ du joueur est bloquée par un barrage.
// RÈGLE : si tous les pions sont en zone de départ ET la case de départ est
// bloquée par un barrage → le joueur passe son tour.
export function isStartCellBlocked(player, allPlayers) {
  return isBarrage(START_CELLS[player.color], allPlayers);
}

// Retourne true si un BARRAGE ADVERSE occupe la case de départ du joueur.
// Cas spécifique : avec un dé = 5, si un barrage adverse bloque la case de départ,
// le joueur ne peut pas rentrer de pion et doit avancer un pion en jeu.
function isAdverseBarrageOnStart(player, allPlayers) {
  const startCell = START_CELLS[player.color];
  const occupants = pawnsOnCell(startCell, allPlayers);
  // Barrage adverse = 2 pions d'une couleur différente du joueur
  return occupants.length >= 2 && occupants[0].color !== player.color;
}


// ============================================================
// CALCUL DE LA NOUVELLE POSITION D'UN PION
//
// RÈGLE FONDAMENTALE DE DÉPLACEMENT :
// Un pion avance de N cases dans son circuit (tableau ordonné de cases).
// Le circuit inclut le couloir et "centre" — pas de logique séparée.
//
// Un déplacement est IMPOSSIBLE (retourne null) si :
//   - Le pion est déjà 'finished'
//   - L'index cible dépasse la longueur du circuit (trop loin pour "centre")
//   - Un barrage bloque une case intermédiaire
//   - La case d'arrivée est bloquée (isLandingBlocked)
//
// Le statut retourné est :
//   'finished' si la case cible est "centre"
//   'corridor' si la case est dans le couloir de la couleur du joueur
//   'board'    sinon (circuit commun)
// ============================================================
export function computeNewPosition(pawn, steps, playerColor, allPlayers) {
  // Un pion déjà arrivé ne bouge plus
  if (pawn.status === 'finished') return null;

  const circuit = getCircuit(playerColor);
  const couloir = COULOIR[playerColor];

  // Trouver la position actuelle du pion dans son circuit
  const currentIdx = circuit.indexOf(pawn.cellId);
  if (currentIdx === -1) return null; // pion introuvable dans le circuit (erreur)

  // Calculer l'index de la case cible
  const targetIdx = currentIdx + steps;

  // RÈGLE COULOIR : le pion doit atteindre "centre" avec le nombre EXACT.
  // Si l'index cible dépasse la fin du circuit → mouvement impossible.
  if (targetIdx >= circuit.length) return null;

  const targetCell = circuit[targetIdx];

  // Vérifier les cases INTERMÉDIAIRES (entre la position actuelle et la cible).
  // Un barrage sur n'importe quelle case intermédiaire bloque le déplacement.
  for (let i = currentIdx + 1; i < targetIdx; i++) {
    if (isBarrage(circuit[i], allPlayers)) return null;
  }

  // Cas spécial : le pion atteint "centre" exactement → victoire partielle
  if (targetCell === 'centre') {
    return { status: 'finished', cellId: 'centre' };
  }

  // Vérifier si la case d'arrivée est bloquée (barrage ou case protégée adverse)
  if (isLandingBlocked(targetCell, playerColor, allPlayers)) return null;

  // Déterminer le statut selon la position de la case cible
  const inCouloir = couloir.includes(targetCell);
  return {
    status: inCouloir ? 'corridor' : 'board',
    cellId: targetCell,
  };
}


// ============================================================
// CAPTURE D'UN PION ADVERSE
//
// RÈGLE — CAPTURE :
// Quand un pion atterrit sur une case occupée par un seul pion adverse,
// ce pion adverse retourne dans sa zone de départ.
//
// La capture est IMPOSSIBLE si :
//   - La case est protégée (rond blanc)
//   - La case est "centre"
//   - La case contient 2 pions (barrage) — déjà bloqué par isLandingBlocked
//   - La case est vide ou occupée uniquement par des pions amis
//
// Retourne le pion capturé (avec color et id) ou null si pas de capture.
// ============================================================
export function getCapturedPawn(targetCellId, movingColor, allPlayers) {
  // Pas de capture sur une case protégée
  if (isProtected(targetCellId)) return null;
  // Pas de capture sur la case centrale
  if (targetCellId === 'centre') return null;

  const occupants = pawnsOnCell(targetCellId, allPlayers);
  const enemies = occupants.filter(p => p.color !== movingColor);

  // Capture uniquement s'il y a exactement 1 pion adverse ET pas d'allié
  if (enemies.length === 1 && occupants.length === 1) return enemies[0];
  return null;
}


// ============================================================
// CALCUL DES PIONS DÉPLAÇABLES
//
// Retourne la liste des ids de pions que le joueur peut légalement déplacer.
// Retourne [] si le joueur ne peut rien faire (doit passer son tour).
//
// RÈGLES IMPLÉMENTÉES selon le résultat du dé :
//
// Dé = 5 (Cinq_Points) :
//   - Si tous les pions sont en zone de départ et la case de départ est libre
//     → le joueur DOIT rentrer un pion (seuls les pions 'home' sont déplaçables)
//   - Si des pions sont en jeu ET la case de départ est accessible
//     → le joueur PEUT rentrer un pion OU avancer un pion en jeu de 5 cases
//   - Si barrage adverse sur la case de départ → ne peut pas rentrer
//
// Dé = 6 :
//   - Retourne les pions en jeu qui peuvent avancer de 12 cases
//   - Si liste vide → le joueur relancera sans avancer (géré dans le reducer)
//
// Dé = 1 à 4 :
//   - Si aucun pion en jeu → liste vide (passer le tour)
//   - Sinon → pions en jeu pouvant avancer du nombre indiqué
//
// Trois_Doubles (consecutiveSixes = 3) :
//   - Toujours retourner [] (pénalité gérée directement dans le reducer)
// ============================================================
export function getMovablePawns(player, diceValue, allPlayers, consecutiveSixes) {
  const inPlay  = pawnsOnBoard(player);  // pions actifs sur le plateau
  const inHome  = pawnsWithStatus(player, 'home'); // pions en zone de départ

  // Trois_Doubles : la pénalité est gérée dans le reducer, pas ici
  if (consecutiveSixes === 3) return [];

  // ── CAS : Cinq_Points (dé = 5) ───────────────────────────────────────
  if (diceValue === 5) {
    const movable = [];
    const startBlocked   = isStartCellBlocked(player, allPlayers);
    const adverseBarrage = isAdverseBarrageOnStart(player, allPlayers);

    // Le joueur peut rentrer un pion si :
    //   - il en a encore en zone de départ
    //   - ET la case de départ n'est pas bloquée (barrage ami ou adverse)
    //   - ET ce n'est pas un barrage adverse spécifiquement
    if (inHome.length > 0 && !startBlocked && !adverseBarrage) {
      if (inPlay.length === 0) {
        // Tous les pions sont à la maison → DOIT rentrer (pas d'autre choix)
        return inHome.map(p => p.id);
      }
      // Des pions sont déjà en jeu → peut rentrer OU avancer
      movable.push(...inHome.map(p => p.id));
    }

    // Ajouter les pions en jeu qui peuvent avancer de 5 cases
    for (const p of inPlay) {
      if (computeNewPosition(p, 5, player.color, allPlayers)) movable.push(p.id);
    }

    // Éliminer les doublons (un pion ne peut être proposé qu'une fois)
    return [...new Set(movable)];
  }

  // ── CAS : Six (dé = 6) → avancer de 12 cases ─────────────────────────
  if (diceValue === 6) {
    // Retourne les pions en jeu pouvant avancer de 12 cases
    // Si liste vide → le joueur relancera sans avancer (aucun bonus pour un 6 sans mouvement)
    return inPlay
      .filter(p => computeNewPosition(p, 12, player.color, allPlayers))
      .map(p => p.id);
  }

  // ── CAS : Résultats 1 à 4 ────────────────────────────────────────────
  // Si aucun pion n'est en jeu → impossible de bouger → passer le tour
  if (inPlay.length === 0) return [];

  // Retourne les pions en jeu pouvant avancer du nombre indiqué
  return inPlay
    .filter(p => computeNewPosition(p, diceValue, player.color, allPlayers))
    .map(p => p.id);
}


// ============================================================
// CONDITION DE VICTOIRE
//
// RÈGLE : Le premier joueur à amener ses 4 pions sur la case
//         centrale ("centre") remporte la partie.
// ============================================================
export function checkVictory(player) {
  return player.pawns.every(p => p.status === 'finished');
}


// ============================================================
// TROIS_DOUBLES — FONCTIONS POUR LA PÉNALITÉ
//
// RÈGLE — Trois_Doubles :
// Si un joueur obtient 6 trois fois de suite :
//   1. Si au moins un pion en jeu n'est pas sur une case protégée
//      → le pion le plus avancé parmi ceux-ci retourne en zone de départ
//   2. Si tous les pions en jeu sont sur des cases protégées
//      → rien ne se passe
//   3. Si aucun pion n'est en jeu et la case de départ est libre
//      → rentrer un pion sur la case de départ
// ============================================================

// Retourne true si TOUS les pions actifs du joueur sont sur des cases protégées.
// Utilisé pour déterminer si la pénalité Trois_Doubles s'applique (cas 2).
export function allInPlayOnProtected(player) {
  const inPlay = pawnsOnBoard(player);
  if (inPlay.length === 0) return false; // pas de pion en jeu → ne compte pas
  return inPlay.every(p => isProtected(p.cellId));
}

// Retourne le pion en jeu le plus avancé qui n'est PAS sur une case protégée.
// Utilisé pour appliquer la pénalité Trois_Doubles (cas 1).
// L'avancement est mesuré par l'index dans le circuit du joueur.
export function getMostAdvancedUnprotected(player) {
  const circuit = getCircuit(player.color);

  // Candidats : pions en jeu non protégés
  const candidates = pawnsOnBoard(player).filter(p => !isProtected(p.cellId));
  if (candidates.length === 0) return null;

  // Retourne le pion avec l'index le plus élevé dans le circuit
  return candidates.reduce((best, p) => {
    return circuit.indexOf(p.cellId) >= circuit.indexOf(best.cellId) ? p : best;
  });
}


// ============================================================
// DÉTECTION DE MENACE (pour la stratégie IA)
//
// Un pion est "menacé" si un adversaire peut le capturer à son prochain tour.
// Utilisé par l'IA pour décider de fuir (priorité 2 de la stratégie).
//
// Un pion n'est PAS menacé si :
//   - Il est dans le couloir (les adversaires ne peuvent pas y entrer)
//   - Il est sur une case protégée (pas de capture possible)
//   - Il n'est pas sur le circuit (statut 'home' ou 'finished')
// ============================================================
export function isThreatened(pawn, playerColor, allPlayers) {
  // Seuls les pions 'board' peuvent être capturés
  if (pawn.status !== 'board') return false;
  // Pas de capture sur une case protégée
  if (isProtected(pawn.cellId)) return false;
  // Pas de capture dans le couloir d'arrivée
  if (isCouloir(pawn.cellId, playerColor)) return false;

  // Vérifier chaque adversaire
  for (const pl of allPlayers) {
    if (pl.color === playerColor) continue; // ignorer le joueur lui-même

    // Utiliser le circuit de l'ADVERSAIRE pour mesurer la distance
    // (c'est l'adversaire qui se déplace, pas le défenseur)
    const epCircuit = getCircuit(pl.color);
    const pawnIdx   = epCircuit.indexOf(pawn.cellId);

    // Si le pion défenseur n'est pas dans le circuit de cet adversaire → pas de menace
    if (pawnIdx === -1) continue;

    for (const ep of pl.pawns) {
      if (ep.status !== 'board') continue; // seuls les pions en jeu peuvent menacer
      const epIdx = epCircuit.indexOf(ep.cellId);
      if (epIdx === -1) continue;

      // Distance entre le pion adverse et le pion défenseur
      const dist = pawnIdx - epIdx;

      // Menace si l'adversaire peut atteindre le pion en 1 à 6 déplacements
      if (dist > 0 && dist <= 6) return true;
    }
  }
  return false;
}


// ============================================================
// PROGRESSION D'UN PION (pour la stratégie IA)
//
// Retourne un score numérique représentant l'avancement d'un pion.
// Plus le score est élevé, plus le pion est proche du centre.
//   'finished' → 10000 (valeur très haute, pion arrivé)
//   'board' ou 'corridor' → index dans le circuit (0 à 69)
//   'home' → -1 (pas encore en jeu)
// ============================================================
export function getPawnProgress(pawn, color) {
  if (pawn.status === 'finished') return 10000;
  const circuit = getCircuit(color);
  const idx = circuit.indexOf(pawn.cellId);
  return idx >= 0 ? idx : -1;
}
