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
    private climbing: boolean = false;

    private ladderDetectionArea: Phaser.GameObjects.Rectangle;
    private ladderHighlightBox: Phaser.GameObjects.Rectangle;
    private plankDetectionArea1: Phaser.GameObjects.Rectangle;
    private plankDetectionArea2: Phaser.GameObjects.Rectangle;
    private plankDetectionAreasGroup: Phaser.GameObjects.Container;
    private plankHighlightBox: Phaser.GameObjects.Rectangle;
    private plankPlatforms?: Phaser.Physics.Arcade.StaticGroup;
    private plankPlatform?: Phaser.Physics.Arcade.Image;
    private keyDetectionArea: Phaser.GameObjects.Rectangle;

    private levelCompleteText?: Phaser.GameObjects.Text;
    private playerDiedText?: Phaser.GameObjects.Text;
    private howToPlayText?: Phaser.GameObjects.Text;
    private blackBackground: Phaser.GameObjects.Rectangle;

    private freePopText?: Phaser.GameObjects.Text;
    private hearts?: Phaser.GameObjects.Sprite[] = []; 
    private lives: number = 3;
    private isColliding: boolean = false;

    constructor() {
        super({ key: "Level0" });
        console.log("Inital value oflives", this.lives);
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
        this.load.spritesheet(
            "gal_climb", 
            "assets/Pink_Monster_Climb_4.png", 
            { frameWidth: 32, frameHeight: 32,}
        );
        this.load.spritesheet(
            "gal_hurt_right",
            "assets/Pink_Monster_Hurt_4.png", 
            { frameWidth: 32, frameHeight: 32 },
        );
        this.load.spritesheet(
            "gal_hurt_left",
            "assets/Pink_Monster_Hurt_Left4.png",
            { frameWidth: 32, frameHeight: 32},
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
        this.load.image("heart", "assets/heart_16.png");
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
            .setScale(0.77, 0.77)
            .setOrigin(0.5, 0.5);
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
        this.anims.create({
            key: "climb",
            frames: this.anims.generateFrameNumbers("gal_climb", {
                start: 0,
                end: 3,
            }),
        });
        this.anims.create({
            key:"hurt_right",
            frames: this.anims.generateFrameNumbers("gal_hurt_right", {
                start: 0,
                end: 1,
            }),
            frameRate: 10,
            repeat: 0,
        });
        this.anims.create({
            key: "hurt_left",
            frames: this.anims.generateFrameNumbers("gal_hurt_left", {
                start: 4,
                end: 2,
            }),
            frameRate: 10,
            repeat: 0,
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

        const platform1 = this.platforms
            .create(350, 585, "level0-platform")
            .setScale(1, 1);
        const platform2 = this.platforms
            .create(650, 500, "level0-platform")
            .setScale(0.75, 0.75);
        const platform3 = this.platforms
            .create(875, 300, "level0-platform")
            .setScale(1, 0.75);

        this.physics.add.collider(this.player, this.platforms);

        // Create objects: key, ladder, plank, spikes, door
        this.key = this.add.sprite(1200, 650, "key").setScale(2.5, 2.5);
        this.key.setName("key");
        this.physics.add.collider(this.key, this.platforms);

        this.ladder = this.add.sprite(1050, 550, "ladder").setScale(0.5, 0.5);
        this.ladder.setName("ladder");

        this.plank = this.add.sprite(350, 530, "plank").setScale(0.5, 0.5);
        this.plank.setName("plank");

        this.plankPlatforms = this.physics.add.staticGroup();
        this.plankPlatform = this.plankPlatforms.create(
            815,
            600,
            "plank"
        ) as Phaser.Physics.Arcade.Image;

        this.plankPlatform
            .setSize(
                this.plankPlatform.width - 246,
                this.plankPlatform.height - 60
            )
            .setOffset(123, 55);

        this.physics.add.collider(this.player, this.plankPlatform);

        this.plankPlatform.disableBody(true, true);
        this.plankPlatform.setVisible(false);

        this.spikes = this.physics.add.staticGroup();
        const spike1 = this.spikes
            .create(740, 675, "spike")
            .setScale(0.75, 0.75);
        const spike2 = this.spikes
            .create(790, 675, "spike")
            .setScale(0.75, 0.75);
        const spike3 = this.spikes
            .create(840, 675, "spike")
            .setScale(0.75, 0.75);
        const spike4 = this.spikes
            .create(890, 675, "spike")
            .setScale(0.75, 0.75);

        this.door = this.physics.add.image(887, 150, "door").setScale(0.1, 0.1);
        this.physics.add.collider(this.door, this.platforms);

        // Creating lives
        this.freePopText = this.add.text(20, 20, "Free Pops:", {
            fontSize: "26px",
            color: "#03572a",
            fontFamily: "Verdana",
        });

        for (let i = 0; i < this.lives; i++){
            this.hearts?.push(this.add.sprite(190 + (i * 50), 35, "heart").setScale(0.5));
        }
        
        // Set the depth of the character/player sprite to a high value
        this.player.setDepth(1);

        // Set the depth of other game objects to lower values
        this.key.setDepth(0);
        this.ladder.setDepth(0);
        this.plank.setDepth(0);
        this.spikes.setDepth(0);
        this.door.setDepth(0);

        // Resize collision boxes of player and everything else that can be collided with
        this.player
            .setSize(this.player.width - 64, this.player.height)
            .setOffset(32, 0);

        platform1
            .setSize(platform1.width - 12, platform1.height - 28)
            .setOffset(8, 5);
        platform2
            .setSize(platform2.width - 80, platform2.height - 35)
            .setOffset(40, 8);
        platform3
            .setSize(platform3.width - 10, platform3.height - 30)
            .setOffset(7, 7);

        this.door
            .setSize(this.door.width, this.door.height - 60)
            .setOffset(0, 0);

        spike1.setSize(spike1.width - 30, spike1.height - 30).setOffset(15, 14);
        spike2.setSize(spike2.width - 30, spike2.height - 30).setOffset(15, 14);
        spike3.setSize(spike3.width - 30, spike3.height - 30).setOffset(15, 14);
        spike4.setSize(spike4.width - 30, spike4.height - 30).setOffset(15, 14);

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
        this.plankDetectionArea1 = this.add.rectangle(670, 0, 100, 150);
        this.physics.world.enable(this.plankDetectionArea1);
        this.physics.add.collider(this.plankDetectionArea1, this.ground);

        this.plankDetectionArea2 = this.add.rectangle(920, 0, 100, 150);
        this.physics.world.enable(this.plankDetectionArea2);
        this.physics.add.collider(this.plankDetectionArea2, this.ground);

        this.plankDetectionAreasGroup = this.add.container();
        this.plankDetectionAreasGroup.add(this.plankDetectionArea1);
        this.plankDetectionAreasGroup.add(this.plankDetectionArea2);

        // Creating a highlighted rectangle to indicate where plank can be used
        this.plankHighlightBox = this.add.rectangle(
            815,
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

        // Create level complete text
        this.levelCompleteText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            "Level Complete!",
            { fontSize: "96px", color: "#03572a", fontFamily: "Verdana" }
        );
        this.levelCompleteText.setOrigin(0.5);
        this.levelCompleteText.setVisible(false);

        // Set initial properties for animation
        this.levelCompleteText.setScale(0);
        this.levelCompleteText.setAlpha(0);

        // Create player died text
        this.playerDiedText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            "You Died",
            { fontSize: "96px", color: "#8c0615", fontFamily: "Verdana" }
        );
        this.playerDiedText.setOrigin(0.5);
        this.playerDiedText.setVisible(false);
        this.playerDiedText.setDepth(5);

        this.playerDiedText.setScale(0);
        this.playerDiedText.setAlpha(0);

        this.blackBackground = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000
        );
        this.blackBackground.setDepth(4);
        this.blackBackground.setAlpha(0);

        // Temporary how to play text
        this.howToPlayText = this.add.text(
            20,
            150,
            "Press 'E' to collect (push) items \nPress 'F' to use (pop) items where you need them\n(Make sure they're at the top of your StackPack!)\nGood luck unlocking the door!",
            {
                fontSize: "26px",
                color: "#03572a",
                fontFamily: "Verdana",
            }
        );
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
                        poppedItem.setPosition(680, 385);
                        this.ladderHighlightBox.setVisible(false);
                    }
                    if (poppedItem.name === "plank") {
                        poppedItem.setPosition(815, 600);
                        this.plankHighlightBox.setVisible(false);
                        this.plankPlatform?.enableBody(true, 938, 650);
                    }
                    if (poppedItem.name === "key") {
                        this.door?.setTexture("opendoor");
                        // Make the player get sucked into the door
                        if (this.player && this.door) {
                            this.tweens.add({
                                targets: this.player,
                                scaleX: 0.27,
                                scaleY: 0.27,
                                rotation: Math.PI * 3,
                                x: this.door.x - 10,
                                y: this.door.y + 15,
                                duration: 800,
                                onComplete: () => {
                                    this.player?.disableBody(true, true);
                                    // TODO: Transition to game map or next level
                                    // To re-eanble the player later:
                                    /*this.player?.enableBody(
                                        true,
                                        this.player.x,
                                        this.player.y,
                                        true,
                                        true
                                    );*/
                                },
                            });
                        }
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

    private loseLife(){
        if (!this.isColliding && this.player){
            this.isColliding = true;            

            this.player.setVelocity(0,0)
            if (this.lastDirection === "right") {
                this.player.anims.play("hurt_right");
            } else {
                this.player.anims.play("hurt_left");
            }
            this.lives--;
            
            // Removing hearts from free pop
            const heartToRemove = this.hearts?.pop();
            if (heartToRemove) {
                heartToRemove.destroy();
            }

            if (this.lives === 0) {
                this.playerDie();
            }

            // Reset isColliding flag 
            this.time.delayedCall(500, () => {
                this.isColliding = false;
                this.player?.setPosition(100, 450);
            }, [], this)            
        }
    }

    private playerDie() {
        // Show You Died text

        this.playerDiedText?.setVisible(true);

        // Animate you died text and black background
        this.tweens.add({
            targets: [this.playerDiedText, this.blackBackground],
            scale: 1,
            alpha: 1,
            duration: 100,
            ease: "Bounce",
        });

        // Reset the stack and collected items
        this.stack = [];
        this.collectedItems = [];

        // Reload the scene to reset everything
        this.time.delayedCall(800, () => {
            this.scene.start("Level0");
        });
    }

    update() {
        // Key animation
        if (this.key) {
            this.key.anims.play("turn", true);
        }

        // Move the gal with arrow keys
        // Inside your update function or wherever you handle player movement
        if (this.player && this.cursors) {
            if (!this.isColliding){
                if (
                    this.cursors.up.isDown &&
                    this.player.body?.touching.down &&
                    !this.climbing
                ) {
                    this.player.anims.play("jump_right", true);
                    this.player.setVelocityY(-530);
                } else if (this.cursors.right.isDown) {
                    this.player.setVelocityX(290);
                    this.player.anims.play("right", true);
                    this.lastDirection = "right"; // Update last direction
                } else if (this.cursors.left.isDown) {
                    this.player.setVelocityX(-290);
                    this.player.anims.play("left", true);
                    this.lastDirection = "left"; // Update last direction
                } else if (!this.climbing) {
                    this.player.setVelocityX(0);
                    // Check last direction and play corresponding idle animation
                    if (this.lastDirection === "right") {
                        this.player.anims.play("idle_right", true);
                    } else {
                        this.player.anims.play("idle_left", true);
                    }
                }

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
                    this.plankDetectionAreasGroup.getBounds()
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
                    this.levelCompleteText?.setVisible(true);
                    // Animate level complete text
                    this.tweens.add({
                        targets: this.levelCompleteText,
                        scale: 1,
                        alpha: 1,
                        duration: 1000,
                        ease: "Bounce",
                        delay: 500, // Delay the animation slightly
                    });
                }
            } else {
                // Otherwise, hide the highlight box
                this.ladderHighlightBox.setVisible(false);
                this.plankHighlightBox.setVisible(false);
            }
        }

        // Climbing the ladder
        if (this.player && this.ladder && this.cursors) {
            // Max distance player can be from ladder to climb it
            const xTolerance = 30; // Tolerance for X position
            const yTolerance = 145; // Tolerance for Y position
            // Calculate horizontal and vertical distances between player and ladder
            const deltaX = Math.abs(this.player.x - this.ladder.x);
            const deltaY = Math.abs(this.player.y - this.ladder.y);

            if (
                this.ladder.x === 680 &&
                deltaX < xTolerance &&
                deltaY < yTolerance &&
                this.cursors.up.isDown
            ) {
                this.climbing = true;
                this.player.anims.play("climb", true);
                this.player.setVelocityY(-150);
            } else {
                this.climbing = false;
            }
        }

        if (this.player && this.plank && this.spikes) {
            if (this.plank.x === 815) {
                this.physics.world.enable(this.plank);
                this.physics.add.collider(this.plank, this.spikes);
            }
        }

        // Check if player touches the spikes and restart level if so
        if (this.player && this.spikes) {
            this.physics.add.collider(
                this.player,
                this.spikes,
                this.loseLife,
                undefined,
                this
            );
        }
    }
}
