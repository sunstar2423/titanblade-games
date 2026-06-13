/*
 * Battle of the Druids - Web Edition
 * CaveScene.js
 * 
 * Copyright (c) 2025 TitanBlade Games
 * 
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 * 
 * https://github.com/sunstar2423/titanblade-games
 */

import { SCREEN_WIDTH, SCREEN_HEIGHT, SCENES, ENEMIES } from '../GameData.js';

export default class CaveScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.CAVE });
    }

    create() {
        this.gameState = this.registry.get('gameState');
        this.gameState.visitLocation('Cave');
        
        // Start serene journey music
        this.startGameMusic('serene_journey');
        
        // Background image
        const background = this.add.image(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'cave_bg');
        const scaleX = SCREEN_WIDTH / background.width;
        const scaleY = SCREEN_HEIGHT / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale);
        
        // Title with better visibility
        this.add.text(SCREEN_WIDTH/2, 50, 'Dark Cave', {
            fontSize: '32px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Check if ogre is already defeated
        if (this.gameState.hasDefeatedEnemy('Cave Ogre')) {
            this.showVictoryState();
        } else {
            this.showBattleState();
        }

        // Return button
        this.createButton(150, 520, 'Exit Cave', () => {
            this.scene.start(SCENES.MOUNTAINS);
        });
    }

    showBattleState() {
        // Description with better visibility
        this.add.text(SCREEN_WIDTH/2, 120, 'A massive ogre guards the depths of the cave!', {
            fontSize: '16px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Ogre dialogue
        this.add.text(SCREEN_WIDTH/2, 160, '"GRAAHHH! Me Grognak the Terrible!\nMe guard shiny things for 500 years!"', {
            fontSize: '14px',
            fill: '#FFB6C1',
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2,
            fontStyle: 'italic'
        }).setOrigin(0.5);

        this.add.text(SCREEN_WIDTH/2, 200, '"Also... me very lonely. No one visit cave in decades.\nWait, are you here for treasure or just to chat?"', {
            fontSize: '12px',
            fill: '#FFB6C1',
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2,
            fontStyle: 'italic'
        }).setOrigin(0.5);

        // Ogre character image with animation
        const ogreChar = this.add.image(SCREEN_WIDTH/2, 300, 'ogre');
        ogreChar.setDisplaySize(150, 180); // Scale to larger, more imposing size
        
        // Add intimidating animation to the ogre
        this.animateOgre(ogreChar);
        
        // Add some visual effects to make the ogre more intimidating
        this.add.text(SCREEN_WIDTH/2, 220, '💀', { fontSize: '24px' }).setOrigin(0.5);
        this.add.text(SCREEN_WIDTH/2, 370, '⚔️', { fontSize: '24px' }).setOrigin(0.5);

        this.add.text(SCREEN_WIDTH/2, 400, 'Grognak the Terrible (& Lonely)', {
            fontSize: '20px',
            fill: '#ff6b6b',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Player dialogue options before battle
        this.add.text(SCREEN_WIDTH/2, 440, 'How do you respond to Grognak?', {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.createOgreDialogueButton(200, 480, '"500 years? That\'s\nquite a career commitment!"', () => {
            this.showOgreDialogue('"500 years? That\'s quite a career commitment! Don\'t you get vacation days?"');
        });

        this.createOgreDialogueButton(400, 480, '"Maybe we could just\nchat instead of fight?"', () => {
            this.showOgreDialogue('"Maybe we could just chat instead of fight? You seem like you need a friend more than a battle."');
        });

        this.createOgreDialogueButton(600, 480, '"Terrible AND Lonely?\nThat\'s a sad combination."', () => {
            this.showOgreDialogue('"Terrible AND Lonely? That\'s a sad combination. Have you considered online dating?"');
        });
    }

    showVictoryState() {
        // Description with better visibility
        this.add.text(SCREEN_WIDTH/2, 120, 'You have defeated the ogre!\nThe treasure chamber awaits beyond.', {
            fontSize: '16px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Defeated ogre
        this.add.text(SCREEN_WIDTH/2, 300, '💫', { fontSize: '96px' }).setOrigin(0.5);

        this.add.text(SCREEN_WIDTH/2, 380, 'Defeated Ogre', {
            fontSize: '24px',
            fill: '#4ecdc4',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Continue button
        this.createButton(650, 520, 'Enter Treasure Room', () => {
            this.scene.start(SCENES.TREASURE);
        });
    }

    attemptBattle() {
        const enemy = ENEMIES.OGRE;
        const hasRequiredItems = this.gameState.hasAllItems(enemy.requiredItems);

        if (hasRequiredItems) {
            this.showBattleResult(true);
        } else {
            this.showBattleResult(false);
        }
    }

    showBattleResult(victory) {
        // Clear existing content
        this.children.removeAll();
        
        // Background image
        const background = this.add.image(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'cave_bg');
        const scaleX = SCREEN_WIDTH / background.width;
        const scaleY = SCREEN_HEIGHT / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale);
        
        if (victory) {
            this.gameState.defeatEnemy('Cave Ogre');
            
            // Play victory heal sound
            this.sound.play('heal_sound', { volume: 0.7 });
            
            this.add.text(SCREEN_WIDTH/2, 200, 'VICTORY!', {
                fontSize: '48px',
                fill: '#4ecdc4',
                fontFamily: 'Arial'
            }).setOrigin(0.5);

            this.add.text(SCREEN_WIDTH/2, 280, 'The ogre falls to your superior equipment!\nThe way to treasure is clear!', {
                fontSize: '18px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                align: 'center'
            }).setOrigin(0.5);

            this.add.text(SCREEN_WIDTH/2, 350, '🏆', { fontSize: '64px' }).setOrigin(0.5);

            this.createButton(SCREEN_WIDTH/2, 450, 'Continue to Treasure', () => {
                this.scene.start(SCENES.TREASURE);
            });
        } else {
            this.add.text(SCREEN_WIDTH/2, 200, 'DEFEAT!', {
                fontSize: '48px',
                fill: '#ff6b6b',
                fontFamily: 'Arial'
            }).setOrigin(0.5);

            this.add.text(SCREEN_WIDTH/2, 280, 'The ogre is too powerful!\nYou need better equipment to win!', {
                fontSize: '18px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                align: 'center'
            }).setOrigin(0.5);

            this.add.text(SCREEN_WIDTH/2, 350, '💥', { fontSize: '64px' }).setOrigin(0.5);

            this.createButton(SCREEN_WIDTH/2, 450, 'Retreat', () => {
                this.scene.start(SCENES.MOUNTAINS);
            });
        }
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

    animateOgre(ogre) {
        // Create menacing heavy breathing animation
        this.tweens.add({
            targets: ogre,
            scaleX: ogre.scaleX + 0.02,
            scaleY: ogre.scaleY + 0.02,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Add intimidating side-to-side sway
        this.tweens.add({
            targets: ogre,
            x: ogre.x + 4,
            duration: 2500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Add slight vertical movement for weight shifting
        this.tweens.add({
            targets: ogre,
            y: ogre.y + 2,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Add subtle rotation for more dynamic presence
        this.tweens.add({
            targets: ogre,
            rotation: 0.015,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
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

    createOgreDialogueButton(x, y, text, callback) {
        const button = this.add.rectangle(x, y, 180, 35, 0x5D4E37)
            .setInteractive()
            .on('pointerdown', () => {
                this.sound.play('click_sound', { volume: 0.5 });
                callback();
            })
            .on('pointerover', () => button.setFillStyle(0x8B7355))
            .on('pointerout', () => button.setFillStyle(0x5D4E37));

        this.add.text(x, y, text, {
            fontSize: '12px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5);

        return button;
    }

    showOgreDialogue(dialogue) {
        // Clear existing content and show player's chosen dialogue
        this.children.removeAll();
        
        // Background image
        const background = this.add.image(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'cave_bg');
        const scaleX = SCREEN_WIDTH / background.width;
        const scaleY = SCREEN_HEIGHT / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale);
        
        // Title
        this.add.text(SCREEN_WIDTH/2, 50, 'Dark Cave', {
            fontSize: '32px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4
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

        // Ogre response
        this.add.text(SCREEN_WIDTH/2, 180, '"GRAAHHH! You... you actually want to talk?\nNo one ever want to talk to Grognak!\nBut... me still guard treasure! Sorry, new friend!"', {
            fontSize: '14px',
            fill: '#FFB6C1',
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3,
            fontStyle: 'italic'
        }).setOrigin(0.5);

        // Animated ogre
        const ogreChar = this.add.image(SCREEN_WIDTH/2, 300, 'ogre');
        ogreChar.setDisplaySize(150, 180);
        this.animateOgre(ogreChar);

        this.add.text(SCREEN_WIDTH/2, 220, '💀', { fontSize: '24px' }).setOrigin(0.5);
        this.add.text(SCREEN_WIDTH/2, 370, '⚔️', { fontSize: '24px' }).setOrigin(0.5);

        this.add.text(SCREEN_WIDTH/2, 400, 'Grognak the Terrible (& Lonely)', {
            fontSize: '20px',
            fill: '#ff6b6b',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Battle button
        this.createButton(SCREEN_WIDTH/2, 480, 'Fight Ogre', () => {
            this.attemptBattle();
        });

        // Return button
        this.createButton(150, 520, 'Exit Cave', () => {
            this.scene.start(SCENES.MOUNTAINS);
        });
    }
}