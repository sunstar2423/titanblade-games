/*
 * Battle of the Druids - Web Edition
 * WorldMapScene.js
 * 
 * Copyright (c) 2025 TitanBlade Games
 * 
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 * 
 * https://github.com/sunstar2423/titanblade-games
 */

class WorldMapScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WorldMap' });
        this.player = null;
        this.locations = [];
        this.locationCircles = [];
    }
    
    create() {
        const { width, height } = this.scale;

        // Reset per-visit state (scene instances are reused)
        this.locationCircles = [];

        // Get player from registry
        this.player = this.registry.get('currentPlayer');
        
        if (!this.player) {
            this.scene.start('CharacterSelection');
            return;
        }
        
        // Background
        BackgroundRenderer.drawWorldMapBackground(this);
        
        // Initialize asset manager for audio and start world music
        this.assetManager = new AssetManager(this);
        this.assetManager.playWorldMusic(this, true, 0.25);
        
        // Title
        this.add.text(width / 2, 50, 'World Map', {
            fontSize: '48px',
            fontFamily: 'Arial',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Instructions
        this.add.text(width / 2, 100, 'Click on a location to battle!', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5);

        // Player status header
        const potionCount = this.player.potions ? this.player.potions.length : 0;
        this.add.text(width / 2, 135,
            `${this.player.name}  •  Lv ${this.player.victories + 1}  •  Gold: ${this.player.gold}  •  Shards: ${this.player.dragonShards}  •  Potions: ${potionCount}`, {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Checkpoint save whenever the map is visited
        if (typeof SaveSystem !== 'undefined') {
            SaveSystem.save(this.player);
        }
        
        // Main Menu button (bottom-right corner)
        const mainMenuBtn = this.add.rectangle(width - 100, height - 50, 160, 40, COLORS.DARK_GRAY)
            .setStrokeStyle(2, COLORS.WHITE)
            .setInteractive();
        
        this.add.text(width - 100, height - 50, 'Main Menu', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        
        // Main Menu button interactions
        mainMenuBtn.on('pointerdown', () => {
            this.assetManager.playSound(this, 'click', 0.4);
            this.scene.start('MainMenu');
        });
        
        mainMenuBtn.on('pointerover', () => {
            mainMenuBtn.setFillStyle(COLORS.GRAY);
        });
        
        mainMenuBtn.on('pointerout', () => {
            mainMenuBtn.setFillStyle(COLORS.DARK_GRAY);
        });
        
        // Create location markers
        this.createLocationMarkers();
        
        // Disable keyboard input to prevent mobile keyboard popup
        this.input.keyboard.enabled = false;
        
        // Hover description text (initially empty)
        this.hoverDescription = this.add.text(width / 2, height - 100, '', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setVisible(false);
    }
    
    createLocationMarkers() {
        WORLD_LOCATIONS.forEach(location => {
            // Check if location is unlocked
            const isUnlocked = this.isLocationUnlocked(location);
            
            // Location circle with progress-based colors
            const victories = this.player.locationVictories[location.name] || 0;
            let color;
            if (isUnlocked) {
                if (victories >= 3) {
                    color = COLORS.GREEN; // Completed (3/3)
                } else if (victories > 0) {
                    color = COLORS.YELLOW; // In progress (1/3 or 2/3)
                } else {
                    color = COLORS.GOLD; // Available but not started
                }
            } else {
                color = COLORS.GRAY; // Locked
            }
            
            const locationCircle = this.add.circle(location.x, location.y, 30, color)
                .setStrokeStyle(3, COLORS.BLACK)
                .setInteractive();
            
            // Location name with progress
            let displayText = location.name;
            if (isUnlocked) {
                displayText += `\n(${victories}/3)`;
            }
            
            this.add.text(location.x, location.y + 50, displayText, {
                fontSize: '14px',
                fontFamily: 'Arial',
                fill: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 2,
                align: 'center'
            }).setOrigin(0.5);
            
            // Locked locations show as grayed out (no requirement text)
            if (!isUnlocked) {
                this.add.text(location.x, location.y + 70, 'LOCKED', {
                    fontSize: '12px',
                    fontFamily: 'Arial',
                    fill: '#FF4444'
                }).setOrigin(0.5);
            }
            
            // Interaction handlers
            if (isUnlocked) {
                // Completed locations stay open for replay (gold and shard grinding)
                locationCircle.on('pointerdown', () => {
                    this.selectLocation(location);
                });

                locationCircle.on('pointerover', () => {
                    locationCircle.setScale(1.1);
                    if (victories >= 3) {
                        this.showCompletedMessage(location);
                    } else {
                        this.showLocationDescription(location);
                    }
                });

                locationCircle.on('pointerout', () => {
                    locationCircle.setScale(1.0);
                    this.hideLocationDescription();
                });

                // Pulse locations that still have progress to earn
                if (victories < 3) {
                    this.tweens.add({
                        targets: locationCircle,
                        scaleX: 1.12,
                        scaleY: 1.12,
                        duration: 900,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                }
            } else {
                // Show locked state
                locationCircle.on('pointerover', () => {
                    this.showLockedMessage(location);
                });
                
                locationCircle.on('pointerout', () => {
                    this.hideLocationDescription();
                });
            }
            
            this.locationCircles.push(locationCircle);
        });
    }
    
    isLocationUnlocked(location) {
        // Check victory requirements
        if (this.player.victories < location.minVictoriesRequired) {
            return false;
        }
        
        // Check unlock requirements (specific locations)
        if (location.unlockRequirements) {
            for (const reqLocation of location.unlockRequirements) {
                // Require 3 victories per location to unlock dependent locations
                if ((this.player.locationVictories[reqLocation] || 0) < 3) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    selectLocation(location) {
        // Play location selection sound
        this.assetManager.playSound(this, 'click', 0.5);
        
        // Store selected location in registry
        this.registry.set('selectedLocation', location);
        
        // Transition to battle scene
        this.scene.start('Battle');
    }
    
    showLocationDescription(location) {
        this.hoverDescription.setText(location.description);
        this.hoverDescription.setVisible(true);
    }
    
    showLockedMessage(location) {
        let message = "Locked";
        
        if (location.unlockRequirements) {
            const uncompletedReqs = location.unlockRequirements.filter(req => 
                (this.player.locationVictories[req] || 0) < 3
            );
            
            if (uncompletedReqs.length > 0) {
                message += `\nComplete these locations first:\n${uncompletedReqs.join(', ')}`;
            }
        }
        
        this.hoverDescription.setText(message);
        this.hoverDescription.setVisible(true);
    }
    
    hideLocationDescription() {
        this.hoverDescription.setVisible(false);
    }
    
    showCompletedMessage(location) {
        this.hoverDescription.setText(`${location.name} - COMPLETED! (3/3)\nYou can still battle here for extra gold and shards.`);
        this.hoverDescription.setVisible(true);
    }
    
    update() {
        // Keep player data updated
        this.registry.set('currentPlayer', this.player);
    }
}