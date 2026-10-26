/**
 * Don't Look Away - Facility Architecture, Room Definitions, Lore Logs, and Anomalies
 */

const ROOMS_CONFIG = {
  reception: {
    id: 'reception',
    camId: 'CAM-01',
    name: 'RECEPTION FOYER',
    subtitle: 'Sector 7 Primary Checkpoint',
    connections: ['corridor'],
    doorId: 'door_rec',
    mapCoords: { x: 190, y: 35, width: 90, height: 45 },
    objects: [
      { id: 'phone', label: 'PHONE', key: '1' },
      { id: 'counter', label: 'COUNTER', key: '2' },
      { id: 'guest_chairs', label: 'CHAIRS', key: '3' },
      { id: 'wall_clock', label: 'CLOCK', key: '4' },
      { id: 'bulletin_board', label: 'BOARD', key: '5' },
      { id: 'shadow', label: 'SHADOW / ENTITY', key: '6' }
    ]
  },
  corridor: {
    id: 'corridor',
    camId: 'CAM-02',
    name: 'MAIN CORRIDOR',
    subtitle: 'Central Arterial Junction',
    connections: ['reception', 'lab', 'isolation', 'storage', 'basement'],
    doorId: null, // hub
    mapCoords: { x: 50, y: 105, width: 370, height: 42 },
    objects: [
      { id: 'hallway_doors', label: 'WING DOORS', key: '1' },
      { id: 'water_cooler', label: 'COOLER', key: '2' },
      { id: 'hazard_light', label: 'HAZARD LIGHT', key: '3' },
      { id: 'vent_grate', label: 'CEILING VENT', key: '4' },
      { id: 'fire_extinguisher', label: 'EXTINGUISHER', key: '5' },
      { id: 'shadow', label: 'SHADOW / ENTITY', key: '6' }
    ]
  },
  lab: {
    id: 'lab',
    camId: 'CAM-03',
    name: 'RESEARCH LAB',
    subtitle: 'Bio-Containment & Specimen Unit',
    connections: ['corridor'],
    doorId: 'door_lab',
    mapCoords: { x: 30, y: 175, width: 85, height: 50 },
    objects: [
      { id: 'specimen_tank', label: 'SPECIMEN TANK', key: '1' },
      { id: 'microscope_bench', label: 'LAB BENCH', key: '2' },
      { id: 'whiteboard', label: 'WHITEBOARD', key: '3' },
      { id: 'bio_locker', label: 'BIO-LOCKER', key: '4' },
      { id: 'lab_stool', label: 'STOOL', key: '5' },
      { id: 'shadow', label: 'SHADOW / ENTITY', key: '6' }
    ]
  },
  isolation: {
    id: 'isolation',
    camId: 'CAM-04',
    name: 'ISOLATION CELL',
    subtitle: 'High-Risk Specimen Holding',
    connections: ['corridor'],
    doorId: 'door_iso',
    mapCoords: { x: 140, y: 175, width: 85, height: 50 },
    objects: [
      { id: 'chair', label: 'CHAIR', key: '1' },
      { id: 'desk', label: 'DESK', key: '2' },
      { id: 'painting', label: 'PAINTING', key: '3' },
      { id: 'lamp', label: 'LAMP', key: '4' },
      { id: 'door', label: 'DOOR', key: '5' },
      { id: 'shadow', label: 'SHADOW / ENTITY', key: '6' }
    ]
  },
  storage: {
    id: 'storage',
    camId: 'CAM-05',
    name: 'STORAGE ARCHIVE',
    subtitle: 'Materials & Hazardous Gear',
    connections: ['corridor'],
    doorId: 'door_sto',
    mapCoords: { x: 250, y: 175, width: 85, height: 50 },
    objects: [
      { id: 'metal_shelves', label: 'SHELVES', key: '1' },
      { id: 'wooden_crates', label: 'CRATES', key: '2' },
      { id: 'hazard_suits', label: 'HAZMAT SUITS', key: '3' },
      { id: 'ceiling_bulb', label: 'CEILING BULB', key: '4' },
      { id: 'archive_boxes', label: 'FILE BOXES', key: '5' },
      { id: 'shadow', label: 'SHADOW / ENTITY', key: '6' }
    ]
  },
  basement: {
    id: 'basement',
    camId: 'CAM-06',
    name: 'SUB-BASEMENT',
    subtitle: 'Primary Breakers & Steam Vault',
    connections: ['corridor'],
    doorId: 'door_bas',
    mapCoords: { x: 360, y: 175, width: 85, height: 50 },
    objects: [
      { id: 'generator', label: 'GENERATOR', key: '1' },
      { id: 'steam_pipes', label: 'STEAM PIPES', key: '2' },
      { id: 'drain_grate', label: 'DRAIN GRATE', key: '3' },
      { id: 'fuse_box', label: 'FUSE BOX', key: '4' },
      { id: 'metal_drum', label: 'DRUMS', key: '5' },
      { id: 'shadow', label: 'SHADOW / ENTITY', key: '6' }
    ]
  }
};

const FACILITY_DOORS = {
  door_rec: {
    id: 'door_rec',
    label: 'BULKHEAD D-01 (RECEPTION)',
    roomA: 'reception',
    roomB: 'corridor',
    isLocked: false
  },
  door_lab: {
    id: 'door_lab',
    label: 'BULKHEAD D-02 (LAB)',
    roomA: 'lab',
    roomB: 'corridor',
    isLocked: false
  },
  door_iso: {
    id: 'door_iso',
    label: 'BULKHEAD D-03 (ISOLATION)',
    roomA: 'isolation',
    roomB: 'corridor',
    isLocked: false
  },
  door_sto: {
    id: 'door_sto',
    label: 'BULKHEAD D-04 (STORAGE)',
    roomA: 'storage',
    roomB: 'corridor',
    isLocked: false
  },
  door_bas: {
    id: 'door_bas',
    label: 'BULKHEAD D-05 (BASEMENT)',
    roomA: 'basement',
    roomB: 'corridor',
    isLocked: false
  }
};

const FACILITY_LOGS = [
  {
    hour: 0,
    time: '12:00 AM',
    author: 'DR. H. VANCE // ARCHIVE CHIEF',
    title: 'INCIDENT LOG 84-A: CONTAINMENT MANDATE',
    text: `Subject 7 was transferred to the sub-level quarantine following the incident in Research Lab B. It exhibits acute cognitive entanglement with optical sensors. In plain terms: it cannot physically traverse space while under direct, continuous camera observation. However, prolonged stares provoke erratic electrical surges. Do not keep a single feed locked forever, but never leave connected pathways unmonitored.`
  },
  {
    hour: 1,
    time: '01:00 AM',
    author: 'GUARD MORRISON // NIGHT DESK',
    title: 'SHIFT RECORD: DISCREPANCIES',
    text: `The cameras are showing minor lag in the Corridor and Storage. I walked down to check the breaker in the basement, but I heard heavy footsteps behind the heavy bulkhead before I even reached the stairs. When I checked the monitor, the corridor was empty. It's moving through the doors faster than security protocol allows.`
  },
  {
    hour: 2,
    time: '02:00 AM',
    author: 'SYSTEM OVERRIDE NOTICE',
    title: 'SYSCON AUTO-DIAGNOSTIC 1994-10-25',
    text: `WARNING: Auxiliary power grid is operating on limited capacitor reserve. Operating electronic bulkheads draws 0.4% charge per second per lock. If total reserve drains to zero, all pneumatic interlocks will vent into emergency release mode. Keep bulkheads unlocked unless an intrusion is imminent.`
  },
  {
    hour: 3,
    time: '03:00 AM',
    author: 'AUDIO TRANSCRIPT // DR. VANCE',
    title: 'SECTOR EVACUATION RECORDING',
    text: `If you are listening to this log from the security terminal, you must understand: the morning staff did not go home on leave. We evacuated the above-ground facility 72 hours ago. You were assigned to this shift as an observer anchor. The entity requires a conscious observer on the video loop to stabilize its quantum envelope until the automated Dawn UV Purge at 06:00. Hold your station.`
  },
  {
    hour: 4,
    time: '04:00 AM',
    author: 'DATA FRAGMENT // DAMAGED FILE',
    title: 'BREACH REPORT // CABLE CORRUPTION',
    text: `...IT DOES NOT JUST WALK. IT DISPLACES SURROUNDING MATTER. OBJECTS MOVE WHEN IT BRUSHES THEM. CLOCKS INVERT. OIL LEAKS FROM DRY WALLS. IT KNOWS WHERE THE CAMERA LENSES ARE POINTED. IT WAITS FOR YOU TO SWITCH CHANNELS...`
  },
  {
    hour: 5,
    time: '05:00 AM',
    author: 'DIRECTOR E. STERLING',
    title: 'FINAL DIRECTIVE: DAWN HORIZON',
    text: `One hour remains until the 06:00 automated purge. Subject 7 will escalate its frequency. It will attempt to disable cameras and breach isolation. Maintain battery discipline. Report every structural anomaly immediately to keep the reality matrix from collapsing. Do not look away from your screens.`
  }
];

const MULTI_ROOM_ANOMALIES = [
  // ================= CAM-01: RECEPTION =================
  {
    id: 'rec_phone_off_hook',
    roomId: 'reception',
    targetObject: 'phone',
    name: 'Swinging Handset',
    description: 'The reception telephone handset has floated off the cradle.',
    minHour: 0,
    threatWeight: 1.0,
    sound: 'glitch'
  },
  {
    id: 'rec_counter_ooze',
    roomId: 'reception',
    targetObject: 'counter',
    name: 'Counter Handprint',
    description: 'A black handprint and dark sludge have appeared on the reception counter.',
    minHour: 1,
    threatWeight: 1.2,
    sound: 'whisper'
  },
  {
    id: 'rec_chairs_toppled',
    roomId: 'reception',
    targetObject: 'guest_chairs',
    name: 'Overturned Waiting Chairs',
    description: 'The visitor waiting chairs have been knocked over violently.',
    minHour: 1,
    threatWeight: 1.1,
    sound: 'glitch'
  },
  {
    id: 'rec_clock_inverted',
    roomId: 'reception',
    targetObject: 'wall_clock',
    name: 'Clock Spun Backwards',
    description: 'The wall clock hands are spinning in rapid reverse.',
    minHour: 2,
    threatWeight: 1.4,
    sound: 'glitch'
  },
  {
    id: 'rec_board_scrawl',
    roomId: 'reception',
    targetObject: 'bulletin_board',
    name: 'Defaced Bulletin Board',
    description: 'The staff evacuation notice is scrawled with blood red warnings.',
    minHour: 2,
    threatWeight: 1.5,
    sound: 'whisper'
  },
  {
    id: 'rec_shadow_counter',
    roomId: 'reception',
    targetObject: 'shadow',
    name: 'Visitor at Counter',
    description: 'A shadowy silhouette is standing motionless at the visitor check-in window.',
    minHour: 2,
    threatWeight: 2.0,
    sound: 'whisper'
  },

  // ================= CAM-02: MAIN CORRIDOR =================
  {
    id: 'corr_door_ajar',
    roomId: 'corridor',
    targetObject: 'hallway_doors',
    name: 'Unlatched Corridor Door',
    description: 'One of the sealed wing doors is standing half-open into pitch blackness.',
    minHour: 0,
    threatWeight: 1.1,
    sound: 'glitch'
  },
  {
    id: 'corr_cooler_bubbling',
    roomId: 'corridor',
    targetObject: 'water_cooler',
    name: 'Black Fluid Cooler',
    description: 'The water cooler jug is filled with boiling black bile.',
    minHour: 1,
    threatWeight: 1.2,
    sound: 'glitch'
  },
  {
    id: 'corr_hazard_strobe',
    roomId: 'corridor',
    targetObject: 'hazard_light',
    name: 'Alarm Beacon Strobe',
    description: 'The emergency containment beacon is flashing an erratic crimson pulse.',
    minHour: 1,
    threatWeight: 1.3,
    sound: 'glitch'
  },
  {
    id: 'corr_vent_arm',
    roomId: 'corridor',
    targetObject: 'vent_grate',
    name: 'Ceiling Grate Tendril',
    description: 'The overhead ventilation cover is knocked loose and tendrils hang down.',
    minHour: 2,
    threatWeight: 1.7,
    sound: 'whisper'
  },
  {
    id: 'corr_extinguisher_missing',
    roomId: 'corridor',
    targetObject: 'fire_extinguisher',
    name: 'Shattered Safety Case',
    description: 'The emergency box glass is shattered and the canister is missing.',
    minHour: 2,
    threatWeight: 1.4,
    sound: 'glitch'
  },
  {
    id: 'corr_shadow_stalker',
    roomId: 'corridor',
    targetObject: 'shadow',
    name: 'Hallway Silhouette',
    description: 'A tall slender figure stands at the vanishing point of the corridor.',
    minHour: 1,
    threatWeight: 2.1,
    sound: 'whisper'
  },

  // ================= CAM-03: RESEARCH LAB =================
  {
    id: 'lab_tank_cracked',
    roomId: 'lab',
    targetObject: 'specimen_tank',
    name: 'Cracked Specimen Cylinder',
    description: 'Deep fractures have spiderwebbed across the containment tank.',
    minHour: 0,
    threatWeight: 1.4,
    sound: 'glitch'
  },
  {
    id: 'lab_microscope_beam',
    roomId: 'lab',
    targetObject: 'microscope_bench',
    name: 'Microscope Overload',
    description: 'The optics on the lab bench are emitting a blinding ultraviolet beam.',
    minHour: 1,
    threatWeight: 1.2,
    sound: 'glitch'
  },
  {
    id: 'lab_whiteboard_blood',
    roomId: 'lab',
    targetObject: 'whiteboard',
    name: 'Bleeding Equation',
    description: 'The research whiteboard is dripping with dark viscous writing.',
    minHour: 1,
    threatWeight: 1.5,
    sound: 'whisper'
  },
  {
    id: 'lab_locker_smoke',
    roomId: 'lab',
    targetObject: 'bio_locker',
    name: 'Sub-Zero Vapor Leak',
    description: 'The biohazard freezer doors are blown open with dense vapor spilling out.',
    minHour: 2,
    threatWeight: 1.6,
    sound: 'whisper'
  },
  {
    id: 'lab_stool_moved',
    roomId: 'lab',
    targetObject: 'lab_stool',
    name: 'Displaced Lab Stool',
    description: 'The technician stool has rolled to the center of the room.',
    minHour: 0,
    threatWeight: 1.0,
    sound: 'glitch'
  },
  {
    id: 'lab_shadow_specimen',
    roomId: 'lab',
    targetObject: 'shadow',
    name: 'Figure Behind Whiteboard',
    description: 'A gaunt figure is peering around the side of the laboratory whiteboard.',
    minHour: 2,
    threatWeight: 2.0,
    sound: 'whisper'
  },

  // ================= CAM-04: ISOLATION CELL (Preserved original suite) =================
  {
    id: 'chair_moved',
    roomId: 'isolation',
    targetObject: 'chair',
    name: 'Displaced Chair',
    description: 'The wooden chair has shifted across the floor.',
    minHour: 0,
    threatWeight: 1.0,
    sound: 'glitch'
  },
  {
    id: 'chair_toppled',
    roomId: 'isolation',
    targetObject: 'chair',
    name: 'Toppled Chair',
    description: 'The chair was knocked over violently.',
    minHour: 1,
    threatWeight: 1.2,
    sound: 'glitch'
  },
  {
    id: 'chair_vanished',
    roomId: 'isolation',
    targetObject: 'chair',
    name: 'Missing Chair',
    description: 'The chair has vanished completely from surveillance.',
    minHour: 2,
    threatWeight: 1.4,
    sound: 'glitch'
  },
  {
    id: 'chair_occupied',
    roomId: 'isolation',
    targetObject: 'chair',
    name: 'Entity in Chair',
    description: 'A dark hunched figure is sitting motionless in the chair.',
    minHour: 3,
    threatWeight: 2.0,
    sound: 'whisper'
  },
  {
    id: 'desk_slid',
    roomId: 'isolation',
    targetObject: 'desk',
    name: 'Shifted Desk',
    description: 'The heavy desk has slid away from the wall.',
    minHour: 1,
    threatWeight: 1.0,
    sound: 'glitch'
  },
  {
    id: 'desk_drawers_open',
    roomId: 'isolation',
    targetObject: 'desk',
    name: 'Open Drawers',
    description: 'All desk drawers have slid open on their own.',
    minHour: 0,
    threatWeight: 1.1,
    sound: 'glitch'
  },
  {
    id: 'desk_ooze',
    roomId: 'isolation',
    targetObject: 'desk',
    name: 'Viscous Substance',
    description: 'Black liquid is leaking down the front of the desk.',
    minHour: 3,
    threatWeight: 1.6,
    sound: 'whisper'
  },
  {
    id: 'painting_tilted',
    roomId: 'isolation',
    targetObject: 'painting',
    name: 'Crooked Frame',
    description: 'The antique portrait is hanging at an unnatural angle.',
    minHour: 0,
    threatWeight: 0.9,
    sound: 'glitch'
  },
  {
    id: 'painting_altered',
    roomId: 'isolation',
    targetObject: 'painting',
    name: 'Mutated Portrait',
    description: 'The portrait face has morphed into a screaming void with red eyes.',
    minHour: 1,
    threatWeight: 1.7,
    sound: 'whisper'
  },
  {
    id: 'painting_crying',
    roomId: 'isolation',
    targetObject: 'painting',
    name: 'Weeping Canvas',
    description: 'Dark streaks are dripping from the portrait eyes.',
    minHour: 2,
    threatWeight: 1.4,
    sound: 'whisper'
  },
  {
    id: 'painting_vanished',
    roomId: 'isolation',
    targetObject: 'painting',
    name: 'Empty Wall',
    description: 'The painting is gone, leaving only an outline on the wall.',
    minHour: 2,
    threatWeight: 1.5,
    sound: 'glitch'
  },
  {
    id: 'lamp_flickering',
    roomId: 'isolation',
    targetObject: 'lamp',
    name: 'Violent Lamp Flicker',
    description: 'The desk lamp is buzzing and strobing erratically.',
    minHour: 0,
    threatWeight: 1.1,
    sound: 'glitch'
  },
  {
    id: 'lamp_red',
    roomId: 'isolation',
    targetObject: 'lamp',
    name: 'Blood Red Bulb',
    description: 'The lamp is projecting an intense crimson beam.',
    minHour: 2,
    threatWeight: 1.8,
    sound: 'glitch'
  },
  {
    id: 'door_ajar',
    roomId: 'isolation',
    targetObject: 'door',
    name: 'Door Ajar',
    description: 'The locked security door has unlatched and swung open.',
    minHour: 0,
    threatWeight: 1.2,
    sound: 'glitch'
  },
  {
    id: 'door_peeking_eyes',
    roomId: 'isolation',
    targetObject: 'door',
    name: 'Eyes in the Gap',
    description: 'Glowing yellow eyes are peering through the door opening.',
    minHour: 1,
    threatWeight: 1.8,
    sound: 'whisper'
  },
  {
    id: 'door_knocking',
    roomId: 'isolation',
    targetObject: 'door',
    name: 'Violent Pounding',
    description: 'Something is hammering furiously against the outside of the door.',
    minHour: 2,
    threatWeight: 1.7,
    sound: 'door_pound'
  },
  {
    id: 'shadow_corner',
    roomId: 'isolation',
    targetObject: 'shadow',
    name: 'Corner Silhouette',
    description: 'A tall slender humanoid shadow is standing motionless in the corner.',
    minHour: 1,
    threatWeight: 1.9,
    sound: 'whisper'
  },

  // ================= CAM-05: STORAGE ARCHIVE =================
  {
    id: 'sto_shelves_collapsed',
    roomId: 'storage',
    targetObject: 'metal_shelves',
    name: 'Tilted Heavy Racks',
    description: 'The industrial steel shelving unit is warped and leaning dangerously.',
    minHour: 1,
    threatWeight: 1.2,
    sound: 'glitch'
  },
  {
    id: 'sto_crates_splintered',
    roomId: 'storage',
    targetObject: 'wooden_crates',
    name: 'Splintered Cargo Box',
    description: 'A reinforced storage crate has been gouged open from within.',
    minHour: 0,
    threatWeight: 1.1,
    sound: 'glitch'
  },
  {
    id: 'sto_suits_floating',
    roomId: 'storage',
    targetObject: 'hazard_suits',
    name: 'Animated Hazmat Suit',
    description: 'The hanging empty protective suit is twitching and facing the camera.',
    minHour: 1,
    threatWeight: 1.8,
    sound: 'whisper'
  },
  {
    id: 'sto_bulb_swinging',
    roomId: 'storage',
    targetObject: 'ceiling_bulb',
    name: 'Wildly Swinging Light',
    description: 'The bare ceiling bulb is pendulum-swinging casting chaotic shadows.',
    minHour: 0,
    threatWeight: 1.0,
    sound: 'glitch'
  },
  {
    id: 'sto_boxes_scattered',
    roomId: 'storage',
    targetObject: 'archive_boxes',
    name: 'Spilled File Records',
    description: 'Classified incident folders are dumped across the concrete floor.',
    minHour: 2,
    threatWeight: 1.3,
    sound: 'glitch'
  },
  {
    id: 'sto_shadow_aisle',
    roomId: 'storage',
    targetObject: 'shadow',
    name: 'Figure Between Aisles',
    description: 'A tall dark silhouette is peering from behind the rear storage rack.',
    minHour: 2,
    threatWeight: 2.0,
    sound: 'whisper'
  },

  // ================= CAM-06: SUB-BASEMENT =================
  {
    id: 'bas_generator_sparks',
    roomId: 'basement',
    targetObject: 'generator',
    name: 'Electrical Arcing Generator',
    description: 'Blue electrical arcs are jumping across the generator housing.',
    minHour: 0,
    threatWeight: 1.3,
    sound: 'glitch'
  },
  {
    id: 'bas_pipe_burst',
    roomId: 'basement',
    targetObject: 'steam_pipes',
    name: 'Ruptured Steam Conduit',
    description: 'Scalding steam is jetting from a cracked high-pressure flange.',
    minHour: 1,
    threatWeight: 1.4,
    sound: 'glitch'
  },
  {
    id: 'bas_drain_tendrils',
    roomId: 'basement',
    targetObject: 'drain_grate',
    name: 'Drainage Pit Tendrils',
    description: 'Black liquid and searching tendrils are rising out of the floor drain.',
    minHour: 2,
    threatWeight: 1.9,
    sound: 'whisper'
  },
  {
    id: 'bas_fusebox_blown',
    roomId: 'basement',
    targetObject: 'fuse_box',
    name: 'Blown Circuit Panel',
    description: 'The main breaker door is blown open with smoking charred fuses.',
    minHour: 1,
    threatWeight: 1.5,
    sound: 'glitch'
  },
  {
    id: 'bas_drums_toppled',
    roomId: 'basement',
    targetObject: 'metal_drum',
    name: 'Leaking Chemical Barrel',
    description: 'A sealed chemical drum is knocked over with sludge pooling outward.',
    minHour: 2,
    threatWeight: 1.2,
    sound: 'glitch'
  },
  {
    id: 'bas_shadow_boiler',
    roomId: 'basement',
    targetObject: 'shadow',
    name: 'Basement Vault Stalker',
    description: 'A terrifying dark mass is perched directly atop the primary steam boiler.',
    minHour: 1,
    threatWeight: 2.2,
    sound: 'whisper'
  }
];

if (typeof window !== 'undefined') {
  window.ROOMS_CONFIG = ROOMS_CONFIG;
  window.FACILITY_DOORS = FACILITY_DOORS;
  window.FACILITY_LOGS = FACILITY_LOGS;
  window.MULTI_ROOM_ANOMALIES = MULTI_ROOM_ANOMALIES;
}
