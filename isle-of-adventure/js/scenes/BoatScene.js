/*
 * Battle of the Druids - Web Edition
 * BoatScene.js
 * 
 * Copyright (c) 2025 TitanBlade Games
 * 
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 * 
 * https://github.com/sunstar2423/titanblade-games
 */

import { SCREEN_WIDTH, SCREEN_HEIGHT, SCENES } from '../GameData.js';

export default class BoatScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.BOAT });
    }

    create() {
        this.gameState = this.registry.get('gameState');
        this.gameState.visitLocation('Boat at Sea');
        
        // Start serene journey music
        this.startGameMusic('serene_journey');
        
        // Background image
        const background = this.add.image(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'boat_bg');
        const scaleX = SCREEN_WIDTH / background.width;
        const scaleY = SCREEN_HEIGHT / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale);
        
        // Title
        this.add.text(SCREEN_WIDTH/2, 50, 'Out at Sea', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Description
        this.add.text(SCREEN_WIDTH/2, 120, 'The fishermen row you out into the deep blue sea.\nSudddenly, dark tentacles emerge from the depths!', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5);

        // Sea waves
        this.add.text(200, 250, '🌊', { fontSize: '32px' }).setOrigin(0.5);
        this.add.text(600, 250, '🌊', { fontSize: '32px' }).setOrigin(0.5);

        // Tentacles emerging
        this.add.text(150, 350, '🐙', { fontSize: '64px' }).setOrigin(0.5);
        this.add.text(650, 350, '🐙', { fontSize: '64px' }).setOrigin(0.5);

        this.add.text(SCREEN_WIDTH/2, 400, 'A Giant Squid attacks!', {
            fontSize: '24px',
            fill: '#ff6b6b',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Action buttons
        this.createButton(SCREEN_WIDTH/2, 470, 'Fight the Squid!', () => {
            this.scene.start(SCENES.SQUID_BATTLE);
        });

        this.createButton(SCREEN_WIDTH/2, 520, 'Try to Escape', () => {
            this.scene.start(SCENES.SHORE);
        });
    }

    createButton(x, y, text, callback) {
        const button = this.add.rectangle(x, y, 180, 40, 0x34495e)
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