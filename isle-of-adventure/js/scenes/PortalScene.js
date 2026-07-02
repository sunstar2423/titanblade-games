/*
 * Isle of Adventure - Web Edition
 * PortalScene.js
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

export default class PortalScene extends BaseScene {
    constructor() {
        super({ key: SCENES.PORTAL });
    }

    create() {
        this.setupScene();

        // Electric wind ambience for the portal room
        this.electricWindSound = this.sound.add('electric_wind', { loop: true, volume: 0.3 });
        this.electricWindSound.play();
        this.events.once('shutdown', () => {
            if (this.electricWindSound) this.electricWindSound.stop();
        });

        this.startGameMusic('run_to_dream');
        this.setBackground('portal_bg');
        this.addAmbient('sparkles');

        this.addTitle('The Portal Home');

        this.addText(SCREEN_WIDTH/2, 135,
            'A glowing portal swirls before you, humming with magical energy\nand smelling faintly of rum. (The ritual, you assume.)', 16);

        this.createPortal();

        this.addText(SCREEN_WIDTH/2, 520,
            'One step and you\'re home. After everything —\ntrolls, ogres, squids, pirates — it comes down to one step.', 15, '#CCCCCC');

        this.createButton(SCREEN_WIDTH/2, 610, '🌀 Step Through the Portal', () => this.enterPortal(), {
            width: 280, color: 0x6A0DAD, hover: 0x8B32CC
        });
        this.createButton(150, 700, '← Back to Merlin', () => this.goTo(SCENES.SORCERER), {
            width: 190, color: 0x6A0DAD, hover: 0x8B32CC
        });
    }

    createPortal() {
        const cx = SCREEN_WIDTH/2, cy = 340;
        const portal = this.add.circle(cx, cy, 95, 0x6A0DAD, 0.8);
        const portalCenter = this.add.circle(cx, cy, 70, 0x9932CC, 0.6);
        const portalGlow = this.add.circle(cx, cy, 45, 0xFFFFFF, 0.9);

        this.tweens.add({
            targets: portal, scaleX: 1.12, scaleY: 1.12,
            duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
        this.tweens.add({
            targets: portalCenter, scaleX: 0.88, scaleY: 0.88, angle: 360,
            duration: 4000, repeat: -1, ease: 'Linear'
        });
        this.tweens.add({
            targets: portalGlow, alpha: 0.4,
            duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
    }

    enterPortal() {
        this.clearScene();

        if (this.electricWindSound) {
            this.electricWindSound.stop();
        }

        // Victory music
        const currentMusic = this.registry.get('currentMusic');
        if (currentMusic) currentMusic.stop();
        const victoryMusic = this.sound.add('star_music', { loop: true, volume: 0.3 });
        victoryMusic.play();
        this.registry.set('currentMusic', victoryMusic);
        this.registry.set('currentMusicKey', 'star_music');

        // Backdrop: looping credits video under a dark veil (portal art if video unavailable)
        this.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, SCREEN_WIDTH, SCREEN_HEIGHT, 0x000000);
        if (this.cache.video && this.cache.video.exists('welcome_video')) {
            const backgroundVideo = this.add.video(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'welcome_video');
            backgroundVideo.setScale(Math.max(SCREEN_WIDTH / backgroundVideo.width, SCREEN_HEIGHT / backgroundVideo.height));
            backgroundVideo.setAlpha(0.7);
            backgroundVideo.play(true);
            backgroundVideo.setDepth(1);
        } else {
            this.setBackground('portal_bg').setDepth(1);
        }
        this.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, SCREEN_WIDTH, SCREEN_HEIGHT, 0x000000, 0.35).setDepth(2);

        const stats = this.buildStats();

        this.addText(SCREEN_WIDTH/2, 170, 'QUEST COMPLETE!', 52, '#FFD700', { fontStyle: 'bold' }).setDepth(10);
        this.addText(SCREEN_WIDTH/2, 260,
            'You gathered the sacred items, out-fought monsters,\nout-witted pirates, and found your way home!', 18).setDepth(10);
        this.addText(SCREEN_WIDTH/2, 340, '🎆 🏆 🎆', 48).setDepth(10);
        this.addText(SCREEN_WIDTH/2, 440, stats, 15, '#CCCCCC').setDepth(10);

        this.createButton(SCREEN_WIDTH/2, 590, '🔁 Play Again', () => {
            this.gameState.reset();
            this.game.events.emit('inventory-updated');
            this.goTo(SCENES.VILLAGE);
        }, { width: 220, color: 0x6A0DAD, hover: 0x8B32CC }).setDepth(10);

        this.createButton(SCREEN_WIDTH/2, 660, 'Main Menu', () => {
            this.goTo('MainMenuScene');
        }, { width: 220, color: 0x6A0DAD, hover: 0x8B32CC }).setDepth(10);
    }

    buildStats() {
        const enemies = this.gameState.defeatedEnemies.length;
        const places = this.gameState.visitedLocations.length;
        const items = this.gameState.inventory.length;
        const breadDiplomacy = this.gameState.hasVisitedLocation('Bread Gambit');
        const trinkets = ['Lucky Pebble', 'Elven Charm', 'Ancient Coin']
            .filter(t => this.gameState.hasItem(t)).length;
        return `Adventure report:\n` +
            `${places} locations explored  •  ${enemies} foes bested  •  ${items} items pocketed\n` +
            `Optional wonders discovered: ${trinkets} / 3\n` +
            (breadDiplomacy ? 'Diplomatic use of baked goods: ✓' : 'Baked goods deployed: 0 (violence works too)');
    }
}
