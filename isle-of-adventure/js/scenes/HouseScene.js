/*
 * Isle of Adventure - Web Edition
 * HouseScene.js
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

export default class HouseScene extends BaseScene {
    constructor() {
        super({ key: SCENES.HOUSE });
    }

    create() {
        this.setupScene();
        this.gameState.visitLocation('House');
        this.startGameMusic('serene_journey');
        this.setBackground('house_bg');

        this.addTitle('Inside the House');

        this.addText(SCREEN_WIDTH/2, 135,
            'Someone left adventuring gear lying around with a note:\n' +
            '"Free to a good home. PLEASE take it. My spouse says it\'s cluttering the hallway."', 15);

        // Collectible items spread around the room
        this.createItem(230, 330, '🏹', ITEMS.BOW.name, 'A sturdy bow. Slightly used. One careful owner.');
        this.createItem(420, 330, '🎯', ITEMS.ARROWS.name, 'Arrows! The pointy ends go forward.');
        this.createItem(610, 330, '🦺', ITEMS.LEATHER_ARMOR.name, 'Leather armor. Smells like adventure (and cow).');
        this.createItem(800, 330, '🍞', ITEMS.FOOD.name, 'Fresh bread. Trolls are said to LOVE carbs.');

        // Gear checklist so players know when they're battle-ready
        this.checklist = this.addText(SCREEN_WIDTH/2, 560, '', 15);
        this.updateChecklist();

        this.createButton(SCREEN_WIDTH/2, 700, 'Return to Village', () => this.goTo(SCENES.VILLAGE));
    }

    createItem(x, y, emoji, name, blurb) {
        if (this.gameState.hasItem(name)) {
            this.addText(x, y, '✓', 40, '#4ecdc4');
            this.addText(x, y + 52, `${name}\n(taken)`, 12, '#8fd8cf');
            return;
        }

        const itemSprite = this.add.text(x, y, emoji, { fontSize: '44px' }).setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.collectItem(name, blurb, itemSprite, x, y))
            .on('pointerover', () => {
                this.tweens.add({ targets: itemSprite, scale: 1.2, duration: 120 });
            })
            .on('pointerout', () => {
                this.tweens.add({ targets: itemSprite, scale: 1.0, duration: 120 });
            });

        // Gentle bob so collectibles feel alive
        this.tweens.add({
            targets: itemSprite, y: y - 6, duration: 1400,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        this.addText(x, y + 52, name, 13);
    }

    updateChecklist() {
        if (!this.checklist) return;
        const gear = ['Bow', 'Arrows', 'Leather Armor'].filter(i => this.gameState.hasItem(i));
        this.checklist.setText(gear.length === 3
            ? '⚔️ You are fully equipped for battle!'
            : `Battle gear collected: ${gear.length} / 3 — grab it all before picking fights.`);
        this.checklist.setFill(gear.length === 3 ? '#7CFC90' : '#FFD97A');
    }

    collectItem(name, blurb, sprite, x, y) {
        this.gameState.addItem(name);
        this.sound.play('special_sound', { volume: 0.6 });
        this.game.events.emit('inventory-updated');

        this.celebrate(x, y - 60, `Got ${name}!`, '#4ecdc4');
        const note = this.addText(SCREEN_WIDTH/2, 470, blurb, 14, '#FFE9A8');
        this.time.delayedCall(2600, () => { if (note) note.destroy(); });

        this.tweens.killTweensOf(sprite);
        sprite.destroy();
        this.addText(x, y, '✓', 40, '#4ecdc4');
        this.updateChecklist();
    }
}
