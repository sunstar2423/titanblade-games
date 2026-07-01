/*
 * Isle of Adventure - Web Edition
 * ShoreScene.js
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

export default class ShoreScene extends BaseScene {
    constructor() {
        super({ key: SCENES.SHORE });
    }

    create() {
        this.setupScene();
        this.gameState.visitLocation('Rocky Shore');
        this.startGameMusic('serene_journey');
        this.setBackground('shore_bg');
        this.addAmbient('seaspray');

        this.addTitle('The Rocky Shore');

        this.addText(SCREEN_WIDTH/2, 135,
            'Waves crash against the rocks. Two fishermen lean on their boat,\n' +
            'having the world\'s slowest argument about bait.', 16);

        // The boat and fishermen
        this.addText(370, 320, '🚣', 56);
        this.addText(370, 385, 'The fishermen offer you a ride out to sea.\n' +
            '"Fair warning," one says, "the sea\'s been\nextra... tentacle-y lately."', 13, '#DDDDDD');
        this.createButton(370, 470, '⛵ Board the Boat', () => this.goTo(SCENES.BOAT), { width: 230 });

        // The beach cove — new optional path
        this.addText(660, 320, '🏖️', 56);
        const visitedGary = this.gameState.hasVisitedLocation('Beach Cove');
        this.addText(660, 385,
            visitedGary
                ? 'Gary\'s cove. You can hear him\nnarrating his own sandcastle work.'
                : 'Smoke rises from a sheltered cove\ndown the beach. Someone lives there?', 13, '#DDDDDD');
        this.createButton(660, 470, '🏖️ Explore the Cove', () => this.goTo(SCENES.BEACH), {
            width: 230, color: 0x8a6d3b, hover: 0xa8894e
        });

        const squidDone = this.gameState.hasDefeatedEnemy('Giant Squid');
        if (squidDone) {
            this.addText(SCREEN_WIDTH/2, 575,
                'The sea is calm now. The fishermen have started a squid-free tour company.', 14, '#7CFC90');
        }

        this.createButton(150, 700, '← Back to the Fork', () => this.goTo(SCENES.FORK), { width: 190 });
    }
}
