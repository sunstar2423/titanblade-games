/*
 * Battle of the Druids - Web Edition
 * ForkScene.js
 * 
 * Copyright (c) 2025 TitanBlade Games
 * 
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 * 
 * https://github.com/sunstar2423/titanblade-games
 */

import { SCREEN_WIDTH, SCREEN_HEIGHT, SCENES } from '../GameData.js';

export default class ForkScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.FORK });
    }

    create() {
        this.gameState = this.registry.get('gameState');
        this.gameState.visitLocation('Fork');
        
        // Start serene journey music
        this.startGameMusic('serene_journey');
        
        // Background image
        const background = this.add.image(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'fork_bg');
        const scaleX = SCREEN_WIDTH / background.width;
        const scaleY = SCREEN_HEIGHT / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale);
        
        // Title with better visibility
        this.add.text(SCREEN_WIDTH/2, 50, 'Fork in the Road', {
            fontSize: '32px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Description with better visibility
        this.add.text(SCREEN_WIDTH/2, 120, 'The path splits in two directions.\nChoose your adventure carefully.', {
            fontSize: '16px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Left path - Mountains
        this.add.rectangle(250, 300, 200, 150, 0x696969);
        this.add.text(250, 250, '⛰️', { fontSize: '48px' }).setOrigin(0.5);
        this.add.text(250, 320, 'Mountain Path', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        this.add.text(250, 350, 'Leads to caves\nand treasure', {
            fontSize: '12px',
            fill: '#cccccc',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5);

        // Right path - Shore
        this.add.rectangle(550, 300, 200, 150, 0x4682B4);
        this.add.text(550, 250, '🌊', { fontSize: '48px' }).setOrigin(0.5);
        this.add.text(550, 320, 'Coastal Path', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        this.add.text(550, 350, 'Leads to the sea\nand adventure', {
            fontSize: '12px',
            fill: '#cccccc',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5);

        // Path selection buttons
        this.createButton(250, 450, 'Take Mountain Path', () => {
            this.scene.start(SCENES.MOUNTAINS);
        });

        this.createButton(550, 450, 'Take Coastal Path', () => {
            this.scene.start(SCENES.SHORE);
        });

        // Return button
        this.createButton(SCREEN_WIDTH/2, 520, 'Return to Forest', () => {
            this.scene.start(SCENES.FOREST);
        });
    }

    createButton(x, y, text, callback) {
        const button = this.add.rectangle(x, y, 180, 40, 0x34495e)
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