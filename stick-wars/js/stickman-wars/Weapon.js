class Weapon {
    constructor(name, damage, range, color) {
        this.name = name;
        this.damage = damage;
        this.range = range;
        this.cooldown = 1.0; // seconds between attacks
        this.mesh = null;
        this.attachedTo = null;

        // Ammo system for ranged weapons
        this.maxAmmo = null;
        this.currentAmmo = null;
        this.reloadTime = 2.0; // seconds to reload
        this.isReloading = false;
        this.reloadProgress = 0;

        this.createWeaponMesh(color);
    }

    createWeaponMesh(color) {
        const material = new THREE.MeshLambertMaterial({ color });

        switch(this.name) {
            case 'Sword':
                this.mesh = this.createSword(material);
                break;
            case 'Axe':
                this.mesh = this.createAxe(material);
                break;
            case 'Spear':
                this.mesh = this.createSpear(material);
                break;
            case 'Hammer':
                this.mesh = this.createHammer(material);
                break;
            case 'Bow':
                this.mesh = this.createBow(material);
                break;
            case 'Crossbow':
                this.mesh = this.createCrossbow(material);
                break;
            case 'Pistol':
                this.mesh = this.createPistol(material);
                break;
            case 'Rifle':
                this.mesh = this.createRifle(material);
                break;
            case 'Bomb':
                this.mesh = this.createBomb(material);
                break;
            default:
                this.mesh = this.createSword(material);
        }

        this.mesh.castShadow = true;
    }

    createSword(material) {
        const group = new THREE.Group();

        // Blade
        const bladeGeometry = new THREE.BoxGeometry(0.05, 0.8, 0.02);
        const bladeMaterial = new THREE.MeshLambertMaterial({ color: 0xC0C0C0 });
        const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        blade.position.y = 0.5;
        group.add(blade);

        // Handle
        const handleGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8);
        const handle = new THREE.Mesh(handleGeometry, material);
        handle.position.y = -0.1;
        group.add(handle);

        // Guard
        const guardGeometry = new THREE.BoxGeometry(0.2, 0.02, 0.02);
        const guard = new THREE.Mesh(guardGeometry, material);
        guard.position.y = 0.1;
        group.add(guard);

        return group;
    }

    createAxe(material) {
        const group = new THREE.Group();

        // Handle
        const handleGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8);
        const handle = new THREE.Mesh(handleGeometry, material);
        handle.position.y = 0.2;
        group.add(handle);

        // Axe head
        const headGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.05);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 0.6;
        group.add(head);

        return group;
    }

    createSpear(material) {
        const group = new THREE.Group();

        // Shaft
        const shaftGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8);
        const shaft = new THREE.Mesh(shaftGeometry, material);
        shaft.position.y = 0.3;
        group.add(shaft);

        // Spear head
        const headGeometry = new THREE.ConeGeometry(0.04, 0.3, 6);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.05;
        group.add(head);

        return group;
    }

    createHammer(material) {
        const group = new THREE.Group();

        // Handle
        const handleGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8);
        const handle = new THREE.Mesh(handleGeometry, material);
        handle.position.y = 0.1;
        group.add(handle);

        // Hammer head
        const headGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.25);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0x505050 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 0.6;
        group.add(head);

        return group;
    }

    createBow(material) {
        const group = new THREE.Group();

        // Bow grip (center)
        const gripGeometry = new THREE.CylinderGeometry(0.025, 0.025, 0.15, 8);
        const grip = new THREE.Mesh(gripGeometry, material);
        grip.position.y = 0.3;
        group.add(grip);

        // Upper limb (curved)
        const upperLimbGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.4, 8);
        const upperLimb = new THREE.Mesh(upperLimbGeometry, material);
        upperLimb.position.set(0.08, 0.6, 0);
        upperLimb.rotation.z = -0.4;
        group.add(upperLimb);

        // Lower limb (curved)
        const lowerLimbGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.4, 8);
        const lowerLimb = new THREE.Mesh(lowerLimbGeometry, material);
        lowerLimb.position.set(0.08, 0, 0);
        lowerLimb.rotation.z = 0.4;
        group.add(lowerLimb);

        // Bowstring
        const stringGeometry = new THREE.CylinderGeometry(0.005, 0.005, 0.7, 4);
        const stringMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const bowstring = new THREE.Mesh(stringGeometry, stringMaterial);
        bowstring.position.set(0.13, 0.3, 0);
        group.add(bowstring);

        return group;
    }

    createCrossbow(material) {
        const group = new THREE.Group();

        // Stock (wooden handle) - now in front since weapon is rotated 180
        const stockGeometry = new THREE.BoxGeometry(0.06, 0.06, 0.4);
        const stock = new THREE.Mesh(stockGeometry, material);
        stock.position.set(0, 0, -0.1);
        group.add(stock);

        // Bow arms (horizontal) - now in back since weapon is rotated 180
        const bowArmMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });

        // Left bow arm
        const leftArmGeometry = new THREE.BoxGeometry(0.3, 0.03, 0.04);
        const leftArm = new THREE.Mesh(leftArmGeometry, bowArmMaterial);
        leftArm.position.set(-0.15, 0.1, 0.15);
        group.add(leftArm);

        // Right bow arm
        const rightArmGeometry = new THREE.BoxGeometry(0.3, 0.03, 0.04);
        const rightArm = new THREE.Mesh(rightArmGeometry, bowArmMaterial);
        rightArm.position.set(0.15, 0.1, 0.15);
        group.add(rightArm);

        // Center piece (where bow arms connect)
        const centerGeometry = new THREE.BoxGeometry(0.05, 0.1, 0.08);
        const centerMaterial = new THREE.MeshLambertMaterial({ color: 0x303030 });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        center.position.set(0, 0.08, 0.15);
        group.add(center);

        // Bowstring
        const stringGeometry = new THREE.CylinderGeometry(0.005, 0.005, 0.6, 4);
        const stringMaterial = new THREE.MeshBasicMaterial({ color: 0xCCCCCC });
        const bowstring = new THREE.Mesh(stringGeometry, stringMaterial);
        bowstring.rotation.z = Math.PI / 2;
        bowstring.position.set(0, 0.1, 0.18);
        group.add(bowstring);

        // Trigger mechanism
        const triggerGeometry = new THREE.BoxGeometry(0.03, 0.05, 0.02);
        const trigger = new THREE.Mesh(triggerGeometry, centerMaterial);
        trigger.position.set(0, -0.02, 0);
        group.add(trigger);

        return group;
    }

    createPistol(material) {
        const group = new THREE.Group();

        // Barrel
        const barrelGeometry = new THREE.BoxGeometry(0.04, 0.04, 0.25);
        const barrelMaterial = new THREE.MeshLambertMaterial({ color: 0x303030 });
        const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
        barrel.position.set(0, 0.15, 0);
        group.add(barrel);

        // Grip/Handle
        const gripGeometry = new THREE.BoxGeometry(0.04, 0.15, 0.08);
        const grip = new THREE.Mesh(gripGeometry, material);
        grip.position.set(0, 0, 0.05);
        group.add(grip);

        // Trigger guard
        const triggerGuardGeometry = new THREE.TorusGeometry(0.03, 0.005, 8, 12, Math.PI);
        const triggerGuard = new THREE.Mesh(triggerGuardGeometry, barrelMaterial);
        triggerGuard.rotation.x = Math.PI / 2;
        triggerGuard.position.set(0, 0.05, 0.08);
        group.add(triggerGuard);

        // Slide
        const slideGeometry = new THREE.BoxGeometry(0.05, 0.05, 0.15);
        const slideMaterial = new THREE.MeshLambertMaterial({ color: 0x505050 });
        const slide = new THREE.Mesh(slideGeometry, slideMaterial);
        slide.position.set(0, 0.17, -0.05);
        group.add(slide);

        return group;
    }

    createRifle(material) {
        const group = new THREE.Group();

        // Long barrel
        const barrelGeometry = new THREE.BoxGeometry(0.04, 0.04, 0.5);
        const barrelMaterial = new THREE.MeshLambertMaterial({ color: 0x202020 });
        const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
        barrel.position.set(0, 0.2, -0.15);
        group.add(barrel);

        // Stock (shoulder rest)
        const stockGeometry = new THREE.BoxGeometry(0.06, 0.08, 0.25);
        const stock = new THREE.Mesh(stockGeometry, material);
        stock.position.set(0, 0.15, 0.25);
        group.add(stock);

        // Receiver (main body)
        const receiverGeometry = new THREE.BoxGeometry(0.05, 0.08, 0.3);
        const receiverMaterial = new THREE.MeshLambertMaterial({ color: 0x404040 });
        const receiver = new THREE.Mesh(receiverGeometry, receiverMaterial);
        receiver.position.set(0, 0.18, 0.05);
        group.add(receiver);

        // Magazine
        const magGeometry = new THREE.BoxGeometry(0.04, 0.15, 0.08);
        const magMaterial = new THREE.MeshLambertMaterial({ color: 0x303030 });
        const magazine = new THREE.Mesh(magGeometry, magMaterial);
        magazine.position.set(0, 0.05, 0);
        group.add(magazine);

        // Grip/Handle
        const gripGeometry = new THREE.BoxGeometry(0.04, 0.12, 0.08);
        const grip = new THREE.Mesh(gripGeometry, material);
        grip.position.set(0, 0.06, 0.1);
        group.add(grip);

        // Scope
        const scopeGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.15, 8);
        const scopeMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
        const scope = new THREE.Mesh(scopeGeometry, scopeMaterial);
        scope.rotation.z = Math.PI / 2;
        scope.position.set(0, 0.25, 0);
        group.add(scope);

        // Scope mounts
        const mountGeometry = new THREE.BoxGeometry(0.02, 0.02, 0.02);
        const mount1 = new THREE.Mesh(mountGeometry, scopeMaterial);
        mount1.position.set(0, 0.23, -0.05);
        group.add(mount1);

        const mount2 = new THREE.Mesh(mountGeometry, scopeMaterial);
        mount2.position.set(0, 0.23, 0.05);
        group.add(mount2);

        return group;
    }

    createBomb(material) {
        const group = new THREE.Group();

        // Main bomb body - spherical
        const bodyGeometry = new THREE.SphereGeometry(0.12, 16, 16);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.15;
        group.add(body);

        // Fuse - thin cylinder
        const fuseGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.08, 6);
        const fuseMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
        const fuse = new THREE.Mesh(fuseGeometry, fuseMaterial);
        fuse.position.y = 0.31;
        group.add(fuse);

        // Fuse tip - tiny sphere (sparking part)
        const fuseTipGeometry = new THREE.SphereGeometry(0.015, 8, 8);
        const fuseTipMaterial = new THREE.MeshBasicMaterial({ color: 0xFF4500 });
        const fuseTip = new THREE.Mesh(fuseTipGeometry, fuseTipMaterial);
        fuseTip.position.y = 0.35;
        group.add(fuseTip);

        // Danger stripes - orange bands
        const stripeGeometry = new THREE.TorusGeometry(0.12, 0.015, 8, 24);
        const stripeMaterial = new THREE.MeshLambertMaterial({ color: 0xFF4500 });

        const stripe1 = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripe1.position.y = 0.18;
        stripe1.rotation.x = Math.PI / 2;
        group.add(stripe1);

        const stripe2 = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripe2.position.y = 0.12;
        stripe2.rotation.x = Math.PI / 2;
        group.add(stripe2);

        return group;
    }

    attachTo(parentObject) {
        if (this.attachedTo) {
            this.detach();
        }

        this.attachedTo = parentObject;
        this.attachedTo.add(this.mesh);

        // Position weapon in hand
        this.mesh.position.set(0, -0.3, 0);
        this.mesh.rotation.set(0, 0, Math.PI);
    }

    detach() {
        if (this.attachedTo && this.mesh.parent) {
            this.attachedTo.remove(this.mesh);
        }
        this.attachedTo = null;
    }

    getStats() {
        return {
            name: this.name,
            damage: this.damage,
            range: this.range,
            cooldown: this.cooldown
        };
    }
}