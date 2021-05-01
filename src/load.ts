export class LoadScene extends Phaser.Scene {

    constructor() {
        super('load');
    }

    preload() {
        this.load.bitmapFont('words', 'font/words_0.png', 'font/words.fnt');
        this.load.spritesheet('plant', 'img/plant.png', { frameWidth: 100, frameHeight: 55});
        this.load.spritesheet('plant-highlight', 'img/plant-highlight.png', { frameWidth: 100, frameHeight: 55});
        this.load.spritesheet('plant-bad', 'img/plant-bad.png', { frameWidth: 100, frameHeight: 55});
        this.load.spritesheet('plant2', 'img/plant2.png', { frameWidth: 100, frameHeight: 55});
        this.load.spritesheet('plant2-highlight', 'img/plant2-highlight.png', { frameWidth: 100, frameHeight: 55});
        this.load.spritesheet('cut', 'img/cut2.png', { frameWidth: 300, frameHeight: 50 });
        this.load.spritesheet('goal', 'img/goal2.png', { frameWidth: 44, frameHeight: 44 });
        this.load.image('cutter', 'img/cutter.png');
        this.load.image('cloud', 'img/cloud.png');
        this.load.image('logo', 'img/logo.png');


        this.load.image('text-tutorial', 'img/text-tutorial.png');

        this.load.spritesheet('text-win', 'img/text-win.png', {frameWidth: 520, frameHeight: 100});
        this.load.spritesheet('text-loss', 'img/text-loss.png', {frameWidth: 520, frameHeight: 100});

        this.load.spritesheet('button-beginner', 'img/button-beginner.png', {frameWidth: 180, frameHeight: 60});
        this.load.spritesheet('button-intermediate', 'img/button-intermediate.png', {frameWidth: 220, frameHeight: 60});
        this.load.spritesheet('button-expert', 'img/button-expert.png', {frameWidth: 150, frameHeight: 60});
        this.load.spritesheet('button-grandmaster', 'img/button-grandmaster.png', {frameWidth: 220, frameHeight: 60});

        this.load.spritesheet('button-tutorial', 'img/button-tutorial.png', {frameWidth: 50, frameHeight: 50});
        this.load.spritesheet('button-x', 'img/button-x.png', {frameWidth: 50, frameHeight: 50});
        this.load.bitmapFont('words', 'font/words_0.png', 'font/words.fnt');
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

        let dataString = localStorage.getItem('green_gardens_data');
        let data;
        if (dataString) {
            data = JSON.parse(dataString);
            if (!data.highestBeaten) data.highestBeaten = 0;
            if (!data.bestStreak) data.bestStreak = 0;
            if (!data.winStreak) data.winStreak = 0;
        } else {
            data = {
                highestBeaten: 0,
                winStreak: 0,
                bestStreak: 0
            };
            localStorage.setItem('green_gardens_data', JSON.stringify(data));
        }
        this.registry.set(data, null);

        this.scene.start('menu');
    }
}