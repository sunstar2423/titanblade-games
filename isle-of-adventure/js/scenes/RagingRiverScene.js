/*
 * Isle of Adventure - Web Edition
 * RagingRiverScene.js
 *
 * The Raging River — the bridge is out, and every way across
 * is somebody's bad idea. Pick yours.
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

export default class RagingRiverScene extends BaseScene {
    constructor() {
        super({ key: SCENES.RIVER });
    }

    create() {
        this.setupScene();
        const crossedBefore = this.gameState.hasVisitedLocation('River Crossed');
        this.gameState.visitLocation('Raging River');
        this.startGameMusic('serene_journey');
        this.setBackground(['river_bg', 'shore_bg']);
        this.addAmbient('seaspray');

        this.addTitle('The Raging River');

        if (crossedBefore) {
            this.addText(SCREEN_WIDTH/2, 140,
                'The river still rages, but the beavers have finished their bridge.\nIt has a small toll booth. They charge one compliment.', 16);
            this.addText(SCREEN_WIDTH/2, 320, '🦫🌉', 56);
            this.addText(SCREEN_WIDTH/2, 400, '"Nice bridge," you say. The beavers nod professionally.', 14, '#DDDDDD');
            this.createButton(874, 700, 'Cross to the Shore →', () => this.goTo(SCENES.SHORE), { width: 230 });
            this.createButton(150, 700, '← Back to the Fork', () => this.goTo(SCENES.FORK), { width: 190 });
            return;
        }

        this.addText(SCREEN_WIDTH/2, 135,
            'White water thunders through the gorge. The old bridge is\nvery much gone — a single plank bobs past, almost apologetically.', 15);

        this.addText(SCREEN_WIDTH/2, 300, '🌊 🪵 🌊', 52);
        this.addText(SCREEN_WIDTH/2, 380,
            'You spot three ways across. All of them are terrible.\nThat\'s adventuring, baby.', 15, '#FFD97A');

        this.addText(SCREEN_WIDTH/2, 460, 'How do you cross?', 15);

        this.createChoiceButton(210, 530, '🏊 Swim it. How bad\ncan it be?', () => {
            this.cross(
                'You dive in confidently.',
                'It can be QUITE bad. The river carries you half a mile,\nspin-cycles you twice, and deposits you on the far bank\nmissing one shoe. The river keeps the shoe. It has a collection.',
                '👟❓'
            );
        }, 0x1B4F72, 0x2E86C1);

        this.createChoiceButton(512, 530, '🪵 Cross the fallen log\nlike a dignified adult', () => {
            this.cross(
                'You take the fallen log, arms out, one careful step at a time.',
                'Wobble... wobble... WOBBLE... You make it across with\nyour dignity 94% intact. A fish watched the whole thing.\nIt says nothing, but it KNOWS.',
                '🎯'
            );
        }, 0x1B4F72, 0x2E86C1);

        this.createChoiceButton(814, 530, '🦫 Ask those beavers.\nThey look organized.', () => {
            this.cross(
                'You approach the beavers and say: "That is an EXCELLENT dam."',
                'The beavers freeze. One removes his hard hat, moved.\n"Forty years," he whispers. "Forty years and no one noticed."\nThey build you a footbridge in eleven minutes. UNION BEAVERS.',
                '🦫🌉'
            );
        }, 0x1B4F72, 0x2E86C1);

        this.createButton(150, 700, '← Back to the Fork', () => this.goTo(SCENES.FORK), { width: 190 });
    }

    cross(playerLine, outcome, emoji) {
        this.gameState.visitLocation('River Crossed');
        this.sound.play('special_sound', { volume: 0.5 });

        this.clearScene();
        this.setBackground(['river_bg', 'shore_bg']);
        this.addAmbient('seaspray');
        this.addTitle('Across the River!', '#7CFC90');

        this.addSpeech(SCREEN_WIDTH/2, 150, playerLine, '#4ECDC4');
        this.addSpeech(SCREEN_WIDTH/2, 260, outcome, '#B8E2F2', 14);

        this.addText(SCREEN_WIDTH/2, 400, emoji, 56);
        this.addText(SCREEN_WIDTH/2, 480,
            'The coastal path continues on this side, winding toward\nthe smell of salt and the sound of waves.', 14, '#DDDDDD');

        this.createButton(SCREEN_WIDTH/2, 600, 'Continue to the Shore →', () => this.goTo(SCENES.SHORE), { width: 250 });
        this.createButton(150, 700, '← Back to the Fork', () => this.goTo(SCENES.FORK), { width: 190 });
    }
}
