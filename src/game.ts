import { MainScene } from './main';
import { LoadScene } from './load';
import { MenuScene } from './menu';

new Phaser.Game({
    width: 720,
    height: 720,
    parent: 'game',
    scene: [
        LoadScene,
        MenuScene,
        MainScene,
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    backgroundColor: 0x3B8643
});