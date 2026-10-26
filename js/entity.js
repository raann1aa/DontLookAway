/**
 * Don't Look Away - Moving Entity System (Subject 7)
 * Autonomous graph-based movement through connected rooms, door interactions,
 * evidence leaving, and stalking behavior.
 */

class FacilityEntity {
  constructor(soundSystem) {
    this.sound = soundSystem;

    // Entity state
    this.currentRoom = 'basement';
    this.previousRoom = 'basement';
    this.targetRoom = null;
    this.moveTimer = 16;
    this.isBlocked = false;
    this.blockedDoorId = null;
    this.poundingTimer = 0;
    
    // Direct observation dynamics
    this.timeObserved = 0;
    this.stareAttackTriggered = false;

    // Environmental evidence & sensor tracking
    this.lastKnownRoom = 'basement';
    this.lastKnownTime = '00:00:00';
    this.recentEvidence = [];

    // Movement graph
    this.graph = {
      reception: ['corridor'],
      corridor: ['reception', 'lab', 'isolation', 'storage', 'basement'],
      lab: ['corridor'],
      isolation: ['corridor'],
      storage: ['corridor'],
      basement: ['corridor']
    };
  }

  reset() {
    this.currentRoom = 'basement';
    this.previousRoom = 'basement';
    this.targetRoom = null;
    this.moveTimer = 14 + Math.random() * 8;
    this.isBlocked = false;
    this.blockedDoorId = null;
    this.poundingTimer = 0;
    this.timeObserved = 0;
    this.stareAttackTriggered = false;
    this.lastKnownRoom = 'basement';
    this.lastKnownTime = '00:00:00';
    this.recentEvidence = [];
  }

  /**
   * Helper to identify which door connects two adjacent rooms
   */
  getConnectingDoorId(roomA, roomB) {
    const pair = [roomA, roomB].sort().join('_');
    if (pair === 'corridor_reception') return 'door_rec';
    if (pair === 'corridor_lab') return 'door_lab';
    if (pair === 'corridor_isolation') return 'door_iso';
    if (pair === 'corridor_storage') return 'door_sto';
    if (pair === 'basement_corridor') return 'door_bas';
    return null;
  }

  /**
   * Main entity update loop
   */
  update(dt, currentHour, activeCamId, doorStates, timeString) {
    const events = [];

    // 1. Direct Observation Mechanics
    if (this.currentRoom === activeCamId) {
      this.timeObserved += dt;
      // Staring at entity for too long (>7 seconds) provokes electrical attack
      if (this.timeObserved > 7.0 && !this.stareAttackTriggered) {
        this.stareAttackTriggered = true;
        events.push({
          type: 'STARE_OVERLOAD',
          room: this.currentRoom,
          message: `ENTITY PROVOKED: DIRECT OPTICAL SATURATION DETECTED ON [${activeCamId.toUpperCase()}].`
        });
        this.sound.playGlitch(1.8);
      }
    } else {
      this.timeObserved = 0;
      this.stareAttackTriggered = false;
    }

    // 2. Door Blocked Pounding Logic
    if (this.isBlocked) {
      this.poundingTimer -= dt;

      // Check if player unlocked the door while entity was pounding
      const doorId = this.blockedDoorId;
      if (doorId && doorStates[doorId] && !doorStates[doorId].isLocked) {
        // Door unlocked! Entity immediately rushes through
        this.isBlocked = false;
        this.blockedDoorId = null;
        this.previousRoom = this.currentRoom;
        this.currentRoom = this.targetRoom;
        this.targetRoom = null;
        this.moveTimer = this._calcMoveInterval(currentHour);

        this.lastKnownRoom = this.currentRoom;
        this.lastKnownTime = timeString;

        events.push({
          type: 'DOOR_BREACH',
          room: this.currentRoom,
          message: `ENTITY PASSED THROUGH UNLOCKED BULKHEAD INTO [${this.currentRoom.toUpperCase()}].`
        });
        this.sound.playGlitch(1.2);
        return events;
      }

      if (this.poundingTimer <= 0) {
        // Entity gave up pounding on this locked door, retreats to previous room or stays
        this.isBlocked = false;
        this.blockedDoorId = null;
        this.targetRoom = null;
        this.moveTimer = this._calcMoveInterval(currentHour);

        events.push({
          type: 'DOOR_RETREAT',
          room: this.currentRoom,
          message: `BULKHEAD HELD. DISTURBANCE RETREATED FROM [${this.currentRoom.toUpperCase()}].`
        });
      }
      return events;
    }

    // 3. Movement Timer Countdown
    this.moveTimer -= dt;
    if (this.moveTimer <= 0) {
      const moveResult = this.attemptMove(currentHour, activeCamId, doorStates, timeString);
      if (moveResult) {
        events.push(moveResult);
      }
    }

    return events;
  }

  _calcMoveInterval(hour) {
    // Hour 0: 16-24s
    // Hour 1: 14-20s
    // Hour 2: 12-17s
    // Hour 3: 10-14s
    // Hour 4: 8-12s
    // Hour 5: 6-9s
    const min = Math.max(5, 16 - hour * 2.2);
    const max = Math.max(8, 24 - hour * 3.0);
    return min + Math.random() * (max - min);
  }

  attemptMove(currentHour, activeCamId, doorStates, timeString) {
    const candidates = this.graph[this.currentRoom] || [];
    if (candidates.length === 0) return null;

    // Pick target room
    // Favor moving into or out of corridor
    let target = candidates[Math.floor(Math.random() * candidates.length)];
    if (candidates.length > 1 && target === this.previousRoom && Math.random() < 0.6) {
      // Pick alternative if available to explore deeper
      const alts = candidates.filter(r => r !== this.previousRoom);
      if (alts.length > 0) target = alts[Math.floor(Math.random() * alts.length)];
    }

    this.targetRoom = target;
    const doorId = this.getConnectingDoorId(this.currentRoom, target);

    // Check if connecting door is locked
    if (doorId && doorStates[doorId] && doorStates[doorId].isLocked) {
      // Door is locked! Entity is stopped and pounds on the bulkhead!
      this.isBlocked = true;
      this.blockedDoorId = doorId;
      this.poundingTimer = 6 + Math.random() * 6; // pounds for 6-12 seconds

      this.lastKnownRoom = this.currentRoom;
      this.lastKnownTime = timeString;

      this.sound.playDoorPound();
      return {
        type: 'DOOR_BLOCKED',
        room: this.currentRoom,
        doorId: doorId,
        message: `AUDITORY SENSOR: HEAVY IMPACT ON LOCKED ${doorStates[doorId].label}.`
      };
    }

    // Door is open - successful transit!
    const fromRoom = this.currentRoom;
    this.previousRoom = fromRoom;
    this.currentRoom = target;
    this.targetRoom = null;
    this.moveTimer = this._calcMoveInterval(currentHour);

    this.lastKnownRoom = target;
    this.lastKnownTime = timeString;

    // Leave physical evidence in origin room
    this.leaveEvidence(fromRoom, target);

    // Check if player witnessed the move
    if (fromRoom === activeCamId) {
      this.sound.playGlitch(0.9);
      return {
        type: 'ENTITY_DEPARTED',
        room: fromRoom,
        message: `OPTICAL NOTICE: MOVEMENT VACATED [${fromRoom.toUpperCase()}].`
      };
    } else if (target === activeCamId) {
      this.sound.playWhisper();
      this.sound.playGlitch(1.1);
      return {
        type: 'ENTITY_ARRIVED',
        room: target,
        message: `OPTICAL NOTICE: MOVEMENT ENTERED [${target.toUpperCase()}].`
      };
    }

    return {
      type: 'ENTITY_TRANSIT',
      room: target,
      message: `CORRIDOR VIBRATION DETECTED BETWEEN [${fromRoom.toUpperCase()}] AND [${target.toUpperCase()}].`
    };
  }

  leaveEvidence(fromRoom, toRoom) {
    const evidenceTypes = [
      'Cold air thermal drop (-6°C)',
      'Fresh viscous black scuff on floorboards',
      'Door left slightly ajar with dark residue',
      'Video transmission frequency stutter',
      'Distant dragging sound in partition wall'
    ];
    const item = {
      fromRoom,
      toRoom,
      type: evidenceTypes[Math.floor(Math.random() * evidenceTypes.length)],
      time: this.lastKnownTime
    };
    this.recentEvidence.unshift(item);
    if (this.recentEvidence.length > 6) {
      this.recentEvidence.pop();
    }
  }

  /**
   * Called when player accurately reports ENTITY/SHADOW in current room
   */
  banish(currentHour) {
    // Retreats to adjacent room
    const candidates = this.graph[this.currentRoom] || ['basement'];
    const retreatRoom = candidates[Math.floor(Math.random() * candidates.length)];
    
    this.previousRoom = this.currentRoom;
    this.currentRoom = retreatRoom;
    this.moveTimer = this._calcMoveInterval(currentHour) + 6; // gains extra grace time
    this.timeObserved = 0;
    this.stareAttackTriggered = false;

    this.sound.playReportSuccess();
    this.sound.playGlitch(1.4);
  }
}

if (typeof window !== 'undefined') {
  window.FacilityEntity = FacilityEntity;
}
