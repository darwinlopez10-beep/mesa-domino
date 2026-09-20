import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  X,
  Disc3,
  Maximize2,
  Youtube,
  Tv,
  Plus,
  Minus,
  Sliders,
  ExternalLink,
  SkipBack,
  SkipForward,
  Radio,
  Repeat,
  AlertCircle,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { MusicTrack } from '../types';
import { AppLanguage } from '../utils/i18n';
import { extractYouTubeId, CURATED_DOMINO_YOUTUBE_TRACKS } from './MusicPlayerModal';
import { parseDurationText } from '../utils/backgroundAudio';

interface MiniMusicPlayerProps {
  track: MusicTrack;
  playlist?: MusicTrack[];
  onTrackAutoAdvanced?: (nextTrack: MusicTrack, playlistContext?: MusicTrack[]) => void;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onVolumeChange: (newVol: number) => void;
  onToggleMute?: () => void;
  onOpenFullPlayer: () => void;
  onClosePlayer: () => void;
  onNextTrack?: () => void;
  onPrevTrack?: () => void;
  isAutoplay?: boolean;
  onToggleAutoplay?: () => void;
  isModalOpen?: boolean;
  lang?: AppLanguage;
}

export const MiniMusicPlayer: React.FC<MiniMusicPlayerProps> = ({
  track,
  playlist,
  onTrackAutoAdvanced,
  isPlaying,
  volume,
  currentTime,
  duration,
  onTogglePlay,
  onVolumeChange,
  onToggleMute,
  onOpenFullPlayer,
  onClosePlayer,
  onNextTrack,
  onPrevTrack,
  isAutoplay = true,
  onToggleAutoplay,
  isModalOpen = false,
  lang = 'es',
}) => {
  const [showVideo, setShowVideo] = useState(true);
  const [showVolumeControls, setShowVolumeControls] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const preMuteRef = useRef(volume > 0 ? volume : 0.7);

  // Mantener guardado el último volumen activo no nulo
  useEffect(() => {
    if (volume > 0) {
      preMuteRef.current = volume;
    }
  }, [volume]);

  const handleMuteClick = () => {
    if (onToggleMute) {
      onToggleMute();
    } else {
      if (volume > 0) {
        preMuteRef.current = volume;
        onVolumeChange(0);
      } else {
        const restored = preMuteRef.current > 0 ? preMuteRef.current : 0.7;
        onVolumeChange(restored);
      }
    }
  };

  const isYouTube = track.sourceType === 'youtube';
  const ytVideoId = track.videoId || extractYouTubeId(track.url);

  // YouTube live playback state reported by iframe
  const [ytCurrentTime, setYtCurrentTime] = useState(0);
  const [ytDuration, setYtDuration] = useState(0);
  const [embedError, setEmbedError] = useState<number | null>(null);
  const [isAutoRecovering, setIsAutoRecovering] = useState(false);

  // Extraer cola de reproducción continua nativa para el reproductor embebido de YouTube
  // Esto permite que en iPhone Safari y Android Chrome, el reproductor interno de YouTube
  // pase de una canción a la siguiente automáticamente sin bloqueo de autoplay del navegador.
  const upcomingVideoIds = useMemo(() => {
    const list = playlist && playlist.length > 0 ? playlist : CURATED_DOMINO_YOUTUBE_TRACKS;
    const currentId = ytVideoId;
    if (!currentId) return [];

    const ordered: string[] = [];
    const currentIdx = list.findIndex(
      (t) => (t.videoId || extractYouTubeId(t.url)) === currentId
    );

    if (currentIdx !== -1) {
      // 1. Añadir primero las siguientes canciones en orden
      for (let i = currentIdx + 1; i < list.length; i++) {
        const id = list[i].videoId || extractYouTubeId(list[i].url);
        if (id && id !== currentId && !ordered.includes(id)) {
          ordered.push(id);
        }
      }
      // 2. Luego hacer ciclo continuo con las canciones anteriores
      for (let i = 0; i < currentIdx; i++) {
        const id = list[i].videoId || extractYouTubeId(list[i].url);
        if (id && id !== currentId && !ordered.includes(id)) {
          ordered.push(id);
        }
      }
    }

    // Si la lista tiene pocas canciones o es una canción individual,
    // completar con el catálogo clásico de dominó para asegurar continuidad infinita
    if (ordered.length < 10) {
      for (const t of CURATED_DOMINO_YOUTUBE_TRACKS) {
        const id = t.videoId || extractYouTubeId(t.url);
        if (id && id !== currentId && !ordered.includes(id)) {
          ordered.push(id);
        }
      }
    }

    // Mantener hasta 25 IDs
    return ordered.slice(0, 25);
  }, [playlist, ytVideoId]);

  // Parse estimated track duration (from durationSeconds or "3:45" text)
  const estimatedSeconds =
    track.durationSeconds || parseDurationText(track.durationText) || 0;
  const effectiveDuration =
    ytDuration > 0 ? ytDuration : duration > 0 ? duration : estimatedSeconds;
  const effectiveCurrentTime = ytCurrentTime > 0 ? ytCurrentTime : currentTime;

  // Calculate percentage for progress bar
  const progressPercent =
    effectiveDuration > 0
      ? Math.min(100, (effectiveCurrentTime / effectiveDuration) * 100)
      : 0;

  // Construct standard YouTube embed URL with JavaScript API enabled (without broken search or origin restrictions)
  const embedUrl = ytVideoId
    ? `https://www.youtube.com/embed/${ytVideoId}?autoplay=${isPlaying ? 1 : 0}&playsinline=1&enablejsapi=1&version=3&rel=0`
    : track.url && track.url.includes('embed')
    ? track.url
    : '';

  const [currentIframeSrc, setCurrentIframeSrc] = useState(embedUrl);

  // Helper to send commands to YouTube IFrame API (supports both array and object formats)
  const sendYouTubeCommand = useCallback(
    (func: string, args: (string | number | object)[] = []) => {
      if (!iframeRef.current?.contentWindow) return;
      try {
        const message = JSON.stringify({
          event: 'command',
          func,
          args,
        });
        iframeRef.current.contentWindow.postMessage(message, '*');

        // Para loadVideoById, enviar también formato con objeto para compatibilidad total de navegadores móviles
        if (func === 'loadVideoById' && typeof args[0] === 'string') {
          const altMessage = JSON.stringify({
            event: 'command',
            func: 'loadVideoById',
            args: [{ videoId: args[0], startSeconds: args[1] || 0 }],
          });
          iframeRef.current.contentWindow.postMessage(altMessage, '*');
        }
      } catch (err) {
        console.warn('YouTube postMessage notice:', err);
      }
    },
    []
  );

  // Handle Play / Pause for YouTube iframe via postMessage
  useEffect(() => {
    if (!isYouTube || !iframeLoaded) return;

    if (isPlaying) {
      sendYouTubeCommand('playVideo');
      const t = setTimeout(() => sendYouTubeCommand('playVideo'), 100);
      return () => clearTimeout(t);
    } else {
      sendYouTubeCommand('pauseVideo');
      const t = setTimeout(() => sendYouTubeCommand('pauseVideo'), 100);
      return () => clearTimeout(t);
    }
  }, [isPlaying, isYouTube, iframeLoaded, sendYouTubeCommand]);

  // Handle Volume change for YouTube iframe (0 to 100)
  useEffect(() => {
    if (!isYouTube || !iframeLoaded) return;

    const targetVol = Math.round(volume * 100);

    if (volume === 0) {
      sendYouTubeCommand('mute');
      sendYouTubeCommand('setVolume', [0]);
    } else {
      sendYouTubeCommand('unMute');
      sendYouTubeCommand('setVolume', [targetVol]);
    }
  }, [volume, isYouTube, iframeLoaded, sendYouTubeCommand]);

  // Protección y resistencia para reproducción en segundo plano:
  // Cuando el usuario cambia de app (WhatsApp, navegador, etc.) o bloquea la pantalla,
  // los navegadores móviles pueden intentar pausar videos en iframes.
  // Enviamos inmediatamente el comando playVideo para evitar la pausa automática.
  useEffect(() => {
    if (!isYouTube) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isPlaying) {
        sendYouTubeCommand('playVideo');
        setTimeout(() => sendYouTubeCommand('playVideo'), 150);
        setTimeout(() => sendYouTubeCommand('playVideo'), 450);
        setTimeout(() => sendYouTubeCommand('playVideo'), 1200);
      } else if (document.visibilityState === 'visible' && isPlaying) {
        sendYouTubeCommand('playVideo');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handleVisibilityChange);
    };
  }, [isYouTube, isPlaying, sendYouTubeCommand]);

  // Guard against duplicate triggers of next track for the same song
  const hasTriggeredNextRef = useRef(false);
  const prevLoadedVideoIdRef = useRef<string | null>(ytVideoId || track.id || null);
  const lastKnownVideoIdRef = useRef<string>(ytVideoId || '');
  const playStartTimestampRef = useRef<number>(Date.now());

  // Reset trigger flag and timers when track changes
  useEffect(() => {
    hasTriggeredNextRef.current = false;
    playStartTimestampRef.current = Date.now();
    setYtCurrentTime(0);
    setYtDuration(0);
    setEmbedError(null);
    if (ytVideoId) {
      lastKnownVideoIdRef.current = ytVideoId;
    }
  }, [track.id, track.videoId, track.url, ytVideoId]);

  const triggerNextTrack = useCallback(() => {
    // If Autoplay is disabled, pause instead of skipping automatically
    if (!isAutoplay) {
      if (isPlaying) {
        onTogglePlay();
      }
      return;
    }

    if (hasTriggeredNextRef.current) return;
    hasTriggeredNextRef.current = true;

    // 1. Enviar comando nativo nextVideo al reproductor de YouTube para que avance de inmediato
    sendYouTubeCommand('nextVideo');
    sendYouTubeCommand('playVideo');

    // 2. Permitir recuperación si pasan más de 3 segundos
    setTimeout(() => {
      hasTriggeredNextRef.current = false;
    }, 3000);

    // 3. Notificar a la aplicación para actualizar la canción activa en el catálogo
    if (onNextTrack) {
      onNextTrack();
    }
  }, [isAutoplay, isPlaying, onTogglePlay, onNextTrack, sendYouTubeCommand]);

  // Intentar encontrar automáticamente una versión alternativa reproducible si YouTube bloquea la inserción (Error 101/150)
  const handleAutoRecoverVideo = useCallback(async () => {
    if (isAutoRecovering) return;
    setIsAutoRecovering(true);
    try {
      const q = `${track.artist} ${track.title} audio`;
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(q)}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = await res.json();
        const altTrack = data?.results?.find(
          (r: any) => r && r.videoId && r.videoId !== ytVideoId && r.videoId.length === 11
        );
        if (altTrack && onTrackAutoAdvanced) {
          const newTrack: MusicTrack = {
            ...track,
            videoId: altTrack.videoId,
            url: `https://www.youtube.com/embed/${altTrack.videoId}?autoplay=1&playsinline=1&enablejsapi=1`,
            artworkUrl: altTrack.artworkUrl || track.artworkUrl,
          };
          setEmbedError(null);
          onTrackAutoAdvanced(newTrack, playlist);
          setIsAutoRecovering(false);
          return;
        }
      }
    } catch {
      // Ignorar fallo de red
    }
    setIsAutoRecovering(false);
  }, [isAutoRecovering, track, ytVideoId, onTrackAutoAdvanced, playlist]);

  // Listen to YouTube postMessage events (onStateChange: 0 means ENDED, infoDelivery playerState: 0, onError)
  useEffect(() => {
    if (!isYouTube) return;

    const handleMessage = (event: MessageEvent) => {
      let data = event.data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }

      if (!data || typeof data !== 'object') return;

      // 1. YouTube onStateChange event:
      // YT.PlayerState.ENDED = 0
      if (data.event === 'onStateChange') {
        const state = data.info !== undefined ? data.info : data.data;
        if (state === 0) {
          triggerNextTrack();
        }
      }

      // 2. YouTube infoDelivery event:
      if (data.event === 'infoDelivery' && data.info) {
        if (typeof data.info.currentTime === 'number') {
          setYtCurrentTime(data.info.currentTime);
        }
        if (typeof data.info.duration === 'number' && data.info.duration > 0) {
          setYtDuration(data.info.duration);
        }

        // Detección de avance automático nativo dentro del reproductor de YouTube:
        const incomingVideoId = data.info?.videoData?.video_id;
        if (
          incomingVideoId &&
          typeof incomingVideoId === 'string' &&
          incomingVideoId.length >= 8 &&
          incomingVideoId !== ytVideoId &&
          incomingVideoId !== lastKnownVideoIdRef.current
        ) {
          lastKnownVideoIdRef.current = incomingVideoId;
          const list = playlist && playlist.length > 0 ? playlist : CURATED_DOMINO_YOUTUBE_TRACKS;
          const matched = list.find(
            (t) => (t.videoId || extractYouTubeId(t.url)) === incomingVideoId
          );
          if (matched && onTrackAutoAdvanced) {
            onTrackAutoAdvanced(matched, playlist);
          } else if (onTrackAutoAdvanced) {
            const autoTrack: MusicTrack = {
              id: `yt_${incomingVideoId}`,
              videoId: incomingVideoId,
              title: data.info.videoData.title || track.title,
              artist: data.info.videoData.author || track.artist,
              sourceType: 'youtube',
              url: `https://www.youtube.com/embed/${incomingVideoId}?autoplay=1&playsinline=1&enablejsapi=1`,
              artworkUrl: `https://img.youtube.com/vi/${incomingVideoId}/hqdefault.jpg`,
            };
            onTrackAutoAdvanced(autoTrack, playlist);
          }
        }

        if (data.info.playerState === 0) {
          triggerNextTrack();
        } else if (
          typeof data.info.currentTime === 'number' &&
          typeof data.info.duration === 'number' &&
          data.info.duration > 10 &&
          data.info.currentTime >= data.info.duration - 1.2
        ) {
          triggerNextTrack();
        }
      }

      // 3. YouTube Error Event (e.g. 101/150 embed blocked, 100 video not found, 2/5 invalid params)
      if (data.event === 'onError' || (data.event === 'infoDelivery' && data.info?.errorCode)) {
        const errCode = Number(data.data ?? data.info?.errorCode ?? 150);
        console.warn('YouTube playback error or embed restriction code:', errCode);
        setEmbedError(errCode);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isYouTube, triggerNextTrack, ytVideoId, playlist, onTrackAutoAdvanced, track.title, track.artist]);

  // Polling fallback to query YouTube player state and keep communication open
  useEffect(() => {
    if (!isYouTube || !isPlaying || !iframeLoaded) return;

    const interval = setInterval(() => {
      sendYouTubeCommand('getPlayerState');
      sendYouTubeCommand('getCurrentTime');
      sendYouTubeCommand('getDuration');
      if (iframeRef.current?.contentWindow) {
        try {
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'listening' }),
            '*'
          );
        } catch {}
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [isYouTube, isPlaying, iframeLoaded, sendYouTubeCommand]);

  // Temporizador de respaldo para autoplay en celulares con pantalla bloqueada:
  // Si la canción tiene una duración conocida y el navegador suspende postMessage,
  // el timer del hilo principal (mantenido despierto por el carrier de audio silencioso)
  // pasará a la siguiente canción automáticamente al cumplirse la duración.
  useEffect(() => {
    if (!isPlaying || !isAutoplay) return;

    const totalDuration =
      ytDuration > 0
        ? ytDuration
        : estimatedSeconds > 0
        ? estimatedSeconds
        : duration;

    if (!totalDuration || totalDuration < 15) return;

    const durationCheckInterval = setInterval(() => {
      const elapsed = (Date.now() - playStartTimestampRef.current) / 1000;
      if (elapsed >= totalDuration + 1.5) {
        triggerNextTrack();
      }
    }, 2000);

    return () => clearInterval(durationCheckInterval);
  }, [
    isPlaying,
    isAutoplay,
    ytDuration,
    estimatedSeconds,
    duration,
    triggerNextTrack,
  ]);

  // Handle seamless track transition in existing iframe on mobile
  // Mobile browsers allow loadVideoById on an already activated iframe!
  useEffect(() => {
    if (!isYouTube) return;

    const currentKey = ytVideoId || track.id || track.url;
    if (prevLoadedVideoIdRef.current === currentKey) return;
    prevLoadedVideoIdRef.current = currentKey;

    // Si YouTube ya avanzó nativamente y ya está reproduciendo este ID,
    // evitamos enviar loadVideoById redundante para no generar pausas
    if (lastKnownVideoIdRef.current === ytVideoId && ytVideoId) {
      return;
    }
    if (ytVideoId) {
      lastKnownVideoIdRef.current = ytVideoId;
    }

    if (iframeLoaded) {
      if (ytVideoId) {
        sendYouTubeCommand('loadVideoById', [ytVideoId, 0]);
        sendYouTubeCommand('setVolume', [Math.round(volume * 100)]);
        if (volume === 0) {
          sendYouTubeCommand('mute');
        } else {
          sendYouTubeCommand('unMute');
        }
        sendYouTubeCommand('playVideo');
        const t1 = setTimeout(() => sendYouTubeCommand('playVideo'), 250);
        const t2 = setTimeout(() => sendYouTubeCommand('playVideo'), 750);
        setCurrentIframeSrc(embedUrl);
        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
        };
      } else if (track.url) {
        sendYouTubeCommand('loadVideoByUrl', [embedUrl]);
        sendYouTubeCommand('playVideo');
        setCurrentIframeSrc(embedUrl);
      }
    } else {
      setCurrentIframeSrc(embedUrl);
    }
  }, [ytVideoId, track.id, track.url, isYouTube, iframeLoaded, volume, embedUrl, sendYouTubeCommand]);

  // When YouTube iframe finishes loading, initialize its state
  const handleIframeLoad = () => {
    setIframeLoaded(true);
    sendYouTubeCommand('listening');
    sendYouTubeCommand('addEventListener', ['onStateChange']);
    sendYouTubeCommand('setVolume', [Math.round(volume * 100)]);

    if (volume === 0) {
      sendYouTubeCommand('mute');
    }

    if (!isPlaying) {
      sendYouTubeCommand('pauseVideo');
    } else {
      sendYouTubeCommand('playVideo');
    }
  };

  // Subir volumen (+10%)
  const handleIncreaseVolume = () => {
    const next = Math.min(1, Math.round((volume + 0.1) * 100) / 100);
    onVolumeChange(next);
  };

  // Bajar volumen (-10%)
  const handleDecreaseVolume = () => {
    const next = Math.max(0, Math.round((volume - 0.1) * 100) / 100);
    onVolumeChange(next);
  };

  return (
    <div
      id="mini-music-player-container"
      className={`transition-all duration-300 ${
        isModalOpen
          ? 'opacity-0 pointer-events-none fixed -bottom-96 -right-96 z-0'
          : 'fixed bottom-16 sm:bottom-6 landscape:bottom-2 left-2 right-2 sm:left-auto sm:right-6 landscape:left-auto landscape:right-3 sm:w-96 landscape:w-84 z-40 animate-in slide-in-from-bottom-3 duration-200'
      }`}
    >
      <div className="bg-stone-900/95 backdrop-blur-md border border-stone-750/90 rounded-2xl shadow-2xl shadow-black/80 p-2.5 sm:p-3 flex flex-col gap-2">
        {/* Persistent YouTube iframe element (keeps playing in background even if modal is open) */}
        {isYouTube && (ytVideoId || track.artist || track.url) && (
          <div
            className={`transition-all duration-300 overflow-hidden rounded-xl bg-black border border-stone-800 relative ${
              showVideo ? 'w-full aspect-video opacity-100 mb-1' : 'w-full h-1 opacity-0 pointer-events-none'
            }`}
          >
            <iframe
              ref={iframeRef}
              id="persistent-domino-youtube-iframe"
              src={currentIframeSrc}
              title={track.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              onLoad={handleIframeLoad}
              className="w-full h-full"
            />

            {/* Aviso y recuperación automática si YouTube bloquea la inserción (Error 101/150 o no disponible) */}
            {embedError !== null && showVideo && (
              <div className="absolute inset-0 bg-stone-950/92 backdrop-blur-md flex flex-col items-center justify-center p-3 text-center z-10 animate-in fade-in duration-200">
                <AlertCircle className="w-8 h-8 text-amber-400 mb-2 flex-shrink-0" />
                <p className="text-xs font-bold text-stone-100 mb-1">
                  {lang === 'es'
                    ? 'Este video tiene restricción de reproducción externa'
                    : 'This video has embedding playback restrictions'}
                </p>
                <p className="text-[11px] text-stone-400 mb-3 max-w-xs leading-relaxed">
                  {lang === 'es'
                    ? 'El autor restringió la reproducción en otras apps. Toca abajo para buscar otra versión o abrirlo directamente.'
                    : 'The author restricted embeds. Tap below to find another version or open in YouTube.'}
                </p>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <button
                    type="button"
                    disabled={isAutoRecovering}
                    onClick={handleAutoRecoverVideo}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                  >
                    {isAutoRecovering ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="w-3.5 h-3.5" />
                    )}
                    <span>{lang === 'es' ? 'Buscar otra versión' : 'Find alternative version'}</span>
                  </button>
                  {ytVideoId && (
                    <a
                      href={`https://www.youtube.com/watch?v=${ytVideoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{lang === 'es' ? 'Ver en YouTube' : 'Watch on YouTube'}</span>
                    </a>
                  )}
                  {onNextTrack && (
                    <button
                      type="button"
                      onClick={onNextTrack}
                      className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold cursor-pointer transition-all"
                    >
                      {lang === 'es' ? 'Siguiente' : 'Next'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Progress Bar (if track has finite duration) */}
        {effectiveDuration > 0 && (
          <div className="w-full bg-stone-800 h-1 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Header indicator: Auto Siguiente / Autoplay */}
        {onToggleAutoplay && (
          <div className="flex items-center justify-end text-[10px] text-stone-400 px-0.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleAutoplay();
              }}
              className={`flex items-center gap-1 border px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                isAutoplay
                  ? 'text-amber-300 bg-amber-500/20 border-amber-500/45 hover:bg-amber-500/30'
                  : 'text-stone-400 bg-stone-850 border-stone-700 hover:text-stone-200'
              }`}
              title={
                lang === 'es'
                  ? isAutoplay
                    ? 'Autoplay activado: Pasa automáticamente a la siguiente canción solo en el celular. Toca para desactivar.'
                    : 'Autoplay desactivado: Se detendrá al terminar la canción. Toca para activar.'
                  : isAutoplay
                    ? 'Autoplay enabled: Advances automatically on mobile. Tap to disable.'
                    : 'Autoplay disabled: Stops when track finishes. Tap to enable.'
              }
            >
              <Repeat className={`w-2.5 h-2.5 ${isAutoplay ? 'text-amber-400' : 'text-stone-500'}`} />
              <span className="font-semibold tracking-wide uppercase text-[9px]">
                {isAutoplay
                  ? (lang === 'es' ? 'Autoplay: Activado' : 'Autoplay: ON')
                  : (lang === 'es' ? 'Autoplay: Desactivado' : 'Autoplay: OFF')}
              </span>
            </button>
          </div>
        )}

        {/* Main Track Info & Primary Controls */}
        <div className="flex items-center justify-between gap-2">
          {/* Track Cover & Info */}
          <div
            onClick={onOpenFullPlayer}
            className="flex items-center gap-2.5 truncate cursor-pointer group flex-1"
            title={lang === 'es' ? 'Abrir buscador y lista completa' : 'Open full player and search'}
          >
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-stone-800 border border-stone-700/80 flex-shrink-0 flex items-center justify-center shadow-inner">
              {track.artworkUrl ? (
                <img
                  src={track.artworkUrl}
                  alt={track.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : isYouTube ? (
                <Youtube className="w-5 h-5 text-red-500" />
              ) : (
                <Disc3
                  className={`w-5 h-5 text-amber-400 ${isPlaying ? 'animate-spin' : ''}`}
                  style={{ animationDuration: '4s' }}
                />
              )}

              {/* Status Ring / Indicator */}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                {isPlaying ? (
                  <span
                    className={`w-2.5 h-2.5 rounded-full animate-ping ${
                      isYouTube ? 'bg-red-500' : 'bg-amber-400'
                    }`}
                  />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-stone-400 opacity-80" />
                )}
              </div>
            </div>

            <div className="truncate">
              <div className="text-xs font-bold text-stone-100 group-hover:text-amber-300 truncate transition-colors flex items-center gap-1.5">
                <span className="truncate">{track.title}</span>
                {isYouTube && (
                  <span className="px-1 py-0.2 rounded text-[9px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30 flex-shrink-0">
                    YT
                  </span>
                )}
              </div>
              <div className="text-[11px] text-stone-400 truncate flex items-center gap-1.5">
                <span className="truncate">{track.artist}</span>
                <span className="text-stone-600">•</span>
                <span className="font-mono text-[10px] font-semibold text-amber-400/90">
                  {isPlaying
                    ? lang === 'es'
                      ? 'Reproduciendo'
                      : 'Playing'
                    : lang === 'es'
                    ? 'En Pausa'
                    : 'Paused'}
                </span>
                {track.durationText && (
                  <>
                    <span className="text-stone-600">•</span>
                    <span className="font-mono text-[10px] text-stone-400">
                      {track.durationText}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            {/* Previous Track Button */}
            {onPrevTrack && (
              <button
                id="btn-mini-prev-track"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isYouTube) {
                    sendYouTubeCommand('previousVideo');
                    sendYouTubeCommand('playVideo');
                  }
                  onPrevTrack();
                }}
                title={lang === 'es' ? 'Canción anterior' : 'Previous song'}
                className="min-h-[44px] min-w-[40px] p-2 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 transition-colors active:scale-95 flex items-center justify-center cursor-pointer"
              >
                <SkipBack className="w-4 h-4" />
              </button>
            )}

            {/* Play / Pause Toggle Button */}
            <button
              id="btn-mini-play-pause"
              type="button"
              onClick={onTogglePlay}
              title={
                isPlaying
                  ? lang === 'es'
                    ? 'Pausar música'
                    : 'Pause'
                  : lang === 'es'
                  ? 'Reanudar música'
                  : 'Play'
              }
              className={`min-h-[44px] min-w-[44px] p-2 rounded-xl active:scale-95 font-bold shadow-md transition-all flex items-center justify-center ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-950/40 ring-2 ring-amber-400/50'
                  : 'bg-stone-750 hover:bg-amber-500 hover:text-stone-950 text-stone-100 border border-stone-600'
              }`}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Next Track Button */}
            {onNextTrack && (
              <button
                id="btn-mini-next-track"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isYouTube) {
                    sendYouTubeCommand('nextVideo');
                    sendYouTubeCommand('playVideo');
                  }
                  onNextTrack();
                }}
                title={lang === 'es' ? 'Siguiente canción' : 'Next song'}
                className="min-h-[44px] min-w-[40px] p-2 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 transition-colors active:scale-95 flex items-center justify-center cursor-pointer"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            )}

            {/* Toggle Video Frame (if YouTube) */}
            {isYouTube && (
              <button
                type="button"
                onClick={() => setShowVideo((prev) => !prev)}
                title={
                  showVideo
                    ? lang === 'es'
                      ? 'Ocultar video'
                      : 'Hide video'
                    : lang === 'es'
                    ? 'Ver video de YouTube'
                    : 'Show video'
                }
                className={`p-1.5 rounded-lg transition-colors ${
                  showVideo
                    ? 'text-red-400 bg-red-500/20 border border-red-500/40'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <Tv className="w-4 h-4" />
              </button>
            )}

            {/* Toggle Volume Controls */}
            <button
              type="button"
              onClick={() => setShowVolumeControls((prev) => !prev)}
              title={
                showVolumeControls
                  ? lang === 'es'
                    ? 'Ocultar controles de volumen'
                    : 'Hide volume'
                  : lang === 'es'
                  ? 'Mostrar volumen'
                  : 'Show volume'
              }
              className={`p-1.5 rounded-lg transition-colors ${
                showVolumeControls
                  ? 'text-amber-400 bg-amber-500/15'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>

            {/* Expand / Open Modal */}
            <button
              type="button"
              onClick={onOpenFullPlayer}
              title={lang === 'es' ? 'Buscar más música' : 'Search more music'}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* Open in YouTube App (Android / Web) */}
            {ytVideoId && (
              <a
                href={`https://www.youtube.com/watch?v=${ytVideoId}`}
                target="_blank"
                rel="noopener noreferrer"
                title={lang === 'es' ? 'Abrir en YouTube oficial' : 'Open in official YouTube'}
                className="p-1.5 rounded-lg text-stone-400 hover:text-red-400 hover:bg-stone-800 transition-colors flex items-center justify-center"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Stop & Close */}
            <button
              type="button"
              onClick={onClosePlayer}
              title={lang === 'es' ? 'Cerrar reproductor' : 'Close player'}
              className="p-1.5 rounded-lg text-stone-400 hover:text-red-400 hover:bg-stone-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dedicated Volume Control Bar: Subir y Bajar Volumen */}
        {showVolumeControls && (
          <div className="pt-2 border-t border-stone-800/90 flex items-center justify-between gap-2 text-xs animate-in fade-in duration-150">
            {/* Mute toggle */}
            <button
              type="button"
              onClick={handleMuteClick}
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

            {/* Bajar Volumen (-) */}
            <button
              type="button"
              onClick={handleDecreaseVolume}
              disabled={volume <= 0}
              title={lang === 'es' ? 'Bajar volumen (-10%)' : 'Decrease volume'}
              className="p-1 rounded-lg bg-stone-800 hover:bg-stone-750 active:scale-95 disabled:opacity-40 text-stone-300 hover:text-white border border-stone-700 transition-all flex items-center justify-center flex-shrink-0"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            {/* Interactive Volume Slider */}
            <div className="flex-1 flex items-center gap-1.5 min-w-0">
              <input
                id="mini-player-volume-slider"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                title={`Volumen: ${Math.round(volume * 100)}%`}
                className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer transition-all"
              />
            </div>

            {/* Subir Volumen (+) */}
            <button
              type="button"
              onClick={handleIncreaseVolume}
              disabled={volume >= 1}
              title={lang === 'es' ? 'Subir volumen (+10%)' : 'Increase volume'}
              className="p-1 rounded-lg bg-stone-800 hover:bg-stone-750 active:scale-95 disabled:opacity-40 text-stone-300 hover:text-white border border-stone-700 transition-all flex items-center justify-center flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            {/* Numeric Percentage Badge */}
            <span className="font-mono text-[11px] font-bold text-amber-400 w-9 text-right flex-shrink-0">
              {Math.round(volume * 100)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
