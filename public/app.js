// ============================================================================
// PIRINOLA ONLINE 3D • ¡TOMA TODO! — CLIENT APPLICATION
// ============================================================================

const AVATARS = ['🤠', '💀', '🌺', '🦅', '🥊', '🎭', '🌶️', '🎸', '🌵', '👑'];
const COLORS = [
  '#ec4899', '#06b6d4', '#f59e0b', '#10b981', '#3b82f6',
  '#8b5cf6', '#ef4444', '#f97316', '#14b8a6', '#eab308', '#18181b'
];
const THEMES = [
  { id: 'jugueteria', labelEs: 'Juguetería', labelEn: 'Toyshop' },
  { id: 'talavera', labelEs: 'Talavera', labelEn: 'Talavera' },
  { id: 'parota', labelEs: 'Parota', labelEn: 'Parota' }
];
const TOP_SKINS = [
  { id: 'artesanal', icon: '🎡', labelEs: 'Artesanal', labelEn: 'Artisan' },
  { id: 'talavera', icon: '🏺', labelEs: 'Talavera', labelEn: 'Talavera' },
  { id: 'obsidiana', icon: '🖤', labelEs: 'Obsidiana', labelEn: 'Obsidian' }
];

const BANTER_MAP = {
  crown: { es: '¡Toma todo el pozo! 👑', en: 'Take the whole pot! 👑' },
  allput: { es: '¡Todos ponen parejo! 🙌', en: 'Everyone chips in! 🙌' },
  faith: { es: '¡Gírale con fe! 🌀', en: 'Spin it with faith! 🌀' },
  stingy: { es: '¡Que no te dé codo! 🪙', en: "Don't be stingy! 🪙" },
  pot: { es: '¡Venga ese pozo! 💰', en: 'Bring that pot home! 💰' },
  lucky: { es: '¡Manita santa, no me falles! 🍀', en: "Lucky hand, don't fail me! 🍀" },
  hurry: { es: '¡Ándale, gírale ya! ⏰', en: 'Hurry up and spin! ⏰' }
};

const I18N = {
  es: {
    header_sub: '¡TOMA TODO! • MULTIJUGADOR',
    resume_label: 'Partida activa en sala:',
    btn_resume: 'Reconectar',
    profile_title: '🎭 Tu Perfil de Jugador',
    your_name_label: 'Tu Nombre o Apodo',
    choose_avatar_label: 'Elige tu Avatar',
    choose_color_label: 'Color de tu Ficha',
    tab_create: '🌀 Crear Sala',
    tab_join: '🔑 Unirse a Sala',
    mode_label: '🏆 Modo de Juego',
    mode_elimination: 'Último en Pie (Eliminación Clásica)',
    mode_target: 'Meta de Fichas (Carrera al Tesoro)',
    mode_rounds: 'Por Rondas (Partida Rápida)',
    starting_coins_label: '🪙 Fichas Iniciales',
    base_stake_label: '💰 Apuesta Base',
    target_coins_label: '🎯 Meta para Ganar',
    max_rounds_label: '🔄 Número de Rondas',
    turn_timer_label: '⏱️ Tiempo por Turno',
    timer_none: 'Sin límite (Manual)',
    feria_twists_title: '🎪 Reglas Especiales de la Feria',
    toggle_two_tops: '🔥 <strong>Doble Pirinola:</strong> ¡Gira 2 pirinolas al mismo tiempo!',
    toggle_miracle: '🍀 <strong>Último Aliento:</strong> 1 giro de milagro al quedar en 0 fichas',
    toggle_reante: '💰 <strong>Pozo Vivo:</strong> Todos ponen automáticamente cuando el pozo queda en 0',
    btn_create_room: '🌀 ¡Crear Sala y Jugar!',
    room_code_label: 'Código de la Sala (6 letras)',
    btn_join_room: '🚀 Entrar a la Mesa',
    lobby_code_title: 'CÓDIGO DE SALA',
    btn_copy_link: '🔗 Copiar',
    btn_leave: '🚪 Salir',
    btn_add_bot: '🤖 +Bot',
    btn_remove_bot: '➖ Bot',
    waiting_host_msg: 'Esperando a que el anfitrión inicie la partida...',
    btn_start_game: '🌀 ¡PONER AL POZO Y GIRAR!',
    history_short: 'Historial',
    pozo_title: '💰 POZO',
    swipe_hint: 'Desliza o toca la Pirinola para girar',
    btn_blow: '¡Sóplale!',
    btn_tap: '¡Golpecito!',
    btn_spin_main: '¡GIRAR!',
    btn_spin_sub: 'Toca o mantén',
    banter_crown: '¡Toma todo el pozo!',
    banter_allput: '¡Todos ponen!',
    banter_faith: '¡Gírale con fe!',
    banter_stingy: '¡No te dé codo!',
    banter_pot: '¡Venga ese pozo!',
    banter_lucky: '¡Manita santa!',
    banter_hurry: '¡Ándale, gírale!',
    awards_heading: '🏅 Reconocimientos de la Mesa',
    btn_share_card: '📸 Descargar / Compartir Trofeo',
    btn_play_again: '🔄 Volver a la Sala',
    qr_modal_title: '📱 Escanea para Entrar a la Mesa',
    btn_close: 'Cerrar',
    history_modal_title: '📜 Crónica de Giros',
    rules_modal_title: '📖 Cómo Jugar a la Pirinola (Toma Todo)',
    rules_intro: 'La <strong>Pirinola</strong> (o <em>Toma Todo</em>) es el clásico juego mexicano de azar. Al comenzar, cada jugador pone su apuesta base en <strong>El Pozo</strong> central y se turnan para girar el trompo de 6 caras:',
    rule_pon1: 'Pones 1 apuesta base de tus fichas al pozo central.',
    rule_pon2: 'Pones 2 apuestas base de tus fichas al pozo central.',
    rule_toma1: 'Tomas 1 apuesta base del pozo central para tu montón.',
    rule_toma2: 'Tomas 2 apuestas base del pozo central para tu montón.',
    rule_todos: '¡Todos los jugadores activos ponen 1 apuesta base al pozo!',
    rule_todo: '¡Te llevas absolutamente todas las fichas acumuladas en el pozo!'
  },
  en: {
    header_sub: 'TAKE ALL! • MULTIPLAYER 3D',
    resume_label: 'Active game in room:',
    btn_resume: 'Reconnect',
    profile_title: '🎭 Your Player Profile',
    your_name_label: 'Your Name or Nickname',
    choose_avatar_label: 'Choose Your Avatar',
    choose_color_label: 'Token Color',
    tab_create: '🌀 Create Room',
    tab_join: '🔑 Join Room',
    mode_label: '🏆 Game Mode',
    mode_elimination: 'Last Player Standing (Classic Elimination)',
    mode_target: 'Target Bankroll (Race to Riches)',
    mode_rounds: 'Fixed Rounds (Quick Party Match)',
    starting_coins_label: '🪙 Starting Coins',
    base_stake_label: '💰 Base Stake',
    target_coins_label: '🎯 Target to Win',
    max_rounds_label: '🔄 Number of Rounds',
    turn_timer_label: '⏱️ Turn Timer',
    timer_none: 'Unlimited (Manual)',
    feria_twists_title: '🎪 Special Fairground Rules',
    toggle_two_tops: '🔥 <strong>Double Pirinola:</strong> Spin 2 pirinolas at the same time!',
    toggle_miracle: '🍀 <strong>Miracle Spin:</strong> 1 final all-or-nothing spin when hitting 0 coins',
    toggle_reante: '💰 <strong>Live Pot:</strong> Everyone automatically re-antes when the pot hits 0',
    btn_create_room: '🌀 Create Room & Play!',
    room_code_label: 'Room Code (6 letters)',
    btn_join_room: '🚀 Join the Table',
    lobby_code_title: 'ROOM CODE',
    btn_copy_link: '🔗 Copy',
    btn_leave: '🚪 Leave',
    btn_add_bot: '🤖 +Bot',
    btn_remove_bot: '➖ Bot',
    waiting_host_msg: 'Waiting for the host to start the match...',
    btn_start_game: '🌀 ANTE UP & SPIN!',
    history_short: 'History',
    pozo_title: '💰 POT',
    swipe_hint: 'Swipe or tap the Pirinola to spin',
    btn_blow: 'Blow!',
    btn_tap: 'Tap Table!',
    btn_spin_main: 'SPIN!',
    btn_spin_sub: 'Tap or hold',
    banter_crown: 'Take the whole pot!',
    banter_allput: 'Everyone puts in!',
    banter_faith: 'Spin with faith!',
    banter_stingy: "Don't be stingy!",
    banter_pot: 'Bring that pot!',
    banter_lucky: 'Lucky hand!',
    banter_hurry: 'Hurry up & spin!',
    awards_heading: '🏅 Table Honors & Awards',
    btn_share_card: '📸 Download / Share Trophy Card',
    btn_play_again: '🔄 Back to Lobby',
    qr_modal_title: '📱 Scan to Join the Table',
    btn_close: 'Close',
    history_modal_title: '📜 Spin Chronicle',
    rules_modal_title: '📖 How to Play Pirinola (Toma Todo)',
    rules_intro: '<strong>Pirinola</strong> (<em>Toma Todo</em>) is the classic Mexican tabletop game of chance. Everyone puts an initial stake into <strong>The Pot</strong> and takes turns spinning the 6-sided top:',
    rule_pon1: 'Put 1 base stake from your stash into the center pot.',
    rule_pon2: 'Put 2 base stakes from your stash into the center pot.',
    rule_toma1: 'Take 1 base stake from the center pot.',
    rule_toma2: 'Take 2 base stakes from the center pot.',
    rule_todos: 'Every active player puts 1 base stake into the center pot!',
    rule_todo: 'You sweep the entire center pot!'
  }
};

const FACE_TEXTS = {
  pon_1: { es: 'PON 1', en: 'PUT 1' },
  pon_2: { es: 'PON 2', en: 'PUT 2' },
  toma_1: { es: 'TOMA 1', en: 'TAKE 1' },
  toma_2: { es: 'TOMA 2', en: 'TAKE 2' },
  todos_ponen: { es: 'TODOS PONEN', en: 'ALL PUT' },
  toma_todo: { es: 'TOMA TODO', en: 'TAKE ALL' }
};

// Application State
const state = {
  lang: localStorage.getItem('pirinola_lang') || 'es',
  themeIdx: 0,
  skinIdx: 0,
  ws: null,
  pendingMessages: [],
  autoRejoining: false,
  playerId: localStorage.getItem('pirinola_pid') || null,
  roomCode: localStorage.getItem('pirinola_room') || null,
  playerName: localStorage.getItem('pirinola_name') || '',
  selectedAvatar: localStorage.getItem('pirinola_avatar') || AVATARS[0],
  selectedColor: localStorage.getItem('pirinola_color') || COLORS[0],
  room: null,
  isSpinning: false,
  spinDir: 1,
  baseRot1: 0,
  baseRot2: 0,
  chargePower: 0.65,
  charging: false,
  chargeStartMs: 0,
  chargeDir: 1,
  chargeRaf: null,
  lastChargeTick: 0,
  swipeActive: false,
  swipeMoved: false,
  swipeStartX: 0,
  swipeStartMs: 0,
  swipeLastX: 0,
  swipeLastMs: 0,
  swipePeakVx: 0,
  lastSwipeTickX: 0,
  suppressNextClick: false,
  deferredPwaPrompt: null
};

const el = (id) => document.getElementById(id);

function showToast(msg) {
  const container = el('toast-container');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'toast';
  div.textContent = msg;
  container.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

// Session Persistence Helpers
function saveSession(code, pid, name, avatar, color) {
  state.roomCode = code;
  state.playerId = pid;
  if (name) state.playerName = name;
  if (avatar) state.selectedAvatar = avatar;
  if (color) state.selectedColor = color;

  try {
    localStorage.setItem('pirinola_room', code);
    localStorage.setItem('pirinola_pid', pid);
    if (name) localStorage.setItem('pirinola_name', name);
    if (avatar) localStorage.setItem('pirinola_avatar', avatar);
    if (color) localStorage.setItem('pirinola_color', color);
  } catch (_) {}

  try {
    const url = new URL(window.location.href);
    url.searchParams.set('room', code);
    window.history.replaceState({}, '', url.toString());
  } catch (_) {}

  updateResumeBanner();
}

function clearSession() {
  state.room = null;
  state.roomCode = null;
  state.autoRejoining = false;
  try {
    localStorage.removeItem('pirinola_room');
  } catch (_) {}

  try {
    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    window.history.replaceState({}, '', url.toString());
  } catch (_) {}

  updateResumeBanner();
}

function updateResumeBanner() {
  const banner = el('resume-banner');
  const codeSpan = el('resume-code');
  if (!banner || !codeSpan) return;

  if (state.roomCode && state.playerId && !state.room) {
    codeSpan.textContent = state.roomCode;
    banner.classList.remove('hidden');
  } else {
    banner.classList.add('hidden');
  }
}

// Language & Theme Setup
function applyLanguage() {
  const dict = I18N[state.lang] || I18N.es;
  document.documentElement.lang = state.lang;
  el('btn-lang').textContent = state.lang === 'es' ? '🌐 EN' : '🌐 ES';
  el('header-subtitle').textContent = dict.header_sub;

  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.getAttribute('data-i18n');
    if (dict[key]) {
      node.innerHTML = dict[key];
    }
  });

  // Update 3D Pirinola face texts
  document.querySelectorAll('.pirinola-face').forEach((faceNode) => {
    const fKey = faceNode.getAttribute('data-face');
    const txtNode = faceNode.querySelector('.face-text');
    if (fKey && FACE_TEXTS[fKey] && txtNode) {
      txtNode.textContent = FACE_TEXTS[fKey][state.lang];
    }
  });

  // Update power preset labels
  const presets = document.querySelectorAll('.power-preset-btn');
  if (presets.length === 3) {
    presets[0].textContent = state.lang === 'es' ? 'Suave' : 'Gentle';
    presets[1].textContent = state.lang === 'es' ? 'Fuerte' : 'Strong';
    presets[2].textContent = '¡Turbo!';
  }

  updatePowerMeterUI(state.chargePower);
  if (state.room) {
    renderRoomState(state.room);
  }
}

function cycleTheme() {
  state.themeIdx = (state.themeIdx + 1) % THEMES.length;
  const theme = THEMES[state.themeIdx];
  document.documentElement.setAttribute('data-theme', theme.id);
  el('theme-label').textContent = state.lang === 'es' ? theme.labelEs : theme.labelEn;
  window.pirinolaAudio.playPop();
}

function cycleTopSkin() {
  state.skinIdx = (state.skinIdx + 1) % TOP_SKINS.length;
  const skin = TOP_SKINS[state.skinIdx];
  document.documentElement.setAttribute('data-top-skin', skin.id);
  const label = state.lang === 'es' ? skin.labelEs : skin.labelEn;
  el('btn-top-skin').innerHTML = `${skin.icon} <span id="skin-label" class="btn-chip-text">${label}</span>`;
  window.pirinolaAudio.playPop();
  showToast(
    state.lang === 'es'
      ? `${skin.icon} Pirinola: ${skin.labelEs}`
      : `${skin.icon} Top Skin: ${skin.labelEn}`
  );
}

// Initialize Avatar & Color Pickers
function initPickers() {
  const nameInput = el('input-name');
  nameInput.value = state.playerName;
  nameInput.addEventListener('input', () => {
    state.playerName = nameInput.value.trim();
    localStorage.setItem('pirinola_name', state.playerName);
  });

  const avatarContainer = el('avatar-picker');
  avatarContainer.innerHTML = '';
  AVATARS.forEach((av) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'picker-item' + (av === state.selectedAvatar ? ' selected' : '');
    btn.textContent = av;
    btn.addEventListener('click', () => {
      state.selectedAvatar = av;
      localStorage.setItem('pirinola_avatar', av);
      avatarContainer.querySelectorAll('.picker-item').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      window.pirinolaAudio.playPop();
    });
    avatarContainer.appendChild(btn);
  });

  const colorContainer = el('color-picker');
  colorContainer.innerHTML = '';
  COLORS.forEach((col) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'picker-item color-swatch' + (col === state.selectedColor ? ' selected' : '');
    btn.style.backgroundColor = col;
    btn.addEventListener('click', () => {
      state.selectedColor = col;
      localStorage.setItem('pirinola_color', col);
      colorContainer.querySelectorAll('.picker-item').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      window.pirinolaAudio.playPop();
    });
    colorContainer.appendChild(btn);
  });
}

// Safe WebSocket Connection with Pending Queue & Auto-Rejoin on Refresh
function connectWebSocket() {
  if (
    state.ws &&
    (state.ws.readyState === WebSocket.OPEN || state.ws.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }

  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${proto}//${window.location.host}/ws`;
  const ws = new WebSocket(wsUrl);
  state.ws = ws;

  ws.addEventListener('open', () => {
    // Flush any queued messages first
    while (state.pendingMessages.length > 0 && ws.readyState === WebSocket.OPEN) {
      const msg = state.pendingMessages.shift();
      ws.send(JSON.stringify(msg));
    }

    // If user refreshed while in a room (or had an active session), auto-rejoin seamlessly
    const params = new URLSearchParams(window.location.search);
    const urlRoom = params.get('room');

    if (state.roomCode && state.playerId) {
      if (!urlRoom || urlRoom.toUpperCase() === state.roomCode.toUpperCase()) {
        state.autoRejoining = true;
        ws.send(
          JSON.stringify({
            type: 'join_room',
            roomCode: state.roomCode,
            playerName: state.playerName || 'Jugador',
            avatar: state.selectedAvatar,
            color: state.selectedColor,
            playerId: state.playerId
          })
        );
      }
    }
  });

  ws.addEventListener('message', (ev) => {
    try {
      const data = JSON.parse(ev.data);
      handleServerMessage(data);
    } catch (_) {}
  });

  ws.addEventListener('close', () => {
    setTimeout(() => {
      connectWebSocket();
    }, 1800);
  });
}

function sendWs(payload) {
  if (state.ws && state.ws.readyState === WebSocket.OPEN) {
    state.ws.send(JSON.stringify(payload));
  } else {
    state.pendingMessages.push(payload);
    connectWebSocket();
  }
}

function switchScreen(screenId) {
  ['screen-home', 'screen-lobby', 'screen-game'].forEach((id) => {
    el(id).classList.toggle('active', id === screenId);
  });
}

// Handle Incoming Server Events
function handleServerMessage(data) {
  switch (data.type) {
    case 'room_joined': {
      state.autoRejoining = false;
      const myPlayer = (data.room.players || []).find((p) => p.id === data.playerId);
      saveSession(
        data.room.code,
        data.playerId,
        myPlayer ? myPlayer.name : state.playerName || 'Jugador',
        myPlayer ? myPlayer.avatar : state.selectedAvatar,
        myPlayer ? myPlayer.color : state.selectedColor
      );
      state.room = data.room;
      renderRoomState(data.room);
      break;
    }

    case 'room_updated': {
      state.room = data.room;
      if (!state.isSpinning) {
        renderRoomState(data.room);
      }
      break;
    }

    case 'game_started': {
      state.room = data.room;
      state.isSpinning = false;
      el('modal-victory').classList.add('hidden');
      renderRoomState(data.room);
      window.pirinolaAudio.playCoinClink(4, false);
      const startMsg =
        state.lang === 'es'
          ? '🌀 ¡Todos pusieron al pozo! ¡A girar la Pirinola!'
          : '🌀 Everyone anted up! Spin the Pirinola!';
      showToast(startMsg);
      break;
    }

    case 'spin_result': {
      state.room = data.room;
      animatePirinolaSpin(data.outcome, data.room);
      break;
    }

    case 'reaction_broadcast': {
      showBanterBubble(data);
      break;
    }

    case 'table_interaction_broadcast': {
      triggerTableInteractionFX(data);
      break;
    }

    case 'error': {
      if (state.autoRejoining) {
        // Room expired or no longer exists; reset session quietly
        clearSession();
        switchScreen('screen-home');
      } else {
        showToast(`⚠️ ${data.message}`);
      }
      break;
    }
  }
}

// Render Room State (Lobby or Game Arena)
function renderRoomState(room) {
  if (!room) return;
  updateResumeBanner();

  if (room.state === 'lobby') {
    switchScreen('screen-lobby');
    renderLobby(room);
  } else {
    switchScreen('screen-game');
    renderGameArena(room);
    if (room.state === 'finished' && room.winner && !state.isSpinning) {
      showVictoryModal(room);
    }
  }
}

function renderLobby(room) {
  const isHost = room.hostId === state.playerId;
  el('lobby-code').textContent = room.code;

  const s = room.settings;
  const pills = [];
  if (s.game_mode === 'elimination') {
    pills.push(state.lang === 'es' ? '🏆 Último en Pie' : '🏆 Elimination');
  } else if (s.game_mode === 'target') {
    pills.push(
      state.lang === 'es' ? `🎯 Meta: ${s.target_coins}🪙` : `🎯 Target: ${s.target_coins}🪙`
    );
  } else {
    pills.push(state.lang === 'es' ? `🔄 ${s.max_rounds} Rondas` : `🔄 ${s.max_rounds} Rounds`);
  }
  pills.push(state.lang === 'es' ? `🪙 ${s.starting_coins}` : `🪙 ${s.starting_coins}`);
  pills.push(state.lang === 'es' ? `💰 Base: ${s.base_stake}` : `💰 Stake: ${s.base_stake}`);
  if (s.two_tops) pills.push('🔥 Doble Pirinola');
  if (s.miracle_spin) pills.push(state.lang === 'es' ? '🍀 Milagro' : '🍀 Miracle');
  if (s.auto_reante) pills.push(state.lang === 'es' ? '💰 Pozo Vivo' : '💰 Live Pot');

  el('lobby-rules-pills').innerHTML = pills.map((p) => `<span class="rule-pill">${p}</span>`).join('');

  el('lobby-players-count').textContent =
    state.lang === 'es'
      ? `Jugadores (${room.players.length}/10)`
      : `Players (${room.players.length}/10)`;

  el('host-bot-controls').classList.toggle('hidden', !isHost);
  el('btn-start-game').classList.toggle('hidden', !isHost);
  el('lobby-wait-msg').classList.toggle('hidden', isHost);

  const list = el('lobby-players-list');
  list.innerHTML = room.players
    .map((p) => {
      const role = p.is_host
        ? state.lang === 'es'
          ? '👑 Anfitrión'
          : '👑 Host'
        : p.is_bot
        ? '🤖 Bot'
        : state.lang === 'es'
        ? 'Jugador'
        : 'Player';
      return `
        <div class="lobby-player-item" style="border-color: ${p.color}">
          <div class="lp-avatar" style="background: ${p.color}">${p.avatar}</div>
          <div class="lp-info">
            <div class="lp-name">${escapeHtml(p.name)}</div>
            <div class="lp-role">${role} • 🪙 ${p.coins}</div>
          </div>
        </div>
      `;
    })
    .join('');
}

function renderGameArena(room) {
  const s = room.settings;
  el('game-room-badge').textContent = `🔑 ${room.code}`;
  el('game-round-badge').textContent =
    s.game_mode === 'rounds'
      ? `${state.lang === 'es' ? 'RONDA' : 'RND'} ${room.roundNumber}/${s.max_rounds}`
      : `${state.lang === 'es' ? 'RONDA' : 'RND'} ${room.roundNumber}`;

  el('game-mode-badge').textContent =
    s.game_mode === 'elimination'
      ? state.lang === 'es'
        ? '🏆 ÚLTIMO EN PIE'
        : '🏆 ELIMINATION'
      : s.game_mode === 'target'
      ? `🎯 ${s.target_coins}🪙`
      : `🔄 ${s.max_rounds}R`;

  el('timer-display').textContent = s.turn_timer_seconds > 0 ? `${s.turn_timer_seconds}s` : '∞';

  // Show/hide 2nd Pirinola in Doble Pirinola mode
  el('top-unit-2').classList.toggle('hidden', !s.two_tops);

  // Render Central Pot (El Pozo)
  el('pozo-count').textContent = room.pot;
  const visualCoins = Math.min(room.pot, 18);
  const pozoVisual = el('pozo-coins-visual');
  pozoVisual.innerHTML = '';
  for (let i = 0; i < visualCoins; i++) {
    const c = document.createElement('span');
    c.className = 'mini-coin';
    pozoVisual.appendChild(c);
  }

  // Render Seated Players Strip
  const seatsRing = el('seats-ring');
  const activeId = room.currentTurnPlayerId;
  seatsRing.innerHTML = room.players
    .map((p) => {
      const isTurn = p.id === activeId && !p.eliminated;
      const classes = ['seat-card'];
      if (isTurn) classes.push('active-turn');
      if (p.eliminated) classes.push('eliminated');

      let statusTag = '';
      if (p.eliminated) {
        statusTag = `<span class="seat-status-tag out">OUT</span>`;
      } else if (p.miracle_pending) {
        statusTag = `<span class="seat-status-tag miracle">🍀</span>`;
      }

      return `
        <div id="seat-${p.id}" class="${classes.join(' ')}" style="border-color: ${
        isTurn ? 'var(--accent-gold)' : p.color
      }">
          <div class="seat-avatar" style="background: ${p.color}">${p.avatar}</div>
          <div class="seat-meta">
            <span class="seat-name">${escapeHtml(p.name)}</span>
            <span class="seat-coins">🪙 ${p.coins} ${statusTag}</span>
          </div>
        </div>
      `;
    })
    .join('');

  // Auto-scroll active seat into view on mobile horizontal strip
  if (activeId) {
    const activeSeatEl = el(`seat-${activeId}`);
    if (activeSeatEl && seatsRing.scrollWidth > seatsRing.clientWidth) {
      activeSeatEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  // Turn Indicator & Spin Button Enablement
  const activePlayer = room.players.find((p) => p.id === activeId);
  const isMyTurn = activeId === state.playerId && room.state === 'playing' && !state.isSpinning;
  el('btn-spin').disabled = !isMyTurn;

  const swipeHintEl = el('swipe-hint');
  if (swipeHintEl) {
    swipeHintEl.classList.toggle('active-turn', isMyTurn);
  }

  if (activePlayer) {
    el('turn-indicator').textContent = isMyTurn
      ? state.lang === 'es'
        ? '🟢 ¡TU TURNO DE GIRAR!'
        : '🟢 YOUR TURN TO SPIN!'
      : state.lang === 'es'
      ? `⏳ ${activePlayer.avatar} ${activePlayer.name}`
      : `⏳ ${activePlayer.avatar} ${activePlayer.name}`;
  }

  renderHistoryModal(room.history || []);
}

// ============================================================================
// 3D HEXAGONAL PIRINOLA SPIN ANIMATION & FLYING COIN FX
// ============================================================================
function animatePirinolaSpin(outcome, updatedRoom) {
  if (!outcome || !outcome.faces || outcome.faces.length === 0) return;

  state.isSpinning = true;
  el('btn-spin').disabled = true;

  const durMs = outcome.physics?.duration_ms || 2300;
  const rotations = outcome.physics?.rotations || 9;
  const tier = outcome.physics?.tier || 'fuerte';

  window.pirinolaAudio.playSpinSound(durMs, tier);

  const face1 = outcome.faces[0];
  spinSingle3DTop(1, face1, rotations, durMs);

  if (outcome.faces.length > 1) {
    const face2 = outcome.faces[1];
    spinSingle3DTop(2, face2, rotations + 1, durMs);
  }

  const spinningHeadline =
    state.lang === 'es'
      ? `🌀 ${outcome.player_name} gira (${tier.toUpperCase()})...`
      : `🌀 ${outcome.player_name} spins (${tier.toUpperCase()})...`;
  el('outcome-headline').textContent = spinningHeadline;
  el('outcome-dicho').textContent = '•••';

  setTimeout(() => {
    state.isSpinning = false;

    highlightWinningFace(1, face1);
    if (outcome.faces.length > 1) {
      highlightWinningFace(2, outcome.faces[1]);
    }

    const headline = state.lang === 'es' ? outcome.summary_es : outcome.summary_en;
    const comboText = state.lang === 'es' ? outcome.combo_es : outcome.combo_en;
    const dicho = state.lang === 'es' ? face1.dicho_es : face1.dicho_en;

    el('outcome-headline').textContent = comboText ? `${comboText} • ${headline}` : headline;
    el('outcome-dicho').textContent = `"${dicho}"`;

    triggerCoinTransfersFX(outcome.transfers || []);

    const hasTomaTodo = outcome.faces.some((f) => f.id === 'toma_todo');
    if (hasTomaTodo) {
      window.pirinolaAudio.playTomaTodoFanfare();
    } else if (outcome.miracle_saved) {
      window.pirinolaAudio.playMiracleChime();
    } else if (outcome.net_player_delta > 0) {
      window.pirinolaAudio.playCoinClink(Math.abs(outcome.net_player_delta), true);
    } else {
      window.pirinolaAudio.playPonSound();
      window.pirinolaAudio.playCoinClink(Math.max(1, Math.abs(outcome.net_player_delta)), false);
    }

    const spokenLabel = state.lang === 'es' ? face1.label_es : face1.label_en;
    window.pirinolaAudio.speakDicho(`${spokenLabel}. ${dicho}`, state.lang);

    renderRoomState(updatedRoom);
  }, durMs + 80);
}

function spinSingle3DTop(topNum, faceMeta, rotations, durMs) {
  const tiltEl = el(`pirinola-tilt-${topNum}`);
  const rotorEl = el(`pirinola-rotor-${topNum}`);
  const calloutEl = el(`face-callout-${topNum}`);
  if (!tiltEl || !rotorEl) return;

  rotorEl.querySelectorAll('.pirinola-face').forEach((f) => f.classList.remove('winning-face'));
  calloutEl.textContent = state.lang === 'es' ? '🌀...' : '🌀...';

  tiltEl.classList.remove('wobbling');
  tiltEl.style.setProperty('--spin-dur', `${durMs}ms`);
  void tiltEl.offsetWidth;
  tiltEl.classList.add('wobbling');

  const targetFaceAngle = (faceMeta.index || 0) * 60;
  const currentBase = topNum === 1 ? state.baseRot1 : state.baseRot2;
  const currentMod = ((currentBase % 360) + 360) % 360;
  const desiredMod = (360 - targetFaceAngle) % 360;
  const dir = state.spinDir < 0 ? -1 : 1;

  let nextRot;
  if (dir >= 0) {
    let deltaMod = desiredMod - currentMod;
    if (deltaMod <= 0) deltaMod += 360;
    nextRot = currentBase + rotations * 360 + deltaMod;
  } else {
    let negDelta = currentMod - desiredMod;
    if (negDelta <= 0) negDelta += 360;
    nextRot = currentBase - rotations * 360 - negDelta;
  }

  if (topNum === 1) {
    state.baseRot1 = nextRot;
  } else {
    state.baseRot2 = nextRot;
  }

  rotorEl.style.transition = `transform ${durMs}ms cubic-bezier(0.12, 0.82, 0.2, 1)`;
  rotorEl.style.transform = `rotateY(${nextRot}deg)`;
  state.spinDir = 1;
}

function highlightWinningFace(topNum, faceMeta) {
  const rotorEl = el(`pirinola-rotor-${topNum}`);
  const calloutEl = el(`face-callout-${topNum}`);
  if (!rotorEl || !faceMeta) return;

  const faceNode = rotorEl.querySelector(`.face-${faceMeta.index}`);
  if (faceNode) {
    faceNode.classList.add('winning-face');
  }
  if (calloutEl) {
    const label = state.lang === 'es' ? faceMeta.label_es : faceMeta.label_en;
    calloutEl.textContent = `${faceMeta.icon} ${label}`;
  }
}

function triggerCoinTransfersFX(transfers) {
  const arena = el('pirinola-arena');
  const pozo = el('pozo-zone');
  const fxLayer = el('coin-fx-layer');
  if (!arena || !pozo || !fxLayer) return;

  const arenaRect = arena.getBoundingClientRect();
  const pozoRect = pozo.getBoundingClientRect();
  const pozoX = pozoRect.left - arenaRect.left + pozoRect.width / 2;
  const pozoY = pozoRect.top - arenaRect.top + pozoRect.height / 2;

  transfers.forEach((tr, idx) => {
    const seat = el(`seat-${tr.player_id}`);
    if (!seat) return;
    const seatRect = seat.getBoundingClientRect();
    const seatX = seatRect.left - arenaRect.left + seatRect.width / 2;
    const seatY = seatRect.top - arenaRect.top + seatRect.height / 2;

    const fromX = tr.delta > 0 ? pozoX : seatX;
    const fromY = tr.delta > 0 ? pozoY : seatY;
    const toX = tr.delta > 0 ? seatX : pozoX;
    const toY = tr.delta > 0 ? seatY : pozoY;

    const coin = document.createElement('div');
    coin.className = 'flying-coin';
    coin.textContent = tr.delta > 0 ? `+${tr.delta}` : `${tr.delta}`;
    coin.style.left = `${fromX - 12}px`;
    coin.style.top = `${fromY - 12}px`;
    fxLayer.appendChild(coin);

    setTimeout(() => {
      coin.style.transform = `translate(${toX - fromX}px, ${toY - fromY}px) scale(1.15)`;
      coin.style.opacity = '0.15';
    }, 30 + idx * 65);

    setTimeout(() => coin.remove(), 720 + idx * 65);
  });
}

// ============================================================================
// SPIN POWER PRESETS + TAP / HOLD SPIN CONTROLLER (ZERO PASSIVE WARNINGS)
// ============================================================================
function updatePowerMeterUI(power) {
  state.chargePower = power;
  const pct = Math.round(power * 100);
  const fill = el('power-meter-fill');
  if (fill) fill.style.width = `${pct}%`;

  document.querySelectorAll('.power-preset-btn').forEach((btn) => {
    const pVal = Number(btn.getAttribute('data-power'));
    const isMatch =
      (power < 0.42 && pVal < 0.42) ||
      (power >= 0.42 && power < 0.78 && pVal >= 0.42 && pVal < 0.78) ||
      (power >= 0.78 && pVal >= 0.78);
    btn.classList.toggle('active', isMatch);
  });
}

function canSpinNow() {
  return (
    state.room &&
    state.room.state === 'playing' &&
    !state.isSpinning &&
    state.room.currentTurnPlayerId === state.playerId
  );
}

function sendSpinCommand() {
  if (!canSpinNow()) return;
  sendWs({
    type: 'spin_pirinola',
    roomCode: state.room.code,
    power: Number(state.chargePower.toFixed(2))
  });
}

function onSpinPointerDown() {
  if (!canSpinNow() || state.charging) return;
  state.charging = true;
  state.chargeStartMs = performance.now();
  state.chargeDir = 1;

  const step = (now) => {
    if (!state.charging) return;
    // Only start oscillating the power meter if held longer than 200ms
    if (now - state.chargeStartMs > 200) {
      let nextP = state.chargePower + state.chargeDir * 0.018;
      if (nextP >= 1.0) {
        nextP = 1.0;
        state.chargeDir = -1;
      } else if (nextP <= 0.2) {
        nextP = 0.2;
        state.chargeDir = 1;
      }
      updatePowerMeterUI(nextP);

      if (now - state.lastChargeTick > 95) {
        state.lastChargeTick = now;
        window.pirinolaAudio.playChargeTick(state.chargePower);
      }
    }
    state.chargeRaf = requestAnimationFrame(step);
  };

  state.chargeRaf = requestAnimationFrame(step);
}

function onSpinPointerUp() {
  if (!state.charging) return;
  const heldMs = performance.now() - state.chargeStartMs;
  state.charging = false;
  if (state.chargeRaf) cancelAnimationFrame(state.chargeRaf);

  // If the user held for > 200ms, fire spin on release and suppress the trailing click
  if (heldMs > 200) {
    state.suppressNextClick = true;
    sendSpinCommand();
  }
}

function onTopStagePointerDown(e) {
  if (!canSpinNow()) return;
  state.swipeActive = true;
  state.swipeMoved = false;
  state.swipeStartX = e.clientX;
  state.swipeStartMs = performance.now();
  state.swipeLastX = e.clientX;
  state.swipeLastMs = state.swipeStartMs;
  state.swipePeakVx = 0;
  state.lastSwipeTickX = e.clientX;

  try {
    e.currentTarget.setPointerCapture(e.pointerId);
  } catch (_) {}

  // Also start hold-to-charge if the user simply holds without dragging
  onSpinPointerDown();
}

function onTopStagePointerMove(e) {
  if (!state.swipeActive || !canSpinNow()) return;
  const now = performance.now();
  const dx = e.clientX - state.swipeStartX;
  const stepDx = e.clientX - state.swipeLastX;
  const stepDt = Math.max(1, now - state.swipeLastMs);

  if (Math.abs(dx) > 8) {
    state.swipeMoved = true;
    // Cancel hold-charge oscillation since user is swiping the top directly
    if (state.charging) {
      state.charging = false;
      if (state.chargeRaf) cancelAnimationFrame(state.chargeRaf);
    }

    const instVx = Math.abs(stepDx) / stepDt;
    state.swipePeakVx = Math.max(state.swipePeakVx * 0.85, instVx);

    // Map swipe velocity + distance to live power meter feedback (0.25 -> 1.00)
    const distFactor = Math.min(1, Math.abs(dx) / 145);
    const velFactor = Math.min(1, state.swipePeakVx / 1.55);
    const livePower = Math.min(1.0, Math.max(0.25, 0.22 + velFactor * 0.56 + distFactor * 0.24));
    updatePowerMeterUI(livePower);

    // Live 3D rotation of the Pirinola under the user's finger/cursor
    const rotor1 = el('pirinola-rotor-1');
    const rotor2 = el('pirinola-rotor-2');
    const previewDeg1 = state.baseRot1 + dx * 1.4;
    const previewDeg2 = state.baseRot2 + dx * 1.4;

    if (rotor1) {
      rotor1.style.transition = 'none';
      rotor1.style.transform = `rotateY(${previewDeg1}deg)`;
    }
    if (rotor2) {
      rotor2.style.transition = 'none';
      rotor2.style.transform = `rotateY(${previewDeg2}deg)`;
    }

    // Play subtle wooden ratchet tick every ~28px of drag
    if (Math.abs(e.clientX - state.lastSwipeTickX) >= 28) {
      state.lastSwipeTickX = e.clientX;
      window.pirinolaAudio.playChargeTick(livePower);
    }
  }

  state.swipeLastX = e.clientX;
  state.swipeLastMs = now;
}

function onTopStagePointerUp(e) {
  if (!state.swipeActive) return;
  state.swipeActive = false;
  try {
    e.currentTarget.releasePointerCapture(e.pointerId);
  } catch (_) {}

  const totalDx = e.clientX - state.swipeStartX;
  const totalDt = Math.max(1, performance.now() - state.swipeStartMs);

  if (state.swipeMoved && Math.abs(totalDx) >= 16) {
    state.charging = false;
    if (state.chargeRaf) cancelAnimationFrame(state.chargeRaf);

    // Preserve the live dragged angle as the new base rotation before launching spin
    state.baseRot1 = state.baseRot1 + totalDx * 1.4;
    state.baseRot2 = state.baseRot2 + totalDx * 1.4;
    state.spinDir = totalDx >= 0 ? 1 : -1;

    const avgVx = Math.abs(totalDx) / totalDt;
    const effVx = Math.max(avgVx, state.swipePeakVx);
    const distFactor = Math.min(1, Math.abs(totalDx) / 145);
    const velFactor = Math.min(1, effVx / 1.5);
    const finalPower = Math.min(1.0, Math.max(0.25, 0.22 + velFactor * 0.56 + distFactor * 0.24));

    updatePowerMeterUI(finalPower);
    state.suppressNextClick = true;
    sendSpinCommand();
    return;
  }

  // Snap back if moved < 16px without triggering swipe
  if (state.swipeMoved) {
    const rotor1 = el('pirinola-rotor-1');
    const rotor2 = el('pirinola-rotor-2');
    if (rotor1) {
      rotor1.style.transition = 'transform 180ms ease-out';
      rotor1.style.transform = `rotateY(${state.baseRot1}deg)`;
    }
    if (rotor2) {
      rotor2.style.transition = 'transform 180ms ease-out';
      rotor2.style.transform = `rotateY(${state.baseRot2}deg)`;
    }
  }

  // Otherwise handle normal tap / hold-to-charge release
  onSpinPointerUp();
}

// ============================================================================
// LIVE CROSS-TRANSLATED BANTER ("GRITOS DE LA MESA")
// ============================================================================
function translateBanter(rawText) {
  for (const item of Object.values(BANTER_MAP)) {
    if (rawText === item.es || rawText === item.en) {
      return state.lang === 'es' ? item.es : item.en;
    }
  }
  return rawText;
}

function showBanterBubble(data) {
  const layer = el('banter-layer');
  const arena = el('pirinola-arena');
  if (!layer || !arena) return;

  window.pirinolaAudio.playPop();
  const seat = el(`seat-${data.playerId}`);
  let xPct = 50;
  let yPct = 24;

  if (seat) {
    const aRect = arena.getBoundingClientRect();
    const sRect = seat.getBoundingClientRect();
    xPct = ((sRect.left - aRect.left + sRect.width / 2) / aRect.width) * 100;
    yPct = ((sRect.top - aRect.top + sRect.height) / aRect.height) * 100;
  }

  const bubble = document.createElement('div');
  bubble.className = 'banter-bubble';
  bubble.style.left = `${Math.min(80, Math.max(20, xPct))}%`;
  bubble.style.top = `${Math.min(78, Math.max(14, yPct))}%`;
  bubble.style.borderColor = data.color || 'var(--accent-gold)';
  bubble.textContent = `${data.avatar || '🗣️'} ${data.playerName}: ${translateBanter(data.emoji)}`;

  layer.appendChild(bubble);
  setTimeout(() => bubble.remove(), 2650);
}

function triggerTableInteractionFX(data) {
  const arena = el('pirinola-arena');
  const fxLayer = el('coin-fx-layer');
  const ruedo = el('ruedo-bowl');
  if (!arena || !fxLayer) return;

  if (data.kind === 'tap') {
    window.pirinolaAudio.playTableTapSound();
    arena.classList.remove('table-bump');
    void arena.offsetWidth;
    arena.classList.add('table-bump');

    showBanterBubble({
      playerId: data.playerId,
      playerName: data.playerName,
      avatar: data.avatar,
      color: data.color,
      emoji: state.lang === 'es' ? '👊 ¡Golpecito a la mesa!' : '👊 Table tap!'
    });
  } else {
    window.pirinolaAudio.playBlowSound();
    const aRect = arena.getBoundingClientRect();
    const rRect = (ruedo || arena).getBoundingClientRect();
    const cx = rRect.left - aRect.left + rRect.width / 2;
    const cy = rRect.top - aRect.top + rRect.height / 2;

    for (let i = 0; i < 4; i++) {
      const puff = document.createElement('div');
      puff.className = 'wind-puff';
      puff.textContent = i % 2 === 0 ? '💨' : '🌪️';
      const angle = (i * Math.PI) / 2 + Math.random() * 0.6;
      const dist = 55 + Math.random() * 35;
      puff.style.left = `${cx}px`;
      puff.style.top = `${cy}px`;
      puff.style.setProperty('--wx', `${Math.round(Math.cos(angle) * dist)}px`);
      puff.style.setProperty('--wy', `${Math.round(Math.sin(angle) * dist)}px`);
      fxLayer.appendChild(puff);
      setTimeout(() => puff.remove(), 900);
    }

    // Extra micro-wobble on the 3D top
    const tilt1 = el('pirinola-tilt-1');
    if (tilt1 && !state.isSpinning) {
      tilt1.style.transform = 'rotateX(-19deg) rotateZ(9deg)';
      setTimeout(() => {
        tilt1.style.transform = 'rotateX(-14deg) rotateZ(0deg)';
      }, 280);
    }

    showBanterBubble({
      playerId: data.playerId,
      playerName: data.playerName,
      avatar: data.avatar,
      color: data.color,
      emoji: state.lang === 'es' ? '💨 ¡Fuuuuu! ¡Sóplale!' : '💨 Whoosh! Blow on it!'
    });
  }
}

// ============================================================================
// END-GAME VICTORY MODAL & SHAREABLE 800x1000 CANVAS TROPHY CARD
// ============================================================================
function showVictoryModal(room) {
  const w = room.winner;
  if (!w) return;

  window.pirinolaAudio.playVictoryFanfare();
  el('victory-title').textContent = `${w.avatar} ${w.player_name}`;
  el('victory-reason').textContent = state.lang === 'es' ? w.win_reason_es : w.win_reason_en;

  const medals = ['🥇', '🥈', '🥉'];
  el('victory-podium').innerHTML = (room.podium || [])
    .map(
      (p, i) => `
      <div class="podium-box rank-${p.rank}">
        <div style="font-size:1.5rem">${medals[i] || '🏅'} ${p.avatar}</div>
        <div style="font-weight:900; margin-top:3px">${escapeHtml(p.player_name)}</div>
        <div style="color:var(--accent-gold); font-weight:800">🪙 ${p.coins}</div>
        <div style="font-size:0.72rem; color:var(--text-muted)">👑 ${p.toma_todo_count} Toma Todo</div>
      </div>
    `
    )
    .join('');

  el('victory-awards').innerHTML = (room.awards || [])
    .map(
      (a) => `
      <div class="award-item">
        <div style="font-weight:900; color:var(--accent-gold)">${a.badge} ${
        state.lang === 'es' ? a.title_es : a.title_en
      }</div>
        <div style="font-weight:800; margin:2px 0">${a.avatar} ${escapeHtml(a.player_name)}</div>
        <div style="font-size:0.72rem; color:var(--text-muted)">${
          state.lang === 'es' ? a.detail_es : a.detail_en
        }</div>
      </div>
    `
    )
    .join('');

  const isHost = room.hostId === state.playerId;
  el('btn-play-again').style.display = isHost ? 'inline-block' : 'none';
  el('modal-victory').classList.remove('hidden');
}

async function generateAndShareVictoryCard() {
  const room = state.room;
  if (!room || !room.winner) return;
  const canvas = el('victory-canvas');
  const ctx = canvas.getContext('2d');
  const w = room.winner;

  const grad = ctx.createLinearGradient(0, 0, 0, 1000);
  grad.addColorStop(0, '#3d1c0e');
  grad.addColorStop(1, '#120703');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 800, 1000);

  ctx.strokeStyle = '#f1c40f';
  ctx.lineWidth = 10;
  ctx.strokeRect(24, 24, 752, 952);

  ctx.fillStyle = '#f1c40f';
  ctx.font = '900 42px Segoe UI, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🌀 PIRINOLA ONLINE • ¡TOMA TODO!', 400, 105);

  ctx.font = '80px Segoe UI Emoji, sans-serif';
  ctx.fillText(`👑 ${w.avatar}`, 400, 220);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 48px Segoe UI, sans-serif';
  ctx.fillText(w.player_name, 400, 295);

  ctx.fillStyle = '#e0c3a8';
  ctx.font = '700 24px Segoe UI, sans-serif';
  ctx.fillText(state.lang === 'es' ? w.win_reason_es : w.win_reason_en, 400, 345);

  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(60, 400, 680, 460);
  ctx.strokeStyle = '#e67e22';
  ctx.lineWidth = 3;
  ctx.strokeRect(60, 400, 680, 460);

  (room.awards || []).forEach((a, idx) => {
    const y = 475 + idx * 105;
    ctx.fillStyle = '#f1c40f';
    ctx.font = '900 26px Segoe UI, sans-serif';
    ctx.fillText(`${a.badge} ${state.lang === 'es' ? a.title_es : a.title_en}`, 400, y);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 22px Segoe UI, sans-serif';
    ctx.fillText(
      `${a.avatar} ${a.player_name} — ${state.lang === 'es' ? a.detail_es : a.detail_en}`,
      400,
      y + 34
    );
  });

  canvas.toBlob(async (blob) => {
    if (!blob) return;
    const file = new File([blob], `pirinola-${room.code}.png`, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: 'Pirinola Online 3D',
          files: [file]
        });
        return;
      } catch (_) {}
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pirinola-${room.code}.png`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

function renderHistoryModal(history) {
  const list = el('history-list');
  if (!list) return;
  if (!history.length) {
    list.innerHTML = `<div class="history-row">${
      state.lang === 'es' ? 'Aún no hay giros registrados.' : 'No spins recorded yet.'
    }</div>`;
    return;
  }
  list.innerHTML = history
    .slice()
    .reverse()
    .map(
      (h) => `
      <div class="history-row">
        <strong>${h.avatar} ${escapeHtml(
        state.lang === 'es' ? h.summary_es : h.summary_en
      )}</strong>
      </div>
    `
    )
    .join('');
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============================================================================
// EVENT LISTENERS & INITIALIZATION
// ============================================================================
window.addEventListener('DOMContentLoaded', () => {
  initPickers();
  applyLanguage();
  updateResumeBanner();

  // Check URL `?room=CODE`
  const params = new URLSearchParams(window.location.search);
  const urlRoom = params.get('room');
  if (urlRoom && (!state.roomCode || urlRoom.toUpperCase() !== state.roomCode.toUpperCase())) {
    el('tab-join').click();
    el('input-room-code').value = urlRoom.toUpperCase();
  }

  // Open WebSocket immediately (will auto-rejoin on refresh if in a room)
  connectWebSocket();

  // Keepalive ping every 25s
  setInterval(() => {
    if (state.ws && state.ws.readyState === WebSocket.OPEN) {
      state.ws.send(JSON.stringify({ type: 'ping' }));
    }
  }, 25000);

  // Resume Banner Buttons
  el('btn-resume-session').addEventListener('click', () => {
    if (state.roomCode && state.playerId) {
      state.autoRejoining = true;
      sendWs({
        type: 'join_room',
        roomCode: state.roomCode,
        playerName: state.playerName || 'Jugador',
        avatar: state.selectedAvatar,
        color: state.selectedColor,
        playerId: state.playerId
      });
    }
  });
  el('btn-dismiss-session').addEventListener('click', () => {
    clearSession();
  });

  // Header Controls
  el('btn-lang').addEventListener('click', () => {
    state.lang = state.lang === 'es' ? 'en' : 'es';
    localStorage.setItem('pirinola_lang', state.lang);
    applyLanguage();
    window.pirinolaAudio.playPop();
  });

  el('btn-theme').addEventListener('click', cycleTheme);
  el('btn-top-skin').addEventListener('click', cycleTopSkin);

  el('btn-mute').addEventListener('click', () => {
    const muted = window.pirinolaAudio.toggleMute();
    el('btn-mute').textContent = muted ? '🔇' : '🔊';
  });

  el('btn-voice').addEventListener('click', () => {
    const enabled = window.pirinolaAudio.toggleVoice();
    el('btn-voice').style.opacity = enabled ? '1' : '0.45';
    showToast(
      enabled
        ? state.lang === 'es'
          ? '🗣️ Voz del gritón activada'
          : '🗣️ Voice announcer enabled'
        : state.lang === 'es'
        ? '🔇 Voz del gritón desactivada'
        : '🔇 Voice announcer muted'
    );
  });

  el('btn-rules').addEventListener('click', () => {
    el('modal-rules').classList.remove('hidden');
  });
  el('btn-close-rules').addEventListener('click', () => {
    el('modal-rules').classList.add('hidden');
  });

  // Tabs
  el('tab-create').addEventListener('click', () => {
    el('tab-create').classList.add('active');
    el('tab-join').classList.remove('active');
    el('panel-create').classList.add('active');
    el('panel-join').classList.remove('active');
  });
  el('tab-join').addEventListener('click', () => {
    el('tab-join').classList.add('active');
    el('tab-create').classList.remove('active');
    el('panel-join').classList.add('active');
    el('panel-create').classList.remove('active');
  });

  // Mode conditional fields
  el('select-mode').addEventListener('change', (ev) => {
    const mode = ev.target.value;
    el('group-target-coins').classList.toggle('hidden', mode !== 'target');
    el('group-max-rounds').classList.toggle('hidden', mode !== 'rounds');
  });

  // Create Room
  el('btn-create-room').addEventListener('click', () => {
    const name = el('input-name').value.trim() || (state.lang === 'es' ? 'Jugador 1' : 'Player 1');
    const settings = {
      game_mode: el('select-mode').value,
      starting_coins: Number(el('select-starting-coins').value),
      base_stake: Number(el('select-stake').value),
      target_coins: Number(el('select-target-coins').value),
      max_rounds: Number(el('select-max-rounds').value),
      turn_timer_seconds: Number(el('select-timer').value),
      two_tops: el('chk-two-tops').checked,
      miracle_spin: el('chk-miracle').checked,
      auto_reante: el('chk-reante').checked,
      table_theme: THEMES[state.themeIdx].id
    };

    sendWs({
      type: 'create_room',
      playerName: name,
      avatar: state.selectedAvatar,
      color: state.selectedColor,
      settings
    });
  });

  // Join Room
  el('btn-join-room').addEventListener('click', () => {
    const code = el('input-room-code').value.trim().toUpperCase();
    if (!code) {
      showToast(state.lang === 'es' ? 'Escribe el código de la sala' : 'Enter the room code');
      return;
    }
    const name = el('input-name').value.trim() || (state.lang === 'es' ? 'Invitado' : 'Guest');
    sendWs({
      type: 'join_room',
      roomCode: code,
      playerName: name,
      avatar: state.selectedAvatar,
      color: state.selectedColor,
      playerId: state.playerId
    });
  });

  // Lobby Actions
  el('btn-copy-link').addEventListener('click', () => {
    if (!state.room) return;
    const url = `${window.location.origin}/?room=${state.room.code}`;
    navigator.clipboard.writeText(url).then(() => {
      showToast(state.lang === 'es' ? '🔗 Enlace copiado' : '🔗 Invite link copied!');
    });
  });

  el('btn-qr').addEventListener('click', () => {
    if (!state.room) return;
    const qrBox = el('qr-container');
    qrBox.innerHTML = '';
    const url = `${window.location.origin}/?room=${state.room.code}`;
    if (window.QRCode) {
      new window.QRCode(qrBox, { text: url, width: 190, height: 190 });
    }
    el('qr-room-label').textContent = state.room.code;
    el('modal-qr').classList.remove('hidden');
  });
  el('btn-close-qr').addEventListener('click', () => el('modal-qr').classList.add('hidden'));

  el('btn-add-bot').addEventListener('click', () => {
    if (state.room) sendWs({ type: 'add_bot', roomCode: state.room.code });
  });
  el('btn-remove-bot').addEventListener('click', () => {
    if (state.room) sendWs({ type: 'remove_bot', roomCode: state.room.code });
  });
  el('btn-start-game').addEventListener('click', () => {
    if (state.room) sendWs({ type: 'start_game', roomCode: state.room.code });
  });

  const leaveRoomHandler = () => {
    if (state.room) {
      sendWs({ type: 'leave_room', roomCode: state.room.code });
    }
    clearSession();
    switchScreen('screen-home');
  };
  el('btn-leave-lobby').addEventListener('click', leaveRoomHandler);
  el('btn-leave-game').addEventListener('click', leaveRoomHandler);

  // Power Preset Buttons
  document.querySelectorAll('.power-preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pVal = Number(btn.getAttribute('data-power')) || 0.65;
      updatePowerMeterUI(pVal);
      window.pirinolaAudio.playPop();
    });
  });

  // "¡Sóplale!" & "👊 ¡Golpecito!" Live Table Interactions
  el('btn-blow').addEventListener('click', () => {
    if (!state.room) return;
    sendWs({
      type: 'table_interaction',
      roomCode: state.room.code,
      kind: 'blow'
    });
  });
  el('btn-table-tap').addEventListener('click', () => {
    if (!state.room) return;
    sendWs({
      type: 'table_interaction',
      roomCode: state.room.code,
      kind: 'tap'
    });
  });

  // Spin Button: Clean Click + Hold-to-Charge
  const spinBtn = el('btn-spin');
  spinBtn.addEventListener('pointerdown', onSpinPointerDown);
  spinBtn.addEventListener('pointerup', onSpinPointerUp);
  spinBtn.addEventListener('pointercancel', () => {
    state.charging = false;
    if (state.chargeRaf) cancelAnimationFrame(state.chargeRaf);
  });
  spinBtn.addEventListener('click', () => {
    if (state.suppressNextClick) {
      state.suppressNextClick = false;
      return;
    }
    sendSpinCommand();
  });

  // 3D Stage / Ruedo Bowl: Swipe-to-Spin + Tap + Hold-to-Charge
  const topsStage = el('tops-stage');
  topsStage.addEventListener('pointerdown', onTopStagePointerDown);
  topsStage.addEventListener('pointermove', onTopStagePointerMove);
  topsStage.addEventListener('pointerup', onTopStagePointerUp);
  topsStage.addEventListener('pointercancel', () => {
    state.swipeActive = false;
    state.swipeMoved = false;
    state.charging = false;
    if (state.chargeRaf) cancelAnimationFrame(state.chargeRaf);
  });
  topsStage.addEventListener('click', () => {
    if (state.suppressNextClick) {
      state.suppressNextClick = false;
      return;
    }
    sendSpinCommand();
  });

  // In-game Host Timer Cycling & History
  el('btn-cycle-timer').addEventListener('click', () => {
    if (state.room && state.room.hostId === state.playerId) {
      sendWs({ type: 'toggle_timer', roomCode: state.room.code });
    } else {
      showToast(
        state.lang === 'es'
          ? 'ℹ️ Solo el anfitrión puede cambiar el temporizador'
          : 'ℹ️ Only the host can change the timer'
      );
    }
  });
  el('btn-open-history').addEventListener('click', () => {
    el('modal-history').classList.remove('hidden');
  });
  el('btn-close-history').addEventListener('click', () => {
    el('modal-history').classList.add('hidden');
  });

  // Banter Chips
  document.querySelectorAll('.banter-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      if (!state.room) return;
      const key = chip.getAttribute('data-banter');
      const phrase = BANTER_MAP[key]?.[state.lang] || chip.textContent;
      sendWs({
        type: 'send_reaction',
        roomCode: state.room.code,
        emoji: phrase
      });
    });
  });

  // Victory Modal Actions
  el('btn-share-card').addEventListener('click', generateAndShareVictoryCard);
  el('btn-play-again').addEventListener('click', () => {
    if (state.room) {
      el('modal-victory').classList.add('hidden');
      sendWs({ type: 'restart_game', roomCode: state.room.code });
    }
  });

  // PWA Install Prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    state.deferredPwaPrompt = e;
    el('btn-install-pwa').classList.remove('hidden');
  });
  el('btn-install-pwa').addEventListener('click', async () => {
    if (!state.deferredPwaPrompt) return;
    state.deferredPwaPrompt.prompt();
    await state.deferredPwaPrompt.userChoice;
    state.deferredPwaPrompt = null;
    el('btn-install-pwa').classList.add('hidden');
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => reg.update())
      .catch(() => {});
  }
});
