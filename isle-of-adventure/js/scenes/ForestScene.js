/*
 * Isle of Adventure - Web Edition
 * ForestScene.js
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

export default class ForestScene extends BaseScene {
    constructor() {
        super({ key: SCENES.FOREST });
    }

    create() {
        this.setupScene();
        this.gameState.visitLocation('Forest');
        this.startGameMusic('serene_journey');
        this.setBackground('forest_bg');
        this.addAmbient('fireflies');

        this.addTitle('The Dark Forest');

        if (this.gameState.hasDefeatedEnemy('Forest Trolls')) {
            this.showVictoryState();
        } else {
            this.showEncounter();
        }

        this.createButton(150, 700, '← Back to Village', () => this.goTo(SCENES.VILLAGE), { width: 190 });
    }

    // ------------------------------------------------------------------
    // The troll stand-off
    // ------------------------------------------------------------------
    showEncounter() {
        this.addText(SCREEN_WIDTH/2, 130, 'Three enormous trolls block the path, arms crossed.', 16);

        this.addSpeech(SCREEN_WIDTH/2, 185,
            '"HALT, tiny human! We are the legendary Troll Brothers:\nBrute, Brute Jr., and... uh... Steve."');

        this.addSpeech(SCREEN_WIDTH/2, 230,
            '"Steve forgot to bring his intimidating name today," Brute sighs.', '#FFDD88', 13);

        this.spawnTrolls(400);

        this.addText(SCREEN_WIDTH/2, 545, 'What do you say to the trolls?', 15);

        this.createChoiceButton(210, 610, '"Wait — Steve? That\'s your\nintimidating troll name?"', () => {
            this.showExchange(
                '"Wait — Steve? That\'s your intimidating troll name?\nDid you forget to renew your scary-name license?"',
                '"STEVE ANGRY NOW! Steve picked it himself\nfrom a baby name book! It means \'crowned one\'!"\nThe other two nod supportively.'
            );
        });

        this.createChoiceButton(512, 610, '"Three against one?\nSeems fair... for you."', () => {
            this.showExchange(
                '"Three against one? That seems fair... for you.\nI like those odds!"',
                '"THREE?!" Brute counts his brothers, twice, using fingers.\n"Brute only count to two! You take that back!"'
            );
        });

        this.createChoiceButton(814, 610, '"I\'ve heard scarier names\nat a knitting circle."', () => {
            this.showExchange(
                '"I\'ve heard scarier names at a knitting circle.\nSeriously, Steve? What\'s next — Bob the Terrible?"',
                '"Knitting is VERY manly!" Steve roars, offended.\n"Steve knitted these battle scarves HIMSELF!"\nThe trolls are indeed wearing matching scarves.'
            );
        });
    }

    // Player line, then the trolls' unique comeback, then battle options
    showExchange(playerLine, trollReply) {
        this.clearScene();
        this.setBackground('forest_bg');
        this.addAmbient('fireflies');
        this.addTitle('The Dark Forest');

        this.addSpeech(SCREEN_WIDTH/2, 140, playerLine, '#4ECDC4');
        this.addSpeech(SCREEN_WIDTH/2, 215, trollReply);

        this.spawnTrolls(400);

        // --- Ways past the trolls ---
        const hasGear = this.gameState.hasAllItems(ENEMIES.FOREST_TROLLS.requiredItems);
        const hasBread = this.gameState.hasItem(ITEMS.FOOD.name);

        this.addText(SCREEN_WIDTH/2, 545, 'The trolls advance. Choose wisely:', 15);

        this.createButton(340, 610, hasGear ? '⚔️ Fight the Trolls!' : '⚔️ Fight (no gear...)',
            () => this.attemptBattle(), { width: 240 });

        if (hasBread) {
            this.createButton(680, 610, '🍞 Toss them your bread', () => this.breadGambit(), {
                width: 240, color: 0x7a5c1e, hover: 0x9c7a2e
            });
        } else {
            this.addText(680, 610, '(You sense these trolls\nwould do anything for carbs)', 12, '#BBBBBB');
        }

        this.createButton(150, 700, '← Retreat to Village', () => this.goTo(SCENES.VILLAGE), { width: 190 });
    }

    // ------------------------------------------------------------------
    // Solution 1: violence (requires gear)
    // ------------------------------------------------------------------
    attemptBattle() {
        const victory = this.gameState.hasAllItems(ENEMIES.FOREST_TROLLS.requiredItems);
        this.clearScene();
        this.setBackground('forest_bg');

        if (victory) {
            this.gameState.defeatEnemy('Forest Trolls');
            this.sound.play('heal_sound', { volume: 0.7 });

            this.addText(SCREEN_WIDTH/2, 200, 'VICTORY!', 52, '#4ecdc4', { fontStyle: 'bold' });
            this.addText(SCREEN_WIDTH/2, 300,
                'Your arrows fly true and your armor holds!\n' +
                'The trolls flee, dramatically clutching their scarves.\n' +
                '"THIS ISN\'T OVER!" yells Steve. It is, though.', 17);
            this.addText(SCREEN_WIDTH/2, 420, '🏆', 64);

            this.createButton(SCREEN_WIDTH/2, 610, 'Continue Deeper →', () => this.goTo(SCENES.FORK), { width: 240 });
        } else {
            this.addText(SCREEN_WIDTH/2, 200, 'DEFEAT!', 52, '#ff6b6b', { fontStyle: 'bold' });
            this.addText(SCREEN_WIDTH/2, 300,
                'You charge in armed with nothing but confidence.\n' +
                'The trolls politely but firmly bounce you back down the path.\n' +
                'You need a Bow, Arrows and Leather Armor. (Try the house!)', 17);
            this.addText(SCREEN_WIDTH/2, 420, '💫', 64);

            this.createButton(SCREEN_WIDTH/2, 610, 'Limp back to the Village', () => this.goTo(SCENES.VILLAGE), { width: 260 });
        }
    }

    // ------------------------------------------------------------------
    // Solution 2: carbohydrates (consumes the Food item)
    // ------------------------------------------------------------------
    breadGambit() {
        this.gameState.removeItem(ITEMS.FOOD.name);
        this.gameState.defeatEnemy('Forest Trolls');
        this.gameState.visitLocation('Bread Gambit');
        this.game.events.emit('inventory-updated');
        this.sound.play('special_sound', { volume: 0.7 });

        this.clearScene();
        this.setBackground('forest_bg');
        this.addAmbient('fireflies');

        this.addText(SCREEN_WIDTH/2, 180, 'THE BREAD GAMBIT!', 44, '#FFD700', { fontStyle: 'bold' });
        this.addText(SCREEN_WIDTH/2, 290,
            'You hurl the loaf into the bushes. The trolls FREEZE.\n\n' +
            '"BREAD!" they bellow in unison, diving after it.\n' +
            '"STEVE GOT THE CRUSTY END LAST TIME!" — "STEVE EARNED IT!"\n\n' +
            'You stroll past the brawl, unnoticed. A flawless victory.\nZero violence. One delicious casualty.', 16);
        this.addText(SCREEN_WIDTH/2, 460, '🍞💨', 56);

        this.createButton(SCREEN_WIDTH/2, 610, 'Continue Deeper →', () => this.goTo(SCENES.FORK), { width: 240 });
        this.createButton(150, 700, '← Back to Village', () => this.goTo(SCENES.VILLAGE), { width: 190 });
    }

    // ------------------------------------------------------------------
    showVictoryState() {
        this.addText(SCREEN_WIDTH/2, 140,
            'The path is clear. Somewhere in the distance you hear\ntrolls arguing about bread etiquette.', 16);

        this.addText(SCREEN_WIDTH/2, 330, '🌲   🕊️   🌲', 48);
        this.addText(SCREEN_WIDTH/2, 420, 'The forest is peaceful now', 20, '#4ecdc4');

        this.createButton(874, 700, 'Continue Deeper →', () => this.goTo(SCENES.FORK), { width: 220 });
    }

    spawnTrolls(y) {
        const trollData = [
            { key: 'troll1', x: 330, name: 'Brute', dur: 2000, sway: 3 },
            { key: 'troll2', x: 512, name: 'Brute Jr.', dur: 1800, sway: 2 },
            { key: 'troll3', x: 694, name: 'Steve', dur: 2200, sway: 2.5 }
        ];
        trollData.forEach(t => {
            const img = this.add.image(t.x, y, t.key);
            img.setDisplaySize(110, 138);
            this.animateCharacter(img, t.dur, t.sway);
            this.addText(t.x, y + 88, t.name, 14);
        });
        this.addText(SCREEN_WIDTH/2, 510, 'The Troll Brothers (& Steve)', 18, '#ff6b6b');
    }
}
