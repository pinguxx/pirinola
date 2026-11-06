# 🌀 Pirinola Online 3D • ¡Toma Todo! 🇲🇽

A real-time multiplayer web game of the traditional Mexican **Pirinola** (*Perinola* / *Toma Todo*), built with a high-performance **Rust** backend (`Axum`, `Tokio`, `WebSockets`) and a zero-dependency, responsive, bilingual Vanilla JS client. Features a true 6-sided 3D hexagonal wooden top with hold-to-charge spin power, live swipe-to-spin gestures, gyroscopic wobble physics, automated bots, traditional Mexican *dichos*, animated flying coins around *El Pozo*, live table interactions (*¡Sóplale!* & *¡Golpecito!*), 3 3D top skins, 3 cultural table themes, and a shareable canvas Victory Trophy Card.

---

## 🇺🇸 English Guide

### 🌟 Key Features

1. **True 3D Hexagonal Pirinola & Physics**:
   - Six 3D prism faces (`PON 1`, `PON 2`, `TOMA 1`, `TOMA 2`, `TODOS PONEN`, `TOMA TODO`) with lathe-turned spindle, crown, and conical tip.
   - **👆 Swipe-to-Spin & Hold-to-Charge**: Flick the 3D Pirinola directly with finger or mouse (clockwise or counter-clockwise), or use the power presets (**Suave**, **Fuerte**, **¡TURBO!**).
   - **🎨 3D Top Paint Skins**: Switch between *🎡 Artesanal* (traditional market enamel), *🏺 Talavera* (Puebla glazed ceramic), and *🖤 Obsidiana & Oro* (matte obsidian with brushed gold).
   - **💨 ¡Sóplale! & 👊 ¡Golpecito!**: Live interactive table nudges while the top spins.
   - Traditional family-friendly Mexican rhymes (*dichos*) spoken via browser `SpeechSynthesis` on every landing.

2. **Real-Time Multiplayer & Solo Bots Mode (Rust + Axum WebSockets)**:
   - Private game rooms with 6-character codes (e.g., `PIRI26`), 1-click invite links (`?room=CODE`), and offline **📱 Party QR Code** modal.
   - Up to 10 players with 10 avatars and 11 token colors (including Obsidian Black `#18181b`).
   - **🤖 Mexican Bots**: Fill empty seats with up to 9 personality bots (`🤖 Don Ramón Bot`, `🤖 La Catrina Bot`, `🤖 Lupita Bot`, `🤖 El Chavo Bot`, `🤖 El Santo Bot`, etc.) that spin automatically and shout table banter.

3. **3 Game Modes**:
   - 🏆 **Last Player Standing (`elimination`)**: Classic survival until one player collects all the coins.
   - 🎯 **Target Bankroll (`target`)**: Fast-paced race where the first player to reach 40, 50, 80, or 100 coins wins immediately.
   - 🔄 **Fixed Rounds (`rounds`)**: Richest player after 5, 10, 15, or 20 table orbits wins.

4. **Special Fairground Rules ("Reglas de la Feria")**:
   - 🔥 **Doble Pirinola (2 Tops Mode)**: Spin two 3D pirinolas simultaneously with special combo callouts (*¡Doble Toma Todo!*, *¡Combo Perfecto!*).
   - 🍀 **Último Aliento (Miracle Spin)**: When a player hits `0` coins, they get one final all-or-nothing spin on their next turn to stay alive.
   - 💰 **Pozo Vivo (Auto Re-Ante)**: Whenever *Toma Todo* empties the central pot, everyone automatically contributes the base stake so the pot is never dry.

5. **3 Table Themes & Procedural Web Audio**:
   - **Juguetería Tradicional**, **Talavera Poblana**, and **Madera de Parota / Cantina**.
   - 100% procedural Web Audio API sound effects (wooden top whir, decelerating wobble clacks, coin clinks, brass fanfare) with zero external audio files.
   - **📸 Shareable 800×1000 Canvas Victory Card** with 1st/2nd/3rd place podium and 4 post-match telemetry awards.

---

### 🚀 Running Locally

```powershell
# Run in Release mode:
cargo run --release

# Run automated test suite:
cargo test
```

Open **[http://localhost:3000](http://localhost:3000)** on your PC or `http://YOUR_LOCAL_IP:3000` on mobile devices connected to the same Wi-Fi.

---

### 🐳 Docker & Render.com Deployment

The repository includes a production multi-stage `Dockerfile` and `render.yaml` blueprint ready to deploy to **Render.com**, **Fly.io**, or any standard container host:

```bash
# Build Docker image
docker build -t pirinola:latest .

# Run container
docker run -p 3000:3000 -e PORT=3000 pirinola:latest
```

On Render.com:
1. Create a new **Web Service** connected to your GitHub repository.
2. Select **Docker** environment.
3. Render automatically picks up `Dockerfile` and `render.yaml` with `/health` health checks enabled.

---

## 🇲🇽 Guía en Español

### 🌟 Características Principales

1. **Pirinola Hexagonal 3D Real, Swipe y Barra de Fuerza**:
   - Trompo mexicano de 6 caras en 3D (`PON 1`, `PON 2`, `TOMA 1`, `TOMA 2`, `TODOS PONEN`, `TOMA TODO`) con bamboleo giroscópico realista.
   - **👆 Gira con Deslizar (Swipe-to-Spin)**: Desliza tu dedo o ratón directamente sobre la Pirinola para lanzarla con fuerza y dirección física.
   - **🎨 Pinturas de la Pirinola**: *🎡 Artesanal*, *🏺 Talavera* y *🖤 Obsidiana & Oro*.
   - **💨 ¡Sóplale! y 👊 ¡Golpecito a la Mesa!**: Interacciones en vivo durante el tiro.
   - Dichos tradicionales mexicanos narrados con voz (`SpeechSynthesis`) en cada jugada.

2. **Multijugador en Tiempo Real y Modo con Bots**:
   - Salas privadas de hasta 10 jugadores con código de 6 letras, enlace directo y **📱 Código QR** para fiestas.
   - Agrega hasta 9 bots (`🤖 Don Ramón Bot`, `🤖 La Catrina Bot`, `🤖 El Chavo Bot`, etc.) para jugar en solitario o completar la mesa.

3. **Modos de Victoria y Reglas de la Feria**:
   - 🏆 **Último en Pie**, 🎯 **Meta de Fichas** y 🔄 **Por Rondas**.
   - Opciones de **🔥 Doble Pirinola**, **🍀 Último Aliento (Giro de Milagro)** y **💰 Pozo Vivo (Re-Ante Automático)**.
   - **📸 Tarjeta de Trofeo Compartible (800×1000 PNG)** con podio y 4 premios de fin de partida (*👑 Rey del Toma Todo*, *💰 Mano Santa*, *💸 El Patrón del Pozo*, *🍀 Gato de 7 Vidas*).
