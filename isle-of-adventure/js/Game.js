/*
 * Battle of the Druids - Web Edition
 * Game.js
 * 
 * Copyright (c) 2025 TitanBlade Games
 * 
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 * 
 * https://github.com/sunstar2423/titanblade-games
 */

import { SCREEN_WIDTH, SCREEN_HEIGHT, SCENES } from './GameData.js';
import GameState from './GameState.js';
import MusicManager from './MusicManager.js';
import PreloadScene from './scenes/PreloadScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import VillageScene from './scenes/VillageScene.js';
import HouseScene from './scenes/HouseScene.js';
import ForestScene from './scenes/ForestScene.js';
import ForkScene from './scenes/ForkScene.js';
import MountainsScene from './scenes/MountainsScene.js';
import CaveScene from './scenes/CaveScene.js';
import TreasureScene from './scenes/TreasureScene.js';
import ShoreScene from './scenes/ShoreScene.js';
import BoatScene from './scenes/BoatScene.js';
import SquidBattleScene from './scenes/SquidBattleScene.js';
import PirateIslandScene from './scenes/PirateIslandScene.js';
import SorcererScene from './scenes/SorcererScene.js';
import PortalScene from './scenes/PortalScene.js';
import CreditsScene from './scenes/CreditsScene.js';

class Game {
    constructor() {
        this.gameState = new GameState();
        this.config = {
            type: Phaser.AUTO,
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
            parent: 'game-container',
            backgroundColor: '#2c3e50',
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                min: {
                    width: 320,
                    height: 240
                },
                max: {
                    width: SCREEN_WIDTH,
                    height: SCREEN_HEIGHT
                }
            },
            input: {
                keyboard: true,
                mouse: true,
                touch: {
                    capture: false  // Allow native touch gestures to pass through
                }
            },
            scene: [
                PreloadScene,
                MainMenuScene,
                VillageScene,
                HouseScene,
                ForestScene,
                ForkScene,
                MountainsScene,
                CaveScene,
                TreasureScene,
                ShoreScene,
                BoatScene,
                SquidBattleScene,
                PirateIslandScene,
                SorcererScene,
                PortalScene,
                CreditsScene
            ]
        };
        
        this.game = new Phaser.Game(this.config);
        this.game.registry.set('gameState', this.gameState);

        // Expose the Phaser game so DOM controls (e.g. the mute button) can reach it
        window.game = this.game;
        this.setupAudioToggle();
        
        
        // Create global music manager that will be accessible to all scenes
        this.musicManager = null;
        this.game.events.once('ready', () => {
            this.musicManager = new MusicManager(this.game.scene.getScene('PreloadScene'));
            this.game.registry.set('musicManager', this.musicManager);
        });
        
        this.setupInventoryDisplay();
    }

    setupInventoryDisplay() {
        this.inventoryList = document.getElementById('inventory-list');
        this.updateInventoryDisplay();
        
        // Update inventory display whenever items are added
        this.game.events.on('inventory-updated', () => {
            this.updateInventoryDisplay();
        });
    }

    updateInventoryDisplay() {
        if (!this.inventoryList) return;

        const panel = document.getElementById('inventory');
        const items = this.gameState.inventory;

        // Hide the panel entirely when there is nothing to show (e.g. on the menu)
        if (panel) {
            panel.style.display = items.length ? 'block' : 'none';
        }

        const heading = panel ? panel.querySelector('h3') : null;
        if (heading) {
            heading.textContent = `Inventory (${items.length})`;
        }

        this.inventoryList.innerHTML = '';
        items.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            this.inventoryList.appendChild(li);
        });
    }

    setupAudioToggle() {
        const toggle = document.getElementById('audio-toggle');
        if (!toggle) return;

        const render = () => {
            const muted = this.game.sound.mute;
            toggle.textContent = muted ? '🔇' : '🔊';
            toggle.setAttribute('aria-label', muted ? 'Unmute audio' : 'Mute audio');
            toggle.setAttribute('aria-pressed', String(muted));
        };

        toggle.addEventListener('click', () => {
            this.game.sound.mute = !this.game.sound.mute;
            render();
        });

        render();
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game();
});