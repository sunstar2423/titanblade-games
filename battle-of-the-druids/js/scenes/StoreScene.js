/*
 * Battle of the Druids - Web Edition
 * StoreScene.js
 * 
 * Copyright (c) 2025 TitanBlade Games
 * 
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 * 
 * https://github.com/sunstar2423/titanblade-games
 */

class StoreScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Store' });
        this.player = null;
        this.currentTier = ItemTier.BASIC;
        this.currentPage = 0;
        this.itemsPerPage = 6;
        this.tierButtons = [];
        this.itemDisplays = [];
    }
    
    create() {
        const { width, height } = this.scale;
        
        // Get player from registry
        this.player = this.registry.get('currentPlayer');
        
        if (!this.player) {
            this.scene.start('CharacterSelection');
            return;
        }
        
        // Background
        BackgroundRenderer.drawStoreBackground(this);
        
        // Initialize asset manager for audio and start menu music
        this.assetManager = new AssetManager(this);
        this.assetManager.playMenuMusic(this, true, 0.15);
        
        // Title
        this.add.text(width / 2, 50, 'Magic Item Shop', {
            fontSize: '48px',
            fontFamily: 'Arial',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Player gold display
        this.goldText = this.add.text(50, 100, this.getGoldLabel(), {
            fontSize: '24px',
            fontFamily: 'Arial',
            fill: '#FFD700'
        });
        
        // Create tier selection buttons
        this.createTierButtons();
        
        // Create item display area
        this.createItemDisplay();
        
        // Back button
        const backButton = this.add.rectangle(100, height - 80, 120, 40, COLORS.DARK_GRAY)
            .setStrokeStyle(2, COLORS.WHITE)
            .setInteractive();
        
        this.add.text(100, height - 80, 'Back', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        
        backButton.on('pointerdown', () => {
            this.assetManager.playSound(this, 'click', 0.4);
            this.scene.start('MainMenu');
        });
        backButton.on('pointerover', () => backButton.setFillStyle(COLORS.GRAY));
        backButton.on('pointerout', () => backButton.setFillStyle(COLORS.DARK_GRAY));
        
        // Instructions
        this.add.text(width / 2, height - 50, 'Click items to purchase • Press ESC to return', {
            fontSize: '16px',
            fontFamily: 'Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        
        // Note: Keyboard input disabled to prevent mobile keyboard popup
    }
    
    getGoldLabel() {
        const potionCount = this.player.potions ? this.player.potions.length : 0;
        return `Gold: ${this.player.gold}   Potions: ${potionCount}/${GAME_CONSTANTS.POTIONS.BAG_LIMIT}`;
    }

    createTierButtons() {
        const { width } = this.scale;
        const tiers = Object.values(ItemTier);
        const buttonWidth = 150;
        const spacing = 160;
        const startX = (width - (tiers.length * spacing - 10)) / 2;
        
        this.tierButtons = [];
        
        tiers.forEach((tier, index) => {
            const x = startX + index * spacing;
            const y = 150;
            
            const isSelected = tier === this.currentTier;
            const button = this.add.rectangle(x, y, buttonWidth, 40, isSelected ? COLORS.GOLD : COLORS.GRAY)
                .setStrokeStyle(2, COLORS.WHITE)
                .setInteractive();
            
            const buttonText = this.add.text(x, y, tier, {
                fontSize: '16px',
                fontFamily: 'Arial',
                fill: isSelected ? '#000000' : '#FFFFFF'
            }).setOrigin(0.5);
            
            button.on('pointerdown', () => this.selectTier(tier));
            button.on('pointerover', () => {
                if (tier !== this.currentTier) {
                    button.setFillStyle(COLORS.LIGHT_BLUE);
                }
            });
            button.on('pointerout', () => {
                if (tier !== this.currentTier) {
                    button.setFillStyle(COLORS.GRAY);
                }
            });
            
            this.tierButtons.push({ button, text: buttonText, tier });
        });
    }
    
    selectTier(tier) {
        this.currentTier = tier;
        this.currentPage = 0;
        
        // Update tier button appearances
        this.tierButtons.forEach(({ button, text, tier: btnTier }) => {
            const isSelected = btnTier === tier;
            button.setFillStyle(isSelected ? COLORS.GOLD : COLORS.GRAY);
            text.setStyle({ fill: isSelected ? '#000000' : '#FFFFFF' });
        });
        
        // Refresh item display
        this.updateItemDisplay();
    }
    
    createItemDisplay() {
        this.updateItemDisplay();
    }
    
    updateItemDisplay() {
        // Clear existing item displays
        this.itemDisplays.forEach(display => {
            Object.values(display).forEach(obj => {
                if (obj && obj.destroy) obj.destroy();
            });
        });
        this.itemDisplays = [];
        
        const storeItems = Store.getStoreItems();
        const currentItems = storeItems[this.currentTier];
        const startIdx = this.currentPage * this.itemsPerPage;
        const visibleItems = currentItems.slice(startIdx, startIdx + this.itemsPerPage);
        
        // Display items
        visibleItems.forEach((item, index) => {
            this.createItemCard(item, index);
        });
        
        // Create pagination if needed
        if (currentItems.length > this.itemsPerPage) {
            this.createPagination(currentItems.length);
        }
    }
    
    createItemCard(item, index) {
        const { width } = this.scale;
        const cardWidth = width - 100;
        const cardHeight = 80;
        const y = 250 + index * 90;
        
        // Determine if this is equipment or consumable
        const isEquipment = item.slot !== undefined;
        const canAfford = this.player.gold >= item.price;
        const equippedItem = isEquipment ? this.player.getEquippedItem(item.slot) : null;
        const isEquipped = !!(equippedItem && equippedItem.name === item.name);

        // Item card background
        const cardBg = this.add.rectangle(width / 2, y, cardWidth, cardHeight, canAfford ? COLORS.DARK_GRAY : 0x3c1414)
            .setStrokeStyle(2, isEquipped ? COLORS.GOLD : COLORS.WHITE)
            .setInteractive();
        
        // Item name
        const nameText = this.add.text(70, y - 20, item.name, {
            fontSize: '20px',
            fontFamily: 'Arial',
            fill: '#FFFFFF',
            fontStyle: 'bold'
        });
        
        // Item price
        const priceText = this.add.text(70, y + 10, `Price: ${item.price} gold`, {
            fontSize: '16px',
            fontFamily: 'Arial',
            fill: '#FFD700'
        });
        
        // Item stats/description
        let statsText = '';
        if (isEquipment) {
            const equipment = new Equipment(item);
            statsText = equipment.getStatText();
        } else if (item.healPercent) {
            statsText = `Restores ${item.healPercent}% HP in battle`;
        }

        // Track every element so tier switches clean them up properly
        let statsTextObj = null;
        if (statsText) {
            statsTextObj = this.add.text(400, y, statsText, {
                fontSize: '16px',
                fontFamily: 'Arial',
                fill: '#00FF00'
            });
        }

        // Tier indicator for equipment
        let tierCircle = null;
        if (isEquipment) {
            const tierColor = TIER_COLORS[item.tier];
            tierCircle = this.add.circle(width - 100, y, 15, tierColor)
                .setStrokeStyle(2, COLORS.WHITE);
        }

        // Equipped indicator
        let equippedText = null;
        if (isEquipped) {
            equippedText = this.add.text(width - 180, y, 'EQUIPPED', {
                fontSize: '16px',
                fontFamily: 'Arial',
                fill: '#FFD700',
                fontStyle: 'bold'
            }).setOrigin(0.5);
        }

        // Purchase interaction
        if (canAfford && !isEquipped) {
            cardBg.on('pointerdown', () => this.purchaseItem(item));
            cardBg.on('pointerover', () => cardBg.setFillStyle(COLORS.GRAY));
            cardBg.on('pointerout', () => cardBg.setFillStyle(COLORS.DARK_GRAY));
        }
        
        // Store display references
        this.itemDisplays.push({
            cardBg,
            nameText,
            priceText,
            statsTextObj,
            tierCircle,
            equippedText
        });
    }
    
    purchaseItem(item) {
        const result = Store.purchaseItem(this.player, item);
        
        if (result.success) {
            // Play purchase sound
            this.assetManager.playSound(this, 'buy', 0.6);

            // Update gold display
            this.goldText.setText(this.getGoldLabel());

            // Show success message
            this.showPurchaseMessage(result.message, true);

            // Refresh item display to update affordability
            this.updateItemDisplay();

            // Save after every purchase
            if (typeof SaveSystem !== 'undefined') {
                SaveSystem.save(this.player);
            }

        } else {
            // Show failure message
            this.showPurchaseMessage(result.message, false);
        }
    }
    
    showPurchaseMessage(message, success) {
        const { width, height } = this.scale;
        
        const messageText = this.add.text(width / 2, height - 150, message, {
            fontSize: '20px',
            fontFamily: 'Arial',
            fill: success ? '#00FF00' : '#FF0000',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Fade out after 2 seconds
        this.tweens.add({
            targets: messageText,
            alpha: 0,
            duration: 2000,
            onComplete: () => messageText.destroy()
        });
    }
    
    createPagination(totalItems) {
        const { width, height } = this.scale;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        
        if (totalPages <= 1) return;
        
        // Page indicator
        this.add.text(width / 2, height - 120, `Page ${this.currentPage + 1}/${totalPages}`, {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        
        // Previous page button
        if (this.currentPage > 0) {
            const prevBtn = this.add.rectangle(width / 2 - 100, height - 120, 80, 30, COLORS.DARK_GRAY)
                .setStrokeStyle(2, COLORS.WHITE)
                .setInteractive();
            
            this.add.text(width / 2 - 100, height - 120, 'Previous', {
                fontSize: '14px',
                fontFamily: 'Arial',
                fill: '#FFFFFF'
            }).setOrigin(0.5);
            
            prevBtn.on('pointerdown', () => {
                this.currentPage--;
                this.updateItemDisplay();
            });
        }
        
        // Next page button
        if ((this.currentPage + 1) * this.itemsPerPage < totalItems) {
            const nextBtn = this.add.rectangle(width / 2 + 100, height - 120, 80, 30, COLORS.DARK_GRAY)
                .setStrokeStyle(2, COLORS.WHITE)
                .setInteractive();
            
            this.add.text(width / 2 + 100, height - 120, 'Next', {
                fontSize: '14px',
                fontFamily: 'Arial',
                fill: '#FFFFFF'
            }).setOrigin(0.5);
            
            nextBtn.on('pointerdown', () => {
                this.currentPage++;
                this.updateItemDisplay();
            });
        }
    }
    
    update() {
        // Keep player data updated
        this.registry.set('currentPlayer', this.player);
    }
}