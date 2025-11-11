class Bomb {
    constructor(scene, startPos, direction, owner) {
        this.scene = scene;
        this.owner = owner;
        this.speed = 12;
        this.damage = owner.currentWeapon ? owner.currentWeapon.damage : 500;
        this.explosionRadius = owner.currentWeapon ? owner.currentWeapon.explosionRadius : 4.0;
        this.alive = true;
        this.distanceTraveled = 0;
        this.maxDistance = 30;
        this.hasExploded = false;

        // Create bomb mesh
        this.group = new THREE.Group();

        // Main bomb body - spherical
        const bodyGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        this.group.add(body);

        // Fuse - thin cylinder (sparking)
        const fuseGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.1, 6);
        const fuseMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
        const fuse = new THREE.Mesh(fuseGeometry, fuseMaterial);
        fuse.position.y = 0.2;
        fuse.castShadow = true;
        this.group.add(fuse);

        // Fuse spark - glowing tip
        const sparkGeometry = new THREE.SphereGeometry(0.025, 8, 8);
        const sparkMaterial = new THREE.MeshBasicMaterial({ color: 0xFF4500 });
        this.spark = new THREE.Mesh(sparkGeometry, sparkMaterial);
        this.spark.position.y = 0.25;
        this.group.add(this.spark);

        // Danger stripes - orange bands
        const stripeGeometry = new THREE.TorusGeometry(0.15, 0.02, 8, 24);
        const stripeMaterial = new THREE.MeshLambertMaterial({ color: 0xFF4500 });

        const stripe1 = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripe1.rotation.x = Math.PI / 2;
        stripe1.position.y = 0.05;
        this.group.add(stripe1);

        const stripe2 = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripe2.rotation.x = Math.PI / 2;
        stripe2.position.y = -0.05;
        this.group.add(stripe2);

        // Position and orient bomb
        this.group.position.copy(startPos);
        this.group.position.y += 1.5; // Throw from chest height

        // Set direction (bombs arc through the air)
        this.direction = direction.normalize();
        this.direction.y += 0.3; // Initial upward arc

        this.scene.add(this.group);

        // Rotation for visual effect
        this.rotationSpeed = new THREE.Vector3(
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5
        );

        // Fuse timer - sparking effect
        this.fuseTime = 0;
    }

    update(deltaTime) {
        if (!this.alive) return;

        // Move bomb
        const movement = this.direction.clone().multiplyScalar(this.speed * deltaTime);
        this.group.position.add(movement);
        this.distanceTraveled += movement.length();

        // Apply strong gravity (grenades drop fast)
        this.direction.y -= 1.2 * deltaTime;

        // Spin bomb for visual effect
        this.group.rotation.x += this.rotationSpeed.x * deltaTime;
        this.group.rotation.y += this.rotationSpeed.y * deltaTime;
        this.group.rotation.z += this.rotationSpeed.z * deltaTime;

        // Fuse sparking effect
        this.fuseTime += deltaTime * 10;
        const sparkIntensity = 0.5 + Math.sin(this.fuseTime) * 0.5;
        this.spark.scale.set(sparkIntensity, sparkIntensity, sparkIntensity);

        // Explode if hit ground or traveled too far
        if (this.group.position.y < 0.2 || this.distanceTraveled > this.maxDistance) {
            this.explode();
        }
    }

    explode() {
        if (this.hasExploded) return;
        this.hasExploded = true;
        this.alive = false;

        console.log('💣 BOMB EXPLODING at position:', this.group.position);

        // Create explosion effect
        this.createExplosion();

        // Remove bomb mesh
        this.scene.remove(this.group);
    }

    createExplosion() {
        // Create large explosion sphere
        const explosionGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const explosionMaterial = new THREE.MeshBasicMaterial({
            color: 0xFF4500,
            transparent: true,
            opacity: 1.0
        });
        const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
        explosion.position.copy(this.group.position);
        this.scene.add(explosion);

        // Animate explosion
        let explosionProgress = 0;
        const explosionDuration = 0.8;
        const maxScale = this.explosionRadius * 1.5;

        const animateExplosion = () => {
            explosionProgress += 0.016; // ~60fps

            if (explosionProgress < explosionDuration) {
                const progress = explosionProgress / explosionDuration;

                // Grow then shrink
                let scale;
                if (progress < 0.3) {
                    scale = (progress / 0.3) * maxScale;
                } else {
                    scale = maxScale * (1 - ((progress - 0.3) / 0.7));
                }

                explosion.scale.set(scale, scale, scale);

                // Fade out
                explosion.material.opacity = 1 - progress;

                // Color transition from orange to yellow to white
                if (progress < 0.2) {
                    explosion.material.color.setHex(0xFF4500); // Orange-red
                } else if (progress < 0.4) {
                    explosion.material.color.setHex(0xFF8C00); // Dark orange
                } else if (progress < 0.6) {
                    explosion.material.color.setHex(0xFFFF00); // Yellow
                } else {
                    explosion.material.color.setHex(0xFFFFFF); // White (fade)
                }

                requestAnimationFrame(animateExplosion);
            } else {
                this.scene.remove(explosion);
            }
        };

        animateExplosion();

        // Create particle burst
        this.createExplosionParticles();
    }

    createExplosionParticles() {
        const particleCount = 30;
        const particles = [];

        for (let i = 0; i < particleCount; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: Math.random() > 0.5 ? 0xFF4500 : 0xFFFF00
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);

            particle.position.copy(this.group.position);

            // Random velocity in all directions
            particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 10,
                Math.random() * 8,
                (Math.random() - 0.5) * 10
            );

            particle.life = 0;
            particle.maxLife = 0.5 + Math.random() * 0.5;

            this.scene.add(particle);
            particles.push(particle);
        }

        // Animate particles
        const animateParticles = () => {
            let anyAlive = false;

            particles.forEach(particle => {
                if (particle.life < particle.maxLife) {
                    anyAlive = true;
                    particle.life += 0.016;

                    // Move particle
                    particle.position.x += particle.velocity.x * 0.016;
                    particle.position.y += particle.velocity.y * 0.016;
                    particle.position.z += particle.velocity.z * 0.016;

                    // Apply gravity
                    particle.velocity.y -= 15 * 0.016;

                    // Fade out
                    const lifePercent = particle.life / particle.maxLife;
                    particle.material.opacity = 1 - lifePercent;
                    particle.material.transparent = true;

                    // Shrink
                    const scale = 1 - lifePercent * 0.5;
                    particle.scale.set(scale, scale, scale);
                }
            });

            if (anyAlive) {
                requestAnimationFrame(animateParticles);
            } else {
                // Clean up particles
                particles.forEach(p => this.scene.remove(p));
            }
        };

        animateParticles();
    }

    checkCollision(targets) {
        if (!this.alive || this.hasExploded) return null;

        for (let target of targets) {
            if (target === this.owner || target.health <= 0) continue;

            // Check if bomb is close to target
            const dx = this.group.position.x - target.group.position.x;
            const dz = this.group.position.z - target.group.position.z;
            const horizontalDist = Math.sqrt(dx * dx + dz * dz);

            const arrowHeight = this.group.position.y;
            const validHeight = arrowHeight > 0.2 && arrowHeight < 2.5;

            // If bomb hits target directly, explode
            if (horizontalDist < 1.0 && validHeight) {
                console.log('💥 Bomb hit target directly! Exploding...');
                this.explode();
                return { target, damage: this.damage, isExplosion: true };
            }
        }

        return null;
    }

    // Check explosion damage (called after exploding)
    checkExplosionDamage(targets) {
        if (!this.hasExploded) return [];

        const hitTargets = [];

        targets.forEach(target => {
            if (target === this.owner || target.health <= 0) return;

            // Calculate distance from explosion center
            const dx = this.group.position.x - target.group.position.x;
            const dz = this.group.position.z - target.group.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);

            // If within explosion radius, apply damage
            if (distance < this.explosionRadius) {
                // Damage falls off with distance
                const damageMultiplier = 1 - (distance / this.explosionRadius);
                const explosionDamage = Math.floor(this.damage * damageMultiplier);

                console.log(`💥 Explosion hit ${target.characterType} at distance ${distance.toFixed(2)}, damage: ${explosionDamage}`);

                hitTargets.push({ target, damage: explosionDamage });
            }
        });

        return hitTargets;
    }

    remove() {
        this.alive = false;
        if (!this.hasExploded) {
            this.scene.remove(this.group);
        }
    }
}
