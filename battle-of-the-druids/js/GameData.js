/*
 * Battle of the Druids - Web Edition
 * GameData.js
 * 
 * Copyright (c) 2025 TitanBlade Games
 * 
 * This file is part of Battle of the Druids, licensed under the MIT License.
 * See LICENSE file in the project root for full license information.
 * 
 * https://github.com/sunstar2423/titanblade-games
 */

const SCREEN_WIDTH = 1400;
const SCREEN_HEIGHT = 900;
const FPS = 60;

// Game balance constants
const GAME_CONSTANTS = {
    BATTLE_TIMER: {
        TURN_DURATION: 60,
        STATUS_DISPLAY: 120,
        ANIMATION_DELAY: 30
    },
    SCALING: {
        // Enemies get 2% stronger per player victory, capped at +30%
        ENEMY_VICTORY_MULTIPLIER: 0.02,
        ENEMY_VICTORY_CAP: 0.30,
        // Enemy attack grows at half the rate of their health/defense
        ENEMY_ATTACK_DAMPENING: 0.5,
        MIN_DAMAGE_PERCENT: 0.4
    },
    HEALING: {
        // Heals scale with max health so they stay useful late game
        HEAL_PERCENT_MIN: 0.25,
        HEAL_PERCENT_MAX: 0.35,
        WIZARD_HEAL_PERCENT_MIN: 0.35,
        WIZARD_HEAL_PERCENT_MAX: 0.50,
        MIN_HEAL: 25
    },
    MANA: {
        REGEN_PER_TURN: 5,
        REGEN_ON_ATTACK: 8,
        WIZARD_MAX_MANA: 100
    },
    COMBAT: {
        CRIT_BASE_CHANCE: 0.05,
        CRIT_SPEED_FACTOR: 0.0015,
        CRIT_CHANCE_CAP: 0.35,
        CRIT_MULTIPLIER: 1.6,
        ROGUE_CRIT_BONUS: 0.10,
        DODGE_SPEED_FACTOR: 0.002,
        DODGE_CHANCE_CAP: 0.15
    },
    LEVEL_UP: {
        // Permanent gains per victory
        HEALTH_PER_VICTORY: 5,
        ATTACK_PER_VICTORY: 2,
        DEFENSE_PER_VICTORY: 2
    },
    POTIONS: {
        BAG_LIMIT: 5
    },
    REVIVE_SHARD_COST: 3,
    UI: {
        CHARACTER_SIZE: 120,
        BUTTON_WIDTH: 120,
        BUTTON_HEIGHT: 40,
        HEALTH_BAR_WIDTH: 200,
        HEALTH_BAR_HEIGHT: 20
    }
};

// Colors (Phaser.js uses hex values)
const COLORS = {
    BLACK: 0x000000,
    WHITE: 0xFFFFFF,
    RED: 0xFF0000,
    GREEN: 0x00FF00,
    BLUE: 0x0000FF,
    PURPLE: 0x800080,
    YELLOW: 0xFFFF00,
    GRAY: 0x808080,
    DARK_GRAY: 0x404040,
    LIGHT_BLUE: 0xADD8E6,
    GOLD: 0xFFD700,
    TURQUOISE: 0x40E0D0,
    SILVER: 0xC0C0C0,
    BRONZE: 0xCD7F32
};

// Character types
const CharacterType = {
    KNIGHT: "Knight",
    WIZARD: "Wizard", 
    ROGUE: "Rogue",
    SOLDIER: "Soldier",
    ENEMY: "Enemy"
};

// Item tiers
const ItemTier = {
    BASIC: "Basic",
    INTERMEDIATE: "Intermediate", 
    ADVANCED: "Advanced",
    LEGENDARY: "Legendary",
    MYTHIC: "Mythic"
};

// Equipment slots
const EquipmentSlot = {
    WEAPON: "weapon",
    ARMOR: "armor", 
    ACCESSORY: "accessory"
};

// Character preset stats (reduced attack for better early game balance)
const CHARACTER_PRESETS = {
    [CharacterType.KNIGHT]: { health: 120, attack: 65, defense: 95, speed: 70 },
    [CharacterType.WIZARD]: { health: 90, attack: 75, defense: 70, speed: 85 },
    [CharacterType.ROGUE]: { health: 95, attack: 70, defense: 75, speed: 105 },
    [CharacterType.SOLDIER]: { health: 110, attack: 68, defense: 85, speed: 80 }
};

// Wizard spells
const WIZARD_SPELLS = {
    fireball: {
        name: "Fireball",
        description: "Explosive fire magic with high damage",
        damageBase: 130,
        damageVariance: 0.3,
        specialEffect: "fire",
        manaCost: 25
    },
    iceShard: {
        name: "Ice Shard", 
        description: "Piercing ice that may freeze the enemy",
        damageBase: 90,
        damageVariance: 0.2,
        specialEffect: "freeze",
        manaCost: 20,
        effectChance: 0.3
    },
    lightningBolt: {
        name: "Lightning Bolt",
        description: "Electric attack that ignores armor", 
        damageBase: 100,
        damageVariance: 0.25,
        specialEffect: "pierce",
        manaCost: 22
    },
    arcaneHealing: {
        name: "Arcane Healing",
        description: "Magical restoration of health",
        damageBase: 0,
        damageVariance: 0.0,
        specialEffect: "heal",
        manaCost: 15
    }
};

// Starting equipment
const STARTING_EQUIPMENT = {
    [EquipmentSlot.WEAPON]: {
        name: "Basic Weapon",
        slot: EquipmentSlot.WEAPON,
        tier: ItemTier.BASIC,
        attackBonus: 8, // Increased from 5 to 8
        defenseBonus: 0,
        speedBonus: 0,
        healthBonus: 0,
        price: 0,
        description: "A simple starter weapon"
    },
    [EquipmentSlot.ARMOR]: {
        name: "Leather Armor",
        slot: EquipmentSlot.ARMOR,
        tier: ItemTier.BASIC,
        attackBonus: 0,
        defenseBonus: 12, // Increased from 8 to 12
        speedBonus: 0,
        healthBonus: 0,
        price: 0,
        description: "Basic leather protection"
    },
    [EquipmentSlot.ACCESSORY]: {
        name: "Simple Ring",
        slot: EquipmentSlot.ACCESSORY,
        tier: ItemTier.BASIC,
        attackBonus: 0,
        defenseBonus: 0,
        speedBonus: 5, // Increased from 3 to 5
        healthBonus: 0,
        price: 0,
        description: "A plain metal ring"
    }
};

// Store items by tier
const STORE_ITEMS = {
    [ItemTier.BASIC]: [
        {
            name: "Iron Sword",
            slot: EquipmentSlot.WEAPON,
            tier: ItemTier.BASIC,
            attackBonus: 8,
            defenseBonus: 0,
            speedBonus: 0,
            healthBonus: 0,
            price: 50,
            description: "A sturdy iron blade"
        },
        {
            name: "Studded Leather",
            slot: EquipmentSlot.ARMOR,
            tier: ItemTier.BASIC,
            attackBonus: 0,
            defenseBonus: 12,
            speedBonus: 0,
            healthBonus: 0,
            price: 40,
            description: "Reinforced leather armor"
        },
        {
            name: "Swift Boots",
            slot: EquipmentSlot.ACCESSORY,
            tier: ItemTier.BASIC,
            attackBonus: 0,
            defenseBonus: 0,
            speedBonus: 5,
            healthBonus: 0,
            price: 30,
            description: "Lightweight traveling boots"
        },
        {
            name: "Health Potion",
            type: "consumable",
            healPercent: 30,
            price: 25,
            description: "Restores 30% health in battle"
        }
    ],
    [ItemTier.INTERMEDIATE]: [
        {
            name: "Steel Blade",
            slot: EquipmentSlot.WEAPON,
            tier: ItemTier.INTERMEDIATE,
            attackBonus: 15,
            defenseBonus: 0,
            speedBonus: 0,
            healthBonus: 0,
            price: 120,
            description: "Sharp steel weapon"
        },
        {
            name: "Chainmail",
            slot: EquipmentSlot.ARMOR,
            tier: ItemTier.INTERMEDIATE,
            attackBonus: 0,
            defenseBonus: 18,
            speedBonus: 0,
            healthBonus: 0,
            price: 100,
            description: "Interlocked metal rings"
        },
        {
            name: "Runner's Boots",
            slot: EquipmentSlot.ACCESSORY,
            tier: ItemTier.INTERMEDIATE,
            attackBonus: 0,
            defenseBonus: 0,
            speedBonus: 10,
            healthBonus: 0,
            price: 80,
            description: "Enhanced movement boots"
        },
        {
            name: "Magic Elixir",
            type: "consumable",
            healPercent: 45,
            price: 60,
            description: "Restores 45% health in battle"
        }
    ],
    [ItemTier.ADVANCED]: [
        {
            name: "Enchanted Sword",
            slot: EquipmentSlot.WEAPON,
            tier: ItemTier.ADVANCED,
            attackBonus: 25,
            defenseBonus: 0,
            speedBonus: 0,
            healthBonus: 0,
            price: 250,
            description: "Magically enhanced blade"
        },
        {
            name: "Plate Armor",
            slot: EquipmentSlot.ARMOR,
            tier: ItemTier.ADVANCED,
            attackBonus: 0,
            defenseBonus: 28,
            speedBonus: 0,
            healthBonus: 0,
            price: 200,
            description: "Heavy metal plating"
        },
        {
            name: "Wind Walker Boots",
            slot: EquipmentSlot.ACCESSORY,
            tier: ItemTier.ADVANCED,
            attackBonus: 0,
            defenseBonus: 0,
            speedBonus: 18,
            healthBonus: 0,
            price: 150,
            description: "Boots blessed by wind spirits"
        },
        {
            name: "Greater Healing Potion",
            type: "consumable",
            healPercent: 60,
            price: 120,
            description: "Restores 60% health in battle"
        }
    ],
    [ItemTier.LEGENDARY]: [
        {
            name: "Dragon Slayer",
            slot: EquipmentSlot.WEAPON,
            tier: ItemTier.LEGENDARY,
            attackBonus: 40,
            defenseBonus: 0,
            speedBonus: 0,
            healthBonus: 0,
            price: 500,
            description: "Forged to slay dragons"
        },
        {
            name: "Guardian's Plate",
            slot: EquipmentSlot.ARMOR,
            tier: ItemTier.LEGENDARY,
            attackBonus: 0,
            defenseBonus: 42,
            speedBonus: 0,
            healthBonus: 0,
            price: 400,
            description: "Armor of ancient guardians"
        },
        {
            name: "Hermes Sandals",
            slot: EquipmentSlot.ACCESSORY,
            tier: ItemTier.LEGENDARY,
            attackBonus: 0,
            defenseBonus: 0,
            speedBonus: 30,
            healthBonus: 0,
            price: 300,
            description: "Divine messenger's footwear"
        },
        {
            name: "Phoenix Tears",
            type: "consumable",
            healPercent: 80,
            price: 250,
            description: "Restores 80% health in battle"
        }
    ],
    [ItemTier.MYTHIC]: [
        {
            name: "Blade of Eternity",
            slot: EquipmentSlot.WEAPON,
            tier: ItemTier.MYTHIC,
            attackBonus: 60,
            defenseBonus: 0,
            speedBonus: 0,
            healthBonus: 0,
            price: 1000,
            description: "Weapon of the gods"
        },
        {
            name: "Aegis of the Gods",
            slot: EquipmentSlot.ARMOR,
            tier: ItemTier.MYTHIC,
            attackBonus: 0,
            defenseBonus: 55,
            speedBonus: 0,
            healthBonus: 0,
            price: 800,
            description: "Divine protection"
        },
        {
            name: "Teleport Boots",
            slot: EquipmentSlot.ACCESSORY,
            tier: ItemTier.MYTHIC,
            attackBonus: 0,
            defenseBonus: 0,
            speedBonus: 45,
            healthBonus: 0,
            price: 600,
            description: "Instant movement capability"
        },
        {
            name: "Ambrosia",
            type: "consumable",
            healPercent: 100,
            price: 500,
            description: "Fully restores health in battle"
        }
    ]
};

// World locations with updated positions
const WORLD_LOCATIONS = [
    {
        name: "Arena",
        x: 300,
        y: 400,
        enemies: ["goblin", "dark_mage", "skeleton", "orc"],
        description: "A gladiatorial arena where warriors prove their worth.",
        minVictoriesRequired: 0,
        unlockRequirements: null,
        backgroundColor: 0x404040
    },
    {
        name: "Maze",
        x: 200,
        y: 250,
        enemies: ["minotaur", "lost_soul"],
        description: "An ever-changing labyrinth of stone and shadow.",
        minVictoriesRequired: 1,
        unlockRequirements: null,
        backgroundColor: 0x404040
    },
    {
        name: "Haunted Mansion",
        x: 150,
        y: 550,
        enemies: ["ghost", "vampire", "lich", "banshee"],
        description: "A decrepit mansion filled with supernatural entities.",
        minVictoriesRequired: 2,
        unlockRequirements: null,
        backgroundColor: 0x404040
    },
    {
        name: "Pirate Docks",
        x: 550,
        y: 650,
        enemies: ["pirate", "sea_serpent", "kraken_spawn", "ghost_ship"],
        description: "Dangerous docks where sea raiders gather.",
        minVictoriesRequired: 3,
        unlockRequirements: null,
        backgroundColor: 0x404040
    },
    {
        name: "Ancient City",
        x: 900,
        y: 300,
        enemies: ["city_guard", "assassin", "golem", "ancient_warrior"],
        description: "Ruins of a once-great civilization.",
        minVictoriesRequired: 4,
        unlockRequirements: null,
        backgroundColor: 0x404040
    },
    {
        name: "Sacred Shrine",
        x: 650,
        y: 200,
        enemies: ["temple_guardian", "spirit_monk", "divine_beast", "celestial"],
        description: "A holy place protected by divine guardians.",
        minVictoriesRequired: 5,
        unlockRequirements: null,
        backgroundColor: 0x404040
    },
    {
        name: "Volcanic Caves",
        x: 1100,
        y: 500,
        enemies: ["fire_elemental", "lava_beast", "dragon_whelp", "magma_golem"],
        description: "Molten caves deep within an active volcano.",
        minVictoriesRequired: 6,
        unlockRequirements: null,
        backgroundColor: 0x404040
    },
    {
        name: "Battle of Druids Castle",
        x: 500,
        y: 350,
        enemies: ["druid_lord", "ancient_guardian"],
        description: "The final stronghold of the ancient druid order.",
        minVictoriesRequired: 7,
        unlockRequirements: ["Arena", "Haunted Mansion", "Pirate Docks", "Ancient City", "Sacred Shrine", "Volcanic Caves"],
        backgroundColor: 0x281408
    },
    {
        name: "Bot Attack",
        x: 1200,
        y: 250,
        enemies: ["mech_dragon", "war_machine"],
        description: "A futuristic battlefield where metal giants clash.",
        minVictoriesRequired: 7,
        unlockRequirements: ["Arena", "Haunted Mansion", "Pirate Docks", "Ancient City", "Sacred Shrine", "Volcanic Caves"],
        backgroundColor: 0x282828
    }
];

// Enemy stats (defense values reduced for better balance)
const ENEMY_STATS = {
    // Basic enemies (reduced defense for early game balance)
    goblin: { health: 85, attack: 60, defense: 18, speed: 75 }, // Reduced from 25 to 18
    dark_mage: { health: 75, attack: 85, defense: 15, speed: 70 }, // Reduced from 20 to 15
    skeleton: { health: 70, attack: 70, defense: 22, speed: 60 }, // Reduced from 30 to 22
    orc: { health: 105, attack: 75, defense: 28, speed: 50 }, // Reduced from 35 to 28
    
    // Haunted Mansion
    ghost: { health: 65, attack: 70, defense: 15, speed: 90 },
    vampire: { health: 85, attack: 80, defense: 30, speed: 85 },
    lich: { health: 75, attack: 95, defense: 40, speed: 65 },
    banshee: { health: 60, attack: 90, defense: 20, speed: 95 },
    
    // Pirate Dock
    pirate: { health: 80, attack: 75, defense: 30, speed: 70 },
    sea_serpent: { health: 120, attack: 70, defense: 25, speed: 60 },
    kraken_spawn: { health: 100, attack: 85, defense: 40, speed: 40 },
    ghost_ship: { health: 150, attack: 60, defense: 45, speed: 30 },
    
    // Ancient City
    city_guard: { health: 95, attack: 70, defense: 45, speed: 55 },
    assassin: { health: 70, attack: 95, defense: 25, speed: 100 },
    golem: { health: 140, attack: 80, defense: 55, speed: 30 },
    ancient_warrior: { health: 110, attack: 85, defense: 40, speed: 65 },
    
    // Sacred Shrine
    temple_guardian: { health: 120, attack: 75, defense: 50, speed: 50 },
    spirit_monk: { health: 90, attack: 85, defense: 35, speed: 80 },
    divine_beast: { health: 130, attack: 90, defense: 45, speed: 70 },
    celestial: { health: 100, attack: 100, defense: 50, speed: 85 },
    
    // Volcanic Caves
    fire_elemental: { health: 85, attack: 95, defense: 30, speed: 90 },
    lava_beast: { health: 140, attack: 85, defense: 50, speed: 45 },
    dragon_whelp: { health: 110, attack: 100, defense: 40, speed: 75 },
    magma_golem: { health: 160, attack: 90, defense: 60, speed: 25 },
    
    // Maze
    minotaur: { health: 130, attack: 90, defense: 45, speed: 60 },
    lost_soul: { health: 70, attack: 80, defense: 15, speed: 85 },
    
    // Castle (Boss area)
    druid_lord: { health: 200, attack: 100, defense: 55, speed: 80 },
    ancient_guardian: { health: 180, attack: 90, defense: 60, speed: 65 },

    // Bot Attack (Special area)
    mech_dragon: { health: 220, attack: 105, defense: 50, speed: 70 },
    war_machine: { health: 200, attack: 95, defense: 65, speed: 50 }
};

// Enemy dialogue for battle starts (kid-friendly)
const ENEMY_DIALOGUE = {
    // Arena enemies
    goblin: [
        "Hehe! I'll show you some goblin tricks!",
        "You won't get past me, brave one!",
        "Time for a goblin adventure!"
    ],
    dark_mage: [
        "My magic is stronger than yours!",
        "Let's see who has the better spells!",
        "I've been practicing my magic moves!"
    ],
    skeleton: [
        "Rattle rattle! Ready for a spooky battle?",
        "I may be bones, but I'm still tough!",
        "Don't let my appearance scare you!"
    ],
    orc: [
        "Grr! I'm the strongest around here!",
        "You look like a worthy opponent!",
        "Let's test your courage, young warrior!"
    ],
    
    // Haunted Mansion
    ghost: [
        "Boo! But don't worry, I'm a friendly ghost!",
        "I'll give you a ghostly challenge!",
        "Whooo dares to enter my mansion?"
    ],
    vampire: [
        "Welcome to my spooky home!",
        "I don't bite... much! Hehe!",
        "Let's have a batty good battle!"
    ],
    lich: [
        "I've been waiting ages for a good fight!",
        "My ancient magic will surprise you!",
        "Time to show my old-school moves!"
    ],
    banshee: [
        "Oooooh! I'll sing you a battle song!",
        "My voice is my weapon!",
        "Let's make some beautiful noise!"
    ],
    
    // Pirate Docks
    pirate: [
        "Ahoy there, matey! Ready to sail into battle?",
        "Arr! I've got treasures to protect!",
        "Let's see if you're seaworthy!"
    ],
    sea_serpent: [
        "Hisss! The seas belong to me!",
        "I'm the guardian of these waters!",
        "Dive into adventure with me!"
    ],
    kraken_spawn: [
        "Splash! I'm just a baby kraken!",
        "My tentacles are ready to play!",
        "Let's make waves together!"
    ],
    ghost_ship: [
        "All aboard the spooky express!",
        "This ship has sailed many battles!",
        "Ready for a ghostly voyage?"
    ],
    
    // Ancient City
    city_guard: [
        "Halt! Who goes there?",
        "I protect this ancient place!",
        "Let's see if you're worthy to enter!"
    ],
    assassin: [
        "Silent as a shadow, quick as lightning!",
        "I move like the wind!",
        "Can you catch me if you can?"
    ],
    golem: [
        "I am made of stone and determination!",
        "My strength comes from the earth!",
        "Rock and roll, little warrior!"
    ],
    ancient_warrior: [
        "I've fought a thousand battles!",
        "Let me teach you some old tricks!",
        "Honor guides my blade!"
    ],
    
    // Sacred Shrine
    temple_guardian: [
        "This sacred place must be protected!",
        "Show me your pure heart, young one!",
        "Let's see if you're worthy of the shrine!"
    ],
    spirit_monk: [
        "Inner peace comes through challenge!",
        "Let's meditate... with our fists!",
        "Balance is key to victory!"
    ],
    divine_beast: [
        "I am blessed by the heavens!",
        "Let the light guide our battle!",
        "Prove your noble spirit!"
    ],
    celestial: [
        "Greetings from the stars above!",
        "Let's dance among the clouds!",
        "May the best spirit win!"
    ],
    
    // Volcanic Caves
    fire_elemental: [
        "Feel the heat of my flames!",
        "I'm fired up for this battle!",
        "Let's turn up the temperature!"
    ],
    lava_beast: [
        "Born from molten rock and fire!",
        "I'm hot-headed and proud of it!",
        "Ready to rumble in the volcano?"
    ],
    dragon_whelp: [
        "I may be small, but I'm fierce!",
        "One day I'll be a mighty dragon!",
        "Let me show you my baby roar!"
    ],
    magma_golem: [
        "Forged in the heart of the volcano!",
        "My body burns with ancient power!",
        "Rock meets fire - that's me!"
    ],
    
    // Maze
    minotaur: [
        "Welcome to my maze, little one!",
        "I know every corner of this place!",
        "Can you find your way to victory?"
    ],
    lost_soul: [
        "I've been wandering for so long...",
        "Help me find my way through battle!",
        "Maybe fighting will show me the path!"
    ],
    
    // Castle bosses
    druid_lord: [
        "Welcome to my ancient castle!",
        "I am the master of nature's power!",
        "Let's see if you can defeat the Druid Lord!"
    ],
    ancient_guardian: [
        "I have protected this castle for centuries!",
        "None shall pass without proving themselves!",
        "Show me the strength of your heart!"
    ],
    
    // Bot Attack
    mech_dragon: [
        "BEEP BOOP! Mechanical dragon online!",
        "My circuits are charged for battle!",
        "Prepare for some robot action!"
    ],
    war_machine: [
        "Systems armed and ready!",
        "I am built for victory!",
        "Let's compute who's stronger!"
    ]
};

// Tier colors for UI
const TIER_COLORS = {
    [ItemTier.BASIC]: COLORS.GRAY,
    [ItemTier.INTERMEDIATE]: COLORS.GREEN,
    [ItemTier.ADVANCED]: COLORS.BLUE,
    [ItemTier.LEGENDARY]: COLORS.PURPLE,
    [ItemTier.MYTHIC]: COLORS.GOLD
};

// Character colors
const CHARACTER_COLORS = {
    [CharacterType.KNIGHT]: COLORS.LIGHT_BLUE,
    [CharacterType.WIZARD]: COLORS.PURPLE,
    [CharacterType.ROGUE]: COLORS.GREEN,
    [CharacterType.SOLDIER]: COLORS.YELLOW,
    [CharacterType.ENEMY]: COLORS.RED
};