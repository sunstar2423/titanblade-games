class Environment {
    constructor(scene) {
        this.scene = scene;
        this.trees = [];
        this.rocks = [];
        this.bushes = [];
        this.walls = [];
    }

    createForest() {
        this.createTrees(20); // Create 20 trees
        this.createRocks(8);  // Create 8 rocks
        this.createBushes(12); // Create 12 bushes
        // this.createWalls(); // Create boundary walls - DISABLED
    }

    createTrees(count) {
        for (let i = 0; i < count; i++) {
            const tree = this.createTree();

            // Random position, but not too close to center (0,0)
            let x, z;
            do {
                x = (Math.random() - 0.5) * 80;
                z = (Math.random() - 0.5) * 80;
            } while (Math.sqrt(x*x + z*z) < 5); // Keep trees away from center

            tree.position.set(x, 0, z);
            tree.userData = { type: 'tree', radius: 2.5 }; // For collision detection
            this.trees.push(tree);
            this.scene.add(tree);
        }
    }

    createTree() {
        const tree = new THREE.Group();

        // Tree trunk with slight randomness
        const trunkHeight = 4 + Math.random() * 2;
        const trunkRadius = 0.3 + Math.random() * 0.2;
        const trunkGeometry = new THREE.CylinderGeometry(trunkRadius * 0.8, trunkRadius, trunkHeight, 8);
        const trunkMaterial = new THREE.MeshLambertMaterial({
            color: new THREE.Color().setHSL(0.08, 0.6, 0.3 + Math.random() * 0.2)
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = trunkHeight / 2;
        trunk.castShadow = true;
        tree.add(trunk);

        // Tree leaves with variation
        const leafColor = new THREE.Color().setHSL(0.3, 0.8, 0.3 + Math.random() * 0.3);
        const leafMaterial = new THREE.MeshLambertMaterial({ color: leafColor });

        // Main canopy
        const canopySize = 2.5 + Math.random() * 1.5;
        const canopyGeometry = new THREE.SphereGeometry(canopySize, 8, 8);
        const canopy = new THREE.Mesh(canopyGeometry, leafMaterial);
        canopy.position.y = trunkHeight + canopySize * 0.7;
        canopy.castShadow = true;
        tree.add(canopy);

        // Additional leaf clusters for more natural look
        const clusterCount = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < clusterCount; i++) {
            const clusterSize = canopySize * (0.4 + Math.random() * 0.4);
            const clusterGeometry = new THREE.SphereGeometry(clusterSize, 6, 6);
            const cluster = new THREE.Mesh(clusterGeometry, leafMaterial);

            const angle = (Math.PI * 2 * i) / clusterCount + Math.random() * 0.5;
            const distance = canopySize * 0.6;
            cluster.position.set(
                Math.cos(angle) * distance,
                trunkHeight + canopySize * 0.5 + Math.random() * canopySize * 0.5,
                Math.sin(angle) * distance
            );
            cluster.castShadow = true;
            tree.add(cluster);
        }

        return tree;
    }

    createRocks(count) {
        for (let i = 0; i < count; i++) {
            const rock = this.createRock();

            // Random position
            let x, z;
            do {
                x = (Math.random() - 0.5) * 60;
                z = (Math.random() - 0.5) * 60;
            } while (Math.sqrt(x*x + z*z) < 3);

            rock.position.set(x, 0, z);
            rock.userData = { type: 'rock', radius: 1.5 };
            this.rocks.push(rock);
            this.scene.add(rock);
        }
    }

    createRock() {
        const rock = new THREE.Group();

        // Create irregular rock shape using multiple spheres
        const rockColor = new THREE.Color().setHSL(0, 0, 0.4 + Math.random() * 0.3);
        const rockMaterial = new THREE.MeshLambertMaterial({ color: rockColor });

        const mainSize = 1 + Math.random() * 0.8;
        const mainGeometry = new THREE.SphereGeometry(mainSize, 6, 6);
        const mainRock = new THREE.Mesh(mainGeometry, rockMaterial);
        mainRock.scale.set(1, 0.6 + Math.random() * 0.4, 1.2 + Math.random() * 0.5);
        mainRock.position.y = mainSize * 0.5;
        mainRock.castShadow = true;
        rock.add(mainRock);

        // Add smaller rock pieces
        for (let i = 0; i < 2 + Math.floor(Math.random() * 3); i++) {
            const pieceSize = mainSize * (0.3 + Math.random() * 0.4);
            const pieceGeometry = new THREE.SphereGeometry(pieceSize, 6, 6);
            const piece = new THREE.Mesh(pieceGeometry, rockMaterial);

            const angle = Math.random() * Math.PI * 2;
            const distance = mainSize * 0.8;
            piece.position.set(
                Math.cos(angle) * distance,
                pieceSize * 0.5,
                Math.sin(angle) * distance
            );
            piece.scale.set(
                0.8 + Math.random() * 0.4,
                0.5 + Math.random() * 0.3,
                0.8 + Math.random() * 0.4
            );
            piece.castShadow = true;
            rock.add(piece);
        }

        return rock;
    }

    createBushes(count) {
        for (let i = 0; i < count; i++) {
            const bush = this.createBush();

            // Random position
            let x, z;
            do {
                x = (Math.random() - 0.5) * 70;
                z = (Math.random() - 0.5) * 70;
            } while (Math.sqrt(x*x + z*z) < 2);

            bush.position.set(x, 0, z);
            bush.userData = { type: 'bush', radius: 1.2 };
            this.bushes.push(bush);
            this.scene.add(bush);
        }
    }

    createBush() {
        const bush = new THREE.Group();

        // Bush leaves (darker green than trees)
        const bushColor = new THREE.Color().setHSL(0.25, 0.9, 0.25 + Math.random() * 0.2);
        const bushMaterial = new THREE.MeshLambertMaterial({ color: bushColor });

        // Main bush body
        const bushSize = 0.8 + Math.random() * 0.6;
        const bushGeometry = new THREE.SphereGeometry(bushSize, 8, 8);
        const mainBush = new THREE.Mesh(bushGeometry, bushMaterial);
        mainBush.scale.set(1.2 + Math.random() * 0.4, 0.8, 1 + Math.random() * 0.3);
        mainBush.position.y = bushSize * 0.7;
        mainBush.castShadow = true;
        bush.add(mainBush);

        // Additional bush clusters
        for (let i = 0; i < 1 + Math.floor(Math.random() * 3); i++) {
            const clusterSize = bushSize * (0.5 + Math.random() * 0.4);
            const clusterGeometry = new THREE.SphereGeometry(clusterSize, 6, 6);
            const cluster = new THREE.Mesh(clusterGeometry, bushMaterial);

            const angle = Math.random() * Math.PI * 2;
            const distance = bushSize * 0.8;
            cluster.position.set(
                Math.cos(angle) * distance,
                clusterSize * 0.6,
                Math.sin(angle) * distance
            );
            cluster.castShadow = true;
            bush.add(cluster);
        }

        return bush;
    }

    createWalls() {
        const wallSize = 50; // Size of the arena
        const wallHeight = 5;
        const wallThickness = 1;

        // Stone wall material
        const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x8B7355 });

        // Create 4 walls
        const wallConfigs = [
            { x: 0, z: wallSize / 2, width: wallSize, depth: wallThickness }, // North
            { x: 0, z: -wallSize / 2, width: wallSize, depth: wallThickness }, // South
            { x: wallSize / 2, z: 0, width: wallThickness, depth: wallSize }, // East
            { x: -wallSize / 2, z: 0, width: wallThickness, depth: wallSize } // West
        ];

        wallConfigs.forEach((config, index) => {
            const wall = this.createWall(config.width, wallHeight, config.depth, wallMaterial);
            wall.position.set(config.x, wallHeight / 2, config.z);
            wall.userData = { type: 'wall', isWall: true };
            this.walls.push(wall);
            this.scene.add(wall);
        });
    }

    createWall(width, height, depth, material) {
        const wall = new THREE.Group();

        // Main wall structure
        const wallGeometry = new THREE.BoxGeometry(width, height, depth);
        const wallMesh = new THREE.Mesh(wallGeometry, material);
        wallMesh.castShadow = true;
        wallMesh.receiveShadow = true;
        wall.add(wallMesh);

        // Add stone brick texture with segments
        const brickWidth = 2;
        const brickHeight = 0.5;
        const darkMaterial = new THREE.MeshLambertMaterial({ color: 0x6B5A45 });

        // Horizontal lines (mortar)
        for (let y = -height / 2; y < height / 2; y += brickHeight) {
            const lineGeometry = new THREE.BoxGeometry(width + 0.1, 0.05, depth + 0.1);
            const line = new THREE.Mesh(lineGeometry, darkMaterial);
            line.position.y = y;
            wall.add(line);
        }

        // Vertical lines (mortar) - only on the longer dimension
        const segments = Math.floor(Math.max(width, depth) / brickWidth);
        const isHorizontalWall = width > depth;

        for (let i = 0; i <= segments; i++) {
            const lineGeometry = isHorizontalWall
                ? new THREE.BoxGeometry(0.05, height + 0.1, depth + 0.1)
                : new THREE.BoxGeometry(width + 0.1, height + 0.1, 0.05);
            const line = new THREE.Mesh(lineGeometry, darkMaterial);

            if (isHorizontalWall) {
                line.position.x = -width / 2 + (i * brickWidth);
            } else {
                line.position.z = -depth / 2 + (i * brickWidth);
            }
            wall.add(line);
        }

        return wall;
    }

    checkCollision(position, radius = 1) {
        const allObjects = [...this.trees, ...this.rocks, ...this.bushes];

        for (let obj of allObjects) {
            const distance = Math.sqrt(
                Math.pow(position.x - obj.position.x, 2) +
                Math.pow(position.z - obj.position.z, 2)
            );

            const collisionRadius = (obj.userData.radius || 1) + radius;
            if (distance < collisionRadius) {
                return true;
            }
        }

        // Wall collisions disabled
        // const wallBoundary = 25; // Half of wall size
        // if (Math.abs(position.x) > wallBoundary - radius || Math.abs(position.z) > wallBoundary - radius) {
        //     return true;
        // }

        return false;
    }

    getCollidableObjects() {
        return [...this.trees, ...this.rocks, ...this.bushes, ...this.walls];
    }

    // Add wind effect to trees
    addWindEffect() {
        const windStrength = 0.02;
        const time = Date.now() * 0.001;

        this.trees.forEach((tree, index) => {
            const windOffset = Math.sin(time + index * 0.5) * windStrength;
            tree.rotation.z = windOffset;

            // Sway leaves slightly
            tree.children.forEach((child, childIndex) => {
                if (childIndex > 0) { // Skip trunk
                    child.rotation.z = windOffset * 1.5;
                }
            });
        });

        this.bushes.forEach((bush, index) => {
            const windOffset = Math.sin(time + index * 0.7) * windStrength * 0.5;
            bush.rotation.z = windOffset;
        });
    }
}