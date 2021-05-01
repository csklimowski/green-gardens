import { Button } from './objects';

export class MenuScene extends Phaser.Scene {

    constructor() {
        super('menu');
    }

    create() {
        this.add.image(360, 75, 'logo');

        this.add.bitmapText(360, 160, 'words', 'by Chris Klimowski', 80).setOrigin(0.5);
        new Button(this, 360, 260, 'button-beginner', () => {
            this.registry.set('difficulty', 1);
            this.scene.start('main');
        });
        new Button(this, 360, 340, 'button-intermediate', () => {
            this.registry.set('difficulty', 2);
            this.scene.start('main');
        }, this.registry.get('highestBeaten') < 1);
        new Button(this, 360, 420, 'button-expert', () => {
            this.registry.set('difficulty', 3);
            this.scene.start('main');
        }, this.registry.get('highestBeaten') < 2);
        new Button(this, 360, 500, 'button-grandmaster', () => {
            this.registry.set('difficulty', 4);
            this.scene.start('main');
        }, this.registry.get('highestBeaten') < 3);

        let winStreak = this.registry.get('winStreak');
        let bestStreak = this.registry.get('bestStreak');
        if (bestStreak > 0) {
            this.add.bitmapText(360, 560, 'words', 'grandmaster win streak: ' + (
                bestStreak <= winStreak ? winStreak : (winStreak + ' (best: ' + bestStreak + ')')
            ), 80).setOrigin(0.5, 0);
        }
    }
}

