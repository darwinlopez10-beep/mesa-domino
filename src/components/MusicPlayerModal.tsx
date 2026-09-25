import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Sparkles,
  Loader2,
  Youtube,
  Search,
  ChevronUp,
  Tv,
  Globe,
  Disc3,
  Music,
  ExternalLink,
  Flame,
  Clock,
  Trash2,
  RotateCcw,
  TrendingUp,
  Headphones,
  ListMusic,
  Check,
  SkipBack,
  SkipForward,
  Sliders,
  Plus,
  Minus,
  Radio,
  Repeat,
} from 'lucide-react';
import { MusicHistoryItem, MusicTrack } from '../types';
import { AppLanguage, TRANSLATIONS } from '../utils/i18n';
import {
  loadMusicHistory,
  recordSongPlay,
  deleteSongFromHistory,
  clearMusicHistory,
  getYouTubeApiKey,
} from '../utils/storage';

interface MusicPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  volume: number;
  onSelectTrack: (track: MusicTrack, playlist?: MusicTrack[]) => void;
  onTogglePlay: () => void;
  onVolumeChange: (newVol: number) => void;
  onToggleMute?: () => void;
  onPlayNext?: () => void;
  onPlayPrev?: () => void;
  isAutoplay?: boolean;
  onToggleAutoplay?: () => void;
  customTracks?: MusicTrack[];
  onAddCustomTrack?: (track: MusicTrack) => void;
  onDeleteCustomTrack?: (trackId: string) => void;
  initialTab?: string;
  lang: AppLanguage;
  musicHistory?: MusicHistoryItem[];
  onDeleteHistoryItem?: (songId: string) => void;
  onClearMusicHistory?: () => void;
}

// Helper to decode HTML entities in YouTube titles/channel names
function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

// Función auxiliar para construir URLs de iframe seguras con origin y enablejsapi
export function buildEmbedUrl(videoId: string, autoplay = true): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const originParam = origin ? `&origin=${encodeURIComponent(origin)}` : '';
  return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&playsinline=1&enablejsapi=1${originParam}&rel=0`;
}

// Lista inicial y de respaldo verificada de canciones y mezclas libres de bloqueo (Salsa, Bachata, Baladas, Rancheras)
export const CURATED_DOMINO_YOUTUBE_TRACKS: MusicTrack[] = [
  // --- RANCHERAS & MARIACHI ---
  {
    id: 'yt_ugNQ5uIN09Q',
    videoId: 'ugNQ5uIN09Q',
    title: 'Volver Volver',
    artist: 'Vicente Fernández',
    genre: 'Rancheras',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/ugNQ5uIN09Q?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/ugNQ5uIN09Q/hqdefault.jpg',
    durationText: '3:00',
  },
  {
    id: 'yt_gfm2zSgQ8cQ',
    videoId: 'gfm2zSgQ8cQ',
    title: 'Por Tu Maldito Amor',
    artist: 'Vicente Fernández',
    genre: 'Rancheras',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/gfm2zSgQ8cQ?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/gfm2zSgQ8cQ/hqdefault.jpg',
    durationText: '3:55',
  },
  {
    id: 'yt_05dcxPp62BQ',
    videoId: '05dcxPp62BQ',
    title: 'Me Dediqué a Perderte',
    artist: 'Alejandro Fernández',
    genre: 'Rancheras',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/05dcxPp62BQ?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/05dcxPp62BQ/hqdefault.jpg',
    durationText: '3:54',
  },
  {
    id: 'yt_MXlwuZ_nEk0',
    videoId: 'MXlwuZ_nEk0',
    title: 'Como Quien Pierde Una Estrella',
    artist: 'Alejandro Fernández',
    genre: 'Rancheras',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/MXlwuZ_nEk0?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/MXlwuZ_nEk0/hqdefault.jpg',
    durationText: '3:35',
  },
  {
    id: 'yt_RFskXBDVgUc',
    videoId: 'RFskXBDVgUc',
    title: 'Rancheras Doradas - Mix Inolvidable para Jugar',
    artist: 'Mariachi Clásico Selección',
    genre: 'Rancheras',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/RFskXBDVgUc?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/RFskXBDVgUc/hqdefault.jpg',
    durationText: '45:00',
  },

  // --- BALADAS ROMÁNTICAS ---
  {
    id: 'yt_kAy1GtglPyQ',
    videoId: 'kAy1GtglPyQ',
    title: 'Canciones de Amor y Desamor',
    artist: 'Ana Gabriel',
    genre: 'Baladas',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/kAy1GtglPyQ?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/kAy1GtglPyQ/hqdefault.jpg',
    durationText: '4:10',
  },
  {
    id: 'yt_kF5dQugED-M',
    videoId: 'kF5dQugED-M',
    title: 'Simplemente Amigos',
    artist: 'Ana Gabriel',
    genre: 'Baladas',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/kF5dQugED-M?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/kF5dQugED-M/hqdefault.jpg',
    durationText: '3:50',
  },
  {
    id: 'yt_ga5Bo4YdgH4',
    videoId: 'ga5Bo4YdgH4',
    title: 'Hasta Que Te Conocí (Bellas Artes)',
    artist: 'Juan Gabriel',
    genre: 'Baladas',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/ga5Bo4YdgH4?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/ga5Bo4YdgH4/hqdefault.jpg',
    durationText: '8:45',
  },
  {
    id: 'yt_gH8oCh1nn88',
    videoId: 'gH8oCh1nn88',
    title: 'Si No Te Hubieras Ido',
    artist: 'Marco Antonio Solís',
    genre: 'Baladas',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/gH8oCh1nn88?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/gH8oCh1nn88/hqdefault.jpg',
    durationText: '4:49',
  },
  {
    id: 'yt_E20G25SCAEg',
    videoId: 'E20G25SCAEg',
    title: 'El Triste (En Vivo)',
    artist: 'José José',
    genre: 'Baladas',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/E20G25SCAEg?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/E20G25SCAEg/hqdefault.jpg',
    durationText: '4:15',
  },
  {
    id: 'yt_DFzuYXLS6bQ',
    videoId: 'DFzuYXLS6bQ',
    title: 'Mix Baladas Románticas en Español para Dominó',
    artist: 'Baladas de Oro Selección',
    genre: 'Baladas',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/DFzuYXLS6bQ?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/DFzuYXLS6bQ/hqdefault.jpg',
    durationText: '48:00',
  },

  // --- SALSA ---
  {
    id: 'yt_BNo0vkEYWRc',
    videoId: 'BNo0vkEYWRc',
    title: 'El Cantante',
    artist: 'Héctor Lavoe',
    genre: 'Salsa',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/BNo0vkEYWRc?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/BNo0vkEYWRc/hqdefault.jpg',
    durationText: '10:20',
  },
  {
    id: 'yt_0nBFWzpWXuM',
    videoId: '0nBFWzpWXuM',
    title: 'La Vida Es Un Carnaval',
    artist: 'Celia Cruz',
    genre: 'Salsa',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/0nBFWzpWXuM?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/0nBFWzpWXuM/hqdefault.jpg',
    durationText: '4:38',
  },
  {
    id: 'yt_YXnjy5YlDwk',
    videoId: 'YXnjy5YlDwk',
    title: 'Vivir Mi Vida',
    artist: 'Marc Anthony',
    genre: 'Salsa',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/YXnjy5YlDwk?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/YXnjy5YlDwk/hqdefault.jpg',
    durationText: '4:18',
  },
  {
    id: 'yt_oWBf9hfW_4Y',
    videoId: 'oWBf9hfW_4Y',
    title: 'La Rebelión (No Le Pegue a la Negra)',
    artist: 'Joe Arroyo',
    genre: 'Salsa',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/oWBf9hfW_4Y?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/oWBf9hfW_4Y/hqdefault.jpg',
    durationText: '4:45',
  },
  {
    id: 'yt_0xT7maXs-UU',
    videoId: '0xT7maXs-UU',
    title: 'Brujería',
    artist: 'El Gran Combo de Puerto Rico',
    genre: 'Salsa',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/0xT7maXs-UU?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/0xT7maXs-UU/hqdefault.jpg',
    durationText: '4:18',
  },
  {
    id: 'yt_BMcb8D7Zzy8',
    videoId: 'BMcb8D7Zzy8',
    title: 'Mix Salsa Brava Bailable para Jugar Dominó',
    artist: 'Salsa Clásica Mix',
    genre: 'Salsa',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/BMcb8D7Zzy8?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/BMcb8D7Zzy8/hqdefault.jpg',
    durationText: '35:00',
  },
  {
    id: 'yt_BVYLOe4Xkg0',
    videoId: 'BVYLOe4Xkg0',
    title: 'Mix Salsa Clásica Brava para Bailar y Jugar',
    artist: 'Salsa de Oro',
    genre: 'Salsa',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/BVYLOe4Xkg0?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/BVYLOe4Xkg0/hqdefault.jpg',
    durationText: '45:00',
  },

  // --- BACHATA ---
  {
    id: 'yt_2LiZyAIVmbs',
    videoId: '2LiZyAIVmbs',
    title: 'Bachata Rosa',
    artist: 'Juan Luis Guerra 4.40',
    genre: 'Bachata',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/2LiZyAIVmbs?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/2LiZyAIVmbs/hqdefault.jpg',
    durationText: '4:13',
  },
  {
    id: 'yt_QFs3PIZb3js',
    videoId: 'QFs3PIZb3js',
    title: 'Propuesta Indecente',
    artist: 'Romeo Santos',
    genre: 'Bachata',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/QFs3PIZb3js?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/QFs3PIZb3js/hqdefault.jpg',
    durationText: '4:15',
  },
  {
    id: 'yt_bdOXnTbyk0g',
    videoId: 'bdOXnTbyk0g',
    title: 'Darte un Beso',
    artist: 'Prince Royce',
    genre: 'Bachata',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/bdOXnTbyk0g?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/bdOXnTbyk0g/hqdefault.jpg',
    durationText: '3:25',
  },
  {
    id: 'yt_8_QY5gFQUTg',
    videoId: '8_QY5gFQUTg',
    title: 'Obsesión',
    artist: 'Aventura',
    genre: 'Bachata',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/8_QY5gFQUTg?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/8_QY5gFQUTg/hqdefault.jpg',
    durationText: '4:14',
  },
  {
    id: 'yt_IiDW5nRbDoM',
    videoId: 'IiDW5nRbDoM',
    title: 'Mix Bachata Clásica y Romántica para Partidas',
    artist: 'Bachata Mix Selección',
    genre: 'Bachata',
    sourceType: 'youtube',
    url: 'https://www.youtube.com/embed/IiDW5nRbDoM?autoplay=1&playsinline=1&enablejsapi=1',
    artworkUrl: 'https://img.youtube.com/vi/IiDW5nRbDoM/hqdefault.jpg',
    durationText: '40:00',
  },
];

// Helper to extract YouTube video ID from any link or text
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/;
  const match = url.match(regExp);
  if (match && match[1]) return match[1];

  const trimmed = url.trim();
  if (trimmed.length === 11 && !trimmed.includes('/') && !trimmed.includes('.') && !trimmed.includes('?')) {
    return trimmed;
  }
  return null;
}

// Botones rápidos para buscar directamente artistas o géneros populares en YouTube
const POPULAR_SEARCH_TAGS = [
  'Ana Gabriel',
  'Alejandro Fernández',
  'Anthony Santos',
  'Zacarías Ferreira',
  'Bachata',
  'Salsa Clásica',
  'Rancheras',
  'Baladas Románticas',
  'Vicente Fernández',
  'Juan Gabriel',
  'Marco Antonio Solís',
  'José José',
  'Marc Anthony',
  'Celia Cruz',
  'Héctor Lavoe',
  'Joe Arroyo',
  'El Gran Combo',
  'Romeo Santos',
  'Juan Luis Guerra',
  'Prince Royce',
  'Aventura',
  'Mix Salsa',
  'Mix Bachata',
  'Mix Rancheras',
];

export const MusicPlayerModal: React.FC<MusicPlayerModalProps> = ({
  isOpen,
  onClose,
  currentTrack,
  isPlaying,
  volume,
  onSelectTrack,
  onTogglePlay,
  onVolumeChange,
  onToggleMute,
  onPlayNext,
  onPlayPrev,
  isAutoplay = true,
  onToggleAutoplay,
  lang,
  musicHistory,
  onDeleteHistoryItem,
  onClearMusicHistory,
}) => {
  const t = TRANSLATIONS[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MusicTrack[]>([]);
  const [genreFilter, setGenreFilter] = useState<'all' | 'Salsa' | 'Bachata' | 'Baladas' | 'Rancheras'>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isVideoExpanded, setIsVideoExpanded] = useState(true);

  // Historial automático de canciones
  const [history, setHistory] = useState<MusicHistoryItem[]>(() => musicHistory || loadMusicHistory());
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  // Sincronizar si cambia desde props
  useEffect(() => {
    if (musicHistory) {
      setHistory(musicHistory);
    }
  }, [musicHistory]);

  // Pestaña de catálogo inicial: Si hay historial, arrancar mostrando 'mostPlayed' (las que más se escuchan)
  const [catalogView, setCatalogView] = useState<'mostPlayed' | 'recent' | 'recommended'>(() => {
    const initHist = musicHistory || loadMusicHistory();
    return initHist.length > 0 ? 'mostPlayed' : 'recommended';
  });

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const songsListSectionRef = useRef<HTMLDivElement>(null);
  const modalScrollContainerRef = useRef<HTMLDivElement>(null);
  const searchBarContainerRef = useRef<HTMLDivElement>(null);

  // Active YouTube video ID
  const activeVideoId = currentTrack?.videoId || (currentTrack?.url ? extractYouTubeId(currentTrack.url) : null);
  const [resolvingTrackId, setResolvingTrackId] = useState<string | null>(null);

  // Filtrado reactivo por género en búsqueda o lista de respaldo
  const displayedSearchResults = useMemo(() => {
    if (genreFilter === 'all') return searchResults;
    const lower = genreFilter.toLowerCase();
    return searchResults.filter(
      (t) =>
        (t.genre && t.genre.toLowerCase().includes(lower)) ||
        t.title.toLowerCase().includes(lower) ||
        t.artist.toLowerCase().includes(lower)
    );
  }, [searchResults, genreFilter]);

  // Canciones más escuchadas (ordenadas por cantidad de reproducciones descendente)
  const mostPlayedTracks = useMemo(() => {
    return [...history].sort((a, b) => (b.playCount || 1) - (a.playCount || 1) || b.playedAt - a.playedAt);
  }, [history]);

  // Canciones escuchadas recientemente (orden cronológico inverso)
  const recentTracks = useMemo(() => {
    return [...history].sort((a, b) => b.playedAt - a.playedAt);
  }, [history]);

  // Formato relativo de tiempo
  const formatRelativeTime = (timestamp: number) => {
    const diffMs = Math.max(0, Date.now() - timestamp);
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return lang === 'es' ? 'Hace un momento' : 'Just now';
    if (diffMin < 60) return lang === 'es' ? `Hace ${diffMin} min` : `${diffMin}m ago`;
    if (diffHours < 24) return lang === 'es' ? `Hace ${diffHours} h` : `${diffHours}h ago`;
    if (diffDays === 1) return lang === 'es' ? 'Ayer' : 'Yesterday';
    if (diffDays < 7) return lang === 'es' ? `Hace ${diffDays} días` : `${diffDays}d ago`;
    return new Date(timestamp).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
      day: 'numeric',
      month: 'short',
    });
  };

  const handleDeleteFromHistory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (onDeleteHistoryItem) {
      onDeleteHistoryItem(id);
    }
    const updated = deleteSongFromHistory(id);
    setHistory(updated);
  };

  const handleClearAllHistory = () => {
    if (onClearMusicHistory) {
      onClearMusicHistory();
    }
    clearMusicHistory();
    setHistory([]);
    setIsConfirmClearOpen(false);
    setCatalogView('recommended');
  };

  // Selección manual de una canción (NUNCA automática)
  const handleSelectSong = async (track: MusicTrack, playlistContext?: MusicTrack[]) => {
    let playTrack = track;

    // Si la canción no tiene videoId verificado de YouTube (o viene incompleta), resolverlo de inmediato antes de reproducir
    if ((!playTrack.videoId || playTrack.videoId.length !== 11) && playTrack.sourceType === 'youtube') {
      const extractedId = playTrack.url ? extractYouTubeId(playTrack.url) : null;
      if (extractedId) {
        playTrack = {
          ...playTrack,
          videoId: extractedId,
          url: buildEmbedUrl(extractedId, true),
        };
      } else {
        setResolvingTrackId(track.id);
        try {
          const q = `${playTrack.artist} ${playTrack.title}`;
          const res = await fetch(`/api/music/search?q=${encodeURIComponent(q)}`, {
            signal: AbortSignal.timeout(4000),
          });
          if (res.ok) {
            const data = await res.json();
            const firstWithId = data?.results?.find(
              (r: any) => r && r.videoId && typeof r.videoId === 'string' && r.videoId.length === 11
            );
            if (firstWithId) {
              playTrack = {
                ...playTrack,
                videoId: firstWithId.videoId,
                url: buildEmbedUrl(firstWithId.videoId, true),
                artworkUrl: playTrack.artworkUrl || firstWithId.artworkUrl,
              };
            }
          }
        } catch {
          // Ignorar error de resolución
        } finally {
          setResolvingTrackId(null);
        }
      }
    }

    if (!playTrack.videoId) {
      setSearchError(
        lang === 'es'
          ? 'No se pudo cargar el video de esta canción. Por favor intenta con otra.'
          : 'Could not load the video for this song. Please try another one.'
      );
      return;
    }

    const effectivePlaylistContext = playlistContext
      ? playlistContext.map((p) => (p.id === playTrack.id ? playTrack : p))
      : undefined;

    // 1. Grabar automáticamente la canción seleccionada en el historial
    const updatedHistory = recordSongPlay(playTrack);
    setHistory(updatedHistory);

    // Inicializa la reproducción directamente en el gesto del usuario en Android (evita bloqueo de autoplay)
    if (playTrack.videoId && typeof window !== 'undefined' && typeof (window as any).__dominoDirectPlay === 'function') {
      try {
        (window as any).__dominoDirectPlay(playTrack.videoId);
      } catch (e) {
        console.warn('Direct user gesture play notice:', e);
      }
    }

    // 2. Notificar reproducción con la canción garantizada con videoId
    onSelectTrack(playTrack, effectivePlaylistContext);
    setIsVideoExpanded(true);
  };

  // Helper para ejecutar la búsqueda y ocultar el teclado en móviles
  const handleExecuteSearch = (termToSearch?: string) => {
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const term = termToSearch !== undefined ? termToSearch : (searchInputRef.current?.value || searchQuery);
    handleSearchYouTube(term);
  };

  // Búsqueda en YouTube rápida, fiable y con videoId verificado en cada resultado
  const handleSearchYouTube = async (termToSearch?: string) => {
    const rawVal = termToSearch !== undefined ? termToSearch : (searchInputRef.current?.value || searchQuery);
    const query = (rawVal || '').trim();

    // Ocultar teclado virtual en Android de inmediato para permitir ver resultados
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    if (!query) {
      setSearchError('Escribe el nombre de un cantante, grupo o canción, o toca uno de los botones abajo.');
      return;
    }

    // Comprobar si el usuario pegó un enlace directo de YouTube
    const directVideoId = extractYouTubeId(query);
    if (directVideoId) {
      const directTrack: MusicTrack = {
        id: `yt_${directVideoId}`,
        videoId: directVideoId,
        title: 'Canción de YouTube',
        artist: 'YouTube',
        sourceType: 'youtube',
        url: buildEmbedUrl(directVideoId, true),
        artworkUrl: `https://img.youtube.com/vi/${directVideoId}/hqdefault.jpg`,
      };
      setSearchResults([directTrack]);
      setSearchQuery(query);
      setHasSearched(true);
      setSearchError(null);
      handleSelectSong(directTrack, [directTrack]);
      return;
    }

    // Limpieza y normalización de la consulta (permite Antony / Anthony Santos, Zacarías Ferreira, etc.)
    const cleanQuery = query.replace(/\s+/g, ' ').trim();
    setSearchQuery(cleanQuery);
    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);

    // 1. Coincidencias instantáneas del catálogo local de dominó
    const queryLower = cleanQuery.toLowerCase();
    const queryAlt = queryLower.includes('antony')
      ? queryLower.replace(/antony/g, 'anthony')
      : queryLower.includes('anthony')
      ? queryLower.replace(/anthony/g, 'antony')
      : queryLower;

    const queryTokens = queryLower.split(/\s+/).filter(Boolean);
    const localMatches = CURATED_DOMINO_YOUTUBE_TRACKS.filter((t) => {
      const tStr = `${t.title} ${t.artist} ${t.genre || ''}`.toLowerCase();
      return (
        queryTokens.every((token) => tStr.includes(token)) ||
        tStr.includes(queryLower) ||
        tStr.includes(queryAlt)
      );
    });

    // 2. Búsqueda principal directa en YouTube Data API v3
    // Sin el filtro restrictivo videoEmbeddable=true para evitar descartar artistas latinos
    const activeApiKey = getYouTubeApiKey();

    interface DirectQueryResult {
      tracks: MusicTrack[];
      status: number;
      isNetworkError: boolean;
      errorMessageSpanish: string | null;
    }

    const executeDirectQuery = async (key: string): Promise<DirectQueryResult> => {
      try {
        const directUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=15&q=${encodeURIComponent(cleanQuery)}&key=${key}`;
        const directRes = await fetch(directUrl, { signal: AbortSignal.timeout(6500) });

        if (directRes.ok) {
          const directData = await directRes.json();
          const items = Array.isArray(directData?.items) ? directData.items : [];
          const tracks: MusicTrack[] = [];
          for (const item of items) {
            const vid = item?.id?.videoId;
            if (vid && typeof vid === 'string' && vid.length === 11) {
              tracks.push({
                id: `yt_${vid}`,
                videoId: vid,
                title: decodeHtmlEntities(item.snippet?.title || cleanQuery).trim(),
                artist: decodeHtmlEntities(item.snippet?.channelTitle || cleanQuery).trim(),
                sourceType: 'youtube',
                url: buildEmbedUrl(vid, true),
                artworkUrl:
                  item.snippet?.thumbnails?.high?.url ||
                  item.snippet?.thumbnails?.medium?.url ||
                  item.snippet?.thumbnails?.default?.url ||
                  `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
                durationText: '',
              });
            }
          }
          return {
            tracks,
            status: 200,
            isNetworkError: false,
            errorMessageSpanish: null,
          };
        }

        // Si la API respondió con código de error (como 400 o 403 por cuota)
        const errJson = await directRes.json().catch(() => null);
        const errObj = errJson?.error;
        const reason = errObj?.errors?.[0]?.reason || errObj?.details?.[0]?.reason || '';
        const msg = errObj?.message || '';

        let errSpanish = '';
        if (directRes.status === 403 || reason === 'quotaExceeded' || msg.toLowerCase().includes('quota')) {
          errSpanish =
            lang === 'es'
              ? 'Error de cuota de YouTube API excedida (Límite diario alcanzado).'
              : 'YouTube API daily quota exceeded.';
        } else if (
          directRes.status === 400 ||
          reason === 'API_KEY_INVALID' ||
          reason === 'keyInvalid' ||
          msg.toLowerCase().includes('api key')
        ) {
          errSpanish =
            lang === 'es'
              ? 'Clave de YouTube API no válida o restringida.'
              : 'Invalid or restricted YouTube API key.';
        } else if (reason === 'ipRefererBlocked' || msg.toLowerCase().includes('referer')) {
          errSpanish =
            lang === 'es'
              ? 'Clave de YouTube API restringida por dominio o referente web.'
              : 'YouTube API key restricted by domain or web referer.';
        } else if (reason === 'accessNotConfigured') {
          errSpanish =
            lang === 'es'
              ? 'La YouTube Data API v3 no está habilitada en Google Cloud para esta clave.'
              : 'YouTube Data API v3 is not enabled in Google Cloud for this key.';
        } else {
          errSpanish =
            lang === 'es'
              ? `Error de YouTube API (${directRes.status}): ${msg || 'Error en la consulta'}`
              : `YouTube API error (${directRes.status}): ${msg || 'Search query error'}`;
        }

        return {
          tracks: [],
          status: directRes.status,
          isNetworkError: false,
          errorMessageSpanish: errSpanish,
        };
      } catch {
        return {
          tracks: [],
          status: 0,
          isNetworkError: true,
          errorMessageSpanish:
            lang === 'es'
              ? 'Error de conexión o bloqueo de red al conectar con YouTube Data API.'
              : 'Network connection error connecting to YouTube Data API.',
        };
      }
    };

    try {
      let queryResult = await executeDirectQuery(activeApiKey);

      // Si falló la consulta directa (por red o error de clave), intentar con el servidor integrado
      if (queryResult.status !== 200 || queryResult.isNetworkError) {
        try {
          const srvUrl = `/api/music/search?q=${encodeURIComponent(cleanQuery)}&key=${encodeURIComponent(activeApiKey)}`;
          const srvRes = await fetch(srvUrl, { signal: AbortSignal.timeout(6000) });
          if (srvRes.ok) {
            const srvData = await srvRes.json();
            if (srvData && Array.isArray(srvData.results) && srvData.results.length > 0) {
              queryResult = {
                tracks: srvData.results.filter(
                  (r: any) => r && r.videoId && typeof r.videoId === 'string' && r.videoId.length === 11
                ),
                status: 200,
                isNetworkError: false,
                errorMessageSpanish: null,
              };
            } else if (srvData?.apiError && !queryResult.errorMessageSpanish) {
              const r = srvData.apiError.reason || '';
              if (srvData.apiError.status === 403 || r === 'quotaExceeded') {
                queryResult.errorMessageSpanish =
                  lang === 'es'
                    ? 'Error de cuota de YouTube API excedida (Límite diario alcanzado).'
                    : 'YouTube API daily quota exceeded.';
              } else if (srvData.apiError.status === 400 || r === 'badRequest') {
                queryResult.errorMessageSpanish =
                  lang === 'es'
                    ? 'Clave de YouTube API no válida o restringida.'
                    : 'Invalid or restricted YouTube API key.';
              }
            }
          }
        } catch {
          // Continuar con el resultado anterior
        }
      }

      // Si la consulta fue exitosa (status 200):
      if (queryResult.status === 200) {
        const combined: MusicTrack[] = [];
        const seenVideoIds = new Set<string>();

        // 1. Videos directos encontrados en YouTube
        for (const track of queryResult.tracks) {
          if (track.videoId && !seenVideoIds.has(track.videoId)) {
            seenVideoIds.add(track.videoId);
            combined.push(track);
          }
        }

        // 2. Coincidencias locales complementarias verificadas
        for (const track of localMatches) {
          if (track.videoId && !seenVideoIds.has(track.videoId)) {
            seenVideoIds.add(track.videoId);
            combined.push(track);
          }
        }

        if (combined.length > 0) {
          setSearchResults(combined);
          setSearchError(null);
          setTimeout(() => {
            songsListSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        } else {
          // FALLBACK INTELIGENTE:
          // Solo se activa si status fue 200 exitoso pero devolvió 0 elementos de video
          setSearchResults(CURATED_DOMINO_YOUTUBE_TRACKS);
          setSearchError(
            lang === 'es'
              ? `No se encontraron resultados específicos para "${cleanQuery}". Mostrando lista curada de respaldo (Salsa, Bachata, Baladas y Rancheras) con reproducción libre verificada para jugar sin pausas.`
              : `No direct results for "${cleanQuery}". Showing verified curated fallback playlist (Salsa, Bachata, Baladas & Rancheras) with free playback.`
          );
        }
      } else {
        // En caso de fallo de red o error de clave/cuota (status !== 200):
        // NUNCA activar el aviso de fallback ni mostrar la lista de respaldo simulando que no hay resultados
        setSearchResults([]);
        const finalErrorMsg =
          queryResult.errorMessageSpanish ||
          (lang === 'es'
            ? 'Error al conectar con YouTube Data API v3. Verifica tu conexión o clave de API.'
            : 'Error connecting to YouTube Data API v3. Check your connection or API key.');
        setSearchError(finalErrorMsg);
      }
    } catch {
      // Fallo no controlado: mostrar error claro en español, nunca el fallback disimulado
      setSearchResults([]);
      setSearchError(
        lang === 'es'
          ? 'Error de red o conexión al buscar en YouTube. Por favor verifica tu conexión a internet.'
          : 'Network error while searching YouTube. Please check your internet connection.'
      );
    } finally {
      setIsSearching(false);
    }
  };

  // Al presionar un botón de artista/género rápido: solo busca, NUNCA reproduce automáticamente
  const handleQuickTagClick = (tag: string) => {
    setSearchQuery(tag);
    if (searchInputRef.current) {
      searchInputRef.current.value = tag;
      searchInputRef.current.blur();
    }
    handleSearchYouTube(tag);
  };

  const handleMuteClick = () => {
    if (onToggleMute) {
      onToggleMute();
    } else {
      if (volume > 0) {
        onVolumeChange(0);
      } else {
        onVolumeChange(0.7);
      }
    }
  };

  if (!isOpen) return null;

  const embedUrl = activeVideoId ? buildEmbedUrl(activeVideoId, isPlaying) : '';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 pt-1 sm:pt-2 md:pt-3 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[94vh] mt-0.5 sm:mt-1"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-stone-800 bg-stone-850 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/15 text-red-400 border border-red-500/25">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-100 font-display flex items-center gap-2">
                {lang === 'es' ? 'Buscador de Música en YouTube' : 'YouTube Music Search'}
              </h3>
              <p className="text-[11px] text-stone-400">
                {lang === 'es'
                  ? 'Busca y reproduce cualquier cantante, canción o género del mundo'
                  : 'Search and play any artist, song, or genre'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer"
            title={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div ref={modalScrollContainerRef} className="overflow-y-auto flex-1 p-3 sm:p-5 space-y-3.5">
          {/* 1. BARRA DE BÚSQUEDA GENERAL ARRIBA (Misma estructura exacta en celular y computadora) */}
          <div ref={searchBarContainerRef} className="space-y-2.5">
            <form
              action="javascript:void(0)"
              onSubmit={(e) => {
                e.preventDefault();
                handleExecuteSearch();
              }}
              className="flex flex-row items-center gap-2 w-full"
            >
              {/* Etiqueta "YouTube" integrada */}
              <div className="relative flex-1 min-w-0 flex items-center bg-stone-950 border border-stone-750 focus-within:border-amber-500 rounded-xl overflow-hidden shadow-inner transition-colors">
                <div className="px-2.5 sm:px-3 py-2.5 bg-stone-900 border-r border-stone-800 flex items-center gap-1.5 text-red-400 flex-shrink-0 select-none">
                  <Youtube className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-red-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-200 hidden xs:inline">YouTube</span>
                </div>
                <input
                  ref={searchInputRef}
                  type="search"
                  inputMode="search"
                  name="search"
                  id="youtube-search-input"
                  enterKeyHint="search"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.keyCode === 13 || e.which === 13) {
                      e.preventDefault();
                      handleExecuteSearch();
                    }
                  }}
                  onKeyUp={(e) => {
                    if (e.key === 'Enter' || e.keyCode === 13 || e.which === 13) {
                      e.preventDefault();
                      searchInputRef.current?.blur();
                    }
                  }}
                  placeholder={
                    lang === 'es'
                      ? 'Escribe cualquier cantante (ej: Anthony Santos, Zacarías Ferreira)...'
                      : 'Type any artist or song (e.g. Anthony Santos, Queen, Shakira)...'
                  }
                  className="w-full bg-transparent px-2.5 sm:px-3 py-2.5 text-xs sm:text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none min-h-[44px]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setSearchQuery('');
                      if (searchInputRef.current) {
                        searchInputRef.current.value = '';
                        searchInputRef.current.focus();
                      }
                    }}
                    className="p-2 text-stone-500 hover:text-stone-300 transition-colors flex-shrink-0 mr-1 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                    title={lang === 'es' ? 'Borrar texto' : 'Clear text'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Botón con la palabra Buscar al lado (type submit + onClick + onTouchEnd para máxima compatibilidad móvil y PC) */}
              <button
                type="submit"
                id="btn-search-music"
                disabled={isSearching}
                onClick={(e) => {
                  e.preventDefault();
                  handleExecuteSearch();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleExecuteSearch();
                }}
                className="px-4 sm:px-5 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-50 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer min-h-[44px] min-w-[84px] touch-manipulation active:scale-95 select-none"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                ) : (
                  <Search className="w-4 h-4 text-stone-950 stroke-[2.5]" />
                )}
                <span>{t.search}</span>
              </button>
            </form>

            {/* 2. CUADROS PEQUEÑOS DE ARTISTAS Y GÉNEROS POPULARES */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-stone-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {lang === 'es'
                  ? 'Cantantes populares (toca uno para buscar todas sus canciones en YouTube):'
                  : 'Popular artists (tap one to search all songs on YouTube):'}
              </span>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap max-h-32 overflow-y-auto pr-1">
                {POPULAR_SEARCH_TAGS.map((tag) => {
                  const isCurrentTag = searchQuery.toLowerCase() === tag.toLowerCase();
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleQuickTagClick(tag)}
                      className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 touch-manipulation min-h-[38px] select-none ${
                        isCurrentTag
                          ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md shadow-amber-950/40'
                          : 'bg-stone-850 hover:bg-stone-800 active:bg-stone-750 text-stone-200 hover:text-amber-300 border-stone-750'
                      }`}
                    >
                      <Search className={`w-3 h-3 ${isCurrentTag ? 'text-stone-950' : 'text-amber-400'}`} />
                      <span>{tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. REPRODUCTOR INTEGRADO CON ESTADO DE SEGUNDO PLANO Y CONTROLES */}
          {currentTrack && (
            <div
              ref={playerContainerRef}
              className="bg-stone-950 border border-stone-800 rounded-xl p-3 sm:p-3.5 shadow-md flex flex-col gap-2.5 transition-all"
            >
              {/* Auto-siguiente pill */}
              {onToggleAutoplay && (
                <div className="flex items-center justify-end text-[11px] pb-1 border-b border-stone-850">
                  <button
                    type="button"
                    onClick={onToggleAutoplay}
                    className={`flex items-center gap-1 border px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                      isAutoplay
                        ? 'text-amber-300 bg-amber-500/20 border-amber-500/40 hover:bg-amber-500/30'
                        : 'text-stone-400 bg-stone-850 border-stone-700 hover:text-stone-200'
                    }`}
                    title={
                      lang === 'es'
                        ? isAutoplay
                          ? 'Autoplay activado: Pasa automáticamente a la siguiente canción en el celular. Toca para desactivar.'
                          : 'Autoplay desactivado: Se detendrá al terminar. Toca para activar.'
                        : isAutoplay
                          ? 'Autoplay enabled: Advances automatically on mobile. Tap to disable.'
                          : 'Autoplay disabled: Stops when track finishes. Tap to enable.'
                    }
                  >
                    <Repeat className={`w-2.5 h-2.5 ${isAutoplay ? 'text-amber-400' : 'text-stone-500'}`} />
                    <span className="font-semibold uppercase text-[9px] tracking-wide">
                      {isAutoplay
                        ? (lang === 'es' ? 'Autoplay: Activado' : 'Autoplay: ON')
                        : (lang === 'es' ? 'Autoplay: Desactivado' : 'Autoplay: OFF')}
                    </span>
                  </button>
                </div>
              )}

              {/* Cover & Info & Main controls */}
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 truncate flex-1">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-stone-900 border border-stone-800 flex-shrink-0 flex items-center justify-center">
                    {currentTrack.artworkUrl ? (
                      <img
                        src={currentTrack.artworkUrl}
                        alt={currentTrack.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Youtube className="w-5 h-5 text-red-500" />
                    )}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                      {isPlaying ? (
                        <span className="w-2.5 h-2.5 rounded-full animate-ping bg-amber-400" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-stone-400 opacity-70" />
                      )}
                    </div>
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs sm:text-sm font-bold text-stone-100 truncate">
                        {currentTrack.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-stone-400 truncate">
                      {currentTrack.artist} {currentTrack.durationText ? `• ${currentTrack.durationText}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* Prev */}
                  {onPlayPrev && (
                    <button
                      id="btn-modal-prev-track"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayPrev();
                      }}
                      title={lang === 'es' ? 'Canción anterior' : 'Previous song'}
                      className="min-h-[44px] min-w-[40px] p-2 rounded-lg text-stone-300 hover:text-white hover:bg-stone-850 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                    >
                      <SkipBack className="w-4 h-4" />
                    </button>
                  )}

                  {/* Play / Pause */}
                  <button
                    type="button"
                    onClick={onTogglePlay}
                    className="min-h-[44px] px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-bold text-xs shadow transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer touch-manipulation"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>{t.pause}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        <span>{t.play}</span>
                      </>
                    )}
                  </button>

                  {/* Next */}
                  {onPlayNext && (
                    <button
                      id="btn-modal-next-track"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayNext();
                      }}
                      title={lang === 'es' ? 'Siguiente canción' : 'Next song'}
                      className="min-h-[44px] min-w-[40px] p-2 rounded-lg text-stone-300 hover:text-white hover:bg-stone-850 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>
                  )}

                  {/* Autoplay Toggle Button */}
                  {onToggleAutoplay && (
                    <button
                      type="button"
                      onClick={onToggleAutoplay}
                      title={
                        lang === 'es'
                          ? isAutoplay
                            ? 'Autoplay activado: Pasa automáticamente a la siguiente canción en el celular. Toca para desactivar.'
                            : 'Autoplay desactivado: Se detendrá al terminar. Toca para activar.'
                          : isAutoplay
                            ? 'Autoplay on: Advances automatically on mobile. Tap to turn off.'
                            : 'Autoplay off: Stops at song end. Tap to turn on.'
                      }
                      className={`min-h-[44px] min-w-[40px] px-2.5 rounded-lg border transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
                        isAutoplay
                          ? 'text-amber-300 bg-amber-500/20 border-amber-500/40 hover:bg-amber-500/30'
                          : 'text-stone-400 bg-stone-850 border-stone-750 hover:text-stone-200'
                      }`}
                    >
                      <Repeat className={`w-3.5 h-3.5 ${isAutoplay ? 'text-amber-400' : 'text-stone-500'}`} />
                      <span className="text-[10px] font-bold uppercase hidden md:inline">
                        {isAutoplay ? 'Autoplay' : 'Manual'}
                      </span>
                    </button>
                  )}

                  {/* Open in YouTube App */}
                  <a
                    href={
                      activeVideoId
                        ? `https://www.youtube.com/watch?v=${activeVideoId}`
                        : `https://www.youtube.com/results?search_query=${encodeURIComponent(currentTrack.artist + ' ' + currentTrack.title)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    title={
                      lang === 'es'
                        ? 'Abrir esta canción en la app de YouTube'
                        : 'Open this song in YouTube app'
                    }
                    className="min-h-[44px] min-w-[40px] px-2.5 rounded-lg text-stone-400 hover:text-red-400 active:text-red-300 hover:bg-stone-850 border border-stone-750 transition-colors flex items-center justify-center cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-stone-300" />
                  </a>
                </div>
              </div>

              {/* Volume Slider & Controls */}
              <div className="pt-1 flex items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={onToggleMute}
                  title={volume === 0 ? (lang === 'es' ? 'Activar sonido' : 'Unmute') : (lang === 'es' ? 'Silenciar' : 'Mute')}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors flex-shrink-0"
                >
                  {volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : volume < 0.5 ? (
                    <Volume1 className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-amber-400" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onVolumeChange(Math.max(0, Math.round((volume - 0.1) * 100) / 100))}
                  disabled={volume <= 0}
                  className="p-1 rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-750 transition-all flex items-center justify-center flex-shrink-0"
                  title={lang === 'es' ? 'Bajar volumen' : 'Decrease volume'}
                >
                  <Minus className="w-3 h-3" />
                </button>

                <div className="flex-1 flex items-center gap-1.5 min-w-0">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer transition-all"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => onVolumeChange(Math.min(1, Math.round((volume + 0.1) * 100) / 100))}
                  disabled={volume >= 1}
                  className="p-1 rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-750 transition-all flex items-center justify-center flex-shrink-0"
                  title={lang === 'es' ? 'Subir volumen' : 'Increase volume'}
                >
                  <Plus className="w-3 h-3" />
                </button>

                <span className="font-mono text-[11px] font-bold text-amber-400 w-9 text-right flex-shrink-0">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            </div>
          )}

          {/* 4. LISTA DE CANCIONES (JUSTO DEBAJO DE LA BÚSQUEDA) */}
          <div ref={songsListSectionRef} className="space-y-2.5">
            {/* Status indicator while searching */}
            {isSearching && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center gap-2.5 text-amber-300 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span className="text-xs font-bold">
                  {lang === 'es'
                    ? `Buscando canciones en YouTube para "${searchQuery || 'música'}"...`
                    : `Searching songs on YouTube for "${searchQuery || 'music'}"...`}
                </span>
              </div>
            )}

            {/* Error notice if search failed */}
            {searchError && !isSearching && (
              <div className="p-3 text-xs text-amber-200 bg-amber-950/40 rounded-xl border border-amber-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <p className="flex-1 text-left">{searchError}</p>
                <div className="flex items-center gap-2 justify-end flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleSearchYouTube()}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold whitespace-nowrap cursor-pointer min-h-[38px]"
                  >
                    {lang === 'es' ? 'Reintentar' : 'Retry'}
                  </button>
                  {searchQuery && (
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600/40 text-red-200 text-xs font-bold whitespace-nowrap cursor-pointer min-h-[38px] flex items-center gap-1.5 border border-red-500/40"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{lang === 'es' ? 'Abrir en YouTube' : 'Open in YouTube'}</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Section Header & Tabs */}
            {hasSearched ? (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                    <Youtube className="w-4 h-4 text-red-500" />
                    {searchResults.length > 0
                      ? lang === 'es'
                        ? `Canciones para "${searchQuery}" (${displayedSearchResults.length})`
                        : `Songs for "${searchQuery}" (${displayedSearchResults.length})`
                      : lang === 'es'
                      ? `Sin resultados para "${searchQuery}"`
                      : `No results for "${searchQuery}"`}
                  </h4>

                  <button
                    type="button"
                    onClick={() => {
                      setHasSearched(false);
                      setSearchQuery('');
                      setSearchResults([]);
                      setSearchError(null);
                      setGenreFilter('all');
                      if (searchInputRef.current) searchInputRef.current.value = '';
                    }}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2 cursor-pointer py-1 flex items-center gap-1"
                  >
                    <span>{lang === 'es' ? '← Volver a Más Escuchadas' : '← Back to Most Played'}</span>
                  </button>
                </div>

                {/* Filtros de Géneros Populares para la búsqueda o respaldo */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                  {(['all', 'Salsa', 'Bachata', 'Baladas', 'Rancheras'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGenreFilter(g)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                        genreFilter === g
                          ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md shadow-amber-950/30'
                          : 'bg-stone-850 hover:bg-stone-800 text-stone-300 border-stone-750'
                      }`}
                    >
                      {g === 'all' ? (lang === 'es' ? 'Todos' : 'All') : g}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                {/* Selector de Pestañas: Más Escuchadas / Últimas Escuchadas / Recomendadas */}
                <div className="flex items-center gap-1.5 p-1 bg-stone-900/90 rounded-2xl border border-stone-750/80 overflow-x-auto scrollbar-none">
                  {/* Pestaña: Más Escuchadas */}
                  <button
                    type="button"
                    onClick={() => setCatalogView('mostPlayed')}
                    className={`flex-1 min-w-[125px] py-2.5 px-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none touch-manipulation ${
                      catalogView === 'mostPlayed'
                        ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-950/40 font-black'
                        : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                    }`}
                  >
                    <Flame
                      className={`w-4 h-4 ${
                        catalogView === 'mostPlayed' ? 'text-stone-950 fill-stone-950' : 'text-amber-400'
                      }`}
                    />
                    <span className="whitespace-nowrap">
                      {lang === 'es' ? 'Más Escuchadas' : 'Most Played'}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        catalogView === 'mostPlayed'
                          ? 'bg-stone-950/20 text-stone-950 font-black'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {mostPlayedTracks.length}
                    </span>
                  </button>

                  {/* Pestaña: Últimas Escuchadas */}
                  <button
                    type="button"
                    onClick={() => setCatalogView('recent')}
                    className={`flex-1 min-w-[130px] py-2.5 px-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none touch-manipulation ${
                      catalogView === 'recent'
                        ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-950/40 font-black'
                        : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                    }`}
                  >
                    <Clock
                      className={`w-4 h-4 ${
                        catalogView === 'recent' ? 'text-stone-950' : 'text-sky-400'
                      }`}
                    />
                    <span className="whitespace-nowrap">
                      {lang === 'es' ? 'Últimas Escuchadas' : 'Recently Played'}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        catalogView === 'recent'
                          ? 'bg-stone-950/20 text-stone-950 font-black'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {recentTracks.length}
                    </span>
                  </button>

                  {/* Pestaña: Recomendadas Clásicas */}
                  <button
                    type="button"
                    onClick={() => setCatalogView('recommended')}
                    className={`flex-1 min-w-[130px] py-2.5 px-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none touch-manipulation ${
                      catalogView === 'recommended'
                        ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-950/40 font-black'
                        : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                    }`}
                  >
                    <Sparkles
                      className={`w-4 h-4 ${
                        catalogView === 'recommended' ? 'text-stone-950 fill-stone-950' : 'text-amber-400'
                      }`}
                    />
                    <span className="whitespace-nowrap">
                      {lang === 'es' ? 'Recomendadas' : 'Curated'}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        catalogView === 'recommended'
                          ? 'bg-stone-950/20 text-stone-950 font-black'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {CURATED_DOMINO_YOUTUBE_TRACKS.length}
                    </span>
                  </button>
                </div>

                {/* Sub-banner indicador de grabación automática */}
                <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-stone-900/60 border border-stone-800 text-[11px] text-stone-400">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                    <span className="truncate">
                      {catalogView === 'mostPlayed'
                        ? lang === 'es'
                          ? 'Ordenadas automáticamente por las canciones que más escuchas'
                          : 'Automatically sorted by your most played songs'
                        : catalogView === 'recent'
                        ? lang === 'es'
                          ? 'Últimas canciones escuchadas grabadas automáticamente'
                          : 'Automatically recorded recently played songs'
                        : lang === 'es'
                        ? 'Selección clásica curada para jugar partidas de dominó'
                        : 'Classic curated playlist for domino games'}
                    </span>
                  </div>

                  {catalogView !== 'recommended' && history.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsConfirmClearOpen(true)}
                      className="text-[10px] text-stone-400 hover:text-red-400 underline underline-offset-2 flex-shrink-0 cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{lang === 'es' ? 'Limpiar historial' : 'Clear history'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Empty state if searched and no results */}
            {hasSearched && !isSearching && searchResults.length === 0 && (
              <div className="p-6 text-center bg-stone-850/60 rounded-xl border border-stone-750/60 space-y-2">
                <p className="text-xs text-stone-300">
                  {lang === 'es'
                    ? `No se encontraron canciones para "${searchQuery}".`
                    : `No songs found for "${searchQuery}".`}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setHasSearched(false);
                    setSearchQuery('');
                    setSearchResults([]);
                    if (searchInputRef.current) searchInputRef.current.value = '';
                  }}
                  className="px-4 py-2 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl hover:bg-amber-400 cursor-pointer min-h-[44px]"
                >
                  {lang === 'es' ? 'Ver canciones más escuchadas' : 'View most played songs'}
                </button>
              </div>
            )}

            {/* Empty state for history in 'mostPlayed' or 'recent' tabs */}
            {!hasSearched && (catalogView === 'mostPlayed' || catalogView === 'recent') && history.length === 0 && (
              <div className="p-8 text-center bg-stone-900/60 rounded-2xl border border-stone-800 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                  <Headphones className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h5 className="text-sm font-bold text-stone-100">
                    {lang === 'es'
                      ? 'Tu historial de música se grabará automáticamente'
                      : 'Your music history will record automatically'}
                  </h5>
                  <p className="text-xs text-stone-400 max-w-sm mx-auto">
                    {lang === 'es'
                      ? 'Cada canción que reproduzcas desde la búsqueda o las recomendaciones se guardará aquí, contabilizando las que más escuchas.'
                      : 'Every song you play from search or curated recommendations will be saved here, ranking the ones you listen to most.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCatalogView('recommended')}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 fill-stone-950" />
                  <span>{lang === 'es' ? 'Explorar recomendaciones' : 'Explore recommendations'}</span>
                </button>
              </div>
            )}

            {/* Songs List */}
            <div className="space-y-2">
              {/* 1. MODO BÚSQUEDA */}
              {hasSearched &&
                displayedSearchResults.map((track) => {
                  const isThisTrackSelected = Boolean(
                    currentTrack &&
                      (currentTrack.id === track.id ||
                        (Boolean(currentTrack.videoId && track.videoId) && currentTrack.videoId === track.videoId))
                  );
                  const isThisPlaying = isPlaying && isThisTrackSelected;
                  const inHist = history.find(
                    (h) =>
                      h.id === track.id ||
                      (track.videoId && h.track.videoId === track.videoId) ||
                      (h.track.title.toLowerCase() === track.title.toLowerCase() &&
                        h.track.artist.toLowerCase() === track.artist.toLowerCase())
                  );

                  return (
                    <div
                      key={track.id}
                      onClick={() => {
                        if (isThisTrackSelected) {
                          onTogglePlay();
                        } else {
                          handleSelectSong(track, displayedSearchResults);
                        }
                      }}
                      className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer select-none active:scale-[0.99] touch-manipulation min-h-[62px] ${
                        isThisPlaying
                          ? 'bg-amber-500/15 border-amber-500/60 shadow-md shadow-amber-950/20 ring-1 ring-amber-500/40'
                          : isThisTrackSelected
                          ? 'bg-stone-800 border-amber-500/40'
                          : 'bg-stone-850/90 hover:bg-stone-800 active:bg-stone-800 border-stone-750/70 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate flex-1 group">
                        <div className="relative w-14 sm:w-16 h-11 sm:h-12 rounded-lg overflow-hidden bg-stone-900 border border-stone-750 flex-shrink-0 flex items-center justify-center">
                          {track.artworkUrl ? (
                            <img
                              src={track.artworkUrl}
                              alt={track.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <Youtube className="w-5 h-5 text-red-500" />
                          )}
                          {track.durationText && (
                            <div className="absolute bottom-0 right-0 bg-black/85 text-white font-mono text-[9px] px-1 rounded-tl">
                              {track.durationText}
                            </div>
                          )}
                        </div>

                        <div className="truncate flex-1 min-w-0">
                          <h5 className="text-xs sm:text-sm font-bold text-stone-100 group-hover:text-amber-400 transition-colors truncate">
                            {track.title}
                          </h5>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] sm:text-xs text-stone-400 truncate">
                            <span className="truncate">{track.artist}</span>
                            {inHist && inHist.playCount > 0 && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 flex-shrink-0 font-medium">
                                <Flame className="w-2.5 h-2.5 fill-current" />
                                {inHist.playCount} {inHist.playCount === 1 ? 'rep' : 'reps'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                        <a
                          href={
                            track.videoId
                              ? `https://www.youtube.com/watch?v=${track.videoId}`
                              : `https://www.youtube.com/results?search_query=${encodeURIComponent(track.artist + ' ' + track.title)}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title={lang === 'es' ? 'Abrir en YouTube' : 'Open in YouTube'}
                          className="p-2 sm:p-2.5 rounded-xl text-stone-400 hover:text-red-400 active:text-red-300 bg-stone-900/60 hover:bg-stone-900 border border-stone-750 transition-colors flex items-center justify-center min-h-[44px] min-w-[44px] touch-manipulation cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4 text-stone-300 hover:text-red-400" />
                        </a>

                        <button
                          type="button"
                          disabled={resolvingTrackId === track.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isThisTrackSelected) {
                              onTogglePlay();
                            } else {
                              handleSelectSong(track, displayedSearchResults);
                            }
                          }}
                          className={`min-h-[44px] min-w-[44px] px-3.5 sm:px-4 py-2 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-1.5 touch-manipulation cursor-pointer text-xs sm:text-sm ${
                            isThisPlaying
                              ? 'bg-amber-500 text-stone-950 shadow-amber-950/30 ring-2 ring-amber-400'
                              : 'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white shadow-red-950/30'
                          }`}
                        >
                          {resolvingTrackId === track.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                          ) : isThisPlaying ? (
                            <>
                              <Pause className="w-4 h-4 fill-current" />
                              <span className="hidden xs:inline">{t.pause}</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                              <span className="hidden xs:inline">{t.play}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}

              {/* 2. MODO MÁS ESCUCHADAS (TOP DEL HISTORIAL) */}
              {!hasSearched &&
                catalogView === 'mostPlayed' &&
                (() => {
                  const mostPlayedPlaylist = mostPlayedTracks.map((m) => m.track);
                  return mostPlayedTracks.map((item, idx) => {
                    const track = item.track;
                    const isThisTrackSelected = Boolean(
                      currentTrack &&
                        (currentTrack.id === track.id ||
                          (Boolean(currentTrack.videoId && track.videoId) && currentTrack.videoId === track.videoId))
                    );
                    const isThisPlaying = isPlaying && isThisTrackSelected;

                    // Medalla de posición
                    const rankBadge =
                      idx === 0
                        ? 'bg-amber-500 text-stone-950 font-black shadow-sm shadow-amber-500/30 ring-1 ring-amber-400'
                        : idx === 1
                        ? 'bg-stone-300 text-stone-950 font-black ring-1 ring-stone-200'
                        : idx === 2
                        ? 'bg-amber-700 text-amber-100 font-black ring-1 ring-amber-600'
                        : 'bg-stone-800 text-stone-400 font-bold border border-stone-700';

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (isThisTrackSelected) {
                            onTogglePlay();
                          } else {
                            handleSelectSong(track, mostPlayedPlaylist);
                          }
                        }}
                        className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer select-none active:scale-[0.99] touch-manipulation min-h-[64px] ${
                          isThisPlaying
                            ? 'bg-amber-500/15 border-amber-500/60 shadow-md shadow-amber-950/20 ring-1 ring-amber-500/40'
                            : isThisTrackSelected
                            ? 'bg-stone-800 border-amber-500/40'
                            : 'bg-stone-850/90 hover:bg-stone-800 active:bg-stone-800 border-stone-750/70 hover:border-stone-700'
                        }`}
                      >
                        {/* Left: Rank, Thumbnail & Details */}
                        <div className="flex items-center gap-2.5 sm:gap-3 truncate flex-1 group">
                          {/* Indicador de posición en el Top */}
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${rankBadge}`}
                            title={
                              lang === 'es'
                                ? `Posición #${idx + 1} más escuchada`
                                : `#${idx + 1} most played`
                            }
                          >
                            #{idx + 1}
                          </div>

                          {/* Artwork */}
                          <div className="relative w-14 sm:w-16 h-11 sm:h-12 rounded-lg overflow-hidden bg-stone-900 border border-stone-750 flex-shrink-0 flex items-center justify-center">
                            {track.artworkUrl ? (
                              <img
                                src={track.artworkUrl}
                                alt={track.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <Youtube className="w-5 h-5 text-red-500" />
                            )}
                            {track.durationText && (
                              <div className="absolute bottom-0 right-0 bg-black/85 text-white font-mono text-[9px] px-1 rounded-tl">
                                {track.durationText}
                              </div>
                            )}
                          </div>

                          {/* Title, Artist, & Play Count Badges */}
                          <div className="truncate flex-1 min-w-0">
                            <h5 className="text-xs sm:text-sm font-bold text-stone-100 group-hover:text-amber-400 transition-colors truncate">
                              {track.title}
                            </h5>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] sm:text-xs text-stone-400 truncate flex-wrap">
                              <span className="truncate text-stone-300 font-medium">{track.artist}</span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex-shrink-0">
                                <Flame className="w-3 h-3 fill-current text-amber-400" />
                                <span>
                                  {item.playCount}{' '}
                                  {item.playCount === 1
                                    ? lang === 'es'
                                      ? 'reproducción'
                                      : 'play'
                                    : lang === 'es'
                                    ? 'reproducciones'
                                    : 'plays'}
                                </span>
                              </span>
                              <span className="hidden sm:inline text-[10px] text-stone-500">
                                • {lang === 'es' ? 'Última:' : 'Last:'} {formatRelativeTime(item.playedAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                          {/* Quitar del historial */}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteFromHistory(e, item.id)}
                            title={lang === 'es' ? 'Quitar del historial' : 'Remove from history'}
                            className="p-2 sm:p-2.5 rounded-xl text-stone-400 hover:text-red-400 active:text-red-300 bg-stone-900/60 hover:bg-stone-900 border border-stone-750 transition-colors flex items-center justify-center min-h-[44px] min-w-[44px] touch-manipulation cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 text-stone-400 hover:text-red-400" />
                          </button>

                          {/* Abrir en YouTube */}
                          <a
                            href={
                              track.videoId
                                ? `https://www.youtube.com/watch?v=${track.videoId}`
                                : `https://www.youtube.com/results?search_query=${encodeURIComponent(track.artist + ' ' + track.title)}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title={lang === 'es' ? 'Abrir en YouTube' : 'Open in YouTube'}
                            className="p-2 sm:p-2.5 rounded-xl text-stone-400 hover:text-red-400 active:text-red-300 bg-stone-900/60 hover:bg-stone-900 border border-stone-750 transition-colors flex items-center justify-center min-h-[44px] min-w-[44px] touch-manipulation cursor-pointer"
                          >
                            <ExternalLink className="w-4 h-4 text-stone-300 hover:text-red-400" />
                          </a>

                          {/* Direct play button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isThisTrackSelected) {
                                onTogglePlay();
                              } else {
                                handleSelectSong(track, mostPlayedPlaylist);
                              }
                            }}
                          className={`min-h-[44px] min-w-[44px] px-3.5 sm:px-4 py-2 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-1.5 touch-manipulation cursor-pointer text-xs sm:text-sm ${
                            isThisPlaying
                              ? 'bg-amber-500 text-stone-950 shadow-amber-950/30 ring-2 ring-amber-400'
                              : 'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white shadow-red-950/30'
                          }`}
                        >
                          {isThisPlaying ? (
                            <>
                              <Pause className="w-4 h-4 fill-current" />
                              <span className="hidden xs:inline">{t.pause}</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                              <span className="hidden xs:inline">{t.play}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                });
              })()}

              {/* 3. MODO ÚLTIMAS ESCUCHADAS (CRONOLÓGICO) */}
              {!hasSearched &&
                catalogView === 'recent' &&
                (() => {
                  const recentPlaylist = recentTracks.map((r) => r.track);
                  return recentTracks.map((item) => {
                    const track = item.track;
                    const isThisTrackSelected = Boolean(
                      currentTrack &&
                        (currentTrack.id === track.id ||
                          (Boolean(currentTrack.videoId && track.videoId) && currentTrack.videoId === track.videoId))
                    );
                    const isThisPlaying = isPlaying && isThisTrackSelected;

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (isThisTrackSelected) {
                            onTogglePlay();
                          } else {
                            handleSelectSong(track, recentPlaylist);
                          }
                        }}
                        className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer select-none active:scale-[0.99] touch-manipulation min-h-[64px] ${
                          isThisPlaying
                            ? 'bg-amber-500/15 border-amber-500/60 shadow-md shadow-amber-950/20 ring-1 ring-amber-500/40'
                            : isThisTrackSelected
                            ? 'bg-stone-800 border-amber-500/40'
                            : 'bg-stone-850/90 hover:bg-stone-800 active:bg-stone-800 border-stone-750/70 hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate flex-1 group">
                          <div className="relative w-14 sm:w-16 h-11 sm:h-12 rounded-lg overflow-hidden bg-stone-900 border border-stone-750 flex-shrink-0 flex items-center justify-center">
                            {track.artworkUrl ? (
                              <img
                                src={track.artworkUrl}
                                alt={track.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <Youtube className="w-5 h-5 text-red-500" />
                            )}
                            {track.durationText && (
                              <div className="absolute bottom-0 right-0 bg-black/85 text-white font-mono text-[9px] px-1 rounded-tl">
                                {track.durationText}
                              </div>
                            )}
                          </div>

                          <div className="truncate flex-1 min-w-0">
                            <h5 className="text-xs sm:text-sm font-bold text-stone-100 group-hover:text-amber-400 transition-colors truncate">
                              {track.title}
                            </h5>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] sm:text-xs text-stone-400 truncate flex-wrap">
                              <span className="truncate text-stone-300 font-medium">{track.artist}</span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex-shrink-0">
                                <Clock className="w-3 h-3 text-sky-400" />
                                <span>{formatRelativeTime(item.playedAt)}</span>
                              </span>
                              <span className="text-[10px] text-stone-400 flex items-center gap-1">
                                • {item.playCount} {item.playCount === 1 ? 'vez' : 'veces'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleDeleteFromHistory(e, item.id)}
                            title={lang === 'es' ? 'Quitar del historial' : 'Remove from history'}
                            className="p-2 sm:p-2.5 rounded-xl text-stone-400 hover:text-red-400 active:text-red-300 bg-stone-900/60 hover:bg-stone-900 border border-stone-750 transition-colors flex items-center justify-center min-h-[44px] min-w-[44px] touch-manipulation cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 text-stone-400 hover:text-red-400" />
                          </button>

                          <a
                            href={
                              track.videoId
                                ? `https://www.youtube.com/watch?v=${track.videoId}`
                                : `https://www.youtube.com/results?search_query=${encodeURIComponent(track.artist + ' ' + track.title)}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title={lang === 'es' ? 'Abrir en YouTube' : 'Open in YouTube'}
                            className="p-2 sm:p-2.5 rounded-xl text-stone-400 hover:text-red-400 active:text-red-300 bg-stone-900/60 hover:bg-stone-900 border border-stone-750 transition-colors flex items-center justify-center min-h-[44px] min-w-[44px] touch-manipulation cursor-pointer"
                          >
                            <ExternalLink className="w-4 h-4 text-stone-300 hover:text-red-400" />
                          </a>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isThisTrackSelected) {
                                onTogglePlay();
                              } else {
                                handleSelectSong(track, recentPlaylist);
                              }
                            }}
                            className={`min-h-[44px] min-w-[44px] px-3.5 sm:px-4 py-2 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-1.5 touch-manipulation cursor-pointer text-xs sm:text-sm ${
                              isThisPlaying
                                ? 'bg-amber-500 text-stone-950 shadow-amber-950/30 ring-2 ring-amber-400'
                                : 'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white shadow-red-950/30'
                            }`}
                          >
                            {isThisPlaying ? (
                              <>
                                <Pause className="w-4 h-4 fill-current" />
                                <span className="hidden xs:inline">{t.pause}</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                                <span className="hidden xs:inline">{t.play}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  });
                })()}

              {/* 4. MODO RECOMENDADAS CLÁSICAS DE DOMINÓ */}
              {!hasSearched &&
                catalogView === 'recommended' &&
                CURATED_DOMINO_YOUTUBE_TRACKS.map((track) => {
                  const isThisTrackSelected = Boolean(
                    currentTrack &&
                      (currentTrack.id === track.id ||
                        (Boolean(currentTrack.videoId && track.videoId) && currentTrack.videoId === track.videoId))
                  );
                  const isThisPlaying = isPlaying && isThisTrackSelected;
                  const inHist = history.find(
                    (h) =>
                      h.id === track.id ||
                      (track.videoId && h.track.videoId === track.videoId) ||
                      (h.track.title.toLowerCase() === track.title.toLowerCase() &&
                        h.track.artist.toLowerCase() === track.artist.toLowerCase())
                  );

                  return (
                    <div
                      key={track.id}
                      onClick={() => {
                        if (isThisTrackSelected) {
                          onTogglePlay();
                        } else {
                          handleSelectSong(track, CURATED_DOMINO_YOUTUBE_TRACKS);
                        }
                      }}
                      className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer select-none active:scale-[0.99] touch-manipulation min-h-[62px] ${
                        isThisPlaying
                          ? 'bg-amber-500/15 border-amber-500/60 shadow-md shadow-amber-950/20 ring-1 ring-amber-500/40'
                          : isThisTrackSelected
                          ? 'bg-stone-800 border-amber-500/40'
                          : 'bg-stone-850/90 hover:bg-stone-800 active:bg-stone-800 border-stone-750/70 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate flex-1 group">
                        <div className="relative w-14 sm:w-16 h-11 sm:h-12 rounded-lg overflow-hidden bg-stone-900 border border-stone-750 flex-shrink-0 flex items-center justify-center">
                          {track.artworkUrl ? (
                            <img
                              src={track.artworkUrl}
                              alt={track.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <Youtube className="w-5 h-5 text-red-500" />
                          )}
                          {track.durationText && (
                            <div className="absolute bottom-0 right-0 bg-black/85 text-white font-mono text-[9px] px-1 rounded-tl">
                              {track.durationText}
                            </div>
                          )}
                        </div>

                        <div className="truncate flex-1 min-w-0">
                          <h5 className="text-xs sm:text-sm font-bold text-stone-100 group-hover:text-amber-400 transition-colors truncate">
                            {track.title}
                          </h5>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] sm:text-xs text-stone-400 truncate">
                            <span className="truncate">{track.artist}</span>
                            {inHist && inHist.playCount > 0 && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 flex-shrink-0 font-medium">
                                <Flame className="w-2.5 h-2.5 fill-current text-amber-400" />
                                {inHist.playCount} {inHist.playCount === 1 ? 'vez' : 'veces'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                        <a
                          href={
                            track.videoId
                              ? `https://www.youtube.com/watch?v=${track.videoId}`
                              : `https://www.youtube.com/results?search_query=${encodeURIComponent(track.artist + ' ' + track.title)}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title={lang === 'es' ? 'Abrir en YouTube' : 'Open in YouTube'}
                          className="p-2 sm:p-2.5 rounded-xl text-stone-400 hover:text-red-400 active:text-red-300 bg-stone-900/60 hover:bg-stone-900 border border-stone-750 transition-colors flex items-center justify-center min-h-[44px] min-w-[44px] touch-manipulation cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4 text-stone-300 hover:text-red-400" />
                        </a>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isThisTrackSelected) {
                              onTogglePlay();
                            } else {
                              handleSelectSong(track, CURATED_DOMINO_YOUTUBE_TRACKS);
                            }
                          }}
                          className={`min-h-[44px] min-w-[44px] px-3.5 sm:px-4 py-2 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-1.5 touch-manipulation cursor-pointer text-xs sm:text-sm ${
                            isThisPlaying
                              ? 'bg-amber-500 text-stone-950 shadow-amber-950/30 ring-2 ring-amber-400'
                              : 'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white shadow-red-950/30'
                          }`}
                        >
                          {isThisPlaying ? (
                            <>
                              <Pause className="w-4 h-4 fill-current" />
                              <span className="hidden xs:inline">{t.pause}</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                              <span className="hidden xs:inline">{t.play}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Confirm Clear History Dialog */}
            {isConfirmClearOpen && (
              <div
                role="dialog"
                aria-modal="true"
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
              >
                <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-xs w-full p-5 shadow-2xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 flex-shrink-0">
                      <Trash2 className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-100">
                        {lang === 'es' ? '¿Borrar historial?' : 'Clear history?'}
                      </h3>
                      <p className="text-xs text-stone-400">
                        {lang === 'es'
                          ? 'Se eliminarán todas las canciones guardadas y sus contadores.'
                          : 'All saved songs and their play counts will be removed.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsConfirmClearOpen(false)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 active:bg-stone-600 text-stone-300 font-bold text-xs border border-stone-700 transition-all cursor-pointer"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAllHistory}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-black text-xs transition-all shadow-lg shadow-red-950/40 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{lang === 'es' ? 'Sí, borrar' : 'Yes, clear'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
