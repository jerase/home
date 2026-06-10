import type { Player, Color, CellCoords } from '../../types.js';
import Pawn from './Pawn.jsx';
import { CELL_COORDINATES, HOME_POSITIONS, PLAYER_COLORS } from '../../logic/constants.js';

interface PawnOnBoard { id: number; status: string; cellId: string | null; color: Color; }
interface Offset { offsetX: number; offsetY: number; }

function getPawnOffset(index: number, total: number): Offset {
  if (total === 1) return { offsetX: 0, offsetY: 0 };
  const offsets: Offset[] = [
    { offsetX: -4, offsetY: -4 }, { offsetX:  4, offsetY:  4 },
    { offsetX:  4, offsetY: -4 }, { offsetX: -4, offsetY:  4 },
  ];
  return offsets[index] ?? { offsetX: 0, offsetY: 0 };
}

const BOARD_ROTATION: Record<Color, number> = {
  bleu: 0, jaune: 180, vert: 270, rouge: 90,
};

const FINISHED_POSITIONS: Record<Color, CellCoords[]> = {
  jaune: [{ cx:147,cy:147 },{ cx:163,cy:147 },{ cx:147,cy:163 },{ cx:163,cy:163 }],
  rouge: [{ cx:207,cy:147 },{ cx:223,cy:147 },{ cx:207,cy:163 },{ cx:223,cy:163 }],
  vert:  [{ cx:147,cy:207 },{ cx:163,cy:207 },{ cx:147,cy:223 },{ cx:163,cy:223 }],
  bleu:  [{ cx:207,cy:207 },{ cx:223,cy:207 },{ cx:207,cy:223 },{ cx:223,cy:223 }],
};

interface BoardProps {
  players: Player[];
  movablePawns: number[];
  onPawnClick: (color: Color, pawnId: number) => void;
  humanColor: Color | null;
  currentPlayerColor: Color | undefined;
  size?: number;
}

export default function Board({ players, movablePawns, onPawnClick, humanColor, currentPlayerColor, size = 370 }: BoardProps) {

  function isPawnMovable(pawnId: number, pawnColor: Color): boolean {
    return pawnColor === currentPlayerColor && movablePawns.includes(pawnId);
  }

  const rotation        = humanColor ? (BOARD_ROTATION[humanColor] ?? 0) : 0;
  const rotateTransform = rotation !== 0 ? `rotate(${rotation}, 185, 185)` : undefined;

  const pawnsByCell: Record<string, PawnOnBoard[]> = {};
  for (const player of players) {
    for (const pawn of player.pawns) {
      if ((pawn.status === 'board' || pawn.status === 'corridor') && pawn.cellId) {
        if (!pawnsByCell[pawn.cellId]) pawnsByCell[pawn.cellId] = [];
        pawnsByCell[pawn.cellId].push({ ...pawn, color: player.color });
      }
    }
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 370 370" role="img"
         aria-label="Plateau de jeu Home" style={{ width: size, height: size, display: 'block' }}>
      <title>Plateau de jeu Home</title>
      <g transform={rotateTransform}>

      <rect x="0" y="0" width="370" height="370" fill="#c0392b" />
      <rect x="5"   y="5"   width="120" height="120" fill="white" />
      <rect x="245" y="5"   width="120" height="120" fill="white" />
      <rect x="5"   y="245" width="120" height="120" fill="white" />
      <rect x="245" y="245" width="120" height="120" fill="white" />
      <circle cx="65"  cy="65"  r="45" fill={PLAYER_COLORS.jaune} opacity="0.15" />
      <circle cx="305" cy="65"  r="45" fill={PLAYER_COLORS.rouge} opacity="0.15" />
      <circle cx="65"  cy="305" r="45" fill={PLAYER_COLORS.vert}  opacity="0.15" />
      <circle cx="305" cy="305" r="45" fill={PLAYER_COLORS.bleu}  opacity="0.15" />
      <rect x="125" y="125" width="120" height="120" fill="#87CEEB" />
      <polygon points="125,125 185,185 245,125" fill={PLAYER_COLORS.jaune} opacity="0.7" />
      <polygon points="125,245 185,185 245,245" fill={PLAYER_COLORS.bleu}  opacity="0.7" />
      <polygon points="125,125 185,185 125,245" fill={PLAYER_COLORS.vert}  opacity="0.7" />
      <polygon points="245,125 185,185 245,245" fill={PLAYER_COLORS.rouge} opacity="0.7" />
      <circle cx="185" cy="185" r="18" fill="white" opacity="0.9" />

      {/* Chemin haut */}
      <rect x="125" y="5"   width="40" height="15" fill="#a8bfa8"/><rect x="125" y="20"  width="40" height="15" fill="#a8bfa8"/>
      <rect x="125" y="35"  width="40" height="15" fill="#a8bfa8"/><rect x="125" y="50"  width="40" height="15" fill="#a8bfa8"/>
      <rect x="125" y="65"  width="40" height="15" fill={PLAYER_COLORS.jaune} opacity="0.6"/>
      <rect x="125" y="80"  width="40" height="15" fill="#a8bfa8"/><rect x="125" y="95"  width="40" height="15" fill="#a8bfa8"/>
      <rect x="125" y="110" width="40" height="15" fill="#a8bfa8"/>
      <rect x="165" y="5"   width="40" height="15" fill={PLAYER_COLORS.jaune} opacity="0.6"/>
      <rect x="165" y="20"  width="40" height="15" fill={PLAYER_COLORS.jaune} opacity="0.35"/>
      <rect x="165" y="35"  width="40" height="15" fill={PLAYER_COLORS.jaune} opacity="0.35"/>
      <rect x="165" y="50"  width="40" height="15" fill={PLAYER_COLORS.jaune} opacity="0.35"/>
      <rect x="165" y="65"  width="40" height="15" fill={PLAYER_COLORS.jaune} opacity="0.35"/>
      <rect x="165" y="80"  width="40" height="15" fill={PLAYER_COLORS.jaune} opacity="0.35"/>
      <rect x="165" y="95"  width="40" height="15" fill={PLAYER_COLORS.jaune} opacity="0.35"/>
      <rect x="165" y="110" width="40" height="15" fill={PLAYER_COLORS.jaune} opacity="0.35"/>
      <rect x="205" y="5"   width="40" height="15" fill="#a8bfa8"/><rect x="205" y="20"  width="40" height="15" fill="#a8bfa8"/>
      <rect x="205" y="35"  width="40" height="15" fill="#a8bfa8"/><rect x="205" y="50"  width="40" height="15" fill="#a8bfa8"/>
      <rect x="205" y="65"  width="40" height="15" fill={PLAYER_COLORS.jaune} opacity="0.6"/>
      <rect x="205" y="80"  width="40" height="15" fill="#a8bfa8"/><rect x="205" y="95"  width="40" height="15" fill="#a8bfa8"/>
      <rect x="205" y="110" width="40" height="15" fill="#a8bfa8"/>
      <circle cx="145" cy="72" r="6" fill="white" opacity="0.9"/>
      <circle cx="185" cy="12" r="6" fill="white" opacity="0.9"/>
      <circle cx="225" cy="72" r="6" fill="white" opacity="0.9"/>
      <line x1="125" y1="5" x2="125" y2="125" stroke="black" strokeWidth="1"/>
      <line x1="165" y1="5" x2="165" y2="125" stroke="black" strokeWidth="1"/>
      <line x1="205" y1="5" x2="205" y2="125" stroke="black" strokeWidth="1"/>
      <line x1="245" y1="5" x2="245" y2="125" stroke="black" strokeWidth="1"/>
      {[5,20,35,50,65,80,95,110,125].map(y => <line key={y} x1="125" y1={y} x2="245" y2={y} stroke="black" strokeWidth="1"/>)}

      {/* Chemin bas */}
      <rect x="125" y="245" width="40" height="15" fill="#a8bfa8"/><rect x="125" y="260" width="40" height="15" fill="#a8bfa8"/>
      <rect x="125" y="275" width="40" height="15" fill="#a8bfa8"/>
      <rect x="125" y="290" width="40" height="15" fill={PLAYER_COLORS.bleu} opacity="0.6"/>
      <rect x="125" y="305" width="40" height="15" fill="#a8bfa8"/><rect x="125" y="320" width="40" height="15" fill="#a8bfa8"/>
      <rect x="125" y="335" width="40" height="15" fill="#a8bfa8"/><rect x="125" y="350" width="40" height="15" fill="#a8bfa8"/>
      <rect x="165" y="245" width="40" height="15" fill={PLAYER_COLORS.bleu} opacity="0.35"/>
      <rect x="165" y="260" width="40" height="15" fill={PLAYER_COLORS.bleu} opacity="0.35"/>
      <rect x="165" y="275" width="40" height="15" fill={PLAYER_COLORS.bleu} opacity="0.35"/>
      <rect x="165" y="290" width="40" height="15" fill={PLAYER_COLORS.bleu} opacity="0.35"/>
      <rect x="165" y="305" width="40" height="15" fill={PLAYER_COLORS.bleu} opacity="0.35"/>
      <rect x="165" y="320" width="40" height="15" fill={PLAYER_COLORS.bleu} opacity="0.35"/>
      <rect x="165" y="335" width="40" height="15" fill={PLAYER_COLORS.bleu} opacity="0.35"/>
      <rect x="165" y="350" width="40" height="15" fill={PLAYER_COLORS.bleu} opacity="0.6"/>
      <rect x="205" y="245" width="40" height="15" fill="#a8bfa8"/><rect x="205" y="260" width="40" height="15" fill="#a8bfa8"/>
      <rect x="205" y="275" width="40" height="15" fill="#a8bfa8"/>
      <rect x="205" y="290" width="40" height="15" fill={PLAYER_COLORS.bleu} opacity="0.6"/>
      <rect x="205" y="305" width="40" height="15" fill="#a8bfa8"/><rect x="205" y="320" width="40" height="15" fill="#a8bfa8"/>
      <rect x="205" y="335" width="40" height="15" fill="#a8bfa8"/><rect x="205" y="350" width="40" height="15" fill="#a8bfa8"/>
      <circle cx="145" cy="297" r="6" fill="white" opacity="0.9"/>
      <circle cx="185" cy="357" r="6" fill="white" opacity="0.9"/>
      <circle cx="225" cy="297" r="6" fill="white" opacity="0.9"/>
      <line x1="125" y1="245" x2="125" y2="365" stroke="black" strokeWidth="1"/>
      <line x1="165" y1="245" x2="165" y2="365" stroke="black" strokeWidth="1"/>
      <line x1="205" y1="245" x2="205" y2="365" stroke="black" strokeWidth="1"/>
      <line x1="245" y1="245" x2="245" y2="365" stroke="black" strokeWidth="1"/>
      {[245,260,275,290,305,320,335,350,365].map(y => <line key={y} x1="125" y1={y} x2="245" y2={y} stroke="black" strokeWidth="1"/>)}

      {/* Chemin gauche */}
      <rect x="5"   y="125" width="15" height="40" fill="#a8bfa8"/><rect x="20"  y="125" width="15" height="40" fill="#a8bfa8"/>
      <rect x="35"  y="125" width="15" height="40" fill="#a8bfa8"/><rect x="50"  y="125" width="15" height="40" fill="#a8bfa8"/>
      <rect x="65"  y="125" width="15" height="40" fill={PLAYER_COLORS.vert} opacity="0.6"/>
      <rect x="80"  y="125" width="15" height="40" fill="#a8bfa8"/><rect x="95"  y="125" width="15" height="40" fill="#a8bfa8"/>
      <rect x="110" y="125" width="15" height="40" fill="#a8bfa8"/>
      <rect x="5"   y="165" width="15" height="40" fill={PLAYER_COLORS.vert} opacity="0.6"/>
      <rect x="20"  y="165" width="15" height="40" fill={PLAYER_COLORS.vert} opacity="0.35"/>
      <rect x="35"  y="165" width="15" height="40" fill={PLAYER_COLORS.vert} opacity="0.35"/>
      <rect x="50"  y="165" width="15" height="40" fill={PLAYER_COLORS.vert} opacity="0.35"/>
      <rect x="65"  y="165" width="15" height="40" fill={PLAYER_COLORS.vert} opacity="0.35"/>
      <rect x="80"  y="165" width="15" height="40" fill={PLAYER_COLORS.vert} opacity="0.35"/>
      <rect x="95"  y="165" width="15" height="40" fill={PLAYER_COLORS.vert} opacity="0.35"/>
      <rect x="110" y="165" width="15" height="40" fill={PLAYER_COLORS.vert} opacity="0.35"/>
      <rect x="5"   y="205" width="15" height="40" fill="#a8bfa8"/><rect x="20"  y="205" width="15" height="40" fill="#a8bfa8"/>
      <rect x="35"  y="205" width="15" height="40" fill="#a8bfa8"/><rect x="50"  y="205" width="15" height="40" fill="#a8bfa8"/>
      <rect x="65"  y="205" width="15" height="40" fill={PLAYER_COLORS.vert} opacity="0.6"/>
      <rect x="80"  y="205" width="15" height="40" fill="#a8bfa8"/><rect x="95"  y="205" width="15" height="40" fill="#a8bfa8"/>
      <rect x="110" y="205" width="15" height="40" fill="#a8bfa8"/>
      <circle cx="72"  cy="145" r="6" fill="white" opacity="0.9"/>
      <circle cx="12"  cy="185" r="6" fill="white" opacity="0.9"/>
      <circle cx="72"  cy="225" r="6" fill="white" opacity="0.9"/>
      <line x1="5" y1="125" x2="125" y2="125" stroke="black" strokeWidth="1"/>
      <line x1="5" y1="165" x2="125" y2="165" stroke="black" strokeWidth="1"/>
      <line x1="5" y1="205" x2="125" y2="205" stroke="black" strokeWidth="1"/>
      <line x1="5" y1="245" x2="125" y2="245" stroke="black" strokeWidth="1"/>
      {[5,20,35,50,65,80,95,110,125].map(x => <line key={x} x1={x} y1="125" x2={x} y2="245" stroke="black" strokeWidth="1"/>)}

      {/* Chemin droite */}
      <rect x="245" y="125" width="15" height="40" fill="#a8bfa8"/><rect x="260" y="125" width="15" height="40" fill="#a8bfa8"/>
      <rect x="275" y="125" width="15" height="40" fill="#a8bfa8"/>
      <rect x="290" y="125" width="15" height="40" fill={PLAYER_COLORS.rouge} opacity="0.6"/>
      <rect x="305" y="125" width="15" height="40" fill="#a8bfa8"/><rect x="320" y="125" width="15" height="40" fill="#a8bfa8"/>
      <rect x="335" y="125" width="15" height="40" fill="#a8bfa8"/><rect x="350" y="125" width="15" height="40" fill="#a8bfa8"/>
      <rect x="245" y="165" width="15" height="40" fill={PLAYER_COLORS.rouge} opacity="0.35"/>
      <rect x="260" y="165" width="15" height="40" fill={PLAYER_COLORS.rouge} opacity="0.35"/>
      <rect x="275" y="165" width="15" height="40" fill={PLAYER_COLORS.rouge} opacity="0.35"/>
      <rect x="290" y="165" width="15" height="40" fill={PLAYER_COLORS.rouge} opacity="0.35"/>
      <rect x="305" y="165" width="15" height="40" fill={PLAYER_COLORS.rouge} opacity="0.35"/>
      <rect x="320" y="165" width="15" height="40" fill={PLAYER_COLORS.rouge} opacity="0.35"/>
      <rect x="335" y="165" width="15" height="40" fill={PLAYER_COLORS.rouge} opacity="0.35"/>
      <rect x="350" y="165" width="15" height="40" fill={PLAYER_COLORS.rouge} opacity="0.6"/>
      <rect x="245" y="205" width="15" height="40" fill="#a8bfa8"/><rect x="260" y="205" width="15" height="40" fill="#a8bfa8"/>
      <rect x="275" y="205" width="15" height="40" fill="#a8bfa8"/>
      <rect x="290" y="205" width="15" height="40" fill={PLAYER_COLORS.rouge} opacity="0.6"/>
      <rect x="305" y="205" width="15" height="40" fill="#a8bfa8"/><rect x="320" y="205" width="15" height="40" fill="#a8bfa8"/>
      <rect x="335" y="205" width="15" height="40" fill="#a8bfa8"/><rect x="350" y="205" width="15" height="40" fill="#a8bfa8"/>
      <circle cx="297" cy="145" r="6" fill="white" opacity="0.9"/>
      <circle cx="357" cy="185" r="6" fill="white" opacity="0.9"/>
      <circle cx="297" cy="225" r="6" fill="white" opacity="0.9"/>
      <line x1="245" y1="125" x2="365" y2="125" stroke="black" strokeWidth="1"/>
      <line x1="245" y1="165" x2="365" y2="165" stroke="black" strokeWidth="1"/>
      <line x1="245" y1="205" x2="365" y2="205" stroke="black" strokeWidth="1"/>
      <line x1="245" y1="245" x2="365" y2="245" stroke="black" strokeWidth="1"/>
      {[245,260,275,290,305,320,335,350,365].map(x => <line key={x} x1={x} y1="125" x2={x} y2="245" stroke="black" strokeWidth="1"/>)}

      {/* Pions en zone de départ */}
      {players.map(player =>
        player.pawns.filter(p => p.status === 'home').map(pawn => {
          const pos = HOME_POSITIONS[player.color][pawn.id];
          return (
            <Pawn key={`home-${player.color}-${pawn.id}`}
              color={player.color} cx={pos.cx} cy={pos.cy}
              isMovable={isPawnMovable(pawn.id, player.color)}
              onClick={() => onPawnClick(player.color, pawn.id)} />
          );
        })
      )}

      {/* Pions finis dans la zone centrale */}
      {players.map(player =>
        player.pawns.filter(p => p.status === 'finished').map((pawn, i) => {
          const pos = FINISHED_POSITIONS[player.color][pawn.id] ?? FINISHED_POSITIONS[player.color][i];
          if (!pos) return null;
          return (
            <Pawn key={`finished-${player.color}-${pawn.id}`}
              color={player.color} cx={pos.cx} cy={pos.cy}
              isMovable={false} onClick={() => {}} />
          );
        })
      )}

      {/* Pions sur le plateau et dans les couloirs */}
      {Object.entries(pawnsByCell).map(([cellId, cellPawns]) => {
        const coords = CELL_COORDINATES[cellId];
        if (!coords) return null;
        return cellPawns.map((pawn, idx) => {
          const offset = getPawnOffset(idx, cellPawns.length);
          return (
            <Pawn key={`${pawn.color}-${pawn.id}`}
              color={pawn.color} cx={coords.cx} cy={coords.cy}
              offsetX={offset.offsetX} offsetY={offset.offsetY}
              isMovable={isPawnMovable(pawn.id, pawn.color)}
              onClick={() => onPawnClick(pawn.color, pawn.id)} />
          );
        });
      })}

      </g>
    </svg>
  );
}
