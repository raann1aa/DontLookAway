# DON'T LOOK AWAY // SECTOR-7 MULTI-ROOM SURVEILLANCE

An analog surveillance horror browser game built with pure **HTML5, CSS3, and JavaScript**.

---

## 📽️ Synopsis & Expanded Lore
You are the night security guard assigned to **Sector 7**. From **12:00 AM (00:00:00) to 06:00 AM (06:00:00)**, you must monitor an interconnected facility via the **SYSCON 1994 Closed-Circuit Video Network**.

An autonomous paranormal entity, designated **Subject 7**, is roaming the sealed sectors. It exhibits acute cognitive entanglement with optical observation: it cannot freely traverse space while under direct camera observation, but staring at it continuously overloads video sensors and provokes electromagnetic interference.

Your objective: **Monitor all 6 sectors, track entity movement, manage auxiliary power, contain structural anomalies, and survive until the 06:00 AM automated dawn UV purge.**

---

## 🏢 The 6 Interconnected Locations
The facility is mapped around a central corridor hub:

| Camera ID | Location | Key Interactive Objects |
| :--- | :--- | :--- |
| **CAM-01** | **Reception Foyer** | Telephone, Counter & Bell, Guest Chairs, Wall Clock, Bulletin Board, Shadow |
| **CAM-02** | **Main Corridor (Hub)** | Wing Doors, Water Cooler, Emergency Hazard Strobe, Ceiling Vent Grate, Fire Extinguisher, Shadow |
| **CAM-03** | **Research Lab** | Specimen Containment Cylinder, Stainless Bench & Microscope, Whiteboard, Bio-Locker, Swivel Stool, Shadow |
| **CAM-04** | **Isolation Cell** | Wooden Chair, Observation Desk, Victorian Portrait, Gooseneck Lamp, Heavy Cell Door, Shadow |
| **CAM-05** | **Storage Archive** | Industrial Shelves, Cargo Crates, Hanging Hazmat Suits, Swinging Bulb, File Boxes, Shadow |
| **CAM-06** | **Sub-Basement** | Diesel Backup Generator, Steam Conduits, Drainage Grate, Fuse Box, Oil Drums, Shadow |

---

## 🎮 Controls & Shortcuts

### Camera Switching
- **Keys `[Q, W, E, R, T, Y]`** or click the **Top Channel Bar**:
  - `[Q]` CAM-01: Reception
  - `[W]` CAM-02: Main Corridor
  - `[E]` CAM-03: Research Lab
  - `[R]` CAM-04: Isolation Cell
  - `[T]` CAM-05: Storage Archive
  - `[Y]` CAM-06: Sub-Basement
- **Interactive Blueprint Map**: Click any room block on the map to switch directly to its camera.

### Security Actions
- **`[D]` Lock/Unlock Bulkhead**: Toggles the reinforced steel security door between the currently viewed room and the corridor.
  - *Consequence:* Locking a door physically halts Subject 7 from passing, but drains **0.35% auxiliary power per second** per locked door. If power drops to 0%, all doors vent open!
- **`[F]` Reboot Camera**: Restores optical signal if Subject 7 or an electrical surge knocks a camera offline (-3% power).
- **`[S]` Motion Scan**: Sweeps vibration and auditory sensors across all sectors (-4% power). Identifies the entity's last known location and renders a sonar radar ping on the facility map.
- **`[L]` Incident Logs & Archives**: Opens the classified terminal to review real-time security events and decrypt hourly audio transcripts from previous personnel (Dr. Vance, Guard Morrison, Director Sterling).
- **`[Tab]` Toggle Map**: Shows/hides the facility mini-map.
- **`[M]` Mute Sound**: Toggles procedural Web Audio engine.
- **`[P]` or `[Esc]`**: Pauses the game.

### Reporting Anomalies
- **Direct Interaction:** Click any suspicious object directly in the room feed.
- **Bottom Console Buttons / Keys `[1] - [6]`**: Automatically update to match the 6 objects of the currently active room!
- **Reporting Subject 7:** If the entity is lurking in the room, reporting `[6] ENTITY / SHADOW` repels it back into an adjacent sector and awards **+600 points**.
- **False Alarm Penalty:** Submitting a report on an undisturbed object drains power and loses **1 Integrity Strike** (`❤️ ❤️ ❤️`). You have 3 strikes.

---

## ⚙️ Technical Architecture
- **Pure Browser Native:** No external images, downloads, or backend APIs.
- **Responsive Vector SVG Graphics:** Every room, furniture element, lighting cone, anomaly state, and blueprint node is rendered in responsive SVG.
- **Graph-Based Entity AI (`js/entity.js`):** Subject 7 traverses the facility node graph, generates environmental evidence (footsteps, temperature drops, cracked cylinders, ajar doors), and reacts realistically when confronted by locked bulkheads.
- **Shared Room State Persistence:** Anomalies and physical changes persist across rooms whether or not the player is actively viewing them.
- **Synthesized Web Audio (`js/audio.js`):** 100% procedural sound engine generating camera sync clicks, pneumatic bulkhead slams, hydraulic release hisses, scanner pings, modem reboot chirps, escalating heartbeats, transformer hums, and dawn victory chimes.

---

## 🚀 How to Play
Open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Firefox, etc.).
No installation or local server required.
