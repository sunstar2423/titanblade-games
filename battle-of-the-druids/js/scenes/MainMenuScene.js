/*
 * Battle of the Druids - Web Edition
 * MainMenuScene.js
 * 
 * Copyright (c) 2025 TitanBlade Games
 * 
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 * 
 * https://github.com/sunstar2423/titanblade-games
 */

class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
        this.player = null;
        this.buttons = [];
    }
    
    create() {
        const { width, height } = this.scale;

        // Reset per-visit state (scene instances are reused)
        this.buttons = [];

        // Get player from registry
        this.player = this.registry.get('currentPlayer');
        
        if (!this.player) {
            // No player found, go back to character selection
            this.scene.start('CharacterSelection');
            return;
        }
        
        // Background
        BackgroundRenderer.drawMenuBackground(this);
        
        // Initialize asset manager and start menu background music
        this.assetManager = new AssetManager(this);
        this.assetManager.playMenuMusic(this, true, 0.2);
        
        // Title
        this.add.text(width / 2, 150, 'Battle of the Druids', {
            fontSize: '64px',
            fontFamily: 'Arial',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Player info
        this.add.text(width / 2, 220, `${this.player.name} - Level ${this.player.victories + 1}`, {
            fontSize: '24px',
            fontFamily: 'Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        
        const potionCount = this.player.potions ? this.player.potions.length : 0;
        this.add.text(width / 2, 250, `Gold: ${this.player.gold} | Dragon Shards: ${this.player.dragonShards} | Potions: ${potionCount}/${GAME_CONSTANTS.POTIONS.BAG_LIMIT}`, {
            fontSize: '20px',
            fontFamily: 'Arial',
            fill: '#FFD700'
        }).setOrigin(0.5);

        // Checkpoint save
        if (typeof SaveSystem !== 'undefined') {
            SaveSystem.save(this.player);
        }
        
        // Create menu buttons
        this.createMenuButtons();
        
        // Note: Keyboard input disabled to prevent mobile keyboard popup
    }
    
    createMenuButtons() {
        const { width } = this.scale;
        const buttonData = [
            { text: 'World Map', y: 320, action: () => this.scene.start('WorldMap') },
            { text: 'Store', y: 380, action: () => this.scene.start('Store') },
            { text: 'Inventory', y: 440, action: () => this.scene.start('Inventory') },
            { text: 'Quit', y: 500, action: () => this.quitGame() }
        ];
        
        buttonData.forEach(btn => {
            const button = this.add.rectangle(width / 2, btn.y, 200, 50, COLORS.DARK_GRAY)
                .setStrokeStyle(2, COLORS.WHITE)
                .setInteractive();
            
            const buttonText = this.add.text(width / 2, btn.y, btn.text, {
                fontSize: '20px',
                fontFamily: 'Arial',
                fill: '#FFFFFF'
            }).setOrigin(0.5);
            
            // Button interactions
            button.on('pointerdown', () => {
                console.log(`🔧 Main menu button clicked: ${btn.text}`);
                this.assetManager.playSound(this, 'click', 0.4);
                btn.action();
            });
            button.on('pointerover', () => {
                button.setFillStyle(COLORS.GRAY);
                buttonText.setStyle({ fill: '#FFD700' });
            });
            button.on('pointerout', () => {
                button.setFillStyle(COLORS.DARK_GRAY);
                buttonText.setStyle({ fill: '#FFFFFF' });
            });
            
            this.buttons.push({ rect: button, text: buttonText });
        });
    }
    
    
    quitGame() {
        // Create confirmation dialog
        const { width, height } = this.scale;
        const elements = [];

        const overlay = this.add.rectangle(width / 2, height / 2, width, height, COLORS.BLACK, 0.8)
            .setInteractive();
        elements.push(overlay);

        elements.push(this.add.rectangle(width / 2, height / 2, 340, 200, COLORS.DARK_GRAY)
            .setStrokeStyle(3, COLORS.WHITE));

        elements.push(this.add.text(width / 2, height / 2 - 40, 'Quit Game?', {
            fontSize: '24px',
            fontFamily: 'Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5));

        elements.push(this.add.text(width / 2, height / 2, 'Your progress is saved automatically.', {
            fontSize: '16px',
            fontFamily: 'Arial',
            fill: '#CCCCCC'
        }).setOrigin(0.5));

        // Yes button
        const yesBtn = this.add.rectangle(width / 2 - 60, height / 2 + 50, 100, 40, COLORS.RED)
            .setStrokeStyle(2, COLORS.WHITE)
            .setInteractive();
        elements.push(yesBtn);

        elements.push(this.add.text(width / 2 - 60, height / 2 + 50, 'Yes', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5));

        yesBtn.on('pointerdown', () => {
            if (typeof SaveSystem !== 'undefined') {
                SaveSystem.save(this.player);
            }
            this.registry.remove('currentPlayer');
            this.scene.start('CharacterSelection');
        });

        // No button
        const noBtn = this.add.rectangle(width / 2 + 60, height / 2 + 50, 100, 40, COLORS.GREEN)
            .setStrokeStyle(2, COLORS.WHITE)
            .setInteractive();
        elements.push(noBtn);

        elements.push(this.add.text(width / 2 + 60, height / 2 + 50, 'No', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5));

        noBtn.on('pointerdown', () => {
            elements.forEach(el => el.destroy());
        });
    }
    
    
    update() {
        // Update player reference in registry in case it was modified
        this.registry.set('currentPlayer', this.player);
    }
}