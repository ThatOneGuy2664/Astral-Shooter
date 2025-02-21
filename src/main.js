import { Start } from './scenes/Start.js';

const config = {
    type: Phaser.AUTO,
    title: 'Astral Shooter',
    parent: 'game-container',
    width: 1280,
    height: 720,
    pixelArt: false,
    scene: [
        Start
    ],
    scale: {
        mode: Phaser.Scale.CENTER_BOTH,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}
new Phaser.Game(config);
