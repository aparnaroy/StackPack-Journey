import Phaser from "phaser";

export default class TitleScreen extends Phaser.Scene {
    private player?: Phaser.Physics.Arcade.Sprite;
    private dude?: Phaser.Physics.Arcade.Sprite;
    private platforms?: Phaser.Physics.Arcade.StaticGroup;
    private ground?: Phaser.Physics.Arcade.Image;

    constructor() {
        super({ key: "title-screen" });
    }

    preload() {
        this.load.image("title-screen", "assets/title-screen.png");
        this.load.image("play-button", "assets/play-button.png");

        this.load.spritesheet(
            "gal_idle_right",
            "assets/Pink_Monster_Idle_4.png",
            { frameWidth: 128, frameHeight: 128 }
        );

        this.load.spritesheet(
            "dude_idle_left",
            "assets/Dude_Monster_Idle_Left4.png",
            { frameWidth: 128, frameHeight: 128 }
        );

        this.load.image("level0-platform", "assets/level0/platform.png");
    }

    create() {
        // Creating Gal
        this.player = this.physics.add
            .sprite(370, 485, "gal_idle_right")
            .setScale(1.5, 1.5)
            .setDepth(35);
        this.player.setCollideWorldBounds(true);

        this.anims.create({
            key: "gal_idle_right",
            frames: this.anims.generateFrameNumbers("gal_idle_right", {
                start: 0,
                end: 3,
            }),
            frameRate: 10,
            repeat: -1,
        });
        this.player.anims.play("gal_idle_right", true);

        // Creating Guy
        this.dude = this.physics.add
            .sprite(this.cameras.main.width - 370, 485, "dude_idle_left")
            .setScale(1.5, 1.5)
            .setDepth(35);
        this.dude.setCollideWorldBounds(true);

        this.anims.create({
            key: "dude_idle_left",
            frames: this.anims.generateFrameNumbers("dude_idle_left", {
                start: 0,
                end: 3,
            }),
            frameRate: 10,
            repeat: -1,
        });
        this.dude.anims.play("dude_idle_left", true);

        // Create platform
        this.platforms = this.physics.add.staticGroup();
        this.ground = this.platforms.create(
            650,
            663,
            "level0-platform"
        ) as Phaser.Physics.Arcade.Image;

        this.ground.setScale(5).refreshBody();
        this.ground.setAlpha(0); // Hide the ground platform

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.dude, this.platforms);

        const backgroundImage = this.add
            .image(0, 0, "title-screen")
            .setOrigin(0, 0);
        backgroundImage.setScale(
            this.cameras.main.width / backgroundImage.width,
            this.cameras.main.height / backgroundImage.height
        );

        // Go to levels map on play button click
        const playButton = this.add.image(
            this.cameras.main.width / 2,
            545,
            "play-button"
        );
        playButton.setScale(0.42);

        playButton.setInteractive();

        const originalScale = playButton.scaleX;
        const hoverScale = originalScale * 1.09;

        // Change scale on hover
        playButton.on("pointerover", () => {
            this.tweens.add({
                targets: playButton,
                scaleX: hoverScale,
                scaleY: hoverScale,
                duration: 115, // Duration of the tween in milliseconds
                ease: "Linear", // Easing function for the tween
            });
        });

        // Restore original scale when pointer leaves
        playButton.on("pointerout", () => {
            this.tweens.add({
                targets: playButton,
                scaleX: originalScale,
                scaleY: originalScale,
                duration: 115, // Duration of the tween in milliseconds
                ease: "Linear", // Easing function for the tween
            });
        });

        playButton.on("pointerup", () => {
            this.scene.start("game-map");
        });
    }

    update() {}
}
