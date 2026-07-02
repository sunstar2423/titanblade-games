/*
 * Battle of the Druids - Web Edition
 * Assets.js
 * 
 * Copyright (c) 2025 TitanBlade Games
 * 
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 * 
 * https://github.com/sunstar2423/titanblade-games
 */

class AssetManager {
    constructor(scene = null) {
        this.scene = scene;
        this.loadedImages = new Map();
        this.loadedSounds = new Map();
        this.fallbackColors = {
            knight: 0x0000FF, // COLORS.BLUE
            wizard: 0x800080, // COLORS.PURPLE
            rogue: 0x00FF00,  // COLORS.GREEN
            soldier: 0xA0522D, // Brown
            default: 0x808080  // COLORS.GRAY
        };
    }
    
    // Preload all game assets
    static preloadAssets(scene) {
        // Character images
        const characters = ['knight', 'wizard', 'rogue', 'soldier'];
        characters.forEach(char => {
            scene.load.image(char, `${char}.png`);
        });
        
        // Enemy images
        const enemies = [
            'goblin', 'orc', 'skeleton', 'banshee', 'ghost', 'vampire',
            'lich', 'dragon_whelp', 'ancient_warrior', 'ancient_guardian',
            'assassin', 'city_guard', 'elite_dark_mage',
            'fire_elemental', 'divine_beast', 'celestial', 'temple_guardian',
            'spirit_monk', 'pirate', 'ghost_ship', 'sea_serpent', 'kraken_spawn',
            'minotaur', 'golem', 'magma_golem', 'lava_beast', 'war_machine',
            'mech_dragon', 'lost_soul', 'druid_lord'
        ];
        enemies.forEach(enemy => {
            scene.load.image(enemy, `${enemy}.png`);
        });

        // dark_mage.png is a tiny 72px placeholder - use the full-res elite art
        // instead (must not also be queued under its own name above, or Phaser
        // keeps the first file registered for the key)
        scene.load.image('dark_mage', 'elite_dark_mage.png');
        
        // Background images
        scene.load.image('world_map', 'world_map.png');
        scene.load.image('shop_background', 'shop_background.png');
        scene.load.image('menu', 'menu.png');
        scene.load.image('menubackground', 'menubackground.png');
        scene.load.image('druid', 'druid.png');
        
        // Location background images
        scene.load.image('arena', 'arena.png');
        scene.load.image('docks', 'docks.png');
        scene.load.image('mansion', 'mansion.png');
        scene.load.image('shrine', 'shrine.png');
        scene.load.image('volcaniccaves', 'volcaniccaves.png');
        scene.load.image('druidcastle', 'druidcastle.png');
        scene.load.image('botattack', 'botattack.png');
        scene.load.image('city', 'city.png');
        
        // Sound effects with fallback formats
        const sounds = ['heal', 'special', 'victory', 'defeat', 'click'];
        sounds.forEach(sound => {
            try {
                // Try to load WAV files with error handling
                scene.load.audio(sound, `${sound}.wav`);
                console.log(`📦 Loading audio: ${sound}.wav`);
            } catch (error) {
                console.error(`❌ Failed to queue audio: ${sound}`, error);
            }
        });
        
        // Load buy sound as MP3
        try {
            scene.load.audio('buy', 'buy.mp3');
            console.log(`📦 Loading audio: buy.mp3`);
        } catch (error) {
            console.error(`❌ Failed to queue audio: buy.mp3`, error);
        }
        
        // Load attack sound as MP3
        try {
            scene.load.audio('attack', 'attack.mp3');
            console.log(`📦 Loading audio: attack.mp3`);
        } catch (error) {
            console.error(`❌ Failed to queue audio: attack.mp3`, error);
        }
        
        // Background music with fallback
        try {
            scene.load.audio('world_music', 'piano.mp3'); // For world map and battles
            scene.load.audio('menu_music', 'voyage.mp3'); // For menus and character selection
            console.log(`📦 Loading audio: piano.mp3 and voyage.mp3`);
        } catch (error) {
            console.error(`❌ Failed to queue background music`, error);
        }
        
        // Special victory assets
        try {
            scene.load.image('victory', 'victory.png');
            scene.load.audio('victory-fanfare', 'victory.mp3'); // New finale victory music
            console.log(`📦 Loading special victory assets`);
        } catch (error) {
            console.error(`❌ Failed to queue victory assets`, error);
        }
    }
    
    // Get character image or fallback
    getCharacterImage(scene, charType, x, y, size = 120) {
        const imageName = charType.toLowerCase();
        
        if (scene.textures.exists(imageName)) {
            const image = scene.add.image(x, y, imageName);
            image.setDisplaySize(size, size);
            return image;
        } else {
            // Fallback to colored circle
            const color = this.fallbackColors[imageName] || this.fallbackColors.default;
            return scene.add.circle(x, y, size / 2, color)
                .setStrokeStyle(3, 0x000000);
        }
    }
    
    // Get enemy image or fallback
    getEnemyImage(scene, enemyName, x, y, size = 120) {
        const imageName = enemyName.toLowerCase().replace(/ /g, '_');
        
        if (scene.textures.exists(imageName)) {
            const image = scene.add.image(x, y, imageName);
            image.setDisplaySize(size, size);
            return image;
        } else {
            // Fallback to red circle
            return scene.add.circle(x, y, size / 2, 0xFF0000)
                .setStrokeStyle(3, 0x000000);
        }
    }
    
    // Get background image or fallback
    getBackgroundImage(scene, backgroundName) {
        const { width, height } = scene.scale;
        
        if (scene.textures.exists(backgroundName)) {
            const bg = scene.add.image(width / 2, height / 2, backgroundName);
            bg.setDisplaySize(width, height);
            return bg;
        } else {
            // Fallback to gradient background
            return this.createGradientBackground(scene, backgroundName);
        }
    }
    
    // Create gradient background fallback
    createGradientBackground(scene, type) {
        const { width, height } = scene.scale;
        const graphics = scene.add.graphics();
        
        let color1, color2;
        switch (type) {
            case 'world_map':
                color1 = 0x87CEEB; // Sky blue
                color2 = 0x228B22; // Forest green
                break;
            case 'shop_background':
                color1 = 0x8B4513; // Saddle brown
                color2 = 0x2F4F4F; // Dark slate gray
                break;
            default:
                color1 = 0x2c3e50; // Dark blue
                color2 = 0x34495e; // Darker blue
        }
        
        graphics.fillGradientStyle(color1, color1, color2, color2);
        graphics.fillRect(0, 0, width, height);
        
        return graphics;
    }
    
    // Play sound with fallback
    playSound(scene, soundName, volume = 0.5) {
        try {
            if (scene.sound && scene.cache.audio.exists(soundName)) {
                scene.sound.play(soundName, { volume });
                return true;
            } else {
                console.warn(`🔊 Sound not found or not loaded: ${soundName}`);
            }
        } catch (error) {
            console.warn(`🔊 Could not play sound: ${soundName}`, error);
        }
        return false;
    }
    
    // Stop all background music
    stopAllMusic(scene) {
        try {
            if (scene.sound) {
                // Stop all sounds that are playing
                scene.sound.sounds.forEach(sound => {
                    if (sound.key === 'menu_music' || sound.key === 'world_music' || sound.key === 'background_music') {
                        sound.stop();
                    }
                });
                console.log('🎵 Stopped all background music');
            }
        } catch (error) {
            console.warn('🎵 Error stopping music:', error);
        }
    }

    // Play background music
    playBackgroundMusic(scene, loop = true, volume = 0.3, trackName = 'background_music') {
        try {
            if (!scene.sound) return null;

            // If this track is already playing, keep it going instead of
            // restarting it on every scene change
            const existing = scene.sound.get(trackName);
            if (existing && existing.isPlaying) {
                existing.setVolume(volume);
                return existing;
            }

            // Stop any other background music first
            this.stopAllMusic(scene);

            if (scene.cache.audio.exists(trackName)) {
                const music = scene.sound.play(trackName, {
                    loop,
                    volume
                });
                return music;
            } else {
                console.warn(`🎵 ${trackName} not found or not loaded`);
            }
        } catch (error) {
            console.warn(`🎵 Could not play ${trackName}:`, error);
        }
        return null;
    }
    
    // Play menu music specifically
    playMenuMusic(scene, loop = true, volume = 0.2) {
        return this.playBackgroundMusic(scene, loop, volume, 'menu_music');
    }
    
    // Play battle/world music specifically  
    playWorldMusic(scene, loop = true, volume = 0.3) {
        return this.playBackgroundMusic(scene, loop, volume, 'world_music');
    }
    
    // Play victory fanfare (special method for finale)
    playVictoryFanfare(scene, volume = 0.8) {
        try {
            console.log(`🎵 Attempting to play victory fanfare`);
            
            if (scene.sound && scene.cache.audio.exists('victory-fanfare')) {
                console.log(`🎵 Playing victory fanfare at volume ${volume}`);
                const fanfare = scene.sound.play('victory-fanfare', { 
                    volume 
                });
                return fanfare;
            } else {
                console.warn('🎵 Victory fanfare not found, playing regular victory sound');
                // Fallback to regular victory sound
                if (scene.cache.audio.exists('victory')) {
                    return scene.sound.play('victory', { volume });
                }
            }
        } catch (error) {
            console.warn('🎵 Could not play victory fanfare:', error);
        }
        return null;
    }
}

// Global asset manager class - instances created per scene
window.AssetManager = AssetManager;