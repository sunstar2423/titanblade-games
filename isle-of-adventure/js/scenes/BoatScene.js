/*
 * Isle of Adventure - Web Edition
 * BoatScene.js
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

export default class BoatScene extends BaseScene {
    constructor() {
        super({ key: SCENES.BOAT });
    }

    create() {
        this.setupScene();
        this.gameState.visitLocation('Boat at Sea');
        this.startGameMusic('serene_journey');
        this.setBackground('boat_bg');
        this.addAmbient('bubbles');

        this.addTitle('Out at Sea');

        if (this.gameState.hasDefeatedEnemy('Giant Squid')) {
            // Peaceful crossing after the battle
            this.addText(SCREEN_WIDTH/2, 140,
                'The fishermen row you across a mercifully tentacle-free sea.\n' +
                '"Best commute we\'ve had in years," one says, misty-eyed.', 16);
            this.addText(SCREEN_WIDTH/2, 330, '🌊  ⛵  🌊', 56);
            this.createButton(SCREEN_WIDTH/2, 610, 'Sail to Pirate Island →', () => this.goTo(SCENES.PIRATE_ISLAND), { width: 250 });
            this.createButton(150, 700, '← Back to Shore', () => this.goTo(SCENES.SHORE), { width: 190 });
            return;
        }

        this.addText(SCREEN_WIDTH/2, 140,
            'The fishermen row you out into deep blue water.\n' +
            'Suddenly the boat lurches — dark tentacles rise from the depths!', 16);

        // Tentacles
        const t1 = this.addText(230, 400, '🐙', 72);
        const t2 = this.addText(794, 400, '🐙', 72);
        [t1, t2].forEach((t, i) => {
            this.tweens.add({
                targets: t, y: 380, duration: 1200 + i * 300,
                yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
            });
        });

        this.addText(SCREEN_WIDTH/2, 480, 'A GIANT SQUID ATTACKS!', 28, '#ff6b6b', { fontStyle: 'bold' });
        this.addSpeech(SCREEN_WIDTH/2, 530,
            '"THAT\'S the tentacle-y situation we mentioned!" a fisherman yells, helpfully.', '#DDDDDD', 13);

        this.createButton(360, 630, '⚔️ Stand and Fight!', () => this.goTo(SCENES.SQUID_BATTLE), { width: 240 });
        this.createButton(670, 630, '🏊 Row for your life!', () => this.goTo(SCENES.SHORE), {
            width: 240, color: 0x1B4F72, hover: 0x2E86C1
        });
    }
}
