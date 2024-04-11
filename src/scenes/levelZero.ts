import Phaser from "phaser";

export default class LevelZero extends Phaser.Scene {
    private player?: Phaser.Physics.Arcade.Sprite;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private key?: Phaser.GameObjects.Sprite;
    private platforms?: Phaser.Physics.Arcade.StaticGroup;
    private spikes?: Phaser.Physics.Arcade.StaticGroup;
    private ladder?: Phaser.GameObjects.Sprite;
    private plank?: Phaser.GameObjects.Sprite;
    private door?: Phaser.Physics.Arcade.Image;
    private ground?: Phaser.Physics.Arcade.Image;

    private stack: Phaser.GameObjects.Sprite[] = [];
    private collectedItems: Phaser.GameObjects.Sprite[] = []; // To track all collected items (even after they're popped from stack)
    private keyE?: Phaser.Input.Keyboard.Key;
    private keyF?: Phaser.Input.Keyboard.Key;
    private keyEPressed: boolean = false; // Flag to check if 'E' was pressed to prevent picking up multiple items from one long key press
    private keyFPressed: boolean = false; // Flag to check if 'E' was pressed to prevent using multiple items from one long key press
    private lastDirection: string = "right";

    private ladderDetectionArea: Phaser.GameObjects.Rectangle;
    private ladderHighlightBox: Phaser.GameObjects.Rectangle;
    private plankDetectionArea: Phaser.GameObjects.Rectangle;
    private plankHighlightBox: Phaser.GameObjects.Rectangle;
    private keyDetectionArea: Phaser.GameObjects.Rectangle;

    constructor() {
        super({ key: "Level0" });
    }

    preload() {
        this.load.image("level0-background", "assets/level0-background.jpg");
        this.load.image("stackpack", "assets/stackpack.png");

        this.load.spritesheet("key", "assets/key.png", {
            frameWidth: 768 / 24,
            frameHeight: 32,
        });

        this.load.spritesheet("gal_right", "assets/Pink_Monster_Walk_6.png", {
            frameWidth: 128,
            frameHeight: 128,
        });
        this.load.spritesheet(
            "gal_left",
            "assets/Pink_Monster_Walk_Left6.png",
            { frameWidth: 128, frameHeight: 128 }
        );
        this.load.spritesheet(
            "gal_idle_right",
            "assets/Pink_Monster_Idle_4.png",
            { frameWidth: 128, frameHeight: 128 }
        );
        this.load.spritesheet(
            "gal_idle_left",
            "assets/Pink_Monster_Idle_Left4.png",
            { frameWidth: 128, frameHeight: 128 }
        );
        this.load.spritesheet(
            "gal_jump_right",
            "assets/Pink_Monster_Jump_8.png",
            { frameWidth: 128, frameHeight: 128 }
        );

        this.load.image("play", "assets/play-button.png");
        this.load.image("level0-platform", "assets/platform.png");
        this.load.image(
            "spike",
            "assets/spikes2/keyframes/long_metal_spike.png"
        );
        this.load.image("ladder", "assets/ladder.png");
        this.load.image("plank", "assets/plank.png");
        this.load.image("door", "assets/door.png");
        this.load.image("opendoor", "assets/open-door.png");
    }

    create() {
        const backgroundImage = this.add
            .image(0, 0, "level0-background")
            .setOrigin(0, 0);
        backgroundImage.setScale(
            this.cameras.main.width / backgroundImage.width,
            this.cameras.main.height / backgroundImage.height
        );

        const stackpack = this.add
            .image(0, 0, "stackpack")
            .setPosition(1170, 165);
        stackpack.setScale(0.26, 0.26);

        this.anims.create({
            key: "turn",
            frames: this.anims.generateFrameNumbers("key", {
                start: 0,
                end: 25,
            }),
            frameRate: 8,
            repeat: -1,
        });
        this.player = this.physics.add
            .sprite(100, 450, "gal_right")
            .setScale(0.77, 0.77);
        this.player.setCollideWorldBounds(true);

        this.anims.create({
            key: "right",
            frames: this.anims.generateFrameNumbers("gal_right", {
                start: 0,
                end: 5,
            }),
            repeat: -1,
        });
        this.anims.create({
            key: "turn",
            frames: [{ key: "gal_right", frame: 1 }],
        });
        this.anims.create({
            key: "left",
            frames: this.anims.generateFrameNumbers("gal_left", {
                start: 0,
                end: 5,
            }),
            repeat: -1,
        });
        this.anims.create({
            key: "idle_right",
            frames: this.anims.generateFrameNumbers("gal_idle_right", {
                start: 0,
                end: 3,
            }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: "idle_left",
            frames: this.anims.generateFrameNumbers("gal_idle_left", {
                start: 0,
                end: 3,
            }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: "jump_right",
            frames: this.anims.generateFrameNumbers("gal_jump_right", {
                start: 0,
                end: 7,
            }),
        });

        this.cursors = this.input.keyboard?.createCursorKeys();

        // Create platforms
        this.platforms = this.physics.add.staticGroup();
        this.ground = this.platforms.create(
            650,
            790,
            "level0-platform"
        ) as Phaser.Physics.Arcade.Image;

        this.ground.setScale(5).refreshBody();
        this.ground.setAlpha(0); // Hide the ground platform

        this.platforms.create(350, 585, "level0-platform").setScale(1, 1);
        this.platforms.create(650, 500, "level0-platform").setScale(0.75, 0.75);
        this.platforms.create(875, 300, "level0-platform").setScale(1, 0.75);

        this.physics.add.collider(this.player, this.platforms);

        // Create objects: key, ladder, plank, spikes, door
        this.key = this.add.sprite(1200, 650, "key").setScale(2.5, 2.5);
        this.key.setName("key");
        this.physics.add.collider(this.key, this.platforms);

        this.ladder = this.add.sprite(1050, 550, "ladder").setScale(0.5, 0.5);
        this.ladder.setName("ladder");

        this.plank = this.add.sprite(350, 530, "plank").setScale(0.5, 0.5);
        this.plank.setName("plank");

        this.spikes = this.physics.add.staticGroup();
        this.spikes.create(790, 675, "spike").setScale(0.75, 0.75);
        this.spikes.create(840, 675, "spike").setScale(0.75, 0.75);
        this.spikes.create(890, 675, "spike").setScale(0.75, 0.75);
        this.spikes.create(940, 675, "spike").setScale(0.75, 0.75);

        this.door = this.physics.add.image(875, 150, "door").setScale(0.1, 0.1);
        this.physics.add.collider(this.door, this.platforms);

        // Set the depth of the character/player sprite to a high value
        this.player.setDepth(1);

        // Set the depth of other game objects to lower values
        this.key.setDepth(0);
        this.ladder.setDepth(0);
        this.plank.setDepth(0);
        this.spikes.setDepth(0);
        this.door.setDepth(0);

        // Define keys 'E' and 'F' for collecting and using items respectively
        this.keyE = this.input.keyboard?.addKey(
            Phaser.Input.Keyboard.KeyCodes.E
        );
        this.keyF = this.input.keyboard?.addKey(
            Phaser.Input.Keyboard.KeyCodes.F
        );

        // Creating dectection areas when using the ladder
        this.ladderDetectionArea = this.add.rectangle(680, 400, 100, 150);
        this.physics.world.enable(this.ladderDetectionArea);
        this.physics.add.collider(this.ladderDetectionArea, this.ground);
        this.physics.add.collider(this.ladderDetectionArea, this.platforms);

        // Creating a highlighted rectangle to indicate where ladder can be used
        this.ladderHighlightBox = this.add.rectangle(
            680,
            400,
            100,
            150,
            0xffff00
        );
        this.ladderHighlightBox.setAlpha(0.25);
        this.ladderHighlightBox.setVisible(false);

        // Creating dectection areas when using the plank
        this.plankDetectionArea = this.add.rectangle(700, 0, 100, 150);
        this.physics.world.enable(this.plankDetectionArea);
        this.physics.add.collider(this.plankDetectionArea, this.ground);

        // Creating a highlighted rectangle to indicate where plank can be used
        this.plankHighlightBox = this.add.rectangle(
            860,
            210,
            215,
            50,
            0xffff00
        );
        this.physics.world.enable(this.plankHighlightBox);
        this.physics.add.collider(this.plankHighlightBox, this.ground);
        this.physics.add.collider(this.plankHighlightBox, this.spikes);
        this.plankHighlightBox.setAlpha(0.25);
        this.plankHighlightBox.setVisible(false);

        // Creating detection area when using key
        this.keyDetectionArea = this.add.rectangle(875, 150, 200, 200);
        this.physics.world.enable(this.keyDetectionArea);
        this.physics.add.collider(this.keyDetectionArea, this.platforms);
    }

    private updateStackView() {
        const offsetX = 1170; // starting X position for stack items
        const offsetY = 270; // starting Y position for stack items
        const padding = 20;

        let currTotalHeight = 0;

        this.stack.forEach((item) => {
            // Calculate and set (x, y) position of stack items in stackpack view
            item.setOrigin(0.5, 0);
            const stackItemX = offsetX;
            const stackItemY =
                offsetY - item.displayHeight - currTotalHeight - padding;
            currTotalHeight += item.displayHeight + padding;

            // Animation to drop the item into its position in the stackpack
            this.tweens.add({
                targets: item,
                x: stackItemX,
                y: stackItemY,
                duration: 800,
                ease: "Cubic.InOut",
            });
        });
    }

    private collectItem(item: Phaser.GameObjects.Sprite) {
        if (this.collectedItems.includes(item)) {
            return;
        }

        // Save the x and y scales of the collected item
        const currScaleX = item.scaleX;
        const currScaleY = item.scaleY;

        // Animation to make item bigger, then smaller, and then fly up to stackpack
        this.tweens.add({
            targets: item,
            scaleX: currScaleX * 1.5, // Scale up item size for a bit
            scaleY: currScaleY * 1.5,
            duration: 180,
            ease: "Exponential.InOut",
            onComplete: () => {
                this.tweens.add({
                    targets: item,
                    scaleX: currScaleX, // Scale down item back to normal
                    scaleY: currScaleY,
                    duration: 150,
                    ease: "Exponential.InOut",
                    onComplete: () => {
                        // Move item to the stackpack view
                        this.tweens.add({
                            targets: item,
                            x: 1170,
                            y: -10, // Y position of item before it is dropped into its actual position in stackpack
                            scaleX: currScaleX * 0.5, // Scale down the item for stackpack view
                            scaleY: currScaleY * 0.5,
                            rotation: Math.PI * 2, // Rotate the item while moving it to stackpack
                            duration: 940,
                            ease: "Cubic.In",
                            onComplete: () => {
                                // Add the item to the stack
                                this.stack.push(item);
                                this.updateStackView();
                            },
                        });
                    },
                });
            },
        });

        // Add the item to the grand list of collected items
        this.collectedItems.push(item);

        this.updateStackView();
    }

    private useItem() {
        const isTweening = this.tweens
            .getTweens()
            .some((tween) => tween.isPlaying());

        // If a push or pop animation is currently in progress, don't pop (cuz it causes a bug)
        if (isTweening) {
            return;
        }

        // Remove the top item from the stackpack
        const poppedItem = this.stack.pop();

        if (poppedItem) {
            // Animation to fade item out from stackpack and then fade in in its new location
            this.tweens.add({
                targets: poppedItem,
                alpha: 0, // Fade out
                duration: 200,
                onComplete: () => {
                    // Set item origin back to default (center)
                    poppedItem.setOrigin(0.5, 0.5);

                    // Move popped item to location it will be used
                    if (poppedItem.name === "ladder") {
                        poppedItem.setPosition(680, 400);
                        this.ladderHighlightBox.setVisible(false);
                    }
                    if (poppedItem.name === "plank") {
                        poppedItem.setPosition(850, 600);
                        this.plankHighlightBox.setVisible(false);
                    }
                    if (poppedItem.name === "key") {
                        this.door?.setTexture("opendoor");
                    }

                    this.tweens.add({
                        targets: poppedItem,
                        scaleX: poppedItem.scaleX * 2,
                        scaleY: poppedItem.scaleY * 2,
                        alpha: 1, // Fade in
                        duration: 300,
                        onComplete: () => {
                            this.updateStackView();
                        },
                    });
                },
            });
        }
    }

    update() {
        // Key animation
        if (this.key) {
            this.key.anims.play("turn", true);
        }

        // Move the gal with arrow keys
        // Inside your update function or wherever you handle player movement
        if (this.player && this.cursors) {
            if (this.cursors.right.isDown) {
                this.player.setVelocityX(290);
                this.player.anims.play("right", true);
                this.lastDirection = "right"; // Update last direction
            } else if (this.cursors.left.isDown) {
                this.player.setVelocityX(-290);
                this.player.anims.play("left", true);
                this.lastDirection = "left"; // Update last direction
            } else {
                this.player.setVelocityX(0);
                // Check last direction and play corresponding idle animation
                if (this.lastDirection === "right") {
                    this.player.anims.play("idle_right", true);
                } else {
                    this.player.anims.play("idle_left", true);
                }
            }
            if (this.cursors.up.isDown && this.player.body?.touching.down) {
                this.player.anims.play("jump_right", true);
                this.player.setVelocityY(-530);
            }
        }

        // Collect item if 'E' key is pressed
        if (this.player && this.keyE?.isDown && !this.keyEPressed) {
            this.keyEPressed = true; // Set the flag for the E key being pressed to true

            // Check if the player is close enough to the key, ladder, or plank, and if so, collect it
            if (
                this.key &&
                Phaser.Math.Distance.Between(
                    this.player.x,
                    this.player.y,
                    this.key.x,
                    this.key.y
                ) < 100
            ) {
                this.collectItem(this.key);
            }
            if (
                this.ladder &&
                Phaser.Math.Distance.Between(
                    this.player.x,
                    this.player.y,
                    this.ladder.x,
                    this.ladder.y
                ) < 100
            ) {
                this.collectItem(this.ladder);
            }
            if (
                this.plank &&
                Phaser.Math.Distance.Between(
                    this.player.x,
                    this.player.y,
                    this.plank.x,
                    this.plank.y
                ) < 100
            ) {
                this.collectItem(this.plank);
            }
        }
        // Check if 'E' key is released
        if (this.keyE?.isUp) {
            this.keyEPressed = false; // Reset the keyEPressed flag when the E key is released
        }

        // Check if 'F' key is released
        if (this.keyF?.isUp) {
            this.keyFPressed = false; // Reset the keyFPressed flag when the F key is released
        }

        // Check if player is near detection area
        if (this.player && this.stack.length > 0) {
            if (
                Phaser.Geom.Intersects.RectangleToRectangle(
                    this.player.getBounds(),
                    this.ladderDetectionArea.getBounds()
                ) &&
                this.stack[this.stack.length - 1].name === "ladder"
            ) {
                // If player overlaps with ladder detection area, show the highlight box
                this.ladderHighlightBox.setVisible(true);
                if (this.keyF?.isDown && !this.keyFPressed) {
                    this.keyFPressed = true;
                    this.useItem();
                }
            } else if (
                Phaser.Geom.Intersects.RectangleToRectangle(
                    this.player.getBounds(),
                    this.plankDetectionArea.getBounds()
                ) &&
                this.stack[this.stack.length - 1].name === "plank"
            ) {
                // If player overlaps with plank detection area, show the highlight box
                this.plankHighlightBox.setVisible(true);
                if (this.keyF?.isDown && !this.keyFPressed) {
                    this.keyFPressed = true;
                    this.useItem();
                }
            } else if (
                Phaser.Geom.Intersects.RectangleToRectangle(
                    this.player.getBounds(),
                    this.keyDetectionArea.getBounds()
                ) &&
                this.stack[this.stack.length - 1].name === "key"
            ) {
                // If player overlaps with key detection area, open door
                if (this.keyF?.isDown && !this.keyFPressed) {
                    this.keyFPressed = true;
                    this.useItem();
                }
            } else {
                // Otherwise, hide the highlight box
                this.ladderHighlightBox.setVisible(false);
                this.plankHighlightBox.setVisible(false);
            }
        }

        // Climbing the laddder
        if (this.player && this.ladder && this.cursors) {
            if (
                this.ladder.x === 680 &&
                this.cursors.up.isDown &&
                this.player.y < 800 &&
                this.player.x >= 670 &&
                this.player.x <= this.ladder.x + this.ladder.width &&
                this.player.body?.touching.down
            ) {
                this.player.anims.play("jump_right", true);
                this.player.setVelocityY(-650);
            }
        }

        if (this.player && this.plank && this.spikes) {
            if (this.plank.x === 850) {
                this.physics.world.enable(this.plank);
                this.physics.add.collider(this.plank, this.spikes);
                this.physics.add.collider(this.player, this.plank);
            }
        }
    }
}
