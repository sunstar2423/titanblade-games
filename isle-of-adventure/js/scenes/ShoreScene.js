/*
 * Battle of the Druids - Web Edition
 * ShoreScene.js
 * 
 * Copyright (c) 2025 TitanBlade Games
 * 
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 * 
 * https://github.com/sunstar2423/titanblade-games
 */

import { SCREEN_WIDTH, SCREEN_HEIGHT, SCENES } from '../GameData.js';

export default class ShoreScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.SHORE });
    }

    create() {
        this.gameState = this.registry.get('gameState');
        this.gameState.visitLocation('Rocky Shore');
        
        // Start serene journey music
        this.startGameMusic('serene_journey');
        
        // Background image
        const background = this.add.image(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'shore_bg');
        const scaleX = SCREEN_WIDTH / background.width;
        const scaleY = SCREEN_HEIGHT / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale);
        
        // Title
        this.add.text(SCREEN_WIDTH/2, 50, 'Rocky Shore', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Description
        this.add.text(SCREEN_WIDTH/2, 120, 'Waves crash against the rocky coastline.\nA boat with spear fishermen rests on the shore.', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5);

        // Shore scenery
        this.add.text(150, 250, '🧿', { fontSize: '32px' }).setOrigin(0.5); // rocks
        this.add.text(300, 280, '🎣', { fontSize: '32px' }).setOrigin(0.5); // fishing
        this.add.text(500, 260, '🚣', { fontSize: '48px' }).setOrigin(0.5); // boat
        this.add.text(650, 270, '🎣', { fontSize: '32px' }).setOrigin(0.5); // fishing

        this.add.text(SCREEN_WIDTH/2, 350, 'Fishermen with their boat', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.add.text(SCREEN_WIDTH/2, 380, 'They seem willing to take you out to sea', {
            fontSize: '14px',
            fill: '#cccccc',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Action buttons
        this.createButton(SCREEN_WIDTH/2, 450, 'Board the Boat', () => {
            this.scene.start(SCENES.BOAT);
        });

        this.createButton(SCREEN_WIDTH/2, 520, 'Return to Fork', () => {
            this.scene.start(SCENES.FORK);
        });
    }

    createButton(x, y, text, callback) {
        const button = this.add.rectangle(x, y, 180, 40, 0x34495e)
            .setInteractive()
            .on('pointerdown', callback)
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