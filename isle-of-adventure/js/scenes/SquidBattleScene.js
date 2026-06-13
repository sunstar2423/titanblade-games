/*
 * Battle of the Druids - Web Edition
 * SquidBattleScene.js
 * 
 * Copyright (c) 2025 TitanBlade Games
 * 
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 * 
 * https://github.com/sunstar2423/titanblade-games
 */

import { SCREEN_WIDTH, SCREEN_HEIGHT, SCENES, ENEMIES, ITEMS } from '../GameData.js';

export default class SquidBattleScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.SQUID_BATTLE });
    }

    create() {
        this.gameState = this.registry.get('gameState');
        this.gameState.visitLocation('Squid Battle');
        
        // Start serene journey music
        this.startGameMusic('serene_journey');
        
        // Background image
        const background = this.add.image(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'squid_battle_bg');
        const scaleX = SCREEN_WIDTH / background.width;
        const scaleY = SCREEN_HEIGHT / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale);
        
        // Title
        this.add.text(SCREEN_WIDTH/2, 50, 'Giant Squid Battle!', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Check if squid is already defeated
        if (this.gameState.hasDefeatedEnemy('Giant Squid')) {
            this.showVictoryState();
        } else {
            this.showBattleState();
        }

        // Return button
        this.createButton(150, 520, 'Retreat to Shore', () => {
            this.scene.start(SCENES.SHORE);
        });
    }

    showBattleState() {
        // Description
        this.add.text(SCREEN_WIDTH/2, 120, 'The massive squid wraps its tentacles around the boat!\nYou must defend yourself!', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(SCREEN_WIDTH/2, 300, 'Giant Squid', {
            fontSize: '32px',
            fill: '#ff6b6b',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Player dialogue options before battle
        this.add.text(SCREEN_WIDTH/2, 350, 'What do you shout at the giant squid?', {
            fontSize: '14px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.createSquidDialogueButton(200, 400, '"Hey! I didn\'t order\ncalamari today!"', () => {
            this.showSquidDialogue('"Hey! I didn\'t order calamari today! Take your tentacles elsewhere!"');
        });

        this.createSquidDialogueButton(400, 400, '"Eight arms and you still\ncan\'t give a proper hug?"', () => {
            this.showSquidDialogue('"Eight arms and you still can\'t give a proper hug? What\'s the point of all those tentacles?"');
        });

        this.createSquidDialogueButton(600, 400, '"I\'ve seen bigger squids\nin my bathtub!"', () => {
            this.showSquidDialogue('"I\'ve seen bigger squids in my bathtub! You\'re more like a medium-sized squid at best!"');
        });
    }

    showVictoryState() {
        // Description
        this.add.text(SCREEN_WIDTH/2, 120, 'You have defeated the giant squid!\nIts magical eye floats to the surface.', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5);

        // Auto-collect squid eye
        this.autoCollectSquidEye();

        // Continue button
        this.createButton(650, 520, 'Continue Journey', () => {
            this.scene.start(SCENES.PIRATE_ISLAND);
        });
    }

    autoCollectSquidEye() {
        const eyeName = ITEMS.SQUID_EYE.name;
        
        if (this.gameState.hasItem(eyeName)) {
            // Eye already taken
            this.add.text(SCREEN_WIDTH/2, 300, '✓', { fontSize: '64px', fill: '#4ecdc4' }).setOrigin(0.5);
            this.add.text(SCREEN_WIDTH/2, 380, 'Squid Eye Already Collected', { 
                fontSize: '16px', 
                fill: '#4ecdc4',
                fontFamily: 'Arial',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);
        } else {
            // Auto-collect the squid eye
            this.gameState.addItem(ITEMS.SQUID_EYE.name);
            
            // Play special pickup sound
            this.sound.play('special_sound', { volume: 0.6 });
            
            this.game.events.emit('inventory-updated');
            
            // Show squid eye and collection message
            this.add.text(SCREEN_WIDTH/2, 300, '👁️', { fontSize: '64px' }).setOrigin(0.5);
            
            const message = this.add.text(SCREEN_WIDTH/2, 250, 'You obtained the Magical Squid Eye!', {
                fontSize: '20px',
                fill: '#4ECDC4',
                fontFamily: 'Arial',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5);

            this.add.text(SCREEN_WIDTH/2, 380, 'Squid Eye Collected!', { 
                fontSize: '16px', 
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

    collectSquidEye(sprite) {
        this.gameState.addItem(ITEMS.SQUID_EYE.name);
        
        // Play special pickup sound
        this.sound.play('special_sound', { volume: 0.6 });
        
        // Update inventory display
        this.game.events.emit('inventory-updated');
        
        // Show collection message
        const message = this.add.text(SCREEN_WIDTH/2, 250, 'You obtained the Squid Eye!', {
            fontSize: '18px',
            fill: '#4ecdc4',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Replace sprite with checkmark
        sprite.destroy();
        this.add.text(SCREEN_WIDTH/2, 300, '✓', { fontSize: '64px', fill: '#4ecdc4' }).setOrigin(0.5);
        this.add.text(SCREEN_WIDTH/2, 380, 'Squid Eye Collected', { 
            fontSize: '18px', 
            fill: '#4ecdc4',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Remove message after 3 seconds
        this.time.delayedCall(3000, () => {
            if (message) message.destroy();
        });
    }

    attemptBattle() {
        const enemy = ENEMIES.GIANT_SQUID;
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
        const background = this.add.image(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'squid_battle_bg');
        const scaleX = SCREEN_WIDTH / background.width;
        const scaleY = SCREEN_HEIGHT / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale);
        
        if (victory) {
            this.gameState.defeatEnemy('Giant Squid');
            
            // Play victory heal sound
            this.sound.play('heal_sound', { volume: 0.7 });
            
            this.add.text(SCREEN_WIDTH/2, 200, 'VICTORY!', {
                fontSize: '48px',
                fill: '#4ecdc4',
                fontFamily: 'Arial'
            }).setOrigin(0.5);

            this.add.text(SCREEN_WIDTH/2, 280, 'Your weapons prove effective against the beast!\nThe squid retreats to the depths!', {
                fontSize: '18px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                align: 'center'
            }).setOrigin(0.5);

            this.add.text(SCREEN_WIDTH/2, 350, '🏆', { fontSize: '64px' }).setOrigin(0.5);

            this.createButton(SCREEN_WIDTH/2, 450, 'Continue', () => {
                this.showVictoryState();
            });
        } else {
            this.add.text(SCREEN_WIDTH/2, 200, 'DEFEAT!', {
                fontSize: '48px',
                fill: '#ff6b6b',
                fontFamily: 'Arial'
            }).setOrigin(0.5);

            this.add.text(SCREEN_WIDTH/2, 280, 'The squid is too powerful!\nYou need weapons to fight it!', {
                fontSize: '18px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                align: 'center'
            }).setOrigin(0.5);

            this.add.text(SCREEN_WIDTH/2, 350, '💨', { fontSize: '64px' }).setOrigin(0.5);

            this.createButton(SCREEN_WIDTH/2, 450, 'Retreat', () => {
                this.scene.start(SCENES.SHORE);
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

    createSquidDialogueButton(x, y, text, callback) {
        const button = this.add.rectangle(x, y, 180, 35, 0x1B4F72)
            .setInteractive()
            .on('pointerdown', () => {
                this.sound.play('click_sound', { volume: 0.5 });
                callback();
            })
            .on('pointerover', () => button.setFillStyle(0x2E86C1))
            .on('pointerout', () => button.setFillStyle(0x1B4F72));

        this.add.text(x, y, text, {
            fontSize: '12px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5);

        return button;
    }

    showSquidDialogue(dialogue) {
        // Clear existing content and show player's chosen dialogue
        this.children.removeAll();
        
        // Background image
        const background = this.add.image(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'squid_battle_bg');
        const scaleX = SCREEN_WIDTH / background.width;
        const scaleY = SCREEN_HEIGHT / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale);
        
        // Title
        this.add.text(SCREEN_WIDTH/2, 50, 'Giant Squid Battle!', {
            fontSize: '32px',
            fill: '#ffffff',
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

        // Squid response
        this.add.text(SCREEN_WIDTH/2, 200, '*Angry squid noises intensify*\n*Splashes water aggressively*\n*Waves tentacles menacingly*', {
            fontSize: '14px',
            fill: '#FF6B6B',
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3,
            fontStyle: 'italic'
        }).setOrigin(0.5);

        this.add.text(SCREEN_WIDTH/2, 300, 'Giant Squid', {
            fontSize: '24px',
            fill: '#ff6b6b',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Battle button
        this.createButton(SCREEN_WIDTH/2, 400, 'Attack!', () => {
            this.attemptBattle();
        });

        // Return button
        this.createButton(150, 520, 'Retreat to Shore', () => {
            this.scene.start(SCENES.SHORE);
        });
    }
}