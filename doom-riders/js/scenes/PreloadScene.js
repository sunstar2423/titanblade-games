import { SCREEN_WIDTH, SCREEN_HEIGHT, SCENES } from '../GameData.js';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.PRELOAD });
    }

    preload() {
        console.log('PreloadScene.preload() started');
        
        // Create loading bar
        this.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, SCREEN_WIDTH, SCREEN_HEIGHT, 0x87CEEB);
        
        this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 - 50, 'Loading Doom Riders...', {
            fontSize: '32px',
            fill: '#000000',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        const progressBar = this.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 400, 20, 0x000000);
        const progressFill = this.add.rectangle(SCREEN_WIDTH/2 - 200, SCREEN_HEIGHT/2, 0, 20, 0xFF4500);
        progressFill.setOrigin(0, 0.5);

        // Update progress bar
        this.load.on('progress', (progress) => {
            const fillWidth = 400 * progress;
            progressFill.width = fillWidth;
            progressFill.x = SCREEN_WIDTH/2 - 200;
        });
        
        // Add detailed tracking for asset loading
        this.load.on('loaderror', (file) => {
            console.error(`❌ Failed to load asset: ${file.key} from ${file.url}`);
        });
        
        this.load.on('filecomplete', (key, type, data) => {
            console.log(`✅ Successfully loaded: ${key} (${type})`);
        });
        
        this.load.on('complete', () => {
            console.log('=== Asset loading phase completed ===');
        });
        
        // Load real images FIRST - don't create fallbacks until we know what failed
        try {
            console.log('Loading real game assets...');
            this.loadGameAssets();
        } catch (error) {
            console.error('Error loading game assets:', error);
        }
        
        // Create fallback assets ONLY after attempting to load real ones
        this.load.on('complete', () => {
            console.log('=== Asset loading complete, checking results... ===');
            
            // Debug: List all loaded textures
            const loadedTextures = Object.keys(this.textures.list);
            console.log('All textures in memory:', loadedTextures);
            
            // Debug: Check each expected asset
            this.expectedAssets.forEach(asset => {
                const exists = this.textures.exists(asset.key);
                console.log(`Asset check: ${asset.key} = ${exists ? '✅ LOADED' : '❌ MISSING'}`);
            });
            
            this.createMissingFallbacks();
            this.createPowerupAssets();
        });
        
        // Load audio files from assets/sounds
        console.log('Loading audio files from assets/sounds...');
        
        const audioAssets = [
            { key: 'jumpSound', path: 'assets/sounds/jump.wav' },
            // { key: 'engineSound', path: 'assets/sounds/engine.wav' }, // REMOVED - was causing clicking sound bug
            { key: 'crashSound', path: 'assets/sounds/crash.wav' },
            { key: 'attackSound', path: 'assets/sounds/attack.wav' },
            { key: 'victorySound', path: 'assets/sounds/victory.wav' },
            // { key: 'clickSound', path: 'assets/sounds/click.wav' }, // TEMPORARILY DISABLED to test clicking bug
            // New background music tracks from Free Music Archive
            { key: 'grevilleaMusic', path: 'assets/sounds/Danny Bale - Grevillea Music.mp3' },
            { key: 'fernMusic', path: 'assets/sounds/Danny Bale - Fern Music.mp3' },
            { key: 'philodendronMusic', path: 'assets/sounds/Danny Bale - Philodendron Music.mp3' },
            { key: 'grabABargain', path: 'assets/sounds/Scott Holmes Music - Grab A Bargain.mp3' }
        ];
        
        audioAssets.forEach(asset => {
            console.log(`Loading audio: ${asset.key} from ${asset.path}`);
            this.load.audio(asset.key, asset.path);
        });
        
        console.log(`Total audio files to load: ${audioAssets.length}`);
    }
    
    loadGameAssets() {
        // Load real image assets with detailed logging
        const imageAssets = [
            { key: 'bmx', path: 'assets/images/bmx.png' },
            { key: 'enemyRider', path: 'assets/images/enemy-rider.png' },
            { key: 'rock', path: 'assets/images/rock.png' },
            { key: 'log', path: 'assets/images/log.png' },
            { key: 'barrier', path: 'assets/images/barrier.png' },
            { key: 'ramp', path: 'assets/images/ramp.png' },
            { key: 'ramp2', path: 'assets/images/ramp2.png' },
            { key: 'ground', path: 'assets/images/ground-texture.png' },
            { key: 'grass', path: 'assets/images/grass-texture.png' },
            { key: 'backgroundSky', path: 'assets/images/background-sky.png' },
            { key: 'desertBg', path: 'assets/images/desertbg.png' },
            { key: 'futureCityBg', path: 'assets/images/futurecitybg.png' },
            { key: 'hillsBg', path: 'assets/images/hillsbg.png' },
            { key: 'snowMountainBg', path: 'assets/images/snowmountianbg.png' },
            { key: 'volcanoBg', path: 'assets/images/volcanobg.png' },
            // UI background images
            { key: 'menuBackground', path: 'assets/images/menubackground1.png' },
            { key: 'bikeStoreBackground', path: 'assets/images/bikestore.png' },
            // Bike upgrade images
            { key: 'atv', path: 'assets/images/atv.png' },
            { key: 'mountainbike', path: 'assets/images/mountainbike.png' },
            { key: 'promountainbike', path: 'assets/images/promountainbike.png' },
            { key: 'dirtbike', path: 'assets/images/dirtbike.png' },
            { key: 'racingdirtbike', path: 'assets/images/racingdirtbike.png' }
        ];

        console.log('Attempting to load', imageAssets.length, 'real images...');
        imageAssets.forEach(asset => {
            console.log(`Loading: ${asset.key} from ${asset.path}`);
            this.load.image(asset.key, asset.path);
        });
        
        // Store asset list for fallback check
        this.expectedAssets = imageAssets;
    }
    
    createMissingFallbacks() {
        console.log('=== Checking for missing assets and creating fallbacks ===');
        
        let assetsLoaded = 0;
        let fallbacksCreated = 0;
        
        // Check which assets failed to load and create fallbacks
        this.expectedAssets.forEach(asset => {
            if (!this.textures.exists(asset.key)) {
                console.warn(`❌ Asset ${asset.key} failed to load from ${asset.path}, creating fallback`);
                this.createFallbackTexture(asset.key);
                fallbacksCreated++;
            } else {
                console.log(`✅ Asset ${asset.key} loaded successfully from ${asset.path}`);
                assetsLoaded++;
            }
        });
        
        // Always create 'bike' fallback if it doesn't exist (needed by GameScene)
        if (!this.textures.exists('bike')) {
            console.log('Creating essential bike fallback texture');
            this.createFallbackTexture('bike');
            fallbacksCreated++;
        }
        
        console.log(`=== Asset Summary: ${assetsLoaded} loaded, ${fallbacksCreated} fallbacks created ===`);
    }
    
    createFallbackTexture(key) {
        const graphics = this.add.graphics();
        
        switch(key) {
            case 'bmx':
            case 'bike':
                graphics.fillStyle(0xFF6600);
                graphics.fillRect(0, 0, 50, 25);
                graphics.generateTexture(key, 50, 25);
                break;
            case 'atv':
                graphics.fillStyle(0x4B0082);
                graphics.fillRect(0, 0, 55, 30);
                graphics.generateTexture(key, 55, 30);
                break;
            case 'mountainbike':
                graphics.fillStyle(0x006400);
                graphics.fillRect(0, 0, 52, 26);
                graphics.generateTexture(key, 52, 26);
                break;
            case 'promountainbike':
                graphics.fillStyle(0x0000FF);
                graphics.fillRect(0, 0, 54, 28);
                graphics.generateTexture(key, 54, 28);
                break;
            case 'dirtbike':
                graphics.fillStyle(0xFF1493);
                graphics.fillRect(0, 0, 58, 32);
                graphics.generateTexture(key, 58, 32);
                break;
            case 'racingdirtbike':
                graphics.fillStyle(0xFF0000);
                graphics.fillRect(0, 0, 60, 34);
                graphics.generateTexture(key, 60, 34);
                break;
            case 'enemyRider':
                graphics.fillStyle(0xFF0000);
                graphics.fillRect(0, 0, 35, 18);
                graphics.generateTexture(key, 35, 18);
                break;
            case 'rock':
                graphics.fillStyle(0x8B4513);
                graphics.fillRect(0, 0, 30, 30);
                graphics.generateTexture(key, 30, 30);
                break;
            case 'log':
                graphics.fillStyle(0xD2691E);
                graphics.fillRect(0, 0, 60, 20);
                graphics.generateTexture(key, 60, 20);
                break;
            case 'barrier':
                graphics.fillStyle(0xFF6347);
                graphics.fillRect(0, 0, 20, 40);
                graphics.generateTexture(key, 20, 40);
                break;
            case 'ramp':
                graphics.fillStyle(0x696969);
                graphics.fillTriangle(0, 40, 60, 40, 60, 0);
                graphics.generateTexture(key, 60, 40);
                break;
            case 'ramp2':
                graphics.fillStyle(0x708090);
                graphics.fillTriangle(0, 40, 80, 40, 80, 0);
                graphics.generateTexture(key, 80, 40);
                break;
            case 'ground':
                graphics.fillStyle(0x8B4513);
                graphics.fillRect(0, 0, 64, 64);
                graphics.generateTexture(key, 64, 64);
                break;
            case 'grass':
                graphics.fillStyle(0x228B22);
                graphics.fillRect(0, 0, 64, 64);
                graphics.generateTexture(key, 64, 64);
                break;
            case 'backgroundSky':
                graphics.fillStyle(0x87CEEB);
                graphics.fillRect(0, 0, 800, 600);
                graphics.generateTexture(key, 800, 600);
                break;
            case 'desertBg':
                graphics.fillStyle(0xF4A460);
                graphics.fillRect(0, 0, 800, 600);
                graphics.generateTexture(key, 800, 600);
                break;
            case 'futureCityBg':
                graphics.fillStyle(0x483D8B);
                graphics.fillRect(0, 0, 800, 600);
                graphics.generateTexture(key, 800, 600);
                break;
            case 'hillsBg':
                graphics.fillStyle(0x228B22);
                graphics.fillRect(0, 0, 800, 600);
                graphics.generateTexture(key, 800, 600);
                break;
            case 'snowMountainBg':
                graphics.fillStyle(0xF0F8FF);
                graphics.fillRect(0, 0, 800, 600);
                graphics.generateTexture(key, 800, 600);
                break;
            case 'volcanoBg':
                graphics.fillStyle(0x8B0000);
                graphics.fillRect(0, 0, 800, 600);
                graphics.generateTexture(key, 800, 600);
                break;
            default:
                // Generic fallback
                graphics.fillStyle(0x666666);
                graphics.fillRect(0, 0, 32, 32);
                graphics.generateTexture(key, 32, 32);
        }
        
        graphics.destroy();
        console.log(`Created fallback texture for ${key}`);
    }
    
    
    createPowerupAssets() {
        // Create power-up textures (these don't have PNG files)
        const powerups = [
            { key: 'speedboost', color: 0x00FF00 },
            { key: 'jumpboost', color: 0x0080FF },
            { key: 'moneybag', color: 0xFFD700 },
            { key: 'invincibility', color: 0xFF00FF }
        ];
        
        powerups.forEach(powerup => {
            const graphics = this.add.graphics();
            graphics.fillStyle(powerup.color);
            graphics.fillCircle(10, 10, 10);
            graphics.generateTexture(powerup.key, 20, 20);
            graphics.destroy();
            console.log(`Created powerup texture: ${powerup.key}`);
        });

        // Health pack - red circle with white cross
        const healthGfx = this.add.graphics();
        healthGfx.fillStyle(0xFF4444);
        healthGfx.fillCircle(10, 10, 10);
        healthGfx.fillStyle(0xFFFFFF);
        healthGfx.fillRect(8, 4, 4, 12);
        healthGfx.fillRect(4, 8, 12, 4);
        healthGfx.generateTexture('healthpack', 20, 20);
        healthGfx.destroy();

        // Coin - gold circle with darker inner ring
        const coinGfx = this.add.graphics();
        coinGfx.fillStyle(0xFFD700);
        coinGfx.fillCircle(10, 10, 10);
        coinGfx.lineStyle(2, 0xB8860B);
        coinGfx.strokeCircle(10, 10, 7);
        coinGfx.generateTexture('coin', 20, 20);
        coinGfx.destroy();

        // Projectile - bright bullet shape
        const projGfx = this.add.graphics();
        projGfx.fillStyle(0xFFFFFF);
        projGfx.fillRoundedRect(0, 0, 12, 6, 3);
        projGfx.generateTexture('projectile', 12, 6);
        projGfx.destroy();
    }

    create() {
        // Show loading complete message briefly
        this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + 50, 'Loading Complete!', {
            fontSize: '24px',
            fill: '#000000',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // Wait a moment then go to main menu
        this.time.delayedCall(1000, () => {
            this.scene.start(SCENES.MAIN_MENU);
        });
    }
}