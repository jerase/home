import type { Color } from '../../types.js';
import { PLAYER_COLORS } from '../../logic/constants.js';

interface PawnProps {
  color: Color;
  cx: number;
  cy: number;
  isMovable: boolean;
  onClick: () => void;
  offsetX?: number;
  offsetY?: number;
}

export default function Pawn({ color, cx, cy, isMovable, onClick, offsetX = 0, offsetY = 0 }: PawnProps) {
  const fill = PLAYER_COLORS[color];
  const x = cx + offsetX;
  const y = cy + offsetY;

  return (
    <g
      onClick={isMovable ? onClick : undefined}
      className={isMovable ? 'pawn-movable' : ''}
      style={{ cursor: isMovable ? 'pointer' : 'default', transformOrigin: `${x}px ${y}px` }}>
      <circle cx={x + 1} cy={y + 1} r={7} fill="rgba(0,0,0,0.35)" />
      <circle cx={x} cy={y} r={7} fill={fill} stroke="white" strokeWidth={1.5} />
      <circle cx={x - 2} cy={y - 2} r={2.5} fill="rgba(255,255,255,0.5)" />
      {isMovable && (
        <circle cx={x} cy={y} r={9} fill="none" stroke="white" strokeWidth={1.5} strokeDasharray="3 2" />
      )}
    </g>
  );
}
