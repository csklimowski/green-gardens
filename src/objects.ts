export class Button extends Phaser.GameObjects.Image {
    onDownCallback: () => void;
    down: boolean;
    disabled: boolean;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, onDownCallback: () => void, disabled?: boolean) {
        super(scene, x, y, texture, 0);
        scene.add.existing(this);
        this.onDownCallback = onDownCallback;
        this.down = false;
        this.disabled = disabled || false;
        if (this.disabled) this.setFrame(2);

        this.setInteractive();
        this.on(Phaser.Input.Events.POINTER_DOWN, this.onDown, this);
        this.on(Phaser.Input.Events.POINTER_OUT, this.onOut, this);
        this.on(Phaser.Input.Events.POINTER_UP, this.onUp, this);
    }

    onOut() {
        if (!this.disabled) {
            this.setFrame(0);
        }
        this.down = false;
    }

    onUp() {
        if (!this.disabled) {
            this.setFrame(0);
            if (this.down) this.onDownCallback();
        }
    }

    onDown() {
        if (!this.disabled) {
            this.setFrame(1);
            this.down = true;
        }
    }
}