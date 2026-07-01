/*
 * Isle of Adventure - Web Edition
 * MountainsScene.js
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

export default class MountainsScene extends BaseScene {
    constructor() {
        super({ key: SCENES.MOUNTAINS });
    }

    create() {
        this.setupScene();
        this.gameState.visitLocation('Mountains');
        this.startGameMusic('serene_journey');
        this.setBackground('mountains_bg');

        this.addTitle('The Rocky Mountains');

        this.addText(SCREEN_WIDTH/2, 135,
            'The wind howls between towering peaks. Ahead, a cave mouth\n' +
            'exhales cold air and what sounds suspiciously like snoring.', 16);

        this.addText(SCREEN_WIDTH/2, 330, '⛰️  🕳️  ⛰️', 64);

        const ogreDone = this.gameState.hasDefeatedEnemy('Cave Ogre');
        this.addText(SCREEN_WIDTH/2, 440,
            ogreDone
                ? 'The snoring has stopped. The cave feels almost welcoming now.\n(Almost.)'
                : 'A hand-painted sign by the entrance reads:\n"GO AWAY. — Management"', 15, '#DDDDDD');

        this.createButton(SCREEN_WIDTH/2, 560, ogreDone ? 'Enter the Cave' : 'Enter the Cave (ignore sign)',
            () => this.goTo(SCENES.CAVE), { width: 260 });

        this.createButton(150, 700, '← Back to the Fork', () => this.goTo(SCENES.FORK), { width: 190 });
    }
}
