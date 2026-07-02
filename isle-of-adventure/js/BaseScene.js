/*
 * Isle of Adventure - Web Edition
 * BaseScene.js
 *
 * Shared foundation for all game scenes: background handling with
 * fallbacks, fade transitions, polished buttons, dialogue choices,
 * ambient particles and music management.
 *
 * Copyright (c) 2025 TitanBlade Games
 *
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 *
 * https://github.com/sunstar2423/titanblade-games
 */

import { SCREEN_WIDTH, SCREEN_HEIGHT } from './GameData.js';

export default class BaseScene extends Phaser.Scene {
    /**
     * Call first in create(). Fades the camera in and resets transition state.
     */
    setupScene() {
        this.gameState = this.registry.get('gameState');
        this._transitioning = false;
        this.cameras.main.fadeIn(400, 0, 0, 0);
    }

    /**
     * Adds a cover-scaled background with a slow "Ken Burns" drift.
     * Accepts a single texture key or an array of keys — the first key
     * that exists is used, so optional artwork can fall back gracefully.
     */
    setBackground(keys, kenBurns = true) {
        const list = Array.isArray(keys) ? keys : [keys];
        const key = list.find(k => this.textures.exists(k)) || list[list.length - 1];

        const bg = this.add.image(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, key);
        const scale = Math.max(SCREEN_WIDTH / bg.width, SCREEN_HEIGHT / bg.height);
        bg.setScale(scale);

        if (kenBurns) {
            // Very slow, subtle zoom for a living, cinematic feel
            this.tweens.add({
                targets: bg,
                scale: scale * 1.06,
                duration: 22000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
        return bg;
    }

    /** Scene title, consistent across the game. */
    addTitle(text, color = '#FFFFFF') {
        return this.add.text(SCREEN_WIDTH / 2, 60, text, {
            fontSize: '38px',
            fill: color,
            fontFamily: 'Georgia, "Times New Roman", serif',
            stroke: '#000000',
            strokeThickness: 5,
            shadow: { offsetX: 2, offsetY: 3, color: '#000000', blur: 6, fill: true }
        }).setOrigin(0.5);
    }

    /**
     * Stroked, readable body text. Prose (multiline or longer than ~40
     * characters) automatically gets a dark backing panel so it stays
     * readable over detailed artwork. Pass `extra.panel: true/false` to
     * force it either way.
     */
    addText(x, y, text, size = 17, color = '#FFFFFF', extra = {}) {
        const { panel, ...style } = extra;
        const txt = this.add.text(x, y, text, {
            fontSize: `${size}px`,
            fill: color,
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3,
            shadow: { offsetX: 1, offsetY: 2, color: '#000000', blur: 4, fill: true },
            ...style
        }).setOrigin(0.5);

        const wantsPanel = panel !== undefined
            ? panel
            : (text.includes('\n') || text.length > 40);

        if (wantsPanel) {
            const pad = { x: 18, y: 10 };
            const backing = this.add.rectangle(
                x, y, txt.width + pad.x * 2, txt.height + pad.y * 2, 0x000000, 0.55
            );
            backing.setStrokeStyle(1, 0xFFFFFF, 0.12);
            backing.setDepth(6);
            txt.setDepth(6.5);
            // The panel lives and dies with its text
            txt.once('destroy', () => { if (backing.scene) backing.destroy(); });
        }

        return txt;
    }

    /** Italic character speech — always panelled, never below 16px. */
    addSpeech(x, y, text, color = '#FFFF99', size = 15) {
        return this.addText(x, y, text, Math.max(size, 16), color, {
            fontStyle: 'italic', panel: true
        });
    }

    /**
     * A polished main button: fill, gold border, hover grow, click sound.
     */
    createButton(x, y, text, callback, opts = {}) {
        const w = opts.width || 210;
        const h = opts.height || 46;
        const color = opts.color !== undefined ? opts.color : 0x34495e;
        const hover = opts.hover !== undefined ? opts.hover : 0x5d6d7e;

        const container = this.add.container(x, y);
        const shadow = this.add.rectangle(3, 4, w, h, 0x000000, 0.45);
        const bg = this.add.rectangle(0, 0, w, h, color, 0.92);
        bg.setStrokeStyle(2, 0xFFD700, 0.95);
        const label = this.add.text(0, 0, text, {
            fontSize: `${opts.fontSize || 17}px`,
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        container.add([shadow, bg, label]);
        container.setSize(w, h);

        container.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                bg.setFillStyle(hover, 1);
                this.tweens.add({ targets: container, scale: 1.06, duration: 120, ease: 'Sine.easeOut' });
            })
            .on('pointerout', () => {
                bg.setFillStyle(color, 0.92);
                this.tweens.add({ targets: container, scale: 1, duration: 120, ease: 'Sine.easeOut' });
            })
            .on('pointerdown', () => {
                this.sound.play('click_sound', { volume: 0.5 });
                callback();
            });

        return container;
    }

    /**
     * A dialogue-choice button — taller, wraps two lines, themed color.
     */
    createChoiceButton(x, y, text, callback, color = 0x2C5F2D, hover = 0x4A7C59) {
        return this.createButton(x, y, text, callback, {
            width: 280, height: 60, color, hover, fontSize: 14
        });
    }

    /** Fade out, then switch scene. Guards against double clicks. */
    goTo(sceneKey) {
        if (this._transitioning) return;
        this._transitioning = true;
        this.cameras.main.fadeOut(320, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start(sceneKey);
        });
    }

    /**
     * Clears the scene for a sub-state change (dialogue -> battle, etc.)
     * while keeping tweens/timers from leaking onto destroyed objects.
     */
    clearScene() {
        this.tweens.killAll();
        this.time.removeAllEvents();
        this.children.removeAll();
    }

    /**
     * Ambient particle layers. Types: fireflies | embers | bubbles | sparkles | snowspray
     */
    addAmbient(type) {
        if (!this.textures.exists('particle_dot')) return null;
        const configs = {
            fireflies: {
                x: { min: 0, max: SCREEN_WIDTH }, y: { min: 200, max: SCREEN_HEIGHT - 60 },
                lifespan: 6000, speedX: { min: -12, max: 12 }, speedY: { min: -8, max: 8 },
                scale: { start: 0.55, end: 0 }, alpha: { start: 0.9, end: 0 },
                quantity: 1, frequency: 420, tint: 0xffee66, blendMode: 'ADD'
            },
            embers: {
                x: { min: 0, max: SCREEN_WIDTH }, y: SCREEN_HEIGHT + 10,
                lifespan: 7000, speedY: { min: -35, max: -14 }, speedX: { min: -10, max: 10 },
                scale: { start: 0.5, end: 0 }, alpha: { start: 0.85, end: 0 },
                quantity: 1, frequency: 300, tint: 0xff7733, blendMode: 'ADD'
            },
            bubbles: {
                x: { min: 0, max: SCREEN_WIDTH }, y: SCREEN_HEIGHT + 10,
                lifespan: 8000, speedY: { min: -40, max: -18 }, speedX: { min: -6, max: 6 },
                scale: { start: 0.35, end: 0.8 }, alpha: { start: 0.5, end: 0 },
                quantity: 1, frequency: 380, tint: 0xa8e6ff, blendMode: 'ADD'
            },
            sparkles: {
                x: { min: 0, max: SCREEN_WIDTH }, y: { min: 80, max: SCREEN_HEIGHT - 40 },
                lifespan: 3200, speedY: { min: -12, max: 12 }, speedX: { min: -12, max: 12 },
                scale: { start: 0.65, end: 0 }, alpha: { start: 1, end: 0 },
                quantity: 1, frequency: 260, tint: [0xd08bff, 0x8bd9ff, 0xfff3a3], blendMode: 'ADD'
            },
            seaspray: {
                x: { min: 0, max: SCREEN_WIDTH }, y: { min: SCREEN_HEIGHT - 220, max: SCREEN_HEIGHT },
                lifespan: 4200, speedY: { min: -25, max: -8 }, speedX: { min: 8, max: 26 },
                scale: { start: 0.35, end: 0 }, alpha: { start: 0.55, end: 0 },
                quantity: 1, frequency: 360, tint: 0xe8f7ff, blendMode: 'ADD'
            }
        };
        const cfg = configs[type];
        if (!cfg) return null;
        return this.add.particles(0, 0, 'particle_dot', cfg).setDepth(5);
    }

    /** Gentle idle sway/breathing for a character image. */
    animateCharacter(img, duration = 2200, sway = 3) {
        this.tweens.add({
            targets: img, x: img.x + sway, duration,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
        this.tweens.add({
            targets: img, y: img.y + 2, duration: duration * 0.7,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
        this.tweens.add({
            targets: img, rotation: 0.018, duration: duration * 1.2,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
    }

    /** Floating pickup animation + collect feedback. */
    celebrate(x, y, text, color = '#FFD700') {
        // No panel: this text floats upward and a static backing would be left behind
        const msg = this.addText(x, y, text, 22, color, { fontStyle: 'bold', panel: false });
        this.tweens.add({
            targets: msg, y: y - 26, duration: 900, ease: 'Sine.easeOut'
        });
        this.tweens.add({
            targets: msg, alpha: 0.25, duration: 700, yoyo: true, repeat: 2
        });
        return msg;
    }

    /** Keeps one shared looping track across scenes; only switches when the key changes. */
    startGameMusic(musicKey) {
        const currentMusic = this.registry.get('currentMusic');
        const currentKey = this.registry.get('currentMusicKey');
        if (currentKey === musicKey && currentMusic && currentMusic.isPlaying) {
            return;
        }
        if (currentMusic) {
            currentMusic.stop();
        }
        const newMusic = this.sound.add(musicKey, { loop: true, volume: 0.2 });
        newMusic.play();
        this.registry.set('currentMusic', newMusic);
        this.registry.set('currentMusicKey', musicKey);
    }
}
