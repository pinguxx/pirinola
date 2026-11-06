mod game;
mod pirinola;
mod ws;

use axum::extract::{State, WebSocketUpgrade};
use axum::http::{header, HeaderValue};
use axum::response::{IntoResponse, Json};
use axum::routing::get;
use axum::Router;
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};
use tower_http::services::ServeDir;
use tower_http::set_header::SetResponseHeaderLayer;

use crate::pirinola::PirinolaFace;
use crate::ws::{handle_ws_connection, start_background_maintenance, AppState};

async fn health_check_api(State(state): State<AppState>) -> impl IntoResponse {
    let rooms_count = state.rooms.read().await.len();
    let sockets_guard = state.sockets.read().await;
    let connections_count: usize = sockets_guard.values().map(|r| r.len()).sum();

    Json(serde_json::json!({
        "status": "ok",
        "service": "pirinola-toma-todo-rust",
        "active_rooms": rooms_count,
        "active_connections": connections_count
    }))
}

async fn get_faces_api() -> impl IntoResponse {
    Json(serde_json::json!({
        "faces": PirinolaFace::all_metadata()
    }))
}

async fn ws_handler(ws: WebSocketUpgrade, State(state): State<AppState>) -> impl IntoResponse {
    ws.max_message_size(16 * 1024)
        .on_upgrade(move |socket| handle_ws_connection(socket, state))
}

pub fn create_app(state: AppState) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    Router::new()
        .route("/health", get(health_check_api))
        .route("/healthz", get(health_check_api))
        .route("/api/health", get(health_check_api))
        .route("/api/faces", get(get_faces_api))
        .route("/ws", get(ws_handler))
        .fallback_service(ServeDir::new("public"))
        .layer(SetResponseHeaderLayer::overriding(
            header::CACHE_CONTROL,
            HeaderValue::from_static("no-cache, no-store, must-revalidate"),
        ))
        .layer(SetResponseHeaderLayer::overriding(
            header::PRAGMA,
            HeaderValue::from_static("no-cache"),
        ))
        .layer(SetResponseHeaderLayer::overriding(
            header::EXPIRES,
            HeaderValue::from_static("0"),
        ))
        .layer(SetResponseHeaderLayer::overriding(
            header::X_CONTENT_TYPE_OPTIONS,
            HeaderValue::from_static("nosniff"),
        ))
        .layer(SetResponseHeaderLayer::overriding(
            header::X_FRAME_OPTIONS,
            HeaderValue::from_static("SAMEORIGIN"),
        ))
        .layer(SetResponseHeaderLayer::overriding(
            header::REFERRER_POLICY,
            HeaderValue::from_static("strict-origin-when-cross-origin"),
        ))
        .layer(SetResponseHeaderLayer::overriding(
            header::CONTENT_SECURITY_POLICY,
            HeaderValue::from_static(
                "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' data:; connect-src 'self' ws: wss:; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';",
            ),
        ))
        .layer(cors)
        .with_state(state)
}

#[tokio::main]
async fn main() {
    let port = std::env::var("PORT")
        .ok()
        .and_then(|p| p.parse::<u16>().ok())
        .unwrap_or(3000);

    let state = AppState::new();
    tokio::spawn(start_background_maintenance(state.clone()));

    let app = create_app(state);

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();

    println!("\n========================================================");
    println!("🌀 PIRINOLA ONLINE • ¡TOMA TODO! (RUST / AXUM) 🇲🇽");
    println!("========================================================");
    println!("> Local:   http://localhost:{}", port);
    println!("> Network: http://0.0.0.0:{}", port);
    println!("========================================================\n");

    axum::serve(listener, app).await.unwrap();
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::Body;
    use axum::http::{Request, StatusCode};
    use futures_util::{SinkExt, StreamExt};
    use serde_json::{json, Value};
    use tokio_tungstenite::{connect_async, tungstenite::protocol::Message as WsMsg};
    use tower::ServiceExt;

    #[tokio::test]
    async fn test_http_endpoints_and_security_headers() {
        let state = AppState::new();
        let app = create_app(state);

        let res = app
            .clone()
            .oneshot(
                Request::builder()
                    .uri("/health")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(res.status(), StatusCode::OK);
        assert_eq!(
            res.headers().get(header::X_CONTENT_TYPE_OPTIONS).unwrap(),
            "nosniff"
        );
        assert_eq!(
            res.headers().get(header::X_FRAME_OPTIONS).unwrap(),
            "SAMEORIGIN"
        );
        assert_eq!(
            res.headers().get(header::REFERRER_POLICY).unwrap(),
            "strict-origin-when-cross-origin"
        );
        assert!(res.headers().contains_key(header::CONTENT_SECURITY_POLICY));

        let res_faces = app
            .oneshot(
                Request::builder()
                    .uri("/api/faces")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(res_faces.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn test_websocket_end_to_end_room_bot_and_spin() {
        let state = AppState::new();
        let app = create_app(state);
        let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
        let addr = listener.local_addr().unwrap();

        tokio::spawn(async move {
            axum::serve(listener, app).await.unwrap();
        });

        let ws_url = format!("ws://{}/ws", addr);
        let (mut ws_stream, _) = connect_async(&ws_url).await.unwrap();

        // 1. Create Room
        ws_stream
            .send(WsMsg::Text(
                json!({
                    "type": "create_room",
                    "playerName": "Elena",
                    "avatar": "🌺",
                    "color": "#e84393"
                })
                .to_string()
                .into(),
            ))
            .await
            .unwrap();

        let msg = ws_stream.next().await.unwrap().unwrap();
        let parsed: Value = serde_json::from_str(msg.to_text().unwrap()).unwrap();
        assert_eq!(parsed["type"], "room_joined");
        let room_code = parsed["room"]["code"].as_str().unwrap().to_string();

        // 2. Add Bot
        ws_stream
            .send(WsMsg::Text(
                json!({
                    "type": "add_bot",
                    "roomCode": room_code
                })
                .to_string()
                .into(),
            ))
            .await
            .unwrap();

        let msg_bot = ws_stream.next().await.unwrap().unwrap();
        let parsed_bot: Value = serde_json::from_str(msg_bot.to_text().unwrap()).unwrap();
        assert_eq!(parsed_bot["type"], "room_updated");
        assert_eq!(parsed_bot["room"]["players"].as_array().unwrap().len(), 2);

        // 3. Start Game
        ws_stream
            .send(WsMsg::Text(
                json!({
                    "type": "start_game",
                    "roomCode": room_code
                })
                .to_string()
                .into(),
            ))
            .await
            .unwrap();

        let msg_start = ws_stream.next().await.unwrap().unwrap();
        let parsed_start: Value = serde_json::from_str(msg_start.to_text().unwrap()).unwrap();
        assert_eq!(parsed_start["type"], "game_started");

        // 4. Spin Pirinola
        ws_stream
            .send(WsMsg::Text(
                json!({
                    "type": "spin_pirinola",
                    "roomCode": room_code,
                    "power": 0.85
                })
                .to_string()
                .into(),
            ))
            .await
            .unwrap();

        let msg_spin = ws_stream.next().await.unwrap().unwrap();
        let parsed_spin: Value = serde_json::from_str(msg_spin.to_text().unwrap()).unwrap();
        assert_eq!(parsed_spin["type"], "spin_result");
        assert_eq!(parsed_spin["outcome"]["physics"]["tier"], "turbo");
    }
}
