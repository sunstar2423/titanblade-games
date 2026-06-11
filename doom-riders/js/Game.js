import { SCREEN_WIDTH, SCREEN_HEIGHT, SCENES } from './GameData.js';
import PreloadScene from './scenes/PreloadScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import GameScene from './scenes/GameScene.js';
import PauseScene from './scenes/PauseScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import StoreScene from './scenes/StoreScene.js';

class Game {
    constructor() {
        console.log('🚀 GAME.JS CONSTRUCTOR - VERSION 2024-FIXED 🚀');
        console.log('Game constructor started');
        console.log('SCREEN_WIDTH:', SCREEN_WIDTH);
        console.log('SCREEN_HEIGHT:', SCREEN_HEIGHT);
        console.log('SCENES object:', SCENES);
        console.log('PreloadScene:', PreloadScene);
        console.log('MainMenuScene:', MainMenuScene);
        console.log('GameScene:', GameScene);
        
        try {
            this.initializeGame();
        } catch (error) {
            console.error('🚨 CRITICAL Game initialization error:', error);
            console.error('Error stack:', error.stack);
            
            // Create emergency fallback
            this.createEmergencyFallback();
            throw error;
        }
    }
    
    createEmergencyFallback() {
        console.log('Creating emergency fallback display...');
        document.body.innerHTML += `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                        background: red; color: white; padding: 20px; font-size: 24px; z-index: 9999;">
                GAME INITIALIZATION FAILED<br>
                Check console for details
            </div>
        `;
    }
    
    initializeGame() {
        this.config = {
            type: Phaser.AUTO,
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
            parent: 'game-container',
            backgroundColor: '#87CEEB',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 800 },
                    debug: false
                }
            },
            audio: {
                disableWebAudio: false,
                context: null
            },
            scale: {
                mode: Phaser.Scale.NONE,
                autoCenter: Phaser.Scale.NO_CENTER,
                width: SCREEN_WIDTH,
                height: SCREEN_HEIGHT
            },
            input: {
                keyboard: true,
                mouse: true,
                touch: {
                    capture: false
                }
            },
            scene: [
                PreloadScene,
                MainMenuScene,
                GameScene,
                PauseScene,
                GameOverScene,
                StoreScene
            ]
        };
        
        console.log('Creating Phaser game instance...');
        this.game = new Phaser.Game(this.config);
        
        // Make saveProgress function globally accessible
        window.doomRidersSaveProgress = this.saveProgress.bind(this);

        // Expose game instance for debugging
        window.doomRidersGame = this.game;
        
        console.log('Initializing game state...');
        // Initialize game state with proper money handling
        const savedMoney = localStorage.getItem('doomRidersMoney');
        const parsedMoney = savedMoney ? parseInt(savedMoney) : 0;
        const safeMoney = isNaN(parsedMoney) ? 0 : parsedMoney;
        
        this.gameState = {
            score: 0,
            money: 0, // Current session money
            currentBike: localStorage.getItem('doomRidersCurrentBike') || 'BMX',
            ownedBikes: JSON.parse(localStorage.getItem('doomRidersOwnedBikes')) || ['BMX'],
            currentWeapon: localStorage.getItem('doomRidersCurrentWeapon') || 'BASIC_SHOT',
            ownedWeapons: JSON.parse(localStorage.getItem('doomRidersOwnedWeapons')) || ['BASIC_SHOT'],
            highScore: parseInt(localStorage.getItem('doomRidersHighScore')) || 0,
            totalMoney: safeMoney, // Total accumulated money
            currentLevel: parseInt(localStorage.getItem('doomRidersCurrentLevel')) || 1,
            unlockedLevels: parseInt(localStorage.getItem('doomRidersUnlockedLevels')) || 1
        };
        
        console.log('Game state initialized with totalMoney:', this.gameState.totalMoney);
        
        this.game.registry.set('gameState', this.gameState);
        
        console.log('Setting up mobile touch configuration...');
        // Mobile touch configuration
        this.game.events.once('ready', () => {
            try {
                if (this.game.canvas) {
                    this.game.canvas.style.touchAction = 'auto';
                    this.game.canvas.style.pointerEvents = 'auto';
                    this.game.canvas.style.webkitTouchCallout = 'default';
                    this.game.canvas.style.webkitUserSelect = 'auto';
                    
                    this.game.canvas.addEventListener('touchstart', (e) => {
                        if (e.touches.length > 1) {
                            e.stopPropagation();
                        }
                    }, { passive: true });
                    
                    console.log('Doom Riders mobile touch configuration applied');
                }
            } catch (error) {
                console.error('Mobile touch setup error:', error);
            }
        });
        
        console.log('Setting up UI updates...');
        // UI update system
        this.setupUIUpdates();
    }
    
    setupUIUpdates() {
        const updateUI = () => {
            try {
                const gameState = this.game.registry.get('gameState');
                if (gameState) {
                    const scoreEl = document.getElementById('score');
                    const speedEl = document.getElementById('speed');
                    const moneyEl = document.getElementById('money');
                    
                    if (scoreEl) scoreEl.textContent = `Score: ${gameState.score || 0}`;
                    if (speedEl) speedEl.textContent = `Speed: ${Math.round(gameState.currentSpeed || 0)}`;
                    if (moneyEl) moneyEl.textContent = `Money: $${gameState.money || 0}`;
                }
            } catch (error) {
                console.error('UI update error:', error);
            }
        };
        
        // Update UI periodically
        setInterval(updateUI, 100);
        
        // Listen for game state changes
        this.game.events.on('gameStateUpdate', updateUI);
    }
    
    saveProgress() {
        const gameState = this.game.registry.get('gameState');
        console.log('💾 Game.js saveProgress called with gameState:', gameState);
        localStorage.setItem('doomRidersHighScore', gameState.highScore.toString());
        localStorage.setItem('doomRidersMoney', gameState.totalMoney.toString());
        localStorage.setItem('doomRidersCurrentBike', gameState.currentBike);
        localStorage.setItem('doomRidersOwnedBikes', JSON.stringify(gameState.ownedBikes));
        localStorage.setItem('doomRidersCurrentWeapon', gameState.currentWeapon);
        localStorage.setItem('doomRidersOwnedWeapons', JSON.stringify(gameState.ownedWeapons));
        localStorage.setItem('doomRidersCurrentLevel', gameState.currentLevel.toString());
        localStorage.setItem('doomRidersUnlockedLevels', gameState.unlockedLevels.toString());
        console.log('💾 Game.js saveProgress completed successfully!');
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game();
});

export default Game;