/**
 * Don't Look Away - Multi-Room SVG Surveillance Renderer
 * Renders 6 distinct facility rooms, door bulkhead states, entity manifestations,
 * and room-specific anomalies entirely through responsive SVG.
 */

class RoomRenderer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentRoomId = 'isolation';
    this.offlineCameras = new Set();
    this.doorStates = {};
    this.entityPresentRoom = null;
    this.activeRoomAnomalies = new Map(); // anomalyId -> anomaly
    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
  }

  setDoors(doors) {
    this.doorStates = doors;
  }

  setEntityRoom(roomId) {
    this.entityPresentRoom = roomId;
    if (this.currentRoomId === roomId || this.previousEntityRoom === this.currentRoomId) {
      this.updateEntityVisuals();
    }
    this.previousEntityRoom = roomId;
  }

  setCameraOffline(roomId, isOffline) {
    if (isOffline) {
      this.offlineCameras.add(roomId);
    } else {
      this.offlineCameras.delete(roomId);
    }
    if (this.currentRoomId === roomId) {
      this.render();
    }
  }

  setRoom(roomId) {
    if (!ROOMS_CONFIG[roomId]) return;
    this.currentRoomId = roomId;
    this.render();
  }

  render() {
    if (!this.container) return;

    // If camera is offline, render static snow and carrier loss
    if (this.offlineCameras.has(this.currentRoomId)) {
      this.container.innerHTML = this.generateOfflineSVG();
      return;
    }

    let roomSvg = '';
    switch (this.currentRoomId) {
      case 'reception':
        roomSvg = this.generateReceptionSVG();
        break;
      case 'corridor':
        roomSvg = this.generateCorridorSVG();
        break;
      case 'lab':
        roomSvg = this.generateLabSVG();
        break;
      case 'isolation':
        roomSvg = this.generateIsolationSVG();
        break;
      case 'storage':
        roomSvg = this.generateStorageSVG();
        break;
      case 'basement':
        roomSvg = this.generateBasementSVG();
        break;
      default:
        roomSvg = this.generateIsolationSVG();
    }

    this.container.innerHTML = roomSvg;
    this.cacheRoomElements();
    this.applyActiveRoomAnomalies();
    this.updateDoorBulkheadVisual();
    this.updateEntityVisuals();
  }

  cacheRoomElements() {
    this.elements = {};
    const svg = this.container.querySelector('svg');
    if (!svg) return;

    // Cache all elements with IDs
    const elementsWithId = svg.querySelectorAll('[id]');
    elementsWithId.forEach(el => {
      this.elements[el.id] = el;
    });
  }

  // ================= 1. RECEPTION ROOM SVG =================
  generateReceptionSVG() {
    return `
      <svg id="room-reception-svg" class="facility-room-svg" viewBox="0 0 1000 650" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="recWallGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#141a16"/>
            <stop offset="100%" stop-color="#0a0e0c"/>
          </linearGradient>
          <linearGradient id="recFloorGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#111713"/>
            <stop offset="100%" stop-color="#060907"/>
          </linearGradient>
          <filter id="recGlow">
            <feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <!-- Wall & Floor -->
        <rect x="0" y="0" width="1000" height="400" fill="url(#recWallGrad)"/>
        <!-- Wall panelling wood slats -->
        <line x1="0" y1="200" x2="1000" y2="200" stroke="#1d2620" stroke-width="2"/>
        <line x1="220" y1="0" x2="220" y2="400" stroke="#090d0b" stroke-width="2"/>
        <line x1="480" y1="0" x2="480" y2="400" stroke="#090d0b" stroke-width="2"/>
        <line x1="750" y1="0" x2="750" y2="400" stroke="#090d0b" stroke-width="2"/>

        <polygon points="0,400 1000,400 1000,650 0,650" fill="url(#recFloorGrad)"/>
        <!-- Perspective floor tiles -->
        <line x1="200" y1="400" x2="80" y2="650" stroke="#18231c" stroke-width="1.5"/>
        <line x1="400" y1="400" x2="350" y2="650" stroke="#18231c" stroke-width="1.5"/>
        <line x1="600" y1="400" x2="620" y2="650" stroke="#18231c" stroke-width="1.5"/>
        <line x1="800" y1="400" x2="890" y2="650" stroke="#18231c" stroke-width="1.5"/>

        <!-- Bulkhead Door Indicator (Door to Corridor) -->
        <g id="bulkhead-rec-door">
          <rect x="60" y="110" width="120" height="290" fill="#0d1410" stroke="#1c2b22" stroke-width="2"/>
          <rect x="75" y="130" width="90" height="110" fill="#060907" stroke="#152019" stroke-width="1.5"/>
          <text id="bulkhead-rec-status" x="120" y="100" fill="#26ff75" font-family="'Courier New', monospace" font-size="11" font-weight="bold" text-anchor="middle">DOOR D-01: OPEN</text>
          <!-- Door Shutter (drops down if locked) -->
          <rect id="bulkhead-rec-shutter" x="62" y="112" width="116" height="0" fill="#2b1a1a" stroke="#ff3344" stroke-width="2" style="transition: height 0.4s ease;"/>
        </g>

        <!-- OBJECT 1: RECEPTION COUNTER -->
        <g id="interactive-counter" class="room-object-group" data-object="counter" cursor="pointer">
          <!-- Counter main body -->
          <polygon points="420,340 880,340 860,540 380,540" fill="#1e2721" stroke="#0e1410" stroke-width="2"/>
          <!-- Countertop -->
          <polygon points="390,340 850,340 910,380 430,380" fill="#2b382f" stroke="#161f19" stroke-width="2"/>
          <!-- Acrylic security glass partition on counter -->
          <rect x="520" y="180" width="300" height="160" fill="rgba(38,255,117,0.03)" stroke="#1a2e21" stroke-width="2"/>
          <!-- Register & Bell -->
          <rect x="490" y="348" width="45" height="24" fill="#3a473e" rx="2"/>
          <circle cx="580" cy="358" r="6" fill="#887a40" stroke="#443c1b" stroke-width="1"/>
          <!-- Handprint Anomaly on Counter -->
          <g id="rec-ooze-handprint" opacity="0">
            <ellipse cx="640" cy="360" rx="14" ry="9" fill="#050705"/>
            <path d="M 632,352 Q 630,340 634,336 M 638,350 Q 640,336 642,334 M 646,352 Q 648,338 650,336 M 626,356 Q 622,348 624,344" stroke="#050705" stroke-width="3" stroke-linecap="round"/>
            <path d="M 640,368 Q 640,430 638,480" stroke="#050705" stroke-width="3" fill="none"/>
          </g>
          <!-- Reticle -->
          <polygon id="counter-reticle" class="object-focus-reticle" points="380,335 915,335 870,545 370,545" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="8 6" opacity="0" pointer-events="none"/>
        </g>

        <!-- OBJECT 2: VINTAGE TELEPHONE -->
        <g id="interactive-phone" class="room-object-group" data-object="phone" cursor="pointer">
          <!-- Base -->
          <rect x="450" y="345" width="28" height="22" fill="#302720" rx="3" stroke="#16110d" stroke-width="1.5"/>
          <circle cx="464" cy="356" r="6" fill="#1f1813"/>
          <!-- Handset (normally resting, animates off hook if anomaly) -->
          <g id="rec-phone-handset" transform="translate(0, 0)">
            <rect x="444" y="341" width="40" height="7" rx="3" fill="#4d3e33" stroke="#1a140f" stroke-width="1"/>
          </g>
          <!-- Reticle -->
          <rect id="phone-reticle" class="object-focus-reticle" x="435" y="335" width="55" height="40" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="6 4" opacity="0" pointer-events="none"/>
        </g>

        <!-- OBJECT 3: GUEST CHAIRS -->
        <g id="interactive-guest_chairs" class="room-object-group" data-object="guest_chairs" cursor="pointer">
          <g id="guest-chairs-group" transform="translate(0, 0)">
            <!-- Chair 1 -->
            <rect x="230" y="360" width="55" height="50" fill="#253229" stroke="#131a15" stroke-width="1.5"/>
            <rect x="235" y="410" width="45" height="15" fill="#314236"/>
            <line x1="235" y1="425" x2="230" y2="490" stroke="#17211a" stroke-width="3.5"/>
            <line x1="275" y1="425" x2="280" y2="490" stroke="#17211a" stroke-width="3.5"/>
            <!-- Chair 2 -->
            <rect x="305" y="360" width="55" height="50" fill="#253229" stroke="#131a15" stroke-width="1.5"/>
            <rect x="310" y="410" width="45" height="15" fill="#314236"/>
            <line x1="310" y1="425" x2="305" y2="490" stroke="#17211a" stroke-width="3.5"/>
            <line x1="350" y1="425" x2="355" y2="490" stroke="#17211a" stroke-width="3.5"/>
          </g>
          <!-- Reticle -->
          <rect id="guest_chairs-reticle" class="object-focus-reticle" x="220" y="350" width="150" height="150" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="8 6" opacity="0" pointer-events="none"/>
        </g>

        <!-- OBJECT 4: WALL CLOCK -->
        <g id="interactive-wall_clock" class="room-object-group" data-object="wall_clock" cursor="pointer">
          <circle cx="500" cy="90" r="38" fill="#18231c" stroke="#33483b" stroke-width="3"/>
          <circle cx="500" cy="90" r="32" fill="#0d1410"/>
          <!-- Clock Hands -->
          <g id="rec-clock-hands" style="transform-origin: 500px 90px;">
            <line x1="500" y1="90" x2="500" y2="68" stroke="#a4d4b2" stroke-width="2.5"/>
            <line x1="500" y1="90" x2="518" y2="90" stroke="#a4d4b2" stroke-width="2"/>
          </g>
          <!-- Reticle -->
          <rect id="wall_clock-reticle" class="object-focus-reticle" x="455" y="45" width="90" height="90" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="6 4" opacity="0" pointer-events="none"/>
        </g>

        <!-- OBJECT 5: BULLETIN BOARD -->
        <g id="interactive-bulletin_board" class="room-object-group" data-object="bulletin_board" cursor="pointer">
          <rect x="710" y="70" width="160" height="100" fill="#3a3020" stroke="#1c160e" stroke-width="3"/>
          <!-- Papers on board -->
          <rect x="725" y="82" width="40" height="50" fill="#d2cbba"/>
          <rect x="775" y="85" width="38" height="42" fill="#c4ba9f"/>
          <rect x="820" y="90" width="36" height="46" fill="#e0dacb"/>
          <!-- Scrawl Anomaly on Board -->
          <g id="rec-board-scrawl-text" opacity="0">
            <text x="730" y="115" font-family="'Courier New', monospace" font-size="20" font-weight="bold" fill="#ff2222" filter="url(#recGlow)">RUN</text>
            <path d="M 725,125 L 850,128" stroke="#ff2222" stroke-width="3"/>
          </g>
          <!-- Reticle -->
          <rect id="bulletin_board-reticle" class="object-focus-reticle" x="700" y="60" width="180" height="120" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="8 6" opacity="0" pointer-events="none"/>
        </g>

        <!-- OBJECT 6: SHADOW / ENTITY (Visitor at counter or corner) -->
        <g id="interactive-shadow" class="room-object-group" data-object="shadow" cursor="pointer">
          <g id="rec-shadow-entity" opacity="0">
            <!-- Silhouette at counter window -->
            <path d="M 770,140 Q 770,120 785,120 Q 800,120 800,140 Q 820,200 815,340 L 755,340 Q 750,200 770,140 Z" fill="#000000"/>
            <ellipse cx="785" cy="138" rx="14" ry="18" fill="#000000"/>
            <!-- Glowing eyes -->
            <circle cx="780" cy="136" r="2.2" fill="#ff4444" filter="url(#recGlow)"/>
            <circle cx="790" cy="136" r="2.2" fill="#ff4444" filter="url(#recGlow)"/>
          </g>
          <rect id="shadow-reticle" class="object-focus-reticle" x="740" y="110" width="90" height="240" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="8 6" opacity="0" pointer-events="none"/>
        </g>
      </svg>
    `;
  }

  // ================= 2. MAIN CORRIDOR SVG =================
  generateCorridorSVG() {
    return `
      <svg id="room-corridor-svg" class="facility-room-svg" viewBox="0 0 1000 650" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="corrWall" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#0a100d"/>
            <stop offset="50%" stop-color="#18241d"/>
            <stop offset="100%" stop-color="#0a100d"/>
          </linearGradient>
          <filter id="corrStrobe">
            <feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <!-- Deep Corridor 1-Point Perspective -->
        <!-- Ceiling -->
        <polygon points="0,0 1000,0 620,220 380,220" fill="#0d1410" stroke="#060907" stroke-width="2"/>
        <!-- Floor with checkered tiles -->
        <polygon points="0,650 1000,650 620,420 380,420" fill="#0a0f0c"/>
        <line x1="380" y1="420" x2="0" y2="650" stroke="#1d2b22" stroke-width="2"/>
        <line x1="460" y1="420" x2="280" y2="650" stroke="#1d2b22" stroke-width="2"/>
        <line x1="540" y1="420" x2="720" y2="650" stroke="#1d2b22" stroke-width="2"/>
        <line x1="620" y1="420" x2="1000" y2="650" stroke="#1d2b22" stroke-width="2"/>
        <line x1="200" y1="530" x2="800" y2="530" stroke="#152019" stroke-width="1.5"/>
        <line x1="300" y1="465" x2="700" y2="465" stroke="#152019" stroke-width="1.5"/>

        <!-- Left Wall -->
        <polygon points="0,0 380,220 380,420 0,650" fill="#131c17" stroke="#080c0a" stroke-width="2"/>
        <!-- Right Wall -->
        <polygon points="1000,0 620,220 620,420 1000,650" fill="#101713" stroke="#080c0a" stroke-width="2"/>

        <!-- Far End Black Void Entrance -->
        <rect x="380" y="220" width="240" height="200" fill="#020403" stroke="#1b261f" stroke-width="2"/>

        <!-- Overhead Fluorescent Lighting Bars -->
        <line x1="420" y1="120" x2="580" y2="120" stroke="#a4ffc2" stroke-width="6" opacity="0.4"/>
        <line x1="460" y1="180" x2="540" y2="180" stroke="#a4ffc2" stroke-width="4" opacity="0.4"/>

        <!-- OBJECT 1: WING DOORS (Left and Right doors to rooms) -->
        <g id="interactive-hallway_doors" class="room-object-group" data-object="hallway_doors" cursor="pointer">
          <!-- Left Door (Lab D-02) -->
          <polygon points="120,180 240,250 240,480 120,560" fill="#1c2720" stroke="#090d0b" stroke-width="2"/>
          <text x="170" y="220" fill="#395241" font-size="10" font-family="monospace" transform="rotate(32 170 220)">LAB D-02</text>
          <!-- Ajar door gap (anomaly) -->
          <polygon id="corr-left-door-gap" points="200,225 240,250 240,480 200,505" fill="#000000" opacity="0"/>

          <!-- Right Door (Isolation D-03) -->
          <polygon points="880,180 760,250 760,480 880,560" fill="#1c2720" stroke="#090d0b" stroke-width="2"/>
          <text x="810" y="220" fill="#395241" font-size="10" font-family="monospace" transform="rotate(-32 810 220)">ISO D-03</text>
          <polygon id="corr-right-door-gap" points="800,225 760,250 760,480 800,505" fill="#000000" opacity="0"/>

          <!-- Reticle -->
          <polygon id="hallway_doors-reticle" class="object-focus-reticle" points="110,170 890,170 890,570 110,570" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="8 6" opacity="0" pointer-events="none"/>
        </g>

        <!-- OBJECT 2: WATER COOLER -->
        <g id="interactive-water_cooler" class="room-object-group" data-object="water_cooler" cursor="pointer">
          <rect x="290" y="340" width="35" height="70" fill="#29392e" stroke="#121a15" stroke-width="1.5"/>
          <!-- Bottle on top -->
          <ellipse cx="307" cy="315" rx="14" ry="20" fill="#3f7262" stroke="#1b3029" stroke-width="1.5"/>
          <!-- Black fluid anomaly in bottle -->
          <ellipse id="corr-cooler-black-fluid" cx="307" cy="315" rx="14" ry="20" fill="#060907" stroke="#ff2222" stroke-width="1.5" opacity="0"/>
          <!-- Reticle -->
          <rect id="water_cooler-reticle" class="object-focus-reticle" x="280" y="290" width="55" height="130" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="6 4" opacity="0" pointer-events="none"/>
        </g>

        <!-- OBJECT 3: HAZARD LIGHT (Ceiling emergency strobe) -->
        <g id="interactive-hazard_light" class="room-object-group" data-object="hazard_light" cursor="pointer">
          <ellipse cx="500" cy="40" rx="18" ry="12" fill="#443c1b" stroke="#221e0d" stroke-width="2"/>
          <path id="corr-hazard-dome" d="M 488,40 Q 500,20 512,40 Z" fill="#ffaa22"/>
          <!-- Crimson Strobe Flash (Anomaly) -->
          <circle id="corr-hazard-strobe-halo" cx="500" cy="35" r="45" fill="rgba(255, 34, 34, 0.45)" filter="url(#corrStrobe)" opacity="0"/>
          <!-- Reticle -->
          <rect id="hazard_light-reticle" class="object-focus-reticle" x="465" y="10" width="70" height="55" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="6 4" opacity="0" pointer-events="none"/>
        </g>

        <!-- OBJECT 4: CEILING VENT GRATE -->
        <g id="interactive-vent_grate" class="room-object-group" data-object="vent_grate" cursor="pointer">
          <polygon points="460,140 540,140 545,160 455,160" fill="#141c17" stroke="#25352c" stroke-width="1.5"/>
          <!-- Vent Grate cover (drops down) -->
          <g id="corr-vent-cover" transform="translate(0, 0)">
            <line x1="470" y1="145" x2="530" y2="145" stroke="#2c3f34" stroke-width="2"/>
            <line x1="470" y1="152" x2="530" y2="152" stroke="#2c3f34" stroke-width="2"/>
          </g>
          <!-- Hanging tendril arm (anomaly) -->
          <path id="corr-vent-tendril" d="M 495,155 Q 480,210 505,250 Q 520,290 515,330" stroke="#040605" stroke-width="6" fill="none" stroke-linecap="round" opacity="0"/>
          <!-- Reticle -->
          <rect id="vent_grate-reticle" class="object-focus-reticle" x="445" y="130" width="110" height="50" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="6 4" opacity="0" pointer-events="none"/>
        </g>

        <!-- OBJECT 5: FIRE EXTINGUISHER -->
        <g id="interactive-fire_extinguisher" class="room-object-group" data-object="fire_extinguisher" cursor="pointer">
          <!-- Wall box -->
          <rect x="670" y="320" width="30" height="60" fill="#211212" stroke="#521f1f" stroke-width="1.5"/>
          <!-- Red canister -->
          <rect id="corr-extinguisher-canister" x="676" y="332" width="18" height="42" fill="#882222" rx="4"/>
          <!-- Reticle -->
          <rect id="fire_extinguisher-reticle" class="object-focus-reticle" x="660" y="310" width="50" height="80" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="6 4" opacity="0" pointer-events="none"/>
        </g>

        <!-- OBJECT 6: SHADOW / ENTITY IN CORRIDOR -->
        <g id="interactive-shadow" class="room-object-group" data-object="shadow" cursor="pointer">
          <g id="corr-shadow-figure" opacity="0">
            <!-- Looming shadow figure at the center of hallway -->
            <path d="M 480,250 Q 500,210 520,250 Q 535,320 530,420 L 470,420 Q 465,320 480,250 Z" fill="#000000"/>
            <ellipse cx="500" cy="225" rx="14" ry="20" fill="#000000"/>
            <circle cx="495" cy="222" r="2.2" fill="#ffffff" filter="url(#corrStrobe)"/>
            <circle cx="505" cy="222" r="2.2" fill="#ffffff" filter="url(#corrStrobe)"/>
          </g>
          <rect id="shadow-reticle" class="object-focus-reticle" x="460" y="200" width="80" height="230" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="8 6" opacity="0" pointer-events="none"/>
        </g>
      </svg>
    `;
  }

  // ================= 3. RESEARCH LAB SVG =================
  generateLabSVG() {
    return `
      <svg id="room-lab-svg" class="facility-room-svg" viewBox="0 0 1000 650" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="labFluid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#4aff9e" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#0a4422" stop-opacity="0.95"/>
          </linearGradient>
          <filter id="labGlow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>

        <!-- Tile Wall & Floor -->
        <rect x="0" y="0" width="1000" height="380" fill="#0d1410"/>
        <!-- Lab Tile Grid -->
        <line x1="0" y1="120" x2="1000" y2="120" stroke="#16221b" stroke-width="1.5"/>
        <line x1="0" y1="250" x2="1000" y2="250" stroke="#16221b" stroke-width="1.5"/>
        <line x1="250" y1="0" x2="250" y2="380" stroke="#16221b" stroke-width="1.5"/>
        <line x1="500" y1="0" x2="500" y2="380" stroke="#16221b" stroke-width="1.5"/>
        <line x1="750" y1="0" x2="750" y2="380" stroke="#16221b" stroke-width="1.5"/>

        <polygon points="0,380 1000,380 1000,650 0,650" fill="#080d0a"/>
        <line x1="0" y1="380" x2="1000" y2="380" stroke="#1e2d24" stroke-width="3"/>

        <!-- Bulkhead Door Indicator (Door to Corridor) -->
        <g id="bulkhead-lab-door">
          <rect x="830" y="100" width="110" height="280" fill="#101713" stroke="#25352c" stroke-width="2"/>
          <text id="bulkhead-lab-status" x="885" y="90" fill="#26ff75" font-family="'Courier New', monospace" font-size="11" font-weight="bold" text-anchor="middle">DOOR D-02: OPEN</text>
          <!-- Shutter drops if locked -->
          <rect id="bulkhead-lab-shutter" x="832" y="102" width="106" height="0" fill="#2b1a1a" stroke="#ff3344" stroke-width="2" style="transition: height 0.4s ease;"/>
        </g>

        <!-- OBJECT 1: SPECIMEN TANK (Large glass containment cylinder) -->
        <g id="interactive-specimen_tank" class="room-object-group" data-object="specimen_tank" cursor="pointer">
          <!-- Heavy steel base & top cap -->
          <rect x="140" y="120" width="110" height="22" fill="#243028" stroke="#131b16" stroke-width="2"/>
          <rect x="135" y="380" width="120" height="30" fill="#243028" stroke="#131b16" stroke-width="2"/>
          <!-- Glass tube with fluid -->
          <rect x="145" y="142" width="100" height="238" fill="url(#labFluid)" stroke="#22ff77" stroke-width="1.5" stroke-opacity="0.6"/>
          <!-- Biological suspended mass inside -->
          <ellipse cx="195" cy="260" rx="26" ry="42" fill="#06120b" opacity="0.85"/>
          <!-- Cracked glass anomaly -->
          <path id="lab-tank-cracks" d="M 155,180 L 190,225 L 175,270 L 230,310 M 190,225 L 225,210" stroke="#ffffff" stroke-width="2.5" fill="none" opacity="0"/>
          <!-- Reticle -->
          <rect id="specimen_tank-reticle" class="object-focus-reticle" x="130" y="110" width="130" height="310" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="8 6" opacity="0" pointer-events="none"/>
        </g>

        <!-- OBJECT 2: MICROSCOPE & LAB BENCH -->
        <g id="interactive-microscope_bench" class="room-object-group" data-object="microscope_bench" cursor="pointer">
          <!-- Stainless steel bench -->
          <polygon points="320,340 760,340 800,480 300,480" fill="#222d26" stroke="#101712" stroke-width="2"/>
          <polygon points="300,480 800,480 800,560 300,560" fill="#141c17"/>
          <!-- Microscope -->
          <rect x="420" y="270" width="30" height="70" fill="#394a3e" rx="4"/>
          <ellipse cx="435" cy="270" rx="14" ry="6" fill="#1f2822"/>
          <!-- Centrifuge & Test Tube Rack -->
          <ellipse cx="640" cy="330" rx="35" ry="18" fill="#323f36" stroke="#19221b" stroke-width="1.5"/>
          <rect x="520" y="325" width="45" height="18" fill="#443c20" rx="2"/>
          <!-- Beam Anomaly -->
          <line id="lab-microscope-beam-line" x1="435" y1="265" x2="435" y2="40" stroke="#77aaff" stroke-width="6" opacity="0" filter="url(#labGlow)"/>
          <!-- Reticle -->
          <polygon id="microscope_bench-reticle" class="object-focus-reticle" points="290,260 810,260 810,570 290,570" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="8 6" opacity="0" pointer-events="none"/>
        </g>

        <!-- OBJECT 3: WHITEBOARD (Formulas & Charts) -->
        <g id="interactive-whiteboard" class="room-object-group" data-object="whiteboard" cursor="pointer">
          <rect x="360" y="60" width="320" height="150" fill="#1a251e" stroke="#334d3c" stroke-width="3" rx="3"/>
          <text x="380" y="90" font-family="'Courier New', monospace" font-size="12" fill="#75a585">SPECIMEN-07: COGNITIVE ENTANGLEMENT</text>
          <line x1="380" y1="100" x2="650" y2="100" stroke="#2b3f32" stroke-width="1.5"/>
          <text x="380" y="125" font-family="'Courier New', monospace" font-size="11" fill="#587f65">dV/dt = -λ * [OBSERVATION_FLUX]</text>
          <!-- Bleeding Writing Anomaly -->
          <g id="lab-whiteboard-blood-text" opacity="0">
            <text x="390" y="160" font-family="'Courier New', monospace" font-size="24" font-weight="bold" fill="#ff2222" filter="url(#labGlow)">WE CANNOT CONTAIN IT</text>
            <path d="M 400,165 Q 402,190 401,210" stroke="#ff2222" stroke-width="2"/>
          </g>
          <!-- Reticle -->
          <rect id="whiteboard-reticle" class="object-focus-reticle" x="350" y="50" width="340" height="170" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="8 6" opacity="0" pointer-events="none"/>
        </g>

        <!-- OBJECT 4: BIO-LOCKER (Freezer Cabinet) -->
        <g id="interactive-bio_locker" class="room-object-group" data-object="bio_locker" cursor="pointer">
          <rect x="40" y="140" width="75" height="240" fill="#1b251f" stroke="#0e1410" stroke-width="2"/>
          <rect x="48" y="155" width="58" height="95" fill="#24322a" stroke="#141c17" stroke-width="1.5"/>
          <rect x="48" y="265" width="58" height="95" fill="#24322a" stroke="#141c17" stroke-width="1.5"/>
          <circle cx="95" cy="205" r="4" fill="#a48d3b"/>
          <circle cx="95" cy="315" r="4" fill="#a48d3b"/>
          <!-- Sub-zero smoke leak anomaly -->
          <g id="lab-locker-smoke-plume" opacity="0">
            <ellipse cx="80" cy="270" rx="55" ry="35" fill="#75ffaa" opacity="0.3" filter="url(#labGlow)"/>
          </g>
          <!-- Reticle -->
          <rect id="bio_locker-reticle" class="object-focus-reticle" x="30" y="130" width="95" height="260" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="8 6" opacity="0" pointer-events="none"/>
        </g>

        <!-- OBJECT 5: LAB STOOL -->
        <g id="interactive-lab_stool" class="room-object-group" data-object="lab_stool" cursor="pointer">
          <g id="lab-stool-group" transform="translate(0, 0)">
            <ellipse cx="560" cy="480" rx="22" ry="10" fill="#394c3f" stroke="#1d2720" stroke-width="2"/>
            <line x1="560" y1="480" x2="560" y2="550" stroke="#1b241e" stroke-width="5"/>
            <line x1="560" y1="550" x2="540" y2="585" stroke="#1b241e" stroke-width="4"/>
            <line x1="560" y1="550" x2="580" y2="585" stroke="#1b241e" stroke-width="4"/>
          </g>
          <!-- Reticle -->
          <rect id="lab_stool-reticle" class="object-focus-reticle" x="530" y="465" width="60" height="130" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="6 4" opacity="0" pointer-events="none"/>
        </g>

        <!-- OBJECT 6: SHADOW / ENTITY -->
        <g id="interactive-shadow" class="room-object-group" data-object="shadow" cursor="pointer">
          <g id="lab-shadow-entity" opacity="0">
            <!-- Shadow crouching behind whiteboard -->
            <path d="M 680,80 Q 720,80 720,130 Q 735,210 710,240 L 670,220 Z" fill="#000000"/>
            <circle cx="700" cy="110" r="16" fill="#000000"/>
            <circle cx="694" cy="108" r="2.5" fill="#ff3333" filter="url(#labGlow)"/>
            <circle cx="706" cy="108" r="2.5" fill="#ff3333" filter="url(#labGlow)"/>
          </g>
          <rect id="shadow-reticle" class="object-focus-reticle" x="660" y="70" width="80" height="180" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="8 6" opacity="0" pointer-events="none"/>
        </g>
      </svg>
    `;
  }

  // ================= 4. ISOLATION ROOM SVG (Original High-Detail Room) =================
  generateIsolationSVG() {
    return `
      <svg id="room-isolation-svg" class="facility-room-svg" viewBox="0 0 1000 650" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="wallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#151b18" /><stop offset="60%" stop-color="#101512" /><stop offset="100%" stop-color="#090d0b" />
          </linearGradient>
          <linearGradient id="wallBaseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#1d2621" /><stop offset="100%" stop-color="#0a0e0c" />
          </linearGradient>
          <linearGradient id="floorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0f1412" /><stop offset="40%" stop-color="#171f1b" /><stop offset="100%" stop-color="#0d1210" />
          </linearGradient>
          <radialGradient id="lampConeGrad" cx="45%" cy="10%" r="90%" fx="45%" fy="10%">
            <stop offset="0%" stop-color="#9fffcb" stop-opacity="0.38" /><stop offset="40%" stop-color="#4aff9e" stop-opacity="0.18" /><stop offset="75%" stop-color="#165935" stop-opacity="0.06" /><stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </radialGradient>
          <radialGradient id="redConeGrad" cx="45%" cy="10%" r="90%" fx="45%" fy="10%">
            <stop offset="0%" stop-color="#ff3333" stop-opacity="0.55" /><stop offset="45%" stop-color="#b30000" stop-opacity="0.25" /><stop offset="80%" stop-color="#4d0000" stop-opacity="0.08" /><stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </radialGradient>
          <radialGradient id="cornerShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0" /><stop offset="70%" stop-color="#000000" stop-opacity="0.6" /><stop offset="100%" stop-color="#000000" stop-opacity="0.95" />
          </radialGradient>
          <filter id="creepyGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <!-- Back Wall -->
        <rect id="back-wall" x="0" y="0" width="1000" height="420" fill="url(#wallGrad)" />
        <line x1="280" y1="0" x2="280" y2="420" stroke="#0b100d" stroke-width="2" stroke-opacity="0.7" />
        <line x1="620" y1="0" x2="620" y2="420" stroke="#0b100d" stroke-width="2" stroke-opacity="0.7" />
        <line x1="860" y1="0" x2="860" y2="420" stroke="#0b100d" stroke-width="2" stroke-opacity="0.7" />
        <rect x="0" y="414" width="1000" height="18" fill="url(#wallBaseGrad)" stroke="#090d0b" stroke-width="1" />
        <line x1="0" y1="414" x2="1000" y2="414" stroke="#25352c" stroke-width="1.5" />

        <!-- Floor with perspective planks -->
        <polygon points="0,420 1000,420 1000,650 0,650" fill="url(#floorGrad)" />
        <line x1="120" y1="420" x2="-20" y2="650" stroke="#0b110e" stroke-width="2" opacity="0.8" />
        <line x1="280" y1="420" x2="180" y2="650" stroke="#0b110e" stroke-width="2" opacity="0.8" />
        <line x1="440" y1="420" x2="390" y2="650" stroke="#0b110e" stroke-width="2" opacity="0.8" />
        <line x1="600" y1="420" x2="610" y2="650" stroke="#0b110e" stroke-width="2" opacity="0.8" />
        <line x1="760" y1="420" x2="830" y2="650" stroke="#0b110e" stroke-width="2" opacity="0.8" />

        <!-- Bulkhead Door Status Header -->
        <text id="bulkhead-iso-status" x="120" y="80" fill="#26ff75" font-family="'Courier New', monospace" font-size="11" font-weight="bold" text-anchor="middle">DOOR D-03: OPEN</text>

        <!-- THE DOOR -->
        <g id="interactive-door" class="room-object-group" data-object="door" cursor="pointer">
          <polygon points="50,90 200,90 200,430 50,430" fill="#050806" />
          <rect id="door-void" x="60" y="100" width="130" height="326" fill="#020302" />
          <!-- Eyes inside door -->
          <g id="door-eyes" class="room-anomaly-element" opacity="0">
            <ellipse cx="95" cy="220" rx="6" ry="3" fill="#e6ff99" filter="url(#creepyGlow)" /><circle cx="95" cy="220" r="1.8" fill="#111" />
            <ellipse cx="118" cy="220" rx="6" ry="3" fill="#e6ff99" filter="url(#creepyGlow)" /><circle cx="118" cy="220" r="1.8" fill="#111" />
          </g>
          <!-- Door Leaf -->
          <g id="door-leaf" style="transform-origin: 60px 100px; transition: transform 0.4s ease;">
            <rect x="60" y="100" width="130" height="326" fill="#1c2520" stroke="#0e1411" stroke-width="3" />
            <rect x="74" y="118" width="102" height="120" fill="#151d19" stroke="#25322b" stroke-width="2" />
            <rect x="74" y="260" width="102" height="145" fill="#151d19" stroke="#25322b" stroke-width="2" />
            <circle cx="78" cy="251" r="4.5" fill="#7a6e3d" />
          </g>
          <!-- Shutter drops if locked -->
          <rect id="bulkhead-iso-shutter" x="52" y="92" width="146" height="0" fill="#2b1a1a" stroke="#ff3344" stroke-width="2" style="transition: height 0.4s ease;"/>
          <rect id="door-reticle" class="object-focus-reticle" x="48" y="88" width="154" height="344" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="8 6" opacity="0" pointer-events="none" />
        </g>

        <!-- THE PAINTING -->
        <g id="interactive-painting" class="room-object-group" data-object="painting" cursor="pointer">
          <rect id="painting-wall-fade" x="390" y="110" width="140" height="180" fill="#0b0e0c" stroke="#141a16" stroke-width="1.5" opacity="0" />
          <g id="painting-assembly" style="transform-origin: 460px 110px; transition: transform 0.4s ease;">
            <rect x="390" y="110" width="140" height="180" fill="#3b321a" stroke="#17130a" stroke-width="3" rx="2" />
            <rect x="398" y="118" width="124" height="164" fill="#231d0f" stroke="#544725" stroke-width="2" />
            <rect x="404" y="124" width="112" height="152" fill="#141712" />
            <g id="painting-art-normal">
              <ellipse cx="460" cy="185" rx="19" ry="24" fill="#3f4a41" />
              <path d="M 438,180 Q 460,152 482,180 Q 482,165 460,162 Q 438,165 438,180 Z" fill="#101411" />
              <ellipse cx="453" cy="182" rx="3.5" ry="2" fill="#1a201b" />
              <ellipse cx="467" cy="182" rx="3.5" ry="2" fill="#1a201b" />
            </g>
            <g id="painting-art-altered" class="room-anomaly-element" opacity="0">
              <ellipse cx="460" cy="185" rx="22" ry="28" fill="#1a0909" />
              <ellipse cx="451" cy="178" rx="5" ry="3.5" fill="#ff1f1f" filter="url(#creepyGlow)" />
              <ellipse cx="469" cy="178" rx="5" ry="3.5" fill="#ff1f1f" filter="url(#creepyGlow)" />
              <ellipse cx="460" cy="208" rx="8" ry="16" fill="#000000" stroke="#ff2222" stroke-width="1.2" />
            </g>
            <g id="painting-tears" class="room-anomaly-element" opacity="0">
              <path d="M 453,184 Q 452,215 454,250 T 453,276" stroke="#050705" stroke-width="2.5" fill="none" />
              <path d="M 467,184 Q 468,210 466,245 T 468,276" stroke="#050705" stroke-width="2.5" fill="none" />
            </g>
          </g>
          <rect id="painting-reticle" class="object-focus-reticle" x="382" y="102" width="156" height="196" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="8 6" opacity="0" pointer-events="none"/>
        </g>

        <!-- THE DESK -->
        <g id="interactive-desk" class="room-object-group" data-object="desk" cursor="pointer" style="transition: transform 0.5s ease;">
          <rect x="618" y="380" width="300" height="90" fill="#1a231d" stroke="#0b0f0c" stroke-width="2" />
          <rect x="780" y="385" width="134" height="120" fill="#202b24" stroke="#0e1410" stroke-width="2" />
          <g id="desk-drawer-1"><rect x="788" y="392" width="118" height="32" fill="#27342c" stroke="#161f1a" stroke-width="1.5" /></g>
          <g id="desk-drawer-2"><rect x="788" y="428" width="118" height="34" fill="#27342c" stroke="#161f1a" stroke-width="1.5" /></g>
          <g id="desk-drawer-3"><rect x="788" y="466" width="118" height="34" fill="#27342c" stroke="#161f1a" stroke-width="1.5" /></g>
          <polygon points="590,380 890,380 940,418 640,418" fill="#303f35" stroke="#171f1a" stroke-width="2" />
          <rect x="635" y="418" width="16" height="115" fill="#222c25" />
          <g id="desk-ooze" class="room-anomaly-element" opacity="0">
            <path d="M 680,418 C 680,440 676,460 678,485 C 679,492 683,492 683,485 C 682,450 686,430 686,418 Z" fill="#040605" filter="url(#creepyGlow)" />
          </g>
          <polygon id="desk-reticle" class="object-focus-reticle" points="580,375 948,375 955,540 555,540" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="8 6" opacity="0" pointer-events="none" />
        </g>

        <!-- THE LAMP -->
        <g id="interactive-lamp" class="room-object-group" data-object="lamp" cursor="pointer">
          <polygon id="lamp-light-cone" points="705,335 480,650 990,650 820,380" fill="url(#lampConeGrad)" pointer-events="none" />
          <polygon id="lamp-red-cone" class="room-anomaly-element" points="705,335 480,650 990,650 820,380" fill="url(#redConeGrad)" opacity="0" pointer-events="none" />
          <g id="lamp-assembly" style="transform-origin: 710px 395px; transition: transform 0.4s ease;">
            <ellipse cx="710" cy="393" rx="13" ry="5" fill="#2c3a31" />
            <path id="lamp-stem" d="M 710,393 C 710,355 745,340 718,328" stroke="#3d4f43" stroke-width="5" fill="none" stroke-linecap="round" />
            <g id="lamp-head"><ellipse id="lamp-bulb" cx="708" cy="341" rx="12" ry="5.5" fill="#f7fff4" filter="url(#creepyGlow)" /></g>
          </g>
          <rect id="lamp-reticle" class="object-focus-reticle" x="680" y="305" width="65" height="100" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="6 4" opacity="0" pointer-events="none" />
        </g>

        <!-- THE CHAIR -->
        <g id="interactive-chair" class="room-object-group" data-object="chair" cursor="pointer" style="transform-origin: 510px 530px; transition: transform 0.5s ease;">
          <ellipse id="chair-floor-shadow" cx="510" cy="545" rx="58" ry="20" fill="#040605" opacity="0.8" />
          <g id="chair-assembly">
            <line x1="472" y1="480" x2="462" y2="550" stroke="#1e2721" stroke-width="4.5" />
            <line x1="548" y1="480" x2="560" y2="550" stroke="#1e2721" stroke-width="4.5" />
            <polygon points="465,465 555,465 565,488 455,488" fill="#2d3a31" />
            <path d="M 470,465 L 472,365 Q 510,355 548,365 L 550,465" stroke="#25322a" stroke-width="5" fill="none" />
            <!-- Ghost sitting on chair -->
            <g id="chair-ghost" class="room-anomaly-element" opacity="0">
              <ellipse cx="510" cy="385" rx="28" ry="32" fill="#030504" opacity="0.95" />
              <circle cx="510" cy="342" r="16" fill="#000000" />
              <circle cx="505" cy="341" r="2.2" fill="#ffffff" filter="url(#creepyGlow)" />
              <circle cx="515" cy="341" r="2.2" fill="#ffffff" filter="url(#creepyGlow)" />
            </g>
          </g>
          <rect id="chair-reticle" class="object-focus-reticle" x="445" y="350" width="130" height="210" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="8 6" opacity="0" pointer-events="none" />
        </g>

        <!-- SHADOW / ENTITY -->
        <g id="interactive-shadow" class="room-object-group" data-object="shadow" cursor="pointer">
          <g id="shadow-corner" class="room-anomaly-element" opacity="0">
            <path d="M 945,80 Q 942,60 955,60 Q 968,60 965,80 Q 985,160 980,320 L 995,430 L 925,430 L 935,320 Z" fill="#000000" opacity="0.96" />
            <circle cx="950" cy="78" r="1.8" fill="#e8ffeb" filter="url(#creepyGlow)" />
            <circle cx="960" cy="78" r="1.8" fill="#e8ffeb" filter="url(#creepyGlow)" />
          </g>
          <rect id="shadow-reticle" class="object-focus-reticle" x="910" y="50" width="85" height="390" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="8 6" opacity="0" pointer-events="none" />
        </g>
      </svg>
    `;
  }

  // ================= 5. STORAGE ARCHIVE SVG =================
  generateStorageSVG() {
    return `
      <svg id="room-storage-svg" class="facility-room-svg" viewBox="0 0 1000 650" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="stoWall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#121713"/><stop offset="100%" stop-color="#080b09"/>
          </linearGradient>
          <filter id="stoGlow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>

        <rect x="0" y="0" width="1000" height="400" fill="url(#stoWall)"/>
        <polygon points="0,400 1000,400 1000,650 0,650" fill="#080c09"/>

        <!-- Bulkhead Door Indicator (Door to Corridor) -->
        <g id="bulkhead-sto-door">
          <rect x="50" y="110" width="110" height="290" fill="#101713" stroke="#25352c" stroke-width="2"/>
          <text id="bulkhead-sto-status" x="105" y="95" fill="#26ff75" font-family="'Courier New', monospace" font-size="11" font-weight="bold" text-anchor="middle">DOOR D-04: OPEN</text>
          <rect id="bulkhead-sto-shutter" x="52" y="112" width="106" height="0" fill="#2b1a1a" stroke="#ff3344" stroke-width="2" style="transition: height 0.4s ease;"/>
        </g>

        <!-- OBJECT 1: TALL METAL SHELVING -->
        <g id="interactive-metal_shelves" class="room-object-group" data-object="metal_shelves" cursor="pointer">
          <g id="sto-shelves-assembly" style="transform-origin: 300px 420px; transition: transform 0.4s ease;">
            <!-- Shelving Frame -->
            <rect x="220" y="80" width="180" height="340" fill="#141c16" stroke="#2d3f33" stroke-width="3"/>
            <line x1="220" y1="160" x2="400" y2="160" stroke="#2d3f33" stroke-width="2"/>
            <line x1="220" y1="240" x2="400" y2="240" stroke="#2d3f33" stroke-width="2"/>
            <line x1="220" y1="320" x2="400" y2="320" stroke="#2d3f33" stroke-width="2"/>
            <!-- Cardboard archive boxes on shelves -->
            <rect x="235" y="105" width="45" height="50" fill="#4d422a"/>
            <rect x="290" y="115" width="42" height="40" fill="#5c4e30"/>
            <rect x="345" y="110" width="45" height="45" fill="#4d422a"/>
            <rect x="240" y="190" width="50" height="45" fill="#5c4e30"/>
            <rect x="300" y="185" width="45" height="50" fill="#4d422a"/>
          </g>
          <!-- Reticle -->
          <rect id="metal_shelves-reticle" class="object-focus-reticle" x="210" y="70" width="200" height="360" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="8 6" opacity="0" pointer-events="none"/>
        </g>

        <!-- OBJECT 2: WOODEN CRATES -->
        <g id="interactive-wooden_crates" class="room-object-group" data-object="wooden_crates" cursor="pointer">
          <g id="sto-crates-group">
            <rect x="680" y="320" width="120" height="100" fill="#423420" stroke="#221a0f" stroke-width="2"/>
            <line x1="680" y1="320" x2="800" y2="420" stroke="#221a0f" stroke-width="2"/>
            <line x1="800" y1="320" x2="680" y2="420" stroke="#221a0f" stroke-width="2"/>
            <!-- Stacked upper crate -->
            <rect x="710" y="230" width="90" height="90" fill="#4d3e27" stroke="#221a0f" stroke-width="2"/>
            <!-- Splintered gouge anomaly -->
            <path id="sto-crate-splinter" d="M 730,240 L 760,290 L 735,310 L 780,270" stroke="#000000" stroke-width="4" fill="none" opacity="0"/>
          </g>
          <!-- Reticle -->
          <rect id="wooden_crates-reticle" class="object-focus-reticle" x="670" y="220" width="140" height="210" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="8 6" opacity="0" pointer-events="none"/>
        </g>

        <!-- OBJECT 3: HANGING HAZMAT SUITS -->
        <g id="interactive-hazard_suits" class="room-object-group" data-object="hazard_suits" cursor="pointer">
          <g id="sto-suits-assembly" style="transform-origin: 520px 100px; transition: transform 0.4s ease;">
            <!-- Hook -->
            <line x1="520" y1="80" x2="520" y2="120" stroke="#334d3c" stroke-width="3"/>
            <!-- Suit Hood / Visor -->
            <ellipse cx="520" cy="140" rx="16" ry="20" fill="#697a2e" stroke="#2b3312" stroke-width="2"/>
            <rect cx="512" y="132" width="16" height="12" rx="3" fill="#1b291e" stroke="#889e3b" stroke-width="1"/>
            <!-- Suit Torso & Hanging Limbs -->
            <path d="M 495,160 Q 520,150 545,160 L 550,290 L 490,290 Z" fill="#697a2e" stroke="#2b3312" stroke-width="2"/>
            <line x1="495" y1="170" x2="480" y2="260" stroke="#5a6927" stroke-width="9" stroke-linecap="round"/>
            <line x1="545" y1="170" x2="560" y2="260" stroke="#5a6927" stroke-width="9" stroke-linecap="round"/>
          </g>
          <!-- Reticle -->
          <rect id="hazard_suits-reticle" class="object-focus-reticle" x="470" y="75" width="105" height="230" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="6 4" opacity="0" pointer-events="none"/>
        </g>

        <!-- OBJECT 4: SWINGING CEILING BULB -->
        <g id="interactive-ceiling_bulb" class="room-object-group" data-object="ceiling_bulb" cursor="pointer">
          <g id="sto-bulb-pendulum" style="transform-origin: 500px 0px;">
            <line x1="500" y1="0" x2="500" y2="70" stroke="#000000" stroke-width="2"/>
            <circle cx="500" cy="76" r="9" fill="#ffffbb" filter="url(#stoGlow)"/>
          </g>
          <!-- Reticle -->
          <rect id="ceiling_bulb-reticle" class="object-focus-reticle" x="480" y="50" width="40" height="50" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="6 4" opacity="0" pointer-events="none"/>
        </g>

        <!-- OBJECT 5: ARCHIVE FILE BOXES -->
        <g id="interactive-archive_boxes" class="room-object-group" data-object="archive_boxes" cursor="pointer">
          <g id="sto-boxes-spilled">
            <rect x="420" y="440" width="55" height="35" fill="#544830" rx="2" stroke="#251f14" stroke-width="1.5"/>
            <rect x="470" y="450" width="50" height="32" fill="#69593a" rx="2" stroke="#251f14" stroke-width="1.5"/>
            <!-- Papers scattered anomaly -->
            <polygon id="sto-scattered-papers" points="400,470 435,465 440,490 405,495" fill="#cfc7b4" opacity="0"/>
          </g>
          <!-- Reticle -->
          <rect id="archive_boxes-reticle" class="object-focus-reticle" x="395" y="430" width="135" height="70" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="6 4" opacity="0" pointer-events="none"/>
        </g>

        <!-- OBJECT 6: SHADOW / ENTITY -->
        <g id="interactive-shadow" class="room-object-group" data-object="shadow" cursor="pointer">
          <g id="sto-shadow-figure" opacity="0">
            <!-- Tall shadow between shelving racks -->
            <path d="M 430,160 Q 450,140 470,160 Q 480,240 475,390 L 425,390 Z" fill="#000000"/>
            <ellipse cx="450" cy="155" rx="14" ry="18" fill="#000000"/>
            <circle cx="445" cy="153" r="2.2" fill="#aaffcc" filter="url(#stoGlow)"/>
            <circle cx="455" cy="153" r="2.2" fill="#aaffcc" filter="url(#stoGlow)"/>
          </g>
          <rect id="shadow-reticle" class="object-focus-reticle" x="415" y="130" width="75" height="270" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="8 6" opacity="0" pointer-events="none"/>
        </g>
      </svg>
    `;
  }

  // ================= 6. SUB-BASEMENT & BREAKER VAULT SVG =================
  generateBasementSVG() {
    return `
      <svg id="room-basement-svg" class="facility-room-svg" viewBox="0 0 1000 650" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="baseWall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0e1310"/><stop offset="100%" stop-color="#050806"/>
          </linearGradient>
          <filter id="baseSpark"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>

        <rect x="0" y="0" width="1000" height="420" fill="url(#baseWall)"/>
        <polygon points="0,420 1000,420 1000,650 0,650" fill="#070a08"/>

        <!-- Bulkhead Door Indicator (Door to Corridor/Stairs) -->
        <g id="bulkhead-bas-door">
          <rect x="80" y="90" width="130" height="330" fill="#121814" stroke="#2b3b30" stroke-width="3"/>
          <text id="bulkhead-bas-status" x="145" y="75" fill="#26ff75" font-family="'Courier New', monospace" font-size="11" font-weight="bold" text-anchor="middle">DOOR D-05: OPEN</text>
          <rect id="bulkhead-bas-shutter" x="82" y="92" width="126" height="0" fill="#2b1a1a" stroke="#ff3344" stroke-width="3" style="transition: height 0.4s ease;"/>
        </g>

        <!-- OBJECT 1: PRIMARY DIESEL GENERATOR -->
        <g id="interactive-generator" class="room-object-group" data-object="generator" cursor="pointer">
          <!-- Heavy generator casing -->
          <rect x="360" y="260" width="280" height="190" fill="#18231c" stroke="#0a0f0c" stroke-width="3"/>
          <rect x="380" y="280" width="240" height="70" fill="#25352b" stroke="#121a15" stroke-width="2"/>
          <!-- Analog dial meters -->
          <circle cx="430" cy="315" r="18" fill="#0d1410" stroke="#3d5244" stroke-width="2"/>
          <circle cx="490" cy="315" r="18" fill="#0d1410" stroke="#3d5244" stroke-width="2"/>
          <circle cx="550" cy="315" r="18" fill="#0d1410" stroke="#3d5244" stroke-width="2"/>
          <!-- Electrical sparks anomaly -->
          <path id="bas-gen-sparks" d="M 370,250 L 390,230 L 410,260 L 430,220 L 450,250" stroke="#77ffff" stroke-width="3" fill="none" opacity="0" filter="url(#baseSpark)"/>
          <!-- Reticle -->
          <rect id="generator-reticle" class="object-focus-reticle" x="350" y="250" width="300" height="210" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="8 6" opacity="0" pointer-events="none"/>
        </g>

        <!-- OBJECT 2: STEAM PIPES & PRESSURE CONDUITS -->
        <g id="interactive-steam_pipes" class="room-object-group" data-object="steam_pipes" cursor="pointer">
          <!-- Overhead rusty pipes -->
          <rect x="0" y="40" width="1000" height="24" fill="#293b30" stroke="#101813" stroke-width="2"/>
          <rect x="0" y="70" width="1000" height="18" fill="#364d3f" stroke="#101813" stroke-width="2"/>
          <!-- Vertical pipe run -->
          <rect x="720" y="40" width="22" height="380" fill="#293b30" stroke="#101813" stroke-width="2"/>
          <!-- Ruptured steam plume anomaly -->
          <ellipse id="bas-pipe-steam" cx="620" cy="80" rx="70" ry="35" fill="#a4ffc8" opacity="0" filter="url(#baseSpark)"/>
          <!-- Reticle -->
          <rect id="steam_pipes-reticle" class="object-focus-reticle" x="520" y="30" width="220" height="100" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="6 4" opacity="0" pointer-events="none"/>
        </g>

        <!-- OBJECT 3: FLOOR DRAINAGE GRATE -->
        <g id="interactive-drain_grate" class="room-object-group" data-object="drain_grate" cursor="pointer">
          <ellipse cx="500" cy="540" rx="70" ry="25" fill="#040605" stroke="#1a251e" stroke-width="3"/>
          <line x1="450" y1="540" x2="550" y2="540" stroke="#293a2f" stroke-width="2"/>
          <line x1="465" y1="530" x2="535" y2="530" stroke="#293a2f" stroke-width="2"/>
          <line x1="465" y1="550" x2="535" y2="550" stroke="#293a2f" stroke-width="2"/>
          <!-- Black tendrils rising anomaly -->
          <path id="bas-drain-tendrils-path" d="M 480,540 Q 470,470 485,420 M 510,540 Q 530,460 520,400" stroke="#000000" stroke-width="5" fill="none" stroke-linecap="round" opacity="0"/>
          <!-- Reticle -->
          <rect id="drain_grate-reticle" class="object-focus-reticle" x="420" y="510" width="160" height="60" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="6 4" opacity="0" pointer-events="none"/>
        </g>

        <!-- OBJECT 4: WALL FUSE BOX -->
        <g id="interactive-fuse_box" class="room-object-group" data-object="fuse_box" cursor="pointer">
          <rect x="250" y="160" width="60" height="90" fill="#202c24" stroke="#111713" stroke-width="2"/>
          <!-- Door (open/closed) -->
          <rect id="bas-fuse-door" x="254" y="166" width="52" height="78" fill="#304236"/>
          <!-- Reticle -->
          <rect id="fuse_box-reticle" class="object-focus-reticle" x="240" y="150" width="80" height="110" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="6 4" opacity="0" pointer-events="none"/>
        </g>

        <!-- OBJECT 5: CHEMICAL OIL BARRELS -->
        <g id="interactive-metal_drum" class="room-object-group" data-object="metal_drum" cursor="pointer">
          <g id="bas-drums-group">
            <rect x="800" y="320" width="55" height="100" fill="#222f27" rx="6" stroke="#0f1511" stroke-width="2"/>
            <rect x="870" y="330" width="55" height="90" fill="#2a3a30" rx="6" stroke="#0f1511" stroke-width="2"/>
            <!-- Puddle anomaly -->
            <ellipse id="bas-drum-puddle" cx="830" cy="430" rx="40" ry="12" fill="#000000" opacity="0"/>
          </g>
          <!-- Reticle -->
          <rect id="metal_drum-reticle" class="object-focus-reticle" x="790" y="310" width="145" height="130" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="6 4" opacity="0" pointer-events="none"/>
        </g>

        <!-- OBJECT 6: SHADOW / ENTITY -->
        <g id="interactive-shadow" class="room-object-group" data-object="shadow" cursor="pointer">
          <g id="bas-shadow-boiler" opacity="0">
            <!-- Terrifying mass perched atop the generator -->
            <path d="M 450,180 Q 500,140 550,180 Q 570,240 550,260 L 450,260 Z" fill="#000000"/>
            <circle cx="500" cy="165" r="18" fill="#000000"/>
            <circle cx="492" cy="163" r="2.5" fill="#ff2222" filter="url(#baseSpark)"/>
            <circle cx="508" cy="163" r="2.5" fill="#ff2222" filter="url(#baseSpark)"/>
          </g>
          <rect id="shadow-reticle" class="object-focus-reticle" x="430" y="140" width="140" height="130" fill="none" stroke="#26ff75" stroke-width="1.5" stroke-dasharray="8 6" opacity="0" pointer-events="none"/>
        </g>
      </svg>
    `;
  }

  // ================= CAMERA OFFLINE STATIC SNOW =================
  generateOfflineSVG() {
    return `
      <svg id="room-offline-svg" viewBox="0 0 1000 650" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
        <rect width="1000" height="650" fill="#050907"/>
        <g transform="translate(500, 310)">
          <rect x="-240" y="-70" width="480" height="140" fill="#0c1810" stroke="#ff3344" stroke-width="2" rx="6"/>
          <text x="0" y="-20" fill="#ff3344" font-family="'Courier New', monospace" font-size="20" font-weight="bold" text-anchor="middle" letter-spacing="3">SIGNAL LOST // NO CARRIER</text>
          <text x="0" y="12" fill="#669977" font-family="'Courier New', monospace" font-size="12" text-anchor="middle">OPTICAL MATRIX DE-SYNCHRONIZED</text>
          <text x="0" y="42" fill="#26ff75" font-family="'Courier New', monospace" font-size="13" font-weight="bold" text-anchor="middle">[CLICK "REBOOT CAMERA" TO RESTORE]</text>
        </g>
      </svg>
    `;
  }

  // ================= ANOMALIES & VISUAL APPLICATION =================
  applyActiveRoomAnomalies() {
    this.activeRoomAnomalies.forEach((anomaly) => {
      if (anomaly.roomId === this.currentRoomId) {
        this.renderAnomalyElement(anomaly, true);
      }
    });
  }

  applyAnomaly(anomaly) {
    this.activeRoomAnomalies.set(anomaly.id, anomaly);
    if (anomaly.roomId === this.currentRoomId) {
      this.renderAnomalyElement(anomaly, true);
    }
  }

  resolveAnomaly(anomaly) {
    this.activeRoomAnomalies.delete(anomaly.id);
    if (anomaly.roomId === this.currentRoomId) {
      this.renderAnomalyElement(anomaly, false);
    }
  }

  resetAll() {
    this.activeRoomAnomalies.clear();
    this.offlineCameras.clear();
    this.render();
  }

  renderAnomalyElement(anomaly, isActive) {
    const id = anomaly.id;
    const op = isActive ? '1' : '0';

    // 1. RECEPTION ANOMALIES
    if (id === 'rec_phone_off_hook') {
      const el = this.elements['rec-phone-handset'];
      if (el) el.setAttribute('transform', isActive ? 'translate(-8, -14) rotate(-22)' : 'translate(0, 0)');
    } else if (id === 'rec_counter_ooze') {
      const el = this.elements['rec-ooze-handprint'];
      if (el) el.style.opacity = op;
    } else if (id === 'rec_chairs_toppled') {
      const el = this.elements['guest-chairs-group'];
      if (el) el.setAttribute('transform', isActive ? 'translate(20, 20) rotate(75 280 430)' : 'translate(0, 0)');
    } else if (id === 'rec_clock_inverted') {
      const el = this.elements['rec-clock-hands'];
      if (el) el.style.animation = isActive ? 'lampSparks 0.2s infinite' : '';
    } else if (id === 'rec_board_scrawl') {
      const el = this.elements['rec-board-scrawl-text'];
      if (el) el.style.opacity = op;
    } else if (id === 'rec_shadow_counter') {
      const el = this.elements['rec-shadow-entity'];
      if (el) el.style.opacity = op;
    }

    // 2. CORRIDOR ANOMALIES
    else if (id === 'corr_door_ajar') {
      const el = this.elements['corr-left-door-gap'];
      if (el) el.style.opacity = op;
    } else if (id === 'corr_cooler_bubbling') {
      const el = this.elements['corr-cooler-black-fluid'];
      if (el) el.style.opacity = op;
    } else if (id === 'corr_hazard_strobe') {
      const el = this.elements['corr-hazard-strobe-halo'];
      if (el) el.style.opacity = op;
    } else if (id === 'corr_vent_arm') {
      const el = this.elements['corr-vent-tendril'];
      if (el) el.style.opacity = op;
    } else if (id === 'corr_extinguisher_missing') {
      const el = this.elements['corr-extinguisher-canister'];
      if (el) el.style.opacity = isActive ? '0' : '1';
    } else if (id === 'corr_shadow_stalker') {
      const el = this.elements['corr-shadow-figure'];
      if (el) el.style.opacity = op;
    }

    // 3. LAB ANOMALIES
    else if (id === 'lab_tank_cracked') {
      const el = this.elements['lab-tank-cracks'];
      if (el) el.style.opacity = op;
    } else if (id === 'lab_microscope_beam') {
      const el = this.elements['lab-microscope-beam-line'];
      if (el) el.style.opacity = op;
    } else if (id === 'lab_whiteboard_blood') {
      const el = this.elements['lab-whiteboard-blood-text'];
      if (el) el.style.opacity = op;
    } else if (id === 'lab_locker_smoke') {
      const el = this.elements['lab-locker-smoke-plume'];
      if (el) el.style.opacity = op;
    } else if (id === 'lab_stool_moved') {
      const el = this.elements['lab-stool-group'];
      if (el) el.setAttribute('transform', isActive ? 'translate(-120, -30)' : 'translate(0, 0)');
    } else if (id === 'lab_shadow_specimen') {
      const el = this.elements['lab-shadow-entity'];
      if (el) el.style.opacity = op;
    }

    // 4. ISOLATION ANOMALIES (Preserved original suite)
    else if (id === 'chair_moved') {
      const el = this.elements['interactive-chair'];
      if (el) el.setAttribute('transform', isActive ? 'translate(-160, -35)' : 'translate(0, 0)');
    } else if (id === 'chair_toppled') {
      const el = this.elements['chair-assembly'];
      if (el) el.setAttribute('transform', isActive ? 'rotate(82 510 530)' : 'rotate(0 510 530)');
    } else if (id === 'chair_vanished') {
      const el = this.elements['interactive-chair'];
      if (el) el.style.opacity = isActive ? '0' : '1';
    } else if (id === 'chair_occupied') {
      const el = this.elements['chair-ghost'];
      if (el) el.style.opacity = op;
    } else if (id === 'desk_slid') {
      const el = this.elements['interactive-desk'];
      if (el) el.setAttribute('transform', isActive ? 'translate(-85, 25)' : 'translate(0, 0)');
    } else if (id === 'desk_drawers_open') {
      const el = this.elements['desk-drawer-1'];
      if (el) el.setAttribute('transform', isActive ? 'translate(-35, 12)' : 'translate(0, 0)');
    } else if (id === 'desk_ooze') {
      const el = this.elements['desk-ooze'];
      if (el) el.style.opacity = op;
    } else if (id === 'painting_tilted') {
      const el = this.elements['painting-assembly'];
      if (el) el.setAttribute('transform', isActive ? 'rotate(24 460 110)' : 'rotate(0 460 110)');
    } else if (id === 'painting_altered') {
      const el1 = this.elements['painting-art-normal'];
      const el2 = this.elements['painting-art-altered'];
      if (el1) el1.style.opacity = isActive ? '0' : '1';
      if (el2) el2.style.opacity = op;
    } else if (id === 'painting_crying') {
      const el = this.elements['painting-tears'];
      if (el) el.style.opacity = op;
    } else if (id === 'painting_vanished') {
      const el1 = this.elements['painting-assembly'];
      const el2 = this.elements['painting-wall-fade'];
      if (el1) el1.style.opacity = isActive ? '0' : '1';
      if (el2) el2.style.opacity = op;
    } else if (id === 'lamp_flickering') {
      const el = this.elements['lamp-light-cone'];
      if (el) {
        if (isActive) el.classList.add('flicker-lamp-active');
        else el.classList.remove('flicker-lamp-active');
      }
    } else if (id === 'lamp_red') {
      const el1 = this.elements['lamp-light-cone'];
      const el2 = this.elements['lamp-red-cone'];
      const el3 = this.elements['lamp-bulb'];
      if (el1) el1.style.opacity = isActive ? '0' : '1';
      if (el2) el2.style.opacity = op;
      if (el3) el3.setAttribute('fill', isActive ? '#ff2222' : '#f7fff4');
    } else if (id === 'door_ajar') {
      const el = this.elements['door-leaf'];
      if (el) el.style.transform = isActive ? 'matrix(0.55, 0, -0.25, 0.95, -15, 0)' : 'matrix(1, 0, 0, 1, 0, 0)';
    } else if (id === 'door_peeking_eyes') {
      const el1 = this.elements['door-leaf'];
      const el2 = this.elements['door-eyes'];
      if (el1) el1.style.transform = isActive ? 'matrix(0.72, 0, -0.15, 0.98, -8, 0)' : 'matrix(1, 0, 0, 1, 0, 0)';
      if (el2) el2.style.opacity = op;
    } else if (id === 'shadow_corner') {
      const el = this.elements['shadow-corner'];
      if (el) el.style.opacity = op;
    }

    // 5. STORAGE ANOMALIES
    else if (id === 'sto_shelves_collapsed') {
      const el = this.elements['sto-shelves-assembly'];
      if (el) el.setAttribute('transform', isActive ? 'rotate(-16 300 420)' : 'rotate(0 300 420)');
    } else if (id === 'sto_crates_splintered') {
      const el = this.elements['sto-crate-splinter'];
      if (el) el.style.opacity = op;
    } else if (id === 'sto_suits_floating') {
      const el = this.elements['sto-suits-assembly'];
      if (el) el.setAttribute('transform', isActive ? 'translate(0, -35) rotate(15 520 100)' : 'translate(0, 0)');
    } else if (id === 'sto_bulb_swinging') {
      const el = this.elements['sto-bulb-pendulum'];
      if (el) el.style.animation = isActive ? 'doorSlam 0.4s infinite alternate' : '';
    } else if (id === 'sto_boxes_scattered') {
      const el = this.elements['sto-scattered-papers'];
      if (el) el.style.opacity = op;
    } else if (id === 'sto_shadow_aisle') {
      const el = this.elements['sto-shadow-figure'];
      if (el) el.style.opacity = op;
    }

    // 6. BASEMENT ANOMALIES
    else if (id === 'bas_generator_sparks') {
      const el = this.elements['bas-gen-sparks'];
      if (el) el.style.opacity = op;
    } else if (id === 'bas_pipe_burst') {
      const el = this.elements['bas-pipe-steam'];
      if (el) el.style.opacity = op;
    } else if (id === 'bas_drain_tendrils') {
      const el = this.elements['bas-drain-tendrils-path'];
      if (el) el.style.opacity = op;
    } else if (id === 'bas_fusebox_blown') {
      const el = this.elements['bas-fuse-door'];
      if (el) el.setAttribute('transform', isActive ? 'rotate(95 254 166)' : 'rotate(0 254 166)');
    } else if (id === 'bas_drums_toppled') {
      const el = this.elements['bas-drum-puddle'];
      if (el) el.style.opacity = op;
    } else if (id === 'bas_shadow_boiler') {
      const el = this.elements['bas-shadow-boiler'];
      if (el) el.style.opacity = op;
    }
  }

  updateDoorBulkheadVisual() {
    const config = ROOMS_CONFIG[this.currentRoomId];
    if (!config || !config.doorId) return;

    const doorId = config.doorId;
    const door = this.doorStates[doorId];
    if (!door) return;

    const prefix = this.currentRoomId.substring(0, 3);
    const shutter = this.elements[`bulkhead-${prefix}-shutter`];
    const statusText = this.elements[`bulkhead-${prefix}-status`];

    if (door.isLocked) {
      if (shutter) shutter.setAttribute('height', '320');
      if (statusText) {
        statusText.textContent = `BULKHEAD LOCKED: [SECURED]`;
        statusText.setAttribute('fill', '#ff3344');
      }
    } else {
      if (shutter) shutter.setAttribute('height', '0');
      if (statusText) {
        statusText.textContent = `BULKHEAD: [UNLOCKED]`;
        statusText.setAttribute('fill', '#26ff75');
      }
    }
  }

  updateEntityVisuals() {
    const isEntityHere = (this.entityPresentRoom === this.currentRoomId);
    const shadowGroup = this.elements['interactive-shadow'];
    if (!shadowGroup) return;

    // Check specific shadow elements for this room
    const prefix = this.currentRoomId.substring(0, 3);
    const shadowEl = this.elements[`${prefix}-shadow-figure`] || 
                     this.elements[`${prefix}-shadow-entity`] || 
                     this.elements['shadow-corner'] ||
                     this.elements['bas-shadow-boiler'];

    if (shadowEl) {
      // If an anomaly has already activated it, keep it visible
      const hasShadowAnomaly = Array.from(this.activeRoomAnomalies.values()).some(
        a => a.roomId === this.currentRoomId && a.targetObject === 'shadow'
      );
      if (isEntityHere || hasShadowAnomaly) {
        shadowEl.style.opacity = '1';
      } else {
        shadowEl.style.opacity = '0';
      }
    }
  }

  highlightReticle(targetObject, success = true) {
    const el = this.elements[`${targetObject}-reticle`];
    if (!el) return;

    el.setAttribute('stroke', success ? '#26ff75' : '#ff3344');
    el.style.opacity = '1';
    setTimeout(() => {
      el.style.opacity = '0';
    }, 600);
  }
}

if (typeof window !== 'undefined') {
  window.RoomRenderer = RoomRenderer;
}
