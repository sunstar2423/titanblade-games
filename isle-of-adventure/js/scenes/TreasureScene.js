/*
 * Battle of the Druids - Web Edition
 * TreasureScene.js
 * 
 * Copyright (c) 2025 TitanBlade Games
 * 
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 * 
 * https://github.com/sunstar2423/titanblade-games
 */

import { SCREEN_WIDTH, SCREEN_HEIGHT, SCENES, ITEMS } from '../GameData.js';

export default class TreasureScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.TREASURE });
    }

    create() {
        this.gameState = this.registry.get('gameState');
        this.gameState.visitLocation('Treasure Room');
        
        // Continue existing music from previous scene (don't start new music)
        
        // Background image
        const background = this.add.image(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'treasure_bg');
        const scaleX = SCREEN_WIDTH / background.width;
        const scaleY = SCREEN_HEIGHT / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale);
        
        // Title with better visibility
        this.add.text(SCREEN_WIDTH/2, 50, 'Treasure Chamber', {
            fontSize: '32px',
            fill: '#FFD700',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Description with better visibility
        this.add.text(SCREEN_WIDTH/2, 120, 'A room filled with glittering gold and precious artifacts!\nThe Golden Goblet is yours!', {
            fontSize: '16px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Gold piles
        this.add.text(200, 250, '🪙', { fontSize: '48px' }).setOrigin(0.5);
        this.add.text(350, 280, '🪙', { fontSize: '48px' }).setOrigin(0.5);
        this.add.text(600, 270, '🪙', { fontSize: '48px' }).setOrigin(0.5);
        this.add.text(500, 320, '🪙', { fontSize: '48px' }).setOrigin(0.5);

        // Auto-collect the Golden Goblet
        this.autoCollectGoblet();

        // Return button
        this.createButton(SCREEN_WIDTH/2, 520, 'Leave Treasure Room', () => {
            this.scene.start(SCENES.CAVE);
        });
    }

    autoCollectGoblet() {
        const gobletName = ITEMS.GOBLET.name;
        
        if (this.gameState.hasItem(gobletName)) {
            // Goblet already taken
            this.add.text(SCREEN_WIDTH/2, 350, '✓', { fontSize: '48px', fill: '#4ecdc4' }).setOrigin(0.5);
            this.add.text(SCREEN_WIDTH/2, 400, 'Goblet Already Collected', { 
                fontSize: '16px', 
                fill: '#4ecdc4',
                fontFamily: 'Arial',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);
        } else {
            // Auto-collect the goblet
            this.gameState.addItem(ITEMS.GOBLET.name);
            
            // Play special pickup sound
            this.sound.play('special_sound', { volume: 0.6 });
            
            this.game.events.emit('inventory-updated');
            
            // Show goblet and prominent collection message
            this.add.text(SCREEN_WIDTH/2, 350, '🏆', { fontSize: '64px' }).setOrigin(0.5);
            
            const message = this.add.text(SCREEN_WIDTH/2, 280, '✨ GOLDEN GOBLET OBTAINED! ✨', {
                fontSize: '28px',
                fill: '#FFD700',
                fontFamily: 'Arial',
                stroke: '#000000',
                strokeThickness: 4,
                fontWeight: 'bold'
            }).setOrigin(0.5);

            this.add.text(SCREEN_WIDTH/2, 420, 'PRECIOUS TREASURE ACQUIRED!', { 
                fontSize: '20px', 
                fill: '#4ecdc4',
                fontFamily: 'Arial',
                stroke: '#000000',
                strokeThickness: 3,
                fontWeight: 'bold'
            }).setOrigin(0.5);

            // Make message flash for emphasis
            this.tweens.add({
                targets: message,
                alpha: 0.3,
                duration: 800,
                yoyo: true,
                repeat: 2
            });
        }
    }

    collectGoblet(sprite) {
        this.gameState.addItem(ITEMS.GOBLET.name);
        
        // Update inventory display
        this.game.events.emit('inventory-updated');
        
        // Show collection message
        const message = this.add.text(SCREEN_WIDTH/2, 300, 'You obtained the Golden Goblet!', {
            fontSize: '18px',
            fill: '#4ecdc4',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Replace sprite with checkmark
        sprite.destroy();
        this.add.text(SCREEN_WIDTH/2, 350, '✓', { fontSize: '48px', fill: '#4ecdc4' }).setOrigin(0.5);
        this.add.text(SCREEN_WIDTH/2, 400, 'Goblet Taken', { 
            fontSize: '16px', 
            fill: '#4ecdc4',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Remove message after 3 seconds
        this.time.delayedCall(3000, () => {
            if (message) message.destroy();
        });
    }

    createButton(x, y, text, callback) {
        const button = this.add.rectangle(x, y, 200, 40, 0x8B4513)
            .setInteractive()
            .on('pointerdown', () => {
                this.sound.play('click_sound', { volume: 0.5 });
                callback();
            })
            .on('pointerover', () => button.setFillStyle(0xA0522D))
            .on('pointerout', () => button.setFillStyle(0x8B4513));

        this.add.text(x, y, text, {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        return button;
    }

    startGameMusic(musicKey) {
        // Don't restart the same track when moving between scenes that share it
        const currentMusic = this.registry.get('currentMusic');
        const currentKey = this.registry.get('currentMusicKey');
        if (currentKey === musicKey && currentMusic && currentMusic.isPlaying) {
            return;
        }
        if (currentMusic) {
            currentMusic.stop();
        }
        const newMusic = this.sound.add(musicKey, { loop: true, volume: 0.2 });
        newMusic.play();
        this.registry.set('currentMusic', newMusic);
        this.registry.set('currentMusicKey', musicKey);
    }
}