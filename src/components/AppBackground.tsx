import React, { useEffect } from 'react';
import { AppBackgroundTheme } from '../types';

export interface BackgroundThemeOption {
  id: AppBackgroundTheme;
  titleKey: string;
  descKey: string;
  gradient: string;
  accentColor: string;
}

export const THEME_GRADIENTS: Record<string, string> = {
  azul: 'radial-gradient(circle at 50% 50%, #1e3a8a 0%, #0f172a 100%)',
  verde: 'radial-gradient(circle at 50% 50%, #15803d 0%, #052e16 100%)',
  rojo: 'radial-gradient(circle at 50% 50%, #991b1b 0%, #450a0a 100%)',
  carbon: 'radial-gradient(circle at 50% 50%, #334155 0%, #020617 100%)',
  purpura: 'radial-gradient(circle at 50% 50%, #7e22ce 0%, #2e1065 100%)',
  turquesa: 'radial-gradient(circle at 50% 50%, #0e7490 0%, #083344 100%)',
  // Alias mappings for backward compatibility
  'azul-casino': 'radial-gradient(circle at 50% 50%, #1e3a8a 0%, #0f172a 100%)',
  'verde-grama': 'radial-gradient(circle at 50% 50%, #15803d 0%, #052e16 100%)',
  'rojo-jupiter': 'radial-gradient(circle at 50% 50%, #991b1b 0%, #450a0a 100%)',
  'negro-carbon': 'radial-gradient(circle at 50% 50%, #334155 0%, #020617 100%)',
  'purpura-galaxia': 'radial-gradient(circle at 50% 50%, #7e22ce 0%, #2e1065 100%)',
  'turquesa-caribe': 'radial-gradient(circle at 50% 50%, #0e7490 0%, #083344 100%)',
  'mesa-domino-icon': 'radial-gradient(circle at 50% 50%, #1e3a8a 0%, #0f172a 100%)',
  'cielo-celeste-3d': 'radial-gradient(circle at 50% 50%, #1e3a8a 0%, #0f172a 100%)',
  'cielo-estrellas': 'radial-gradient(circle at 50% 50%, #1e3a8a 0%, #0f172a 100%)',
  'mesa-esmeralda-3d': 'radial-gradient(circle at 50% 50%, #15803d 0%, #052e16 100%)',
  'fieltro-verde': 'radial-gradient(circle at 50% 50%, #15803d 0%, #052e16 100%)',
  'galaxia-rubi-3d': 'radial-gradient(circle at 50% 50%, #991b1b 0%, #450a0a 100%)',
  'noche-elegante': 'radial-gradient(circle at 50% 50%, #991b1b 0%, #450a0a 100%)',
  'neon-cyberpunk-3d': 'radial-gradient(circle at 50% 50%, #334155 0%, #020617 100%)',
  'fibra-carbono': 'radial-gradient(circle at 50% 50%, #334155 0%, #020617 100%)',
  'ondas-azul-lavanda': 'radial-gradient(circle at 50% 50%, #7e22ce 0%, #2e1065 100%)',
  'oro-imperial-3d': 'radial-gradient(circle at 50% 50%, #7e22ce 0%, #2e1065 100%)',
  'madera-noble': 'radial-gradient(circle at 50% 50%, #7e22ce 0%, #2e1065 100%)',
};

export const BACKGROUND_THEME_OPTIONS: BackgroundThemeOption[] = [
  {
    id: 'azul',
    titleKey: 'bgAzulCasino',
    descKey: 'bgAzulCasinoDesc',
    gradient: 'radial-gradient(circle at 50% 50%, #1e3a8a 0%, #0f172a 100%)',
    accentColor: '#3b82f6',
  },
  {
    id: 'verde',
    titleKey: 'bgVerdeGrama',
    descKey: 'bgVerdeGramaDesc',
    gradient: 'radial-gradient(circle at 50% 50%, #15803d 0%, #052e16 100%)',
    accentColor: '#22c55e',
  },
  {
    id: 'rojo',
    titleKey: 'bgRojoJupiter',
    descKey: 'bgRojoJupiterDesc',
    gradient: 'radial-gradient(circle at 50% 50%, #991b1b 0%, #450a0a 100%)',
    accentColor: '#ef4444',
  },
  {
    id: 'carbon',
    titleKey: 'bgNegroCarbon',
    descKey: 'bgNegroCarbonDesc',
    gradient: 'radial-gradient(circle at 50% 50%, #334155 0%, #020617 100%)',
    accentColor: '#94a3b8',
  },
  {
    id: 'purpura',
    titleKey: 'bgPurpuraGalaxia',
    descKey: 'bgPurpuraGalaxiaDesc',
    gradient: 'radial-gradient(circle at 50% 50%, #7e22ce 0%, #2e1065 100%)',
    accentColor: '#a855f7',
  },
  {
    id: 'turquesa',
    titleKey: 'bgTurquesaCaribe',
    descKey: 'bgTurquesaCaribeDesc',
    gradient: 'radial-gradient(circle at 50% 50%, #0e7490 0%, #083344 100%)',
    accentColor: '#06b6d4',
  },
];

export function normalizeThemeId(theme: string | undefined): AppBackgroundTheme {
  if (!theme) return 'azul';
  if (
    theme === 'verde' ||
    theme === 'verde-grama' ||
    theme === 'mesa-esmeralda-3d' ||
    theme === 'fieltro-verde'
  ) {
    return 'verde';
  }
  if (
    theme === 'rojo' ||
    theme === 'rojo-jupiter' ||
    theme === 'galaxia-rubi-3d' ||
    theme === 'noche-elegante'
  ) {
    return 'rojo';
  }
  if (
    theme === 'carbon' ||
    theme === 'negro-carbon' ||
    theme === 'neon-cyberpunk-3d' ||
    theme === 'fibra-carbono'
  ) {
    return 'carbon';
  }
  if (
    theme === 'purpura' ||
    theme === 'purpura-galaxia' ||
    theme === 'ondas-azul-lavanda' ||
    theme === 'oro-imperial-3d' ||
    theme === 'madera-noble'
  ) {
    return 'purpura';
  }
  if (theme === 'turquesa' || theme === 'turquesa-caribe') {
    return 'turquesa';
  }
  return 'azul';
}

export function getThemeGradient(theme: string | undefined): string {
  const normalized = normalizeThemeId(theme);
  return THEME_GRADIENTS[normalized] || THEME_GRADIENTS['azul'];
}

export function applyThemeToDocument(theme: string | undefined): void {
  const gradient = getThemeGradient(theme);
  if (typeof document !== 'undefined') {
    document.body.style.background = gradient;
    document.body.style.backgroundImage = gradient;
    document.documentElement.style.background = gradient;
    document.documentElement.style.backgroundImage = gradient;
  }
}

interface AppBackgroundProps {
  theme: AppBackgroundTheme;
}

export const AppBackground: React.FC<AppBackgroundProps> = ({ theme }) => {
  const gradient = getThemeGradient(theme);

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        minHeight: '100vh',
        width: '100%',
        zIndex: -1,
        pointerEvents: 'none',
        overflow: 'hidden',
        userSelect: 'none',
        background: gradient,
      }}
    >
      {/* Capa de color de fondo que cubre el 100% de la pantalla con degradado envolvente */}
      <div
        className="absolute inset-0 transition-all duration-300 ease-out"
        style={{ background: gradient }}
      />
    </div>
  );
};

/* =========================================================================
 * COMPONENTE THUMBNAIL INTERACTIVO PARA LA SECCIÓN DE CONFIGURACIÓN
 * Muestra el degradado oficial, muestra de color y miniatura de la ficha
 * ========================================================================= */
interface BackgroundThumbnailCardProps {
  id: AppBackgroundTheme;
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}

export const BackgroundThumbnailCard: React.FC<BackgroundThumbnailCardProps> = ({
  id,
  title,
  description,
  isSelected,
  onSelect,
}) => {
  const gradient = getThemeGradient(id);
  const option = BACKGROUND_THEME_OPTIONS.find((o) => normalizeThemeId(o.id) === normalizeThemeId(id));
  const accentColor = option?.accentColor || '#eab308';

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative w-full text-left rounded-2xl p-2.5 sm:p-3 border transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden shadow-lg ${
        isSelected
          ? 'border-amber-400 bg-amber-500/20 ring-2 ring-amber-400/60 shadow-amber-950/60 scale-[1.02]'
          : 'border-slate-800 bg-slate-900/90 hover:border-slate-700 hover:bg-slate-850'
      }`}
    >
      {/* Vista previa visual miniatura con el degradado y la ficha central */}
      <div
        className="relative w-full h-18 sm:h-20 rounded-xl overflow-hidden border border-slate-700/80 mb-2 flex-shrink-0 shadow-inner flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.01]"
        style={{ background: gradient }}
      >
        {/* Muestra de color (swatch) en la esquina superior izquierda */}
        <div
          className="absolute top-2 left-2 w-3.5 h-3.5 rounded-full border border-white/70 shadow-md"
          style={{ backgroundColor: accentColor }}
          title={title}
        />

        {/* Ficha en miniatura con los mismos bordes difuminados */}
        <div className="w-10 h-10 flex items-center justify-center">
          <img
            src="/icon.png"
            alt=""
            className="w-full h-full object-contain"
            style={{
              borderRadius: '8px',
              WebkitMaskImage: 'radial-gradient(circle, black 65%, transparent 100%)',
              maskImage: 'radial-gradient(circle, black 65%, transparent 100%)',
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4))',
            }}
          />
        </div>

        {/* Badge indicador de seleccionado */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-lg font-bold">
            <svg
              className="w-3.5 h-3.5 stroke-[3]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        )}
      </div>

      {/* Título con muestra de color y descripción */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span
            className={`text-xs sm:text-sm font-black truncate transition-colors flex items-center gap-1.5 ${
              isSelected ? 'text-amber-300' : 'text-stone-100 group-hover:text-white'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm"
              style={{ backgroundColor: accentColor }}
            />
            <span className="truncate">{title}</span>
          </span>
          {isSelected && (
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-400 bg-amber-400/25 px-1.5 py-0.5 rounded flex-shrink-0 border border-amber-400/50">
              ACTIVO
            </span>
          )}
        </div>
        <p className="text-[11px] text-stone-300 leading-snug line-clamp-2">
          {description}
        </p>
      </div>
    </button>
  );
};
