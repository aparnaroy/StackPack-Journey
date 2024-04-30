import Phaser from "phaser";

interface GameMapData {
    level0State: number;
    level1State: number;
    level2State: number;
    level3State: number;
}

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

    private pushDialogue?: Phaser.GameObjects.Image;
    private popDialogue?: Phaser.GameObjects.Image;
    private pushButton1?: Phaser.GameObjects.Image;
    private pushButton2?: Phaser.GameObjects.Image;
    private popButton1?: Phaser.GameObjects.Image;
    private popButton2?: Phaser.GameObjects.Image;
    private movementInstruction?: Phaser.GameObjects.Image;
    private orderInstruction?: Phaser.GameObjects.Image;
    private freepopDialogue?: Phaser.GameObjects.Image;
    private glowingSpot?: Phaser.GameObjects.Image;

    private stack: Phaser.GameObjects.Sprite[] = [];
    private collectedItems: Phaser.GameObjects.Sprite[] = []; // To track all collected items (even after they're popped from stack)
    private keyE?: Phaser.Input.Keyboard.Key;
    private keyF?: Phaser.Input.Keyboard.Key;
    private keyEPressed: boolean = false; // Flag to check if 'E' was pressed to prevent picking up multiple items from one long key press
    private keyFPressed: boolean = false; // Flag to check if 'E' was pressed to prevent using multiple items from one long key press
    private lastDirection: string = "right";
    private climbing: boolean = false;
    private isPushingMap: { [key: string]: boolean } = {}; // Flags for each item to make sure you can't pop it while it is being pushed

    private ladderDetectionArea: Phaser.GameObjects.Rectangle;
    private ladderHighlightBox: Phaser.GameObjects.Rectangle;
    private plankDetectionArea1: Phaser.GameObjects.Rectangle;
    private plankDetectionArea2: Phaser.GameObjects.Rectangle;
    private plankDetectionAreasGroup: Phaser.GameObjects.Container;
    private plankHighlightBox: Phaser.GameObjects.Rectangle;
    private plankPlatforms?: Phaser.Physics.Arcade.StaticGroup;
    private plankPlatform?: Phaser.Physics.Arcade.Image;
    private keyDetectionArea: Phaser.GameObjects.Rectangle;

    private hearts?: Phaser.GameObjects.Sprite[] = [];
    private lives: number = 3;
    private isColliding: boolean = false;
    private collidingWithSpikes: boolean = false;

    private level0State: number;
    private level1State: number;
    private level2State: number;
    private level3State: number;

    private timerText: Phaser.GameObjects.Text;
    private startTime: number;
    private pausedTime = 0;
    private elapsedTime: number;
    private isPaused: boolean = false;

    private threeStarsPopup: Phaser.GameObjects.Group;
    private twoStarsPopup: Phaser.GameObjects.Group;
    private oneStarPopup: Phaser.GameObjects.Group;
    private starsPopup: Phaser.GameObjects.Group;

    constructor() {
        super({ key: "Level0" });
    }

    preload() {
        this.load.image("level0-background", "assets/level0-background.jpg");
        this.load.image("stackpack", "assets/stackpack.png");

        this.load.image("glowingSpot", "assets/glowingSpot.png");

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

        this.load.image("EButton", "assets/EButton.png");
        this.load.image("FButton", "assets/FButton.png");
        this.load.image("EtoPush", "assets/EtoPush.png");
        this.load.image("FtoPop", "assets/FtoPop.png");

        this.load.image(
            "MovementInstructions",
            "assets/Movement-Instructions.png"
        );

        this.load.image("OrderInstructions", "assets/Order-Instructions.png");

        this.load.image(
            "FreePopInstructions",
            "assets/FreePop-Instructions.png"
        );
        this.load.image("pop-button", "assets/freePop2.png");

        this.load.image("pause-button", "assets/pause2.png");
        this.load.image("pause-popup", "assets/paused-popup.png");

        this.load.image("3stars", "assets/FullStars.png");
        this.load.image("2stars", "assets/2Stars.png");
        this.load.image("1star", "assets/1Star.png");
    }

    create(data: GameMapData) {
        this.level0State = data.level0State;
        this.level1State = data.level1State;
        this.level2State = data.level2State;
        this.level3State = data.level3State;

        this.lastDirection = "right";

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

        this.glowingSpot = this.add.image(350, 430, "glowingSpot");
        this.glowingSpot.setScale(0.4);

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
        this.createHearts();

        // Creating Free Pop Button
        const popButton = this.add.image(225, 80, "pop-button").setScale(0.31);
        popButton.setInteractive();

        const originalScale = popButton.scaleX;
        const hoverScale = originalScale * 1.05;

        // Change scale on hover
        popButton.on("pointerover", () => {
            this.tweens.add({
                targets: popButton,
                scaleX: hoverScale,
                scaleY: hoverScale,
                duration: 115, // Duration of the tween in milliseconds
                ease: "Linear", // Easing function for the tween
            });
        });

        // Restore original scale when pointer leaves
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

        // Creating Pause Group for Buttons and Pause Popup
        const pauseGroup = this.add.group();

        // Creating Pause Popup
        const pausePopup = this.add.image(650, 350, "pause-popup");
        pausePopup.setOrigin(0.5);
        pausePopup.setDepth(1);
        pauseGroup.add(pausePopup);

        // Exit button for Pause popup
        const exitButton = this.add.rectangle(640, 530, 200, 75).setDepth(1);
        exitButton.setOrigin(0.5);
        exitButton.setInteractive();
        pauseGroup.add(exitButton);

        exitButton.on("pointerover", () => {
            exitButton.setFillStyle(0xffff00).setAlpha(0.5);
        });

        exitButton.on("pointerout", () => {
            exitButton.setFillStyle();
        });

        exitButton.on("pointerup", () => {
            this.scene.start("game-map");
        });

        // Return button for Pause popup
        const restartButton = this.add.rectangle(640, 425, 200, 75).setDepth(1);
        restartButton.setOrigin(0.5);
        restartButton.setInteractive();
        pauseGroup.add(restartButton);

        restartButton.on("pointerover", () => {
            restartButton.setFillStyle(0xffff00).setAlpha(0.5);
        });

        restartButton.on("pointerout", () => {
            restartButton.setFillStyle();
        });

        restartButton.on("pointerup", () => {
            this.scene.restart();
        });

        // Resume button for Pause popup
        const resumeButton = this.add.rectangle(640, 320, 200, 75).setDepth(1);
        resumeButton.setOrigin(0.5);
        resumeButton.setInteractive();
        pauseGroup.add(resumeButton);

        resumeButton.on("pointerover", () => {
            resumeButton.setFillStyle(0xffff00).setAlpha(0.5);
        });

        resumeButton.on("pointerout", () => {
            resumeButton.setFillStyle();
        });

        resumeButton.on("pointerup", () => {
            pauseGroup.setVisible(false);
            this.pauseTime();
        });

        // No music button for Pause popup
        const muteMusic = this.add.rectangle(585, 217, 90, 90).setDepth(1);
        muteMusic.setOrigin(0.5);
        muteMusic.setInteractive();
        pauseGroup.add(muteMusic);

        muteMusic.on("pointerover", () => {
            muteMusic.setFillStyle(0xffff00).setAlpha(0.5);
        });

        muteMusic.on("pointerout", () => {
            muteMusic.setFillStyle();
        });

        // Has to get fixed once we have sound
        muteMusic.on("pointerup", () => {
            pauseGroup.setVisible(false);
        });

        // No sound button for Pause popup
        const muteSound = this.add.rectangle(700, 217, 90, 90).setDepth(1);
        muteSound.setOrigin(0.5);
        muteSound.setInteractive();
        pauseGroup.add(muteSound);

        muteSound.on("pointerover", () => {
            muteSound.setFillStyle(0xffff00).setAlpha(0.5);
        });

        muteSound.on("pointerout", () => {
            muteSound.setFillStyle();
        });

        // Has to get fixed once we have sound
        muteSound.on("pointerup", () => {
            pauseGroup.setVisible(false);
        });

        pauseGroup.setVisible(false);

        // Creating Pause Button
        const pauseButton = this.add
            .image(30, 30, "pause-button")
            .setScale(0.25);
        pauseButton.setInteractive();

        const pauseOriginalScale = pauseButton.scaleX;
        const pauseHoverScale = pauseOriginalScale * 1.05;

        // Change scale on hover
        pauseButton.on("pointerover", () => {
            this.tweens.add({
                targets: pauseButton,
                scaleX: pauseHoverScale,
                scaleY: pauseHoverScale,
                duration: 115, // Duration of the tween in milliseconds
                ease: "Linear", // Easing function for the tween
            });
        });

        // Restore original scale when pointer leaves
        pauseButton.on("pointerout", () => {
            this.tweens.add({
                targets: pauseButton,
                scaleX: pauseOriginalScale,
                scaleY: pauseOriginalScale,
                duration: 115, // Duration of the tween in milliseconds
                ease: "Linear", // Easing function for the tween
            });
        });

        pauseButton.on("pointerup", () => {
            this.pauseTime();
            pauseGroup.setVisible(true);
        });

        // Creating timer
        this.timerText = this.add.text(60, 15, "Time: 0", {
            fontSize: "32px",
            color: "#000000",
        });
        this.startTime = this.time.now;
        this.pausedTime = 0;
        this.isPaused = false;

        // Level complete popup - still working
        const completeExitButton = this.add.circle(790, 185, 35).setDepth(1);
        completeExitButton.setInteractive();
        completeExitButton.on("pointerover", () => {
            completeExitButton.setFillStyle(0xffff00).setAlpha(0.5);
        });
        completeExitButton.on("pointerout", () => {
            completeExitButton.setFillStyle();
        });

        const completeReplayButton = this.add.circle(510, 505, 55).setDepth(1);
        completeReplayButton.setInteractive();
        completeReplayButton.on("pointerover", () => {
            completeReplayButton.setFillStyle(0xffff00).setAlpha(0.5);
        });
        completeReplayButton.on("pointerout", () => {
            completeReplayButton.setFillStyle();
        });

        const completeMenuButton = this.add.circle(655, 530, 55).setDepth(1);
        completeMenuButton.setInteractive();
        completeMenuButton.on("pointerover", () => {
            completeMenuButton.setFillStyle(0xffff00).setAlpha(0.5);
        });
        completeMenuButton.on("pointerout", () => {
            completeMenuButton.setFillStyle();
        });

        const completeNextButton = this.add.circle(800, 505, 55).setDepth(1);
        completeNextButton.setInteractive();
        completeNextButton.on("pointerover", () => {
            completeNextButton.setFillStyle(0xffff00).setAlpha(0.5);
        });
        completeNextButton.on("pointerout", () => {
            completeNextButton.setFillStyle();
        });

        this.threeStarsPopup = this.add.group();
        const threeStars = this.add.image(650, 350, "3stars");
        this.threeStarsPopup.add(threeStars);
        this.threeStarsPopup.add(completeExitButton);
        this.threeStarsPopup.add(completeReplayButton);
        this.threeStarsPopup.add(completeMenuButton);
        this.threeStarsPopup.add(completeNextButton);

        this.twoStarsPopup = this.add.group();
        const twoStars = this.add.image(650, 350, "2stars");
        this.twoStarsPopup.add(twoStars);
        this.twoStarsPopup.add(completeExitButton);
        this.twoStarsPopup.add(completeReplayButton);
        this.twoStarsPopup.add(completeMenuButton);
        this.twoStarsPopup.add(completeNextButton);

        this.oneStarPopup = this.add.group();
        const oneStar = this.add.image(650, 350, "1star");
        this.oneStarPopup.add(oneStar);
        this.oneStarPopup.add(completeExitButton);
        this.oneStarPopup.add(completeReplayButton);
        this.oneStarPopup.add(completeMenuButton);
        this.oneStarPopup.add(completeNextButton);

        completeExitButton.on("pointerup", () => {
            if (threeStars.visible) {
                this.threeStarsPopup.setVisible(false);
            }
            if (twoStars.visible) {
                this.twoStarsPopup.setVisible(false);
            }
            if (oneStar.visible) {
                this.oneStarPopup.setVisible(false);
            }
        });

        completeReplayButton.on("pointerup", () => {
            this.scene.restart();
        });

        completeMenuButton.on("pointerup", () => {
            if (this.level1State == 0) {
                setTimeout(() => {
                    this.scene.start("game-map", {
                        level0State: 3,
                        level1State: 1,
                        level2State: this.level2State,
                        level3State: this.level3State,
                    });
                }, 500);
            } else {
                setTimeout(() => {
                    this.scene.start("game-map", {
                        level0State: 3,
                        level1State: this.level1State,
                        level2State: this.level2State,
                        level3State: this.level3State,
                    });
                }, 1000);
            }
        });

        completeNextButton.on("pointerup", () => {
            this.scene.start("Level1");
        });

        this.threeStarsPopup.setVisible(false);
        this.twoStarsPopup.setVisible(false);
        this.oneStarPopup.setVisible(false);

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

        // Creating detection areas when using the ladder
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

        // Creating detection areas when using the plank
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

        // Text Boxes
        this.pushDialogue = this.add.image(350, 550, "EtoPush").setScale(1, 1);
        this.popDialogue = this.add.image(750, 650, "FtoPop").setScale(1, 1);
        this.pushButton1 = this.add.image(1100, 650, "EButton").setScale(1, 1);
        this.pushButton2 = this.add.image(1250, 730, "EButton").setScale(1, 1);
        this.popButton1 = this.add.image(750, 500, "FButton").setScale(1, 1);
        this.popButton2 = this.add.image(900, 300, "FButton").setScale(1, 1);
        this.movementInstruction = this.add
            .image(200, 600, "MovementInstructions")
            .setScale(1, 1);
        this.orderInstruction = this.add
            .image(1090, 380, "OrderInstructions")
            .setScale(0.45);
        this.orderInstruction.setVisible(false);
        this.freepopDialogue = this.add
            .image(190, 130, "FreePopInstructions")
            .setScale(0.45);
        this.freepopDialogue.setVisible(false);

        this.pushDialogue.setVisible(false);
        this.popDialogue.setVisible(false);
        this.pushButton1.setVisible(false);
        this.pushButton2.setVisible(false);
        this.popButton1.setVisible(false);
        this.popButton2.setVisible(false);

        // Make plank and ladder items continuously pulsate
        this.createPulsateEffect(
            this,
            this.plank,
            1.15, // Scale factor for pulsating effect
            1000 // Duration of each tween cycle in milliseconds
        );
        this.createPulsateEffect(
            this,
            this.ladder,
            1.1, // Scale factor for pulsating effect
            1000 // Duration of each tween cycle in milliseconds
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
                        this.popButton2?.setVisible(false);
                        this.door?.setTexture("opendoor");
                        this.pauseTime();
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
                                    var completedTime = this.add
                                        .text(
                                            640,
                                            345,
                                            this.formatTime(this.elapsedTime),
                                            {
                                                fontSize: "40px",
                                                color: "#000000",
                                            }
                                        )
                                        .setDepth(1)
                                        .setVisible(false);
                                    // Level popup depends on time it takes to complete
                                    if (this.elapsedTime <= 30000) {
                                        this.starsPopup = this.threeStarsPopup;
                                        this.threeStarsPopup.add(completedTime);
                                        this.threeStarsPopup.setVisible(true);
                                    }
                                    if (
                                        this.elapsedTime > 30000 &&
                                        this.elapsedTime <= 60000
                                    ) {
                                        this.starsPopup = this.twoStarsPopup;
                                        this.twoStarsPopup.add(completedTime);
                                        this.twoStarsPopup.setVisible(true);
                                    }
                                    if (this.elapsedTime > 60000) {
                                        this.starsPopup = this.oneStarPopup;
                                        this.oneStarPopup.add(completedTime);
                                        this.oneStarPopup.setVisible(true);
                                    }
                                    // Animate level complete text
                                    this.tweens.add({
                                        targets: this.starsPopup,
                                        alpha: 1,
                                        duration: 5000,
                                        ease: "Linear",
                                        delay: 1000, // Delay the animation slightly
                                    });
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
                this.add.sprite(32 + i * 50, 80, "heart").setScale(0.5)
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
                    if (this.collidingWithSpikes) {
                        this.player?.setPosition(100, 450); // Reset player's position
                        this.collidingWithSpikes = false;
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

    private formatTime(milliseconds: number) {
        var mins = Math.floor(milliseconds / 60000);
        var secs = Math.floor((milliseconds % 60000) / 1000);
        return (
            mins.toString().padStart(2, "0") +
            ":" +
            secs.toString().padStart(2, "0")
        );
    }

    private pauseTime() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.pausedTime = this.time.now - this.startTime;
        } else {
            this.startTime = this.time.now - this.pausedTime;
        }
    }

    update() {
        // Updating timer
        if (!this.isPaused) {
            var currentTime = this.time.now;
            this.elapsedTime = currentTime - this.startTime;
            this.timerText.setText(
                "Time: " + this.formatTime(this.elapsedTime)
            );
        }

        // Continuously make glowing spot small and big
        const minScaleX = 0.18; // Minimum scale on x-axis
        const maxScaleX = 0.27; // Maximum scale on x-axis

        // Calculate the scale factor based on the sine function
        const scaleFactor = Math.sin(this.time.now / 400) * 0.5 + 0.5;

        // Map the scaleFactor to the range between minScaleX and maxScaleX
        const newScaleX = Phaser.Math.Linear(minScaleX, maxScaleX, scaleFactor);

        // Set the new scale on the x-axis while maintaining the original scale on the y-axis
        this.glowingSpot?.setScale(newScaleX, this.glowingSpot.scaleY);

        // Check if the player is on top of the glowing spot and if so, move to next location
        // After pushing plank
        if (
            this.player &&
            this.glowingSpot &&
            this.glowingSpot.x == 350 &&
            this.stack.length > 0 &&
            this.stack[this.stack.length - 1].name === "plank"
        ) {
            this.glowingSpot.setPosition(
                this.plankDetectionArea1.x - 40,
                this.plankDetectionArea1.y - 65
            );
        }
        // After popping plank
        if (
            this.player &&
            this.glowingSpot &&
            this.plank &&
            this.glowingSpot.x == this.plankDetectionArea1.x - 40 &&
            this.plank.x == 815
        ) {
            this.glowingSpot.setPosition(1115, 560);
        }
        // After pushing ladder
        if (
            this.player &&
            this.glowingSpot &&
            this.glowingSpot.x == 1115 &&
            Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                this.glowingSpot.x,
                this.glowingSpot.y + 150
            ) < 90
        ) {
            this.orderInstruction?.setVisible(true);
            this.glowingSpot.setVisible(false);
            this.glowingSpot.setPosition(0, 560);
            setTimeout(() => {
                this.orderInstruction?.setVisible(false);
                this.freepopDialogue?.setVisible(true);
            }, 4000);
            setTimeout(() => {
                this.freepopDialogue?.setVisible(false);
            }, 8000);
        }

        // Key animation
        if (this.key) {
            this.key.anims.play("turn", true);
        }

        // show movement instructions until any key is pressed
        if (this.player && this.cursors) {
            if (
                this.cursors.up.isDown ||
                this.cursors.down.isDown ||
                this.cursors.right.isDown ||
                this.cursors.left.isDown ||
                this.cursors.space.isDown
            ) {
                setTimeout(() => {
                    this.movementInstruction?.setVisible(false);
                }, 500);
            }
        }

        // Move the gal with arrow keys
        // Inside your update function or wherever you handle player movement
        if (this.player && this.cursors) {
            if (!this.isColliding) {
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
                () => {
                    this.collidingWithSpikes = true;
                    this.loseLife();
                },
                undefined,
                this
            );
        }

        // FtoPop DIALOGUE
        if (this.player && this.stack.length > 0) {
            if (
                Phaser.Geom.Intersects.RectangleToRectangle(
                    this.player.getBounds(),
                    this.plankDetectionAreasGroup.getBounds()
                ) &&
                this.stack[this.stack.length - 1].name === "plank"
            ) {
                this.popDialogue?.setVisible(true);
            } else {
                this.popDialogue?.setVisible(false);
            }
        }
        if (!(this.stack.length > 0)) {
            this.popDialogue?.setVisible(false);
        }

        // Making Text Boxes appear/disappear: EtoPush DIALOGUE
        if (this.player && this.plank) {
            if (
                Phaser.Math.Distance.Between(
                    this.player.x,
                    this.player.y,
                    this.plank.x,
                    this.plank.y
                ) < 100 &&
                !this.collectedItems.includes(this.plank)
            ) {
                this.pushDialogue?.setVisible(true);
            } else {
                this.pushDialogue?.setVisible(false);
            }
        }

        // E to push button1: ladder
        if (this.player && this.ladder) {
            if (
                Phaser.Math.Distance.Between(
                    this.player.x,
                    this.player.y,
                    this.ladder.x,
                    this.ladder.y
                ) < 100 &&
                !this.collectedItems.includes(this.ladder)
            ) {
                this.pushButton1?.setVisible(true);
            } else {
                this.pushButton1?.setVisible(false);
            }
        }

        // E to push button2: key
        if (this.player && this.key) {
            if (
                Phaser.Math.Distance.Between(
                    this.player.x,
                    this.player.y,
                    this.key.x,
                    this.key.y
                ) < 100 &&
                !this.collectedItems.includes(this.key)
            ) {
                this.pushButton2?.setVisible(true);
            } else {
                this.pushButton2?.setVisible(false);
            }
        }

        // F to push button1: ladder
        if (this.player && this.stack.length > 0) {
            if (
                Phaser.Geom.Intersects.RectangleToRectangle(
                    this.player.getBounds(),
                    this.ladderDetectionArea.getBounds()
                ) &&
                this.stack[this.stack.length - 1].name === "ladder"
            ) {
                this.popButton1?.setVisible(true);
            } else {
                this.popButton1?.setVisible(false);
            }
        }

        // F to push button: key
        if (this.player && this.stack.length > 0) {
            if (
                Phaser.Geom.Intersects.RectangleToRectangle(
                    this.player.getBounds(),
                    this.keyDetectionArea.getBounds()
                ) &&
                this.stack[this.stack.length - 1].name === "key"
            ) {
                this.popButton2?.setVisible(true);
            } else {
                this.popButton2?.setVisible(false);
            }
        }
    }
}
