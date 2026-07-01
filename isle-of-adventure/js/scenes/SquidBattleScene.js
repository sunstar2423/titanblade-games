/*
 * Isle of Adventure - Web Edition
 * SquidBattleScene.js
 *
 * Copyright (c) 2025 TitanBlade Games
 *
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 *
 * https://github.com/sunstar2423/titanblade-games
 */

import { SCREEN_WIDTH, SCREEN_HEIGHT, SCENES, ENEMIES, ITEMS } from '../GameData.js';
import BaseScene from '../BaseScene.js';

export default class SquidBattleScene extends BaseScene {
    constructor() {
        super({ key: SCENES.SQUID_BATTLE });
    }

    create() {
        this.setupScene();
        this.gameState.visitLocation('Squid Battle');
        this.startGameMusic('serene_journey');
        this.setBackground('squid_battle_bg');
        this.addAmbient('bubbles');

        this.addTitle('The Giant Squid');

        if (this.gameState.hasDefeatedEnemy('Giant Squid')) {
            this.showVictoryState();
        } else {
            this.showEncounter();
        }
    }

    showEncounter() {
        this.addText(SCREEN_WIDTH/2, 135,
            'The squid wraps a tentacle around the mast and glares at you\nwith an eye the size of a cartwheel.', 16);

        this.addText(SCREEN_WIDTH/2, 330, 'The Giant Squid', 30, '#ff6b6b', { fontStyle: 'bold' });
        this.addSpeech(SCREEN_WIDTH/2, 380,
            '*It cannot speak, but its glare says "I have eight arms\nand a grudge, and I intend to use both."*', '#B8E2F2', 13);

        this.addText(SCREEN_WIDTH/2, 500, 'What do you shout at the giant squid?', 15);

        this.createChoiceButton(210, 570, '"Hey! I didn\'t order\ncalamari today!"', () => {
            this.showExchange(
                '"Hey! I didn\'t order calamari today!\nTake your tentacles elsewhere!"',
                '*deeply offended squid noises*\n*points a tentacle at YOU, then at its mouth,\nas if to say: YOU\'RE the menu today*'
            );
        }, 0x1B4F72, 0x2E86C1);

        this.createChoiceButton(512, 570, '"Eight arms and you still\ncan\'t give a proper hug?"', () => {
            this.showExchange(
                '"Eight arms and you still can\'t give a proper hug?\nWhat\'s the point of all those tentacles?"',
                '*the squid pauses*\n*looks at its tentacles... all eight of them*\n*seems genuinely hurt*\n*angry splashing resumes, but noticeably sadder*'
            );
        }, 0x1B4F72, 0x2E86C1);

        this.createChoiceButton(814, 570, '"I\'ve seen bigger squids\nin my bathtub!"', () => {
            this.showExchange(
                '"I\'ve seen bigger squids in my bathtub!\nYou\'re a medium squid at best!"',
                '*the squid rears up to its FULL height*\n*it is very much not a medium squid*\n*that was clearly the wrong thing to say*'
            );
        }, 0x1B4F72, 0x2E86C1);

        this.createButton(150, 700, '← Retreat to Shore', () => this.goTo(SCENES.SHORE), { width: 200 });
    }

    showExchange(playerLine, squidReply) {
        this.clearScene();
        this.setBackground('squid_battle_bg');
        this.addAmbient('bubbles');
        this.addTitle('The Giant Squid');

        this.addSpeech(SCREEN_WIDTH/2, 140, playerLine, '#4ECDC4');
        this.addSpeech(SCREEN_WIDTH/2, 240, squidReply, '#FF9E9E');

        this.addText(SCREEN_WIDTH/2, 400, '🐙', 96);

        this.createButton(SCREEN_WIDTH/2, 590, '⚔️ ATTACK!', () => this.attemptBattle(), { width: 220 });
        this.createButton(150, 700, '← Retreat to Shore', () => this.goTo(SCENES.SHORE), { width: 200 });
    }

    attemptBattle() {
        const victory = this.gameState.hasAllItems(ENEMIES.GIANT_SQUID.requiredItems);
        this.clearScene();
        this.setBackground('squid_battle_bg');

        if (victory) {
            this.gameState.defeatEnemy('Giant Squid');
            this.sound.play('heal_sound', { volume: 0.7 });

            this.addText(SCREEN_WIDTH/2, 190, 'VICTORY!', 52, '#4ecdc4', { fontStyle: 'bold' });
            this.addText(SCREEN_WIDTH/2, 300,
                'Your arrows find their mark! With a final dramatic splash\n' +
                '(and what sounds like a huffy sigh), the squid retreats\nto the depths to reconsider its life choices.', 17);
            this.addText(SCREEN_WIDTH/2, 400, '🏆', 64);

            this.createButton(SCREEN_WIDTH/2, 600, 'Continue →', () => {
                this.clearScene();
                this.setBackground('squid_battle_bg');
                this.addAmbient('bubbles');
                this.addTitle('The Giant Squid');
                this.showVictoryState();
            }, { width: 200 });
        } else {
            this.addText(SCREEN_WIDTH/2, 190, 'DEFEAT!', 52, '#ff6b6b', { fontStyle: 'bold' });
            this.addText(SCREEN_WIDTH/2, 300,
                'You wave your empty hands menacingly. The squid is not impressed.\n' +
                'It flicks the boat back to shore like a paper toy.\nYou need a Bow, Arrows and Leather Armor!', 17);
            this.addText(SCREEN_WIDTH/2, 400, '💨', 64);

            this.createButton(SCREEN_WIDTH/2, 600, 'Wash ashore', () => this.goTo(SCENES.SHORE), { width: 200 });
        }
    }

    showVictoryState() {
        this.addText(SCREEN_WIDTH/2, 135,
            'The defeated squid left something behind:\na magical eye, bobbing politely on the surface.', 16);

        this.collectSquidEye();

        this.createButton(874, 700, 'Onward to Pirate Island →', () => this.goTo(SCENES.PIRATE_ISLAND), { width: 260 });
        this.createButton(150, 700, '← Back to Shore', () => this.goTo(SCENES.SHORE), { width: 190 });
    }

    collectSquidEye() {
        const eyeName = ITEMS.SQUID_EYE.name;

        if (this.gameState.hasItem(eyeName)) {
            this.addText(SCREEN_WIDTH/2, 340, '✓', 64, '#4ecdc4');
            this.addText(SCREEN_WIDTH/2, 440, 'Squid Eye already collected.\n(It occasionally winks. You try not to think about it.)', 15, '#4ecdc4');
        } else {
            this.gameState.addItem(eyeName);
            this.sound.play('special_sound', { volume: 0.6 });
            this.game.events.emit('inventory-updated');

            const eye = this.addText(SCREEN_WIDTH/2, 350, '👁️', 72);
            this.tweens.add({
                targets: eye, y: 335, duration: 1400,
                yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
            });

            const msg = this.addText(SCREEN_WIDTH/2, 260, '✨ MAGICAL SQUID EYE OBTAINED! ✨', 26, '#4ECDC4', { fontStyle: 'bold' });
            this.tweens.add({ targets: msg, alpha: 0.35, duration: 800, yoyo: true, repeat: 3 });

            this.addText(SCREEN_WIDTH/2, 450,
                'One of the sorcerer\'s three sacred items!\n(The squid grew a new one immediately. It\'s fine. Probably.)', 15, '#4ecdc4');
        }
    }
}
