/**
 * Don't Look Away - Multi-Room Game Controller & Systems Orchestrator
 */

class Game {
  constructor() {
    this.state = 'READY'; // READY, PLAYING, PAUSED, GAMEOVER, VICTORY

    // Core systems
    this.sound = window.soundSystem;
    this.room = new RoomRenderer('surveillance-viewport');
    this.entity = new FacilityEntity(this.sound);
    this.anomalies = new AnomalyManager(this.room, this.sound, this.entity);

    // Active Camera & Facility State
    this.currentCamera = 'isolation';
    this.doorStates = JSON.parse(JSON.stringify(FACILITY_DOORS));
    this.room.setDoors(this.doorStates);

    // Power Grid (Auxiliary Reserve)
    this.power = 100.0;
    this.powerLowWarningPlayed = false;

    // Gameplay parameters
    this.maxLives = 3;
    this.lives = 3;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.falseReports = 0;
    this.highScore = parseInt(localStorage.getItem('dont_look_away_highscore') || '0', 10);

    // Shift Timing (00:00 to 06:00)
    // 40 real seconds per hour = 240 seconds total
    this.secondsPerHour = 40;
    this.totalShiftSeconds = this.secondsPerHour * 6;
    this.elapsedShiftSeconds = 0;
    this.currentHour = 0;

    // Loop & Timers
    this.lastFrameTime = 0;
    this.animationFrameId = null;
    this.spawnCooldown = 4;
    this.cameraRebooting = false;

    // Vision mode: 'green', 'ir', 'amber'
    this.visionMode = 'green';

    // Incident Logs memory
    this.fullIncidentLogs = [];

    this.cacheDOM();
    this.bindEvents();
    this.updateHUD();
    this.renderDynamicReportButtons();
    this.renderLoreArchive();
  }

  cacheDOM() {
    this.dom = {
      // Screens / Modals
      titleScreen: document.getElementById('title-screen'),
      gameOverScreen: document.getElementById('game-over-screen'),
      victoryScreen: document.getElementById('victory-screen'),
      pauseScreen: document.getElementById('pause-screen'),
      helpModal: document.getElementById('help-modal'),
      incidentModal: document.getElementById('incident-log-modal'),
      mapContainer: document.getElementById('facility-map-container'),

      // Buttons - Modals
      btnStart: document.getElementById('btn-start-game'),
      btnRestartGameOver: document.getElementById('btn-restart-gameover'),
      btnRestartVictory: document.getElementById('btn-restart-victory'),
      btnResume: document.getElementById('btn-resume'),
      btnQuit: document.getElementById('btn-quit'),
      btnHelp: document.getElementById('btn-help'),
      btnCloseHelp: document.getElementById('btn-close-help'),
      btnCloseMap: document.getElementById('btn-close-map'),
      btnCloseIncidentModal: document.getElementById('btn-close-incident-modal'),

      // Audio & Vision Controls
      btnMute: document.getElementById('btn-mute'),
      volumeSlider: document.getElementById('volume-slider'),
      btnVisionGreen: document.getElementById('btn-vision-green'),
      btnVisionIR: document.getElementById('btn-vision-ir'),
      btnVisionAmber: document.getElementById('btn-vision-amber'),
      cctvContainer: document.getElementById('cctv-monitor'),

      // Security Action Buttons
      btnToggleDoor: document.getElementById('btn-toggle-door'),
      btnRebootCamera: document.getElementById('btn-reboot-camera'),
      btnMotionScan: document.getElementById('btn-motion-scan'),
      btnOpenLogs: document.getElementById('btn-open-logs'),
      btnToggleMap: document.getElementById('btn-toggle-map'),

      // Incident Modal Tabs
      tabLiveEvents: document.getElementById('tab-live-events'),
      tabLoreArchives: document.getElementById('tab-lore-archives'),
      paneLiveEvents: document.getElementById('pane-live-events'),
      paneLoreArchives: document.getElementById('pane-lore-archives'),
      incidentFullLog: document.getElementById('incident-full-log'),
      loreTranscriptsContainer: document.getElementById('lore-transcripts-container'),

      // HUD Elements
      clockTime: document.getElementById('hud-clock-time'),
      hudDate: document.getElementById('hud-date'),
      hudCamTitle: document.getElementById('hud-cam-title'),
      hudScore: document.getElementById('hud-score'),
      hudLives: document.getElementById('hud-lives'),
      hudThreatBar: document.getElementById('hud-threat-bar'),
      hudThreatText: document.getElementById('hud-threat-text'),
      hudHourBadge: document.getElementById('hud-hour-badge'),
      hudHighScore: document.getElementById('hud-highscore'),
      hudStreak: document.getElementById('hud-streak'),
      hudPowerBar: document.getElementById('hud-power-bar'),
      hudPowerText: document.getElementById('hud-power-text'),

      // Camera Channel Buttons
      cameraButtons: document.querySelectorAll('.camera-channel-btn'),
      mapNodes: document.querySelectorAll('.map-room-node'),
      sonarPing: document.getElementById('map-sonar-ping'),

      // Surveillance overlays
      cameraStatic: document.getElementById('camera-static-overlay'),
      statusBanner: document.getElementById('surveillance-status-banner'),
      statusText: document.getElementById('surveillance-status-text'),
      terminalLog: document.getElementById('terminal-log-content'),

      // Report container
      reportButtonsContainer: document.getElementById('report-buttons-container'),

      // Game Over Stats
      goScore: document.getElementById('go-final-score'),
      goSurvivedTime: document.getElementById('go-survived-time'),
      goAnomalies: document.getElementById('go-anomalies-caught'),
      goCause: document.getElementById('go-failure-cause'),

      // Victory Stats
      vicScore: document.getElementById('vic-final-score'),
      vicAnomalies: document.getElementById('vic-anomalies-caught'),
      vicAccuracy: document.getElementById('vic-accuracy'),
      vicRank: document.getElementById('vic-rank'),
    };
  }

  bindEvents() {
    // Start & Restart
    this.dom.btnStart.addEventListener('click', () => {
      this.sound.init();
      this.sound.playClick();
      this.startShift();
    });

    this.dom.btnRestartGameOver.addEventListener('click', () => {
      this.sound.playClick();
      this.startShift();
    });

    this.dom.btnRestartVictory.addEventListener('click', () => {
      this.sound.playClick();
      this.startShift();
    });

    // Pause / Resume / Quit
    this.dom.btnResume.addEventListener('click', () => {
      this.sound.playClick();
      this.togglePause();
    });

    this.dom.btnQuit.addEventListener('click', () => {
      this.sound.playClick();
      this.quitToTitle();
    });

    // Modals
    this.dom.btnHelp.addEventListener('click', () => {
      this.sound.playClick();
      this.dom.helpModal.classList.remove('hidden');
    });

    this.dom.btnCloseHelp.addEventListener('click', () => {
      this.sound.playClick();
      this.dom.helpModal.classList.add('hidden');
    });

    this.dom.btnOpenLogs.addEventListener('click', () => {
      this.sound.playClick();
      this.openIncidentModal();
    });

    this.dom.btnCloseIncidentModal.addEventListener('click', () => {
      this.sound.playClick();
      this.dom.incidentModal.classList.add('hidden');
    });

    this.dom.btnToggleMap.addEventListener('click', () => {
      this.sound.playClick();
      this.dom.mapContainer.classList.toggle('hidden');
    });

    this.dom.btnCloseMap.addEventListener('click', () => {
      this.sound.playClick();
      this.dom.mapContainer.classList.add('hidden');
    });

    // Incident modal tab switching
    this.dom.tabLiveEvents.addEventListener('click', () => {
      this.sound.playClick();
      this.dom.tabLiveEvents.classList.add('active');
      this.dom.tabLoreArchives.classList.remove('active');
      this.dom.paneLiveEvents.classList.remove('hidden');
      this.dom.paneLoreArchives.classList.add('hidden');
    });

    this.dom.tabLoreArchives.addEventListener('click', () => {
      this.sound.playClick();
      this.dom.tabLoreArchives.classList.add('active');
      this.dom.tabLiveEvents.classList.remove('active');
      this.dom.paneLoreArchives.classList.remove('hidden');
      this.dom.paneLiveEvents.classList.add('hidden');
      this.renderLoreArchive();
    });

    // Security Actions
    this.dom.btnToggleDoor.addEventListener('click', () => {
      this.toggleCurrentRoomDoor();
    });

    this.dom.btnRebootCamera.addEventListener('click', () => {
      this.rebootCurrentCamera();
    });

    this.dom.btnMotionScan.addEventListener('click', () => {
      this.runMotionScan();
    });

    // Camera Channel Selection (Buttons & Map)
    this.dom.cameraButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const cam = btn.getAttribute('data-cam');
        if (cam) this.switchCamera(cam);
      });
    });

    this.dom.mapNodes.forEach((node) => {
      node.addEventListener('click', () => {
        const cam = node.getAttribute('data-cam');
        if (cam) this.switchCamera(cam);
      });
    });

    // Audio & Vision Controls
    this.dom.btnMute.addEventListener('click', () => {
      const isMuted = !this.sound.isMuted;
      this.sound.setMute(isMuted);
      this.dom.btnMute.textContent = isMuted ? '🔇 UNMUTE' : '🔊 MUTE';
      this.dom.btnMute.classList.toggle('active', isMuted);
    });

    this.dom.volumeSlider.addEventListener('input', (e) => {
      this.sound.setVolume(parseFloat(e.target.value));
    });

    const setVision = (mode) => {
      this.sound.playClick();
      this.visionMode = mode;
      this.dom.cctvContainer.classList.remove('vision-green', 'vision-ir', 'vision-amber');
      this.dom.cctvContainer.classList.add(`vision-${mode}`);

      this.dom.btnVisionGreen.classList.toggle('active', mode === 'green');
      this.dom.btnVisionIR.classList.toggle('active', mode === 'ir');
      this.dom.btnVisionAmber.classList.toggle('active', mode === 'amber');

      this.triggerStaticBurst(0.15);
      this.logMessage(`OPTICAL VISION MATRIX SWITCHED: [${mode.toUpperCase()}]`);
    };

    this.dom.btnVisionGreen.addEventListener('click', () => setVision('green'));
    this.dom.btnVisionIR.addEventListener('click', () => setVision('ir'));
    this.dom.btnVisionAmber.addEventListener('click', () => setVision('amber'));

    // Direct object clicks on SVG room
    const svgRoom = document.getElementById('surveillance-viewport');
    if (svgRoom) {
      svgRoom.addEventListener('click', (e) => {
        if (this.state !== 'PLAYING') return;
        const group = e.target.closest('.room-object-group');
        if (group) {
          const target = group.getAttribute('data-object');
          if (target) {
            this.handleReport(target);
          }
        }
      });
    }

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (!this.sound.initialized) this.sound.init();

      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (this.state === 'PLAYING' || this.state === 'PAUSED') {
          this.togglePause();
        }
        return;
      }

      if (e.key === 'm' || e.key === 'M') {
        this.dom.btnMute.click();
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        this.dom.btnToggleMap.click();
        return;
      }

      if (e.key === 'l' || e.key === 'L') {
        this.openIncidentModal();
        return;
      }

      if (this.state !== 'PLAYING') return;

      // Camera switching shortcuts: Q, W, E, R, T, Y
      const camKeys = {
        'q': 'reception', 'Q': 'reception',
        'w': 'corridor',  'W': 'corridor',
        'e': 'lab',       'E': 'lab',
        'r': 'isolation', 'R': 'isolation',
        't': 'storage',   'T': 'storage',
        'y': 'basement',  'Y': 'basement'
      };
      if (camKeys[e.key]) {
        this.switchCamera(camKeys[e.key]);
        return;
      }

      // Security action hotkeys: D, F, S
      if (e.key === 'd' || e.key === 'D') {
        this.toggleCurrentRoomDoor();
        return;
      }
      if (e.key === 'f' || e.key === 'F') {
        this.rebootCurrentCamera();
        return;
      }
      if (e.key === 's' || e.key === 'S') {
        this.runMotionScan();
        return;
      }

      // Quick object report keys 1-6 (maps to current room's objects)
      const config = ROOMS_CONFIG[this.currentCamera];
      if (config && config.objects) {
        const objIndex = parseInt(e.key, 10) - 1;
        if (objIndex >= 0 && objIndex < config.objects.length) {
          const targetObj = config.objects[objIndex].id;
          this.handleReport(targetObj);
        }
      }
    });

    window.addEventListener('click', () => {
      if (!this.sound.initialized) this.sound.init();
      else this.sound.resume();
    }, { once: true });
  }

  startShift() {
    this.state = 'PLAYING';
    this.lives = this.maxLives;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.falseReports = 0;
    this.elapsedShiftSeconds = 0;
    this.currentHour = 0;
    this.power = 100.0;
    this.spawnCooldown = 4;
    this.cameraRebooting = false;
    this.powerLowWarningPlayed = false;

    // Reset systems
    this.doorStates = JSON.parse(JSON.stringify(FACILITY_DOORS));
    this.room.setDoors(this.doorStates);
    this.entity.reset();
    this.anomalies.reset();
    this.sound.resume();
    this.sound.stopHeartbeat();

    this.currentCamera = 'isolation';
    this.room.setRoom(this.currentCamera);

    // Hide modals
    this.dom.titleScreen.classList.add('hidden');
    this.dom.gameOverScreen.classList.add('hidden');
    this.dom.victoryScreen.classList.add('hidden');
    this.dom.pauseScreen.classList.add('hidden');
    this.dom.helpModal.classList.add('hidden');
    this.dom.incidentModal.classList.add('hidden');

    this.clearLog();
    this.logMessage('00:00:00 [INIT] SECTOR-7 SURVEILLANCE DESK ACTIVE.');
    this.logMessage('00:00:00 [SYSTEM] 6 OPTICAL CAMERAS LINKED.');
    this.logMessage('00:00:00 [CONTAINMENT] SUBJECT-7 MONITORED IN VAULT.');

    this.updateHUD();
    this.updateCameraSelectorUI();
    this.updateDoorButtonUI();
    this.renderDynamicReportButtons();
    this.triggerStaticBurst(0.4);

    this.lastFrameTime = performance.now();
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.dom.pauseScreen.classList.remove('hidden');
      this.sound.stopHeartbeat();
      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.dom.pauseScreen.classList.add('hidden');
      this.lastFrameTime = performance.now();
      this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
    }
  }

  quitToTitle() {
    this.state = 'READY';
    this.anomalies.reset();
    this.entity.reset();
    this.sound.stopHeartbeat();
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

    this.dom.pauseScreen.classList.add('hidden');
    this.dom.gameOverScreen.classList.add('hidden');
    this.dom.victoryScreen.classList.add('hidden');
    this.dom.titleScreen.classList.remove('hidden');
  }

  gameLoop(currentTime) {
    if (this.state !== 'PLAYING') return;

    const dt = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;
    const cappedDt = Math.min(dt, 0.1);

    this.update(cappedDt);
    this.render();

    this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
  }

  update(dt) {
    const timeStr = this.formatTime(this.elapsedShiftSeconds);

    // 1. Shift Time Progression
    this.elapsedShiftSeconds += dt;
    const prevHour = this.currentHour;
    this.currentHour = Math.min(5, Math.floor(this.elapsedShiftSeconds / this.secondsPerHour));

    if (this.currentHour > prevHour) {
      this.logMessage(`${timeStr} [HOURLY UPDATE] ${this.currentHour}:00 AM - ESCALATION LEVEL INCREASED.`);
      this.showBanner(`HOUR ${this.currentHour}:00 AM - ESCALATION ACCELERATING`, 'info', 2500);
      this.renderLoreArchive(); // unlocks new hour audio log
    }

    if (this.elapsedShiftSeconds >= this.totalShiftSeconds) {
      this.triggerVictory();
      return;
    }

    // 2. Power Grid Management
    let powerDrainRate = 0.04; // Idle drain
    let lockedCount = 0;
    Object.values(this.doorStates).forEach((d) => {
      if (d.isLocked) {
        powerDrainRate += 0.35;
        lockedCount++;
      }
    });

    this.power = Math.max(0, this.power - powerDrainRate * dt);

    if (this.power <= 0) {
      // Power Grid Failure!
      this.handlePowerOutage();
    } else if (this.power < 20 && !this.powerLowWarningPlayed) {
      this.powerLowWarningPlayed = true;
      this.sound.playLowBatteryAlarm();
      this.logMessage(`[ALERT] AUXILIARY BATTERY BELOW 20%! RELEASE BULKHEADS!`);
    } else if (this.power >= 20) {
      this.powerLowWarningPlayed = false;
    }

    // 3. Entity Autonomous Movement & Stalking
    const entityEvents = this.entity.update(dt, this.currentHour, this.currentCamera, this.doorStates, timeStr);
    entityEvents.forEach((ev) => {
      this.logMessage(`${timeStr} [ENTITY] ${ev.message}`);
      if (ev.type === 'STARE_OVERLOAD') {
        // Direct gaze overloaded optical sensor - camera fails into static
        this.room.setCameraOffline(this.currentCamera, true);
        this.triggerStaticBurst(1.2);
        this.showBanner(`OPTICAL SENSOR BLOWN BY ENTITY INTERFERENCE!`, 'error', 3000);
      } else if (ev.type === 'DOOR_BLOCKED') {
        this.showBanner(`HEAVY IMPACT ON ${ev.doorId.toUpperCase()}!`, 'error', 2500);
      }
    });

    this.room.setEntityRoom(this.entity.currentRoom);

    // 4. Anomaly Spawning
    this.spawnCooldown -= dt;
    if (this.spawnCooldown <= 0) {
      const spawned = this.anomalies.trySpawn(this.currentHour, this.currentCamera);
      if (spawned) {
        if (spawned.roomId === this.currentCamera) {
          this.triggerStaticBurst(0.25);
          this.logMessage(`${timeStr} [WARNING] ANOMALY MANIFESTED ON [${this.currentCamera.toUpperCase()}].`);
        } else {
          this.logMessage(`${timeStr} [SENSOR] DISTURBANCE DETECTED IN FACILITY.`);
        }
      }

      // Next spawn interval
      const minInterval = Math.max(2.5, 7.5 - this.currentHour * 1.0);
      const maxInterval = Math.max(4.5, 12.0 - this.currentHour * 1.3);
      this.spawnCooldown = minInterval + Math.random() * (maxInterval - minInterval);
    }

    // 5. Threat Level Update
    const isEntityStalkingHere = (this.entity.currentRoom === this.currentCamera);
    const threat = this.anomalies.updateThreat(dt, isEntityStalkingHere);

    if (threat >= 100) {
      this.handleThreatOverload();
    }
  }

  render() {
    this.updateHUD();
    this.updateCameraStatusDots();
    this.updateMapDoorVisuals();
  }

  switchCamera(camId) {
    if (this.currentCamera === camId) return;

    this.sound.playCamSwitch();
    this.triggerStaticBurst(0.22);

    this.currentCamera = camId;
    this.room.setRoom(camId);

    // Update HUD camera title
    const config = ROOMS_CONFIG[camId];
    if (config && this.dom.hudCamTitle) {
      this.dom.hudCamTitle.textContent = `${config.camId} : ${config.name}`;
    }

    this.updateCameraSelectorUI();
    this.updateDoorButtonUI();
    this.renderDynamicReportButtons();

    this.logMessage(`${this.formatTime(this.elapsedShiftSeconds)} [CHANNEL] SWITCHED TO ${config.camId} (${config.name})`);
  }

  toggleCurrentRoomDoor() {
    const config = ROOMS_CONFIG[this.currentCamera];
    if (!config || !config.doorId) {
      this.showBanner('MAIN CORRIDOR HAS NO DIRECT BULKHEAD', 'error', 1500);
      return;
    }

    if (this.power <= 0) {
      this.sound.playFalseAlarm();
      this.showBanner('CANNOT LOCK: AUXILIARY POWER DEPLETED', 'error', 2000);
      return;
    }

    const doorId = config.doorId;
    const door = this.doorStates[doorId];
    door.isLocked = !door.isLocked;

    if (door.isLocked) {
      this.sound.playDoorLock();
      this.logMessage(`[BULKHEAD] ${door.label} LOCKED. POWER DRAIN ACTIVE.`);
      this.showBanner(`${door.label} LOCKED [0.35%/s DRAIN]`, 'info', 2000);
    } else {
      this.sound.playDoorUnlock();
      this.logMessage(`[BULKHEAD] ${door.label} UNLOCKED.`);
      this.showBanner(`${door.label} UNLOCKED`, 'info', 1800);
    }

    this.room.setDoors(this.doorStates);
    this.room.updateDoorBulkheadVisual();
    this.updateDoorButtonUI();
    this.updateMapDoorVisuals();
  }

  rebootCurrentCamera() {
    if (!this.room.offlineCameras.has(this.currentCamera)) {
      this.showBanner('CAMERA IS ALREADY ONLINE', 'info', 1500);
      return;
    }

    if (this.cameraRebooting) return;
    if (this.power < 3) {
      this.showBanner('INSUFFICIENT POWER FOR OPTICAL REBOOT', 'error', 2000);
      return;
    }

    this.cameraRebooting = true;
    this.power = Math.max(0, this.power - 3.0);
    this.sound.playCameraReboot();
    this.showBanner('REBOOTING OPTICAL MATRIX...', 'info', 3000);

    setTimeout(() => {
      this.room.setCameraOffline(this.currentCamera, false);
      this.triggerStaticBurst(0.35);
      this.cameraRebooting = false;
      this.logMessage(`[SYSTEM] ${this.currentCamera.toUpperCase()} OPTICAL FEED RESTORED.`);
      this.showBanner('FEED RESTORED // CARRIER ACQUIRED', 'success', 2000);
    }, 2800);
  }

  runMotionScan() {
    if (this.power < 4) {
      this.sound.playFalseAlarm();
      this.showBanner('INSUFFICIENT POWER FOR SENSOR PING', 'error', 2000);
      return;
    }

    this.power = Math.max(0, this.power - 4.0);
    this.sound.playScannerPing();

    const lastRoom = this.entity.lastKnownRoom;
    const roomConfig = ROOMS_CONFIG[lastRoom] || {};
    const roomName = roomConfig.name || lastRoom.toUpperCase();

    // Trigger radar ping on map
    if (this.dom.sonarPing && roomConfig.mapCoords) {
      const cx = roomConfig.mapCoords.x + roomConfig.mapCoords.width / 2;
      const cy = roomConfig.mapCoords.y + roomConfig.mapCoords.height / 2;
      this.dom.sonarPing.setAttribute('cx', cx);
      this.dom.sonarPing.setAttribute('cy', cy);
      this.dom.sonarPing.style.opacity = '1';
      this.dom.sonarPing.classList.add('radar-ping-circle');
      setTimeout(() => {
        this.dom.sonarPing.classList.remove('radar-ping-circle');
        this.dom.sonarPing.style.opacity = '0';
      }, 3600);
    }

    // Make map visible so player sees the ping
    this.dom.mapContainer.classList.remove('hidden');

    this.showBanner(`MOTION DETECTED: [${roomName}] (${this.entity.lastKnownTime})`, 'info', 3500);
    this.logMessage(`[SCAN] VIBRATION PING IN [${roomName}]. DISTURBANCE CONFIRMED.`);

    if (this.entity.recentEvidence.length > 0) {
      const topEv = this.entity.recentEvidence[0];
      this.logMessage(`[TRACE] EVIDENCE: ${topEv.type}`);
    }
  }

  handlePowerOutage() {
    let unlockedAny = false;
    Object.values(this.doorStates).forEach((d) => {
      if (d.isLocked) {
        d.isLocked = false;
        unlockedAny = true;
      }
    });

    if (unlockedAny) {
      this.sound.playDoorUnlock();
      this.triggerStaticBurst(0.8);
      this.room.setDoors(this.doorStates);
      this.room.updateDoorBulkheadVisual();
      this.updateDoorButtonUI();
      this.updateMapDoorVisuals();
      this.showBanner('GRID OVERLOAD: ALL BULKHEADS VENTED OPEN!', 'error', 3500);
      this.logMessage(`[CRITICAL] POWER GRID COLLAPSED. ALL BULKHEADS OPENED.`);
    }
  }

  handleReport(targetObject) {
    const result = this.anomalies.reportObject(targetObject, this.currentCamera, this.currentHour);

    if (result.success) {
      this.streak++;
      if (this.streak > this.maxStreak) this.maxStreak = this.streak;

      const basePts = result.isEntityBanish ? 600 : 350;
      const mult = 1 + (this.streak - 1) * 0.25;
      const earned = Math.floor(basePts * mult);
      this.score += earned;

      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('dont_look_away_highscore', this.highScore.toString());
      }

      this.triggerStaticBurst(0.2);
      this.showBanner(`RESOLVED: ${result.anomaly.name.toUpperCase()} (+${earned} PTS)`, 'success', 2200);
      this.logMessage(`[RESOLVED] ${result.anomaly.name} on [${targetObject.toUpperCase()}] in [${this.currentCamera.toUpperCase()}]. +${earned} PTS.`);
    } else {
      this.streak = 0;
      this.falseReports++;
      this.score = Math.max(0, this.score - 100);
      this.lives--;

      this.triggerStaticBurst(0.4);
      this.showBanner(`FALSE REPORT: NO ANOMALY ON [${targetObject.toUpperCase()}]`, 'error', 2500);
      this.logMessage(`[FALSE REPORT] [${targetObject.toUpperCase()}] IN [${this.currentCamera.toUpperCase()}] IS NOMINAL. LIFE LOST!`);

      this.dom.cctvContainer.classList.add('flash-danger');
      setTimeout(() => this.dom.cctvContainer.classList.remove('flash-danger'), 400);

      if (this.lives <= 0) {
        this.triggerGameOver('SECURITY CREDENTIALS REVOKED // CRITICAL INTEGRITY COLLAPSE');
      }
    }

    this.updateHUD();
  }

  handleThreatOverload() {
    this.sound.playStinger();
    this.lives = 0;
    this.triggerGameOver('SANITY DISSOLUTION // SUBJECT 7 BREACHED THE SECURITY TERMINAL');
  }

  triggerGameOver(causeText) {
    this.state = 'GAMEOVER';
    this.sound.stopHeartbeat();
    this.sound.playStinger();

    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.triggerStaticBurst(1.2);

    this.dom.goScore.textContent = this.score;
    this.dom.goSurvivedTime.textContent = this.formatTime(this.elapsedShiftSeconds);
    this.dom.goAnomalies.textContent = this.anomalies.resolvedCount;
    this.dom.goCause.textContent = causeText;

    setTimeout(() => {
      this.dom.gameOverScreen.classList.remove('hidden');
    }, 600);
  }

  triggerVictory() {
    this.state = 'VICTORY';
    this.sound.stopHeartbeat();
    this.sound.playDawnChimes();

    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

    const totalReports = this.anomalies.resolvedCount + this.falseReports;
    const accuracyPct = totalReports === 0 ? 100 : Math.round((this.anomalies.resolvedCount / totalReports) * 100);

    let rank = 'C';
    if (this.lives === 3 && accuracyPct >= 90) rank = 'S';
    else if (accuracyPct >= 80 && this.lives >= 2) rank = 'A';
    else if (accuracyPct >= 65) rank = 'B';

    this.score += this.lives * 750 + Math.floor(this.power * 10);
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('dont_look_away_highscore', this.highScore.toString());
    }

    this.dom.vicScore.textContent = this.score;
    this.dom.vicAnomalies.textContent = this.anomalies.resolvedCount;
    this.dom.vicAccuracy.textContent = `${accuracyPct}%`;
    this.dom.vicRank.textContent = rank;

    setTimeout(() => {
      this.dom.victoryScreen.classList.remove('hidden');
    }, 1000);
  }

  // ================= UI RENDERING & UPDATES =================
  formatTime(elapsedSecs) {
    const totalMinutes = (elapsedSecs / this.totalShiftSeconds) * 360;
    const hrs = Math.min(6, Math.floor(totalMinutes / 60));
    const mins = Math.min(59, Math.floor(totalMinutes % 60));
    const secs = Math.floor((totalMinutes * 60) % 60);

    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }

  updateHUD() {
    if (this.dom.clockTime) this.dom.clockTime.textContent = this.formatTime(this.elapsedShiftSeconds);

    const hourLabels = ['12 AM', '01 AM', '02 AM', '03 AM', '04 AM', '05 AM', '06 AM'];
    if (this.dom.hudHourBadge) {
      this.dom.hudHourBadge.textContent = hourLabels[Math.min(6, this.currentHour)];
    }

    if (this.dom.hudScore) this.dom.hudScore.textContent = this.score;
    if (this.dom.hudHighScore) this.dom.hudHighScore.textContent = this.highScore;
    if (this.dom.hudStreak) {
      this.dom.hudStreak.textContent = this.streak > 1 ? `x${this.streak} COMBO` : '';
    }

    if (this.dom.hudLives) {
      let hearts = '';
      for (let i = 0; i < this.maxLives; i++) {
        hearts += i < this.lives ? '❤️ ' : '🖤 ';
      }
      this.dom.hudLives.textContent = hearts.trim();
    }

    // Threat Bar
    const threatPct = Math.round(this.anomalies.threatLevel);
    if (this.dom.hudThreatBar) {
      this.dom.hudThreatBar.style.width = `${threatPct}%`;
      this.dom.hudThreatBar.style.backgroundColor = threatPct > 70 ? '#ff2222' : threatPct > 40 ? '#ffaa00' : '#26ff75';
    }
    if (this.dom.hudThreatText) this.dom.hudThreatText.textContent = `${threatPct}%`;

    // Power Grid Bar
    const powerPct = Math.round(this.power);
    if (this.dom.hudPowerBar) {
      this.dom.hudPowerBar.style.width = `${powerPct}%`;
      this.dom.hudPowerBar.style.backgroundColor = powerPct < 25 ? '#ff2222' : powerPct < 50 ? '#ffaa00' : '#26ff75';
    }
    if (this.dom.hudPowerText) {
      this.dom.hudPowerText.textContent = `${powerPct}%`;
      this.dom.hudPowerText.style.color = powerPct < 25 ? '#ff4444' : '#26ff75';
    }
  }

  updateCameraSelectorUI() {
    this.dom.cameraButtons.forEach((btn) => {
      const cam = btn.getAttribute('data-cam');
      btn.classList.toggle('active', cam === this.currentCamera);
    });

    this.dom.mapNodes.forEach((node) => {
      const cam = node.getAttribute('data-cam');
      node.classList.toggle('active', cam === this.currentCamera);
    });
  }

  updateCameraStatusDots() {
    Object.keys(ROOMS_CONFIG).forEach((roomId) => {
      const dot = document.getElementById(`dot-cam-${roomId}`);
      if (!dot) return;

      if (this.room.offlineCameras.has(roomId)) {
        dot.className = 'cam-status-dot offline';
      } else {
        const anomaliesHere = this.anomalies.getActiveForRoom(roomId);
        if (anomaliesHere.length > 0) {
          dot.className = 'cam-status-dot glitch';
        } else {
          dot.className = 'cam-status-dot';
        }
      }
    });
  }

  updateDoorButtonUI() {
    const config = ROOMS_CONFIG[this.currentCamera];
    if (!config || !config.doorId) {
      this.dom.btnToggleDoor.textContent = '🔒 BULKHEAD: N/A';
      this.dom.btnToggleDoor.classList.remove('active-danger');
      return;
    }

    const door = this.doorStates[config.doorId];
    if (door && door.isLocked) {
      this.dom.btnToggleDoor.textContent = '🔒 BULKHEAD: LOCKED';
      this.dom.btnToggleDoor.classList.add('active-danger');
    } else {
      this.dom.btnToggleDoor.textContent = '🔒 BULKHEAD: OPEN';
      this.dom.btnToggleDoor.classList.remove('active-danger');
    }
  }

  updateMapDoorVisuals() {
    Object.values(this.doorStates).forEach((door) => {
      const mapDoor = document.getElementById(`map-${door.id.replace('_', '-')}`);
      if (mapDoor) {
        mapDoor.setAttribute('fill', door.isLocked ? '#ff3344' : '#26ff75');
      }
    });
  }

  renderDynamicReportButtons() {
    if (!this.dom.reportButtonsContainer) return;
    const config = ROOMS_CONFIG[this.currentCamera];
    if (!config || !config.objects) return;

    this.dom.reportButtonsContainer.innerHTML = '';
    config.objects.forEach((obj, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn-report-object';
      btn.setAttribute('data-target', obj.id);
      btn.title = `Report ${obj.label} (Key ${obj.key})`;
      btn.innerHTML = `<span class="hotkey-badge">${obj.key}</span> ${obj.label}`;

      btn.addEventListener('click', () => {
        if (this.state === 'PLAYING') {
          this.handleReport(obj.id);
        }
      });

      this.dom.reportButtonsContainer.appendChild(btn);
    });
  }

  renderLoreArchive() {
    if (!this.dom.loreTranscriptsContainer) return;
    this.dom.loreTranscriptsContainer.innerHTML = '';

    FACILITY_LOGS.forEach((log) => {
      const isUnlocked = (this.currentHour >= log.hour);
      const card = document.createElement('div');
      card.className = `lore-record-box ${isUnlocked ? 'unlocked' : 'locked'}`;

      if (isUnlocked) {
        card.innerHTML = `
          <div class="lore-header">
            <span>[DECRYPTED] ${log.time} // ${log.author}</span>
            <span>${log.title}</span>
          </div>
          <p class="lore-body">${log.text}</p>
        `;
      } else {
        card.innerHTML = `
          <div class="lore-header">
            <span>[ENCRYPTED ARCHIVE] // UNLOCKS AT ${log.time}</span>
            <span>RESTRICTED CLEARANCE</span>
          </div>
          <p class="lore-body" style="filter: blur(4px); user-select: none;">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quantum matrix parameters pending observation confirmation.
          </p>
        `;
      }

      this.dom.loreTranscriptsContainer.appendChild(card);
    });
  }

  openIncidentModal() {
    this.renderLoreArchive();
    this.dom.incidentModal.classList.remove('hidden');
  }

  showBanner(msg, type = 'info', duration = 2000) {
    if (!this.dom.statusBanner || !this.dom.statusText) return;
    this.dom.statusText.textContent = msg;
    this.dom.statusBanner.className = `surveillance-banner show banner-${type}`;

    if (this.bannerTimeout) clearTimeout(this.bannerTimeout);
    this.bannerTimeout = setTimeout(() => {
      this.dom.statusBanner.className = 'surveillance-banner';
    }, duration);
  }

  logMessage(msg) {
    // Mini-feed in lower left
    if (this.dom.terminalLog) {
      const p = document.createElement('div');
      p.className = 'terminal-log-entry';
      p.textContent = msg;
      this.dom.terminalLog.appendChild(p);
      while (this.dom.terminalLog.children.length > 12) {
        this.dom.terminalLog.removeChild(this.dom.terminalLog.firstChild);
      }
      this.dom.terminalLog.scrollTop = this.dom.terminalLog.scrollHeight;
    }

    // Full modal log
    if (this.dom.incidentFullLog) {
      const p2 = document.createElement('div');
      p2.className = 'terminal-log-entry';
      p2.style.marginBottom = '4px';
      p2.textContent = msg;
      this.dom.incidentFullLog.appendChild(p2);
      this.dom.incidentFullLog.scrollTop = this.dom.incidentFullLog.scrollHeight;
    }
  }

  clearLog() {
    if (this.dom.terminalLog) this.dom.terminalLog.innerHTML = '';
    if (this.dom.incidentFullLog) this.dom.incidentFullLog.innerHTML = '';
  }

  triggerStaticBurst(durationSeconds = 0.3) {
    if (!this.dom.cameraStatic) return;
    this.dom.cameraStatic.style.opacity = '0.75';
    this.dom.cameraStatic.classList.add('static-burst-active');

    setTimeout(() => {
      this.dom.cameraStatic.style.opacity = '';
      this.dom.cameraStatic.classList.remove('static-burst-active');
    }, durationSeconds * 1000);
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
