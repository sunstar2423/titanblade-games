/*
 * Battle of the Druids - Web Edition
 * VillageScene.js
 * 
 * Copyright (c) 2025 TitanBlade Games
 * 
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 * 
 * https://github.com/sunstar2423/titanblade-games
 */

import { SCREEN_WIDTH, SCREEN_HEIGHT, SCENES } from '../GameData.js';

export default class VillageScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.VILLAGE });
    }

    create() {
        this.gameState = this.registry.get('gameState');
        
        // Start serene journey music for village scene
        this.startGameMusic('serene_journey');
        
        // Background image
        const background = this.add.image(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'village_bg');
        const scaleX = SCREEN_WIDTH / background.width;
        const scaleY = SCREEN_HEIGHT / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale);
        
        // Title with better visibility
        this.add.text(SCREEN_WIDTH/2, 50, 'Village Portal', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Description with better visibility
        this.add.text(SCREEN_WIDTH/2, 120, 'You have appeared through a portal in a peaceful village.\nThree paths await your choice.', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Create interactive buttons
        this.createButton(200, 250, 'Enter House', () => {
            this.scene.start(SCENES.HOUSE);
        });

        this.createButton(400, 250, 'Go to Forest', () => {
            this.scene.start(SCENES.FOREST);
        });

        this.createButton(600, 250, 'Approach Sign', () => {
            this.checkSignAccess();
        });

        // Add visual elements for the three options
        // House - no preview needed since button appears next to house in background
        this.add.text(200, 320, '🏠', { fontSize: '32px' }).setOrigin(0.5);

        // Forest - small preview of forest background
        const forestPreview = this.add.image(400, 300, 'forest_bg');
        forestPreview.setDisplaySize(120, 80);
        forestPreview.setAlpha(0.8);
        
        // Sign - simple visual indicator
        this.add.rectangle(600, 300, 120, 80, 0x8B4513, 0.7);
        this.add.text(600, 300, '📋', { fontSize: '32px' }).setOrigin(0.5);
        this.add.text(600, 330, 'Ancient Sign', { 
            fontSize: '10px', 
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);

        // Main Menu button
        this.createButton(SCREEN_WIDTH/2, 480, 'Main Menu', () => {
            this.scene.start('MainMenuScene');
        });
    }

    createButton(x, y, text, callback) {
        const button = this.add.rectangle(x, y, 150, 40, 0x34495e)
            .setInteractive()
            .on('pointerdown', callback)
            .on('pointerover', () => button.setFillStyle(0x5d6d7e))
            .on('pointerout', () => button.setFillStyle(0x34495e));

        this.add.text(x, y, text, {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        return button;
    }

    checkSignAccess() {
        this.gameState.checkSorcererAccess();
        
        if (this.gameState.canEnterSorcerer) {
            this.scene.start(SCENES.SORCERER);
        } else {
            // Show force field message with better visibility
            const message = this.add.text(SCREEN_WIDTH/2, 450, 'Only the worthy shall pass!\nA magical force field blocks your way.', {
                fontSize: '20px',
                fill: '#FF6B6B',
                fontFamily: 'Arial',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4
            }).setOrigin(0.5);

            // Remove message after 3 seconds
            this.time.delayedCall(3000, () => {
                if (message) message.destroy();
            });
        }
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