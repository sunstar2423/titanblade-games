// Game constants and configuration
export const SCREEN_WIDTH = 1024;
export const SCREEN_HEIGHT = 768;

export const SCENES = {
    PRELOAD: 'PreloadScene',
    MAIN_MENU: 'MainMenuScene',
    GAME: 'GameScene',
    PAUSE: 'PauseScene',
    GAME_OVER: 'GameOverScene',
    STORE: 'StoreScene'
};

export const COLORS = {
    SKY: '#87CEEB',
    GROUND: '#8B4513',
    GRASS: '#228B22',
    BIKE: '#FF4500',
    ENEMY: '#FF0000',
    OBSTACLE: '#696969',
    POWERUP: '#FFD700',
    UI_BG: '#000000',
    UI_TEXT: '#FFD700'
};

export const PHYSICS = {
    GRAVITY: 800,
    JUMP_VELOCITY: -350,
    MAX_SPEED: 300,
    ACCELERATION: 150,
    FRICTION: 100,
    GROUND_LEVEL: SCREEN_HEIGHT - 200  // Move ground higher up for visibility
};

export const GAME_CONFIG = {
    LEVEL_LENGTH: 8000,  // Total distance to complete level (doubled!)
    FINISH_LINE_X: 8000, // X position of finish line
    CAMERA_WORLD_WIDTH: 8200, // Camera bounds width (slightly beyond finish line)
    VICTORY_SCORE_BONUS: 250, // Bonus points for completing level (balanced)
    DISTANCE_MARKERS: [2000, 4000, 6000, 8000], // Progress markers every 2000m
    MAX_MONEY: 25000, // Maximum money cap (high enough to buy every bike and weapon)
    MAX_SCORE: 999999, // Score ceiling
    SESSION_MONEY_CAP: 2000, // Max money earnable in a single race
    COIN_VALUE: 5 // Money per collected coin
};

// Background music configuration
export const BACKGROUND_MUSIC = {
    GREVILLEA: {
        key: 'grevilleaMusic',
        title: 'Grevillea Music',
        artist: 'Danny Bale',
        source: 'Free Music Archive',
        license: 'CC BY'
    },
    FERN: {
        key: 'fernMusic',
        title: 'Fern Music',
        artist: 'Danny Bale',
        source: 'Free Music Archive',
        license: 'CC BY'
    },
    PHILODENDRON: {
        key: 'philodendronMusic',
        title: 'Philodendron Music',
        artist: 'Danny Bale',
        source: 'Free Music Archive',
        license: 'CC BY'
    },
    GRAB_A_BARGAIN: {
        key: 'grabABargain',
        title: 'Grab A Bargain',
        artist: 'Scott Holmes Music',
        source: 'Free Music Archive',
        license: 'CC BY'
    }
};

// Music tracks array for easy rotation
export const MUSIC_TRACKS = [
    BACKGROUND_MUSIC.GREVILLEA,
    BACKGROUND_MUSIC.FERN,
    BACKGROUND_MUSIC.PHILODENDRON,
    BACKGROUND_MUSIC.GRAB_A_BARGAIN
];

// Multi-level system configuration
export const LEVEL_CONFIG = {
    1: {
        length: 6000,
        name: "Rookie Course",
        enemySpawnRate: 0.3,
        obstacleSpawnRate: 0.4,
        maxEnemies: 10,
        jumpObstacleChance: 0.2,
        worldSpeedMultiplier: 1.0,
        moneyBonus: 25,
        background: 'backgroundSky'
    },
    2: {
        length: 8000,
        name: "Desert Race",
        enemySpawnRate: 0.4,
        obstacleSpawnRate: 0.5,
        maxEnemies: 10,
        jumpObstacleChance: 0.3,
        worldSpeedMultiplier: 1.2,
        moneyBonus: 35,
        background: 'desertBg'
    },
    3: {
        length: 7000,
        name: "Mountain Hills",
        enemySpawnRate: 0.5,
        obstacleSpawnRate: 0.6,
        maxEnemies: 10,
        jumpObstacleChance: 0.4,
        worldSpeedMultiplier: 1.4,
        moneyBonus: 50,
        background: 'hillsBg'
    },
    4: {
        length: 8000,
        name: "Snow Mountain",
        enemySpawnRate: 0.6,
        obstacleSpawnRate: 0.7,
        maxEnemies: 10,
        jumpObstacleChance: 0.5,
        worldSpeedMultiplier: 1.6,
        moneyBonus: 75,
        background: 'snowMountainBg'
    },
    5: {
        length: 6000,
        name: "VOLCANO HELL",
        enemySpawnRate: 0.8,
        obstacleSpawnRate: 0.8,
        maxEnemies: 10,
        jumpObstacleChance: 0.6,
        worldSpeedMultiplier: 1.8,
        moneyBonus: 100,
        background: 'volcanoBg'
    },
    6: {
        length: 8000,
        name: "CYBER CITY CIRCUIT",
        enemySpawnRate: 1.0,
        obstacleSpawnRate: 0.9,
        maxEnemies: 10,
        jumpObstacleChance: 0.7,
        worldSpeedMultiplier: 2.0,
        moneyBonus: 150,
        background: 'futureCityBg'
    }
};

export const BIKE_TYPES = {
    BMX: {
        name: 'BMX Bike',
        price: 0,
        maxSpeed: 250,
        acceleration: 120,
        jumpPower: 300,
        handling: 1.2,
        durability: 0.8,
        description: 'Basic BMX bike - agile and fun!'
    },
    MOUNTAIN_BASIC: {
        name: 'Mountain Bike',
        price: 500,
        maxSpeed: 280,
        acceleration: 140,
        jumpPower: 320,
        handling: 1.0,
        durability: 1.0,
        description: 'Better suspension and speed'
    },
    MOUNTAIN_PRO: {
        name: 'Pro Mountain Bike',
        price: 1500,
        maxSpeed: 320,
        acceleration: 160,
        jumpPower: 350,
        handling: 1.1,
        durability: 1.2,
        description: 'Professional grade with full suspension'
    },
    DIRT_BIKE: {
        name: 'Dirt Bike',
        price: 3000,
        maxSpeed: 400,
        acceleration: 200,
        jumpPower: 400,
        handling: 0.9,
        durability: 1.4,
        description: 'Motorized power for extreme terrain'
    },
    ATV: {
        name: 'ATV',
        price: 5000,
        maxSpeed: 350,
        acceleration: 250,
        jumpPower: 380,
        handling: 0.8,
        durability: 1.6,
        description: 'All-terrain vehicle with maximum stability'
    },
    RACING_BIKE: {
        name: 'Racing Bike',
        price: 2000,
        maxSpeed: 450,
        acceleration: 180,
        jumpPower: 280,
        handling: 1.3,
        durability: 0.7,
        description: 'Built for speed on smooth terrain'
    }
};

export const ENEMY_TYPES = {
    RIDER: {
        speed: 180,
        health: 2,
        points: 50, // Balanced for reasonable scoring
        money: 5
    },
    AGGRESSIVE_RIDER: {
        speed: 220,
        health: 3,
        points: 100, // Balanced for reasonable scoring
        money: 10
    },
    BOSS_RIDER: {
        speed: 200,
        health: 5,
        points: 200, // Balanced for reasonable scoring
        money: 20
    }
};

export const OBSTACLES = {
    ROCK: { width: 40, height: 30, points: 10 }, // Balanced for reasonable scoring
    LOG: { width: 60, height: 20, points: 20, mustJump: true, jumpHeight: 60 }, // Balanced for reasonable scoring
    BARRIER: { width: 30, height: 50, points: 30, mustJump: true, jumpHeight: 80 }, // Balanced for reasonable scoring
    RAMP: { width: 80, height: 40, points: 25, isRamp: true }, // Balanced for reasonable scoring
    RAMP2: { width: 80, height: 40, points: 30, isRamp: true } // Balanced for reasonable scoring
};

export const POWERUPS = {
    SPEED_BOOST: {
        duration: 3000,
        effect: 1.5,
        color: '#00FF00',
        points: 50
    },
    JUMP_BOOST: {
        duration: 5000,
        effect: 1.3,
        color: '#0080FF',
        points: 50
    },
    MONEY_BAG: {
        value: 100,
        color: '#FFD700',
        points: 25
    },
    INVINCIBILITY: {
        duration: 2000,
        color: '#FF00FF',
        points: 100
    },
    HEALTH_PACK: {
        value: 35,
        color: '#FF5555',
        points: 25
    }
};

export const WEAPONS = {
    BASIC_SHOT: {
        name: 'Basic Shot',
        damage: 1,
        speed: 400,
        cooldown: 800,
        price: 0,
        description: 'Basic projectile weapon'
    },
    RAPID_FIRE: {
        name: 'Rapid Fire',
        damage: 1,
        speed: 450,
        cooldown: 300,
        price: 500,
        description: 'Fast firing rate with lower damage'
    },
    POWER_SHOT: {
        name: 'Power Shot',
        damage: 3,
        speed: 350,
        cooldown: 1500,
        price: 1000,
        description: 'Powerful shot that slows enemies significantly'
    },
    CHAIN_SHOT: {
        name: 'Chain Shot',
        damage: 2,
        speed: 400,
        cooldown: 1000,
        price: 2000,
        description: 'Passes through multiple enemies'
    },
    ROCKET: {
        name: 'Rocket Launcher',
        damage: 5,
        speed: 300,
        cooldown: 2500,
        price: 4000,
        description: 'Explosive rockets with area damage'
    }
};

// Mapping of bike types to their corresponding sprite images
export const BIKE_SPRITES = {
    BMX: 'bmx',
    MOUNTAIN_BASIC: 'mountainbike',
    MOUNTAIN_PRO: 'promountainbike',
    DIRT_BIKE: 'dirtbike',
    ATV: 'atv',
    RACING_BIKE: 'racingdirtbike'
};
