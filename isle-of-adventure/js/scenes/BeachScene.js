/*
 * Isle of Adventure - Web Edition
 * BeachScene.js
 *
 * The Beach Cove — home of Gary, professional castaway. An optional
 * story stop that dispenses hints, jokes, and emergency bread.
 * Uses images/beachscene.png when present, falling back to the shore art.
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

export default class BeachScene extends BaseScene {
    constructor() {
        super({ key: SCENES.BEACH });
    }

    create() {
        this.setupScene();
        const firstVisit = !this.gameState.hasVisitedLocation('Beach Cove');
        this.gameState.visitLocation('Beach Cove');
        this.startGameMusic('serene_journey');
        this.setBackground(['beach_bg', 'shore_bg']);
        this.addAmbient('seaspray');

        this.addTitle('The Beach Cove');

        this.addText(SCREEN_WIDTH/2, 135,
            firstVisit
                ? 'A driftwood hut, a tidy fire pit, and a flag made of trousers.\nA sunburnt man waves enthusiastically from a deck chair.'
                : 'Gary\'s cove, as tidy as ever. The trouser-flag flutters proudly.', 16);

        this.addSpeech(SCREEN_WIDTH/2, 200,
            firstVisit
                ? '"A VISITOR! Or a very detailed hallucination! Either way — welcome!\nI\'m Gary. Professional castaway. Rescued fourteen times.\nKeep coming back. Great beach. Terrible wi-fi."'
                : '"Back again! Pull up a coconut. Mind the crab — that\'s Gerald.\nHe\'s in charge of security."', '#FFE9A8', 14);

        // Gary himself
        const gary = this.addText(SCREEN_WIDTH/2, 380, '🏖️🧔', 64);
        this.tweens.add({
            targets: gary, y: 372, duration: 2000,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
        this.addText(SCREEN_WIDTH/2, 460, 'Gary the Castaway (& Gerald, Head of Security)', 16, '#FFD97A');

        this.addText(SCREEN_WIDTH/2, 520, 'What do you ask Gary?', 15);

        this.createChoiceButton(210, 585, '"Rescued FOURTEEN times?\nOn purpose?!"', () => {
            this.showExchange(
                '"Rescued fourteen times? On purpose?!"',
                '"The rescue boats have SNACKS!" Gary says, scandalized\nyou\'d even ask. "Also, between us, my sense of direction\nis... creative. I once got lost inside a lighthouse.\nOne room, that lighthouse. One room."'
            );
        }, 0x8a6d3b, 0xa8894e);

        this.createChoiceButton(512, 585, '"Any tips for\nan adventurer?"', () => {
            this.showExchange(
                '"Any survival tips for a traveling adventurer?"',
                '"Funny you ask! The sorcerer up in the village wants three things:\na SQUID EYE, pirate RUM, and a GOLDEN GOBLET.\nDon\'t ask how I know." He taps his nose. "...I read his diary.\nIt\'s mostly doodles of himself looking impressive."'
            );
        }, 0x8a6d3b, 0xa8894e);

        this.createChoiceButton(814, 585, '"What\'s the deal with\nthat giant squid?"', () => {
            this.showExchange(
                '"What\'s the story with the giant squid out there?"',
                '"Old Inky? Total softie — until you\'re in a BOAT. Then it\'s\ntentacles first, questions never. Bring a bow and armor,\nand don\'t wear anything you can\'t swim in.\nI lost fourteen hats learning that. FOURTEEN."'
            );
        }, 0x8a6d3b, 0xa8894e);

        this.createButton(150, 700, '← Back to the Shore', () => this.goTo(SCENES.SHORE), { width: 200 });
    }

    showExchange(playerLine, garyReply) {
        this.clearScene();
        this.setBackground(['beach_bg', 'shore_bg']);
        this.addAmbient('seaspray');
        this.addTitle('The Beach Cove');

        this.addSpeech(SCREEN_WIDTH/2, 140, playerLine, '#4ECDC4');
        this.addSpeech(SCREEN_WIDTH/2, 250, garyReply, '#FFE9A8', 14);

        const gary = this.addText(SCREEN_WIDTH/2, 420, '🏖️🧔', 64);
        this.tweens.add({
            targets: gary, y: 412, duration: 2000,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        // Gary's emergency bread — a catch-up mechanic for the troll gambit
        if (!this.gameState.hasItem(ITEMS.FOOD.name)) {
            this.addSpeech(SCREEN_WIDTH/2, 520,
                '"Also — you look hungrier than I do. Take an emergency loaf!\nI bake forty a week. The recipe was on the ONE page\nof the survival manual that didn\'t wash away."', '#FFE9A8', 13);

            this.createButton(SCREEN_WIDTH/2, 600, '🍞 Accept the emergency bread', () => {
                this.gameState.addItem(ITEMS.FOOD.name);
                this.sound.play('special_sound', { volume: 0.6 });
                this.game.events.emit('inventory-updated');
                this.celebrate(SCREEN_WIDTH/2, 555, 'Got Food! (Trolls love this stuff)', '#4ecdc4');
                this.time.delayedCall(1400, () => this.scene.restart());
            }, { width: 300, color: 0x8a6d3b, hover: 0xa8894e });
        } else {
            this.addText(SCREEN_WIDTH/2, 540,
                'Gary nods at the bread already in your pack.\n"Ah, provisioned! A professional. Gerald approves."', 13, '#DDDDDD');
        }

        this.createButton(150, 700, '← Back to the Shore', () => this.goTo(SCENES.SHORE), { width: 200 });
        this.createButton(874, 700, 'Ask something else', () => this.scene.restart(), { width: 200 });
    }
}
