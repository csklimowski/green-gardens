export class LoadScene extends Phaser.Scene {

    constructor() {
        super('load');
    }

    preload() {
        this.load.bitmapFont('words', 'font/words_0.png', 'font/words.fnt');
        this.load.spritesheet('plant', 'img/plant.png', { frameWidth: 100, frameHeight: 55});
        this.load.spritesheet('plant-highlight', 'img/plant-highlight.png', { frameWidth: 100, frameHeight: 55});
        this.load.spritesheet('plant2', 'img/plant2.png', { frameWidth: 100, frameHeight: 55});
        this.load.spritesheet('plant2-highlight', 'img/plant2-highlight.png', { frameWidth: 100, frameHeight: 55});
        this.load.spritesheet('cut', 'img/cut2.png', { frameWidth: 300, frameHeight: 50 });
        this.load.spritesheet('goal', 'img/goal2.png', { frameWidth: 44, frameHeight: 44 });
        this.load.image('cutter', 'img/cutter.png');
        this.load.image('cloud', 'img/cloud.png');
    }

    create() {
        this.anims.create({
            key: 'cut',
            frames: this.anims.generateFrameNumbers('cut', {frames: [1, 2, 3, 4]}),
            frameRate: 30
        });

        this.anims.create({
            key: 'achieve',
            frames: this.anims.generateFrameNumbers('goal', {frames: [1, 2, 3, 4, 5]}),
            frameRate: 30
        });

        this.scene.start('main');
    }
}