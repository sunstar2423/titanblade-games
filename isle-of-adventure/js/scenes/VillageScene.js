/*
 * Isle of Adventure - Web Edition
 * VillageScene.js
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

export default class VillageScene extends BaseScene {
    constructor() {
        super({ key: SCENES.VILLAGE });
    }

    create() {
        this.setupScene();
        this.gameState.visitLocation('Village');
        this.startGameMusic('serene_journey');
        this.setBackground('village_bg');
        this.addAmbient('fireflies');

        this.addTitle('Village Portal');

        this.addText(SCREEN_WIDTH/2, 135,
            'You tumble out of a shimmering portal into a peaceful village.\n' +
            'Nobody seems surprised. Apparently this happens a lot here.', 16);

        // --- The three destinations, laid out across the village ---

        // House
        this.addText(240, 300, '🏠', 44);
        this.addText(240, 355, 'A cozy house.\nThe door is suspiciously unlocked.', 13, '#DDDDDD');
        this.createButton(240, 420, 'Enter the House', () => this.goTo(SCENES.HOUSE));

        // Forest
        this.addText(512, 300, '🌲', 44);
        this.addText(512, 355, 'A dark forest path.\nOminous, yet strangely inviting.', 13, '#DDDDDD');
        this.createButton(512, 420, 'Take the Forest Path', () => this.goTo(SCENES.FOREST));

        // Ancient sign
        this.addText(784, 300, '📜', 44);
        this.addText(784, 355, 'An ancient sign hums\nwith magical energy.', 13, '#DDDDDD');
        this.createButton(784, 420, 'Approach the Sign', () => this.checkSignAccess());

        // Progress hint — tells the player what the sign wants
        const collected = ['Squid Eye', 'Bottle of Rum', 'Golden Goblet']
            .filter(i => this.gameState.hasItem(i));
        this.addText(SCREEN_WIDTH/2, 560,
            `Sacred items found: ${collected.length} / 3` +
            (collected.length ? `  (${collected.join(', ')})` : ''),
            15, collected.length === 3 ? '#7CFC90' : '#FFD97a', { panel: true });

        this.createButton(SCREEN_WIDTH/2, 700, 'Main Menu', () => this.goTo('MainMenuScene'), { width: 180 });
    }

    checkSignAccess() {
        this.gameState.checkSorcererAccess();

        if (this.gameState.canEnterSorcerer) {
            this.goTo(SCENES.SORCERER);
        } else {
            if (this._signMsg) this._signMsg.destroy();
            this._signMsg = this.addText(SCREEN_WIDTH/2, 630,
                '"ONLY THE WORTHY SHALL PASS!" booms the sign.\n' +
                'A force field zaps your nose. Worthiness apparently requires three sacred items.',
                16, '#FF6B6B');

            this.time.delayedCall(3500, () => {
                if (this._signMsg) { this._signMsg.destroy(); this._signMsg = null; }
            });
        }
    }
}
