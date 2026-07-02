/*
 * Isle of Adventure - Web Edition
 * LakeScene.js
 *
 * The Fairy Lake — home of Lady Marina, Regional Manager of
 * Mystical Lakes (Interim). Sword distribution temporarily suspended.
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

export default class LakeScene extends BaseScene {
    constructor() {
        super({ key: SCENES.LAKE });
    }

    create() {
        this.setupScene();
        this.gameState.visitLocation('Fairy Lake');
        this.startGameMusic('run_to_dream');
        this.setBackground(['lake_bg', 'forest_bg']);
        this.addAmbient('sparkles');

        this.addTitle('The Fairy Lake');

        this.addText(SCREEN_WIDTH/2, 130,
            'Moonlight silvers the water. Swans drift in formation.\nOn a rock sits a figure combing her hair with what looks like a fork.', 15);

        this.addSpeech(SCREEN_WIDTH/2, 195,
            '"Greetings, traveler! Lady Marina — Regional Manager of Mystical Lakes.\nINTERIM manager," she adds bitterly. "The title\'s under review."', '#B8E2F2', 14);

        this.addText(SCREEN_WIDTH/2, 330, '🧜‍♀️ 🦢', 52);
        this.addText(SCREEN_WIDTH/2, 410, 'Lady Marina of the Lake (Interim)', 15, '#FFD97A');

        this.addText(SCREEN_WIDTH/2, 480, 'What do you ask the Lady of the Lake?', 15);

        this.createChoiceButton(210, 545, '"Aren\'t you supposed to\nhand out magic swords?"', () => {
            this.showExchange(
                '"Aren\'t you ladies-of-lakes supposed to hand out magic swords?"',
                '"We\'re OUT of swords," she snaps. "Supply chain. Some king\ntook the last one and never returned it. There\'s a WAITLIST.\nYou can have a commemorative spoon." The spoon is quite nice, honestly.'
            );
        }, 0x2C5F7A, 0x3E7BA6);

        this.createChoiceButton(512, 545, '"Any mystical wisdom\nfor my quest?"', () => {
            this.showExchange(
                '"Any mystical wisdom for my quest?"',
                'She gazes into the depths dramatically. "The sorcerer wants\nthree things... eye, rum, goblet..." A swan whispers to her.\n"Yes, thank you, Gerald\'s cousin. Also: the pirate captain\ncries when he loses at banter. Use this knowledge wisely."'
            );
        }, 0x2C5F7A, 0x3E7BA6);

        this.createChoiceButton(814, 545, '"Your swans are\nextremely well-organized."', () => {
            this.showExchange(
                '"Your swans are extremely well-organized."',
                'The swans preen in perfect synchronization. "Eleven years\nof formation training," Marina says proudly. "We do weddings."\nThe lead swan hands you a business card. It\'s just a wet leaf.'
            );
        }, 0x2C5F7A, 0x3E7BA6);

        this.createButton(150, 700, '← Back to the Meadow', () => this.goTo(SCENES.MEADOW), { width: 210 });
    }

    showExchange(playerLine, marinaReply) {
        this.clearScene();
        this.setBackground(['lake_bg', 'forest_bg']);
        this.addAmbient('sparkles');
        this.addTitle('The Fairy Lake');

        this.addSpeech(SCREEN_WIDTH/2, 140, playerLine, '#4ECDC4');
        this.addSpeech(SCREEN_WIDTH/2, 250, marinaReply, '#B8E2F2', 14);

        this.addText(SCREEN_WIDTH/2, 390, '🧜‍♀️ ✨', 52);

        if (!this.gameState.hasItem('Lucky Pebble')) {
            this.addSpeech(SCREEN_WIDTH/2, 470,
                '"Take this before you go." She presses a smooth stone into your hand.\n"A Lucky Pebble. Guaranteed 3% luckier. Results not mystical advice."', '#B8E2F2', 13);

            this.createButton(SCREEN_WIDTH/2, 560, '🪨 Accept the Lucky Pebble', () => {
                this.gameState.addItem('Lucky Pebble');
                this.sound.play('special_sound', { volume: 0.6 });
                this.game.events.emit('inventory-updated');
                this.celebrate(SCREEN_WIDTH/2, 510, 'Got the Lucky Pebble! (+3% luck, allegedly)', '#4ecdc4');
                this.time.delayedCall(1500, () => this.scene.restart());
            }, { width: 280, color: 0x2C5F7A, hover: 0x3E7BA6 });
        } else {
            this.addText(SCREEN_WIDTH/2, 490,
                'Your Lucky Pebble hums faintly near the water.\n"It remembers home," Marina says. "Also it needs charging. Kidding. Mostly."',
                13, '#DDDDDD');
        }

        this.createButton(150, 700, '← Back to the Meadow', () => this.goTo(SCENES.MEADOW), { width: 210 });
        this.createButton(874, 700, 'Ask something else', () => this.scene.restart(), { width: 200 });
    }
}
