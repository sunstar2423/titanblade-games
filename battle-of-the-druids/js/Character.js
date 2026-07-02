/*
 * Battle of the Druids - Web Edition
 * Character.js
 * 
 * Copyright (c) 2025 TitanBlade Games
 * 
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 * 
 * https://github.com/sunstar2423/titanblade-games
 */

class Character {
    constructor(charType, name = "Unknown", isEnemy = false, enemyType = "goblin") {
        this.charType = charType;
        this.name = name;
        this.isEnemy = isEnemy;
        this.enemyType = enemyType;
        
        // Initialize stats based on character type
        if (CHARACTER_PRESETS[charType]) {
            const baseStats = CHARACTER_PRESETS[charType];
            this.maxHealth = baseStats.health;
            this.health = baseStats.health;
            this.baseAttack = baseStats.attack;
            this.baseDefense = baseStats.defense;
            this.baseSpeed = baseStats.speed;
        } else {
            // Default enemy stats
            this.maxHealth = 80;
            this.health = 80;
            this.baseAttack = 70;
            this.baseDefense = 60;
            this.baseSpeed = 65;
        }
        
        // Player progression stats
        this.victories = 0;
        this.gold = 150; // Increased from 100 to 150 for better early game
        this.dragonShards = 0;
        this.weaponBonus = 0;
        this.armorBonus = 0;
        this.accessoryBonus = 0;
        this.locationVictories = {};
        this.potions = []; // Consumables carried into battle
        
        // Equipment system
        if (!isEnemy) {
            this.equipped = {
                [EquipmentSlot.WEAPON]: { ...STARTING_EQUIPMENT[EquipmentSlot.WEAPON] },
                [EquipmentSlot.ARMOR]: { ...STARTING_EQUIPMENT[EquipmentSlot.ARMOR] },
                [EquipmentSlot.ACCESSORY]: { ...STARTING_EQUIPMENT[EquipmentSlot.ACCESSORY] }
            };
            this.updateEquipmentBonuses();
        } else {
            this.equipped = {};
        }
        
        // Wizard-specific stats
        if (charType === CharacterType.WIZARD) {
            this.maxMana = 100;
            this.mana = 100;
            this.frozenTurns = 0;
        } else {
            this.maxMana = 0;
            this.mana = 0;
            this.frozenTurns = 0;
        }
        
        // Visual properties
        this.color = this.getCharacterColor();
        this.weaponColor = this.getWeaponColor();
        
        // Animation properties
        this.animationOffset = 0;
        this.animationDirection = 1;
    }
    
    getCharacterColor() {
        return CHARACTER_COLORS[this.charType] || COLORS.GRAY;
    }
    
    getWeaponColor() {
        const weaponColors = {
            [CharacterType.KNIGHT]: COLORS.SILVER,
            [CharacterType.WIZARD]: COLORS.GOLD,
            [CharacterType.ROGUE]: COLORS.DARK_GRAY,
            [CharacterType.SOLDIER]: COLORS.BRONZE,
            [CharacterType.ENEMY]: COLORS.RED
        };
        return weaponColors[this.charType] || COLORS.GRAY;
    }
    
    updateEquipmentBonuses() {
        this.weaponBonus = 0;
        this.armorBonus = 0;
        this.accessoryBonus = 0;
        
        for (const [slot, equipment] of Object.entries(this.equipped)) {
            if (equipment) {
                this.weaponBonus += equipment.attackBonus || 0;
                this.armorBonus += equipment.defenseBonus || 0;
                this.accessoryBonus += equipment.speedBonus || 0;
            }
        }
    }
    
    equipItem(equipment) {
        if (!equipment || !equipment.slot) return false;
        
        // Store old health ratio for health bonus items
        const oldHealthRatio = this.maxHealth > 0 ? this.health / this.maxHealth : 1.0;
        
        // Unequip current item in that slot
        const oldEquipment = this.equipped[equipment.slot];
        if (oldEquipment && oldEquipment.healthBonus > 0) {
            this.maxHealth -= oldEquipment.healthBonus;
            this.health = Math.max(1, Math.floor(this.maxHealth * oldHealthRatio));
        }
        
        // Equip new item
        this.equipped[equipment.slot] = { ...equipment };
        
        // Apply health bonus
        if (equipment.healthBonus > 0) {
            this.maxHealth += equipment.healthBonus;
            this.health = Math.floor(this.maxHealth * oldHealthRatio);
        }
        
        // Update all bonuses
        this.updateEquipmentBonuses();
        return true;
    }
    
    getEquippedItem(slot) {
        return this.equipped[slot] || null;
    }
    
    getTotalAttack() {
        return this.baseAttack + this.weaponBonus;
    }
    
    getTotalDefense() {
        return this.baseDefense + this.armorBonus;
    }
    
    getTotalSpeed() {
        return this.baseSpeed + this.accessoryBonus;
    }
    
    getDodgeChance(attacker) {
        const combat = GAME_CONSTANTS.COMBAT;
        const speedEdge = this.getTotalSpeed() - attacker.getTotalSpeed();
        return Math.max(0, Math.min(combat.DODGE_CHANCE_CAP, speedEdge * combat.DODGE_SPEED_FACTOR));
    }

    getCritChance(defender) {
        const combat = GAME_CONSTANTS.COMBAT;
        const speedEdge = this.getTotalSpeed() - defender.getTotalSpeed();
        let chance = combat.CRIT_BASE_CHANCE + Math.max(0, speedEdge * combat.CRIT_SPEED_FACTOR);
        if (this.charType === CharacterType.ROGUE) {
            chance += combat.ROGUE_CRIT_BONUS;
        }
        return Math.min(combat.CRIT_CHANCE_CAP, chance);
    }

    // Shared damage roll for basic and special attacks.
    // Returns { damage, crit, dodged } so the UI can show misses and crits.
    dealDamage(enemy, multiplier = 1.0) {
        if (Math.random() < enemy.getDodgeChance(this)) {
            return { damage: 0, crit: false, dodged: true };
        }

        const baseDamage = Math.floor(this.getTotalAttack() * multiplier);
        const damageRange = Math.floor(baseDamage * 0.2);
        let damage = Math.floor(Math.random() * (2 * damageRange + 1)) + baseDamage - damageRange;

        const crit = Math.random() < this.getCritChance(enemy);
        if (crit) {
            damage = Math.floor(damage * GAME_CONSTANTS.COMBAT.CRIT_MULTIPLIER);
        }

        // Defense reduces damage proportionally, with a floor so hits always matter
        const defenseReduction = enemy.getTotalDefense() / (enemy.getTotalDefense() + 150);
        let finalDamage = Math.floor(damage * (1 - defenseReduction));
        finalDamage = Math.max(Math.floor(damage * GAME_CONSTANTS.SCALING.MIN_DAMAGE_PERCENT), finalDamage);

        enemy.health = Math.max(0, enemy.health - finalDamage);
        return { damage: finalDamage, crit, dodged: false };
    }

    attackEnemy(enemy) {
        return this.dealDamage(enemy, 1.0);
    }

    specialAttack(enemy) {
        return this.dealDamage(enemy, 1.5);
    }

    heal() {
        // Percentage-based so healing stays relevant as max health grows.
        // Enemies heal a smaller share so boss fights don't stall out.
        const healing = GAME_CONSTANTS.HEALING;
        const minPercent = this.isEnemy ? 0.10 : healing.HEAL_PERCENT_MIN;
        const maxPercent = this.isEnemy ? 0.15 : healing.HEAL_PERCENT_MAX;
        const percent = minPercent + Math.random() * (maxPercent - minPercent);
        const healAmount = Math.max(healing.MIN_HEAL, Math.floor(this.maxHealth * percent));
        const oldHealth = this.health;
        this.health = Math.min(this.maxHealth, this.health + healAmount);
        return this.health - oldHealth;
    }

    // Permanent stat gains earned with each victory
    applyVictoryGains() {
        const gains = GAME_CONSTANTS.LEVEL_UP;
        this.maxHealth += gains.HEALTH_PER_VICTORY;
        this.health = Math.min(this.maxHealth, this.health + gains.HEALTH_PER_VICTORY);
        this.baseAttack += gains.ATTACK_PER_VICTORY;
        this.baseDefense += gains.DEFENSE_PER_VICTORY;
        return gains;
    }

    hasPotions() {
        return this.potions && this.potions.length > 0;
    }

    // Drinks the weakest potion in the bag (saves the strong ones for emergencies)
    usePotion() {
        if (!this.hasPotions()) return null;

        let weakestIdx = 0;
        this.potions.forEach((potion, idx) => {
            if (potion.healPercent < this.potions[weakestIdx].healPercent) {
                weakestIdx = idx;
            }
        });

        const potion = this.potions.splice(weakestIdx, 1)[0];
        const healAmount = Math.max(1, Math.floor(this.maxHealth * potion.healPercent / 100));
        const oldHealth = this.health;
        this.health = Math.min(this.maxHealth, this.health + healAmount);
        return { name: potion.name, healed: this.health - oldHealth };
    }
    
    castSpell(spellKey, enemy) {
        if (this.charType !== CharacterType.WIZARD) {
            return { damage: 0, effect: "Not a wizard" };
        }
        
        if (!WIZARD_SPELLS || !WIZARD_SPELLS[spellKey]) {
            console.error('Invalid spell data:', spellKey);
            return { damage: 0, effect: "Unknown spell" };
        }
        
        if (!enemy || enemy.health === undefined) {
            console.error('Invalid enemy target for spell');
            return { damage: 0, effect: "Invalid target" };
        }
        
        const spell = WIZARD_SPELLS[spellKey];
        
        // Check mana
        if (this.mana < spell.manaCost) {
            return { damage: 0, effect: "Not enough mana" };
        }
        
        // Consume mana
        this.mana -= spell.manaCost;
        
        // Calculate damage/effect
        if (spell.specialEffect === "heal") {
            // Healing spell scales with max health
            const healing = GAME_CONSTANTS.HEALING;
            const percent = healing.WIZARD_HEAL_PERCENT_MIN + Math.random() * (healing.WIZARD_HEAL_PERCENT_MAX - healing.WIZARD_HEAL_PERCENT_MIN);
            const healAmount = Math.max(healing.MIN_HEAL, Math.floor(this.maxHealth * percent));
            const oldHealth = this.health;
            this.health = Math.min(this.maxHealth, this.health + healAmount);
            const actualHeal = this.health - oldHealth;
            return { damage: actualHeal, effect: "heal" };
        } else {
            // Damage spell - scales with weapon bonus and victories so spells stay strong late game
            const baseDamage = spell.damageBase + this.weaponBonus + this.victories * 2;
            const variance = Math.floor(baseDamage * spell.damageVariance);
            const damage = Math.floor(Math.random() * (2 * variance + 1)) + baseDamage - variance;

            let finalDamage;

            if (spell.specialEffect === "pierce") {
                // Lightning bolt - ignores armor
                finalDamage = damage;
            } else {
                // Fire/ice use the same proportional defense formula as physical
                // attacks, so they don't fall off a cliff against armored enemies
                const defenseReduction = enemy.getTotalDefense() / (enemy.getTotalDefense() + 150);
                finalDamage = Math.floor(damage * (1 - defenseReduction));
                finalDamage = Math.max(Math.floor(damage * GAME_CONSTANTS.SCALING.MIN_DAMAGE_PERCENT), finalDamage);
            }

            if (spell.specialEffect === "freeze" && Math.random() < (spell.effectChance || 0)) {
                enemy.frozenTurns = 2; // Skip 2 turns
                enemy.health = Math.max(0, enemy.health - finalDamage);
                return { damage: finalDamage, effect: "freeze" };
            }

            // Apply damage
            enemy.health = Math.max(0, enemy.health - finalDamage);
            return { damage: finalDamage, effect: spell.specialEffect };
        }
    }
    
    canCastSpell(spellKey) {
        if (this.charType !== CharacterType.WIZARD) return false;
        if (!WIZARD_SPELLS[spellKey]) return false;
        
        const spell = WIZARD_SPELLS[spellKey];
        return this.mana >= spell.manaCost;
    }
    
    regenerateMana(amount = 10) {
        if (this.charType === CharacterType.WIZARD) {
            this.mana = Math.min(this.maxMana, this.mana + amount);
        }
    }
    
    updateAnimation() {
        this.animationOffset += 0.1 * this.animationDirection;
        if (Math.abs(this.animationOffset) > 10) {
            this.animationDirection *= -1;
        }
    }
    
}

// Enemy creation function
function createEnemy(enemyType, playerVictories = 0, locationName = "Arena") {
    // Validate inputs
    if (!enemyType || typeof enemyType !== 'string') {
        console.error('Invalid enemy type:', enemyType);
        enemyType = 'goblin'; // fallback
    }
    
    if (!ENEMY_STATS) {
        console.error('ENEMY_STATS not loaded');
        return null;
    }
    
    const baseStats = ENEMY_STATS[enemyType] || { health: 80, attack: 70, defense: 35, speed: 65 };

    // Scale based on player victories, capped so grinding can't make enemies unbeatable
    const scaling = GAME_CONSTANTS.SCALING;
    const victoryBonus = Math.min(playerVictories * scaling.ENEMY_VICTORY_MULTIPLIER, scaling.ENEMY_VICTORY_CAP);
    const scaleFactor = 1.0 + victoryBonus;

    // Location-based scaling
    const locationMultipliers = {
        "Arena": 1.0,
        "Maze": 1.1,
        "Haunted Mansion": 1.2,
        "Pirate Docks": 1.3,
        "Ancient City": 1.4,
        "Sacred Shrine": 1.5,
        "Volcanic Caves": 1.6,
        "Battle of Druids Castle": 1.5,
        "Bot Attack": 1.6
    };

    const locationScale = locationMultipliers[locationName] || 1.0;
    const finalScale = scaleFactor * locationScale;
    // Attack grows slower than health/defense so late-game hits stay survivable
    const attackScale = 1.0 + (finalScale - 1.0) * scaling.ENEMY_ATTACK_DAMPENING;

    // Create enemy with scaled stats
    const enemy = new Character(CharacterType.ENEMY, enemyType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), true, enemyType);
    enemy.maxHealth = Math.floor(baseStats.health * finalScale);
    enemy.health = enemy.maxHealth;
    enemy.baseAttack = Math.floor(baseStats.attack * attackScale);
    enemy.baseDefense = Math.floor(baseStats.defense * finalScale);
    // Speed is never scaled - it feeds crit/dodge, and scaling it would let
    // late-game enemies out-crit the player no matter what gear they wear
    enemy.baseSpeed = baseStats.speed;

    return enemy;
}