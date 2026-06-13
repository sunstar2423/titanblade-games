/*
 * Battle of the Druids - Web Edition
 * ForestScene.js
 * 
 * Copyright (c) 2025 TitanBlade Games
 * 
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 * 
 * https://github.com/sunstar2423/titanblade-games
 */

import { SCREEN_WIDTH, SCREEN_HEIGHT, SCENES, ENEMIES } from '../GameData.js';

export default class ForestScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.FOREST });
    }

    create() {
        this.gameState = this.registry.get('gameState');
        this.gameState.visitLocation('Forest');
        
        // Start serene journey music
        this.startGameMusic('serene_journey');
        
        // Background image
        const background = this.add.image(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'forest_bg');
        const scaleX = SCREEN_WIDTH / background.width;
        const scaleY = SCREEN_HEIGHT / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale);
        
        // Title with better visibility
        this.add.text(SCREEN_WIDTH/2, 50, 'Dark Forest', {
            fontSize: '32px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Check if trolls are already defeated
        if (this.gameState.hasDefeatedEnemy('Forest Trolls')) {
            this.showVictoryState();
        } else {
            this.showBattleState();
        }

        // Return to village button
        this.createButton(150, 520, 'Return to Village', () => {
            this.scene.start(SCENES.VILLAGE);
        });
    }

    showBattleState() {
        // Description with better visibility
        this.add.text(SCREEN_WIDTH/2, 120, 'Three menacing forest trolls block your path!', {
            fontSize: '16px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Troll dialogue with improved readability
        this.add.text(SCREEN_WIDTH/2, 160, '"Halt, tiny human! We are the legendary Troll Brothers:\nBrute, Brute Jr., and... uh... Steve."', {
            fontSize: '15px',
            fill: '#FFFF99',
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3,
            fontStyle: 'italic',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        this.add.text(SCREEN_WIDTH/2, 200, '"Steve here forgot to bring his intimidating name today!"', {
            fontSize: '13px',
            fill: '#FFFF99',
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3,
            fontStyle: 'italic',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // Troll representations using actual character images with animations
        const troll1 = this.add.image(250, 300, 'troll1');
        troll1.setDisplaySize(80, 100); // Scale to appropriate size
        this.add.text(250, 360, 'Brute', { fontSize: '12px', fill: '#FFFFFF', fontFamily: 'Arial', stroke: '#000000', strokeThickness: 2 }).setOrigin(0.5);
        
        const troll2 = this.add.image(400, 300, 'troll2');
        troll2.setDisplaySize(80, 100); // Scale to appropriate size
        this.add.text(400, 360, 'Brute Jr.', { fontSize: '12px', fill: '#FFFFFF', fontFamily: 'Arial', stroke: '#000000', strokeThickness: 2 }).setOrigin(0.5);
        
        const troll3 = this.add.image(550, 300, 'troll3');
        troll3.setDisplaySize(80, 100); // Scale to appropriate size
        this.add.text(550, 360, 'Steve', { fontSize: '12px', fill: '#FFFFFF', fontFamily: 'Arial', stroke: '#000000', strokeThickness: 2 }).setOrigin(0.5);

        // Add subtle breathing/swaying animations to trolls
        this.animateTroll(troll1, 2000, 3); // Slow, menacing sway
        this.animateTroll(troll2, 1800, 2); // Slightly faster, smaller movement
        this.animateTroll(troll3, 2200, 2.5); // Different timing for variety

        this.add.text(SCREEN_WIDTH/2, 390, 'The Troll Brothers (& Steve)', {
            fontSize: '18px',
            fill: '#ff6b6b',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Player dialogue options before battle
        this.add.text(SCREEN_WIDTH/2, 440, 'What do you say to the trolls?', {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.createDialogueButton(200, 470, '"Wait, Steve? That\'s your\nintimidating troll name?"', () => {
            this.showPlayerDialogue('"Wait, Steve? That\'s your intimidating troll name? Did you forget to renew your scary name license?"');
        });

        this.createDialogueButton(400, 470, '"Three against one?\nThat seems fair... for you."', () => {
            this.showPlayerDialogue('"Three against one? That seems fair... for you. I like those odds!"');
        });

        this.createDialogueButton(600, 470, '"I\'ve heard scarier names\nat a knitting circle."', () => {
            this.showPlayerDialogue('"I\'ve heard scarier names at a knitting circle. Seriously, Steve? What\'s next, Bob the Terrible?"');
        });
    }

    showVictoryState() {
        // Description with better visibility
        this.add.text(SCREEN_WIDTH/2, 120, 'You have defeated the forest trolls!\nThe path ahead is now clear.', {
            fontSize: '16px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Defeated trolls
        this.add.text(250, 300, '💀', { fontSize: '48px' }).setOrigin(0.5);
        this.add.text(400, 300, '💀', { fontSize: '48px' }).setOrigin(0.5);
        this.add.text(550, 300, '💀', { fontSize: '48px' }).setOrigin(0.5);

        this.add.text(SCREEN_WIDTH/2, 380, 'Defeated Trolls', {
            fontSize: '20px',
            fill: '#4ecdc4',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Continue button
        this.createButton(650, 500, 'Continue Path', () => {
            this.scene.start(SCENES.FORK);
        });
    }

    attemptBattle() {
        const enemy = ENEMIES.FOREST_TROLLS;
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
        const background = this.add.image(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'forest_bg');
        const scaleX = SCREEN_WIDTH / background.width;
        const scaleY = SCREEN_HEIGHT / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale);
        
        if (victory) {
            this.gameState.defeatEnemy('Forest Trolls');
            
            // Play victory heal sound
            this.sound.play('heal_sound', { volume: 0.7 });
            
            this.add.text(SCREEN_WIDTH/2, 200, 'VICTORY!', {
                fontSize: '48px',
                fill: '#4ecdc4',
                fontFamily: 'Arial'
            }).setOrigin(0.5);

            this.add.text(SCREEN_WIDTH/2, 280, 'Your bow, arrows, and armor proved effective!\nThe forest trolls have been defeated!', {
                fontSize: '18px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                align: 'center'
            }).setOrigin(0.5);

            this.add.text(SCREEN_WIDTH/2, 350, '🏆', { fontSize: '64px' }).setOrigin(0.5);

            this.createButton(SCREEN_WIDTH/2, 450, 'Continue', () => {
                this.scene.start(SCENES.FORK);
            });
        } else {
            this.add.text(SCREEN_WIDTH/2, 200, 'DEFEAT!', {
                fontSize: '48px',
                fill: '#ff6b6b',
                fontFamily: 'Arial'
            }).setOrigin(0.5);

            this.add.text(SCREEN_WIDTH/2, 280, 'You are not prepared for this battle!\nYou need: Bow, Arrows, and Leather Armor', {
                fontSize: '18px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                align: 'center'
            }).setOrigin(0.5);

            this.add.text(SCREEN_WIDTH/2, 350, '💀', { fontSize: '64px' }).setOrigin(0.5);

            this.createButton(SCREEN_WIDTH/2, 450, 'Retreat to Village', () => {
                this.scene.start(SCENES.VILLAGE);
            });
        }
    }

    createButton(x, y, text, callback) {
        const button = this.add.rectangle(x, y, 200, 40, 0x34495e)
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

    animateTroll(troll, duration, distance) {
        // Create subtle swaying animation
        this.tweens.add({
            targets: troll,
            x: troll.x + distance,
            duration: duration,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Add slight vertical breathing motion
        this.tweens.add({
            targets: troll,
            y: troll.y + 1,
            duration: duration * 0.7,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Add subtle rotation for more realism
        this.tweens.add({
            targets: troll,
            rotation: 0.02,
            duration: duration * 1.2,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createDialogueButton(x, y, text, callback) {
        const button = this.add.rectangle(x, y, 180, 35, 0x2C5F2D)
            .setInteractive()
            .on('pointerdown', () => {
                this.sound.play('click_sound', { volume: 0.5 });
                callback();
            })
            .on('pointerover', () => button.setFillStyle(0x4A7C59))
            .on('pointerout', () => button.setFillStyle(0x2C5F2D));

        this.add.text(x, y, text, {
            fontSize: '12px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5);

        return button;
    }

    showPlayerDialogue(dialogue) {
        // Clear existing content and show player's chosen dialogue
        this.children.removeAll();
        
        // Background image
        const background = this.add.image(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'forest_bg');
        const scaleX = SCREEN_WIDTH / background.width;
        const scaleY = SCREEN_HEIGHT / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale);
        
        // Title
        this.add.text(SCREEN_WIDTH/2, 50, 'Dark Forest', {
            fontSize: '32px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Player dialogue
        this.add.text(SCREEN_WIDTH/2, 150, dialogue, {
            fontSize: '16px',
            fill: '#4ECDC4',
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3,
            fontStyle: 'italic'
        }).setOrigin(0.5);

        // Troll response
        this.add.text(SCREEN_WIDTH/2, 220, '"Grrrr! Steve angry now! No make fun of Steve\'s name!\nSteve picked it himself from baby name book!"', {
            fontSize: '14px',
            fill: '#FFFF99',
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3,
            fontStyle: 'italic'
        }).setOrigin(0.5);

        // Show animated trolls
        const troll1 = this.add.image(250, 320, 'troll1');
        troll1.setDisplaySize(80, 100);
        const troll2 = this.add.image(400, 320, 'troll2');
        troll2.setDisplaySize(80, 100);
        const troll3 = this.add.image(550, 320, 'troll3');
        troll3.setDisplaySize(80, 100);

        this.animateTroll(troll1, 2000, 3);
        this.animateTroll(troll2, 1800, 2);
        this.animateTroll(troll3, 2200, 2.5);

        // Battle button
        this.createButton(SCREEN_WIDTH/2, 450, 'Fight Trolls', () => {
            this.attemptBattle();
        });

        // Return button
        this.createButton(150, 520, 'Return to Village', () => {
            this.scene.start(SCENES.VILLAGE);
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
}