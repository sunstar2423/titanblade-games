import { SCREEN_WIDTH, SCREEN_HEIGHT, SCENES, BIKE_TYPES, WEAPONS, BIKE_SPRITES } from '../GameData.js';

export default class StoreScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.STORE });
    }

    create() {
        this.gameState = this.registry.get('gameState');
        // Preserve tab state across scene restarts
        this.currentTab = this.registry.get('storeCurrentTab') || 'bikes'; // 'bikes' or 'weapons'
        
        console.log('🏪 DEBUG: StoreScene.create() called');
        console.log('🏪 DEBUG: Current tab:', this.currentTab);
        console.log('🏪 DEBUG: GameState:', this.gameState);
        
        // Background image
        const bg = this.add.image(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 'bikeStoreBackground');
        
        // Scale background to fit screen if needed
        const scaleX = SCREEN_WIDTH / bg.width;
        const scaleY = SCREEN_HEIGHT / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale);
        
        // Store title
        this.add.text(SCREEN_WIDTH/2, 50, 'DOOM RIDERS STORE', {
            fontSize: '48px',
            fill: '#FFD700',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Player money display
        this.moneyText = this.add.text(SCREEN_WIDTH/2, 100, `Money: $${this.gameState.totalMoney}`, {
            fontSize: '24px',
            fill: '#00FF00',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // Tab buttons
        this.createTabButtons();
        
        // Current equipment display
        this.createCurrentEquipmentDisplay();
        
        // Create item listings
        this.createItemListings();
        
        // Navigation buttons
        this.createButton(100, 700, 'BACK', () => {
            this.scene.start(SCENES.MAIN_MENU);
        });
        
        this.createButton(SCREEN_WIDTH - 100, 700, 'SAVE', () => {
            this.saveProgress();
        });
    }
    
    createTabButtons() {
        console.log(`Creating tab buttons, current tab: ${this.currentTab}`);
        
        // Bikes tab
        const bikesButton = this.add.rectangle(SCREEN_WIDTH/2 - 100, 150, 180, 40, 
            this.currentTab === 'bikes' ? 0x004400 : 0x444444)
            .setInteractive()
            .on('pointerdown', () => {
                console.log('Bikes tab clicked');
                this.switchTab('bikes');
            })
            .on('pointerover', () => {
                if (this.currentTab !== 'bikes') bikesButton.setFillStyle(0x666666);
            })
            .on('pointerout', () => {
                if (this.currentTab !== 'bikes') bikesButton.setFillStyle(0x444444);
            });
        
        // Brighter border for active tab
        if (this.currentTab === 'bikes') {
            bikesButton.setStrokeStyle(3, 0x00FF00);
        }
        
        this.add.text(SCREEN_WIDTH/2 - 100, 150, 'BIKES', {
            fontSize: '18px',
            fill: this.currentTab === 'bikes' ? '#00FF00' : '#FFFFFF',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // Weapons tab
        const weaponsButton = this.add.rectangle(SCREEN_WIDTH/2 + 100, 150, 180, 40, 
            this.currentTab === 'weapons' ? 0x004400 : 0x444444)
            .setInteractive()
            .on('pointerdown', () => {
                console.log('Weapons tab clicked');
                this.switchTab('weapons');
            })
            .on('pointerover', () => {
                if (this.currentTab !== 'weapons') weaponsButton.setFillStyle(0x666666);
            })
            .on('pointerout', () => {
                if (this.currentTab !== 'weapons') weaponsButton.setFillStyle(0x444444);
            });
        
        // Brighter border for active tab
        if (this.currentTab === 'weapons') {
            weaponsButton.setStrokeStyle(3, 0x00FF00);
        }
        
        this.add.text(SCREEN_WIDTH/2 + 100, 150, 'SPECIAL ITEMS', {
            fontSize: '18px',
            fill: this.currentTab === 'weapons' ? '#00FF00' : '#FFFFFF',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        this.bikesButton = bikesButton;
        this.weaponsButton = weaponsButton;
    }
    
    createCurrentEquipmentDisplay() {
        const currentBike = BIKE_TYPES[this.gameState.currentBike];
        const currentWeapon = WEAPONS[this.gameState.currentWeapon];
        
        this.add.text(SCREEN_WIDTH/4, 200, `Current Bike: ${currentBike.name}`, {
            fontSize: '16px',
            fill: '#CCCCCC',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        this.add.text(3*SCREEN_WIDTH/4, 200, `Current Weapon: ${currentWeapon.name}`, {
            fontSize: '16px',
            fill: '#CCCCCC',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
    }
    
    switchTab(tab) {
        console.log(`🏪 Switching from ${this.currentTab} tab to ${tab} tab`);
        if (this.currentTab === tab) {
            console.log(`🏪 Already on ${tab} tab, no need to switch`);
            return;
        }
        this.currentTab = tab;
        // Store tab state in registry so it persists across scene restarts
        this.registry.set('storeCurrentTab', tab);
        console.log(`🏪 Tab switched to ${tab}, restarting scene...`);
        this.scene.restart();
    }
    
    createItemListings() {
        if (this.currentTab === 'bikes') {
            this.createBikeListings();
        } else {
            this.createWeaponListings();
        }
    }
    
    createBikeListings() {
        const bikeTypes = Object.keys(BIKE_TYPES);
        const startY = 260;
        const spacing = 80;
        
        bikeTypes.forEach((bikeKey, index) => {
            const bike = BIKE_TYPES[bikeKey];
            const y = startY + (index * spacing);
            
            // Bike container background
            const isOwned = this.gameState.ownedBikes.includes(bikeKey);
            const isCurrent = this.gameState.currentBike === bikeKey;
            const canAfford = this.gameState.totalMoney >= bike.price;
            
            let bgColor = 0x333333;
            if (isCurrent) bgColor = 0x004400;
            else if (isOwned) bgColor = 0x444444;
            else if (!canAfford) bgColor = 0x220000;
            
            const container = this.add.rectangle(SCREEN_WIDTH/2, y, SCREEN_WIDTH - 100, 70, bgColor);
            container.setStrokeStyle(2, isCurrent ? 0x00FF00 : 0x666666);
            
            // Bike image
            const bikeSprite = BIKE_SPRITES[bikeKey] || 'bmx';
            const bikeImage = this.add.image(80, y, bikeSprite);
            bikeImage.setDisplaySize(50, 30);
            
            // Bike name
            this.add.text(120, y - 15, bike.name, {
                fontSize: '18px',
                fill: isCurrent ? '#00FF00' : '#FFFFFF',
                fontFamily: 'Arial',
                fontWeight: 'bold'
            });
            
            // Bike description
            this.add.text(120, y + 5, bike.description, {
                fontSize: '12px',
                fill: '#CCCCCC',
                fontFamily: 'Arial'
            });
            
            // Bike stats
            const statsText = `Speed: ${bike.maxSpeed} | Accel: ${bike.acceleration} | Jump: ${bike.jumpPower}`;
            this.add.text(120, y + 20, statsText, {
                fontSize: '11px',
                fill: '#AAAAAA',
                fontFamily: 'Arial'
            });
            
            // Price/Status
            if (isCurrent) {
                this.add.text(SCREEN_WIDTH - 120, y, 'EQUIPPED', {
                    fontSize: '14px',
                    fill: '#00FF00',
                    fontFamily: 'Arial',
                    fontWeight: 'bold'
                }).setOrigin(0.5);
            } else if (isOwned) {
                this.createButton(SCREEN_WIDTH - 120, y, 'SELECT', () => {
                    this.selectBike(bikeKey);
                });
            } else {
                // Show price and buy button
                const priceText = bike.price === 0 ? 'FREE' : `$${bike.price}`;
                this.add.text(SCREEN_WIDTH - 200, y - 8, priceText, {
                    fontSize: '16px',
                    fill: canAfford ? '#FFD700' : '#FF6666',
                    fontFamily: 'Arial',
                    fontWeight: 'bold'
                });
                
                if (canAfford) {
                    this.createButton(SCREEN_WIDTH - 120, y + 8, 'BUY', () => {
                        this.buyBike(bikeKey);
                    });
                } else {
                    this.add.text(SCREEN_WIDTH - 120, y + 8, 'TOO EXPENSIVE', {
                        fontSize: '10px',
                        fill: '#FF6666',
                        fontFamily: 'Arial'
                    }).setOrigin(0.5);
                }
            }
        });
    }
    
    createWeaponListings() {
        console.log('🏪 Creating weapon listings...');
        const weaponTypes = Object.keys(WEAPONS);
        
        if (weaponTypes.length === 0) {
            console.error('🏪 ERROR: No weapons found in WEAPONS object!');
            this.add.text(SCREEN_WIDTH/2, 350, 'ERROR: No weapons available', {
                fontSize: '24px',
                fill: '#FF0000',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
            return;
        }
        
        const startY = 260;
        const spacing = 80;
        
        weaponTypes.forEach((weaponKey, index) => {
            const weapon = WEAPONS[weaponKey];
            const y = startY + (index * spacing);
            
            // Weapon container background
            const isOwned = this.gameState.ownedWeapons && this.gameState.ownedWeapons.includes(weaponKey);
            const isCurrent = this.gameState.currentWeapon === weaponKey;
            const canAfford = this.gameState.totalMoney >= weapon.price;
            
            let bgColor = 0x333333;
            if (isCurrent) bgColor = 0x004400;
            else if (isOwned) bgColor = 0x444444;
            else if (!canAfford) bgColor = 0x220000;
            
            const container = this.add.rectangle(SCREEN_WIDTH/2, y, SCREEN_WIDTH - 100, 70, bgColor);
            container.setStrokeStyle(2, isCurrent ? 0x00FF00 : 0x666666);
            
            // Weapon name
            this.add.text(120, y - 15, weapon.name, {
                fontSize: '18px',
                fill: isCurrent ? '#00FF00' : '#FFFFFF',
                fontFamily: 'Arial',
                fontWeight: 'bold'
            });
            
            // Weapon description
            this.add.text(120, y + 5, weapon.description, {
                fontSize: '12px',
                fill: '#CCCCCC',
                fontFamily: 'Arial'
            });
            
            // Weapon stats
            const statsText = `Damage: ${weapon.damage} | Speed: ${weapon.speed} | Cooldown: ${weapon.cooldown}ms`;
            this.add.text(120, y + 20, statsText, {
                fontSize: '11px',
                fill: '#AAAAAA',
                fontFamily: 'Arial'
            });
            
            // Price/Status
            if (isCurrent) {
                this.add.text(SCREEN_WIDTH - 120, y, 'EQUIPPED', {
                    fontSize: '14px',
                    fill: '#00FF00',
                    fontFamily: 'Arial',
                    fontWeight: 'bold'
                }).setOrigin(0.5);
            } else if (isOwned) {
                this.createButton(SCREEN_WIDTH - 120, y, 'SELECT', () => {
                    this.selectWeapon(weaponKey);
                });
            } else {
                // Show price and buy button
                const priceText = weapon.price === 0 ? 'FREE' : `$${weapon.price}`;
                this.add.text(SCREEN_WIDTH - 200, y - 8, priceText, {
                    fontSize: '16px',
                    fill: canAfford ? '#FFD700' : '#FF6666',
                    fontFamily: 'Arial',
                    fontWeight: 'bold'
                });
                
                if (canAfford) {
                    this.createButton(SCREEN_WIDTH - 120, y + 8, 'BUY', () => {
                        this.buyWeapon(weaponKey);
                    });
                } else {
                    this.add.text(SCREEN_WIDTH - 120, y + 8, 'TOO EXPENSIVE', {
                        fontSize: '10px',
                        fill: '#FF6666',
                        fontFamily: 'Arial'
                    }).setOrigin(0.5);
                }
            }
        });
    }
    
    selectBike(bikeKey) {
        this.gameState.currentBike = bikeKey;
        this.scene.restart();
    }
    
    selectWeapon(weaponKey) {
        this.gameState.currentWeapon = weaponKey;
        this.scene.restart();
    }
    
    buyBike(bikeKey) {
        const bike = BIKE_TYPES[bikeKey];
        console.log(`🏪 Attempting to buy bike: ${bikeKey} for $${bike.price}`);
        console.log(`🏪 Current total money: $${this.gameState.totalMoney}`);
        
        if (this.gameState.totalMoney >= bike.price) {
            this.gameState.totalMoney -= bike.price;
            this.gameState.ownedBikes.push(bikeKey);
            this.gameState.currentBike = bikeKey;
            
            // Save immediately after purchase
            this.saveProgress();
            
            this.showPurchaseConfirmation(bike.name);
            
            this.time.delayedCall(1000, () => {
                this.scene.restart();
            });
        } else {
            console.log(`🏪 Not enough money to buy ${bike.name}`);
        }
    }
    
    buyWeapon(weaponKey) {
        const weapon = WEAPONS[weaponKey];
        console.log(`🏪 Attempting to buy weapon: ${weaponKey} for $${weapon.price}`);
        console.log(`🏪 Current total money: $${this.gameState.totalMoney}`);
        
        if (this.gameState.totalMoney >= weapon.price) {
            this.gameState.totalMoney -= weapon.price;
            this.gameState.ownedWeapons.push(weaponKey);
            this.gameState.currentWeapon = weaponKey;
            
            // Save immediately after purchase
            this.saveProgress();
            
            this.showPurchaseConfirmation(weapon.name);
            
            this.time.delayedCall(1000, () => {
                this.scene.restart();
            });
        } else {
            console.log(`🏪 Not enough money to buy ${weapon.name}`);
        }
    }
    
    showPurchaseConfirmation(itemName) {
        const confirmText = this.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT/2, `🎉 PURCHASED: ${itemName}! 🎉`, {
            fontSize: '32px',
            fill: '#00FF00',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: confirmText,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 500,
            yoyo: true,
            onComplete: () => {
                confirmText.destroy();
            }
        });
    }
    
    createButton(x, y, text, callback) {
        const button = this.add.rectangle(x, y, 100, 30, 0x444444)
            .setInteractive()
            .on('pointerdown', callback)
            .on('pointerover', () => button.setFillStyle(0x666666))
            .on('pointerout', () => button.setFillStyle(0x444444));
        
        this.add.text(x, y, text, {
            fontSize: '12px',
            fill: '#FFFFFF',
            fontFamily: 'Arial',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        return button;
    }
    
    saveProgress() {
        console.log('🏪 Saving progress...');
        
        // Update registry first
        this.registry.set('gameState', this.gameState);
        
        // Save to localStorage
        localStorage.setItem('doomRidersHighScore', this.gameState.highScore.toString());
        localStorage.setItem('doomRidersMoney', this.gameState.totalMoney.toString());
        localStorage.setItem('doomRidersCurrentBike', this.gameState.currentBike);
        localStorage.setItem('doomRidersOwnedBikes', JSON.stringify(this.gameState.ownedBikes));
        localStorage.setItem('doomRidersCurrentWeapon', this.gameState.currentWeapon);
        localStorage.setItem('doomRidersOwnedWeapons', JSON.stringify(this.gameState.ownedWeapons));
        localStorage.setItem('doomRidersCurrentLevel', this.gameState.currentLevel.toString());
        localStorage.setItem('doomRidersUnlockedLevels', this.gameState.unlockedLevels.toString());
        
        console.log('🏪 Progress saved successfully!');
        
        const saveText = this.add.text(SCREEN_WIDTH - 100, 650, 'SAVED!', {
            fontSize: '16px',
            fill: '#00FF00',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        this.time.delayedCall(1000, () => {
            saveText.destroy();
        });
    }
}