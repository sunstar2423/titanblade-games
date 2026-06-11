import { SCREEN_WIDTH, SCREEN_HEIGHT, SCENES, COLORS, LEVEL_CONFIG } from '../GameData.js';

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.MAIN_MENU });
    }

    create() {
        // New background image
        const bg = this.add.image(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'menuBackground');
        
        // Scale background to fit screen if needed
        const scaleX = SCREEN_WIDTH / bg.width;
        const scaleY = SCREEN_HEIGHT / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale);
        
        // Game title
        this.add.text(SCREEN_WIDTH/2, 150, 'DOOM RIDERS', {
            fontSize: '64px',
            fill: '#FF4500',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Subtitle
        this.add.text(SCREEN_WIDTH/2, 220, 'Extreme Bike Racing Adventure', {
            fontSize: '24px',
            fill: '#000000',
            fontFamily: 'Arial',
            fontStyle: 'italic'
        }).setOrigin(0.5);
        
        // TitanBlade Games branding with enhanced visibility
        this.add.text(SCREEN_WIDTH/2, 280, 'A TitanBlade Games Production', {
            fontSize: '16px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Menu buttons
        this.createButton(SCREEN_WIDTH/2, 380, 'START GAME', () => {
            console.log('=== START GAME BUTTON CLICKED ===');
            console.log('Current scene key:', this.scene.key);
            console.log('Scene manager:', this.scene.manager);
            console.log('Available scenes:', this.scene.manager.scenes.map(s => s.scene.key));
            console.log('SCENES.GAME constant:', SCENES.GAME);
            
            // Validate scene exists
            const gameScene = this.scene.manager.getScene(SCENES.GAME);
            console.log('GameScene found:', gameScene);
            
            if (!gameScene) {
                console.error('🚨 GameScene not found in scene manager!');
                return;
            }
            
            try {
                console.log('About to call this.scene.start()...');
                this.scene.start(SCENES.GAME);
                console.log('scene.start() call completed');
                
                // Add timeout to detect if scene transition fails
                setTimeout(() => {
                    const currentScene = this.scene.manager.getScene(SCENES.GAME);
                    if (currentScene && !currentScene.scene.isActive()) {
                        console.error('🚨 GameScene failed to start within 2 seconds!');
                    }
                }, 2000);
                
            } catch (error) {
                console.error('🚨 Error starting GameScene:', error);
                console.error('Error stack:', error.stack);
            }
        });
        
        this.createButton(SCREEN_WIDTH/2, 450, 'BIKE STORE', () => {
            this.scene.start(SCENES.STORE);
        });
        
        this.createButton(SCREEN_WIDTH/2, 520, 'LEVEL SELECT', () => {
            this.showLevelSelect();
        });
        
        this.createButton(SCREEN_WIDTH/2, 590, 'RESET PROGRESS', () => {
            this.showResetConfirmation();
        });
        
        // Game stats with enhanced visibility
        const gameState = this.registry.get('gameState');
        this.add.text(SCREEN_WIDTH/2, 650, `High Score: ${gameState.highScore}`, {
            fontSize: '20px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Safe money display with NaN protection
        const safeMoney = (gameState.totalMoney !== undefined && !isNaN(gameState.totalMoney)) ? gameState.totalMoney : 0;
        this.add.text(SCREEN_WIDTH/2, 675, `Total Money: $${safeMoney}`, {
            fontSize: '20px',
            fill: '#00FF00',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        this.add.text(SCREEN_WIDTH/2, 700, `Current Level: ${gameState.currentLevel} | Unlocked: ${gameState.unlockedLevels}`, {
            fontSize: '18px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Controls info (moved up to prevent overlap)
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                         (window.innerWidth < 768);
        
        const controlsText = isMobile ?
            'Mobile Controls: Touch buttons to move, jump, attack and boost' :
            'Controls: ←/→ Move | SPACE Jump | A Attack | W Weapon | SHIFT Nitro | Flip in mid-air with ←/→';
            
        this.add.text(SCREEN_WIDTH/2, 730, controlsText, {
            fontSize: '16px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Music credits in bottom corner (moved down to prevent overlap)
        this.add.text(20, SCREEN_HEIGHT - 20, '♪ Music: Danny Bale & Scott Holmes Music | Free Music Archive | CC BY', {
            fontSize: '12px',
            fill: '#FFD700',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        });
        
        // Show some decorative bikes
        this.createDecorativeBikes();
        
        // Keyboard input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
    
    
    createDecorativeBikes() {
        // Add some decorative bikes moving across the screen
        const bike1 = this.add.image(100, SCREEN_HEIGHT - 120, 'bmx');
        bike1.setDisplaySize(60, 40); // Scale down for menu
        
        const bike2 = this.add.image(200, SCREEN_HEIGHT - 120, 'enemyRider');
        bike2.setDisplaySize(55, 35); // Scale down for menu
        
        // Animate them moving
        this.tweens.add({
            targets: bike1,
            x: SCREEN_WIDTH + 50,
            duration: 8000,
            repeat: -1,
            ease: 'Linear'
        });
        
        this.tweens.add({
            targets: bike2,
            x: SCREEN_WIDTH + 50,
            duration: 6000,
            repeat: -1,
            ease: 'Linear',
            delay: 2000
        });
    }
    
    showLevelSelect() {
        // Clear existing UI
        this.children.removeAll();
        
        // Background
        this.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, SCREEN_WIDTH, SCREEN_HEIGHT, 0x87CEEB);
        
        // Title
        this.add.text(SCREEN_WIDTH/2, 100, 'SELECT LEVEL', {
            fontSize: '48px',
            fill: '#FF4500',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Level buttons
        const gameState = this.registry.get('gameState');
        const startY = 200;
        const spacing = 80;
        
        Object.keys(LEVEL_CONFIG).forEach((levelNum, index) => {
            const levelConfig = LEVEL_CONFIG[levelNum];
            const y = startY + (index * spacing);
            const isUnlocked = parseInt(levelNum) <= gameState.unlockedLevels;
            const isCurrent = parseInt(levelNum) === gameState.currentLevel;
            
            // Level button
            const buttonColor = isCurrent ? 0x004400 : (isUnlocked ? 0x444444 : 0x222222);
            const button = this.add.rectangle(SCREEN_WIDTH/2, y, 600, 60, buttonColor)
                .setStrokeStyle(2, isCurrent ? 0x00FF00 : 0x666666);
            
            if (isUnlocked) {
                button.setInteractive()
                    .on('pointerdown', () => {
                        gameState.currentLevel = parseInt(levelNum);
                        this.scene.start(SCENES.GAME);
                    })
                    .on('pointerover', () => {
                        if (!isCurrent) button.setFillStyle(0x666666);
                    })
                    .on('pointerout', () => {
                        if (!isCurrent) button.setFillStyle(0x444444);
                    });
            }
            
            // Level info
            const statusText = isCurrent ? ' (CURRENT)' : (isUnlocked ? '' : ' (LOCKED)');
            const textColor = isUnlocked ? '#FFFFFF' : '#888888';
            
            this.add.text(SCREEN_WIDTH/2, y - 10, `LEVEL ${levelNum}: ${levelConfig.name}${statusText}`, {
                fontSize: '20px',
                fill: textColor,
                fontFamily: 'Arial',
                fontWeight: 'bold'
            }).setOrigin(0.5);
            
            this.add.text(SCREEN_WIDTH/2, y + 12, `Length: ${levelConfig.length/1000}km | Reward: $${levelConfig.moneyBonus}`, {
                fontSize: '14px',
                fill: textColor,
                fontFamily: 'Arial'
            }).setOrigin(0.5);
        });
        
        // Back button
        this.createButton(SCREEN_WIDTH/2, 650, 'BACK', () => {
            this.scene.restart();
        });
    }
    
    showResetConfirmation() {
        // Clear existing UI
        this.children.removeAll();
        
        // Background
        this.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, SCREEN_WIDTH, SCREEN_HEIGHT, 0x87CEEB);
        
        // Warning title
        this.add.text(SCREEN_WIDTH/2, 200, '⚠️ RESET PROGRESS ⚠️', {
            fontSize: '48px',
            fill: '#FF4500',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Warning message
        this.add.text(SCREEN_WIDTH/2, 300, 'This will permanently delete ALL your progress:', {
            fontSize: '24px',
            fill: '#000000',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        const warningItems = [
            '• High Scores will be reset to 0',
            '• All earned money will be lost',
            '• Current level reset to Level 1',
            '• All unlocked levels reset',
            '• All purchased bikes reset to BMX only',
            '• All purchased weapons reset to Basic Shot only'
        ];
        
        warningItems.forEach((item, index) => {
            this.add.text(SCREEN_WIDTH/2, 350 + (index * 30), item, {
                fontSize: '18px',
                fill: '#CC0000',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
        });
        
        this.add.text(SCREEN_WIDTH/2, 550, 'Are you absolutely sure you want to continue?', {
            fontSize: '20px',
            fill: '#000000',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // Confirmation buttons
        this.createButton(SCREEN_WIDTH/2 - 150, 620, 'YES, RESET ALL', () => {
            this.resetAllProgress();
        }, 0xFF4444); // Red background
        
        this.createButton(SCREEN_WIDTH/2 + 150, 620, 'CANCEL', () => {
            this.scene.restart();
        }, 0x444444); // Normal background
    }
    
    resetAllProgress() {
        console.log('🔄 Resetting all game progress...');
        
        // Clear all localStorage
        localStorage.removeItem('doomRidersHighScore');
        localStorage.removeItem('doomRidersMoney');
        localStorage.removeItem('doomRidersCurrentBike');
        localStorage.removeItem('doomRidersOwnedBikes');
        localStorage.removeItem('doomRidersCurrentWeapon');
        localStorage.removeItem('doomRidersOwnedWeapons');
        localStorage.removeItem('doomRidersCurrentLevel');
        localStorage.removeItem('doomRidersUnlockedLevels');
        
        // Reset game state to defaults
        const defaultGameState = {
            score: 0,
            money: 0,
            currentBike: 'BMX',
            ownedBikes: ['BMX'],
            currentWeapon: 'BASIC_SHOT',
            ownedWeapons: ['BASIC_SHOT'],
            highScore: 0,
            totalMoney: 0,
            currentLevel: 1,
            unlockedLevels: 1
        };
        
        this.registry.set('gameState', defaultGameState);
        
        console.log('✅ All progress reset successfully!');
        
        // Show confirmation and return to main menu
        this.children.removeAll();
        this.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, SCREEN_WIDTH, SCREEN_HEIGHT, 0x87CEEB);
        
        this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 - 50, '✅ PROGRESS RESET COMPLETE!', {
            fontSize: '36px',
            fill: '#00AA00',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + 20, 'All progress has been reset to starting defaults.', {
            fontSize: '20px',
            fill: '#000000',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + 50, 'Returning to main menu...', {
            fontSize: '16px',
            fill: '#666666',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // Return to main menu after 3 seconds
        this.time.delayedCall(3000, () => {
            this.scene.restart();
        });
    }
    
    createButton(x, y, text, callback, color = 0x444444) {
        const button = this.add.rectangle(x, y, 200, 50, color)
            .setInteractive()
            .on('pointerdown', callback)
            .on('pointerover', () => button.setFillStyle(color === 0x444444 ? 0x666666 : color + 0x222222))
            .on('pointerout', () => button.setFillStyle(color));
        
        this.add.text(x, y, text, {
            fontSize: '16px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        return button;
    }
    
    update() {
        // Allow quick start with spacebar
        if (this.spaceKey.isDown) {
            this.scene.start(SCENES.GAME);
        }
    }
}