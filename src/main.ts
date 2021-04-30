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
    playerTurn: boolean;
    goals: Goal[];

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

        if (difficulty === 0) {
            this.goals = [
                new Goal(this, 100, 670, 1),
                new Goal(this, 130, 670, 1),
                new Goal(this, 160, 670, 1),
                new Goal(this, 190, 670, 1),
                new Goal(this, 250, 670, 2),
                new Goal(this, 280, 670, 2),
                new Goal(this, 310, 670, 2),
                new Goal(this, 370, 670, 3),
                new Goal(this, 400, 670, 3),
                new Goal(this, 460, 670, 4),
            ];
        } else if (difficulty === 1) {
            this.goals = [
                new Goal(this, 70, 670, 1),
                new Goal(this, 100, 670, 1),
                new Goal(this, 130, 670, 1),
                new Goal(this, 160, 670, 1),
                new Goal(this, 190, 670, 2),
                new Goal(this, 250, 670, 2),
                new Goal(this, 280, 670, 2),
                new Goal(this, 310, 670, 2),
                new Goal(this, 370, 670, 3),
                new Goal(this, 400, 670, 3),
                new Goal(this, 460, 670, 4),
                new Goal(this, 490, 670, 4),
            ];
        } else if (difficulty === 2) {
            this.goals = [
                new Goal(this, 40, 670, 1),
                new Goal(this, 70, 670, 1),
                new Goal(this, 100, 670, 1),
                new Goal(this, 130, 670, 1),
                new Goal(this, 160, 670, 1),
                new Goal(this, 220, 670, 2),
                new Goal(this, 250, 670, 2),
                new Goal(this, 280, 670, 2),
                new Goal(this, 310, 670, 2),
                new Goal(this, 370, 670, 3),
                new Goal(this, 400, 670, 3),
                new Goal(this, 430, 670, 3),
                new Goal(this, 490, 670, 4),
                new Goal(this, 520, 670, 4),
                new Goal(this, 580, 670, 5),
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
                new Goal(this, 520, 670, 4),
                new Goal(this, 550, 670, 4),
                new Goal(this, 610, 670, 5),
                new Goal(this, 640, 670, 5),
            ];
        }

        this.playerTurn = true;

        this.input.on(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove, this);
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

    onPointerMove(event) {
        let x = this.input.activePointer.worldX;
        let y = this.input.activePointer.worldY;
        if (this.playerTurn && y > 100 && y < 700) {
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
        
        // if (this.selecting) {
        //     let i = xtoi(x);
        //     this.upi = i;
        //     this.plants[i].highlight();
        // }
        // let x = this.input.activePointer.worldX;
        // let y = this.input.activePointer.worldY;
        // if (this.playerTurn && y > 100 && y < 700) {
        //     if (li > -1 && li < 6) {
        //         this.cutter.goTo(li);
        //         for (let i = 0; i < this.plants.length; i++) {
        //             if (i === li || i === li + 1) {
        //                 this.plants[i].highlight();
        //             } else {
        //                 this.plants[i].unhighlight();
        //             }
        //         }
        //     } else {
        //         for (let plant of this.plants) {
        //             plant.unhighlight();
        //         }
        //         this.cutter.hide();
        //     }
        // } else {
        //     for (let plant of this.plants) {
        //         plant.unhighlight();
        //     }
        //     this.cutter.hide();
        // }
    }

    onPointerUp() {
        if (!this.playerTurn) return;
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

        for (let goal of this.goals) {
            if (!goal.achieved) {
                for (let i = 0; i < cutPlants.length; i++) {
                    if (!goals[i] && goal.amount === cutSegments[i].length) {
                        goals[i] = goal;
                        break;
                    }
                }
            }
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

                this.tweens.timeline({
                    targets: cutSegments[i],
                    tweens: tweens[i],
                    onComplete: () => {
                        goals[i].achieve();
                        cutSegments[i].destroy();
                        this.playerTurn = true;
                        this.cutter.setFrame(5);
                    }
                });
            } else {
                this.tweens.timeline({
                    targets: cutSegments[i],
                    tweens: tweens[i],
                    onComplete: () => {
                        for (let segment of <PlantSegment[]>cutSegments[i].getAll()) {
                            segment.setTexture('plant-bad', segment.plantType);
                        }
                        this.playerTurn = true;
                        this.cutter.setFrame(5);

                    }
                });
            }
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
