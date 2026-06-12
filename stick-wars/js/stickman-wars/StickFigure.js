class StickFigure {
    constructor(scene, x, y, z, characterType = 'warrior', isPlayer = false, isNeutral = false) {
        this.scene = scene;
        this.isPlayer = isPlayer;
        this.isHudOwner = isPlayer; // Only the main player drives the HUD (player 2 sets this false)
        this.isNeutral = isNeutral; // Neutral units attack everyone
        this.characterType = characterType;

        // Set stats based on character type
        this.setCharacterStats(characterType);

        this.isAttacking = false;
        this.attackCooldown = 0;
        this.meleeHitPending = false; // Set when a melee swing should land (consumed by Game3D)
        this.isFlashing = false;
        this.aiTarget = null;
        this.prefersRanged = false;
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
            warrior: { health: 90, speed: 1.0, damage: 1.0 },
            rogue: { health: 70, speed: 1.3, damage: 0.9 },
            mage: { health: 55, speed: 0.8, damage: 1.3 },
            tank: { health: 140, speed: 0.6, damage: 1.1 },
            archer: { health: 60, speed: 1.1, damage: 1.0 },
            skateboarder: { health: 50, speed: 2.2, damage: 0.8 }, // Fast hit-and-run attacker
            neutralTank: { health: 500, speed: 0.5, damage: 2.5 } // Neutral super tank
        };

        const charStats = stats[type] || stats.warrior;

        if (this.isPlayer) {
            // Player is tougher and hits harder than a regular warrior
            this.health = 200;
            this.maxHealth = 200;
            this.speedMultiplier = 1.0;
            this.damageMultiplier = 1.2;
        } else {
            this.health = charStats.health;
            this.maxHealth = charStats.health;
            this.speedMultiplier = charStats.speed;
            this.damageMultiplier = charStats.damage;
        }

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
        // damage / range / color; cooldowns set below
        this.weapons = [
            new Weapon('Sword', 25, 2.2, 0x888888),   // Fast all-rounder
            new Weapon('Axe', 40, 2.0, 0x8B4513),     // Slower, heavier hits
            new Weapon('Spear', 30, 3.2, 0x654321),   // Extra reach
            new Weapon('Hammer', 60, 1.8, 0x696969),  // Slow but devastating
            new Weapon('Crossbow', 35, 12.0, 0x4A4A4A), // Ranged
            null, // Rifle slot - unlocked with coins
            null  // Bomb slot - unlocked with coins
        ];

        this.weapons[0].cooldown = 0.5;
        this.weapons[1].cooldown = 0.8;
        this.weapons[2].cooldown = 0.7;
        this.weapons[3].cooldown = 1.2;

        // Crossbow ammo / fire rate
        this.weapons[4].cooldown = 0.6;
        this.weapons[4].maxAmmo = 10;
        this.weapons[4].currentAmmo = 10;
        this.weapons[4].reloadTime = 1.5;

        this.currentWeapon = this.weapons[0];
        this.currentWeapon.attachTo(this.rightArm);

        // Track if rifle and bomb are unlocked
        this.hasRifle = false;
        this.hasBomb = false;
    }

    unlockRifle() {
        if (!this.hasRifle) {
            const rifle = new Weapon('Rifle', 22, 15.0, 0x2F4F4F);

            rifle.cooldown = 0.15; // Fast fire rate
            rifle.maxAmmo = 30;
            rifle.currentAmmo = 30;
            rifle.reloadTime = 2.0;

            this.weapons[5] = rifle;
            this.hasRifle = true;

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
            const bomb = new Weapon('Bomb', 120, 5.0, 0xFF4500);

            bomb.cooldown = 1.5; // Grenades take time to throw
            bomb.maxAmmo = 5;
            bomb.currentAmmo = 5;
            bomb.reloadTime = 3.0;
            bomb.explosionRadius = 4.0; // Area of effect damage

            this.weapons[6] = bomb;
            this.hasBomb = true;

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
        if (index >= 0 && index < this.weapons.length && this.weapons[index] !== null) {
            // Remove current weapon
            if (this.currentWeapon) {
                this.currentWeapon.detach();
            }

            // Switch to new weapon
            this.currentWeaponIndex = index;
            this.currentWeapon = this.weapons[index];
            this.currentWeapon.attachTo(this.rightArm);

            // Update UI (weapon text + slot highlight)
            if (this.isHudOwner) {
                this.updateAmmoUI();
                document.querySelectorAll('.weapon-slot').forEach(slot => slot.classList.remove('active'));
                const slot = document.querySelector(`[data-weapon="${index}"]`);
                if (slot) slot.classList.add('active');
            }
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
        if (this.health <= 0) return;
        if (this.attackCooldown > 0 || !this.currentWeapon || this.currentWeapon.isReloading) return;

        // Check if weapon needs ammo and is out
        if (this.currentWeapon.maxAmmo !== null && this.currentWeapon.currentAmmo <= 0) {
            this.reloadWeapon();
            return;
        }

        this.isAttacking = true;
        this.attackCooldown = this.currentWeapon.cooldown;

        const weaponName = this.currentWeapon.name;

        if (weaponName === 'Bomb' && gameInstance) {
            if (this.currentWeapon.currentAmmo !== null) {
                this.currentWeapon.currentAmmo--;
                this.updateAmmoUI();
            }

            this.throwBomb(gameInstance);
            this.performThrowAnimation();
            if (this.isPlayer && window.Sound) window.Sound.swing();
        }
        // Ranged weapons shoot a projectile instead of melee
        else if ((weaponName === 'Crossbow' || weaponName === 'Rifle') && gameInstance) {
            if (this.currentWeapon.currentAmmo !== null) {
                this.currentWeapon.currentAmmo--;
                this.updateAmmoUI();
            }

            this.shootArrow(gameInstance);

            if (weaponName === 'Rifle') {
                this.performRifleAnimation();
            } else {
                this.performCrossbowAnimation();
            }
            if (this.isPlayer && window.Sound) window.Sound.shoot();
        } else {
            // Melee attack animation; the hit lands mid-swing via meleeHitPending
            this.performMeleeAnimation();
            if (this.isPlayer && window.Sound) window.Sound.swing();
        }
    }

    reloadWeapon() {
        if (!this.currentWeapon) return;
        if (this.currentWeapon.isReloading || this.currentWeapon.maxAmmo === null) return;
        if (this.currentWeapon.currentAmmo >= this.currentWeapon.maxAmmo) return;

        this.currentWeapon.isReloading = true;
        this.currentWeapon.reloadProgress = 0;

        if (this.isPlayer) {
            this.updateAmmoUI();
            if (window.Sound) window.Sound.reload();
        }
    }

    updateAmmoUI() {
        if (!this.isHudOwner || !this.currentWeapon) return;
        const weaponText = document.getElementById('currentWeapon');
        if (!weaponText) return;

        if (this.currentWeapon.maxAmmo !== null) {
            weaponText.textContent = this.currentWeapon.isReloading
                ? `${this.currentWeapon.name} (Reloading...)`
                : `${this.currentWeapon.name} (${this.currentWeapon.currentAmmo}/${this.currentWeapon.maxAmmo})`;
        } else {
            weaponText.textContent = this.currentWeapon.name;
        }
    }

    updateHealthUI() {
        if (!this.isHudOwner) return;

        const healthValue = document.getElementById('healthValue');
        if (healthValue) {
            healthValue.textContent = `${Math.max(0, Math.ceil(this.health))}/${this.maxHealth}`;
        }

        const bar = document.getElementById('healthBarInner');
        if (bar) {
            const pct = Math.max(0, this.health / this.maxHealth);
            bar.style.width = (pct * 100) + '%';
            bar.style.background = pct > 0.6 ? '#4CAF50' : (pct > 0.3 ? '#FFC107' : '#F44336');
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

            // This is the moment the swing connects - Game3D resolves the hit
            this.meleeHitPending = true;

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

    getShootDirection(gameInstance) {
        // AI characters aim straight at their target (lookAt points the model's
        // +Z at the target, so deriving the direction from the facing would
        // fire backwards). A bit of spread keeps them beatable.
        if (!this.isPlayer && this.aiTarget && this.aiTarget.health > 0) {
            const direction = new THREE.Vector3()
                .subVectors(this.aiTarget.group.position, this.group.position);
            direction.y = 0;
            direction.normalize();
            direction.x += (Math.random() - 0.5) * 0.12;
            direction.z += (Math.random() - 0.5) * 0.12;
            direction.y = 0.02 + (Math.random() - 0.5) * 0.04;
            return direction.normalize();
        }

        // Players shoot where they're facing
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.group.quaternion);
        direction.normalize();

        // Apply the camera pitch so aiming up/down works
        if (this.isPlayer && gameInstance && gameInstance.camera) {
            direction.y = Math.tan(gameInstance.camera.rotation.x);
        }

        // Slight upward arc to compensate for gravity (rifles shoot flatter)
        direction.y += (this.currentWeapon && this.currentWeapon.name === 'Rifle') ? 0.01 : 0.04;
        return direction.normalize();
    }

    shootArrow(gameInstance) {
        const direction = this.getShootDirection(gameInstance);
        const arrow = new Arrow(this.scene, this.group.position.clone(), direction, this);
        gameInstance.arrows.push(arrow);
    }

    throwBomb(gameInstance) {
        const direction = this.getShootDirection(gameInstance);

        // Bombs are lobbed in a high arc
        direction.y += 0.4;
        direction.normalize();

        const bomb = new Bomb(this.scene, this.group.position.clone(), direction, this);
        gameInstance.bombs.push(bomb);
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
        if (this.health <= 0) return; // Already down

        this.health = Math.max(0, this.health - amount);

        if (this.isPlayer) {
            if (window.Sound) window.Sound.playerHurt();
            this.updateHealthUI();

            // Red vignette flash so getting hit is obvious
            if (this.isHudOwner) {
                const overlay = document.getElementById('damageOverlay');
                if (overlay) {
                    overlay.style.opacity = '0.55';
                    clearTimeout(this.vignetteTimer);
                    this.vignetteTimer = setTimeout(() => { overlay.style.opacity = '0'; }, 150);
                }
            }
        } else if (this.healthBar) {
            const healthPercent = this.health / this.maxHealth;
            this.healthBar.scale.x = Math.max(0.001, healthPercent);
            this.healthBar.position.x = (healthPercent - 1) * 0.5;

            // Change color based on health
            if (healthPercent > 0.6) {
                this.healthBar.material.color.setHex(0x00ff00);
            } else if (healthPercent > 0.3) {
                this.healthBar.material.color.setHex(0xffff00);
            } else {
                this.healthBar.material.color.setHex(0xff0000);
            }
        }

        // Death or conversion
        if (this.health <= 0) {
            // Neutral tanks get converted instead of dying
            if (this.isNeutral) {
                this.convertToAlly();
            } else {
                this.die();
            }
            return;
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
        // Don't stack flashes - overlapping hits would capture red as the
        // "original" color and leave the figure permanently red
        if (this.isFlashing) return;
        this.isFlashing = true;

        // Flash red briefly
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
            // Restore the faction color and pose
            this.head.material.color.setHex(this.baseColor);
            this.body.material.color.setHex(this.baseColor);

            this.body.rotation.x = originalBodyRotX;
            this.body.rotation.z = originalBodyRotZ;
            this.leftArm.rotation.x = originalLeftArmRotX;
            this.rightArm.rotation.x = originalRightArmRotX;
            this.head.rotation.x = originalHeadRotX;
            this.isFlashing = false;
        }, 150);
    }

    die() {
        // Store death position for coin drop
        this.deathPosition = this.group.position.clone();

        if (!this.isPlayer && window.Sound) window.Sound.enemyDie();

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
            } else if (!this.isPlayer) {
                // Remove the body after a moment. The player group stays -
                // the camera is parented to it and must remain valid.
                setTimeout(() => {
                    this.scene.remove(this.group);
                }, 1000);
            }
        };

        deathAnimation();
    }

    update(deltaTime, cameraPosition) {
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
                    this.updateAmmoUI();
                }
            }
        }

        // Dead characters are owned by the death animation - don't fight it
        if (this.health <= 0) return;

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

        // Make health bar face the camera (for enemies)
        if (this.healthBarGroup && cameraPosition) {
            this.healthBarGroup.lookAt(cameraPosition);
        }

        this.isWalking = false;
    }
}