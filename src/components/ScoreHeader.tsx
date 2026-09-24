import React from 'react';
import {
  RotateCcw,
  Settings,
  Sun,
  Moon,
} from 'lucide-react';
import { AppLogo } from './AppLogo';
import { GameMode } from '../types';
import { AppLanguage, TRANSLATIONS } from '../utils/i18n';

interface ScoreHeaderProps {
  targetScore: number;
  gameMode: GameMode;
  soundEnabled?: boolean;
  isMusicPlaying?: boolean;
  lang: AppLanguage;
  isScreenAwake?: boolean;
  onToggleSound?: () => void;
  onToggleScreenAwake?: () => void;
  onOpenSettings: () => void;
  onOpenTrancaCalc?: () => void;
  onOpenTimer?: () => void;
  onOpenHistory?: () => void;
  onOpenMusic?: () => void;
  onOpenAddRound?: () => void;
  onNewGame: () => void;
  roundsCount: number;
}

export const ScoreHeader: React.FC<ScoreHeaderProps> = ({
  targetScore,
  gameMode,
  soundEnabled: _soundEnabled,
  isMusicPlaying: _isMusicPlaying,
  lang,
  isScreenAwake = true,
  onToggleSound: _onToggleSound,
  onToggleScreenAwake,
  onOpenSettings,
  onOpenTrancaCalc: _onOpenTrancaCalc,
  onOpenTimer: _onOpenTimer,
  onOpenHistory: _onOpenHistory,
  onOpenMusic: _onOpenMusic,
  onOpenAddRound: _onOpenAddRound,
  onNewGame,
  roundsCount,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <header className="bg-slate-950/75 backdrop-blur-md border-b border-slate-700/60 sticky top-0 z-20 px-2 sm:px-6 py-2.5 sm:py-3 transition-colors shadow-lg">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Logo & Title */}
        <div className="flex items-center min-w-0 flex-shrink">
          <AppLogo size="header" showText={false} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="text-sm sm:text-base font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-500 uppercase font-display drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] truncate">
                  MESA &amp; DOMINÓ
                </span>
                <span className="text-[9px] sm:text-[10px] font-extrabold tracking-widest text-sky-400 uppercase -mt-0.5">
                  - ANOTADOR -
                </span>
              </div>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex-shrink-0 ml-1">
                {t.targetScore}: {targetScore} {t.pts}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-stone-400 flex items-center gap-1 truncate mt-0.5">
              <span>{gameMode === 'teams' ? t.modeTeams : t.modeIndividual}</span>
              <span>•</span>
              <span>
                {roundsCount === 0
                  ? (lang === 'es' ? 'Sin manos' : 'No hands yet')
                  : `${roundsCount} ${roundsCount === 1 ? (lang === 'es' ? 'mano' : 'hand') : (lang === 'es' ? 'manos' : 'hands')}`}
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          {/* Screen Wake Lock / Pantalla activa - al lado de ajustes */}
          <button
            id="btn-toggle-wake-lock"
            onClick={onToggleScreenAwake}
            title={
              isScreenAwake
                ? (lang === 'es' ? 'Pantalla activa (No se apaga) - Clic para desactivar' : 'Screen awake ON (Stay awake) - Click to allow sleep')
                : (lang === 'es' ? 'Mantener pantalla activa (Evitar suspensión) - Clic para activar' : 'Keep screen awake - Click to activate')
            }
            aria-label={lang === 'es' ? 'Mantener pantalla activa' : 'Keep screen awake'}
            className={`p-2 rounded-lg transition-all active:scale-95 cursor-pointer flex-shrink-0 min-h-[38px] min-w-[38px] flex items-center justify-center border ${
              isScreenAwake
                ? 'bg-amber-500/15 border-amber-500/60 text-amber-400 hover:bg-amber-500/25 shadow-sm shadow-amber-500/10'
                : 'bg-stone-800 hover:bg-stone-700 active:bg-stone-600 text-stone-400 hover:text-stone-200 border-stone-700/70'
            }`}
          >
            {isScreenAwake ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-stone-400" />
            )}
          </button>

          {/* Settings */}
          <button
            id="btn-open-settings"
            onClick={onOpenSettings}
            title={t.settings}
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 active:bg-stone-600 text-stone-300 hover:text-white border border-stone-700/70 transition-all active:scale-95 cursor-pointer flex-shrink-0 min-h-[38px] min-w-[38px] flex items-center justify-center"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Reset / New Game Button */}
          <button
            id="btn-new-game"
            onClick={onNewGame}
            title={t.confirmNewMatch}
            className="flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-black text-xs sm:text-sm shadow-md shadow-amber-950/40 transition-all active:scale-95 flex-shrink-0 cursor-pointer select-none"
          >
            <RotateCcw className="w-4 h-4 flex-shrink-0 stroke-[2.5]" />
            <span className="font-extrabold text-xs sm:text-sm">{lang === 'es' ? 'Reiniciar' : 'Reset'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
