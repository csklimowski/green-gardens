const PLANT_WIDTH = 90;
const PLANT_HEIGHT = 60;

function itox(i: number) {
    return i*PLANT_WIDTH + 90;
}

function pick(arr: any[]) {
    return arr[Math.floor(Math.random()*arr.length)];
}

class PlantSegment extends Phaser.GameObjects.Image {
    plantType: number;
    species: number;
    constructor(scene: Phaser.Scene, x: number, y: number, species?: number) {
        let type = pick([0, 1, 2, 3, 4]);
        super(scene, x, y, 'plant' + (species === 2 ? '2' : ''), type);
        scene.add.existing(this);
        this.setFlipX(Math.random() > 0.5);
        this.plantType = type;
        if (!species) this.species = 1;
        else this.species = species;
    }
    highlight() {
        this.setTexture('plant' + (this.species === 2 ? '2' : '') + '-highlight', this.plantType);
    }
    unhighlight() {
        this.setTexture('plant' + (this.species === 2 ? '2' : ''), this.plantType);
    }
}

class Plant  {
    x: number;
    y: number;
    segments: PlantSegment[];
    height: number;
    scene: Phaser.Scene;
    species: number;

    constructor(scene: Phaser.Scene, x: number, y: number, species?: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.height = 0;
        this.segments = [
            new PlantSegment(scene, x, y, species)
        ];

        if (!species) this.species = 1;
        else this.species = 2;

        
    }

    grow(slow?: boolean) {
        this.segments.push(new PlantSegment(this.scene, this.x, this.y + PLANT_HEIGHT, this.species));
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
        segmentBag.setDepth(3);
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
    species: number;
    
    constructor(scene: Phaser.Scene, x: number, y: number, amount: number, species?: number) {
        super(scene, x, y);
        scene.add.existing(this);
        this.setDepth(2);
        this.amount = amount;
        if (!species) this.species = 1;
        else this.species = species;

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

        if (false) {
            // this.goals = [
            //     new Goal(this, 100, 680, 1),
            //     new Goal(this, 130, 680, 1),
            //     new Goal(this, 160, 680, 1),
            //     new Goal(this, 190, 680, 1),
            //     new Goal(this, 250, 680, 2),
            //     new Goal(this, 280, 680, 2),
            //     new Goal(this, 310, 680, 2),
            //     new Goal(this, 370, 680, 3),
            //     new Goal(this, 400, 680, 3),
            //     new Goal(this, 460, 680, 4),
            // ];

            this.goals = [
                new Goal(this, 70, 680, 1),
                new Goal(this, 100, 680, 1),
                new Goal(this, 130, 680, 1),
                new Goal(this, 160, 680, 1),
                new Goal(this, 190, 680, 2),
                new Goal(this, 250, 680, 2),
                new Goal(this, 280, 680, 2),
                new Goal(this, 310, 680, 2),
                new Goal(this, 370, 680, 3),
                new Goal(this, 400, 680, 3),
                new Goal(this, 460, 680, 4),
                new Goal(this, 490, 680, 4),
            ];
        } else {
            this.goals = [
                new Goal(this, 40, 680, 1),
                new Goal(this, 70, 680, 1),
                new Goal(this, 100, 680, 1),
                new Goal(this, 130, 680, 1),
                new Goal(this, 160, 680, 1),
                new Goal(this, 250, 680, 2),
                new Goal(this, 280, 680, 2),
                new Goal(this, 310, 680, 2),
                new Goal(this, 340, 680, 2),
                new Goal(this, 370, 680, 3),
                new Goal(this, 400, 680, 3),
                new Goal(this, 430, 680, 3),
                new Goal(this, 460, 680, 4),
                new Goal(this, 490, 680, 4),
                new Goal(this, 520, 680, 5),
            ];


            // this.goals = [
            //     new Goal(this, 40, 680, 1),
            //     new Goal(this, 70, 680, 1),
            //     new Goal(this, 100, 680, 1),
            //     new Goal(this, 130, 680, 1),
            //     new Goal(this, 160, 680, 1),
            //     new Goal(this, 190, 680, 1),
            //     new Goal(this, 250, 680, 2),
            //     new Goal(this, 280, 680, 2),
            //     new Goal(this, 310, 680, 2),
            //     new Goal(this, 340, 680, 2),
            //     new Goal(this, 400, 680, 3),
            //     new Goal(this, 430, 680, 3),
            //     new Goal(this, 460, 680, 3),
            //     new Goal(this, 490, 680, 3),
            //     new Goal(this, 520, 680, 4),
            //     new Goal(this, 550, 680, 4),
            //     new Goal(this, 610, 680, 5),
            //     new Goal(this, 640, 680, 5),
            // ];

            // this.goals = [
            //     new Goal(this, -20, 680, 1, 1),
            //     new Goal(this, 10, 680, 1, 1),
            //     new Goal(this, 40, 680, 1, 1),
            //     new Goal(this, 70, 680, 1, 1),
            //     new Goal(this, 100, 680, 2, 1),
            //     new Goal(this, 130, 680, 2, 1),
            //     new Goal(this, 160, 680, 2, 1),
            //     new Goal(this, 190, 680, 3, 1),
            //     new Goal(this, 220, 680, 3, 1),
            //     new Goal(this, 250, 680, 4, 1),
            //     new Goal(this, 310, 680, 1, 2),
            //     new Goal(this, 340, 680, 1, 2),
            //     new Goal(this, 370, 680, 1, 2),
            //     new Goal(this, 400, 680, 2, 2),
            //     new Goal(this, 430, 680, 2, 2),
            //     new Goal(this, 460, 680, 3, 2)
            // ];
        }


        for (let goal of this.goals) {
            goal.x += 80;
            goal.y -= 10;
        }

        this.playerTurn = true;

        this.input.on(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove, this);
        this.input.on(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown, this);
        this.input.on(Phaser.Input.Events.POINTER_UP, this.onPointerUp, this);
    }

    onPointerDown() {

    }

    onPointerMove() {
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
    }

    onPointerUp() {
        if (this.playerTurn && this.cutter.li > -1 && this.cutter.li < 6) {

            this.cutter.anims.play('cut');

            let plant1 = this.plants[this.cutter.li];
            let plant2 = this.plants[this.cutter.li + 1];

            plant1.unhighlight();
            let segs1 = plant1.cut();
            plant2.unhighlight();
            let segs2 = plant2.cut();

            let segs1tweens: any[] = [{
                props: {
                    y: segs1.y - (60 + Math.random()*10),
                    angle: Math.random() * 10 - 5
                },
                duration: 300,
                ease: Phaser.Math.Easing.Quadratic.Out
            }];

            let segs2tweens: any[] = [{
                props: {
                    y: segs2.y - (60 + Math.random()*10),
                    angle: Math.random() * 10 - 5
                },
                duration: 300,
                ease: Phaser.Math.Easing.Quadratic.Out
            }];
            
            let segs1goal: Goal = null;
            let segs2goal: Goal = null;

            for (let goal of this.goals) {
                if (!goal.achieved) {
                    if (!segs1goal && goal.amount === segs1.length && goal.species === plant1.species) {
                        segs1goal = goal;
                    } else if (!segs2goal && goal.amount === segs2.length && goal.species === plant2.species) {
                        segs2goal = goal;
                    }
                }
            }

            if (segs1goal) {
                segs1tweens.push({
                    props: {
                        y: segs1goal.y,
                        x: segs1goal.x,
                        scaleX: 0.3,
                        scaleY: 0.3
                    },
                    duration: 500,
                    ease: Phaser.Math.Easing.Cubic.In
                });
                
                this.tweens.timeline({
                    targets: segs1,
                    tweens: segs1tweens,
                    onComplete: () => {
                        segs1goal.achieve();
                        segs1.destroy();
                        this.playerTurn = true;
                        this.cutter.setFrame(5);
                        this.onPointerMove();
                    }
                });
            }

            if (segs2goal) {
                segs2tweens.push({
                    props: {
                        y: segs2goal.y,
                        x: segs2goal.x,
                        scaleX: 0.3,
                        scaleY: 0.3
                    },
                    delay: 150,
                    duration: 500,
                    ease: Phaser.Math.Easing.Cubic.In
                });

                this.tweens.timeline({
                    targets: segs2,
                    tweens: segs2tweens,
                    onComplete: () => {
                        segs2goal.achieve();
                        segs2.destroy();
                        this.playerTurn = true;
                        this.cutter.setFrame(5);
                        this.onPointerMove();
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
}
