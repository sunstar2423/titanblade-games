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

import { SCREEN_WIDTH, SCREEN_HEIGHT, SCENES } from '../GameData.js';
import GameState from '../GameState.js';

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        this.gameState = this.registry.get('gameState');
        
        // Stop any existing global music and start menu music
        const currentMusic = this.registry.get('currentMusic');
        if (currentMusic) {
            currentMusic.stop();
        }
        this.menuMusic = this.sound.add('menumusic', { loop: true, volume: 0.3 });
        this.menuMusic.play();
        this.registry.set('currentMusic', this.menuMusic);
        this.registry.set('currentMusicKey', 'menumusic');
        
        // Add background image
        const background = this.add.image(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'mainmenu');
        
        // Scale background to fit screen while preserving aspect ratio and showing full image
        const scaleX = SCREEN_WIDTH / background.width;
        const scaleY = SCREEN_HEIGHT / background.height;
        const scale = Math.min(scaleX, scaleY); // Use min to fit entire image
        background.setScale(scale);
        
        // If the image doesn't fill the screen completely, add a dark background
        if (scale * background.width < SCREEN_WIDTH || scale * background.height < SCREEN_HEIGHT) {
            this.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, SCREEN_WIDTH, SCREEN_HEIGHT, 0x000000).setDepth(-1);
        }

        // Subtitle (since title is in the background image)
        this.add.text(SCREEN_WIDTH/2, 180, 'A Mystical Quest Awaits', {
            fontSize: '20px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        const hasSave = GameState.hasSave();

        // Menu buttons (positioned lower to avoid overlapping title in background)
        this.createMenuButton(SCREEN_WIDTH/2, 300, 'START ADVENTURE', () => {
            this.stopMenuMusic();
            this.gameState.reset();
            this.game.events.emit('inventory-updated');
            this.scene.start(SCENES.VILLAGE);
        });

        this.createMenuButton(SCREEN_WIDTH/2, 355, 'CONTINUE GAME', () => {
            if (!hasSave) return; // Nothing saved yet
            this.stopMenuMusic();
            this.gameState.load();
            this.game.events.emit('inventory-updated');
            this.scene.start(SCENES.VILLAGE);
        }, !hasSave);

        // Opening credits button
        this.createMenuButton(SCREEN_WIDTH/2, 410, 'OPENING CREDITS', () => {
            this.stopMenuMusic();
            this.scene.start(SCENES.CREDITS);
        });

        this.createMenuButton(SCREEN_WIDTH/2, 465, 'RESET PROGRESS', () => {
            this.gameState.reset();
            this.game.events.emit('inventory-updated');

            // Show confirmation message
            const message = this.add.text(SCREEN_WIDTH/2, 510, 'Progress Reset!', {
                fontSize: '16px',
                fill: '#4ecdc4',
                fontFamily: 'Arial',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);

            this.time.delayedCall(2000, () => {
                if (message) message.destroy();
            });
        });

        // Instructions
        this.add.text(SCREEN_WIDTH/2, 560, 'Collect items, defeat enemies, and find your way home!', {
            fontSize: '14px',
            fill: '#CCCCCC',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 1,
            align: 'center'
        }).setOrigin(0.5);

        // Version info
        this.add.text(20, SCREEN_HEIGHT - 30, 'Isle of Adventure v1.0', {
            fontSize: '12px',
            fill: '#888888',
            fontFamily: 'Arial'
        });

        // Music credits button (smaller, positioned at bottom right)
        this.createSmallButton(SCREEN_WIDTH - 120, SCREEN_HEIGHT - 30, 'MUSIC CREDITS', () => {
            this.showMusicCredits();
        });
    }

    createMenuButton(x, y, text, callback, disabled = false) {
        const baseColor = disabled ? 0x2b2b2b : 0x34495e;
        const borderColor = disabled ? 0x666666 : 0xFFD700;
        const textColor = disabled ? '#888888' : '#FFFFFF';

        // Create button background
        const button = this.add.rectangle(x, y, 300, 45, baseColor, 0.8);

        if (!disabled) {
            button.setInteractive()
                .on('pointerdown', () => {
                    this.sound.play('click_sound', { volume: 0.5 });
                    callback();
                })
                .on('pointerover', () => {
                    button.setFillStyle(0x5d6d7e, 0.9);
                    buttonText.setScale(1.05);
                })
                .on('pointerout', () => {
                    button.setFillStyle(baseColor, 0.8);
                    buttonText.setScale(1.0);
                });
        }

        // Add button border
        const border = this.add.rectangle(x, y, 300, 45, 0x2c3e50, 0);
        border.setStrokeStyle(2, borderColor);

        // Add button text
        const buttonText = this.add.text(x, y, text, {
            fontSize: '18px',
            fill: textColor,
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);

        return { button, border, text: buttonText };
    }

    createSmallButton(x, y, text, callback) {
        const button = this.add.rectangle(x, y, 150, 25, 0x34495e, 0.6)
            .setInteractive()
            .on('pointerdown', () => {
                this.sound.play('click_sound', { volume: 0.5 });
                callback();
            })
            .on('pointerover', () => {
                button.setFillStyle(0x5d6d7e, 0.8);
                buttonText.setScale(1.05);
            })
            .on('pointerout', () => {
                button.setFillStyle(0x34495e, 0.6);
                buttonText.setScale(1.0);
            });

        const buttonText = this.add.text(x, y, text, {
            fontSize: '12px',
            fill: '#FFFFFF',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        return { button, text: buttonText };
    }

    stopMenuMusic() {
        if (this.menuMusic) {
            this.menuMusic.stop();
        }
    }

    showMusicCredits() {
        // Clear the scene
        this.children.removeAll();
        
        // Background
        this.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, SCREEN_WIDTH, SCREEN_HEIGHT, 0x000000, 0.9);
        
        // Title
        this.add.text(SCREEN_WIDTH/2, 50, 'MUSIC CREDITS', {
            fontSize: '32px',
            fill: '#FFD700',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Credits text
        const creditsText = `"Serene Journey (Romantic and Beautiful Background Piano Music)"
by Lite Saturation
Source: Free Music Archive
License: CC BY-ND

"Run to the Dream (Romantic and Beautiful Background Piano Music)"
by Lite Saturation
Source: Free Music Archive
License: CC BY-ND

"Electric wind"
by Simon Mathewson
Source: Free Music Archive
License: CC BY

"Star Music"
by Danny Bale
Source: Free Music Archive
License: CC BY

Menu Music: CC0 License`;

        this.add.text(SCREEN_WIDTH/2, 320, creditsText, {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 1,
            lineSpacing: 5
        }).setOrigin(0.5);

        // Back button
        this.createMenuButton(SCREEN_WIDTH/2, 520, 'BACK TO MENU', () => {
            this.scene.restart();
        });
    }
}