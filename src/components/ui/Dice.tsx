import { useState } from 'react';

const DOTS: Record<number, [number, number][]> = {
  1: [[50,50]],
  2: [[25,25],[75,75]],
  3: [[25,25],[50,50],[75,75]],
  4: [[25,25],[75,25],[25,75],[75,75]],
  5: [[25,25],[75,25],[50,50],[25,75],[75,75]],
  6: [[25,20],[75,20],[25,50],[75,50],[25,80],[75,80]],
};

const VALUE_LABELS: Record<number, string> = {
  1:'un', 2:'deux', 3:'trois', 4:'quatre', 5:'cinq', 6:'six',
};

interface DiceProps {
  value: number | null;
  onRoll: () => void;
  canRoll: boolean;
  size?: number;
}

export default function Dice({ value, onRoll, canRoll, size = 64 }: DiceProps) {
  const [rolling, setRolling] = useState(false);

  function handleRoll() {
    if (!canRoll || rolling) return;
    setRolling(true);
    setTimeout(() => setRolling(false), 560);
    onRoll();
  }

  const dots = value ? DOTS[value] : [];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={rolling ? 'dice-rolling' : ''} style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" width={size} height={size}>
          <rect x="3" y="3" width="94" height="94" rx="18" ry="18"
            fill="white" stroke="#e2e8f0" strokeWidth="2"
            style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.35))' }} />
          {dots.map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="8" fill="#1a1a2e" />
          ))}
          {!value && (
            <text x="50" y="60" textAnchor="middle" fontSize="30" fill="#94a3b8"
                  fontFamily="Georgia, serif">?</text>
          )}
        </svg>
      </div>
      <div className="flex flex-col items-center" style={{ minHeight: 32 }}>
        {value ? (
          <>
            <span className="font-bold text-white leading-none"
                  style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', textShadow: '0 0 12px rgba(255,255,255,0.3)' }}>
              {value}
            </span>
            <span className="text-white/40 uppercase tracking-widest"
                  style={{ fontSize: 'clamp(0.5rem, 1.5vw, 0.65rem)' }}>
              {value === 5 ? '★ cinq ★' : value === 6 ? '⚡ six ⚡' : VALUE_LABELS[value]}
            </span>
          </>
        ) : (
          <span className="text-white/25 text-xs uppercase tracking-wider">—</span>
        )}
      </div>
      <button onClick={handleRoll} disabled={!canRoll || rolling} aria-label="Lancer le dé"
        className="px-5 py-2 rounded-xl font-semibold text-sm transition-all duration-200 focus:outline-none"
        style={{
          background : canRoll ? 'linear-gradient(135deg, #FFD700, #FFA500)' : 'rgba(255,255,255,0.08)',
          color      : canRoll ? '#1a1a2e' : 'rgba(255,255,255,0.25)',
          boxShadow  : canRoll ? '0 0 18px rgba(255,200,0,0.35)' : 'none',
          cursor     : canRoll ? 'pointer' : 'not-allowed',
        }}>
        {rolling ? 'Lance…' : canRoll ? '🎲 Lancer' : '⏳ Attendre'}
      </button>
    </div>
  );
}
