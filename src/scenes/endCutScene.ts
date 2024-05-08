import Phaser from "phaser";

interface GameMapData {
    level0State: number;
    level1State: number;
    level2State: number;
    level3State: number;
}

export default class EndCutScene extends Phaser.Scene {
    private player?: Phaser.Physics.Arcade.Sprite;
    private dude?: Phaser.Physics.Arcade.Sprite;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private platforms?: Phaser.Physics.Arcade.StaticGroup;
    private door?: Phaser.Physics.Arcade.Image;
    private ground?: Phaser.Physics.Arcade.Image;
    private stackpack?: Phaser.GameObjects.Image;

    private galMove: string = "right";
    private dudeMove: string = "left";
    private galLastDirection: string = "right";
    private dudeLastDirection: string = "right";

    private level0State: number;
    private level1State: number;
    private level2State: number;
    private level3State: number;

    constructor() {
        super({ key: "EndCutScene" });
    }

    preload() {
        this.load.image(
            "end-cutscene-background",
            "assets/cutscenes/end-background1.jpeg"
        );
        this.load.image("just-stackpack", "assets/backpack.png");

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
            "gal_walk_right",
            "assets/Pink_Monster_Walk_6.png",
            {
                frameWidth: 128,
                frameHeight: 128,
            }
        );
        this.load.spritesheet(
            "gal_walk_left",
            "assets/Pink_Monster_Walk_Left6.png",
            { frameWidth: 128, frameHeight: 128 }
        );
        /*this.load.spritesheet(
            "gal_jump_right",
            "assets/Pink_Monster_Jump_8.png",
            { frameWidth: 128, frameHeight: 128 }
        );*/

        this.load.spritesheet(
            "dude_idle_right",
            "assets/Dude_Monster_Idle_4.png",
            { frameWidth: 128, frameHeight: 128 }
        );
        this.load.spritesheet(
            "dude_idle_left",
            "assets/Dude_Monster_Idle_Left4.png",
            { frameWidth: 128, frameHeight: 128 }
        );
        this.load.spritesheet(
            "dude_walk_right",
            "assets/Dude_Monster_Walk_6.png",
            {
                frameWidth: 128,
                frameHeight: 128,
            }
        );
        this.load.spritesheet(
            "dude_walk_left",
            "assets/Dude_Monster_Walk_Left6.png",
            {
                frameWidth: 128,
                frameHeight: 128,
            }
        );
        this.load.spritesheet(
            "dude_run_right",
            "assets/Dude_Monster_Run_6.png",
            {
                frameWidth: 128,
                frameHeight: 128,
            }
        );
        this.load.spritesheet(
            "dude_run_left",
            "assets/Dude_Monster_Run_Left6.png",
            {
                frameWidth: 128,
                frameHeight: 128,
            }
        );

        this.load.image("level0-platform", "assets/level0/platform.png");

        this.load.image("red-opendoor", "assets/level3/red-door-open.png");
    }

    create(data: GameMapData) {
        // Resume all animations and tweens
        this.anims.resumeAll();
        this.tweens.resumeAll();
        // Make it so player can enter keyboard input
        if (this.input.keyboard) {
            this.input.keyboard.enabled = true;
        }

        this.level0State = data.level0State;
        this.level1State = data.level1State;
        this.level2State = data.level2State;
        this.level3State = data.level3State;

        this.galMove = "";
        this.dudeMove = "";
        this.galLastDirection = "right";
        this.dudeLastDirection = "left";

        const backgroundImage = this.add
            .image(0, 0, "end-cutscene-background")
            .setOrigin(0, 0);
        backgroundImage.setScale(
            this.cameras.main.width / backgroundImage.width + 0.1,
            this.cameras.main.height / backgroundImage.height
        );

        this.stackpack = this.add
            .image(0, 0, "just-stackpack")
            .setPosition(100, 551)
            .setOrigin(0.5, 1);
        this.stackpack.setScale(0.1, 0.1);

        // Creating Gal
        this.player = this.physics.add
            .sprite(120, 150, "gal_walk_right")
            .setScale(1.5, 1.5)
            .setOrigin(0.5, 0.5);
        this.player.setCollideWorldBounds(true);

        this.anims.create({
            key: "gal_walk_right",
            frames: this.anims.generateFrameNumbers("gal_walk_right", {
                start: 0,
                end: 5,
            }),
            repeat: -1,
        });
        this.anims.create({
            key: "gal_walk_left",
            frames: this.anims.generateFrameNumbers("gal_walk_left", {
                start: 0,
                end: 5,
            }),
            repeat: -1,
        });
        this.anims.create({
            key: "gal_idle_right",
            frames: this.anims.generateFrameNumbers("gal_idle_right", {
                start: 0,
                end: 3,
            }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: "gal_idle_left",
            frames: this.anims.generateFrameNumbers("gal_idle_left", {
                start: 0,
                end: 3,
            }),
            frameRate: 10,
            repeat: -1,
        });

        // Creating Guy
        this.dude = this.physics.add
            .sprite(this.cameras.main.width - 120, 430, "dude_run_right")
            .setScale(1.5, 1.5)
            .setOrigin(0.5, 0.5);
        this.dude.setCollideWorldBounds(true);

        this.anims.create({
            key: "dude_idle_right",
            frames: this.anims.generateFrameNumbers("dude_idle_right", {
                start: 0,
                end: 3,
            }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: "dude_idle_left",
            frames: this.anims.generateFrameNumbers("dude_idle_left", {
                start: 0,
                end: 3,
            }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: "dude_walk_right",
            frames: this.anims.generateFrameNumbers("dude_walk_right", {
                start: 0,
                end: 5,
            }),
            repeat: -1,
        });
        this.anims.create({
            key: "dude_walk_left",
            frames: this.anims.generateFrameNumbers("dude_walk_left", {
                start: 0,
                end: 5,
            }),
            repeat: -1,
        });
        this.anims.create({
            key: "dude_run_right",
            frames: this.anims.generateFrameNumbers("dude_run_right", {
                start: 0,
                end: 5,
            }),
            repeat: -1,
        });
        this.anims.create({
            key: "dude_run_left",
            frames: this.anims.generateFrameNumbers("dude_run_left", {
                start: 0,
                end: 5,
            }),
            repeat: -1,
        });

        this.cursors = this.input.keyboard?.createCursorKeys();

        // Create platforms
        this.platforms = this.physics.add.staticGroup();
        this.ground = this.platforms.create(
            650,
            633,
            "level0-platform"
        ) as Phaser.Physics.Arcade.Image;

        this.ground.setScale(5).refreshBody();
        this.ground.setAlpha(0); // Hide the ground platform

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.dude, this.platforms);

        /*this.door = this.physics.add
            .image(187, 150, "red-opendoor")
            .setScale(0.15, 0.15);
        this.physics.add.collider(this.door, this.platforms);*/

        // Resize collision boxes of player and everything else that can be collided with
        this.player
            .setSize(this.player.width - 64, this.player.height)
            .setOffset(32, 0)
            .setDepth(10);

        this.dude
            .setSize(this.dude.width - 64, this.dude.height)
            .setOffset(32, 0)
            .setDepth(10);

        /*this.door
            .setSize(this.door.width, this.door.height - 60)
            .setOffset(0, 0);*/
        this.animateEnding2();
    }

    private animateEnding2() {
        // Step 1: Both player and dude run to the middle of the screen
        setTimeout(() => {
            // Tween for the player
            this.tweens.add({
                targets: this.player,
                x: this.cameras.main.centerX - 60,
                duration: 1200,
                onStart: () => {
                    this.galMove = "right";
                },
                onComplete: () => {
                    this.galMove = "";
                },
            });

            // Tween for the dude
            this.tweens.add({
                targets: this.dude,
                x: this.cameras.main.centerX + 60,
                duration: 1500,
                onStart: () => {
                    this.dudeMove = "left";
                },
                onComplete: () => {
                    this.dudeMove = "";
                },
            });
        }, 1000);

        // Spin around each other
        /*setTimeout(() => {
            const centerX = this.cameras.main.centerX;
            const centerY = this.cameras.main.centerY - 200; // Adjust the height of lifting
            const radius = 60; // Adjust the radius of circular motion
            const duration = 800; // Adjust the duration of one round
            const easeType = "Linear";

            // Initial motion: player moves right, dude moves left while going up
            this.tweens.add({
                targets: this.player,
                x: centerX + radius,
                y: centerY + 180,
                duration: duration,
                ease: "Quad.easeIn",
                onStart: () => {
                    this.player?.setDepth(3);
                },
            });

            this.tweens.add({
                targets: this.dude,
                x: centerX - radius,
                y: centerY + 180,
                duration: duration,
                ease: "Quad.easeIn",
                onStart: () => {
                    this.dude?.setDepth(2);
                },
                onComplete: () => {
                    // Swap depths
                    if (this.player && this.dude) {
                        const playerDepth = this.player.depth;
                        this.player.setDepth(this.dude.depth);
                        this.dude.setDepth(playerDepth);
                        this.player.setScale(
                            -this.player.scaleX,
                            this.player.scaleY
                        );
                        this.dude.setScale(-this.dude.scaleX, this.dude.scaleY);
                    }

                    // Second motion: player moves left, dude moves right while going up
                    this.tweens.add({
                        targets: this.player,
                        x: centerX - radius,
                        y: centerY,
                        duration: duration,
                        ease: easeType,
                    });

                    this.tweens.add({
                        targets: this.dude,
                        x: centerX + radius,
                        y: centerY,
                        duration: duration,
                        ease: easeType,
                        onComplete: () => {
                            // Swap depths again
                            if (this.player && this.dude) {
                                const playerDepth = this.player.depth;
                                this.player.setDepth(this.dude.depth);
                                this.dude.setDepth(playerDepth);
                                this.player.setScale(
                                    -this.player.scaleX,
                                    this.player.scaleY
                                );
                                this.dude.setScale(
                                    -this.dude.scaleX,
                                    this.dude.scaleY
                                );
                            }

                            // Move downwards: player moves right, dude moves left while going down
                            this.tweens.add({
                                targets: this.player,
                                x: centerX + radius,
                                y: centerY + 90, // Adjust the downward motion
                                duration: duration,
                                ease: easeType,
                            });

                            this.tweens.add({
                                targets: this.dude,
                                x: centerX - radius,
                                y: centerY + 90, // Adjust the downward motion
                                duration: duration,
                                ease: easeType,
                                onComplete: () => {
                                    // Swap depths again
                                    if (this.player && this.dude) {
                                        const playerDepth = this.player.depth;
                                        this.player.setDepth(this.dude.depth);
                                        this.dude.setDepth(playerDepth);
                                        this.player.setScale(
                                            -this.player.scaleX,
                                            this.player.scaleY
                                        );
                                        this.dude.setScale(
                                            -this.dude.scaleX,
                                            this.dude.scaleY
                                        );
                                    }

                                    this.tweens.add({
                                        targets: this.player,
                                        x: centerX - radius,
                                        y: centerY + 200, // Adjust the downward motion
                                        duration: duration,
                                        ease: easeType,
                                    });

                                    this.tweens.add({
                                        targets: this.dude,
                                        x: centerX + radius,
                                        y: centerY + 200, // Adjust the downward motion
                                        duration: duration,
                                        ease: easeType,
                                        onComplete: () => {
                                            // Swap depths again
                                            if (this.player && this.dude) {
                                                const playerDepth =
                                                    this.player.depth;
                                                this.player.setDepth(
                                                    this.dude.depth
                                                );
                                                this.dude.setDepth(playerDepth);
                                                this.player.setScale(
                                                    -this.player.scaleX,
                                                    this.player.scaleY
                                                );
                                                this.dude.setScale(
                                                    -this.dude.scaleX,
                                                    this.dude.scaleY
                                                );
                                            }
                                        },
                                    });
                                },
                            });
                        },
                    });
                },
            });
        }, 3000);*/

        // Step 2: Player looks left

        // Step 3: Player looks back right to the dude
        // Step 4: Player walks to the left and collects the stackpack
        // Step 5: Player walks back to the dude
        // Step 6: A heart appears and fills the whole screen
    }

    private animateEnding() {
        // Step 1: Run towards the middle of the screen
        this.tweens.add({
            targets: [this.player, this.dude],
            x: this.cameras.main.centerX,
            duration: 2000,
            onComplete: () => {
                this.dude?.setVelocity(0, 0);
                // Step 2: Player turns left
                this.player?.anims.play("gal_walk_left", true);

                // Step 3: Player turns right
                this.time.delayedCall(1000, () => {
                    this.player?.anims.play("gal_walk_right", true);

                    // Step 4: Player walks to the left and collects the stackpack
                    this.tweens.add({
                        targets: this.player,
                        x: this.stackpack?.x,
                        duration: 2000,
                        onComplete: () => {
                            // Stackpack animation (shrink)
                            this.tweens.add({
                                targets: this.stackpack,
                                scaleX: 0,
                                scaleY: 0,
                                duration: 1000,
                            });

                            // Step 5: Player walks back to the dude
                            this.time.delayedCall(2000, () => {
                                this.tweens.add({
                                    targets: this.player,
                                    x: this.dude?.x,
                                    duration: 2000,
                                    onComplete: () => {
                                        // Step 6: Heart animation
                                        this.animateHeart();
                                    },
                                });
                            });
                        },
                    });
                });
            },
        });
    }

    private animateHeart() {
        const heart = this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            "heart"
        );
        heart.setScale(0);

        this.tweens.add({
            targets: heart,
            scaleX: 1,
            scaleY: 1,
            duration: 3000,
            onComplete: () => {
                // End of the cutscene
                console.log("End of cutscene");
            },
        });
    }

    update() {
        // Gal animations
        if (this.player) {
            if (this.galMove == "up") {
                this.player.setVelocityY(-530);
            } else if (this.galMove == "right") {
                //this.player.setVelocityX(290);
                this.player.anims.play("gal_walk_right", true);
                this.galLastDirection = "right"; // Update last direction
            } else if (this.galMove == "left") {
                //this.player.setVelocityX(-290);
                this.player.anims.play("gal_walk_left", true);
                this.galLastDirection = "left"; // Update last direction
            } else {
                this.player.setVelocityX(0);
                // Check last direction and play corresponding idle animation
                if (this.galLastDirection === "right") {
                    this.player.anims.play("gal_idle_right", true);
                } else {
                    this.player.anims.play("gal_idle_left", true);
                }
            }
        }

        // Guy animations
        if (this.dude) {
            if (this.dudeMove == "up") {
                this.dude.anims.play("dude_idle_right", true);
                this.dude.setVelocityY(-530);
            } else if (this.dudeMove == "right") {
                //this.dude.setVelocityX(290);
                this.dude.anims.play("dude_run_right", true);
                this.dudeLastDirection = "right"; // Update last direction
            } else if (this.dudeMove == "left") {
                //this.dude.setVelocityX(-290);
                this.dude.anims.play("dude_run_left", true);
                this.dudeLastDirection = "left"; // Update last direction
            } else {
                this.dude.setVelocityX(0);
                // Check last direction and play corresponding idle animation
                if (this.dudeLastDirection === "right") {
                    this.dude.anims.play("dude_idle_right", true);
                } else {
                    this.dude.anims.play("dude_idle_left", true);
                }
            }
        }
        /*// Move the gal with arrow keys
        // Inside your update function or wherever you handle player movement
        if (this.player && this.cursors) {
            if (this.cursors.up.isDown && this.player.body?.touching.down) {
                this.player.setVelocityY(-530);
            } else if (this.cursors.right.isDown) {
                this.player.setVelocityX(290);
                this.player.anims.play("gal_walk_right", true);
                this.lastDirection = "right"; // Update last direction
            } else if (this.cursors.left.isDown) {
                this.player.setVelocityX(-290);
                this.player.anims.play("gal_walk_left", true);
                this.lastDirection = "left"; // Update last direction
            } else {
                this.player.setVelocityX(0);
                // Check last direction and play corresponding idle animation
                if (this.lastDirection === "right") {
                    this.player.anims.play("gal_idle_right", true);
                } else {
                    this.player.anims.play("gal_idle_left", true);
                }
            }
        }

        if (this.dude && this.cursors) {
            if (this.cursors.up.isDown && this.dude.body?.touching.down) {
                this.dude.anims.play("dude_idle_right", true);
                this.dude.setVelocityY(-530);
            } else if (this.cursors.right.isDown) {
                this.dude.setVelocityX(-290);
                this.dude.anims.play("dude_run_left", true);
                this.lastDirection = "right"; // Update last direction
            } else if (this.cursors.left.isDown) {
                this.dude.setVelocityX(290);
                this.dude.anims.play("dude_run_right", true);
                this.lastDirection = "left"; // Update last direction
            } else {
                this.dude.setVelocityX(0);
                // Check last direction and play corresponding idle animation
                if (this.lastDirection === "right") {
                    this.dude.anims.play("dude_idle_left", true);
                } else {
                    this.dude.anims.play("dude_idle_right", true);
                }
            }
        }*/
    }
}
