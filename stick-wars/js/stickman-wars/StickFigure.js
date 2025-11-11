class StickFigure {
    constructor(scene, x, y, z, characterType = 'warrior', isPlayer = false, isNeutral = false) {
        this.scene = scene;
        this.isPlayer = isPlayer;
        this.isNeutral = isNeutral; // Neutral units attack everyone
        this.characterType = characterType;

        // Set stats based on character type
        this.setCharacterStats(characterType);

        this.isAttacking = false;
        this.attackCooldown = 0;
        this.weapons = [];
        this.currentWeaponIndex = 0;
        this.currentWeapon = null;

        this.group = new THREE.Group();
        this.createStickFigure(characterType);
        this.group.position.set(x, y, z);

        this.initializeWeapons();
        this.scene.add(this.group);

        // Animation properties
        this.walkAnimation = 0;
        this.isWalking = false;
        this.attackAnimation = 0;
        this.idleAnimation = 0;
    }

    setCharacterStats(type) {
        const stats = {
            warrior: { health: 3000, speed: 1.0, damage: 1.2 }, // Player health
            rogue: { health: 4000, speed: 1.4, damage: 1.0 }, // Enemy health
            mage: { health: 4000, speed: 0.8, damage: 1.5 }, // Enemy health
            tank: { health: 4000, speed: 0.7, damage: 0.9 }, // Enemy health
            archer: { health: 4000, speed: 1.2, damage: 1.1 }, // Enemy health
            skateboarder: { health: 3500, speed: 4.0, damage: 1.0 }, // Super fast skateboard enemy!
            neutralTank: { health: 10000, speed: 0.5, damage: 3.0 } // Neutral super tank
        };

        const charStats = stats[type] || stats.warrior;

        // Special case: if this is a player character, use player stats
        if (this.isPlayer && type === 'warrior') {
            this.health = 3000;
            this.maxHealth = 3000;
        } else if (this.isNeutral && type === 'neutralTank') {
            // Neutral tank gets massive health
            this.health = charStats.health;
            this.maxHealth = charStats.health;
        } else {
            this.health = charStats.health;
            this.maxHealth = charStats.health;
        }

        this.speedMultiplier = charStats.speed;
        this.damageMultiplier = charStats.damage;

        // Set color based on player/enemy/neutral
        if (this.isPlayer) {
            this.baseColor = 0x000000; // Black for player
        } else if (this.isNeutral) {
            this.baseColor = 0xFF0000; // Red for neutral (hostile to all)
        } else {
            this.baseColor = 0xFFFF00; // Yellow for enemies
        }
    }

    createStickFigure(characterType) {
        const material = new THREE.MeshLambertMaterial({ color: this.baseColor });

        // Simple head - just a sphere
        const headGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        this.head = new THREE.Mesh(headGeometry, material);
        this.head.position.y = 1.75;
        this.head.castShadow = true;
        this.group.add(this.head);

        // Neck connector
        const neckGeometry = new THREE.CylinderGeometry(0.04, 0.06, 0.1, 6);
        const neck = new THREE.Mesh(neckGeometry, material);
        neck.position.y = 1.6;
        neck.castShadow = true;
        this.group.add(neck);

        // Simple body - just a cylinder
        const bodyGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8);
        this.body = new THREE.Mesh(bodyGeometry, material);
        this.body.position.y = 1.15;
        this.body.castShadow = true;
        this.group.add(this.body);

        // Shoulder joints
        const shoulderGeometry = new THREE.SphereGeometry(0.05, 6, 6);
        const leftShoulder = new THREE.Mesh(shoulderGeometry, material);
        leftShoulder.position.set(-0.15, 1.45, 0);
        leftShoulder.castShadow = true;
        this.group.add(leftShoulder);

        const rightShoulder = new THREE.Mesh(shoulderGeometry, material);
        rightShoulder.position.set(0.15, 1.45, 0);
        rightShoulder.castShadow = true;
        this.group.add(rightShoulder);

        // Simple arms - just thin cylinders
        this.leftArm = this.createSimpleArm(material);
        this.leftArm.position.set(-0.15, 1.45, 0);

        this.rightArm = this.createSimpleArm(material);
        this.rightArm.position.set(0.15, 1.45, 0);

        // Hip joints
        const hipGeometry = new THREE.SphereGeometry(0.05, 6, 6);
        const leftHip = new THREE.Mesh(hipGeometry, material);
        leftHip.position.set(-0.08, 0.75, 0);
        leftHip.castShadow = true;
        this.group.add(leftHip);

        const rightHip = new THREE.Mesh(hipGeometry, material);
        rightHip.position.set(0.08, 0.75, 0);
        rightHip.castShadow = true;
        this.group.add(rightHip);

        // Legs, wheels, or skateboard depending on character type
        if (characterType === 'neutralTank') {
            // Create tank wheels/treads instead of legs
            this.createTankWheels(material);
        } else if (characterType === 'skateboarder') {
            // Create skateboard and bent legs for skateboarder
            this.createSkateboard(material);
        } else {
            // Simple legs - just thin cylinders
            this.leftLeg = this.createSimpleLeg(material);
            this.leftLeg.position.set(-0.08, 0.75, 0);

            this.rightLeg = this.createSimpleLeg(material);
            this.rightLeg.position.set(0.08, 0.75, 0);

            this.group.add(this.leftArm, this.rightArm, this.leftLeg, this.rightLeg);
        }

        // Health bar (only for enemies)
        if (!this.isPlayer) {
            this.createHealthBar();
        }
    }

    createTankWheels(material) {
        // Tank base/chassis
        const chassisGeometry = new THREE.BoxGeometry(0.5, 0.2, 0.7);
        const chassisMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const chassis = new THREE.Mesh(chassisGeometry, chassisMaterial);
        chassis.position.y = 0.3;
        chassis.castShadow = true;
        this.group.add(chassis);

        // Wheel material (darker)
        const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });

        // Create 6 wheels (3 on each side)
        const wheelPositions = [
            // Left side wheels
            { x: -0.3, z: 0.25 },
            { x: -0.3, z: 0 },
            { x: -0.3, z: -0.25 },
            // Right side wheels
            { x: 0.3, z: 0.25 },
            { x: 0.3, z: 0 },
            { x: 0.3, z: -0.25 }
        ];

        wheelPositions.forEach(pos => {
            const wheelGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 12);
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2; // Rotate to be horizontal
            wheel.position.set(pos.x, 0.12, pos.z);
            wheel.castShadow = true;
            this.group.add(wheel);

            // Add wheel rim detail
            const rimGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.09, 8);
            const rimMaterial = new THREE.MeshLambertMaterial({ color: 0x555555 });
            const rim = new THREE.Mesh(rimGeometry, rimMaterial);
            rim.rotation.z = Math.PI / 2;
            rim.position.set(pos.x, 0.12, pos.z);
            rim.castShadow = true;
            this.group.add(rim);
        });

        // Tank treads/tracks (connecting the wheels)
        const treadGeometry = new THREE.BoxGeometry(0.06, 0.08, 0.6);

        // Left tread
        const leftTread = new THREE.Mesh(treadGeometry, wheelMaterial);
        leftTread.position.set(-0.3, 0.06, 0);
        leftTread.castShadow = true;
        this.group.add(leftTread);

        // Right tread
        const rightTread = new THREE.Mesh(treadGeometry, wheelMaterial);
        rightTread.position.set(0.3, 0.06, 0);
        rightTread.castShadow = true;
        this.group.add(rightTread);

        // Still add arms to group
        this.group.add(this.leftArm, this.rightArm);
    }

    createSkateboard(material) {
        // Skateboard deck
        const deckGeometry = new THREE.BoxGeometry(0.3, 0.04, 0.8);
        const deckMaterial = new THREE.MeshLambertMaterial({ color: 0xFF6B35 }); // Orange deck
        const deck = new THREE.Mesh(deckGeometry, deckMaterial);
        deck.position.y = 0.15;
        deck.castShadow = true;
        this.group.add(deck);

        // Grip tape (top of deck)
        const gripGeometry = new THREE.BoxGeometry(0.28, 0.005, 0.75);
        const gripMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
        const grip = new THREE.Mesh(gripGeometry, gripMaterial);
        grip.position.y = 0.175;
        this.group.add(grip);

        // Trucks (metal axles)
        const truckMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });

        // Front truck
        const frontTruckGeometry = new THREE.BoxGeometry(0.35, 0.03, 0.08);
        const frontTruck = new THREE.Mesh(frontTruckGeometry, truckMaterial);
        frontTruck.position.set(0, 0.1, 0.25);
        frontTruck.castShadow = true;
        this.group.add(frontTruck);

        // Back truck
        const backTruckGeometry = new THREE.BoxGeometry(0.35, 0.03, 0.08);
        const backTruck = new THREE.Mesh(backTruckGeometry, truckMaterial);
        backTruck.position.set(0, 0.1, -0.25);
        backTruck.castShadow = true;
        this.group.add(backTruck);

        // Wheels (4 wheels)
        const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x2d2d2d });
        const wheelPositions = [
            { x: -0.15, z: 0.25 },  // Front left
            { x: 0.15, z: 0.25 },   // Front right
            { x: -0.15, z: -0.25 }, // Back left
            { x: 0.15, z: -0.25 }   // Back right
        ];

        wheelPositions.forEach(pos => {
            const wheelGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.04, 12);
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2; // Rotate to horizontal
            wheel.position.set(pos.x, 0.06, pos.z);
            wheel.castShadow = true;
            this.group.add(wheel);
        });

        // Bent skating legs - legs bent at knees for skating pose
        this.leftLeg = this.createSimpleLeg(material);
        this.leftLeg.position.set(-0.08, 0.75, 0);
        this.leftLeg.rotation.x = -0.3; // Bent forward for skating

        this.rightLeg = this.createSimpleLeg(material);
        this.rightLeg.position.set(0.08, 0.75, 0);
        this.rightLeg.rotation.x = 0.3; // One leg pushing

        // Add legs and arms to group
        this.group.add(this.leftArm, this.rightArm, this.leftLeg, this.rightLeg);

        // Lean body forward for skating pose
        this.body.rotation.x = 0.1;
    }

    createSimpleArm(material) {
        const arm = new THREE.Group();

        // Upper arm
        const upperArmGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 6);
        const upperArm = new THREE.Mesh(upperArmGeometry, material);
        upperArm.position.y = -0.15;
        upperArm.castShadow = true;
        arm.add(upperArm);

        // Elbow joint (sphere for flexibility)
        const elbowGeometry = new THREE.SphereGeometry(0.035, 6, 6);
        const elbow = new THREE.Mesh(elbowGeometry, material);
        elbow.position.y = -0.3;
        elbow.castShadow = true;
        arm.add(elbow);

        // Forearm (as a separate group for rotation)
        const forearmGroup = new THREE.Group();
        forearmGroup.position.y = -0.3;

        const forearmGeometry = new THREE.CylinderGeometry(0.025, 0.025, 0.3, 6);
        const forearm = new THREE.Mesh(forearmGeometry, material);
        forearm.position.y = -0.15;
        forearm.castShadow = true;
        forearmGroup.add(forearm);

        // Wrist joint
        const wristGeometry = new THREE.SphereGeometry(0.03, 6, 6);
        const wrist = new THREE.Mesh(wristGeometry, material);
        wrist.position.y = -0.3;
        wrist.castShadow = true;
        forearmGroup.add(wrist);

        // Simple hand
        const handGeometry = new THREE.BoxGeometry(0.06, 0.08, 0.03);
        const hand = new THREE.Mesh(handGeometry, material);
        hand.position.y = -0.35;
        hand.castShadow = true;
        forearmGroup.add(hand);

        arm.add(forearmGroup);
        arm.forearm = forearmGroup; // Reference for animations

        return arm;
    }

    createSimpleLeg(material) {
        const leg = new THREE.Group();

        // Upper leg (thigh)
        const thighGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.35, 6);
        const thigh = new THREE.Mesh(thighGeometry, material);
        thigh.position.y = -0.175;
        thigh.castShadow = true;
        leg.add(thigh);

        // Knee joint (sphere for flexibility)
        const kneeGeometry = new THREE.SphereGeometry(0.045, 6, 6);
        const knee = new THREE.Mesh(kneeGeometry, material);
        knee.position.y = -0.35;
        knee.castShadow = true;
        leg.add(knee);

        // Lower leg (shin) as a separate group for rotation
        const shinGroup = new THREE.Group();
        shinGroup.position.y = -0.35;

        const shinGeometry = new THREE.CylinderGeometry(0.035, 0.035, 0.35, 6);
        const shin = new THREE.Mesh(shinGeometry, material);
        shin.position.y = -0.175;
        shin.castShadow = true;
        shinGroup.add(shin);

        // Ankle joint
        const ankleGeometry = new THREE.SphereGeometry(0.04, 6, 6);
        const ankle = new THREE.Mesh(ankleGeometry, material);
        ankle.position.y = -0.35;
        ankle.castShadow = true;
        shinGroup.add(ankle);

        // Simple foot
        const footGeometry = new THREE.BoxGeometry(0.08, 0.03, 0.12);
        const foot = new THREE.Mesh(footGeometry, material);
        foot.position.set(0, -0.37, 0.03);
        foot.castShadow = true;
        shinGroup.add(foot);

        leg.add(shinGroup);
        leg.shin = shinGroup; // Reference for animations

        return leg;
    }

    createHealthBar() {
        const barGroup = new THREE.Group();

        // Background
        const bgGeometry = new THREE.PlaneGeometry(1, 0.1);
        const bgMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const background = new THREE.Mesh(bgGeometry, bgMaterial);
        barGroup.add(background);

        // Health bar
        const healthGeometry = new THREE.PlaneGeometry(1, 0.08);
        const healthMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.healthBar = new THREE.Mesh(healthGeometry, healthMaterial);
        this.healthBar.position.z = 0.001;
        barGroup.add(this.healthBar);

        barGroup.position.y = 2.2;
        this.group.add(barGroup);

        // Make health bar always face camera
        this.healthBarGroup = barGroup;
    }

    initializeWeapons() {
        this.weapons = [
            new Weapon('Sword', 30, 2.0, 0x888888),
            new Weapon('Axe', 35, 1.8, 0x8B4513),
            new Weapon('Spear', 20, 3.0, 0x654321),
            new Weapon('Hammer', 40, 1.5, 0x696969),
            new Weapon('Crossbow', 100, 7.0, 0x4A4A4A),
            null, // Rifle slot - unlocked with 100 coins
            null  // Bomb slot - unlocked with 200 coins
        ];

        // Set crossbow stats
        this.weapons[4].cooldown = 0.2; // Very fast fire rate
        this.weapons[4].maxAmmo = 10; // 10 bolts per reload
        this.weapons[4].currentAmmo = 10;
        this.weapons[4].reloadTime = 1.5; // 1.5 seconds to reload

        this.currentWeapon = this.weapons[0];
        this.currentWeapon.attachTo(this.rightArm);

        // Track if rifle and bomb are unlocked
        this.hasRifle = false;
        this.hasBomb = false;
    }

    unlockRifle() {
        if (!this.hasRifle) {
            console.log('Creating rifle weapon...');
            // Create the rifle weapon
            const rifle = new Weapon('Rifle', 200, 15.0, 0x2F4F4F);

            // Set rifle stats
            rifle.cooldown = 0.15; // Fast fire rate
            rifle.maxAmmo = 30; // 30 bullets per reload
            rifle.currentAmmo = 30;
            rifle.reloadTime = 2.0; // 2 seconds to reload

            // Add to weapons array
            this.weapons[5] = rifle;
            this.hasRifle = true;

            console.log('Rifle unlocked! Weapon:', rifle);
            console.log('Weapons array:', this.weapons);

            // Auto-switch to rifle
            if (this.isPlayer) {
                setTimeout(() => {
                    this.switchWeapon(5);
                }, 100);
            }

            return true;
        }
        return false;
    }

    unlockBomb() {
        if (!this.hasBomb) {
            console.log('Creating bomb weapon...');
            // Create the bomb weapon
            const bomb = new Weapon('Bomb', 500, 5.0, 0xFF4500);

            // Set bomb stats
            bomb.cooldown = 1.5; // Slower fire rate (grenades take time)
            bomb.maxAmmo = 5; // 5 bombs per reload
            bomb.currentAmmo = 5;
            bomb.reloadTime = 3.0; // 3 seconds to reload
            bomb.explosionRadius = 4.0; // Area of effect damage

            // Add to weapons array
            this.weapons[6] = bomb;
            this.hasBomb = true;

            console.log('Bomb unlocked! Weapon:', bomb);
            console.log('Weapons array:', this.weapons);

            // Auto-switch to bomb
            if (this.isPlayer) {
                setTimeout(() => {
                    this.switchWeapon(6);
                }, 100);
            }

            return true;
        }
        return false;
    }

    switchWeapon(index) {
        console.log(`Attempting to switch to weapon ${index}, weapon exists:`, this.weapons[index] !== null);

        if (index >= 0 && index < this.weapons.length && this.weapons[index] !== null) {
            // Remove current weapon
            if (this.currentWeapon) {
                this.currentWeapon.detach();
            }

            // Switch to new weapon
            this.currentWeaponIndex = index;
            this.currentWeapon = this.weapons[index];
            this.currentWeapon.attachTo(this.rightArm);

            console.log(`Switched to weapon: ${this.currentWeapon.name}`);

            // Update UI
            if (this.isPlayer) {
                if (this.currentWeapon.maxAmmo !== null) {
                    document.getElementById('currentWeapon').textContent =
                        `${this.currentWeapon.name} (${this.currentWeapon.currentAmmo}/${this.currentWeapon.maxAmmo})`;
                } else {
                    document.getElementById('currentWeapon').textContent = this.currentWeapon.name;
                }
            }
        } else {
            console.log(`Cannot switch to weapon ${index} - not available`);
        }
    }

    move(deltaX, deltaZ) {
        // Apply speed multiplier based on character type
        const adjustedDeltaX = deltaX * this.speedMultiplier;
        const adjustedDeltaZ = deltaZ * this.speedMultiplier;

        this.group.position.x += adjustedDeltaX;
        this.group.position.z += adjustedDeltaZ;
        this.isWalking = Math.abs(adjustedDeltaX) > 0.001 || Math.abs(adjustedDeltaZ) > 0.001;
    }

    rotate(deltaYaw, deltaPitch) {
        this.group.rotation.y += deltaYaw;

        // Limit head pitch for first-person feel
        if (this.isPlayer) {
            const camera = this.group.children.find(child => child.type === 'PerspectiveCamera');
            if (camera) {
                camera.rotation.x = Math.max(-Math.PI/3, Math.min(Math.PI/3, camera.rotation.x + deltaPitch));
            }
        }
    }

    attack(gameInstance) {
        if (this.attackCooldown <= 0 && this.currentWeapon && !this.currentWeapon.isReloading) {
            console.log(`Attacking with weapon: ${this.currentWeapon.name}, ammo: ${this.currentWeapon.currentAmmo}`);

            // Check if weapon needs ammo and is out
            if (this.currentWeapon.maxAmmo !== null && this.currentWeapon.currentAmmo <= 0) {
                console.log('Out of ammo, reloading...');
                this.reloadWeapon();
                return;
            }

            this.isAttacking = true;
            this.attackCooldown = this.currentWeapon.cooldown;

            // Check if using bomb
            if (this.currentWeapon.name === 'Bomb' && gameInstance) {
                console.log('Throwing bomb!');

                // Use ammo
                if (this.currentWeapon.currentAmmo !== null) {
                    this.currentWeapon.currentAmmo--;
                    this.updateAmmoUI();
                }

                // Throw bomb
                this.throwBomb(gameInstance);

                // Throwing animation
                this.performThrowAnimation();
            }
            // Check if using ranged weapon - shoot projectile instead of melee
            else if ((this.currentWeapon.name === 'Crossbow' || this.currentWeapon.name === 'Rifle') && gameInstance) {
                console.log('Firing ranged weapon:', this.currentWeapon.name);

                // Use ammo
                if (this.currentWeapon.currentAmmo !== null) {
                    this.currentWeapon.currentAmmo--;
                    this.updateAmmoUI();
                }

                // Shoot projectile (using arrow system)
                this.shootArrow(gameInstance);

                // Shooting animation
                if (this.currentWeapon.name === 'Rifle') {
                    this.performRifleAnimation();
                } else {
                    this.performCrossbowAnimation();
                }
            } else {
                console.log('Performing melee attack');
                // Melee attack animation based on weapon
                this.performMeleeAnimation();
            }
        }
    }

    reloadWeapon() {
        if (this.currentWeapon.isReloading || this.currentWeapon.maxAmmo === null) return;
        if (this.currentWeapon.currentAmmo >= this.currentWeapon.maxAmmo) return;

        this.currentWeapon.isReloading = true;
        this.currentWeapon.reloadProgress = 0;

        if (this.isPlayer) {
            console.log('Reloading...');
        }
    }

    updateAmmoUI() {
        if (this.isPlayer && this.currentWeapon.maxAmmo !== null) {
            const weaponText = document.getElementById('currentWeapon');
            weaponText.textContent = `${this.currentWeapon.name} (${this.currentWeapon.currentAmmo}/${this.currentWeapon.maxAmmo})`;
        }
    }

    performCrossbowAnimation() {
        // Aim crossbow - extend arm forward
        this.rightArm.rotation.x = -Math.PI/8;
        this.rightArm.rotation.z = -0.2;
        if (this.rightArm.forearm) {
            this.rightArm.forearm.rotation.x = -0.4;
        }

        // Support with left hand
        this.leftArm.rotation.x = -Math.PI/8;
        this.leftArm.rotation.z = 0.3;
        if (this.leftArm.forearm) {
            this.leftArm.forearm.rotation.x = -0.5;
        }

        // Stance
        this.body.rotation.z = -0.05;

        setTimeout(() => {
            // Recoil - arms kick back
            this.rightArm.rotation.x = -Math.PI/6;
            if (this.rightArm.forearm) {
                this.rightArm.forearm.rotation.x = -0.5;
            }
            this.body.rotation.x = -0.05;

            setTimeout(() => {
                // Return to neutral
                this.isAttacking = false;
                this.rightArm.rotation.x = 0;
                this.rightArm.rotation.z = 0;
                this.leftArm.rotation.x = 0;
                this.leftArm.rotation.z = 0;
                if (this.rightArm.forearm) {
                    this.rightArm.forearm.rotation.x = 0;
                }
                if (this.leftArm.forearm) {
                    this.leftArm.forearm.rotation.x = 0;
                }
                this.body.rotation.x = 0;
                this.body.rotation.z = 0;
            }, 150);
        }, 80);
    }

    performRifleAnimation() {
        // Rifle aiming stance - shoulder weapon
        this.rightArm.rotation.x = -Math.PI/6;
        this.rightArm.rotation.z = -0.1;
        if (this.rightArm.forearm) {
            this.rightArm.forearm.rotation.x = -0.3;
        }

        // Support with left hand
        this.leftArm.rotation.x = -Math.PI/6;
        this.leftArm.rotation.z = 0.2;
        if (this.leftArm.forearm) {
            this.leftArm.forearm.rotation.x = -0.4;
        }

        // Lean into rifle
        this.body.rotation.z = -0.03;

        setTimeout(() => {
            // Minimal recoil - rifles are stable
            this.rightArm.rotation.x = -Math.PI/5;
            if (this.rightArm.forearm) {
                this.rightArm.forearm.rotation.x = -0.35;
            }
            this.body.rotation.x = -0.02;

            setTimeout(() => {
                // Quick return to neutral
                this.isAttacking = false;
                this.rightArm.rotation.x = 0;
                this.rightArm.rotation.z = 0;
                this.leftArm.rotation.x = 0;
                this.leftArm.rotation.z = 0;
                if (this.rightArm.forearm) {
                    this.rightArm.forearm.rotation.x = 0;
                }
                if (this.leftArm.forearm) {
                    this.leftArm.forearm.rotation.x = 0;
                }
                this.body.rotation.x = 0;
                this.body.rotation.z = 0;
            }, 100);
        }, 50);
    }

    performMeleeAnimation() {
        const weapon = this.currentWeapon.name;

        // Wind up
        this.rightArm.rotation.x = -Math.PI/3;
        this.rightArm.rotation.z = -0.5;
        if (this.rightArm.forearm) {
            this.rightArm.forearm.rotation.x = -0.8;
        }
        // Lean back
        this.body.rotation.x = -0.2;
        this.body.rotation.z = -0.15;

        setTimeout(() => {
            // Strike - full force swing
            if (weapon === 'Hammer') {
                // Overhead slam
                this.rightArm.rotation.x = Math.PI/2;
                this.rightArm.rotation.z = 0;
                if (this.rightArm.forearm) {
                    this.rightArm.forearm.rotation.x = -1.2;
                }
            } else if (weapon === 'Axe') {
                // Wide horizontal swing
                this.rightArm.rotation.x = 0;
                this.rightArm.rotation.z = 0.8;
                if (this.rightArm.forearm) {
                    this.rightArm.forearm.rotation.x = -0.3;
                }
            } else {
                // Forward thrust/slash
                this.rightArm.rotation.x = -Math.PI/6;
                this.rightArm.rotation.z = 0.2;
                if (this.rightArm.forearm) {
                    this.rightArm.forearm.rotation.x = 0;
                }
            }

            // Lean forward into attack
            this.body.rotation.x = 0.15;
            this.body.rotation.z = 0.1;

            // Step forward (only if character has legs)
            if (this.leftLeg && this.rightLeg) {
                this.leftLeg.rotation.x = 0.3;
                this.rightLeg.rotation.x = -0.3;
            }

            setTimeout(() => {
                // Return to neutral
                this.isAttacking = false;
                this.rightArm.rotation.x = 0;
                this.rightArm.rotation.z = 0;
                if (this.rightArm.forearm) {
                    this.rightArm.forearm.rotation.x = 0;
                }
                this.body.rotation.x = 0;
                this.body.rotation.z = 0;

                // Reset legs (only if character has legs)
                if (this.leftLeg && this.rightLeg) {
                    this.leftLeg.rotation.x = 0;
                    this.rightLeg.rotation.x = 0;
                }
            }, 200);
        }, 150);
    }

    shootArrow(gameInstance) {
        // Get shooting direction from where character is facing
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.group.quaternion);

        // Normalize to ensure consistent speed
        direction.normalize();

        // Rifles shoot straighter, crossbows have slight arc
        if (this.currentWeapon.name === 'Rifle') {
            direction.y += 0.02; // Very slight upward angle
        } else {
            direction.y += 0.05; // Slight upward angle for realistic arc
        }
        direction.normalize();

        // Create and add arrow/bullet
        const arrow = new Arrow(this.scene, this.group.position.clone(), direction, this);
        gameInstance.arrows.push(arrow);

        // Debug: log projectile creation
        console.log('Projectile shot by', this.isPlayer ? 'player' : 'enemy',
                    'weapon:', this.currentWeapon.name,
                    'damage:', this.currentWeapon.damage,
                    'at position', this.group.position,
                    'direction', direction);
    }

    throwBomb(gameInstance) {
        // Get throwing direction from where character is facing
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.group.quaternion);

        // Normalize to ensure consistent speed
        direction.normalize();

        // Bombs are thrown in an arc
        direction.y += 0.4; // High arc for grenade throw
        direction.normalize();

        // Create and add bomb
        const bomb = new Bomb(this.scene, this.group.position.clone(), direction, this);
        gameInstance.bombs.push(bomb);

        // Debug: log bomb creation
        console.log('💣 Bomb thrown by', this.isPlayer ? 'player' : 'enemy',
                    'damage:', this.currentWeapon.damage,
                    'explosion radius:', this.currentWeapon.explosionRadius,
                    'at position', this.group.position,
                    'direction', direction);
    }

    performThrowAnimation() {
        // Wind up - arm back
        this.rightArm.rotation.x = -Math.PI/2;
        this.rightArm.rotation.z = -0.8;
        if (this.rightArm.forearm) {
            this.rightArm.forearm.rotation.x = -1.2;
        }

        // Lean back
        this.body.rotation.x = -0.3;
        this.body.rotation.z = -0.2;

        setTimeout(() => {
            // Throw - arm forward
            this.rightArm.rotation.x = Math.PI/4;
            this.rightArm.rotation.z = 0;
            if (this.rightArm.forearm) {
                this.rightArm.forearm.rotation.x = 0;
            }

            // Lean forward
            this.body.rotation.x = 0.2;
            this.body.rotation.z = 0;

            // Step forward
            if (this.leftLeg && this.rightLeg) {
                this.leftLeg.rotation.x = 0.4;
                this.rightLeg.rotation.x = -0.4;
            }

            setTimeout(() => {
                // Return to neutral
                this.isAttacking = false;
                this.rightArm.rotation.x = 0;
                this.rightArm.rotation.z = 0;
                if (this.rightArm.forearm) {
                    this.rightArm.forearm.rotation.x = 0;
                }
                this.body.rotation.x = 0;
                this.body.rotation.z = 0;

                // Reset legs
                if (this.leftLeg && this.rightLeg) {
                    this.leftLeg.rotation.x = 0;
                    this.rightLeg.rotation.x = 0;
                }
            }, 200);
        }, 150);
    }

    takeDamage(amount) {
        const oldHealth = this.health;
        this.health = Math.max(0, this.health - amount);

        console.log('takeDamage called:', 'Amount:', amount, 'Old Health:', oldHealth, 'New Health:', this.health, 'isPlayer:', this.isPlayer, 'hasHealthBar:', !!this.healthBar);

        // Update health bar for enemies
        if (!this.isPlayer && this.healthBar) {
            const healthPercent = this.health / this.maxHealth;
            this.healthBar.scale.x = healthPercent;
            this.healthBar.position.x = (healthPercent - 1) * 0.5;

            console.log('Updating health bar:', 'healthPercent:', healthPercent, 'scale.x:', this.healthBar.scale.x);

            // Change color based on health
            if (healthPercent > 0.6) {
                this.healthBar.material.color.setHex(0x00ff00);
            } else if (healthPercent > 0.3) {
                this.healthBar.material.color.setHex(0xffff00);
            } else {
                this.healthBar.material.color.setHex(0xff0000);
            }
        } else if (!this.isPlayer && !this.healthBar) {
            console.warn('Enemy has no health bar!');
        }

        // Death or conversion
        if (this.health <= 0) {
            // Neutral tanks get converted instead of dying
            if (this.isNeutral) {
                this.convertToAlly();
            } else {
                this.die();
            }
        }

        // Damage effect
        this.showDamageEffect();
    }

    convertToAlly() {
        console.log('Neutral tank converting to ally!');

        // Mark as no longer neutral
        this.isNeutral = false;
        this.isAlly = true;

        // Restore health to full
        this.health = this.maxHealth;

        // Change color to green (ally color)
        this.baseColor = 0x00FF00;

        // Update all body part colors
        const greenMaterial = new THREE.MeshLambertMaterial({ color: 0x00FF00 });

        this.head.material = greenMaterial;
        this.body.material = greenMaterial;

        if (this.leftArm) {
            this.leftArm.children.forEach(child => {
                if (child.material) child.material = greenMaterial;
                if (child.children) {
                    child.children.forEach(subChild => {
                        if (subChild.material) subChild.material = greenMaterial;
                    });
                }
            });
        }

        if (this.rightArm) {
            this.rightArm.children.forEach(child => {
                if (child.material) child.material = greenMaterial;
                if (child.children) {
                    child.children.forEach(subChild => {
                        if (subChild.material) subChild.material = greenMaterial;
                    });
                }
            });
        }

        // Update health bar color
        if (this.healthBar) {
            this.healthBar.material.color.setHex(0x00ff00);
            this.healthBar.scale.x = 1;
            this.healthBar.position.x = 0;
        }

        // Play conversion effect - flash green
        this.playConversionEffect();
    }

    playConversionEffect() {
        let flashCount = 0;
        const maxFlashes = 6;

        const flash = () => {
            if (flashCount >= maxFlashes) return;

            // Alternate between green and white
            const color = flashCount % 2 === 0 ? 0xFFFFFF : 0x00FF00;
            this.head.material.color.setHex(color);
            this.body.material.color.setHex(color);

            flashCount++;
            setTimeout(flash, 100);
        };

        flash();
    }

    showDamageEffect() {
        // Flash red briefly
        const originalColor = this.head.material.color.clone();
        this.head.material.color.setHex(0xff0000);
        this.body.material.color.setHex(0xff0000);

        // Hit reaction animation - recoil back
        const recoilIntensity = 0.15;
        const originalBodyRotX = this.body.rotation.x;
        const originalBodyRotZ = this.body.rotation.z;

        this.body.rotation.x = -recoilIntensity;
        this.body.rotation.z = (Math.random() - 0.5) * recoilIntensity;

        // Arms flinch
        const originalLeftArmRotX = this.leftArm.rotation.x;
        const originalRightArmRotX = this.rightArm.rotation.x;
        this.leftArm.rotation.x = -0.3;
        this.rightArm.rotation.x = -0.3;

        // Head snaps back
        const originalHeadRotX = this.head.rotation.x;
        this.head.rotation.x = -0.2;

        setTimeout(() => {
            // Return color and position
            this.head.material.color.copy(originalColor);
            this.body.material.color.copy(originalColor);

            this.body.rotation.x = originalBodyRotX;
            this.body.rotation.z = originalBodyRotZ;
            this.leftArm.rotation.x = originalLeftArmRotX;
            this.rightArm.rotation.x = originalRightArmRotX;
            this.head.rotation.x = originalHeadRotX;
        }, 150);
    }

    die() {
        // Store death position for coin drop
        this.deathPosition = this.group.position.clone();

        // Dramatic death animation
        let fallProgress = 0;
        const fallDuration = 1000; // 1 second fall
        const startTime = Date.now();

        const deathAnimation = () => {
            const elapsed = Date.now() - startTime;
            fallProgress = Math.min(elapsed / fallDuration, 1);

            // Ragdoll effect - rotate and fall
            this.group.rotation.z = fallProgress * Math.PI/2;
            this.group.position.y = -fallProgress * 0.8;

            // Arms flail
            this.leftArm.rotation.x = fallProgress * (Math.PI/3);
            this.rightArm.rotation.x = fallProgress * (Math.PI/4);
            this.leftArm.rotation.z = fallProgress * 0.5;
            this.rightArm.rotation.z = fallProgress * -0.5;

            // Legs collapse
            if (this.leftLeg && this.rightLeg) {
                this.leftLeg.rotation.x = fallProgress * 0.8;
                this.rightLeg.rotation.x = fallProgress * -0.6;
                if (this.leftLeg.shin) {
                    this.leftLeg.shin.rotation.x = fallProgress * 1.2;
                }
                if (this.rightLeg.shin) {
                    this.rightLeg.shin.rotation.x = fallProgress * 1.2;
                }
            }

            // Head drops
            this.head.rotation.x = fallProgress * 0.5;

            // Body twists
            this.body.rotation.y = fallProgress * 0.3;

            if (fallProgress < 1) {
                requestAnimationFrame(deathAnimation);
            } else {
                // Final position - fully collapsed
                setTimeout(() => {
                    this.scene.remove(this.group);
                }, 1000);
            }
        };

        deathAnimation();
    }

    update(deltaTime) {
        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }

        // Update reload progress
        if (this.currentWeapon && this.currentWeapon.isReloading) {
            this.currentWeapon.reloadProgress += deltaTime;

            if (this.currentWeapon.reloadProgress >= this.currentWeapon.reloadTime) {
                // Reload complete
                this.currentWeapon.currentAmmo = this.currentWeapon.maxAmmo;
                this.currentWeapon.isReloading = false;
                this.currentWeapon.reloadProgress = 0;

                if (this.isPlayer) {
                    console.log('Reload complete!');
                    this.updateAmmoUI();
                }
            }
        }

        // Idle animation - breathing
        if (!this.isWalking && !this.isAttacking && this.health > 0) {
            this.idleAnimation += deltaTime * 2;

            // Subtle breathing
            const breathe = Math.sin(this.idleAnimation) * 0.02;
            this.body.scale.y = 1 + breathe;
            this.group.position.y = breathe * 0.3;

            // Slight head movement
            this.head.rotation.y = Math.sin(this.idleAnimation * 0.5) * 0.05;

            // Arms sway slightly
            if (!this.isAttacking) {
                this.leftArm.rotation.z = 0.1 + Math.sin(this.idleAnimation * 0.7) * 0.03;
                this.rightArm.rotation.z = -0.1 - Math.sin(this.idleAnimation * 0.7) * 0.03;
            }
        }

        // Walking animation
        if (this.isWalking) {
            this.walkAnimation += deltaTime * 8;

            // Reset idle animation effects
            this.body.scale.y = 1;
            this.head.rotation.y = 0;

            const swing = Math.sin(this.walkAnimation) * 0.5;
            const elbowBend = Math.abs(Math.sin(this.walkAnimation)) * 0.4;
            const kneeBend = Math.abs(Math.sin(this.walkAnimation)) * 0.6;

            // Arms swing
            this.leftArm.rotation.x = swing;
            this.leftArm.rotation.z = 0;
            this.rightArm.rotation.x = -swing;
            this.rightArm.rotation.z = 0;

            // Elbows bend during walk
            if (this.leftArm.forearm) {
                this.leftArm.forearm.rotation.x = elbowBend;
            }
            if (this.rightArm.forearm) {
                this.rightArm.forearm.rotation.x = elbowBend;
            }

            // Legs swing (only if character has legs)
            if (this.leftLeg && this.rightLeg) {
                this.leftLeg.rotation.x = -swing;
                this.rightLeg.rotation.x = swing;

                // Knees bend during walk
                if (this.leftLeg.shin) {
                    this.leftLeg.shin.rotation.x = Math.max(0, Math.sin(this.walkAnimation) * 0.6);
                }
                if (this.rightLeg.shin) {
                    this.rightLeg.shin.rotation.x = Math.max(0, -Math.sin(this.walkAnimation) * 0.6);
                }

                // Bob up and down slightly
                this.group.position.y = Math.abs(Math.sin(this.walkAnimation * 2)) * 0.1;
            } else {
                // Tanks just have a subtle rumble when moving
                this.group.position.y = Math.sin(this.walkAnimation * 4) * 0.02;
            }
        } else if (!this.isAttacking) {
            // Return to neutral pose (only if not attacking)
            this.leftArm.rotation.x = 0;
            this.rightArm.rotation.x = 0;

            // Reset elbow bends
            if (this.leftArm.forearm) this.leftArm.forearm.rotation.x = 0;
            if (this.rightArm.forearm) this.rightArm.forearm.rotation.x = 0;

            // Reset legs (if character has legs)
            if (this.leftLeg && this.rightLeg) {
                this.leftLeg.rotation.x = 0;
                this.rightLeg.rotation.x = 0;

                // Reset knee bends
                if (this.leftLeg.shin) this.leftLeg.shin.rotation.x = 0;
                if (this.rightLeg.shin) this.rightLeg.shin.rotation.x = 0;
            }
        }

        // Make health bar face camera (for enemies)
        if (this.healthBarGroup && this.scene.children[0] && this.scene.children[0].type === 'PerspectiveCamera') {
            this.healthBarGroup.lookAt(this.scene.children[0].position);
        }

        this.isWalking = false;
    }
}