// ============================================================
// FICHIER : useAI.js
// RÔLE    : Hook React qui pilote automatiquement les joueurs IA.
//           Surveille l'état du jeu et déclenche les actions IA
//           avec des délais pour rendre le jeu lisible.
//
// FONCTIONNEMENT :
//   Quand c'est le tour d'une IA (phase = 'ai_thinking'), ce hook
//   effectue automatiquement deux étapes avec un délai entre chaque :
//     Étape 1 : Lancer le dé (après AI_DELAY_MS ms)
//     Étape 2 : Choisir et déplacer un pion (après AI_DELAY_MS ms)
//
//   Le double délai permet à l'utilisateur de voir la face du dé
//   avant que l'IA déplace son pion.
// ============================================================

import { useEffect } from 'react';
import { AI_DELAY_MS } from '../logic/constants.js';
import { chooseAIPawn } from '../logic/aiStrategy.js';


export function useAI(state, dispatch) {
  useEffect(() => {
    // Ce hook ne s'active que quand c'est le tour d'une IA
    if (state.phase !== 'ai_thinking') return;
    if (!state.players.length) return;

    const currentPlayer = state.players[state.turnOrder[state.currentPlayerIndex]];
    if (!currentPlayer?.isAI) return; // sécurité : vérifier que c'est bien une IA

    // ── ÉTAPE 1 : L'IA n'a pas encore lancé le dé ─────────────────────
    // diceValue est null → on attend AI_DELAY_MS puis on lance le dé.
    // L'interface affichera "IA réfléchit…" pendant ce délai.
    if (state.diceValue === null) {
      const timer = setTimeout(() => {
        dispatch({ type: 'ROLL_DICE' });
      }, AI_DELAY_MS);
      // Nettoyage : annuler le timer si le composant se démonte ou si l'état change
      return () => clearTimeout(timer);
    }

    // ── ÉTAPE 2 : Le dé est lancé, attendre avant de déplacer ─────────
    // On attend un second délai AI_DELAY_MS pour que la face du dé soit
    // visible à l'écran avant que l'IA déplace son pion.
    const timer = setTimeout(() => {

      if (state.movablePawns.length > 0) {
        // Des pions sont déplaçables → l'IA choisit selon sa stratégie
        const chosen = chooseAIPawn(
          currentPlayer,
          state.movablePawns,
          state.diceValue,
          state.players,
        );

        if (chosen !== null) {
          // L'IA a choisi un pion → le déplacer
          dispatch({ type: 'MOVE_PAWN', payload: { pawnId: chosen } });
        } else {
          // chooseAIPawn n'a rien trouvé (ne devrait pas arriver) → passer
          dispatch({ type: 'NEXT_PLAYER' });
        }

      } else {
        // Aucun pion déplaçable après le lancer
        // Analyser pourquoi pour décider quoi faire

        const hasActivePawns = currentPlayer.pawns.some(
          p => p.status === 'board' || p.status === 'corridor'
        );
        const hasHomePawns = currentPlayer.pawns.some(p => p.status === 'home');

        if (state.diceValue === 6 && (hasActivePawns || hasHomePawns)) {
          // RÈGLE : résultat = 6 sans pion déplaçable MAIS des pions existent
          // → relancer le dé (le reducer gère la protection anti-boucle)
          dispatch({ type: 'ROLL_DICE' });
        } else {
          // Résultat normal sans mouvement, ou tous les pions sont 'finished'
          // → passer au joueur suivant
          dispatch({ type: 'NEXT_PLAYER' });
        }
      }
    }, AI_DELAY_MS);

    // Nettoyage : annuler le timer si l'état change pendant le délai
    return () => clearTimeout(timer);

  // Dépendances : l'effet se redéclenche si l'une de ces valeurs change
  }, [state.phase, state.currentPlayerIndex, state.diceValue, state.movablePawns.length]);
}
