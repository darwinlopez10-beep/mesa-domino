import React, { useState } from 'react';
import {
  X,
  Trophy,
  Calendar,
  Clock,
  Trash2,
  Award,
  Users,
  Swords,
  ChevronDown,
  ChevronUp,
  BookmarkPlus,
  Medal,
  Sparkles,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import { GameMode, PastMatch, WinReason, PlayerScore, Round } from '../types';
import { AppLanguage, TRANSLATIONS, formatPlayerDisplayName } from '../utils/i18n';

interface MatchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: PastMatch[];
  onDeleteMatch: (matchId: string) => void;
  onClearHistory: (mode?: GameMode) => void;
  canSaveCurrentGame?: boolean;
  onSaveCurrentGame?: () => void;
  currentPlayers?: PlayerScore[];
  currentRounds?: Round[];
  currentGameMode?: GameMode;
  targetScore?: number;
  lang: AppLanguage;
}

export const MatchHistoryModal: React.FC<MatchHistoryModalProps> = ({
  isOpen,
  onClose,
  matches,
  onDeleteMatch,
  onClearHistory,
  canSaveCurrentGame,
  onSaveCurrentGame,
  currentPlayers,
  currentRounds,
  currentGameMode = 'teams',
  targetScore,
  lang,
}) => {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'all' | 'teams' | 'individual'>('all');
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [confirmClearType, setConfirmClearType] = useState<'all' | 'teams' | 'individual' | null>(null);
  const [confirmDeleteMatchId, setConfirmDeleteMatchId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter matches based on selected tab
  const filteredMatches = matches.filter((m) => {
    if (activeTab === 'all') return true;
    return m.gameMode === activeTab;
  });

  const teamsMatches = matches.filter((m) => m.gameMode === 'teams');
  const individualMatches = matches.filter((m) => m.gameMode === 'individual');

  // Series Stats for Teams Mode
  const teamWinStats: Record<string, { wins: number; color: string; totalPoints: number }> = {};
  teamsMatches.forEach((m) => {
    if (!teamWinStats[m.winnerName]) {
      teamWinStats[m.winnerName] = { wins: 0, color: m.winnerColor, totalPoints: 0 };
    }
    teamWinStats[m.winnerName].wins += 1;
    m.finalScores.forEach((s) => {
      if (!teamWinStats[s.name]) {
        teamWinStats[s.name] = { wins: 0, color: s.color, totalPoints: 0 };
      }
      teamWinStats[s.name].totalPoints += s.score;
    });
  });

  // Series Stats for Individual Mode (Todos contra Todos)
  const individualWinStats: Record<string, { wins: number; color: string; totalPoints: number; matchesPlayed: number }> = {};
  individualMatches.forEach((m) => {
    m.finalScores.forEach((s) => {
      if (!individualWinStats[s.name]) {
        individualWinStats[s.name] = { wins: 0, color: s.color, totalPoints: 0, matchesPlayed: 0 };
      }
      individualWinStats[s.name].matchesPlayed += 1;
      individualWinStats[s.name].totalPoints += s.score;
    });
    if (individualWinStats[m.winnerName]) {
      individualWinStats[m.winnerName].wins += 1;
    }
  });

  // Automatically register active players in the series stats if they don't have records yet
  if (currentPlayers && currentGameMode === 'teams') {
    currentPlayers.forEach((p) => {
      if (!teamWinStats[p.name]) {
        teamWinStats[p.name] = { wins: 0, color: p.color, totalPoints: p.score };
      }
    });
  }

  if (currentPlayers && currentGameMode === 'individual') {
    currentPlayers.forEach((p) => {
      if (!individualWinStats[p.name]) {
        individualWinStats[p.name] = { wins: 0, color: p.color, totalPoints: p.score, matchesPlayed: 0 };
      }
    });
  }

  const sortedIndividualRankings = Object.entries(individualWinStats).sort((a, b) => {
    if (b[1].wins !== a[1].wins) return b[1].wins - a[1].wins;
    return b[1].totalPoints - a[1].totalPoints;
  });

  const getBadgeForReason = (reason: WinReason) => {
    switch (reason) {
      case 'tranca':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Lock className="w-2.5 h-2.5" />
            {t.reasonTranca}
          </span>
        );
      case 'capicua':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <Sparkles className="w-2.5 h-2.5" />
            {t.reasonCapicua}
          </span>
        );
      case 'penalizacion':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-500/15 text-red-300 border border-red-500/30">
            <ShieldAlert className="w-2.5 h-2.5" />
            {t.reasonPenalization}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 pt-1 sm:pt-3 md:pt-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="w-full max-w-xl bg-stone-900 border border-stone-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[93vh] mt-0.5 sm:mt-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 sm:px-5 py-2.5 sm:py-3.5 border-b border-stone-800 bg-stone-850 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="p-1.5 sm:p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-100 font-display leading-tight">
                {t.matchHistory}
              </h3>
              <p className="text-[11px] sm:text-xs text-stone-400 leading-tight">
                {lang === 'es'
                  ? 'Guarda y consulta partidas por pareja e individual'
                  : 'Save and view matches by teams and individual'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {canSaveCurrentGame && onSaveCurrentGame && (
              <button
                type="button"
                onClick={onSaveCurrentGame}
                title={lang === 'es' ? 'Guardar estado de la partida actual en el historial' : 'Archive current game state to history'}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>{lang === 'es' ? 'Archivar actual' : 'Archive current'}</span>
              </button>
            )}

            {matches.length > 0 && (
              <button
                type="button"
                id="btn-header-clear-history"
                onClick={() => setConfirmClearType('all')}
                title={lang === 'es' ? 'Borrar todo el historial' : 'Clear all match history'}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{lang === 'es' ? 'Borrar todo' : 'Clear all'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-800 bg-stone-900 px-3 sm:px-4 pt-2 sm:pt-2.5 gap-2 overflow-x-auto flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`pb-2 px-2.5 sm:px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>{lang === 'es' ? 'Todas' : 'All'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-800 text-stone-300">
              {matches.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('teams')}
            className={`pb-2 px-2.5 sm:px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'teams'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{lang === 'es' ? 'Por Parejas (2 Equipos)' : 'By Teams (2 Teams)'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-800 text-stone-300">
              {teamsMatches.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('individual')}
            className={`pb-2 px-2.5 sm:px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'individual'
                ? 'border-sky-400 text-sky-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>{lang === 'es' ? 'Individual (Todos vs Todos)' : 'Individual (Free for All)'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-800 text-stone-300">
              {individualMatches.length}
            </span>
          </button>
        </div>

        <div className="p-3 sm:p-4.5 overflow-y-auto space-y-3 sm:space-y-4 flex-1">
          {/* Current Table / Mesa Activa con Nombres Automáticos de Jugadores */}
          {currentPlayers && currentPlayers.length > 0 && (
            <div className="bg-gradient-to-br from-stone-850/95 to-stone-900 p-3 sm:p-3.5 rounded-2xl border border-amber-500/30 shadow-md">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                    {lang === 'es' ? 'Mesa Actual en Juego' : 'Current Active Table'}
                  </span>
                  {currentRounds && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-800 text-stone-300 font-medium">
                      {currentRounds.length} {currentRounds.length === 1 ? (lang === 'es' ? 'mano' : 'hand') : (lang === 'es' ? 'manos' : 'hands')}
                    </span>
                  )}
                </div>

                {canSaveCurrentGame && onSaveCurrentGame && (
                  <button
                    type="button"
                    onClick={onSaveCurrentGame}
                    title={lang === 'es' ? 'Guardar partida actual en el historial de la copa' : 'Save current match to copa history'}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold transition-all active:scale-95 cursor-pointer"
                  >
                    <BookmarkPlus className="w-3 h-3" />
                    <span>{lang === 'es' ? 'Archivar en Copa' : 'Save to Copa'}</span>
                  </button>
                )}
              </div>

              {/* Nombres automáticos de los jugadores actuales y sus puntuaciones */}
              <div className={`grid gap-1.5 sm:gap-2 ${currentPlayers.length === 2 ? 'grid-cols-2' : currentPlayers.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
                {currentPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="p-2 sm:p-2.5 rounded-xl bg-stone-900/90 border border-stone-800 flex items-center justify-between gap-1.5"
                  >
                    <div className="flex items-center gap-1.5 truncate min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: player.color }}
                      />
                      <span className="text-xs font-bold text-stone-100 truncate">
                        {formatPlayerDisplayName(player.name, lang)}
                      </span>
                    </div>
                    <span className="font-mono font-black text-amber-400 text-xs sm:text-sm flex-shrink-0">
                      {player.score} {targetScore ? <span className="text-[10px] text-stone-500 font-normal">/{targetScore}</span> : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mobile button to save current game if active mesa wasn't displayed */}
          {(!currentPlayers || currentPlayers.length === 0) && canSaveCurrentGame && onSaveCurrentGame && (
            <div className="sm:hidden">
              <button
                type="button"
                onClick={onSaveCurrentGame}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold cursor-pointer"
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>
                  {lang === 'es'
                    ? 'Archivar partida en curso al historial'
                    : 'Archive current game to history'}
                </span>
              </button>
            </div>
          )}

          {/* TEAMS MODE: Global Series Counter */}
          {activeTab === 'teams' && Object.keys(teamWinStats).length > 0 && (
            <div className="bg-stone-850 p-4 rounded-2xl border border-stone-800 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  {lang === 'es' ? 'Récord de la Serie en Parejas' : 'Teams Series Record'}
                </span>
                <span className="text-[11px] text-stone-400 font-normal">
                  {teamsMatches.length} {teamsMatches.length === 1 ? (lang === 'es' ? 'partida' : 'match') : (lang === 'es' ? 'partidas' : 'matches')}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {Object.entries(teamWinStats).map(([name, data]) => (
                  <div
                    key={name}
                    className="p-3 bg-stone-900/90 rounded-xl border border-stone-800 flex items-center justify-between"
                  >
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: data.color }}
                        />
                        <span className="text-xs font-bold text-stone-100 truncate">
                          {formatPlayerDisplayName(name, lang)}
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-500">
                        {data.totalPoints} {lang === 'es' ? 'pts acumulados' : 'pts accumulated'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black font-display text-amber-400">
                        {data.wins}
                      </span>
                      <span className="text-[10px] text-stone-400 block -mt-1 font-semibold">
                        {lang === 'es' ? 'victorias' : 'wins'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INDIVIDUAL MODE: Podio & Leaderboard */}
          {activeTab === 'individual' && sortedIndividualRankings.length > 0 && (
            <div className="bg-stone-850 p-4 rounded-2xl border border-stone-800 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-2.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Medal className="w-4 h-4 text-amber-400" />
                  {lang === 'es' ? 'Tabla de Posiciones (Todos contra Todos)' : 'Leaderboard (Free for All)'}
                </span>
                <span className="text-[11px] text-stone-400 font-normal">
                  {individualMatches.length} {individualMatches.length === 1 ? (lang === 'es' ? 'partida' : 'match') : (lang === 'es' ? 'partidas' : 'matches')}
                </span>
              </div>
              <div className="space-y-1.5">
                {sortedIndividualRankings.map(([name, data], idx) => (
                  <div
                    key={name}
                    className="px-3 py-2 bg-stone-900/90 rounded-xl border border-stone-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-5 text-center text-xs font-bold">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}º`}
                      </span>
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: data.color }}
                      />
                      <span className="text-xs font-bold text-stone-100 truncate">
                        {formatPlayerDisplayName(name, lang)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-stone-400">
                        {data.matchesPlayed} {data.matchesPlayed === 1 ? (lang === 'es' ? 'partida' : 'match') : (lang === 'es' ? 'partidas' : 'matches')}
                      </span>
                      <div className="text-right">
                        <span className="font-bold text-amber-400 text-sm">
                          {data.wins} {data.wins === 1 ? (lang === 'es' ? 'victoria' : 'win') : (lang === 'es' ? 'victorias' : 'wins')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matches List */}
          {filteredMatches.length === 0 ? (
            <div className="py-12 text-center text-stone-500 bg-stone-850/40 rounded-2xl border border-dashed border-stone-800">
              <Trophy className="w-8 h-8 mx-auto text-stone-600 mb-2 opacity-50" />
              <p className="text-sm font-medium text-stone-400">
                {lang === 'es'
                  ? activeTab === 'teams'
                    ? 'No hay partidas registradas en la categoría por Parejas.'
                    : activeTab === 'individual'
                    ? 'No hay partidas registradas en Todos contra Todos.'
                    : 'No hay partidas registradas en el historial.'
                  : activeTab === 'teams'
                  ? 'No matches recorded in the Teams category.'
                  : activeTab === 'individual'
                  ? 'No matches recorded in Free for All.'
                  : 'No matches recorded in history.'}
              </p>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                {lang === 'es'
                  ? 'Al terminar una partida o al pulsar "Archivar actual", se guardará automáticamente con todo el detalle de sus manos.'
                  : 'When a game ends or when you tap "Archive current", it will be saved automatically with full hand details.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMatches.map((match) => {
                const isExpanded = expandedMatchId === match.id;
                const isTeams = match.gameMode === 'teams';

                return (
                  <div
                    key={match.id}
                    className="bg-stone-850/90 rounded-2xl border border-stone-800 overflow-hidden shadow-sm transition-all"
                  >
                    {/* Match Card Main Header */}
                    <div className="p-3.5 sm:p-4 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              isTeams
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                            }`}
                          >
                            {isTeams
                              ? (lang === 'es' ? 'Por Parejas' : 'Teams')
                              : (lang === 'es' ? 'Todos vs Todos' : 'Free for All')}
                          </span>
                          <span className="flex items-center gap-1 text-stone-400">
                            <Calendar className="w-3 h-3 text-stone-500" />
                            {match.date}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-stone-400 text-[11px]">
                            <Clock className="w-3 h-3 text-stone-500" />
                            {match.durationMinutes} min
                          </span>
                          <span className="text-stone-600">•</span>
                          <span className="text-stone-400 text-[11px]">
                            {lang === 'es' ? 'Meta:' : 'Target:'} <strong>{match.targetScore}</strong> {t.pts}
                          </span>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteMatchId(match.id)}
                            title={lang === 'es' ? 'Eliminar esta partida' : 'Delete this match'}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-stone-800 transition-colors ml-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Winner highlight & final scores */}
                      <div className="p-3 bg-stone-900/90 rounded-xl border border-stone-800/80">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-amber-400" />
                            <span className="text-xs text-stone-400">
                              {lang === 'es' ? 'Ganador:' : 'Winner:'}
                            </span>
                            <span className="font-extrabold text-sm text-stone-100 flex items-center gap-1.5">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: match.winnerColor }}
                              />
                              {formatPlayerDisplayName(match.winnerName, lang)}
                            </span>
                          </div>
                          <span className="text-xs text-stone-400">
                            {match.totalRounds} {match.totalRounds === 1 ? (lang === 'es' ? 'mano' : 'hand') : (lang === 'es' ? 'manos' : 'hands')}
                          </span>
                        </div>

                        {/* Scores breakdown */}
                        {isTeams ? (
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-800/60 text-xs">
                            {match.finalScores.map((team, idx) => {
                              const isWinner = team.name === match.winnerName;
                              const members = team.members || (idx === 0 ? match.team1Members : match.team2Members);
                              return (
                                <div
                                  key={idx}
                                  className={`p-2 rounded-lg ${
                                    isWinner
                                      ? 'bg-amber-500/10 border border-amber-500/30'
                                      : 'bg-stone-950/60 border border-stone-800/50'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-stone-200 truncate">
                                      {formatPlayerDisplayName(team.name, lang)}
                                    </span>
                                    <span className="font-mono font-extrabold text-amber-400 text-sm">
                                      {team.score}
                                    </span>
                                  </div>
                                  {members && members.length > 0 && (
                                    <div className="text-[11px] text-stone-400 flex items-center gap-1 mt-0.5 truncate">
                                      <Users className="w-3 h-3 text-stone-500 flex-shrink-0" />
                                      <span className="truncate">
                                        {members.map((m) => formatPlayerDisplayName(m, lang)).join(' & ')}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 border-t border-stone-800/60 text-xs">
                            {match.finalScores.map((p, idx) => {
                              const isWinner = p.name === match.winnerName;
                              return (
                                <div
                                  key={idx}
                                  className={`p-1.5 rounded-lg flex items-center justify-between ${
                                    isWinner
                                      ? 'bg-amber-500/15 border border-amber-500/30'
                                      : 'bg-stone-950/60 border border-stone-800/50'
                                  }`}
                                >
                                  <span className="font-medium text-stone-200 truncate pr-1">
                                    {formatPlayerDisplayName(p.name, lang)}
                                  </span>
                                  <span className="font-mono font-bold text-amber-400">
                                    {p.score}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Expandable detailed hands button */}
                      {match.rounds && match.rounds.length > 0 && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                            className="w-full py-1.5 px-2.5 rounded-xl bg-stone-900/60 hover:bg-stone-900 text-stone-400 hover:text-stone-200 text-xs font-semibold flex items-center justify-between border border-stone-800/80 transition-colors cursor-pointer"
                          >
                            <span>
                              {isExpanded
                                ? (lang === 'es' ? 'Ocultar manos jugadas' : 'Hide played hands')
                                : (lang === 'es'
                                    ? `Ver detalle de las ${match.rounds.length} manos`
                                    : `View details of all ${match.rounds.length} hands`)}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Expanded Hand-by-Hand Breakdown */}
                          {isExpanded && (
                            <div className="mt-2 space-y-1.5 bg-stone-950/70 p-2.5 rounded-xl border border-stone-800 text-xs">
                              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                                {lang === 'es' ? 'Registro de Manos' : 'Hand Log'}
                              </div>
                              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                                {match.rounds.map((round) => (
                                  <div
                                    key={round.id}
                                    className="p-1.5 rounded bg-stone-900 border border-stone-800/70 flex items-center justify-between"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="w-5 text-stone-500 font-mono text-[11px]">
                                        #{round.roundNumber}
                                      </span>
                                      <div className="flex items-center gap-1.5">
                                        {getBadgeForReason(round.reason)}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {round.notes && (
                                        <span className="text-[10px] text-stone-500 italic truncate max-w-[100px]">
                                          {round.notes}
                                        </span>
                                      )}
                                      <span className="font-mono font-bold text-amber-400">
                                        +{round.points} {t.pts}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {matches.length > 0 && (
          <div className="px-5 py-3 border-t border-stone-800 bg-stone-850 flex items-center justify-between text-xs gap-2">
            <span className="text-stone-400 truncate">
              {lang === 'es'
                ? `Mostrando ${filteredMatches.length} de ${matches.length} partidas`
                : `Showing ${filteredMatches.length} of ${matches.length} matches`}
            </span>

            <button
              type="button"
              id="btn-footer-clear-history"
              onClick={() => setConfirmClearType(activeTab === 'all' ? 'all' : activeTab)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 font-bold transition-all active:scale-95 cursor-pointer whitespace-nowrap flex-shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>
                {lang === 'es'
                  ? activeTab === 'all'
                    ? 'Borrar todo'
                    : activeTab === 'teams'
                    ? 'Borrar parejas'
                    : 'Borrar individuales'
                  : activeTab === 'all'
                  ? 'Clear all'
                  : activeTab === 'teams'
                  ? 'Clear teams'
                  : 'Clear individual'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal: Clear History */}
      {confirmClearType && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={(e) => {
            e.stopPropagation();
            setConfirmClearType(null);
          }}
        >
          <div
            className="bg-stone-900 border border-stone-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 flex-shrink-0 mt-0.5">
                <Trash2 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-stone-100">
                  {lang === 'es'
                    ? confirmClearType === 'all'
                      ? '¿Borrar todo el historial?'
                      : confirmClearType === 'teams'
                      ? '¿Borrar historial de Parejas?'
                      : '¿Borrar historial Individual?'
                    : confirmClearType === 'all'
                    ? 'Delete all match history?'
                    : confirmClearType === 'teams'
                    ? 'Delete Teams match history?'
                    : 'Delete Individual match history?'}
                </h3>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  {lang === 'es'
                    ? confirmClearType === 'all'
                      ? 'Esta acción eliminará todas las partidas guardadas en la copa de manera permanente.'
                      : 'Esta acción eliminará las partidas de esta categoría guardadas en la copa permanentemente.'
                    : 'This action will permanently delete the saved match records from the trophy history.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmClearType(null)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs border border-stone-700 transition-all cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                id="btn-confirm-clear-history-action"
                onClick={() => {
                  onClearHistory(confirmClearType === 'all' ? undefined : confirmClearType);
                  setConfirmClearType(null);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-black text-xs transition-all shadow-lg shadow-red-950/50 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {lang === 'es'
                    ? confirmClearType === 'all'
                      ? 'Sí, borrar todo'
                      : 'Sí, borrar'
                    : confirmClearType === 'all'
                    ? 'Yes, delete all'
                    : 'Yes, delete'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Single Match */}
      {confirmDeleteMatchId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={(e) => {
            e.stopPropagation();
            setConfirmDeleteMatchId(null);
          }}
        >
          <div
            className="bg-stone-900 border border-stone-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 flex-shrink-0 mt-0.5">
                <Trash2 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-stone-100">
                  {lang === 'es' ? '¿Eliminar partida?' : 'Delete match?'}
                </h3>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  {lang === 'es'
                    ? '¿Seguro que deseas eliminar esta partida del historial?'
                    : 'Are you sure you want to remove this match from history?'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteMatchId(null)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs border border-stone-700 transition-all cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                id="btn-confirm-delete-single-match"
                onClick={() => {
                  if (confirmDeleteMatchId) {
                    onDeleteMatch(confirmDeleteMatchId);
                  }
                  setConfirmDeleteMatchId(null);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-black text-xs transition-all shadow-lg shadow-red-950/50 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{lang === 'es' ? 'Eliminar' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
