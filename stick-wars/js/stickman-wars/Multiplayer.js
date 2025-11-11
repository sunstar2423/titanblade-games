class MultiplayerManager {
    constructor(game) {
        this.game = game;
        this.socket = null;
        this.isHost = false;
        this.playerId = null;
        this.remotePlayers = new Map();
        this.gameRoom = null;

        // For this demo, we'll use a simple WebRTC peer-to-peer connection
        // In production, you'd want a proper game server
        this.peerConnection = null;
        this.dataChannel = null;
        this.isConnected = false;
    }

    // Simple local multiplayer (split-screen or turn-based)
    enableLocalMultiplayer() {
        this.createSecondPlayer();
        this.setupLocalControls();
    }

    createSecondPlayer() {
        // Create second player with different color and position
        const player2 = new StickFigure(this.game.scene, 5, 0, 5, 0x00ff00, true);
        player2.playerId = 'player2';
        this.game.players.push(player2);

        // Different weapon loadout for variety
        player2.switchWeapon(1); // Start with axe
    }

    setupLocalControls() {
        // Player 1: WASD + Mouse
        // Player 2: Arrow keys + NumPad

        const originalOnKeyDown = this.game.onKeyDown.bind(this.game);
        this.game.onKeyDown = (event) => {
            originalOnKeyDown(event);

            // Player 2 controls
            if (this.game.players.length > 1) {
                const player2 = this.game.players[1];

                switch(event.code) {
                    case 'ArrowUp':
                        this.game.keys['Player2Forward'] = true;
                        break;
                    case 'ArrowDown':
                        this.game.keys['Player2Backward'] = true;
                        break;
                    case 'ArrowLeft':
                        this.game.keys['Player2Left'] = true;
                        break;
                    case 'ArrowRight':
                        this.game.keys['Player2Right'] = true;
                        break;
                    case 'Numpad0':
                        player2.attack();
                        break;
                    case 'Numpad1':
                        player2.switchWeapon(0);
                        break;
                    case 'Numpad2':
                        player2.switchWeapon(1);
                        break;
                    case 'Numpad3':
                        player2.switchWeapon(2);
                        break;
                    case 'Numpad4':
                        player2.switchWeapon(3);
                        break;
                }
            }
        };

        const originalOnKeyUp = this.game.onKeyUp.bind(this.game);
        this.game.onKeyUp = (event) => {
            originalOnKeyUp(event);

            // Player 2 key releases
            switch(event.code) {
                case 'ArrowUp':
                    this.game.keys['Player2Forward'] = false;
                    break;
                case 'ArrowDown':
                    this.game.keys['Player2Backward'] = false;
                    break;
                case 'ArrowLeft':
                    this.game.keys['Player2Left'] = false;
                    break;
                case 'ArrowRight':
                    this.game.keys['Player2Right'] = false;
                    break;
            }
        };

        // Update the game's updatePlayer method to handle both players
        const originalUpdatePlayer = this.game.updatePlayer.bind(this.game);
        this.game.updatePlayer = (deltaTime) => {
            // Player 1 (original)
            originalUpdatePlayer(deltaTime);

            // Player 2
            if (this.game.players.length > 1) {
                const player2 = this.game.players[1];
                const moveSpeed = 5 * deltaTime;
                const direction = new THREE.Vector3();

                if (this.game.keys['Player2Forward']) direction.z -= 1;
                if (this.game.keys['Player2Backward']) direction.z += 1;
                if (this.game.keys['Player2Left']) direction.x -= 1;
                if (this.game.keys['Player2Right']) direction.x += 1;

                if (direction.length() > 0) {
                    direction.normalize();
                    player2.move(direction.x * moveSpeed, direction.z * moveSpeed);
                }
            }
        };
    }

    // WebRTC-based online multiplayer (simplified version)
    async createOnlineGame() {
        this.isHost = true;
        this.playerId = 'host';

        // Create offer
        this.peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        this.dataChannel = this.peerConnection.createDataChannel('gameData');
        this.setupDataChannel();

        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        // Display connection info for other player
        this.displayConnectionInfo(JSON.stringify(offer));

        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                // In a real implementation, send this via signaling server
                console.log('ICE candidate:', event.candidate);
            }
        };
    }

    async joinOnlineGame(offerString) {
        this.isHost = false;
        this.playerId = 'guest';

        this.peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        this.peerConnection.ondatachannel = (event) => {
            this.dataChannel = event.channel;
            this.setupDataChannel();
        };

        const offer = JSON.parse(offerString);
        await this.peerConnection.setRemoteDescription(offer);

        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        // Display answer for host
        this.displayConnectionInfo(JSON.stringify(answer));

        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('ICE candidate:', event.candidate);
            }
        };
    }

    setupDataChannel() {
        this.dataChannel.onopen = () => {
            this.isConnected = true;
            console.log('Data channel opened');
            this.onConnectionEstablished();
        };

        this.dataChannel.onmessage = (event) => {
            this.handleRemoteMessage(JSON.parse(event.data));
        };

        this.dataChannel.onclose = () => {
            this.isConnected = false;
            console.log('Data channel closed');
        };
    }

    onConnectionEstablished() {
        // Create remote player
        this.createRemotePlayer();

        // Start sending position updates
        this.startSyncLoop();
    }

    createRemotePlayer() {
        const remotePlayer = new StickFigure(
            this.game.scene,
            this.isHost ? 5 : -5,
            0,
            this.isHost ? 5 : -5,
            this.isHost ? 0x00ff00 : 0x0066ff,
            false
        );
        remotePlayer.playerId = this.isHost ? 'guest' : 'host';
        this.remotePlayers.set(remotePlayer.playerId, remotePlayer);
    }

    sendGameState() {
        if (!this.isConnected || !this.game.currentPlayer) return;

        const state = {
            type: 'playerUpdate',
            playerId: this.playerId,
            position: this.game.currentPlayer.group.position.toArray(),
            rotation: this.game.currentPlayer.group.rotation.toArray(),
            health: this.game.currentPlayer.health,
            weaponIndex: this.game.currentPlayer.currentWeaponIndex,
            isAttacking: this.game.currentPlayer.isAttacking
        };

        this.dataChannel.send(JSON.stringify(state));
    }

    handleRemoteMessage(data) {
        switch(data.type) {
            case 'playerUpdate':
                this.updateRemotePlayer(data);
                break;
            case 'attack':
                this.handleRemoteAttack(data);
                break;
            case 'damage':
                this.handleRemoteDamage(data);
                break;
        }
    }

    updateRemotePlayer(data) {
        const remotePlayer = this.remotePlayers.get(data.playerId);
        if (!remotePlayer) return;

        // Update position and rotation
        remotePlayer.group.position.fromArray(data.position);
        remotePlayer.group.rotation.fromArray(data.rotation);

        // Update health
        remotePlayer.health = data.health;

        // Update weapon
        if (data.weaponIndex !== remotePlayer.currentWeaponIndex) {
            remotePlayer.switchWeapon(data.weaponIndex);
        }

        // Handle attack
        if (data.isAttacking && !remotePlayer.isAttacking) {
            remotePlayer.attack();
        }
    }

    startSyncLoop() {
        const syncInterval = setInterval(() => {
            if (this.isConnected) {
                this.sendGameState();
            } else {
                clearInterval(syncInterval);
            }
        }, 1000 / 30); // 30 FPS sync rate
    }

    displayConnectionInfo(info) {
        // Create UI element to display connection info
        const infoDiv = document.createElement('div');
        infoDiv.style.position = 'absolute';
        infoDiv.style.top = '50%';
        infoDiv.style.left = '50%';
        infoDiv.style.transform = 'translate(-50%, -50%)';
        infoDiv.style.backgroundColor = 'rgba(0,0,0,0.9)';
        infoDiv.style.color = 'white';
        infoDiv.style.padding = '20px';
        infoDiv.style.borderRadius = '10px';
        infoDiv.style.maxWidth = '80%';
        infoDiv.style.zIndex = '1000';

        infoDiv.innerHTML = `
            <h3>${this.isHost ? 'Share this with other player:' : 'Send this back to host:'}</h3>
            <textarea style="width: 100%; height: 100px; resize: none;" readonly>${info}</textarea>
            <button onclick="this.parentElement.remove()">Close</button>
        `;

        document.body.appendChild(infoDiv);
    }
}

// Simple room-based matchmaking (for demonstration)
class GameLobby {
    constructor() {
        this.rooms = new Map();
        this.waitingPlayers = [];
    }

    createRoom(playerId) {
        const roomId = Math.random().toString(36).substr(2, 9);
        this.rooms.set(roomId, {
            id: roomId,
            host: playerId,
            players: [playerId],
            status: 'waiting'
        });
        return roomId;
    }

    joinRoom(roomId, playerId) {
        const room = this.rooms.get(roomId);
        if (!room || room.players.length >= 2) {
            return false;
        }

        room.players.push(playerId);
        if (room.players.length === 2) {
            room.status = 'full';
        }

        return true;
    }

    findMatch(playerId) {
        // Simple matchmaking: pair with first waiting player
        if (this.waitingPlayers.length > 0) {
            const otherPlayer = this.waitingPlayers.shift();
            const roomId = this.createRoom(otherPlayer);
            this.joinRoom(roomId, playerId);
            return roomId;
        } else {
            this.waitingPlayers.push(playerId);
            return null;
        }
    }
}