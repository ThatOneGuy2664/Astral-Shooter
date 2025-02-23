export class PauseMenu extends Phaser.Scene {
    constructor() {
        super('PauseMenu');
    }

    create() {
        this.add.rectangle(640, 360, 400, 300, 0x000000, 0.7);

        // Create interactive text options, centered on screen
        const resumeText = this.add.text(640, 280, 'Resume', {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(0.5).setInteractive();

        resumeText.on('pointerdown', () => {
            // Resume the main game and stop the pause menu
            this.scene.resume('Start');
            this.scene.stop();
        });

        resumeText.on('pointerdown', () => {
            // Resume the main game and stop the pause menu
            this.scene.resume('Start');
            this.scene.stop();
        });

        const githubText = this.add.text(640, 340, 'Github Page', {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(0.5).setInteractive();

        githubText.on('pointerdown', () => {
            // Open Github page in a new tab
            window.open('https://github.com/ThatOneGuy2664/Astral-Shooter', '_blank');
        });

        const itchText = this.add.text(640, 400, 'Itch.Io Page', {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(0.5).setInteractive();

        itchText.on('pointerdown', () => {
            // Open Itch.io page in a new tab
            window.open('https://theboom2010.itch.io/astral-shooter', '_blank');
        });

        const quitText = this.add.text(640, 460, 'Quit', {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(0.5).setInteractive();

        quitText.on('pointerdown', () => {
            // Close tab
            window.close();
        });

        // Also allow closing the menu with the ESC key
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.resume('Start');
            this.scene.stop();
        });
    }
}