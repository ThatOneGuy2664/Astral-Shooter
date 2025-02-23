export class Start extends Phaser.Scene {
    constructor() {
        super('Start');
    }

    create() {
        const { width, height } = this.cameras.main;

        window.isTouchInput = false;
        
        this.add.text(width / 2, height / 2, 'Click anywhere to start', {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.input.on('pointerdown', (pointer) => {
            window.isTouchInput = pointer.pointerType === 'touch';
            this.input.off('pointerdown');
            this.scene.launch('GameScene');
        });
    }
}