/*
 * Isle of Adventure - Web Edition
 * TreasureScene.js
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

export default class TreasureScene extends BaseScene {
    constructor() {
        super({ key: SCENES.TREASURE });
    }

    create() {
        this.setupScene();
        this.gameState.visitLocation('Treasure Room');
        this.startGameMusic('serene_journey');
        this.setBackground('treasure_bg');
        this.addAmbient('sparkles');

        this.addTitle('The Treasure Chamber', '#FFD700');

        this.addText(SCREEN_WIDTH/2, 135,
            'Mountains of gold glitter in the torchlight. A note on the biggest pile reads:\n' +
            '"Inventory by Grognak. If counting wrong, is because Grognak count to two."', 15);

        // Gold piles
        [[240, 330], [400, 370], [630, 350], [790, 320]].forEach(([x, y]) => {
            const coin = this.addText(x, y, '🪙', 48);
            this.tweens.add({
                targets: coin, y: y - 5, duration: 1600 + x % 700,
                yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
            });
        });

        this.collectGoblet();

        this.createButton(150, 700, '← Back to the Cave', () => this.goTo(SCENES.CAVE), {
            width: 200, color: 0x8B4513, hover: 0xA0522D
        });
        this.createButton(874, 700, 'Return to the Fork →', () => this.goTo(SCENES.FORK), {
            width: 220, color: 0x8B4513, hover: 0xA0522D
        });
    }

    collectGoblet() {
        const gobletName = ITEMS.GOBLET.name;

        if (this.gameState.hasItem(gobletName)) {
            this.addText(SCREEN_WIDTH/2, 460, '✓', 48, '#4ecdc4');
            this.addText(SCREEN_WIDTH/2, 530,
                'You already claimed the Golden Goblet.\nThe rest of the gold is, sadly, glued down. (Grognak\'s idea.)',
                15, '#4ecdc4');
        } else {
            this.gameState.addItem(gobletName);
            this.sound.play('special_sound', { volume: 0.6 });
            this.game.events.emit('inventory-updated');

            const goblet = this.addText(SCREEN_WIDTH/2, 470, '🏆', 72);
            this.tweens.add({
                targets: goblet, y: 455, duration: 1300,
                yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
            });

            const msg = this.addText(SCREEN_WIDTH/2, 380, '✨ GOLDEN GOBLET OBTAINED! ✨', 28, '#FFD700', { fontStyle: 'bold' });
            this.tweens.add({ targets: msg, alpha: 0.35, duration: 800, yoyo: true, repeat: 3 });

            this.addText(SCREEN_WIDTH/2, 560,
                'One of the sorcerer\'s three sacred items!\n(It\'s also dishwasher safe, according to the base.)', 15, '#4ecdc4');
        }
    }
}
