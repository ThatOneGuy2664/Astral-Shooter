import { Start } from './scenes/Start.js';
import { Load } from './scenes//Load.js';
import { PauseMenu } from './scenes/PauseMenu.js';
import { GameScene } from './scenes/GameScene.js';

const config = {
    type: Phaser.AUTO,
    title: 'Astral Shooter',
    parent: 'game-container',
    width: 1280,
    height: 720,
    pixelArt: false,
    scene: [
        Start,
        Load,
        GameScene,
        PauseMenu
    ],
    scale: {
        mode: Phaser.Scale.CENTER_BOTH,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
}

new Phaser.Game(config);