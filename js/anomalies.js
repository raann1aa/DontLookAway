/**
 * Don't Look Away - Multi-Room Anomaly Management Engine
 * Tracks, spawns, and resolves anomalies across all 6 facility locations.
 */

class AnomalyManager {
  constructor(roomRenderer, soundSystem, entitySystem) {
    this.room = roomRenderer;
    this.sound = soundSystem;
    this.entity = entitySystem;

    this.activeAnomalies = new Map(); // id -> anomaly object
    this.resolvedCount = 0;
    this.totalSpawned = 0;
    this.threatLevel = 0; // 0 to 100%
    this.isPaused = false;
  }

  reset() {
    this.activeAnomalies.clear();
    this.resolvedCount = 0;
    this.totalSpawned = 0;
    this.threatLevel = 0;
    this.isPaused = false;
    this.room.resetAll();
  }

  getActiveCount() {
    return this.activeAnomalies.size;
  }

  getActiveForRoom(roomId) {
    const list = [];
    this.activeAnomalies.forEach((a) => {
      if (a.roomId === roomId) list.push(a);
    });
    return list;
  }

  /**
   * Maximum allowed simultaneous anomalies facility-wide
   */
  getMaxConcurrent(hour) {
    if (hour <= 0) return 2;
    if (hour <= 1) return 3;
    if (hour <= 2) return 4;
    if (hour <= 4) return 5;
    return 6;
  }

  /**
   * Tries to spawn a random valid anomaly in one of the 6 rooms
   */
  trySpawn(currentHour, activeRoomId) {
    if (this.isPaused) return null;

    const maxConcurrent = this.getMaxConcurrent(currentHour);
    if (this.activeAnomalies.size >= maxConcurrent) return null;

    // Filter available anomalies from MULTI_ROOM_ANOMALIES
    const activeKeys = new Set();
    this.activeAnomalies.forEach((a) => activeKeys.add(`${a.roomId}_${a.targetObject}`));

    const eligible = MULTI_ROOM_ANOMALIES.filter((candidate) => {
      if (candidate.minHour > currentHour) return false;
      if (this.activeAnomalies.has(candidate.id)) return false;
      if (activeKeys.has(`${candidate.roomId}_${candidate.targetObject}`)) return false;
      return true;
    });

    if (eligible.length === 0) return null;

    // Favor spawning in rooms other than current to encourage checking feeds,
    // but sometimes spawn right on the active camera to startle the player
    const selected = eligible[Math.floor(Math.random() * eligible.length)];
    const activeData = {
      ...selected,
      spawnTimestamp: Date.now()
    };

    this.activeAnomalies.set(selected.id, activeData);
    this.totalSpawned++;

    // Apply to room renderer
    this.room.applyAnomaly(activeData);

    // Play subtle audio cue (more distinct if in currently active room)
    const isHere = (selected.roomId === activeRoomId);
    if (isHere) {
      if (selected.sound === 'door_pound') this.sound.playDoorPound();
      else if (selected.sound === 'whisper') this.sound.playWhisper();
      else this.sound.playGlitch(1.0);
    } else {
      // Faint distortion in the distance
      this.sound.playGlitch(0.3);
    }

    return selected;
  }

  /**
   * Reports an object in the player's currently viewed room.
   * Returns { success: boolean, anomaly: Object|null, isEntityBanish: boolean }
   */
  reportObject(targetObject, currentRoomId, currentHour) {
    // 1. Check if reporting ENTITY/SHADOW while the moving entity is in this room!
    if (targetObject === 'shadow' && this.entity && this.entity.currentRoom === currentRoomId) {
      this.entity.banish(currentHour);
      this.resolvedCount++;
      this.threatLevel = Math.max(0, this.threatLevel - 25);
      this.room.highlightReticle('shadow', true);

      return {
        success: true,
        anomaly: {
          name: 'Subject 7 (Entity Repelled)',
          targetObject: 'shadow',
          roomId: currentRoomId
        },
        isEntityBanish: true
      };
    }

    // 2. Check active room anomalies for this specific room and object
    let match = null;
    for (const [id, anomaly] of this.activeAnomalies.entries()) {
      if (anomaly.roomId === currentRoomId && anomaly.targetObject === targetObject) {
        match = anomaly;
        break;
      }
    }

    if (match) {
      // Correct report!
      this.activeAnomalies.delete(match.id);
      this.resolvedCount++;

      this.room.resolveAnomaly(match);
      this.room.highlightReticle(targetObject, true);
      this.sound.playReportSuccess();

      this.threatLevel = Math.max(0, this.threatLevel - 18);

      return {
        success: true,
        anomaly: match,
        isEntityBanish: false
      };
    } else {
      // False alarm!
      this.room.highlightReticle(targetObject, false);
      this.sound.playFalseAlarm();

      return {
        success: false,
        anomaly: null,
        isEntityBanish: false
      };
    }
  }

  /**
   * Updates threat level every frame based on active unresolved anomalies
   */
  updateThreat(dtSeconds, isEntityStalking) {
    if (this.activeAnomalies.size === 0 && !isEntityStalking) {
      this.threatLevel = Math.max(0, this.threatLevel - dtSeconds * 3.0);
    } else {
      let threatGain = 0;
      this.activeAnomalies.forEach((a) => {
        threatGain += a.threatWeight * 2.5;
      });
      if (isEntityStalking) {
        threatGain += 6.0; // Entity presence exerts strong psychological pressure
      }
      this.threatLevel = Math.min(100, this.threatLevel + threatGain * dtSeconds);
    }

    // Heartbeat urgency
    const urgency = this.threatLevel / 100;
    this.sound.updateHeartbeatRate(urgency);

    return this.threatLevel;
  }
}

if (typeof window !== 'undefined') {
  window.AnomalyManager = AnomalyManager;
}
