use rand::RngExt;
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

use crate::pirinola::{
    compute_spin_physics, evaluate_combo, FaceMetadata, PirinolaFace, SpinPhysics,
};

pub const PLAYER_COLORS: [&str; 11] = [
    "#ec4899", "#06b6d4", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#f97316",
    "#14b8a6", "#eab308", "#18181b",
];

pub const PLAYER_AVATARS: [&str; 10] = ["🤠", "💀", "🌺", "🦅", "🥊", "🎭", "🌶️", "🎸", "🌵", "👑"];

pub const BOT_PROFILES: [(&str, &str); 9] = [
    ("🤖 Don Ramón Bot", "🤠"),
    ("🤖 La Catrina Bot", "💀"),
    ("🤖 Lupita Bot", "🌺"),
    ("🤖 El Chavo Bot", "🧢"),
    ("🤖 El Santo Bot", "🥊"),
    ("🤖 Cantinflas Bot", "🎭"),
    ("🤖 Frida Bot", "🎨"),
    ("🤖 Pancho Bot", "🦅"),
    ("🤖 Mariachi Bot", "🎸"),
];

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameSettings {
    #[serde(default = "default_game_mode")]
    pub game_mode: String, // "elimination", "target", "rounds"
    #[serde(default = "default_starting_coins")]
    pub starting_coins: u32, // 10, 20, 30, 50
    #[serde(default = "default_base_stake")]
    pub base_stake: u32, // 1, 2, 5
    #[serde(default = "default_target_coins")]
    pub target_coins: u32, // 40, 50, 80, 100
    #[serde(default = "default_max_rounds")]
    pub max_rounds: u32, // 5, 10, 15, 20
    #[serde(default = "default_two_tops")]
    pub two_tops: bool, // Doble Pirinola
    #[serde(default = "default_auto_reante")]
    pub auto_reante: bool, // Todos ponen when pot hits 0
    #[serde(default = "default_miracle_spin")]
    pub miracle_spin: bool, // 1 final spin at 0 coins
    #[serde(default = "default_turn_timer")]
    pub turn_timer_seconds: u64, // 0, 15, 25, 40
    #[serde(default = "default_stake_escalation")]
    pub stake_escalation_interval: u32, // 0 = off, 8 = express, 10 = standard, 15 = long
    #[serde(default = "default_table_theme")]
    pub table_theme: String, // "fiesta", "muertos", "cantina"
}

fn default_game_mode() -> String {
    "elimination".to_string()
}
fn default_starting_coins() -> u32 {
    20
}
fn default_base_stake() -> u32 {
    1
}
fn default_target_coins() -> u32 {
    50
}
fn default_max_rounds() -> u32 {
    10
}
fn default_two_tops() -> bool {
    false
}
fn default_auto_reante() -> bool {
    true
}
fn default_miracle_spin() -> bool {
    true
}
fn default_turn_timer() -> u64 {
    0
}
fn default_stake_escalation() -> u32 {
    10
}
fn default_table_theme() -> String {
    "jugueteria".to_string()
}

impl Default for GameSettings {
    fn default() -> Self {
        Self {
            game_mode: default_game_mode(),
            starting_coins: default_starting_coins(),
            base_stake: default_base_stake(),
            target_coins: default_target_coins(),
            max_rounds: default_max_rounds(),
            two_tops: default_two_tops(),
            auto_reante: default_auto_reante(),
            miracle_spin: default_miracle_spin(),
            turn_timer_seconds: default_turn_timer(),
            stake_escalation_interval: default_stake_escalation(),
            table_theme: default_table_theme(),
        }
    }
}

impl GameSettings {
    pub fn sanitized(mut self) -> Self {
        if !matches!(self.game_mode.as_str(), "elimination" | "target" | "rounds") {
            self.game_mode = "elimination".to_string();
        }
        self.starting_coins = self.starting_coins.clamp(5, 200);
        self.base_stake = self.base_stake.clamp(1, 10);
        if self.base_stake >= self.starting_coins {
            self.base_stake = 1;
        }
        self.target_coins = self
            .target_coins
            .clamp(self.starting_coins + 10, self.starting_coins * 10);
        self.max_rounds = self.max_rounds.clamp(3, 50);
        if !matches!(self.turn_timer_seconds, 0 | 15 | 25 | 40) {
            self.turn_timer_seconds = 0;
        }
        if !matches!(self.stake_escalation_interval, 0 | 8 | 10 | 15) {
            self.stake_escalation_interval = 10;
        }
        if !matches!(
            self.table_theme.as_str(),
            "jugueteria" | "talavera" | "parota" | "fiesta" | "muertos" | "cantina"
        ) {
            self.table_theme = "jugueteria".to_string();
        }
        self
    }
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct PlayerStats {
    pub spins_count: u32,
    pub toma_todo_count: u32,
    pub coins_won: u32,
    pub coins_put: u32,
    pub miracles_saved: u32,
    pub elimination_order: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Player {
    pub id: String,
    pub name: String,
    pub avatar: String,
    pub color: String,
    pub coins: u32,
    pub eliminated: bool,
    pub miracle_pending: bool,
    pub connected: bool,
    pub is_host: bool,
    #[serde(default)]
    pub conn_id: String,
    #[serde(default)]
    pub is_bot: bool,
    #[serde(default)]
    pub stats: PlayerStats,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum RoomState {
    Lobby,
    Playing,
    Finished,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoinTransfer {
    pub player_id: String,
    pub player_name: String,
    pub delta: i32,
    pub reason: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpinOutcome {
    pub player_id: String,
    pub player_name: String,
    pub avatar: String,
    pub color: String,
    pub faces: Vec<FaceMetadata>,
    pub physics: SpinPhysics,
    pub combo_es: Option<String>,
    pub combo_en: Option<String>,
    pub pot_before: u32,
    pub pot_after: u32,
    pub net_player_delta: i32,
    pub reante_triggered: bool,
    pub miracle_saved: bool,
    pub eliminated_ids: Vec<String>,
    pub transfers: Vec<CoinTransfer>,
    pub summary_es: String,
    pub summary_en: String,
    pub won_match: bool,
    pub stake_escalated: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PodiumEntry {
    pub rank: u8,
    pub player_id: String,
    pub player_name: String,
    pub avatar: String,
    pub color: String,
    pub coins: u32,
    pub spins_count: u32,
    pub toma_todo_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Award {
    pub key: String,
    pub badge: String,
    pub title_es: String,
    pub title_en: String,
    pub player_name: String,
    pub avatar: String,
    pub color: String,
    pub detail_es: String,
    pub detail_en: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WinnerInfo {
    pub player_id: String,
    pub player_name: String,
    pub avatar: String,
    pub color: String,
    pub final_coins: u32,
    pub total_spins: u32,
    pub toma_todo_count: u32,
    pub win_reason_es: String,
    pub win_reason_en: String,
}

#[derive(Debug, Clone)]
pub struct Room {
    pub code: String,
    pub host_id: String,
    pub state: RoomState,
    pub settings: GameSettings,
    pub players: Vec<Player>,
    pub turn_index: usize,
    pub round_number: u32,
    pub pot: u32,
    pub last_spin: Option<SpinOutcome>,
    pub winner: Option<WinnerInfo>,
    pub podium: Vec<PodiumEntry>,
    pub awards: Vec<Award>,
    pub history: Vec<SpinOutcome>,
    pub elimination_counter: u32,
    pub created_at_secs: u64,
    pub last_activity_secs: u64,
    pub turn_started_at_secs: u64,
    pub game_generation: u64,
    pub total_spins: u64,
}

pub fn current_epoch_secs() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0)
}

pub fn generate_room_code() -> String {
    const CHARS: &[u8] = b"ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let mut rng = rand::rng();
    (0..6)
        .map(|_| {
            let idx = rng.random_range(0..CHARS.len());
            CHARS[idx] as char
        })
        .collect()
}

impl Room {
    pub fn new(
        code: String,
        host_id: String,
        host_name: String,
        avatar: String,
        color: String,
        settings: GameSettings,
    ) -> Self {
        let now = current_epoch_secs();
        let settings = settings.sanitized();
        let host = Player {
            id: host_id.clone(),
            name: host_name,
            avatar,
            color,
            coins: settings.starting_coins,
            eliminated: false,
            miracle_pending: false,
            connected: true,
            is_host: true,
            conn_id: host_id.clone(),
            is_bot: false,
            stats: PlayerStats::default(),
        };

        Self {
            code,
            host_id,
            state: RoomState::Lobby,
            settings,
            players: vec![host],
            turn_index: 0,
            round_number: 1,
            pot: 0,
            last_spin: None,
            winner: None,
            podium: Vec::new(),
            awards: Vec::new(),
            history: Vec::new(),
            elimination_counter: 0,
            created_at_secs: now,
            last_activity_secs: now,
            turn_started_at_secs: now,
            game_generation: 0,
            total_spins: 0,
        }
    }

    pub fn touch(&mut self) {
        self.last_activity_secs = current_epoch_secs();
    }

    pub fn current_turn_player_id(&self) -> Option<String> {
        if self.state != RoomState::Playing || self.players.is_empty() {
            return None;
        }
        self.players.get(self.turn_index).map(|p| p.id.clone())
    }

    pub fn current_turn_is_bot(&self) -> bool {
        if self.state != RoomState::Playing {
            return false;
        }
        self.players
            .get(self.turn_index)
            .map(|p| p.is_bot && !p.eliminated)
            .unwrap_or(false)
    }

    pub fn add_bot(&mut self) -> Result<Player, String> {
        if self.state != RoomState::Lobby {
            return Err("Solo puedes agregar bots en la sala de espera.".to_string());
        }
        if self.players.len() >= 10 {
            return Err("La sala está llena (máximo 10 jugadores).".to_string());
        }

        let existing_names: Vec<String> = self.players.iter().map(|p| p.name.clone()).collect();
        let profile = BOT_PROFILES
            .iter()
            .find(|(name, _)| !existing_names.iter().any(|n| n == name))
            .copied()
            .unwrap_or(BOT_PROFILES[self.players.len() % BOT_PROFILES.len()]);

        let slot = self.players.len();
        let bot_id = format!("bot_{:08x}", rand::random::<u32>());
        let bot = Player {
            id: bot_id.clone(),
            name: profile.0.to_string(),
            avatar: profile.1.to_string(),
            color: PLAYER_COLORS[slot % PLAYER_COLORS.len()].to_string(),
            coins: self.settings.starting_coins,
            eliminated: false,
            miracle_pending: false,
            connected: true,
            is_host: false,
            conn_id: format!("conn_{}", bot_id),
            is_bot: true,
            stats: PlayerStats::default(),
        };

        self.players.push(bot.clone());
        self.touch();
        Ok(bot)
    }

    pub fn remove_bot(&mut self, bot_id: Option<&str>) -> Result<String, String> {
        if self.state != RoomState::Lobby {
            return Err("Solo puedes quitar bots en la sala de espera.".to_string());
        }
        let pos = if let Some(target_id) = bot_id {
            self.players
                .iter()
                .position(|p| p.is_bot && p.id == target_id)
        } else {
            self.players.iter().rposition(|p| p.is_bot)
        };

        if let Some(idx) = pos {
            let removed = self.players.remove(idx);
            self.touch();
            Ok(removed.id)
        } else {
            Err("No hay bots en la sala.".to_string())
        }
    }

    pub fn start_game(&mut self) -> Result<(), String> {
        if self.players.len() < 2 {
            return Err(
                "Se necesitan al menos 2 jugadores (o agrega un 🤖 Bot) para girar la Pirinola."
                    .to_string(),
            );
        }

        self.settings = self.settings.clone().sanitized();
        let starting = self.settings.starting_coins;
        let stake = self.settings.base_stake;

        self.pot = 0;
        self.round_number = 1;
        self.turn_index = 0;
        self.last_spin = None;
        self.winner = None;
        self.podium.clear();
        self.awards.clear();
        self.history.clear();
        self.elimination_counter = 0;
        self.game_generation = self.game_generation.wrapping_add(1);
        self.total_spins = 0;

        for p in &mut self.players {
            p.coins = starting.saturating_sub(stake);
            p.eliminated = false;
            p.miracle_pending = false;
            p.stats = PlayerStats {
                spins_count: 0,
                toma_todo_count: 0,
                coins_won: 0,
                coins_put: stake,
                miracles_saved: 0,
                elimination_order: 0,
            };
            self.pot += stake;
        }

        self.state = RoomState::Playing;
        let now = current_epoch_secs();
        self.last_activity_secs = now;
        self.turn_started_at_secs = now;
        Ok(())
    }

    pub fn restart_to_lobby(&mut self) {
        self.state = RoomState::Lobby;
        self.pot = 0;
        self.round_number = 1;
        self.turn_index = 0;
        self.last_spin = None;
        self.winner = None;
        self.podium.clear();
        self.awards.clear();
        self.history.clear();
        self.elimination_counter = 0;
        self.game_generation = self.game_generation.wrapping_add(1);
        self.total_spins = 0;

        let starting = self.settings.starting_coins;
        for p in &mut self.players {
            p.coins = starting;
            p.eliminated = false;
            p.miracle_pending = false;
            p.stats = PlayerStats::default();
        }
        self.touch();
    }

    pub fn cycle_base_stake(&mut self) -> u32 {
        self.settings.base_stake = match self.settings.base_stake {
            1 => 2,
            2 => 3,
            3 => 5,
            5 => 10,
            _ => 1,
        };
        self.touch();
        self.settings.base_stake
    }

    pub fn spin_pirinola(&mut self, power: Option<f32>) -> Result<SpinOutcome, String> {
        let mut faces = vec![PirinolaFace::random()];
        if self.settings.two_tops {
            faces.push(PirinolaFace::random());
        }
        self.spin_with_forced_faces(faces, power)
    }

    pub fn spin_with_forced_faces(
        &mut self,
        faces: Vec<PirinolaFace>,
        power: Option<f32>,
    ) -> Result<SpinOutcome, String> {
        if self.state != RoomState::Playing {
            return Err("La partida no está activa.".to_string());
        }
        if faces.is_empty() {
            return Err("Se requiere al menos una cara de la pirinola.".to_string());
        }
        if self.turn_index >= self.players.len() {
            self.turn_index = 0;
        }

        let active_idx = self.turn_index;
        if self.players[active_idx].eliminated {
            self.advance_to_next_alive_turn();
            return Err("El jugador actual ya fue eliminado.".to_string());
        }

        let physics = compute_spin_physics(power);
        let pot_before = self.pot;
        let stake = self.settings.base_stake;
        let was_miracle_pending = self.players[active_idx].miracle_pending;
        let coins_before = self.players[active_idx].coins as i32;

        let player_id = self.players[active_idx].id.clone();
        let player_name = self.players[active_idx].name.clone();
        let avatar = self.players[active_idx].avatar.clone();
        let color = self.players[active_idx].color.clone();

        self.players[active_idx].stats.spins_count += 1;
        self.total_spins += 1;

        let mut stake_escalated = None;
        if self.settings.stake_escalation_interval > 0
            && self.total_spins > 0
            && self
                .total_spins
                .is_multiple_of(self.settings.stake_escalation_interval as u64)
            && self.settings.base_stake < 10
        {
            self.settings.base_stake += 1;
            stake_escalated = Some(self.settings.base_stake);
        }

        let mut transfers: Vec<CoinTransfer> = Vec::new();

        for &face in &faces {
            match face {
                PirinolaFace::Pon1 => {
                    let pay = self.players[active_idx].coins.min(stake);
                    if pay > 0 {
                        self.players[active_idx].coins -= pay;
                        self.players[active_idx].stats.coins_put += pay;
                        self.pot += pay;
                        transfers.push(CoinTransfer {
                            player_id: player_id.clone(),
                            player_name: player_name.clone(),
                            delta: -(pay as i32),
                            reason: "pon_1".to_string(),
                        });
                    }
                }
                PirinolaFace::Pon2 => {
                    let pay = self.players[active_idx].coins.min(stake * 2);
                    if pay > 0 {
                        self.players[active_idx].coins -= pay;
                        self.players[active_idx].stats.coins_put += pay;
                        self.pot += pay;
                        transfers.push(CoinTransfer {
                            player_id: player_id.clone(),
                            player_name: player_name.clone(),
                            delta: -(pay as i32),
                            reason: "pon_2".to_string(),
                        });
                    }
                }
                PirinolaFace::Toma1 => {
                    let take = self.pot.min(stake);
                    if take > 0 {
                        self.pot -= take;
                        self.players[active_idx].coins += take;
                        self.players[active_idx].stats.coins_won += take;
                        transfers.push(CoinTransfer {
                            player_id: player_id.clone(),
                            player_name: player_name.clone(),
                            delta: take as i32,
                            reason: "toma_1".to_string(),
                        });
                    }
                }
                PirinolaFace::Toma2 => {
                    let take = self.pot.min(stake * 2);
                    if take > 0 {
                        self.pot -= take;
                        self.players[active_idx].coins += take;
                        self.players[active_idx].stats.coins_won += take;
                        transfers.push(CoinTransfer {
                            player_id: player_id.clone(),
                            player_name: player_name.clone(),
                            delta: take as i32,
                            reason: "toma_2".to_string(),
                        });
                    }
                }
                PirinolaFace::TodosPonen => {
                    for p in &mut self.players {
                        if p.eliminated {
                            continue;
                        }
                        let pay = p.coins.min(stake);
                        if pay > 0 {
                            p.coins -= pay;
                            p.stats.coins_put += pay;
                            self.pot += pay;
                            transfers.push(CoinTransfer {
                                player_id: p.id.clone(),
                                player_name: p.name.clone(),
                                delta: -(pay as i32),
                                reason: "todos_ponen".to_string(),
                            });
                        }
                    }
                }
                PirinolaFace::TomaTodo => {
                    let take = self.pot;
                    self.players[active_idx].stats.toma_todo_count += 1;
                    if take > 0 {
                        self.pot = 0;
                        self.players[active_idx].coins += take;
                        self.players[active_idx].stats.coins_won += take;
                        transfers.push(CoinTransfer {
                            player_id: player_id.clone(),
                            player_name: player_name.clone(),
                            delta: take as i32,
                            reason: "toma_todo".to_string(),
                        });
                    }
                }
            }
        }

        // Check Miracle Spin recovery or elimination for the active player first
        let mut miracle_saved = false;
        let mut eliminated_ids = Vec::new();

        if was_miracle_pending {
            if self.players[active_idx].coins > 0 {
                self.players[active_idx].miracle_pending = false;
                self.players[active_idx].stats.miracles_saved += 1;
                miracle_saved = true;
            } else {
                self.players[active_idx].miracle_pending = false;
                self.players[active_idx].eliminated = true;
                self.elimination_counter += 1;
                self.players[active_idx].stats.elimination_order = self.elimination_counter;
                eliminated_ids.push(player_id.clone());
            }
        }

        // Auto re-ante if pot hit 0 and auto_reante is enabled
        let mut reante_triggered = false;
        let players_with_coins = self
            .players
            .iter()
            .filter(|p| !p.eliminated && p.coins > 0)
            .count();

        if self.pot == 0 && self.settings.auto_reante && players_with_coins >= 2 {
            for p in &mut self.players {
                if p.eliminated {
                    continue;
                }
                let pay = p.coins.min(stake);
                if pay > 0 {
                    p.coins -= pay;
                    p.stats.coins_put += pay;
                    self.pot += pay;
                    reante_triggered = true;
                    transfers.push(CoinTransfer {
                        player_id: p.id.clone(),
                        player_name: p.name.clone(),
                        delta: -(pay as i32),
                        reason: "reante".to_string(),
                    });
                }
            }
        }

        // Evaluate 0-coin statuses across all players
        for p in &mut self.players {
            if p.eliminated {
                continue;
            }
            if p.coins == 0 {
                if self.settings.miracle_spin && !p.miracle_pending {
                    p.miracle_pending = true;
                } else if !self.settings.miracle_spin {
                    p.eliminated = true;
                    self.elimination_counter += 1;
                    p.stats.elimination_order = self.elimination_counter;
                    eliminated_ids.push(p.id.clone());
                }
            } else {
                p.miracle_pending = false;
            }
        }

        let coins_after = self.players[active_idx].coins as i32;
        let net_player_delta = coins_after - coins_before;
        let pot_after = self.pot;

        let face_metas: Vec<FaceMetadata> = faces.iter().map(|f| f.metadata()).collect();
        let combo = evaluate_combo(faces[0], faces.get(1).copied());
        let (combo_es, combo_en) = match combo {
            Some((es, en)) => (Some(es), Some(en)),
            None => (None, None),
        };

        let labels_es: Vec<String> = face_metas.iter().map(|m| m.label_es.clone()).collect();
        let labels_en: Vec<String> = face_metas.iter().map(|m| m.label_en.clone()).collect();

        let delta_text_es = match net_player_delta.cmp(&0) {
            std::cmp::Ordering::Greater => format!("(+{} fichas)", net_player_delta),
            std::cmp::Ordering::Less => format!("({} fichas)", net_player_delta),
            std::cmp::Ordering::Equal => "(sin cambio)".to_string(),
        };
        let delta_text_en = match net_player_delta.cmp(&0) {
            std::cmp::Ordering::Greater => format!("(+{} coins)", net_player_delta),
            std::cmp::Ordering::Less => format!("({} coins)", net_player_delta),
            std::cmp::Ordering::Equal => "(no change)".to_string(),
        };

        let mut summary_es = format!(
            "{} giró {} {}",
            player_name,
            labels_es.join(" + "),
            delta_text_es
        );
        let mut summary_en = format!(
            "{} spun {} {}",
            player_name,
            labels_en.join(" + "),
            delta_text_en
        );

        if miracle_saved {
            summary_es.push_str(" — ¡Salvado de milagro! 🍀");
            summary_en.push_str(" — Saved by a miracle! 🍀");
        }
        if reante_triggered {
            summary_es.push_str(" • ¡Pozo vacío, todos ponen!");
            summary_en.push_str(" • Empty pot, everyone re-antes!");
        }
        if let Some(new_s) = stake_escalated {
            summary_es.push_str(&format!(" • 🔥 ¡SUBE LA APUESTA a {}!", new_s));
            summary_en.push_str(&format!(" • 🔥 STAKES RAISED to {}!", new_s));
        }

        // Advance turn and check round/win conditions
        let completed_orbit = self.advance_to_next_alive_turn();
        if completed_orbit {
            self.round_number += 1;
        }

        let won_match = self.evaluate_win_conditions(completed_orbit);

        let outcome = SpinOutcome {
            player_id,
            player_name,
            avatar,
            color,
            faces: face_metas,
            physics,
            combo_es,
            combo_en,
            pot_before,
            pot_after,
            net_player_delta,
            reante_triggered,
            miracle_saved,
            eliminated_ids,
            transfers,
            summary_es,
            summary_en,
            won_match,
            stake_escalated,
        };

        self.last_spin = Some(outcome.clone());
        self.history.push(outcome.clone());
        if self.history.len() > 25 {
            self.history.remove(0);
        }

        let now = current_epoch_secs();
        self.last_activity_secs = now;
        self.turn_started_at_secs = now;

        Ok(outcome)
    }

    fn advance_to_next_alive_turn(&mut self) -> bool {
        let total = self.players.len();
        if total == 0 {
            return false;
        }
        let start = self.turn_index;
        let mut wrapped = false;
        for step in 1..=total {
            let candidate = (start + step) % total;
            if candidate <= start {
                wrapped = true;
            }
            if !self.players[candidate].eliminated {
                self.turn_index = candidate;
                return wrapped;
            }
        }
        false
    }

    fn evaluate_win_conditions(&mut self, completed_orbit: bool) -> bool {
        let alive_players: Vec<&Player> = self.players.iter().filter(|p| !p.eliminated).collect();
        let players_with_coins: Vec<&Player> = self
            .players
            .iter()
            .filter(|p| !p.eliminated && p.coins > 0)
            .collect();

        // 1. Target Coins Mode ("target")
        if self.settings.game_mode == "target" {
            if let Some(winner_p) = self
                .players
                .iter()
                .filter(|p| !p.eliminated && p.coins >= self.settings.target_coins)
                .max_by_key(|p| p.coins)
                .cloned()
            {
                let reason_es = format!(
                    "¡Alcanzó la meta de {} fichas con {} fichas!",
                    self.settings.target_coins, winner_p.coins
                );
                let reason_en = format!(
                    "Reached the {} coin target with {} coins!",
                    self.settings.target_coins, winner_p.coins
                );
                self.finalize_match(&winner_p, reason_es, reason_en);
                return true;
            }
        }

        // 2. Fixed Rounds Mode ("rounds")
        if self.settings.game_mode == "rounds"
            && completed_orbit
            && self.round_number > self.settings.max_rounds
        {
            if let Some(winner_p) = self
                .players
                .iter()
                .max_by_key(|p| (p.coins, p.stats.toma_todo_count))
                .cloned()
            {
                let reason_es = format!(
                    "¡Más rico tras {} rondas con {} fichas!",
                    self.settings.max_rounds, winner_p.coins
                );
                let reason_en = format!(
                    "Richest player after {} rounds with {} coins!",
                    self.settings.max_rounds, winner_p.coins
                );
                self.finalize_match(&winner_p, reason_es, reason_en);
                return true;
            }
        }

        // 3. Elimination / Last Player Standing (applies to all modes if everyone else busts or 1 player holds all coins + pot == 0)
        if alive_players.len() == 1 {
            let winner_p = alive_players[0].clone();
            let reason_es = format!(
                "¡Último jugador en pie con {} fichas!",
                winner_p.coins + self.pot
            );
            let reason_en = format!(
                "Last player standing with {} coins!",
                winner_p.coins + self.pot
            );
            self.finalize_match(&winner_p, reason_es, reason_en);
            return true;
        }

        if players_with_coins.len() == 1 && self.pot == 0 {
            let winner_p = players_with_coins[0].clone();
            let reason_es = format!(
                "¡Se llevó absolutamente todas las fichas ({})!",
                winner_p.coins
            );
            let reason_en = format!(
                "Collected every single coin on the table ({})!",
                winner_p.coins
            );
            self.finalize_match(&winner_p, reason_es, reason_en);
            return true;
        }

        // Edge case: if all players somehow hit 0 simultaneously, richest / most Toma Todo wins
        if alive_players.is_empty() {
            if let Some(winner_p) = self
                .players
                .iter()
                .max_by_key(|p| (p.coins, p.stats.elimination_order, p.stats.toma_todo_count))
                .cloned()
            {
                let reason_es = "¡Sobreviviente final de la mesa!".to_string();
                let reason_en = "Final survivor at the table!".to_string();
                self.finalize_match(&winner_p, reason_es, reason_en);
                return true;
            }
        }

        false
    }

    fn finalize_match(&mut self, winner: &Player, reason_es: String, reason_en: String) {
        self.state = RoomState::Finished;

        // Award any leftover pot to the winner if they were the sole survivor
        let mut final_winner_coins = winner.coins;
        let alive_count = self.players.iter().filter(|p| !p.eliminated).count();
        if alive_count <= 1 && self.pot > 0 {
            if let Some(w) = self.players.iter_mut().find(|p| p.id == winner.id) {
                w.coins += self.pot;
                final_winner_coins = w.coins;
                self.pot = 0;
            }
        }

        self.winner = Some(WinnerInfo {
            player_id: winner.id.clone(),
            player_name: winner.name.clone(),
            avatar: winner.avatar.clone(),
            color: winner.color.clone(),
            final_coins: final_winner_coins,
            total_spins: winner.stats.spins_count,
            toma_todo_count: winner.stats.toma_todo_count,
            win_reason_es: reason_es,
            win_reason_en: reason_en,
        });

        // Build Podium (top 3 sorted by: winner first, then coins desc, then survival order desc, then toma_todo desc)
        let mut sorted = self.players.clone();
        sorted.sort_by(|a, b| {
            let a_is_winner = a.id == winner.id;
            let b_is_winner = b.id == winner.id;
            b_is_winner
                .cmp(&a_is_winner)
                .then_with(|| b.coins.cmp(&a.coins))
                .then_with(|| (!b.eliminated).cmp(&(!a.eliminated)))
                .then_with(|| b.stats.elimination_order.cmp(&a.stats.elimination_order))
                .then_with(|| b.stats.toma_todo_count.cmp(&a.stats.toma_todo_count))
        });

        self.podium = sorted
            .iter()
            .take(3)
            .enumerate()
            .map(|(i, p)| PodiumEntry {
                rank: (i + 1) as u8,
                player_id: p.id.clone(),
                player_name: p.name.clone(),
                avatar: p.avatar.clone(),
                color: p.color.clone(),
                coins: p.coins,
                spins_count: p.stats.spins_count,
                toma_todo_count: p.stats.toma_todo_count,
            })
            .collect();

        self.awards = self.compute_awards(winner);
    }

    fn compute_awards(&self, winner: &Player) -> Vec<Award> {
        let mut awards = Vec::new();

        // 1. Rey del Toma Todo (Most Toma Todo spins)
        if let Some(p) = self
            .players
            .iter()
            .max_by_key(|p| (p.stats.toma_todo_count, p.stats.coins_won))
        {
            awards.push(Award {
                key: "toma_todo_king".to_string(),
                badge: "👑".to_string(),
                title_es: "Rey del Toma Todo".to_string(),
                title_en: "Take-All King".to_string(),
                player_name: p.name.clone(),
                avatar: p.avatar.clone(),
                color: p.color.clone(),
                detail_es: format!("{} giros de Toma Todo", p.stats.toma_todo_count),
                detail_en: format!("{} Take-All spins", p.stats.toma_todo_count),
            });
        }

        // 2. Mano Santa (Most total coins won from the pot)
        if let Some(p) = self.players.iter().max_by_key(|p| p.stats.coins_won) {
            awards.push(Award {
                key: "blessed_hand".to_string(),
                badge: "💰".to_string(),
                title_es: "Mano Santa".to_string(),
                title_en: "Golden Touch".to_string(),
                player_name: p.name.clone(),
                avatar: p.avatar.clone(),
                color: p.color.clone(),
                detail_es: format!("+{} fichas ganadas del pozo", p.stats.coins_won),
                detail_en: format!("+{} coins won from the pot", p.stats.coins_won),
            });
        }

        // 3. El Patrón del Pozo (Most coins contributed into the pot)
        if let Some(p) = self.players.iter().max_by_key(|p| p.stats.coins_put) {
            awards.push(Award {
                key: "pot_sponsor".to_string(),
                badge: "💸".to_string(),
                title_es: "El Patrón del Pozo".to_string(),
                title_en: "Pot Sponsor".to_string(),
                player_name: p.name.clone(),
                avatar: p.avatar.clone(),
                color: p.color.clone(),
                detail_es: format!("{} fichas puestas al pozo", p.stats.coins_put),
                detail_en: format!("{} coins put into the pot", p.stats.coins_put),
            });
        }

        // 4. Campeón / Gato con 7 Vidas
        if let Some(miracle_p) = self
            .players
            .iter()
            .filter(|p| p.stats.miracles_saved > 0)
            .max_by_key(|p| p.stats.miracles_saved)
        {
            awards.push(Award {
                key: "miracle_survivor".to_string(),
                badge: "🍀".to_string(),
                title_es: "Gato de 7 Vidas".to_string(),
                title_en: "Miracle Survivor".to_string(),
                player_name: miracle_p.name.clone(),
                avatar: miracle_p.avatar.clone(),
                color: miracle_p.color.clone(),
                detail_es: format!(
                    "{} salvadas de último aliento",
                    miracle_p.stats.miracles_saved
                ),
                detail_en: format!("{} miracle spin saves", miracle_p.stats.miracles_saved),
            });
        } else {
            awards.push(Award {
                key: "grand_champion".to_string(),
                badge: "🏆".to_string(),
                title_es: "Campeón de la Feria".to_string(),
                title_en: "Fairground Champion".to_string(),
                player_name: winner.name.clone(),
                avatar: winner.avatar.clone(),
                color: winner.color.clone(),
                detail_es: format!("{} fichas finales", winner.coins),
                detail_en: format!("{} final coins", winner.coins),
            });
        }

        awards
    }

    pub fn serialize_state(&self) -> serde_json::Value {
        serde_json::json!({
            "code": self.code,
            "hostId": self.host_id,
            "state": self.state,
            "settings": self.settings,
            "players": self.players,
            "turnIndex": self.turn_index,
            "currentTurnPlayerId": self.current_turn_player_id(),
            "roundNumber": self.round_number,
            "totalSpins": self.total_spins,
            "pot": self.pot,
            "lastSpin": self.last_spin,
            "winner": self.winner,
            "podium": self.podium,
            "awards": self.awards,
            "history": self.history
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn setup_two_player_room(mut settings: GameSettings) -> Room {
        settings.starting_coins = 10;
        settings.base_stake = 1;
        let mut room = Room::new(
            "PIRI01".to_string(),
            "p1".to_string(),
            "Ana".to_string(),
            "🤠".to_string(),
            "#e74c3c".to_string(),
            settings,
        );
        room.add_bot().unwrap();
        room.start_game().unwrap();
        room
    }

    #[test]
    fn test_room_creation_and_bot_management() {
        let mut room = Room::new(
            "MEX123".to_string(),
            "host_1".to_string(),
            "Carlos".to_string(),
            "🤠".to_string(),
            "#e74c3c".to_string(),
            GameSettings::default(),
        );
        assert_eq!(room.players.len(), 1);
        assert!(room.start_game().is_err());

        let bot = room.add_bot().unwrap();
        assert!(bot.is_bot);
        assert_eq!(room.players.len(), 2);

        let removed = room.remove_bot(Some(&bot.id)).unwrap();
        assert_eq!(removed, bot.id);
        assert_eq!(room.players.len(), 1);
    }

    #[test]
    fn test_all_six_faces_transfers_and_auto_reante() {
        let mut room = setup_two_player_room(GameSettings::default());
        // Initial state: each player put 1 into pot -> each has 9 coins, pot = 2
        assert_eq!(room.pot, 2);
        assert_eq!(room.players[0].coins, 9);
        assert_eq!(room.players[1].coins, 9);

        // Turn 1 (p1): Pon1 -> p1 = 8, pot = 3
        let out1 = room
            .spin_with_forced_faces(vec![PirinolaFace::Pon1], Some(0.5))
            .unwrap();
        assert_eq!(out1.net_player_delta, -1);
        assert_eq!(room.pot, 3);
        assert_eq!(room.players[0].coins, 8);

        // Turn 2 (p2): Pon2 -> p2 = 7, pot = 5
        let out2 = room
            .spin_with_forced_faces(vec![PirinolaFace::Pon2], Some(0.5))
            .unwrap();
        assert_eq!(out2.net_player_delta, -2);
        assert_eq!(room.pot, 5);
        assert_eq!(room.players[1].coins, 7);

        // Turn 3 (p1): Toma1 -> p1 = 9, pot = 4
        let out3 = room
            .spin_with_forced_faces(vec![PirinolaFace::Toma1], Some(0.5))
            .unwrap();
        assert_eq!(out3.net_player_delta, 1);
        assert_eq!(room.pot, 4);

        // Turn 4 (p2): Toma2 -> p2 = 9, pot = 2
        let out4 = room
            .spin_with_forced_faces(vec![PirinolaFace::Toma2], Some(0.5))
            .unwrap();
        assert_eq!(out4.net_player_delta, 2);
        assert_eq!(room.pot, 2);

        // Turn 5 (p1): TodosPonen -> p1 = 8, p2 = 8, pot = 4
        let out5 = room
            .spin_with_forced_faces(vec![PirinolaFace::TodosPonen], Some(0.5))
            .unwrap();
        assert_eq!(out5.net_player_delta, -1);
        assert_eq!(room.pot, 4);
        assert_eq!(room.players[0].coins, 8);
        assert_eq!(room.players[1].coins, 8);

        // Turn 6 (p2): TomaTodo -> p2 takes 4 (12), then auto_reante puts 1 from each -> p1 = 7, p2 = 11, pot = 2
        let out6 = room
            .spin_with_forced_faces(vec![PirinolaFace::TomaTodo], Some(0.9))
            .unwrap();
        assert!(out6.reante_triggered);
        assert_eq!(room.pot, 2);
        assert_eq!(room.players[0].coins, 7);
        assert_eq!(room.players[1].coins, 11);
    }

    #[test]
    fn test_miracle_spin_save_and_elimination() {
        let mut settings = GameSettings::default();
        settings.starting_coins = 5;
        settings.base_stake = 2;
        settings.miracle_spin = true;
        settings.auto_reante = false;

        let mut room = Room::new(
            "MIRACL".to_string(),
            "p1".to_string(),
            "Ana".to_string(),
            "🤠".to_string(),
            "#e74c3c".to_string(),
            settings,
        );
        room.add_bot().unwrap();
        room.start_game().unwrap();
        // Start: p1 = 3, p2 = 3, pot = 4

        // Turn 1 (p1): spins Pon2 (costs 4, pays all 3) -> p1 = 0, miracle_pending = true!
        room.spin_with_forced_faces(vec![PirinolaFace::Pon2], None)
            .unwrap();
        assert_eq!(room.players[0].coins, 0);
        assert!(room.players[0].miracle_pending);
        assert!(!room.players[0].eliminated);

        // Turn 2 (p2): spins Pon1 -> p2 = 1, pot = 9
        room.spin_with_forced_faces(vec![PirinolaFace::Pon1], None)
            .unwrap();

        // Turn 3 (p1's Miracle Spin!): Lands Toma1 -> saved!
        let save_out = room
            .spin_with_forced_faces(vec![PirinolaFace::Toma1], None)
            .unwrap();
        assert!(save_out.miracle_saved);
        assert!(!room.players[0].miracle_pending);
        assert!(!room.players[0].eliminated);
        assert!(room.players[0].coins > 0);

        // Turn 4 (p2): spins Pon1 -> p2 = 0, p2 enters miracle_pending!
        room.spin_with_forced_faces(vec![PirinolaFace::Pon1], None)
            .unwrap();
        assert!(room.players[1].miracle_pending);

        // Turn 5 (p1): spins Toma1
        room.spin_with_forced_faces(vec![PirinolaFace::Toma1], None)
            .unwrap();

        // Turn 6 (p2's Miracle Spin): Lands Pon1 -> fails miracle and is eliminated!
        let elim_out = room
            .spin_with_forced_faces(vec![PirinolaFace::Pon1], None)
            .unwrap();
        assert!(!elim_out.miracle_saved);
        assert!(room.players[1].eliminated);
        assert!(elim_out.won_match);
    }

    #[test]
    fn test_target_coins_and_rounds_win_modes() {
        let mut settings = GameSettings::default();
        settings.game_mode = "target".to_string();
        settings.starting_coins = 10;
        settings.base_stake = 2;
        settings.target_coins = 20;

        let mut room = Room::new(
            "TARGET".to_string(),
            "p1".to_string(),
            "Ana".to_string(),
            "🤠".to_string(),
            "#e74c3c".to_string(),
            settings,
        );
        room.add_bot().unwrap();
        room.start_game().unwrap();

        // Force pot high enough so TomaTodo hits target_coins (20)
        room.pot = 15;
        let out = room
            .spin_with_forced_faces(vec![PirinolaFace::TomaTodo], None)
            .unwrap();
        assert!(out.won_match);
        assert_eq!(room.state, RoomState::Finished);
        assert!(room.winner.is_some());
        assert!(!room.podium.is_empty());
        assert_eq!(room.awards.len(), 4);
    }

    #[test]
    fn test_automatic_stake_escalation_and_cycle_stake() {
        let mut settings = GameSettings::default();
        settings.starting_coins = 50;
        settings.base_stake = 1;
        settings.stake_escalation_interval = 8; // escalate every 8 spins

        let mut room = setup_two_player_room(settings);
        assert_eq!(room.settings.base_stake, 1);
        assert_eq!(room.total_spins, 0);

        // Spin 7 times: stake should remain 1
        for _ in 0..7 {
            let out = room
                .spin_with_forced_faces(vec![PirinolaFace::Toma1], None)
                .unwrap();
            assert_eq!(out.stake_escalated, None);
            assert_eq!(room.settings.base_stake, 1);
        }

        // 8th spin: stake should escalate to 2!
        let out8 = room
            .spin_with_forced_faces(vec![PirinolaFace::Toma1], None)
            .unwrap();
        assert_eq!(out8.stake_escalated, Some(2));
        assert_eq!(room.settings.base_stake, 2);
        assert_eq!(room.total_spins, 8);

        // Host manual cycle stake test
        assert_eq!(room.cycle_base_stake(), 3);
        assert_eq!(room.cycle_base_stake(), 5);
        assert_eq!(room.cycle_base_stake(), 10);
        assert_eq!(room.cycle_base_stake(), 1);
    }
}
