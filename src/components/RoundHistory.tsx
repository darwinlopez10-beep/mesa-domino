import React from 'react';
import { RotateCcw, Trash2, Sparkles, Lock, ShieldAlert } from 'lucide-react';
import { PlayerScore, Round } from '../types';
import { AppLanguage, TRANSLATIONS, formatPlayerDisplayName } from '../utils/i18n';

interface RoundHistoryProps {
  rounds: Round[];
  players: PlayerScore[];
  lang: AppLanguage;
  onUndoLastRound: () => void;
  onDeleteRound: (roundId: string) => void;
}

export const RoundHistory: React.FC<RoundHistoryProps> = ({
  rounds,
  players,
  lang,
  onUndoLastRound,
  onDeleteRound,
}) => {
  const isTwoTeams = players.length === 2;
  const t = TRANSLATIONS[lang];

  const getBadgeForReason = (reason: string) => {
    switch (reason) {
      case 'tranca':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <Lock className="w-2.5 h-2.5" />
            {t.reasonTranca}
          </span>
        );
      case 'capicua':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-2.5 h-2.5" />
            {t.reasonCapicua}
          </span>
        );
      case 'penalizacion':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-500/15 text-red-300 border border-red-500/30">
            <ShieldAlert className="w-2.5 h-2.5" />
            {t.reasonPenalizacion}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <section className="bg-stone-850/90 rounded-2xl border border-stone-800 shadow-xl overflow-hidden">
      {/* Header of Round History */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-stone-800 bg-stone-900/60">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-stone-100 font-display text-sm sm:text-base">
            {t.roundsHistory}
          </h3>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-stone-800 text-stone-300 border border-stone-700">
            {rounds.length}{' '}
            {rounds.length === 1
              ? lang === 'es'
                ? 'mano'
                : 'hand'
              : lang === 'es'
              ? 'manos'
              : 'hands'}
          </span>
        </div>

        {rounds.length > 0 && (
          <button
            id="btn-undo-last-round"
            onClick={onUndoLastRound}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-semibold border border-stone-700 transition-all active:scale-95 cursor-pointer"
            title={t.undoLastHand}
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.undoLastHand}</span>
          </button>
        )}
      </div>

      {rounds.length === 0 ? (
        <div className="p-8 text-center text-stone-500">
          <p className="text-sm font-medium">{t.noRoundsYet}</p>
          <p className="text-xs text-stone-600 mt-1">
            {lang === 'es'
              ? 'Toca el cuadro del jugador para anotar los puntos de la mano.'
              : 'Tap a player score card to record hand points.'}
          </p>
        </div>
      ) : isTwoTeams ? (
        /* Classic 2-column domino notebook layout (Nosotros vs Ellos) */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <colgroup>
              <col className="w-10 sm:w-12" />
              <col />
              <col />
              <col className="w-8 sm:w-10" />
            </colgroup>
            <tbody className="divide-y divide-stone-800/60 font-mono">
              {rounds.map((round) => {
                const team1Won = round.winnerId === players[0].id;
                const team2Won = round.winnerId === players[1].id;

                const team1ScoreSnap = round.scoresSnapshot[players[0].id] ?? 0;
                const team2ScoreSnap = round.scoresSnapshot[players[1].id] ?? 0;

                return (
                  <tr
                    key={round.id}
                    className="hover:bg-stone-800/30 transition-colors group"
                  >
                    <td className="py-3 px-3 text-center text-stone-500 font-sans font-bold text-xs">
                      {round.roundNumber}
                    </td>

                    {/* Team 1 Cell */}
                    <td className="py-3 px-4 border-r border-stone-800/80">
                      {team1Won ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-emerald-400">
                              +{round.points}
                            </span>
                            {getBadgeForReason(round.reason)}
                          </div>
                          <span className="text-sm font-bold text-stone-100">
                            {team1ScoreSnap}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-stone-500">
                          <span className="text-xs font-sans text-stone-600">-</span>
                          <span className="text-xs text-stone-400">{team1ScoreSnap}</span>
                        </div>
                      )}
                    </td>

                    {/* Team 2 Cell */}
                    <td className="py-3 px-4">
                      {team2Won ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-amber-400">
                              +{round.points}
                            </span>
                            {getBadgeForReason(round.reason)}
                          </div>
                          <span className="text-sm font-bold text-stone-100">
                            {team2ScoreSnap}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-stone-500">
                          <span className="text-xs font-sans text-stone-600">-</span>
                          <span className="text-xs text-stone-400">{team2ScoreSnap}</span>
                        </div>
                      )}
                    </td>

                    {/* Delete action */}
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => onDeleteRound(round.id)}
                        className="opacity-0 group-hover:opacity-100 text-stone-500 hover:text-red-400 p-1 rounded transition-opacity cursor-pointer"
                        title={lang === 'es' ? 'Eliminar esta mano' : 'Delete this hand'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Multi-player table for individual mode */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-stone-800 bg-stone-900/40 text-stone-400 text-xs">
                <th className="py-2.5 px-3 text-center w-12 font-bold">#</th>
                <th className="py-2.5 px-4 font-bold text-stone-300">
                  {lang === 'es' ? 'Ganador de Mano' : 'Hand Winner'}
                </th>
                <th className="py-2.5 px-3 font-bold text-center">{t.points}</th>
                <th className="py-2.5 px-3 font-bold text-center">
                  {lang === 'es' ? 'Tipo' : 'Type'}
                </th>
                {players.map((p) => (
                  <th key={p.id} className="py-2.5 px-3 font-bold text-right" style={{ color: p.color }}>
                    {formatPlayerDisplayName(p.name, lang)}
                  </th>
                ))}
                <th className="py-2.5 px-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 font-mono">
              {rounds.map((round) => {
                const winnerPlayer = players.find((p) => p.id === round.winnerId);
                return (
                  <tr key={round.id} className="hover:bg-stone-800/30 transition-colors group">
                    <td className="py-3 px-3 text-center text-stone-500 font-sans font-bold text-xs">
                      {round.roundNumber}
                    </td>
                    <td className="py-3 px-4 font-sans font-semibold text-stone-200">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: winnerPlayer?.color }}
                        />
                        {winnerPlayer?.name ? formatPlayerDisplayName(winnerPlayer.name, lang) : ''}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-amber-400">
                      +{round.points}
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      {getBadgeForReason(round.reason) || <span className="text-stone-600">-</span>}
                    </td>
                    {players.map((p) => (
                      <td key={p.id} className="py-3 px-3 text-right font-medium text-stone-300">
                        {round.scoresSnapshot[p.id] ?? 0}
                      </td>
                    ))}
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => onDeleteRound(round.id)}
                        className="opacity-0 group-hover:opacity-100 text-stone-500 hover:text-red-400 p-1 rounded transition-opacity cursor-pointer"
                        title={lang === 'es' ? 'Eliminar esta mano' : 'Delete this hand'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
