/*
 * Battle of the Druids - Web Edition
 * CharacterSelectionScene.js
 * 
 * Copyright (c) 2025 TitanBlade Games
 * 
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 * 
 * https://github.com/sunstar2423/titanblade-games
 */

class CharacterSelectionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterSelection' });
        
        this.characters = [
            {
                name: "Knight",
                type: CharacterType.KNIGHT,
                description: "Balanced warrior with strong defense",
                color: CHARACTER_COLORS[CharacterType.KNIGHT],
                weapon: "⚔️",
                x: 250
            },
            {
                name: "Wizard",
                type: CharacterType.WIZARD,
                description: "Magical attacker with powerful spells",
                color: CHARACTER_COLORS[CharacterType.WIZARD],
                weapon: "🔮",
                x: 500
            },
            {
                name: "Rogue",
                type: CharacterType.ROGUE,
                description: "Fast assassin with critical strikes",
                color: CHARACTER_COLORS[CharacterType.ROGUE],
                weapon: "🗡️",
                x: 750
            },
            {
                name: "Soldier",
                type: CharacterType.SOLDIER,
                description: "Tough fighter with good all-around stats",
                color: CHARACTER_COLORS[CharacterType.SOLDIER],
                weapon: "🔫",
                x: 1000
            }
        ];
        
        this.selectedCharacter = null;
        this.playerName = "";
        this.inputActive = false;
        this.nameInputBox = null;
        this.cursor = null;
    }
    
    create() {
        try {
            console.log('🎯 CharacterSelectionScene starting...');
            const { width, height } = this.scale;

            // Reset state - Phaser reuses scene instances, so anything left
            // over from a previous visit points at destroyed objects
            this.selectedCharacter = null;
            this.playerName = "";
            this.inputActive = false;
            this.nameInputBox = null;
            this.nameInputText = null;
            this.cursor = null;
            this.startButton = null;
            this.startButtonText = null;
            
            // Background
            console.log('🎨 Drawing background...');
            BackgroundRenderer.drawMenuBackground(this);
            
            // Initialize asset manager and start menu music
            if (!this.assetManager) {
                this.assetManager = new AssetManager(this);
            }
            this.assetManager.playMenuMusic(this, true, 0.2);
            
            // Title
            console.log('📝 Adding title...');
            this.add.text(width / 2, 100, 'Choose Your Character', {
                fontSize: '56px',
                fontFamily: 'Arial',
                fill: '#FFD700',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5);
            
            // Create character selection cards
            console.log('👥 Creating character cards...');
            this.createCharacterCards();
            
            
            console.log('📄 Adding instructions...');
            // Instructions
            this.instructionText = this.add.text(width / 2, 450, 'Click on a character class to create a new hero', {
                fontSize: '18px',
                fontFamily: 'Arial',
                fill: '#FFFFFF'
            }).setOrigin(0.5);

            // Continue button if a saved hero exists
            this.createContinueButton();
            
            console.log('⌨️ Keyboard input will be enabled when character is selected...');
            // Note: Keyboard listener is registered only when text input is needed
            
            console.log('✅ CharacterSelectionScene create complete');
            
        } catch (error) {
            console.error('❌ CharacterSelectionScene error:', error);
            console.error('Stack trace:', error.stack);
        }
    }
    
    createContinueButton() {
        const saveData = (typeof SaveSystem !== 'undefined') ? SaveSystem.peek() : null;
        if (!saveData) return;

        const { width } = this.scale;
        const label = `Continue: ${saveData.name} the ${saveData.charType} (Lv ${(saveData.victories || 0) + 1})`;

        const continueBtn = this.add.rectangle(width / 2, 660, 460, 56, 0x1e5c1e)
            .setStrokeStyle(3, COLORS.GOLD)
            .setInteractive();

        const continueText = this.add.text(width / 2, 660, label, {
            fontSize: '22px',
            fontFamily: 'Arial',
            fill: '#FFD700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        continueBtn.on('pointerover', () => continueBtn.setFillStyle(0x2e7c2e));
        continueBtn.on('pointerout', () => continueBtn.setFillStyle(0x1e5c1e));
        continueBtn.on('pointerdown', () => {
            const player = SaveSystem.load();
            if (player) {
                if (window.trackGameEvent) {
                    window.trackGameEvent('save_loaded', 'Player_Actions');
                }
                this.registry.set('currentPlayer', player);
                this.scene.start('MainMenu');
            } else {
                continueText.setText('Save could not be loaded');
            }
        });
    }

    createCharacterCards() {
        try {
            console.log('🃏 Creating character cards...');
            this.characters.forEach((char, index) => {
                console.log(`Creating card for ${char.name}...`);
            // Character card background
            const cardBg = this.add.rectangle(char.x, 300, 200, 220, COLORS.DARK_GRAY)
                .setInteractive()
                .setStrokeStyle(3, COLORS.GRAY);
            
            // Character image or fallback circle
            if (!this.assetManager) {
                this.assetManager = new AssetManager(this);
            }
            const charImage = this.assetManager.getCharacterImage(this, char.name.toLowerCase(), char.x, 270, 140);
            
            // Add glow effect for selection
            charImage.characterData = char;
            
            // Character name
            this.add.text(char.x, 350, char.name, {
                fontSize: '24px',
                fontFamily: 'Arial',
                fill: '#FFFFFF',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            
            // Description (wrapped)
            const descLines = this.wrapText(char.description, 25);
            descLines.forEach((line, lineIndex) => {
                this.add.text(char.x, 380 + (lineIndex * 16), line, {
                    fontSize: '14px',
                    fontFamily: 'Arial',
                    fill: '#CCCCCC'
                }).setOrigin(0.5);
            });
            
            // Store reference for interaction
            cardBg.characterData = char;
            charImage.characterData = char;
            
            // Click handlers
            cardBg.on('pointerdown', () => this.selectCharacter(char, cardBg));
            cardBg.on('pointerover', () => cardBg.setStrokeStyle(3, COLORS.GOLD));
            cardBg.on('pointerout', () => {
                if (this.selectedCharacter !== char) {
                    cardBg.setStrokeStyle(3, COLORS.GRAY);
                }
            });
            
            // Store card reference
            char.cardElement = cardBg;
            });
            console.log('✅ Character cards created successfully');
        } catch (error) {
            console.error('❌ createCharacterCards error:', error);
            console.error('Stack trace:', error.stack);
        }
    }
    
    selectCharacter(character, cardElement) {
        // Clear previous selection
        if (this.selectedCharacter && this.selectedCharacter.cardElement) {
            this.selectedCharacter.cardElement.setStrokeStyle(3, COLORS.GRAY);
        }
        
        // Highlight selected character
        cardElement.setStrokeStyle(5, COLORS.GOLD);
        this.selectedCharacter = character;
        this.selectedCharacter.cardElement = cardElement;
        this.inputActive = true;
        
        // Enable keyboard input only when needed for text entry
        this.input.keyboard.enabled = true;
        // Remove any existing listener before adding new one to prevent duplicates
        this.input.keyboard.off('keydown', this.handleKeyInput);
        this.input.keyboard.on('keydown', this.handleKeyInput, this);
        
        // Update instructions (mobile-friendly)
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const instructionText = isMobile ? 
            'Tap the text box below to enter your name:' : 
            'Enter your name and press Enter:';
        
        // Safety check for instructionText
        if (this.instructionText) {
            this.instructionText.setText(instructionText);
        } else {
            console.error('❌ instructionText not found - recreating...');
            this.instructionText = this.add.text(this.scale.width / 2, 450, instructionText, {
                fontSize: '18px',
                fontFamily: 'Arial',
                fill: '#FFFFFF'
            }).setOrigin(0.5);
        }
        
        // Create name input visualization
        this.createNameInputBox();
    }
    
    createNameInputBox() {
        try {
            const { width } = this.scale;
        
        // Remove old input box if exists
        if (this.nameInputBox) {
            this.nameInputBox.destroy();
        }
        if (this.cursor) {
            this.cursor.destroy();
        }
        if (this.nameInputText) {
            this.nameInputText.destroy();
        }
        
        // Input box background
        this.nameInputBox = this.add.rectangle(width / 2, 520, 300, 40, COLORS.WHITE)
            .setStrokeStyle(2, COLORS.BLACK)
            .setInteractive();
        
        // Input text
        this.nameInputText = this.add.text(width / 2, 520, this.playerName, {
            fontSize: '20px',
            fontFamily: 'Arial',
            fill: '#000000'
        }).setOrigin(0.5);
        
        // Mobile keyboard support
        this.setupMobileInput();

        // Begin Adventure button (click/tap alternative to pressing Enter)
        if (!this.startButton) {
            this.startButton = this.add.rectangle(width / 2, 590, 260, 50, 0x1e5c1e)
                .setStrokeStyle(2, COLORS.WHITE)
                .setInteractive();
            this.startButtonText = this.add.text(width / 2, 590, 'Begin Adventure!', {
                fontSize: '20px',
                fontFamily: 'Arial',
                fill: '#FFFFFF',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            this.startButton.on('pointerover', () => this.startButton.setFillStyle(0x2e7c2e));
            this.startButton.on('pointerout', () => this.startButton.setFillStyle(0x1e5c1e));
            this.startButton.on('pointerdown', () => {
                if (this.playerName.trim().length > 0) {
                    this.createCharacter();
                } else if (this.instructionText) {
                    this.instructionText.setText('Please enter a name for your hero first!');
                }
            });
        }
        
        // Blinking cursor
        this.cursor = this.add.text(width / 2 + this.nameInputText.width / 2 + 5, 520, '|', {
            fontSize: '20px',
            fontFamily: 'Arial',
            fill: '#000000'
        }).setOrigin(0.5);
        
        // Cursor blink animation
        this.tweens.add({
            targets: this.cursor,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        } catch (error) {
            console.error('❌ createNameInputBox error:', error);
            console.error('Stack trace:', error.stack);
        }
    }
    
    setupMobileInput() {
        // Create hidden HTML input for mobile keyboard
        if (!this.mobileInput) {
            this.mobileInput = document.createElement('input');
            this.mobileInput.type = 'text';
            this.mobileInput.style.position = 'absolute';
            this.mobileInput.style.left = '-9999px';
            this.mobileInput.style.opacity = '0';
            this.mobileInput.style.pointerEvents = 'none';
            this.mobileInput.maxLength = 20;
            this.mobileInput.placeholder = 'Enter character name';
            document.body.appendChild(this.mobileInput);
            
            // Handle input changes
            this.mobileInput.addEventListener('input', (e) => {
                this.playerName = e.target.value;
                this.updateNameInput();
            });
            
            // Handle enter key
            this.mobileInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && this.playerName.trim().length > 0) {
                    this.createCharacter();
                }
            });
        }
        
        // Click on input box to focus mobile input
        this.nameInputBox.on('pointerdown', () => {
            if (this.inputActive) {
                this.mobileInput.value = this.playerName;
                this.mobileInput.focus();
                console.log('📱 Mobile input focused for keyboard');
            }
        });
        
        // Also make the text clickable
        this.nameInputText.setInteractive();
        this.nameInputText.on('pointerdown', () => {
            if (this.inputActive) {
                this.mobileInput.value = this.playerName;
                this.mobileInput.focus();
                console.log('📱 Mobile input focused for keyboard');
            }
        });
    }
    
    handleKeyInput(event) {
        if (!this.inputActive) return;
        
        if (event.code === 'Enter' || event.code === 'NumpadEnter') {
            if (this.playerName.trim().length > 0) {
                this.createCharacter();
            }
        } else if (event.code === 'Backspace') {
            this.playerName = this.playerName.slice(0, -1);
            this.updateNameInput();
        } else if (event.key.length === 1 && this.playerName.length < 20) {
            // Only accept printable characters
            if (event.key.match(/[a-zA-Z0-9\s]/)) {
                this.playerName += event.key;
                this.updateNameInput();
            }
        }
    }
    
    updateNameInput() {
        if (this.nameInputText) {
            this.nameInputText.setText(this.playerName);
            
            // Update cursor position
            if (this.cursor) {
                this.cursor.x = this.scale.width / 2 + this.nameInputText.width / 2 + 5;
            }
        }
    }
    
    createCharacter() {
        // Track character creation
        if (window.trackGameEvent) {
            window.trackGameEvent('character_created', 'Player_Actions');
            window.trackGameEvent(`character_${this.selectedCharacter.type.toLowerCase()}`, 'Character_Types');
        }
        
        // Create character object
        const character = new Character(this.selectedCharacter.type, this.playerName.trim());

        // Store globally for other scenes
        this.registry.set('currentPlayer', character);

        // Starting a new hero becomes the active save
        if (typeof SaveSystem !== 'undefined') {
            SaveSystem.save(character);
        }
        
        // Disable keyboard input when character creation is complete
        this.inputActive = false;
        this.input.keyboard.off('keydown', this.handleKeyInput);
        this.input.keyboard.enabled = false;
        
        // Transition to main menu
        this.scene.start('MainMenu');
    }
    
    
    wrapText(text, maxLength) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        words.forEach(word => {
            if ((currentLine + word).length <= maxLength) {
                currentLine += (currentLine ? ' ' : '') + word;
            } else {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            }
        });
        
        if (currentLine) lines.push(currentLine);
        return lines;
    }
    
    shutdown() {
        // Disable keyboard input when leaving this scene
        this.input.keyboard.enabled = false;
        // Clean up keyboard input handler
        this.input.keyboard.off('keydown', this.handleKeyInput);
        
        // Clean up mobile input completely
        if (this.mobileInput) {
            if (this.mobileInput.parentNode) {
                this.mobileInput.parentNode.removeChild(this.mobileInput);
            }
            this.mobileInput = null;
            console.log('📱 Mobile input cleaned up');
        }
        
        // Remove any lingering input elements
        const lingering = document.querySelectorAll('input[type="text"]');
        lingering.forEach(input => {
            if (input.style.left === '-9999px') {
                input.remove();
                console.log('📱 Removed lingering input element');
            }
        });
        
        console.log('📱 Keyboard disabled for mobile');
    }
}