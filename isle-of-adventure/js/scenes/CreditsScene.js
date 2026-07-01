/*
 * Battle of the Druids - Web Edition
 * CreditsScene.js
 * 
 * Copyright (c) 2025 TitanBlade Games
 * 
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 * 
 * https://github.com/sunstar2423/titanblade-games
 */

import { SCREEN_WIDTH, SCREEN_HEIGHT, SCENES } from '../GameData.js';

export default class CreditsScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.CREDITS });
    }

    create() {
        // Black background
        this.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, SCREEN_WIDTH, SCREEN_HEIGHT, 0x000000);
        
        // Title
        this.add.text(SCREEN_WIDTH/2, 30, 'OPENING CREDITS', {
            fontSize: '24px',
            fill: '#FFD700',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Create and play the video (if this browser could load it)
        if (this.cache.video && this.cache.video.exists('welcome_video')) {
            this.video = this.add.video(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 - 20, 'welcome_video');

            // Scale the video to fit nicely within the screen
            const videoScale = Math.min(
                (SCREEN_WIDTH - 100) / this.video.width,
                (SCREEN_HEIGHT - 150) / this.video.height
            );
            this.video.setScale(videoScale);

            // Play the video
            this.video.play();

            // Add video controls text
            this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT - 120, 'Click video to play/pause', {
                fontSize: '14px',
                fill: '#CCCCCC',
                fontFamily: 'Arial'
            }).setOrigin(0.5);

            // Make video interactive for play/pause
            this.video.setInteractive()
                .on('pointerdown', () => {
                    if (this.video.isPlaying()) {
                        this.video.pause();
                    } else {
                        this.video.play();
                    }
                });
        }

        // Add text overlays on top of the video
        this.createTextOverlays();

        // Back to menu button
        this.createButton(SCREEN_WIDTH/2, SCREEN_HEIGHT - 50, 'BACK TO MENU', () => {
            if (this.video) this.video.stop();
            this.scene.start('MainMenuScene');
        });

        // Skip button
        this.createButton(SCREEN_WIDTH/2, SCREEN_HEIGHT - 80, 'SKIP', () => {
            if (this.video) this.video.stop();
            this.scene.start('MainMenuScene');
        });
    }

    createButton(x, y, text, callback) {
        const button = this.add.rectangle(x, y, 200, 25, 0x34495e, 0.8)
            .setInteractive()
            .on('pointerdown', () => {
                this.sound.play('click_sound', { volume: 0.5 });
                callback();
            })
            .on('pointerover', () => {
                button.setFillStyle(0x5d6d7e, 0.9);
                buttonText.setScale(1.05);
            })
            .on('pointerout', () => {
                button.setFillStyle(0x34495e, 0.8);
                buttonText.setScale(1.0);
            });

        const buttonText = this.add.text(x, y, text, {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        return { button, text: buttonText };
    }

    createTextOverlays() {
        // Game title overlay (top center)
        this.add.text(SCREEN_WIDTH/2, 80, 'ISLE OF ADVENTURE', {
            fontSize: '28px',
            fill: '#FFD700',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 3,
            fontWeight: 'bold'
        }).setOrigin(0.5).setDepth(10);

        // Developer credit (bottom left)
        this.add.text(50, SCREEN_HEIGHT - 200, 'Created by', {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0, 0.5).setDepth(10);

        this.add.text(50, SCREEN_HEIGHT - 180, 'TitanBlade Games', {
            fontSize: '18px',
            fill: '#4ECDC4',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2,
            fontWeight: 'bold'
        }).setOrigin(0, 0.5).setDepth(10);

        this.add.text(50, SCREEN_HEIGHT - 160, '& Open Source Contributors', {
            fontSize: '14px',
            fill: '#FFD700',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0, 0.5).setDepth(10);

        this.add.text(50, SCREEN_HEIGHT - 140, 'github.com/sunstar2423/titanblade-games', {
            fontSize: '11px',
            fill: '#CCCCCC',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0, 0.5).setDepth(10);

        // Open Source notice (bottom right)
        const currentYear = new Date().getFullYear();
        this.add.text(SCREEN_WIDTH - 50, SCREEN_HEIGHT - 200, 'Open Source Game', {
            fontSize: '14px',
            fill: '#66FF66',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2,
            fontWeight: 'bold'
        }).setOrigin(1, 0.5).setDepth(10);

        this.add.text(SCREEN_WIDTH - 50, SCREEN_HEIGHT - 180, `© ${currentYear} TitanBlade Games & Contributors`, {
            fontSize: '11px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(1, 0.5).setDepth(10);

        this.add.text(SCREEN_WIDTH - 50, SCREEN_HEIGHT - 160, 'Licensed under MIT License', {
            fontSize: '10px',
            fill: '#CCCCCC',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(1, 0.5).setDepth(10);

        this.add.text(SCREEN_WIDTH - 50, SCREEN_HEIGHT - 140, 'Free to use, modify & distribute', {
            fontSize: '9px',
            fill: '#AAFFAA',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(1, 0.5).setDepth(10);

        // Version info (bottom center)
        this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT - 150, 'Version 1.0', {
            fontSize: '12px',
            fill: '#888888',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(10);
    }
}