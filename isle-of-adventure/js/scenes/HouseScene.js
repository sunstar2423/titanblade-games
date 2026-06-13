/*
 * Battle of the Druids - Web Edition
 * HouseScene.js
 * 
 * Copyright (c) 2025 TitanBlade Games
 * 
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 * 
 * https://github.com/sunstar2423/titanblade-games
 */

import { SCREEN_WIDTH, SCREEN_HEIGHT, SCENES, ITEMS } from '../GameData.js';

export default class HouseScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.HOUSE });
    }

    create() {
        this.gameState = this.registry.get('gameState');
        this.gameState.visitLocation('House');
        
        // Start serene journey music
        this.startGameMusic('serene_journey');
        
        // Background image
        const background = this.add.image(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'house_bg');
        const scaleX = SCREEN_WIDTH / background.width;
        const scaleY = SCREEN_HEIGHT / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale);
        
        // Title with better visibility
        this.add.text(SCREEN_WIDTH/2, 50, 'Inside the House', {
            fontSize: '32px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Description with better visibility
        this.add.text(SCREEN_WIDTH/2, 120, 'A cozy house with useful items scattered about.\nClick on items to collect them.', {
            fontSize: '16px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Create collectible items
        this.createItem(200, 250, '🏹', ITEMS.BOW.name, ITEMS.BOW.description);
        this.createItem(350, 250, '➴', ITEMS.ARROWS.name, ITEMS.ARROWS.description);
        this.createItem(500, 250, '🦺', ITEMS.LEATHER_ARMOR.name, ITEMS.LEATHER_ARMOR.description);
        this.createItem(350, 350, '🍞', ITEMS.FOOD.name, ITEMS.FOOD.description);

        // Return to village button
        this.createButton(SCREEN_WIDTH/2, 500, 'Return to Village', () => {
            this.scene.start(SCENES.VILLAGE);
        });
    }

    createItem(x, y, emoji, name, description) {
        if (this.gameState.hasItem(name)) {
            // Item already collected, show as grayed out
            this.add.text(x, y, emoji, { fontSize: '32px', fill: '#666666' }).setOrigin(0.5);
            this.add.text(x, y + 40, 'Taken', { fontSize: '12px', fill: '#666666' }).setOrigin(0.5);
            return;
        }

        const itemSprite = this.add.text(x, y, emoji, { fontSize: '32px' }).setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.collectItem(name, description, itemSprite, x, y);
            })
            .on('pointerover', () => itemSprite.setScale(1.1))
            .on('pointerout', () => itemSprite.setScale(1.0));

        this.add.text(x, y + 40, name, { 
            fontSize: '12px', 
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
    }

    collectItem(name, description, sprite, x, y) {
        this.gameState.addItem(name);
        
        // Play special pickup sound
        this.sound.play('special_sound', { volume: 0.6 });
        
        // Update inventory display
        this.game.events.emit('inventory-updated');
        
        // Show collection message
        const message = this.add.text(x, y - 50, `Got ${name}!`, {
            fontSize: '14px',
            fill: '#4ecdc4',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Remove the item sprite and replace with "taken" text
        sprite.destroy();
        this.add.text(x, y, '✓', { fontSize: '32px', fill: '#4ecdc4' }).setOrigin(0.5);
        this.add.text(x, y + 40, 'Taken', { fontSize: '12px', fill: '#4ecdc4' }).setOrigin(0.5);

        // Remove message after 2 seconds
        this.time.delayedCall(2000, () => {
            if (message) message.destroy();
        });
    }

    createButton(x, y, text, callback) {
        const button = this.add.rectangle(x, y, 200, 40, 0x34495e)
            .setInteractive()
            .on('pointerdown', () => {
                this.sound.play('click_sound', { volume: 0.5 });
                callback();
            })
            .on('pointerover', () => button.setFillStyle(0x5d6d7e))
            .on('pointerout', () => button.setFillStyle(0x34495e));

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