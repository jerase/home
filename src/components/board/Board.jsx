import Pawn from './Pawn.jsx';
import { CELL_COORDINATES, HOME_POSITIONS, PLAYER_COLORS } from '../../logic/constants.js';

// Calcule les offsets pour éviter la superposition de pions sur la même case
function getPawnOffset(index, total) {
  if (total === 1) return { offsetX: 0, offsetY: 0 };
  const offsets = [
    { offsetX: -4, offsetY: -4 },
    { offsetX:  4, offsetY:  4 },
    { offsetX:  4, offsetY: -4 },
    { offsetX: -4, offsetY:  4 },
  ];
  return offsets[index] || { offsetX: 0, offsetY: 0 };
}

// Rotation fixe selon la couleur du joueur humain
// pour que sa zone de départ soit toujours en bas
const BOARD_ROTATION = {
  bleu:   0,    // zone bas    → déjà en bas, pas de rotation
  jaune:  180,  // zone haut   → demi-tour
  vert:   270,  // zone gauche → rotation 270° (quart de tour gauche)
  rouge:  90,   // zone droite → rotation 90°  (quart de tour droit)
};

export default function Board({ players, movablePawns, onPawnClick, humanColor, size = 370 }) {
  const rotation = humanColor ? (BOARD_ROTATION[humanColor] ?? 0) : 0;
  const rotateTransform = rotation !== 0 ? `rotate(${rotation}, 185, 185)` : undefined;
  // Regrouper tous les pions par case pour gérer les offsets
  const pawnsByCell = {};
  for (const player of players) {
    for (const pawn of player.pawns) {
      if (pawn.status === 'board' || pawn.status === 'corridor') {
        const key = pawn.cellId;
        if (!pawnsByCell[key]) pawnsByCell[key] = [];
        pawnsByCell[key].push({ ...pawn, color: player.color });
      }
    }
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 370 370"
      role="img"
      aria-label="Plateau de jeu Home"
      style={{ width: size, height: size, display: 'block' }}>

      <title>Plateau de jeu Home</title>

      <g transform={rotateTransform}>

      {/* ── Fond rouge ── */}
      <rect x="0" y="0" width="370" height="370" fill="#c0392b" />

      {/* ── Zones de départ ── */}
      <rect x="5"   y="5"   width="120" height="120" fill="white" />
      <rect x="245" y="5"   width="120" height="120" fill="white" />
      <rect x="5"   y="245" width="120" height="120" fill="white" />
      <rect x="245" y="245" width="120" height="120" fill="white" />

      {/* Cercles décoratifs dans les zones de départ */}
      <circle cx="65"  cy="65"  r="45" fill={PLAYER_COLORS.jaune}  opacity="0.15" />
      <circle cx="305" cy="65"  r="45" fill={PLAYER_COLORS.rouge}  opacity="0.15" />
      <circle cx="65"  cy="305" r="45" fill={PLAYER_COLORS.vert}   opacity="0.15" />
      <circle cx="305" cy="305" r="45" fill={PLAYER_COLORS.bleu}   opacity="0.15" />

      {/* ── Zone d'arrivée centre ── */}
      <rect x="125" y="125" width="120" height="120" fill="#87CEEB" />
      {/* Triangles colorés vers le centre */}
      <polygon points="125,125 185,185 245,125" fill={PLAYER_COLORS.jaune} opacity="0.7" />
      <polygon points="125,245 185,185 245,245" fill={PLAYER_COLORS.bleu}  opacity="0.7" />
      <polygon points="125,125 185,185 125,245" fill={PLAYER_COLORS.vert}  opacity="0.7" />
      <polygon points="245,125 185,185 245,245" fill={PLAYER_COLORS.rouge} opacity="0.7" />
      <circle cx="185" cy="185" r="18" fill="white" opacity="0.9" />

      {/* ══════════════════════════════════════════════════════
           CHEMIN HAUT MILIEU
      ══════════════════════════════════════════════════════ */}
      {/* gauche */}
      <rect x="125" y="5"   width="40" height="15" fill="#a8bfa8"/>
      <rect x="125" y="20"  width="40" height="15" fill="#a8bfa8"/>
      <rect x="125" y="35"  width="40" height="15" fill="#a8bfa8"/>
      <rect x="125" y="50"  width="40" height="15" fill="#a8bfa8"/>
      <rect x="125" y="65"  width="40" height="15" fill={PLAYER_COLORS.jaune} opacity="0.6"/>
      <rect x="125" y="80"  width="40" height="15" fill="#a8bfa8"/>
      <rect x="125" y="95"  width="40" height="15" fill="#a8bfa8"/>
      <rect x="125" y="110" width="40" height="15" fill="#a8bfa8"/>
      {/* milieu (couloir jaune) */}
      <rect x="165" y="5"   width="40" height="15" fill={PLAYER_COLORS.jaune} opacity="0.6"/>
      <rect x="165" y="20"  width="40" height="15" fill={PLAYER_COLORS.jaune} opacity="0.35"/>
      <rect x="165" y="35"  width="40" height="15" fill={PLAYER_COLORS.jaune} opacity="0.35"/>
      <rect x="165" y="50"  width="40" height="15" fill={PLAYER_COLORS.jaune} opacity="0.35"/>
      <rect x="165" y="65"  width="40" height="15" fill={PLAYER_COLORS.jaune} opacity="0.35"/>
      <rect x="165" y="80"  width="40" height="15" fill={PLAYER_COLORS.jaune} opacity="0.35"/>
      <rect x="165" y="95"  width="40" height="15" fill={PLAYER_COLORS.jaune} opacity="0.35"/>
      <rect x="165" y="110" width="40" height="15" fill={PLAYER_COLORS.jaune} opacity="0.35"/>
      {/* droite */}
      <rect x="205" y="5"   width="40" height="15" fill="#a8bfa8"/>
      <rect x="205" y="20"  width="40" height="15" fill="#a8bfa8"/>
      <rect x="205" y="35"  width="40" height="15" fill="#a8bfa8"/>
      <rect x="205" y="50"  width="40" height="15" fill="#a8bfa8"/>
      <rect x="205" y="65"  width="40" height="15" fill={PLAYER_COLORS.jaune} opacity="0.6"/>
      <rect x="205" y="80"  width="40" height="15" fill="#a8bfa8"/>
      <rect x="205" y="95"  width="40" height="15" fill="#a8bfa8"/>
      <rect x="205" y="110" width="40" height="15" fill="#a8bfa8"/>
      {/* Boules protégées haut */}
      <circle cx="145" cy="72" r="6" fill="white" opacity="0.9"/>
      <circle cx="185" cy="12" r="6" fill="white" opacity="0.9"/>
      <circle cx="225" cy="72" r="6" fill="white" opacity="0.9"/>
      {/* Lignes haut milieu */}
      <line x1="125" y1="5"   x2="125" y2="125" stroke="black" strokeWidth="1"/>
      <line x1="165" y1="5"   x2="165" y2="125" stroke="black" strokeWidth="1"/>
      <line x1="205" y1="5"   x2="205" y2="125" stroke="black" strokeWidth="1"/>
      <line x1="245" y1="5"   x2="245" y2="125" stroke="black" strokeWidth="1"/>
      {[5,20,35,50,65,80,95,110,125].map(y => (
        <line key={y} x1="125" y1={y} x2="245" y2={y} stroke="black" strokeWidth="1"/>
      ))}

      {/* ══════════════════════════════════════════════════════
           CHEMIN BAS MILIEU
      ══════════════════════════════════════════════════════ */}
      {/* gauche */}
      <rect x="125" y="245" width="40" height="15" fill="#a8bfa8"/>
      <rect x="125" y="260" width="40" height="15" fill="#a8bfa8"/>
      <rect x="125" y="275" width="40" height="15" fill="#a8bfa8"/>
      <rect x="125" y="290" width="40" height="15" fill={PLAYER_COLORS.bleu} opacity="0.6"/>
      <rect x="125" y="305" width="40" height="15" fill="#a8bfa8"/>
      <rect x="125" y="320" width="40" height="15" fill="#a8bfa8"/>
      <rect x="125" y="335" width="40" height="15" fill="#a8bfa8"/>
      <rect x="125" y="350" width="40" height="15" fill="#a8bfa8"/>
      {/* milieu (couloir bleu) */}
      <rect x="165" y="245" width="40" height="15" fill={PLAYER_COLORS.bleu} opacity="0.35"/>
      <rect x="165" y="260" width="40" height="15" fill={PLAYER_COLORS.bleu} opacity="0.35"/>
      <rect x="165" y="275" width="40" height="15" fill={PLAYER_COLORS.bleu} opacity="0.35"/>
      <rect x="165" y="290" width="40" height="15" fill={PLAYER_COLORS.bleu} opacity="0.35"/>
      <rect x="165" y="305" width="40" height="15" fill={PLAYER_COLORS.bleu} opacity="0.35"/>
      <rect x="165" y="320" width="40" height="15" fill={PLAYER_COLORS.bleu} opacity="0.35"/>
      <rect x="165" y="335" width="40" height="15" fill={PLAYER_COLORS.bleu} opacity="0.35"/>
      <rect x="165" y="350" width="40" height="15" fill={PLAYER_COLORS.bleu} opacity="0.6"/>
      {/* droite */}
      <rect x="205" y="245" width="40" height="15" fill="#a8bfa8"/>
      <rect x="205" y="260" width="40" height="15" fill="#a8bfa8"/>
      <rect x="205" y="275" width="40" height="15" fill="#a8bfa8"/>
      <rect x="205" y="290" width="40" height="15" fill={PLAYER_COLORS.bleu} opacity="0.6"/>
      <rect x="205" y="305" width="40" height="15" fill="#a8bfa8"/>
      <rect x="205" y="320" width="40" height="15" fill="#a8bfa8"/>
      <rect x="205" y="335" width="40" height="15" fill="#a8bfa8"/>
      <rect x="205" y="350" width="40" height="15" fill="#a8bfa8"/>
      {/* Boules protégées bas */}
      <circle cx="145" cy="297" r="6" fill="white" opacity="0.9"/>
      <circle cx="185" cy="357" r="6" fill="white" opacity="0.9"/>
      <circle cx="225" cy="297" r="6" fill="white" opacity="0.9"/>
      {/* Lignes bas milieu */}
      <line x1="125" y1="245" x2="125" y2="365" stroke="black" strokeWidth="1"/>
      <line x1="165" y1="245" x2="165" y2="365" stroke="black" strokeWidth="1"/>
      <line x1="205" y1="245" x2="205" y2="365" stroke="black" strokeWidth="1"/>
      <line x1="245" y1="245" x2="245" y2="365" stroke="black" strokeWidth="1"/>
      {[245,260,275,290,305,320,335,350,365].map(y => (
        <line key={y} x1="125" y1={y} x2="245" y2={y} stroke="black" strokeWidth="1"/>
      ))}

      {/* ══════════════════════════════════════════════════════
           CHEMIN GAUCHE MILIEU
      ══════════════════════════════════════════════════════ */}
      {/* haut */}
      <rect x="5"   y="125" width="15" height="40" fill="#a8bfa8"/>
      <rect x="20"  y="125" width="15" height="40" fill="#a8bfa8"/>
      <rect x="35"  y="125" width="15" height="40" fill="#a8bfa8"/>
      <rect x="50"  y="125" width="15" height="40" fill="#a8bfa8"/>
      <rect x="65"  y="125" width="15" height="40" fill={PLAYER_COLORS.vert} opacity="0.6"/>
      <rect x="80"  y="125" width="15" height="40" fill="#a8bfa8"/>
      <rect x="95"  y="125" width="15" height="40" fill="#a8bfa8"/>
      <rect x="110" y="125" width="15" height="40" fill="#a8bfa8"/>
      {/* milieu (couloir vert) */}
      <rect x="5"   y="165" width="15" height="40" fill={PLAYER_COLORS.vert} opacity="0.6"/>
      <rect x="20"  y="165" width="15" height="40" fill={PLAYER_COLORS.vert} opacity="0.35"/>
      <rect x="35"  y="165" width="15" height="40" fill={PLAYER_COLORS.vert} opacity="0.35"/>
      <rect x="50"  y="165" width="15" height="40" fill={PLAYER_COLORS.vert} opacity="0.35"/>
      <rect x="65"  y="165" width="15" height="40" fill={PLAYER_COLORS.vert} opacity="0.35"/>
      <rect x="80"  y="165" width="15" height="40" fill={PLAYER_COLORS.vert} opacity="0.35"/>
      <rect x="95"  y="165" width="15" height="40" fill={PLAYER_COLORS.vert} opacity="0.35"/>
      <rect x="110" y="165" width="15" height="40" fill={PLAYER_COLORS.vert} opacity="0.35"/>
      {/* bas */}
      <rect x="5"   y="205" width="15" height="40" fill="#a8bfa8"/>
      <rect x="20"  y="205" width="15" height="40" fill="#a8bfa8"/>
      <rect x="35"  y="205" width="15" height="40" fill="#a8bfa8"/>
      <rect x="50"  y="205" width="15" height="40" fill="#a8bfa8"/>
      <rect x="65"  y="205" width="15" height="40" fill={PLAYER_COLORS.vert} opacity="0.6"/>
      <rect x="80"  y="205" width="15" height="40" fill="#a8bfa8"/>
      <rect x="95"  y="205" width="15" height="40" fill="#a8bfa8"/>
      <rect x="110" y="205" width="15" height="40" fill="#a8bfa8"/>
      {/* Boules protégées gauche */}
      <circle cx="72"  cy="145" r="6" fill="white" opacity="0.9"/>
      <circle cx="12"  cy="185" r="6" fill="white" opacity="0.9"/>
      <circle cx="72"  cy="225" r="6" fill="white" opacity="0.9"/>
      {/* Lignes gauche milieu */}
      <line x1="5"   y1="125" x2="125" y2="125" stroke="black" strokeWidth="1"/>
      <line x1="5"   y1="165" x2="125" y2="165" stroke="black" strokeWidth="1"/>
      <line x1="5"   y1="205" x2="125" y2="205" stroke="black" strokeWidth="1"/>
      <line x1="5"   y1="245" x2="125" y2="245" stroke="black" strokeWidth="1"/>
      {[5,20,35,50,65,80,95,110,125].map(x => (
        <line key={x} x1={x} y1="125" x2={x} y2="245" stroke="black" strokeWidth="1"/>
      ))}

      {/* ══════════════════════════════════════════════════════
           CHEMIN DROITE MILIEU
      ══════════════════════════════════════════════════════ */}
      {/* haut */}
      <rect x="245" y="125" width="15" height="40" fill="#a8bfa8"/>
      <rect x="260" y="125" width="15" height="40" fill="#a8bfa8"/>
      <rect x="275" y="125" width="15" height="40" fill="#a8bfa8"/>
      <rect x="290" y="125" width="15" height="40" fill={PLAYER_COLORS.rouge} opacity="0.6"/>
      <rect x="305" y="125" width="15" height="40" fill="#a8bfa8"/>
      <rect x="320" y="125" width="15" height="40" fill="#a8bfa8"/>
      <rect x="335" y="125" width="15" height="40" fill="#a8bfa8"/>
      <rect x="350" y="125" width="15" height="40" fill="#a8bfa8"/>
      {/* milieu (couloir rouge) */}
      <rect x="245" y="165" width="15" height="40" fill={PLAYER_COLORS.rouge} opacity="0.35"/>
      <rect x="260" y="165" width="15" height="40" fill={PLAYER_COLORS.rouge} opacity="0.35"/>
      <rect x="275" y="165" width="15" height="40" fill={PLAYER_COLORS.rouge} opacity="0.35"/>
      <rect x="290" y="165" width="15" height="40" fill={PLAYER_COLORS.rouge} opacity="0.35"/>
      <rect x="305" y="165" width="15" height="40" fill={PLAYER_COLORS.rouge} opacity="0.35"/>
      <rect x="320" y="165" width="15" height="40" fill={PLAYER_COLORS.rouge} opacity="0.35"/>
      <rect x="335" y="165" width="15" height="40" fill={PLAYER_COLORS.rouge} opacity="0.35"/>
      <rect x="350" y="165" width="15" height="40" fill={PLAYER_COLORS.rouge} opacity="0.6"/>
      {/* bas */}
      <rect x="245" y="205" width="15" height="40" fill="#a8bfa8"/>
      <rect x="260" y="205" width="15" height="40" fill="#a8bfa8"/>
      <rect x="275" y="205" width="15" height="40" fill="#a8bfa8"/>
      <rect x="290" y="205" width="15" height="40" fill={PLAYER_COLORS.rouge} opacity="0.6"/>
      <rect x="305" y="205" width="15" height="40" fill="#a8bfa8"/>
      <rect x="320" y="205" width="15" height="40" fill="#a8bfa8"/>
      <rect x="335" y="205" width="15" height="40" fill="#a8bfa8"/>
      <rect x="350" y="205" width="15" height="40" fill="#a8bfa8"/>
      {/* Boules protégées droite */}
      <circle cx="297" cy="145" r="6" fill="white" opacity="0.9"/>
      <circle cx="357" cy="185" r="6" fill="white" opacity="0.9"/>
      <circle cx="297" cy="225" r="6" fill="white" opacity="0.9"/>
      {/* Lignes droite milieu */}
      <line x1="245" y1="125" x2="365" y2="125" stroke="black" strokeWidth="1"/>
      <line x1="245" y1="165" x2="365" y2="165" stroke="black" strokeWidth="1"/>
      <line x1="245" y1="205" x2="365" y2="205" stroke="black" strokeWidth="1"/>
      <line x1="245" y1="245" x2="365" y2="245" stroke="black" strokeWidth="1"/>
      {[245,260,275,290,305,320,335,350,365].map(x => (
        <line key={x} x1={x} y1="125" x2={x} y2="245" stroke="black" strokeWidth="1"/>
      ))}

      {/* ── Pions dans les zones de départ ── */}
      {players.map(player =>
        player.pawns
          .filter(p => p.status === 'home')
          .map((pawn, i) => {
            const pos = HOME_POSITIONS[player.color][pawn.id];
            const isMovable = movablePawns.includes(pawn.id) &&
              players.find(pl => pl.color === player.color)?.pawns.find(p2 => p2.id === pawn.id)?.status === 'home';
            return (
              <Pawn
                key={`${player.color}-${pawn.id}`}
                color={player.color}
                cx={pos.cx}
                cy={pos.cy}
                isMovable={isMovable && players.find(pl => pl.color === player.color)?.id === players.find(pl => movablePawns.includes(pawn.id) && pl.pawns.some(p2 => p2.id === pawn.id))?.id}
                onClick={() => onPawnClick(player.color, pawn.id)}
              />
            );
          })
      )}

      {/* ── Pions finis dans la zone centrale ── */}
      {(() => {
        // Positions des pions finis par couleur dans les 4 quadrants du centre
        // Centre = rect x=125 y=125 w=120 h=120
        const FINISHED_POSITIONS = {
          jaune: [{ cx:147,cy:147 },{ cx:163,cy:147 },{ cx:147,cy:163 },{ cx:163,cy:163 }],
          rouge: [{ cx:207,cy:147 },{ cx:223,cy:147 },{ cx:207,cy:163 },{ cx:223,cy:163 }],
          vert:  [{ cx:147,cy:207 },{ cx:163,cy:207 },{ cx:147,cy:223 },{ cx:163,cy:223 }],
          bleu:  [{ cx:207,cy:207 },{ cx:223,cy:207 },{ cx:207,cy:223 },{ cx:223,cy:223 }],
        };
        return players.map(player =>
          player.pawns
            .filter(p => p.status === 'finished')
            .map((pawn, i) => {
              const pos = FINISHED_POSITIONS[player.color][pawn.id] ?? FINISHED_POSITIONS[player.color][i];
              if (!pos) return null;
              return (
                <Pawn
                  key={`finished-${player.color}-${pawn.id}`}
                  color={player.color}
                  cx={pos.cx}
                  cy={pos.cy}
                  isMovable={false}
                  onClick={() => {}}
                />
              );
            })
        );
      })()}

      {/* ── Pions sur le plateau et dans les couloirs ── */}
      {Object.entries(pawnsByCell).map(([cellId, cellPawns]) => {
        const coords = CELL_COORDINATES[cellId];
        if (!coords) return null;
        return cellPawns.map((pawn, idx) => {
          const offset = getPawnOffset(idx, cellPawns.length);
          const isMovable = movablePawns.includes(pawn.id);
          return (
            <Pawn
              key={`${pawn.color}-${pawn.id}`}
              color={pawn.color}
              cx={coords.cx}
              cy={coords.cy}
              offsetX={offset.offsetX}
              offsetY={offset.offsetY}
              isMovable={isMovable}
              onClick={() => onPawnClick(pawn.color, pawn.id)}
            />
          );
        });
      })}
      </g>
    </svg>
  );
}
