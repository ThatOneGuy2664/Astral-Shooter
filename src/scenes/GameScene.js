export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.image('background', 'assets/space.png');

        // Load assets
        this.load.spritesheet('ship', 'assets/spaceship.png', { frameWidth: 176, frameHeight: 96 });
        this.load.spritesheet('enemy', 'assets/enemy.png', { frameWidth: 106, frameHeight: 77 });
        this.load.spritesheet('explosion', 'assets/explosion.png', { frameWidth: 112, frameHeight: 128 });
        this.load.spritesheet('laser', 'assets/laser.png', { frameWidth: 48, frameHeight: 32 });
        this.load.spritesheet('laserImpact', 'assets/laserImpact.png', { frameWidth: 31, frameHeight: 32 });
        this.load.spritesheet('enemy-fast', 'assets/enemy-fast.png', { frameWidth: 125, frameHeight: 76 });
        this.load.spritesheet('enemyBullet', 'assets/enemyBullet.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('power-up-bullet', 'assets/power-up-bullet.png', { frameWidth: 16, frameHeight: 16, endFrame: 1 });
        this.load.spritesheet('power-up-shield', 'assets/power-up-shield.png', { frameWidth: 16, frameHeight: 16, endFrame: 1 });
        this.load.audio('explosionSound', 'assets/explosionSound.wav');
        this.load.audio('music1', 'assets/music.wav');
        this.load.audio('laserSound', 'assets/laserShot.flac');
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

        // Create enemy animation
        this.anims.create({
            key: 'enemyFly-Fast',
            frames: this.anims.generateFrameNumbers('enemy-fast', { start: 0, end: 3 }),
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

        // Music
        this.music1 = this.sound.add('music1', { volume: 0.5 });
        this.playMusicSequence();

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

        // Hitbox fixes
        this.ship.body.setCircle(40, 48, 12);

        // Laser group
        this.lasers = this.physics.add.group();

        // Enemy laser group
        this.enemyBullets = this.physics.add.group();
        this.physics.add.collider(this.ship, this.enemyBullets, this.handleEnemyBulletCollision, null, this);

        // Create laser animation with auto-hide
        this.anims.create({
            key: 'laserFly',
            frames: this.anims.generateFrameNumbers('laser', { start: 0, end: 3 }),
            frameRate: 30,
            repeat: -1,
            hideOnComplete: false
        });

        // Create laser impact animation with auto-hide
        this.anims.create({
            key: 'laserImpact',
            frames: this.anims.generateFrameNumbers('laserImpact', { start: 0, end: 2 }),
            frameRate: 15,
            repeat: 0,
            hideOnComplete: true
        });

        // Shot cooldown
        this.lastShotTime = 0;
        this.shootCooldown = 1000;

        // Score
        this.score = 0;
        this.scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: '24px', fill: '#fff' });

        // Local highscore
        this.highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;
        this.highScoreText = this.add.text(20, 50, `Local High Score: ${this.highScore}`, { fontSize: '24px', fill: '#fff' });

        // Menu
        this.input.keyboard.on('keydown-ESC', () => {
            if (!this.scene.isPaused('Game')) {
                this.scene.launch('PauseMenu');
                this.scene.pause();
            }
        })

        this.isTouchInput = window.isTouchInput;

        // Add buttons for touch input
        if (this.isTouchInput) {
            this.createTouchControls();
        }

        // Create enemy bullets
        this.anims.create({
            key: 'enemyBulletAnim',
            frames: this.anims.generateFrameNumbers('enemyBullet', { start: 0, end: 1 }),
            frameRate: 10,
            repeat: -1
        });

        this.time.addEvent({
            delay: 7000,
            callback: this.spawnEnemyBullet,
            callbackScope: this,
            loop: true
        });

        // Power-up anims
        this.anims.create({
            key: 'powerupBulletAnim',
            frames: this.anims.generateFrameNumbers('power-up-bullet', { start: 0, end: 1 }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'powerupShieldAnim',
            frames: this.anims.generateFrameNumbers('power-up-shield', { start: 0, end: 1 }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'shipShieldAnim',
            frames: this.anims.generateFrameNumbers('power-up-shield', { start: 0, end: 1 }),
            frameRate: 5,
            repeat: -1
        });

        // Create a group for power-ups
        this.powerUps = this.physics.add.group();
        this.physics.add.overlap(this.ship, this.powerUps, this.collectPowerUp, null, this);

        // Power up bools
        this.doubleBulletActive = false;
        this.shieldActive = false;  

        // Debug
        this.debugActive = false;
    }

    update() {
        // If the game is over, don't process movement updates
        if (this.isGameOver) return;

        // Scroll background to create movement illusion
        this.background.tilePositionX += 1;

        // Ship movement with arrow keys or WASD, with screen boundary limits
        if (this.cursors.left.isDown ||
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A).isDown ||
            (this.leftButton && this.leftButton.pressed)) {
            if (this.ship.x > 88) {
                this.ship.x -= 5;
            }
        }
        if (this.cursors.right.isDown ||
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D).isDown ||
            (this.rightButton && this.rightButton.pressed)) {
            if (this.ship.x < 1192) {
                this.ship.x += 5;
            }
        }
        if (this.cursors.up.isDown ||
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W).isDown ||
            (this.upButton && this.upButton.pressed)) {
            if (this.ship.y > 48) {
                this.ship.y -= 5;
            }
        }
        if (this.cursors.down.isDown ||
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S).isDown ||
            (this.downButton && this.downButton.pressed)) {
            if (this.ship.y < 672) {
                this.ship.y += 5;
            }
        }

        // Shooting
        if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).isDown ||
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J).isDown ||
            (this.shootButton && this.shootButton.pressed)) {
            this.shootLaser();
        }

        // Shield sprite update pos
        if (this.shieldActive) {
            this.shieldGraphic.setPosition(this.ship.x, this.ship.y);
            this.ship.setVelocity(0, 0); // Bullet collisions cause knockback
        }

        // Debug
        if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ZERO).isDown) {
            if (!this.debugActive) {
                this.debugActive = true;
                this.physics.world.createDebugGraphic();
            }
        }
    }

    spawnEnemy() {
        // Randomly generate enemy Y position within screen bounds
        const x = Phaser.Math.Between(1200, 1280); // Spawn from the right side of the screen
        const y = Phaser.Math.Between(50, 670);

        let enemyType = Phaser.Math.Between(1, 3); // 1-2: normal enemy, 3: fast enemy

        let enemy;
        if (enemyType === 3) {
            // Fast enemy
            enemy = this.enemies.create(x, y, 'enemy-fast');
            enemy.play('enemyFly-Fast');
            enemy.setFlipX(true);
            enemy.type = 'enemy-fast';
            this.tweens.add({
                targets: enemy,
                x: -50,
                duration: 2500,
                ease: 'Linear',
                onComplete: () => enemy.destroy()
            });
        } else {
            // Normal enemy
            enemy = this.enemies.create(x, y, 'enemy');
            enemy.play('enemyFly');
            enemy.setFlipX(true);
            enemy.type = 'enemy';
            this.tweens.add({
                targets: enemy,
                x: -50,
                duration: 4000,
                ease: 'Linear',
                onComplete: () => enemy.destroy()
            });
        }

        // Add laser collision
        this.physics.add.collider(this.lasers, this.enemies, this.laserHitsEnemy, null, this);
    }

    handleCollision(ship, enemy) {
        if (this.shieldActive) {
            enemy.destroy();
            this.createExplosion(enemy.x, enemy.y);
            return;
        }

        this.createExplosion(this.ship.x, this.ship.y, null, enemy); // Explode enemy upon collision
        ship.visible = false; // Remove player ship

        // Kill the ship's tween so it stops moving
        this.tweens.killTweensOf(this.ship);
        
        // Stop any physics-based movement
        this.ship.body.setVelocity(0, 0);
        
        // Create explosion
        this.createExplosion(ship.x, ship.y, true);
    }

    handleEnemyBulletCollision(ship, bullet) {
        if (this.shieldActive) {
            bullet.destroy();
            return;
        }

        bullet.destroy(); // Remove the bullet
        this.createExplosion(ship.x, ship.y, true);
        ship.visible = false;
        this.tweens.killTweensOf(this.ship);
        this.ship.body.setVelocity(0, 0);
    }

    createExplosion(x, y, playerShip, otherTarget) {
        if (!this.isGameOver) {
            let explosion = this.add.sprite(x, y, 'explosion');
            explosion.play('explode');
            this.sound.play('explosionSound', {volume: 0.4}); // Play explosion sound

            if (otherTarget) {
                otherTarget.destroy();
                let explosion2 = this.add.sprite(otherTarget.x, otherTarget.y, 'explosion');
                explosion2.play('explode');
            }

            if (playerShip) {
                this.isGameOver = true;
                explosion.on('animationcomplete', () => {
                    explosion.destroy(); // Remove explosion after playing
                    this.resetGame();
                });
            }
        }
    }

    resetGame() {
        location.reload();
    }

    playMusicSequence() {
        this.music1.play()
        
        this.music1.once('complete', () => {
            this.music1.play();
        });
    }

    shootLaser() {
        if (this.isGameOver) return;

        let currentTime = this.time.now; // Get current time

        if (currentTime - this.lastShotTime < this.shootCooldown) {
            return; // Stop if cooldown hasn't passed
        }

        this.lastShotTime = currentTime; // Update last shot time

        const speed = 400;
    
        if (this.doubleBulletActive) {
            const angleUp = Phaser.Math.DegToRad(-5);
            const angleDown = Phaser.Math.DegToRad(5);
            
            // Fire the upward bullet
            let laser1 = this.lasers.create(this.ship.x + 70, this.ship.y - 10, 'laser');
            laser1.setFlipX(true);
            laser1.play('laserFly');
            laser1.setVelocity(
                speed * Math.cos(angleUp), 
                speed * Math.sin(angleUp)
            );
            laser1.setGravityY(0);
            
            // Fire the downward bullet
            let laser2 = this.lasers.create(this.ship.x + 70, this.ship.y + 10, 'laser');
            laser2.setFlipX(true);
            laser2.play('laserFly');
            laser2.setVelocity(
                speed * Math.cos(angleDown), 
                speed * Math.sin(angleDown)
            );
            laser2.setGravityY(0);
            
            this.sound.play('laserSound', { volume: 0.75 });
            
            // Destroy lasers after 3 seconds
            this.time.delayedCall(3000, () => {
                if (laser1) laser1.destroy();
                if (laser2) laser2.destroy();
            });
        } else {
            // Normal single laser
            let laser = this.lasers.create(this.ship.x + 70, this.ship.y, 'laser');
            laser.setFlipX(true);
            laser.play('laserFly');
            laser.setVelocityX(speed);
            laser.setGravityY(0);
            this.sound.play('laserSound', { volume: 0.75 });
            this.time.delayedCall(3000, () => {
                if (laser) laser.destroy();
            });
        }
    }

    laserHitsEnemy(laser, enemy) {
        let laserImpact = this.add.sprite(laser.x, laser.y, 'laserImpact');
        laserImpact.play('laserImpact');
        laser.destroy(); // Remove the laser
        enemy.destroy(); // Remove the enemy
        this.createExplosion(enemy.x, enemy.y); // Play explosion
        
        if (enemy.type == 'enemy') { // Add points based on enemy type
            this.updateScore(5);
        } else if (enemy.type == 'enemy-fast') {
            this.updateScore(15);
        }

        // 1 in 100 chance to drop a power-up
        if (Phaser.Math.Between(1, 100) === 1) {
            // Randomly select one of the two types (50/50 chance)
            let powerType = Phaser.Math.Between(0, 1) === 0 ? 'power-up-bullet' : 'power-up-shield';
            let powerUp = this.powerUps.create(enemy.x, enemy.y, powerType);
            powerUp.body.allowGravity = false;
            // Play its animation
            powerUp.play(powerType === 'power-up-bullet' ? 'powerupBulletAnim' : 'powerupShieldAnim');
            powerUp.setVelocityY(50);
        }

        laserImpact.on('animationcomplete', () => {
            laserImpact.destroy(); // Remove after playing
        });
    }

    updateScore(amount) {
        this.score += amount;
        this.scoreText.setText('Score: ' + this.score); // Update display

        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreText.setText(`Local High Score: ${this.highScore}`);

            // Save new high score in localStorage
            localStorage.setItem('highScore', this.highScore);
        }
    }

    createTouchControls() {
        // Left button
        this.leftButton = this.add.image(100, 550, 'button').setInteractive().setScale(1.6);
        this.leftButton.pressed = false;

        // Right button
        this.rightButton = this.add.image(250, 550, 'button').setInteractive().setScale(1.6);
        this.rightButton.pressed = false;

        // Up button
        this.upButton = this.add.image(175, 470, 'button').setInteractive().setScale(1.6);
        this.upButton.pressed = false;

        // Down button
        this.downButton = this.add.image(175, 630, 'button').setInteractive().setScale(1.6);
        this.downButton.pressed = false;

        // Shoot button
        this.shootButton = this.add.image(1100, 550, 'button').setInteractive().setScale(1.5);
        this.shootButton.pressed = false;

        // Button press events
        this.setupButtonPress(this.leftButton);
        this.setupButtonPress(this.rightButton);
        this.setupButtonPress(this.upButton);
        this.setupButtonPress(this.downButton);
        this.setupButtonPress(this.shootButton);
    }

    setupButtonPress(button) {
        button.on('pointerdown', () => {
            button.pressed = true;
        });
        button.on('pointerup', () => {
            button.pressed = false;
        });
        button.on('pointerout', () => {
            button.pressed = false;
        });
    }

    spawnEnemyBullet() {
        // Ensure there's at least one enemy
        if (this.enemies.getChildren().length === 0) return;

        // Pick a random enemy from the enemy group
        const enemiesArray = this.enemies.getChildren();
        const randomEnemy = Phaser.Utils.Array.GetRandom(enemiesArray);

        // Create the enemy bullet at the enemy's position
        let bullet = this.enemyBullets.create(randomEnemy.x, randomEnemy.y, 'enemyBullet');
        bullet.body.allowGravity = false;
        bullet.setCollideWorldBounds(false);

        // Calculate direction vector from bullet to the player's ship
        const direction = new Phaser.Math.Vector2(this.ship.x - bullet.x, this.ship.y - bullet.y).normalize();
        const bulletSpeed = 300;

        // Set the bullet's velocity so it moves toward the ship
        bullet.body.setVelocity(direction.x * bulletSpeed, direction.y * bulletSpeed);

        // Play the bullet animation
        bullet.play('enemyBulletAnim');
    }

    collectPowerUp(ship, powerUp) {
        // Remove the power-up sprite
        powerUp.destroy();
        
        // Check the type using its texture key
        if (powerUp.texture.key === 'power-up-bullet') {
            // Activate double bullet mode for 15 seconds
            this.doubleBulletActive = true;

            this.time.delayedCall(15000, () => {
                this.doubleBulletActive = false;
            });
        } else if (powerUp.texture.key === 'power-up-shield') {
            // Activate shield for 10 seconds
            this.shieldActive = true;

            if (!this.shieldGraphic) {
                this.shieldGraphic = this.add.graphics();
            }
            
            this.shieldGraphic.alpha = 1;
            
            // Draw the shield hitbox as a cyan oval
            this.shieldGraphic.clear();
            this.shieldGraphic.lineStyle(4, 0x00ffff, 1);
            let shieldWidth = this.ship.width + 20;
            let shieldHeight = this.ship.height + 20;
            this.shieldGraphic.strokeEllipse(0, 0, shieldWidth, shieldHeight);
            // Position the graphic at the ship's center
            this.shieldGraphic.setPosition(this.ship.x, this.ship.y);
            
            this.time.delayedCall(10000, () => {
            this.shieldBlinkTimer = this.time.addEvent({
                delay: 100,
                loop: true,
                callback: () => {
                    this.shieldGraphic.visible = !this.shieldGraphic.visible;
                }
            });
        });
        
        this.time.delayedCall(15000, () => {
            this.shieldActive = false;
            if (this.shieldBlinkTimer) {
                this.shieldBlinkTimer.remove();
                this.shieldBlinkTimer = null;
            }
            if (this.shieldGraphic) {
                this.shieldGraphic.destroy();
                this.shieldGraphic = null;
            }
        });
        }
    }
}
