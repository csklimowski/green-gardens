import { Button } from "./objects";

const PLANT_WIDTH = 90;
const PLANT_HEIGHT = 60;


function itox(i: number) {
    return i*PLANT_WIDTH + 90;
}

function xtoi(x: number) {
    return Math.floor(((x - 45) / 90));
}

function pick(arr: any[]) {
    return arr[Math.floor(Math.random()*arr.length)];
}

class PlantSegment extends Phaser.GameObjects.Image {
    plantType: number;
    constructor(scene: Phaser.Scene, x: number, y: number) {
        let type = pick([0, 1, 2, 3, 4]);
        super(scene, x, y, 'plant', type);
        scene.add.existing(this);
        this.setFlipX(Math.random() > 0.5);
        this.plantType = type;
    }
    highlight() {
        this.setTexture('plant-highlight', this.plantType);
    }
    unhighlight() {
        this.setTexture('plant', this.plantType);
    }
}

class Plant  {
    x: number;
    y: number;
    segments: PlantSegment[];
    height: number;
    scene: Phaser.Scene;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.height = 0;
        this.segments = [
            new PlantSegment(scene, x, y)
        ];
    }

    grow(slow?: boolean) {
        this.segments.push(new PlantSegment(this.scene, this.x, this.y + PLANT_HEIGHT));
        for (let seg of this.segments) {
            if (slow) {
                this.scene.tweens.add({
                    targets: seg,
                    props: { y: seg.y - PLANT_HEIGHT },
                    duration: 300,
                    delay: 200
                });
            } else {
                seg.setY(seg.y - PLANT_HEIGHT);
            }
        }
        this.height += 1;
    }

    cut() {
        let segmentBag = this.scene.add.container(this.x, this.y-PLANT_HEIGHT);
        segmentBag.setDepth(2);
        for (let i = 0; i < this.height; i++) {
            this.segments[i].setX(0);
            this.segments[i].setY((-this.height + i + 1)*PLANT_HEIGHT);
            segmentBag.add(this.segments[i]);
        }
        this.segments = [this.segments[this.height]];
        this.height = 0;
        return segmentBag;
    }

    highlight() {
        for (let i = 0; i < this.height; i++) {
            this.segments[i].highlight();
        }
    }

    unhighlight() {
        for (let rect of this.segments) {
            rect.unhighlight();
        }
    }
}

export class Cutter extends Phaser.GameObjects.Sprite {
    li: number;

    constructor(scene: Phaser.Scene) {
        super(scene, -500, 520, 'cut', 5);
        this.setDepth(2);
        scene.add.existing(this);
        this.li = -1;
    }

    goTo(li: number) {
        this.li = li;
        this.setX(itox(li) + 0.5*PLANT_WIDTH);
    }

    hide() {
        this.li = -1;
        this.setX(-500);
    }
}

export class Cloud extends Phaser.GameObjects.Container {
    li: number;

    constructor(scene: Phaser.Scene, li: number) {
        super(scene, itox(li) + 0.5*PLANT_WIDTH, 0);
        scene.add.existing(this);
        let cloudImg = scene.add.image(0, 70, 'cloud');
        cloudImg.setOrigin(0.5, 1);
        this.add(cloudImg);
        let shadow = scene.add.rectangle(0, 70, 180, 700, 0x000000, 0.2);
        shadow.setOrigin(0.5, 0);
        this.add(shadow);
        this.li = li;
        this.setDepth(1);
    }

    move() {
        if (this.li === 0) this.li += 1;
        else if (this.li === 5) this.li -= 1;
        else if (Math.random() > 0.5) this.li += 1;
        else this.li -= 1;

        this.scene.tweens.add({
            targets: this,
            props: { x: itox(this.li) + 0.5*PLANT_WIDTH },
            duration: 400,
            delay: 600
        });
    }
}

class Goal extends Phaser.GameObjects.Container {
    amount: number;
    achieved: boolean;
    squares: Phaser.GameObjects.Sprite[];
    
    constructor(scene: Phaser.Scene, x: number, y: number, amount: number) {
        super(scene, x, y);
        scene.add.existing(this);
        this.setDepth(2);
        this.amount = amount;

        this.squares = [];
        for (let i = 0; i < amount; i++) {
            this.squares.push(scene.add.sprite(0, i*-25, 'goal'));
        }
        this.add(this.squares);
    }

    achieve() {
        for (let square of this.squares) {
            square.anims.play('achieve');
        }
        this.achieved = true;
    }
}

export class MainScene extends Phaser.Scene {

    plants: Plant[];
    cloud: Cloud;
    cutter: Cutter;
    goals: Goal[];
    playerTurn: boolean;
    finished: boolean;
    lost: boolean;

    shade: Phaser.GameObjects.Rectangle;
    tutorialText: Phaser.GameObjects.Image;
    tutorialButton: Button;
    endMenu: Phaser.GameObjects.Container;

    constructor() {
        super('main');
    }

    create() {
        this.plants = [
            new Plant(this, 90, 550),
            new Plant(this, 180, 550),
            new Plant(this, 270, 550),
            new Plant(this, 360, 550),
            new Plant(this, 450, 550),
            new Plant(this, 540, 550),
            new Plant(this, 630, 550),
        ];

        let grown = 0;
        while (grown < 7) {
            let plant = pick(this.plants);
            if (plant.height < 2) {
                plant.grow();
                grown += 1;
            }
        }

        this.cloud = new Cloud(this, pick([0, 1, 2, 3, 4, 5]));
        this.cutter = new Cutter(this);

        let bg = this.add.rectangle(360, 530, 720, 190, 0x6B563C);
        bg.setOrigin(0.5, 0);
        bg.setDepth(1);

        let difficulty = this.registry.get('difficulty') || 0;

        if (difficulty === 1) {
            this.goals = [
                new Goal(this, 170, 670, 1),
                new Goal(this, 200, 670, 1),
                new Goal(this, 230, 670, 1),
                new Goal(this, 260, 670, 1),
                new Goal(this, 320, 670, 2),
                new Goal(this, 350, 670, 2),
                new Goal(this, 380, 670, 2),
                new Goal(this, 440, 670, 3),
                new Goal(this, 470, 670, 3),
                new Goal(this, 530, 670, 4),
            ];
        } else if (difficulty === 2) {
            this.goals = [
                new Goal(this, 140, 670, 1),
                new Goal(this, 170, 670, 1),
                new Goal(this, 200, 670, 1),
                new Goal(this, 230, 670, 1),
                new Goal(this, 290, 670, 2),
                new Goal(this, 320, 670, 2),
                new Goal(this, 350, 670, 2),
                new Goal(this, 380, 670, 2),
                new Goal(this, 440, 670, 3),
                new Goal(this, 470, 670, 3),
                new Goal(this, 530, 670, 4),
                new Goal(this, 560, 670, 4),
            ];
        } else if (difficulty === 3) {
            this.goals = [
                new Goal(this, 90, 670, 1),
                new Goal(this, 120, 670, 1),
                new Goal(this, 150, 670, 1),
                new Goal(this, 180, 670, 1),
                new Goal(this, 210, 670, 1),
                new Goal(this, 270, 670, 2),
                new Goal(this, 300, 670, 2),
                new Goal(this, 330, 670, 2),
                new Goal(this, 360, 670, 2),
                new Goal(this, 420, 670, 3),
                new Goal(this, 450, 670, 3),
                new Goal(this, 480, 670, 3),
                new Goal(this, 540, 670, 4),
                new Goal(this, 570, 670, 4),
                new Goal(this, 630, 670, 5),
            ];
        } else {
            this.goals = [
                new Goal(this, 40, 670, 1),
                new Goal(this, 70, 670, 1),
                new Goal(this, 100, 670, 1),
                new Goal(this, 130, 670, 1),
                new Goal(this, 160, 670, 1),
                new Goal(this, 190, 670, 1),
                new Goal(this, 250, 670, 2),
                new Goal(this, 280, 670, 2),
                new Goal(this, 310, 670, 2),
                new Goal(this, 340, 670, 2),
                new Goal(this, 400, 670, 3),
                new Goal(this, 430, 670, 3),
                new Goal(this, 460, 670, 3),
                new Goal(this, 490, 670, 3),
                new Goal(this, 550, 670, 4),
                new Goal(this, 580, 670, 4),
                new Goal(this, 640, 670, 5),
                new Goal(this, 670, 670, 5),
            ];
        }

        this.playerTurn = true;
        this.finished = false;
        this.lost = false;

        this.input.on(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove, this);
        this.input.on(Phaser.Input.Events.POINTER_DOWN, this.onPointerMove, this);
        this.input.on(Phaser.Input.Events.POINTER_UP, this.onPointerUp, this);

        
        this.shade = this.add.rectangle(360, 360, 720, 720, 0x000000);
        
        this.shade.setAlpha(0);
        this.shade.setDepth(3);
        this.tutorialButton = new Button(this, 670, 50, 'button-tutorial', this.toggleTutorial.bind(this));
        this.tutorialButton.setDepth(4);
        this.tutorialText = this.add.image(360, 350, 'text-tutorial');
        this.tutorialText.setAlpha(0);
        this.tutorialText.setDepth(4);
        this.endMenu = this.add.container(0, 0);
        this.endMenu.setAlpha(0);
        this.endMenu.setDepth(4);
    }

    toggleTutorial() {
        if (this.tutorialText.alpha === 0) {
            this.tutorialText.setAlpha(1);
            this.shade.setAlpha(.7);
            this.tutorialButton.setTexture('button-x');
            this.playerTurn = false;
        } else {
            this.tutorialText.setAlpha(0);
            this.shade.setAlpha(0);
            this.tutorialButton.setTexture('button-tutorial');
            this.playerTurn = true;
        }
    }

    allFinished() {
        if (this.finished) return;
        this.tutorialButton.setVisible(false);
        this.finished = true;

        this.shade.setAlpha(0.7);
        this.endMenu.setAlpha(1);

        let winStreak = this.registry.get('winStreak');
        let bestStreak = this.registry.get('bestStreak');
        if (this.lost) {
            this.endMenu.add(this.add.image(360, 100, 'text-loss', pick([0, 1, 2, 3, 4, 5, 6])));
            if (this.registry.get('difficulty') === 4) {
                winStreak = 0;
            }
        } else {
            this.endMenu.add(this.add.image(360, 100, 'text-win', pick([0, 1, 2, 3, 4, 5, 6])));
            this.registry.set('highestBeaten', Math.max(this.registry.get('difficulty'), this.registry.get('highestBeaten')));
            if (this.registry.get('difficulty') === 4) {
                winStreak += 1;
                bestStreak = Math.max(bestStreak, winStreak);
            }
        }

        this.registry.set('winStreak', winStreak);
        this.registry.set('bestStreak', bestStreak);
        localStorage.setItem('green_gardens_data', JSON.stringify(this.registry.values));
        
        let playAgainText = this.add.bitmapText(360, 180, 'words', 'Play again?', 80);
        playAgainText.setOrigin(0.5);
        this.endMenu.add([
            playAgainText,
            new Button(this, 360, 260, 'button-beginner', () => {
                this.registry.set('difficulty', 1);
                this.scene.start('main');
            }),
            new Button(this, 360, 340, 'button-intermediate', () => {
                this.registry.set('difficulty', 2);
                this.scene.start('main');
            }, this.registry.get('highestBeaten') < 1),
            new Button(this, 360, 420, 'button-expert', () => {
                this.registry.set('difficulty', 3);
                this.scene.start('main');
            }, this.registry.get('highestBeaten') < 2),
            new Button(this, 360, 500, 'button-grandmaster', () => {
                this.registry.set('difficulty', 4);
                this.scene.start('main');
            }, this.registry.get('highestBeaten') < 3),
        ]);

        if (bestStreak > 0) {
            this.add.bitmapText(360, 500, 'words', 'grandmaster win streak: ' + (
                bestStreak <= winStreak ? winStreak : (winStreak + ' (best: ' + bestStreak + ')')
            ), 80).setOrigin(0.5, 0);
        }
    }

    onPointerMove(event) {
        let x = this.input.activePointer.worldX;
        let y = this.input.activePointer.worldY;
        if (this.playerTurn && !this.finished && y > 100 && y < 700) {
            let li = Math.floor(((x - 90) / 90));
            if (li > -1 && li < 6) {
                this.cutter.goTo(li);
                for (let i = 0; i < this.plants.length; i++) {
                    if (i === li || i === li + 1) {
                        this.plants[i].highlight();
                    } else {
                        this.plants[i].unhighlight();
                    }
                }
            } else {
                for (let plant of this.plants) {
                    plant.unhighlight();
                }
                this.cutter.hide();
            }
        } else {
            for (let plant of this.plants) {
                plant.unhighlight();
            }
            this.cutter.hide();
        }
    }

    onPointerUp() {
        if (!this.playerTurn || this.finished) return;
        if (this.cutter.li < 0 || this.cutter.li > 5) return;

        let cutPlants: Plant[] = [];
        let cutSegments: Phaser.GameObjects.Container[] = [];
        let tweens: any[][] = [];
        let goals: Goal[] = [];

        this.cutter.anims.play('cut');

        for (let i = this.cutter.li; i <= this.cutter.li+1; i++) {
            this.plants[i].unhighlight();
            cutPlants.push(this.plants[i]);
            let segs = this.plants[i].cut();
            cutSegments.push(segs);
            tweens.push([{
                props: {
                    y: segs.y - (60 + Math.random()*10),
                    angle: Math.random() * 10 - 5
                },
                duration: 300,
                ease: Phaser.Math.Easing.Quadratic.Out
            }]);
        }
        

        for (let i = 0; i < cutPlants.length; i++) {
            for (let goal of this.goals) {
                if (!goal.achieved) {
                    if (goal.amount === cutSegments[i].length) {
                        goal.achieved = true;
                        goals[i] = goal;
                        break;
                    }
                }
            }
            if (cutSegments[i].length > 0 && !goals[i]) {
                this.lost = true;
            }
        }

        let allGoalsComplete = true;
        for (let goal of this.goals) {
            if (!goal.achieved) allGoalsComplete = false;
        }

        for (let i = 0; i < cutPlants.length; i++) {
            if (goals[i]) {
                tweens[i].push({
                    props: {
                        y: goals[i].y,
                        x: goals[i].x,
                        scaleX: 0.3,
                        scaleY: 0.3
                    },
                    duration: 500,
                    ease: Phaser.Math.Easing.Cubic.In
                });
            }

            this.tweens.timeline({
                targets: cutSegments[i],
                tweens: tweens[i],
                onComplete: () => {
                    if (goals[i]) {
                        goals[i].achieve();
                        cutSegments[i].destroy();
                    } else {
                        for (let segment of <PlantSegment[]>cutSegments[i].getAll()) {
                            segment.setTexture('plant-bad', segment.plantType);
                        }
                    }

                    if (i === 1) {
                        if (allGoalsComplete || this.lost) {
                            this.time.addEvent({
                                delay: 1000,
                                callback: this.allFinished,
                                callbackScope: this
                            });
                        } else {
                            this.playerTurn = true;
                            this.cutter.setFrame(5);
                        }
                    }
                }
            });
        }

        for (let i = 0; i < this.plants.length; i++) {
            if (i !== this.cloud.li && i !== this.cloud.li + 1) {
                this.plants[i].grow(true);
            }
        }

        this.cloud.move();

        this.playerTurn = false;
    }
}
