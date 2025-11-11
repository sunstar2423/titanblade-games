class Game3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.players = [];
        this.weapons = [];
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        this.isPointerLocked = false;
        this.cameraMode = 'third'; // 'first' or 'third'

        this.currentPlayer = null;
        this.enemies = [];
        this.neutralTanks = []; // Neutral tanks that attack everyone
        this.allyTanks = []; // Converted tanks that fight for the player
        this.arrows = [];
        this.bombs = []; // Thrown bombs
        this.coins = []; // Collectible coins dropped by enemies
        this.playerCoins = 0; // Total coins collected
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

        // Bind methods
        this.animate = this.animate.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseClick = this.onMouseClick.bind(this);
        this.onPointerLockChange = this.onPointerLockChange.bind(this);
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

        this.animate();
    }

    createNeutralTanks() {
        // Create 1-2 powerful neutral tanks that attack everyone
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

            // AI will be updated in updateEnemyAI
            neutralTank.aiTarget = null; // Will find nearest target
            neutralTank.aiUpdateTimer = Math.random() * 2;
        }

        console.log(`Spawned ${tankCount} neutral tanks`);
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
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('click', this.onMouseClick);
        document.addEventListener('pointerlockchange', this.onPointerLockChange);

        // Request pointer lock on first click
        this.renderer.domElement.addEventListener('click', () => {
            if (!this.isPointerLocked) {
                this.renderer.domElement.requestPointerLock();
            }
        });
    }

    onKeyDown(event) {
        this.keys[event.code] = true;

        // Weapon switching (1-6)
        if (event.code >= 'Digit1' && event.code <= 'Digit6') {
            const weaponIndex = parseInt(event.code.charAt(5)) - 1;
            if (this.currentPlayer) {
                this.currentPlayer.switchWeapon(weaponIndex);
            }
        }

        // Camera mode toggle with C key
        if (event.code === 'KeyC') {
            this.toggleCameraMode();
        }

        // Reload with R key
        if (event.code === 'KeyR') {
            if (this.currentPlayer) {
                this.currentPlayer.reloadWeapon();
            }
        }
    }

    onKeyUp(event) {
        this.keys[event.code] = false;
    }

    onMouseMove(event) {
        if (this.isPointerLocked && this.currentPlayer) {
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

    onMouseClick(event) {
        if (this.isPointerLocked && this.currentPlayer) {
            this.currentPlayer.attack(this);
        }
    }

    onPointerLockChange() {
        this.isPointerLocked = document.pointerLockElement === this.renderer.domElement;
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
        console.log(`Starting wave ${waveNumber}`);
        this.currentWave = waveNumber;
        this.waveInProgress = true;

        // Restore player health to full
        if (this.currentPlayer) {
            this.currentPlayer.health = this.currentPlayer.maxHealth;
            document.getElementById('healthValue').textContent = this.currentPlayer.health;
            console.log(`Player health restored to ${this.currentPlayer.health}`);
        }

        // Update UI
        document.getElementById('waveNumber').textContent = `${waveNumber}/${this.maxWaves}`;

        // Show wave start message
        this.showWaveMessage(`Wave ${waveNumber} Starting!`);

        // Create enemies for this wave
        this.createEnemies(waveNumber);

        console.log(`Wave ${waveNumber} started with ${this.enemies.filter(e => e.health > 0).length} enemies`);
    }

    createEnemies(waveNumber) {
        // Create diverse enemy types
        const enemyTypes = ['rogue', 'mage', 'tank', 'archer', 'warrior'];

        // More enemies each wave (3 + 2 per wave)
        const enemyCount = 3 + (waveNumber * 2);

        // Enemy scaling per wave
        const healthMultiplier = 1 + (waveNumber - 1) * 0.3; // +30% health per wave
        const damageMultiplier = 1 + (waveNumber - 1) * 0.25; // +25% damage per wave

        // First enemy is ALWAYS a skateboarder (fast enemy)
        for (let i = 0; i < enemyCount; i++) {
            const x = (Math.random() - 0.5) * 30;
            const z = (Math.random() - 0.5) * 30;

            // First enemy is skateboarder, rest are normal types
            const enemyType = i === 0 ? 'skateboarder' : enemyTypes[i % enemyTypes.length];

            const enemy = new StickFigure(this.scene, x, 0, z, enemyType, false);

            // Scale enemy stats based on wave
            enemy.maxHealth = Math.floor(enemy.maxHealth * healthMultiplier);
            enemy.health = enemy.maxHealth;
            enemy.damageMultiplier *= damageMultiplier;

            this.enemies.push(enemy);

            // Give enemies simple AI - initially target player
            enemy.aiTarget = this.currentPlayer;
            enemy.aiUpdateTimer = Math.random() * 2; // Randomize update timing

            // Archers and mages start with pistol equipped
            if (enemyType === 'archer' || enemyType === 'mage') {
                enemy.switchWeapon(4); // Pistol is weapon index 4
            }
        }

        console.log(`Wave ${waveNumber} enemies: ${enemyCount} total (1 skateboarder!), Health x${healthMultiplier.toFixed(2)}, Damage x${damageMultiplier.toFixed(2)}`);
    }

    createCoin(position, offsetX = 0, offsetZ = 0) {
        // Create a spinning golden coin
        const coinGroup = new THREE.Group();

        // Coin cylinder (flat disc) - slightly bigger for visibility
        const coinGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.06, 16);
        const coinMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700, emissive: 0x886600 });
        const coin = new THREE.Mesh(coinGeometry, coinMaterial);
        coin.castShadow = true;
        coinGroup.add(coin);

        // Add a rim for detail
        const rimGeometry = new THREE.TorusGeometry(0.2, 0.03, 8, 16);
        const rimMaterial = new THREE.MeshLambertMaterial({ color: 0xFFA500 });
        const rim = new THREE.Mesh(rimGeometry, rimMaterial);
        rim.rotation.x = Math.PI / 2;
        coinGroup.add(rim);

        // Position coin slightly above ground with offset
        coinGroup.position.copy(position);
        coinGroup.position.x += offsetX;
        coinGroup.position.z += offsetZ;
        coinGroup.position.y = 0.4;

        // Store coin data
        const coinData = {
            group: coinGroup,
            rotation: 0,
            bobPhase: Math.random() * Math.PI * 2,
            collected: false
        };

        this.scene.add(coinGroup);
        this.coins.push(coinData);

        console.log(`Coin created at: x=${coinGroup.position.x.toFixed(2)}, y=${coinGroup.position.y.toFixed(2)}, z=${coinGroup.position.z.toFixed(2)}`);
    }

    checkDeadEnemies() {
        // Check for dead enemies and spawn coins
        this.enemies.forEach(enemy => {
            if (enemy.health <= 0 && enemy.deathPosition && !enemy.coinDropped) {
                // Mark that we've dropped coins for this enemy
                enemy.coinDropped = true;

                // Drop 5-10 coins per enemy
                const numCoins = 5 + Math.floor(Math.random() * 6);

                console.log(`Enemy died at position:`, enemy.deathPosition, `dropping ${numCoins} coins`);

                // Spread coins in a wider circle around death position
                for (let i = 0; i < numCoins; i++) {
                    const angle = (Math.PI * 2 * i) / numCoins + (Math.random() - 0.5) * 0.5;
                    const radius = 0.8 + Math.random() * 0.8; // Increased scatter radius
                    const offsetX = Math.cos(angle) * radius;
                    const offsetZ = Math.sin(angle) * radius;

                    this.createCoin(enemy.deathPosition, offsetX, offsetZ);
                }
            }
        });
    }

    checkTankConversions() {
        // Check if any neutral tanks have been converted to allies
        for (let i = this.neutralTanks.length - 1; i >= 0; i--) {
            const tank = this.neutralTanks[i];
            if (tank.isAlly) {
                // Remove from neutral tanks and add to allies
                this.neutralTanks.splice(i, 1);
                this.allyTanks.push(tank);
                console.log('Tank converted! Now have', this.allyTanks.length, 'ally tanks');
            }
        }
    }

    checkWaveComplete() {
        if (!this.waveInProgress || this.gameWon) return;

        // Count alive enemies
        const aliveEnemies = this.enemies.filter(enemy => enemy.health > 0).length;

        if (aliveEnemies === 0) {
            console.log(`Wave ${this.currentWave} complete! Starting wave ${this.currentWave + 1} in 3 seconds...`);
            this.waveInProgress = false;
            this.waveCompleteTimer = 3; // 3 second delay before next wave

            if (this.currentWave >= this.maxWaves) {
                // Game won!
                this.gameWon = true;
                this.showVictoryMessage();
            } else {
                // Show wave complete message
                this.showWaveMessage(`Wave ${this.currentWave} Complete! Next wave in 3 seconds...`);
            }
        }
    }

    showWaveMessage(message) {
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

        document.body.appendChild(messageDiv);

        // Remove after 3 seconds
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
        text.style.margin = '0 0 30px 0';
        messageDiv.appendChild(text);

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
    }

    updatePlayer(deltaTime) {
        if (!this.currentPlayer) return;

        const moveSpeed = 5 * deltaTime;
        const direction = new THREE.Vector3();

        if (this.keys['KeyW']) direction.z -= 1;
        if (this.keys['KeyS']) direction.z += 1;
        if (this.keys['KeyA']) direction.x -= 1;
        if (this.keys['KeyD']) direction.x += 1;

        if (direction.length() > 0) {
            direction.normalize();

            // Apply player rotation to movement direction
            if (this.cameraMode === 'third') {
                const playerRotation = this.currentPlayer.group.rotation.y;
                const rotatedDirection = new THREE.Vector3(
                    direction.x * Math.cos(playerRotation) - direction.z * Math.sin(playerRotation),
                    0,
                    direction.x * Math.sin(playerRotation) + direction.z * Math.cos(playerRotation)
                );
                direction.copy(rotatedDirection);
            }

            // Calculate new position
            const newPosition = this.currentPlayer.group.position.clone();
            newPosition.x += direction.x * moveSpeed;
            newPosition.z += direction.z * moveSpeed;

            // Clamp position to map boundaries
            newPosition.x = Math.max(this.mapBoundary.minX, Math.min(this.mapBoundary.maxX, newPosition.x));
            newPosition.z = Math.max(this.mapBoundary.minZ, Math.min(this.mapBoundary.maxZ, newPosition.z));

            // Check for environment collisions
            if (!this.environment.checkCollision(newPosition, 0.5)) {
                // Calculate the actual movement delta after boundary clamping
                const deltaX = newPosition.x - this.currentPlayer.group.position.x;
                const deltaZ = newPosition.z - this.currentPlayer.group.position.z;
                this.currentPlayer.move(deltaX, deltaZ);
            }
        }
    }

    updateAllyTanks(deltaTime) {
        this.allyTanks.forEach(tank => {
            if (tank.health <= 0) return;

            // Update AI target timer
            tank.aiUpdateTimer -= deltaTime;
            if (tank.aiUpdateTimer <= 0) {
                // Re-evaluate target every 2-3 seconds
                tank.aiUpdateTimer = 2 + Math.random();
                tank.aiTarget = this.chooseAllyTarget(tank);
            }

            if (tank.aiTarget && tank.aiTarget.health > 0) {
                const targetPos = tank.aiTarget.group.position;
                const tankPos = tank.group.position;

                const direction = new THREE.Vector3()
                    .subVectors(targetPos, tankPos)
                    .normalize();

                const distance = tankPos.distanceTo(targetPos);

                // Get weapon range for attack distance
                const attackRange = tank.currentWeapon ? tank.currentWeapon.range : 2.0;
                const minDistance = attackRange * 0.8;

                if (distance > minDistance) {
                    // Move towards target
                    tank.move(direction.x * deltaTime * 2, direction.z * deltaTime * 2);

                    // Clamp to map boundaries
                    this.clampToMapBoundaries(tank);
                } else if (distance <= attackRange) {
                    // Attack if within weapon range
                    if (Math.random() < 0.03) { // Slightly higher attack chance
                        tank.attack(this);
                    }
                }

                // Face the target
                tank.group.lookAt(targetPos.x, tankPos.y, targetPos.z);
            }
        });
    }

    updateNeutralTanks(deltaTime) {
        this.neutralTanks.forEach(tank => {
            if (tank.health <= 0) return;

            // Update AI target timer
            tank.aiUpdateTimer -= deltaTime;
            if (tank.aiUpdateTimer <= 0) {
                // Re-evaluate target every 2-3 seconds
                tank.aiUpdateTimer = 2 + Math.random();
                tank.aiTarget = this.chooseNeutralTarget(tank);
            }

            if (tank.aiTarget && tank.aiTarget.health > 0) {
                const targetPos = tank.aiTarget.group.position;
                const tankPos = tank.group.position;

                const direction = new THREE.Vector3()
                    .subVectors(targetPos, tankPos)
                    .normalize();

                const distance = tankPos.distanceTo(targetPos);

                // Get weapon range for attack distance
                const attackRange = tank.currentWeapon ? tank.currentWeapon.range : 2.0;
                const minDistance = attackRange * 0.8;

                if (distance > minDistance) {
                    // Move towards target
                    tank.move(direction.x * deltaTime * 2, direction.z * deltaTime * 2);

                    // Clamp to map boundaries
                    this.clampToMapBoundaries(tank);
                } else if (distance <= attackRange) {
                    // Attack if within weapon range
                    if (Math.random() < 0.03) { // Slightly higher attack chance
                        tank.attack(this);
                    }
                }

                // Face the target
                tank.group.lookAt(targetPos.x, tankPos.y, targetPos.z);
            }
        });
    }

    chooseAllyTarget(tank) {
        // Ally tanks only attack enemies
        const potentialTargets = this.enemies.filter(e => e.health > 0);

        // Find nearest enemy
        let closestTarget = null;
        let closestDistance = Infinity;

        potentialTargets.forEach(target => {
            const dist = tank.group.position.distanceTo(target.group.position);
            if (dist < closestDistance) {
                closestDistance = dist;
                closestTarget = target;
            }
        });

        return closestTarget;
    }

    chooseNeutralTarget(tank) {
        // Neutral tanks attack EVERYONE - player and all enemies
        const potentialTargets = [
            this.currentPlayer,
            ...this.enemies.filter(e => e.health > 0),
            ...this.neutralTanks.filter(t => t !== tank && t.health > 0)
        ];

        // Find nearest target
        let closestTarget = null;
        let closestDistance = Infinity;

        potentialTargets.forEach(target => {
            const dist = tank.group.position.distanceTo(target.group.position);
            if (dist < closestDistance) {
                closestDistance = dist;
                closestTarget = target;
            }
        });

        return closestTarget;
    }

    updateEnemies(deltaTime) {
        this.enemies.forEach(enemy => {
            if (enemy.health <= 0) return;

            // Update AI target timer
            enemy.aiUpdateTimer -= deltaTime;
            if (enemy.aiUpdateTimer <= 0) {
                // Re-evaluate target every 2-3 seconds
                enemy.aiUpdateTimer = 2 + Math.random();
                enemy.aiTarget = this.chooseEnemyTarget(enemy);
            }

            if (enemy.aiTarget && enemy.aiTarget.health > 0) {
                const targetPos = enemy.aiTarget.group.position;
                const enemyPos = enemy.group.position;

                const direction = new THREE.Vector3()
                    .subVectors(targetPos, enemyPos)
                    .normalize();

                const distance = enemyPos.distanceTo(targetPos);

                // Smart weapon switching based on distance
                if (distance > 6 && enemy.currentWeaponIndex !== 4) {
                    // Far away - switch to pistol
                    enemy.switchWeapon(4);
                } else if (distance <= 4 && enemy.currentWeaponIndex === 4) {
                    // Close range - switch to sword for melee
                    enemy.switchWeapon(0);
                }

                // Get weapon range for attack distance
                const attackRange = enemy.currentWeapon ? enemy.currentWeapon.range : 2.0;
                const minDistance = attackRange * 0.8; // Stay at 80% of weapon range

                if (distance > minDistance) {
                    // Move towards target
                    enemy.move(direction.x * deltaTime * 2, direction.z * deltaTime * 2);

                    // Clamp to map boundaries
                    this.clampToMapBoundaries(enemy);
                } else if (distance <= attackRange) {
                    // Attack if within weapon range
                    if (Math.random() < 0.02) { // Random attack chance
                        enemy.attack(this);
                    }
                }

                // Face the target
                enemy.group.lookAt(targetPos.x, enemyPos.y, targetPos.z);
            }
        });
    }

    chooseEnemyTarget(enemy) {
        // All enemies work together - they only attack player, neutral tanks, and ally tanks
        const potentialTargets = [
            this.currentPlayer,
            ...this.neutralTanks.filter(t => t.health > 0),
            ...this.allyTanks.filter(t => t.health > 0)
        ];

        // Find nearest target
        let closestTarget = null;
        let closestDistance = Infinity;

        potentialTargets.forEach(target => {
            const dist = enemy.group.position.distanceTo(target.group.position);
            if (dist < closestDistance) {
                closestDistance = dist;
                closestTarget = target;
            }
        });

        // Default to player if no other targets
        return closestTarget || this.currentPlayer;
    }

    checkCollisions() {
        // Check weapon hits (melee only, crossbows/pistols use arrows)
        const allCombatants = this.players.concat(this.enemies).concat(this.neutralTanks).concat(this.allyTanks);

        allCombatants.forEach(attacker => {
            if (attacker.isAttacking && attacker.currentWeapon) {
                // Skip ranged weapon attacks - they use arrow projectiles
                if (attacker.currentWeapon.name === 'Crossbow' || attacker.currentWeapon.name === 'Pistol' || attacker.currentWeapon.name === 'Rifle') {
                    return;
                }

                // Get all potential targets
                let targets = [];
                if (attacker === this.currentPlayer) {
                    // Player can hit enemies and neutral tanks (NOT ally tanks)
                    targets = [...this.enemies, ...this.neutralTanks];
                } else if (attacker.isNeutral) {
                    // Neutral tanks hit EVERYONE except themselves
                    targets = [this.currentPlayer, ...this.enemies, ...this.neutralTanks.filter(t => t !== attacker), ...this.allyTanks];
                } else if (attacker.isAlly) {
                    // Ally tanks only hit enemies
                    targets = [...this.enemies];
                } else {
                    // Regular enemies work together - only hit player, neutral tanks, and ally tanks (NOT other enemies)
                    targets = [this.currentPlayer, ...this.neutralTanks, ...this.allyTanks];
                }

                targets.forEach(target => {
                    if (target.health > 0) {
                        const distance = attacker.group.position.distanceTo(target.group.position);
                        if (distance < attacker.currentWeapon.range) {
                            // Apply damage multiplier from attacker
                            const damage = Math.floor(attacker.currentWeapon.damage * attacker.damageMultiplier);
                            target.takeDamage(damage);

                            // Update UI if player is hit
                            if (target === this.currentPlayer) {
                                document.getElementById('healthValue').textContent = target.health;
                            }
                        }
                    }
                });
            }
        });
    }

    updateCoins(deltaTime) {
        // Update coin animations and check for collection
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coinData = this.coins[i];

            if (coinData.collected) continue;

            // Spin the coin
            coinData.rotation += deltaTime * 3;
            coinData.group.rotation.y = coinData.rotation;

            // Bob up and down
            coinData.bobPhase += deltaTime * 2;
            coinData.group.position.y = 0.5 + Math.sin(coinData.bobPhase) * 0.15;

            // Check if player is close enough to collect
            if (this.currentPlayer) {
                const distance = this.currentPlayer.group.position.distanceTo(coinData.group.position);

                if (distance < 1.2) {
                    // Collect the coin!
                    this.playerCoins += 1;
                    coinData.collected = true;

                    // Update UI
                    document.getElementById('coinCount').textContent = this.playerCoins;

                    // Check if player reached 100 coins and hasn't unlocked rifle yet
                    if (this.playerCoins >= 100 && !this.currentPlayer.hasRifle) {
                        this.currentPlayer.unlockRifle();
                        this.playerCoins -= 100; // Deduct the cost
                        document.getElementById('coinCount').textContent = this.playerCoins;
                        this.showRifleUnlockedMessage();
                    }

                    // Check if player reached 20 coins and hasn't unlocked bomb yet
                    if (this.playerCoins >= 20 && this.currentPlayer.hasRifle && !this.currentPlayer.hasBomb) {
                        this.currentPlayer.unlockBomb();
                        this.playerCoins -= 20; // Deduct the cost
                        document.getElementById('coinCount').textContent = this.playerCoins;
                        this.showBombUnlockedMessage();
                    }

                    // Remove coin from scene
                    this.scene.remove(coinData.group);
                    this.coins.splice(i, 1);

                    console.log('Coin collected! Total coins:', this.playerCoins);
                }
            }
        }
    }

    showRifleUnlockedMessage() {
        // Remove old message if exists
        const oldMessage = document.getElementById('rifleMessage');
        if (oldMessage) oldMessage.remove();

        // Make weapon slot 6 visible
        const weaponSlot6 = document.querySelector('[data-weapon="5"]');
        if (weaponSlot6) {
            weaponSlot6.style.opacity = '1';
            weaponSlot6.style.border = '2px solid #FFD700';
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

        // Remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }

    showBombUnlockedMessage() {
        // Remove old message if exists
        const oldMessage = document.getElementById('bombMessage');
        if (oldMessage) oldMessage.remove();

        // Make weapon slot 7 visible
        const weaponSlot7 = document.querySelector('[data-weapon="6"]');
        if (weaponSlot7) {
            weaponSlot7.style.opacity = '1';
            weaponSlot7.style.border = '2px solid #FF4500';
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

        // Remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }

    animate() {
        requestAnimationFrame(this.animate);

        const deltaTime = this.clock.getDelta();

        this.updatePlayer(deltaTime);
        this.updateEnemies(deltaTime);
        this.updateNeutralTanks(deltaTime);
        this.updateAllyTanks(deltaTime);
        this.updateArrows(deltaTime);
        this.updateBombs(deltaTime);
        this.updateCoins(deltaTime);
        this.checkCollisions();
        this.checkDeadEnemies();
        this.checkTankConversions();
        this.checkWaveComplete();

        // Update wave timer
        if (!this.waveInProgress && this.waveCompleteTimer > 0 && !this.gameWon) {
            this.waveCompleteTimer -= deltaTime;
            if (this.waveCompleteTimer <= 0) {
                console.log(`Wave timer expired, starting next wave`);
                this.startWave(this.currentWave + 1);
            }
        }

        // Update all characters including neutral and ally tanks
        this.players.concat(this.enemies).concat(this.neutralTanks).concat(this.allyTanks).forEach(character => {
            character.update(deltaTime);
        });

        // Update environment effects (wind)
        if (this.environment) {
            this.environment.addWindEffect();
        }

        this.renderer.render(this.scene, this.camera);
    }

    updateArrows(deltaTime) {
        // Update all arrows
        for (let i = this.arrows.length - 1; i >= 0; i--) {
            const arrow = this.arrows[i];
            arrow.update(deltaTime);

            // Check collisions with all characters (excluding the shooter)
            let allTargets = [];
            if (arrow.owner.isNeutral) {
                // Neutral tank arrows hit everyone except other neutral tanks
                allTargets = [this.currentPlayer, ...this.enemies, ...this.allyTanks];
            } else if (arrow.owner.isAlly) {
                // Ally tank arrows only hit enemies
                allTargets = [...this.enemies];
            } else if (arrow.owner === this.currentPlayer) {
                // Player arrows hit enemies and neutral tanks (NOT ally tanks)
                allTargets = [...this.enemies, ...this.neutralTanks];
            } else {
                // Enemy arrows work together - only hit player, neutral tanks, and ally tanks (NOT other enemies)
                allTargets = [this.currentPlayer, ...this.neutralTanks, ...this.allyTanks];
            }

            const hit = arrow.checkCollision(allTargets);

            if (hit) {
                // Apply damage multiplier from shooter
                const damage = Math.floor(hit.damage * arrow.owner.damageMultiplier);
                hit.target.takeDamage(damage);

                console.log('Arrow dealt damage:', damage, 'to target. New health:', hit.target.health);

                // Update UI if player is hit
                if (hit.target === this.currentPlayer) {
                    document.getElementById('healthValue').textContent = hit.target.health;
                }

                // Visual effects
                const Combat = window.Combat || (typeof Combat !== 'undefined' ? Combat : null);
                if (Combat) {
                    Combat.createBloodEffect(this.scene, hit.target.group.position.clone());
                    Combat.showDamageNumber(this.scene, hit.target.group.position.clone(), hit.damage);
                }
            }

            // Remove dead arrows
            if (!arrow.alive) {
                this.arrows.splice(i, 1);
            }
        }
    }

    updateBombs(deltaTime) {
        // Update all bombs
        for (let i = this.bombs.length - 1; i >= 0; i--) {
            const bomb = this.bombs[i];
            bomb.update(deltaTime);

            // If bomb has exploded, check explosion damage
            if (bomb.hasExploded) {
                // Check collisions with all characters (excluding the thrower)
                let allTargets = [];
                if (bomb.owner.isNeutral) {
                    // Neutral tank bombs hit everyone except other neutral tanks
                    allTargets = [this.currentPlayer, ...this.enemies, ...this.allyTanks];
                } else if (bomb.owner.isAlly) {
                    // Ally tank bombs only hit enemies
                    allTargets = [...this.enemies];
                } else if (bomb.owner === this.currentPlayer) {
                    // Player bombs hit enemies and neutral tanks (NOT ally tanks)
                    allTargets = [...this.enemies, ...this.neutralTanks];
                } else {
                    // Enemy bombs work together - only hit player, neutral tanks, and ally tanks (NOT other enemies)
                    allTargets = [this.currentPlayer, ...this.neutralTanks, ...this.allyTanks];
                }

                const explosionHits = bomb.checkExplosionDamage(allTargets);

                explosionHits.forEach(hit => {
                    // Apply damage multiplier from thrower
                    const damage = Math.floor(hit.damage * bomb.owner.damageMultiplier);
                    hit.target.takeDamage(damage);

                    console.log('💥 Explosion dealt damage:', damage, 'to target. New health:', hit.target.health);

                    // Update UI if player is hit
                    if (hit.target === this.currentPlayer) {
                        document.getElementById('healthValue').textContent = hit.target.health;
                    }

                    // Visual effects
                    const Combat = window.Combat || (typeof Combat !== 'undefined' ? Combat : null);
                    if (Combat) {
                        Combat.createBloodEffect(this.scene, hit.target.group.position.clone());
                        Combat.showDamageNumber(this.scene, hit.target.group.position.clone(), damage);
                    }
                });

                // Remove bomb after explosion is processed
                this.bombs.splice(i, 1);
            } else {
                // Check direct hit (before explosion)
                let allTargets = [];
                if (bomb.owner.isNeutral) {
                    allTargets = [this.currentPlayer, ...this.enemies, ...this.allyTanks];
                } else if (bomb.owner.isAlly) {
                    allTargets = [...this.enemies];
                } else if (bomb.owner === this.currentPlayer) {
                    allTargets = [...this.enemies, ...this.neutralTanks];
                } else {
                    allTargets = [this.currentPlayer, ...this.neutralTanks, ...this.allyTanks];
                }

                const hit = bomb.checkCollision(allTargets);

                if (hit) {
                    // Direct hit triggers explosion, damage will be handled in next update
                    console.log('💥 Bomb hit target directly!');
                }
            }

            // Remove dead bombs
            if (!bomb.alive && !bomb.hasExploded) {
                this.bombs.splice(i, 1);
            }
        }
    }

    clampToMapBoundaries(character) {
        // Clamp character position to stay within map boundaries
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
            // Switch to third person
            this.cameraMode = 'third';
            this.camera.position.set(0, 4, 8);
        } else {
            // Switch to first person
            this.cameraMode = 'first';
            this.camera.position.set(0, 1.8, 0.5);
        }
        console.log('Camera mode:', this.cameraMode);
    }
}