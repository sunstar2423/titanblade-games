/*
 * Battle of the Druids - Web Edition
 * BattleScene.js
 * 
 * Copyright (c) 2025 TitanBlade Games
 * 
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 * 
 * https://github.com/sunstar2423/titanblade-games
 */

class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Battle' });
        this.player = null;
        this.enemy = null;
        this.location = null;
        this.effectManager = null;
        this.battleOver = false;
        this.playerTurn = true;
        this.turnTimer = 0;
        this.statusMessage = "";
        this.statusTimer = 0;
        
        // UI elements
        this.playerHealthBar = null;
        this.enemyHealthBar = null;
        this.playerManaBar = null;
        this.battleButtons = [];
        this.statusText = null;
        this.turnIndicator = null;
        
        // Event cleanup tracking
        this.keyboardEvents = [];
    }
    
    create() {
        const { width, height } = this.scale;
        
        // Get data from registry
        this.player = this.registry.get('currentPlayer');
        this.location = this.registry.get('selectedLocation');
        
        if (!this.player || !this.location) {
            // Track battle initialization failure
            if (typeof Sentry !== 'undefined') {
                Sentry.addBreadcrumb({
                    message: 'Battle initialization failed - missing player or location data',
                    category: 'battle',
                    level: 'error',
                    data: {
                        hasPlayer: !!this.player,
                        hasLocation: !!this.location
                    }
                });
            }
            this.scene.start('MainMenu');
            return;
        }
        
        // Create enemy for this location
        const randomEnemyType = this.location.enemies[Math.floor(Math.random() * this.location.enemies.length)];
        this.enemy = createEnemy(randomEnemyType, this.player.victories, this.location.name);
        
        // Track battle started
        const battleStartData = {
            playerClass: this.player.charType,
            playerLevel: this.player.victories + 1,
            playerVictories: this.player.victories,
            locationName: this.location.name,
            enemyType: randomEnemyType,
            enemyName: this.enemy.name,
            enemyMaxHealth: this.enemy.maxHealth,
            playerHealth: this.player.health,
            playerMaxHealth: this.player.maxHealth,
            playerMana: this.player.mana || 0,
            playerGold: this.player.gold
        };
        
        if (typeof trackGameEvent !== 'undefined') {
            trackGameEvent('battle_started', battleStartData);
        }
        
        if (typeof Sentry !== 'undefined') {
            Sentry.addBreadcrumb({
                message: 'Battle started',
                category: 'battle',
                level: 'info',
                data: battleStartData
            });
        }
        
        // Initialize battle state
        this.battleOver = false;
        this.playerTurn = true;
        this.turnTimer = 0;
        this.battleStartTime = Date.now();
        
        // Background
        BackgroundRenderer.drawBattleBackground(this, this.location);
        
        // Initialize effect manager
        this.effectManager = new EffectManager(this);
        
        // Initialize asset manager for audio and start battle music
        this.assetManager = new AssetManager(this);
        this.assetManager.playWorldMusic(this, true, 0.3);
        
        // Create UI
        this.createBattleUI();
        
        // Draw characters
        this.createCharacterDisplays();
        
        // Show enemy dialogue AFTER all UI is created
        this.showEnemyDialogue(randomEnemyType);
        
        // ESC key to return (forfeit battle)
        const escHandler = () => {
            this.forfeitBattle();
        };
        // Note: ESC key disabled to prevent mobile keyboard popup
        // this.input.keyboard.on('keydown-ESC', escHandler);
        // this.keyboardEvents.push({ key: 'keydown-ESC', handler: escHandler });
    }
    
    shutdown() {
        // Track battle scene shutdown
        if (typeof Sentry !== 'undefined') {
            Sentry.addBreadcrumb({
                message: 'Battle scene shutdown',
                category: 'scene_lifecycle',
                level: 'info',
                data: {
                    battleOver: this.battleOver,
                    playerTurn: this.playerTurn,
                    battleDuration: this.battleStartTime ? Date.now() - this.battleStartTime : 0
                }
            });
        }
        
        // Clean up keyboard events
        if (this.keyboardEvents) {
            this.keyboardEvents.forEach(event => {
                this.input.keyboard.off(event.key, event.handler);
            });
            this.keyboardEvents = [];
        }
        
        // Clean up battle buttons
        if (this.battleButtons) {
            this.battleButtons.forEach(btn => {
                if (btn.rect) btn.rect.destroy();
                if (btn.text) btn.text.destroy();
                if (btn.label) btn.label.destroy();
            });
            this.battleButtons = [];
        }
        
        // Clean up effect manager
        if (this.effectManager) {
            this.effectManager.clearAll();
            this.effectManager = null;
        }
        
        // Stop the finale fanfare if it's still playing (world music is shared
        // with the world map, so leave it running for a seamless transition)
        if (this.sound && this.sound.get('victory-fanfare')) {
            this.sound.get('victory-fanfare').stop();
        }
        
        // Clear references
        this.player = null;
        this.enemy = null;
        this.location = null;
        this.assetManager = null;
    }
    
    createBattleUI() {
        const { width, height } = this.scale;
        
        // Turn indicator
        this.turnIndicator = this.add.text(width / 2, 100, 'Your Turn', {
            fontSize: '32px',
            fontFamily: 'Arial',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Status message
        this.statusText = this.add.text(width / 2, 150, '', {
            fontSize: '24px',
            fontFamily: 'Arial',
            fill: '#FFFF00',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Create battle buttons based on character type
        this.createBattleButtons();
        
        // Create health/mana bars
        this.createHealthBars();
    }
    
    createBattleButtons() {
        const { width, height } = this.scale;

        // Clear existing buttons (including any extra labels like mana costs,
        // which previously leaked a new text object on every rebuild)
        this.battleButtons.forEach(btn => {
            if (btn.rect) btn.rect.destroy();
            if (btn.text) btn.text.destroy();
            if (btn.label) btn.label.destroy();
        });
        this.battleButtons = [];

        const potionCount = this.player.potions ? this.player.potions.length : 0;
        let buttonDefs;

        if (this.player.charType === CharacterType.WIZARD) {
            buttonDefs = [
                { text: 'Attack', action: () => this.playerAttack(), x: 120 },
                { text: 'Fireball', action: () => this.castSpell('fireball'), x: 270, key: 'fireball' },
                { text: 'Ice Shard', action: () => this.castSpell('iceShard'), x: 420, key: 'iceShard' },
                { text: 'Lightning', action: () => this.castSpell('lightningBolt'), x: 570, key: 'lightningBolt' },
                { text: 'Heal', action: () => this.castSpell('arcaneHealing'), x: 720, key: 'arcaneHealing' },
                { text: `Potion (${potionCount})`, action: () => this.playerUsePotion(), x: 870, enabled: potionCount > 0 }
            ];
        } else {
            buttonDefs = [
                { text: 'Attack', action: () => this.playerAttack(), x: 200 },
                { text: 'Special', action: () => this.playerSpecialAttack(), x: 400 },
                { text: 'Heal', action: () => this.playerHeal(), x: 600 },
                { text: `Potion (${potionCount})`, action: () => this.playerUsePotion(), x: 800, enabled: potionCount > 0 }
            ];
        }

        buttonDefs.forEach(btn => {
            const canUse = (btn.enabled !== false) && (!btn.key || this.player.canCastSpell(btn.key));
            const buttonColor = canUse ? COLORS.DARK_GRAY : 0x2a2a2a;
            const textColor = canUse ? '#FFFFFF' : '#666666';

            const button = this.add.rectangle(btn.x, height - 150, 130, 40, buttonColor)
                .setStrokeStyle(2, canUse ? COLORS.WHITE : COLORS.GRAY);

            const buttonText = this.add.text(btn.x, height - 150, btn.text, {
                fontSize: '16px',
                fontFamily: 'Arial',
                fill: textColor
            }).setOrigin(0.5);

            if (canUse) {
                button.setInteractive();
                button.on('pointerdown', btn.action);
                button.on('pointerover', () => button.setFillStyle(COLORS.GRAY));
                button.on('pointerout', () => button.setFillStyle(COLORS.DARK_GRAY));
            }

            // Show mana cost for spells
            let label = null;
            if (btn.key && WIZARD_SPELLS[btn.key]) {
                const spell = WIZARD_SPELLS[btn.key];
                label = this.add.text(btn.x, height - 125, `${spell.manaCost}MP`, {
                    fontSize: '12px',
                    fontFamily: 'Arial',
                    fill: '#40E0D0'
                }).setOrigin(0.5);
            }

            this.battleButtons.push({ rect: button, text: buttonText, label, key: btn.key });
        });

        // Flee button (bottom-right corner, away from the action row)
        const fleeBtn = this.add.rectangle(width - 90, height - 60, 120, 36, 0x5a1f1f)
            .setStrokeStyle(2, COLORS.WHITE)
            .setInteractive();
        const fleeText = this.add.text(width - 90, height - 60, 'Flee', {
            fontSize: '16px',
            fontFamily: 'Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        fleeBtn.on('pointerdown', () => this.forfeitBattle());
        fleeBtn.on('pointerover', () => fleeBtn.setFillStyle(0x803030));
        fleeBtn.on('pointerout', () => fleeBtn.setFillStyle(0x5a1f1f));
        this.battleButtons.push({ rect: fleeBtn, text: fleeText, label: null, alwaysOn: true });
    }
    
    createHealthBars() {
        const { width, height } = this.scale;
        
        // Player health bar (left side)
        this.createHealthBar(100, 50, this.player, 'player');
        
        // Enemy health bar (right side)
        this.createHealthBar(width - 250, 50, this.enemy, 'enemy');
        
        // Wizard mana bar
        if (this.player.charType === CharacterType.WIZARD) {
            this.createManaBar();
        }
    }
    
    createHealthBar(x, y, character, type) {
        const barWidth = 200;
        const barHeight = 20;
        
        // Character name
        this.add.text(x + barWidth / 2, y - 25, character.name, {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Health bar background
        const healthBg = this.add.rectangle(x + barWidth / 2, y, barWidth, barHeight, COLORS.RED);
        
        // Health bar fill (left-aligned)
        const healthRatio = character.health / character.maxHealth;
        const fillWidth = barWidth * healthRatio;
        const healthFill = this.add.rectangle(
            x + fillWidth / 2, // Position from left edge of bar
            y, 
            fillWidth, 
            barHeight, 
            COLORS.GREEN
        );
        
        // Health bar border
        this.add.rectangle(x + barWidth / 2, y, barWidth, barHeight)
            .setStrokeStyle(2, COLORS.WHITE)
            .setFillStyle();
        
        // Health text
        const healthText = this.add.text(x + barWidth / 2, y, `${character.health}/${character.maxHealth}`, {
            fontSize: '14px',
            fontFamily: 'Arial',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);
        
        // Store references for updates
        if (type === 'player') {
            this.playerHealthBar = { 
                bg: healthBg, 
                fill: healthFill, 
                text: healthText, 
                x: x, 
                barWidth: barWidth 
            };
        } else {
            this.enemyHealthBar = { 
                bg: healthBg, 
                fill: healthFill, 
                text: healthText, 
                x: x, 
                barWidth: barWidth 
            };
        }
    }
    
    createManaBar() {
        const x = 100;
        const y = 80;
        const barWidth = 200;
        const barHeight = 12;
        
        // Mana bar background
        const manaBg = this.add.rectangle(x + barWidth / 2, y, barWidth, barHeight, COLORS.DARK_GRAY);
        
        // Mana bar fill (left-aligned)
        const manaRatio = this.player.mana / this.player.maxMana;
        const fillWidth = barWidth * manaRatio;
        const manaFill = this.add.rectangle(
            x + fillWidth / 2,
            y,
            fillWidth,
            barHeight,
            COLORS.TURQUOISE
        );
        
        // Mana bar border
        this.add.rectangle(x + barWidth / 2, y, barWidth, barHeight)
            .setStrokeStyle(2, COLORS.WHITE)
            .setFillStyle();
        
        // Mana text
        const manaText = this.add.text(x + barWidth / 2, y + 20, `Mana: ${this.player.mana}/${this.player.maxMana}`, {
            fontSize: '14px',
            fontFamily: 'Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        
        this.playerManaBar = { 
            bg: manaBg, 
            fill: manaFill, 
            text: manaText, 
            x: x, 
            barWidth: barWidth 
        };
    }
    
    createCharacterDisplays() {
        const { width, height } = this.scale;

        // Player character (left side)
        this.playerImage = this.assetManager.getCharacterImage(this, this.player.charType.toLowerCase(), 300, 350, 180);

        // Enemy character (right side)
        this.enemyImage = this.assetManager.getEnemyImage(this, this.enemy.name, width - 300, 350, 180);

        // Gentle idle bob so the battlefield doesn't feel static
        [this.playerImage, this.enemyImage].forEach(sprite => {
            this.tweens.add({
                targets: sprite,
                y: sprite.y - 8,
                duration: 1200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });
    }

    // Lunge the attacker toward the target and flash the target red
    playAttackAnimation(attackerSprite, targetSprite, direction = 1) {
        if (attackerSprite) {
            this.tweens.add({
                targets: attackerSprite,
                x: attackerSprite.x + 60 * direction,
                duration: 120,
                yoyo: true,
                ease: 'Power2'
            });
        }
        this.flashSprite(targetSprite);
    }

    flashSprite(sprite) {
        if (!sprite) return;
        if (sprite.setTint) {
            sprite.setTint(0xFF6666);
            this.time.delayedCall(180, () => {
                if (sprite.active && sprite.clearTint) sprite.clearTint();
            });
        } else {
            // Shape fallback (no tint support) - quick alpha blink
            this.tweens.add({
                targets: sprite,
                alpha: 0.4,
                duration: 90,
                yoyo: true
            });
        }
    }
    
    drawWeaponIndicator(x, y, character) {
        if (character.charType === CharacterType.KNIGHT) {
            // Sword
            this.add.line(x, y, 0, 0, 30, -30, character.getWeaponColor()).setLineWidth(5);
            this.add.circle(x + 15, y - 15, 6, COLORS.GOLD);
        } else if (character.charType === CharacterType.WIZARD) {
            // Staff
            this.add.line(x, y, 0, 0, 25, -60, character.getWeaponColor()).setLineWidth(4);
            this.add.circle(x + 25, y - 60, 10, COLORS.PURPLE);
        } else if (character.charType === CharacterType.ROGUE) {
            // Daggers
            this.add.line(x, y, 0, 0, 22, -22, character.getWeaponColor()).setLineWidth(3);
            this.add.line(x, y, 7, -7, 22, -22, character.getWeaponColor()).setLineWidth(3);
        } else if (character.charType === CharacterType.SOLDIER) {
            // Rifle
            this.add.line(x, y, 0, 0, 60, -15, character.getWeaponColor()).setLineWidth(5);
            this.add.circle(x, y, 4, COLORS.BLACK);
        }
    }
    
    // Battle action methods
    playerAttack() {
        if (!this.playerTurn || this.turnTimer > 0 || this.battleOver) return;
        
        // Play attack sound (higher volume for custom MP3)
        this.assetManager.playSound(this, 'attack', 0.9);

        const result = this.player.attackEnemy(this.enemy);
        this.showAttackResult(this.scale.width - 300, 350, result, 'slash');
        this.playAttackAnimation(this.playerImage, result.dodged ? null : this.enemyImage, 1);

        // Track player attack
        const attackData = {
            actionType: 'attack',
            damage: result.damage,
            playerClass: this.player.charType,
            enemyType: this.enemy.enemyType || this.enemy.name,
            enemyHealthRemaining: this.enemy.health,
            isCritical: result.crit
        };
        
        if (typeof trackGameEvent !== 'undefined') {
            trackGameEvent('player_attack', attackData);
        }
        
        if (typeof Sentry !== 'undefined') {
            Sentry.addBreadcrumb({
                message: `Player attacked for ${result.damage} damage`,
                category: 'battle_action',
                level: 'info',
                data: attackData
            });
        }
        
        this.playerTurn = false;
        this.turnTimer = 60;
        this.player.regenerateMana(GAME_CONSTANTS.MANA.REGEN_ON_ATTACK);

        this.updateUI();
        this.checkBattleEnd();
    }

    playerSpecialAttack() {
        if (!this.playerTurn || this.turnTimer > 0 || this.battleOver) return;

        // Play special attack sound
        this.assetManager.playSound(this, 'special', 0.7);

        const result = this.player.specialAttack(this.enemy);
        this.showAttackResult(this.scale.width - 300, 350, result, `special_${this.player.charType.toLowerCase()}`, true);
        this.playAttackAnimation(this.playerImage, result.dodged ? null : this.enemyImage, 1);

        const effectType = `special_${this.player.charType.toLowerCase()}`;

        // Track special attack
        const specialAttackData = {
            actionType: 'special_attack',
            damage: result.damage,
            playerClass: this.player.charType,
            enemyType: this.enemy.enemyType || this.enemy.name,
            enemyHealthRemaining: this.enemy.health,
            isCritical: result.crit,
            specialType: effectType
        };

        if (typeof trackGameEvent !== 'undefined') {
            trackGameEvent('player_special_attack', specialAttackData);
        }

        if (typeof Sentry !== 'undefined') {
            Sentry.addBreadcrumb({
                message: `Player used special attack for ${result.damage} damage`,
                category: 'battle_action',
                level: 'info',
                data: specialAttackData
            });
        }

        this.playerTurn = false;
        this.turnTimer = 60;

        this.updateUI();
        this.checkBattleEnd();
    }

    // Renders damage numbers, misses, and crits for an attack result
    showAttackResult(x, y, result, effectType, isSpecial = false) {
        if (result.dodged) {
            this.effectManager.addDamageNumber(x, y, 'MISS');
            return;
        }
        if (result.crit) {
            this.effectManager.addDamageNumber(x, y, `${result.damage} CRIT!`, true);
            this.cameras.main.shake(200, 0.005);
        } else {
            this.effectManager.addDamageNumber(x, y, result.damage, isSpecial);
        }
        this.effectManager.addAttackEffect(x, y, effectType);
    }

    playerUsePotion() {
        if (!this.playerTurn || this.turnTimer > 0 || this.battleOver) return;
        if (!this.player.hasPotions()) {
            this.showStatusMessage("No potions in your bag!", 60);
            return;
        }

        this.assetManager.playSound(this, 'heal', 0.5);

        const result = this.player.usePotion();
        this.effectManager.addDamageNumber(300, 350, result.healed, false, true);
        this.effectManager.addAttackEffect(300, 350, 'spell_heal');
        this.showStatusMessage(`${result.name}: restored ${result.healed} HP!`, 120);

        if (typeof trackGameEvent !== 'undefined') {
            trackGameEvent('potion_used', {
                potionName: result.name,
                healAmount: result.healed,
                playerClass: this.player.charType,
                potionsRemaining: this.player.potions.length
            });
        }

        this.playerTurn = false;
        this.turnTimer = 60;

        this.updateUI();
    }
    
    playerHeal() {
        if (!this.playerTurn || this.turnTimer > 0 || this.battleOver) return;
        
        // Play heal sound
        this.assetManager.playSound(this, 'heal', 0.5);
        
        const healAmount = this.player.heal();
        this.effectManager.addDamageNumber(300, 350, healAmount, false, true);
        
        // Track player heal
        const healData = {
            actionType: 'heal',
            healAmount: healAmount,
            playerClass: this.player.charType,
            playerHealthAfter: this.player.health,
            playerMaxHealth: this.player.maxHealth
        };
        
        if (typeof trackGameEvent !== 'undefined') {
            trackGameEvent('player_heal', healData);
        }
        
        if (typeof Sentry !== 'undefined') {
            Sentry.addBreadcrumb({
                message: `Player healed for ${healAmount} HP`,
                category: 'battle_action',
                level: 'info',
                data: healData
            });
        }
        
        this.playerTurn = false;
        this.turnTimer = 60;
        
        this.updateUI();
    }
    
    castSpell(spellKey) {
        if (!this.playerTurn || this.turnTimer > 0 || this.battleOver) return;
        if (!this.player.canCastSpell(spellKey)) {
            this.showStatusMessage("Not enough mana!", 60);
            
            // Track failed spell cast
            if (typeof Sentry !== 'undefined') {
                Sentry.addBreadcrumb({
                    message: `Spell cast failed - insufficient mana`,
                    category: 'battle_action',
                    level: 'warning',
                    data: {
                        spellKey: spellKey,
                        playerMana: this.player.mana,
                        requiredMana: WIZARD_SPELLS[spellKey]?.manaCost || 'unknown'
                    }
                });
            }
            
            return;
        }
        
        const result = this.player.castSpell(spellKey, this.enemy);
        
        // Track spell cast
        const spellData = {
            actionType: 'spell_cast',
            spellKey: spellKey,
            spellEffect: result.effect,
            damage: result.damage,
            playerClass: this.player.charType,
            playerManaAfter: this.player.mana,
            enemyType: this.enemy.enemyType || this.enemy.name,
            enemyHealthRemaining: this.enemy.health
        };
        
        if (typeof trackGameEvent !== 'undefined') {
            trackGameEvent('spell_cast', spellData);
        }
        
        if (typeof Sentry !== 'undefined') {
            Sentry.addBreadcrumb({
                message: `Spell cast: ${spellKey} (${result.effect})`,
                category: 'battle_action',
                level: 'info',
                data: spellData
            });
        }
        
        if (result.effect === "heal") {
            // Play heal sound for healing spells
            this.assetManager.playSound(this, 'heal', 0.5);
            this.effectManager.addDamageNumber(300, 350, result.damage, false, true);
            this.effectManager.addAttackEffect(300, 350, 'spell_heal');
            this.showStatusMessage(`Healed for ${result.damage} HP!`, 120);
        } else {
            // Play special sound for offensive spells
            this.assetManager.playSound(this, 'special', 0.6);
            this.effectManager.addDamageNumber(this.scale.width - 300, 350, result.damage, true);
            this.effectManager.addAttackEffect(this.scale.width - 300, 350, `spell_${result.effect}`);
            
            if (result.effect === "freeze") {
                this.showStatusMessage(`Ice Shard: ${result.damage} damage! Enemy frozen!`, 120);
            } else if (result.effect === "pierce") {
                this.showStatusMessage(`Lightning: ${result.damage} damage! (Pierced armor)`, 120);
            } else if (result.effect === "fire") {
                this.showStatusMessage(`Fireball: ${result.damage} damage!`, 120);
            }
        }
        
        this.playerTurn = false;
        this.turnTimer = 60;
        
        this.updateUI();
        this.checkBattleEnd();
    }
    
    enemyTurn() {
        if (this.battleOver || this.enemy.health <= 0) return;
        
        // Wizards slowly recover mana every round
        this.player.regenerateMana(GAME_CONSTANTS.MANA.REGEN_PER_TURN);

        // Check if enemy is frozen
        if (this.enemy.frozenTurns > 0) {
            this.enemy.frozenTurns--;
            const remaining = this.enemy.frozenTurns;
            this.showStatusMessage(remaining > 0 ?
                `Enemy is frozen solid! (${remaining} more turn${remaining === 1 ? '' : 's'})` :
                'Enemy is frozen solid!', 120);
            
            // Track enemy frozen turn
            if (typeof Sentry !== 'undefined') {
                Sentry.addBreadcrumb({
                    message: 'Enemy turn skipped - frozen',
                    category: 'battle_action',
                    level: 'info',
                    data: {
                        enemyType: this.enemy.enemyType || this.enemy.name,
                        frozenTurnsRemaining: this.enemy.frozenTurns
                    }
                });
            }
            
            this.playerTurn = true;
            this.turnTimer = 60;
            this.updateUI();
            return;
        }

        // Enemy AI: only heals when actually hurt, otherwise attacks
        const canHeal = this.enemy.health < this.enemy.maxHealth * 0.6;
        const action = Math.random();
        let actionType, damage;

        if (canHeal && action < 0.2) {
            // Heal
            actionType = 'heal';
            damage = this.enemy.heal();
            this.effectManager.addDamageNumber(this.scale.width - 300, 350, damage, false, true);
            this.effectManager.addAttackEffect(this.scale.width - 300, 350, 'spell_heal');
        } else if (action < 0.75) {
            // Attack
            actionType = 'attack';
            const result = this.enemy.attackEnemy(this.player);
            damage = result.damage;
            this.showAttackResult(300, 350, result, 'slash');
            this.playAttackAnimation(this.enemyImage, result.dodged ? null : this.playerImage, -1);
        } else {
            // Special attack
            actionType = 'special_attack';
            const result = this.enemy.specialAttack(this.player);
            damage = result.damage;
            this.showAttackResult(300, 350, result, `special_${this.enemy.enemyType}`, true);
            this.playAttackAnimation(this.enemyImage, result.dodged ? null : this.playerImage, -1);
        }

        // Track enemy action
        const enemyActionData = {
            actionType: actionType,
            damage: damage,
            enemyType: this.enemy.enemyType || this.enemy.name,
            enemyHealthAfter: this.enemy.health,
            playerHealthRemaining: this.player.health
        };
        
        if (typeof trackGameEvent !== 'undefined') {
            trackGameEvent('enemy_action', enemyActionData);
        }
        
        if (typeof Sentry !== 'undefined') {
            Sentry.addBreadcrumb({
                message: `Enemy ${actionType}: ${damage} ${actionType === 'heal' ? 'HP' : 'damage'}`,
                category: 'battle_action',
                level: 'info',
                data: enemyActionData
            });
        }
        
        this.playerTurn = true;
        this.turnTimer = 60;
        
        this.updateUI();
        this.checkBattleEnd();
    }
    
    updateUI() {
        // Update health bars with proper left-to-right draining
        if (this.playerHealthBar) {
            const healthRatio = this.player.health / this.player.maxHealth;
            const newWidth = this.playerHealthBar.barWidth * healthRatio;
            
            // Update fill bar width and position from left edge
            this.playerHealthBar.fill.setSize(newWidth, 20);
            this.playerHealthBar.fill.setPosition(this.playerHealthBar.x + newWidth / 2, this.playerHealthBar.fill.y);
            this.playerHealthBar.text.setText(`${this.player.health}/${this.player.maxHealth}`);
        }
        
        if (this.enemyHealthBar) {
            const healthRatio = this.enemy.health / this.enemy.maxHealth;
            const newWidth = this.enemyHealthBar.barWidth * healthRatio;
            
            // Update fill bar width and position from left edge
            this.enemyHealthBar.fill.setSize(newWidth, 20);
            this.enemyHealthBar.fill.setPosition(this.enemyHealthBar.x + newWidth / 2, this.enemyHealthBar.fill.y);
            this.enemyHealthBar.text.setText(`${this.enemy.health}/${this.enemy.maxHealth}`);
        }
        
        // Update mana bar for wizards with proper left-to-right draining
        if (this.playerManaBar && this.player.charType === CharacterType.WIZARD) {
            const manaRatio = this.player.mana / this.player.maxMana;
            const newWidth = this.playerManaBar.barWidth * manaRatio;
            
            // Update fill bar width and position from left edge
            this.playerManaBar.fill.setSize(newWidth, 12);
            this.playerManaBar.fill.setPosition(this.playerManaBar.x + newWidth / 2, this.playerManaBar.fill.y);
            this.playerManaBar.text.setText(`Mana: ${this.player.mana}/${this.player.maxMana}`);
        }
        
        // Update turn indicator
        this.turnIndicator.setText(this.playerTurn ? "Your Turn" : "Enemy Turn");
        this.turnIndicator.setStyle({ fill: this.playerTurn ? '#7CFC7C' : '#FF8888' });

        // Rebuild action buttons (updates potion count and spell affordability),
        // then dim them while it's not the player's turn
        this.createBattleButtons();
        const buttonAlpha = this.playerTurn && !this.battleOver ? 1.0 : 0.5;
        this.battleButtons.forEach(btn => {
            const alpha = btn.alwaysOn ? 1.0 : buttonAlpha;
            if (btn.rect) btn.rect.setAlpha(alpha);
            if (btn.text) btn.text.setAlpha(alpha);
            if (btn.label) btn.label.setAlpha(alpha);
        });
    }
    
    showStatusMessage(message, duration) {
        this.statusMessage = message;
        this.statusTimer = duration;
        this.statusText.setText(message);
    }
    
    checkBattleEnd() {
        if (this.player.health <= 0) {
            this.battleOver = true;
            
            // Track battle defeat
            const defeatData = {
                battleResult: 'defeat',
                playerClass: this.player.charType,
                playerLevel: this.player.victories + 1,
                locationName: this.location.name,
                enemyType: this.enemy.enemyType || this.enemy.name,
                enemyHealthRemaining: this.enemy.health,
                playerVictories: this.player.victories,
                battleDuration: Date.now() - (this.battleStartTime || Date.now())
            };
            
            if (typeof trackGameEvent !== 'undefined') {
                trackGameEvent('battle_defeat', defeatData);
            }
            
            if (typeof Sentry !== 'undefined') {
                Sentry.addBreadcrumb({
                    message: 'Battle ended in defeat',
                    category: 'battle_result',
                    level: 'info',
                    data: defeatData
                });
            }
            
            this.showDefeat();
        } else if (this.enemy.health <= 0) {
            this.battleOver = true;
            
            // Track battle victory
            const victoryData = {
                battleResult: 'victory',
                playerClass: this.player.charType,
                playerLevel: this.player.victories + 1,
                locationName: this.location.name,
                enemyType: this.enemy.enemyType || this.enemy.name,
                playerHealthRemaining: this.player.health,
                playerVictories: this.player.victories + 1,
                battleDuration: Date.now() - (this.battleStartTime || Date.now())
            };
            
            if (typeof trackGameEvent !== 'undefined') {
                trackGameEvent('battle_victory', victoryData);
            }
            
            if (typeof Sentry !== 'undefined') {
                Sentry.addBreadcrumb({
                    message: 'Battle ended in victory',
                    category: 'battle_result',
                    level: 'info',
                    data: victoryData
                });
            }
            
            this.showVictory();
        }
    }
    
    showVictory() {
        const { width, height } = this.scale;
        
        // Play victory sound
        this.assetManager.playSound(this, 'victory', 0.8);
        
        // Calculate rewards (improved gold economy)
        const goldReward = Math.floor(Math.random() * 31) + 40 + this.location.minVictoriesRequired * 25;
        const shardReward = Math.floor(Math.random() * 3) + 1;

        // Update player
        this.player.victories++;
        this.player.gold += goldReward;
        this.player.dragonShards += shardReward;
        this.player.locationVictories[this.location.name] = (this.player.locationVictories[this.location.name] || 0) + 1;

        // Every victory grants permanent stat gains (the level-up system)
        const gains = this.player.applyVictoryGains();

        // Check for final victory at Battle of Druids Castle
        const isFinaleVictory = this.location.name === "Battle of Druids Castle" &&
                               this.player.locationVictories[this.location.name] === 3;

        // Save progress
        if (typeof SaveSystem !== 'undefined') {
            SaveSystem.save(this.player);
        }

        // Track victory rewards and level up
        const rewardsData = {
            goldReward: goldReward,
            shardReward: shardReward,
            totalVictories: this.player.victories,
            locationVictories: this.player.locationVictories[this.location.name],
            playerLevel: this.player.victories + 1,
            isFinaleVictory: isFinaleVictory,
            totalGold: this.player.gold,
            totalShards: this.player.dragonShards
        };
        
        if (typeof trackGameEvent !== 'undefined') {
            trackGameEvent('victory_rewards', rewardsData);
        }
        
        if (typeof Sentry !== 'undefined') {
            Sentry.addBreadcrumb({
                message: `Victory rewards: ${goldReward} gold, ${shardReward} shards, level up!`,
                category: 'battle_result',
                level: 'info',
                data: rewardsData
            });
        }

        // Track finale victory
        if (isFinaleVictory) {
            if (typeof trackGameEvent !== 'undefined') {
                trackGameEvent('finale_victory', {
                    playerClass: this.player.charType,
                    playerLevel: this.player.victories + 1,
                    totalVictories: this.player.victories,
                    completionTime: Date.now() - (this.battleStartTime || Date.now())
                });
            }
            
            if (typeof Sentry !== 'undefined') {
                Sentry.addBreadcrumb({
                    message: 'FINALE VICTORY - Game completed!',
                    category: 'game_completion',
                    level: 'info',
                    data: {
                        playerClass: this.player.charType,
                        playerLevel: this.player.victories + 1,
                        totalVictories: this.player.victories
                    }
                });
            }
        }
        
        // Show special finale victory or regular victory
        if (isFinaleVictory) {
            this.showFinaleVictory();
        } else {
            this.showRegularVictory(goldReward, shardReward, gains);
        }
    }

    showRegularVictory(goldReward, shardReward, gains) {
        const { width, height } = this.scale;

        // Victory overlay (interactive so battle buttons underneath can't be clicked)
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, COLORS.BLACK, 0.8)
            .setInteractive();

        const victoryTitle = this.add.text(width / 2, height / 2 - 130, 'VICTORY!', {
            fontSize: '64px',
            fontFamily: 'Arial',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Little celebratory pop
        victoryTitle.setScale(0.3);
        this.tweens.add({
            targets: victoryTitle,
            scaleX: 1,
            scaleY: 1,
            duration: 400,
            ease: 'Back.easeOut'
        });

        const rewardText = [
            `Gold Earned: +${goldReward}`,
            `Dragon Shards: +${shardReward}`,
            `Total Victories: ${this.player.victories}`,
            `Location: ${this.location.name} (${this.player.locationVictories[this.location.name]}/3)`
        ];

        rewardText.forEach((text, index) => {
            this.add.text(width / 2, height / 2 - 50 + index * 30, text, {
                fontSize: '20px',
                fontFamily: 'Arial',
                fill: '#FFFFFF'
            }).setOrigin(0.5);
        });

        // Level-up banner
        this.add.text(width / 2, height / 2 + 90,
            `⬆ Level ${this.player.victories + 1}!  +${gains.HEALTH_PER_VICTORY} Max HP, +${gains.ATTACK_PER_VICTORY} Attack, +${gains.DEFENSE_PER_VICTORY} Defense`, {
            fontSize: '22px',
            fontFamily: 'Arial',
            fill: '#7CFC7C',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Continue button
        const continueBtn = this.add.rectangle(width / 2, height / 2 + 160, 200, 50, COLORS.GREEN)
            .setStrokeStyle(2, COLORS.WHITE)
            .setInteractive();

        this.add.text(width / 2, height / 2 + 160, 'Continue', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5);

        continueBtn.on('pointerdown', () => {
            this.registry.set('currentPlayer', this.player);
            this.scene.start('WorldMap'); // Return to world map instead of main menu
        });
    }
    
    showFinaleVictory() {
        const { width, height } = this.scale;
        
        // Play victory fanfare
        this.assetManager.playVictoryFanfare(this, 0.8);

        // Dark overlay background (interactive to block battle buttons underneath)
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, COLORS.BLACK, 0.9)
            .setInteractive();
        
        // Show victory image if loaded, otherwise use colored background
        let victoryImage = null;
        if (this.textures.exists('victory')) {
            victoryImage = this.add.image(width / 2, height / 2 - 50, 'victory');
            victoryImage.setDisplaySize(Math.min(400, width * 0.6), Math.min(300, height * 0.4));
        } else {
            // Fallback: decorative golden rectangle
            victoryImage = this.add.rectangle(width / 2, height / 2 - 50, 400, 200, COLORS.GOLD)
                .setStrokeStyle(5, COLORS.WHITE);
        }
        
        // Main congratulations message
        this.add.text(width / 2, height / 2 + 150, 'Congratulations you are victorious!', {
            fontSize: '32px',
            fontFamily: 'Arial',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);
        
        // Additional celebration text
        this.add.text(width / 2, height / 2 + 200, 'You have conquered the Battle of Druids Castle!', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        
        this.add.text(width / 2, height / 2 + 230, 'You are the ultimate champion!', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: '#FFD700',
            fontStyle: 'italic',
            align: 'center'
        }).setOrigin(0.5);
        
        // Continue button (larger and more prominent)
        const continueBtn = this.add.rectangle(width / 2, height / 2 + 300, 250, 60, COLORS.GOLD)
            .setStrokeStyle(3, COLORS.WHITE)
            .setInteractive();
        
        this.add.text(width / 2, height / 2 + 300, 'Continue Your Journey', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fill: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Add some particle effects for celebration
        this.createCelebrationEffects();
        
        continueBtn.on('pointerdown', () => {
            this.registry.set('currentPlayer', this.player);
            this.scene.start('WorldMap');
        });
    }
    
    createCelebrationEffects() {
        const { width, height } = this.scale;
        
        // Create golden sparkles around the screen
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const sparkle = this.add.circle(x, y, Math.random() * 3 + 1, COLORS.GOLD, 0.8);
            
            // Animate sparkles
            this.tweens.add({
                targets: sparkle,
                alpha: 0,
                scaleX: 2,
                scaleY: 2,
                duration: 2000,
                delay: Math.random() * 1000,
                ease: 'Power2',
                onComplete: () => {
                    sparkle.destroy();
                }
            });
        }
        
        // Add some floating text effects
        const celebrationTexts = ['🎉', '⭐', '👑', '🏆'];
        celebrationTexts.forEach((text, index) => {
            const textObj = this.add.text(
                100 + index * (width - 200) / 3, 
                height - 100, 
                text, 
                { fontSize: '24px' }
            );
            
            this.tweens.add({
                targets: textObj,
                y: 50,
                alpha: 0,
                duration: 3000,
                delay: index * 500,
                ease: 'Power2',
                onComplete: () => {
                    textObj.destroy();
                }
            });
        });
    }
    
    showDefeat() {
        const { width, height } = this.scale;

        // Play defeat sound
        this.assetManager.playSound(this, 'defeat', 0.7);

        // Defeat overlay (interactive to block battle buttons underneath)
        const elements = [];
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, COLORS.BLACK, 0.8)
            .setInteractive();
        elements.push(overlay);

        elements.push(this.add.text(width / 2, height / 2 - 80, 'DEFEAT', {
            fontSize: '64px',
            fontFamily: 'Arial',
            fill: '#FF0000',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5));

        elements.push(this.add.text(width / 2, height / 2 - 10, 'Better luck next time, warrior!', {
            fontSize: '24px',
            fontFamily: 'Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5));

        // Dragon Shard revive option - get back up and keep fighting!
        const reviveCost = GAME_CONSTANTS.REVIVE_SHARD_COST;
        if (this.player.dragonShards >= reviveCost) {
            const reviveBtn = this.add.rectangle(width / 2, height / 2 + 60, 320, 50, 0x6a0dad)
                .setStrokeStyle(2, COLORS.GOLD)
                .setInteractive();
            const reviveText = this.add.text(width / 2, height / 2 + 60,
                `Revive! (${reviveCost} Dragon Shards)`, {
                fontSize: '20px',
                fontFamily: 'Arial',
                fill: '#FFD700'
            }).setOrigin(0.5);
            elements.push(reviveBtn, reviveText);

            reviveBtn.on('pointerover', () => reviveBtn.setFillStyle(0x8a2dcd));
            reviveBtn.on('pointerout', () => reviveBtn.setFillStyle(0x6a0dad));
            reviveBtn.on('pointerdown', () => {
                this.player.dragonShards -= reviveCost;
                this.player.health = Math.floor(this.player.maxHealth * 0.5);
                this.battleOver = false;
                this.playerTurn = true;
                this.turnTimer = 30;

                elements.forEach(el => el.destroy());
                this.assetManager.playSound(this, 'heal', 0.6);
                this.effectManager.addDamageNumber(300, 350, this.player.health, false, true);
                this.showStatusMessage('The Dragon Shards revive you!', 120);
                this.updateUI();

                if (typeof trackGameEvent !== 'undefined') {
                    trackGameEvent('shard_revive', {
                        shardsRemaining: this.player.dragonShards,
                        locationName: this.location.name
                    });
                }
            });
        }

        // Continue button
        const continueBtn = this.add.rectangle(width / 2, height / 2 + 130, 200, 50, COLORS.RED)
            .setStrokeStyle(2, COLORS.WHITE)
            .setInteractive();
        elements.push(continueBtn);

        elements.push(this.add.text(width / 2, height / 2 + 130, 'Continue', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5));

        continueBtn.on('pointerdown', () => {
            // Restore player health
            this.player.health = this.player.maxHealth;
            this.registry.set('currentPlayer', this.player);
            if (typeof SaveSystem !== 'undefined') {
                SaveSystem.save(this.player);
            }
            this.scene.start('MainMenu');
        });
    }
    
    forfeitBattle() {
        // Show confirmation dialog
        const { width, height } = this.scale;
        const elements = [];

        const overlay = this.add.rectangle(width / 2, height / 2, width, height, COLORS.BLACK, 0.8)
            .setInteractive();
        elements.push(overlay);

        elements.push(this.add.rectangle(width / 2, height / 2, 320, 200, COLORS.DARK_GRAY)
            .setStrokeStyle(3, COLORS.WHITE));

        elements.push(this.add.text(width / 2, height / 2 - 40, 'Flee from battle?', {
            fontSize: '24px',
            fontFamily: 'Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5));

        // Yes button
        const yesBtn = this.add.rectangle(width / 2 - 60, height / 2 + 30, 100, 40, COLORS.RED)
            .setStrokeStyle(2, COLORS.WHITE)
            .setInteractive();
        elements.push(yesBtn);

        elements.push(this.add.text(width / 2 - 60, height / 2 + 30, 'Yes', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5));

        yesBtn.on('pointerdown', () => {
            if (typeof trackGameEvent !== 'undefined') {
                trackGameEvent('battle_forfeit', {
                    battleResult: 'forfeit',
                    playerClass: this.player.charType,
                    locationName: this.location.name,
                    enemyType: this.enemy.enemyType || this.enemy.name,
                    playerHealthRemaining: this.player.health,
                    enemyHealthRemaining: this.enemy.health,
                    battleDuration: Date.now() - (this.battleStartTime || Date.now())
                });
            }
            this.scene.start('MainMenu');
        });

        // No button
        const noBtn = this.add.rectangle(width / 2 + 60, height / 2 + 30, 100, 40, COLORS.GREEN)
            .setStrokeStyle(2, COLORS.WHITE)
            .setInteractive();
        elements.push(noBtn);

        elements.push(this.add.text(width / 2 + 60, height / 2 + 30, 'No', {
            fontSize: '18px',
            fontFamily: 'Arial',
            fill: '#FFFFFF'
        }).setOrigin(0.5));

        noBtn.on('pointerdown', () => {
            elements.forEach(el => el.destroy());
        });
    }
    
    update() {
        // Update timers
        if (this.turnTimer > 0) {
            this.turnTimer--;
        }
        
        if (this.statusTimer > 0) {
            this.statusTimer--;
            if (this.statusTimer <= 0) {
                this.statusText.setText('');
            }
        }
        
        // Handle turn transitions
        if (!this.battleOver && this.turnTimer <= 0) {
            if (!this.playerTurn) {
                this.enemyTurn();
            }
        }
        
        // Update registry
        this.registry.set('currentPlayer', this.player);
    }
    
    showEnemyDialogue(enemyType) {
        const { width, height } = this.scale;

        // Get random dialogue for this enemy type
        let dialogue = "Let's battle!"; // Default fallback
        if (ENEMY_DIALOGUE && ENEMY_DIALOGUE[enemyType]) {
            const dialogues = ENEMY_DIALOGUE[enemyType];
            dialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
        }

        // Create dialogue bubble with high depth to appear on top (more visible positioning)
        const dialogueY = 200; // Lower position to avoid conflict with health bars
        const dialogueBg = this.add.rectangle(width / 2, dialogueY, width - 60, 120, 0x001133, 0.95)
            .setStrokeStyle(5, COLORS.YELLOW) // Thicker yellow border
            .setDepth(2000); // Even higher depth to appear on top
        
        const dialogueText = this.add.text(width / 2, dialogueY, `"${dialogue}"`, {
            fontSize: '22px', // Even larger font
            fontFamily: 'Arial',
            fill: '#FFFF99',
            stroke: '#000033',
            strokeThickness: 3,
            align: 'center',
            fontStyle: 'bold',
            wordWrap: { width: width - 120 }
        }).setOrigin(0.5)
          .setDepth(2001); // Even higher depth for text
        
        // Enemy name label
        const enemyName = this.enemy.name || enemyType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const nameText = this.add.text(width / 2, dialogueY - 45, enemyName + " says:", {
            fontSize: '20px', // Larger font
            fontFamily: 'Arial',
            fill: '#FFD700',
            fontStyle: 'bold',
            stroke: '#000033',
            strokeThickness: 3
        }).setOrigin(0.5)
          .setDepth(2001); // High depth for name text
        
        // Auto-hide after 4 seconds
        this.time.delayedCall(4000, () => {
            if (dialogueBg && dialogueBg.active) {
                dialogueBg.destroy();
            }
            if (dialogueText && dialogueText.active) {
                dialogueText.destroy();
            }
            if (nameText && nameText.active) {
                nameText.destroy();
            }
        });
        
        // Allow click to dismiss early
        dialogueBg.setInteractive();
        dialogueBg.on('pointerdown', () => {
            dialogueBg.destroy();
            dialogueText.destroy();
            nameText.destroy();
        });
    }
}