import Phaser from "phaser";
import PhaserLogo from "../objects/phaserLogo";
import FpsText from "../objects/fpsText";

export default class LevelOne extends Phaser.Scene {
    fpsText: FpsText;

    constructor() {
        super({ key: "Level1" });
    }

    preload() {
        this.load.image(
            "level1Background",
            "assets/level1/Level1Background.jpg"
        );
    }

    create() {
        const backgroundImage = this.add
            .image(0, 0, "level1Background")
            .setOrigin(0, 0);
        backgroundImage.setScale(
            this.cameras.main.width / backgroundImage.width,
            this.cameras.main.height / backgroundImage.height
        );
    }

    update() {}
}
