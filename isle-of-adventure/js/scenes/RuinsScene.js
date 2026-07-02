/*
 * Isle of Adventure - Web Edition
 * RuinsScene.js
 *
 * The Whispering Ruins — remains of the civilization that built the
 * village portal. Guarded by a stone door with outdated riddles
 * and a chip on its shoulder.
 *
 * Copyright (c) 2025 TitanBlade Games
 *
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 *
 * https://github.com/sunstar2423/titanblade-games
 */

import { SCREEN_WIDTH, SCREEN_HEIGHT, SCENES } from '../GameData.js';
import BaseScene from '../BaseScene.js';

export default class RuinsScene extends BaseScene {
    constructor() {
        super({ key: SCENES.RUINS });
    }

    create() {
        this.setupScene();
        this.gameState.visitLocation('Island Ruins');
        this.startGameMusic('run_to_dream');
        this.setBackground(['ruins_bg', 'pirate_island_bg']);
        this.addAmbient('fireflies');

        this.addTitle('The Whispering Ruins');

        if (this.gameState.hasItem('Ancient Coin')) {
            this.showSolvedState();
            return;
        }

        this.addText(SCREEN_WIDTH/2, 130,
            'Vine-wrapped towers crumble above a forgotten dock. The pirates\nrefuse to come here. "Bad vibes," they said. "Five stars though."', 15);

        this.addSpeech(SCREEN_WIDTH/2, 195,
            'As you approach, a great stone door rumbles awake:\n"HALT, SEEKER. ANSWER MY RIDDLE OR REMAIN OUTSIDE,\nWHICH HONESTLY IS MOST OF WHAT HAPPENS THESE DAYS."', '#C8C8A8', 13);

        this.addText(SCREEN_WIDTH/2, 320, '🚪🗿', 56);

        this.addSpeech(SCREEN_WIDTH/2, 410,
            '"I have KEYS but open no locks. I have SPACE but no room.\nYou can ENTER, but you cannot go inside. WHAT AM I?"', '#FFE9A8', 15);

        this.addText(SCREEN_WIDTH/2, 490, 'Answer the door...', 15);

        this.createChoiceButton(210, 555, '"A piano!"', () => {
            this.answerRiddle(false,
                '"A piano!"',
                '"...The answer I WROTE was piano," the door admits, "but I\nupdated the riddle in the Fourth Age to stay relevant. Try again.\nThink MODERN. I\'m a very modern door."'
            );
        }, 0x6b5a3e, 0x8a7550);

        this.createChoiceButton(512, 555, '"A keyboard!"', () => {
            this.answerRiddle(true,
                '"A keyboard!"',
                'The door rumbles approvingly. "CORRECT! Finally! Do you know\nhow long I\'ve waited for someone to get the updated version?\nThe pirates kept answering \'RUM\'. For EVERYTHING."'
            );
        }, 0x6b5a3e, 0x8a7550);

        this.createChoiceButton(814, 555, '"...Rum?"', () => {
            this.answerRiddle(false,
                '"...Rum?"',
                'The door SIGHS — dust falls from the towers.\n"You\'ve been spending time with the pirates. NO. Not rum.\nNothing is ever rum. Compose yourself and try again."'
            );
        }, 0x6b5a3e, 0x8a7550);

        this.createButton(150, 700, '← Back to Pirate Island', () => this.goTo(SCENES.PIRATE_ISLAND), { width: 220 });
    }

    answerRiddle(correct, playerLine, doorReply) {
        this.clearScene();
        this.setBackground(['ruins_bg', 'pirate_island_bg']);
        this.addAmbient('fireflies');

        if (!correct) {
            this.addTitle('The Door Is Unimpressed');
            this.addSpeech(SCREEN_WIDTH/2, 160, playerLine, '#4ECDC4');
            this.addSpeech(SCREEN_WIDTH/2, 270, doorReply, '#C8C8A8', 14);
            this.addText(SCREEN_WIDTH/2, 400, '🚪😑', 56);
            this.createButton(SCREEN_WIDTH/2, 560, '↩ Try the riddle again', () => this.scene.restart(), { width: 240 });
            this.createButton(150, 700, '← Back to Pirate Island', () => this.goTo(SCENES.PIRATE_ISLAND), { width: 220 });
            return;
        }

        this.sound.play('heal_sound', { volume: 0.6 });
        this.gameState.addItem('Ancient Coin');
        this.game.events.emit('inventory-updated');

        this.addTitle('The Door Opens!', '#7CFC90');
        this.addSpeech(SCREEN_WIDTH/2, 150, playerLine, '#4ECDC4');
        this.addSpeech(SCREEN_WIDTH/2, 250, doorReply, '#C8C8A8', 14);

        this.addText(SCREEN_WIDTH/2, 360, '🪙', 64);
        const msg = this.addText(SCREEN_WIDTH/2, 300, '✨ ANCIENT COIN OBTAINED! ✨', 26, '#FFD700', { fontStyle: 'bold' });
        this.tweens.add({ targets: msg, alpha: 0.35, duration: 800, yoyo: true, repeat: 3 });

        this.addText(SCREEN_WIDTH/2, 450,
            'Inside, faded murals show robed figures building a swirling gateway —\nthe PORTAL from the village! These were the Portal Makers.\nThe last mural shows them stepping through, waving goodbye.\nThe very last one shows a duck. Historians remain puzzled.', 14, '#FFE9A8');

        this.createButton(SCREEN_WIDTH/2, 610, '← Back to Pirate Island', () => this.goTo(SCENES.PIRATE_ISLAND), { width: 240 });
    }

    showSolvedState() {
        this.addText(SCREEN_WIDTH/2, 140,
            'The stone door stands open. It brightens as you approach —\nas much as a door can brighten.', 16);

        this.addSpeech(SCREEN_WIDTH/2, 220,
            '"KEYBOARD FRIEND! Come in, come in. Mind the rubble.\nI\'d tidy up, but — " the door gestures at itself " — door."', '#C8C8A8', 14);

        this.addText(SCREEN_WIDTH/2, 340, '🚪🪙✨', 56);
        this.addText(SCREEN_WIDTH/2, 430,
            'The murals of the Portal Makers glow softly. Your Ancient Coin\nwarms in your pocket, like it knows it\'s home.', 14, '#FFE9A8');

        this.createButton(SCREEN_WIDTH/2, 590, '← Back to Pirate Island', () => this.goTo(SCENES.PIRATE_ISLAND), { width: 240 });
    }
}
