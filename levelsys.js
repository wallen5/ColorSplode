//transition vars
let fade = 0;
let fadeSpeed = 5;
let slide = 0;
let slideSpeed = 5;

class Level{
    constructor(levelBoss, difficulty, obstacles, colorZones, loaded = false){
        this.levelBoss = levelBoss;
        this.difficulty = difficulty;
        this.scoreThreshold = 0;
        this.obstacleTypes = [...obstacles];
        this.obstacles = [];
        this.colorZones = colorZones;
        this.loaded = loaded;
    }

    setup(){
        this.setDifficulty();
        this.setColorZones();
        this.setObstacles();
        this.loaded = true;
    }

    setDifficulty(){
        switch(this.difficulty){
        case 1:
            spawnRateIncrease = 0.01;
            this.scoreThreshold = 30;
            maxVents = 2;
            break;
        case 2:
            spawnRateIncrease = 0.05;
            this.scoreThreshold = 40;
            maxVents = 4;
            break;
        case 3:
            spawnRateIncrease = 0.08;
            this.scoreThreshold = 50;
            maxVents = 4;
            break;
        }
    }

    setColorZones(){
        randomColorZone(this);
    }

    setObstacles() {
        const obstacleNames = [...this.obstacleTypes];
        this.obstacles = [];
      
        for (let obstacleName of obstacleNames) {
          switch (obstacleName) {
            //add cases for each obstacle
            case "rougeBucket":
              console.log("Spawning:", obstacleName);
              let speed;
              let unsnapInterval;
              switch (this.difficulty) {
                case 1: speed = 1; unsnapInterval = 25; break;
                case 2: speed = 1.7; unsnapInterval = 50; break;
                case 3: speed = 2.2; unsnapInterval = 75; break;
                default: speed = 2; unsnapInterval = 50;
              }
              setTimeout(() => {
                spawnRougeActor(speed, unsnapInterval);
                if (rougeCharacter) {
                  this.obstacles.push(rougeCharacter);
                  console.log("RougeBucket added to obstacles");
                  console.log("speed = " + rougeCharacter.speed, "unsap = " +  rougeCharacter.unsnapInterval);

                }
              }, 2000);
              break;
            case "Cat":
              console.log("Spawning:", obstacleName);
              let catSpeed;
              switch (this.difficulty){
                case 1: catSpeed = 1.5; break;
                case 2: catSpeed = 2; break;
                case 3: catSpeed = 2.75; break;
                default: catSpeed = 2;
              }
              setTimeout(() => {
                spawnCat(catSpeed);
                if (cat) {
                  this.obstacles.push(cat);
                  console.log("Cat added to obstacles");
                  //console.log("speed = " + rougeCharacter.speed, "unsap = " +  rougeCharacter.unsnapInterval);

                }
              }, 2000);
              break;
          }
        }
      }
      
}  

function clearObstacles() {
    rougeCharacter = null;
    cat = null;
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

let levelSet = [];

function setBoss(){
    let randPreset = floor(random(0, 3));

    switch (randPreset) {
    case 0:
        levelSet = [
        new Level(0, 1, ["rougeBucket"], []),
        new Level(0, 2, ["rougeBucket"], []),
        new Level(1, 3, ["rougeBucket"], [])
        ];
        break;
    case 1:
        levelSet = [
        //change rougeBucket(s) to different obstacle
        new Level(0, 1, ["Cat"], []), 
        new Level(0, 2, ["Cat"], []),
        new Level(1, 3, ["Cat"], [])
        ];
        break;
    case 2:
        levelSet = [
        //change rougeBucket(s) to different obstacle
        new Level(0, 1, ["Cat"], []),
        new Level(0, 2, ["Cat"], []),
        new Level(1, 3, ["Cat"], [])
        ];
        break;
    case 3:
        levelSet = [
        //change rougeBucket(s) to different obstacle
        new Level(0, 1, ["Cat"], []),
        new Level(0, 2, ["Cat"], []),
        new Level(1, 3, ["Cat"], [])
        ];
        break;
    }
}

function levelTransition(){
  if (fade < 255){fade += fadeSpeed;}
  if (slide < width / 2){slide += slideSpeed}
  background(117, 2, 0);

  if (levelSet[currentLevel].difficulty != 3){
    push();
    fill(237, 204, 42);
    textAlign(CENTER, CENTER);
    textSize(30);

    text("Level " + levelSet[currentLevel].difficulty + " Complete", width / 2, slide - 50);
    textSize(12);
    pop();
  }

  pauseButton.remove();
  scoreDisplay.remove();
  comboDisplay.remove();
  currentColor = color(0);
  currentCombo = 0;

  if(!transitionCreated){
    quitButton = new Sprite(-400, 550);
    quitButton.text = "Quit";
    quitButton.width = 200;
    quitButton.height = 50;
    quitButton.color = "red";

    nextLevelButton = new Sprite(-400, 500);
    nextLevelButton.text = "Next Level";
    nextLevelButton.width = 400;
    nextLevelButton.height = 50;
    nextLevelButton.color = "red";

    transitionCreated = true;
    fade = 0;
    slide = 0;
  }

  if (transitionCreated && nextLevelButton && quitButton) {
    nextLevelButton.x = slide;
    quitButton.x = slide;
  }

  mouseOverButton(nextLevelButton, "lightred", "red");
  mouseOverButton(quitButton, "lightred", "red");

  currentMode = null;

  if(levelSet[currentLevel].difficulty == 3){
    nextLevelButton.remove();
    background(0, 0, 0, fade);
    push();
    fill(237, 204, 42);
    textAlign(CENTER, CENTER);
    textSize(50)
    text("Victory", width / 2, slide - 50);
    if (transitionCreated && nextLevelButton && quitButton) {
      quitButton.x = slide;
    }
    textSize(12);
    pop();
  }

  if(quitButton.mouse.pressing()){
    state = 0;
    currentLevel = 0;
    // remove and reset
    quitButton.remove();
    quitButton = null;
    nextLevelButton.remove();
    pauseButton.remove();
    pauseButton = null;
    levelMusic.stop();
    scoreDisplay.remove()
    scoreDisplay = null;
    score = 0;
    time = 0;
    ourCharacters = [];
    levelUpTriggered = {};
    player.inventory = [];
    player.health = player.startHealth;
    closeAllVents();
    spawnLogic.timer = 50;
    spawnLogic.timeToSpawn =  100;
    spawnLogic.rate = 1;
    spawnLogic.activeActors = 0;
    clearObstacles();
    fade = 0;
    slide = 0;

    setup();
    transitionCreated = false;
  }
  if(nextLevelButton.mouse.pressing()){
    //remove obstacles
    clearObstacles();

    state = 2;
    currentMode = "roguelike";
    currentLevel++;
    // reset game
    transitionCreated = false;
    fade = 0;
    slide = 0;
    time = 0;
    score = 0;
    levelSet[currentLevel].setup();
    player.health = player.startHealth;
    ourCharacters = [];
    closeAllVents();
    activateRandomVent();
    spawnLogic.timer = 50;
    spawnLogic.timeToSpawn =  100;
    spawnLogic.rate = 1;
    spawnLogic.activeActors = 0;
    paintLayer.background(255);
    pauseButton = new Sprite(750, 50);
    pauseButton.text = "||";
    pauseButton.width = 70;
    pauseButton.height = 50;
    pauseButton.color = "lightgreen";
    drawScore();
  }

  if (currentMode != null){
    quitButton.remove();
    nextLevelButton.remove();
    
  }
}
