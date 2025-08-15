export class Load extends Phaser.Scene {
    constructor() {
        super('Load');
    }

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 4, height / 2 - 25, width / 2, 50);
        const loadText = this.add.text(this.scale.width / 2, this.scale.height / 2 - 60, 'Loading', {fontFamily: 'Helvetica', fontSize: '22px'});
        let dotCount = 0;
        loadText.setOrigin(0.5, 0.5);

        this.time.addEvent({
            delay: 500,
            callback: () => {
                dotCount = (dotCount + 1) % 4;
                const dots = '.'.repeat(dotCount);
                loadText.setText('Loading' + dots);
            },
            loop: true
        });
    
        const fileText = this.add.text(this.scale.width / 2, this.scale.height / 2 + 40, '', {
            fontFamily: 'Helvetica',
            fontSize: '18px'
        }).setOrigin(0.5);

        this.load.on('fileprogress', (file) => {
            fileText.setText(`Now loading: ${file.key}`);
        });

        this.load.image('background', 'assets/space.png');
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
        this.load.audio('powerUpSound', 'assets/powerUpCollected.wav');

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            this.scene.start('GameScene');
        });
    }
}