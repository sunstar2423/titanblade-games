/*
 * Battle of the Druids - Web Edition
 * PirateIslandScene.js
 * 
 * Copyright (c) 2025 TitanBlade Games
 * 
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 * 
 * https://github.com/sunstar2423/titanblade-games
 */

import { SCREEN_WIDTH, SCREEN_HEIGHT, SCENES, ITEMS } from '../GameData.js';

export default class PirateIslandScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.PIRATE_ISLAND });
    }

    create() {
        this.gameState = this.registry.get('gameState');
        this.gameState.visitLocation('Pirate Island');
        
        // Start Run to the Dream music for pirate party
        this.startGameMusic('run_to_dream');
        
        // Background image
        const background = this.add.image(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'pirate_island_bg');
        const scaleX = SCREEN_WIDTH / background.width;
        const scaleY = SCREEN_HEIGHT / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale);
        
        // Title with better visibility
        this.add.text(SCREEN_WIDTH/2, 50, 'Pirate Island', {
            fontSize: '32px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Description with better visibility
        this.add.text(SCREEN_WIDTH/2, 120, 'You spot a small island with pirates having a beach party!\nA fire crackles as they roast fish and share stories.', {
            fontSize: '16px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Beach party scene
        this.add.text(200, 250, '🏴‍☠️', { fontSize: '32px' }).setOrigin(0.5); // pirate flag
        this.add.text(350, 280, '🔥', { fontSize: '32px' }).setOrigin(0.5); // fire
        this.add.text(500, 250, '🏴‍☠️', { fontSize: '32px' }).setOrigin(0.5); // pirate flag
        this.add.text(250, 320, '🧑‍☠️', { fontSize: '32px' }).setOrigin(0.5); // pirate
        this.add.text(450, 320, '🧑‍☠️', { fontSize: '32px' }).setOrigin(0.5); // pirate
        this.add.text(600, 280, '🍺', { fontSize: '32px' }).setOrigin(0.5); // drink

        this.add.text(SCREEN_WIDTH/2, 380, 'The pirates welcome you to their celebration!', {
            fontSize: '18px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.add.text(SCREEN_WIDTH/2, 410, 'They offer you roasted fish and...', {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Player dialogue options for joining the party
        this.add.text(SCREEN_WIDTH/2, 440, 'What do you say to the pirates?', {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.createPirateDialogueButton(200, 480, '"Ahoy! Mind if I crash\nyour beach party?"', () => {
            this.showPirateDialogue('"Ahoy! Mind if I crash your beach party? I promise I won\'t steal your treasure... much."');
        });

        this.createPirateDialogueButton(400, 480, '"Is this a pirate party\nor a cooking show?"', () => {
            this.showPirateDialogue('"Is this a pirate party or a cooking show? Where are the cannons and sword fights?"');
        });

        this.createPirateDialogueButton(600, 480, '"I\'ll join, but I don\'t\nknow any sea shanties."', () => {
            this.showPirateDialogue('"I\'ll join, but I don\'t know any sea shanties. Will humming the Jeopardy theme work?"');
        });

        // Return button
        this.createButton(SCREEN_WIDTH/2, 520, 'Return to Village', () => {
            this.scene.start(SCENES.VILLAGE);
        });
    }

    autoCollectRum() {
        const rumName = ITEMS.RUM.name;
        
        if (this.gameState.hasItem(rumName)) {
            // Rum already taken
            this.add.text(SCREEN_WIDTH/2, 450, '✓', { fontSize: '32px', fill: '#4ecdc4' }).setOrigin(0.5);
            this.add.text(SCREEN_WIDTH/2, 480, 'Rum Already Collected', { 
                fontSize: '14px', 
                fill: '#4ecdc4',
                fontFamily: 'Arial',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);
        } else {
            // Auto-collect the rum bottle
            this.gameState.addItem(ITEMS.RUM.name);
            
            // Play special pickup sound
            this.sound.play('special_sound', { volume: 0.6 });
            
            this.game.events.emit('inventory-updated');
            
            // Show rum bottle and collection message
            this.add.text(SCREEN_WIDTH/2, 450, '🍾', { fontSize: '32px' }).setOrigin(0.5);
            
            const message = this.add.text(SCREEN_WIDTH/2, 400, 'The pirates gift you a bottle of rum!', {
                fontSize: '18px',
                fill: '#8B4513',
                fontFamily: 'Arial',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5);

            this.add.text(SCREEN_WIDTH/2, 480, 'Rum Collected!', { 
                fontSize: '14px', 
                fill: '#4ecdc4',
                fontFamily: 'Arial',
                stroke: '#000000',
                strokeThickness: 2
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

    collectRum(sprite) {
        this.gameState.addItem(ITEMS.RUM.name);
        
        // Play special pickup sound
        this.sound.play('special_sound', { volume: 0.6 });
        
        // Update inventory display
        this.game.events.emit('inventory-updated');
        
        // Show collection message
        const message = this.add.text(SCREEN_WIDTH/2, 400, 'The pirates gift you a bottle of rum!', {
            fontSize: '16px',
            fill: '#4ecdc4',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Replace sprite with checkmark
        sprite.destroy();
        this.add.text(SCREEN_WIDTH/2, 450, '✓', { fontSize: '32px', fill: '#4ecdc4' }).setOrigin(0.5);
        this.add.text(SCREEN_WIDTH/2, 480, 'Rum Collected', { 
            fontSize: '14px', 
            fill: '#4ecdc4',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Remove message after 3 seconds
        this.time.delayedCall(3000, () => {
            if (message) message.destroy();
        });
    }

    createButton(x, y, text, callback) {
        const button = this.add.rectangle(x, y, 180, 40, 0x8B4513)
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

    createPirateDialogueButton(x, y, text, callback) {
        const button = this.add.rectangle(x, y, 180, 35, 0x8B4513)
            .setInteractive()
            .on('pointerdown', () => {
                this.sound.play('click_sound', { volume: 0.5 });
                callback();
            })
            .on('pointerover', () => button.setFillStyle(0xA0522D))
            .on('pointerout', () => button.setFillStyle(0x8B4513));

        this.add.text(x, y, text, {
            fontSize: '12px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5);

        return button;
    }

    showPirateDialogue(dialogue) {
        // Clear existing content and show player's chosen dialogue
        this.children.removeAll();
        
        // Background image
        const background = this.add.image(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'pirate_island_bg');
        const scaleX = SCREEN_WIDTH / background.width;
        const scaleY = SCREEN_HEIGHT / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale);
        
        // Title
        this.add.text(SCREEN_WIDTH/2, 50, 'Pirate Island', {
            fontSize: '32px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Player dialogue
        this.add.text(SCREEN_WIDTH/2, 130, dialogue, {
            fontSize: '16px',
            fill: '#4ECDC4',
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3,
            fontStyle: 'italic'
        }).setOrigin(0.5);

        // Pirate response
        this.add.text(SCREEN_WIDTH/2, 200, '"Har har har! Welcome aboard, landlubber!\nAny friend of adventure be a friend of ours!\nGrab some grub and join the festivities!"', {
            fontSize: '14px',
            fill: '#F39C12',
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3,
            fontStyle: 'italic'
        }).setOrigin(0.5);

        // Beach party scene
        this.add.text(200, 280, '🏴‍☠️', { fontSize: '32px' }).setOrigin(0.5);
        this.add.text(350, 310, '🔥', { fontSize: '32px' }).setOrigin(0.5);
        this.add.text(500, 280, '🏴‍☠️', { fontSize: '32px' }).setOrigin(0.5);
        this.add.text(250, 340, '🧑‍☠️', { fontSize: '32px' }).setOrigin(0.5);
        this.add.text(450, 340, '🧑‍☠️', { fontSize: '32px' }).setOrigin(0.5);
        this.add.text(600, 310, '🍺', { fontSize: '32px' }).setOrigin(0.5);

        // Auto-collect rum bottle
        this.autoCollectRum();

        // Return button
        this.createButton(SCREEN_WIDTH/2, 520, 'Return to Village', () => {
            this.scene.start(SCENES.VILLAGE);
        });
    }
}