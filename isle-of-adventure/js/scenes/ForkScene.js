/*
 * Isle of Adventure - Web Edition
 * ForkScene.js
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

export default class ForkScene extends BaseScene {
    constructor() {
        super({ key: SCENES.FORK });
    }

    create() {
        this.setupScene();
        this.gameState.visitLocation('Fork');
        this.startGameMusic('serene_journey');
        this.setBackground('fork_bg');

        this.addTitle('The Fork in the Road');

        this.addText(SCREEN_WIDTH/2, 130,
            'The path splits three ways. A weathered signpost reads:\n' +
            '"Left: DOOM. Right: ALSO DOOM (sea breeze). Middle: flowers?? Suspicious."', 15);

        // Left: mountains (via the pass and the toll bridge)
        this.addText(210, 280, '⛰️', 52);
        this.addText(210, 350, 'The Mountain Road', 19);
        this.addText(210, 398, 'A fortified pass, a rickety\nbridge, and buried treasure.', 12, '#DDDDDD');
        this.createButton(210, 465, 'Take the Mountain Road', () => this.goTo(SCENES.MOUNTAIN_PASS), { width: 240 });

        // Middle: the meadow trail (optional wonders)
        this.addText(512, 280, '🌼', 52);
        this.addText(512, 350, 'The Meadow Trail', 19);
        this.addText(512, 398, 'Flowers, a fairy lake, and\nelves. Probably too peaceful.', 12, '#DDDDDD');
        this.createButton(512, 465, 'Wander the Meadow Trail', () => this.goTo(SCENES.MEADOW), {
            width: 240, color: 0x2C5F2D, hover: 0x4A7C59
        });

        // Right: the coast (via the raging river)
        this.addText(814, 280, '🌊', 52);
        this.addText(814, 350, 'The Coastal Path', 19);
        this.addText(814, 398, 'A raging river, a rocky shore,\nand things with tentacles.', 12, '#DDDDDD');
        this.createButton(814, 465, 'Follow the Coastal Path', () => this.goTo(SCENES.RIVER), { width: 240 });

        // Quest guidance
        const needGoblet = !this.gameState.hasItem('Golden Goblet');
        const needSea = !this.gameState.hasItem('Squid Eye') || !this.gameState.hasItem('Bottle of Rum');
        let hint = 'The mountain and the sea both hold something the sorcerer wants...';
        if (!needGoblet && needSea) hint = 'The goblet is yours — the sea still owes you two treasures.';
        if (needGoblet && !needSea) hint = 'The sea is conquered — the mountain still hides a golden prize.';
        if (!needGoblet && !needSea) hint = 'You have everything! The sorcerer\'s sign awaits in the village.';
        this.addText(SCREEN_WIDTH/2, 575, hint, 14, '#FFD97A');

        this.createButton(150, 700, '← Back to Forest', () => this.goTo(SCENES.FOREST), { width: 190 });
    }
}
