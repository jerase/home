import { PLAYER_COLORS, PLAYER_LABELS } from '../../logic/constants.js';

export default function PlayerPanel({ players, currentPlayerId, phase, compact = false }) {
  return (
    <div className={`flex ${compact ? 'flex-row flex-wrap justify-center' : 'flex-col'} gap-2 w-full`}>
      {players.map(player => {
        const isActive = player.id === currentPlayerId;
        const color    = PLAYER_COLORS[player.color];
        const finished = player.pawns.filter(p => p.status === 'finished').length;

        return (
          <div key={player.id}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-300 ${compact ? 'flex-1 min-w-[120px] max-w-[160px]' : ''}`}
            style={{
              background : isActive ? `${color}22` : 'rgba(255,255,255,0.05)',
              border     : isActive ? `1px solid ${color}88` : '1px solid rgba(255,255,255,0.08)',
              transform  : isActive ? 'scale(1.03)' : 'scale(1)',
            }}>

            {/* Indicateur couleur */}
            <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 border-2"
                 style={{ background: color, borderColor: isActive ? 'white' : 'transparent' }} />

            {/* Nom + type */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-white font-semibold truncate"
                      style={{ fontSize: compact ? '0.7rem' : '0.8rem' }}>
                  {PLAYER_LABELS[player.color]}
                </span>
                <span className="text-white/50" style={{ fontSize: '0.65rem' }}>
                  {player.isAI ? '🤖' : '👤'}
                </span>
                {isActive && phase === 'ai_thinking' && (
                  <span className="text-yellow-300 animate-pulse" style={{ fontSize: '0.6rem' }}>
                    …
                  </span>
                )}
              </div>
            </div>

            {/* Pions arrivés */}
            <div className="flex gap-0.5 flex-shrink-0">
              {player.pawns.map(p => (
                <div key={p.id}
                     className="rounded-full border border-white/20 transition-all duration-300"
                     style={{
                       width: compact ? 8 : 10,
                       height: compact ? 8 : 10,
                       background: p.status === 'finished' ? color : 'rgba(255,255,255,0.12)',
                       boxShadow: p.status === 'finished' ? `0 0 4px ${color}` : 'none',
                     }} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
