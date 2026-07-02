/*
 * Isle of Adventure - Web Edition
 * ElfPalaceScene.js
 *
 * The Elven Palace — Queen Elarwen the Eternally Unimpressed has seen
 * three thousand years of everything. Your quest amuses her MILDLY,
 * which the courtiers assure you is the highest honor in living memory.
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

export default class ElfPalaceScene extends BaseScene {
    constructor() {
        super({ key: SCENES.ELF_PALACE });
    }

    create() {
        this.setupScene();
        this.gameState.visitLocation('Elven Palace');
        this.startGameMusic('run_to_dream');
        this.setBackground(['elf_palace_bg', 'sorcerer_bg']);
        this.addAmbient('sparkles');

        this.addTitle('The Elven Palace', '#FFD700');

        if (this.gameState.hasItem('Elven Charm')) {
            this.showCourtFriend();
            return;
        }

        this.addText(SCREEN_WIDTH/2, 130,
            'Vaulted ceilings of living wood. Fountains that sing in harmony.\nOn a distant throne sits the Queen, radiating serene boredom.', 15);

        this.addSpeech(SCREEN_WIDTH/2, 195,
            '"A mortal." Queen Elarwen\'s voice carries effortlessly.\n"I am three thousand years old. Amuse me. Others have tried.\nThe last interesting thing happened four hundred years ago. It was a duck."', '#E8D8F8', 13);

        this.addText(SCREEN_WIDTH/2, 330, '👑 🧝‍♀️', 52);
        this.addText(SCREEN_WIDTH/2, 410, 'Queen Elarwen the Eternally Unimpressed', 15, '#FFD97A');

        this.addText(SCREEN_WIDTH/2, 480, 'How do you amuse an immortal queen?', 15);

        this.createChoiceButton(210, 545, 'Tell her about Steve\nthe troll\'s baby name book', () => {
            this.showExchange(
                'You recount the tale of Steve, the troll who chose his own name\nfrom a baby name book. You do the voices.',
                'A courtier GASPS. The Queen\'s left eyebrow rises one (1) millimeter.\n"Steve," she repeats. The word hangs in the air like a bell.\n"That is the finest thing I have heard since the duck."'
            );
        }, 0x6A0DAD, 0x8B32CC);

        this.createChoiceButton(512, 545, 'Describe defeating a\ngiant squid with insults', () => {
            this.showExchange(
                'You describe the squid battle — especially the part where it\nlooked at its own tentacles and got sad about hugs.',
                '"You emotionally damaged... a kraken." The Queen leans forward\na full two inches. The court murmurs — she hasn\'t leaned since\nthe Second Age. "Mortals remain the most chaotic of all creatures."'
            );
        }, 0x6A0DAD, 0x8B32CC);

        this.createChoiceButton(814, 545, 'Admit you\'re mostly here\nbecause it\'s been Tuesday', () => {
            this.showExchange(
                '"Honestly? I heard it\'s been Tuesday for eleven years\nand I didn\'t want to wait for the next one."',
                'Silence. Then a sound nobody in the court has ever heard:\nthe Queen SNORTS. An actual snort. Two courtiers faint.\n"Eleven years," she wheezes softly. "It HAS been. It really has."'
            );
        }, 0x6A0DAD, 0x8B32CC);

        this.createButton(150, 700, '← Back to the Village', () => this.goTo(SCENES.ELF_VILLAGE), { width: 210 });
    }

    showExchange(playerLine, queenReply) {
        this.clearScene();
        this.setBackground(['elf_palace_bg', 'sorcerer_bg']);
        this.addAmbient('sparkles');
        this.addTitle('The Elven Palace', '#FFD700');

        this.addSpeech(SCREEN_WIDTH/2, 145, playerLine, '#4ECDC4', 14);
        this.addSpeech(SCREEN_WIDTH/2, 260, queenReply, '#E8D8F8', 14);

        this.addText(SCREEN_WIDTH/2, 390, '👑 ✨', 52);

        this.addSpeech(SCREEN_WIDTH/2, 465,
            '"You have achieved MILD AMUSEMENT — the highest honor granted\nin nine centuries. Take this charm. And some waybread.\nOne bite fills a grown man. Steve once ate twelve. We watched."', '#E8D8F8', 13);

        this.createButton(SCREEN_WIDTH/2, 565, '🍀 Accept the royal gifts', () => this.acceptGifts(), {
            width: 260, color: 0x6A0DAD, hover: 0x8B32CC
        });
        this.createButton(150, 700, '← Back to the Village', () => this.goTo(SCENES.ELF_VILLAGE), { width: 210 });
    }

    acceptGifts() {
        this.gameState.addItem('Elven Charm');
        const gotBread = !this.gameState.hasItem(ITEMS.FOOD.name);
        if (gotBread) {
            this.gameState.addItem(ITEMS.FOOD.name);
        }
        this.sound.play('special_sound', { volume: 0.7 });
        this.game.events.emit('inventory-updated');

        this.clearScene();
        this.setBackground(['elf_palace_bg', 'sorcerer_bg']);
        this.addAmbient('sparkles');
        this.addTitle('Honored Guest!', '#FFD700');

        this.addText(SCREEN_WIDTH/2, 200, '🍀', 64);
        const msg = this.addText(SCREEN_WIDTH/2, 290, '✨ ELVEN CHARM OBTAINED! ✨', 26, '#FFD700', { fontStyle: 'bold' });
        this.tweens.add({ targets: msg, alpha: 0.35, duration: 800, yoyo: true, repeat: 3 });

        this.addText(SCREEN_WIDTH/2, 370,
            gotBread
                ? 'You also received Elven Waybread! (Counts as Food —\ntroll-distraction-grade carbohydrates, elf-guaranteed.)'
                : 'The Queen notes you already carry bread. "Provisioned AND\namusing," she murmurs. "The duck would have liked you."',
            14, '#4ecdc4');

        this.addSpeech(SCREEN_WIDTH/2, 460,
            '"Return whenever you wish, Mildly Amusing One.\nIt will still be Tuesday."', '#E8D8F8');

        this.createButton(SCREEN_WIDTH/2, 590, '← Back to the Village', () => this.goTo(SCENES.ELF_VILLAGE), { width: 220 });
        this.createButton(874, 700, 'Back to the Meadow', () => this.goTo(SCENES.MEADOW), { width: 200 });
    }

    showCourtFriend() {
        this.addText(SCREEN_WIDTH/2, 140,
            'The court parts as you enter. You are, officially,\nThe Mildly Amusing One. There is a small plaque.', 16);

        this.addSpeech(SCREEN_WIDTH/2, 230,
            '"Ah. The mortal." Queen Elarwen almost smiles. Two courtiers\nbrace themselves in case she snorts again. "Still Tuesday.\nDo come back when you\'ve emotionally damaged something new."', '#E8D8F8', 14);

        this.addText(SCREEN_WIDTH/2, 380, '👑 🍀', 56);

        this.createButton(SCREEN_WIDTH/2, 590, '← Back to the Village', () => this.goTo(SCENES.ELF_VILLAGE), { width: 220 });
        this.createButton(874, 700, 'Back to the Meadow', () => this.goTo(SCENES.MEADOW), { width: 200 });
    }
}
