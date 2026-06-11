import { SCREEN_WIDTH, SCREEN_HEIGHT, SCENES } from '../GameData.js';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.GAME_OVER });
    }

    create() {
        const gameState = this.registry.get('gameState');
        const won = !!gameState.lastRaceWon;

        // Background
        this.add.rectangle(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, SCREEN_WIDTH, SCREEN_HEIGHT, 0x000000, 0.8);

        // Title reflects the actual race result
        this.add.text(SCREEN_WIDTH/2, 150, won ? '🏁 RACE COMPLETE! 🏁' : 'GAME OVER', {
            fontSize: '56px',
            fill: won ? '#FFD700' : '#FF4500',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Score display
        this.add.text(SCREEN_WIDTH/2, 250, `Final Score: ${gameState.score}`, {
            fontSize: '32px',
            fill: '#FFFFFF',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Session money was already banked into totalMoney; show the recorded amount
        const earned = gameState.sessionMoneyEarned || 0;
        this.add.text(SCREEN_WIDTH/2, 290, `Money Earned: $${earned}`, {
            fontSize: '24px',
            fill: '#00FF00',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // Race position display
        if (gameState.finalRacePosition) {
            const positionText = `Race Position: ${this.getPositionSuffix(gameState.finalRacePosition)} place`;
            let positionColor = '#FFD700'; // Gold for 1st
            if (gameState.finalRacePosition === 2) positionColor = '#C0C0C0'; // Silver
            else if (gameState.finalRacePosition === 3) positionColor = '#CD7F32'; // Bronze
            else if (gameState.finalRacePosition > 3) positionColor = '#FFFFFF'; // White for others
            
            this.add.text(SCREEN_WIDTH/2, 320, positionText, {
                fontSize: '22px',
                fill: positionColor,
                fontFamily: 'Arial',
                fontWeight: 'bold',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);
        }
        
        // High score check
        if (gameState.score === gameState.highScore && gameState.score > 0) {
            this.add.text(SCREEN_WIDTH/2, 360, '🏆 NEW HIGH SCORE! 🏆', {
                fontSize: '28px',
                fill: '#FFD700',
                fontFamily: 'Arial',
                fontWeight: 'bold'
            }).setOrigin(0.5);
        } else {
            this.add.text(SCREEN_WIDTH/2, 360, `High Score: ${gameState.highScore}`, {
                fontSize: '20px',
                fill: '#CCCCCC',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
        }
        
        // Performance feedback
        this.showPerformanceFeedback(gameState.score);
        
        // Menu buttons
        this.createButton(SCREEN_WIDTH/2 - 120, 500, 'PLAY AGAIN', () => {
            this.scene.start(SCENES.GAME);
        });
        
        this.createButton(SCREEN_WIDTH/2 + 120, 500, 'MAIN MENU', () => {
            this.scene.start(SCENES.MAIN_MENU);
        });
        
        this.createButton(SCREEN_WIDTH/2, 570, 'BIKE STORE', () => {
            this.scene.start(SCENES.STORE);
        });
        
        // Total stats
        this.add.text(SCREEN_WIDTH/2, 640, `Total Money: $${gameState.totalMoney}`, {
            fontSize: '18px',
            fill: '#FFFFFF',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // Auto-return to menu after a while if no input
        this.time.delayedCall(30000, () => {
            this.scene.start(SCENES.MAIN_MENU);
        });
    }
    
    showPerformanceFeedback(score) {
        let message = '';
        let color = '#FFFFFF';
        
        if (score >= 2000) {
            message = 'EXTREME RIDER! 🔥';
            color = '#FF4500';
        } else if (score >= 1000) {
            message = 'Great Performance! 💪';
            color = '#FFD700';
        } else if (score >= 500) {
            message = 'Good Ride! 👍';
            color = '#00FF00';
        } else if (score >= 0) {
            message = 'Keep Practicing! 🚴';
            color = '#FFFFFF';
        } else {
            message = 'Rough Ride... Try Again! 😅';
            color = '#FF6666';
        }
        
        this.add.text(SCREEN_WIDTH/2, 410, message, {
            fontSize: '24px',
            fill: color,
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // Suggestion for improvement
        if (score < 500) {
            this.add.text(SCREEN_WIDTH/2, 445, 'Tip: Use ramps for bonus points and do flips in the air!', {
                fontSize: '16px',
                fill: '#CCCCCC',
                fontFamily: 'Arial',
                fontStyle: 'italic'
            }).setOrigin(0.5);
        } else if (score < 1000) {
            this.add.text(SCREEN_WIDTH/2, 445, 'Tip: Attack enemies for extra points and money!', {
                fontSize: '16px',
                fill: '#CCCCCC',
                fontFamily: 'Arial',
                fontStyle: 'italic'
            }).setOrigin(0.5);
        }
    }
    
    createButton(x, y, text, callback) {
        const button = this.add.rectangle(x, y, 180, 50, 0x444444)
            .setInteractive()
            .on('pointerdown', callback)
            .on('pointerover', () => button.setFillStyle(0x666666))
            .on('pointerout', () => button.setFillStyle(0x444444));
        
        this.add.text(x, y, text, {
            fontSize: '16px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        return button;
    }
    
    getPositionSuffix(position) {
        if (position === 1) return '1st';
        if (position === 2) return '2nd';
        if (position === 3) return '3rd';
        return `${position}th`;
    }
}