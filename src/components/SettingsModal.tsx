import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Users,
  Target,
  Shield,
  Sparkles,
  Volume2,
  Check,
  Globe,
  Sun,
  Palette,
  Share2,
  ExternalLink,
  Key,
  Youtube,
  Loader2,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { AppBackgroundTheme, GameMode, GameSettings, LanguageSetting, TrancaRule } from '../types';
import { AppLanguage, TRANSLATIONS, resolveActiveLanguage, saveLanguageSetting } from '../utils/i18n';
import { BACKGROUND_THEME_OPTIONS, BackgroundThumbnailCard } from './AppBackground';
import {
  loadBackgroundTheme,
  saveBackgroundTheme,
  getYouTubeApiKey,
  saveYouTubeApiKey,
  hasCustomYouTubeApiKey,
  resetYouTubeApiKey,
} from '../utils/storage';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.lopezdigitalmedia.anotadordomino';

const GooglePlayIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.6 1.8C3.2 2.2 3 2.8 3 3.6V20.4C3 21.2 3.2 21.8 3.6 22.2L12.3 12L3.6 1.8Z" fill="#2196F3" />
    <path d="M15.4 8.9L12.3 12L3.6 1.8C4.1 1.5 4.8 1.4 5.5 1.8L15.4 8.9Z" fill="#4CAF50" />
    <path d="M12.3 12L15.4 15.1L5.5 22.2C4.8 22.6 4.1 22.5 3.6 22.2L12.3 12Z" fill="#F44336" />
    <path d="M20.5 11.2L15.4 8.9L12.3 12L15.4 15.1L20.5 12.8C21.5 12.2 21.5 11.8 20.5 11.2Z" fill="#FFC107" />
  </svg>
);

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: GameSettings;
  lang?: AppLanguage;
  activeLang?: AppLanguage;
  currentBackgroundTheme?: AppBackgroundTheme;
  onSelectBackgroundTheme?: (theme: AppBackgroundTheme) => void;
  onSaveSettings: (newSettings: GameSettings, shouldResetGame: boolean) => void;
  onLanguageChange?: (newLang: AppLanguage) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  lang,
  activeLang,
  currentBackgroundTheme,
  onSelectBackgroundTheme,
  onSaveSettings,
  onLanguageChange,
}) => {
  const [languageSetting, setLanguageSetting] = useState<LanguageSetting>(
    currentSettings.languageSetting || 'auto'
  );
  
  const effectiveLang: AppLanguage = resolveActiveLanguage(languageSetting);
  const t = TRANSLATIONS[effectiveLang];

  const [selectedBackgroundTheme, setSelectedBackgroundTheme] = useState<AppBackgroundTheme>(() => {
    return currentBackgroundTheme || currentSettings.backgroundTheme || loadBackgroundTheme();
  });

  useEffect(() => {
    if (currentBackgroundTheme) {
      setSelectedBackgroundTheme(currentBackgroundTheme);
    }
  }, [currentBackgroundTheme]);

  const [targetScore, setTargetScore] = useState<number>(currentSettings.targetScore);
  const [customTarget, setCustomTarget] = useState<string>('');
  const [isCustomTarget, setIsCustomTarget] = useState<boolean>(
    ![50, 100, 150, 200, 500].includes(currentSettings.targetScore)
  );

  const [gameMode, setGameMode] = useState<GameMode>(currentSettings.gameMode);
  const [player1Name, setPlayer1Name] = useState<string>(() => {
    let n = currentSettings.team1Members?.[0] || currentSettings.team1Name || (effectiveLang === 'es' ? 'Jugador 1' : 'Player 1');
    if (n.includes('&')) n = n.split('&')[0].trim();
    return n || (effectiveLang === 'es' ? 'Jugador 1' : 'Player 1');
  });
  const [player2Name, setPlayer2Name] = useState<string>(() => {
    let n = currentSettings.team2Members?.[0] || currentSettings.team2Name || (effectiveLang === 'es' ? 'Jugador 2' : 'Player 2');
    if (n.includes('&')) n = n.split('&')[0].trim();
    if (n === 'Jugador 3' || n === 'Jugador 4' || n === 'Player 3' || n === 'Player 4') {
      n = effectiveLang === 'es' ? 'Jugador 2' : 'Player 2';
    }
    return n || (effectiveLang === 'es' ? 'Jugador 2' : 'Player 2');
  });
  const [individualNames, setIndividualNames] = useState<string[]>(
    currentSettings.individualPlayerNames
  );
  const [individualCount, setIndividualCount] = useState<number>(
    currentSettings.individualPlayerNames.length
  );

  const [trancaRule, setTrancaRule] = useState<TrancaRule>(currentSettings.trancaRule);
  const [capicuaBonus, setCapicuaBonus] = useState<number>(currentSettings.capicuaBonus);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(currentSettings.soundEnabled);
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(
    currentSettings.vibrationEnabled
  );
  const [timerDurationSeconds, setTimerDurationSeconds] = useState<number>(
    currentSettings.timerDurationSeconds
  );
  const [keepScreenAwake, setKeepScreenAwake] = useState<boolean>(
    currentSettings.keepScreenAwake !== undefined ? currentSettings.keepScreenAwake : true
  );
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Configuración discreta de clave de YouTube Data API v3
  const [ytKeyInput, setYtKeyInput] = useState<string>(() => getYouTubeApiKey());
  const [hasCustomYtKey, setHasCustomYtKey] = useState<boolean>(() => hasCustomYouTubeApiKey());
  const [ytKeyTestStatus, setYtKeyTestStatus] = useState<{
    tested: boolean;
    valid: boolean;
    message: string;
    isTesting: boolean;
  }>({
    tested: false,
    valid: false,
    message: '',
    isTesting: false,
  });

  const handleTestKeyInSettings = async () => {
    const trimmed = ytKeyInput.trim();
    if (!trimmed) {
      setYtKeyTestStatus({
        tested: true,
        valid: false,
        message: effectiveLang === 'es' ? 'Ingresa una clave de API antes de probar.' : 'Enter an API key before testing.',
        isTesting: false,
      });
      return;
    }

    setYtKeyTestStatus((prev) => ({ ...prev, isTesting: true, message: '' }));
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=musica&key=${trimmed}`,
        { signal: AbortSignal.timeout(6500) }
      );
      if (res.ok) {
        setYtKeyTestStatus({
          tested: true,
          valid: true,
          message: effectiveLang === 'es' ? '✓ Clave válida y con cuota activa' : '✓ Key is valid with active quota',
          isTesting: false,
        });
      } else {
        const errJson = await res.json().catch(() => null);
        const reason = errJson?.error?.errors?.[0]?.reason || errJson?.error?.details?.[0]?.reason || '';
        const msg = errJson?.error?.message || '';

        let errSpanish = '';
        if (res.status === 403 || reason === 'quotaExceeded' || msg.toLowerCase().includes('quota')) {
          errSpanish = 'Error 403: Cuota diaria de YouTube API excedida.';
        } else if (res.status === 400 || reason === 'API_KEY_INVALID' || reason === 'keyInvalid') {
          errSpanish = 'Error 400: Clave de YouTube API no válida o restringida.';
        } else {
          errSpanish = `Error (${res.status}): ${msg || 'Error al validar'}`;
        }

        setYtKeyTestStatus({
          tested: true,
          valid: false,
          message: errSpanish,
          isTesting: false,
        });
      }
    } catch {
      setYtKeyTestStatus({
        tested: true,
        valid: false,
        message: effectiveLang === 'es' ? 'Error de red al validar la clave.' : 'Network error validating key.',
        isTesting: false,
      });
    }
  };

  const handleSaveKeyInSettings = () => {
    const trimmed = ytKeyInput.trim();
    if (trimmed) {
      saveYouTubeApiKey(trimmed);
      setHasCustomYtKey(true);
      setYtKeyTestStatus({
        tested: true,
        valid: true,
        message: effectiveLang === 'es' ? '✓ Clave guardada correctamente.' : '✓ Key saved successfully.',
        isTesting: false,
      });
    }
  };

  const handleResetKeyInSettings = () => {
    resetYouTubeApiKey();
    const defaultKey = getYouTubeApiKey();
    setYtKeyInput(defaultKey);
    setHasCustomYtKey(false);
    setYtKeyTestStatus({
      tested: true,
      valid: true,
      message: effectiveLang === 'es' ? '✓ Clave restablecida a la original.' : '✓ Restored default key.',
      isTesting: false,
    });
  };

  if (!isOpen) return null;

  const handleTargetPreset = (val: number) => {
    setTargetScore(val);
    setIsCustomTarget(false);
  };

  const handleCustomTargetChange = (val: string) => {
    const num = parseInt(val.replace(/\D/g, ''), 10);
    setCustomTarget(val);
    if (!isNaN(num) && num > 0) {
      setTargetScore(num);
    }
  };

  const handleIndividualNameChange = (idx: number, name: string) => {
    const updated = [...individualNames];
    updated[idx] = name;
    setIndividualNames(updated);
  };

  const handleSelectLanguage = (newSetting: LanguageSetting) => {
    setLanguageSetting(newSetting);
    saveLanguageSetting(newSetting);
    const resolved = resolveActiveLanguage(newSetting);
    if (onLanguageChange) {
      onLanguageChange(resolved);
    }
  };

  const handleSelectBackground = (theme: AppBackgroundTheme) => {
    setSelectedBackgroundTheme(theme);
    saveBackgroundTheme(theme);
    if (onSelectBackgroundTheme) {
      onSelectBackgroundTheme(theme);
    }
  };

  const handleShareApp = async () => {
    const shareTitle = 'Mesa & Dominó - Anotador';
    const shareText =
      effectiveLang === 'es'
        ? '¡Descarga el anotador oficial de dominó en Google Play!'
        : 'Download the official domino scorekeeper on Google Play!';

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: PLAY_STORE_URL,
        });
        setShareFeedback(t.shareAppSuccess);
        setTimeout(() => setShareFeedback(null), 3500);
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          return;
        }
      }
    }

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(PLAY_STORE_URL);
        setShareFeedback(t.shareAppCopied);
        setTimeout(() => setShareFeedback(null), 3500);
      } else {
        window.open(PLAY_STORE_URL, '_blank', 'noopener,noreferrer');
      }
    } catch {
      window.open(PLAY_STORE_URL, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSave = (resetGame: boolean) => {
    saveLanguageSetting(languageSetting);
    saveBackgroundTheme(selectedBackgroundTheme);
    const resolved = resolveActiveLanguage(languageSetting);
    if (onLanguageChange) {
      onLanguageChange(resolved);
    }

    const activeScore = isCustomTarget && customTarget ? parseInt(customTarget, 10) : targetScore;

    const trimmedIndividual = individualNames.slice(0, individualCount).map((n, i) => {
      const trimmed = n.trim();
      return trimmed || (effectiveLang === 'es' ? `Jugador ${i + 1}` : `Player ${i + 1}`);
    });

    const defaultP1 = effectiveLang === 'es' ? 'Jugador 1' : 'Player 1';
    const defaultP2 = effectiveLang === 'es' ? 'Jugador 2' : 'Player 2';
    const p1 = player1Name.trim() || defaultP1;
    const p2 = player2Name.trim() || defaultP2;

    const newSettings: GameSettings = {
      targetScore: Math.max(10, activeScore || 100),
      gameMode,
      team1Name: p1,
      team2Name: p2,
      team1Members: [p1],
      team2Members: [p2],
      individualPlayerNames: trimmedIndividual,
      trancaRule,
      capicuaBonus,
      soundEnabled,
      vibrationEnabled: soundEnabled ? vibrationEnabled : false,
      timerDurationSeconds,
      keepScreenAwake,
      languageSetting,
      backgroundTheme: selectedBackgroundTheme,
    };

    onSaveSettings(newSettings, resetGame);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 pt-1 sm:pt-2 md:pt-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="w-full max-w-lg bg-slate-950/90 backdrop-blur-xl border border-slate-700/70 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[94vh] mt-0.5 sm:mt-1"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 sm:px-4 py-2 border-b border-slate-800 bg-slate-900/80 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-amber-500/10 text-amber-400">
              <Settings className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-stone-100 font-display leading-none">
              {t.settings}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="px-3 sm:px-4 pt-1 sm:pt-1.5 pb-4 overflow-y-auto space-y-4 text-sm">
          {/* Language Selector (Bilingual Auto Detection) */}
          <div className="p-3 bg-stone-850/80 rounded-xl border border-stone-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.languageSection}</span>
              </label>
              <span className="text-[11px] text-stone-400 font-medium">
                {effectiveLang === 'es' ? 'Activo: Español' : 'Active: English'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleSelectLanguage('auto')}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center flex items-center justify-center gap-1.5 min-h-[34px] cursor-pointer ${
                  languageSetting === 'auto'
                    ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-sm font-bold'
                    : 'bg-stone-900 border-stone-750 text-stone-300 hover:border-stone-700 hover:text-stone-100'
                }`}
                title={effectiveLang === 'es' ? 'Automático (detecta idioma del celular)' : 'Auto (detect phone language)'}
              >
                <span>📱</span>
                <span>Auto</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectLanguage('es')}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center flex items-center justify-center gap-1.5 min-h-[34px] cursor-pointer ${
                  languageSetting === 'es'
                    ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-sm font-bold'
                    : 'bg-stone-900 border-stone-750 text-stone-300 hover:border-stone-700 hover:text-stone-100'
                }`}
              >
                <span>🇪🇸</span>
                <span>Español</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectLanguage('en')}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center flex items-center justify-center gap-1.5 min-h-[34px] cursor-pointer ${
                  languageSetting === 'en'
                    ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-sm font-bold'
                    : 'bg-stone-900 border-stone-750 text-stone-300 hover:border-stone-700 hover:text-stone-100'
                }`}
              >
                <span>🇺🇸</span>
                <span>English</span>
              </button>
            </div>
            <p className="text-[11px] text-stone-400 mt-1.5">
              {languageSetting === 'auto'
                ? effectiveLang === 'es'
                  ? 'Detectado automáticamente en Español según el idioma del celular.'
                  : 'Automatically detected in English from your device settings.'
                : effectiveLang === 'es'
                ? 'Idioma configurado manualmente en Español.'
                : 'Language manually configured to English.'}
            </p>
          </div>

          {/* Cambiar Fondo con Miniaturas Visuales */}
          <div className="p-3 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-750/80 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-amber-400" />
                <span>{t.changeBackground}</span>
              </label>
              <span className="text-[11px] text-slate-300 font-medium">
                {t.changeBackgroundDesc}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
              {BACKGROUND_THEME_OPTIONS.map((opt) => (
                <div
                  key={opt.id}
                  className="last:col-span-2 sm:last:col-span-1"
                >
                  <BackgroundThumbnailCard
                    id={opt.id}
                    title={t[opt.titleKey as keyof typeof t] as string}
                    description={t[opt.descKey as keyof typeof t] as string}
                    isSelected={selectedBackgroundTheme === opt.id}
                    onSelect={() => handleSelectBackground(opt.id)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Target Score */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-amber-400" />
              <span>{t.targetScore}</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mb-2">
              {[50, 100, 150, 200, 500].map((pts) => (
                <button
                  key={pts}
                  type="button"
                  onClick={() => handleTargetPreset(pts)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${
                    !isCustomTarget && targetScore === pts
                      ? 'bg-amber-500 text-stone-950 border-amber-500'
                      : 'bg-stone-850 border-stone-800 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  {pts} {t.pts}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsCustomTarget(true)}
                className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${
                  isCustomTarget
                    ? 'bg-amber-500 text-stone-950 border-amber-500'
                    : 'bg-stone-850 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                {effectiveLang === 'es' ? 'Otro' : 'Other'}
              </button>
            </div>
            {isCustomTarget && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Ej. 75, 250, 300"
                  value={customTarget}
                  onChange={(e) => handleCustomTargetChange(e.target.value)}
                  className="bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100 w-full focus:outline-none focus:border-amber-500"
                />
                <span className="text-xs text-stone-400 font-semibold whitespace-nowrap">
                  {t.pts}
                </span>
              </div>
            )}
          </div>

          {/* Game Mode */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>{t.gameMode}</span>
            </label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setGameMode('teams')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  gameMode === 'teams'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-semibold'
                    : 'bg-stone-850 border-stone-800 text-stone-400'
                }`}
              >
                <div className="font-bold text-stone-100">{t.modeTeams}</div>
                <div className="text-[11px] text-stone-400 mt-0.5">
                  {activeLang === 'es' ? 'Marcador clásico frente a frente' : 'Classic head-to-head score'}
                </div>
              </button>
              <button
                type="button"
                onClick={() => setGameMode('individual')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  gameMode === 'individual'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-semibold'
                    : 'bg-stone-850 border-stone-800 text-stone-400'
                }`}
              >
                <div className="font-bold text-stone-100">{t.modeIndividual}</div>
                <div className="text-[11px] text-stone-400 mt-0.5">
                  {activeLang === 'es' ? 'De 3 a 4 jugadores' : '3 or 4 separate players'}
                </div>
              </button>
            </div>

            {/* Names configuration depending on mode */}
            {gameMode === 'teams' ? (
              <div className="space-y-3 p-3 bg-stone-850 rounded-xl border border-stone-800">
                <div className="grid grid-cols-2 gap-3">
                  {/* Lado 1: Jugador 1 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 pb-1 border-b border-stone-800">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <label className="text-xs text-stone-200 font-bold block">
                        {activeLang === 'es' ? 'Jugador / Pareja 1' : 'Player / Team 1'}
                      </label>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={player1Name}
                        maxLength={35}
                        onChange={(e) => setPlayer1Name(e.target.value)}
                        onFocus={(e) => {
                          if (/^(jugador|player)\s*1$/i.test(player1Name.trim())) setPlayer1Name('');
                          e.target.select();
                        }}
                        className="w-full bg-stone-950 border border-stone-750 rounded-lg px-2.5 py-2 text-xs sm:text-sm text-stone-100 font-bold focus:outline-none focus:border-amber-500"
                        placeholder={activeLang === 'es' ? 'Jugador 1' : 'Player 1'}
                      />
                    </div>
                  </div>

                  {/* Lado 2: Jugador 2 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 pb-1 border-b border-stone-800">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <label className="text-xs text-stone-200 font-bold block">
                        {activeLang === 'es' ? 'Jugador / Pareja 2' : 'Player / Team 2'}
                      </label>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={player2Name}
                        maxLength={35}
                        onChange={(e) => setPlayer2Name(e.target.value)}
                        onFocus={(e) => {
                          if (/^(jugador|player)\s*2$/i.test(player2Name.trim())) setPlayer2Name('');
                          e.target.select();
                        }}
                        className="w-full bg-stone-950 border border-stone-750 rounded-lg px-2.5 py-2 text-xs sm:text-sm text-stone-100 font-bold focus:outline-none focus:border-amber-500"
                        placeholder={activeLang === 'es' ? 'Jugador 2' : 'Player 2'}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 p-3 bg-stone-850 rounded-xl border border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400 font-semibold">
                    {activeLang === 'es' ? 'Número de jugadores:' : 'Number of players:'}
                  </span>
                  <div className="flex items-center gap-1">
                    {[2, 3, 4].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setIndividualCount(count)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold ${
                          individualCount === count
                            ? 'bg-amber-500 text-stone-950'
                            : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: individualCount }).map((_, idx) => (
                    <div key={idx}>
                      <input
                        type="text"
                        placeholder={activeLang === 'es' ? `Jugador ${idx + 1}` : `Player ${idx + 1}`}
                        value={individualNames[idx] || ''}
                        maxLength={20}
                        onChange={(e) => handleIndividualNameChange(idx, e.target.value)}
                        className="w-full bg-stone-950 border border-stone-750 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tranca Rule & Capicúa Bonus */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>{t.trancaRule}</span>
              </label>
              <select
                value={trancaRule}
                onChange={(e) => setTrancaRule(e.target.value as TrancaRule)}
                className="w-full bg-stone-850 border border-stone-750 rounded-xl p-2.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
              >
                <option value="sum_opponent">
                  {activeLang === 'es' ? 'Suma del Rival (tradicional)' : "Opponent's Sum (traditional)"}
                </option>
                <option value="point_difference">
                  {activeLang === 'es' ? 'Diferencia de Puntos' : 'Point Difference'}
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{t.capicuaBonusLabel}</span>
              </label>
              <div className="flex items-center gap-1.5">
                {[0, 25, 50, 100].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setCapicuaBonus(b)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      capicuaBonus === b
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-stone-850 border-stone-800 text-stone-400'
                    }`}
                  >
                    {b === 0 ? (effectiveLang === 'es' ? 'Sin bono' : 'No bonus') : `+${b}`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sound, Vibration & Timer options */}
          <div className="p-3 bg-stone-850 rounded-xl border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-300 font-medium flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-stone-400" />
                {t.soundEffects}
              </span>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => {
                  const val = e.target.checked;
                  setSoundEnabled(val);
                  if (!val) {
                    setVibrationEnabled(false);
                  }
                }}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium ${soundEnabled ? 'text-stone-300' : 'text-stone-500'}`}>
                {t.hapticVibration}
              </span>
              <input
                type="checkbox"
                disabled={!soundEnabled}
                checked={soundEnabled && vibrationEnabled}
                onChange={(e) => setVibrationEnabled(e.target.checked)}
                className="w-4 h-4 accent-amber-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* Keep screen awake toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-800/80">
              <div className="flex flex-col">
                <span className="text-xs text-stone-200 font-medium flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>{t.keepScreenAwake}</span>
                </span>
                <span className="text-[10px] text-stone-400 mt-0.5 leading-tight">
                  {t.keepScreenAwakeDesc}
                </span>
              </div>
              <input
                type="checkbox"
                checked={keepScreenAwake}
                onChange={(e) => setKeepScreenAwake(e.target.checked)}
                className="w-4 h-4 accent-amber-500 cursor-pointer flex-shrink-0"
              />
            </div>
          </div>

          {/* YouTube Data API v3 Configuración (Buscador de Música) */}
          <div className="p-3 bg-stone-850 rounded-xl border border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Youtube className="w-4 h-4 text-red-500" />
                <span>{effectiveLang === 'es' ? 'YouTube Data API v3' : 'YouTube Data API v3'}</span>
              </label>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  hasCustomYtKey
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-stone-800 text-stone-400 border-stone-700'
                }`}
              >
                {hasCustomYtKey
                  ? (effectiveLang === 'es' ? 'Clave propia activa' : 'Custom key active')
                  : (effectiveLang === 'es' ? 'Clave pública integrada' : 'Default key')}
              </span>
            </div>

            <p className="text-[11px] text-stone-300 leading-tight">
              {effectiveLang === 'es'
                ? 'Permite buscar y reproducir música en vivo. Si la cuota diaria gratuita se agota, puedes ingresar tu propia clave de Google Cloud.'
                : 'Enables live music search and playback. If the free daily quota is exceeded, you can provide your own key.'}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-0.5">
              <input
                type="text"
                value={ytKeyInput}
                onChange={(e) => {
                  setYtKeyInput(e.target.value);
                  setYtKeyTestStatus({ tested: false, valid: false, message: '', isTesting: false });
                }}
                placeholder="AIzaSy..."
                className="flex-1 bg-stone-950 border border-stone-750 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 font-mono focus:outline-none"
              />
              <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                <button
                  type="button"
                  disabled={ytKeyTestStatus.isTesting}
                  onClick={handleTestKeyInSettings}
                  className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-bold rounded-lg border border-stone-700 transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 min-h-[34px]"
                >
                  {ytKeyTestStatus.isTesting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Key className="w-3 h-3 text-amber-400" />
                  )}
                  <span>{effectiveLang === 'es' ? 'Probar' : 'Test'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveKeyInSettings}
                  className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer min-h-[34px]"
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>{effectiveLang === 'es' ? 'Guardar' : 'Save'}</span>
                </button>
                {hasCustomYtKey && (
                  <button
                    type="button"
                    onClick={handleResetKeyInSettings}
                    className="p-1.5 bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-red-300 rounded-lg border border-stone-800 transition-colors cursor-pointer min-h-[34px] flex items-center justify-center"
                    title={effectiveLang === 'es' ? 'Restablecer clave original' : 'Restore original key'}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {ytKeyTestStatus.tested && (
              <div
                className={`text-xs px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                  ytKeyTestStatus.valid
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                    : 'bg-red-950/40 text-red-300 border-red-500/30'
                }`}
              >
                {ytKeyTestStatus.valid ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                ) : (
                  <X className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                )}
                <span>{ytKeyTestStatus.message}</span>
              </div>
            )}
          </div>

          {/* Compartir Aplicación (Google Play Store) */}
          <div className="p-3 bg-slate-900/85 backdrop-blur-md rounded-2xl border border-slate-750/90 shadow-lg">
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>{t.shareApp}</span>
              </label>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                Google Play
              </span>
            </div>

            <p className="text-[11px] text-slate-300 mb-2.5">
              {t.shareAppDesc}
            </p>

            <button
              type="button"
              onClick={handleShareApp}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:via-teal-500 hover:to-sky-500 active:scale-[0.98] text-white font-extrabold rounded-xl shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <GooglePlayIcon className="w-5 h-5 flex-shrink-0 drop-shadow" />
              <span className="text-sm font-bold tracking-wide font-display">
                {t.shareAppBtn}
              </span>
              <Share2 className="w-4 h-4 text-emerald-100 flex-shrink-0" />
            </button>

            {shareFeedback && (
              <div className="mt-2 py-1.5 px-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold text-center flex items-center justify-center gap-1.5 animate-fade-in">
                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>{shareFeedback}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-slate-800">
              <span className="truncate max-w-[190px] sm:max-w-[270px] font-mono text-[10px] text-slate-400">
                com.lopezdigitalmedia.anotadordomino
              </span>
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold hover:underline ml-2 flex-shrink-0 cursor-pointer"
              >
                <span>{effectiveLang === 'es' ? 'Ver en Play Store' : 'Open Store'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Save Buttons */}
          <div className="pt-2 space-y-2">
            <button
              onClick={() => handleSave(false)}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{effectiveLang === 'es' ? 'Guardar y Continuar Partida Actual' : 'Save and Continue Current Match'}</span>
            </button>
            <button
              onClick={() => handleSave(true)}
              className="w-full py-2.5 px-4 bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-white font-medium rounded-xl text-xs border border-stone-750 transition-all cursor-pointer"
            >
              {effectiveLang === 'es' ? 'Guardar y Reiniciar Nueva Partida desde 0 pts' : 'Save and Restart Match at 0 pts'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
