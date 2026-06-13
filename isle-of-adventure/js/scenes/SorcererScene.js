/*
 * Battle of the Druids - Web Edition
 * SorcererScene.js
 * 
 * Copyright (c) 2025 TitanBlade Games
 * 
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 * 
 * https://github.com/sunstar2423/titanblade-games
 */

import { SCREEN_WIDTH, SCREEN_HEIGHT, SCENES, ITEMS } from '../GameData.js';

export default class SorcererScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.SORCERER });
    }

    create() {
        this.gameState = this.registry.get('gameState');
        this.gameState.visitLocation('Sorcerer House');
        
        // Start Run to the Dream music for sorcerer scene
        this.startGameMusic('run_to_dream');
        
        // Background image
        const background = this.add.image(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'sorcerer_bg');
        const scaleX = SCREEN_WIDTH / background.width;
        const scaleY = SCREEN_HEIGHT / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale);
        
        // Title
        this.add.text(SCREEN_WIDTH/2, 50, 'Sorcerer\'s House', {
            fontSize: '32px',
            fill: '#FFD700',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Check if items have been given
        if (this.gameState.hasVisitedLocation('Portal')) {
            this.showCompletionState();
        } else {
            this.showWelcomeState();
        }
    }

    showWelcomeState() {
        // Description with better visibility
        this.add.text(SCREEN_WIDTH/2, 120, 'A wise sorcerer greets you in his mystical dwelling.', {
            fontSize: '16px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Sorcerer greeting
        this.add.text(SCREEN_WIDTH/2, 150, '"Welcome, brave adventurer! I am Merlin the Moderately Impressive.\nI used to be \'the Great\' but... budget cuts, you know?"', {
            fontSize: '13px',
            fill: '#DDA0DD',
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2,
            fontStyle: 'italic'
        }).setOrigin(0.5);

        // Sorcerer character image
        const sorcererChar = this.add.image(SCREEN_WIDTH/2, 250, 'sorcerer_char');
        sorcererChar.setDisplaySize(180, 220); // Scale to larger size

        // Player dialogue options when meeting sorcerer
        this.add.text(SCREEN_WIDTH/2, 320, 'How do you greet the sorcerer?', {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.createSorcererDialogueButton(200, 360, '"Merlin the Moderately\nImpressive? Modest!"', () => {
            this.showSorcererDialogue('"Merlin the Moderately Impressive? I appreciate the modest branding! Very refreshing."');
        });

        this.createSorcererDialogueButton(400, 360, '"Budget cuts in the\nmagic business?"', () => {
            this.showSorcererDialogue('"Budget cuts in the magic business? I knew the economy was tough, but even wizards?"');
        });

        this.createSorcererDialogueButton(600, 360, '"Can you still do\nimpressive magic tricks?"', () => {
            this.showSorcererDialogue('"Can you still do impressive magic tricks? Or are we limited to moderately impressive ones?"');
        });

        // Check if player has the required items
        const hasSquidEye = this.gameState.hasItem(ITEMS.SQUID_EYE.name);
        const hasRum = this.gameState.hasItem(ITEMS.RUM.name);
        const hasGoblet = this.gameState.hasItem(ITEMS.GOBLET.name);

        // Initially skip the item check - player must choose dialogue first
    }

    showCompletionState() {
        this.add.text(SCREEN_WIDTH/2, 200, 'The ritual is complete!', {
            fontSize: '24px',
            fill: '#FFD700',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.add.text(SCREEN_WIDTH/2, 250, 'The portal to your home awaits beyond that door.', {
            fontSize: '16px',
            fill: '#FFFFFF',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.createButton(SCREEN_WIDTH/2, 350, 'Enter Portal Room', () => {
            this.scene.start(SCENES.PORTAL);
        });
    }

    giveItemsToSorcerer() {
        // Clear the scene
        this.children.removeAll();
        
        // Background image
        const background = this.add.image(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'sorcerer_bg');
        const scaleX = SCREEN_WIDTH / background.width;
        const scaleY = SCREEN_HEIGHT / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale);
        
        // Ritual scene
        this.add.text(SCREEN_WIDTH/2, 100, 'The Ritual', {
            fontSize: '32px',
            fill: '#FFD700',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.add.text(SCREEN_WIDTH/2, 150, '"Now for the ancient ritual! *dramatic pose*\nStep one: Pour rum into goblet. Step two: Add squid eye.\nStep three: Try not to think about how gross this is."', {
            fontSize: '13px',
            fill: '#DDA0DD',
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2,
            fontStyle: 'italic'
        }).setOrigin(0.5);

        // Ritual elements - Sorcerer performing the ritual
        const sorcererRitual = this.add.image(SCREEN_WIDTH/2, 250, 'sorcerer_char');
        sorcererRitual.setDisplaySize(100, 125); // Slightly smaller for ritual scene
        this.add.text(300, 300, '🏆', { fontSize: '32px' }).setOrigin(0.5);
        this.add.text(400, 300, '🍾', { fontSize: '32px' }).setOrigin(0.5);
        this.add.text(500, 300, '👁️', { fontSize: '32px' }).setOrigin(0.5);
        this.add.text(SCREEN_WIDTH/2, 350, '✨✨✨', { fontSize: '32px' }).setOrigin(0.5);

        this.add.text(SCREEN_WIDTH/2, 400, '"Ta-da! The portal spell worked! *whispers* I was only 60% sure it would.\nYou\'re officially worthy! The door to home awaits!"', {
            fontSize: '13px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2,
            fontStyle: 'italic'
        }).setOrigin(0.5);

        // Mark as visited
        this.gameState.visitLocation('Portal');

        this.createButton(SCREEN_WIDTH/2, 480, 'Enter Portal Room', () => {
            this.scene.start(SCENES.PORTAL);
        });
    }

    createButton(x, y, text, callback) {
        const button = this.add.rectangle(x, y, 220, 40, 0x2C1810)
            .setInteractive()
            .on('pointerdown', () => {
                this.sound.play('click_sound', { volume: 0.5 });
                callback();
            })
            .on('pointerover', () => button.setFillStyle(0x3D2017))
            .on('pointerout', () => button.setFillStyle(0x2C1810));

        this.add.text(x, y, text, {
            fontSize: '14px',
            fill: '#FFD700',
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

    createSorcererDialogueButton(x, y, text, callback) {
        const button = this.add.rectangle(x, y, 180, 35, 0x6A0DAD)
            .setInteractive()
            .on('pointerdown', () => {
                this.sound.play('click_sound', { volume: 0.5 });
                callback();
            })
            .on('pointerover', () => button.setFillStyle(0x8B32CC))
            .on('pointerout', () => button.setFillStyle(0x6A0DAD));

        this.add.text(x, y, text, {
            fontSize: '12px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5);

        return button;
    }

    showSorcererDialogue(dialogue) {
        // Clear existing content and show player's chosen dialogue
        this.children.removeAll();
        
        // Background image
        const background = this.add.image(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'sorcerer_bg');
        const scaleX = SCREEN_WIDTH / background.width;
        const scaleY = SCREEN_HEIGHT / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale);
        
        // Title
        this.add.text(SCREEN_WIDTH/2, 50, 'Sorcerer\'s House', {
            fontSize: '32px',
            fill: '#FFD700',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Player dialogue
        this.add.text(SCREEN_WIDTH/2, 120, dialogue, {
            fontSize: '16px',
            fill: '#4ECDC4',
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3,
            fontStyle: 'italic'
        }).setOrigin(0.5);

        // Sorcerer response
        this.add.text(SCREEN_WIDTH/2, 180, '"Haha! I like your sense of humor!\nYes, the great title was taken by my cousin.\nBut don\'t worry - my magic is still pretty decent!"', {
            fontSize: '13px',
            fill: '#DDA0DD',
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2,
            fontStyle: 'italic'
        }).setOrigin(0.5);

        // Sorcerer character image
        const sorcererChar = this.add.image(SCREEN_WIDTH/2, 280, 'sorcerer_char');
        sorcererChar.setDisplaySize(180, 220);

        // Now show the regular quest content
        this.showQuestContent();
    }

    showQuestContent() {
        // Check if player has the required items
        const hasSquidEye = this.gameState.hasItem(ITEMS.SQUID_EYE.name);
        const hasRum = this.gameState.hasItem(ITEMS.RUM.name);
        const hasGoblet = this.gameState.hasItem(ITEMS.GOBLET.name);

        if (hasSquidEye && hasRum && hasGoblet) {
            this.add.text(SCREEN_WIDTH/2, 380, '"Excellent! You have the three sacred ingredients!\nSquid Eye for wisdom, Rum for courage, Goblet for... well, holding rum."', {
                fontSize: '13px',
                fill: '#FFFFFF',
                fontFamily: 'Arial',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2,
                fontStyle: 'italic'
            }).setOrigin(0.5);

            this.createButton(SCREEN_WIDTH/2, 450, 'Give Items to Sorcerer', () => {
                this.giveItemsToSorcerer();
            });
        } else {
            this.add.text(SCREEN_WIDTH/2, 380, '"I need three very specific items for the portal spell:\nSquid Eye, Fine Rum, and a Golden Goblet."', {
                fontSize: '13px',
                fill: '#FFFFFF',
                fontFamily: 'Arial',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2,
                fontStyle: 'italic'
            }).setOrigin(0.5);

            // Show what items are missing
            let missingItems = [];
            if (!hasSquidEye) missingItems.push('Squid Eye');
            if (!hasRum) missingItems.push('Rum');
            if (!hasGoblet) missingItems.push('Golden Goblet');

            this.add.text(SCREEN_WIDTH/2, 430, `Missing: ${missingItems.join(', ')}`, {
                fontSize: '12px',
                fill: '#ff6b6b',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
        }

        this.createButton(SCREEN_WIDTH/2, 520, 'Return to Village', () => {
            this.scene.start(SCENES.VILLAGE);
        });
    }
}