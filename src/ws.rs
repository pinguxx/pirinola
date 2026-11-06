use axum::extract::ws::{Message, WebSocket};
use futures_util::{SinkExt, StreamExt};
use rand::RngExt;
use serde::Deserialize;
use serde_json::{json, Value};
use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::{mpsc, RwLock};

use crate::game::{
    current_epoch_secs, generate_room_code, GameSettings, Player, PlayerStats, Room, RoomState,
    PLAYER_AVATARS, PLAYER_COLORS,
};

pub type RoomSockets = HashMap<String, mpsc::UnboundedSender<Message>>;
pub const MAX_ACTIVE_ROOMS: usize = 500;

#[derive(Clone)]
pub struct AppState {
    pub rooms: Arc<RwLock<HashMap<String, Room>>>,
    pub sockets: Arc<RwLock<HashMap<String, RoomSockets>>>,
}

impl Default for AppState {
    fn default() -> Self {
        Self::new()
    }
}

impl AppState {
    pub fn new() -> Self {
        Self {
            rooms: Arc::new(RwLock::new(HashMap::new())),
            sockets: Arc::new(RwLock::new(HashMap::new())),
        }
    }
}

pub fn sanitize_name(name: &str, fallback: &str) -> String {
    let clean: String = name
        .trim()
        .chars()
        .filter(|c| !c.is_control() && *c != '<' && *c != '>')
        .take(18)
        .collect();

    if clean.is_empty() {
        fallback.to_string()
    } else {
        clean
    }
}

pub fn sanitize_avatar(avatar: Option<String>, default_avatar: &str) -> String {
    if let Some(a) = avatar {
        let trimmed = a.trim();
        if !trimmed.is_empty()
            && trimmed.chars().count() <= 4
            && !trimmed.contains('<')
            && !trimmed.contains('>')
            && !trimmed.contains('&')
            && !trimmed.contains('"')
        {
            return trimmed.to_string();
        }
    }
    default_avatar.to_string()
}

pub fn sanitize_color(color: Option<String>, default_color: &str) -> String {
    if let Some(c) = color {
        let trimmed = c.trim();
        if trimmed.starts_with('#')
            && trimmed.len() == 7
            && trimmed[1..].chars().all(|h| h.is_ascii_hexdigit())
        {
            return trimmed.to_lowercase();
        }
    }
    default_color.to_string()
}

pub fn sanitize_reaction(raw: &str) -> Option<String> {
    let clean: String = raw
        .trim()
        .chars()
        .filter(|c| !c.is_control() && *c != '<' && *c != '>')
        .take(48)
        .collect();
    if clean.is_empty() {
        None
    } else {
        Some(clean)
    }
}

#[derive(Debug, Deserialize)]
#[serde(tag = "type")]
pub enum ClientMessage {
    #[serde(rename = "create_room")]
    CreateRoom {
        #[serde(rename = "playerName")]
        player_name: String,
        avatar: Option<String>,
        color: Option<String>,
        settings: Option<GameSettings>,
    },
    #[serde(rename = "join_room")]
    JoinRoom {
        #[serde(rename = "roomCode")]
        room_code: String,
        #[serde(rename = "playerName")]
        player_name: String,
        avatar: Option<String>,
        color: Option<String>,
        #[serde(rename = "playerId")]
        player_id: Option<String>,
    },
    #[serde(rename = "update_profile")]
    UpdateProfile {
        #[serde(rename = "roomCode")]
        room_code: String,
        avatar: Option<String>,
        color: Option<String>,
        #[serde(rename = "playerName")]
        player_name: Option<String>,
    },
    #[serde(rename = "update_settings")]
    UpdateSettings {
        #[serde(rename = "roomCode")]
        room_code: String,
        settings: GameSettings,
    },
    #[serde(rename = "start_game")]
    StartGame {
        #[serde(rename = "roomCode")]
        room_code: String,
    },
    #[serde(rename = "spin_pirinola")]
    SpinPirinola {
        #[serde(rename = "roomCode")]
        room_code: String,
        power: Option<f32>,
    },
    #[serde(rename = "restart_game")]
    RestartGame {
        #[serde(rename = "roomCode")]
        room_code: String,
    },
    #[serde(rename = "toggle_timer")]
    ToggleTimer {
        #[serde(rename = "roomCode")]
        room_code: String,
    },
    #[serde(rename = "cycle_stake")]
    CycleStake {
        #[serde(rename = "roomCode")]
        room_code: String,
    },
    #[serde(rename = "send_reaction")]
    SendReaction {
        #[serde(rename = "roomCode")]
        room_code: String,
        emoji: String,
    },
    #[serde(rename = "table_interaction")]
    TableInteraction {
        #[serde(rename = "roomCode")]
        room_code: String,
        kind: String, // "blow" or "tap"
    },
    #[serde(rename = "leave_room")]
    LeaveRoom {
        #[serde(rename = "roomCode")]
        room_code: String,
    },
    #[serde(rename = "add_bot")]
    AddBot {
        #[serde(rename = "roomCode")]
        room_code: String,
    },
    #[serde(rename = "remove_bot")]
    RemoveBot {
        #[serde(rename = "roomCode")]
        room_code: String,
        #[serde(rename = "botId")]
        bot_id: Option<String>,
    },
    #[serde(rename = "ping")]
    Ping,
}

pub async fn broadcast_to_room(state: &AppState, room_code: &str, payload: &Value) {
    let msg_text = payload.to_string();
    let sockets_guard = state.sockets.read().await;
    if let Some(room_map) = sockets_guard.get(room_code) {
        for tx in room_map.values() {
            let _ = tx.send(Message::Text(msg_text.clone().into()));
        }
    }
}

pub fn send_direct(tx: &mpsc::UnboundedSender<Message>, payload: &Value) {
    let _ = tx.send(Message::Text(payload.to_string().into()));
}

pub fn maybe_schedule_bot_turn(
    state: AppState,
    room_code: String,
    expected_gen: u64,
    delay_ms: u64,
) {
    tokio::spawn(async move {
        tokio::time::sleep(Duration::from_millis(delay_ms)).await;

        let mut next_bot_delay: Option<(u64, u64)> = None;
        let mut broadcast_payload: Option<Value> = None;
        let mut banter_payload: Option<Value> = None;

        {
            let mut rooms_guard = state.rooms.write().await;
            let Some(room) = rooms_guard.get_mut(&room_code) else {
                return;
            };
            if room.state != RoomState::Playing || room.game_generation != expected_gen {
                return;
            }
            if !room.current_turn_is_bot() {
                return;
            }

            let bot_player = room.players[room.turn_index].clone();
            let mut rng = rand::rng();

            // 40% chance for the bot to shout a fun Mexican banter phrase before spinning
            if rng.random_bool(0.40) {
                const BOT_SHOUTS: [&str; 6] = [
                    "¡Toma todo el pozo! 👑",
                    "¡Gírale con fe! 🌀",
                    "¡Todos ponen parejo! 🙌",
                    "¡Venga ese pozo! 💰",
                    "¡Manita santa, no me falles! 🍀",
                    "¡Que baile la pirinola! 🔥",
                ];
                let shout = BOT_SHOUTS[rng.random_range(0..BOT_SHOUTS.len())];
                banter_payload = Some(json!({
                    "type": "reaction_broadcast",
                    "playerId": bot_player.id,
                    "playerName": bot_player.name,
                    "avatar": bot_player.avatar,
                    "color": bot_player.color,
                    "emoji": shout
                }));
            }

            let power: f32 = rng.random_range(35..=95) as f32 / 100.0;
            if let Ok(outcome) = room.spin_pirinola(Some(power)) {
                let wait_ms = (outcome.physics.duration_ms as u64) + 850;
                broadcast_payload = Some(json!({
                    "type": "spin_result",
                    "outcome": outcome,
                    "room": room.serialize_state()
                }));

                if room.state == RoomState::Playing && room.current_turn_is_bot() {
                    next_bot_delay = Some((room.game_generation, wait_ms));
                }
            }
        }

        if let Some(banter) = banter_payload {
            broadcast_to_room(&state, &room_code, &banter).await;
        }
        if let Some(payload) = broadcast_payload {
            broadcast_to_room(&state, &room_code, &payload).await;
        }
        if let Some((gen, wait_ms)) = next_bot_delay {
            maybe_schedule_bot_turn(state, room_code, gen, wait_ms);
        }
    });
}

pub async fn handle_ws_connection(socket: WebSocket, state: AppState) {
    let (mut ws_sender, mut ws_receiver) = socket.split();
    let (tx, mut rx) = mpsc::unbounded_channel::<Message>();

    let conn_id = format!(
        "conn_{:08x}{:08x}",
        rand::random::<u32>(),
        rand::random::<u32>()
    );
    let mut current_room_code: Option<String> = None;
    let mut current_player_id: Option<String> = None;
    let mut last_reaction_at: Option<Instant> = None;

    let writer_task = tokio::spawn(async move {
        while let Some(msg) = rx.recv().await {
            if ws_sender.send(msg).await.is_err() {
                break;
            }
        }
    });

    while let Some(Ok(msg)) = ws_receiver.next().await {
        let Message::Text(text_bytes) = msg else {
            continue;
        };
        let Ok(parsed) = serde_json::from_str::<ClientMessage>(&text_bytes) else {
            send_direct(
                &tx,
                &json!({
                    "type": "error",
                    "message": "Mensaje inválido recibido por el servidor."
                }),
            );
            continue;
        };

        match parsed {
            ClientMessage::CreateRoom {
                player_name,
                avatar,
                color,
                settings,
            } => {
                let clean_name = sanitize_name(&player_name, "Jugador 1");
                let clean_avatar = sanitize_avatar(avatar, PLAYER_AVATARS[0]);
                let clean_color = sanitize_color(color, PLAYER_COLORS[0]);
                let clean_settings = settings.unwrap_or_default().sanitized();

                let player_id = format!("p_{:08x}", rand::random::<u32>());
                let mut code = generate_room_code();

                {
                    let mut rooms_guard = state.rooms.write().await;
                    if rooms_guard.len() >= MAX_ACTIVE_ROOMS {
                        let now = current_epoch_secs();
                        rooms_guard.retain(|_, r| now.saturating_sub(r.last_activity_secs) < 1800);
                        if rooms_guard.len() >= MAX_ACTIVE_ROOMS {
                            send_direct(
                                &tx,
                                &json!({
                                    "type": "error",
                                    "message": "El servidor está en su capacidad máxima de salas. Intenta más tarde."
                                }),
                            );
                            continue;
                        }
                    }
                    while rooms_guard.contains_key(&code) {
                        code = generate_room_code();
                    }
                    let mut room = Room::new(
                        code.clone(),
                        player_id.clone(),
                        clean_name,
                        clean_avatar,
                        clean_color,
                        clean_settings,
                    );
                    room.players[0].conn_id = conn_id.clone();
                    let serialized = room.serialize_state();
                    rooms_guard.insert(code.clone(), room);

                    let mut sockets_guard = state.sockets.write().await;
                    sockets_guard
                        .entry(code.clone())
                        .or_default()
                        .insert(conn_id.clone(), tx.clone());

                    current_room_code = Some(code.clone());
                    current_player_id = Some(player_id.clone());

                    send_direct(
                        &tx,
                        &json!({
                            "type": "room_joined",
                            "playerId": player_id,
                            "room": serialized
                        }),
                    );
                }
            }

            ClientMessage::JoinRoom {
                room_code,
                player_name,
                avatar,
                color,
                player_id: resume_id,
            } => {
                let code = room_code.trim().to_uppercase();
                let broadcast_state: Option<Value>;

                {
                    let mut rooms_guard = state.rooms.write().await;
                    let Some(room) = rooms_guard.get_mut(&code) else {
                        send_direct(
                            &tx,
                            &json!({
                                "type": "error",
                                "message": "No se encontró la sala. Verifica el código."
                            }),
                        );
                        continue;
                    };

                    // Check if reconnecting player
                    let mut rejoined_player_id: Option<String> = None;
                    if let Some(ref pid) = resume_id {
                        if let Some(existing) = room.players.iter_mut().find(|p| &p.id == pid) {
                            existing.connected = true;
                            existing.conn_id = conn_id.clone();
                            rejoined_player_id = Some(existing.id.clone());
                        }
                    }

                    let final_pid = if let Some(pid) = rejoined_player_id {
                        pid
                    } else {
                        if room.state != RoomState::Lobby {
                            send_direct(
                                &tx,
                                &json!({
                                    "type": "error",
                                    "message": "La partida ya comenzó en esta sala."
                                }),
                            );
                            continue;
                        }
                        if room.players.len() >= 10 {
                            send_direct(
                                &tx,
                                &json!({
                                    "type": "error",
                                    "message": "La sala está llena (máximo 10 jugadores)."
                                }),
                            );
                            continue;
                        }

                        let slot = room.players.len();
                        let pid = format!("p_{:08x}", rand::random::<u32>());
                        let clean_name =
                            sanitize_name(&player_name, &format!("Jugador {}", slot + 1));
                        let clean_avatar =
                            sanitize_avatar(avatar, PLAYER_AVATARS[slot % PLAYER_AVATARS.len()]);
                        let clean_color =
                            sanitize_color(color, PLAYER_COLORS[slot % PLAYER_COLORS.len()]);

                        room.players.push(Player {
                            id: pid.clone(),
                            name: clean_name,
                            avatar: clean_avatar,
                            color: clean_color,
                            coins: room.settings.starting_coins,
                            eliminated: false,
                            miracle_pending: false,
                            connected: true,
                            is_host: false,
                            conn_id: conn_id.clone(),
                            is_bot: false,
                            stats: PlayerStats::default(),
                        });
                        pid
                    };

                    room.touch();
                    let serialized = room.serialize_state();

                    let mut sockets_guard = state.sockets.write().await;
                    sockets_guard
                        .entry(code.clone())
                        .or_default()
                        .insert(conn_id.clone(), tx.clone());

                    current_room_code = Some(code.clone());
                    current_player_id = Some(final_pid.clone());

                    send_direct(
                        &tx,
                        &json!({
                            "type": "room_joined",
                            "playerId": final_pid,
                            "room": serialized
                        }),
                    );
                    broadcast_state = Some(json!({
                        "type": "room_updated",
                        "room": serialized
                    }));
                }

                if let Some(payload) = broadcast_state {
                    broadcast_to_room(&state, &code, &payload).await;
                }
            }

            ClientMessage::UpdateProfile {
                room_code,
                avatar,
                color,
                player_name,
            } => {
                let code = room_code.trim().to_uppercase();
                let Some(ref pid) = current_player_id else {
                    continue;
                };
                let mut broadcast_state: Option<Value> = None;
                {
                    let mut rooms_guard = state.rooms.write().await;
                    if let Some(room) = rooms_guard.get_mut(&code) {
                        if let Some(p) = room.players.iter_mut().find(|p| &p.id == pid) {
                            if let Some(new_name) = player_name {
                                p.name = sanitize_name(&new_name, &p.name);
                            }
                            if avatar.is_some() {
                                p.avatar = sanitize_avatar(avatar, &p.avatar);
                            }
                            if color.is_some() {
                                p.color = sanitize_color(color, &p.color);
                            }
                            room.touch();
                            broadcast_state = Some(json!({
                                "type": "room_updated",
                                "room": room.serialize_state()
                            }));
                        }
                    }
                }
                if let Some(payload) = broadcast_state {
                    broadcast_to_room(&state, &code, &payload).await;
                }
            }

            ClientMessage::UpdateSettings {
                room_code,
                settings,
            } => {
                let code = room_code.trim().to_uppercase();
                let Some(ref pid) = current_player_id else {
                    continue;
                };
                let mut broadcast_state: Option<Value> = None;
                {
                    let mut rooms_guard = state.rooms.write().await;
                    if let Some(room) = rooms_guard.get_mut(&code) {
                        if &room.host_id == pid && room.state == RoomState::Lobby {
                            room.settings = settings.sanitized();
                            let starting = room.settings.starting_coins;
                            for p in &mut room.players {
                                p.coins = starting;
                            }
                            room.touch();
                            broadcast_state = Some(json!({
                                "type": "room_updated",
                                "room": room.serialize_state()
                            }));
                        }
                    }
                }
                if let Some(payload) = broadcast_state {
                    broadcast_to_room(&state, &code, &payload).await;
                }
            }

            ClientMessage::AddBot { room_code } => {
                let code = room_code.trim().to_uppercase();
                let Some(ref pid) = current_player_id else {
                    continue;
                };
                let mut broadcast_state: Option<Value> = None;
                {
                    let mut rooms_guard = state.rooms.write().await;
                    if let Some(room) = rooms_guard.get_mut(&code) {
                        if &room.host_id != pid {
                            send_direct(
                                &tx,
                                &json!({
                                    "type": "error",
                                    "message": "Solo el anfitrión puede agregar bots."
                                }),
                            );
                            continue;
                        }
                        match room.add_bot() {
                            Ok(_) => {
                                broadcast_state = Some(json!({
                                    "type": "room_updated",
                                    "room": room.serialize_state()
                                }));
                            }
                            Err(e) => {
                                send_direct(&tx, &json!({ "type": "error", "message": e }));
                            }
                        }
                    }
                }
                if let Some(payload) = broadcast_state {
                    broadcast_to_room(&state, &code, &payload).await;
                }
            }

            ClientMessage::RemoveBot { room_code, bot_id } => {
                let code = room_code.trim().to_uppercase();
                let Some(ref pid) = current_player_id else {
                    continue;
                };
                let mut broadcast_state: Option<Value> = None;
                {
                    let mut rooms_guard = state.rooms.write().await;
                    if let Some(room) = rooms_guard.get_mut(&code) {
                        if &room.host_id != pid {
                            send_direct(
                                &tx,
                                &json!({
                                    "type": "error",
                                    "message": "Solo el anfitrión puede quitar bots."
                                }),
                            );
                            continue;
                        }
                        match room.remove_bot(bot_id.as_deref()) {
                            Ok(_) => {
                                broadcast_state = Some(json!({
                                    "type": "room_updated",
                                    "room": room.serialize_state()
                                }));
                            }
                            Err(e) => {
                                send_direct(&tx, &json!({ "type": "error", "message": e }));
                            }
                        }
                    }
                }
                if let Some(payload) = broadcast_state {
                    broadcast_to_room(&state, &code, &payload).await;
                }
            }

            ClientMessage::StartGame { room_code } => {
                let code = room_code.trim().to_uppercase();
                let Some(ref pid) = current_player_id else {
                    continue;
                };
                let mut broadcast_state: Option<Value> = None;
                let mut schedule_bot: Option<u64> = None;

                {
                    let mut rooms_guard = state.rooms.write().await;
                    if let Some(room) = rooms_guard.get_mut(&code) {
                        if &room.host_id != pid {
                            send_direct(
                                &tx,
                                &json!({
                                    "type": "error",
                                    "message": "Solo el anfitrión puede iniciar la partida."
                                }),
                            );
                            continue;
                        }
                        match room.start_game() {
                            Ok(()) => {
                                broadcast_state = Some(json!({
                                    "type": "game_started",
                                    "room": room.serialize_state()
                                }));
                                if room.current_turn_is_bot() {
                                    schedule_bot = Some(room.game_generation);
                                }
                            }
                            Err(e) => {
                                send_direct(&tx, &json!({ "type": "error", "message": e }));
                            }
                        }
                    }
                }

                if let Some(payload) = broadcast_state {
                    broadcast_to_room(&state, &code, &payload).await;
                }
                if let Some(gen) = schedule_bot {
                    maybe_schedule_bot_turn(state.clone(), code, gen, 1200);
                }
            }

            ClientMessage::SpinPirinola { room_code, power } => {
                let code = room_code.trim().to_uppercase();
                let Some(ref pid) = current_player_id else {
                    continue;
                };

                let mut broadcast_payload: Option<Value> = None;
                let mut schedule_bot: Option<(u64, u64)> = None;

                {
                    let mut rooms_guard = state.rooms.write().await;
                    if let Some(room) = rooms_guard.get_mut(&code) {
                        if room.state != RoomState::Playing {
                            continue;
                        }
                        let Some(active_id) = room.current_turn_player_id() else {
                            continue;
                        };
                        if &active_id != pid {
                            send_direct(
                                &tx,
                                &json!({
                                    "type": "error",
                                    "message": "Espera tu turno para girar la pirinola."
                                }),
                            );
                            continue;
                        }

                        match room.spin_pirinola(power) {
                            Ok(outcome) => {
                                let wait_ms = (outcome.physics.duration_ms as u64) + 850;
                                broadcast_payload = Some(json!({
                                    "type": "spin_result",
                                    "outcome": outcome,
                                    "room": room.serialize_state()
                                }));
                                if room.state == RoomState::Playing && room.current_turn_is_bot() {
                                    schedule_bot = Some((room.game_generation, wait_ms));
                                }
                            }
                            Err(e) => {
                                send_direct(&tx, &json!({ "type": "error", "message": e }));
                            }
                        }
                    }
                }

                if let Some(payload) = broadcast_payload {
                    broadcast_to_room(&state, &code, &payload).await;
                }
                if let Some((gen, wait_ms)) = schedule_bot {
                    maybe_schedule_bot_turn(state.clone(), code, gen, wait_ms);
                }
            }

            ClientMessage::RestartGame { room_code } => {
                let code = room_code.trim().to_uppercase();
                let Some(ref pid) = current_player_id else {
                    continue;
                };
                let mut broadcast_state: Option<Value> = None;
                {
                    let mut rooms_guard = state.rooms.write().await;
                    if let Some(room) = rooms_guard.get_mut(&code) {
                        if &room.host_id == pid {
                            room.restart_to_lobby();
                            broadcast_state = Some(json!({
                                "type": "room_updated",
                                "room": room.serialize_state()
                            }));
                        }
                    }
                }
                if let Some(payload) = broadcast_state {
                    broadcast_to_room(&state, &code, &payload).await;
                }
            }

            ClientMessage::ToggleTimer { room_code } => {
                let code = room_code.trim().to_uppercase();
                let Some(ref pid) = current_player_id else {
                    continue;
                };
                let mut broadcast_state: Option<Value> = None;
                {
                    let mut rooms_guard = state.rooms.write().await;
                    if let Some(room) = rooms_guard.get_mut(&code) {
                        if &room.host_id == pid {
                            room.settings.turn_timer_seconds =
                                match room.settings.turn_timer_seconds {
                                    0 => 15,
                                    15 => 25,
                                    25 => 40,
                                    _ => 0,
                                };
                            room.turn_started_at_secs = current_epoch_secs();
                            room.touch();
                            broadcast_state = Some(json!({
                                "type": "room_updated",
                                "room": room.serialize_state()
                            }));
                        }
                    }
                }
                if let Some(payload) = broadcast_state {
                    broadcast_to_room(&state, &code, &payload).await;
                }
            }

            ClientMessage::CycleStake { room_code } => {
                let code = room_code.trim().to_uppercase();
                let Some(ref pid) = current_player_id else {
                    continue;
                };
                let mut broadcast_state: Option<Value> = None;
                let mut new_stake = 1;
                {
                    let mut rooms_guard = state.rooms.write().await;
                    if let Some(room) = rooms_guard.get_mut(&code) {
                        if &room.host_id == pid {
                            new_stake = room.cycle_base_stake();
                            broadcast_state = Some(json!({
                                "type": "room_updated",
                                "room": room.serialize_state()
                            }));
                        } else {
                            send_direct(
                                &tx,
                                &json!({
                                    "type": "error",
                                    "message": "Solo el anfitrión puede ajustar la apuesta."
                                }),
                            );
                            continue;
                        }
                    }
                }
                if let Some(payload) = broadcast_state {
                    broadcast_to_room(&state, &code, &payload).await;
                    broadcast_to_room(
                        &state,
                        &code,
                        &json!({
                            "type": "stake_changed",
                            "newStake": new_stake
                        }),
                    )
                    .await;
                }
            }

            ClientMessage::SendReaction { room_code, emoji } => {
                let code = room_code.trim().to_uppercase();
                let Some(ref pid) = current_player_id else {
                    continue;
                };
                if let Some(last) = last_reaction_at {
                    if last.elapsed() < Duration::from_millis(650) {
                        continue;
                    }
                }
                let Some(clean_emoji) = sanitize_reaction(&emoji) else {
                    continue;
                };
                last_reaction_at = Some(Instant::now());

                let mut payload: Option<Value> = None;
                {
                    let rooms_guard = state.rooms.read().await;
                    if let Some(room) = rooms_guard.get(&code) {
                        if let Some(p) = room.players.iter().find(|p| &p.id == pid) {
                            payload = Some(json!({
                                "type": "reaction_broadcast",
                                "playerId": p.id,
                                "playerName": p.name,
                                "avatar": p.avatar,
                                "color": p.color,
                                "emoji": clean_emoji
                            }));
                        }
                    }
                }
                if let Some(p) = payload {
                    broadcast_to_room(&state, &code, &p).await;
                }
            }

            ClientMessage::TableInteraction { room_code, kind } => {
                let code = room_code.trim().to_uppercase();
                let Some(ref pid) = current_player_id else {
                    continue;
                };
                if let Some(last) = last_reaction_at {
                    if last.elapsed() < Duration::from_millis(320) {
                        continue;
                    }
                }
                let clean_kind = if kind == "tap" { "tap" } else { "blow" };
                last_reaction_at = Some(Instant::now());

                let mut payload: Option<Value> = None;
                {
                    let rooms_guard = state.rooms.read().await;
                    if let Some(room) = rooms_guard.get(&code) {
                        if let Some(p) = room.players.iter().find(|p| &p.id == pid) {
                            payload = Some(json!({
                                "type": "table_interaction_broadcast",
                                "playerId": p.id,
                                "playerName": p.name,
                                "avatar": p.avatar,
                                "color": p.color,
                                "kind": clean_kind
                            }));
                        }
                    }
                }
                if let Some(p) = payload {
                    broadcast_to_room(&state, &code, &p).await;
                }
            }

            ClientMessage::LeaveRoom { room_code } => {
                let code = room_code.trim().to_uppercase();
                explicit_leave_room(&state, &conn_id, &code, current_player_id.as_deref()).await;
                current_room_code = None;
                current_player_id = None;
            }

            ClientMessage::Ping => {
                send_direct(&tx, &json!({ "type": "pong" }));
            }
        }
    }

    cleanup_connection(
        &state,
        &conn_id,
        current_room_code.as_deref(),
        current_player_id.as_deref(),
    )
    .await;
    writer_task.abort();
}

async fn explicit_leave_room(state: &AppState, conn_id: &str, code: &str, player_id: Option<&str>) {
    {
        let mut sockets_guard = state.sockets.write().await;
        if let Some(room_map) = sockets_guard.get_mut(code) {
            room_map.remove(conn_id);
            if room_map.is_empty() {
                sockets_guard.remove(code);
            }
        }
    }

    let mut broadcast_state: Option<Value> = None;
    {
        let mut rooms_guard = state.rooms.write().await;
        if let Some(room) = rooms_guard.get_mut(code) {
            if let Some(pid) = player_id {
                if room.state == RoomState::Lobby {
                    room.players.retain(|p| p.id != pid);
                } else if let Some(p) = room.players.iter_mut().find(|p| p.id == pid) {
                    p.connected = false;
                }

                // Migrate host if the host explicitly left
                let host_present = room
                    .players
                    .iter()
                    .any(|p| p.id == room.host_id && p.connected && !p.is_bot);
                if !host_present {
                    if let Some(new_host) = room
                        .players
                        .iter()
                        .find(|p| p.connected && !p.is_bot)
                        .map(|p| p.id.clone())
                    {
                        room.host_id = new_host.clone();
                        for p in &mut room.players {
                            p.is_host = p.id == new_host;
                        }
                    }
                }
            }

            let any_human = room.players.iter().any(|p| !p.is_bot && p.connected);
            if !any_human && room.state == RoomState::Lobby {
                rooms_guard.remove(code);
            } else {
                broadcast_state = Some(json!({
                    "type": "room_updated",
                    "room": room.serialize_state()
                }));
            }
        }
    }

    if let Some(payload) = broadcast_state {
        broadcast_to_room(state, code, &payload).await;
    }
}

async fn cleanup_connection(
    state: &AppState,
    conn_id: &str,
    room_code: Option<&str>,
    player_id: Option<&str>,
) {
    let Some(code) = room_code else {
        return;
    };

    {
        let mut sockets_guard = state.sockets.write().await;
        if let Some(room_map) = sockets_guard.get_mut(code) {
            room_map.remove(conn_id);
            if room_map.is_empty() {
                sockets_guard.remove(code);
            }
        }
    }

    // Momentary disconnect (e.g., page refresh or mobile tab switch):
    // Keep the room and host intact so the player can seamlessly rejoin within seconds.
    let mut broadcast_state: Option<Value> = None;
    {
        let mut rooms_guard = state.rooms.write().await;
        if let Some(room) = rooms_guard.get_mut(code) {
            if let Some(pid) = player_id {
                if let Some(p) = room.players.iter_mut().find(|p| p.id == pid) {
                    if p.conn_id == conn_id {
                        p.connected = false;
                        room.touch();
                    }
                }
            }
            broadcast_state = Some(json!({
                "type": "room_updated",
                "room": room.serialize_state()
            }));
        }
    }

    if let Some(payload) = broadcast_state {
        broadcast_to_room(state, code, &payload).await;
    }
}

struct TimedOutSpin {
    room_code: String,
    payload: Value,
    next_bot: Option<(u64, u64)>,
}

pub async fn start_background_maintenance(state: AppState) {
    let mut interval = tokio::time::interval(Duration::from_secs(5));
    loop {
        interval.tick().await;
        let now = current_epoch_secs();

        let mut timed_out_spins: Vec<TimedOutSpin> = Vec::new();
        {
            let mut rooms_guard = state.rooms.write().await;
            rooms_guard.retain(|_, room| now.saturating_sub(room.last_activity_secs) < 3600);

            for (code, room) in rooms_guard.iter_mut() {
                if room.state == RoomState::Playing
                    && room.settings.turn_timer_seconds > 0
                    && !room.current_turn_is_bot()
                    && now.saturating_sub(room.turn_started_at_secs)
                        >= room.settings.turn_timer_seconds
                {
                    if let Ok(outcome) = room.spin_pirinola(Some(0.6)) {
                        let wait_ms = (outcome.physics.duration_ms as u64) + 850;
                        let payload = json!({
                            "type": "spin_result",
                            "outcome": outcome,
                            "room": room.serialize_state(),
                            "autoSpin": true
                        });
                        let next_bot =
                            if room.state == RoomState::Playing && room.current_turn_is_bot() {
                                Some((room.game_generation, wait_ms))
                            } else {
                                None
                            };
                        timed_out_spins.push(TimedOutSpin {
                            room_code: code.clone(),
                            payload,
                            next_bot,
                        });
                    }
                }
            }
        }

        for item in timed_out_spins {
            broadcast_to_room(&state, &item.room_code, &item.payload).await;
            if let Some((gen, wait_ms)) = item.next_bot {
                maybe_schedule_bot_turn(state.clone(), item.room_code, gen, wait_ms);
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sanitization_helpers() {
        assert_eq!(
            sanitize_name("  <script>Hola</script> ", "Def"),
            "scriptHola/script"
        );
        assert_eq!(sanitize_name("   ", "Jugador"), "Jugador");
        assert_eq!(sanitize_avatar(Some("🤠".to_string()), "🎲"), "🤠");
        assert_eq!(sanitize_avatar(Some("<svg>".to_string()), "🎲"), "🎲");
        assert_eq!(
            sanitize_color(Some("#E74C3C".to_string()), "#000000"),
            "#e74c3c"
        );
        assert_eq!(
            sanitize_color(Some("javascript:1".to_string()), "#000000"),
            "#000000"
        );
        assert_eq!(
            sanitize_reaction("¡Toma todo! 👑"),
            Some("¡Toma todo! 👑".to_string())
        );
        assert_eq!(sanitize_reaction("   "), None);
    }
}
