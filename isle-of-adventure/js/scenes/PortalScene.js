/*
 * Battle of the Druids - Web Edition
 * PortalScene.js
 * 
 * Copyright (c) 2025 TitanBlade Games
 * 
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 * 
 * https://github.com/sunstar2423/titanblade-games
 */

import { SCREEN_WIDTH, SCREEN_HEIGHT, SCENES } from '../GameData.js';

export default class PortalScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.PORTAL });
    }

    create() {
        this.gameState = this.registry.get('gameState');
        
        // Play electric wind sound effect for portal ambience
        this.electricWindSound = this.sound.add('electric_wind', { loop: true, volume: 0.3 });
        this.electricWindSound.play();
        
        // Start Run to the Dream music for final portal scene
        this.startGameMusic('run_to_dream');
        
        // Background image
        const background = this.add.image(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'portal_bg');
        const scaleX = SCREEN_WIDTH / background.width;
        const scaleY = SCREEN_HEIGHT / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale);
        
        // Title with better visibility
        this.add.text(SCREEN_WIDTH/2, 50, 'Portal Home', {
            fontSize: '32px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Description with better visibility
        this.add.text(SCREEN_WIDTH/2, 120, 'A glowing portal swirls before you,\nshimmering with magical energy.', {
            fontSize: '16px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Animated portal
        this.createPortal();

        this.add.text(SCREEN_WIDTH/2, 380, 'The portal pulses with power,\nready to transport you home.', {
            fontSize: '16px',
            fill: '#CCCCCC',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5);

        // Enter portal button
        this.createButton(SCREEN_WIDTH/2, 450, 'Enter Portal', () => {
            this.enterPortal();
        });

        // Return button (just in case)
        this.createButton(SCREEN_WIDTH/2, 520, 'Return to Sorcerer', () => {
            this.scene.start(SCENES.SORCERER);
        });
    }

    createPortal() {
        // Portal ring
        const portal = this.add.circle(SCREEN_WIDTH/2, 280, 80, 0x6A0DAD, 0.8);
        
        // Portal center
        const portalCenter = this.add.circle(SCREEN_WIDTH/2, 280, 60, 0x9932CC, 0.6);
        
        // Portal inner glow
        const portalGlow = this.add.circle(SCREEN_WIDTH/2, 280, 40, 0xFFFFFF, 0.9);
        
        // Animate the portal
        this.tweens.add({
            targets: portal,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        this.tweens.add({
            targets: portalCenter,
            scaleX: 0.9,
            scaleY: 0.9,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        this.tweens.add({
            targets: portalGlow,
            alpha: 0.4,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    enterPortal() {
        // Victory sequence
        this.children.removeAll();
        
        // Stop electric wind sound effect
        if (this.electricWindSound) {
            this.electricWindSound.stop();
        }
        
        // Stop current music and start victory star music
        const currentMusic = this.registry.get('currentMusic');
        if (currentMusic) {
            currentMusic.stop();
        }
        const victoryMusic = this.sound.add('star_music', { loop: true, volume: 0.3 });
        victoryMusic.play();
        this.registry.set('currentMusic', victoryMusic);
        this.registry.set('currentMusicKey', 'star_music');
        
        // Victory background with looping credits video
        this.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, SCREEN_WIDTH, SCREEN_HEIGHT, 0x000000);
        
        // Add looping credits video as background
        const backgroundVideo = this.add.video(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'welcome_video');
        backgroundVideo.setScale(Math.max(SCREEN_WIDTH / backgroundVideo.width, SCREEN_HEIGHT / backgroundVideo.height));
        backgroundVideo.setAlpha(0.7); // More visible but still allows text to show
        backgroundVideo.play(true); // Play with loop = true
        backgroundVideo.setDepth(1); // Behind text elements
        
        // Lighter dark overlay to improve text readability while keeping video visible
        this.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, SCREEN_WIDTH, SCREEN_HEIGHT, 0x000000, 0.3).setDepth(2);
        
        // Victory message (with depth to appear above video)
        this.add.text(SCREEN_WIDTH/2, 200, 'QUEST COMPLETE!', {
            fontSize: '48px',
            fill: '#FFD700',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(10);

        this.add.text(SCREEN_WIDTH/2, 280, 'You have successfully completed\nyour adventure on the Isle of Adventure!', {
            fontSize: '18px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(10);

        this.add.text(SCREEN_WIDTH/2, 350, '🎆🏆🎆', { fontSize: '48px' }).setOrigin(0.5).setDepth(10);

        this.add.text(SCREEN_WIDTH/2, 420, 'You gathered all the sacred items,\ndefeated dangerous enemies,\nand found your way home!', {
            fontSize: '14px',
            fill: '#CCCCCC',
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(10);

        // Play again button
        this.createButton(SCREEN_WIDTH/2, 500, 'Play Again', () => {
            this.gameState.reset();
            this.game.events.emit('inventory-updated');
            this.scene.start(SCENES.VILLAGE);
        });
    }

    createButton(x, y, text, callback) {
        const button = this.add.rectangle(x, y, 180, 40, 0x6A0DAD)
            .setInteractive()
            .on('pointerdown', () => {
                this.sound.play('click_sound', { volume: 0.5 });
                callback();
            })
            .on('pointerover', () => button.setFillStyle(0x8B32CC))
            .on('pointerout', () => button.setFillStyle(0x6A0DAD))
            .setDepth(10);

        this.add.text(x, y, text, {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(10);

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