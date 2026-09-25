// Domino Scoreboard Internationalization System (Bilingual: Spanish & English)
// Auto-detects mobile phone language with fallback and persistence

export type AppLanguage = 'es' | 'en';
export type LanguageSetting = 'auto' | 'es' | 'en';

const LANGUAGE_STORAGE_KEY = 'domino_language_setting_v1';

/**
 * Detect the device's system language
 * Checks navigator.language and navigator.languages
 */
export function detectDeviceLanguage(): AppLanguage {
  if (typeof window === 'undefined' || !navigator) return 'es';

  // Check language list in order of user preference
  const languages = navigator.languages && navigator.languages.length > 0
    ? navigator.languages
    : [navigator.language || ''];

  for (const lang of languages) {
    if (!lang) continue;
    const lower = lang.toLowerCase();
    if (lower.startsWith('en')) return 'en';
    if (lower.startsWith('es')) return 'es';
  }

  // Primary check
  const primary = (navigator.language || '').toLowerCase();
  if (primary.startsWith('en')) return 'en';
  return 'es'; // Default to Spanish for Domino
}

/**
 * Load persisted language setting ('auto', 'es', or 'en')
 */
export function getSavedLanguageSetting(): LanguageSetting {
  if (typeof window === 'undefined') return 'auto';
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as LanguageSetting;
    if (saved === 'es' || saved === 'en' || saved === 'auto') {
      return saved;
    }
  } catch {}
  return 'auto';
}

/**
 * Save language setting
 */
export function saveLanguageSetting(setting: LanguageSetting): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, setting);
  } catch {}
}

/**
 * Resolve active language based on setting and device detection
 */
export function resolveActiveLanguage(setting?: LanguageSetting): AppLanguage {
  const currentSetting = setting || getSavedLanguageSetting();
  if (currentSetting === 'auto') {
    return detectDeviceLanguage();
  }
  return currentSetting;
}

export interface Translations {
  appName: string;
  appShortName: string;
  appTagline: string;
  metaDescription: string;
  // Header
  newMatch: string;
  confirmNewMatch: string;
  targetScore: string;
  timer: string;
  history: string;
  settings: string;
  music: string;
  installApp: string;
  installedApp: string;
  installPrompt: string;
  // Scoreboard
  player: string;
  team: string;
  handsWon: string;
  points: string;
  pts: string;
  addPoints: string;
  quickPoints: string;
  trancaCalculator: string;
  pointsToWin: string;
  leading: string;
  // Add Round Modal
  recordHand: string;
  recordHandSubtitle: string;
  whoWonHand: string;
  pointsScored: string;
  pointsPlaceholder: string;
  winReason: string;
  reasonNormal: string;
  reasonTranca: string;
  reasonCapicua: string;
  reasonPenalizacion: string;
  reasonNormalDesc: string;
  reasonTrancaDesc: string;
  reasonCapicuaDesc: string;
  reasonPenalizacionDesc: string;
  capicuaBonusNotice: string;
  handNotes: string;
  handNotesPlaceholder: string;
  saveHand: string;
  cancel: string;
  pointsRequired: string;
  // Tranca Modal
  trancaTitle: string;
  trancaSubtitle: string;
  playerRemainingTiles: string;
  totalPips: string;
  calculateWinner: string;
  trancaTie: string;
  trancaTieDesc: string;
  applyTrancaPoints: string;
  activeRule: string;
  clearTiles: string;
  quickAddTiles: string;
  // Timer Modal
  timerTitle: string;
  timerSeconds: string;
  start: string;
  pause: string;
  reset: string;
  timeRemaining: string;
  timeOver: string;
  changeDurationInSettings: string;
  // Round History
  roundsHistory: string;
  noRoundsYet: string;
  roundNumber: string;
  undoLastHand: string;
  confirmUndo: string;
  roundDetails: string;
  // Match History Modal
  pastMatchesTitle: string;
  noPastMatches: string;
  winner: string;
  duration: string;
  roundsCount: string;
  clearAllHistory: string;
  confirmClearHistory: string;
  viewDetails: string;
  hideDetails: string;
  deleteMatch: string;
  // Settings Modal
  gameSettings: string;
  languageSection: string;
  languageAuto: string;
  languageEs: string;
  languageEn: string;
  languageDesc: string;
  detectedLanguageNotice: string;
  gameMode: string;
  modeTeams: string;
  modeIndividual: string;
  targetPoints: string;
  playerNames: string;
  team1Label: string;
  team2Label: string;
  teamMembersNote: string;
  trancaRule: string;
  trancaRuleSumOpponent: string;
  trancaRuleDifference: string;
  trancaRuleSumOpponentDesc: string;
  trancaRuleDifferenceDesc: string;
  capicuaBonusLabel: string;
  soundEffects: string;
  hapticVibration: string;
  timerDuration: string;
  keepScreenAwake: string;
  keepScreenAwakeDesc: string;
  screenAwakeOn: string;
  screenAwakeOff: string;
  screenAwakeActiveNotice: string;
  screenAwakeInactiveNotice: string;
  saveSettings: string;
  resetSettings: string;
  changeBackground: string;
  changeBackgroundDesc: string;
  bgCieloCeleste: string;
  bgCieloCelesteDesc: string;
  bgGalaxiaRubi: string;
  bgGalaxiaRubiDesc: string;
  bgMesaEsmeralda: string;
  bgMesaEsmeraldaDesc: string;
  bgNeonCyberpunk: string;
  bgNeonCyberpunkDesc: string;
  bgOndasAzulLavanda: string;
  bgOndasAzulLavandaDesc: string;
  bgOroImperial?: string;
  bgOroImperialDesc?: string;
  // Share App
  shareApp: string;
  shareAppDesc: string;
  shareAppBtn: string;
  shareAppSuccess: string;
  shareAppCopied: string;
  // Victory Modal
  victoryTitle: string;
  matchChampion: string;
  finalScore: string;
  totalDuration: string;
  handsPlayed: string;
  newMatchBtn: string;
  rematchBtn: string;
  shareResult: string;
  copiedToClipboard: string;
  // Music Player
  musicTitle: string;
  musicSubtitle: string;
  searchSongPlaceholder: string;
  searchBtn: string;
  searching: string;
  curatedGenres: string;
  playSong: string;
  pauseSong: string;
  openInYouTubeApp: string;
  noSearchResults: string;
  volumeLabel: string;
  karaokeModeNotice: string;
  // PWA Download / Install Guide
  downloadAppTitle: string;
  downloadAppSubtitle: string;
  iosGuideTitle: string;
  iosStep1: string;
  iosStep2: string;
  iosStep3: string;
  androidGuideTitle: string;
  androidDirectPrompt: string;
  pwaFeaturesOffline: string;
  pwaFeaturesFast: string;
  pwaFeaturesHome: string;
  installSuccess: string;
  alreadyInstalled: string;
}

export const TRANSLATIONS: Record<AppLanguage, Translations> = {
  es: {
    appName: 'Mesa & Dominó',
    appShortName: 'Mesa & Dominó',
    appTagline: 'Anotador de Puntos • Control rápido y automático para tus partidas',
    metaDescription: 'Mesa & Dominó - Anotador de puntos: Control rápido y automático para tus partidas de dominó.',
    // Header
    newMatch: 'Nueva Partida',
    confirmNewMatch: '¿Deseas iniciar una nueva partida? Se guardará el resultado de la partida actual en el historial.',
    targetScore: 'Meta',
    timer: 'Tiempo',
    history: 'Historial',
    settings: 'Ajustes',
    music: 'Música',
    installApp: 'Descargar App',
    installedApp: 'App Instalada',
    installPrompt: 'Instalar en Celular',
    // Scoreboard
    player: 'Jugador',
    team: 'Equipo',
    handsWon: 'manos',
    points: 'Puntos',
    pts: 'pts',
    addPoints: 'Anotar Mano',
    quickPoints: 'Puntos Rápidos',
    trancaCalculator: 'Calc. Tranca',
    pointsToWin: 'para ganar',
    leading: 'Liderando',
    // Add Round Modal
    recordHand: 'Anotar Mano',
    recordHandSubtitle: 'Selecciona el ganador e introduce los puntos obtenidos',
    whoWonHand: '¿Quién ganó la mano?',
    pointsScored: 'Puntos ganados',
    pointsPlaceholder: 'Ej: 35',
    winReason: 'Motivo de victoria',
    reasonNormal: 'Dominó Normal',
    reasonTranca: 'Tranca / Cierre',
    reasonCapicua: 'Capicúa',
    reasonPenalizacion: 'Penalización / Falta',
    reasonNormalDesc: 'Cerró la mano jugando su última ficha',
    reasonTrancaDesc: 'Nadie pudo jugar y tuvo menos puntos',
    reasonCapicuaDesc: 'Ganó dominando por ambas puntas',
    reasonPenalizacionDesc: 'Falta o infracción del contrario',
    capicuaBonusNotice: 'Incluye +{bonus} pts de bonus por Capicúa',
    handNotes: 'Nota o comentario (opcional)',
    handNotesPlaceholder: 'Ej. Mano disputada, buena jugada...',
    saveHand: 'Guardar Mano',
    cancel: 'Cancelar',
    pointsRequired: 'Por favor ingresa un número de puntos válido mayor a 0',
    // Tranca Modal
    trancaTitle: 'Calculadora de Tranca (Cierre)',
    trancaSubtitle: 'Ingresa las fichas que le quedaron a cada jugador para determinar automáticamente el ganador y la suma de puntos.',
    playerRemainingTiles: 'Fichas en mano',
    totalPips: 'Total puntos',
    calculateWinner: 'Calcular Tranca',
    trancaTie: '¡Empate en la Tranca!',
    trancaTieDesc: 'Dos o más jugadores tienen la misma cantidad mínima de puntos.',
    applyTrancaPoints: 'Anotar {points} pts a {winner}',
    activeRule: 'Regla activa',
    clearTiles: 'Limpiar',
    quickAddTiles: 'Fichas rápidas',
    // Timer Modal
    timerTitle: 'Temporizador de Turno',
    timerSeconds: 'segundos',
    start: 'Iniciar',
    pause: 'Pausar',
    reset: 'Reiniciar',
    timeRemaining: 'Tiempo restante',
    timeOver: '¡Tiempo agotado!',
    changeDurationInSettings: 'Puedes cambiar la duración en Ajustes',
    // Round History
    roundsHistory: 'Historial de Manos',
    noRoundsYet: 'Aún no hay manos registradas en esta partida.',
    roundNumber: 'Mano',
    undoLastHand: 'Deshacer última',
    confirmUndo: '¿Deseas eliminar la última mano registrada?',
    roundDetails: 'Detalles de la mano',
    // Match History Modal
    pastMatchesTitle: 'Historial de Partidas',
    noPastMatches: 'No hay partidas guardadas en el historial.',
    winner: 'Ganador',
    duration: 'Duración',
    roundsCount: 'Manos jugadas',
    clearAllHistory: 'Borrar historial',
    confirmClearHistory: '¿Estás seguro de que deseas borrar todas las partidas anteriores guardadas?',
    viewDetails: 'Ver detalles',
    hideDetails: 'Ocultar',
    deleteMatch: 'Eliminar',
    // Settings Modal
    gameSettings: 'Ajustes del Juego',
    languageSection: 'Idioma de la Aplicación',
    languageAuto: 'Automático (según celular)',
    languageEs: 'Español',
    languageEn: 'English (Inglés)',
    languageDesc: 'Detecta automáticamente el idioma configurado en tu teléfono móvil o elige tu preferencia manual.',
    detectedLanguageNotice: 'Idioma detectado en tu teléfono:',
    gameMode: 'Modalidad de juego',
    modeTeams: 'Parejas (2 Equipos)',
    modeIndividual: 'Individual (Hasta 4 jugadores)',
    targetPoints: 'Puntos meta para ganar',
    playerNames: 'Nombres de Jugadores / Parejas',
    team1Label: 'Nombre del Jugador / Pareja 1',
    team2Label: 'Nombre del Jugador / Pareja 2',
    teamMembersNote: 'Introduce los nombres separados por coma o & para personalizar',
    trancaRule: 'Regla para calcular Tranca',
    trancaRuleSumOpponent: 'Suma total de fichas rivales',
    trancaRuleDifference: 'Diferencia de puntos entre menor y rivales',
    trancaRuleSumOpponentDesc: 'El ganador se lleva todos los puntos de las fichas de los contrarios',
    trancaRuleDifferenceDesc: 'El ganador se lleva la diferencia entre sus puntos y los del rival',
    capicuaBonusLabel: 'Bonus por Capicúa (puntos extra)',
    soundEffects: 'Efectos de sonido',
    hapticVibration: 'Vibración al anotar puntos',
    timerDuration: 'Segundos por turno del temporizador',
    keepScreenAwake: 'Mantener pantalla activa',
    keepScreenAwakeDesc: 'Evita que la pantalla del teléfono se suspenda o apague durante el juego',
    screenAwakeOn: 'Pantalla activa (No se apaga)',
    screenAwakeOff: 'Pantalla normal (Se puede apagar)',
    screenAwakeActiveNotice: 'Pantalla activa: tu teléfono no se apagará durante la partida',
    screenAwakeInactiveNotice: 'Modo normal: tu pantalla se apagará según los ajustes de tu celular',
    saveSettings: 'Guardar Ajustes',
    resetSettings: 'Restaurar Valores',
    changeBackground: 'Cambiar Fondo',
    changeBackgroundDesc: 'Elige un ambiente 3D con colores vivos y efectos de profundidad',
    bgCieloCeleste: 'Cielo Celeste 3D',
    bgCieloCelesteDesc: 'Azul cielo vibrante y luminoso con nubes esponjosas en capas 3D y estrellas brillantes con destellos luminosos.',
    bgGalaxiaRubi: 'Galaxia Rubí 3D',
    bgGalaxiaRubiDesc: 'Fondo rojo carmesí ardiente con nebulosas espaciales y estrellas doradas con destellos luminosos en relieve 3D.',
    bgMesaEsmeralda: 'Mesa Esmeralda Real 3D',
    bgMesaEsmeraldaDesc: 'Fieltro verde esmeralda vibrante con foco central suave, sombras profundas y reflejos dorados en las esquinas.',
    bgNeonCyberpunk: 'Neón Cyberpunk 3D',
    bgNeonCyberpunkDesc: 'Fondo púrpura y magenta con líneas de perspectiva 3D en cian neón y partículas flotantes brillantes.',
    bgOndasAzulLavanda: 'Ondas Suaves Azul y Lavanda',
    bgOndasAzulLavandaDesc: 'Degradado fluido con capas de ondas curvadas en azul cielo, lavanda y azul ultramar profundo con efecto 3D relajante.',
    bgOroImperial: 'Ondas Suaves Azul y Lavanda',
    bgOroImperialDesc: 'Degradado fluido con capas de ondas curvadas en azul cielo, lavanda y azul ultramar profundo con efecto 3D relajante.',
    // Share App
    shareApp: 'Compartir Aplicación',
    shareAppDesc: 'Comparte el enlace oficial de Google Play Store con tus amigos y rivales de juego.',
    shareAppBtn: 'Compartir Aplicación',
    shareAppSuccess: '¡Gracias por compartir el anotador oficial!',
    shareAppCopied: '¡Enlace de Google Play copiado al portapapeles!',
    // Victory Modal
    victoryTitle: '¡Victoria de la Partida!',
    matchChampion: '¡Ha ganado la partida!',
    finalScore: 'Marcador final',
    totalDuration: 'Tiempo de juego',
    handsPlayed: 'Manos jugadas',
    newMatchBtn: 'Nueva Partida',
    rematchBtn: 'Revancha Inmediata',
    shareResult: 'Compartir Resultado',
    copiedToClipboard: '¡Resultado copiado al portapapeles!',
    // Music Player
    musicTitle: 'Música & Karaoke Pro para Dominó',
    musicSubtitle: 'Busca cualquier artista, canción o género para amenizar tu partida',
    searchSongPlaceholder: 'Buscar artista, canción o ritmo (ej. Vicente Fernández, Salsa, Los Tigres)...',
    searchBtn: 'Buscar',
    searching: 'Buscando canciones...',
    curatedGenres: 'Géneros clásicos para dominó',
    playSong: 'Reproducir',
    pauseSong: 'Pausar',
    openInYouTubeApp: 'Abrir en la app de YouTube',
    noSearchResults: 'No se encontraron resultados para la búsqueda.',
    volumeLabel: 'Volumen',
    karaokeModeNotice: 'Compatible con celulares Android y computadoras',
    // PWA Download / Install Guide
    downloadAppTitle: 'Descargar en tu Celular',
    downloadAppSubtitle: 'Instala esta aplicación directamente en la pantalla de inicio de tu celular para usarla a pantalla completa, más rápida y con acceso directo sin anuncios.',
    iosGuideTitle: 'Cómo descargar en iPhone / iPad (Safari)',
    iosStep1: 'En Safari, toca el botón Compartir (icono de caja con flecha hacia arriba en la barra inferior).',
    iosStep2: 'Desliza hacia abajo en el menú y selecciona "Añadir a pantalla de inicio".',
    iosStep3: 'Toca "Añadir" en la esquina superior derecha.',
    androidGuideTitle: 'Instalar en Android / Chrome',
    androidDirectPrompt: 'Toca el botón a continuación para descargar e instalar la app directamente en tu dispositivo.',
    pwaFeaturesOffline: 'Acceso directo desde tu pantalla de inicio',
    pwaFeaturesFast: 'Carga instantánea y consumo mínimo de batería',
    pwaFeaturesHome: 'Experiencia nativa a pantalla completa sin barras del navegador',
    installSuccess: '¡Aplicación instalada con éxito!',
    alreadyInstalled: '¡Ya estás usando la aplicación instalada!',
  },
  en: {
    appName: 'Mesa & Dominó',
    appShortName: 'Mesa & Dominó',
    appTagline: 'Scorekeeper • Fast and automatic control for your games',
    metaDescription: 'Mesa & Dominó - Scorekeeper: Fast and automatic scoring for your domino games.',
    // Header
    newMatch: 'New Match',
    confirmNewMatch: 'Start a new match? The current match result will be saved to your history.',
    targetScore: 'Target',
    timer: 'Timer',
    history: 'History',
    settings: 'Settings',
    music: 'Music',
    installApp: 'Download App',
    installedApp: 'App Installed',
    installPrompt: 'Install on Phone',
    // Scoreboard
    player: 'Player',
    team: 'Team',
    handsWon: 'hands',
    points: 'Points',
    pts: 'pts',
    addPoints: 'Record Hand',
    quickPoints: 'Quick Points',
    trancaCalculator: 'Tranca Calc',
    pointsToWin: 'to win',
    leading: 'Leading',
    // Add Round Modal
    recordHand: 'Record Hand',
    recordHandSubtitle: 'Select the winning player and enter points earned',
    whoWonHand: 'Who won this hand?',
    pointsScored: 'Points scored',
    pointsPlaceholder: 'e.g. 35',
    winReason: 'Win reason',
    reasonNormal: 'Normal Domino',
    reasonTranca: 'Tranca / Blocked',
    reasonCapicua: 'Capicua',
    reasonPenalizacion: 'Penalty / Foul',
    reasonNormalDesc: 'Finished the hand by playing the last tile',
    reasonTrancaDesc: 'Game was blocked and player had lowest tile count',
    reasonCapicuaDesc: 'Won by playing a tile that matches both open ends',
    reasonPenalizacionDesc: 'Opponent penalty or violation points',
    capicuaBonusNotice: 'Includes +{bonus} pts Capicua bonus',
    handNotes: 'Notes (optional)',
    handNotesPlaceholder: 'e.g. Great play, close finish...',
    saveHand: 'Save Hand',
    cancel: 'Cancel',
    pointsRequired: 'Please enter a valid point value greater than 0',
    // Tranca Modal
    trancaTitle: 'Tranca (Blocked Game) Calculator',
    trancaSubtitle: 'Enter remaining tiles for each player to automatically determine the winner and score difference.',
    playerRemainingTiles: 'Tiles in hand',
    totalPips: 'Total points',
    calculateWinner: 'Calculate Winner',
    trancaTie: 'Tranca Tie!',
    trancaTieDesc: 'Two or more players have the exact same lowest point count.',
    applyTrancaPoints: 'Award {points} pts to {winner}',
    activeRule: 'Active rule',
    clearTiles: 'Clear',
    quickAddTiles: 'Quick tiles',
    // Timer Modal
    timerTitle: 'Turn Timer',
    timerSeconds: 'seconds',
    start: 'Start',
    pause: 'Pause',
    reset: 'Reset',
    timeRemaining: 'Time remaining',
    timeOver: 'Time is up!',
    changeDurationInSettings: 'You can adjust timer duration in Settings',
    // Round History
    roundsHistory: 'Hands History',
    noRoundsYet: 'No hands recorded yet in this match.',
    roundNumber: 'Hand',
    undoLastHand: 'Undo last',
    confirmUndo: 'Are you sure you want to delete the last recorded hand?',
    roundDetails: 'Hand details',
    // Match History Modal
    pastMatchesTitle: 'Past Matches History',
    noPastMatches: 'No past matches saved yet.',
    winner: 'Winner',
    duration: 'Duration',
    roundsCount: 'Hands played',
    clearAllHistory: 'Clear History',
    confirmClearHistory: 'Are you sure you want to delete all saved past matches?',
    viewDetails: 'View details',
    hideDetails: 'Hide',
    deleteMatch: 'Delete',
    // Settings Modal
    gameSettings: 'Game Settings',
    languageSection: 'App Language',
    languageAuto: 'Auto (detect phone language)',
    languageEs: 'Español (Spanish)',
    languageEn: 'English',
    languageDesc: 'Automatically detects whether your phone is set to English or Spanish, or choose your preference.',
    detectedLanguageNotice: 'Language detected on your device:',
    gameMode: 'Game Mode',
    modeTeams: 'Teams (2 Teams)',
    modeIndividual: 'Individual (Up to 4 players)',
    targetPoints: 'Target score to win',
    playerNames: 'Player / Team Names',
    team1Label: 'Player / Team 1 Name',
    team2Label: 'Player / Team 2 Name',
    teamMembersNote: 'Enter player names separated by commas or &',
    trancaRule: 'Tranca / Block calculation rule',
    trancaRuleSumOpponent: 'Sum of all opponents’ tiles',
    trancaRuleDifference: 'Difference between winner and opponents',
    trancaRuleSumOpponentDesc: 'Winner receives the sum of all tiles held by opponents',
    trancaRuleDifferenceDesc: 'Winner receives the difference between their score and opponents',
    capicuaBonusLabel: 'Capicua bonus (extra points)',
    soundEffects: 'Sound effects',
    hapticVibration: 'Haptic vibration on points',
    timerDuration: 'Turn timer duration (seconds)',
    keepScreenAwake: 'Keep screen awake',
    keepScreenAwakeDesc: 'Prevents the phone screen from sleeping or dimming during the game',
    screenAwakeOn: 'Screen awake (Always on)',
    screenAwakeOff: 'Normal screen (Sleep allowed)',
    screenAwakeActiveNotice: 'Screen awake: your phone will stay on during the match',
    screenAwakeInactiveNotice: 'Normal mode: your screen will sleep according to device settings',
    saveSettings: 'Save Settings',
    resetSettings: 'Reset to Defaults',
    changeBackground: 'Change Background',
    changeBackgroundDesc: 'Choose a vivid 3D environment with depth and volumetric lighting',
    bgCieloCeleste: 'Celestial Sky 3D',
    bgCieloCelesteDesc: 'Vivid luminous sky blue with fluffy 3D layered clouds and sparkling stars with bright flares.',
    bgGalaxiaRubi: 'Ruby Galaxy 3D',
    bgGalaxiaRubiDesc: 'Fiery crimson & deep scarlet nebulae with embossed 3D golden stars and cosmic depth.',
    bgMesaEsmeralda: 'Royal Emerald Table 3D',
    bgMesaEsmeraldaDesc: 'Tournament emerald green felt with smooth spotlight, deep perimeter shadows, and gold reflections.',
    bgNeonCyberpunk: 'Cyberpunk Neon 3D',
    bgNeonCyberpunkDesc: 'Deep purple & magenta with 3D perspective cyber grid in neon cyan and floating glow particles.',
    bgOndasAzulLavanda: 'Soft Blue & Lavender Waves',
    bgOndasAzulLavandaDesc: 'Fluid gradient with layered curved waves in sky blue, lavender, and deep ultramarine with calming 3D depth.',
    bgOroImperial: 'Soft Blue & Lavender Waves',
    bgOroImperialDesc: 'Fluid gradient with layered curved waves in sky blue, lavender, and deep ultramarine with calming 3D depth.',
    // Share App
    shareApp: 'Share Application',
    shareAppDesc: 'Official Google Play Store link to share the scorekeeper with your friends and opponents.',
    shareAppBtn: 'Share Application',
    shareAppSuccess: 'Thank you for sharing the official scorekeeper!',
    shareAppCopied: 'Google Play link copied to clipboard!',
    // Victory Modal
    victoryTitle: 'Match Victory!',
    matchChampion: 'Won the match!',
    finalScore: 'Final Score',
    totalDuration: 'Match duration',
    handsPlayed: 'Hands played',
    newMatchBtn: 'New Match',
    rematchBtn: 'Rematch',
    shareResult: 'Share Result',
    copiedToClipboard: 'Match summary copied to clipboard!',
    // Music Player
    musicTitle: 'Music & Karaoke Pro for Domino',
    musicSubtitle: 'Search any artist, song, or genre to play during your domino match',
    searchSongPlaceholder: 'Search any artist, song, or rhythm (e.g. Frank Sinatra, Salsa, Classic Rock)...',
    searchBtn: 'Search',
    searching: 'Searching songs...',
    curatedGenres: 'Classic Domino Genres',
    playSong: 'Play',
    pauseSong: 'Pause',
    openInYouTubeApp: 'Open in YouTube app',
    noSearchResults: 'No songs found for this search.',
    volumeLabel: 'Volume',
    karaokeModeNotice: 'Compatible with Android mobile phones and desktop computers',
    // PWA Download / Install Guide
    downloadAppTitle: 'Download to Your Phone',
    downloadAppSubtitle: 'Install this application directly onto your mobile phone’s home screen to run in full-screen, launch faster, and work offline.',
    iosGuideTitle: 'How to install on iPhone / iPad (Safari)',
    iosStep1: 'In Safari, tap the Share icon (the square with an arrow pointing up at the bottom).',
    iosStep2: 'Scroll down and tap "Add to Home Screen".',
    iosStep3: 'Tap "Add" in the top-right corner to finish.',
    androidGuideTitle: 'Install on Android / Chrome',
    androidDirectPrompt: 'Tap the button below to download and install the app directly on your device.',
    pwaFeaturesOffline: 'Direct access from your home screen',
    pwaFeaturesFast: 'Instant loading and minimal battery usage',
    pwaFeaturesHome: 'Full-screen native experience without browser toolbars',
    installSuccess: 'Application installed successfully!',
    alreadyInstalled: 'You are already using the installed application!',
  },
};

/**
 * Format localized player names if they match default template
 */
export function formatPlayerDisplayName(name: string, lang: AppLanguage): string {
  if (!name) return lang === 'es' ? 'Jugador' : 'Player';

  // Format raw IDs like team_1 or player_1
  if (/^team[_-]?(\d+)$/i.test(name)) {
    const num = name.match(/^team[_-]?(\d+)$/i)?.[1];
    return lang === 'es' ? `Jugador ${num}` : `Player ${num}`;
  }
  if (/^player[_-]?(\d+)$/i.test(name)) {
    const num = name.match(/^player[_-]?(\d+)$/i)?.[1];
    return lang === 'es' ? `Jugador ${num}` : `Player ${num}`;
  }

  // Translate "Jugador 1" -> "Player 1", "Equipo 1" -> "Team 1"
  if (lang === 'en') {
    if (/^jugador\s*(\d+)$/i.test(name)) {
      const num = name.match(/^jugador\s*(\d+)$/i)?.[1];
      return `Player ${num}`;
    }
    if (/^equipo\s*(\d+)$/i.test(name)) {
      const num = name.match(/^equipo\s*(\d+)$/i)?.[1];
      return `Team ${num}`;
    }
    if (name === 'Nosotros') return 'Us';
    if (name === 'Ellos') return 'Them';
  } else {
    if (/^player\s*(\d+)$/i.test(name)) {
      const num = name.match(/^player\s*(\d+)$/i)?.[1];
      return `Jugador ${num}`;
    }
    if (/^team\s*(\d+)$/i.test(name)) {
      const num = name.match(/^team\s*(\d+)$/i)?.[1];
      return `Equipo ${num}`;
    }
    if (name === 'Us') return 'Nosotros';
    if (name === 'Them') return 'Ellos';
  }

  return name;
}
