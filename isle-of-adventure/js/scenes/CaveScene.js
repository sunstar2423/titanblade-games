/*
 * Isle of Adventure - Web Edition
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
import BaseScene from '../BaseScene.js';

export default class CaveScene extends BaseScene {
    constructor() {
        super({ key: SCENES.CAVE });
    }

    create() {
        this.setupScene();
        this.gameState.visitLocation('Cave');
        this.startGameMusic('serene_journey');
        this.setBackground('cave_bg');
        this.addAmbient('embers');

        this.addTitle('The Dark Cave');

        if (this.gameState.hasDefeatedEnemy('Cave Ogre')) {
            this.showVictoryState();
        } else {
            this.showEncounter();
        }

        this.createButton(150, 700, '← Exit the Cave', () => this.goTo(SCENES.MOUNTAINS), { width: 190 });
    }

    showEncounter() {
        this.addText(SCREEN_WIDTH/2, 130, 'A massive ogre lumbers out of the darkness!', 16);

        this.addSpeech(SCREEN_WIDTH/2, 185,
            '"GRAAHHH! Me Grognak the Terrible!\nMe guard shiny things for 500 years!"', '#FFB6C1');
        this.addSpeech(SCREEN_WIDTH/2, 235,
            '"Also... me very lonely. No visitors in decades.\nYou here for treasure, or... maybe chat first?"', '#FFB6C1', 13);

        this.spawnOgre(410);

        this.addText(SCREEN_WIDTH/2, 545, 'How do you respond to Grognak?', 15);

        this.createChoiceButton(210, 610, '"500 years? That\'s quite\nthe career commitment!"', () => {
            this.showExchange(
                '"500 years? That\'s quite the career commitment!\nDon\'t you get vacation days?"',
                '"Vacation... days?" Grognak\'s eyes go wide.\n"GROGNAK NEVER ASK ABOUT BENEFITS!\nGRAAHH! Now Grognak angry at whole HR department!"'
            );
        }, 0x5D4E37, 0x8B7355);

        this.createChoiceButton(512, 610, '"Maybe we could chat\ninstead of fight?"', () => {
            this.showExchange(
                '"Maybe we could just chat instead of fight?\nYou seem like you need a friend more than a battle."',
                '"You... WANT talk to Grognak?" A single tear falls.\n"Grognak love talk! But job is job, new friend.\nSmash first. Friendship after. Is company policy."'
            );
        }, 0x5D4E37, 0x8B7355);

        this.createChoiceButton(814, 610, '"Terrible AND lonely?\nRough combination."', () => {
            this.showExchange(
                '"Terrible AND lonely? That\'s a sad combination.\nHave you considered online dating?"',
                '"GROGNAK TRIED! Profile say: likes long walks,\nguarding treasure, collect skull. NO MATCHES.\n500 years! Maybe photo too intimidating?"'
            );
        }, 0x5D4E37, 0x8B7355);
    }

    showExchange(playerLine, ogreReply) {
        this.clearScene();
        this.setBackground('cave_bg');
        this.addAmbient('embers');
        this.addTitle('The Dark Cave');

        this.addSpeech(SCREEN_WIDTH/2, 140, playerLine, '#4ECDC4');
        this.addSpeech(SCREEN_WIDTH/2, 225, ogreReply, '#FFB6C1');

        this.spawnOgre(430);

        this.addText(SCREEN_WIDTH/2, 560,
            '"Anyway!" Grognak cracks his knuckles apologetically. "Is smash o\'clock."', 14, '#DDDDDD');

        this.createButton(SCREEN_WIDTH/2, 620, '⚔️ Fight Grognak!', () => this.attemptBattle(), { width: 230 });
        this.createButton(150, 700, '← Flee the Cave', () => this.goTo(SCENES.MOUNTAINS), { width: 190 });
    }

    attemptBattle() {
        const victory = this.gameState.hasAllItems(ENEMIES.OGRE.requiredItems);
        this.clearScene();
        this.setBackground('cave_bg');

        if (victory) {
            this.gameState.defeatEnemy('Cave Ogre');
            this.sound.play('heal_sound', { volume: 0.7 });

            this.addText(SCREEN_WIDTH/2, 200, 'VICTORY!', 52, '#4ecdc4', { fontStyle: 'bold' });
            this.addText(SCREEN_WIDTH/2, 310,
                'After a mighty battle, Grognak slumps against the wall, defeated.\n' +
                '"Good smashing, new friend," he wheezes, oddly proud.\n' +
                '"Treasure through there. Tell them Grognak sent you.\nIs just me here, but feels professional."', 16);
            this.addText(SCREEN_WIDTH/2, 440, '🏆', 64);

            this.createButton(SCREEN_WIDTH/2, 610, 'Enter the Treasure Room →', () => this.goTo(SCENES.TREASURE), { width: 270 });
        } else {
            this.addText(SCREEN_WIDTH/2, 200, 'DEFEAT!', 52, '#ff6b6b', { fontStyle: 'bold' });
            this.addText(SCREEN_WIDTH/2, 310,
                'Grognak wins the fight in one gentle shove.\n' +
                '"No hard feelings! Come back with bow, arrows and armor,"\nhe calls after you, waving. "GOOD HUSTLE THOUGH!"', 16);
            this.addText(SCREEN_WIDTH/2, 430, '💥', 64);

            this.createButton(SCREEN_WIDTH/2, 610, 'Retreat (with dignity)', () => this.goTo(SCENES.MOUNTAINS), { width: 240 });
        }
    }

    showVictoryState() {
        this.addText(SCREEN_WIDTH/2, 140,
            'Grognak waves cheerfully from a rocking chair.\n"New friend! Treasure still through there. Grognak on break."', 16);

        this.addText(SCREEN_WIDTH/2, 330, '💫', 84);
        this.addText(SCREEN_WIDTH/2, 430, 'The way to the treasure is open', 20, '#4ecdc4');

        this.createButton(874, 700, 'Treasure Room →', () => this.goTo(SCENES.TREASURE), { width: 210 });
    }

    spawnOgre(y) {
        const ogre = this.add.image(SCREEN_WIDTH/2, y, 'ogre');
        ogre.setDisplaySize(170, 205);
        this.animateCharacter(ogre, 2500, 4);
        // Heavy breathing
        this.tweens.add({
            targets: ogre, scaleX: ogre.scaleX * 1.03, scaleY: ogre.scaleY * 1.03,
            duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
        this.addText(SCREEN_WIDTH/2, y + 125, 'Grognak the Terrible (& Lonely)', 18, '#ff6b6b');
    }
}
