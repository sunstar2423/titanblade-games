class Game3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.players = [];
        this.keys = {};
        this.isPointerLocked = false;
        this.isMouseDown = false;
        this.cameraMode = 'third'; // 'first' or 'third'

        this.currentPlayer = null;
        this.enemies = [];
        this.neutralTanks = []; // Neutral tanks that attack everyone
        this.allyTanks = []; // Converted tanks that fight for the player
        this.arrows = [];
        this.bombs = []; // Thrown bombs
        this.coins = []; // Collectible coins dropped by enemies
        this.playerCoins = 0; // Coins currently held
        this.totalCoinsEarned = 0; // Lifetime coins (for the victory screen)
        this.environment = null;

        this.clock = new THREE.Clock();

        // Map boundaries (ground is 100x100, so -50 to 50)
        this.mapBoundary = {
            minX: -48,
            maxX: 48,
            minZ: -48,
            maxZ: 48
        };

        // Wave system
        this.currentWave = 1;
        this.maxWaves = 5;
        this.waveInProgress = false;
        this.waveCompleteTimer = 0;
        this.gameWon = false;
        this.gameOver = false;
        this.paused = false;

        // Weapon unlock costs (auto-purchased when affordable)
        this.rifleCost = 100;
        this.bombCost = 150;

        this.animate = this.animate.bind(this);
    }

    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLighting();
        this.setupGround();
        this.setupEnvironment();
        this.setupControls();

        this.createPlayer();
        this.createNeutralTanks();
        this.startWave(1);
        this.updateCoinUI();

        this.animate();
    }

    createNeutralTanks() {
        // Powerful neutral tanks that attack everyone - defeat one to convert it to your side
        const tankCount = 2;

        for (let i = 0; i < tankCount; i++) {
            // Spawn at opposite corners
            const x = i === 0 ? -30 : 30;
            const z = i === 0 ? -30 : 30;

            const neutralTank = new StickFigure(this.scene, x, 0, z, 'neutralTank', false, true);

            // Make tank bigger and more intimidating
            neutralTank.group.scale.set(1.5, 1.5, 1.5);

            // Give it the hammer (most powerful melee weapon)
            neutralTank.switchWeapon(3);

            this.neutralTanks.push(neutralTank);

            neutralTank.aiTarget = null;
            neutralTank.aiUpdateTimer = Math.random() * 2;
        }
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 10);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        const container = document.getElementById('gameContainer');
        if (container) {
            container.appendChild(this.renderer.domElement);
        } else {
            console.error('gameContainer element not found');
            document.body.appendChild(this.renderer.domElement);
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
    }

    setupGround() {
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    setupEnvironment() {
        this.environment = new Environment(this.scene);
        this.environment.createForest();
    }

    setupControls() {
        // Wrappers (instead of bound references) so MultiplayerManager can override
        // the handlers at runtime and the listeners pick up the new versions.
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mouseup', (e) => this.onMouseUp(e));
        document.addEventListener('pointerlockchange', () => this.onPointerLockChange());

        // Request pointer lock on first click (only on non-touch devices)
        const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

        if (!isTouchDevice) {
            this.renderer.domElement.addEventListener('click', () => {
                if (!this.isPointerLocked) {
                    this.renderer.domElement.requestPointerLock();
                }
            });
        }
    }

    onKeyDown(event) {
        this.keys[event.code] = true;

        // Weapon switching (1-7)
        const digitMatch = /^Digit([1-7])$/.exec(event.code);
        if (digitMatch && this.currentPlayer) {
            this.currentPlayer.switchWeapon(parseInt(digitMatch[1]) - 1);
        }

        // Camera mode toggle with C key
        if (event.code === 'KeyC') {
            this.toggleCameraMode();
        }

        // Reload with R key
        if (event.code === 'KeyR' && this.currentPlayer) {
            this.currentPlayer.reloadWeapon();
        }

        // Pause with P key
        if (event.code === 'KeyP') {
            this.togglePause();
        }
    }

    onKeyUp(event) {
        this.keys[event.code] = false;
    }

    onMouseMove(event) {
        if (this.isPointerLocked && this.currentPlayer && !this.paused) {
            const sensitivity = 0.002;

            if (this.cameraMode === 'third') {
                // Third person: rotate player and camera around player
                this.currentPlayer.group.rotation.y -= event.movementX * sensitivity;

                // Vertical look (camera pitch)
                this.camera.rotation.x -= event.movementY * sensitivity;
                this.camera.rotation.x = Math.max(-Math.PI/3, Math.min(Math.PI/3, this.camera.rotation.x));
            } else {
                // First person: standard first person controls
                this.currentPlayer.rotate(
                    -event.movementX * sensitivity,
                    -event.movementY * sensitivity
                );
            }
        }
    }

    onMouseDown(event) {
        if (event.button !== 0) return;
        this.isMouseDown = true;
        if (this.isPointerLocked && this.currentPlayer && !this.paused && !this.gameOver && !this.gameWon) {
            this.currentPlayer.attack(this);
        }
    }

    onMouseUp(event) {
        if (event.button === 0) {
            this.isMouseDown = false;
        }
    }

    onPointerLockChange() {
        this.isPointerLocked = document.pointerLockElement === this.renderer.domElement;
    }

    togglePause() {
        if (this.gameOver || this.gameWon) return;
        this.paused = !this.paused;
        const overlay = document.getElementById('pauseOverlay');
        if (overlay) {
            overlay.style.display = this.paused ? 'flex' : 'none';
        }
    }

    createPlayer() {
        // Create player as a warrior
        this.currentPlayer = new StickFigure(this.scene, 0, 0, 5, 'warrior', true);
        this.players.push(this.currentPlayer);

        // Position camera behind player - zoomed out
        this.currentPlayer.group.add(this.camera);
        this.camera.position.set(0, 4, 8);
    }

    startWave(waveNumber) {
        if (this.gameOver || this.gameWon) return;

        this.currentWave = waveNumber;
        this.waveInProgress = true;

        // Drop dead enemies from the list so it doesn't grow forever
        this.enemies = this.enemies.filter(e => e.health > 0);

        // Restore player health to full between waves
        if (this.currentPlayer) {
            this.currentPlayer.health = this.currentPlayer.maxHealth;
            this.currentPlayer.updateHealthUI();
        }

        // Update UI
        document.getElementById('waveNumber').textContent = `${waveNumber}/${this.maxWaves}`;

        const enemyCount = this.createEnemies(waveNumber);

        this.showWaveMessage(`Wave ${waveNumber} Starting!`, `Health restored • ${enemyCount} enemies incoming`);
        if (window.Sound) window.Sound.waveStart();
    }

    createEnemies(waveNumber) {
        const enemyTypes = ['rogue', 'mage', 'tank', 'archer', 'warrior'];

        // Starting weapon per enemy type (melee types charge, ranged types kite)
        const weaponByType = {
            rogue: 0,        // sword
            warrior: 1,      // axe
            tank: 3,         // hammer
            skateboarder: 2, // spear (fast drive-by attacker)
            archer: 4,       // crossbow
            mage: 4          // crossbow
        };

        // More enemies each wave (3 + 2 per wave)
        const enemyCount = 3 + (waveNumber * 2);

        // Enemy scaling per wave
        const healthMultiplier = 1 + (waveNumber - 1) * 0.15;
        const damageMultiplier = 1 + (waveNumber - 1) * 0.10;

        // Fast skateboarders show up more often in later waves
        const skateboarderCount = Math.min(3, 1 + Math.floor((waveNumber - 1) / 2));

        const playerPos = this.currentPlayer ? this.currentPlayer.group.position : new THREE.Vector3();

        for (let i = 0; i < enemyCount; i++) {
            // Spawn in a ring around the player so nothing pops in on top of them
            let x = 0, z = 0, attempts = 0;
            do {
                const angle = Math.random() * Math.PI * 2;
                const radius = 15 + Math.random() * 12;
                x = playerPos.x + Math.cos(angle) * radius;
                z = playerPos.z + Math.sin(angle) * radius;
                x = Math.max(this.mapBoundary.minX, Math.min(this.mapBoundary.maxX, x));
                z = Math.max(this.mapBoundary.minZ, Math.min(this.mapBoundary.maxZ, z));
                attempts++;
            } while (this.environment.checkCollision(new THREE.Vector3(x, 0, z), 1) && attempts < 10);

            const enemyType = i < skateboarderCount
                ? 'skateboarder'
                : enemyTypes[(i - skateboarderCount) % enemyTypes.length];

            const enemy = new StickFigure(this.scene, x, 0, z, enemyType, false);

            // Scale enemy stats based on wave
            enemy.maxHealth = Math.floor(enemy.maxHealth * healthMultiplier);
            enemy.health = enemy.maxHealth;
            enemy.damageMultiplier *= damageMultiplier;

            enemy.aiTarget = this.currentPlayer;
            enemy.aiUpdateTimer = Math.random() * 2; // Randomize update timing
            enemy.prefersRanged = (enemyType === 'archer' || enemyType === 'mage');
            enemy.switchWeapon(weaponByType[enemyType] !== undefined ? weaponByType[enemyType] : 0);

            this.enemies.push(enemy);
        }

        return enemyCount;
    }

    createCoin(position, offsetX = 0, offsetZ = 0) {
        // Create a spinning golden coin
        const coinGroup = new THREE.Group();

        const coinGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.06, 16);
        const coinMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700, emissive: 0x886600 });
        const coin = new THREE.Mesh(coinGeometry, coinMaterial);
        coin.castShadow = true;
        coinGroup.add(coin);

        const rimGeometry = new THREE.TorusGeometry(0.2, 0.03, 8, 16);
        const rimMaterial = new THREE.MeshLambertMaterial({ color: 0xFFA500 });
        const rim = new THREE.Mesh(rimGeometry, rimMaterial);
        rim.rotation.x = Math.PI / 2;
        coinGroup.add(rim);

        coinGroup.position.copy(position);
        coinGroup.position.x += offsetX;
        coinGroup.position.z += offsetZ;
        coinGroup.position.y = 0.4;

        const coinData = {
            group: coinGroup,
            rotation: 0,
            bobPhase: Math.random() * Math.PI * 2,
            collected: false
        };

        this.scene.add(coinGroup);
        this.coins.push(coinData);
    }

    checkDeadEnemies() {
        // Check for dead enemies and spawn coins
        this.enemies.forEach(enemy => {
            if (enemy.health <= 0 && enemy.deathPosition && !enemy.coinDropped) {
                enemy.coinDropped = true;

                // Drop 5-10 coins per enemy
                const numCoins = 5 + Math.floor(Math.random() * 6);

                // Spread coins in a circle around the death position
                for (let i = 0; i < numCoins; i++) {
                    const angle = (Math.PI * 2 * i) / numCoins + (Math.random() - 0.5) * 0.5;
                    const radius = 0.8 + Math.random() * 0.8;
                    this.createCoin(enemy.deathPosition, Math.cos(angle) * radius, Math.sin(angle) * radius);
                }
            }
        });
    }

    checkTankConversions() {
        // Check if any neutral tanks have been converted to allies
        for (let i = this.neutralTanks.length - 1; i >= 0; i--) {
            const tank = this.neutralTanks[i];
            if (tank.isAlly) {
                this.neutralTanks.splice(i, 1);
                this.allyTanks.push(tank);
            }
        }
    }

    checkWaveComplete() {
        if (!this.waveInProgress || this.gameWon || this.gameOver) return;

        const aliveEnemies = this.enemies.filter(enemy => enemy.health > 0).length;

        if (aliveEnemies === 0) {
            this.waveInProgress = false;
            this.waveCompleteTimer = 3; // 3 second delay before next wave

            if (this.currentWave >= this.maxWaves) {
                this.gameWon = true;
                this.showVictoryMessage();
                if (window.Sound) window.Sound.victory();
            } else {
                this.showWaveMessage(`Wave ${this.currentWave} Complete!`, 'Next wave in 3 seconds...');
            }
        }
    }

    checkPlayerDefeat() {
        if (!this.gameOver && this.currentPlayer && this.currentPlayer.health <= 0) {
            this.gameOver = true;
            if (window.Sound) window.Sound.defeat();
        }
    }

    showWaveMessage(message, subMessage = '') {
        // Remove old message if exists
        const oldMessage = document.getElementById('waveMessage');
        if (oldMessage) oldMessage.remove();

        const messageDiv = document.createElement('div');
        messageDiv.id = 'waveMessage';
        messageDiv.style.position = 'absolute';
        messageDiv.style.top = '30%';
        messageDiv.style.left = '50%';
        messageDiv.style.transform = 'translate(-50%, -50%)';
        messageDiv.style.backgroundColor = 'rgba(0,0,0,0.8)';
        messageDiv.style.color = '#FFD700';
        messageDiv.style.padding = '20px 40px';
        messageDiv.style.borderRadius = '10px';
        messageDiv.style.fontSize = '32px';
        messageDiv.style.fontWeight = 'bold';
        messageDiv.style.zIndex = '500';
        messageDiv.style.textAlign = 'center';
        messageDiv.style.border = '3px solid #FFD700';
        messageDiv.textContent = message;

        if (subMessage) {
            const sub = document.createElement('div');
            sub.textContent = subMessage;
            sub.style.fontSize = '18px';
            sub.style.color = '#FFFFFF';
            sub.style.marginTop = '8px';
            sub.style.fontWeight = 'normal';
            messageDiv.appendChild(sub);
        }

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }

    showVictoryMessage() {
        // Remove any existing messages
        const oldMessage = document.getElementById('waveMessage');
        if (oldMessage) oldMessage.remove();

        const messageDiv = document.createElement('div');
        messageDiv.style.position = 'absolute';
        messageDiv.style.top = '50%';
        messageDiv.style.left = '50%';
        messageDiv.style.transform = 'translate(-50%, -50%)';
        messageDiv.style.backgroundColor = 'rgba(0,128,0,0.95)';
        messageDiv.style.color = 'white';
        messageDiv.style.padding = '40px';
        messageDiv.style.borderRadius = '15px';
        messageDiv.style.fontSize = '36px';
        messageDiv.style.fontWeight = 'bold';
        messageDiv.style.zIndex = '1000';
        messageDiv.style.textAlign = 'center';
        messageDiv.style.border = '5px solid gold';

        const title = document.createElement('h1');
        title.textContent = '🎉 VICTORY! 🎉';
        title.style.margin = '0 0 20px 0';
        title.style.fontSize = '48px';
        messageDiv.appendChild(title);

        const text = document.createElement('p');
        text.textContent = `All ${this.maxWaves} waves defeated!`;
        text.style.margin = '0 0 10px 0';
        messageDiv.appendChild(text);

        const stats = document.createElement('p');
        stats.textContent = `🪙 Coins collected: ${this.totalCoinsEarned}`;
        stats.style.margin = '0 0 30px 0';
        stats.style.fontSize = '24px';
        messageDiv.appendChild(stats);

        const button = document.createElement('button');
        button.textContent = 'Play Again';
        button.style.padding = '15px 30px';
        button.style.fontSize = '24px';
        button.style.backgroundColor = '#FFD700';
        button.style.color = '#000';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.fontWeight = 'bold';
        button.onclick = () => location.reload();
        messageDiv.appendChild(button);

        document.body.appendChild(messageDiv);

        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
    }

    updatePlayer(deltaTime) {
        if (!this.currentPlayer || this.currentPlayer.health <= 0) return;

        const moveSpeed = 5 * deltaTime;
        const direction = new THREE.Vector3();

        if (this.keys['KeyW']) direction.z -= 1;
        if (this.keys['KeyS']) direction.z += 1;
        if (this.keys['KeyA']) direction.x -= 1;
        if (this.keys['KeyD']) direction.x += 1;

        if (direction.length() === 0) return;

        direction.normalize();

        // Rotate the input by the player's facing so W always moves forward
        direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.currentPlayer.group.rotation.y);

        const pos = this.currentPlayer.group.position;
        const tryStep = (dx, dz) => {
            const nx = Math.max(this.mapBoundary.minX, Math.min(this.mapBoundary.maxX, pos.x + dx));
            const nz = Math.max(this.mapBoundary.minZ, Math.min(this.mapBoundary.maxZ, pos.z + dz));
            if (!this.environment.checkCollision(new THREE.Vector3(nx, 0, nz), 0.5)) {
                this.currentPlayer.move(nx - pos.x, nz - pos.z);
                return true;
            }
            return false;
        };

        // Try the full move first, then slide along each axis if blocked
        const stepX = direction.x * moveSpeed;
        const stepZ = direction.z * moveSpeed;
        if (!tryStep(stepX, stepZ)) {
            if (!tryStep(stepX, 0)) {
                tryStep(0, stepZ);
            }
        }
    }

    // Which characters this attacker is allowed to damage
    getTargetsFor(owner) {
        const alivePlayers = this.players.filter(p => p.health > 0);
        if (owner.isNeutral) {
            // Neutral tanks attack everyone except other neutral tanks
            return [...alivePlayers, ...this.enemies, ...this.neutralTanks.filter(t => t !== owner), ...this.allyTanks];
        }
        if (owner.isAlly) {
            // Ally tanks only attack enemies
            return [...this.enemies];
        }
        if (this.players.includes(owner)) {
            // Players hit enemies and neutral tanks (not ally tanks)
            return [...this.enemies, ...this.neutralTanks];
        }
        // Enemies work together - they hit players, neutral tanks and ally tanks
        return [...alivePlayers, ...this.neutralTanks, ...this.allyTanks];
    }

    chooseTarget(char) {
        let potentialTargets;
        const alivePlayers = this.players.filter(p => p.health > 0);

        if (char.isAlly) {
            potentialTargets = this.enemies.filter(e => e.health > 0);
        } else if (char.isNeutral) {
            potentialTargets = [
                ...alivePlayers,
                ...this.enemies.filter(e => e.health > 0),
                ...this.neutralTanks.filter(t => t !== char && t.health > 0)
            ];
        } else {
            potentialTargets = [
                ...alivePlayers,
                ...this.neutralTanks.filter(t => t.health > 0),
                ...this.allyTanks.filter(t => t.health > 0)
            ];
        }

        let closestTarget = null;
        let closestDistance = Infinity;

        potentialTargets.forEach(target => {
            const dist = char.group.position.distanceTo(target.group.position);
            if (dist < closestDistance) {
                closestDistance = dist;
                closestTarget = target;
            }
        });

        return closestTarget;
    }

    // Move an AI character with environment collision (slides along obstacles)
    tryMoveAI(char, dx, dz) {
        const adx = dx * char.speedMultiplier;
        const adz = dz * char.speedMultiplier;
        const pos = char.group.position;
        const clear = (x, z) => !this.environment.checkCollision(new THREE.Vector3(pos.x + x, 0, pos.z + z), 0.5);

        if (clear(adx, adz)) {
            pos.x += adx;
            pos.z += adz;
            char.isWalking = true;
        } else if (clear(adx, 0)) {
            pos.x += adx;
            char.isWalking = true;
        } else if (clear(0, adz)) {
            pos.z += adz;
            char.isWalking = true;
        }

        this.clampToMapBoundaries(char);
    }

    updateAICharacter(char, deltaTime) {
        if (char.health <= 0) return;

        char.aiUpdateTimer -= deltaTime;
        if (char.aiUpdateTimer <= 0) {
            char.aiUpdateTimer = 1.5 + Math.random();
            char.aiTarget = this.chooseTarget(char);
        }

        const target = char.aiTarget;
        if (!target || target.health <= 0) return;

        const charPos = char.group.position;
        const targetPos = target.group.position;
        const distance = charPos.distanceTo(targetPos);

        const direction = new THREE.Vector3().subVectors(targetPos, charPos);
        direction.y = 0;
        direction.normalize();

        const attackRange = char.currentWeapon ? char.currentWeapon.range : 2.0;
        const step = 2 * deltaTime;

        if (char.prefersRanged) {
            // Ranged enemies keep their distance and kite
            if (distance < 5) {
                this.tryMoveAI(char, -direction.x * step, -direction.z * step);
            } else if (distance > attackRange * 0.9) {
                this.tryMoveAI(char, direction.x * step, direction.z * step);
            }
            if (distance <= attackRange && char.attackCooldown <= 0 && Math.random() < deltaTime * 1.2) {
                char.attack(this);
            }
        } else {
            // Melee characters charge in
            if (distance > attackRange * 0.7) {
                this.tryMoveAI(char, direction.x * step, direction.z * step);
            } else if (char.attackCooldown <= 0 && Math.random() < deltaTime * 1.5) {
                char.attack(this);
            }
        }

        char.group.lookAt(targetPos.x, charPos.y, targetPos.z);
    }

    updateEnemies(deltaTime) {
        this.enemies.forEach(enemy => this.updateAICharacter(enemy, deltaTime));
    }

    updateNeutralTanks(deltaTime) {
        this.neutralTanks.forEach(tank => this.updateAICharacter(tank, deltaTime));
    }

    updateAllyTanks(deltaTime) {
        this.allyTanks.forEach(tank => this.updateAICharacter(tank, deltaTime));
    }

    // Keep enemies from stacking on the same spot
    applySeparation(characters) {
        const minDist = 1.0;
        for (let i = 0; i < characters.length; i++) {
            const a = characters[i];
            if (a.health <= 0) continue;
            for (let j = i + 1; j < characters.length; j++) {
                const b = characters[j];
                if (b.health <= 0) continue;

                const dx = b.group.position.x - a.group.position.x;
                const dz = b.group.position.z - a.group.position.z;
                const distSq = dx * dx + dz * dz;
                if (distSq > 0.0001 && distSq < minDist * minDist) {
                    const dist = Math.sqrt(distSq);
                    const push = (minDist - dist) * 0.5;
                    const nx = dx / dist;
                    const nz = dz / dist;
                    a.group.position.x -= nx * push;
                    a.group.position.z -= nz * push;
                    b.group.position.x += nx * push;
                    b.group.position.z += nz * push;
                }
            }
        }
    }

    checkCollisions() {
        // Resolve melee strikes. Each swing lands at most once, at the moment
        // the strike animation connects (meleeHitPending is set by StickFigure).
        const allCombatants = [...this.players, ...this.enemies, ...this.neutralTanks, ...this.allyTanks];

        allCombatants.forEach(attacker => {
            if (!attacker.meleeHitPending) return;
            attacker.meleeHitPending = false;

            if (!attacker.currentWeapon || attacker.health <= 0) return;

            const weapon = attacker.currentWeapon;
            const targets = this.getTargetsFor(attacker);
            let hitSomething = false;

            targets.forEach(target => {
                if (target.health <= 0) return;

                const distance = attacker.group.position.distanceTo(target.group.position);
                if (distance >= weapon.range) return;

                // The controlled player only hits what they're facing
                if (attacker === this.currentPlayer) {
                    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(attacker.group.quaternion);
                    const toTarget = new THREE.Vector3().subVectors(target.group.position, attacker.group.position).normalize();
                    if (forward.dot(toTarget) < 0.25) return;
                }

                const damage = Combat.calculateDamage(attacker, weapon);
                target.takeDamage(damage);
                hitSomething = true;

                Combat.createBloodEffect(this.scene, target.group.position.clone());
                Combat.showDamageNumber(this.scene, target.group.position.clone(), damage);
            });

            if (hitSomething && window.Sound) {
                window.Sound.hit();
            }
        });
    }

    updateCoins(deltaTime) {
        if (!this.currentPlayer) return;
        const playerPos = this.currentPlayer.group.position;

        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coinData = this.coins[i];
            if (coinData.collected) continue;

            // Spin the coin
            coinData.rotation += deltaTime * 3;
            coinData.group.rotation.y = coinData.rotation;

            // Bob up and down
            coinData.bobPhase += deltaTime * 2;
            coinData.group.position.y = 0.5 + Math.sin(coinData.bobPhase) * 0.15;

            const distance = playerPos.distanceTo(coinData.group.position);

            // Magnet effect - nearby coins drift toward the player
            if (distance < 3.5 && distance > 1.0) {
                const dir = new THREE.Vector3().subVectors(playerPos, coinData.group.position);
                dir.y = 0;
                dir.normalize();
                coinData.group.position.x += dir.x * 6 * deltaTime;
                coinData.group.position.z += dir.z * 6 * deltaTime;
            }

            if (distance < 1.2) {
                // Collect the coin!
                this.playerCoins += 1;
                this.totalCoinsEarned += 1;
                coinData.collected = true;

                if (window.Sound) window.Sound.coin();

                // Auto-unlock weapons when affordable
                if (!this.currentPlayer.hasRifle && this.playerCoins >= this.rifleCost) {
                    this.playerCoins -= this.rifleCost;
                    this.currentPlayer.unlockRifle();
                    this.showRifleUnlockedMessage();
                    if (window.Sound) window.Sound.unlock();
                } else if (this.currentPlayer.hasRifle && !this.currentPlayer.hasBomb && this.playerCoins >= this.bombCost) {
                    this.playerCoins -= this.bombCost;
                    this.currentPlayer.unlockBomb();
                    this.showBombUnlockedMessage();
                    if (window.Sound) window.Sound.unlock();
                }

                this.updateCoinUI();

                this.scene.remove(coinData.group);
                this.coins.splice(i, 1);
            }
        }
    }

    updateCoinUI() {
        const coinCount = document.getElementById('coinCount');
        if (coinCount) coinCount.textContent = this.playerCoins;

        const goal = document.getElementById('coinGoal');
        if (goal && this.currentPlayer) {
            if (!this.currentPlayer.hasRifle) {
                goal.textContent = ` / ${this.rifleCost} unlocks Rifle`;
            } else if (!this.currentPlayer.hasBomb) {
                goal.textContent = ` / ${this.bombCost} unlocks Bomb`;
            } else {
                goal.textContent = '';
            }
        }
    }

    showRifleUnlockedMessage() {
        const oldMessage = document.getElementById('rifleMessage');
        if (oldMessage) oldMessage.remove();

        // Make weapon slot 6 visible
        const weaponSlot6 = document.querySelector('[data-weapon="5"]');
        if (weaponSlot6) {
            weaponSlot6.style.opacity = '1';
            weaponSlot6.style.border = '2px solid #FFD700';
            const label = weaponSlot6.querySelector('small');
            if (label) label.textContent = 'Rifle';
        }

        const messageDiv = document.createElement('div');
        messageDiv.id = 'rifleMessage';
        messageDiv.style.position = 'absolute';
        messageDiv.style.top = '40%';
        messageDiv.style.left = '50%';
        messageDiv.style.transform = 'translate(-50%, -50%)';
        messageDiv.style.backgroundColor = 'rgba(0,100,0,0.9)';
        messageDiv.style.color = '#FFD700';
        messageDiv.style.padding = '30px 50px';
        messageDiv.style.borderRadius = '15px';
        messageDiv.style.fontSize = '36px';
        messageDiv.style.fontWeight = 'bold';
        messageDiv.style.zIndex = '500';
        messageDiv.style.textAlign = 'center';
        messageDiv.style.border = '4px solid #FFD700';
        messageDiv.innerHTML = '🎯 RIFLE UNLOCKED! 🎯<br><span style="font-size: 24px;">Press 6 to equip<br>30 rounds | Long range | Fast fire</span>';

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }

    showBombUnlockedMessage() {
        const oldMessage = document.getElementById('bombMessage');
        if (oldMessage) oldMessage.remove();

        // Make weapon slot 7 visible
        const weaponSlot7 = document.querySelector('[data-weapon="6"]');
        if (weaponSlot7) {
            weaponSlot7.style.opacity = '1';
            weaponSlot7.style.border = '2px solid #FF4500';
            const label = weaponSlot7.querySelector('small');
            if (label) label.textContent = 'Bomb';
        }

        const messageDiv = document.createElement('div');
        messageDiv.id = 'bombMessage';
        messageDiv.style.position = 'absolute';
        messageDiv.style.top = '40%';
        messageDiv.style.left = '50%';
        messageDiv.style.transform = 'translate(-50%, -50%)';
        messageDiv.style.backgroundColor = 'rgba(100,0,0,0.9)';
        messageDiv.style.color = '#FF4500';
        messageDiv.style.padding = '30px 50px';
        messageDiv.style.borderRadius = '15px';
        messageDiv.style.fontSize = '36px';
        messageDiv.style.fontWeight = 'bold';
        messageDiv.style.zIndex = '500';
        messageDiv.style.textAlign = 'center';
        messageDiv.style.border = '4px solid #FF4500';
        messageDiv.innerHTML = '💣 BOMB UNLOCKED! 💣<br><span style="font-size: 24px;">Press 7 to equip<br>5 bombs | Area damage | Massive explosion</span>';

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }

    animate() {
        requestAnimationFrame(this.animate);

        // Clamp delta so a backgrounded tab doesn't cause huge jumps
        const deltaTime = Math.min(this.clock.getDelta(), 0.1);

        if (!this.paused && !this.gameOver && !this.gameWon) {
            this.updatePlayer(deltaTime);

            // Hold to attack (auto-fire; weapon cooldowns limit the rate)
            if (this.isMouseDown && this.isPointerLocked && this.currentPlayer && this.currentPlayer.health > 0) {
                this.currentPlayer.attack(this);
            }

            this.updateEnemies(deltaTime);
            this.updateNeutralTanks(deltaTime);
            this.updateAllyTanks(deltaTime);
            this.applySeparation(this.enemies);
            this.updateArrows(deltaTime);
            this.updateBombs(deltaTime);
            this.updateCoins(deltaTime);
            this.checkCollisions();
            this.checkDeadEnemies();
            this.checkTankConversions();
            this.checkWaveComplete();
            this.checkPlayerDefeat();

            // Update wave timer
            if (!this.waveInProgress && this.waveCompleteTimer > 0 && !this.gameWon) {
                this.waveCompleteTimer -= deltaTime;
                if (this.waveCompleteTimer <= 0) {
                    this.startWave(this.currentWave + 1);
                }
            }

            // Update all characters; pass the camera position so health bars can face it
            const cameraWorldPos = new THREE.Vector3();
            this.camera.getWorldPosition(cameraWorldPos);
            [...this.players, ...this.enemies, ...this.neutralTanks, ...this.allyTanks].forEach(character => {
                character.update(deltaTime, cameraWorldPos);
            });

            // Update environment effects (wind)
            if (this.environment) {
                this.environment.addWindEffect();
            }
        }

        this.renderer.render(this.scene, this.camera);
    }

    updateArrows(deltaTime) {
        for (let i = this.arrows.length - 1; i >= 0; i--) {
            const arrow = this.arrows[i];
            arrow.update(deltaTime);

            const hit = arrow.checkCollision(this.getTargetsFor(arrow.owner));

            if (hit) {
                // Apply the shooter's damage multiplier with a little variance
                const damage = Math.max(1, Math.floor(
                    hit.damage * (arrow.owner.damageMultiplier || 1) * (0.85 + Math.random() * 0.3)
                ));
                hit.target.takeDamage(damage);

                Combat.createBloodEffect(this.scene, hit.target.group.position.clone());
                Combat.showDamageNumber(this.scene, hit.target.group.position.clone(), damage);

                if (this.players.includes(arrow.owner) && window.Sound) {
                    window.Sound.hit();
                }
            }

            // Remove dead arrows
            if (!arrow.alive) {
                this.arrows.splice(i, 1);
            }
        }
    }

    updateBombs(deltaTime) {
        for (let i = this.bombs.length - 1; i >= 0; i--) {
            const bomb = this.bombs[i];
            bomb.update(deltaTime);

            if (bomb.hasExploded) {
                const explosionHits = bomb.checkExplosionDamage(this.getTargetsFor(bomb.owner));

                explosionHits.forEach(hit => {
                    const damage = Math.max(1, Math.floor(hit.damage * (bomb.owner.damageMultiplier || 1)));
                    hit.target.takeDamage(damage);

                    Combat.createBloodEffect(this.scene, hit.target.group.position.clone());
                    Combat.showDamageNumber(this.scene, hit.target.group.position.clone(), damage);
                });

                // Remove bomb after explosion is processed
                this.bombs.splice(i, 1);
            } else {
                // Direct hit triggers the explosion; damage is applied next frame
                bomb.checkCollision(this.getTargetsFor(bomb.owner));

                if (!bomb.alive && !bomb.hasExploded) {
                    this.bombs.splice(i, 1);
                }
            }
        }
    }

    clampToMapBoundaries(character) {
        character.group.position.x = Math.max(
            this.mapBoundary.minX,
            Math.min(this.mapBoundary.maxX, character.group.position.x)
        );
        character.group.position.z = Math.max(
            this.mapBoundary.minZ,
            Math.min(this.mapBoundary.maxZ, character.group.position.z)
        );
    }

    toggleCameraMode() {
        if (this.cameraMode === 'first') {
            this.cameraMode = 'third';
            this.camera.position.set(0, 4, 8);
        } else {
            this.cameraMode = 'first';
            this.camera.position.set(0, 1.8, 0.5);
        }
    }
}
