import Phaser from "phaser";

export default class LevelOne extends Phaser.Scene {
    // General Assets
    private player?: Phaser.Physics.Arcade.Sprite;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private key?: Phaser.GameObjects.Sprite;
    private platforms?: Phaser.Physics.Arcade.StaticGroup;
    private banana?: Phaser.Physics.Arcade.Sprite;
    private bananaBubble?: Phaser.GameObjects.Image;
    private mushroom?: Phaser.Physics.Arcade.Sprite;
    private vineItem?: Phaser.Physics.Arcade.Sprite;
    private stone?: Phaser.Physics.Arcade.Sprite;
    private ground?: Phaser.Physics.Arcade.Image;
    private monkey?: Phaser.Physics.Arcade.Sprite;
    private river?: Phaser.Physics.Arcade.Sprite;
    private groundRectangle?: Phaser.GameObjects.Rectangle;
    private stackRectangle?: Phaser.GameObjects.Rectangle;
    private vineSwing?: Phaser.GameObjects.Sprite;
    private door?: Phaser.GameObjects.Image;

    // Highlight Boxes
    private stoneDetectionBox?: Phaser.GameObjects.Rectangle;
    private stoneHighlightBox?: Phaser.GameObjects.Rectangle;
    private stonePlatform?: Phaser.Physics.Arcade.Image;
    private stonePlatforms?: Phaser.Physics.Arcade.StaticGroup;

    private mushroomDetectionBox?: Phaser.GameObjects.Rectangle;
    private mushroomHighlightBox?: Phaser.GameObjects.Rectangle;
    private mushroomPopped?: boolean = false;

    private bananaDetectionBox?: Phaser.GameObjects.Rectangle;
    private bananaHighlightBox?: Phaser.GameObjects.Rectangle;

    private vineHighlightBox?: Phaser.GameObjects.Rectangle;

    private keyDetectionArea?: Phaser.GameObjects.Rectangle;

    // Functionality
    private stack: Phaser.GameObjects.Sprite[] = [];
    private collectedItems: Phaser.GameObjects.Sprite[] = []; // To track all collected items (even after they're popped from stack)
    private keyE?: Phaser.Input.Keyboard.Key;
    private keyF?: Phaser.Input.Keyboard.Key;
    private keyEPressed: boolean = false; // Flag to check if 'E' was pressed to prevent picking up multiple items from one long key press
    private keyFPressed: boolean = false;
    private isPushingMap: { [key: string]: boolean } = {};
    private hearts?: Phaser.GameObjects.Sprite[] = [];
    private lives: number = 3;
    private stackY: number = 300;
    private stoneStackImg: Phaser.GameObjects.Image;
    private mushroomStackImg: Phaser.GameObjects.Image;
    private bananaStackImg: Phaser.GameObjects.Image;
    private vineStackImg: Phaser.GameObjects.Image;
    private keyStackImg: Phaser.GameObjects.Image;
    private levelCompleteText?: Phaser.GameObjects.Text;

    // For Player animations
    private lastDirection: string = "right";
    private isColliding: boolean = false;
    private collidingWithWater: boolean = false;

    constructor() {
        super({ key: "Level1" });
    }

    preload() {
        this.load.image(
            "level1Background",
            "assets/level1/Level1Background.jpg"
        );
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
            {
                frameWidth: 128,
                frameHeight: 128,
            }
        );
        this.load.spritesheet(
            "gal_idle_right",
            "assets/Pink_Monster_Idle_4.png",
            {
                frameWidth: 128,
                frameHeight: 128,
            }
        );
        this.load.spritesheet(
            "gal_idle_left",
            "assets/Pink_Monster_Idle_Left4.png",
            {
                frameWidth: 128,
                frameHeight: 128,
            }
        );
        this.load.spritesheet(
            "gal_jump_right",
            "assets/Pink_Monster_Jump_8.png",
            {
                frameWidth: 128,
                frameHeight: 128,
            }
        );
        this.load.spritesheet("gal_climb", "assets/Pink_Monster_Climb_4.png", {
            frameWidth: 128,
            frameHeight: 128,
        });
        this.load.spritesheet(
            "gal_hurt_right",
            "assets/Pink_Monster_Hurt_4.png",
            {
                frameWidth: 128,
                frameHeight: 128,
            }
        );
        this.load.spritesheet(
            "gal_hurt_left",
            "assets/Pink_Monster_Hurt_Left4.png",
            {
                frameWidth: 128,
                frameHeight: 128,
            }
        );
        this.load.image("banana", "assets/level1/banana.png");
        this.load.image("bananaBubble", "assets/level1/bananaBubble.png");
        this.load.image("LgPlatform", "assets/level1/LgPlatform.png");
        this.load.image("MdPlatform", "assets/level1/MdPlatform.png");
        this.load.image("SmPlatform", "assets/level1/SmPlatform.png");
        this.load.image("monkey", "assets/level1/monkey.png");
        this.load.image("mushroom", "assets/level1/mushroom.png");
        this.load.image("vineItem", "assets/level1/vineItem.png");
        this.load.image("stone", "assets/level1/stone.png");
        this.load.image("river", "assets/level1/river.png");
        this.load.image("heart", "assets/heart_16.png");
        this.load.image("vineHook", "assets/level1/vineHook.png");
        this.load.image("vine", "assets/level1/vine.png");
        this.load.image("stackKey", "assets/level1/stackKey.png");
        this.load.image("door", "assets/level1/brown-door.png");
        this.load.image("openDoor", "assets/level1/brown-door-open.png");
    }

    create() {
        const backgroundImage = this.add
            .image(0, 0, "level1Background")
            .setOrigin(0, 0);
        backgroundImage.setScale(
            this.cameras.main.width / backgroundImage.width,
            this.cameras.main.height / backgroundImage.height
        );

        const stackpack = this.add
            .image(0, 0, "stackpack")
            .setPosition(1170, 165);
        stackpack.setScale(0.26, 0.26);

        this.add.image(640, 70, "vineHook").setScale(0.6, 0.6);

        this.player = this.physics.add
            .sprite(100, 600, "gal_right")
            .setScale(0.77, 0.77)
            .setOrigin(0.5, 0.5);
        this.player.setCollideWorldBounds(true);

        // KEY ANIM
        this.anims.create({
            key: "turn",
            frames: this.anims.generateFrameNumbers("key", {
                start: 0,
                end: 25,
            }),
            frameRate: 8,
            repeat: -1,
        });

        // PLAYER ANIMS
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
            frameRate: 15,
        });
        this.anims.create({
            key: "hurt_right",
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

        // PLATFORMS
        this.platforms = this.physics.add.staticGroup();
        this.ground = this.platforms.create(
            600,
            770,
            "LgPlatform"
        ) as Phaser.Physics.Arcade.Image;
        this.ground.setSize(this.ground.width + 1100, this.ground.height - 370);

        this.groundRectangle = this.add.rectangle(
            600,
            770,
            1400,
            200,
            0x172808
        );

        this.groundRectangle.depth = 99;

        const platform1 = this.platforms
            .create(290, 585, "SmPlatform")
            .setScale(0.7, 0.7);
        const platform2 = this.platforms
            .create(350, 340, "MdPlatform")
            .setScale(0.7, 0.7);
        const platform3 = this.platforms
            .create(810, 450, "LgPlatform")
            .setScale(1.3, 0.75);
        const platform4 = this.platforms
            .create(900, 250, "SmPlatform")
            .setScale(0.7, 0.7);
        platform1
            .setSize(platform1.width - 210, platform1.height - 550)
            .setOffset(110, 260);
        platform2
            .setSize(platform2.width - 150, platform2.height - 550)
            .setOffset(75, 260);
        platform3
            .setSize(platform2.width + 60, platform2.height - 550)
            .setOffset(-30, 260);
        platform4
            .setSize(platform2.width - 210, platform2.height - 550)
            .setOffset(105, 260);
        this.physics.add.collider(this.player, this.platforms);

        // KEY ITEM
        this.key = this.add.sprite(290, 270, "key").setScale(2.5, 2.5);
        this.physics.add.collider(this.key, this.platforms);
        this.key.setSize(this.key.width - 100, this.key.height - 100);
        this.key.setName("key");

        this.player
            .setSize(this.player.width - 64, this.player.height - 12)
            .setOffset(32, 10).depth = 100;

        // ALL ITEMS SPAWNING
        this.banana = this.physics.add
            .sprite(900, 380, "banana")
            .setScale(0.5, 0.5);
        this.physics.add.collider(this.banana, this.platforms);
        this.banana.setSize(this.banana.width - 100, this.banana.height - 400);
        this.banana.setName("banana");

        this.stone = this.physics.add
            .sprite(300, 620, "stone")
            .setScale(0.3, 0.3);
        this.physics.add.collider(this.stone, this.platforms);
        this.stone.setSize(this.stone.width + 200, this.stone.height + 20);
        this.stone.setName("stone");

        this.mushroom = this.physics.add
            .sprite(300, 500, "mushroom")
            .setScale(0.5, 0.5);
        this.physics.add.collider(this.mushroom, this.platforms);
        this.mushroom.setSize(
            this.mushroom.width - 100,
            this.mushroom.height - 400
        );
        this.mushroom.setName("mushroom");
        this.mushroom.setPushable(false);

        this.monkey = this.physics.add
            .sprite(390, 200, "monkey")
            .setScale(0.5, 0.5);
        this.physics.add.collider(this.monkey, this.platforms);
        this.monkey.setSize(this.monkey.width - 300, this.monkey.height - 200);
        this.monkey.setName("monkey");
        this.monkey.setPushable(false);
        this.physics.add.collider(this.monkey, this.player);

        this.vineItem = this.physics.add
            .sprite(700, 350, "vineItem")
            .setScale(0.5, 0.5);
        this.physics.add.collider(this.vineItem, this.platforms);
        this.vineItem.setSize(
            this.vineItem.width - 100,
            this.vineItem.height - 350
        );
        this.vineItem.setName("vineItem");

        this.river = this.physics.add
            .sprite(700, 630, "river")
            .setScale(0.8, 0.8);
        this.physics.add.collider(this.river, this.platforms);
        this.river
            .setSize(this.river.width - 20, this.river.height - 450)
            .setOffset(10, 200);
        this.physics.add.collider(this.river, this.player);
        this.river.setPushable(false);
        this.river.setName("river");

        this.bananaBubble = this.add
            .image(280, 130, "bananaBubble")
            .setScale(0.7, 0.7);

        this.vineSwing = this.add.sprite(655, 140, "vine").setScale(0.35, 0.35);
        this.vineSwing.setOrigin(0.5, 0);
        this.vineSwing.setAngle(this.vineSwing.angle + 60);
        this.vineSwing.setVisible(false);

        this.door = this.add.image(910, 140, "door").setScale(0.35, 0.35);

        // Handling Pushing.Popping
        this.keyE = this.input.keyboard?.addKey(
            Phaser.Input.Keyboard.KeyCodes.E
        );
        this.keyF = this.input.keyboard?.addKey(
            Phaser.Input.Keyboard.KeyCodes.F
        );

        // PULSATING
        this.createPulsateEffect(
            this,
            this.mushroom,
            1.1, // Scale factor for pulsating effect
            1000 // Duration of each tween cycle in milliseconds
        );
        this.createPulsateEffect(
            this,
            this.banana,
            1.1, // Scale factor for pulsating effect
            1000 // Duration of each tween cycle in milliseconds
        );
        this.createPulsateEffect(
            this,
            this.vineItem,
            1.1, // Scale factor for pulsating effect
            1000 // Duration of each tween cycle in milliseconds
        );
        this.createPulsateEffect(
            this,
            this.stone,
            1.1, // Scale factor for pulsating effect
            1000 // Duration of each tween cycle in milliseconds
        );

        // Create Lives
        this.createHearts();

        // Invisible check boxes
        /*const stackPlatform = this.platforms
            .create(1170, 300, "SmPlatform")
            .setScale(0.5, 0.5);
        this.physics.add.collider(stackPlatform, this.stone);
        stackPlatform.setSize(
            stackPlatform.width - 300,
            stackPlatform.height - 500
        );
        stackPlatform.setOffset(150, 250);
        stackPlatform.setVisible(false);*/

        this.stoneDetectionBox = this.add.rectangle(540, 600, 100, 150);
        this.physics.world.enable(this.stoneDetectionBox);
        this.physics.add.collider(this.stoneDetectionBox, this.ground);
        this.physics.add.collider(this.stoneDetectionBox, this.river);

        this.stoneHighlightBox = this.add.rectangle(
            700,
            600,
            100,
            80,
            0xffff00
        );
        this.stoneHighlightBox.setAlpha(0.3);
        this.stoneHighlightBox.setVisible(false);

        this.stonePlatforms = this.physics.add.staticGroup();
        this.stonePlatform = this.stonePlatforms.create(
            700,
            600,
            "SmPlatform"
        ) as Phaser.Physics.Arcade.Image;
        this.stonePlatform
            .setSize(
                this.stonePlatform.width - 250,
                this.stonePlatform.height - 500
            )
            .setScale(0.5, 0.5);
        this.stonePlatform.setVisible(false);
        this.physics.add.collider(this.stonePlatform, this.player);
        this.stonePlatform.disableBody(true, true);

        this.mushroomDetectionBox = this.add.rectangle(1070, 600, 100, 150);
        this.physics.world.enable(this.mushroomDetectionBox);
        this.physics.add.collider(this.mushroomDetectionBox, this.ground);

        this.mushroomHighlightBox = this.add.rectangle(
            1160,
            640,
            100,
            150,
            0xffff00
        );
        this.mushroomHighlightBox.setAlpha(0.3);
        this.mushroomHighlightBox.setVisible(false);

        this.bananaDetectionBox = this.add.rectangle(440, 200, 100, 150);
        this.physics.world.enable(this.bananaDetectionBox);
        this.physics.add.collider(this.bananaDetectionBox, this.platforms);

        this.bananaHighlightBox = this.add.rectangle(
            280,
            120,
            80,
            80,
            0xffff00
        );
        this.bananaHighlightBox.setAlpha(0.3);
        this.bananaHighlightBox.setVisible(false);

        this.vineHighlightBox = this.add.rectangle(647, 130, 50, 50, 0xffff00);
        this.vineHighlightBox.setAlpha(0.5);
        this.vineHighlightBox.setVisible(false);

        this.keyDetectionArea = this.add.rectangle(890, 100, 200, 150);
        this.physics.world.enable(this.keyDetectionArea);
        this.physics.add.collider(this.keyDetectionArea, this.platforms);

        // setting depths
        this.stone.depth = 1;
        this.river.depth = 0;

        // Level complete stuff
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
    }

    // HELPER FUNCTIONS

    private vineSwingStart() {
        if (this.vineSwing && this.player) {
            this.vineSwing.setOrigin(0.5, 0);
            this.tweens.add({
                targets: this.vineSwing,
                angle: this.vineSwing.angle - 120,
            });
            this.tweens.add({
                targets: this.player,
                x: 800,
                y: 200,
            });
            this.tweens.add({
                targets: this.player,
                x: 890,
                y: 100,
            });
        }
    }

    private imageViewInStack(item: Phaser.GameObjects.Sprite) {
        const buffer = 50;
        if (item.name === "stone") {
            this.stoneStackImg = this.add
                .image(1170, this.stackY - buffer, item.name)
                .setScale(0.15, 0.15)
                .setSize(80, 80);
        } else if (item.name === "mushroom") {
            this.mushroomStackImg = this.add
                .image(1170, this.stackY - buffer, item.name)
                .setScale(0.15, 0.15)
                .setSize(80, 80);
        } else if (item.name === "banana") {
            this.bananaStackImg = this.add
                .image(1170, this.stackY - buffer, item.name)
                .setScale(0.15, 0.15)
                .setSize(80, 80);
        } else if (item.name === "vineItem") {
            this.vineStackImg = this.add
                .image(1170, this.stackY - buffer, item.name)
                .setScale(0.15, 0.15)
                .setSize(80, 80);
        } else if (item.name === "key") {
            this.keyStackImg = this.add
                .image(1170, this.stackY - buffer, "stackKey")
                .setScale(1.4, 1.4)
                .setSize(80, 80);
        }
        this.stackY -= buffer;
    }

    private imageViewOutStack(item: Phaser.GameObjects.Sprite) {
        if (item.name === "stone") {
            this.stoneStackImg.setVisible(false);
            this.stackY = this.stackY + 50;
        } else if (item.name === "mushroom") {
            this.mushroomStackImg.setVisible(false);
            this.stackY = this.stackY + 50;
        } else if (item.name === "banana") {
            this.bananaStackImg.setVisible(false);
            this.stackY = this.stackY + 50;
        } else if (item.name === "vineItem") {
            this.vineStackImg.setVisible(false);
            this.stackY = this.stackY + 50;
        } else if (item.name === "key") {
            this.keyStackImg.setVisible(false);
            this.stackY = this.stackY + 50;
        }
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
                onComplete: () => {
                    this.isPushingMap[item.name] = false;
                },
            });
        });
    }
    private collectItem(item: Phaser.GameObjects.Sprite) {
        if (this.collectedItems.includes(item)) {
            return;
        }

        this.isPushingMap[item.name] = true;
        if (item.name === "mushroom" && this.mushroom) {
            //this.mushroom.setGravity(0, 0);
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
                                item.setVisible(false);
                                this.imageViewInStack(item);
                            },
                        });
                    },
                });
            },
        });

        // Add the item to the grand list of collected items
        this.collectedItems.push(item);
        this.stopPulsateEffect();

        this.updateStackView();
    }

    private useItem() {
        if (this.isPushingMap[this.stack[this.stack.length - 1].name]) {
            return; // Prevent popping if a push is in progress
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
                    if (poppedItem.name === "stone") {
                        poppedItem.setPosition(700, 580).setScale(0.2, 0.2);
                        this.stoneHighlightBox?.setVisible(false);
                        this.stonePlatform?.enableBody(true, 710, 718);
                        this.stone?.setVisible(true);
                    }
                    if (poppedItem.name === "mushroom") {
                        poppedItem.setPosition(1160, 500);
                        //poppedItem.setPosition(1160, 560);
                        poppedItem.setSize(
                            poppedItem.width - 200,
                            poppedItem.height - 400
                        );
                        this.mushroomHighlightBox?.setVisible(false);
                        this.mushroomPopped = true;
                        if (this.player) {
                            this.physics.add.collider(this.player, poppedItem);
                        }
                        this.mushroom?.setVisible(true);
                    }
                    if (poppedItem.name === "banana") {
                        if (this.banana) {
                            this.banana.setVelocity(0, 0);
                        }
                        poppedItem.setVisible(false);
                        this.bananaHighlightBox?.setVisible(false);
                        this.bananaBubble?.setVisible(false);
                        this.monkey?.disableBody(true, true);
                    }
                    if (poppedItem.name === "vineItem") {
                        poppedItem.setVisible(false);
                        this.vineHighlightBox?.setVisible(false);
                        this.vineSwing?.setVisible(true);
                        this.vineSwingStart();
                    }
                    if (poppedItem.name === "key") {
                        poppedItem.setVisible(false);
                        this.door?.setTexture("openDoor");
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
                                    // TODO: Add leve complete popup (w/ restart and continue options)
                                    // Transition to game map
                                    setTimeout(() => {
                                        this.scene.start("game-map", {
                                            level1JustUnlocked: true,
                                        });
                                    }, 2000);
                                    // To re-enable the player later:
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
                    this.imageViewOutStack(poppedItem);
                    /*if (poppedItem.name === "plank") {
                        poppedItem.setPosition(815, 600);
                        this.plankHighlightBox.setVisible(false);
                        this.plankPlatform?.enableBody(true, 938, 650);
                    }
                    if (poppedItem.name === "key") {
                        this.popButton2?.setVisible(false);
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
                                    // TODO: Add leve complete popup (w/ restart and continue options)
                                    // Transition to game map
                                    setTimeout(() => {
                                        this.scene.start("game-map", {
                                            level1JustUnlocked: true,
                                        });
                                    }, 2000);
                                },
                            });
                        }
                    }*/

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

    // Animation for using free pop
    private freePop() {
        if (this.isPushingMap[this.stack[this.stack.length - 1].name]) {
            return; // Prevent popping if a push is in progress
        }

        //this.loseLife();

        // Remove the top item from the stackpack and from grand list of collected items
        const poppedItem = this.stack.pop();
        this.collectedItems.pop();

        if (poppedItem && this.lives !== 0) {
            // Animation to fade item out from stackpack and then fade in in its new location
            this.tweens.add({
                targets: poppedItem,
                alpha: 0, // Fade out
                duration: 200,
                onComplete: () => {
                    // Set item origin back to default (center)
                    poppedItem.setOrigin(0.5, 0.5);

                    let originalScaleX = 0;
                    let originalScaleY = 0;
                    // Move popped item to its original location
                    if (poppedItem.name === "ladder") {
                        poppedItem.setPosition(1050, 550);
                        originalScaleX = 0.5;
                        originalScaleY = 0.5;
                    }
                    if (poppedItem.name === "plank") {
                        poppedItem.setPosition(350, 530);
                        originalScaleX = 0.5;
                        originalScaleY = 0.5;
                    }
                    if (poppedItem.name === "key") {
                        poppedItem.setPosition(1200, 650);
                        originalScaleX = 2.5;
                        originalScaleY = 2.5;
                    }

                    this.tweens.add({
                        targets: poppedItem,
                        scaleX: originalScaleX,
                        scaleY: originalScaleY,
                        alpha: 1, // Fade in
                        duration: 300,
                        onComplete: () => {
                            this.updateStackView();
                            if (poppedItem.name === "ladder") {
                                this.createPulsateEffect(
                                    this,
                                    poppedItem,
                                    1.1,
                                    1000
                                );
                            }
                            if (poppedItem.name === "plank") {
                                this.createPulsateEffect(
                                    this,
                                    poppedItem,
                                    1.15,
                                    1000
                                );
                            }
                        },
                    });
                },
            });
        }
    }

    private createHearts() {
        this.hearts = [];

        for (let i = 0; i < this.lives; i++) {
            this.hearts.push(
                this.add.sprite(35 + i * 50, 35, "heart").setScale(0.5)
            );
        }
    }

    /*private loseLife() {
        if (!this.isColliding && this.player) {
            this.isColliding = true;

            this.player.setVelocity(0, 0);
            if (this.lastDirection === "right") {
                this.player.anims.play("hurt_right");
            } else {
                this.player.anims.play("hurt_left");
            }
            this.lives--;

            // Removing hearts from free pop
            const heartToRemove = this.hearts?.pop();
            if (heartToRemove) {
                //heartToRemove.destroy();
                this.tweens.add({
                    targets: heartToRemove,
                    scaleX: 0.8,
                    scaleY: 0.8,
                    duration: 200,
                    yoyo: true,
                    onComplete: () => {
                        heartToRemove.setTint(0x000000); // Make heart black
                        heartToRemove.setScale(0.5); // Reset the heart's scale
                    },
                });
            }

            if (this.lives === 0) {
                this.playerDie();
            }

            // Reset isColliding flag
            this.time.delayedCall(
                500,
                () => {
                    this.isColliding = false;
                    if (this.collidingWithRiver) {
                        this.player?.setPosition(100, 450); // Reset player's position
                        this.collidingWithRiver = false;
                    }
                },
                [],
                this
            );
        }
    } */

    private playerDie() {
        this.player?.setVelocity(0, 0);
        this.player?.setTint(0xff0000);

        this.time.delayedCall(300, () => {
            this.scene.launch("YouDiedScene", {
                previousLevelKey: this.scene.key,
            });
            this.player?.clearTint();

            // Reset the stack and collected items
            this.stack = [];
            this.updateStackView();
            this.collectedItems = [];
            this.lives = 3;
            this.createHearts();
        });
    }

    private createPulsateEffect(
        scene: Phaser.Scene,
        target: Phaser.GameObjects.GameObject,
        scaleFactor: number,
        duration: number
    ): Phaser.Tweens.Tween | null {
        // Check if the item has been collected
        if (this.collectedItems.includes(target as Phaser.GameObjects.Sprite)) {
            return null; // Don't create the tween if the item has been collected
        }
        return scene.tweens.add({
            targets: target,
            scaleX: `*=${scaleFactor}`,
            scaleY: `*=${scaleFactor}`,
            duration: duration,
            yoyo: true, // Reverse back to original scale
            repeat: -1, // Repeat indefinitely
        });
    }

    private stopPulsateEffect() {
        // Stop pulsating collected items
        this.collectedItems.forEach((item) => {
            const tween = this.tweens.getTweensOf(item);
            if (tween.length > 1) {
                tween[0].stop();
            }
        });
    }

    update() {
        // KEY TURN
        if (this.key) {
            this.key.anims.play("turn", true);
        }

        // PLAYER ANIMS
        if (this.player && this.cursors) {
            if (!this.isColliding) {
                if (this.cursors.up.isDown && this.player.body?.touching.down) {
                    this.player.anims.play("jump_right", true);
                    this.player.setVelocityY(-470);
                } else if (this.cursors.right.isDown) {
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
            }
        }

        // ITEM COLLECTION
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
                this.stone &&
                Phaser.Math.Distance.Between(
                    this.player.x,
                    this.player.y,
                    this.stone.x,
                    this.stone.y
                ) < 100
            ) {
                this.collectItem(this.stone);
            }
            if (
                this.mushroom &&
                Phaser.Math.Distance.Between(
                    this.player.x,
                    this.player.y,
                    this.mushroom.x,
                    this.mushroom.y
                ) < 100
            ) {
                this.collectItem(this.mushroom);
            }
            if (
                this.banana &&
                Phaser.Math.Distance.Between(
                    this.player.x,
                    this.player.y,
                    this.banana.x,
                    this.banana.y
                ) < 100
            ) {
                this.collectItem(this.banana);
            }
            if (
                this.vineItem &&
                Phaser.Math.Distance.Between(
                    this.player.x,
                    this.player.y,
                    this.vineItem.x,
                    this.vineItem.y
                ) < 100
            ) {
                this.collectItem(this.vineItem);
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

        // Detection Box Checks for popping
        if (
            this.player &&
            this.stack.length > 0 &&
            this.stoneDetectionBox &&
            this.mushroomDetectionBox &&
            this.bananaDetectionBox &&
            this.keyDetectionArea
        ) {
            if (
                Phaser.Geom.Intersects.RectangleToRectangle(
                    this.player.getBounds(),
                    this.stoneDetectionBox.getBounds()
                ) &&
                this.stack[this.stack.length - 1].name === "stone"
            ) {
                this.stoneHighlightBox?.setVisible(true);
                if (this.keyF?.isDown && !this.keyFPressed) {
                    this.keyFPressed = true;
                    this.useItem();
                }
            } else if (
                Phaser.Geom.Intersects.RectangleToRectangle(
                    this.player.getBounds(),
                    this.mushroomDetectionBox.getBounds()
                ) &&
                this.stack[this.stack.length - 1].name === "mushroom"
            ) {
                this.mushroomHighlightBox?.setVisible(true);
                if (this.keyF?.isDown && !this.keyFPressed) {
                    this.keyFPressed = true;
                    this.useItem();
                }
            } else if (
                Phaser.Geom.Intersects.RectangleToRectangle(
                    this.player.getBounds(),
                    this.bananaDetectionBox.getBounds()
                ) &&
                this.stack[this.stack.length - 1].name === "banana"
            ) {
                this.bananaHighlightBox?.setVisible(true);
                if (this.keyF?.isDown && !this.keyFPressed) {
                    this.keyFPressed = true;
                    this.useItem();
                }
            } else if (
                Phaser.Geom.Intersects.RectangleToRectangle(
                    this.player.getBounds(),
                    this.bananaDetectionBox.getBounds()
                ) &&
                this.stack[this.stack.length - 1].name === "vineItem"
            ) {
                this.vineHighlightBox?.setVisible(true); // replace with vine highlight box
                if (this.keyF?.isDown && !this.keyFPressed) {
                    this.keyFPressed = true;
                    this.useItem();
                }
            } else if (
                Phaser.Geom.Intersects.RectangleToRectangle(
                    this.player.getBounds(),
                    this.keyDetectionArea?.getBounds()
                ) &&
                this.stack[this.stack.length - 1].name === "key"
            ) {
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
                this.stoneHighlightBox?.setVisible(false);
                this.mushroomHighlightBox?.setVisible(false);
                this.bananaHighlightBox?.setVisible(false);
                this.vineHighlightBox?.setVisible(false);
            }
        }

        // On top of Mushroom Check
        if (this.player && this.mushroom) {
            let playerBounds = this.player.getBounds();
            let mushroomBounds = this.mushroom.getBounds();
            if (
                playerBounds.bottom > mushroomBounds.top &&
                playerBounds.left > mushroomBounds.left &&
                playerBounds.right < mushroomBounds.right &&
                this.mushroomPopped
            ) {
                this.player.setVelocityY(-600);
            }
        }
    }
}
