import React from 'react';
import { AppBackgroundTheme } from '../types';

export interface BackgroundThemeOption {
  id: AppBackgroundTheme;
  titleKey: string;
  descKey: string;
}

export const BACKGROUND_THEME_OPTIONS: BackgroundThemeOption[] = [
  {
    id: 'cielo-celeste-3d',
    titleKey: 'bgCieloCeleste',
    descKey: 'bgCieloCelesteDesc',
  },
  {
    id: 'galaxia-rubi-3d',
    titleKey: 'bgGalaxiaRubi',
    descKey: 'bgGalaxiaRubiDesc',
  },
  {
    id: 'mesa-esmeralda-3d',
    titleKey: 'bgMesaEsmeralda',
    descKey: 'bgMesaEsmeraldaDesc',
  },
  {
    id: 'neon-cyberpunk-3d',
    titleKey: 'bgNeonCyberpunk',
    descKey: 'bgNeonCyberpunkDesc',
  },
  {
    id: 'ondas-azul-lavanda',
    titleKey: 'bgOndasAzulLavanda',
    descKey: 'bgOndasAzulLavandaDesc',
  },
];

interface AppBackgroundProps {
  theme: AppBackgroundTheme;
}

export const AppBackground: React.FC<AppBackgroundProps> = ({ theme }) => {
  // Normalize theme with backward-compatibility
  const resolvedTheme: AppBackgroundTheme =
    theme === 'oro-imperial-3d' || theme === 'madera-noble'
      ? 'ondas-azul-lavanda'
      : theme === 'fieltro-verde'
      ? 'mesa-esmeralda-3d'
      : theme === 'noche-elegante'
      ? 'galaxia-rubi-3d'
      : theme === 'fibra-carbono'
      ? 'neon-cyberpunk-3d'
      : theme === 'cielo-estrellas'
      ? 'cielo-celeste-3d'
      : theme || 'cielo-celeste-3d';

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none transition-all duration-700"
    >
      {/* 1. Capas visuales específicas de cada tema */}
      {resolvedTheme === 'cielo-celeste-3d' && <CieloCeleste3DBackground />}
      {resolvedTheme === 'galaxia-rubi-3d' && <GalaxiaRubi3DBackground />}
      {resolvedTheme === 'mesa-esmeralda-3d' && <MesaEsmeralda3DBackground />}
      {resolvedTheme === 'neon-cyberpunk-3d' && <NeonCyberpunk3DBackground />}
      {(resolvedTheme === 'ondas-azul-lavanda' || resolvedTheme === 'oro-imperial-3d') && (
        <OndasAzulLavandaBackground />
      )}

      {/* 2. Capa transparente equilibrada: preserva 100% los colores vivos y el impacto 3D */}
      <div className="absolute inset-0 bg-slate-950/30 pointer-events-none" />

      {/* 3. Viñeta perimetral suave que da profundidad de lente cinematográfico */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 40%, transparent 55%, rgba(2, 6, 23, 0.55) 100%)',
        }}
      />
    </div>
  );
};

/* =========================================================================
 * 1. CIELO CELESTE 3D
 * Azul cielo vibrante (eléctrico a cian), nubes esponjosas en capas 3D y estrellas brillantes con destellos
 * ========================================================================= */
export const CieloCeleste3DBackground: React.FC<{ isThumbnail?: boolean }> = ({ isThumbnail }) => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0369a1]">
      {/* Degradado cósmico cielo profundo: azul eléctrico a cian luminoso */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 90% 70% at 50% 15%, #38bdf8 0%, #0284c7 35%, #0369a1 65%, #082f49 100%)
          `,
        }}
      />

      {/* Foco volumétrico celestial / Sol brillante con halo */}
      <div
        className="absolute -top-16 sm:-top-24 left-1/2 -translate-x-1/2 w-[350px] sm:w-[650px] h-[350px] sm:h-[650px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(224, 242, 254, 0.75) 0%, rgba(56, 189, 248, 0.45) 30%, rgba(2, 132, 199, 0.15) 60%, transparent 75%)',
          filter: isThumbnail ? 'blur(15px)' : 'blur(30px)',
        }}
      />

      {/* Rayos volumétricos de luz celestial */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          background: `
            repeating-conic-gradient(from 180deg at 50% 0%, 
              rgba(255, 255, 255, 0.25) 0deg 8deg, 
              transparent 8deg 22deg, 
              rgba(56, 189, 248, 0.3) 22deg 32deg, 
              transparent 32deg 45deg)
          `,
          maskImage: 'radial-gradient(circle at 50% 0%, black 15%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 0%, black 15%, transparent 70%)',
        }}
      />

      {/* SVG Estrellas brillantes parpadeantes con destellos luminosos definidos (Cross Flares) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="35%" stopColor="#bae6fd" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
          <filter id="starBloom" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Destellos de estrellas 4-picos grandes y brillantes */}
        <g filter="url(#starBloom)">
          {/* Estrella 1 */}
          <g transform="translate(60, 45)">
            <circle cx="0" cy="0" r="14" fill="url(#starGlow)" opacity="0.9" />
            <path d="M 0 -22 Q 0 0 22 0 Q 0 0 0 22 Q 0 0 -22 0 Q 0 0 0 -22 Z" fill="#ffffff" />
            <circle cx="0" cy="0" r="3" fill="#ffffff" />
          </g>

          {/* Estrella 2 */}
          <g transform="translate(340, 70) scale(0.85)">
            <circle cx="0" cy="0" r="14" fill="url(#starGlow)" opacity="0.85" />
            <path d="M 0 -20 Q 0 0 20 0 Q 0 0 0 20 Q 0 0 -20 0 Q 0 0 0 -20 Z" fill="#ffffff" />
            <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
          </g>

          {/* Estrella 3 */}
          <g transform="translate(190, 110) scale(0.65)">
            <circle cx="0" cy="0" r="12" fill="url(#starGlow)" opacity="0.9" />
            <path d="M 0 -18 Q 0 0 18 0 Q 0 0 0 18 Q 0 0 -18 0 Q 0 0 0 -18 Z" fill="#ffffff" />
            <circle cx="0" cy="0" r="2" fill="#ffffff" />
          </g>

          {/* Estrella 4 */}
          <g transform="translate(85, 230) scale(0.6)">
            <circle cx="0" cy="0" r="12" fill="url(#starGlow)" opacity="0.8" />
            <path d="M 0 -16 Q 0 0 16 0 Q 0 0 0 16 Q 0 0 -16 0 Q 0 0 0 -16 Z" fill="#ffffff" />
          </g>

          {/* Estrella 5 */}
          <g transform="translate(310, 260) scale(0.75)">
            <circle cx="0" cy="0" r="14" fill="url(#starGlow)" opacity="0.8" />
            <path d="M 0 -18 Q 0 0 18 0 Q 0 0 0 18 Q 0 0 -18 0 Q 0 0 0 -18 Z" fill="#ffffff" />
          </g>
        </g>
      </svg>

      {/* SVG Capas 3D de Nubes Esponjosas con Volumen y Sombras Esculpidas */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 400 600"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradiente nube profunda */}
          <linearGradient id="cloudBackGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
          </linearGradient>

          {/* Gradiente nube media con volumen */}
          <linearGradient id="cloudMidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="35%" stopColor="#e0f2fe" stopOpacity="0.75" />
            <stop offset="70%" stopColor="#7dd3fc" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.3" />
          </linearGradient>

          {/* Gradiente nube frontal 3D con luz y sombra */}
          <linearGradient id="cloudFrontGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#f0f9ff" stopOpacity="0.85" />
            <stop offset="75%" stopColor="#bae6fd" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.45" />
          </linearGradient>

          {/* Filtro de sombra profunda 3D para nubes */}
          <filter id="cloudShadow3D" x="-20%" y="-20%" width="150%" height="160%">
            <feDropShadow dx="0" dy="16" stdDeviation="12" floodColor="#0c4a6e" floodOpacity="0.65" />
          </filter>
          <filter id="cloudMidShadow" x="-20%" y="-20%" width="150%" height="160%">
            <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#0369a1" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Capa 1: Nubes distantes de fondo (Midground) */}
        <g filter="url(#cloudMidShadow)">
          {/* Nube lejana izquierda */}
          <path
            d="M -30,130 C -20,95 25,85 50,110 C 70,85 115,85 130,115 C 160,110 190,135 185,165 C 185,190 -30,200 -30,130 Z"
            fill="url(#cloudBackGrad)"
          />
          {/* Nube lejana derecha */}
          <path
            d="M 230,160 C 250,125 295,120 320,145 C 345,125 390,135 410,165 C 435,160 460,185 450,215 C 440,240 230,240 230,160 Z"
            fill="url(#cloudBackGrad)"
          />
        </g>

        {/* Capa 2: Nubes intermedias con relieve volumétrico */}
        <g filter="url(#cloudShadow3D)">
          {/* Nube flotante izquierda centro */}
          <path
            d="M -20,310 C -15,260 40,245 70,275 C 100,240 160,245 180,285 C 215,275 255,305 245,350 C 240,390 -20,400 -20,310 Z"
            fill="url(#cloudMidGrad)"
          />
          {/* Nube flotante superior derecha */}
          <path
            d="M 210,50 C 230,10 285,5 315,35 C 345,10 395,20 415,55 C 445,50 475,80 465,115 C 455,145 200,140 210,50 Z"
            fill="url(#cloudMidGrad)"
          />
        </g>

        {/* Capa 3: Nubes volumétricas inferiores en primer plano 3D */}
        <g filter="url(#cloudShadow3D)">
          <path
            d="M -40,480 C -30,420 35,400 75,435 C 115,395 185,400 215,445 C 255,410 320,415 350,460 C 385,440 440,465 440,515 C 440,610 -40,610 -40,480 Z"
            fill="url(#cloudFrontGrad)"
          />
        </g>
      </svg>
    </div>
  );
};

/* =========================================================================
 * 2. GALAXIA RUBÍ 3D
 * Fondo rojo intenso, carmesí y escarlata con nebulosas ardientes y estrellas doradas en relieve 3D
 * ========================================================================= */
export const GalaxiaRubi3DBackground: React.FC<{ isThumbnail?: boolean }> = ({ isThumbnail }) => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#180206]">
      {/* Base de abismo espacial carmesí profundo */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #1c0208 0%, #4c0519 40%, #881337 70%, #150207 100%)',
        }}
      />

      {/* Nebulosa ardiente 3D multicapa en rojo rubí y escarlata fundido */}
      <div
        className="absolute inset-0 opacity-85"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 75% 25%, #e11d48 0%, #9f1239 35%, transparent 70%),
            radial-gradient(ellipse 70% 55% at 20% 65%, #f43f5e 0%, #be123c 40%, transparent 75%),
            radial-gradient(circle at 50% 45%, #fb7185 0%, #e11d48 25%, transparent 60%)
          `,
          filter: isThumbnail ? 'blur(16px)' : 'blur(35px)',
        }}
      />

      {/* Vórtice de fuego estelar dorado en el núcleo de la nebulosa */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(251, 191, 36, 0.45) 0%, rgba(244, 63, 94, 0.35) 45%, transparent 75%)',
          filter: isThumbnail ? 'blur(20px)' : 'blur(40px)',
        }}
      />

      {/* SVG Estrellas Doradas en Relieve 3D con Destellos Luminosos Esculpidos */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 400 600"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Resplandor dorado */}
          <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fffbeb" stopOpacity="1" />
            <stop offset="30%" stopColor="#fef08a" stopOpacity="0.85" />
            <stop offset="65%" stopColor="#f59e0b" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
          </radialGradient>

          {/* Gradiente dorado metálico biselado 3D */}
          <linearGradient id="goldReliefGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#fef08a" />
            <stop offset="65%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          {/* Sombra proyectada 3D para estrellas en relieve */}
          <filter id="gold3DShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#ffe4e6" floodOpacity="0.8" />
            <feDropShadow dx="2" dy="8" stdDeviation="10" floodColor="#881337" floodOpacity="0.9" />
          </filter>
        </defs>

        {/* Polvo estelar cósmico rubí */}
        <g opacity="0.6">
          <circle cx="50" cy="80" r="1.5" fill="#fecdd3" />
          <circle cx="120" cy="190" r="2" fill="#fef08a" />
          <circle cx="280" cy="120" r="1.2" fill="#ffe4e6" />
          <circle cx="340" cy="240" r="1.8" fill="#fef08a" />
          <circle cx="80" cy="380" r="2.2" fill="#fb7185" />
          <circle cx="230" cy="450" r="1.5" fill="#ffffff" />
          <circle cx="320" cy="520" r="2" fill="#fde047" />
          <circle cx="170" cy="560" r="1.2" fill="#fecdd3" />
        </g>

        {/* Estrellas doradas 3D principales con destellos y relieve */}
        <g filter="url(#gold3DShadow)">
          {/* Gran Estrella Dorada 1 (Superior Derecha) */}
          <g transform="translate(310, 110)">
            <circle cx="0" cy="0" r="28" fill="url(#goldGlow)" />
            {/* 8-Point Star Flare */}
            <path
              d="M 0 -36 Q 0 0 36 0 Q 0 0 0 36 Q 0 0 -36 0 Q 0 0 0 -36 Z"
              fill="url(#goldReliefGrad)"
            />
            <path
              d="M -16 -16 Q 0 0 16 -16 Q 0 0 16 16 Q 0 0 -16 16 Q 0 0 -16 -16 Z"
              fill="#ffffff"
              opacity="0.9"
            />
            <circle cx="0" cy="0" r="4.5" fill="#ffffff" />
          </g>

          {/* Gran Estrella Dorada 2 (Centro Izquierda) */}
          <g transform="translate(80, 260) scale(0.85)">
            <circle cx="0" cy="0" r="26" fill="url(#goldGlow)" />
            <path
              d="M 0 -32 Q 0 0 32 0 Q 0 0 0 32 Q 0 0 -32 0 Q 0 0 0 -32 Z"
              fill="url(#goldReliefGrad)"
            />
            <path
              d="M -14 -14 Q 0 0 14 -14 Q 0 0 14 14 Q 0 0 -14 14 Q 0 0 -14 -14 Z"
              fill="#ffffff"
              opacity="0.9"
            />
            <circle cx="0" cy="0" r="4" fill="#ffffff" />
          </g>

          {/* Estrella Dorada 3 (Inferior Centro-Derecha) */}
          <g transform="translate(290, 440) scale(0.7)">
            <circle cx="0" cy="0" r="24" fill="url(#goldGlow)" />
            <path
              d="M 0 -30 Q 0 0 30 0 Q 0 0 0 30 Q 0 0 -30 0 Q 0 0 0 -30 Z"
              fill="url(#goldReliefGrad)"
            />
            <circle cx="0" cy="0" r="3.5" fill="#ffffff" />
          </g>

          {/* Estrella Dorada 4 (Superior Izquierda) */}
          <g transform="translate(130, 90) scale(0.55)">
            <circle cx="0" cy="0" r="22" fill="url(#goldGlow)" />
            <path
              d="M 0 -26 Q 0 0 26 0 Q 0 0 0 26 Q 0 0 -26 0 Q 0 0 0 -26 Z"
              fill="url(#goldReliefGrad)"
            />
            <circle cx="0" cy="0" r="3" fill="#ffffff" />
          </g>
        </g>
      </svg>
    </div>
  );
};

/* =========================================================================
 * 3. MESA ESMERALDA REAL 3D
 * Fieltro verde esmeralda vibrante con foco central suave, textura nítida, sombras perimetrales y esquinas doradas
 * ========================================================================= */
export const MesaEsmeralda3DBackground: React.FC<{ isThumbnail?: boolean }> = ({ isThumbnail }) => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#022212]">
      {/* Base de paño verde esmeralda de torneo */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 95% 85% at 50% 38%, #059669 0%, #047857 45%, #064e3b 75%, #022212 100%)',
        }}
      />

      {/* Textura física hiper-nítida de paño de torneo de alta densidad (SVG vectorial repetible) */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            repeating-linear-gradient(45deg, rgba(52, 211, 153, 0.12) 0px, rgba(52, 211, 153, 0.12) 1px, transparent 1px, transparent 4px),
            repeating-linear-gradient(-45deg, rgba(52, 211, 153, 0.12) 0px, rgba(52, 211, 153, 0.12) 1px, transparent 1px, transparent 4px),
            radial-gradient(circle, rgba(16, 185, 129, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: isThumbnail ? '6px 6px, 6px 6px, 8px 8px' : '8px 8px, 8px 8px, 12px 12px',
        }}
      />

      {/* Foco de iluminación volumétrico suave cenital sobre el centro de la mesa */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 75% 55% at 50% 32%, rgba(110, 231, 183, 0.28) 0%, rgba(16, 185, 129, 0.12) 50%, transparent 80%)',
        }}
      />

      {/* Sombra perimetral profunda (Bisel y banda acolchada de mesa) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 100px 30px rgba(1, 18, 9, 0.95)',
        }}
      />

      {/* SVG Esquinas Doradas en Relieve 3D y Reflejos Metálicos */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="goldCornerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="35%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          <filter id="cornerGoldGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.85" />
            <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#fde047" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Esquina Superior Izquierda con filigrana y relieve */}
        <g filter="url(#cornerGoldGlow)" transform="translate(10, 10)">
          <path d="M 0,0 L 50,0 L 0,50 Z" fill="url(#goldCornerGrad)" />
          <path d="M 0,0 L 70,0 C 70,30 30,70 0,70 Z" fill="none" stroke="url(#goldCornerGrad)" strokeWidth="2.5" />
          <circle cx="20" cy="20" r="3.5" fill="#fef08a" />
        </g>

        {/* Esquina Superior Derecha */}
        <g filter="url(#cornerGoldGlow)" transform="translate(-10, 10)">
          <path d="M 100%,0 L calc(100% - 50px),0 L 100%,50 Z" fill="url(#goldCornerGrad)" />
          <circle cx="calc(100% - 20px)" cy="20" r="3.5" fill="#fef08a" />
        </g>

        {/* Esquina Inferior Izquierda */}
        <g filter="url(#cornerGoldGlow)" transform="translate(10, -10)">
          <path d="M 0,100% L 50,100% L 0,calc(100% - 50px) Z" fill="url(#goldCornerGrad)" />
          <circle cx="20" cy="calc(100% - 20px)" r="3.5" fill="#fef08a" />
        </g>

        {/* Esquina Inferior Derecha */}
        <g filter="url(#cornerGoldGlow)" transform="translate(-10, -10)">
          <path d="M 100%,100% L calc(100% - 50px),100% L 100%,calc(100% - 50px) Z" fill="url(#goldCornerGrad)" />
          <circle cx="calc(100% - 20px)" cy="calc(100% - 20px)" r="3.5" fill="#fef08a" />
        </g>
      </svg>
    </div>
  );
};

/* =========================================================================
 * 4. NEÓN CYBERPUNK 3D
 * Fondo púrpura profundo y magenta con líneas de perspectiva 3D retroiluminadas en cian neón y partículas
 * ========================================================================= */
export const NeonCyberpunk3DBackground: React.FC<{ isThumbnail?: boolean }> = ({ isThumbnail }) => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0a0216]">
      {/* Atmósfera cibernética magenta y púrpura */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #18032e 0%, #3b0764 35%, #701a75 60%, #090117 100%)',
        }}
      />

      {/* Resplandor del horizonte de neón (Horizon Glow) */}
      <div
        className="absolute top-[40%] sm:top-[42%] left-0 right-0 h-44 -translate-y-1/2 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 90% 70% at 50% 50%, rgba(6, 182, 212, 0.45) 0%, rgba(217, 70, 239, 0.35) 45%, transparent 75%)
          `,
          filter: isThumbnail ? 'blur(16px)' : 'blur(30px)',
        }}
      />

      {/* Línea de horizonte de rayo láser cian neón */}
      <div
        className="absolute top-[40%] sm:top-[42%] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent"
        style={{
          boxShadow: '0 0 15px 4px rgba(34, 211, 238, 0.8), 0 0 35px 8px rgba(232, 121, 249, 0.6)',
        }}
      />

      {/* Rejilla de Perspectiva 3D Retroiluminada en Cian Neón (Suelo tridimensional) */}
      <div
        className="absolute bottom-0 left-0 right-0 top-[40%] sm:top-[42%] overflow-hidden pointer-events-none"
        style={{
          perspective: isThumbnail ? '200px' : '360px',
          perspectiveOrigin: '50% 0%',
        }}
      >
        <div
          className="w-[200%] -left-[50%] h-[200%] absolute top-0"
          style={{
            transform: 'rotateX(72deg)',
            transformOrigin: '50% 0%',
            backgroundImage: `
              linear-gradient(to right, rgba(6, 182, 212, 0.65) 2px, transparent 2px),
              linear-gradient(to bottom, rgba(232, 121, 249, 0.65) 2px, transparent 2px)
            `,
            backgroundSize: isThumbnail ? '24px 24px' : '40px 40px',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
          }}
        />
      </div>

      {/* SVG Partículas Flotantes Brillantes de Neón */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 400 600"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g filter="url(#neonGlow)">
          {/* Orbes y diamantes de neón cian y fucsia */}
          <polygon points="60,90 66,98 60,106 54,98" fill="#22d3ee" opacity="0.9" />
          <polygon points="320,80 327,89 320,98 313,89" fill="#f43f5e" opacity="0.85" />
          <polygon points="180,50 185,57 180,64 175,57" fill="#a855f7" opacity="0.8" />
          <circle cx="90" cy="180" r="3.5" fill="#38bdf8" />
          <circle cx="310" cy="210" r="4" fill="#e879f9" />
          <circle cx="210" cy="140" r="2.5" fill="#22d3ee" />
          <polygon points="120,380 126,388 120,396 114,388" fill="#38bdf8" opacity="0.8" />
          <polygon points="280,420 287,429 280,438 273,429" fill="#f43f5e" opacity="0.85" />
          <circle cx="70" cy="480" r="3" fill="#22d3ee" />
          <circle cx="340" cy="510" r="3.5" fill="#e879f9" />
        </g>
      </svg>
    </div>
  );
};

/* =========================================================================
 * 5. ONDAS SUAVES AZUL Y LAVANDA
 * Estilo moderno y minimalista de capas abstractas fluidas.
 * Tonos: azul cielo vibrante, aciano y toques suaves de lavanda/púrpura claro en la parte superior,
 * centro luminoso en azul hielo/cian pastel, y capas inferiores en azul ultramar profundo.
 * Sombreados suaves y elegantes entre curvas superpuestas para profundidad 3D limpia y relajante.
 * ========================================================================= */
export const OndasAzulLavandaBackground: React.FC<{ isThumbnail?: boolean }> = ({ isThumbnail }) => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#070e26]">
      {/* Fondo base fluido: gradiente vertical armonizado */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(175deg, 
              #7c3aed 0%, 
              #4f46e5 14%, 
              #2563eb 32%, 
              #0284c7 50%, 
              #0369a1 68%, 
              #0f172a 88%, 
              #070e26 100%
            )
          `,
        }}
      />

      {/* Resplandor superior suave en tonos lavanda / púrpura etéreo */}
      <div
        className="absolute -top-12 left-1/4 w-[300px] sm:w-[550px] h-[250px] sm:h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(192, 132, 252, 0.45) 0%, rgba(129, 140, 248, 0.25) 45%, transparent 75%)',
          filter: isThumbnail ? 'blur(16px)' : 'blur(40px)',
        }}
      />

      {/* Centro luminoso en azul hielo / cian pastel */}
      <div
        className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[620px] h-[220px] sm:h-[420px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(207, 250, 254, 0.6) 0%, rgba(125, 211, 252, 0.38) 40%, rgba(56, 189, 248, 0.15) 65%, transparent 80%)',
          filter: isThumbnail ? 'blur(18px)' : 'blur(45px)',
        }}
      />

      {/* SVG Capas Fluidas de Ondas Curvadas Superpuestas con Sombreado 3D Suave */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 400 600"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Sombreado suave y elegante entre curvas superpuestas */}
          <filter id="waveShadow1" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#091436" floodOpacity="0.55" />
          </filter>
          <filter id="waveShadow2" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="#060c20" floodOpacity="0.65" />
          </filter>
          <filter id="waveShadow3" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#020617" floodOpacity="0.75" />
          </filter>

          {/* Gradiente 1: Lavanda a Azul Aciano suave (Capa Superior) */}
          <linearGradient id="waveGradTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.9" />
            <stop offset="45%" stopColor="#818cf8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.8" />
          </linearGradient>

          {/* Gradiente 2: Azul Aciano a Azul Cielo Vibrante */}
          <linearGradient id="waveGradMidTop" x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.75" />
          </linearGradient>

          {/* Gradiente 3: Centro Luminoso Azul Hielo / Cian Pastel */}
          <linearGradient id="waveGradLuminous" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#bae6fd" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.8" />
          </linearGradient>

          {/* Gradiente 4: Azul Océano / Azul Cobalto */}
          <linearGradient id="waveGradMidBottom" x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#0284c7" stopOpacity="0.92" />
            <stop offset="80%" stopColor="#1d4ed8" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#1e40af" stopOpacity="0.96" />
          </linearGradient>

          {/* Gradiente 5: Azul Ultramar Profundo a Abismo Noche */}
          <linearGradient id="waveGradDeep" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e40af" stopOpacity="0.98" />
            <stop offset="40%" stopColor="#1e3a8a" stopOpacity="0.98" />
            <stop offset="75%" stopColor="#172554" stopOpacity="1" />
            <stop offset="100%" stopColor="#070e26" stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Capa de Onda 1 (Superior Izquierda: Cintas de Lavanda y Aciano) */}
        <g filter="url(#waveShadow1)">
          <path
            d="M -30,-20 L 430,-20 L 430,95 C 330,140 240,70 140,115 C 60,150 10,130 -30,155 Z"
            fill="url(#waveGradTop)"
          />
        </g>

        {/* Capa de Onda 2 (Superior a Media: Transición hacia Azul Cielo) */}
        <g filter="url(#waveShadow1)">
          <path
            d="M -30,-20 L 430,-20 L 430,175 C 340,145 270,225 180,205 C 90,185 20,240 -30,220 Z"
            fill="url(#waveGradMidTop)"
          />
        </g>

        {/* Capa de Onda 3 (Centro Luminoso: Cresta fluida en Azul Hielo / Cian Pastel) */}
        <g filter="url(#waveShadow2)">
          <path
            d="M -30,220 C 40,245 110,195 200,235 C 290,275 350,220 430,250 L 430,380 C 330,340 250,400 150,360 C 60,325 10,355 -30,340 Z"
            fill="url(#waveGradLuminous)"
          />
        </g>

        {/* Capa de Onda 4 (Media Baja: Azul Cobalto y Ultramar en abanico) */}
        <g filter="url(#waveShadow2)">
          <path
            d="M -30,335 C 50,365 140,320 230,365 C 320,410 370,360 430,395 L 430,510 C 330,470 230,530 130,490 C 40,455 0,480 -30,475 Z"
            fill="url(#waveGradMidBottom)"
          />
        </g>

        {/* Capa de Onda 5 (Base: Azul Ultramar Profundo / Abismo Noche) */}
        <g filter="url(#waveShadow3)">
          <path
            d="M -30,470 C 50,495 140,460 230,495 C 320,530 360,490 430,515 L 430,620 L -30,620 Z"
            fill="url(#waveGradDeep)"
          />
        </g>

        {/* Línea de acento luminoso sutil sobre la cresta central */}
        <path
          d="M -30,220 C 40,245 110,195 200,235 C 290,275 350,220 430,250"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeOpacity="0.45"
        />
      </svg>

      {/* Partículas de luz sutil flotantes */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 30%, rgba(255, 255, 255, 0.8) 1px, transparent 1px),
            radial-gradient(circle at 75% 45%, rgba(207, 250, 254, 0.9) 1.5px, transparent 1.5px),
            radial-gradient(circle at 40% 70%, rgba(192, 132, 252, 0.8) 1px, transparent 1px)
          `,
          backgroundSize: '160px 160px, 220px 220px, 190px 190px',
        }}
      />
    </div>
  );
};

// Retrocompatibility alias
export const OroImperial3DBackground = OndasAzulLavandaBackground;

/* =========================================================================
 * COMPONENTE THUMBNAIL INTERACTIVO PARA LA SECCIÓN DE CONFIGURACIÓN
 * Muestra fielmente el estilo 3D y volumen de cada fondo
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
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative w-full text-left rounded-2xl p-2.5 sm:p-3 border transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden shadow-lg ${
        isSelected
          ? 'border-amber-400 bg-amber-500/15 ring-2 ring-amber-400/50 shadow-amber-950/50 scale-[1.02]'
          : 'border-slate-800 bg-slate-900/85 hover:border-slate-700 hover:bg-slate-800/90'
      }`}
    >
      {/* Vista previa visual miniatura de alta resolución */}
      <div className="relative w-full h-20 sm:h-24 rounded-xl overflow-hidden border border-slate-700/80 mb-2.5 flex-shrink-0 shadow-inner">
        {id === 'cielo-celeste-3d' && <CieloCeleste3DBackground isThumbnail />}
        {id === 'galaxia-rubi-3d' && <GalaxiaRubi3DBackground isThumbnail />}
        {id === 'mesa-esmeralda-3d' && <MesaEsmeralda3DBackground isThumbnail />}
        {id === 'neon-cyberpunk-3d' && <NeonCyberpunk3DBackground isThumbnail />}
        {(id === 'ondas-azul-lavanda' || id === 'oro-imperial-3d') && (
          <OndasAzulLavandaBackground isThumbnail />
        )}

        {/* Capa ligera de contraste */}
        <div className="absolute inset-0 bg-slate-950/25 pointer-events-none" />

        {/* Badge indicador de seleccionado con resplandor */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-lg font-bold">
            <svg
              className="w-4 h-4 stroke-[3]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        )}

        {/* Mini ficha de dominó representativa en el centro */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-amber-300 font-mono font-bold text-[10px] shadow-xl border border-amber-400/30 flex items-center gap-1.5">
            <span className="text-white text-xs">🀰</span>
            <span className="font-sans font-bold text-[10px] tracking-wide uppercase text-stone-100">
              3D
            </span>
          </div>
        </div>
      </div>

      {/* Título y descripción */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span
            className={`text-xs sm:text-sm font-black truncate transition-colors ${
              isSelected ? 'text-amber-300' : 'text-stone-100 group-hover:text-white'
            }`}
          >
            {title}
          </span>
          {isSelected && (
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-400 bg-amber-400/20 px-1.5 py-0.5 rounded flex-shrink-0 border border-amber-400/40">
              Activo
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
