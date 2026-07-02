/*
 * Battle of the Druids - Web Edition
 * PreloadScene.js
 * 
 * Copyright (c) 2025 TitanBlade Games
 * 
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 * 
 * https://github.com/sunstar2423/titanblade-games
 */

import { SCREEN_WIDTH, SCREEN_HEIGHT, SCENES } from '../GameData.js';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // Create loading bar
        this.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, SCREEN_WIDTH, SCREEN_HEIGHT, 0x2c3e50);
        
        this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 - 50, 'Loading Isle of Adventure...', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        const progressBar = this.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 400, 20, 0x34495e);
        const progressFill = this.add.rectangle(SCREEN_WIDTH/2 - 200, SCREEN_HEIGHT/2, 0, 20, 0x4ecdc4);
        progressFill.setOrigin(0, 0.5); // Set origin to left-center so it grows from left

        const percentText = this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + 30, '0%', {
            fontSize: '16px',
            fill: '#4ecdc4',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Update progress bar
        this.load.on('progress', (progress) => {
            const fillWidth = 400 * progress;
            progressFill.width = fillWidth;
            // Keep the fill starting from the left edge of the container
            progressFill.x = SCREEN_WIDTH/2 - 200;
            percentText.setText(`${Math.round(progress * 100)}%`);
        });

        // Optional artwork: these may not exist yet. If a file is missing the
        // load fails quietly and scenes fall back to existing backgrounds.
        this.load.on('loaderror', (file) => {
            console.warn(`Optional asset not found (using fallback): ${file.key}`);
        });

        // Load all background images
        this.load.image('mainmenu', 'images/mainmenupage.png');
        this.load.image('village_bg', 'images/village_background.png');
        this.load.image('house_bg', 'images/house_background.png');
        this.load.image('forest_bg', 'images/forest_background.png');
        this.load.image('fork_bg', 'images/fork_background.png');
        this.load.image('mountains_bg', 'images/mountains_background.png');
        this.load.image('cave_bg', 'images/cave_background.png');
        this.load.image('treasure_bg', 'images/treasure_background.png');
        this.load.image('shore_bg', 'images/shore_background.png');
        this.load.image('boat_bg', 'images/boat_background.png');
        this.load.image('squid_battle_bg', 'images/squid_battle_background.png');
        this.load.image('pirate_island_bg', 'images/pirate_island_background.png');
        this.load.image('sorcerer_bg', 'images/sorcerer_background.png');
        this.load.image('portal_bg', 'images/portal_background.png');

        // New expansion artwork (optional — falls back if not present yet)
        this.load.image('beach_bg', 'images/beachscene.png');
        this.load.image('pirate_base_bg', 'images/piratebase.png');
        this.load.image('meadow_bg', 'images/peaceful meadow.png');
        this.load.image('lake_bg', 'images/peacefulfansyscenelake.png');
        this.load.image('elf_village_bg', 'images/elvestreehutvillage.png');
        this.load.image('elf_palace_bg', 'images/elves palace interior.png');
        this.load.image('mountain_pass_bg', 'images/mountainpass.png');
        this.load.image('troll_bridge_bg', 'images/trollbridge.png');
        this.load.image('river_bg', 'images/ragingriver.png');
        this.load.image('ruins_bg', 'images/ruinsonanisland.png');
        
        // Load character images with transparent backgrounds
        this.load.image('troll1', 'images/troll1.png');
        this.load.image('troll2', 'images/troll2.png');
        this.load.image('troll3', 'images/troll3.png');
        this.load.image('ogre', 'images/orge1.png');
        this.load.image('sorcerer_char', 'images/sorceror.png');
        
        // Load video files — some browsers/webviews can throw here (codec support);
        // never let the intro video take the whole game down with it.
        try {
            this.load.video('welcome_video', 'images/welcomevideo.mp4');
        } catch (e) {
            console.warn('Video not supported in this browser, skipping intro video:', e);
        }
        
        // Load music files
        this.load.audio('menumusic', 'sounds/menumusic.mp3');
        this.load.audio('run_to_dream', 'sounds/Lite Saturation - Run to the Dream (Romantic and Beautiful Background Piano Music).mp3');
        this.load.audio('serene_journey', 'sounds/Lite Saturation - Serene Journey (Romantic and Beautiful Background Piano Music).mp3');
        this.load.audio('electric_wind', 'sounds/Simon Mathewson - Electric wind.mp3.mp3');
        
        // Load sound effects
        this.load.audio('click_sound', 'sounds/click.wav');
        this.load.audio('special_sound', 'sounds/special.wav');
        this.load.audio('heal_sound', 'sounds/heal.wav');
        this.load.audio('star_music', 'sounds/Danny Bale - Star Music.mp3');
    }

    create() {
        // Tiny soft dot used by ambient particle effects (fireflies, embers, ...)
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xffffff, 1);
        g.fillCircle(4, 4, 4);
        g.generateTexture('particle_dot', 8, 8);
        g.destroy();

        // Once loading is complete, go to main menu
        this.scene.start('MainMenuScene');
    }
}