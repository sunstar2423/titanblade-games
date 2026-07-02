/*
 * Battle of the Druids - Web Edition
 * SaveSystem.js
 *
 * Copyright (c) 2025 TitanBlade Games
 *
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 *
 * https://github.com/sunstar2423/titanblade-games
 */

// Persists the player's hero to localStorage so progress survives page reloads.
const SaveSystem = {
    SAVE_KEY: 'bod_save_v1',

    isAvailable() {
        try {
            const testKey = '__bod_test__';
            window.localStorage.setItem(testKey, '1');
            window.localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            return false;
        }
    },

    save(player) {
        if (!player || player.isEnemy || !this.isAvailable()) return false;

        try {
            const data = {
                version: 1,
                savedAt: Date.now(),
                charType: player.charType,
                name: player.name,
                victories: player.victories,
                gold: player.gold,
                dragonShards: player.dragonShards,
                locationVictories: player.locationVictories,
                maxHealth: player.maxHealth,
                health: player.health,
                baseAttack: player.baseAttack,
                baseDefense: player.baseDefense,
                baseSpeed: player.baseSpeed,
                mana: player.mana,
                maxMana: player.maxMana,
                equipped: player.equipped,
                potions: player.potions
            };
            window.localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            console.warn('💾 Failed to save game:', error);
            return false;
        }
    },

    // Returns raw save data (for menu preview) or null
    peek() {
        if (!this.isAvailable()) return null;

        try {
            const raw = window.localStorage.getItem(this.SAVE_KEY);
            if (!raw) return null;
            const data = JSON.parse(raw);
            if (!data || !data.charType || !CHARACTER_PRESETS[data.charType]) return null;
            return data;
        } catch (error) {
            console.warn('💾 Failed to read save:', error);
            return null;
        }
    },

    // Rebuilds a Character instance from a save
    load() {
        const data = this.peek();
        if (!data) return null;

        try {
            const player = new Character(data.charType, data.name || 'Hero');
            player.victories = data.victories || 0;
            player.gold = typeof data.gold === 'number' ? data.gold : 150;
            player.dragonShards = data.dragonShards || 0;
            player.locationVictories = data.locationVictories || {};
            player.maxHealth = data.maxHealth || player.maxHealth;
            player.health = Math.min(player.maxHealth, data.health || player.maxHealth);
            player.baseAttack = data.baseAttack || player.baseAttack;
            player.baseDefense = data.baseDefense || player.baseDefense;
            player.baseSpeed = data.baseSpeed || player.baseSpeed;
            player.maxMana = data.maxMana || player.maxMana;
            player.mana = Math.min(player.maxMana, typeof data.mana === 'number' ? data.mana : player.maxMana);
            if (data.equipped) {
                player.equipped = data.equipped;
                player.updateEquipmentBonuses();
            }
            player.potions = Array.isArray(data.potions) ? data.potions : [];
            return player;
        } catch (error) {
            console.warn('💾 Failed to load save:', error);
            return null;
        }
    },

    clear() {
        if (!this.isAvailable()) return;
        try {
            window.localStorage.removeItem(this.SAVE_KEY);
        } catch (error) {
            console.warn('💾 Failed to clear save:', error);
        }
    }
};

window.SaveSystem = SaveSystem;
