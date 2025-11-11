class Arrow {
    constructor(scene, startPos, direction, owner) {
        this.scene = scene;
        this.owner = owner;
        this.speed = 20;
        // Use the owner's current weapon damage
        this.damage = owner.currentWeapon ? owner.currentWeapon.damage : 10;
        this.alive = true;
        this.distanceTraveled = 0;
        this.maxDistance = 50;

        // Create arrow mesh
        this.group = new THREE.Group();

        // Arrow shaft
        const shaftGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6);
        const shaftMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
        shaft.rotation.z = Math.PI / 2;
        shaft.castShadow = true;
        this.group.add(shaft);

        // Arrow tip
        const tipGeometry = new THREE.ConeGeometry(0.03, 0.1, 6);
        const tipMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
        const tip = new THREE.Mesh(tipGeometry, tipMaterial);
        tip.rotation.z = -Math.PI / 2;
        tip.position.x = 0.25;
        tip.castShadow = true;
        this.group.add(tip);

        // Fletching (back of arrow)
        const fletchGeometry = new THREE.ConeGeometry(0.04, 0.08, 4);
        const fletchMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000 });
        const fletch = new THREE.Mesh(fletchGeometry, fletchMaterial);
        fletch.rotation.z = Math.PI / 2;
        fletch.position.x = -0.22;
        this.group.add(fletch);

        // Position and orient arrow
        this.group.position.copy(startPos);
        this.group.position.y += 1.5; // Shoot from chest height

        // Set direction
        this.direction = direction.normalize();

        // Point arrow in direction of travel
        const angle = Math.atan2(this.direction.x, this.direction.z);
        this.group.rotation.y = -angle;

        // Calculate pitch based on direction
        const horizontalDistance = Math.sqrt(this.direction.x * this.direction.x + this.direction.z * this.direction.z);
        const pitch = Math.atan2(this.direction.y, horizontalDistance);
        this.group.rotation.z = -pitch;

        this.scene.add(this.group);
    }

    update(deltaTime) {
        if (!this.alive) return;

        // Move arrow
        const movement = this.direction.clone().multiplyScalar(this.speed * deltaTime);
        this.group.position.add(movement);
        this.distanceTraveled += movement.length();

        // Add gravity effect (slower for more accurate shots)
        this.direction.y -= 0.3 * deltaTime;

        // Update arrow rotation to match trajectory
        const horizontalDistance = Math.sqrt(this.direction.x * this.direction.x + this.direction.z * this.direction.z);
        const pitch = Math.atan2(this.direction.y, horizontalDistance);
        this.group.rotation.z = -pitch;

        // Remove if traveled too far or hit ground (lower threshold)
        if (this.distanceTraveled > this.maxDistance || this.group.position.y < -0.5) {
            this.remove();
        }
    }

    checkCollision(targets) {
        if (!this.alive) return null;

        for (let target of targets) {
            if (target === this.owner || target.health <= 0) continue;

            // Check horizontal distance (x, z)
            const dx = this.group.position.x - target.group.position.x;
            const dz = this.group.position.z - target.group.position.z;
            const horizontalDist = Math.sqrt(dx * dx + dz * dz);

            // Check vertical distance - arrow should be at torso height (0.5 to 2.0)
            const arrowHeight = this.group.position.y;
            const validHeight = arrowHeight > 0.5 && arrowHeight < 2.0;

            // More forgiving hitbox - 1.2 unit horizontal radius
            if (horizontalDist < 1.2 && validHeight) {
                // Hit!
                console.log('Arrow hit target!', 'Distance:', horizontalDist, 'Height:', arrowHeight, 'Damage:', this.damage);
                this.alive = false;
                this.remove();
                return { target, damage: this.damage };
            }
        }

        return null;
    }

    remove() {
        this.alive = false;
        this.scene.remove(this.group);
    }
}
