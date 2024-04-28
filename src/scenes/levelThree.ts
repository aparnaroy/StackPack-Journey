import Phaser from "phaser";

interface GameMapData {
    level0State: number;
    level1State: number;
    level2State: number;
    level3State: number;
}

export default class LevelThree extends Phaser.Scene {
    private player?: Phaser.Physics.Arcade.Sprite;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private key?: Phaser.GameObjects.Sprite;
    private platforms?: Phaser.Physics.Arcade.StaticGroup;
    private ground?: Phaser.Physics.Arcade.Image;
    private lava?: Phaser.Physics.Arcade.StaticGroup;
    private stones?: Phaser.Physics.Arcade.StaticGroup;
    private liftPlatforms!: Phaser.Physics.Arcade.Group;

    private water?: Phaser.GameObjects.Sprite;
    private gasMask?: Phaser.GameObjects.Sprite;
    private sword?: Phaser.GameObjects.Sprite;
    private toolbox?: Phaser.GameObjects.Sprite;
    private chainsaw?: Phaser.GameObjects.Sprite;

    private fire?: Phaser.GameObjects.Sprite;
    private toxicGas?: Phaser.GameObjects.Sprite;
    private gasBarrel?: Phaser.GameObjects.Sprite;
    private skeleton?: Phaser.GameObjects.Sprite;
    private dangerSign?: Phaser.GameObjects.Sprite;
    private liftFloor?: Phaser.Physics.Arcade.Image;
    private liftWall1?: Phaser.Physics.Arcade.Image;
    private liftWall2?: Phaser.Physics.Arcade.Image;
    private tree?: Phaser.GameObjects.Sprite;
    private door?: Phaser.Physics.Arcade.Image;

    private skeletonDirection: number = 1;

    private waterDetectionArea: Phaser.GameObjects.Rectangle;
    private waterHighlightBox: Phaser.GameObjects.Rectangle;
    private gasMaskDetectionArea: Phaser.GameObjects.Rectangle;
    private gasMaskHighlightBox: Phaser.GameObjects.Rectangle;
    private swordDetectionArea: Phaser.GameObjects.Rectangle;
    private swordHighlightBox: Phaser.GameObjects.Rectangle;
    private toolboxDetectionArea: Phaser.GameObjects.Rectangle;
    private toolboxHighlightBox: Phaser.GameObjects.Rectangle;
    private chainsawDetectionArea: Phaser.GameObjects.Rectangle;
    private chainsawHighlightBox: Phaser.GameObjects.Rectangle;
    private keyDetectionArea: Phaser.GameObjects.Rectangle;

    private lavaArea: Phaser.GameObjects.Rectangle;
    private toxicGasArea: Phaser.GameObjects.Rectangle;
    private fireArea: Phaser.GameObjects.Rectangle;
    private liftArea: Phaser.GameObjects.Rectangle;
    private treeArea: Phaser.GameObjects.Rectangle;
    private skeletonArea: Phaser.GameObjects.Rectangle;

    private stack: Phaser.GameObjects.Sprite[] = [];
    private collectedItems: Phaser.GameObjects.Sprite[] = []; // To track all collected items (even after they're popped from stack)
    private keyE?: Phaser.Input.Keyboard.Key;
    private keyF?: Phaser.Input.Keyboard.Key;
    private keyEPressed: boolean = false; // Flag to check if 'E' was pressed to prevent picking up multiple items from one long key press
    private keyFPressed: boolean = false; // Flag to check if 'E' was pressed to prevent using multiple items from one long key press
    private lastDirection: string = "right";
    private isPushingMap: { [key: string]: boolean } = {}; // Flags for each item to make sure you can't pop it while it is being pushed

    private levelCompleteText?: Phaser.GameObjects.Text;

    private hearts?: Phaser.GameObjects.Sprite[] = [];
    private lives: number = 3;
    private isColliding: boolean = false;
    private collidingWithDeath: boolean = false;

    private level0State: number;
    private level1State: number;
    private level2State: number;
    private level3State: number;

    constructor() {
        super({ key: "Level3" });
    }

    preload() {
        this.load.image("level3-background", "assets/level3-background.jpg");
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
        this.load.spritesheet("gal_climb", "assets/Pink_Monster_Climb_4.png", {
            frameWidth: 128,
            frameHeight: 128,
        });
        this.load.spritesheet(
            "gal_hurt_right",
            "assets/Pink_Monster_Hurt_4.png",
            { frameWidth: 128, frameHeight: 128 }
        );
        this.load.spritesheet(
            "gal_hurt_left",
            "assets/Pink_Monster_Hurt_Left4.png",
            { frameWidth: 128, frameHeight: 128 }
        );

        this.load.spritesheet(
            "walk_right",
            "assets/level3/Skeleton_With_VFX/Skeleton_01_White_Walk.png",
            {
                frameWidth: 960 / 10,
                frameHeight: 64,
            }
        );
        this.load.spritesheet(
            "walk_left",
            "assets/level3/Skeleton_With_VFX/Skeleton_01_White_Walk_left.png",
            {
                frameWidth: 960 / 10,
                frameHeight: 64,
            }
        );

        this.load.image("ground", "assets/level3/first-platform.png");
        this.load.image("level3-platform", "assets/level3/lava-platform.png");
        this.load.image(
            "level3-platform-small",
            "assets/level3/lava-platform-small.png"
        );
        this.load.image("lava", "assets/level3/lava.png");
        this.load.image("stone1", "assets/level3/stone1.png");
        this.load.image("stone2", "assets/level3/stone2.png");
        this.load.image("stone3", "assets/level3/stone3.png");

        // Collectable items
        this.load.image("water", "assets/level3/water-bucket.png");
        this.load.image("gas-mask", "assets/level3/gas-mask.png");
        this.load.image("sword", "assets/level3/sword.png");
        this.load.image("toolbox", "assets/level3/toolbox.png");
        this.load.image("chainsaw", "assets/level3/chainsaw.png");

        // Usage areas
        this.load.image("fire", "assets/level3/fire.png");
        this.load.image("toxic-gas", "assets/level3/toxic-gas.png");
        this.load.image("barrel", "assets/level3/toxic-gas-barrel.png");
        this.load.image("skeleton", "assets/level3/skeleton-man.png");
        this.load.image(
            "danger-sign",
            "assets/level3/electric-danger-sign.png"
        );
        this.load.image("lift-off", "assets/level3/lift-off.png");
        this.load.image("lift-on", "assets/level3/lift-on.png");
        this.load.image("tree", "assets/level3/dead-tree.png");
        this.load.image("tree-cut", "assets/level3/dead-tree-cut.png");

        this.load.image("door", "assets/level3/red-door.png");
        this.load.image("opendoor", "assets/level3/red-door-open.png");
        this.load.image("heart", "assets/heart_16.png");
        this.load.image("pop-button", "assets/freePop2.png");
    }

    create(data: GameMapData) {
        this.level0State = data.level0State;
        this.level1State = data.level1State;
        this.level2State = data.level2State;
        this.level3State = data.level3State;

        this.lastDirection = "right";

        const backgroundImage = this.add
            .image(0, 0, "level3-background")
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
            .sprite(300, 550, "gal_right")
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

        // Creating lives
        this.createHearts();

        // Creating Free Pop Button
        const popButton = this.add.image(225, 35, "pop-button").setScale(0.31);
        popButton.setInteractive();

        const originalScale = popButton.scaleX;
        const hoverScale = originalScale * 1.05;

        // Pop button hover animation
        popButton.on("pointerover", () => {
            this.tweens.add({
                targets: popButton,
                scaleX: hoverScale,
                scaleY: hoverScale,
                duration: 115, // Duration of the tween in milliseconds
                ease: "Linear", // Easing function for the tween
            });
        });
        popButton.on("pointerout", () => {
            this.tweens.add({
                targets: popButton,
                scaleX: originalScale,
                scaleY: originalScale,
                duration: 115, // Duration of the tween in milliseconds
                ease: "Linear", // Easing function for the tween
            });
        });
        popButton.on("pointerup", () => {
            this.freePop();
        });

        // Define keys 'E' and 'F' for collecting and using items respectively
        this.keyE = this.input.keyboard?.addKey(
            Phaser.Input.Keyboard.KeyCodes.E
        );
        this.keyF = this.input.keyboard?.addKey(
            Phaser.Input.Keyboard.KeyCodes.F
        );

        // Create platforms
        this.platforms = this.physics.add.staticGroup();
        this.ground = this.platforms.create(
            150,
            720,
            "ground"
        ) as Phaser.Physics.Arcade.Image;
        const floor = this.platforms.create(
            300,
            770,
            "ground"
        ) as Phaser.Physics.Arcade.Image;

        this.ground.setScale(0.5).refreshBody();
        this.ground.setAlpha(1); // Hide the ground platform

        floor.setScale(3, 0.5).refreshBody().setAlpha(0);

        const platform1 = this.platforms
            .create(580, 695, "level3-platform-small")
            .setScale(0.27, 0.3)
            .refreshBody();
        const platform2 = this.platforms
            .create(820, 695, "level3-platform-small")
            .setScale(0.27, 0.3)
            .refreshBody();
        const platform3 = this.platforms
            .create(1140, 600, "level3-platform")
            .setScale(0.38, 0.3)
            .refreshBody();
        const platform4 = this.platforms
            .create(220, 485, "level3-platform")
            .setScale(0.6, 0.3)
            .refreshBody();
        const platform5 = this.platforms
            .create(670, 260, "level3-platform")
            .setScale(0.77, 0.26)
            .refreshBody();

        this.physics.add.collider(this.player, this.platforms);

        this.stones = this.physics.add.staticGroup();
        const stone0 = this.stones
            .create(552, 470, "stone2")
            .setScale(0.045, 0.045)
            .refreshBody();
        stone0.setFlipX(true);
        const stone1 = this.stones
            .create(630, 475, "stone1")
            .setScale(0.04, 0.04)
            .refreshBody();
        const stone2 = this.stones
            .create(700, 470, "stone2")
            .setScale(0.04, 0.04)
            .refreshBody();
        const stone3 = this.stones
            .create(795, 473, "stone3")
            .setScale(0.04, 0.04)
            .refreshBody();
        const stone4 = this.stones
            .create(885, 489, "stone1")
            .setScale(0.04, 0.035)
            .refreshBody();

        this.physics.add.collider(this.player, this.stones);

        // Create lift platform
        this.liftPlatforms = this.physics.add.group({
            immovable: true, // Make all platforms immovable by collisions
            allowGravity: false, // Disable gravity for platforms
        });

        this.liftFloor = this.liftPlatforms.create(
            95,
            430,
            "lift-off"
        ) as Phaser.Physics.Arcade.Image;
        this.liftFloor.setScale(0.23, 0.35).refreshBody();
        this.liftFloor
            .setSize(this.liftFloor.width - 270, this.liftFloor.height - 195)
            .setOffset(135, 130);
        this.liftFloor.setVisible(true);

        this.liftWall1 = this.liftPlatforms.create(
            32,
            425,
            "lift-off"
        ) as Phaser.Physics.Arcade.Image;
        this.liftWall1.setScale(0.02, 0.2).refreshBody();
        this.liftWall1.setVisible(false);

        this.liftWall2 = this.liftPlatforms.create(
            159,
            425,
            "lift-off"
        ) as Phaser.Physics.Arcade.Image;
        this.liftWall2.setScale(0.02, 0.2).refreshBody();
        this.liftWall2.setVisible(false);

        this.physics.add.collider(this.player, this.liftPlatforms);

        // Add collision between player and platforms
        this.physics.add.collider(this.player, this.liftPlatforms);

        this.lava = this.physics.add.staticGroup();
        this.lava.create(360, 650, "lava").setScale(0.75, 0.75);
        this.lava.create(360 + 192, 650, "lava").setScale(0.75, 0.75);
        this.lava.create(360 + 2 * 192, 650, "lava").setScale(0.75, 0.75);
        this.lava.create(360 + 3 * 192, 650, "lava").setScale(0.75, 0.75);
        this.lava.create(360 + 4 * 192, 650, "lava").setScale(0.75, 0.75);
        this.lava.create(360 + 5 * 192, 650, "lava").setScale(0.75, 0.75);

        // Creating collectable items: water, gas mask, sword, toolbox, chainsaw, key
        this.water = this.add.sprite(1230, 510, "water").setScale(0.2, 0.2);
        this.water.setName("water");

        this.gasMask = this.add.sprite(160, 610, "gas-mask").setScale(0.4, 0.4);
        this.gasMask.setName("gas-mask");

        this.sword = this.add.sprite(50, 600, "sword").setScale(0.2, 0.2);
        this.sword.setRotation(Phaser.Math.DegToRad(10));
        this.sword.setName("sword");

        this.toolbox = this.add.sprite(820, 610, "toolbox").setScale(0.2, 0.2);
        this.toolbox.setName("toolbox");

        this.chainsaw = this.add
            .sprite(245, 385, "chainsaw")
            .setScale(0.45, 0.45);
        this.chainsaw.setRotation(Phaser.Math.DegToRad(85));
        this.chainsaw.setName("chainsaw");

        this.key = this.add.sprite(580, 610, "key").setScale(2.5, 2.5);
        this.key.setName("key");

        // Creating usage areas: fire, toxic gas, skeleton, danger sign, lift, tree, door
        this.fire = this.add.sprite(340, 410, "fire").setScale(0.5, 0.5);
        this.fire.setName("fire");

        this.toxicGas = this.add
            .sprite(1100, 373, "toxic-gas")
            .setScale(0.28, 0.28);
        this.toxicGas.setName("toxic-gas");

        this.gasBarrel = this.add
            .sprite(1125, 500, "barrel")
            .setScale(0.25, 0.25);
        this.gasBarrel.setName("barrel");

        this.skeleton = this.add
            .sprite(830, 158, "walk_right")
            .setScale(2.4, 2.4);
        this.skeleton.setName("skeleton");

        // Create animation from the sprite sheet
        this.anims.create({
            key: "walk_right", // Animation key
            frames: this.anims.generateFrameNumbers("walk_right", {
                start: 0,
                end: 9,
            }), // Define frames for animation
            frameRate: 8, // Frame rate of the animation
            repeat: -1, // Repeat indefinitely
        });
        this.anims.create({
            key: "walk_left", // Animation key
            frames: this.anims.generateFrameNumbers("walk_left", {
                start: 0,
                end: 9,
            }), // Define frames for animation
            frameRate: 8, // Frame rate of the animation
            repeat: -1, // Repeat indefinitely
        });

        this.dangerSign = this.add
            .sprite(95, 355, "danger-sign")
            .setScale(0.38, 0.4);
        this.dangerSign.setName("danger-sign");

        this.liftFloor.setName("lift");

        this.tree = this.add.sprite(480, 130, "tree").setScale(0.5, 0.5);
        this.tree.setName("tree");

        this.door = this.physics.add.image(930, 100, "door").setScale(0.1, 0.1);
        this.physics.add.collider(this.door, this.platforms);

        // Set the depth of the player and skeleton sprites to a high value
        this.player.setDepth(5);
        this.skeleton.setDepth(4);

        this.liftFloor.setDepth(6);
        this.toxicGas.setDepth(3);

        // Set the depth of other game objects to lower values
        this.gasBarrel.setDepth(2);
        this.ground.setDepth(1);

        // Resize collision boxes of player and everything that can be collided with
        this.player
            .setSize(this.player.width - 64, this.player.height)
            .setOffset(32, 0);

        this.ground
            .setSize(
                this.ground.width * 0.5 - 30,
                this.ground.height * 0.5 - 10
            )
            .setOffset(15, 5);
        platform1
            .setSize(platform1.width * 0.27 - 16, platform1.height * 0.3 - 28)
            .setOffset(8, 7);
        platform2
            .setSize(platform2.width * 0.27 - 16, platform2.height * 0.3 - 28)
            .setOffset(8, 7);
        platform3
            .setSize(platform3.width * 0.35 - 24, platform3.height * 0.3 - 75)
            .setOffset(12, 9);
        platform4
            .setSize(platform4.width * 0.6 - 34, platform4.height * 0.3 - 75)
            .setOffset(17, 6);
        platform5
            .setSize(platform5.width * 0.7 - 50, platform5.height * 0.3 - 75)
            .setOffset(25, 6);
        stone0
            .setSize(stone0.width * 0.045 - 30, stone0.height * 0.045 - 40)
            .setOffset(15, 5);
        stone1
            .setSize(stone1.width * 0.04 - 30, stone1.height * 0.04 - 60)
            .setOffset(15, 5);
        stone2
            .setSize(stone2.width * 0.04 - 26, stone2.height * 0.04 - 35)
            .setOffset(13, 2);
        stone3
            .setSize(stone3.width * 0.04 - 26, stone3.height * 0.04 - 45)
            .setOffset(15, 5);
        stone4
            .setSize(stone4.width * 0.04 - 30, stone4.height * 0.035 - 54)
            .setOffset(15, 5);

        this.door
            .setSize(this.door.width, this.door.height - 60)
            .setOffset(0, 0);

        // Make collectable items continuously pulsate
        this.createPulsateEffect(
            this,
            this.water,
            1.15, // Scale factor for pulsating effect
            1000 // Duration of each tween cycle in milliseconds
        );
        this.createPulsateEffect(
            this,
            this.gasMask,
            1.15, // Scale factor for pulsating effect
            1000 // Duration of each tween cycle in milliseconds
        );
        this.createPulsateEffect(
            this,
            this.sword,
            1.15, // Scale factor for pulsating effect
            1000 // Duration of each tween cycle in milliseconds
        );
        this.createPulsateEffect(
            this,
            this.toolbox,
            1.15, // Scale factor for pulsating effect
            1000 // Duration of each tween cycle in milliseconds
        );
        this.createPulsateEffect(
            this,
            this.chainsaw,
            1.15, // Scale factor for pulsating effect
            1000 // Duration of each tween cycle in milliseconds
        );

        // Creating detection area for using gas mask
        this.gasMaskDetectionArea = this.add.rectangle(1005, 400, 130, 170);
        this.physics.world.enable(this.gasMaskDetectionArea);
        this.physics.add.collider(this.gasMaskDetectionArea, this.platforms);

        // Creating a highlighted rectangle to indicate where to use gas mask
        this.gasMaskHighlightBox = this.add.rectangle(
            1125,
            440,
            120,
            250,
            0xffff00
        );
        this.gasMaskHighlightBox.setAlpha(0.25);
        this.gasMaskHighlightBox.setVisible(false);

        // Creating detection area for using water
        this.waterDetectionArea = this.add.rectangle(450, 360, 110, 170);
        this.physics.world.enable(this.waterDetectionArea);
        this.physics.add.collider(this.waterDetectionArea, this.platforms);

        // Creating a highlighted rectangle to indicate where to use water
        this.waterHighlightBox = this.add.rectangle(
            340,
            410,
            130,
            120,
            0xffff00
        );
        this.waterHighlightBox.setAlpha(0.25);
        this.waterHighlightBox.setVisible(false);

        // Creating detection area for using toolbox
        this.toolboxDetectionArea = this.add.rectangle(205, 360, 90, 170);
        this.physics.world.enable(this.toolboxDetectionArea);
        this.physics.add.collider(this.toolboxDetectionArea, this.platforms);

        // Creating a highlighted rectangle to indicate where to use toolbox
        this.toolboxHighlightBox = this.add.rectangle(
            95,
            370,
            160,
            180,
            0xffff00
        );
        this.toolboxHighlightBox.setAlpha(0.25);
        this.toolboxHighlightBox.setVisible(false);

        // Creating detection area for using chainsaw
        this.chainsawDetectionArea = this.add.rectangle(385, 80, 100, 170);
        this.physics.world.enable(this.chainsawDetectionArea);
        this.physics.add.collider(this.chainsawDetectionArea, this.platforms);

        // Creating a highlighted rectangle to indicate where to use chainsaw
        this.chainsawHighlightBox = this.add.rectangle(
            510,
            130,
            180,
            240,
            0xffff00
        );
        this.chainsawHighlightBox.setAlpha(0.25);
        this.chainsawHighlightBox.setVisible(false);

        // Creating detection area for using sword
        this.swordDetectionArea = this.add.rectangle(645, 100, 100, 170);
        this.physics.world.enable(this.swordDetectionArea);
        this.physics.add.collider(this.swordDetectionArea, this.platforms);

        // Creating a highlighted rectangle to indicate where to use sword
        this.swordHighlightBox = this.add.rectangle(
            830,
            190,
            250,
            140,
            0xffff00
        );
        this.swordHighlightBox.setAlpha(0.25);
        this.swordHighlightBox.setVisible(false);

        // Creating detection area for using key
        this.keyDetectionArea = this.add.rectangle(918, 105, 150, 200);
        this.physics.world.enable(this.keyDetectionArea);
        this.physics.add.collider(this.keyDetectionArea, this.platforms);

        // Defining lava area for dying
        this.lavaArea = this.add.rectangle(840, 670, 940, 20);
        this.physics.world.enable(this.lavaArea);
        this.physics.add.collider(this.lavaArea, floor);

        // Defining toxic gas area for dying
        this.toxicGasArea = this.add.rectangle(1125, 400, 45, 250);
        this.physics.world.enable(this.toxicGasArea);
        this.physics.add.collider(this.toxicGasArea, this.platforms);

        // Defining fire area for dying
        this.fireArea = this.add.rectangle(340, 380, 80, 100);
        this.physics.world.enable(this.fireArea);
        this.physics.add.collider(this.fireArea, this.platforms);

        // Defining lift area for dying
        this.liftArea = this.add.rectangle(95, 340, 100, 150);
        this.physics.world.enable(this.liftArea);
        this.physics.add.collider(this.liftArea, this.platforms);

        // Defining tree area for dying
        this.treeArea = this.add.rectangle(510, 100, 100, 200);
        this.physics.world.enable(this.treeArea);
        this.physics.add.collider(this.treeArea, this.platforms);
    }

    private updateStackView() {
        const offsetX = 1170; // starting X position for stack items
        const offsetY = 270; // starting Y position for stack items
        const padding = 8;

        let currTotalHeight = 0;

        let stackItemScale = 1;
        if (this.stack.length == 5) {
            stackItemScale = 0.8;
        }

        this.stack.forEach((item) => {
            // Calculate and set (x, y) position of stack items in stackpack view
            item.setOrigin(0.5, 0);
            item.setScale(item.scale * stackItemScale);
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
                    if (poppedItem.name === "gas-mask") {
                        poppedItem.setDepth(10);
                        // Move the gas mask towards the player
                        poppedItem.setPosition(this.player?.x, this.player?.y);
                        // Scale down the gas mask to make it disappear
                        this.tweens.add({
                            targets: poppedItem,
                            scaleX: 0,
                            scaleY: 0,
                            duration: 300,
                            delay: 500,
                            onComplete: () => {
                                poppedItem.setVisible(false);
                            },
                        });
                        this.tweens.add({
                            targets: this.toxicGas,
                            alpha: 0, // Fade out
                            duration: 1200,
                        });
                        this.toxicGasArea.setPosition(-100, -100);
                        this.gasMaskHighlightBox.setVisible(false);
                    }
                    if (poppedItem.name === "water") {
                        // Play animation to tilt the water to the side
                        this.tweens.add({
                            targets: poppedItem,
                            angle: -75, // Tilt the water to the side
                            duration: 500, // Duration of the tilt animation
                            yoyo: true, // Play the animation in reverse
                            repeat: 0, // No repeat
                            onStart: () => {
                                poppedItem.setPosition(400, 315);
                            },
                            onComplete: () => {
                                poppedItem.setVisible(false);
                                this.tweens.add({
                                    targets: this.fire,
                                    alpha: 0, // Fade out
                                    duration: 500,
                                });
                            },
                        });
                        this.fireArea.setPosition(-100, -100);
                        this.waterHighlightBox.setVisible(false);
                    }
                    if (poppedItem.name === "toolbox") {
                        poppedItem.setVisible(false);
                        this.tweens.add({
                            targets: this.dangerSign,
                            alpha: 0, // Fade out
                            duration: 500,
                            onComplete: () => {
                                this.liftFloor?.setTexture("lift-on");
                                // Start the lift
                                this.tweens.add({
                                    targets: this.liftPlatforms.getChildren(), // Move all platforms in the group
                                    y: "-=190", // Move the lift platforms up
                                    delay: 600,
                                    duration: 2200, // Duration of the movement
                                    yoyo: true, // Platforms will return to their original position
                                    repeat: -1, // Repeat indefinitely
                                    ease: "Linear",
                                });
                            },
                        });
                        this.liftArea.setPosition(-100, -100);
                        this.toolboxHighlightBox.setVisible(false);
                    }
                    if (poppedItem.name === "chainsaw") {
                        // Play animation to rotate and move the chainsaw side to side
                        if (this.chainsaw) {
                            this.tweens.add({
                                targets: poppedItem,
                                angle: 45, // Rotate the chainsaw to the side
                                x: 537 + 20, // Move the chainsaw a bit to the right
                                duration: 500, // Duration of the rotation and movement
                                yoyo: true, // Play the animation in reverse
                                repeat: 0, // No repeat
                                onStart: () => {
                                    poppedItem.setDepth(3);
                                    poppedItem.setPosition(537, 170);
                                },
                                onComplete: () => {
                                    // Execute callback function after animation finishes
                                    poppedItem.setVisible(false);
                                    this.tree?.setScale(0.245);
                                    this.tree?.setPosition(537, 205);
                                    this.tree?.setTexture("tree-cut");
                                },
                            });
                        }
                        this.treeArea.setPosition(-100, -100);
                        this.chainsawHighlightBox.setVisible(false);
                    }
                    if (poppedItem.name === "sword") {
                        poppedItem.setVisible(false);
                        // TODO: Finish sword use handling
                        this.swordHighlightBox.setVisible(false);
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
                                    // TODO: Add level complete popup (w/ restart and continue options)
                                    // Transition to game map OR to ending cut scene: set level 3 to completed status
                                    setTimeout(() => {
                                        this.scene.start("game-map", {
                                            level0State: this.level0State,
                                            level1State: this.level1State,
                                            level2State: this.level2State,
                                            level3State: 3,
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

        this.loseLife();

        // Remove the top item from the stackpack
        const poppedItem = this.stack.pop();

        if (poppedItem && this.lives !== 0) {
            // Remove popped item from grand list of collected items
            const index = this.collectedItems.indexOf(poppedItem);
            if (index !== -1) {
                this.collectedItems.splice(index, 1);
            }

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
        this.lives = 3;
        this.hearts = [];

        for (let i = 0; i < 3; i++) {
            this.hearts.push(
                this.add.sprite(35 + i * 50, 35, "heart").setScale(0.5)
            );
        }
    }

    private loseLife() {
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
                    if (this.collidingWithDeath) {
                        this.player?.setPosition(300, 550); // Reset player's position
                        this.collidingWithDeath = false;
                    }
                },
                [],
                this
            );
        }
    }

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
        // Key animation
        if (this.key) {
            this.key.anims.play("turn", true);
        }

        // Skeleton walking animation
        let rightBoundary = 1000;
        let leftBoundary = 670;
        if (this.skeleton && this.player) {
            // Calculate the distance between the skeleton and the player
            const distanceX = Math.abs(this.player.x - this.skeleton.x);
            const distanceY = Math.abs(this.player.y - this.skeleton.y);

            // Check if the player is within a certain range of the skeleton
            if (
                distanceX < 300 &&
                distanceY < 30 &&
                this.skeleton.x <= rightBoundary &&
                this.skeleton.x >= leftBoundary
            ) {
                // Move the skeleton towards the player
                if (this.skeleton.x < this.player.x) {
                    this.skeleton.x += 3; // Move right
                    this.skeleton.anims.play("walk_right", true);
                } else {
                    this.skeleton.x -= 3; // Move left
                    this.skeleton.anims.play("walk_left", true);
                }
            } else {
                if (
                    this.skeleton.x <= rightBoundary &&
                    this.skeletonDirection === 1
                ) {
                    this.skeleton.x += 1.5;
                    this.skeleton.anims.play("walk_right", true);
                } else if (
                    this.skeleton.x >= leftBoundary &&
                    this.skeletonDirection === -1
                ) {
                    this.skeleton.x -= 1.5;
                    this.skeleton.anims.play("walk_left", true);
                }
                // If the skeleton reaches the right boundary, change direction to left
                else if (this.skeleton.x >= rightBoundary) {
                    this.skeletonDirection = -1;
                }
                // If the skeleton reaches the left boundary, change direction to right
                else if (this.skeleton.x <= leftBoundary) {
                    this.skeletonDirection = 1;
                }
            }
        }

        // Move the gal with arrow keys
        // Inside your update function or wherever you handle player movement
        if (this.player && this.cursors) {
            if (!this.isColliding) {
                if (this.cursors.up.isDown && this.player.body?.touching.down) {
                    this.player.anims.play("jump_right", true);
                    this.player.setVelocityY(-450);
                } else if (this.cursors.right.isDown) {
                    this.player.setVelocityX(280);
                    this.player.anims.play("right", true);
                    this.lastDirection = "right"; // Update last direction
                } else if (this.cursors.left.isDown) {
                    this.player.setVelocityX(-280);
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

        // Collect item if 'E' key is pressed
        if (this.player && this.keyE?.isDown && !this.keyEPressed) {
            this.keyEPressed = true; // Set the flag for the E key being pressed to true

            // Check if the player is close enough to the water, gas mask, sword, toolbox, chainsaw, or key, and if so, collect it
            if (
                this.sword &&
                Phaser.Math.Distance.Between(
                    this.player.x,
                    this.player.y,
                    this.sword.x,
                    this.sword.y
                ) < 100
            ) {
                this.collectItem(this.sword);
            }
            if (
                this.gasMask &&
                Phaser.Math.Distance.Between(
                    this.player.x,
                    this.player.y,
                    this.gasMask.x,
                    this.gasMask.y
                ) < 100
            ) {
                this.collectItem(this.gasMask);
            }
            if (
                this.toolbox &&
                Phaser.Math.Distance.Between(
                    this.player.x,
                    this.player.y,
                    this.toolbox.x,
                    this.toolbox.y
                ) < 100
            ) {
                this.collectItem(this.toolbox);
            }
            if (
                this.water &&
                Phaser.Math.Distance.Between(
                    this.player.x,
                    this.player.y,
                    this.water.x,
                    this.water.y
                ) < 100
            ) {
                this.collectItem(this.water);
            }
            if (
                this.chainsaw &&
                Phaser.Math.Distance.Between(
                    this.player.x,
                    this.player.y,
                    this.chainsaw.x,
                    this.chainsaw.y
                ) < 100
            ) {
                this.collectItem(this.chainsaw);
            }
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
                    this.gasMaskDetectionArea.getBounds()
                ) &&
                this.stack[this.stack.length - 1].name === "gas-mask"
            ) {
                // If player overlaps with gas mask detection area, show the highlight box
                this.gasMaskHighlightBox.setVisible(true);
                if (this.keyF?.isDown && !this.keyFPressed) {
                    this.keyFPressed = true;
                    this.useItem();
                }
            } else if (
                Phaser.Geom.Intersects.RectangleToRectangle(
                    this.player.getBounds(),
                    this.swordDetectionArea.getBounds()
                ) &&
                this.stack[this.stack.length - 1].name === "sword"
            ) {
                // If player overlaps with sword detection area, show the highlight box
                this.swordHighlightBox.setVisible(true);
                if (this.keyF?.isDown && !this.keyFPressed) {
                    this.keyFPressed = true;
                    this.useItem();
                }
            } else if (
                Phaser.Geom.Intersects.RectangleToRectangle(
                    this.player.getBounds(),
                    this.toolboxDetectionArea.getBounds()
                ) &&
                this.stack[this.stack.length - 1].name === "toolbox"
            ) {
                // If player overlaps with toolbox detection area, show the highlight box
                this.toolboxHighlightBox.setVisible(true);
                if (this.keyF?.isDown && !this.keyFPressed) {
                    this.keyFPressed = true;
                    this.useItem();
                }
            } else if (
                Phaser.Geom.Intersects.RectangleToRectangle(
                    this.player.getBounds(),
                    this.waterDetectionArea.getBounds()
                ) &&
                this.stack[this.stack.length - 1].name === "water"
            ) {
                // If player overlaps with water detection area, show the highlight box
                this.waterHighlightBox.setVisible(true);
                if (this.keyF?.isDown && !this.keyFPressed) {
                    this.keyFPressed = true;
                    this.useItem();
                }
            } else if (
                Phaser.Geom.Intersects.RectangleToRectangle(
                    this.player.getBounds(),
                    this.chainsawDetectionArea.getBounds()
                ) &&
                this.stack[this.stack.length - 1].name === "chainsaw"
            ) {
                // If player overlaps with chainsaw detection area, show the highlight box
                this.chainsawHighlightBox.setVisible(true);
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
                this.gasMaskHighlightBox.setVisible(false);
                this.swordHighlightBox.setVisible(false);
                this.toolboxHighlightBox.setVisible(false);
                this.waterHighlightBox.setVisible(false);
                this.chainsawHighlightBox.setVisible(false);
            }
        }

        // Lose life if player touches lava
        if (this.player) {
            this.physics.add.collider(
                this.player,
                this.lavaArea,
                () => {
                    this.collidingWithDeath = true;
                    this.loseLife();
                },
                undefined,
                this
            );
        }
        // Lose life if player touches toxic gas
        if (
            this.player &&
            Phaser.Geom.Intersects.RectangleToRectangle(
                this.player.getBounds(),
                this.toxicGasArea.getBounds()
            )
        ) {
            this.collidingWithDeath = true;
            this.loseLife();
        }
        // Lose life if player touches fire
        if (
            this.player &&
            Phaser.Geom.Intersects.RectangleToRectangle(
                this.player.getBounds(),
                this.fireArea.getBounds()
            )
        ) {
            this.collidingWithDeath = true;
            this.loseLife();
        }
        // Lose life if player touches lift (while it's not repaired)
        if (
            this.player &&
            Phaser.Geom.Intersects.RectangleToRectangle(
                this.player.getBounds(),
                this.liftArea.getBounds()
            )
        ) {
            this.collidingWithDeath = true;
            this.loseLife();
        }
        if (
            this.player &&
            Phaser.Geom.Intersects.RectangleToRectangle(
                this.player.getBounds(),
                this.treeArea.getBounds()
            )
        ) {
            this.collidingWithDeath = true;
            this.loseLife();
        }
        // TODO: Add check to see if player collides with skeleton and lose life if so
    }
}
