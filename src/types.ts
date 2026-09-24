export type GameMode = 'teams' | 'individual';

export type LanguageSetting = 'auto' | 'es' | 'en';

export type TrancaRule = 'sum_opponent' | 'point_difference';

export type AppBackgroundTheme =
  | 'cielo-celeste-3d'
  | 'galaxia-rubi-3d'
  | 'mesa-esmeralda-3d'
  | 'neon-cyberpunk-3d'
  | 'ondas-azul-lavanda'
  | 'oro-imperial-3d'
  | 'fieltro-verde'
  | 'madera-noble'
  | 'noche-elegante'
  | 'fibra-carbono'
  | 'cielo-estrellas';

export interface PlayerScore {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  score: number;
  handsWon: number;
  members?: string[];
}

export type WinReason = 'normal' | 'tranca' | 'capicua' | 'penalizacion';

export interface Round {
  id: string;
  roundNumber: number;
  winnerId: string;
  winnerPlayerName?: string;
  points: number;
  reason: WinReason;
  notes?: string;
  timestamp: number;
  // Snapshot of scores at the end of this round
  scoresSnapshot: Record<string, number>;
}

export interface GameSettings {
  targetScore: number;
  gameMode: GameMode;
  team1Name: string;
  team2Name: string;
  team1Members: string[];
  team2Members: string[];
  individualPlayerNames: string[];
  trancaRule: TrancaRule;
  capicuaBonus: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  timerDurationSeconds: number;
  keepScreenAwake?: boolean;
  languageSetting?: 'auto' | 'es' | 'en';
  backgroundTheme?: AppBackgroundTheme;
}

export interface MatchStats {
  totalRounds: number;
  highestRoundPoints: number;
  highestRoundWinnerId: string;
  startTime: number;
  endTime?: number;
  durationMinutes?: number;
}

export interface PastMatch {
  id: string;
  date: string;
  timestamp: number;
  gameMode: GameMode;
  targetScore: number;
  winnerName: string;
  winnerColor: string;
  finalScores: { name: string; score: number; color: string; members?: string[] }[];
  totalRounds: number;
  durationMinutes: number;
  team1Members?: string[];
  team2Members?: string[];
  rounds?: Round[];
}

export type MusicSourceType = 'audio' | 'youtube' | 'radio';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  sourceType: MusicSourceType;
  url: string;
  artworkUrl?: string;
  durationSeconds?: number;
  durationText?: string;
  videoId?: string;
  addedByUser?: boolean;
  genre?: string;
  previewUrl?: string;
}

export interface MusicHistoryItem {
  id: string;
  track: MusicTrack;
  playedAt: number;
  playCount: number;
}
