/*
 * Isle of Adventure - Web Edition
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
import BaseScene from '../BaseScene.js';

export default class PirateIslandScene extends BaseScene {
    constructor() {
        super({ key: SCENES.PIRATE_ISLAND });
    }

    create() {
        this.setupScene();
        this.gameState.visitLocation('Pirate Island');
        this.startGameMusic('run_to_dream');
        this.setBackground('pirate_island_bg');
        this.addAmbient('embers');

        this.addTitle('Pirate Island');

        if (this.gameState.hasItem(ITEMS.RUM.name)) {
            this.showAfterParty();
            return;
        }

        this.addText(SCREEN_WIDTH/2, 135,
            'Pirates are having a beach party around a crackling fire.\n' +
            'One of them is grilling fish on a cutlass. Health code: unclear.', 16);

        // Party scenery
        this.addText(300, 300, '🏴‍☠️', 40);
        this.addText(512, 330, '🔥', 48);
        this.addText(724, 300, '🏴‍☠️', 40);
        this.addText(400, 370, '🧑‍🦱', 36);
        this.addText(620, 370, '🧔', 36);

        this.addText(SCREEN_WIDTH/2, 450, 'The pirates wave you over to the fire!', 17);

        this.addText(SCREEN_WIDTH/2, 520, 'What do you say to the pirates?', 15);

        this.createChoiceButton(210, 585, '"Ahoy! Mind if I crash\nyour beach party?"', () => {
            this.showExchange(
                '"Ahoy! Mind if I crash your beach party?\nI promise I won\'t steal your treasure... much."',
                '"HAR HAR! \'Much,\' the landlubber says!"\nThe crew roars with laughter. "Honesty! We like ye already.\nAny scallywag bold enough to ask gets a seat by the fire!"'
            );
        }, 0x8B4513, 0xA0522D);

        this.createChoiceButton(512, 585, '"Is this a pirate party\nor a cooking show?"', () => {
            this.showExchange(
                '"Is this a pirate party or a cooking show?\nWhere are the cannons and sword fights?"',
                '"It\'s a GRILLING show, ye uncultured barnacle!"\nThe cook waves his cutlass-spatula. "Cap\'n says we\'re\n\'rebranding.\' Piracy\'s a lifestyle brand now."'
            );
        }, 0x8B4513, 0xA0522D);

        this.createChoiceButton(814, 585, '"I\'ll join, but I don\'t\nknow any sea shanties."', () => {
            this.showExchange(
                '"I\'ll join, but I don\'t know any sea shanties.\nWill humming the Jeopardy theme work?"',
                '"The JEOPARDY theme?!" A hush falls...\nThen the whole crew hums it in perfect four-part harmony.\n"We watch a lot of telly between raids," one admits.'
            );
        }, 0x8B4513, 0xA0522D);

        this.createButton(150, 700, '← Back to Village', () => this.goTo(SCENES.VILLAGE), { width: 190 });
    }

    showExchange(playerLine, pirateReply) {
        this.clearScene();
        this.setBackground('pirate_island_bg');
        this.addAmbient('embers');
        this.addTitle('Pirate Island');

        this.addSpeech(SCREEN_WIDTH/2, 140, playerLine, '#4ECDC4');
        this.addSpeech(SCREEN_WIDTH/2, 235, pirateReply, '#F39C12');

        this.addText(300, 370, '🏴‍☠️', 40);
        this.addText(512, 390, '🔥', 48);
        this.addText(724, 370, '🏴‍☠️', 40);

        // The quest hook: rum lives at the base now
        this.addSpeech(SCREEN_WIDTH/2, 480,
            '"But if it\'s RUM ye be after..." — the crew leans in —\n' +
            '"the good stuff be locked in our secret base, guarded by\n' +
            'Cap\'n Barnacles and his fearsome WIT. Out-banter the Cap\'n,\nand the finest bottle be yours. Many have tried. Most cried."', '#F39C12', 14);

        this.createButton(SCREEN_WIDTH/2, 620, '🏴‍☠️ Sail to the Secret Base', () => this.goTo(SCENES.PIRATE_BASE), {
            width: 280, color: 0x8B4513, hover: 0xA0522D
        });
        this.createButton(150, 700, '← Back to Village', () => this.goTo(SCENES.VILLAGE), { width: 190 });
    }

    showAfterParty() {
        this.addText(SCREEN_WIDTH/2, 140,
            'The party is still going. The pirates cheer as you arrive —\n' +
            'you\'re a legend here now: "The One Who Out-Witted The Cap\'n!"', 16);

        this.addText(512, 330, '🔥', 56);
        this.addText(380, 380, '🏴‍☠️', 40);
        this.addText(644, 380, '🏴‍☠️', 40);
        this.addText(SCREEN_WIDTH/2, 460,
            'They\'ve already written a shanty about you.\nIt doesn\'t rhyme, but their hearts are in it.', 15, '#F39C12');

        this.createButton(SCREEN_WIDTH/2, 610, '🏴‍☠️ Visit the Secret Base', () => this.goTo(SCENES.PIRATE_BASE), {
            width: 260, color: 0x8B4513, hover: 0xA0522D
        });
        this.createButton(150, 700, '← Back to Village', () => this.goTo(SCENES.VILLAGE), { width: 190 });
    }
}
