/*
 * Isle of Adventure - Web Edition
 * PirateBaseScene.js
 *
 * The Secret Pirate Base — face Cap'n Barnacles in a three-round
 * duel of wits to win the Bottle of Rum. Inspired by the noble
 * pirate tradition of insult sword-fighting.
 * Uses images/piratebase.png when present, falling back to island art.
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

const DUEL_ROUNDS = [
    {
        taunt: '"Ye call yerself an adventurer? I\'ve seen scarier things\nwash out of me BOOT!"',
        options: [
            { text: '"Funny — your crew says that\'s\nwhere you keep the treasure."', win: true,
              reaction: 'The crew goes "OOOOOH!" Cap\'n Barnacles checks his boot\nbefore he can stop himself. "...LUCKY GUESS!"' },
            { text: '"Well... your boot sounds\nvery scary."', win: false,
              reaction: '"Aye, it IS scary," the Cap\'n says, confused but flattered.\nThe crew shakes their heads. Try again, wit-fighter.' },
            { text: '"I AM an adventurer! I have\nan inventory and everything!"', win: false,
              reaction: '"An INVENTORY?" The crew laughs AT you, not with you.\n"What\'s next, a quest log?" Regroup and try again!' }
        ]
    },
    {
        taunt: '"I\'ve sailed the seven seas, and never met a landlubber\nwith such WOBBLY sea legs!"',
        options: [
            { text: '"My legs are extremely\nsturdy, actually."', win: false,
              reaction: 'You stand very still to demonstrate. A wave rocks the dock.\nYou wobble. The crew snickers. Point: Barnacles.' },
            { text: '"Seven seas? Your ship\'s been\nbeached so long it has a garden."', win: true,
              reaction: 'Silence. Somewhere, a crewman whispers "he DOES grow\ntomatoes on the poop deck..." The Cap\'n turns purple.' },
            { text: '"Wobbly legs are in\nfashion this year."', win: false,
              reaction: '"FASHION?!" The Cap\'n gestures at his own ensemble —\nfour belts, zero shirts. You cannot out-fashion this man. Again!' }
        ]
    },
    {
        taunt: '"Last chance, barnacle-brain! Why should I share me\nfinest rum with the likes of YOU?"',
        options: [
            { text: '"Because sharing\nis caring?"', win: false,
              reaction: '"SHARING IS—" The Cap\'n has to sit down. "Crew! The landlubber\nthinks this is a FRIENDSHIP CIRCLE!" Have another go.' },
            { text: '"I\'ll write you a\nfive-star review."', win: false,
              reaction: '"A review?! We\'re PIRATES! We have one star! It\'s on our FLAG!"\nFair point. Try again.' },
            { text: '"Because I took an EYE off a giant\nsquid. Your rum doesn\'t scare me."', win: true,
              reaction: 'You produce the squid eye. It winks.\nThe crew gasps. A pirate faints.\n"...BY NEPTUNE\'S KNEES," whispers Cap\'n Barnacles. "It\'s TRUE."' }
        ]
    }
];

export default class PirateBaseScene extends BaseScene {
    constructor() {
        super({ key: SCENES.PIRATE_BASE });
    }

    create() {
        this.setupScene();
        this.gameState.visitLocation('Pirate Base');
        this.startGameMusic('run_to_dream');
        this.setBackground(['pirate_base_bg', 'pirate_island_bg']);
        this.addAmbient('embers');

        this.addTitle('The Secret Pirate Base');

        if (this.gameState.hasItem(ITEMS.RUM.name)) {
            this.showChampionState();
            return;
        }

        this.addText(SCREEN_WIDTH/2, 135,
            'Hidden behind the palms: watchtowers, rum barrels, and a throne\nmade of driftwood. On it sits the legendary Cap\'n Barnacles.', 15);

        this.addSpeech(SCREEN_WIDTH/2, 210,
            '"So! Ye want me FINEST rum..." He strokes a beard that has\nits own smaller beard. "Then face me in a DUEL OF WITS!\nThree rounds! Best me banter and the bottle be yours!"', '#F39C12', 14);

        this.addText(SCREEN_WIDTH/2, 330, '🏴‍☠️👑', 64);
        this.addText(SCREEN_WIDTH/2, 410, 'Cap\'n Barnacles — Undefeated Wit-Duelist (self-declared)', 15, '#FFD97A');

        this.addSpeech(SCREEN_WIDTH/2, 470,
            'The crew gathers in a circle, chanting "DUEL! DUEL! DUEL!"\nOne of them sells popcorn. Where did he GET popcorn?', '#DDDDDD', 13);

        this.createButton(SCREEN_WIDTH/2, 580, '🎭 Begin the Duel of Wits!', () => this.playRound(0), {
            width: 280, color: 0x8B4513, hover: 0xA0522D
        });
        this.createButton(150, 700, '← Back to Pirate Island', () => this.goTo(SCENES.PIRATE_ISLAND), { width: 220 });
    }

    playRound(roundIndex) {
        const round = DUEL_ROUNDS[roundIndex];
        this.clearScene();
        this.setBackground(['pirate_base_bg', 'pirate_island_bg']);
        this.addAmbient('embers');
        this.addTitle(`Duel of Wits — Round ${roundIndex + 1} of ${DUEL_ROUNDS.length}`);

        // Round progress pips
        const pips = DUEL_ROUNDS.map((_, i) => (i < roundIndex ? '🟢' : i === roundIndex ? '🟡' : '⚪')).join(' ');
        this.addText(SCREEN_WIDTH/2, 115, pips, 18);

        this.addText(SCREEN_WIDTH/2, 170, '🏴‍☠️👑', 52);
        this.addSpeech(SCREEN_WIDTH/2, 260, `Cap'n Barnacles sneers:\n${round.taunt}`, '#F39C12', 15);

        this.addText(SCREEN_WIDTH/2, 380, 'Choose your comeback...', 15);

        const xs = [210, 512, 814];
        // Same fixed order every time — this is a puzzle, not a slot machine
        round.options.forEach((opt, i) => {
            this.createChoiceButton(xs[i], 460, opt.text, () => this.resolveRound(roundIndex, opt), 0x1B4F72, 0x2E86C1);
        });

        this.createButton(150, 700, '← Concede (for now)', () => this.goTo(SCENES.PIRATE_ISLAND), { width: 210 });
    }

    resolveRound(roundIndex, option) {
        this.clearScene();
        this.setBackground(['pirate_base_bg', 'pirate_island_bg']);
        this.addAmbient('embers');

        if (option.win) {
            this.sound.play('heal_sound', { volume: 0.6 });
            this.addTitle(`Round ${roundIndex + 1} — WON!`, '#7CFC90');
            this.addSpeech(SCREEN_WIDTH/2, 200, option.reaction, '#FFE9A8', 15);
            this.addText(SCREEN_WIDTH/2, 330, '😂 ⚔️ 😂', 44);

            const next = roundIndex + 1;
            if (next < DUEL_ROUNDS.length) {
                this.addSpeech(SCREEN_WIDTH/2, 420,
                    `"Not bad, landlubber..." The Cap'n cracks his knuckles.\n"But the duel's not done yet!"`, '#F39C12', 14);
                this.createButton(SCREEN_WIDTH/2, 560, `Round ${next + 1} →`, () => this.playRound(next), { width: 220 });
            } else {
                this.createButton(SCREEN_WIDTH/2, 560, '🏆 Claim your prize!', () => this.winDuel(), {
                    width: 250, color: 0x8B4513, hover: 0xA0522D
                });
            }
        } else {
            this.addTitle(`Round ${roundIndex + 1} — Swing and a miss!`, '#FF9E9E');
            this.addSpeech(SCREEN_WIDTH/2, 200, option.reaction, '#FFE9A8', 15);
            this.addText(SCREEN_WIDTH/2, 330, '🤦 🏴‍☠️ 🤦', 44);
            this.addSpeech(SCREEN_WIDTH/2, 420,
                '"HAR! Is that yer best?" The Cap\'n grins. "Compose yerself\nand try again — I got all day. Pirating\'s mostly waiting, honestly."',
                '#F39C12', 14);
            this.createButton(SCREEN_WIDTH/2, 560, '↩ Try that round again', () => this.playRound(roundIndex), { width: 250 });
        }

        this.createButton(150, 700, '← Concede (for now)', () => this.goTo(SCENES.PIRATE_ISLAND), { width: 210 });
    }

    winDuel() {
        this.gameState.addItem(ITEMS.RUM.name);
        this.sound.play('special_sound', { volume: 0.7 });
        this.game.events.emit('inventory-updated');

        this.clearScene();
        this.setBackground(['pirate_base_bg', 'pirate_island_bg']);
        this.addAmbient('sparkles');

        this.addTitle('CHAMPION OF WITS!', '#FFD700');

        this.addSpeech(SCREEN_WIDTH/2, 180,
            'Cap\'n Barnacles wipes away a proud tear.\n"In forty years, no one\'s bested me banter. The rum is yours —\nthe GOOD bottle. The label says \'For Emergencies Only\'.\nThis counts. I\'m emotional."', '#F39C12', 15);

        const rum = this.addText(SCREEN_WIDTH/2, 340, '🍾', 72);
        this.tweens.add({
            targets: rum, y: 325, duration: 1300,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        const msg = this.addText(SCREEN_WIDTH/2, 250, '✨ BOTTLE OF RUM OBTAINED! ✨', 26, '#FFD700', { fontStyle: 'bold' });
        this.tweens.add({ targets: msg, alpha: 0.35, duration: 800, yoyo: true, repeat: 3 });

        this.addText(SCREEN_WIDTH/2, 440,
            'One of the sorcerer\'s three sacred items!\nThe crew carries you around on their shoulders exactly once,\nthen puts you down because you\'re "heavier than you look".', 14, '#4ecdc4');

        this.createButton(SCREEN_WIDTH/2, 610, 'Sail back triumphant →', () => this.goTo(SCENES.VILLAGE), {
            width: 260, color: 0x8B4513, hover: 0xA0522D
        });
        this.createButton(150, 700, '← Pirate Island', () => this.goTo(SCENES.PIRATE_ISLAND), { width: 190 });
    }

    showChampionState() {
        this.addText(SCREEN_WIDTH/2, 150,
            'A banner now hangs over the base:\n"HOME OF THE CAP\'N WHO LOST A WIT-DUEL (BUT GRACEFULLY)"', 15);

        this.addSpeech(SCREEN_WIDTH/2, 240,
            '"CHAMPION!" Cap\'n Barnacles salutes you. "The crew\'s been\nquotin\' yer comebacks all week. Even Gerald the crab heard.\nHow\'s the rum? Don\'t answer. I\'m still emotional."', '#F39C12', 14);

        this.addText(SCREEN_WIDTH/2, 380, '🏴‍☠️🏆', 64);

        this.createButton(SCREEN_WIDTH/2, 590, '← Back to Pirate Island', () => this.goTo(SCENES.PIRATE_ISLAND), { width: 240 });
        this.createButton(SCREEN_WIDTH/2, 660, 'Return to the Village', () => this.goTo(SCENES.VILLAGE), { width: 240 });
    }
}
