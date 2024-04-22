import Phaser from "phaser";

// 0 = Locked, 1 = Just Unlocked, 2 = Current Level, 3 = Completed
interface GameMapData {
    level0State: number;
    level1State: number;
    level2State: number;
    level3State: number;
}

export default class GameMap extends Phaser.Scene {
    private level0State: number;
    private level1State: number;
    private level2State: number;
    private level3State: number;

    constructor() {
        super({ key: "game-map" });
    }

    preload() {
        this.load.image("game-map", "assets/game-map.png");
        this.load.image("level0-unlocked", "assets/level0-button-unlocked.png");
        this.load.image(
            "level0-completed",
            "assets/level0-button-completed.png"
        );
        this.load.image("level1-locked", "assets/level1-button-locked.png");
        this.load.image("level1-unlocked", "assets/level1-button-unlocked.png");
        this.load.image(
            "level1-completed",
            "assets/level1-button-completed.png"
        );
        this.load.image("level2-locked", "assets/level2-button-locked.png");
        this.load.image("level2-unlocked", "assets/level2-button-unlocked.png");
        this.load.image(
            "level2-completed",
            "assets/level2-button-completed.png"
        );
        this.load.image("level3-locked", "assets/level3-button-locked.png");
        this.load.image("level3-unlocked", "assets/level3-button-unlocked.png");
        this.load.image(
            "level3-completed",
            "assets/level3-button-completed.png"
        );
        this.load.image("level0-button", "assets/level0-button.png");
        this.load.image("level1-button", "assets/level1-button.png");
        this.load.image("level2-button", "assets/level2-button.png");
        this.load.image("level3-button", "assets/level3-button.png");
    }

    create(data: GameMapData) {
        this.level0State = data.level0State | 2;
        this.level1State = data.level1State | 0;
        this.level2State = data.level2State | 0;
        this.level3State = data.level3State | 0;

        const backgroundImage = this.add
            .image(0, 0, "game-map")
            .setOrigin(0, 0);
        backgroundImage.setScale(
            this.cameras.main.width / backgroundImage.width,
            this.cameras.main.height / backgroundImage.height
        );

        const originalScale = 0.43;
        const hoverScale = 0.46;

        // Level 0 Button:
        const level0Button = this.add.image(180, 552, "level0-unlocked");
        level0Button.setScale(originalScale);

        if (this.level0State == 3) {
            level0Button.setTexture("level0-completed");
        }

        level0Button.setInteractive();

        level0Button.on("pointerup", () => {
            this.scene.start("Level0", {
                level0State: this.level0State,
                level1State: this.level1State,
                level2State: this.level2State,
                level3State: this.level3State,
            });
        });

        // Change scale on hover
        level0Button.on("pointerover", () => {
            this.tweens.add({
                targets: level0Button,
                scaleX: hoverScale,
                scaleY: hoverScale,
                duration: 100, // Duration of the tween in milliseconds
                ease: "Linear", // Easing function for the tween
            });
        });

        // Restore original scale when pointer leaves
        level0Button.on("pointerout", () => {
            this.tweens.add({
                targets: level0Button,
                scaleX: originalScale,
                scaleY: originalScale,
                duration: 100, // Duration of the tween in milliseconds
                ease: "Linear", // Easing function for the tween
            });
        });

        // Level 1 Button:
        const level1Button = this.add.image(419, 355, "level1-locked");
        level1Button.setScale(originalScale);

        // If level 0 just completed, animate the unlocking of level 1
        if (this.level1State == 1) {
            this.tweens.add({
                targets: level1Button,
                alpha: 0.3, // Fade out the locked button
                duration: 500,
                onComplete: () => {
                    level1Button.setTexture("level1-unlocked");
                    level1Button.setScale(originalScale);
                    level1Button.setAlpha(0); // Make the unlocked button invisible initially

                    this.tweens.add({
                        targets: level1Button,
                        alpha: 1, // Fade in the unlocked button
                        duration: 500,
                        ease: "Linear",
                        onComplete: () => {
                            this.level1State = 2; // Now level 1 is the current level
                        },
                    });
                },
            });
        }
        // If level 1 has already been unlocked and is current level
        else if (this.level1State == 2) {
            level1Button.setTexture("level1-unlocked");
        }
        // If level 1 is completed
        else if (this.level1State == 3) {
            level1Button.setTexture("level1-completed");
        }

        // If level 1 is unlocked or completed, make it clickable
        if (this.level1State > 0) {
            level1Button.setInteractive();

            level1Button.on("pointerup", () => {
                this.scene.start("Level1", {
                    level0State: this.level0State,
                    level1State: this.level1State,
                    level2State: this.level2State,
                    level3State: this.level3State,
                });
            });

            // Change scale on hover
            level1Button.on("pointerover", () => {
                this.tweens.add({
                    targets: level1Button,
                    scaleX: hoverScale,
                    scaleY: hoverScale,
                    duration: 100,
                    ease: "Linear",
                });
            });

            // Restore original scale when pointer leaves
            level1Button.on("pointerout", () => {
                this.tweens.add({
                    targets: level1Button,
                    scaleX: originalScale,
                    scaleY: originalScale,
                    duration: 100,
                    ease: "Linear",
                });
            });
        }

        // Level 2 Button:
        const level2Button = this.add.image(780, 460, "level2-locked");
        level2Button.setScale(originalScale);

        // If level 1 just completed, animate the unlocking of level 2
        if (this.level2State == 1) {
            this.tweens.add({
                targets: level2Button,
                alpha: 0.3, // Fade out the locked button
                duration: 500,
                onComplete: () => {
                    level2Button.setTexture("level2-unlocked");
                    level2Button.setScale(originalScale);
                    level2Button.setAlpha(0); // Make the unlocked button invisible initially

                    this.tweens.add({
                        targets: level2Button,
                        alpha: 1, // Fade in the unlocked button
                        duration: 500,
                        ease: "Linear",
                        onComplete: () => {
                            this.level2State = 2; // Now level 2 is the current level
                        },
                    });
                },
            });
        }
        // If level 2 has already been unlocked and is current level
        else if (this.level2State == 2) {
            level2Button.setTexture("level2-unlocked");
        }
        // If level 2 is completed
        else if (this.level1State == 3) {
            level2Button.setTexture("level2-completed");
        }

        // If level 2 is unlocked or completed, make it clickable
        if (this.level2State > 0) {
            level2Button.setInteractive();

            level2Button.on("pointerup", () => {
                this.scene.start("Level2", {
                    level0State: this.level0State,
                    level1State: this.level1State,
                    level2State: this.level2State,
                    level3State: this.level3State,
                });
            });

            // Change scale on hover
            level2Button.on("pointerover", () => {
                this.tweens.add({
                    targets: level2Button,
                    scaleX: hoverScale,
                    scaleY: hoverScale,
                    duration: 100,
                    ease: "Linear",
                });
            });

            // Restore original scale when pointer leaves
            level2Button.on("pointerout", () => {
                this.tweens.add({
                    targets: level2Button,
                    scaleX: originalScale,
                    scaleY: originalScale,
                    duration: 100,
                    ease: "Linear",
                });
            });
        }

        // Level 3 Button:
        const level3Button = this.add.image(1091, 270, "level3-locked");
        level3Button.setScale(originalScale);

        // If level 2 just completed, animate the unlocking of level 3
        if (this.level3State == 1) {
            this.tweens.add({
                targets: level3Button,
                alpha: 0.3, // Fade out the locked button
                duration: 500,
                onComplete: () => {
                    level3Button.setTexture("level3-unlocked");
                    level3Button.setScale(originalScale);
                    level3Button.setAlpha(0); // Make the unlocked button invisible initially

                    this.tweens.add({
                        targets: level3Button,
                        alpha: 1, // Fade in the unlocked button
                        duration: 500,
                        ease: "Linear",
                        onComplete: () => {
                            this.level3State = 2; // Now level 3 is the current level
                        },
                    });
                },
            });
        }
        // If level 3 has already been unlocked and is current level
        else if (this.level3State == 2) {
            level3Button.setTexture("level3-unlocked");
        }
        // If level 3 is completed
        else if (this.level1State == 3) {
            level3Button.setTexture("level3-completed");
        }

        // If level 3 is unlocked or completed, make it clickable
        if (this.level3State > 0) {
            level3Button.setInteractive();

            level3Button.on("pointerup", () => {
                this.scene.start("Level3", {
                    level0State: this.level0State,
                    level1State: this.level1State,
                    level2State: this.level2State,
                    level3State: this.level3State,
                });
            });

            // Change scale on hover
            level3Button.on("pointerover", () => {
                this.tweens.add({
                    targets: level3Button,
                    scaleX: hoverScale,
                    scaleY: hoverScale,
                    duration: 100,
                    ease: "Linear",
                });
            });

            // Restore original scale when pointer leaves
            level3Button.on("pointerout", () => {
                this.tweens.add({
                    targets: level3Button,
                    scaleX: originalScale,
                    scaleY: originalScale,
                    duration: 100,
                    ease: "Linear",
                });
            });
        }
    }

    update() {}
}
