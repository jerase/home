import { PLAYER_COLORS } from '../../logic/constants.js';

export default function Pawn({ color, cx, cy, isMovable, onClick, offsetX = 0, offsetY = 0 }) {
  const fill = PLAYER_COLORS[color];
  const x = cx + offsetX;
  const y = cy + offsetY;

  return (
    <g
      onClick={isMovable ? onClick : undefined}
      className={isMovable ? 'pawn-movable' : ''}
      style={{ cursor: isMovable ? 'pointer' : 'default', transformOrigin: `${x}px ${y}px` }}>
      {/* Ombre */}
      <circle cx={x + 1} cy={y + 1} r={7} fill="rgba(0,0,0,0.35)" />
      {/* Corps */}
      <circle cx={x} cy={y} r={7} fill={fill} stroke="white" strokeWidth={1.5} />
      {/* Reflet */}
      <circle cx={x - 2} cy={y - 2} r={2.5} fill="rgba(255,255,255,0.5)" />
      {/* Anneau si déplaçable */}
      {isMovable && (
        <circle cx={x} cy={y} r={9} fill="none" stroke="white" strokeWidth={1.5} strokeDasharray="3 2" />
      )}
    </g>
  );
}
