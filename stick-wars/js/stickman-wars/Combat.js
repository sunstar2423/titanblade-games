class Combat {
    static calculateDamage(attacker, weapon) {
        // Weapon damage scaled by the attacker's multiplier (character type +
        // wave scaling), with a little randomness
        const baseDamage = weapon.damage * (attacker.damageMultiplier || 1);
        const randomFactor = 0.85 + Math.random() * 0.3; // 85% to 115% damage

        return Math.max(1, Math.floor(baseDamage * randomFactor));
    }

    static isInRange(attacker, target, weapon) {
        const distance = attacker.group.position.distanceTo(target.group.position);
        return distance <= weapon.range;
    }

    static createHitEffect(scene, position) {
        // Create particle effect for weapon hits
        const particleCount = 10;
        const particles = new THREE.Group();

        for (let i = 0; i < particleCount; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.02, 4, 4);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(Math.random(), 1, 0.5)
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);

            particle.position.copy(position);
            particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                Math.random() * 2,
                (Math.random() - 0.5) * 2
            );

            particles.add(particle);
        }

        scene.add(particles);

        // Animate particles
        const animateParticles = () => {
            particles.children.forEach((particle, index) => {
                particle.position.add(particle.velocity.clone().multiplyScalar(0.02));
                particle.velocity.y -= 0.01; // gravity
                particle.material.opacity -= 0.02;

                if (particle.material.opacity <= 0) {
                    particles.remove(particle);
                }
            });

            if (particles.children.length > 0) {
                requestAnimationFrame(animateParticles);
            } else {
                scene.remove(particles);
            }
        };

        animateParticles();
    }

    static createBloodEffect(scene, position) {
        // Create blood particle effect
        const particleCount = 15;
        const particles = new THREE.Group();

        for (let i = 0; i < particleCount; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.01, 4, 4);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: 0x880000
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);

            particle.position.copy(position);
            particle.position.y += 1; // Blood from torso height

            particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 1.5,
                Math.random() * 1.5,
                (Math.random() - 0.5) * 1.5
            );

            particles.add(particle);
        }

        scene.add(particles);

        // Animate blood particles
        const animateBlood = () => {
            particles.children.forEach((particle) => {
                particle.position.add(particle.velocity.clone().multiplyScalar(0.03));
                particle.velocity.y -= 0.02; // gravity
                particle.material.opacity -= 0.015;

                if (particle.material.opacity <= 0) {
                    particles.remove(particle);
                }
            });

            if (particles.children.length > 0) {
                requestAnimationFrame(animateBlood);
            } else {
                scene.remove(particles);
            }
        };

        animateBlood();
    }

    static showDamageNumber(scene, position, damage) {
        // Create floating damage number (simplified version)
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 128;
        canvas.height = 64;

        context.font = 'Bold 32px Arial';
        context.fillStyle = 'red';
        context.textAlign = 'center';
        context.fillText(damage.toString(), 64, 40);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);

        sprite.position.copy(position);
        sprite.position.y += 2;
        sprite.scale.set(0.5, 0.25, 1);

        scene.add(sprite);

        // Animate damage number
        let opacity = 1;
        const animateDamageNumber = () => {
            sprite.position.y += 0.02;
            opacity -= 0.02;
            sprite.material.opacity = opacity;

            if (opacity > 0) {
                requestAnimationFrame(animateDamageNumber);
            } else {
                scene.remove(sprite);
                texture.dispose();
                material.dispose();
            }
        };

        animateDamageNumber();
    }

    static handleWeaponCollision(attacker, targets, scene) {
        if (!attacker.isAttacking || !attacker.currentWeapon) {
            return [];
        }

        const hits = [];

        targets.forEach(target => {
            if (target.health > 0 && this.isInRange(attacker, target, attacker.currentWeapon)) {
                const damage = this.calculateDamage(attacker, attacker.currentWeapon);

                target.takeDamage(damage);

                // Visual effects
                this.createHitEffect(scene, target.group.position.clone());
                this.createBloodEffect(scene, target.group.position.clone());
                this.showDamageNumber(scene, target.group.position.clone(), damage);

                hits.push({
                    attacker: attacker,
                    target: target,
                    damage: damage,
                    weapon: attacker.currentWeapon
                });
            }
        });

        return hits;
    }

    static checkAllCombat(scene, players, enemies) {
        const allHits = [];

        // Players attacking enemies
        players.forEach(player => {
            const hits = this.handleWeaponCollision(player, enemies, scene);
            allHits.push(...hits);
        });

        // Enemies attacking players
        enemies.forEach(enemy => {
            const hits = this.handleWeaponCollision(enemy, players, scene);
            allHits.push(...hits);
        });

        return allHits;
    }
}