/*
 * Isle of Adventure - Web Edition
 * TrollBridgeScene.js
 *
 * The Toll Bridge — run by the Troll Brothers' cousins, who have
 * modernized the family business: the toll is now one (1) good joke.
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

export default class TrollBridgeScene extends BaseScene {
    constructor() {
        super({ key: SCENES.TROLL_BRIDGE });
    }

    create() {
        this.setupScene();
        const paidToll = this.gameState.hasVisitedLocation('Troll Bridge Toll Paid');
        this.gameState.visitLocation('Troll Bridge');
        this.startGameMusic('serene_journey');
        this.setBackground(['troll_bridge_bg', 'mountains_bg']);
        this.addAmbient('fireflies');

        this.addTitle('The Toll Bridge');

        if (paidToll) {
            this.addText(SCREEN_WIDTH/2, 140,
                'The bridge trolls wave from under the bridge, still giggling\nabout your joke. Comedy: the universal currency.', 16);
            this.addText(SCREEN_WIDTH/2, 320, '🌉😂', 56);
            this.createButton(874, 700, 'Cross to the Mountains →', () => this.goTo(SCENES.MOUNTAINS), { width: 250 });
            this.createButton(150, 700, '← Back to the Pass', () => this.goTo(SCENES.MOUNTAIN_PASS), { width: 200 });
            return;
        }

        this.addText(SCREEN_WIDTH/2, 135,
            'A rope bridge sways over roaring rapids. Two burly trolls\nlounge beneath it beside a hand-painted sign:', 15);

        this.addText(SCREEN_WIDTH/2, 195, '"TOLL: ONE (1) GOOD JOKE. NO KNOCK-KNOCK. WE\'VE HEARD THEM ALL."', 15, '#FFD97A');

        this.addSpeech(SCREEN_WIDTH/2, 250,
            (this.gameState.hasDefeatedEnemy('Forest Trolls')
                ? '"Wait. WAIT. You\'re the one who beat our cousins!" The trolls exchange looks.\n"Steve wrote us about you. Three PAGES. Anyway — toll still applies."'
                : '"Cousins of the famous Troll Brothers, at your service!\nWe went into infrastructure. Pay the toll and cross!"'), '#FFDD88', 13);

        this.addText(SCREEN_WIDTH/2, 380, '🌉', 64);
        this.addText(SCREEN_WIDTH/2, 460, 'Gruk & Thistle — Bridge Operators (& Comedy Critics)', 15, '#FFD97A');

        this.addText(SCREEN_WIDTH/2, 520, 'Choose your toll joke carefully...', 15);

        this.createChoiceButton(210, 585, '"Why don\'t trolls do stand-up?\nThey always bring the bridge down."', () => {
            this.payToll(
                '"Why don\'t trolls do stand-up comedy?\nBecause they always bring the bridge down!"',
                'Silence... then Gruk EXPLODES laughing and has to sit in the river.\n"BRING THE BRIDGE DOWN! Because we — and the — HAAAA!"\nThistle stamps your hand: TOLL PAID, FUNNY.'
            );
        }, 0x5D4E37, 0x8B7355);

        this.createChoiceButton(512, 585, '"What\'s a troll\'s favorite\nmusic? Rock. Obviously."', () => {
            this.payToll(
                '"What\'s a troll\'s favorite music? Rock. Obviously."',
                'Thistle nods slowly. "Technically correct. The best kind of correct."\nGruk boos, but Gruk is overruled. "TOLL ACCEPTED," Thistle declares.\n"On a technicality. The worst kind of accepted."'
            );
        }, 0x5D4E37, 0x8B7355);

        this.createChoiceButton(814, 585, '"My last joke made three\ntrolls cry. True story."', () => {
            this.payToll(
                '"My last joke made three trolls cry. True story."',
                '"That\'s not a joke, that\'s a THREAT," Gruk whispers, delighted.\n"We love it. Dark. Modern. Very now." They stamp both your hands.\n"Cross before we change our minds or our comedy standards."'
            );
        }, 0x5D4E37, 0x8B7355);

        this.createButton(150, 700, '← Back to the Pass', () => this.goTo(SCENES.MOUNTAIN_PASS), { width: 200 });
    }

    payToll(playerLine, trollReply) {
        this.gameState.visitLocation('Troll Bridge Toll Paid');
        this.sound.play('special_sound', { volume: 0.5 });

        this.clearScene();
        this.setBackground(['troll_bridge_bg', 'mountains_bg']);
        this.addAmbient('fireflies');
        this.addTitle('Toll Paid!', '#7CFC90');

        this.addSpeech(SCREEN_WIDTH/2, 150, playerLine, '#4ECDC4');
        this.addSpeech(SCREEN_WIDTH/2, 260, trollReply, '#FFDD88', 14);

        this.addText(SCREEN_WIDTH/2, 400, '😂 🌉 😂', 48);
        this.addText(SCREEN_WIDTH/2, 470,
            '"First good laugh in two hundred years," Gruk sighs happily.\nThe bridge is yours to cross. It only wobbles a NORMAL amount.', 14, '#DDDDDD');

        this.createButton(SCREEN_WIDTH/2, 600, 'Cross the bridge →', () => this.goTo(SCENES.MOUNTAINS), { width: 230 });
        this.createButton(150, 700, '← Back to the Pass', () => this.goTo(SCENES.MOUNTAIN_PASS), { width: 200 });
    }
}
