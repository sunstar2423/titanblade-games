/*
 * Battle of the Druids - Web Edition
 * GameState.js
 * 
 * Copyright (c) 2025 TitanBlade Games
 * 
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 * 
 * https://github.com/sunstar2423/titanblade-games
 */

const SAVE_KEY = 'isle-of-adventure-save';

class GameState {
    constructor() {
        this.inventory = [];
        this.visitedLocations = [];
        this.defeatedEnemies = [];
        this.canEnterSorcerer = false;
    }

    addItem(itemName) {
        if (!this.inventory.includes(itemName)) {
            this.inventory.push(itemName);
            console.log(`Added ${itemName} to inventory`);
            this.save();
        }
    }

    removeItem(itemName) {
        const idx = this.inventory.indexOf(itemName);
        if (idx !== -1) {
            this.inventory.splice(idx, 1);
            this.save();
        }
    }

    hasItem(itemName) {
        return this.inventory.includes(itemName);
    }

    hasAllItems(itemList) {
        return itemList.every(item => this.inventory.includes(item));
    }

    visitLocation(locationName) {
        if (!this.visitedLocations.includes(locationName)) {
            this.visitedLocations.push(locationName);
            this.save();
        }
    }

    hasVisitedLocation(locationName) {
        return this.visitedLocations.includes(locationName);
    }

    defeatEnemy(enemyName) {
        if (!this.defeatedEnemies.includes(enemyName)) {
            this.defeatedEnemies.push(enemyName);
            this.save();
        }
    }

    hasDefeatedEnemy(enemyName) {
        return this.defeatedEnemies.includes(enemyName);
    }

    checkSorcererAccess() {
        const requiredItems = ['Squid Eye', 'Bottle of Rum', 'Golden Goblet'];
        this.canEnterSorcerer = this.hasAllItems(requiredItems);
        return this.canEnterSorcerer;
    }

    reset() {
        this.inventory = [];
        this.visitedLocations = [];
        this.defeatedEnemies = [];
        this.canEnterSorcerer = false;
        this.clearSave();
    }

    // --- Persistence (localStorage) ---

    save() {
        try {
            const data = {
                inventory: this.inventory,
                visitedLocations: this.visitedLocations,
                defeatedEnemies: this.defeatedEnemies
            };
            localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        } catch (e) {
            // localStorage may be unavailable (private mode, quota); fail silently
            console.warn('Could not save progress:', e);
        }
    }

    load() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return false;
            const data = JSON.parse(raw);
            this.inventory = Array.isArray(data.inventory) ? data.inventory : [];
            this.visitedLocations = Array.isArray(data.visitedLocations) ? data.visitedLocations : [];
            this.defeatedEnemies = Array.isArray(data.defeatedEnemies) ? data.defeatedEnemies : [];
            this.checkSorcererAccess();
            return true;
        } catch (e) {
            console.warn('Could not load progress:', e);
            return false;
        }
    }

    clearSave() {
        try {
            localStorage.removeItem(SAVE_KEY);
        } catch (e) {
            console.warn('Could not clear save:', e);
        }
    }

    static hasSave() {
        try {
            return localStorage.getItem(SAVE_KEY) !== null;
        } catch (e) {
            return false;
        }
    }
}

export default GameState;