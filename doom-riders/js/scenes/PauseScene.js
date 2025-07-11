import { SCREEN_WIDTH, SCREEN_HEIGHT, SCENES } from '../GameData.js';

export default class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.PAUSE });
    }

    create() {
        // Semi-transparent overlay
        this.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, SCREEN_WIDTH, SCREEN_HEIGHT, 0x000000, 0.7);
        
        // Pause title
        this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 - 100, 'GAME PAUSED', {
            fontSize: '48px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // Menu buttons
        this.createButton(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'RESUME', () => {
            this.scene.stop();
            this.scene.resume(SCENES.GAME);
        });
        
        this.createButton(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + 80, 'MAIN MENU', () => {
            this.scene.stop();
            this.scene.stop(SCENES.GAME);
            this.scene.start(SCENES.MAIN_MENU);
        });
        
        // Controls reminder
        this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + 180, 'Press P to resume', {
            fontSize: '16px',
            fill: '#CCCCCC',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // Music credits
        this.displayMusicCredits();
        
        // Setup keyboard
        this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    }
    
    update() {
        if (this.pauseKey.isDown) {
            this.scene.stop();
            this.scene.resume(SCENES.GAME);
        }
    }
    
    displayMusicCredits() {
        // Get current track info from GameScene
        const gameScene = this.scene.get(SCENES.GAME);
        
        if (gameScene && gameScene.currentTrackInfo) {
            const trackInfo = gameScene.currentTrackInfo;
            
            // Music credits title
            this.add.text(50, SCREEN_HEIGHT - 120, '♪ Now Playing:', {
                fontSize: '14px',
                fill: '#FFD700',
                fontFamily: 'Arial',
                fontWeight: 'bold'
            });
            
            // Track information
            this.add.text(50, SCREEN_HEIGHT - 100, `"${trackInfo.title}" by ${trackInfo.artist}`, {
                fontSize: '12px',
                fill: '#FFFFFF',
                fontFamily: 'Arial'
            });
            
            // Source and license
            this.add.text(50, SCREEN_HEIGHT - 80, `Source: ${trackInfo.source} | License: ${trackInfo.license}`, {
                fontSize: '10px',
                fill: '#CCCCCC',
                fontFamily: 'Arial'
            });
        } else {
            // Fallback if no track info available
            this.add.text(50, SCREEN_HEIGHT - 100, '♪ Music from Free Music Archive', {
                fontSize: '12px',
                fill: '#CCCCCC',
                fontFamily: 'Arial'
            });
        }
    }

    createButton(x, y, text, callback) {
        const button = this.add.rectangle(x, y, 200, 50, 0x444444)
            .setInteractive()
            .on('pointerdown', callback)
            .on('pointerover', () => button.setFillStyle(0x666666))
            .on('pointerout', () => button.setFillStyle(0x444444));
        
        this.add.text(x, y, text, {
            fontSize: '18px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        return button;
    }
}