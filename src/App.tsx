import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ScoreHeader } from './components/ScoreHeader';
import { ScoreBoard } from './components/ScoreBoard';
import { RoundHistory } from './components/RoundHistory';
import { AddRoundModal } from './components/AddRoundModal';
import { TrancaCalculatorModal } from './components/TrancaCalculatorModal';
import { TurnTimerModal } from './components/TurnTimerModal';
import { SettingsModal } from './components/SettingsModal';
import { MatchHistoryModal } from './components/MatchHistoryModal';
import { VictoryModal } from './components/VictoryModal';
import { MusicPlayerModal, CURATED_DOMINO_YOUTUBE_TRACKS } from './components/MusicPlayerModal';
import { MiniMusicPlayer } from './components/MiniMusicPlayer';
import { AppBackground } from './components/AppBackground';
import {
  SILENT_AUDIO_DATA_URI,
  syncMediaSession,
  getNextTrack,
  getPrevTrack,
} from './utils/backgroundAudio';
import {
  AppLanguage,
  TRANSLATIONS,
  resolveActiveLanguage,
  formatPlayerDisplayName,
} from './utils/i18n';
import {
  AppBackgroundTheme,
  GameSettings,
  PlayerScore,
  Round,
  WinReason,
  PastMatch,
  MusicTrack,
  MusicHistoryItem,
  GameMode,
} from './types';
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  loadBackgroundTheme,
  saveBackgroundTheme,
  loadActiveGame,
  saveActiveGame,
  clearActiveGame,
  loadMatchHistory,
  savePastMatch,
  deletePastMatch,
  clearMatchHistory,
  loadCustomTracks,
  saveCustomTracks,
  loadMusicHistory,
  recordSongPlay,
  deleteSongFromHistory,
  clearMusicHistory,
  loadMusicAutoplay,
  saveMusicAutoplay,
  ActiveGameState,
} from './utils/storage';
import {
  playScoreAddedSound,
  playUndoSound,
  playTileClickSound,
  triggerVibration,
} from './utils/sound';
import { requestScreenWakeLock, releaseScreenWakeLock } from './utils/wakeLock';
import { Calculator, Timer, Trophy, Music, Check, RotateCcw, Volume2, VolumeX } from 'lucide-react';

const TEAM_COLORS = ['#10b981', '#f59e0b', '#38bdf8', '#ec4899'];

function createInitialPlayers(settings: GameSettings): PlayerScore[] {
  if (settings.gameMode === 'teams') {
    let p1Name = settings.team1Name || settings.team1Members?.[0] || 'Jugador 1';
    if (p1Name.includes('&')) p1Name = p1Name.split('&')[0].trim();
    if (!p1Name || p1Name === 'Nosotros' || p1Name === 'Equipo 1') p1Name = 'Jugador 1';

    let p2Name = settings.team2Name || settings.team2Members?.[0] || 'Jugador 2';
    if (p2Name.includes('&')) p2Name = p2Name.split('&')[0].trim();
    if (!p2Name || p2Name === 'Ellos' || p2Name === 'Equipo 2' || p2Name === 'Jugador 3' || p2Name === 'Jugador 4') {
      p2Name = 'Jugador 2';
    }

    return [
      {
        id: 'team_1',
        name: p1Name,
        color: TEAM_COLORS[0],
        score: 0,
        handsWon: 0,
        members: [p1Name],
      },
      {
        id: 'team_2',
        name: p2Name,
        color: TEAM_COLORS[1],
        score: 0,
        handsWon: 0,
        members: [p2Name],
      },
    ];
  } else {
    return settings.individualPlayerNames.map((name, idx) => ({
      id: `player_${idx + 1}`,
      name: name || `Jugador ${idx + 1}`,
      color: TEAM_COLORS[idx % TEAM_COLORS.length],
      score: 0,
      handsWon: 0,
    }));
  }
}

export default function App() {
  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());
  const isVibrationActive = Boolean(settings.soundEnabled && settings.vibrationEnabled);

  // Language state initialized with automatic phone/device language detection
  const [lang, setLang] = useState<AppLanguage>(() => {
    const currentSettings = loadSettings();
    return resolveActiveLanguage(currentSettings.languageSetting);
  });
  const t = TRANSLATIONS[lang];

  // Background Theme state with immediate localStorage persistence
  const [backgroundTheme, setBackgroundTheme] = useState<AppBackgroundTheme>(() => {
    const currentSettings = loadSettings();
    return currentSettings.backgroundTheme || loadBackgroundTheme();
  });

  const handleSelectBackgroundTheme = useCallback((theme: AppBackgroundTheme) => {
    setBackgroundTheme(theme);
    saveBackgroundTheme(theme);
    setSettings((prev) => {
      const updated = { ...prev, backgroundTheme: theme };
      saveSettings(updated);
      return updated;
    });
  }, []);

  // Synchronize document lang attribute for accessibility and SEO
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const handleLanguageChange = useCallback((newLang: AppLanguage) => {
    setLang(newLang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLang;
    }
  }, []);

  const [players, setPlayers] = useState<PlayerScore[]>(() => {
    const saved = loadActiveGame();
    const currentSettings = loadSettings();
    if (saved && saved.players && saved.players.length > 0) {
      return saved.players.map((p) => {
        if (p.id === 'team_1' || p.id === 'team-1') {
          let name = p.name;
          if (!name || name === 'Nosotros' || name === 'Equipo 1' || name.includes('&')) {
            name = p.members?.[0] || currentSettings.team1Name || 'Jugador 1';
            if (name.includes('&')) name = name.split('&')[0].trim();
          }
          const finalName = name || 'Jugador 1';
          return { ...p, id: 'team_1', name: finalName, members: [finalName] };
        }
        if (p.id === 'team_2' || p.id === 'team-2') {
          let name = p.name;
          if (!name || name === 'Ellos' || name === 'Equipo 2' || name.includes('&')) {
            name = p.members?.[0] || currentSettings.team2Name || 'Jugador 2';
            if (name.includes('&')) name = name.split('&')[0].trim();
          }
          if (name === 'Jugador 3' || name === 'Jugador 4' || !name) name = 'Jugador 2';
          const finalName = name;
          return { ...p, id: 'team_2', name: finalName, members: [finalName] };
        }
        return p;
      });
    }
    return createInitialPlayers(currentSettings);
  });

  const [rounds, setRounds] = useState<Round[]>(() => {
    const saved = loadActiveGame();
    return saved?.rounds ?? [];
  });

  const [startTime, setStartTime] = useState<number>(() => {
    const saved = loadActiveGame();
    return saved?.startTime ?? Date.now();
  });

  const [matchOver, setMatchOver] = useState<boolean>(() => {
    const saved = loadActiveGame();
    return saved?.matchOver ?? false;
  });

  const [winnerId, setWinnerId] = useState<string | null>(() => {
    const saved = loadActiveGame();
    return saved?.winnerId ?? null;
  });

  const [pastMatches, setPastMatches] = useState<PastMatch[]>(() => loadMatchHistory());

  // Modal Visibility States
  const [isAddRoundOpen, setIsAddRoundOpen] = useState(false);
  const [activeAddRoundPlayerId, setActiveAddRoundPlayerId] = useState<string | undefined>();
  const [isTrancaCalcOpen, setIsTrancaCalcOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isVictoryOpen, setIsVictoryOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [musicModalTab, setMusicModalTab] = useState<'search' | 'curated' | 'add' | 'stations'>('search');

  // Music Player States
  const [currentMusicTrack, setCurrentMusicTrack] = useState<MusicTrack | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.7);
  const [preMuteVolume, setPreMuteVolume] = useState(0.7);
  const [musicCurrentTime, setMusicCurrentTime] = useState(0);
  const [musicDuration, setMusicDuration] = useState(0);
  const [customTracks, setCustomTracks] = useState<MusicTrack[]>(() => loadCustomTracks());
  const [musicHistory, setMusicHistory] = useState<MusicHistoryItem[]>(() => loadMusicHistory());
  const [activePlaylist, setActivePlaylist] = useState<MusicTrack[]>(() => {
    const h = loadMusicHistory();
    if (h && h.length > 0) return h.map((item) => item.track);
    return CURATED_DOMINO_YOUTUBE_TRACKS;
  });
  const [isMusicAutoplay, setIsMusicAutoplay] = useState<boolean>(() => loadMusicAutoplay());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playNextTrackRef = useRef<() => void>(() => {});
  const isAutoplayRef = useRef<boolean>(isMusicAutoplay);

  useEffect(() => {
    isAutoplayRef.current = isMusicAutoplay;
  }, [isMusicAutoplay]);

  // Initialize and manage audio element
  useEffect(() => {
    const audio = new Audio();
    audio.volume = musicVolume;

    const onTimeUpdate = () => {
      setMusicCurrentTime(audio.currentTime);
      setMusicDuration(audio.duration || 0);
    };

    const onEnded = () => {
      setMusicCurrentTime(0);
      // Auto-reproducir la siguiente canción automáticamente si Autoplay está activo
      if (isAutoplayRef.current) {
        playNextTrackRef.current();
      } else {
        setIsMusicPlaying(false);
      }
    };

    const onError = () => {
      setIsMusicPlaying(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audioRef.current = null;
    };
  }, []);

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    const state: ActiveGameState = {
      players,
      rounds,
      startTime,
      matchOver,
      winnerId,
    };
    saveActiveGame(state);
  }, [players, rounds, startTime, matchOver, winnerId]);

  // Sync settings to localStorage
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Screen Wake Lock: mantener pantalla activa o permitir que se apague
  useEffect(() => {
    if (settings.keepScreenAwake ?? true) {
      requestScreenWakeLock();
    } else {
      releaseScreenWakeLock();
    }
  }, [settings.keepScreenAwake]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Active winner player object
  const winnerPlayer = useMemo(() => {
    if (!winnerId) return null;
    return players.find((p) => p.id === winnerId) || null;
  }, [winnerId, players]);

  // Recalculate scores & hands won from a list of rounds
  const calculatePlayerStatsFromRounds = useCallback((
    basePlayers: PlayerScore[],
    roundList: Round[]
  ): PlayerScore[] => {
    const scoresMap: Record<string, number> = {};
    const handsWonMap: Record<string, number> = {};

    basePlayers.forEach((p) => {
      scoresMap[p.id] = 0;
      handsWonMap[p.id] = 0;
    });

    roundList.forEach((r) => {
      scoresMap[r.winnerId] = (scoresMap[r.winnerId] || 0) + r.points;
      handsWonMap[r.winnerId] = (handsWonMap[r.winnerId] || 0) + 1;
    });

    return basePlayers.map((p) => ({
      ...p,
      score: scoresMap[p.id] ?? 0,
      handsWon: handsWonMap[p.id] ?? 0,
    }));
  }, []);

  // Save a new round
  const handleSaveRound = (
    roundWinnerId: string,
    points: number,
    reason: WinReason,
    notes?: string,
    winnerPlayerName?: string
  ) => {
    if (points < 0) return;

    // Calculate new running score for winner
    const updatedPlayers = players.map((p) => {
      if (p.id === roundWinnerId) {
        return {
          ...p,
          score: p.score + points,
          handsWon: p.handsWon + 1,
        };
      }
      return p;
    });

    const newSnapshot: Record<string, number> = {};
    updatedPlayers.forEach((p) => {
      newSnapshot[p.id] = p.score;
    });

    const newRound: Round = {
      id: `round_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      roundNumber: rounds.length + 1,
      winnerId: roundWinnerId,
      winnerPlayerName,
      points,
      reason,
      notes,
      timestamp: Date.now(),
      scoresSnapshot: newSnapshot,
    };

    const newRounds = [...rounds, newRound];
    setRounds(newRounds);
    setPlayers(updatedPlayers);

    playScoreAddedSound(settings.soundEnabled);
    triggerVibration(isVibrationActive, [40, 20, 60]);

    // Check if winner reached or surpassed target score
    const winningCandidate = updatedPlayers.find((p) => p.score >= settings.targetScore);
    if (winningCandidate) {
      setMatchOver(true);
      setWinnerId(winningCandidate.id);
      setIsVictoryOpen(true);

      // Save match to past match history
      const finalScoresList = updatedPlayers.map((p) => ({
        name: p.name,
        score: p.score,
        color: p.color,
        members: p.members,
      }));

      const team1 = updatedPlayers.find((p) => p.id === 'team_1');
      const team2 = updatedPlayers.find((p) => p.id === 'team_2');

      const pastMatch: PastMatch = {
        id: `match_${Date.now()}`,
        date: new Date().toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
        timestamp: Date.now(),
        gameMode: settings.gameMode,
        targetScore: settings.targetScore,
        winnerName: winningCandidate.name,
        winnerColor: winningCandidate.color,
        finalScores: finalScoresList,
        totalRounds: newRounds.length,
        durationMinutes: Math.max(1, Math.round((Date.now() - startTime) / 60000)),
        team1Members: settings.gameMode === 'teams' ? team1?.members : undefined,
        team2Members: settings.gameMode === 'teams' ? team2?.members : undefined,
        rounds: newRounds,
      };

      savePastMatch(pastMatch);
      setPastMatches((prev) => [pastMatch, ...prev.filter((m) => m.id !== pastMatch.id)]);
    }
  };

  // Quick action from scoreboard: opens add round modal for a specific player
  const handleOpenAddRoundForPlayer = (playerId: string) => {
    playTileClickSound(settings.soundEnabled);
    setActiveAddRoundPlayerId(playerId);
    setIsAddRoundOpen(true);
  };

  // Undo last round
  const handleUndoLastRound = () => {
    if (rounds.length === 0) return;
    playUndoSound(settings.soundEnabled);
    triggerVibration(isVibrationActive, 30);

    const remainingRounds = rounds.slice(0, -1);
    const updatedPlayers = calculatePlayerStatsFromRounds(players, remainingRounds);

    setRounds(remainingRounds);
    setPlayers(updatedPlayers);

    // If match was over, re-evaluate
    const hasWinner = updatedPlayers.some((p) => p.score >= settings.targetScore);
    if (!hasWinner) {
      setMatchOver(false);
      setWinnerId(null);
    }
  };

  // Delete a specific round by id
  const handleDeleteRound = (roundId: string) => {
    playUndoSound(settings.soundEnabled);
    triggerVibration(isVibrationActive, 30);

    const filtered = rounds.filter((r) => r.id !== roundId);
    // Re-index round numbers
    const reindexed = filtered.map((r, idx) => ({
      ...r,
      roundNumber: idx + 1,
    }));

    const updatedPlayers = calculatePlayerStatsFromRounds(players, reindexed);

    // Rebuild snapshots
    let runningScores: Record<string, number> = {};
    players.forEach((p) => (runningScores[p.id] = 0));

    const finalRounds = reindexed.map((r) => {
      runningScores[r.winnerId] = (runningScores[r.winnerId] || 0) + r.points;
      return {
        ...r,
        scoresSnapshot: { ...runningScores },
      };
    });

    setRounds(finalRounds);
    setPlayers(updatedPlayers);

    const hasWinner = updatedPlayers.some((p) => p.score >= settings.targetScore);
    if (!hasWinner) {
      setMatchOver(false);
      setWinnerId(null);
    }
  };

  // Reset / New Game: abre la confirmación para borrar nombres y puntos a cero
  const handleNewGame = () => {
    playTileClickSound(settings.soundEnabled);
    setIsResetConfirmOpen(true);
  };

  // Confirm Reset: borra tanto los nombres de los jugadores como los puntos a cero
  const confirmResetGame = () => {
    playTileClickSound(settings.soundEnabled);
    triggerVibration(isVibrationActive, 40);
    clearActiveGame();
    setRounds([]);
    setMatchOver(false);
    setWinnerId(null);
    setStartTime(Date.now());

    // Restablecer nombres registrados a valores por defecto (Jugador 1 y Jugador 2)
    const resetSettings: GameSettings = {
      ...settings,
      team1Name: 'Jugador 1',
      team2Name: 'Jugador 2',
      team1Members: ['Jugador 1'],
      team2Members: ['Jugador 2'],
      individualPlayerNames: ['Jugador 1', 'Jugador 2', 'Jugador 3', 'Jugador 4'],
    };
    setSettings(resetSettings);
    saveSettings(resetSettings);

    // Recrear jugadores con nombres iniciales y 0 puntos
    const freshPlayers = createInitialPlayers(resetSettings);
    setPlayers(freshPlayers);

    setIsResetConfirmOpen(false);
    setToastMessage(
      lang === 'es'
        ? 'Partida reiniciada: nombres y puntos a cero'
        : 'Game reset: names and scores to zero'
    );
  };

  // Rematch after victory
  const handleRematch = () => {
    playTileClickSound(settings.soundEnabled);
    setIsVictoryOpen(false);
    setRounds([]);
    setMatchOver(false);
    setWinnerId(null);
    setStartTime(Date.now());
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        score: 0,
        handsWon: 0,
      }))
    );
  };

  // Open settings from victory modal
  const handleNewGameSetup = () => {
    setIsVictoryOpen(false);
    setIsSettingsOpen(true);
  };

  // Update a single player's name inline
  const handleUpdatePlayerName = (playerId: string, newName: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, name: newName, members: [newName] } : p))
    );
    // Also sync with settings
    if (settings.gameMode === 'teams') {
      if (playerId === 'team_1' || playerId === 'team-1') {
        setSettings((s) => ({ ...s, team1Name: newName, team1Members: [newName] }));
      } else if (playerId === 'team_2' || playerId === 'team-2') {
        setSettings((s) => ({ ...s, team2Name: newName, team2Members: [newName] }));
      }
    }
  };

  // Update members for a team
  const handleUpdatePlayerMembers = (playerId: string, members: string[]) => {
    const singleName = members[0] || (playerId === 'team_1' ? 'Jugador 1' : 'Jugador 2');
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId ? { ...p, name: singleName, members: [singleName] } : p
      )
    );
    // Also sync with settings
    if (playerId === 'team_1' || playerId === 'team-1') {
      setSettings((s) => ({ ...s, team1Name: singleName, team1Members: [singleName] }));
    } else if (playerId === 'team_2' || playerId === 'team-2') {
      setSettings((s) => ({ ...s, team2Name: singleName, team2Members: [singleName] }));
    }
  };

  // Apply tranca points from calculator
  const handleApplyTrancaPoints = (
    trancaWinnerId: string,
    points: number,
    notes: string
  ) => {
    handleSaveRound(trancaWinnerId, points, 'tranca', notes);
  };

  // Save modified settings
  const handleSaveSettings = (newSettings: GameSettings, shouldResetGame: boolean) => {
    setSettings(newSettings);
    if (newSettings.backgroundTheme) {
      setBackgroundTheme(newSettings.backgroundTheme);
      saveBackgroundTheme(newSettings.backgroundTheme);
    }

    const modeChanged = newSettings.gameMode !== settings.gameMode;
    const countChanged =
      newSettings.gameMode === 'individual' &&
      newSettings.individualPlayerNames.length !== players.length;

    if (shouldResetGame || modeChanged || countChanged) {
      // Re-initialize players completely
      const newPlayers = createInitialPlayers(newSettings);
      setPlayers(newPlayers);
      setRounds([]);
      setMatchOver(false);
      setWinnerId(null);
      setStartTime(Date.now());
      clearActiveGame();
    } else {
      // Update team names and members in existing players while preserving current points
      setPlayers((prev) => {
        if (newSettings.gameMode === 'teams') {
          return prev.map((p) => {
            if (p.id === 'team_1') {
              return {
                ...p,
                name: newSettings.team1Name,
                members: newSettings.team1Members || p.members,
              };
            }
            if (p.id === 'team_2') {
              return {
                ...p,
                name: newSettings.team2Name,
                members: newSettings.team2Members || p.members,
              };
            }
            return p;
          });
        } else {
          return prev.map((p, idx) => ({
            ...p,
            name: newSettings.individualPlayerNames[idx] || p.name,
          }));
        }
      });
    }
  };

  // Toggle sound
  const handleToggleSound = () => {
    setSettings((prev) => {
      const nextSound = !prev.soundEnabled;
      const updated = {
        ...prev,
        soundEnabled: nextSound,
        vibrationEnabled: nextSound ? prev.vibrationEnabled : false,
      };
      saveSettings(updated);
      return updated;
    });
  };

  // Toggle Screen Wake Lock (mantener pantalla activa o permitir reposo)
  const handleToggleScreenAwake = async () => {
    const nextAwake = !(settings.keepScreenAwake ?? true);
    setSettings((prev) => {
      const updated = {
        ...prev,
        keepScreenAwake: nextAwake,
      };
      saveSettings(updated);
      return updated;
    });

    if (nextAwake) {
      await requestScreenWakeLock();
      if (settings.soundEnabled) playTileClickSound();
      if (settings.vibrationEnabled) triggerVibration(true, 30);
      setToastMessage(t.screenAwakeActiveNotice);
    } else {
      await releaseScreenWakeLock();
      if (settings.soundEnabled) playTileClickSound();
      setToastMessage(t.screenAwakeInactiveNotice);
    }
  };

  // History Handlers
  const handleManualSaveMatch = () => {
    if (rounds.length === 0) {
      setToastMessage(
        lang === 'es'
          ? 'Anota al menos una mano para poder archivar la partida.'
          : 'Score at least one hand to archive the match.'
      );
      return;
    }

    const sorted = [...players].sort((a, b) => b.score - a.score);
    const leader = sorted[0];

    const finalScoresList = players.map((p) => ({
      name: p.name,
      score: p.score,
      color: p.color,
      members: p.members,
    }));

    const team1 = players.find((p) => p.id === 'team_1');
    const team2 = players.find((p) => p.id === 'team_2');

    const pastMatch: PastMatch = {
      id: `match_${Date.now()}`,
      date: new Date().toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      timestamp: Date.now(),
      gameMode: settings.gameMode,
      targetScore: settings.targetScore,
      winnerName: leader.name,
      winnerColor: leader.color,
      finalScores: finalScoresList,
      totalRounds: rounds.length,
      durationMinutes: Math.max(1, Math.round((Date.now() - startTime) / 60000)),
      team1Members: settings.gameMode === 'teams' ? team1?.members : undefined,
      team2Members: settings.gameMode === 'teams' ? team2?.members : undefined,
      rounds: [...rounds],
    };

    savePastMatch(pastMatch);
    setPastMatches((prev) => [pastMatch, ...prev.filter((m) => m.id !== pastMatch.id)]);
    setToastMessage(
      lang === 'es'
        ? '¡Partida archivada con éxito en el historial!'
        : 'Match archived to history successfully!'
    );
  };

  const handleDeletePastMatch = (matchId: string) => {
    playUndoSound(settings.soundEnabled);
    triggerVibration(isVibrationActive, 30);
    deletePastMatch(matchId);
    setPastMatches((prev) => prev.filter((m) => m.id !== matchId));
    setToastMessage(
      lang === 'es' ? 'Partida eliminada del historial' : 'Match deleted from history'
    );
  };

  const handleClearMatchHistory = (mode?: GameMode) => {
    playUndoSound(settings.soundEnabled);
    triggerVibration(isVibrationActive, [30, 30]);
    clearMatchHistory(mode);
    if (!mode) {
      setPastMatches([]);
    } else {
      setPastMatches((prev) => prev.filter((m) => m.gameMode !== mode));
    }
    setToastMessage(
      lang === 'es'
        ? mode
          ? 'Historial de la categoría borrado'
          : 'Historial de la copa borrado completamente'
        : mode
        ? 'Category history cleared'
        : 'All trophy history cleared completely'
    );
  };

  // Music Handlers
  const handleSelectMusicTrack = useCallback(
    (track: MusicTrack, playlistContext?: MusicTrack[]) => {
      setCurrentMusicTrack(track);

      if (playlistContext && playlistContext.length > 0) {
        setActivePlaylist(playlistContext);
      }

      // Grabar automáticamente la canción que se va escuchando en el historial
      const updatedHistory = recordSongPlay(track);
      setMusicHistory(updatedHistory);

      if (track.sourceType === 'youtube') {
        if (audioRef.current) {
          // Reproducir carrier de audio silencioso para mantener activa la sesión multimedia del sistema operativo
          // Esto previene que Android o iOS suspendan o detengan el proceso web cuando se cambia de app o se bloquea la pantalla.
          audioRef.current.src = SILENT_AUDIO_DATA_URI;
          audioRef.current.loop = true;
          audioRef.current.play().catch(() => {});
        }
        setIsMusicPlaying(true);
      } else {
        if (audioRef.current) {
          audioRef.current.loop = false;
          audioRef.current.src = track.url;
          audioRef.current
            .play()
            .then(() => setIsMusicPlaying(true))
            .catch((err) => {
              console.warn('Playback notice:', err);
              setIsMusicPlaying(false);
            });
        }
      }
    },
    []
  );

  const effectivePlaylist = useMemo(() => {
    if (activePlaylist && activePlaylist.length > 0) return activePlaylist;
    const historyTracks = musicHistory.map((item) => item.track);
    if (historyTracks.length > 0) return historyTracks;
    return CURATED_DOMINO_YOUTUBE_TRACKS;
  }, [activePlaylist, musicHistory]);

  const handlePlayNextTrack = useCallback(() => {
    const next = getNextTrack(
      currentMusicTrack,
      effectivePlaylist,
      CURATED_DOMINO_YOUTUBE_TRACKS,
      customTracks
    );
    if (next) {
      handleSelectMusicTrack(next, effectivePlaylist);
    }
  }, [currentMusicTrack, effectivePlaylist, customTracks, handleSelectMusicTrack]);

  const handlePlayPrevTrack = useCallback(() => {
    const prev = getPrevTrack(
      currentMusicTrack,
      effectivePlaylist,
      CURATED_DOMINO_YOUTUBE_TRACKS,
      customTracks
    );
    if (prev) {
      handleSelectMusicTrack(prev, effectivePlaylist);
    }
  }, [currentMusicTrack, effectivePlaylist, customTracks, handleSelectMusicTrack]);

  // Keep playNextTrackRef in sync with the latest handlePlayNextTrack callback
  useEffect(() => {
    playNextTrackRef.current = handlePlayNextTrack;
  }, [handlePlayNextTrack]);

  const handleCloseMusicPlayer = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsMusicPlaying(false);
    setCurrentMusicTrack(null);
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = 'none';
        navigator.mediaSession.metadata = null;
      } catch {}
    }
  }, []);

  const handleDeleteMusicHistoryItem = (songId: string) => {
    const updated = deleteSongFromHistory(songId);
    setMusicHistory(updated);
  };

  const handleClearMusicHistory = () => {
    clearMusicHistory();
    setMusicHistory([]);
    setToastMessage(
      lang === 'es' ? 'Historial de música borrado' : 'Music history cleared'
    );
  };

  const handleToggleAutoplay = useCallback(() => {
    setIsMusicAutoplay((prev) => {
      const next = !prev;
      saveMusicAutoplay(next);
      setToastMessage(
        lang === 'es'
          ? next
            ? 'Autoplay activado: Pasa automáticamente a la siguiente canción solo en el celular.'
            : 'Autoplay desactivado: La música se detendrá al terminar la canción.'
          : next
            ? 'Autoplay ON: Plays next song automatically on mobile.'
            : 'Autoplay OFF: Playback stops when track finishes.'
      );
      return next;
    });
  }, [lang]);

  const handleToggleMusicPlay = useCallback(() => {
    if (!currentMusicTrack) {
      setIsMusicModalOpen(true);
      return;
    }

    if (currentMusicTrack.sourceType === 'youtube') {
      setIsMusicPlaying((prev) => {
        const nextState = !prev;
        if (nextState) {
          if (audioRef.current) {
            audioRef.current.src = SILENT_AUDIO_DATA_URI;
            audioRef.current.loop = true;
            audioRef.current.play().catch(() => {});
          }
        } else {
          if (audioRef.current) {
            audioRef.current.pause();
          }
        }
        return nextState;
      });
    } else if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      } else {
        audioRef.current
          .play()
          .then(() => setIsMusicPlaying(true))
          .catch((err) => console.warn(err));
      }
    }
  }, [currentMusicTrack, isMusicPlaying]);

  // Sincronizar con la API Media Session del sistema operativo (pantalla de bloqueo, barra de notificaciones de Android/iOS)
  useEffect(() => {
    syncMediaSession({
      track: currentMusicTrack,
      isPlaying: isMusicPlaying,
      onPlay: handleToggleMusicPlay,
      onPause: handleToggleMusicPlay,
      onNext: handlePlayNextTrack,
      onPrev: handlePlayPrevTrack,
      onStop: handleCloseMusicPlayer,
    });
  }, [
    currentMusicTrack,
    isMusicPlaying,
    handleToggleMusicPlay,
    handlePlayNextTrack,
    handlePlayPrevTrack,
    handleCloseMusicPlayer,
  ]);

  const handleMusicVolumeChange = (newVol: number) => {
    const clamped = Math.max(0, Math.min(1, Math.round(newVol * 100) / 100));
    setMusicVolume(clamped);
    if (clamped > 0) {
      setPreMuteVolume(clamped);
    }
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  };

  const handleToggleMute = () => {
    if (musicVolume > 0) {
      // Guardar el nivel exacto antes de silenciar
      setPreMuteVolume(musicVolume);
      setMusicVolume(0);
      if (audioRef.current) {
        audioRef.current.volume = 0;
      }
    } else {
      // Restaurar exactamente al nivel previo donde el usuario lo tenía
      const restored = preMuteVolume > 0 ? preMuteVolume : 0.7;
      setMusicVolume(restored);
      if (audioRef.current) {
        audioRef.current.volume = restored;
      }
    }
  };

  const handleAddCustomTrack = (track: MusicTrack) => {
    const updated = [track, ...customTracks];
    setCustomTracks(updated);
    saveCustomTracks(updated);
  };

  const handleDeleteCustomTrack = (trackId: string) => {
    const updated = customTracks.filter((t) => t.id !== trackId);
    setCustomTracks(updated);
    saveCustomTracks(updated);
  };

  return (
    <div className="relative min-h-screen text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Capa de fondo con 5 temas visuales y overlay de alto contraste */}
      <AppBackground theme={backgroundTheme} />

      {/* Top Header */}
      <ScoreHeader
        targetScore={settings.targetScore}
        gameMode={settings.gameMode}
        soundEnabled={settings.soundEnabled}
        isMusicPlaying={isMusicPlaying}
        lang={lang}
        isScreenAwake={settings.keepScreenAwake ?? true}
        onToggleSound={handleToggleSound}
        onToggleScreenAwake={handleToggleScreenAwake}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTrancaCalc={() => setIsTrancaCalcOpen(true)}
        onOpenTimer={() => setIsTimerOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenMusic={() => {
          setMusicModalTab('search');
          setIsMusicModalOpen(true);
        }}
        onOpenAddRound={() => {
          setActiveAddRoundPlayerId(undefined);
          setIsAddRoundOpen(true);
        }}
        onNewGame={handleNewGame}
        roundsCount={rounds.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-1.5 sm:px-5 landscape:px-2.5 pt-1 sm:pt-2 pb-28 sm:pb-16 landscape:pb-16 space-y-2.5 sm:space-y-3.5 landscape:space-y-2">
        {/* Score Board Cards */}
        <ScoreBoard
          key={startTime}
          players={players}
          targetScore={settings.targetScore}
          lang={lang}
          onAddRoundForPlayer={handleOpenAddRoundForPlayer}
          onUpdatePlayerName={handleUpdatePlayerName}
          onUpdatePlayerMembers={handleUpdatePlayerMembers}
        />


        {/* Round History Table */}
        <RoundHistory
          rounds={rounds}
          players={players}
          lang={lang}
          onUndoLastRound={handleUndoLastRound}
          onDeleteRound={handleDeleteRound}
        />
      </main>

      {/* Persistent Mini Music Player Bar (always mounted with minimal accessible 1px iframe so mobile Android initializes playback without block) */}
      <MiniMusicPlayer
        track={currentMusicTrack || CURATED_DOMINO_YOUTUBE_TRACKS[0]}
        isVisible={!!currentMusicTrack}
        playlist={effectivePlaylist}
        onTrackAutoAdvanced={handleSelectMusicTrack}
        isPlaying={isMusicPlaying}
        volume={musicVolume}
        currentTime={musicCurrentTime}
        duration={musicDuration}
        onTogglePlay={handleToggleMusicPlay}
        onVolumeChange={handleMusicVolumeChange}
        onToggleMute={handleToggleMute}
        onOpenFullPlayer={() => setIsMusicModalOpen(true)}
        onClosePlayer={handleCloseMusicPlayer}
        onNextTrack={handlePlayNextTrack}
        onPrevTrack={handlePlayPrevTrack}
        isAutoplay={isMusicAutoplay}
        onToggleAutoplay={handleToggleAutoplay}
        isModalOpen={isMusicModalOpen}
        lang={lang}
      />

      {/* Bottom Sticky Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/75 backdrop-blur-md border-t border-slate-700/60 px-2 sm:px-4 py-2 flex items-center justify-around sm:justify-center sm:gap-10 shadow-2xl">
        <button
          id="btn-bottom-tranca-calc"
          onClick={() => setIsTrancaCalcOpen(true)}
          className="flex flex-col items-center gap-1 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer min-w-[50px]"
        >
          <Calculator className="w-5 h-5" />
          <span className="text-[10px] font-medium">{t.trancaCalc}</span>
        </button>

        <button
          id="btn-bottom-timer"
          onClick={() => setIsTimerOpen(true)}
          className="flex flex-col items-center gap-1 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer min-w-[50px]"
        >
          <Timer className="w-5 h-5" />
          <span className="text-[10px] font-medium">{t.turnTimer}</span>
        </button>

        {/* Boton de Bocina / Sonido */}
        <button
          id="btn-bottom-sound"
          onClick={handleToggleSound}
          title={
            settings.soundEnabled
              ? (lang === 'es' ? 'Silenciar sonidos' : 'Mute sounds')
              : (lang === 'es' ? 'Activar sonidos' : 'Enable sounds')
          }
          className={`flex flex-col items-center gap-1 transition-colors cursor-pointer min-w-[50px] ${
            settings.soundEnabled
              ? 'text-sky-400 hover:text-sky-300'
              : 'text-stone-500 hover:text-stone-300'
          }`}
        >
          {settings.soundEnabled ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
          <span className="text-[10px] font-medium">
            {settings.soundEnabled
              ? (lang === 'es' ? 'Sonido' : 'Sound')
              : (lang === 'es' ? 'Silencio' : 'Muted')}
          </span>
        </button>

        <button
          id="btn-bottom-music"
          onClick={() => {
            setMusicModalTab('curated');
            setIsMusicModalOpen(true);
          }}
          className={`flex flex-col items-center gap-1 cursor-pointer min-w-[50px] ${
            isMusicPlaying ? 'text-amber-400' : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Music className={`w-5 h-5 ${isMusicPlaying ? 'animate-bounce' : ''}`} />
          <span className="text-[10px] font-medium">{t.music}</span>
        </button>

        <button
          id="btn-bottom-history"
          onClick={() => setIsHistoryOpen(true)}
          className="flex flex-col items-center gap-1 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer min-w-[50px]"
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[10px] font-medium">{t.matchHistory}</span>
        </button>
      </nav>

      {/* Modals */}
      <AddRoundModal
        isOpen={isAddRoundOpen}
        onClose={() => setIsAddRoundOpen(false)}
        players={players}
        defaultWinnerId={activeAddRoundPlayerId}
        roundNumber={rounds.length + 1}
        capicuaBonus={settings.capicuaBonus}
        soundEnabled={settings.soundEnabled}
        vibrationEnabled={isVibrationActive}
        lang={lang}
        onSaveRound={handleSaveRound}
        onUpdatePlayerMembers={handleUpdatePlayerMembers}
        onUpdatePlayerName={handleUpdatePlayerName}
      />

      <TrancaCalculatorModal
        isOpen={isTrancaCalcOpen}
        onClose={() => setIsTrancaCalcOpen(false)}
        players={players}
        trancaRule={settings.trancaRule}
        soundEnabled={settings.soundEnabled}
        vibrationEnabled={isVibrationActive}
        onApplyTrancaPoints={handleApplyTrancaPoints}
        lang={lang}
      />

      <TurnTimerModal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        defaultSeconds={settings.timerDurationSeconds}
        soundEnabled={settings.soundEnabled}
        vibrationEnabled={isVibrationActive}
        lang={lang}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSettings={settings}
        currentBackgroundTheme={backgroundTheme}
        onSelectBackgroundTheme={handleSelectBackgroundTheme}
        onSaveSettings={handleSaveSettings}
        lang={lang}
        onLanguageChange={handleLanguageChange}
      />

      <MatchHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        matches={pastMatches}
        onDeleteMatch={handleDeletePastMatch}
        onClearHistory={handleClearMatchHistory}
        canSaveCurrentGame={rounds.length > 0}
        onSaveCurrentGame={handleManualSaveMatch}
        currentPlayers={players}
        currentRounds={rounds}
        currentGameMode={settings.gameMode}
        targetScore={settings.targetScore}
        lang={lang}
      />

      <MusicPlayerModal
        isOpen={isMusicModalOpen}
        onClose={() => setIsMusicModalOpen(false)}
        currentTrack={currentMusicTrack}
        isPlaying={isMusicPlaying}
        volume={musicVolume}
        onSelectTrack={handleSelectMusicTrack}
        onTogglePlay={handleToggleMusicPlay}
        onVolumeChange={handleMusicVolumeChange}
        onToggleMute={handleToggleMute}
        onPlayNext={handlePlayNextTrack}
        onPlayPrev={handlePlayPrevTrack}
        isAutoplay={isMusicAutoplay}
        onToggleAutoplay={handleToggleAutoplay}
        customTracks={customTracks}
        onAddCustomTrack={handleAddCustomTrack}
        onDeleteCustomTrack={handleDeleteCustomTrack}
        initialTab={musicModalTab}
        lang={lang}
        musicHistory={musicHistory}
        onDeleteHistoryItem={handleDeleteMusicHistoryItem}
        onClearMusicHistory={handleClearMusicHistory}
      />

      <VictoryModal
        isOpen={isVictoryOpen}
        onClose={() => setIsVictoryOpen(false)}
        winner={winnerPlayer}
        players={players}
        rounds={rounds}
        targetScore={settings.targetScore}
        startTime={startTime}
        soundEnabled={settings.soundEnabled}
        onRematch={handleRematch}
        onNewGameSetup={handleNewGameSetup}
        onResetGame={handleNewGame}
        lang={lang}
      />

      {/* Reset Game Confirmation Dialog */}
      {isResetConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
                <RotateCcw className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-100">
                  {lang === 'es' ? '¿Reiniciar partida?' : 'Reset match?'}
                </h3>
                <p className="text-xs text-stone-400">
                  {lang === 'es'
                    ? 'Esta acción borrará tanto los nombres como los puntos a cero.'
                    : 'This action will reset both player names and scores to zero.'}
                </p>
              </div>
            </div>

            <div className="p-3 bg-stone-950/80 rounded-xl border border-stone-800/80 text-xs text-stone-300 space-y-1.5">
              <p className="font-semibold text-amber-400">
                {lang === 'es' ? 'Se restablecerá:' : 'Will be reset:'}
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-stone-400 text-[11px]">
                <li>
                  {lang === 'es'
                    ? 'Puntos y manos ganadas vuelven a 0'
                    : 'Points and hands won return to 0'}
                </li>
                <li>
                  {lang === 'es'
                    ? 'Nombres se restablecen a "Jugador 1" y "Jugador 2"'
                    : 'Names reset to "Player 1" and "Player 2"'}
                </li>
                <li>
                  {lang === 'es'
                    ? 'Se borran las rondas anotadas'
                    : 'Recorded rounds are cleared'}
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-750 active:bg-stone-700 text-stone-300 font-bold text-xs border border-stone-700 transition-all cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                id="btn-confirm-reset"
                onClick={confirmResetGame}
                className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-black text-xs transition-all shadow-lg shadow-amber-950/40 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{lang === 'es' ? 'Sí, reiniciar' : 'Yes, reset'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <aside
          aria-label="Notificación del sistema"
          aria-live="polite"
          className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-stone-950 font-black px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-3 duration-200 border border-amber-400/80 pointer-events-none"
        >
          <Check className="w-4 h-4 stroke-[3] flex-shrink-0" />
          <span>{toastMessage}</span>
        </aside>
      )}
    </div>
  );
}
