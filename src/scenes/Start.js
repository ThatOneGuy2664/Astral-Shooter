export class Start extends Phaser.Scene {
    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('background', 'assets/space.png');

        // Load assets
        this.load.spritesheet('ship', 'assets/spaceship.png', { frameWidth: 176, frameHeight: 96 });
        this.load.spritesheet('enemy', 'assets/enemy.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('explosion', 'assets/explosion.png', { frameWidth: 112, frameHeight: 128 });
        this.load.audio('explosionSound', 'assets/explosionSound.wav');
    }

    create() {
        // Create scrolling background
        this.background = this.add.tileSprite(640, 360, 1280, 720, 'background');

        // Add player's ship using physics
        this.ship = this.physics.add.sprite(640, 360, 'ship');

        // Create ship animation
        this.anims.create({
            key: 'fly',
            frames: this.anims.generateFrameNumbers('ship', { start: 0, end: 2 }),
            frameRate: 15,
            repeat: -1
        });

        // Create enemy animation
        this.anims.create({
            key: 'enemyFly',
            frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });

        // Create explosion animation with auto-hide
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 8 }),
            frameRate: 3,
            repeat: 0,
            hideOnComplete: true
        });

        // Play ship animation and add a tween for up/down movement
        this.ship.play('fly');
        this.shipTween = this.tweens.add({
            targets: this.ship,
            duration: 1500,
            ease: 'Sine.inOut',
            yoyo: true,
            loop: -1
        });

        // Add keyboard input
        this.cursors = this.input.keyboard.createCursorKeys();

        // Create a physics-enabled group for enemies
        this.enemies = this.physics.add.group();

        // Set up a single collider between the ship and the enemy group
        this.physics.add.collider(this.ship, this.enemies, this.handleCollision, null, this);

        // Spawn enemies periodically
        this.time.addEvent({
            delay: 1000, // Every second
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        // Flag to disable movement upon collision
        this.isGameOver = false;
    }

    update() {
        // If the game is over, don't process movement updates
        if (this.isGameOver) return;

        // Scroll background to create movement illusion
        this.background.tilePositionX += 1;

        // Ship movement with arrow keys or WASD, with screen boundary limits
        if (this.cursors.left.isDown || this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A).isDown) {
            if (this.ship.x > 88) {
                this.ship.x -= 5;
            }
        } else if (this.cursors.right.isDown || this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D).isDown) {
            if (this.ship.x < 1192) {
                this.ship.x += 5;
            }
        }

        if (this.cursors.up.isDown || this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W).isDown) {
            if (this.ship.y > 48) {
                this.ship.y -= 5;
            }
        } else if (this.cursors.down.isDown || this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S).isDown) {
            if (this.ship.y < 672) {
                this.ship.y += 5;
            }
        }
    }

    spawnEnemy() {
        // Randomly generate enemy Y position within screen bounds
        const x = Phaser.Math.Between(1200, 1280); // Spawn from the right side of the screen
        const y = Phaser.Math.Between(50, 670);

        // Create enemy using the physics-enabled group (automatically gets a physics body)
        const enemy = this.enemies.create(x, y, 'enemy');
        
        // Play enemy animation and flip horizontally so it faces the ship
        enemy.play('enemyFly');
        enemy.setFlipX(true);

        // Move enemy towards the left of the screen
        this.tweens.add({
            targets: enemy,
            x: -50,
            duration: 4000,
            ease: 'Linear',
            onComplete: () => enemy.destroy() // Remove enemy when it moves off-screen
        });
    }

    handleCollision(ship, enemy) {
        enemy.destroy(); // Remove enemy upon collision

        // Kill the ship's tween so it stops moving
        this.tweens.killTweensOf(this.ship);
        
        // Stop any physics-based movement
        this.ship.body.setVelocity(0, 0);
        
        // Create explosion without stopping its animation
        this.createExplosion(ship.x, ship.y);
    }

    createExplosion(x, y) {
        if (!this.isGameOver) {
            this.isGameOver = true;
            let explosion = this.add.sprite(x, y, 'explosion');
            explosion.play('explode');
            this.sound.play('explosionSound'); // Play explosion sound

            explosion.on('animationcomplete', () => {
                explosion.destroy(); // Remove explosion after playing
                this.resetGame();
            });
        }
    }

    resetGame() {
        location.reload();
    }
}
