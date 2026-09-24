import React, { useState } from 'react';
import { Edit2, Check, Award } from 'lucide-react';
import { PlayerScore } from '../types';
import { AppLanguage, TRANSLATIONS, formatPlayerDisplayName } from '../utils/i18n';

interface ScoreBoardProps {
  players: PlayerScore[];
  targetScore: number;
  lang: AppLanguage;
  onAddRoundForPlayer: (playerId: string) => void;
  onUpdatePlayerName: (playerId: string, newName: string) => void;
  onUpdatePlayerMembers?: (playerId: string, members: string[]) => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  players,
  targetScore,
  lang,
  onAddRoundForPlayer,
  onUpdatePlayerName,
  onUpdatePlayerMembers,
}) => {
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const t = TRANSLATIONS[lang];

  const highestScore = Math.max(...players.map((p) => p.score), 0);

  const startEdit = (player: PlayerScore) => {
    setEditingPlayerId(player.id);
    // Limpiar automáticamente si tiene el nombre por defecto ("Jugador 1", "Player 1", etc.)
    const isDefault = /^(jugador|player)\s*\d*$/i.test(player.name.trim());
    if (isDefault) {
      setEditingName('');
    } else {
      setEditingName(player.name);
    }
  };

  const saveEdit = (playerId: string, defaultName: string) => {
    const trimmed = editingName.trim();
    const finalName = trimmed || defaultName;
    onUpdatePlayerName(playerId, finalName);
    if (onUpdatePlayerMembers) {
      onUpdatePlayerMembers(playerId, [finalName]);
    }
    setEditingPlayerId(null);
  };

  const isTwoTeams = players.length === 2;

  return (
    <section className="w-full">
      <div
        className={`grid gap-2 sm:gap-3.5 ${
          isTwoTeams
            ? 'grid-cols-2'
            : players.length === 3
            ? 'grid-cols-1 sm:grid-cols-3'
            : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4'
        }`}
      >
        {players.map((player) => {
          const pointsRemaining = Math.max(0, targetScore - player.score);
          const isLeader = player.score > 0 && player.score === highestScore;
          const isAtLeyDe = pointsRemaining > 0 && pointsRemaining <= 25; // Domino term!
          const displayName = formatPlayerDisplayName(player.name, lang);

          return (
            <div
              key={player.id}
              id={`player-card-${player.id}`}
              className={`relative overflow-hidden rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                isLeader
                  ? 'bg-slate-900/80 backdrop-blur-md border-amber-400/80 shadow-2xl shadow-amber-950/40 ring-1 ring-amber-400/50'
                  : 'bg-slate-950/75 backdrop-blur-md border-slate-700/60 shadow-xl'
              }`}
            >
              {/* Top team color banner line */}
              <div
                className="h-2 sm:h-2.5 w-full flex-shrink-0"
                style={{ backgroundColor: player.color }}
              />

              {/* Unified Header: Player Name */}
              <div className="px-3 py-2.5 sm:px-4 sm:py-3.5 bg-slate-900/50 border-b border-slate-700/50">
                {editingPlayerId === player.id ? (
                  <div className="w-full">
                    {(() => {
                      const defaultFallback = player.id === 'team_1'
                        ? (lang === 'es' ? 'Jugador 1' : 'Player 1')
                        : player.id === 'team_2'
                        ? (lang === 'es' ? 'Jugador 2' : 'Player 2')
                        : displayName;
                      return (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editingName}
                            placeholder={defaultFallback}
                            maxLength={35}
                            autoFocus
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(player.id, defaultFallback);
                              if (e.key === 'Escape') setEditingPlayerId(null);
                            }}
                            className="bg-stone-850 border border-amber-500/80 rounded-lg px-2 py-1.5 text-lg sm:text-2xl md:text-3xl font-black text-stone-100 placeholder:text-stone-500 focus:outline-none w-full min-w-0 shadow-inner"
                          />
                          <button
                            type="button"
                            onClick={() => saveEdit(player.id, defaultFallback)}
                            className="p-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg text-xs font-bold flex items-center gap-1 flex-shrink-0 cursor-pointer shadow active:scale-95"
                            title={lang === 'es' ? 'Guardar nombre' : 'Save name'}
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div
                    onClick={() => startEdit(player)}
                    title={lang === 'es' ? 'Toca para editar nombre' : 'Tap to edit name'}
                    className="w-full flex items-center justify-between gap-2 group cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-stone-50 break-words line-clamp-2 leading-snug tracking-tight">
                        {displayName}
                      </h2>
                    </div>
                    <div className="p-1 text-stone-400 group-hover:text-amber-400 transition-colors flex-shrink-0">
                      <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                )}
              </div>

              {/* Unified Body: Score Digits and Hands Stats */}
              <div
                id={`score-card-box-${player.id}`}
                onClick={() => onAddRoundForPlayer?.(player.id)}
                title={lang === 'es' ? `Toca para anotar puntos para ${displayName}` : `Tap to record points for ${displayName}`}
                className="p-3 sm:p-4 landscape:p-2 text-center flex flex-col justify-center flex-1 cursor-pointer hover:bg-stone-850/40 transition-colors active:scale-[0.99]"
              >
                <div className="flex items-baseline justify-center gap-1.5 sm:gap-2">
                  <span
                    id={`score-display-${player.id}`}
                    className="text-3xl sm:text-4xl md:text-5xl landscape:text-2xl sm:landscape:text-3xl font-black tracking-tight font-display text-amber-300 drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)] select-all leading-none"
                  >
                    {player.score}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-stone-400 select-none">
                    / {targetScore}
                  </span>
                </div>

                {/* Status / Points to win */}
                <div className="mt-2 sm:mt-2.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs sm:text-sm leading-tight">
                  {pointsRemaining === 0 ? (
                    <span className="font-extrabold text-emerald-400">
                      {lang === 'es' ? '¡Meta lograda!' : 'Target reached!'}
                    </span>
                  ) : isAtLeyDe ? (
                    <span className="font-extrabold text-amber-400 animate-pulse">
                      {lang === 'es' ? `¡A ley de ${pointsRemaining}!` : `${pointsRemaining} ${t.pointsToWin}!`}
                    </span>
                  ) : (
                    <span className="text-stone-300 font-semibold">
                      {lang === 'es' ? `Faltan ${pointsRemaining}` : `${pointsRemaining} ${t.pointsToWin}`}
                    </span>
                  )}
                  <span className="text-stone-600">•</span>
                  <span className="text-stone-300 font-medium flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-400/80 flex-shrink-0" />
                    <span>
                      {player.handsWon}{' '}
                      {player.handsWon === 1
                        ? (lang === 'es' ? 'mano' : 'hand')
                        : (lang === 'es' ? 'manos' : 'hands')}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
