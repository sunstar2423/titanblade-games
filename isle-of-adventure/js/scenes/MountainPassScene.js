/*
 * Isle of Adventure - Web Edition
 * MountainPassScene.js
 *
 * The fortified Mountain Pass — Captain Doris of the Mountain Watch
 * guards the gate and dispenses warnings nobody asked for.
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

export default class MountainPassScene extends BaseScene {
    constructor() {
        super({ key: SCENES.MOUNTAIN_PASS });
    }

    create() {
        this.setupScene();
        const firstVisit = !this.gameState.hasVisitedLocation('Mountain Pass');
        this.gameState.visitLocation('Mountain Pass');
        this.startGameMusic('serene_journey');
        this.setBackground(['mountain_pass_bg', 'mountains_bg']);

        this.addTitle('The Mountain Pass');

        if (!firstVisit) {
            this.addText(SCREEN_WIDTH/2, 140,
                'The gate of the Mountain Watch. Captain Doris waves you through\nand points proudly at the VISITOR stamp on your hand.', 16);
            this.addSpeech(SCREEN_WIDTH/2, 210, '"Still valid! We honor the stamp. We\'re not ANIMALS."', '#B8D8FF');
            this.createButton(874, 700, 'Onward to the Bridge →', () => this.goTo(SCENES.TROLL_BRIDGE), { width: 240 });
            this.createButton(150, 700, '← Back to the Fork', () => this.goTo(SCENES.FORK), { width: 190 });
            return;
        }

        this.addText(SCREEN_WIDTH/2, 135,
            'A fortified gate straddles the mountain road, lanterns glowing\nagainst the snow. A guard in slightly-too-big armor flags you down.', 15);

        this.addSpeech(SCREEN_WIDTH/2, 205,
            '"HALT! Captain Doris, Mountain Watch. State your business!\nActually, don\'t bother — it\'s always \'treasure\'. You lot are so predictable."', '#B8D8FF', 14);

        this.addText(SCREEN_WIDTH/2, 330, '🏰⚔️', 56);
        this.addText(SCREEN_WIDTH/2, 410, 'Captain Doris — 14 years without a single interesting shift', 15, '#FFD97A');

        this.addText(SCREEN_WIDTH/2, 500, 'How do you reply?', 15);

        this.createChoiceButton(210, 565, '"Actually, it IS treasure.\nSorry to be predictable."', () => {
            this.showExchange(
                '"Actually, it IS treasure. Sorry to be predictable."',
                '"HA! Honesty! That\'s new." She stamps your hand: VISITOR.\n"Word of advice: the bridge ahead is run by trolls.\nThey take their toll in JOKES now. Long story. Bad one."'
            );
        }, 0x3b5b7a, 0x4f7aa3);

        this.createChoiceButton(512, 565, '"I\'m here to see the\nfamous mountain views."', () => {
            this.showExchange(
                '"I\'m here to see the famous mountain views."',
                '"A TOURIST?!" Doris tears up. "Fourteen years and finally\na TOURIST!" She stamps your hand twice. "The views are\nTHAT way. So is a troll bridge. Mind the trolls. And the gaps."'
            );
        }, 0x3b5b7a, 0x4f7aa3);

        this.createChoiceButton(814, 565, '"Is that armor a few\nsizes too big?"', () => {
            this.showExchange(
                '"Is that armor... a few sizes too big?"',
                '"It\'s my brother\'s!" she says with dignity. "Budget cuts.\nEven the SORCERER lost his \'Great\' title, you know."\nShe stamps your hand upside down out of spite. Fair.'
            );
        }, 0x3b5b7a, 0x4f7aa3);

        this.createButton(150, 700, '← Back to the Fork', () => this.goTo(SCENES.FORK), { width: 190 });
    }

    showExchange(playerLine, dorisReply) {
        this.clearScene();
        this.setBackground(['mountain_pass_bg', 'mountains_bg']);
        this.addTitle('The Mountain Pass');

        this.addSpeech(SCREEN_WIDTH/2, 140, playerLine, '#4ECDC4');
        this.addSpeech(SCREEN_WIDTH/2, 240, dorisReply, '#B8D8FF', 14);

        this.addText(SCREEN_WIDTH/2, 380, '🏰 ✅', 56);
        this.addText(SCREEN_WIDTH/2, 460,
            'The great gate creaks open. Somewhere above, a watchman\nslow-claps. It is unclear if he is being sincere.', 14, '#DDDDDD');

        this.createButton(SCREEN_WIDTH/2, 590, 'Through the gate →', () => this.goTo(SCENES.TROLL_BRIDGE), { width: 230 });
        this.createButton(150, 700, '← Back to the Fork', () => this.goTo(SCENES.FORK), { width: 190 });
    }
}
