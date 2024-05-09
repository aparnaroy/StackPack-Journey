import Phaser from "phaser";

export default class TitleScreen extends Phaser.Scene {
    constructor() {
        super({ key: "title-screen" });
    }

    preload() {
        this.load.image("title-screen", "assets/title-screen.png");
        this.load.image("play-button", "assets/play-button.png");
    }

    create() {
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
            525,
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
            //this.scene.start("game-map");
            this.scene.start("EndCutScene");
        });
    }

    update() {}
}
