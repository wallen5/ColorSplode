
class Level{

    constructor(levelBoss, difficulty, scoreThreshold, obstacles, colorZones){
        this.levelBoss = levelBoss;
        this.difficulty = difficulty;
        //World 1: 1,2,3 = 2,3,4
        //World 2: 1,2,3 = 3,4,5
        //World 3: 1,2,3 = 4,5,6
        //
        
        this.scoreThreshold = scoreThreshold;
        this.obstacles = obstacles;
        this.colorZones = colorZones;
    }
}

function randomColorZone(level) {
    let randPreset = floor(random(0,2));

    switch (randPreset) {
    case 0: // Corners
        level.colorZones = [
        new Zone(50, 100, 150, 150, "red"),
        new Zone(50, 620, 150, 150, "blue"),
        new Zone(width - 150 - 50, 620, 150, 150, "purple"),
        new Zone(width - 150 - 50, 100, 150, 150, "green")
        ];
        break;
    case 1:
        level.colorZones = [
        new Zone(50, 100, 150, 150, "blue"),
        new Zone(50, 620, 150, 150, "green"),
        new Zone(width - 150 - 50, 620, 150, 150, "red"),
        new Zone(width - 150 - 50, 100, 150, 150, "purple")
        ];
        break;
    case 2:
        level.colorZones = [
        new Zone(50, 100, 150, 150, "purple"),
        new Zone(50, 620, 150, 150, "red"),
        new Zone(width - 150 - 50, 620, 150, 150, "green"),
        new Zone(width - 150 - 50, 100, 150, 150, "blue")
        ];
        break;
        
    default:
        level.colorZones = [
        new Zone(50, 100, 150, 150, "red"),
        new Zone(50, 620, 150, 150, "blue"),
        new Zone(width - 150 - 50, 620, 150, 150, "purple"),
        new Zone(width - 150 - 50, 100, 150, 150, "green")
        ];
}

}