import { AppBackgroundTheme, GameMode, GameSettings, MusicHistoryItem, MusicTrack, PastMatch, PlayerScore, Round } from '../types';

const STORAGE_KEYS = {
  CURRENT_GAME: 'domino_current_game_v1',
  SETTINGS: 'domino_settings_v1',
  MATCH_HISTORY: 'domino_match_history_v1',
  CUSTOM_TRACKS: 'domino_custom_tracks_v1',
  MUSIC_HISTORY: 'domino_music_history_v1',
  BACKGROUND: 'domino_background_v1',
};

export const DEFAULT_SETTINGS: GameSettings = {
  targetScore: 100,
  gameMode: 'teams',
  team1Name: 'Jugador 1',
  team2Name: 'Jugador 2',
  team1Members: ['Jugador 1'],
  team2Members: ['Jugador 2'],
  individualPlayerNames: ['Jugador 1', 'Jugador 2', 'Jugador 3', 'Jugador 4'],
  trancaRule: 'sum_opponent', // sum_opponent: suma de todas las fichas de los rivales
  capicuaBonus: 25, // bonus opcional para capicúa si aplica
  soundEnabled: true,
  vibrationEnabled: true,
  timerDurationSeconds: 25,
  keepScreenAwake: true,
  languageSetting: 'auto',
  backgroundTheme: 'cielo-celeste-3d',
};

export interface ActiveGameState {
  players: PlayerScore[];
  rounds: Round[];
  startTime: number;
  matchOver: boolean;
  winnerId: string | null;
}

export function loadSettings(): GameSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);

    // Sanitize team 1 name to a single player name
    let team1Name = parsed.team1Name;
    if (!team1Name || team1Name === 'Nosotros' || team1Name === 'Equipo 1' || team1Name.includes('&')) {
      team1Name = parsed.team1Members?.[0] || 'Jugador 1';
      if (team1Name.includes('&')) {
        team1Name = team1Name.split('&')[0].trim() || 'Jugador 1';
      }
    }

    // Sanitize team 2 name to a single player name
    let team2Name = parsed.team2Name;
    if (!team2Name || team2Name === 'Ellos' || team2Name === 'Equipo 2' || team2Name.includes('&')) {
      team2Name = parsed.team2Members?.[0] || 'Jugador 2';
      if (team2Name.includes('&')) {
        team2Name = team2Name.split('&')[0].trim() || 'Jugador 2';
      }
      if (team2Name === 'Jugador 3' || team2Name === 'Jugador 4') {
        team2Name = 'Jugador 2';
      }
    }

    const team1Members = [team1Name];
    const team2Members = [team2Name];

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      team1Name,
      team2Name,
      team1Members,
      team2Members,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: GameSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    if (settings.backgroundTheme) {
      localStorage.setItem(STORAGE_KEYS.BACKGROUND, settings.backgroundTheme);
    }
  } catch {
    // Ignore storage quota errors
  }
}

export function loadBackgroundTheme(): AppBackgroundTheme {
  if (typeof window === 'undefined') return 'azul';
  try {
    const direct =
      (localStorage.getItem('domino_theme') as string | null) ||
      (localStorage.getItem(STORAGE_KEYS.BACKGROUND) as string | null);
    if (direct) {
      if (
        direct === 'azul' ||
        direct === 'verde' ||
        direct === 'rojo' ||
        direct === 'carbon' ||
        direct === 'purpura' ||
        direct === 'turquesa'
      ) {
        return direct;
      }
      // Backward compatibility mapping
      if (
        direct === 'azul-casino' ||
        direct === 'mesa-domino-icon' ||
        direct === 'cielo-celeste-3d' ||
        direct === 'cielo-estrellas'
      ) {
        return 'azul';
      }
      if (
        direct === 'verde-grama' ||
        direct === 'mesa-esmeralda-3d' ||
        direct === 'fieltro-verde'
      ) {
        return 'verde';
      }
      if (
        direct === 'rojo-jupiter' ||
        direct === 'galaxia-rubi-3d' ||
        direct === 'noche-elegante'
      ) {
        return 'rojo';
      }
      if (
        direct === 'negro-carbon' ||
        direct === 'neon-cyberpunk-3d' ||
        direct === 'fibra-carbono'
      ) {
        return 'carbon';
      }
      if (
        direct === 'purpura-galaxia' ||
        direct === 'ondas-azul-lavanda' ||
        direct === 'oro-imperial-3d' ||
        direct === 'madera-noble'
      ) {
        return 'purpura';
      }
      if (direct === 'turquesa-caribe') {
        return 'turquesa';
      }
    }
    const rawSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (rawSettings) {
      const parsed = JSON.parse(rawSettings);
      const th = parsed.backgroundTheme;
      if (
        th === 'azul' ||
        th === 'verde' ||
        th === 'rojo' ||
        th === 'carbon' ||
        th === 'purpura' ||
        th === 'turquesa'
      ) {
        return th;
      }
      if (
        th === 'azul-casino' ||
        th === 'mesa-domino-icon' ||
        th === 'cielo-celeste-3d' ||
        th === 'cielo-estrellas'
      ) {
        return 'azul';
      }
      if (
        th === 'verde-grama' ||
        th === 'mesa-esmeralda-3d' ||
        th === 'fieltro-verde'
      ) {
        return 'verde';
      }
      if (
        th === 'rojo-jupiter' ||
        th === 'galaxia-rubi-3d' ||
        th === 'noche-elegante'
      ) {
        return 'rojo';
      }
      if (
        th === 'negro-carbon' ||
        th === 'neon-cyberpunk-3d' ||
        th === 'fibra-carbono'
      ) {
        return 'carbon';
      }
      if (
        th === 'purpura-galaxia' ||
        th === 'ondas-azul-lavanda' ||
        th === 'oro-imperial-3d' ||
        th === 'madera-noble'
      ) {
        return 'purpura';
      }
      if (th === 'turquesa-caribe') {
        return 'turquesa';
      }
    }
  } catch {
    // Fallback on error
  }
  return 'azul';
}

export function saveBackgroundTheme(theme: AppBackgroundTheme): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('domino_theme', theme);
    localStorage.setItem(STORAGE_KEYS.BACKGROUND, theme);
    // Also sync in settings object if exists
    const rawSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (rawSettings) {
      const parsed = JSON.parse(rawSettings);
      parsed.backgroundTheme = theme;
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
    }
  } catch {
    // Ignore
  }
}

export function loadActiveGame(): ActiveGameState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_GAME);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveActiveGame(state: ActiveGameState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_GAME, JSON.stringify(state));
  } catch {
    // Ignore
  }
}

export function clearActiveGame(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_GAME);
  } catch {
    // Ignore
  }
}

export function loadMatchHistory(): PastMatch[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MATCH_HISTORY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function savePastMatch(match: PastMatch): void {
  if (typeof window === 'undefined') return;
  try {
    const history = loadMatchHistory();
    // Prepend new match, avoiding duplicates
    const filtered = history.filter((m) => m.id !== match.id);
    const updated = [match, ...filtered.slice(0, 99)]; // keep up to 100 games
    localStorage.setItem(STORAGE_KEYS.MATCH_HISTORY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
}

export function deletePastMatch(matchId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const history = loadMatchHistory();
    const updated = history.filter((m) => m.id !== matchId);
    localStorage.setItem(STORAGE_KEYS.MATCH_HISTORY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
}

export function clearMatchHistory(mode?: GameMode): void {
  if (typeof window === 'undefined') return;
  try {
    if (!mode) {
      localStorage.removeItem(STORAGE_KEYS.MATCH_HISTORY);
    } else {
      const history = loadMatchHistory();
      const updated = history.filter((m) => m.gameMode !== mode);
      localStorage.setItem(STORAGE_KEYS.MATCH_HISTORY, JSON.stringify(updated));
    }
  } catch {
    // Ignore
  }
}

export function loadCustomTracks(): MusicTrack[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_TRACKS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCustomTracks(tracks: MusicTrack[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_TRACKS, JSON.stringify(tracks));
  } catch {
    // Ignore
  }
}

/**
 * Cargar el historial de canciones escuchadas guardado en el dispositivo
 */
export function loadMusicHistory(): MusicHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MUSIC_HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => item && item.track && item.track.title);
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Guardar el historial de canciones escuchadas
 */
export function saveMusicHistory(items: MusicHistoryItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.MUSIC_HISTORY, JSON.stringify(items.slice(0, 200)));
  } catch {
    // Ignore storage quota
  }
}

/**
 * Graba automáticamente la canción que se está escuchando:
 * - Si ya se había escuchado, incrementa su playCount y actualiza la fecha/hora
 * - Si es nueva, la agrega con playCount = 1 y timestamp actual
 * - Retorna la lista actualizada de historial
 */
export function recordSongPlay(track: MusicTrack): MusicHistoryItem[] {
  if (!track || !track.title) return loadMusicHistory();
  try {
    const current = loadMusicHistory();
    const cleanTitle = (track.title || '').trim().toLowerCase();
    const cleanArtist = (track.artist || '').trim().toLowerCase();
    const vId = track.videoId;

    // Buscar si ya existe por ID exacto, por videoId de YouTube, o por combinación título + artista
    const existingIndex = current.findIndex((item) => {
      if (item.id === track.id) return true;
      if (vId && item.track.videoId && item.track.videoId === vId) return true;
      const itTitle = (item.track.title || '').trim().toLowerCase();
      const itArtist = (item.track.artist || '').trim().toLowerCase();
      return itTitle === cleanTitle && itArtist === cleanArtist;
    });

    let updatedHistory: MusicHistoryItem[];

    if (existingIndex >= 0) {
      const existingItem = current[existingIndex];
      const updatedItem: MusicHistoryItem = {
        ...existingItem,
        track: {
          ...existingItem.track,
          ...track,
          // Mantener videoId o artworkUrl si ya estaba mejor resuelto
          videoId: track.videoId || existingItem.track.videoId,
          artworkUrl: track.artworkUrl || existingItem.track.artworkUrl,
        },
        playedAt: Date.now(),
        playCount: (existingItem.playCount || 1) + 1,
      };

      // Mover al principio para reflejar la última escucha reciente
      updatedHistory = [
        updatedItem,
        ...current.filter((_, idx) => idx !== existingIndex),
      ];
    } else {
      const newItem: MusicHistoryItem = {
        id: track.id || `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        track: { ...track },
        playedAt: Date.now(),
        playCount: 1,
      };
      updatedHistory = [newItem, ...current];
    }

    // Limitar a máximo 200 canciones en el historial para cuidar almacenamiento
    const trimmed = updatedHistory.slice(0, 200);
    saveMusicHistory(trimmed);
    return trimmed;
  } catch {
    return loadMusicHistory();
  }
}

/**
 * Elimina una canción específica del historial
 */
export function deleteSongFromHistory(songId: string): MusicHistoryItem[] {
  try {
    const current = loadMusicHistory();
    const updated = current.filter(
      (item) => item.id !== songId && item.track.id !== songId && item.track.videoId !== songId
    );
    saveMusicHistory(updated);
    return updated;
  } catch {
    return [];
  }
}

/**
 * Limpia por completo el historial de música
 */
export function clearMusicHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEYS.MUSIC_HISTORY);
  } catch {
    // Ignore
  }
}

/**
 * Carga la preferencia de reproducción automática continua (Autoplay)
 */
export function loadMusicAutoplay(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const val = localStorage.getItem('domino_music_autoplay');
    if (val === null) return true;
    return val === 'true';
  } catch {
    return true;
  }
}

/**
 * Guarda la preferencia de reproducción automática continua (Autoplay)
 */
export function saveMusicAutoplay(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('domino_music_autoplay', enabled ? 'true' : 'false');
  } catch {
    // Ignore
  }
}

/**
 * Obtiene la clave de YouTube Data API v3 desde las variables de entorno de los Secrets.
 * Consumo interno y silencioso.
 */
export function getYouTubeApiKey(): string {
  const envKey =
    (import.meta as any).env?.VITE_YOUTUBE_API_KEY ||
    (typeof process !== 'undefined'
      ? (process as any).env?.YOUTUBE_API_KEY || (process as any).env?.VITE_YOUTUBE_API_KEY
      : '');

  if (envKey && typeof envKey === 'string' && envKey.trim()) {
    return envKey.trim();
  }

  return '';
}

