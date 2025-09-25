let gameState = {
    food: 0,
    materials: 0,
    gold: 100,
    buildings: [{
        id: 1,
        type: 'goldmine',
        name: 'Gold Mine',
        emoji: '<img src="goldmine.png" width="50" height="50">',
        produces: 'gold',
        rate: 3,
        production: 0
    }],
    ships: [],
    tanks: [],
    planes: [],
    enemies: [],
    enemyDock: {
        health: 100,
        maxHealth: 100,
        defenses: 10,
        goldReward: 200,
        lastAttacked: 0
    },
    nextBuildingId: 2,
    nextShipId: 1,
    nextTankId: 1,
    nextPlaneId: 1,
    nextEnemyId: 1,
    score: 0,
    docksDestroyed: 0
};

const buildingTypes = {
    farm: { name: 'Farm', emoji: '🚜', cost: 20, produces: 'food', rate: 2 },
    orchard: { name: 'Orchard', emoji: '🍎', cost: 30, produces: 'food', rate: 3 },
    garden: { name: 'Garden', emoji: '<img src="garden.png" width="30" height="30">', cost: 15, produces: 'food', rate: 1 },
    mill: { name: 'Mill', emoji: '🏭', cost: 40, produces: 'materials', rate: 1 },
    goldmine: { name: 'Gold Mine', emoji: '<img src="goldmine.png" width="50" height="50">', cost: 60, produces: 'gold', rate: 3 }
};

const factoryTypes = {
    gunboat: { name: 'Gunboat Factory', emoji: '⚓', cost: 100, shipType: 'gunboat' },
    destroyer: { name: 'Destroyer Factory', emoji: '🚢', cost: 200, shipType: 'destroyer' },
    battleship: { name: 'Battleship Factory', emoji: '🛳️', cost: 500, shipType: 'battleship' },
    carrier: { name: 'Carrier Factory', emoji: '🛫', cost: 800, shipType: 'carrier' },
    tank: { name: 'Tank Factory', emoji: '🏭', cost: 150, tankType: 'tank' }
};

const shipTypes = {
    gunboat: { name: 'Gunboat', emoji: '<img src="gun boat.png" width="30" height="30">', foodCost: 10, materialCost: 5, power: 1 },
    destroyer: { name: 'Destroyer', emoji: '<img src="destroyer.png" width="30" height="30">', foodCost: 25, materialCost: 15, power: 3 },
    battleship: { name: 'Battleship', emoji: '<img src="battleship.png" width="30" height="30">', foodCost: 50, materialCost: 30, power: 5 },
    carrier: { name: 'Aircraft Carrier', emoji: '<img src="carryer.png" width="30" height="30">', foodCost: 80, materialCost: 60, power: 2, maxPlanes: 4, planes: 0 }
};

const tankTypes = {
    tank: { name: 'Tank', emoji: '<img src="tank.png" width="30" height="30">', foodCost: 15, materialCost: 10, power: 4 }
};

const planeTypes = {
    fighter: { name: 'Fighter Plane', emoji: '<img src="jetplane.png" width="30" height="30">', foodCost: 20, materialCost: 15, power: 3 }
};

const enemyTypes = {
    pirate: { name: 'Pirate Ship', emoji: '<img src="pirate.png" width="50" height="50">', power: 2, goldReward: 30 },
    warship: { name: 'Enemy Warship', emoji: '<img src="enemy.png" width="50" height="50">', power: 4, goldReward: 60 },
    kraken: { name: 'Sea Monster', emoji: '<img src="squid.png" width="50" height="50">', power: 6, goldReward: 150 }
};

function updateDisplay() {
    document.getElementById('food').textContent = gameState.food;
    document.getElementById('materials').textContent = gameState.materials;
    document.getElementById('gold').textContent = gameState.gold;
    
    updateBuildingsGrid();
    updateShipsGrid();
    updateTanksGrid();
    updatePlanesGrid();
    updateEnemyGrid();
    updateEnemyDock();
    updateButtons();
}

function updateBuildingsGrid() {
    const grid = document.getElementById('buildings-grid');
    grid.innerHTML = '';
    
    gameState.buildings.forEach(building => {
        const buildingDiv = document.createElement('div');
        buildingDiv.className = 'building';
        buildingDiv.innerHTML = `
            ${building.emoji}
            <div class="production-counter">${building.production || 0}</div>
        `;
        buildingDiv.title = `${building.name} - Produces ${building.rate} ${building.produces}/sec`;
        buildingDiv.onclick = () => showBuildingInfo(building);
        grid.appendChild(buildingDiv);
    });
}

function updateShipsGrid() {
    const grid = document.getElementById('ships-grid');
    grid.innerHTML = '';
    
    gameState.ships.forEach(ship => {
        const shipDiv = document.createElement('div');
        shipDiv.className = 'ship';
        shipDiv.innerHTML = ship.emoji;
        shipDiv.title = `${ship.name} - Power: ${ship.power}`;
        shipDiv.onclick = () => showShipInfo(ship);
        grid.appendChild(shipDiv);
    });
}

function updateTanksGrid() {
    const grid = document.getElementById('tanks-grid');
    grid.innerHTML = '';
    
    gameState.tanks.forEach(tank => {
        const tankDiv = document.createElement('div');
        tankDiv.className = 'tank';
        tankDiv.innerHTML = tank.emoji;
        tankDiv.title = `${tank.name} - Power: ${tank.power}`;
        tankDiv.onclick = () => showTankInfo(tank);
        grid.appendChild(tankDiv);
    });
}

function updatePlanesGrid() {
    const grid = document.getElementById('planes-grid');
    grid.innerHTML = '';
    
    gameState.planes.forEach(plane => {
        const planeDiv = document.createElement('div');
        planeDiv.className = 'plane';
        planeDiv.innerHTML = plane.emoji;
        planeDiv.title = `${plane.name} - Power: ${plane.power} - Carrier: ${plane.carrierId}`;
        planeDiv.onclick = () => showPlaneInfo(plane);
        grid.appendChild(planeDiv);
    });
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updateEnemyGrid() {
    const grid = document.getElementById('enemy-grid');
    grid.innerHTML = '';
    
    gameState.enemies.forEach(enemy => {
        const enemyDiv = document.createElement('div');
        enemyDiv.className = 'enemy';
        enemyDiv.innerHTML = `
            ${enemy.emoji}
            <div class="production-counter">${formatTime(enemy.timeToAttack)}</div>
        `;
        enemyDiv.title = `${enemy.name} - Power: ${enemy.power} - Attacks in: ${formatTime(enemy.timeToAttack)}`;
        enemyDiv.onclick = () => showEnemyInfo(enemy);
        grid.appendChild(enemyDiv);
    });
    
    const attackButton = document.getElementById('attack-button');
    const totalPlayerPower = gameState.ships.reduce((sum, ship) => sum + ship.power, 0) + 
                            gameState.tanks.reduce((sum, tank) => sum + tank.power, 0);
    const hasEnemies = gameState.enemies.length > 0;
    attackButton.disabled = !hasEnemies || totalPlayerPower === 0;
}

function updateEnemyDock() {
    document.getElementById('dock-health-value').textContent = `${gameState.enemyDock.health}/${gameState.enemyDock.maxHealth}`;
    document.getElementById('dock-defenses-value').textContent = gameState.enemyDock.defenses;
    document.getElementById('dock-reward-value').textContent = gameState.enemyDock.goldReward;
    
    const attackDockButton = document.getElementById('attack-dock-button');
    const totalPlayerPower = gameState.ships.reduce((sum, ship) => sum + ship.power, 0);
    const canAttack = totalPlayerPower > 0 && gameState.enemyDock.health > 0;
    attackDockButton.disabled = !canAttack;
}

function updateButtons() {
    Object.keys(buildingTypes).forEach(type => {
        const button = document.querySelector(`button[onclick="build${type.charAt(0).toUpperCase() + type.slice(1)}()"]`);
        if (button) {
            button.disabled = gameState.gold < buildingTypes[type].cost;
        }
    });
    
    Object.keys(factoryTypes).forEach(type => {
        let buttonSelector;
        if (type === 'tank') {
            buttonSelector = `button[onclick="buildTankFactory()"]`;
        } else {
            buttonSelector = `button[onclick="build${type.charAt(0).toUpperCase() + type.slice(1)}Factory()"]`;
        }
        const button = document.querySelector(buttonSelector);
        if (button) {
            button.disabled = gameState.gold < factoryTypes[type].cost;
        }
    });
}

function buildBuilding(type) {
    const buildingType = buildingTypes[type];
    if (gameState.gold >= buildingType.cost) {
        gameState.gold -= buildingType.cost;
        gameState.buildings.push({
            id: gameState.nextBuildingId++,
            type: type,
            name: buildingType.name,
            emoji: buildingType.emoji,
            produces: buildingType.produces,
            rate: buildingType.rate,
            production: 0
        });
        
        showNotification(`${buildingType.name} built!`);
        updateDisplay();
    }
}

function buildFactory(type) {
    const factoryType = factoryTypes[type];
    if (gameState.gold >= factoryType.cost) {
        gameState.gold -= factoryType.cost;
        
        const building = {
            id: gameState.nextBuildingId++,
            type: 'factory',
            factoryType: type,
            name: factoryType.name,
            emoji: factoryType.emoji,
            production: 0
        };
        
        if (factoryType.shipType) {
            building.shipType = factoryType.shipType;
        }
        if (factoryType.tankType) {
            building.tankType = factoryType.tankType;
        }
        
        gameState.buildings.push(building);
        
        showNotification(`${factoryType.name} built!`);
        updateDisplay();
    }
}

function buildFarm() { buildBuilding('farm'); }
function buildOrchard() { buildBuilding('orchard'); }
function buildGarden() { buildBuilding('garden'); }
function buildMill() { buildBuilding('mill'); }
function buildGoldmine() { buildBuilding('goldmine'); }

function buildGunboatFactory() { buildFactory('gunboat'); }
function buildDestroyerFactory() { buildFactory('destroyer'); }
function buildBattleshipFactory() { buildFactory('battleship'); }
function buildCarrierFactory() { buildFactory('carrier'); }
function buildTankFactory() { buildFactory('tank'); }

function buildShip(shipType) {
    const ship = shipTypes[shipType];
    if (gameState.food >= ship.foodCost && gameState.materials >= ship.materialCost) {
        gameState.food -= ship.foodCost;
        gameState.materials -= ship.materialCost;
        
        const newShip = {
            id: gameState.nextShipId++,
            type: shipType,
            name: ship.name,
            emoji: ship.emoji,
            power: ship.power
        };
        
        if (shipType === 'carrier') {
            newShip.maxPlanes = ship.maxPlanes;
            newShip.planes = 0;
        }
        
        gameState.ships.push(newShip);
        
        showNotification(`${ship.name} launched!`);
        updateDisplay();
        return true;
    } else {
        showNotification(`Not enough resources for ${ship.name}!`, 'error');
        return false;
    }
}

function buildTank(tankType) {
    const tank = tankTypes[tankType];
    if (gameState.food >= tank.foodCost && gameState.materials >= tank.materialCost) {
        gameState.food -= tank.foodCost;
        gameState.materials -= tank.materialCost;
        
        gameState.tanks.push({
            id: gameState.nextTankId++,
            type: tankType,
            name: tank.name,
            emoji: tank.emoji,
            power: tank.power
        });
        
        showNotification(`${tank.name} deployed!`);
        updateDisplay();
        return true;
    } else {
        showNotification(`Not enough resources for ${tank.name}!`, 'error');
        return false;
    }
}

function buildPlane(planeType, carrierId) {
    const plane = planeTypes[planeType];
    const carrier = gameState.ships.find(ship => ship.id === carrierId);
    
    if (!carrier || carrier.type !== 'carrier') {
        showNotification('Invalid carrier!', 'error');
        return false;
    }
    
    if (carrier.planes >= carrier.maxPlanes) {
        showNotification(`Carrier is full! (${carrier.planes}/${carrier.maxPlanes})`, 'error');
        return false;
    }
    
    if (gameState.food >= plane.foodCost && gameState.materials >= plane.materialCost) {
        gameState.food -= plane.foodCost;
        gameState.materials -= plane.materialCost;
        
        gameState.planes.push({
            id: gameState.nextPlaneId++,
            type: planeType,
            name: plane.name,
            emoji: plane.emoji,
            power: plane.power,
            carrierId: carrierId
        });
        
        carrier.planes++;
        
        showNotification(`${plane.name} deployed to carrier!`);
        updateDisplay();
        return true;
    } else {
        showNotification(`Not enough resources for ${plane.name}!`, 'error');
        return false;
    }
}

function showBuildingInfo(building) {
    if (building.type === 'factory') {
        if (building.shipType) {
            const ship = shipTypes[building.shipType];
            const canBuild = gameState.food >= ship.foodCost && gameState.materials >= ship.materialCost;
            
            if (canBuild) {
                if (confirm(`Build ${ship.name}? Costs: ${ship.foodCost} food, ${ship.materialCost} materials`)) {
                    buildShip(building.shipType);
                }
            } else {
                alert(`Cannot build ${ship.name}. Need ${ship.foodCost} food and ${ship.materialCost} materials.`);
            }
        } else if (building.tankType) {
            const tank = tankTypes[building.tankType];
            const canBuild = gameState.food >= tank.foodCost && gameState.materials >= tank.materialCost;
            
            if (canBuild) {
                if (confirm(`Build ${tank.name}? Costs: ${tank.foodCost} food, ${tank.materialCost} materials`)) {
                    buildTank(building.tankType);
                }
            } else {
                alert(`Cannot build ${tank.name}. Need ${tank.foodCost} food and ${tank.materialCost} materials.`);
            }
        }
    } else {
        alert(`${building.name}: Produces ${building.rate} ${building.produces} per second`);
    }
}

function showShipInfo(ship) {
    if (ship.type === 'carrier') {
        const message = `${ship.name}: Power ${ship.power}\nCarrier Capacity: ${ship.planes}/${ship.maxPlanes} planes\nClick to build fighter planes!`;
        if (confirm(message + '\n\nBuild Fighter Plane? (20 food, 15 materials)')) {
            buildPlane('fighter', ship.id);
        }
    } else {
        alert(`${ship.name}: Power ${ship.power}\nReady for battle!`);
    }
}

function showTankInfo(tank) {
    alert(`${tank.name}: Power ${tank.power}\nDefending the island!`);
}

function showPlaneInfo(plane) {
    const carrier = gameState.ships.find(ship => ship.id === plane.carrierId);
    alert(`${plane.name}: Power ${plane.power}\nBased on: ${carrier ? carrier.name : 'Unknown'}\nReady for air combat!`);
}

function showEnemyInfo(enemy) {
    alert(`${enemy.name}\nPower: ${enemy.power}\nReward: ${enemy.goldReward} gold\nAttacks dock in: ${formatTime(enemy.timeToAttack)}\nClick Attack Enemies to fight them first!`);
}

function enemyAttackDock() {
    const attackingEnemies = gameState.enemies.filter(enemy => enemy.timeToAttack <= 0);
    
    if (attackingEnemies.length === 0) return;
    
    const totalPlayerPower = gameState.ships.reduce((sum, ship) => sum + ship.power, 0) + 
                            gameState.tanks.reduce((sum, tank) => sum + tank.power, 0) +
                            gameState.planes.reduce((sum, plane) => sum + plane.power, 0);
    const totalAttackingPower = attackingEnemies.reduce((sum, enemy) => sum + enemy.power, 0);
    
    if (totalPlayerPower >= totalAttackingPower) {
        const unitsLost = Math.floor(Math.random() * 2);
        let shipsLost = 0;
        let tanksLost = 0;
        
        for (let i = 0; i < unitsLost; i++) {
            if (Math.random() < 0.5 && gameState.ships.length > 0) {
                gameState.ships.pop();
                shipsLost++;
            } else if (gameState.tanks.length > 0) {
                gameState.tanks.pop();
                tanksLost++;
            } else if (gameState.ships.length > 0) {
                gameState.ships.pop();
                shipsLost++;
            }
        }
        
        const goldEarned = attackingEnemies.reduce((sum, enemy) => sum + enemy.goldReward, 0);
        gameState.gold += goldEarned;
        gameState.score += goldEarned;
        
        gameState.enemies = gameState.enemies.filter(enemy => enemy.timeToAttack > 0);
        
        showNotification(`⚔️ Defended dock! Lost ${shipsLost} ships, ${tanksLost} tanks, earned ${goldEarned} gold!`);
    } else {
        const buildingsLost = Math.min(2, Math.max(0, gameState.buildings.length - 1));
        for (let i = 0; i < buildingsLost; i++) {
            gameState.buildings.pop();
        }
        
        const shipsLost = Math.floor(gameState.ships.length / 2);
        const tanksLost = Math.floor(gameState.tanks.length / 2);
        
        for (let i = 0; i < shipsLost; i++) {
            gameState.ships.pop();
        }
        for (let i = 0; i < tanksLost; i++) {
            gameState.tanks.pop();
        }
        
        gameState.enemies = gameState.enemies.filter(enemy => enemy.timeToAttack > 0);
        
        if (buildingsLost > 0) {
            showNotification(`💥 Dock attacked! Lost ${buildingsLost} buildings, ${shipsLost} ships, ${tanksLost} tanks! First building protected!`, 'error');
        } else {
            showNotification(`💥 Dock attacked! Lost ${shipsLost} ships, ${tanksLost} tanks! All buildings protected!`, 'error');
        }
    }
    
    updateDisplay();
}

function spawnEnemy() {
    const enemyTypeKeys = Object.keys(enemyTypes);
    const randomType = enemyTypeKeys[Math.floor(Math.random() * enemyTypeKeys.length)];
    const enemyTemplate = enemyTypes[randomType];
    
    const enemy = {
        id: gameState.nextEnemyId++,
        type: randomType,
        name: enemyTemplate.name,
        emoji: enemyTemplate.emoji,
        power: enemyTemplate.power,
        goldReward: enemyTemplate.goldReward,
        timeToAttack: 60
    };
    
    gameState.enemies.push(enemy);
    showNotification(`${enemy.name} spotted! Will attack dock in 1 minute!`, 'warning');
    updateDisplay();
}

function attackEnemies() {
    if (gameState.ships.length === 0 && gameState.tanks.length === 0) {
        showNotification('You need ships or tanks to attack!', 'error');
        return;
    }
    
    if (gameState.enemies.length === 0) {
        showNotification('No enemies to attack!', 'error');
        return;
    }
    
    // Small delay to ensure DOM is updated
    setTimeout(() => {
        animateShipToBattle(gameState.ships, gameState.enemies, () => {
            addBattleEffects();
        });
    }, 100);
    
    setTimeout(() => {
        const totalPlayerPower = gameState.ships.reduce((sum, ship) => sum + ship.power, 0) + 
                                gameState.tanks.reduce((sum, tank) => sum + tank.power, 0) +
                                gameState.planes.reduce((sum, plane) => sum + plane.power, 0);
        const totalEnemyPower = gameState.enemies.reduce((sum, enemy) => sum + enemy.power, 0);
    
        let battleResult = '';
        let goldEarned = 0;
    
    if (totalPlayerPower >= totalEnemyPower) {
        battleResult = 'Victory! ⭐';
        goldEarned = gameState.enemies.reduce((sum, enemy) => sum + enemy.goldReward, 0);
        gameState.gold += goldEarned;
        gameState.score += goldEarned;
        gameState.enemies = [];
        
        const unitsLost = Math.floor(Math.random() * Math.min(2, gameState.ships.length + gameState.tanks.length));
        let shipsLost = 0;
        let tanksLost = 0;
        
        for (let i = 0; i < unitsLost; i++) {
            if (Math.random() < 0.5 && gameState.ships.length > 0) {
                gameState.ships.pop();
                shipsLost++;
            } else if (gameState.tanks.length > 0) {
                gameState.tanks.pop();
                tanksLost++;
            } else if (gameState.ships.length > 0) {
                gameState.ships.pop();
                shipsLost++;
            }
        }
        
        if (shipsLost > 0 || tanksLost > 0) {
            battleResult += ` Lost ${shipsLost} ship(s) and ${tanksLost} tank(s) in battle.`;
        }
        
        showNotification(`${battleResult} Earned ${goldEarned} gold!`);
    } else {
        battleResult = 'Defeat! ☠️';
        const shipsLost = Math.floor(gameState.ships.length / 2) + 1;
        const tanksLost = Math.floor(gameState.tanks.length / 2) + 1;
        
        for (let i = 0; i < shipsLost && gameState.ships.length > 0; i++) {
            gameState.ships.pop();
        }
        for (let i = 0; i < tanksLost && gameState.tanks.length > 0; i++) {
            gameState.tanks.pop();
        }
        
        battleResult += ` Lost ${shipsLost} ship(s) and ${tanksLost} tank(s)!`;
        showNotification(battleResult, 'error');
        }
        
        updateDisplay();
    }, 1000);
}

function attackEnemyDock() {
    if (gameState.ships.length === 0) {
        showNotification('You need ships to attack the enemy dock!', 'error');
        return;
    }
    
    if (gameState.enemyDock.health <= 0) {
        showNotification('Enemy dock already destroyed!', 'error');
        return;
    }
    
    // Small delay to ensure DOM is updated
    setTimeout(() => {
        animateShipToDock(() => {
            const totalShipPower = gameState.ships.reduce((sum, ship) => sum + ship.power, 0);
            const damage = Math.max(1, totalShipPower - gameState.enemyDock.defenses);
            
            gameState.enemyDock.health -= damage;
    
    if (gameState.enemyDock.health <= 0) {
        gameState.enemyDock.health = 0;
        gameState.gold += gameState.enemyDock.goldReward;
        gameState.score += gameState.enemyDock.goldReward;
        gameState.docksDestroyed++;
        
        showNotification(`🏴‍☠️ Enemy dock destroyed! Earned ${gameState.enemyDock.goldReward} gold! (${gameState.docksDestroyed}/5)`);
        
        if (gameState.docksDestroyed >= 5) {
            setTimeout(() => {
                showVictoryScreen();
            }, 2000);
        } else {
            setTimeout(() => {
                gameState.enemyDock.health = gameState.enemyDock.maxHealth;
                gameState.enemyDock.defenses = Math.min(20, gameState.enemyDock.defenses + 2);
                gameState.enemyDock.goldReward = Math.floor(gameState.enemyDock.goldReward * 1.5);
                showNotification('Enemy dock rebuilt and stronger!', 'warning');
                updateDisplay();
            }, 10000);
        }
    } else {
        const shipsLost = Math.floor(Math.random() * 2);
        for (let i = 0; i < shipsLost && gameState.ships.length > 0; i++) {
            gameState.ships.pop();
        }
        
        if (shipsLost > 0) {
            showNotification(`Damaged enemy dock by ${damage}! Lost ${shipsLost} ship(s) in the attack.`);
        } else {
            showNotification(`Damaged enemy dock by ${damage}! No ships lost.`);
        }
    }
    
    updateDisplay();
        });
    }, 100);
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    if (type === 'error') {
        notification.style.background = '#e74c3c';
    } else if (type === 'warning') {
        notification.style.background = '#f39c12';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showVictoryScreen() {
    const victoryScreen = document.createElement('div');
    victoryScreen.id = 'victory-screen';
    victoryScreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        color: gold;
        text-align: center;
        font-family: Arial, sans-serif;
    `;
    
    victoryScreen.innerHTML = `
        <img src="victoryscreen.png" style="max-width: 400px; max-height: 300px; margin-bottom: 20px;" alt="Victory Banner">
        <h1 style="font-size: 4rem; margin: 0; text-shadow: 3px 3px 6px rgba(0,0,0,0.8);">🏆 VICTORY! 🏆</h1>
        <h2 style="font-size: 2rem; margin: 20px 0; color: #fff;">You have conquered the seas!</h2>
        <p style="font-size: 1.5rem; margin: 10px 0;">Enemy docks destroyed: 5/5</p>
        <p style="font-size: 1.2rem; margin: 10px 0;">Final Score: ${gameState.score}</p>
        <button id="restart-button" style="
            font-size: 1.5rem;
            padding: 15px 30px;
            margin-top: 30px;
            background: linear-gradient(45deg, #2c3e50, #3498db);
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        ">Play Again</button>
    `;
    
    document.body.appendChild(victoryScreen);
    
    // Add event listener using addEventListener
    const restartBtn = victoryScreen.querySelector('#restart-button');
    restartBtn.addEventListener('click', function() {
        window.location.reload();
    });
}

function createExplosion(x, y) {
    const explosion = document.createElement('div');
    explosion.className = 'explosion-effect';
    // Random position around center (±200px from center for more spread)
    const randomX = (Math.random() - 0.5) * 400;
    const randomY = (Math.random() - 0.5) * 400;
    explosion.style.left = '50%';
    explosion.style.top = '50%';
    explosion.style.transform = `translate(calc(-50% + ${randomX}px), calc(-50% + ${randomY}px))`;
    
    // Random size variation
    const scale = 0.7 + Math.random() * 0.6; // 0.7 to 1.3 scale
    explosion.style.transform += ` scale(${scale})`;
    
    document.body.appendChild(explosion);
    
    setTimeout(() => {
        explosion.remove();
    }, 600);
}

function createMuzzleFlash(element) {
    const flash = document.createElement('div');
    flash.className = 'muzzle-flash';
    // Random position around center (±150px from center for more spread)
    const randomX = (Math.random() - 0.5) * 300;
    const randomY = (Math.random() - 0.5) * 300;
    flash.style.left = '50%';
    flash.style.top = '50%';
    flash.style.transform = `translate(calc(-50% + ${randomX}px), calc(-50% + ${randomY}px))`;
    
    // Random size and rotation
    const scale = 0.8 + Math.random() * 0.4; // 0.8 to 1.2 scale
    const rotation = Math.random() * 360;
    flash.style.transform += ` scale(${scale}) rotate(${rotation}deg)`;
    
    document.body.appendChild(flash);
    
    setTimeout(() => {
        flash.remove();
    }, 200);
}

function createProjectile(fromElement, toElement) {
    const projectile = document.createElement('div');
    projectile.className = 'projectile-effect';
    // Random starting position around center (±120px from center)
    const startX = (Math.random() - 0.5) * 240;
    const startY = (Math.random() - 0.5) * 240;
    projectile.style.left = '50%';
    projectile.style.top = '50%';
    projectile.style.transform = `translate(calc(-50% + ${startX}px), calc(-50% + ${startY}px))`;
    
    // Random movement direction (larger spread)
    const deltaX = (Math.random() - 0.5) * 300;
    const deltaY = (Math.random() - 0.5) * 300;
    projectile.style.setProperty('--deltaX', deltaX + 'px');
    projectile.style.setProperty('--deltaY', deltaY + 'px');
    
    // Random size
    const scale = 0.7 + Math.random() * 0.6;
    projectile.style.transform += ` scale(${scale})`;
    
    document.body.appendChild(projectile);
    
    setTimeout(() => {
        createExplosion();
        projectile.remove();
    }, 800);
}

function createExplosionAt(x, y) {
    const gameArea = document.getElementById('game-area');
    const explosion = document.createElement('div');
    explosion.textContent = '💥';
    explosion.style.position = 'absolute';
    explosion.style.fontSize = '40px';
    explosion.style.left = (x - 20) + 'px';
    explosion.style.top = (y - 20) + 'px';
    explosion.style.zIndex = '1001';
    explosion.style.pointerEvents = 'none';
    explosion.style.animation = 'explode 0.8s ease-out forwards';
    
    gameArea.appendChild(explosion);
    
    setTimeout(() => {
        if (explosion.parentNode) {
            explosion.parentNode.removeChild(explosion);
        }
    }, 800);
}

function createMissile(startElement, targetElement, callback) {
    console.log('createMissile called with elements:', startElement, targetElement);
    const missile = document.createElement('img');
    missile.src = 'missile2.png';
    missile.className = 'missile';
    missile.style.position = 'absolute';
    missile.style.width = '40px';
    missile.style.height = '16px';
    missile.style.zIndex = '1000';
    missile.style.pointerEvents = 'none';
    
    const gameArea = document.getElementById('game-area');
    const startRect = startElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    const gameRect = gameArea.getBoundingClientRect();
    
    const startX = startRect.left - gameRect.left + startRect.width / 2;
    const startY = startRect.top - gameRect.top + startRect.height / 2;
    const targetX = targetRect.left - gameRect.left + targetRect.width / 2;
    const targetY = targetRect.top - gameRect.top + targetRect.height / 2;
    
    missile.style.left = startX + 'px';
    missile.style.top = startY + 'px';
    
    const angle = Math.atan2(targetY - startY, targetX - startX);
    missile.style.transform = `rotate(${angle}rad)`;
    
    gameArea.appendChild(missile);
    
    const duration = 1500;
    const startTime = Date.now();
    
    function animateMissile() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentX = startX + (targetX - startX) * progress;
        const currentY = startY + (targetY - startY) * progress;
        
        missile.style.left = currentX + 'px';
        missile.style.top = currentY + 'px';
        
        if (progress < 1) {
            requestAnimationFrame(animateMissile);
        } else {
            missile.remove();
            createExplosionAt(targetX, targetY);
            if (callback) callback();
        }
    }
    
    requestAnimationFrame(animateMissile);
}

function animateShipToBattle(ships, enemies, callback) {
    console.log('animateShipToBattle called with ships:', ships.length, 'enemies:', enemies.length);
    let missilesLaunched = 0;
    const totalMissiles = Math.min(ships.length, enemies.length, 3);
    
    if (totalMissiles === 0) {
        console.log('No missiles to launch, calling callback');
        callback();
        return;
    }
    
    console.log('Will launch', totalMissiles, 'missiles');
    
    for (let i = 0; i < totalMissiles; i++) {
        setTimeout(() => {
            const shipElements = document.querySelectorAll('#ships-grid .ship');
            const enemyElements = document.querySelectorAll('#enemy-grid .enemy');
            
            console.log('Found ship elements:', shipElements.length, 'enemy elements:', enemyElements.length);
            
            if (shipElements.length > 0 && enemyElements.length > 0) {
                const shipElement = shipElements[Math.min(i, shipElements.length - 1)];
                const enemyElement = enemyElements[Math.min(i, enemyElements.length - 1)];
                
                console.log('Creating missile from ship to enemy');
                createMissile(shipElement, enemyElement, () => {
                    missilesLaunched++;
                    console.log('Missile completed, total launched:', missilesLaunched);
                    if (missilesLaunched === totalMissiles) {
                        callback();
                    }
                });
            } else {
                console.log('No ship or enemy elements found');
                missilesLaunched++;
                if (missilesLaunched === totalMissiles) {
                    callback();
                }
            }
        }, i * 200);
    }
}

function animateShipToDock(callback) {
    const shipElements = document.querySelectorAll('#ships-grid .ship');
    const dockElement = document.getElementById('enemy-dock');
    
    if (shipElements.length > 0 && dockElement) {
        const shipElement = shipElements[0];
        createMissile(shipElement, dockElement, () => {
            callback();
        });
    } else {
        callback();
    }
}

function addBattleEffects(playerShips, enemyShips) {
    const gameArea = document.getElementById('game-area');
    gameArea.classList.add('battle-shake');
    
    setTimeout(() => {
        gameArea.classList.remove('battle-shake');
    }, 2000);
    
    // Create multiple waves of effects - all centered
    for (let wave = 0; wave < 5; wave++) {
        setTimeout(() => {
            // Multiple muzzle flashes per wave
            for (let flash = 0; flash < 3; flash++) {
                setTimeout(() => {
                    createMuzzleFlash();
                }, flash * 50);
            }
            
            // Multiple projectiles per wave
            for (let proj = 0; proj < 4; proj++) {
                setTimeout(() => {
                    createProjectile();
                }, proj * 75);
            }
            
            // Multiple explosions per wave
            for (let exp = 0; exp < 2; exp++) {
                setTimeout(() => {
                    createExplosion();
                }, 200 + exp * 100);
            }
            
        }, wave * 300);
    }
    
    // Additional rapid fire effects
    for (let rapid = 0; rapid < 15; rapid++) {
        setTimeout(() => {
            if (rapid % 3 === 0) createMuzzleFlash();
            if (rapid % 2 === 0) createProjectile();
            if (rapid % 4 === 0) createExplosion();
        }, rapid * 100);
    }
}

function gameLoop() {
    gameState.buildings.forEach(building => {
        if (building.type !== 'factory') {
            if (building.produces === 'food') {
                gameState.food += building.rate;
            } else if (building.produces === 'materials') {
                gameState.materials += building.rate;
            } else if (building.produces === 'gold') {
                gameState.gold += building.rate;
            }
            building.production += building.rate;
        }
    });
    
    gameState.enemies.forEach(enemy => {
        enemy.timeToAttack--;
        if (enemy.timeToAttack <= 0) {
            enemy.timeToAttack = 0;
        }
    });
    
    enemyAttackDock();
    
    if (Math.random() < 0.1 && gameState.enemies.length < 3) {
        spawnEnemy();
    }
    
    updateDisplay();
}

function updateStatus() {
    const status = document.getElementById('status');
    const totalShipPower = gameState.ships.reduce((sum, ship) => sum + ship.power, 0);
    const totalTankPower = gameState.tanks.reduce((sum, tank) => sum + tank.power, 0);
    const totalPower = totalShipPower + totalTankPower;
    const totalEnemyPower = gameState.enemies.reduce((sum, enemy) => sum + enemy.power, 0);
    const foodProduction = gameState.buildings.filter(b => b.produces === 'food').reduce((sum, b) => sum + b.rate, 0);
    const materialProduction = gameState.buildings.filter(b => b.produces === 'materials').reduce((sum, b) => sum + b.rate, 0);
    const goldProduction = gameState.buildings.filter(b => b.produces === 'gold').reduce((sum, b) => sum + b.rate, 0);
    
    status.innerHTML = `
        <p>🏝️ Buildings: ${gameState.buildings.length} | 
        🚢 Ships: ${gameState.ships.length} (Power: ${totalShipPower}) | 
        🚗 Army: ${gameState.tanks.length} (Power: ${totalTankPower}) | 
        ☠️ Enemies: ${gameState.enemies.length} (Power: ${totalEnemyPower}) | 
        🌾 Food/sec: ${foodProduction} | 
        🔧 Materials/sec: ${materialProduction} | 
        💰 Gold/sec: ${goldProduction} | 
        🏆 Score: ${gameState.score}</p>
    `;
}

setInterval(gameLoop, 1000);
setInterval(updateStatus, 500);

updateDisplay();
updateStatus();