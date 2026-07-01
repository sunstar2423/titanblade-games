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

        this.addText(SCREEN_WIDTH/2, 135,
            'The path splits in two. A weathered signpost reads:\n' +
            '"Left: DOOM. Right: ALSO DOOM (but with a nice sea breeze)."', 16);

        // Left: mountains
        this.addText(300, 300, '⛰️', 56);
        this.addText(300, 375, 'The Mountain Path', 20, '#FFFFFF');
        this.addText(300, 420, 'Jagged peaks, dark caves,\nand — rumor has it — treasure.', 13, '#DDDDDD');
        this.createButton(300, 490, 'Climb the Mountain Path', () => this.goTo(SCENES.MOUNTAINS), { width: 250 });

        // Right: coast
        this.addText(724, 300, '🌊', 56);
        this.addText(724, 375, 'The Coastal Path', 20, '#FFFFFF');
        this.addText(724, 420, 'Salt air, crashing waves,\nand things with tentacles.', 13, '#DDDDDD');
        this.createButton(724, 490, 'Follow the Coastal Path', () => this.goTo(SCENES.SHORE), { width: 250 });

        // Quest guidance
        const needGoblet = !this.gameState.hasItem('Golden Goblet');
        const needSea = !this.gameState.hasItem('Squid Eye') || !this.gameState.hasItem('Bottle of Rum');
        let hint = 'Both paths hold something the sorcerer wants...';
        if (!needGoblet && needSea) hint = 'The goblet is yours — the sea still owes you two treasures.';
        if (needGoblet && !needSea) hint = 'The sea is conquered — the mountain still hides a golden prize.';
        if (!needGoblet && !needSea) hint = 'You have everything! The sorcerer\'s sign awaits in the village.';
        this.addText(SCREEN_WIDTH/2, 580, hint, 14, '#FFD97A');

        this.createButton(150, 700, '← Back to Forest', () => this.goTo(SCENES.FOREST), { width: 190 });
    }
}
