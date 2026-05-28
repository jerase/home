import { useState } from 'react';
import { PLAYER_COLORS, PLAYER_LABELS } from '../../logic/constants.js';

// Paires opposées sur le plateau (face à face)
const OPPOSITE = {
  jaune: 'bleu',
  bleu:  'jaune',
  vert:  'rouge',
  rouge: 'vert',
};

// Couleurs disponibles pour le joueur humain en mode 2 joueurs
const HUMAN_COLORS_2P = ['jaune', 'vert', 'bleu', 'rouge'];

// Config par défaut pour 3 et 4 joueurs
const DEFAULT_CONFIG_3P = [
  { color: 'jaune', isAI: false },
  { color: 'vert',  isAI: true  },
  { color: 'bleu',  isAI: true  },
];
const DEFAULT_CONFIG_4P = [
  { color: 'jaune', isAI: false },
  { color: 'vert',  isAI: true  },
  { color: 'bleu',  isAI: true  },
  { color: 'rouge', isAI: true  },
];

export default function SetupScreen({ dispatch }) {
  const [numPlayers, setNumPlayers] = useState(2);

  // Mode 2 joueurs : choix de la couleur humaine uniquement
  const [humanColor2P, setHumanColor2P] = useState('jaune');

  // Mode 3-4 joueurs : config complète
  const [config3P, setConfig3P] = useState(DEFAULT_CONFIG_3P);
  const [config4P, setConfig4P] = useState(DEFAULT_CONFIG_4P);

  // Config active selon le nombre de joueurs
  function getActiveConfig() {
    if (numPlayers === 2) {
      return [
        { color: humanColor2P,           isAI: false },
        { color: OPPOSITE[humanColor2P], isAI: true  },
      ];
    }
    return numPlayers === 3 ? config3P : config4P;
  }

  function toggleAI(i) {
    if (numPlayers === 3) {
      setConfig3P(prev => prev.map((c, idx) => idx === i ? { ...c, isAI: !c.isAI } : c));
    } else {
      setConfig4P(prev => prev.map((c, idx) => idx === i ? { ...c, isAI: !c.isAI } : c));
    }
  }

  const activeConfig = getActiveConfig();
  const hasHuman = activeConfig.some(c => !c.isAI);

  function start() {
    if (!hasHuman) return;
    dispatch({ type: 'SETUP_COMPLETE', payload: { config: activeConfig } });
  }

  return (
    <div style={{
      width: '100vw', height: '100dvh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '20px 16px', boxSizing: 'border-box',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      overflowY: 'auto',
    }}>

      {/* Titre */}
      <div className="text-center mb-6 slide-up">
        <h1 className="font-bold text-white"
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(1.6rem, 5vw, 2.8rem)',
              textShadow: '0 0 24px rgba(255,200,0,0.45)',
              letterSpacing: '0.2em',
            }}>
          Jeu Home
        </h1>
        <p className="text-yellow-300/80 tracking-[0.3em] uppercase mt-1"
           style={{ fontSize: 'clamp(0.65rem, 2vw, 0.85rem)' }}>
          La version haïtienne du jeu
        </p>
      </div>

      <div className="w-full slide-up" style={{ maxWidth: 420 }}>

        {/* ── Nombre de joueurs ── */}
        <div className="rounded-2xl p-5 mb-4"
             style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <p className="text-white/50 text-xs uppercase tracking-widest mb-3">Nombre de joueurs</p>
          <div className="flex gap-2">
            {[2, 3, 4].map(n => (
              <button key={n} onClick={() => setNumPlayers(n)}
                className="flex-1 py-3 rounded-xl font-bold text-xl transition-all duration-200 focus:outline-none"
                style={{
                  background: numPlayers === n ? 'linear-gradient(135deg,#FFD700,#FFA500)' : 'rgba(255,255,255,0.08)',
                  color:      numPlayers === n ? '#1a1a2e' : 'rgba(255,255,255,0.7)',
                  transform:  numPlayers === n ? 'scale(1.06)' : 'scale(1)',
                  boxShadow:  numPlayers === n ? '0 0 20px rgba(255,200,0,0.3)' : 'none',
                }}>
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* ── Config 2 joueurs : choix de couleur + face-à-face ── */}
        {numPlayers === 2 && (
          <div className="rounded-2xl p-5 mb-5"
               style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <p className="text-white/50 text-xs uppercase tracking-widest mb-3">Votre couleur</p>

            {/* Sélecteur de couleur humaine */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {HUMAN_COLORS_2P.map(color => {
                const c = PLAYER_COLORS[color];
                const selected = humanColor2P === color;
                return (
                  <button key={color} onClick={() => setHumanColor2P(color)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all focus:outline-none"
                    style={{
                      background: selected ? `${c}33` : 'rgba(255,255,255,0.05)',
                      border:     selected ? `2px solid ${c}` : '2px solid rgba(255,255,255,0.1)',
                      transform:  selected ? 'scale(1.04)' : 'scale(1)',
                    }}>
                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: c }} />
                    <span className="text-white text-sm font-medium">{PLAYER_LABELS[color]}</span>
                    {selected && <span className="ml-auto text-xs">👤</span>}
                  </button>
                );
              })}
            </div>

            {/* Aperçu face-à-face */}
            <div className="rounded-xl p-3"
                 style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-white/40 text-xs text-center mb-2 uppercase tracking-wider">Disposition</p>
              <div className="flex flex-col items-center gap-1">
                {/* Adversaire en haut */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                     style={{ background: `${PLAYER_COLORS[OPPOSITE[humanColor2P]]}22` }}>
                  <div className="w-3 h-3 rounded-full"
                       style={{ background: PLAYER_COLORS[OPPOSITE[humanColor2P]] }} />
                  <span className="text-white/70 text-xs">
                    {PLAYER_LABELS[OPPOSITE[humanColor2P]]} 🤖 — en haut
                  </span>
                </div>
                {/* Flèche */}
                <span className="text-white/25 text-lg">↕</span>
                {/* Moi en bas */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                     style={{ background: `${PLAYER_COLORS[humanColor2P]}22` }}>
                  <div className="w-3 h-3 rounded-full"
                       style={{ background: PLAYER_COLORS[humanColor2P] }} />
                  <span className="text-white/70 text-xs">
                    {PLAYER_LABELS[humanColor2P]} 👤 — vous, en bas
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Config 3-4 joueurs : liste classique ── */}
        {numPlayers >= 3 && (
          <div className="rounded-2xl p-5 mb-5"
               style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <p className="text-white/50 text-xs uppercase tracking-widest mb-3">Joueurs</p>
            <div className="flex flex-col gap-2">
              {activeConfig.map((cfg, i) => {
                const color = PLAYER_COLORS[cfg.color];
                return (
                  <div key={i}
                    className="flex items-center justify-between rounded-xl px-4 py-3 transition-all"
                    style={{ background: `${color}18`, border: `1px solid ${color}33` }}>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 flex-shrink-0"
                           style={{ background: color }} />
                      <span className="text-white font-medium text-sm">{PLAYER_LABELS[cfg.color]}</span>
                    </div>
                    <button onClick={() => toggleAI(i)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus:outline-none"
                      style={{
                        background: cfg.isAI ? 'rgba(99,102,241,0.3)' : 'rgba(16,185,129,0.3)',
                        color:      'white',
                        border:     cfg.isAI ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(16,185,129,0.5)',
                        minWidth:   80,
                      }}>
                      {cfg.isAI ? '🤖 IA' : '👤 Humain'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Erreur */}
        {!hasHuman && (
          <p className="text-red-400 text-xs text-center mb-3 fade-in">
            Au moins un joueur doit être humain.
          </p>
        )}

        {/* Bouton lancer */}
        <button onClick={start} disabled={!hasHuman}
          className="w-full py-4 rounded-2xl font-bold tracking-wider transition-all duration-200 focus:outline-none"
          style={{
            fontSize:   'clamp(1rem, 3vw, 1.2rem)',
            background: hasHuman ? 'linear-gradient(135deg, #FFD700, #FFA500)' : 'rgba(255,255,255,0.1)',
            color:      hasHuman ? '#1a1a2e' : 'rgba(255,255,255,0.3)',
            boxShadow:  hasHuman ? '0 0 32px rgba(255,200,0,0.35)' : 'none',
            cursor:     hasHuman ? 'pointer' : 'not-allowed',
          }}>
          Lancer la partie ▶
        </button>

        {/* Crédit auteur */}
        <p className="text-center mt-5 font-bold"
           style={{ color: '#FFD700', fontSize: 'clamp(0.85rem, 2.5vw, 1rem)', textShadow: '0 0 10px rgba(255,200,0,0.4)' }}>
          Implémenté par Jacques ERASE
        </p>
      </div>
    </div>
  );
}
