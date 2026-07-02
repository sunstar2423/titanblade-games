/*
 * Isle of Adventure - Web Edition
 * ElfVillageScene.js
 *
 * The Elf Village — breathtaking treehouses, ethereal music, and
 * residents who are very graceful about how much better they are than you.
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

export default class ElfVillageScene extends BaseScene {
    constructor() {
        super({ key: SCENES.ELF_VILLAGE });
    }

    create() {
        this.setupScene();
        this.gameState.visitLocation('Elf Village');
        this.startGameMusic('run_to_dream');
        this.setBackground(['elf_village_bg', 'forest_bg']);
        this.addAmbient('fireflies');

        this.addTitle('The Elf Village');

        this.addText(SCREEN_WIDTH/2, 130,
            'Treehouses glow like lanterns in the ancient canopy. Rope bridges\narc between them. Somewhere, inevitably, a harp is playing.', 15);

        this.addSpeech(SCREEN_WIDTH/2, 195,
            'An elf glides down a spiral stair without touching it.\n"A human. How... rustic. Welcome, I suppose, to Aelenwood."', '#D8F0C8', 14);

        this.addText(SCREEN_WIDTH/2, 330, '🧝‍♂️ 🌳 🧝‍♀️', 48);
        this.addText(SCREEN_WIDTH/2, 410, 'Silvarel — Village Greeter (this century\'s rotation)', 15, '#FFD97A');

        this.addText(SCREEN_WIDTH/2, 480, 'What do you say to Silvarel?', 15);

        this.createChoiceButton(210, 545, '"Your village is\nabsolutely beautiful."', () => {
            this.showExchange(
                '"Your village is absolutely beautiful."',
                '"Yes," Silvarel agrees simply. A long pause. "Oh — you were\nexpecting modesty. How charming. We removed modesty from the\ncurriculum in the Third Age. It was slowing down the compliments."'
            );
        }, 0x2C5F2D, 0x4A7C59);

        this.createChoiceButton(512, 545, '"How do you get WiFi\nup in the trees?"', () => {
            this.showExchange(
                '"How do you get WiFi up in the trees?"',
                'Silvarel stares for a full thirty seconds.\n"We sing to the trees, and the trees remember everything."\nAnother pause. "It\'s better than WiFi. The trees don\'t buffer."'
            );
        }, 0x2C5F2D, 0x4A7C59);

        this.createChoiceButton(814, 545, '"I fought a squid and\nout-punned some trolls."', () => {
            this.showExchange(
                '"I fought a giant squid and out-punned several trolls to get here."',
                'The harp music stops. Every elf in earshot turns.\n"The BREAD one?" someone whispers from a treehouse.\nSilvarel composes himself. "The Queen will want to meet you."'
            );
        }, 0x2C5F2D, 0x4A7C59);

        this.createButton(150, 700, '← Back to the Meadow', () => this.goTo(SCENES.MEADOW), { width: 210 });
    }

    showExchange(playerLine, elfReply) {
        this.clearScene();
        this.setBackground(['elf_village_bg', 'forest_bg']);
        this.addAmbient('fireflies');
        this.addTitle('The Elf Village');

        this.addSpeech(SCREEN_WIDTH/2, 140, playerLine, '#4ECDC4');
        this.addSpeech(SCREEN_WIDTH/2, 245, elfReply, '#D8F0C8', 14);

        this.addText(SCREEN_WIDTH/2, 380, '🧝‍♂️ 🌳', 52);

        this.addSpeech(SCREEN_WIDTH/2, 460,
            '"Queen Elarwen holds court in the Great Palace. Mortals are\nadmitted on Tuesdays." He checks the sky. "You\'re in luck.\nBy elven reckoning, it has been Tuesday for eleven years."', '#D8F0C8', 13);

        this.createButton(SCREEN_WIDTH/2, 580, '👑 Visit the Elven Palace', () => this.goTo(SCENES.ELF_PALACE), {
            width: 260, color: 0x2C5F2D, hover: 0x4A7C59
        });
        this.createButton(150, 700, '← Back to the Meadow', () => this.goTo(SCENES.MEADOW), { width: 210 });
    }
}
