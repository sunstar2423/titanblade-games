import { SCREEN_WIDTH, SCREEN_HEIGHT, SCENES, PHYSICS, BIKE_TYPES, OBSTACLES, POWERUPS, ENEMY_TYPES, WEAPONS, GAME_CONFIG, BIKE_SPRITES, LEVEL_CONFIG, MUSIC_TRACKS, BACKGROUND_MUSIC } from '../GameData.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.GAME });
        console.log('🔥 GAMESCENE CONSTRUCTOR - FILE VERSION 2024-FIXED 🔥');
    }
    
    // Safe math utilities to prevent NaN values
    safeAdd(a, b) {
        const numA = (typeof a === 'number' && !isNaN(a)) ? a : 0;
        const numB = (typeof b === 'number' && !isNaN(b)) ? b : 0;
        const result = numA + numB;
        return (typeof result === 'number' && !isNaN(result)) ? result : 0;
    }
    
    safeMultiply(a, b) {
        const numA = (typeof a === 'number' && !isNaN(a)) ? a : 0;
        const numB = (typeof b === 'number' && !isNaN(b)) ? b : 1;
        const result = numA * numB;
        return (typeof result === 'number' && !isNaN(result)) ? result : 0;
    }
    
    clampValue(value, min = 0, max = 5000) {
        const num = (typeof value === 'number' && !isNaN(value)) ? value : 0;
        return Math.max(min, Math.min(max, num));
    }

    create() {
        console.log('🔥 GAMESCENE.CREATE() STARTED - FULL VERSION 🔥');
        
            // Initialize game variables
            this.gameState = this.registry.get('gameState');
            console.log('GameState retrieved:', this.gameState);
            
            // Get current level configuration
            this.currentLevelConfig = LEVEL_CONFIG[this.gameState.currentLevel] || LEVEL_CONFIG[1];
            console.log(`Starting Level ${this.gameState.currentLevel}: ${this.currentLevelConfig.name}`);
            
            // Only reset score if starting a completely new game (Level 1)
            // Preserve score for level retries and progression
            if (this.gameState.currentLevel === 1) {
                this.gameState.score = 0;
                console.log('🎯 Score reset for new game (Level 1)');
            } else {
                console.log(`🎯 Preserving score ${this.gameState.score} for Level ${this.gameState.currentLevel}`);
            }
            
            this.gameState.money = 0; // Reset session money only
            this.gameState.currentSpeed = 0;
            
            // Money transfer protection
            this.moneyTransferred = false;
            
            // Victory sound protection
            this.victorySoundPlayed = false;
            
            // Get current bike and weapon stats
            try {
                this.bikeStats = BIKE_TYPES[this.gameState.currentBike];
                this.weaponStats = WEAPONS[this.gameState.currentWeapon];
                console.log('Bike stats:', this.bikeStats);
                console.log('Weapon stats:', this.weaponStats);
                
                if (!this.bikeStats) {
                    throw new Error(`Invalid bike type: ${this.gameState.currentBike}`);
                }
                if (!this.weaponStats) {
                    throw new Error(`Invalid weapon type: ${this.gameState.currentWeapon}`);
                }
            } catch (error) {
                console.error('Error loading bike/weapon stats:', error);
                
                // Fallback to default values
                this.bikeStats = BIKE_TYPES.BMX;
                this.weaponStats = WEAPONS.BASIC_SHOT;
                this.gameState.currentBike = 'BMX';
                this.gameState.currentWeapon = 'BASIC_SHOT';
            }
            
            // Set physics constants first
            console.log('PHYSICS object:', PHYSICS);
            console.log('PHYSICS.GROUND_LEVEL:', PHYSICS.GROUND_LEVEL);
            console.log('SCREEN_HEIGHT:', SCREEN_HEIGHT);
            this.groundLevel = PHYSICS.GROUND_LEVEL;
            this.gravity = PHYSICS.GRAVITY;
            console.log('Set this.groundLevel to:', this.groundLevel);
            
            // Create world
            console.log('Creating world...');
            this.createWorld();
            
            // Create player
            console.log('Creating player...');
            this.createPlayer();
            
            // Create groups
            console.log('Creating groups...');
            this.createGroups();
            
            // Setup controls
            console.log('Setting up controls...');
            this.setupControls();
            
            // Setup collisions
            console.log('Setting up collisions...');
            this.setupCollisions();
            
            // Game mechanics
            this.worldSpeed = 100;
            this.spawnTimer = 0;
        this.distanceTraveled = 0;
        this.lastObstacleX = 0; // Initialize relative to world coordinates
        
        // Racing system
        this.totalRacers = 1; // Will be updated when enemies spawn
        this.currentPosition = 1;
        this.finalPosition = null; // Final position locked when player finishes
        this.positionLocked = false; // Flag to prevent position updates after finish
        
        // Power-up effects
        this.speedBoostActive = false;
        this.jumpBoostActive = false;
        this.invincibilityActive = false;
        
        // Weapon system
        this.weaponCooldown = 0;

        // 🔥 COMBO SYSTEM 🔥
        this.comboCount = 0;
        this.comboTimer = 0;
        this.comboTimeLimit = 3000; // 3 seconds to maintain combo
        this.comboMultiplier = 1;
        this.maxComboMultiplier = 10; // Cap at 10x
        this.lastComboAction = '';

        // 🚀 NITRO BOOST SYSTEM 🚀
        this.nitroMeter = 0;
        this.maxNitroMeter = 100;
        this.nitroActive = false;
        this.nitroRechargeRate = 1; // Points per frame when not boosting
        this.nitroConsumptionRate = 3; // Points per frame when boosting
        
        // Physics constants
        console.log('PHYSICS object:', PHYSICS);
        console.log('PHYSICS.GROUND_LEVEL:', PHYSICS.GROUND_LEVEL);
        console.log('SCREEN_HEIGHT:', SCREEN_HEIGHT);
        this.groundLevel = PHYSICS.GROUND_LEVEL;
        this.gravity = PHYSICS.GRAVITY;
        console.log('Set this.groundLevel to:', this.groundLevel);
        
        // UI elements
        console.log('Creating UI...');
        this.createUI();
        
        // Add visual debugging - temporary colored rectangle to show player position (disabled)
        // this.playerDebug = this.add.rectangle(this.player.x, this.player.y, 60, 40, 0xff0000, 0.5);
        // this.playerDebug.setDepth(11);
        
        // Add comprehensive debug visuals (disabled to remove pink frame)
        // this.createDebugVisuals();
        
        // Initialize sound effects
        this.initializeSounds();
        
        // Create a simple test obstacle to ensure something is visible (disabled)
        // this.createTestObstacle();
        
        console.log('=== DOOM RIDERS DEBUG SUMMARY ===');
        console.log('GameScene.create() completed successfully!');
        console.log('Screen dimensions:', SCREEN_WIDTH, 'x', SCREEN_HEIGHT);
        console.log('Player position:', this.player.x, this.player.y);
        console.log('Player size:', this.player.displayWidth, 'x', this.player.displayHeight);
        console.log('Ground level:', this.groundLevel);
        console.log('Camera bounds:', this.cameras.main.getBounds());
        console.log('Camera scroll:', this.cameras.main.scrollX, this.cameras.main.scrollY);
        console.log('Expected objects:');
        console.log('- Screen border (magenta)');
        console.log('- Ground line (green) at Y=' + this.groundLevel);
        console.log('- Center markers (yellow)');
        console.log('- Corner squares: Red(TL), Green(TR), Blue(BL), Yellow(BR)');
        console.log('- Player (orange) at screen center');
        console.log('- Test obstacles (red/orange) near ground');
        console.log('=== END DEBUG SUMMARY ===');
    }
    
    createWorld() {
        // Create tiled sky background that extends across entire level
        this.createTiledBackground();
        
        // Create extended ground for large world
        this.groundTiles = [];
        this.grassTiles = [];
        
        const tileWidth = 100;
        const worldWidth = this.currentLevelConfig.length + 200; // Level length + buffer
        const numTiles = Math.ceil(worldWidth / tileWidth);
        
        for (let i = 0; i < numTiles; i++) {
            // Ground texture tiles across entire world
            const ground = this.add.image(i * tileWidth, this.groundLevel + 50, 'ground');
            ground.setOrigin(0, 0);
            ground.setDisplaySize(tileWidth, 100);
            ground.setDepth(-5); // Behind player but above sky
            this.groundTiles.push(ground);
            
            // Grass texture tiles across entire world
            const grass = this.add.image(i * tileWidth, this.groundLevel - 10, 'grass');
            grass.setOrigin(0, 0);
            grass.setDisplaySize(tileWidth, 20);
            grass.setDepth(-4); // Above ground but behind player
            this.grassTiles.push(grass);
        }
        
        // Create distance markers
        this.createDistanceMarkers();
        
        // Create finish line
        this.createFinishLine();
    }
    
    createDistanceMarkers() {
        // Create distance markers based on level length
        const markerInterval = Math.floor(this.currentLevelConfig.length / 4);
        for (let i = 1; i <= 3; i++) {
            const distance = markerInterval * i;
            if (distance < this.currentLevelConfig.length) {
                // Marker post
                const marker = this.add.rectangle(distance, this.groundLevel - 80, 8, 160, 0xFFD700);
                marker.setDepth(5);
                
                // Distance text
                const text = this.add.text(distance, this.groundLevel - 180, `${(distance/1000).toFixed(1)}km`, {
                    fontSize: '24px',
                    fill: '#FFD700',
                    fontFamily: 'Arial',
                    fontWeight: 'bold',
                    stroke: '#000000',
                    strokeThickness: 2
                });
                text.setOrigin(0.5);
                text.setDepth(6);
                
                console.log(`Distance marker created at ${distance}m`);
            }
        }
    }
    
    createTiledBackground() {
        console.log('Creating tiled background system...');
        
        // Get level-specific background
        const backgroundKey = this.currentLevelConfig.background || 'backgroundSky';
        console.log(`Using background: ${backgroundKey} for level ${this.gameState.currentLevel}`);
        
        const backgroundWidth = SCREEN_WIDTH;
        const backgroundHeight = SCREEN_HEIGHT;
        const worldWidth = this.currentLevelConfig.length + 1000; // Level length + buffer
        
        // Calculate how many background tiles we need
        const numBackgroundTiles = Math.ceil(worldWidth / backgroundWidth) + 1; // +1 for seamless scrolling
        
        this.backgroundTiles = [];
        
        for (let i = 0; i < numBackgroundTiles; i++) {
            const x = i * backgroundWidth;
            const y = backgroundHeight / 2;
            
            const bgTile = this.add.image(x, y, backgroundKey);
            bgTile.setOrigin(0, 0.5);
            bgTile.setDisplaySize(backgroundWidth, backgroundHeight);
            bgTile.setDepth(-10);
            
            this.backgroundTiles.push(bgTile);
            
            console.log(`Background tile ${i} created at x: ${x} using ${backgroundKey}`);
        }
        
        console.log(`Created ${numBackgroundTiles} background tiles covering ${worldWidth}px with ${backgroundKey}`);
    }
    
    createFinishLine() {
        // Create visible finish line at the end of the level
        const finishX = this.currentLevelConfig.length;
        
        // Checkered flag pattern finish line
        const finishLine = this.add.rectangle(finishX, this.groundLevel - 100, 20, 200, 0x000000);
        finishLine.setDepth(10);
        
        // Add checkered pattern
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 2; x++) {
                const color = (x + y) % 2 === 0 ? 0x000000 : 0xFFFFFF;
                const checker = this.add.rectangle(
                    finishX - 10 + (x * 10), 
                    this.groundLevel - 200 + (y * 20), 
                    10, 20, color
                );
                checker.setDepth(11);
            }
        }
        
        // Add "FINISH" text
        const finishText = this.add.text(finishX, this.groundLevel - 250, 'FINISH', {
            fontSize: '32px',
            fill: '#FFD700',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        });
        finishText.setOrigin(0.5);
        finishText.setDepth(12);
        
        console.log(`Finish line created at X=${finishX}`);
    }
    
    createPlayer() {
        console.log('VERY SIMPLE createPlayer method called!');
        
        // Use current bike from game state
        const currentBike = this.gameState.currentBike || 'BMX';
        let spriteKey = BIKE_SPRITES[currentBike] || 'bmx';
        
        if (this.textures.exists(spriteKey)) {
            console.log(`Using ${currentBike} bike texture: ${spriteKey}`);
        } else {
            console.log(`${currentBike} texture not found, using BMX fallback`);
            spriteKey = 'bmx';
        }
        
        // Position player so bottom edge aligns with all other objects
        const playerX = 200;
        const sharedBottomLevel = this.groundLevel; // All objects will have bottom at this level
        this.player = this.physics.add.sprite(playerX, 0, spriteKey); // Temporary Y position
        this.player.setDisplaySize(80, 55); // Set size FIRST - FIXED: Match enemy size for perfect alignment
        
        // Now position using EXACT same formula as obstacles for perfect alignment
        const playerY = sharedBottomLevel - (this.player.displayHeight / 2);
        this.player.setY(playerY);
        
        console.log(`Player positioned with bottom-center origin: position (${playerX}, ${sharedBottomLevel}), bottom edge at Y=${sharedBottomLevel}`);
        console.log(`Ground level is at: ${this.groundLevel}`);
        this.player.setDepth(20); // Render above everything
        this.player.setTint(0xFF4500); // Orange tint to make player stand out
        this.player.setAlpha(1); // Full opacity
        console.log('Player created, position is:', this.player.x, this.player.y);
        console.log('Player using texture:', spriteKey, 'texture exists:', this.textures.exists(spriteKey));
        console.log('Player display size:', this.player.displayWidth, this.player.displayHeight);
        
        // Add basic physics properties
        this.player.body.setSize(50, 30);
        this.player.body.setBounce(0.1, 0.1);
        this.player.body.setDragX(50);
        this.player.body.setCollideWorldBounds(true); // Prevent falling off the world
        console.log('Player collision with world bounds enabled');
        
        // Add basic stats for movement
        this.player.acceleration = 150;
        this.player.maxSpeed = 250;
        this.player.jumpPower = 300;
        this.player.body.setMaxVelocityX(this.player.maxSpeed);

        // Initialize jump abilities
        this.player.canDoubleJump = false;
        this.player.canTripleJump = false;
        
        console.log('Player setup completed with size and physics');
        
        // Set up camera and physics world bounds to match level length
        const worldWidth = this.currentLevelConfig.length + 200;
        this.cameras.main.setBounds(0, 0, worldWidth, SCREEN_HEIGHT);
        this.physics.world.setBounds(0, 0, worldWidth, SCREEN_HEIGHT);
        console.log(`World bounds set: width=${worldWidth}, height=${SCREEN_HEIGHT}`);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setFollowOffset(-200, 0); // Keep player left-of-center
        console.log('Camera following setup completed');
        console.log('Camera bounds:', this.cameras.main.getBounds());
        console.log('Camera will follow player with offset (-200, 0)');
        
        // Debug text displays removed for clean gameplay interface
    }
    
    createGroups() {
        // Create physics groups
        this.obstacles = this.physics.add.group({
            collideWorldBounds: false
        });
        
        this.jumpObstacles = this.physics.add.group({
            collideWorldBounds: false
        });
        
        this.enemies = this.physics.add.group({
            collideWorldBounds: false
        });
        
        this.powerups = this.physics.add.group({
            collideWorldBounds: false
        });
        
        this.projectiles = this.physics.add.group({
            collideWorldBounds: false
        });
        
        // Create ground collision body across entire level
        this.groundBody = this.physics.add.staticGroup();
        const levelWidth = this.currentLevelConfig.length + 500; // Level length + buffer
        const ground = this.groundBody.create(levelWidth / 2, this.groundLevel + 25, null);
        ground.setSize(levelWidth, 50); // Cover entire level width
        ground.setVisible(false);
        console.log(`Ground collision body created: width=${levelWidth}, center at=${levelWidth/2}`);
        // Static group objects are automatically immovable, so we don't need to set it

        // ✨ PARTICLE TRAIL SYSTEM ✨
        this.trailParticles = [];
        this.trailTimer = 0;
        this.trailInterval = 50; // Create trail particle every 50ms

        // 🌦️ DYNAMIC WEATHER SYSTEM 🌦️
        this.weatherType = 'clear'; // clear, rain, storm, wind
        this.weatherParticles = [];
        this.weatherTimer = 0;
        this.weatherChangeInterval = 30000; // Change weather every 30 seconds
        this.windDirection = 1; // 1 for right, -1 for left
        this.windStrength = 0;

        // ⚔️ PLAYER ATTACK TRACKING ⚔️
        this.lastPlayerAttackTime = 0;
    }
    
    setupControls() {
        // Keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.weaponKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

        // 🚀 NITRO BOOST CONTROLS 🚀
        this.nitroKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        
        // WASD alternative controls
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        
        // Mobile touch controls
        this.setupMobileTouchControls();
    }
    
    setupMobileTouchControls() {
        // Touch state variables
        this.touchInputs = {
            left: false,
            right: false,
            jump: false,
            attack: false,
            weapon: false
        };
        
        // Create mobile control buttons
        this.createMobileUI();
        
        // Create control instructions for all users
        this.createControlInstructions();
        
        // Touch input handlers
        this.input.on('pointerdown', this.handleTouchStart, this);
        this.input.on('pointerup', this.handleTouchEnd, this);
        this.input.on('pointermove', this.handleTouchMove, this);
    }
    
    createMobileUI() {
        // Only show mobile controls on mobile devices
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                         (window.innerWidth < 768);
        
        if (!isMobile) return;
        
        // Control button styling
        const buttonStyle = {
            fillColor: 0x000000,
            fillAlpha: 0.5,
            strokeColor: 0xFFFFFF,
            strokeWidth: 2
        };
        
        // Left arrow button
        this.leftButton = this.add.circle(80, SCREEN_HEIGHT - 80, 35, buttonStyle.fillColor, buttonStyle.fillAlpha)
            .setScrollFactor(0)
            .setDepth(1000)
            .setInteractive();
        this.add.text(80, SCREEN_HEIGHT - 80, '◀', {
            fontSize: '24px',
            fill: '#FFFFFF'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
        
        // Right arrow button
        this.rightButton = this.add.circle(180, SCREEN_HEIGHT - 80, 35, buttonStyle.fillColor, buttonStyle.fillAlpha)
            .setScrollFactor(0)
            .setDepth(1000)
            .setInteractive();
        this.add.text(180, SCREEN_HEIGHT - 80, '▶', {
            fontSize: '24px',
            fill: '#FFFFFF'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
        
        // Jump button
        this.jumpButton = this.add.circle(SCREEN_WIDTH - 180, SCREEN_HEIGHT - 80, 40, buttonStyle.fillColor, buttonStyle.fillAlpha)
            .setScrollFactor(0)
            .setDepth(1000)
            .setInteractive();
        this.add.text(SCREEN_WIDTH - 180, SCREEN_HEIGHT - 80, 'JUMP', {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontWeight: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
        
        // Attack button
        this.attackButton = this.add.circle(SCREEN_WIDTH - 80, SCREEN_HEIGHT - 80, 35, buttonStyle.fillColor, buttonStyle.fillAlpha)
            .setScrollFactor(0)
            .setDepth(1000)
            .setInteractive();
        this.add.text(SCREEN_WIDTH - 80, SCREEN_HEIGHT - 80, 'ATK', {
            fontSize: '12px',
            fill: '#FFFFFF',
            fontWeight: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
        
        // Weapon button
        this.weaponButton = this.add.circle(SCREEN_WIDTH - 130, SCREEN_HEIGHT - 130, 30, buttonStyle.fillColor, buttonStyle.fillAlpha)
            .setScrollFactor(0)
            .setDepth(1000)
            .setInteractive();
        this.add.text(SCREEN_WIDTH - 130, SCREEN_HEIGHT - 130, 'WPN', {
            fontSize: '10px',
            fill: '#FFFFFF',
            fontWeight: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
        
        // Pause button
        this.pauseButton = this.add.circle(SCREEN_WIDTH - 40, 40, 25, buttonStyle.fillColor, buttonStyle.fillAlpha)
            .setScrollFactor(0)
            .setDepth(1000)
            .setInteractive();
        this.add.text(SCREEN_WIDTH - 40, 40, '⏸', {
            fontSize: '16px',
            fill: '#FFFFFF'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
        
        // Store button references for interaction
        this.mobileButtons = {
            left: this.leftButton,
            right: this.rightButton,
            jump: this.jumpButton,
            attack: this.attackButton,
            weapon: this.weaponButton,
            pause: this.pauseButton
        };

        // Add direct event listeners to buttons for better reliability
        this.leftButton.on('pointerdown', () => {
            console.log('Left button pressed directly');
            this.touchInputs.left = true;
            this.leftButton.setFillStyle(0x444444, 0.8);
        });
        this.leftButton.on('pointerup', () => {
            console.log('Left button released directly');
            this.touchInputs.left = false;
            this.leftButton.setFillStyle(0x000000, 0.5);
        });
        this.leftButton.on('pointerout', () => {
            this.touchInputs.left = false;
            this.leftButton.setFillStyle(0x000000, 0.5);
        });

        this.rightButton.on('pointerdown', () => {
            console.log('Right button pressed directly');
            this.touchInputs.right = true;
            this.rightButton.setFillStyle(0x444444, 0.8);
        });
        this.rightButton.on('pointerup', () => {
            console.log('Right button released directly');
            this.touchInputs.right = false;
            this.rightButton.setFillStyle(0x000000, 0.5);
        });
        this.rightButton.on('pointerout', () => {
            this.touchInputs.right = false;
            this.rightButton.setFillStyle(0x000000, 0.5);
        });

        this.jumpButton.on('pointerdown', () => {
            console.log('Jump button pressed directly');
            this.touchInputs.jump = true;
            this.jumpButton.setFillStyle(0x444444, 0.8);
            this.handleTouchJump();
        });
        this.jumpButton.on('pointerup', () => {
            console.log('Jump button released directly');
            this.touchInputs.jump = false;
            this.jumpButton.setFillStyle(0x000000, 0.5);
        });

        this.attackButton.on('pointerdown', () => {
            console.log('Attack button pressed directly');
            this.touchInputs.attack = true;
            this.attackButton.setFillStyle(0x444444, 0.8);
            this.handleTouchAttack();
        });
        this.attackButton.on('pointerup', () => {
            console.log('Attack button released directly');
            this.touchInputs.attack = false;
            this.attackButton.setFillStyle(0x000000, 0.5);
        });

        this.weaponButton.on('pointerdown', () => {
            console.log('Weapon button pressed directly');
            this.touchInputs.weapon = true;
            this.weaponButton.setFillStyle(0x444444, 0.8);
            this.handleTouchWeapon();
        });
        this.weaponButton.on('pointerup', () => {
            console.log('Weapon button released directly');
            this.touchInputs.weapon = false;
            this.weaponButton.setFillStyle(0x000000, 0.5);
        });

        this.pauseButton.on('pointerdown', () => {
            console.log('Pause button pressed directly');
            this.pauseButton.setFillStyle(0x444444, 0.8);
            this.handleTouchPause();
        });
        this.pauseButton.on('pointerup', () => {
            console.log('Pause button released directly');
            this.pauseButton.setFillStyle(0x000000, 0.5);
        });
    }
    
    handleTouchStart(pointer) {
        if (!this.mobileButtons) return;

        // Use screen coordinates for UI buttons (they have setScrollFactor(0))
        const screenX = pointer.x;
        const screenY = pointer.y;

        console.log('Touch at screen coords:', screenX, screenY);

        // Check which button was touched
        Object.keys(this.mobileButtons).forEach(buttonKey => {
            const button = this.mobileButtons[buttonKey];
            if (button) {
                console.log(`Checking ${buttonKey} button at:`, button.x, button.y, 'radius:', button.radius);

                // Calculate distance from touch to button center (using screen coordinates)
                const distance = Phaser.Math.Distance.Between(screenX, screenY, button.x, button.y);
                console.log(`Distance to ${buttonKey}:`, distance);

                if (distance < button.radius + 15) { // Add some tolerance
                    console.log(`✅ ${buttonKey} button pressed!`);
                    this.touchInputs[buttonKey] = true;
                    button.setFillStyle(0x444444, 0.8); // Highlight pressed button

                    // Handle immediate actions
                    if (buttonKey === 'jump') {
                        this.handleTouchJump();
                    } else if (buttonKey === 'attack') {
                        this.handleTouchAttack();
                    } else if (buttonKey === 'weapon') {
                        this.handleTouchWeapon();
                    } else if (buttonKey === 'pause') {
                        this.handleTouchPause();
                    }
                }
            }
        });
    }
    
    handleTouchEnd(pointer) {
        if (!this.mobileButtons) return;

        // Use screen coordinates
        const screenX = pointer.x;
        const screenY = pointer.y;

        console.log('Touch end at:', screenX, screenY);

        // Check which button was released
        Object.keys(this.mobileButtons).forEach(buttonKey => {
            const button = this.mobileButtons[buttonKey];
            if (button && this.touchInputs[buttonKey]) {
                // Calculate distance to see if we're still on the button
                const distance = Phaser.Math.Distance.Between(screenX, screenY, button.x, button.y);

                // Release the button
                this.touchInputs[buttonKey] = false;
                button.setFillStyle(0x000000, 0.5); // Reset button appearance
                console.log(`Released ${buttonKey} button`);
            }
        });
    }

    handleTouchMove(pointer) {
        if (!this.mobileButtons) return;

        // Use screen coordinates
        const screenX = pointer.x;
        const screenY = pointer.y;

        // Update touch states based on current position
        Object.keys(this.mobileButtons).forEach(buttonKey => {
            const button = this.mobileButtons[buttonKey];
            if (button) {
                const distance = Phaser.Math.Distance.Between(screenX, screenY, button.x, button.y);

                // If finger is on button, keep it pressed
                if (distance < button.radius + 15) {
                    if (!this.touchInputs[buttonKey]) {
                        this.touchInputs[buttonKey] = true;
                        button.setFillStyle(0x444444, 0.8);
                        console.log(`Touch moved onto ${buttonKey} button`);
                    }
                } else {
                    // If finger moved off button, release it
                    if (this.touchInputs[buttonKey]) {
                        this.touchInputs[buttonKey] = false;
                        button.setFillStyle(0x000000, 0.5);
                        console.log(`Touch moved off ${buttonKey} button`);
                    }
                }
            }
        });
    }
    
    handleTouchJump() {
        // Same logic as keyboard jump
        if (this.player.isOnGround) {
            let jumpPower = this.player.jumpPower;
            if (this.jumpBoostActive) {
                jumpPower *= POWERUPS.JUMP_BOOST.effect;
            }
            this.player.body.setVelocityY(-jumpPower);
            this.player.canDoubleJump = true;
            
            this.playJumpSound();
        } else if (this.player.canDoubleJump) {
            let jumpPower = this.player.jumpPower * 0.8;
            if (this.jumpBoostActive) {
                jumpPower *= POWERUPS.JUMP_BOOST.effect;
            }
            this.player.body.setVelocityY(-jumpPower);
            this.player.canDoubleJump = false;

            this.playJumpSound(1.2);
        } else if (this.player.canTripleJump) {
            // EPIC TRIPLE JUMP (only available after ramp boost)
            let jumpPower = this.player.jumpPower * 0.6;
            if (this.jumpBoostActive) {
                jumpPower *= POWERUPS.JUMP_BOOST.effect;
            }
            this.player.body.setVelocityY(-jumpPower);
            this.player.canTripleJump = false;

            // Visual effect for epic triple jump
            this.createTripleJumpEffect(this.player.x, this.player.y);
            this.playJumpSound(1.5); // Even higher pitch
            console.log('🚀🚀🚀 EPIC TRIPLE JUMP ACTIVATED! 🚀🚀🚀');
        }
    }
    
    handleTouchAttack() {
        if (this.player.canAttack) {
            this.performAttack();
        }
    }
    
    handleTouchWeapon() {
        this.fireWeapon();
    }
    
    handleTouchPause() {
        this.scene.pause();
        this.scene.launch(SCENES.PAUSE);
    }
    
    createControlInstructions() {
        // Control instructions panel
        const instructionsBg = this.add.rectangle(SCREEN_WIDTH - 200, 120, 380, 160, 0x000000, 0.7)
            .setScrollFactor(0)
            .setDepth(999);
        
        const instructions = [
            '🎮 CONTROLS:',
            '← → Arrow Keys: Move',
            'SPACE: Jump',
            'A: Attack Enemies',
            'W: Use Weapon',
            'P: Pause Game'
        ];
        
        const instructionText = this.add.text(SCREEN_WIDTH - 200, 120, instructions.join('\n'), {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 1
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(1000);
        
        // Auto-hide instructions after 8 seconds
        this.time.delayedCall(8000, () => {
            this.tweens.add({
                targets: [instructionsBg, instructionText],
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    instructionsBg.destroy();
                    instructionText.destroy();
                }
            });
        });
    }
    
    initializeSounds() {
        console.log('Initializing sound effects...');
        
        // Background music - Dynamic track rotation system
        try {
            // Stop any existing background music first
            if (this.backgroundMusic) {
                this.backgroundMusic.stop();
                this.backgroundMusic.destroy();
            }
            
            // Initialize music rotation system
            this.initializeMusicRotation();
            
        } catch (error) {
            console.warn('Could not start background music:', error);
        }
        
        // Jump sound
        try {
            this.jumpSound = this.sound.add('jumpSound', { volume: 0.5 });
            console.log('✓ Jump sound loaded');
        } catch (error) {
            console.warn('Could not load jump sound:', error);
        }
        
        // Crash sound
        try {
            this.crashSound = this.sound.add('crashSound', { volume: 0.4 });
            console.log('✓ Crash sound loaded');
        } catch (error) {
            console.warn('Could not load crash sound:', error);
        }
        
        // Engine sound REMOVED - was causing clicking sound bug due to loop artifacts
        // The engine.wav file had imperfect loop points that created audible clicking
        console.log('✓ Engine sound removed (was causing clicking bug)');
        
        // Attack sound for weapons
        try {
            this.attackSound = this.sound.add('attackSound', { volume: 0.3 });
            console.log('✓ Attack sound loaded');
        } catch (error) {
            console.warn('Could not load attack sound:', error);
        }
        
        // Victory sound for level completion
        try {
            this.victorySound = this.sound.add('victorySound', { volume: 0.4 });
            console.log('✓ Victory sound loaded');
        } catch (error) {
            console.warn('Could not load victory sound:', error);
        }
        
        // Click sound for UI (TEMPORARILY DISABLED to test clicking bug)
        // try {
        //     this.clickSound = this.sound.add('clickSound', { volume: 0.2 });
        //     console.log('✓ Click sound loaded');
        // } catch (error) {
        //     console.warn('Could not load click sound:', error);
        // }
        
        // Engine sound state tracking removed (engine sound disabled due to clicking bug)
        // DEBUG: Diagnostic code can be removed now that clicking bug is resolved
    }
    
    initializeMusicRotation() {
        // Initialize music rotation system with MUSIC_TRACKS array
        console.log('Setting up music rotation system...');
        
        // Randomly select initial track from MUSIC_TRACKS
        const randomIndex = Math.floor(Math.random() * MUSIC_TRACKS.length);
        this.currentTrack = MUSIC_TRACKS[randomIndex];
        
        // Store current track info for credits display
        this.currentTrackInfo = {
            title: this.currentTrack.title,
            artist: this.currentTrack.artist,
            source: this.currentTrack.source,
            license: this.currentTrack.license
        };
        
        console.log(`Selected track: ${this.currentTrackInfo.title} by ${this.currentTrackInfo.artist}`);
        
        // Create and configure the music sound object
        this.backgroundMusic = this.sound.add(this.currentTrack.key, { 
            loop: false,   // Don't loop - we'll handle rotation manually
            volume: 0.08,  // Consistent volume
            rate: 1.0,     // Normal playback rate
            detune: 0      // No pitch modification
        });
        
        // Set up track rotation when music ends
        this.backgroundMusic.on('complete', () => {
            console.log(`Track completed: ${this.currentTrackInfo.title}`);
            this.rotateToNextTrack();
        });
        
        // Add event listeners for monitoring
        this.backgroundMusic.on('play', () => {
            console.log(`✓ Now playing: ${this.currentTrackInfo.title} by ${this.currentTrackInfo.artist}`);
        });
        
        this.backgroundMusic.on('stop', () => {
            console.log('⏹️ Background music stopped');
        });
        
        // Start playing if audio context is ready
        if (this.sound.context.state === 'running') {
            this.backgroundMusic.play();
            console.log('✓ Music rotation system started');
        } else {
            console.log('⏸️ Waiting for audio context before starting music...');
            this.sound.context.resume().then(() => {
                this.backgroundMusic.play();
                console.log('✓ Music rotation system started after context resume');
            }).catch(error => {
                console.warn('Failed to resume audio context:', error);
            });
        }
    }
    
    rotateToNextTrack() {
        // Get current track index
        const currentIndex = MUSIC_TRACKS.findIndex(track => track.key === this.currentTrack.key);
        
        // Calculate next track index (wrap around to beginning)
        const nextIndex = (currentIndex + 1) % MUSIC_TRACKS.length;
        this.currentTrack = MUSIC_TRACKS[nextIndex];
        
        // Update track info for credits
        this.currentTrackInfo = {
            title: this.currentTrack.title,
            artist: this.currentTrack.artist,
            source: this.currentTrack.source,
            license: this.currentTrack.license
        };
        
        console.log(`Rotating to next track: ${this.currentTrackInfo.title} by ${this.currentTrackInfo.artist}`);
        
        try {
            // Stop and destroy current music object
            if (this.backgroundMusic) {
                this.backgroundMusic.stop();
                this.backgroundMusic.destroy();
            }
            
            // Create new music object for next track
            this.backgroundMusic = this.sound.add(this.currentTrack.key, { 
                loop: false,
                volume: 0.08,
                rate: 1.0,
                detune: 0
            });
            
            // Re-attach event listeners
            this.backgroundMusic.on('complete', () => {
                console.log(`Track completed: ${this.currentTrackInfo.title}`);
                this.rotateToNextTrack();
            });
            
            this.backgroundMusic.on('play', () => {
                console.log(`✓ Now playing: ${this.currentTrackInfo.title} by ${this.currentTrackInfo.artist}`);
            });
            
            // Start playing the new track
            this.backgroundMusic.play();
            
        } catch (error) {
            console.warn('Error rotating to next track:', error);
            // Try again with next track after a delay
            this.time.delayedCall(1000, () => {
                this.rotateToNextTrack();
            });
        }
    }
    
    getCurrentTrackInfo() {
        // Utility method to get current track info for credits display
        return this.currentTrackInfo || {
            title: 'Unknown',
            artist: 'Unknown',
            source: 'Unknown',
            license: 'Unknown'
        };
    }
    
    createDebugVisuals() {
        console.log('Creating comprehensive debug visuals...');
        
        // Screen boundary rectangle
        this.screenBorder = this.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, SCREEN_WIDTH-4, SCREEN_HEIGHT-4, 0x000000, 0);
        this.screenBorder.setStrokeStyle(4, 0xFF00FF);
        this.screenBorder.setDepth(1000);
        console.log(`Screen border created: ${SCREEN_WIDTH}x${SCREEN_HEIGHT}`);
        
        // Ground level debug line
        this.groundDebugLine = this.add.rectangle(SCREEN_WIDTH/2, this.groundLevel, SCREEN_WIDTH, 5, 0x00ff00, 1);
        this.groundDebugLine.setDepth(12);
        console.log(`Ground debug line added at Y=${this.groundLevel}`);
        
        // Screen center markers
        this.centerMarkerH = this.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 100, 2, 0xFFFF00, 1);
        this.centerMarkerV = this.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 2, 100, 0xFFFF00, 1);
        this.centerMarkerH.setDepth(1001);
        this.centerMarkerV.setDepth(1001);
        console.log(`Screen center markers at (${SCREEN_WIDTH/2}, ${SCREEN_HEIGHT/2})`);
        
        // Large test objects at known positions
        this.testTopLeft = this.add.rectangle(100, 100, 80, 80, 0xFF0000, 1);
        this.testTopRight = this.add.rectangle(SCREEN_WIDTH-100, 100, 80, 80, 0x00FF00, 1);
        this.testBottomLeft = this.add.rectangle(100, SCREEN_HEIGHT-100, 80, 80, 0x0000FF, 1);
        this.testBottomRight = this.add.rectangle(SCREEN_WIDTH-100, SCREEN_HEIGHT-100, 80, 80, 0xFFFF00, 1);
        
        [this.testTopLeft, this.testTopRight, this.testBottomLeft, this.testBottomRight].forEach(obj => {
            obj.setDepth(15);
        });
        
        console.log('Corner test objects created: Red(TL), Green(TR), Blue(BL), Yellow(BR)');
    }
    
    createTestObstacle() {
        console.log('Creating test obstacle for debugging...');
        
        // Create some initial obstacles for testing
        for (let i = 1; i <= 5; i++) {
            const x = 400 + (i * 200);
            const y = this.groundLevel - 30;
            const obstacle = this.add.rectangle(x, y, 60, 60, 0xFF0000 + (i * 0x001100), 1);
            obstacle.setDepth(8);
            console.log(`Test obstacle ${i} created at (${x}, ${y})`);
        }
        
        // Create some test enemies
        for (let i = 1; i <= 3; i++) {
            const x = 600 + (i * 300);
            const y = this.groundLevel - 35;
            const enemy = this.add.rectangle(x, y, 50, 30, 0xFF6600, 1);
            enemy.setDepth(9);
            console.log(`Test enemy ${i} created at (${x}, ${y})`);
        }
    }
    
    playJumpSound(rate = 1.0) {
        if (this.jumpSound) {
            try {
                this.jumpSound.play({ rate: rate });
                console.log('Jump sound played');
            } catch (error) {
                console.warn('Could not play jump sound:', error);
            }
        }
    }
    
    playCrashSound() {
        if (this.crashSound) {
            try {
                this.crashSound.play();
                console.log('Crash sound played');
            } catch (error) {
                console.warn('Could not play crash sound:', error);
            }
        }
    }
    
    // Engine sound management removed - engine sound was causing clicking bug
    // The loop artifacts in engine.wav were creating audible clicking that sped up between levels
    manageEngineSound(isMoving) {
        // Engine sound functionality disabled - was causing audio clicking bug
        // Game plays without engine/movement audio but retains all other sounds
    }
    
    shutdown() {
        console.log('🔇 GameScene shutdown - cleaning up audio...');
        
        // Stop and clean up background music
        if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
            this.backgroundMusic.stop();
            this.backgroundMusic.destroy();
            console.log('Background music stopped and destroyed');
        }
        
        // Engine sound cleanup removed (engine sound disabled due to clicking bug)
        console.log('🔇 Audio cleanup completed');
    }
    
    setupCollisions() {
        // Player vs ground
        this.physics.add.collider(this.player, this.groundBody, () => {
            if (!this.player.isOnGround) {
                this.player.isOnGround = true;
                this.player.canDoubleJump = true;
                this.player.canTripleJump = false; // Reset triple jump on landing
            }
        });
        
        // Player vs obstacles (overlap for regular obstacles)
        this.physics.add.overlap(this.player, this.obstacles, this.hitObstacle, null, this);
        
        // Player vs jump obstacles (collider for solid barriers)
        this.physics.add.collider(this.player, this.jumpObstacles, this.hitJumpObstacle, null, this);
        
        // Player vs enemies  
        this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);
        
        // Player vs powerups
        this.physics.add.overlap(this.player, this.powerups, this.collectPowerup, null, this);
        
        // Projectiles vs enemies
        this.physics.add.overlap(this.projectiles, this.enemies, this.projectileHitEnemy, null, this);

        // ⚔️ ENEMY PROJECTILES VS PLAYER ⚔️
        this.physics.add.overlap(this.player, this.projectiles, this.enemyProjectileHitPlayer, null, this);

        // Enemies vs ground
        this.physics.add.collider(this.enemies, this.groundBody);
        
        // Enemies vs obstacles (including ramps for physics interactions)
        this.physics.add.collider(this.enemies, this.obstacles, this.enemyHitObstacle, null, this);
        
        // Obstacles vs ground (for physics objects)
        this.physics.add.collider(this.obstacles, this.groundBody);
    }
    
    createUI() {
        // Weapon cooldown indicator (disabled - was showing green rectangles)
        // this.weaponCooldownBar = this.add.rectangle(150, 50, 100, 8, 0x00ff00);
        // this.weaponCooldownBar.setOrigin(0, 0.5);
        // this.weaponCooldownBg = this.add.rectangle(150, 50, 100, 10, 0x666666);
        // this.weaponCooldownBg.setOrigin(0, 0.5);
        // this.weaponCooldownBg.setDepth(-1);
        
        // Attack indicator
        this.attackIndicator = this.add.text(this.player.x, this.player.y - 40, '', {
            fontSize: '20px',
            fill: '#FF0000',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        
        // Speed boost effect indicator
        this.speedBoostIndicator = this.add.text(10, 100, '', {
            fontSize: '16px',
            fill: '#00FF00',
            fontFamily: 'Arial'
        });

        // 🔥 COMBO SYSTEM UI 🔥
        this.comboIndicator = this.add.text(10, 120, '', {
            fontSize: '18px',
            fill: '#FF4500',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        });

        // 🚀 NITRO BOOST UI 🚀
        this.nitroBarBg = this.add.rectangle(10, 150, 200, 20, 0x333333);
        this.nitroBarBg.setOrigin(0, 0.5);

        this.nitroBar = this.add.rectangle(10, 150, 200, 20, 0xFF4500);
        this.nitroBar.setOrigin(0, 0.5);

        this.nitroText = this.add.text(10, 170, 'NITRO: 0%', {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontFamily: 'Arial'
        });

        // 🌦️ WEATHER INDICATOR 🌦️
        this.weatherText = this.add.text(10, 190, '🌤️ Clear', {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontFamily: 'Arial'
        });
        
        // Controls help removed for clean gameplay interface
        
        // Distance to finish line tracking
        this.distanceText = this.add.text(SCREEN_WIDTH - 20, 30, '', {
            fontSize: '16px',
            fill: '#FFD700',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        });
        this.distanceText.setOrigin(1, 0);
        this.distanceText.setScrollFactor(0); // Fixed to camera
        
        // Progress bar
        this.progressBarBg = this.add.rectangle(SCREEN_WIDTH/2, 20, 300, 15, 0x333333);
        this.progressBarBg.setScrollFactor(0);
        this.progressBar = this.add.rectangle(SCREEN_WIDTH/2 - 150, 20, 0, 11, 0x00FF00);
        this.progressBar.setOrigin(0, 0.5);
        this.progressBar.setScrollFactor(0);
        
        // Progress text
        this.progressText = this.add.text(SCREEN_WIDTH/2, 40, 'Progress to Finish Line', {
            fontSize: '12px',
            fill: '#FFFFFF',
            fontFamily: 'Arial'
        });
        this.progressText.setOrigin(0.5, 0);
        this.progressText.setScrollFactor(0);
        
        // Racing position display
        this.positionText = this.add.text(20, 70, '', {
            fontSize: '20px',
            fill: '#FFD700',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.positionText.setScrollFactor(0);
        
        // Money display during gameplay
        this.moneyText = this.add.text(20, 100, '', {
            fontSize: '16px',
            fill: '#FFD700',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.moneyText.setScrollFactor(0);
    }
    
    update(time, delta) {
        try {
            this.updatePlayer(delta);
            this.updateWorld(delta);
            this.updateSpawning(time, delta);
            this.updatePowerups(delta);
            this.updateProjectiles(delta);

            // 🔥 NEW SYSTEMS 🔥
            this.updateComboSystem(delta);
            this.updateNitroSystem(delta);
            this.updateTrailSystem(delta);
            this.updateWeatherSystem(delta);

            this.updateUI();
            this.updateGameState();
        } catch (error) {
            console.error('🚨 CRITICAL ERROR in game update loop:', error);
            console.error('Error stack:', error.stack);
            // Continue running to prevent complete freeze
        }
        
        // Debug text updates removed for clean gameplay interface
        
        // Update crosshair position to follow player
        if (this.playerCrosshair && this.player) {
            this.playerCrosshair.x = this.player.x;
            this.playerCrosshair.y = this.player.y;
        }
        
        // Check for pause
        if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
            this.scene.pause();
            this.scene.launch(SCENES.PAUSE);
        }
    }
    
    updatePlayer(delta) {
        const deltaSeconds = delta / 1000;
        
        // Check if player is on ground
        const wasOnGround = this.player.isOnGround;
        this.player.isOnGround = this.player.body.touching.down;
        
        // Track air time for tricks
        if (!this.player.isOnGround) {
            this.player.airTime += deltaSeconds;
        } else if (!wasOnGround) {
            // Just landed - calculate trick bonus
            this.calculateTrickBonus();
            this.player.airTime = 0;
            this.player.lastGroundTime = Date.now();
        }
        
        // Automatic forward movement with left/right control
        const leftPressed = this.cursors.left.isDown || this.wasd.A.isDown || (this.touchInputs && this.touchInputs.left);
        const rightPressed = this.cursors.right.isDown || this.wasd.D.isDown || (this.touchInputs && this.touchInputs.right);
        
        // Base forward speed (automatic movement)
        let baseForwardSpeed = this.currentLevelConfig.worldSpeedMultiplier * 120; // Automatic forward movement

        // 🚀 NITRO BOOST INTEGRATION 🚀
        const nitroMultiplier = this.getNitroSpeedMultiplier();
        baseForwardSpeed *= nitroMultiplier;

        if (nitroMultiplier > 1.0) {
            // Create nitro trail effects when boosting
            this.createNitroEffect();
        }

        if (leftPressed) {
            // Slow down or move backwards
            this.player.body.setVelocityX(Math.max(0, baseForwardSpeed - 100));
        } else if (rightPressed) {
            // Speed up beyond base speed
            this.player.body.setVelocityX(baseForwardSpeed + 100);
        } else {
            // Maintain automatic forward speed
            this.player.body.setVelocityX(baseForwardSpeed);
        }
        
        // Engine sound management removed - was causing clicking sound bug
        // Game now plays without engine/movement audio
        
        // Log movement occasionally (every 60 frames = 1 second)
        if (this.time.now % 1000 < 16) {
            console.log(`🏍️ Player moving at speed: ${Math.round(this.player.body.velocity.x)}, Base speed: ${Math.round(baseForwardSpeed)}`);
        }
        
        // Jumping with double jump ability (W key removed to prevent conflict with weapon firing)
        const jumpPressed = Phaser.Input.Keyboard.JustDown(this.spaceKey) || 
                           Phaser.Input.Keyboard.JustDown(this.cursors.up);
        
        if (jumpPressed) {
            if (this.player.isOnGround) {
                // Normal jump
                let jumpPower = this.player.jumpPower;
                if (this.jumpBoostActive) {
                    jumpPower *= POWERUPS.JUMP_BOOST.effect;
                }
                this.player.body.setVelocityY(-jumpPower);
                this.player.canDoubleJump = true;
                
                // Play jump sound
                this.playJumpSound();
            } else if (this.player.canDoubleJump) {
                // Double jump
                let jumpPower = this.player.jumpPower * 0.8;
                if (this.jumpBoostActive) {
                    jumpPower *= POWERUPS.JUMP_BOOST.effect;
                }
                this.player.body.setVelocityY(-jumpPower);
                this.player.canDoubleJump = false;

                // Play jump sound (higher pitch for double jump)
                this.playJumpSound(1.2);
            } else if (this.player.canTripleJump) {
                // EPIC TRIPLE JUMP (only available after ramp boost)
                let jumpPower = this.player.jumpPower * 0.6;
                if (this.jumpBoostActive) {
                    jumpPower *= POWERUPS.JUMP_BOOST.effect;
                }
                this.player.body.setVelocityY(-jumpPower);
                this.player.canTripleJump = false;

                // Visual effect for epic triple jump
                this.createTripleJumpEffect(this.player.x, this.player.y);
                this.playJumpSound(1.5); // Even higher pitch
                console.log('🚀🚀🚀 EPIC TRIPLE JUMP ACTIVATED! 🚀🚀🚀');
            }
        }
        
        // Attack - handled by touch controls in handleTouchAttack
        if (Phaser.Input.Keyboard.JustDown(this.attackKey) && this.player.canAttack) {
            this.performAttack();
        }
        
        // Weapon firing - handled by touch controls in handleTouchWeapon
        if (Phaser.Input.Keyboard.JustDown(this.weaponKey)) {
            this.fireWeapon();
        }

        // 🚀 NITRO BOOST CONTROLS 🚀
        if (this.nitroKey.isDown || (this.touchInputs && this.touchInputs.boost)) {
            this.activateNitro();
        } else {
            this.deactivateNitro();
        }
        
        // Update attack cooldown
        if (this.player.attackCooldown > 0) {
            this.player.attackCooldown -= delta;
            if (this.player.attackCooldown <= 0) {
                this.player.canAttack = true;
            }
        }
        
        // Update speed for UI
        this.gameState.currentSpeed = Math.abs(this.player.body.velocity.x) + this.worldSpeed;
    }
    
    updateWorld(delta) {
        // Calculate current world speed for gameplay purposes
        let currentWorldSpeed = this.worldSpeed;
        if (this.speedBoostActive) {
            currentWorldSpeed *= POWERUPS.SPEED_BOOST.effect;
        }
        
        // Gradually increase game difficulty
        this.worldSpeed += delta * 0.008;
        
        // Update distance based on player's actual movement
        this.distanceTraveled += Math.abs(this.player.body.velocity.x) * delta / 1000;
        
        // Update game state speed for UI
        this.gameState.currentSpeed = Math.abs(this.player.body.velocity.x);
        
        // Enemy AI - now works with world coordinates and camera following
        this.enemies.children.entries.forEach(enemy => {
            if (enemy.body) {
                // ⚔️ ENHANCED ENEMY AI WITH ATTACK PATTERNS ⚔️
                this.updateEnemyAttackBehavior(enemy, delta);
            }
        });
        
        // Remove off-screen objects (based on camera bounds)
        this.removeOffScreenObjects();
    }
    
    handleEnemyObstacleJumping(enemy, targetVelocityX) {
        // Only process if enemy is on ground and moving forward
        if (!enemy.body.touching.down || targetVelocityX <= 0) {
            return;
        }
        
        // Look ahead distance based on enemy speed
        const lookAheadDistance = Math.max(80, targetVelocityX * 0.5);
        const checkX = enemy.x + lookAheadDistance;
        
        // Check for obstacles in front of enemy
        const nearbyObstacles = this.obstacles.children.entries.filter(obstacle => {
            if (!obstacle.body) return false;
            
            const obstacleX = obstacle.x;
            const isInPath = obstacleX > enemy.x && obstacleX < checkX;
            const isAtSimilarHeight = Math.abs(obstacle.y - enemy.y) < 100;
            
            return isInPath && isAtSimilarHeight;
        });
        
        // Jump over obstacles that require jumping
        nearbyObstacles.forEach(obstacle => {
            if (obstacle.mustJump) {
                // Calculate jump timing based on distance
                const distanceToObstacle = obstacle.x - enemy.x;
                const timeToObstacle = distanceToObstacle / Math.abs(targetVelocityX);
                
                // Jump when close enough (about 0.5-1 second before reaching obstacle)
                if (timeToObstacle < 1.0 && timeToObstacle > 0.3) {
                    // Different jump strengths based on obstacle type
                    let jumpStrength = obstacle.jumpHeight || 200;
                    
                    // Add some variation to make enemies look more natural
                    jumpStrength += (Math.random() - 0.5) * 50;
                    
                    enemy.body.setVelocityY(-jumpStrength);
                    
                    console.log(`🤖 Enemy jumped over ${obstacle.obstacleType} with strength ${jumpStrength}`);
                    
                    // Add small particle effect for enemy jump
                    this.createEnemyJumpEffect(enemy.x, enemy.y);
                }
            }
        });
    }
    
    createEnemyJumpEffect(x, y) {
        // Small gray particles for enemy jumps
        for (let i = 0; i < 3; i++) {
            const particle = this.add.rectangle(x, y, 2, 2, 0x888888);
            particle.setDepth(30);
            
            this.tweens.add({
                targets: particle,
                x: x + (Math.random() - 0.5) * 40,
                y: y - Math.random() * 20,
                alpha: 0,
                duration: 400,
                onComplete: () => particle.destroy()
            });
        }
    }

    // ⚔️ ENHANCED ENEMY AI WITH ATTACK PATTERNS ⚔️
    updateEnemyAttackBehavior(enemy, delta) {
        const distanceToPlayer = this.player.x - enemy.x;
        const verticalDistance = Math.abs(this.player.y - enemy.y);
        const baseSpeed = enemy.baseSpeed || 120;

        // Update timers
        enemy.attackCooldown = Math.max(0, enemy.attackCooldown - delta);
        enemy.dodgeTimer = Math.max(0, enemy.dodgeTimer - delta);
        enemy.ramAttackCooldown = Math.max(0, enemy.ramAttackCooldown - delta);

        // Detect player behavior
        const playerSpeed = Math.abs(this.player.body.velocity.x);
        const playerSpeedChange = playerSpeed - enemy.lastPlayerSpeed;
        enemy.lastPlayerSpeed = playerSpeed;

        let targetVelocityX = baseSpeed;
        let performSpecialAction = false;

        // Attack pattern-based behavior
        switch (enemy.attackPattern) {
            case 'aggressive':
                // Always tries to get close and attack
                if (distanceToPlayer > 0) {
                    targetVelocityX = baseSpeed * (1.2 + enemy.aggroLevel * 0.3);
                } else {
                    targetVelocityX = baseSpeed * 0.8;
                }

                // Ram attack when close
                if (Math.abs(distanceToPlayer) < enemy.attackRange &&
                    enemy.ramAttackCooldown <= 0 &&
                    verticalDistance < 60) {
                    this.performRamAttack(enemy);
                    performSpecialAction = true;
                }
                break;

            case 'defensive':
                // Maintains distance, attacks when player approaches
                if (Math.abs(distanceToPlayer) < enemy.attackRange * 1.5) {
                    if (distanceToPlayer > 0) {
                        targetVelocityX = baseSpeed * 0.7; // Slow down to let player catch up
                    } else {
                        targetVelocityX = baseSpeed * 1.4; // Speed up to maintain distance
                    }

                    // Jump attack when player gets too close
                    if (Math.abs(distanceToPlayer) < enemy.attackRange &&
                        enemy.attackCooldown <= 0 &&
                        enemy.body.touching.down) {
                        this.performJumpAttack(enemy);
                        performSpecialAction = true;
                    }
                } else {
                    targetVelocityX = baseSpeed * 0.9;
                }
                break;

            case 'tactical':
                // Adapts to player behavior and uses projectiles
                if (playerSpeed > 200) {
                    // Player is boosting - try to intercept
                    targetVelocityX = baseSpeed * 1.5;
                } else if (playerSpeedChange < -50) {
                    // Player is slowing down - be cautious
                    targetVelocityX = baseSpeed * 0.8;
                } else {
                    // Normal following behavior
                    targetVelocityX = distanceToPlayer > 0 ? baseSpeed * 1.1 : baseSpeed * 0.9;
                }

                // Shoot projectiles at range
                if (Math.abs(distanceToPlayer) < 200 &&
                    Math.abs(distanceToPlayer) > 100 &&
                    enemy.attackCooldown <= 0) {
                    this.performProjectileAttack(enemy);
                    performSpecialAction = true;
                }
                break;

            case 'berserker':
                // High aggression when damaged, ignores self-preservation
                const healthPercent = enemy.health / ENEMY_TYPES.RIDER.health;
                const berserkerMultiplier = 1 + (1 - healthPercent) * 0.8; // Up to 80% faster when damaged

                if (distanceToPlayer > 0) {
                    targetVelocityX = baseSpeed * berserkerMultiplier * 1.3;
                } else {
                    targetVelocityX = baseSpeed * berserkerMultiplier * 0.8;
                }

                // Multiple attacks when close
                if (Math.abs(distanceToPlayer) < enemy.attackRange && enemy.attackCooldown <= 0) {
                    if (Math.random() < 0.6) {
                        this.performRamAttack(enemy);
                    } else {
                        this.performJumpAttack(enemy);
                    }
                    performSpecialAction = true;
                }
                break;
        }

        // Dodge mechanics - all enemies can dodge
        if (enemy.dodgeTimer <= 0 && this.shouldEnemyDodge(enemy)) {
            this.performDodge(enemy);
            enemy.dodgeTimer = 2000 + Math.random() * 1000; // 2-3 second cooldown
        }

        // Weather effects on enemy behavior
        if (this.weatherType === 'wind' && this.windStrength > 0) {
            targetVelocityX *= (1 + this.windDirection * this.windStrength * 0.2);
        }

        // Apply movement with smart obstacle jumping
        if (!performSpecialAction) {
            this.handleEnemyObstacleJumping(enemy, targetVelocityX);
            enemy.body.setVelocityX(targetVelocityX);
        }
    }

    performRamAttack(enemy) {
        console.log(`⚔️ ${enemy.attackPattern} enemy performing ram attack!`);

        // Boost forward for ram attack
        const ramForce = 300 + enemy.aggroLevel * 100;
        enemy.body.setVelocityX(enemy.x < this.player.x ? ramForce : -ramForce);

        // Visual effect
        enemy.setTint(0xFF0000);
        this.time.delayedCall(500, () => enemy.clearTint());

        // Create attack particles
        for (let i = 0; i < 5; i++) {
            const particle = this.add.circle(enemy.x, enemy.y, 3, 0xFF4500);
            this.tweens.add({
                targets: particle,
                x: particle.x + (Math.random() - 0.5) * 60,
                y: particle.y + (Math.random() - 0.5) * 40,
                alpha: 0,
                duration: 400,
                onComplete: () => particle.destroy()
            });
        }

        enemy.ramAttackCooldown = 3000 + Math.random() * 2000;
        enemy.attackCooldown = 1500;
    }

    performJumpAttack(enemy) {
        console.log(`🦘 ${enemy.attackPattern} enemy performing jump attack!`);

        // Jump towards player
        const jumpPower = 250 + enemy.aggroLevel * 50;
        const horizontalBoost = enemy.x < this.player.x ? 150 : -150;

        enemy.body.setVelocityY(-jumpPower);
        enemy.body.setVelocityX(enemy.body.velocity.x + horizontalBoost);

        // Visual effect
        enemy.setTint(0xFFFF00);
        this.time.delayedCall(800, () => enemy.clearTint());

        enemy.attackCooldown = 2000 + Math.random() * 1000;
    }

    performProjectileAttack(enemy) {
        console.log(`🎯 ${enemy.attackPattern} enemy firing projectile!`);

        // Create enemy projectile
        const projectile = this.projectiles.create(enemy.x, enemy.y - 10, 'projectile');
        if (projectile) {
            projectile.setScale(0.8);
            projectile.setTint(0xFF0000); // Red enemy projectiles

            // Aim at player with some inaccuracy
            const accuracy = 0.7 + enemy.aggroLevel * 0.3;
            const targetX = this.player.x + (Math.random() - 0.5) * 100 * (1 - accuracy);
            const targetY = this.player.y + (Math.random() - 0.5) * 50 * (1 - accuracy);

            const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, targetX, targetY);
            const speed = 250;

            projectile.body.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );

            projectile.isEnemyProjectile = true;
            projectile.damage = 20;

            // Auto-destroy after 3 seconds
            this.time.delayedCall(3000, () => {
                if (projectile.active) projectile.destroy();
            });
        }

        enemy.attackCooldown = 1000 + Math.random() * 2000;
    }

    performDodge(enemy) {
        console.log(`🚀 ${enemy.attackPattern} enemy dodging!`);

        // Quick horizontal dodge
        const dodgeDirection = Math.random() > 0.5 ? 1 : -1;
        const dodgeForce = 200 + Math.random() * 100;

        enemy.body.setVelocityY(-100); // Small jump
        enemy.body.setVelocityX(enemy.body.velocity.x + dodgeDirection * dodgeForce);

        // Fade effect during dodge
        enemy.setAlpha(0.6);
        this.time.delayedCall(400, () => enemy.setAlpha(1));
    }

    shouldEnemyDodge(enemy) {
        // Check if player is attacking or if there are incoming projectiles
        const recentAttack = this.time.now - this.lastPlayerAttackTime < 1000;
        const nearbyProjectiles = this.projectiles.children.entries.some(proj => {
            return !proj.isEnemyProjectile &&
                   Phaser.Math.Distance.Between(proj.x, proj.y, enemy.x, enemy.y) < 120;
        });

        return recentAttack || nearbyProjectiles || (Math.random() < 0.002 * enemy.aggroLevel);
    }

    updateSpawning(time, delta) {
        this.spawnTimer += delta;
        
        // Calculate spawn position ahead of player in world coordinates
        const spawnDistance = 800; // Distance ahead of player to spawn objects
        const playerSpawnX = this.player.x + spawnDistance;
        
        // Spawn obstacles
        if (this.spawnTimer > 2000 && this.lastObstacleX < this.player.x + spawnDistance - 200) {
            this.spawnRandomObstacle(playerSpawnX);
            this.spawnTimer = 0;
        }
        
        // Spawn enemies - limited by level configuration
        const maxEnemies = this.currentLevelConfig.maxEnemies || 10;
        const currentEnemyCount = this.enemies.children.size;
        
        if (currentEnemyCount < maxEnemies && Math.random() < 0.0015 * delta) {
            this.spawnEnemy(playerSpawnX);
            console.log(`🏍️ Enemy spawned: ${currentEnemyCount + 1}/${maxEnemies}`);
        }
        
        // Spawn powerups
        if (Math.random() < 0.001 * delta) {
            this.spawnPowerup(playerSpawnX);
        }
    }
    
    spawnRandomObstacle(spawnX) {
        // Validate that spawnX is provided and is a world coordinate
        if (typeof spawnX !== 'number' || spawnX < 100) {
            console.error(`❌ Invalid spawnX: ${spawnX}. Must be a valid world coordinate.`);
            return;
        }
        
        // DIAGNOSTIC: Log spawn coordinates for debugging positioning
        console.log(`🎯 OBSTACLE SPAWN: spawnX=${spawnX}, playerX=${this.player.x}, relative=${spawnX - this.player.x}`);
        
        const obstacleTypes = Object.keys(OBSTACLES);
        const randomType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        const obstacleData = OBSTACLES[randomType];
        
        const spriteMap = {
            'ROCK': 'rock',
            'LOG': 'log', 
            'BARRIER': 'barrier',
            'RAMP': 'ramp',
            'RAMP2': 'ramp2'
        };
        
        let spriteName = spriteMap[randomType] || randomType.toLowerCase();
        
        // List all available textures for debugging (only once)
        if (!this.texturesListed) {
            console.log('Available textures:', Object.keys(this.textures.list));
            this.texturesListed = true;
        }
        
        // Check if real texture exists, otherwise use fallback
        if (!this.textures.exists(spriteName)) {
            const fallbackName = spriteName + '_fallback';
            if (this.textures.exists(fallbackName)) {
                spriteName = fallbackName;
                console.log(`Using fallback texture: ${fallbackName}`);
            } else {
                console.warn(`No texture found for obstacle: ${spriteName}, using 'bike' as emergency fallback`);
                spriteName = 'bike'; // Emergency fallback
            }
        } else {
            console.log(`Using real texture: ${spriteName}`);
        }
        
        // Position obstacle so bottom edge aligns EXACTLY with player and enemy bottom edges
        // All objects (player, enemy, obstacles) share the same bottom level
        const sharedBottomLevel = this.groundLevel; // Same bottom level as bikes
        
        // Create obstacle in appropriate group
        // RAMPS and MUST_JUMP obstacles go to jumpObstacles for better collision detection
        const obstacle = (obstacleData.mustJump || obstacleData.isRamp) ?
            this.jumpObstacles.create(spawnX, 0, spriteName) : // Temporary Y position
            this.obstacles.create(spawnX, 0, spriteName); // Temporary Y position
        
        console.log(`🏗️ OBSTACLE SPAWNED: ${randomType} → ${(obstacleData.mustJump || obstacleData.isRamp) ? 'jumpObstacles' : 'obstacles'} group`);
        
        // Configure obstacle physics and appearance
        obstacle.setDisplaySize(obstacleData.width, obstacleData.height); // Set size FIRST
        
        // Now position based on actual display height
        const obstacleY = sharedBottomLevel - (obstacle.displayHeight / 2);
        obstacle.setY(obstacleY);
        
        console.log(`🏁 Spawning ${randomType} at WORLD coordinates (${spawnX}, ${obstacleY}), obstacle display height=${obstacle.displayHeight}, bottom edge at Y=${sharedBottomLevel}`);
        obstacle.setDepth(8); // Behind enemies and player
        
        // Debug outlines removed for cleaner gameplay
        
        // Ensure the obstacle has a physics body before configuring it
        if (obstacle.body) {
            // CRITICAL FIX: Disable gravity to prevent falling!
            obstacle.body.setGravity(0, -this.gravity); // Cancel world gravity
            
            // Make obstacle completely static
            obstacle.body.setImmovable(true);
            obstacle.body.setVelocity(0, 0); // Ensure no initial velocity
            
            // Set collision box size
            obstacle.body.setSize(obstacleData.width * 0.9, obstacleData.height * 0.9);
            
            // Jump obstacles and RAMPS are completely solid - no overlap allowed
            if (obstacleData.mustJump || obstacleData.isRamp) {
                obstacle.body.setSize(obstacleData.width, obstacleData.height); // Full size collision
                console.log(`Created SOLID ${obstacleData.isRamp ? 'RAMP' : 'jump obstacle'}: ${randomType} at (${spawnX}, ${obstacle.y})`);
            }
            
            // DIAGNOSTIC: Log physics state to verify static behavior
            console.log(`🔧 PHYSICS CHECK: ${randomType} gravity=(${obstacle.body.gravity.x}, ${obstacle.body.gravity.y}), velocity=(${obstacle.body.velocity.x}, ${obstacle.body.velocity.y}), immovable=${obstacle.body.immovable}`);
        }
        obstacle.obstacleType = randomType;
        obstacle.points = obstacleData.points;
        obstacle.isRamp = obstacleData.isRamp || false;
        obstacle.mustJump = obstacleData.mustJump || false;
        
        // Ramps should provide upward velocity and ensure collision detection
        if (obstacle.isRamp) {
            obstacle.body.checkCollision.up = true;
            obstacle.body.checkCollision.down = true;
            obstacle.body.checkCollision.left = true;
            obstacle.body.checkCollision.right = true;
            console.log(`🚀 RAMP SETUP: ${randomType} configured for collision on all sides`);
        }
        
        // DIAGNOSTIC: Add final positioning confirmation
        console.log(`✅ OBSTACLE CREATED: ${randomType} at final world position (${obstacle.x}, ${obstacle.y}), relative to player: ${obstacle.x - this.player.x}`);
        
        this.lastObstacleX = spawnX;
    }
    
    spawnEnemy(spawnX) {
        // Validate that spawnX is provided and is a world coordinate
        if (typeof spawnX !== 'number' || spawnX < 100) {
            console.error(`❌ Invalid enemy spawnX: ${spawnX}. Must be a valid world coordinate.`);
            return;
        }
        
        // DIAGNOSTIC: Log enemy spawn coordinates for debugging positioning
        console.log(`🎯 ENEMY SPAWN: spawnX=${spawnX}, playerX=${this.player.x}, relative=${spawnX - this.player.x}`);
        
        // Position enemy so bottom edge aligns exactly with player and obstacles
        const sharedBottomLevel = this.groundLevel; // Same bottom level as player and obstacles
        const enemy = this.enemies.create(
            spawnX,
            0, // Temporary Y position
            'enemyRider'
        );
        
        enemy.setDisplaySize(80, 55); // Set size FIRST
        
        // Now position using EXACT same formula as obstacles for perfect alignment
        const enemyY = sharedBottomLevel - (enemy.displayHeight / 2);
        enemy.setY(enemyY);
        
        console.log(`🏁 Spawning enemy with bottom-center origin: position (${spawnX}, ${sharedBottomLevel}), bottom edge at Y=${sharedBottomLevel}`);
        enemy.setDepth(9); // Just below player
        enemy.body.setSize(65, 40); // Increased hitbox accordingly
        enemy.body.setBounce(0.1, 0);
        enemy.body.setDragX(30);
        
        // Enemy properties
        enemy.baseSpeed = ENEMY_TYPES.RIDER.speed + Math.random() * 50;
        enemy.health = ENEMY_TYPES.RIDER.health;
        enemy.points = ENEMY_TYPES.RIDER.points;
        enemy.money = ENEMY_TYPES.RIDER.money || 0;
        enemy.attackCooldown = 0;

        // ⚔️ ENHANCED AI ATTACK PATTERNS ⚔️
        enemy.attackPattern = Phaser.Utils.Array.GetRandom(['aggressive', 'defensive', 'tactical', 'berserker']);
        enemy.lastAttackTime = 0;
        enemy.attackRange = 80 + Math.random() * 40; // 80-120 pixels
        enemy.aggroLevel = Math.random(); // 0-1, higher = more aggressive
        enemy.dodgeTimer = 0;
        enemy.lastPlayerSpeed = 0;
        enemy.ramAttackCooldown = 0;
        
        // Set initial velocity towards player (since enemies are spawned ahead)
        enemy.body.setVelocityX(-enemy.baseSpeed);
    }
    
    spawnPowerup(spawnX) {
        // Validate that spawnX is provided and is a world coordinate
        if (typeof spawnX !== 'number' || spawnX < 100) {
            console.error(`❌ Invalid powerup spawnX: ${spawnX}. Must be a valid world coordinate.`);
            return;
        }
        
        // DIAGNOSTIC: Log powerup spawn coordinates for debugging positioning
        console.log(`🎯 POWERUP SPAWN: spawnX=${spawnX}, playerX=${this.player.x}, relative=${spawnX - this.player.x}`);
        
        const powerupTypes = Object.keys(POWERUPS);
        const randomType = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
        
        const powerupY = this.groundLevel - 40 - Math.random() * 20; // Much closer to ground (20-60 pixels above)
        console.log(`🏁 Spawning ${randomType} powerup at WORLD coordinates (${spawnX}, ${powerupY})`);
        
        const powerup = this.powerups.create(
            spawnX,
            powerupY,
            randomType.toLowerCase().replace('_', '')
        );
        
        powerup.setDisplaySize(25, 25);
        powerup.body.setSize(20, 20);
        powerup.body.setGravity(0, -this.gravity); // Float in air
        powerup.powerupType = randomType;
        
        // Add floating animation
        this.tweens.add({
            targets: powerup,
            y: powerup.y - 20,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    fireWeapon() {
        if (this.weaponCooldown <= 0) {
            const weapon = this.weaponStats;
            
            // Play attack sound
            if (this.attackSound) {
                try {
                    this.attackSound.play();
                } catch (error) {
                    console.warn('Could not play attack sound:', error);
                }
            }
            
            const projectile = this.projectiles.create(
                this.player.x + 30,
                this.player.y,
                null
            );
            
            // Configure projectile based on weapon type
            projectile.setDisplaySize(8, 4);
            projectile.body.setVelocityX(weapon.speed);
            projectile.body.setGravity(0, -this.gravity);
            projectile.damage = weapon.damage;
            projectile.weaponType = this.gameState.currentWeapon;
            
            // Visual styling based on weapon
            switch(this.gameState.currentWeapon) {
                case 'BASIC_SHOT':
                    projectile.setTint(0xff0000);
                    break;
                case 'RAPID_FIRE':
                    projectile.setTint(0x00ff00);
                    projectile.setDisplaySize(6, 3);
                    break;
                case 'POWER_SHOT':
                    projectile.setTint(0xff8800);
                    projectile.setDisplaySize(12, 6);
                    break;
                case 'CHAIN_SHOT':
                    projectile.setTint(0x8800ff);
                    projectile.canPenetrate = true;
                    break;
                case 'ROCKET':
                    projectile.setTint(0xffff00);
                    projectile.setDisplaySize(10, 8);
                    projectile.isExplosive = true;
                    break;
            }
            
            // Set lifetime
            this.time.delayedCall(3000, () => {
                if (projectile && projectile.active) {
                    projectile.destroy();
                }
            });
            
            this.weaponCooldown = weapon.cooldown;
        }
    }
    
    performAttack() {
        this.player.canAttack = false;
        this.player.attackCooldown = 600;

        // ⚔️ Track attack time for enemy dodge system ⚔️
        this.lastPlayerAttackTime = this.time.now;

        // Show attack indicator
        this.attackIndicator.setText('⚡');
        this.attackIndicator.setPosition(this.player.x + 20, this.player.y - 30);
        
        // Check for enemies in attack range
        this.enemies.children.entries.forEach(enemy => {
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
            if (distance < 80) {
                this.attackEnemy(enemy);
            }
        });
        
        // Clear attack indicator
        this.time.delayedCall(300, () => {
            this.attackIndicator.setText('');
        });
    }
    
    attackEnemy(enemy) {
        enemy.health--;
        
        // Knock back enemy
        enemy.body.setVelocityX(enemy.body.velocity.x - 100);
        
        if (enemy.health <= 0) {
            const previousScore = this.gameState.score;
            
            // 🔥 COMBO SYSTEM INTEGRATION 🔥 - Remove the manual score addition since addCombo will handle it
            this.gameState.money = this.clampValue(this.safeAdd(this.gameState.money, enemy.money), 0, 500);
            const comboBonus = this.addCombo('enemy', enemy.points);
            console.log(`🎯 Enemy defeated with combo bonus: ${comboBonus}`);
            
            console.log(`🎯 SCORE! Enemy defeated: +${enemy.points} points (${previousScore} → ${this.gameState.score})`);
            console.log(`💰 MONEY EARNED! Enemy defeated: +$${enemy.money}, Total session money: $${this.gameState.money}`);
            
            // Show visual money indicator
            this.showMoneyEarned(enemy.x, enemy.y, enemy.money);
            
            // Immediately save the updated money to registry to prevent loss
            this.registry.set('gameState', this.gameState);
            
            // Death effect
            this.createExplosionEffect(enemy.x, enemy.y);
            enemy.destroy();
            console.log(`🏍️ Enemy destroyed: ${this.enemies.children.size - 1}/${this.currentLevelConfig.maxEnemies} remaining`);
        } else {
            // Damage effect
            enemy.setTint(0xff0000);
            this.time.delayedCall(200, () => {
                enemy.clearTint();
            });
        }
    }
    
    projectileHitEnemy(projectile, enemy) {
        // Apply damage based on weapon
        enemy.health -= projectile.damage;
        
        // Slow enemy down based on damage
        const slowAmount = 0.9 - (projectile.damage * 0.1);
        enemy.body.setVelocityX(enemy.body.velocity.x * slowAmount);
        enemy.baseSpeed *= slowAmount;
        
        // Special weapon effects
        if (projectile.isExplosive) {
            // Rocket explosion affects nearby enemies
            this.createExplosionEffect(projectile.x, projectile.y);
            this.enemies.children.entries.forEach(nearbyEnemy => {
                const distance = Phaser.Math.Distance.Between(projectile.x, projectile.y, nearbyEnemy.x, nearbyEnemy.y);
                if (distance < 80 && nearbyEnemy !== enemy) {
                    nearbyEnemy.health -= Math.floor(projectile.damage / 2);
                    nearbyEnemy.body.setVelocityX(nearbyEnemy.body.velocity.x * 0.5);
                }
            });
        }
        
        // Visual effect based on weapon
        const effectColor = projectile.weaponType === 'POWER_SHOT' ? 0xff8800 : 0x0000ff;
        enemy.setTint(effectColor);
        this.time.delayedCall(1000, () => {
            enemy.clearTint();
        });
        
        // Check if enemy is destroyed
        if (enemy.health <= 0) {
            const previousScore = this.gameState.score;
            
            // 🔥 COMBO SYSTEM INTEGRATION 🔥 - Remove the manual score addition since addCombo will handle it
            this.gameState.money = this.clampValue(this.safeAdd(this.gameState.money, enemy.money), 0, 500);
            const comboBonus = this.addCombo('enemy', enemy.points);
            console.log(`🎯 Enemy defeated with combo bonus: ${comboBonus}`);
            
            console.log(`🎯 SCORE! Enemy defeated by projectile: +${enemy.points} points (${previousScore} → ${this.gameState.score})`);
            console.log(`💰 MONEY EARNED! Enemy defeated by projectile: +$${enemy.money}, Total session money: $${this.gameState.money}`);
            
            // Show visual money indicator
            this.showMoneyEarned(enemy.x, enemy.y, enemy.money);
            
            // Immediately save the updated money to registry to prevent loss
            this.registry.set('gameState', this.gameState);
            
            this.createExplosionEffect(enemy.x, enemy.y);
            enemy.destroy();
            console.log(`🏍️ Enemy destroyed by projectile: ${this.enemies.children.size - 1}/${this.currentLevelConfig.maxEnemies} remaining`);
        }
        
        const hitPoints = this.safeMultiply(25, projectile.damage);
        const previousScore = this.gameState.score;
        this.gameState.score = this.clampValue(this.safeAdd(this.gameState.score, hitPoints), 0, 5000);
        console.log(`🎯 SCORE! Projectile hit: +${hitPoints} points (${previousScore} → ${this.gameState.score})`);
        
        // Chain shots can penetrate
        if (!projectile.canPenetrate) {
            projectile.destroy();
        }
    }
    
    showMoneyEarned(x, y, amount) {
        // Create floating money text
        const moneyText = this.add.text(x, y - 30, `+$${amount}`, {
            fontSize: '20px',
            fill: '#00FF00',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        });
        moneyText.setDepth(1000);
        
        // Animate the text floating up and fading out
        this.tweens.add({
            targets: moneyText,
            y: y - 80,
            alpha: 0,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => {
                moneyText.destroy();
            }
        });
    }

    // ⚔️ ENEMY PROJECTILE HIT PLAYER ⚔️
    enemyProjectileHitPlayer(player, projectile) {
        // Only handle enemy projectiles
        if (!projectile.isEnemyProjectile) return;

        console.log('💥 Player hit by enemy projectile!');

        // Apply damage to player (if health system exists)
        if (this.gameState.health !== undefined) {
            this.gameState.health = Math.max(0, this.gameState.health - projectile.damage);
        }

        // Visual feedback
        player.setTint(0xFF0000);
        this.time.delayedCall(200, () => player.clearTint());

        // Screen shake for impact
        this.cameras.main.shake(200, 0.02);

        // Knockback effect
        const knockbackForce = 150;
        const angle = Phaser.Math.Angle.Between(projectile.x, projectile.y, player.x, player.y);
        player.body.setVelocity(
            player.body.velocity.x + Math.cos(angle) * knockbackForce,
            player.body.velocity.y + Math.sin(angle) * knockbackForce
        );

        // Damage particles
        for (let i = 0; i < 6; i++) {
            const particle = this.add.circle(player.x, player.y, 2, 0xFF0000);
            this.tweens.add({
                targets: particle,
                x: particle.x + (Math.random() - 0.5) * 40,
                y: particle.y + (Math.random() - 0.5) * 40,
                alpha: 0,
                duration: 500,
                onComplete: () => particle.destroy()
            });
        }

        // Destroy the projectile
        projectile.destroy();
    }

    hitJumpObstacle(player, obstacle) {
        console.log(`🎯 DEBUG: hitJumpObstacle called - JUMP OBSTACLE hit! Type: ${obstacle.obstacleType}`);
        console.log(`🔥 COLLISION DETECTED! Player hit obstacle in jumpObstacles group!`);

        // Check if this is a RAMP first!
        if (obstacle.isRamp) {
            // RAMPS: Provide EPIC jump boost when touched - ENHANCED!
            console.log('🚀🚀🚀 EPIC RAMP HIT! LAUNCHING INTO THE SKY! 🚀🚀🚀');
            console.log(`🎯 Ramp type: ${obstacle.obstacleType}, isRamp: ${obstacle.isRamp}`);

            const approachSpeed = Math.abs(player.body.velocity.x);
            // ENHANCED: Much bigger jump boost that scales with speed
            const baseJumpBoost = 800; // Increased from 600
            const speedMultiplier = Math.min(4, approachSpeed * 0.015); // Speed contributes more
            const jumpBoost = baseJumpBoost + (approachSpeed * speedMultiplier);

            // ENHANCED: More significant speed boost
            const speedBoost = Math.min(200, approachSpeed * 0.8); // Increased from 150 and 0.5

            player.body.setVelocityY(-jumpBoost);
            player.body.setVelocityX(player.body.velocity.x + speedBoost);

            // 🔥 COMBO SYSTEM INTEGRATION 🔥
            const comboBonus = this.addCombo('ramp', obstacle.points * 2);
            console.log(`🚀 Ramp hit with combo bonus: ${comboBonus}`);

            // ENHANCED: Multiple visual effects for epic feeling
            this.createSpeedLines();
            this.createRampBoostEffect(obstacle.x, obstacle.y);
            this.createEpicRampExplosion(obstacle.x, obstacle.y); // New epic effect
            this.cameras.main.shake(200, 0.02); // Screen shake for impact

            // ENHANCED: Allow triple jump after ramp for extra airtime fun
            this.player.canDoubleJump = true;
            this.player.canTripleJump = true; // New mechanic

            // ENHANCED: Temporary invincibility frames after epic ramp jump
            this.player.setTint(0x00ffff); // Cyan glow
            this.time.delayedCall(1000, () => {
                this.player.clearTint();
            });

            console.log(`🚀🚀🚀 Applied EPIC ramp boost: jumpBoost=${jumpBoost}, speedBoost=${speedBoost}, TRIPLE JUMP ENABLED! 🚀🚀🚀`);

            // Don't destroy ramp, let it be reused
            return false; // Prevent physics separation
        }

        // NON-RAMP jump obstacles (LOG, BARRIER, ROCK): Slow player
        console.log(`🐌 LOG/BARRIER/ROCK hit! This should SLOW you down for not jumping!`);

        if (!this.invincibilityActive) {
            // Apply temporary slowdown effect (same as hitting other jump obstacles)
            this.applySlowdownEffect(player, obstacle);
            obstacle.destroy();
        }

        return false; // Prevent physics separation since we're handling it manually
    }

    hitObstacle(player, obstacle) {
        console.log(`🎯 DEBUG: hitObstacle called - Obstacle type: ${obstacle.obstacleType}, mustJump: ${obstacle.mustJump}, isRamp: ${obstacle.isRamp}`);
        console.log(`🔥 COLLISION DETECTED! Player hit obstacle in obstacles group!`);
        
        if (obstacle.isRamp) {
            // RAMPS: Provide EPIC jump boost when touched - ENHANCED!
            console.log('🚀🚀🚀 EPIC RAMP HIT! LAUNCHING INTO THE SKY! 🚀🚀🚀');
            console.log(`🎯 Ramp type: ${obstacle.obstacleType}, isRamp: ${obstacle.isRamp}`);

            const approachSpeed = Math.abs(player.body.velocity.x);
            // ENHANCED: Much bigger jump boost that scales with speed
            const baseJumpBoost = 800; // Increased from 600
            const speedMultiplier = Math.min(4, approachSpeed * 0.015); // Speed contributes more
            const jumpBoost = baseJumpBoost + (approachSpeed * speedMultiplier);

            // ENHANCED: More significant speed boost
            const speedBoost = Math.min(200, approachSpeed * 0.8); // Increased from 150 and 0.5

            player.body.setVelocityY(-jumpBoost);
            player.body.setVelocityX(player.body.velocity.x + speedBoost);

            // 🔥 COMBO SYSTEM INTEGRATION 🔥
            const comboBonus = this.addCombo('ramp', obstacle.points * 2);
            console.log(`🚀 Ramp hit with combo bonus: ${comboBonus}`);

            // ENHANCED: Multiple visual effects for epic feeling
            this.createSpeedLines();
            this.createRampBoostEffect(obstacle.x, obstacle.y);
            this.createEpicRampExplosion(obstacle.x, obstacle.y); // New epic effect
            this.cameras.main.shake(200, 0.02); // Screen shake for impact

            // ENHANCED: Allow triple jump after ramp for extra airtime fun
            this.player.canDoubleJump = true;
            this.player.canTripleJump = true; // New mechanic

            // ENHANCED: Temporary invincibility frames after epic ramp jump
            this.player.setTint(0x00ffff); // Cyan glow
            this.time.delayedCall(1000, () => {
                this.player.clearTint();
            });

            console.log(`🚀🚀🚀 Applied EPIC ramp boost: jumpBoost=${jumpBoost}, speedBoost=${speedBoost}, TRIPLE JUMP ENABLED! 🚀🚀🚀`);

            // Don't destroy ramp, let it be reused
            return;
        }
        
        // JUMP OBSTACLES (LOG, BARRIER, ROCK): Slow player if not jumped over
        if (obstacle.mustJump || ['LOG', 'BARRIER', 'ROCK'].includes(obstacle.obstacleType)) {
            console.log(`💥 Hit jump obstacle: ${obstacle.obstacleType} - applying slowdown`);
            console.log(`🐌 ROCK/LOG/BARRIER hit! This should SLOW you down, not make you jump!`);
            
            if (!this.invincibilityActive) {
                // Apply temporary slowdown effect
                this.applySlowdownEffect(player, obstacle);
                obstacle.destroy();
            }
            return;
        }
        
        // REGULAR OBSTACLES: Normal collision behavior
        if (!this.invincibilityActive && !obstacle.isRamp) {
            console.log(`💥 Hit regular obstacle: ${obstacle.obstacleType}`);
            
            // Regular obstacles cause damage and knockback
            this.gameState.score = Math.max(0, this.gameState.score - 50);
            
            // More realistic collision physics
            const collisionForce = Math.abs(player.body.velocity.x) * 0.01;
            player.body.setVelocityX(player.body.velocity.x * (0.3 + collisionForce));
            player.body.setVelocityY(-150 - collisionForce * 50);
            
            this.flashScreen(0xff0000);
            this.createCollisionEffect(obstacle.x, obstacle.y);
            this.playCrashSound();
            
            obstacle.destroy();
        }
    }
    
    applySlowdownEffect(player, obstacle) {
        // Temporary slowdown for hitting jump obstacles without jumping
        const slowdownFactor = 0.3;
        const slowdownDuration = 2000; // 2 seconds
        
        // Apply immediate velocity reduction
        player.body.setVelocityX(player.body.velocity.x * slowdownFactor);
        player.body.setVelocityY(-100); // Small bounce
        
        // Store original max speed and reduce it temporarily
        if (!this.originalMaxSpeed) {
            this.originalMaxSpeed = player.maxSpeed;
        }
        player.maxSpeed = this.originalMaxSpeed * slowdownFactor;
        
        // Visual feedback
        this.flashScreen(0xffaa00); // Orange flash
        this.createCollisionEffect(obstacle.x, obstacle.y);
        this.playCrashSound();
        
        // Restore speed after duration
        if (this.slowdownTimer) {
            this.slowdownTimer.destroy();
        }
        
        this.slowdownTimer = this.time.delayedCall(slowdownDuration, () => {
            player.maxSpeed = this.originalMaxSpeed;
            console.log('🏃 Speed restored after slowdown');
        });
        
        console.log(`🐌 Applied slowdown: speed reduced to ${player.maxSpeed} for ${slowdownDuration}ms`);
    }
    
    createJumpSuccessEffect(x, y) {
        // Green success particles
        for (let i = 0; i < 8; i++) {
            const particle = this.add.rectangle(x, y, 4, 4, 0x00FF00);
            particle.setDepth(50);
            
            this.tweens.add({
                targets: particle,
                x: x + (Math.random() - 0.5) * 100,
                y: y - Math.random() * 50,
                alpha: 0,
                duration: 800,
                onComplete: () => particle.destroy()
            });
        }
        
        // Success text
        const successText = this.add.text(x, y - 30, 'JUMPED!', {
            fontSize: '16px',
            fill: '#00FF00',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        });
        successText.setOrigin(0.5);
        successText.setDepth(51);
        
        this.tweens.add({
            targets: successText,
            y: y - 60,
            alpha: 0,
            duration: 1000,
            onComplete: () => successText.destroy()
        });
    }
    
    showJumpReminder() {
        // Show jump reminder text
        const reminderText = this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 - 100, 'PRESS SPACE TO JUMP!', {
            fontSize: '24px',
            fill: '#FF0000',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            stroke: '#FFFFFF',
            strokeThickness: 2
        });
        reminderText.setOrigin(0.5);
        reminderText.setScrollFactor(0); // Fixed to camera
        reminderText.setDepth(100);
        
        // Fade out after 2 seconds
        this.tweens.add({
            targets: reminderText,
            alpha: 0,
            duration: 2000,
            onComplete: () => reminderText.destroy()
        });
    }
    
    createMoneyCollectionEffect(x, y, amount) {
        // Golden money particles
        for (let i = 0; i < 6; i++) {
            const particle = this.add.rectangle(x, y, 3, 3, 0xFFD700);
            particle.setDepth(60);
            
            this.tweens.add({
                targets: particle,
                x: x + (Math.random() - 0.5) * 80,
                y: y - Math.random() * 40,
                alpha: 0,
                duration: 600,
                onComplete: () => particle.destroy()
            });
        }
        
        // Money amount text
        const moneyText = this.add.text(x, y - 20, `+$${amount}`, {
            fontSize: '18px',
            fill: '#FFD700',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        });
        moneyText.setOrigin(0.5);
        moneyText.setDepth(61);
        
        this.tweens.add({
            targets: moneyText,
            y: y - 50,
            alpha: 0,
            duration: 1200,
            onComplete: () => moneyText.destroy()
        });
    }
    
    hitEnemy(player, enemy) {
        // Add cooldown to prevent spam collisions
        const now = Date.now();
        if (!enemy.lastHitTime || now - enemy.lastHitTime > 1000) { // 1 second cooldown
            enemy.lastHitTime = now;
            
            this.gameState.score = Math.max(0, this.gameState.score - 50); // Less penalty
            
            // Minor speed adjustment instead of major knockback
            player.body.setVelocityX(player.body.velocity.x * 0.8); // 20% reduction instead of 70%
            enemy.body.setVelocityX(enemy.body.velocity.x * 0.8);
            
            this.flashScreen(0xff0000);
            this.playCrashSound();
        }
    }
    
    enemyHitObstacle(enemy, obstacle) {
        console.log(`👿 Enemy hit obstacle: ${obstacle.obstacleType}`);
        
        if (obstacle.isRamp) {
            // Enemies also get ramp boosts (same as player)
            console.log('🚀 Enemy hit ramp! Applying big jump boost!');
            
            const approachSpeed = Math.abs(enemy.body.velocity.x);
            const jumpBoost = 600 + approachSpeed * 2; // Same massive boost as player
            const speedBoost = Math.min(150, approachSpeed * 0.5);
            
            enemy.body.setVelocityY(-jumpBoost);
            enemy.body.setVelocityX(enemy.body.velocity.x + (enemy.body.velocity.x > 0 ? speedBoost : -speedBoost));
            
            console.log(`🚀 Enemy ramp boost applied: jumpBoost=${jumpBoost}, speedBoost=${speedBoost}`);
            return;
        }
        
        // AUTOMATIC JUMPING for jump obstacles (LOG, BARRIER, ROCK)
        if (obstacle.mustJump || ['LOG', 'BARRIER', 'ROCK'].includes(obstacle.obstacleType)) {
            console.log(`🤖 Enemy automatically jumping over: ${obstacle.obstacleType}`);
            
            // Enemies automatically jump over jump obstacles
            const jumpHeight = obstacle.jumpHeight || 400;
            const currentSpeedX = enemy.body.velocity.x;
            
            // Apply jump with current horizontal momentum
            enemy.body.setVelocityY(-jumpHeight);
            enemy.body.setVelocityX(currentSpeedX * 1.1); // Slight speed boost while jumping
            
            console.log(`🤖 Enemy jumped: jumpHeight=${jumpHeight}, maintained speed=${currentSpeedX * 1.1}`);
            return; // Don't destroy obstacle, let enemy jump over it
        }
        
        // Regular obstacles slow enemies down
        enemy.body.setVelocityX(enemy.body.velocity.x * 0.7);
        console.log(`👿 Enemy slowed by regular obstacle: ${obstacle.obstacleType}`);
    }
    
    collectPowerup(player, powerup) {
        const powerupData = POWERUPS[powerup.powerupType];
        
        switch (powerup.powerupType) {
            case 'SPEED_BOOST':
                this.activateSpeedBoost(powerupData.duration);
                break;
            case 'JUMP_BOOST':
                this.activateJumpBoost(powerupData.duration);
                break;
            case 'MONEY_BAG':
                const moneyBefore = this.gameState.money;
                this.gameState.money = (this.gameState.money || 0) + (powerupData.value || 0);
                console.log(`💰 MONEY EARNED! Money bag collected: +$${powerupData.value}, Total session money: $${this.gameState.money}`);
                
                // Show visual money indicator
                this.showMoneyEarned(powerup.x, powerup.y, powerupData.value);
                
                // Show money collection effect
                this.createMoneyCollectionEffect(powerup.x, powerup.y, powerupData.value);
                
                // Immediately save the updated money to registry to prevent loss
                this.registry.set('gameState', this.gameState);
                break;
            case 'INVINCIBILITY':
                this.activateInvincibility(powerupData.duration);
                break;
        }
        
        this.gameState.score += powerupData.points;
        
        // Collection effect
        this.createCollectionEffect(powerup.x, powerup.y, powerupData.color);
        powerup.destroy();
    }
    
    activateSpeedBoost(duration) {
        this.speedBoostActive = true;
        this.player.setTint(0x00ff00);
        
        this.time.delayedCall(duration, () => {
            this.speedBoostActive = false;
            this.player.clearTint();
        });
    }
    
    activateJumpBoost(duration) {
        this.jumpBoostActive = true;
        
        this.time.delayedCall(duration, () => {
            this.jumpBoostActive = false;
        });
    }
    
    activateInvincibility(duration) {
        this.invincibilityActive = true;
        this.player.setTint(0xff00ff);
        
        // Flashing effect
        this.tweens.add({
            targets: this.player,
            alpha: 0.5,
            duration: 200,
            yoyo: true,
            repeat: duration / 400
        });
        
        this.time.delayedCall(duration, () => {
            this.invincibilityActive = false;
            this.player.clearTint();
            this.player.setAlpha(1);
        });
    }
    
    createExplosionEffect(x, y) {
        const explosion = this.add.circle(x, y, 30, 0xff8800);
        this.tweens.add({
            targets: explosion,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 300,
            onComplete: () => explosion.destroy()
        });
    }
    
    createCollectionEffect(x, y, color) {
        const effect = this.add.circle(x, y, 15, color);
        this.tweens.add({
            targets: effect,
            scaleX: 3,
            scaleY: 3,
            alpha: 0,
            duration: 500,
            onComplete: () => effect.destroy()
        });
    }
    
    createSpeedLines() {
        for (let i = 0; i < 5; i++) {
            const line = this.add.rectangle(
                this.player.x - 20 - i * 30,
                this.player.y + Math.random() * 40 - 20,
                20, 2, 0xffffff
            );
            
            this.tweens.add({
                targets: line,
                x: line.x - 100,
                alpha: 0,
                duration: 300,
                onComplete: () => line.destroy()
            });
        }
    }
    
    createRampBoostEffect(x, y) {
        // Create boost particles
        for (let i = 0; i < 8; i++) {
            const particle = this.add.circle(x, y, 3, 0x00ff88);
            const angle = (Math.PI * 2 * i) / 8;
            const speed = 100 + Math.random() * 50;
            
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                scaleX: 0,
                scaleY: 0,
                duration: 600,
                onComplete: () => particle.destroy()
            });
        }
        
        // Create boost text
        const boostText = this.add.text(x, y - 30, 'BOOST!', {
            fontSize: '16px',
            fill: '#00FF88',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: boostText,
            y: boostText.y - 40,
            alpha: 0,
            duration: 800,
            onComplete: () => boostText.destroy()
        });
    }

    createEpicRampExplosion(x, y) {
        // Create EPIC explosion effect for enhanced ramp boost
        for (let i = 0; i < 15; i++) {
            const particle = this.add.circle(x, y, 4 + Math.random() * 3, 0xffaa00);
            const angle = Math.random() * Math.PI * 2;
            const speed = 150 + Math.random() * 100;

            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                scaleX: 2,
                scaleY: 2,
                duration: 800,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }

        // Create epic boost text
        const epicText = this.add.text(x, y - 50, '🚀 EPIC BOOST! 🚀', {
            fontSize: '20px',
            fill: '#FFD700',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            stroke: '#FF4500',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.tweens.add({
            targets: epicText,
            y: epicText.y - 80,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 1200,
            ease: 'Power2',
            onComplete: () => epicText.destroy()
        });
    }

    createTripleJumpEffect(x, y) {
        // Create sparkly triple jump effect
        for (let i = 0; i < 12; i++) {
            const sparkle = this.add.circle(x, y, 2, 0x00ffff);
            const angle = (Math.PI * 2 * i) / 12;
            const radius = 30 + Math.random() * 20;

            this.tweens.add({
                targets: sparkle,
                x: x + Math.cos(angle) * radius,
                y: y + Math.sin(angle) * radius,
                alpha: 0,
                scaleX: 0,
                scaleY: 0,
                duration: 500,
                onComplete: () => sparkle.destroy()
            });
        }

        // Create triple jump text
        const tripleText = this.add.text(x, y - 30, '⭐ TRIPLE! ⭐', {
            fontSize: '14px',
            fill: '#00FFFF',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: tripleText,
            y: tripleText.y - 50,
            alpha: 0,
            duration: 600,
            onComplete: () => tripleText.destroy()
        });
    }
    
    createCollisionEffect(x, y) {
        // Create collision sparks
        for (let i = 0; i < 6; i++) {
            const spark = this.add.circle(x, y, 2, 0xff4400);
            const angle = Math.random() * Math.PI * 2;
            const speed = 80 + Math.random() * 40;
            
            this.tweens.add({
                targets: spark,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                duration: 400,
                onComplete: () => spark.destroy()
            });
        }
    }
    
    calculateTrickBonus() {
        if (this.player.airTime > 1.0) {
            // Award points based on air time (increased multiplier)
            const basePoints = Math.floor(this.player.airTime * 150); // Increased from 50
            const bonusPoints = basePoints * this.player.trickMultiplier;
            
            this.gameState.score += bonusPoints;
            const moneyEarned = Math.floor(bonusPoints / 10) || 0;
            this.gameState.money = (this.gameState.money || 0) + moneyEarned;
            console.log(`💰 Trick bonus! Money earned: ${moneyEarned}, Total session money: ${this.gameState.money}`);
            
            // Immediately save the updated money to registry to prevent loss
            this.registry.set('gameState', this.gameState);
            
            // Show trick bonus text
            let trickText = 'Nice Air!';
            if (this.player.airTime > 2.0) trickText = 'Sick Trick!';
            if (this.player.airTime > 3.0) trickText = 'INSANE AIR!';
            
            const bonusDisplay = this.add.text(this.player.x, this.player.y - 50, 
                `${trickText} +${bonusPoints}`, {
                fontSize: '18px',
                fill: '#FFD700',
                fontFamily: 'Arial',
                fontWeight: 'bold',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);
            
            this.tweens.add({
                targets: bonusDisplay,
                y: bonusDisplay.y - 30,
                alpha: 0,
                duration: 1500,
                onComplete: () => bonusDisplay.destroy()
            });
            
            // Reset trick multiplier
            this.player.trickMultiplier = 1;
        }
    }

    // 🔥 COMBO SYSTEM FUNCTIONS 🔥
    addCombo(actionType, baseScore) {
        // Reset combo if different action or too much time passed
        if (this.lastComboAction !== actionType || this.comboTimer <= 0) {
            this.comboCount = 1;
            this.comboMultiplier = 1;
        } else {
            this.comboCount++;
            this.comboMultiplier = Math.min(this.maxComboMultiplier, Math.floor(this.comboCount / 2) + 1);
        }

        // Reset combo timer
        this.comboTimer = this.comboTimeLimit;
        this.lastComboAction = actionType;

        // Calculate bonus score
        const comboBonus = baseScore * this.comboMultiplier;
        this.gameState.score += comboBonus;

        // Add nitro meter when performing combos
        this.addNitroMeter(5 * this.comboMultiplier);

        // Show combo effect
        this.showComboEffect(comboBonus);

        console.log(`🔥 COMBO x${this.comboCount}! Multiplier: ${this.comboMultiplier}x, Bonus: ${comboBonus}`);

        return comboBonus;
    }

    showComboEffect(comboBonus) {
        if (this.comboCount <= 1) return; // Don't show for single actions

        // Create combo text with scaling effect
        const comboText = this.add.text(this.player.x, this.player.y - 80,
            `🔥 COMBO x${this.comboCount}! +${comboBonus}`, {
            fontSize: `${16 + this.comboMultiplier * 2}px`,
            fill: '#FF4500',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            stroke: '#FFFFFF',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Pulsing scale effect
        this.tweens.add({
            targets: comboText,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 100,
            yoyo: true,
            onComplete: () => {
                this.tweens.add({
                    targets: comboText,
                    y: comboText.y - 60,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => comboText.destroy()
                });
            }
        });

        // Combo particles
        for (let i = 0; i < this.comboMultiplier; i++) {
            const particle = this.add.circle(this.player.x, this.player.y, 3, 0xFF4500);
            const angle = (Math.PI * 2 * i) / this.comboMultiplier;
            const speed = 50 + this.comboMultiplier * 10;

            this.tweens.add({
                targets: particle,
                x: this.player.x + Math.cos(angle) * speed,
                y: this.player.y + Math.sin(angle) * speed,
                alpha: 0,
                duration: 800,
                onComplete: () => particle.destroy()
            });
        }
    }

    updateComboSystem(delta) {
        if (this.comboTimer > 0) {
            this.comboTimer -= delta;
            if (this.comboTimer <= 0) {
                // Reset combo
                this.comboCount = 0;
                this.comboMultiplier = 1;
                this.lastComboAction = '';
                console.log('💔 Combo broken - time expired');
            }
        }
    }

    // 🚀 NITRO BOOST SYSTEM FUNCTIONS 🚀
    addNitroMeter(amount) {
        this.nitroMeter = Math.min(this.maxNitroMeter, this.nitroMeter + amount);
    }

    activateNitro() {
        if (this.nitroMeter >= 20 && !this.nitroActive) { // Minimum 20% to use
            this.nitroActive = true;
            console.log('🚀 NITRO ACTIVATED!');

            // Visual effects
            this.createNitroEffect();
            this.player.setTint(0xFF4500); // Orange glow
        }
    }

    deactivateNitro() {
        if (this.nitroActive) {
            this.nitroActive = false;
            this.player.clearTint();
            console.log('🚀 Nitro deactivated');
        }
    }

    updateNitroSystem(delta) {
        if (this.nitroActive) {
            // Consume nitro
            this.nitroMeter -= this.nitroConsumptionRate * (delta / 16.67); // 60 FPS normalized
            if (this.nitroMeter <= 0) {
                this.nitroMeter = 0;
                this.deactivateNitro();
            }
        } else {
            // Recharge nitro slowly
            this.nitroMeter = Math.min(this.maxNitroMeter,
                this.nitroMeter + this.nitroRechargeRate * (delta / 16.67));
        }
    }

    createNitroEffect() {
        // Create flame trail effect
        for (let i = 0; i < 5; i++) {
            const flame = this.add.circle(
                this.player.x - 40 - i * 10,
                this.player.y + Math.random() * 20 - 10,
                4, 0xFF4500
            );

            this.tweens.add({
                targets: flame,
                scaleX: 0,
                scaleY: 0,
                alpha: 0,
                duration: 300,
                onComplete: () => flame.destroy()
            });
        }
    }

    // ✨ PARTICLE TRAIL SYSTEM ✨
    createTrailParticle() {
        const speed = Math.abs(this.player.body.velocity.x);
        const isMoving = speed > 50;

        if (!isMoving) return;

        // Different trail colors based on speed and boost
        let color = 0x666666; // Default gray smoke
        let intensity = Math.min(speed / 200, 1); // Scale by speed

        if (this.nitroActive) {
            color = 0xFF4500; // Orange flames when boosting
            intensity = 1;
        } else if (speed > 180) {
            color = 0x8B4513; // Brown dust at high speed
        } else if (speed > 120) {
            color = 0x888888; // Gray smoke at medium speed
        }

        // Create trail particle behind the bike
        const particle = this.add.circle(
            this.player.x - 30 + Math.random() * 20 - 10,
            this.player.y + 10 + Math.random() * 10 - 5,
            2 + Math.random() * 3,
            color
        );

        particle.alpha = 0.6 * intensity;

        // Add to trail particles array for management
        this.trailParticles.push({
            sprite: particle,
            life: 1000, // 1 second lifespan
            created: this.time.now
        });

        // Animate the particle
        this.tweens.add({
            targets: particle,
            scaleX: 0.1,
            scaleY: 0.1,
            alpha: 0,
            y: particle.y - 20,
            x: particle.x - 50, // Drift backwards
            duration: 800 + Math.random() * 400,
            ease: 'Quad.easeOut',
            onComplete: () => {
                particle.destroy();
            }
        });
    }

    updateTrailSystem(delta) {
        // Create new trail particles based on timer and speed
        this.trailTimer += delta;

        const speed = Math.abs(this.player.body.velocity.x);
        let trailFrequency = this.trailInterval;

        // Adjust frequency based on speed
        if (speed > 150) {
            trailFrequency = 30; // More frequent at high speed
        } else if (speed > 100) {
            trailFrequency = 40;
        }

        if (this.nitroActive) {
            trailFrequency = 20; // Very frequent when boosting
        }

        if (this.trailTimer >= trailFrequency) {
            this.createTrailParticle();
            this.trailTimer = 0;
        }

        // Clean up old particles
        this.trailParticles = this.trailParticles.filter(p => {
            if (this.time.now - p.created > p.life || !p.sprite.active) {
                if (p.sprite.active) p.sprite.destroy();
                return false;
            }
            return true;
        });
    }

    // 🌦️ DYNAMIC WEATHER SYSTEM 🌦️
    changeWeather() {
        const weatherTypes = ['clear', 'rain', 'storm', 'wind'];
        let newWeather;

        // Don't pick the same weather twice in a row
        do {
            newWeather = Phaser.Utils.Array.GetRandom(weatherTypes);
        } while (newWeather === this.weatherType);

        this.weatherType = newWeather;
        console.log(`🌦️ Weather changed to: ${this.weatherType}`);

        // Clear existing weather particles
        this.weatherParticles.forEach(p => {
            if (p.sprite && p.sprite.active) p.sprite.destroy();
        });
        this.weatherParticles = [];

        // Set wind effects
        if (this.weatherType === 'wind') {
            this.windDirection = Math.random() > 0.5 ? 1 : -1;
            this.windStrength = 0.3 + Math.random() * 0.4; // 0.3 to 0.7
        } else {
            this.windStrength = 0;
        }
    }

    createWeatherParticle() {
        if (this.weatherType === 'clear') return;

        let particle, color, size, behavior;

        switch (this.weatherType) {
            case 'rain':
                // Blue raindrops
                color = 0x4169E1;
                size = 1 + Math.random() * 2;
                particle = this.add.circle(
                    this.cameras.main.scrollX + Math.random() * SCREEN_WIDTH,
                    this.cameras.main.scrollY - 20,
                    size, color
                );

                behavior = {
                    velocityY: 300 + Math.random() * 200,
                    velocityX: -20 + Math.random() * 40,
                    life: 3000
                };
                break;

            case 'storm':
                // Lightning-colored rain with wind
                color = Math.random() > 0.9 ? 0xFFFFFF : 0x4169E1; // Occasional white flashes
                size = 1.5 + Math.random() * 2.5;
                particle = this.add.circle(
                    this.cameras.main.scrollX + Math.random() * SCREEN_WIDTH,
                    this.cameras.main.scrollY - 20,
                    size, color
                );

                behavior = {
                    velocityY: 400 + Math.random() * 300,
                    velocityX: -60 + Math.random() * 120,
                    life: 2500
                };
                break;

            case 'wind':
                // Dust and debris
                color = 0x8B7355; // Brown dust
                size = 2 + Math.random() * 4;
                particle = this.add.circle(
                    this.cameras.main.scrollX + (this.windDirection > 0 ? -50 : SCREEN_WIDTH + 50),
                    this.cameras.main.scrollY + Math.random() * SCREEN_HEIGHT,
                    size, color
                );

                behavior = {
                    velocityY: -10 + Math.random() * 20,
                    velocityX: this.windDirection * (100 + Math.random() * 200) * this.windStrength,
                    life: 4000
                };
                break;
        }

        if (particle) {
            particle.alpha = 0.6 + Math.random() * 0.4;

            this.weatherParticles.push({
                sprite: particle,
                velocityX: behavior.velocityX,
                velocityY: behavior.velocityY,
                life: behavior.life,
                created: this.time.now
            });
        }
    }

    updateWeatherSystem(delta) {
        // Change weather periodically
        this.weatherTimer += delta;
        if (this.weatherTimer >= this.weatherChangeInterval) {
            this.changeWeather();
            this.weatherTimer = 0;
        }

        // Create weather particles
        if (this.weatherType !== 'clear') {
            let spawnRate = 100; // Default spawn rate

            switch (this.weatherType) {
                case 'rain':
                    spawnRate = 50;
                    break;
                case 'storm':
                    spawnRate = 30; // More frequent
                    break;
                case 'wind':
                    spawnRate = 80;
                    break;
            }

            if (this.time.now % spawnRate < delta) {
                this.createWeatherParticle();
            }
        }

        // Update existing weather particles
        this.weatherParticles = this.weatherParticles.filter(p => {
            if (!p.sprite || !p.sprite.active) return false;

            // Update position
            p.sprite.x += (p.velocityX * delta / 1000);
            p.sprite.y += (p.velocityY * delta / 1000);

            // Check if particle is expired or off-screen
            const age = this.time.now - p.created;
            const offScreen = p.sprite.y > this.cameras.main.scrollY + SCREEN_HEIGHT + 50 ||
                            p.sprite.x < this.cameras.main.scrollX - 100 ||
                            p.sprite.x > this.cameras.main.scrollX + SCREEN_WIDTH + 100;

            if (age > p.life || offScreen) {
                p.sprite.destroy();
                return false;
            }

            return true;
        });

        // Apply wind effects to player
        if (this.weatherType === 'wind' && this.windStrength > 0) {
            const windForce = this.windDirection * this.windStrength * 10;
            this.player.x += windForce * (delta / 1000);
        }

        // Storm effects - occasional screen flash
        if (this.weatherType === 'storm' && Math.random() < 0.001) {
            this.cameras.main.flash(100, 255, 255, 255, true);
        }
    }

    getNitroSpeedMultiplier() {
        return this.nitroActive ? 1.8 : 1.0; // 80% speed boost when active
    }

    flashScreen(color) {
        const flash = this.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, SCREEN_WIDTH, SCREEN_HEIGHT, color);
        flash.setAlpha(0.3);
        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 200,
            onComplete: () => flash.destroy()
        });
    }
    
    removeOffScreenObjects() {
        // Remove objects that are far behind the player in world coordinates
        const removalDistance = 1000; // Distance behind player before removing objects
        const removalThreshold = this.player.x - removalDistance;
        
        [this.obstacles, this.enemies, this.powerups, this.projectiles].forEach(group => {
            group.children.entries.forEach(obj => {
                if (obj.x < removalThreshold) {
                    // Debug outlines removed - no cleanup needed
                    obj.destroy();
                }
            });
        });
    }
    
    updateProjectiles(delta) {
        // Update weapon cooldown
        if (this.weaponCooldown > 0) {
            this.weaponCooldown -= delta;
        }
    }
    
    updatePowerups(delta) {
        // Update power-up timers and effects
        if (this.speedBoostActive) {
            // Add speed trail effect
            if (Math.random() < 0.3) {
                this.createSpeedLines();
            }
        }
    }
    
    updateUI() {
        // Update attack indicator position
        this.attackIndicator.setPosition(this.player.x + 20, this.player.y - 30);
        
        // Update debug rectangle position
        if (this.playerDebug) {
            this.playerDebug.setPosition(this.player.x, this.player.y);
        }
        
        // Update weapon cooldown bar (disabled)
        // const cooldownPercent = Math.max(0, this.weaponCooldown / this.weaponStats.cooldown);
        // this.weaponCooldownBar.setSize(100 * (1 - cooldownPercent), 8);
        
        // Update speed boost indicator
        if (this.speedBoostActive) {
            this.speedBoostIndicator.setText('SPEED BOOST!');
        } else if (this.jumpBoostActive) {
            this.speedBoostIndicator.setText('JUMP BOOST!');
        } else if (this.invincibilityActive) {
            this.speedBoostIndicator.setText('INVINCIBLE!');
        } else {
            this.speedBoostIndicator.setText('');
        }

        // 🔥 UPDATE COMBO UI 🔥
        if (this.comboCount > 1) {
            this.comboIndicator.setText(`🔥 COMBO x${this.comboCount} (${this.comboMultiplier}x)`);
        } else {
            this.comboIndicator.setText('');
        }

        // 🚀 UPDATE NITRO UI 🚀
        const nitroPercent = this.nitroMeter / this.maxNitroMeter;
        this.nitroBar.setSize(200 * nitroPercent, 20);
        this.nitroText.setText(`NITRO: ${Math.round(nitroPercent * 100)}%${this.nitroActive ? ' (ACTIVE!)' : ''}`);

        if (this.nitroActive) {
            this.nitroText.setFill('#FF4500');
        } else {
            this.nitroText.setFill('#FFFFFF');
        }

        // 🌦️ UPDATE WEATHER UI 🌦️
        const weatherEmojis = {
            'clear': '🌤️',
            'rain': '🌧️',
            'storm': '⛈️',
            'wind': '💨'
        };
        const weatherColors = {
            'clear': '#FFFFFF',
            'rain': '#4169E1',
            'storm': '#FFD700',
            'wind': '#8B7355'
        };

        this.weatherText.setText(`${weatherEmojis[this.weatherType]} ${this.weatherType.charAt(0).toUpperCase() + this.weatherType.slice(1)}`);
        this.weatherText.setFill(weatherColors[this.weatherType]);
        
        // Update distance and progress to finish line
        const distanceToFinish = Math.max(0, this.currentLevelConfig.length - this.player.x);
        const progressPercent = Math.min(1, this.player.x / this.currentLevelConfig.length);
        
        // Add distance-based scoring (10 points per 100m traveled)
        try {
            if (!this.lastScoredDistance) this.lastScoredDistance = 0;
            const currentDistance = Math.floor(this.player.x / 100) * 100;
            if (currentDistance > this.lastScoredDistance) {
                const distancePoints = 10; // 10 points per 100m
                const previousScore = this.gameState.score;
                this.gameState.score += distancePoints;
                this.lastScoredDistance = currentDistance;
                console.log(`🎯 SCORE! Distance: +${distancePoints} points for ${currentDistance}m (${previousScore} → ${this.gameState.score})`);
                // Show distance score (occasionally) - using existing showMoneyEarned function
                if (currentDistance % 500 === 0 && currentDistance > 0) {
                    try {
                        this.showMoneyEarned(this.player.x, this.player.y - 50, distancePoints, '#00FF00');
                    } catch (error) {
                        console.warn('Could not show distance score:', error);
                    }
                }
            }
        } catch (error) {
            console.warn('Error in distance scoring:', error);
        }
        
        // Update distance text
        if (distanceToFinish > 0) {
            this.distanceText.setText(`Distance to Finish: ${Math.round(distanceToFinish)}m`);
        } else {
            this.distanceText.setText('FINISH LINE REACHED!');
        }
        
        // Update progress bar
        const progressWidth = 300 * progressPercent;
        this.progressBar.setSize(progressWidth, 11);
        
        // Update progress bar color based on proximity to finish
        if (progressPercent > 0.8) {
            this.progressBar.setFillStyle(0xFFD700); // Gold when near finish
        } else if (progressPercent > 0.5) {
            this.progressBar.setFillStyle(0xFFA500); // Orange when halfway
        } else {
            this.progressBar.setFillStyle(0x00FF00); // Green at start
        }
        
        // Update racing position
        this.updateRacingPosition();
    }
    
    updateRacingPosition() {
        // Get all racers (player + enemies) and sort by X position
        const allRacers = [
            { x: this.player.x, isPlayer: true }
        ];
        
        // Add all enemies to racer list
        this.enemies.children.entries.forEach(enemy => {
            if (enemy.body) {
                allRacers.push({ x: enemy.x, isPlayer: false });
            }
        });
        
        // Sort by X position (descending - furthest ahead first)
        allRacers.sort((a, b) => b.x - a.x);
        
        // Find player's position
        const playerPosition = allRacers.findIndex(racer => racer.isPlayer) + 1;
        const totalRacers = allRacers.length;
        
        // Only update position if not locked (player hasn't finished yet)
        if (!this.positionLocked) {
            this.currentPosition = playerPosition;
            this.totalRacers = totalRacers;
            
            // Update position text with color coding
            let positionColor = '#FFD700'; // Gold for 1st
            if (playerPosition === 2) positionColor = '#C0C0C0'; // Silver for 2nd
            else if (playerPosition === 3) positionColor = '#CD7F32'; // Bronze for 3rd
            else if (playerPosition > 3) positionColor = '#FFFFFF'; // White for others
            
            this.positionText.setText(`Position: ${playerPosition}/${totalRacers}`);
            this.positionText.setFill(positionColor);
        }
        
        // Update money display
        this.moneyText.setText(`Money: $${this.gameState.money}`);
    }
    
    updateGameState() {
        // Check for win condition - player reached finish line
        // Log progress occasionally (every 2 seconds)
        if (this.time.now % 2000 < 32) {
            const progress = Math.round((this.player.x/this.currentLevelConfig.length)*100);
            console.log(`🏁 Progress: ${Math.round(this.player.x)}m / ${this.currentLevelConfig.length}m (${progress}%)`);
            
            // Extra logging when near the end
            if (progress > 90) {
                console.log(`🏁 NEAR FINISH: Player Y: ${Math.round(this.player.y)}, Ground level: ${this.groundLevel}, Distance to finish: ${Math.round(this.currentLevelConfig.length - this.player.x)}m`);
            }
        }
        
        if (this.player.x >= this.currentLevelConfig.length) {
            console.log(`🏁 DEBUG: LEVEL COMPLETION TRIGGERED!`);
            console.log(`🏁 DEBUG: Player final position: ${Math.round(this.player.x)}m`);
            console.log(`🏁 DEBUG: Required distance: ${this.currentLevelConfig.length}m`);
            console.log(`🏁 DEBUG: Current session money before completion: $${this.gameState.money}`);
            console.log(`🏁 DEBUG: Current total money before completion: $${this.gameState.totalMoney}`);
            this.levelComplete();
            return; // Don't check for game over if level is complete
        }
        
        // Check for game over conditions
        if (this.gameState.score < -1000 || this.player.y > SCREEN_HEIGHT) {
            this.gameOver();
        }
        
        // Emit event for UI updates
        this.game.events.emit('gameStateUpdate');
    }
    
    levelComplete() {
        console.log('🏁 LEVEL COMPLETE! Player reached finish line!');
        console.log('🏁 DEBUG: Player X position:', this.player.x);
        console.log('🏁 DEBUG: Level length required:', this.currentLevelConfig.length);
        
        // Lock the current position - no more updates after player finishes
        if (!this.positionLocked) {
            this.finalPosition = this.currentPosition;
            this.positionLocked = true;
            
            // Store final position in game state for display in GameOver screen
            this.gameState.finalRacePosition = this.finalPosition;
            
            console.log(`🏁 Final position locked: ${this.finalPosition}`);
        }
        
        // Add victory bonus to score and money based on level
        const victoryBonus = GAME_CONFIG.VICTORY_SCORE_BONUS;
        const levelMoneyBonus = this.currentLevelConfig.moneyBonus || 0;
        
        console.log(`💰 DEBUG: BEFORE - Session money: ${this.gameState.money}, Total money: ${this.gameState.totalMoney}`);
        console.log(`💰 DEBUG: Level money bonus: ${levelMoneyBonus}`);
        
        const previousScore = this.gameState.score;
        this.gameState.score = this.clampValue(this.safeAdd(this.gameState.score, victoryBonus), 0, 5000);
        this.gameState.money = this.clampValue(this.safeAdd(this.gameState.money, levelMoneyBonus), 0, 500);
        
        console.log(`🎯 FINAL SCORE! Level completion: +${victoryBonus} victory bonus (${previousScore} → ${this.gameState.score})`);
        console.log(`💰 DEBUG: AFTER BONUS - Session money: ${this.gameState.money}, Total money: ${this.gameState.totalMoney}`);
        
        console.log(`🏁 Level completion bonuses: ${victoryBonus} score, ${levelMoneyBonus} money`);
        
        // Unlock next level if completed current level
        const nextLevel = this.gameState.currentLevel + 1;
        if (nextLevel <= Object.keys(LEVEL_CONFIG).length && this.gameState.unlockedLevels < nextLevel) {
            this.gameState.unlockedLevels = nextLevel;
            console.log(`🔓 Unlocked Level ${nextLevel}!`);
        }
        console.log(`Current session money: ${this.gameState.money}`);
        console.log(`Total money before: ${this.gameState.totalMoney}`);
        
        // Update high score and total money safely
        if (this.gameState.score > this.gameState.highScore) {
            this.gameState.highScore = this.gameState.score;
        }
        
        // Prevent money duplication by checking if already transferred
        if (!this.moneyTransferred) {
            const currentMoney = this.gameState.money || 0;
            const previousTotal = this.gameState.totalMoney || 0;
            console.log(`💰 DEBUG: Transferring session money ${currentMoney} to previous total ${previousTotal}`);
            
            this.gameState.totalMoney = Math.min(previousTotal + currentMoney, GAME_CONFIG.MAX_MONEY);
            this.gameState.money = 0; // Reset session money to prevent duplication
            this.moneyTransferred = true; // Flag to prevent multiple transfers
            
            console.log(`💰 DEBUG: NEW TOTAL MONEY: ${this.gameState.totalMoney}, Session reset to: ${this.gameState.money}`);
            
            // Update registry immediately
            this.registry.set('gameState', this.gameState);
            console.log(`💰 DEBUG: Updated game state in registry`);
        } else {
            console.log(`💰 DEBUG: Money already transferred, skipping to prevent duplication`);
        }
        
        // Show victory message
        this.showVictoryMessage();
        
        // Save progress directly to localStorage
        console.log('💾 Saving progress after level completion...');
        localStorage.setItem('doomRidersHighScore', this.gameState.highScore.toString());
        localStorage.setItem('doomRidersMoney', this.gameState.totalMoney.toString());
        localStorage.setItem('doomRidersCurrentBike', this.gameState.currentBike);
        localStorage.setItem('doomRidersOwnedBikes', JSON.stringify(this.gameState.ownedBikes));
        localStorage.setItem('doomRidersCurrentWeapon', this.gameState.currentWeapon);
        localStorage.setItem('doomRidersOwnedWeapons', JSON.stringify(this.gameState.ownedWeapons));
        localStorage.setItem('doomRidersCurrentLevel', this.gameState.currentLevel.toString());
        localStorage.setItem('doomRidersUnlockedLevels', this.gameState.unlockedLevels.toString());
        console.log('💾 Progress saved successfully!');
        
        // Verify localStorage write was successful
        const savedMoney = localStorage.getItem('doomRidersMoney');
        console.log(`💾 Verification: localStorage now contains ${savedMoney} money`);
        
        // Also try the global save function as backup
        if (window.doomRidersSaveProgress) {
            console.log('💾 Calling global saveProgress as backup...');
            window.doomRidersSaveProgress();
        }
        
        // Transition to victory screen after short delay
        this.time.delayedCall(3000, () => {
            this.scene.start(SCENES.GAME_OVER);
        });
    }
    
    showVictoryMessage() {
        // Play victory sound only once
        if (this.victorySound && !this.victorySoundPlayed) {
            try {
                this.victorySound.play();
                this.victorySoundPlayed = true; // Flag to prevent multiple plays
                console.log('🎉 Victory sound played!');
            } catch (error) {
                console.warn('Could not play victory sound:', error);
            }
        }
        
        // Create victory overlay
        const overlay = this.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, SCREEN_WIDTH, SCREEN_HEIGHT, 0x000000, 0.7);
        overlay.setScrollFactor(0); // Fixed to camera
        overlay.setDepth(1000);
        
        // Victory text with level info
        const levelText = `LEVEL ${this.gameState.currentLevel} COMPLETE!`;
        const victoryText = this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 - 120, levelText, {
            fontSize: '48px',
            fill: '#FFD700',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });
        
        // Level name
        const levelNameText = this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 - 80, this.currentLevelConfig.name, {
            fontSize: '24px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        });
        levelNameText.setOrigin(0.5);
        levelNameText.setScrollFactor(0);
        levelNameText.setDepth(1001);
        victoryText.setOrigin(0.5);
        victoryText.setScrollFactor(0);
        victoryText.setDepth(1001);
        
        // Add solid background for position text
        const positionBg = this.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 - 30, 700, 80, 0x000000, 0.8);
        positionBg.setOrigin(0.5);
        positionBg.setScrollFactor(0);
        positionBg.setDepth(1000);
        
        // Position and score display - use finalPosition if locked, otherwise currentPosition
        const displayPosition = this.finalPosition || this.currentPosition;
        const positionText = this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 - 30, 
            `You finished in ${this.getPositionSuffix(displayPosition)} place!`, {
            fontSize: '32px', // Slightly smaller for better fit
            fill: '#FFD700', // Gold color for better visibility
            fontFamily: 'Arial',
            fontWeight: 'bold',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 6 // Thicker stroke for better readability
        });
        positionText.setOrigin(0.5);
        positionText.setScrollFactor(0);
        positionText.setDepth(1001);
        
        // Add background for score text
        const scoreBg = this.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + 30, 500, 70, 0x000000, 0.8);
        scoreBg.setOrigin(0.5);
        scoreBg.setScrollFactor(0);
        scoreBg.setDepth(1000);
        
        // Score display
        const scoreText = this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + 30, 
            `Final Score: ${this.gameState.score}\nBonus: +${GAME_CONFIG.VICTORY_SCORE_BONUS}`, {
            fontSize: '24px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2
        });
        scoreText.setOrigin(0.5);
        scoreText.setScrollFactor(0);
        scoreText.setDepth(1001);
        
        // Add Next Level button if more levels available
        const nextLevel = this.gameState.currentLevel + 1;
        if (nextLevel <= Object.keys(LEVEL_CONFIG).length) {
            const nextLevelButton = this.add.rectangle(SCREEN_WIDTH/2 - 100, SCREEN_HEIGHT/2 + 120, 180, 50, 0x004400)
                .setInteractive()
                .setScrollFactor(0)
                .setDepth(1001)
                .on('pointerdown', () => {
                    console.log(`🚀 Starting Level ${nextLevel}`);
                    this.gameState.currentLevel = nextLevel;
                    this.scene.restart();
                })
                .on('pointerover', () => nextLevelButton.setFillStyle(0x006600))
                .on('pointerout', () => nextLevelButton.setFillStyle(0x004400));
            
            const nextLevelText = this.add.text(SCREEN_WIDTH/2 - 100, SCREEN_HEIGHT/2 + 120, `NEXT LEVEL`, {
                fontSize: '18px',
                fill: '#FFFFFF',
                fontFamily: 'Arial',
                fontWeight: 'bold'
            });
            nextLevelText.setOrigin(0.5);
            nextLevelText.setScrollFactor(0);
            nextLevelText.setDepth(1002);
        }
        
        // Main Menu button
        const mainMenuButton = this.add.rectangle(SCREEN_WIDTH/2 + 100, SCREEN_HEIGHT/2 + 120, 180, 50, 0x444444)
            .setInteractive()
            .setScrollFactor(0)
            .setDepth(1001)
            .on('pointerdown', () => {
                this.scene.start(SCENES.MAIN_MENU);
            })
            .on('pointerover', () => mainMenuButton.setFillStyle(0x666666))
            .on('pointerout', () => mainMenuButton.setFillStyle(0x444444));
        
        const mainMenuText = this.add.text(SCREEN_WIDTH/2 + 100, SCREEN_HEIGHT/2 + 120, 'MAIN MENU', {
            fontSize: '18px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        });
        mainMenuText.setOrigin(0.5);
        mainMenuText.setScrollFactor(0);
        mainMenuText.setDepth(1002);
        
        // Animate victory text
        this.tweens.add({
            targets: victoryText,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    getPositionSuffix(position) {
        if (position === 1) return '1st';
        if (position === 2) return '2nd';
        if (position === 3) return '3rd';
        return `${position}th`;
    }
    
    getPositionColor(position) {
        if (position === 1) return '#FFD700'; // Gold
        if (position === 2) return '#C0C0C0'; // Silver
        if (position === 3) return '#CD7F32'; // Bronze
        return '#FFFFFF'; // White for others
    }
    
    gameOver() {
        console.log('💀 GAME OVER!');
        console.log(`Current session money: ${this.gameState.money}`);
        console.log(`Total money before: ${this.gameState.totalMoney}`);
        
        // Store final race position for game over screen
        this.gameState.finalRacePosition = this.finalPosition || this.currentPosition;
        console.log(`💀 Final race position for game over: ${this.gameState.finalRacePosition}`);
        
        // Update high score and total money safely
        if (this.gameState.score > this.gameState.highScore) {
            this.gameState.highScore = this.gameState.score;
        }
        
        // Prevent money duplication in game over too
        if (!this.moneyTransferred) {
            const currentMoney = this.gameState.money || 0;
            const previousTotal = this.gameState.totalMoney || 0;
            this.gameState.totalMoney = Math.min(previousTotal + currentMoney, GAME_CONFIG.MAX_MONEY);
            this.gameState.money = 0; // Reset session money
            this.moneyTransferred = true;
            console.log(`💰 Game Over: Money transferred. New total: ${this.gameState.totalMoney}`);
        }
        
        console.log(`Total money after: ${this.gameState.totalMoney}`);
        
        // Save progress directly to localStorage
        console.log('💾 Saving progress after game over...');
        localStorage.setItem('doomRidersHighScore', this.gameState.highScore.toString());
        localStorage.setItem('doomRidersMoney', this.gameState.totalMoney.toString());
        localStorage.setItem('doomRidersCurrentBike', this.gameState.currentBike);
        localStorage.setItem('doomRidersOwnedBikes', JSON.stringify(this.gameState.ownedBikes));
        localStorage.setItem('doomRidersCurrentWeapon', this.gameState.currentWeapon);
        localStorage.setItem('doomRidersOwnedWeapons', JSON.stringify(this.gameState.ownedWeapons));
        console.log('💾 Progress saved successfully!');
        
        // Verify localStorage write was successful
        const savedMoney = localStorage.getItem('doomRidersMoney');
        console.log(`💾 Verification: localStorage now contains ${savedMoney} money`);
        
        // Also try the global save function as backup
        if (window.doomRidersSaveProgress) {
            console.log('💾 Calling global saveProgress as backup...');
            window.doomRidersSaveProgress();
        }
        
        this.scene.start(SCENES.GAME_OVER);
    }
}