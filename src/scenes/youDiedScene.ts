import Phaser from "phaser";

interface YouDiedData {
    currentLevelKey: string;
    level0State: number;
    level1State: number;
    level2State: number;
    level3State: number;
}

export default class youDiedScene extends Phaser.Scene {
    constructor() {
        super({ key: "YouDiedScene" });
    }

    preload() {}

    create(data: YouDiedData) {
        const playerDiedText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            "You Died",
            { fontSize: "96px", color: "#8c0615", fontFamily: "Verdana" }
        );
        playerDiedText.setOrigin(0.5);
        playerDiedText.setDepth(5);

        playerDiedText.setScale(0);
        playerDiedText.setAlpha(0);

        const blackBackground = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000
        );
        blackBackground.setDepth(4);
        blackBackground.setAlpha(0);

        // Animate you died text and black background
        this.tweens.add({
            targets: [playerDiedText, blackBackground],
            scale: 1,
            alpha: 1,
            duration: 200,
            ease: "Bounce",
            onComplete: () => {
                this.time.delayedCall(1000, () => {
                    this.scene.stop("YouDiedScene");
                    this.scene.start(data.currentLevelKey, {
                        level0State: data.level0State,
                        level1State: data.level1State,
                        level2State: data.level2State,
                        level3State: data.level3State,
                    });
                });
            },
        });
    }
}
