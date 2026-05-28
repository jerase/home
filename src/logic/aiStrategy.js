// ============================================================
// FICHIER : aiStrategy.js
// RÔLE    : Stratégie de décision des joueurs IA.
//           Détermine quel pion l'IA doit déplacer parmi les
//           pions légalement déplaçables (calculés par gameRules.js).
//
// L'IA suit un ensemble de priorités dans l'ordre défini.
// Elle applique exactement les mêmes règles qu'un joueur humain —
// la seule différence est que ses décisions sont automatiques.
// ============================================================

import { MIN_PAWNS_TO_SKIP_ENTRY } from './constants.js';
import {
  pawnsOnBoard, pawnsWithStatus, computeNewPosition,
  getCapturedPawn, isProtected, isThreatened,
  getPawnProgress,
} from './gameRules.js';


// ============================================================
// FONCTION PRINCIPALE : chooseAIPawn
//
// Détermine quel pion l'IA doit déplacer.
//
// Paramètres :
//   player        : objet joueur IA (color, pawns, isAI)
//   movablePawnIds: liste d'ids de pions légalement déplaçables
//   diceValue     : résultat du dé (1 à 6)
//   allPlayers    : tous les joueurs de la partie
//
// Retourne l'id du pion choisi, ou null si aucun choix possible.
//
// PRIORITÉS DE DÉCISION (dans l'ordre, de la plus importante à la moins importante) :
//   0. Entrée en jeu (dé = 5, peu de pions en jeu)
//   1. Capturer un pion adverse
//   2. Fuir (mettre à l'abri un pion menacé)
//   3. Atterrir sur une case protégée
//   4. Avancer le pion le plus avancé
//   5. Former un barrage défensif
// ============================================================
export function chooseAIPawn(player, movablePawnIds, diceValue, allPlayers) {
  // Sécurité : si aucun pion déplaçable → rien à faire
  if (movablePawnIds.length === 0) return null;

  // Optimisation : si un seul pion est déplaçable → pas de choix à faire
  if (movablePawnIds.length === 1) return movablePawnIds[0];

  const inPlay = pawnsOnBoard(player);   // pions actifs sur le plateau
  const inHome = pawnsWithStatus(player, 'home'); // pions en zone de départ

  // Nombre de cases à avancer selon le dé
  // (dé = 6 → avancer de 12 cases selon la règle)
  const steps = diceValue === 6 ? 12 : diceValue;

  // ── PRIORITÉ 0 : Entrée en jeu (uniquement pour dé = 5) ──────────────
  //
  // Si l'IA a peu de pions en jeu (moins que MIN_PAWNS_TO_SKIP_ENTRY = 2),
  // elle préfère rentrer un nouveau pion plutôt qu'avancer un pion existant.
  // Objectif : développer ses pions rapidement en début de partie.
  if (diceValue === 5 && inPlay.length < MIN_PAWNS_TO_SKIP_ENTRY && inHome.length > 0) {
    const homeId = inHome.find(p => movablePawnIds.includes(p.id));
    if (homeId) return homeId.id;
  }

  // Pions déplaçables qui sont déjà sur le plateau (hors zone de départ)
  const playable = player.pawns.filter(p => movablePawnIds.includes(p.id));
  const boardPlayable = playable.filter(p => p.status !== 'home');

  // ── PRIORITÉ 1 : Capturer un pion adverse ────────────────────────────
  //
  // L'IA cherche à capturer un pion adverse si possible.
  // Condition : la case d'arrivée doit contenir exactement 1 pion adverse
  //             sur une case NON protégée (sinon getCapturedPawn retourne null).
  for (const pawn of boardPlayable) {
    const newPos = computeNewPosition(pawn, steps, player.color, allPlayers);
    if (!newPos || newPos.status === 'finished') continue; // pas de capture sur "centre"
    if (getCapturedPawn(newPos.cellId, player.color, allPlayers)) return pawn.id;
  }

  // ── PRIORITÉ 2 : Fuir (mettre à l'abri un pion menacé) ───────────────
  //
  // Si un pion de l'IA est menacé (un adversaire peut le capturer au prochain tour),
  // l'IA le déplace en priorité pour le mettre à l'abri.
  // On choisit le pion menacé le plus avancé (pour ne pas perdre de progression).
  const threatened = boardPlayable.filter(p => isThreatened(p, player.color, allPlayers));
  if (threatened.length > 0) return getMostAdvancedId(threatened, player.color);

  // ── PRIORITÉ 3 : Atterrir sur une case protégée ───────────────────────
  //
  // Une case protégée met le pion à l'abri des captures adverses.
  // L'IA préfère y aller si c'est possible.
  for (const pawn of boardPlayable) {
    const newPos = computeNewPosition(pawn, steps, player.color, allPlayers);
    if (newPos && isProtected(newPos.cellId)) return pawn.id;
  }

  // ── PRIORITÉ 4 : Avancer le pion le plus avancé ───────────────────────
  //
  // Stratégie offensive : pousser les pions les plus proches du centre.
  // Mesurée par l'index dans le circuit (getPawnProgress).
  if (boardPlayable.length > 0) return getMostAdvancedId(boardPlayable, player.color);

  // ── PRIORITÉ 5 : Former un barrage défensif ───────────────────────────
  //
  // Si un pion allié est menacé à proximité, l'IA peut former un barrage
  // en rejoignant ce pion allié sur sa case (2 pions = barrage infranchissable).
  // Cette priorité est basse car elle sacrifie l'avancement au profit de la défense.
  for (const pawn of boardPlayable) {
    const newPos = computeNewPosition(pawn, steps, player.color, allPlayers);
    if (!newPos) continue;
    // Chercher un pion allié sur la case cible qui est menacé
    const allyOnTarget = player.pawns.find(
      p => p.id !== pawn.id && p.cellId === newPos.cellId && p.status === 'board'
    );
    if (allyOnTarget && isThreatened(allyOnTarget, player.color, allPlayers)) {
      return pawn.id;
    }
  }

  // ── FALLBACK : aucune priorité ne s'applique ──────────────────────────
  // Retourner simplement le premier pion déplaçable disponible
  return movablePawnIds[0];
}


// ============================================================
// FONCTIONS UTILITAIRES INTERNES
// ============================================================

// Retourne l'id du pion le plus avancé parmi une liste de pions.
// "Le plus avancé" = l'index le plus élevé dans le circuit de la couleur.
// En cas d'égalité, le premier dans la liste est retourné.
function getMostAdvancedId(pawns, color) {
  if (pawns.length === 0) return null;
  return pawns.reduce((best, p) =>
    getPawnProgress(p, color) >= getPawnProgress(best, color) ? p : best
  ).id;
}
