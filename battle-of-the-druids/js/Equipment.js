/*
 * Battle of the Druids - Web Edition
 * Equipment.js
 * 
 * Copyright (c) 2025 TitanBlade Games
 * 
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 * 
 * https://github.com/sunstar2423/titanblade-games
 */

class Equipment {
    constructor(data) {
        this.name = data.name;
        this.slot = data.slot;
        this.tier = data.tier;
        this.attackBonus = data.attackBonus || 0;
        this.defenseBonus = data.defenseBonus || 0;
        this.speedBonus = data.speedBonus || 0;
        this.healthBonus = data.healthBonus || 0;
        this.price = data.price || 0;
        this.description = data.description || "";
    }
    
    // Get tier color for UI display
    getTierColor() {
        return TIER_COLORS[this.tier] || COLORS.WHITE;
    }
    
    // Get stat text for display
    getStatText() {
        const stats = [];
        if (this.attackBonus > 0) stats.push(`ATK +${this.attackBonus}`);
        if (this.defenseBonus > 0) stats.push(`DEF +${this.defenseBonus}`);
        if (this.speedBonus > 0) stats.push(`SPD +${this.speedBonus}`);
        if (this.healthBonus > 0) stats.push(`HP +${this.healthBonus}`);
        return stats.join(' ');
    }
}

// Store management functions
class Store {
    static getStoreItems() {
        return STORE_ITEMS;
    }
    
    static purchaseItem(player, item) {
        // Handle equipment vs consumables
        if (item.slot) {
            const currentItem = player.getEquippedItem(item.slot);
            if (currentItem && currentItem.name === item.name) {
                return { success: false, message: `${item.name} is already equipped!` };
            }
            if (player.gold < item.price) {
                return { success: false, message: "Not enough gold!" };
            }
            player.gold -= item.price;
            const equipment = new Equipment(item);
            player.equipItem(equipment);
            return { success: true, message: `Equipped ${item.name}!` };
        } else if (item.healPercent) {
            // Potion - goes into the bag for use during battle
            if (!player.potions) player.potions = [];
            if (player.potions.length >= GAME_CONSTANTS.POTIONS.BAG_LIMIT) {
                return { success: false, message: `Potion bag is full! (${GAME_CONSTANTS.POTIONS.BAG_LIMIT} max)` };
            }
            if (player.gold < item.price) {
                return { success: false, message: "Not enough gold!" };
            }
            player.gold -= item.price;
            player.potions.push({ name: item.name, healPercent: item.healPercent });
            return { success: true, message: `${item.name} added to your bag! (${player.potions.length}/${GAME_CONSTANTS.POTIONS.BAG_LIMIT})` };
        } else {
            if (player.gold < item.price) {
                return { success: false, message: "Not enough gold!" };
            }
            player.gold -= item.price;
            return { success: true, message: `Purchased ${item.name}!` };
        }
    }
}

// Inventory management functions
class Inventory {
    static getEquipmentSlotPositions() {
        return {
            [EquipmentSlot.WEAPON]: { x: SCREEN_WIDTH/2 + 200, y: 300 },   // Right side
            [EquipmentSlot.ARMOR]: { x: SCREEN_WIDTH/2, y: 350 },          // Center chest
            [EquipmentSlot.ACCESSORY]: { x: SCREEN_WIDTH/2 - 200, y: 400 } // Left side
        };
    }
    
    static drawEquipmentSlot(scene, slot, position, equippedItem) {
        const { x, y } = position;
        
        // Draw equipment slot background
        const slotBg = scene.add.circle(x, y, 60, COLORS.DARK_GRAY)
            .setStrokeStyle(3, COLORS.WHITE);
        
        if (equippedItem) {
            // Draw item name
            const itemNameText = scene.add.text(x, y - 80, equippedItem.name, {
                fontSize: '18px',
                fontFamily: 'Arial',
                fill: '#FFFFFF',
                align: 'center'
            }).setOrigin(0.5);
            
            // Draw item tier color indicator
            const tierColor = equippedItem.getTierColor();
            const tierCircle = scene.add.circle(x, y, 50, tierColor);
            
            // Draw stats
            let statsY = y + 80;
            const stats = [];
            
            if (equippedItem.attackBonus > 0) {
                stats.push({ text: `ATK +${equippedItem.attackBonus}`, color: '#FF4444' });
            }
            if (equippedItem.defenseBonus > 0) {
                stats.push({ text: `DEF +${equippedItem.defenseBonus}`, color: '#4444FF' });
            }
            if (equippedItem.speedBonus > 0) {
                stats.push({ text: `SPD +${equippedItem.speedBonus}`, color: '#44FF44' });
            }
            if (equippedItem.healthBonus > 0) {
                stats.push({ text: `HP +${equippedItem.healthBonus}`, color: '#FFFF44' });
            }
            
            stats.forEach(stat => {
                scene.add.text(x, statsY, stat.text, {
                    fontSize: '14px',
                    fontFamily: 'Arial',
                    fill: stat.color,
                    align: 'center'
                }).setOrigin(0.5);
                statsY += 20;
            });
            
            return { slotBg, tierCircle, itemNameText };
        } else {
            // Empty slot
            const slotText = scene.add.text(x, y, `Empty ${slot.charAt(0).toUpperCase() + slot.slice(1)}`, {
                fontSize: '16px',
                fontFamily: 'Arial',
                fill: '#808080',
                align: 'center'
            }).setOrigin(0.5);
            
            return { slotBg, slotText };
        }
    }
}