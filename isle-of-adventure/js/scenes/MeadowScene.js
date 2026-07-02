/*
 * Isle of Adventure - Web Edition
 * MeadowScene.js
 *
 * The Peaceful Meadow — gateway to the Inland Wilds. Suspiciously
 * pleasant. The deer are DEFINITELY watching you.
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

export default class MeadowScene extends BaseScene {
    constructor() {
        super({ key: SCENES.MEADOW });
    }

    create() {
        this.setupScene();
        const firstVisit = !this.gameState.hasVisitedLocation('Peaceful Meadow');
        this.gameState.visitLocation('Peaceful Meadow');
        this.startGameMusic('serene_journey');
        this.setBackground(['meadow_bg', 'forest_bg']);
        this.addAmbient('fireflies');

        this.addTitle('The Peaceful Meadow');

        this.addText(SCREEN_WIDTH/2, 135,
            firstVisit
                ? 'Wildflowers, a chuckling stream, deer grazing by a cottage.\nAfter the trolls, this is deeply suspicious. Nothing is this nice.'
                : 'The meadow, as impossibly pleasant as ever.\nThe deer nod at you now. You\'ve been ACCEPTED.', 15);

        this.addText(SCREEN_WIDTH/2, 200,
            'A pair of deer watch you pass. One of them chews thoughtfully,\nlike it\'s formulating an opinion about your quest.', 13, '#DDDDDD');

        // The two wonders of the wilds
        this.addText(300, 320, '🌙🪞', 48);
        this.addText(300, 390, 'The Fairy Lake', 19);
        this.addText(300, 435, 'Moonlit water, swans, and —\nis someone sitting on that rock?', 12, '#DDDDDD');
        this.createButton(300, 500, 'Visit the Fairy Lake', () => this.goTo(SCENES.LAKE), {
            width: 230, color: 0x2C5F7A, hover: 0x3E7BA6
        });

        this.addText(724, 320, '🌳✨', 48);
        this.addText(724, 390, 'The Elf Village', 19);
        this.addText(724, 435, 'Treehouses glowing in the canopy.\nFaint harp music. Of course.', 12, '#DDDDDD');
        this.createButton(724, 500, 'Visit the Elf Village', () => this.goTo(SCENES.ELF_VILLAGE), {
            width: 230, color: 0x2C5F2D, hover: 0x4A7C59
        });

        this.addText(SCREEN_WIDTH/2, 580,
            'The wilds hold wonders, not quest items — explore for the joy of it.\n(And maybe a trinket or two for your collection.)', 13, '#FFD97A');

        this.createButton(150, 700, '← Back to the Fork', () => this.goTo(SCENES.FORK), { width: 190 });
    }
}
