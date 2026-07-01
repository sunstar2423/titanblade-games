/*
 * Isle of Adventure - Web Edition
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
import BaseScene from '../BaseScene.js';

export default class SorcererScene extends BaseScene {
    constructor() {
        super({ key: SCENES.SORCERER });
    }

    create() {
        this.setupScene();
        this.gameState.visitLocation('Sorcerer House');
        this.startGameMusic('run_to_dream');
        this.setBackground('sorcerer_bg');
        this.addAmbient('sparkles');

        this.addTitle("The Sorcerer's House", '#FFD700');

        if (this.gameState.hasVisitedLocation('Portal')) {
            this.showCompletionState();
        } else {
            this.showWelcomeState();
        }
    }

    showWelcomeState() {
        this.addText(SCREEN_WIDTH/2, 130,
            'Floating crystals light a room crammed with books, orbs,\nand at least one cauldron labelled "SOUP (probably)".', 15);

        this.addSpeech(SCREEN_WIDTH/2, 195,
            '"Welcome, brave adventurer! I am Merlin the Moderately Impressive.\n' +
            'I used to be \'the Great\', but... budget cuts. You understand."', '#DDA0DD', 14);

        const sorcerer = this.add.image(SCREEN_WIDTH/2, 370, 'sorcerer_char');
        sorcerer.setDisplaySize(200, 245);
        this.animateCharacter(sorcerer, 2600, 3);

        this.addText(SCREEN_WIDTH/2, 540, 'How do you greet the sorcerer?', 15);

        this.createChoiceButton(210, 605, '"Moderately Impressive?\nRefreshingly honest!"', () => {
            this.showExchange(
                '"Merlin the Moderately Impressive?\nI appreciate the honest branding. Very refreshing."',
                '"Honesty in advertising, my friend! The Wizard Council\nfined me TWICE for using \'the Great\' without a permit.\nMy cousin holds the trademark. Family dinners are tense."'
            );
        }, 0x6A0DAD, 0x8B32CC);

        this.createChoiceButton(512, 605, '"Budget cuts? In the\nmagic business?"', () => {
            this.showExchange(
                '"Budget cuts in the magic business?\nI knew the economy was rough, but even wizards?"',
                '"Even wizards! My crystal ball is on a payment plan.\nThe newt market has gone MAD. And don\'t get me started\non dragon insurance premiums after The Incident."'
            );
        }, 0x6A0DAD, 0x8B32CC);

        this.createChoiceButton(814, 605, '"Can you still do\nimpressive magic?"', () => {
            this.showExchange(
                '"Can you still do impressive magic tricks?\nOr only moderately impressive ones?"',
                '"I once turned a dragon into a slightly smaller dragon!"\nHe pauses, expectantly. "...That\'s harder than it sounds.\nThe dragon was VERY smug about it."'
            );
        }, 0x6A0DAD, 0x8B32CC);

        this.createButton(150, 700, '← Back to Village', () => this.goTo(SCENES.VILLAGE), { width: 190 });
    }

    showExchange(playerLine, merlinReply) {
        this.clearScene();
        this.setBackground('sorcerer_bg');
        this.addAmbient('sparkles');
        this.addTitle("The Sorcerer's House", '#FFD700');

        this.addSpeech(SCREEN_WIDTH/2, 130, playerLine, '#4ECDC4');
        this.addSpeech(SCREEN_WIDTH/2, 220, merlinReply, '#DDA0DD');

        const sorcerer = this.add.image(SCREEN_WIDTH/2, 400, 'sorcerer_char');
        sorcerer.setDisplaySize(180, 220);
        this.animateCharacter(sorcerer, 2600, 3);

        this.showQuestContent();
    }

    showQuestContent() {
        const hasSquidEye = this.gameState.hasItem(ITEMS.SQUID_EYE.name);
        const hasRum = this.gameState.hasItem(ITEMS.RUM.name);
        const hasGoblet = this.gameState.hasItem(ITEMS.GOBLET.name);

        if (hasSquidEye && hasRum && hasGoblet) {
            this.addSpeech(SCREEN_WIDTH/2, 545,
                '"Marvellous! The three sacred ingredients! Squid Eye for wisdom,\n' +
                'Rum for courage, and the Goblet for... well, holding the rum."', '#FFFFFF', 14);

            this.createButton(SCREEN_WIDTH/2, 625, '✨ Begin the Ritual', () => this.performRitual(), {
                width: 250, color: 0x2C1810, hover: 0x3D2017
            });
        } else {
            const missing = [];
            if (!hasSquidEye) missing.push('the Squid Eye (out at sea)');
            if (!hasRum) missing.push('the Bottle of Rum (pirates have it)');
            if (!hasGoblet) missing.push('the Golden Goblet (under the mountain)');

            this.addSpeech(SCREEN_WIDTH/2, 540,
                '"For the portal spell I need three very specific things..."', '#FFFFFF', 14);
            this.addText(SCREEN_WIDTH/2, 590, `Still missing: ${missing.join(', ')}`, 13, '#ff8f8f');
        }

        this.createButton(150, 700, '← Back to Village', () => this.goTo(SCENES.VILLAGE), { width: 190 });
    }

    performRitual() {
        this.clearScene();
        this.setBackground('sorcerer_bg');
        this.addAmbient('sparkles');

        this.addTitle('The Ritual', '#FFD700');

        this.addSpeech(SCREEN_WIDTH/2, 160,
            '"Now for the ancient ritual!" *dramatic pose*\n' +
            '"Step one: pour rum into goblet. Step two: add squid eye.\n' +
            'Step three: try very hard not to think about how gross that is."', '#DDA0DD', 14);

        const sorcerer = this.add.image(SCREEN_WIDTH/2, 340, 'sorcerer_char');
        sorcerer.setDisplaySize(140, 170);
        this.animateCharacter(sorcerer, 1800, 5);

        this.addText(362, 460, '🏆', 40);
        this.addText(512, 460, '🍾', 40);
        this.addText(662, 460, '👁️', 40);

        const sparkleText = this.addText(SCREEN_WIDTH/2, 520, '✨ ✨ ✨', 36);
        this.tweens.add({ targets: sparkleText, alpha: 0.2, duration: 500, yoyo: true, repeat: -1 });

        this.sound.play('special_sound', { volume: 0.7 });

        this.addSpeech(SCREEN_WIDTH/2, 580,
            '"TA-DA! The portal spell worked!" *whispers* "I was only 60% sure it would."\n' +
            '"You are officially worthy! Your door home awaits!"', '#FFFFFF', 14);

        this.gameState.visitLocation('Portal');

        this.createButton(SCREEN_WIDTH/2, 660, 'Enter the Portal Room →', () => this.goTo(SCENES.PORTAL), {
            width: 260, color: 0x2C1810, hover: 0x3D2017
        });
    }

    showCompletionState() {
        this.addText(SCREEN_WIDTH/2, 200, 'The ritual is complete!', 26, '#FFD700');
        this.addSpeech(SCREEN_WIDTH/2, 270,
            '"The portal\'s still warm! Off you go — and do leave\na five-star review for \'Merlin\'s Moderately Magical Services\'!"', '#DDA0DD');

        const sorcerer = this.add.image(SCREEN_WIDTH/2, 430, 'sorcerer_char');
        sorcerer.setDisplaySize(180, 220);
        this.animateCharacter(sorcerer, 2600, 3);

        this.createButton(SCREEN_WIDTH/2, 630, 'Enter the Portal Room →', () => this.goTo(SCENES.PORTAL), {
            width: 260, color: 0x2C1810, hover: 0x3D2017
        });
        this.createButton(150, 700, '← Back to Village', () => this.goTo(SCENES.VILLAGE), { width: 190 });
    }
}
