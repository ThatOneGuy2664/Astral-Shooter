export class Start extends Phaser.Scene
{
    constructor()
    {
        super('Start');
    }

    preload()
    {
        this.load.image('background', 'assets/space.png');
        
        // The sprites are CC0 from https://ansimuz.itch.io - check out his other work!
        this.load.spritesheet('ship', 'assets/spaceship.png', { frameWidth: 176, frameHeight: 96 });
        this.load.spritesheet('enemy', 'assets/enemy.png', { frameWidth: 48, frameHeight: 48 });
    }

    create()
    {
        // Create scrolling background
        this.background = this.add.tileSprite(640, 360, 1280, 720, 'background');
        
        // Add player's ship
        this.ship = this.add.sprite(640, 360, 'ship');
        
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
        
        // Play ship animation
        this.ship.play('fly');
        
        // Add smooth up and down movement to the ship
        this.tweens.add({
            targets: this.ship,
            duration: 1500,
            ease: 'Sine.inOut',
            yoyo: true,
            loop: -1
        });
        
        // Add keyboard input
        this.cursors = this.input.keyboard.createCursorKeys();

        // Create a group for enemies
        this.enemies = this.add.group();
        
        // Spawn enemies periodically
        this.time.addEvent({
            delay: 1000, // Every second
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
    }

    update()
    {
        // Scroll background to create movement illusion
        this.background.tilePositionX += 1;
        
        // Move ship based on arrow key or WASD key input with screen boundary limits
        if (this.cursors.left.isDown || this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A).isDown)
        {
            if (this.ship.x > 88)
            {
                this.ship.x -= 5;
            }
        }
        else if (this.cursors.right.isDown || this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D).isDown)
        {
            if (this.ship.x < 1192)
            {
                this.ship.x += 5;
            }
        }

        if (this.cursors.up.isDown || this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W).isDown)
        {
            if (this.ship.y > 48)
            {
                this.ship.y -= 5;
            }
        }
        else if (this.cursors.down.isDown || this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S).isDown)
        {
            if (this.ship.y < 672)
            {
                this.ship.y += 5;
            }
        }
    }

    spawnEnemy()
    {
        // Randomly generate enemy Y position within screen bounds
        const x = Phaser.Math.Between(1200, 1280); // Spawn from the right side of the screen
        const y = Phaser.Math.Between(50, 670);
        
        // Create enemy sprite with physics
        const enemy = this.add.sprite(x, y, 'enemy');
        
        // Add enemy to the group
        this.enemies.add(enemy);
        
        // Play enemy animation
        enemy.play('enemyFly');

        // Make them face the player
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
}
