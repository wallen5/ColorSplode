class Level{
    constructor(levelBoss, difficulty, obstacles, colorZones, loaded = false){
        this.levelBoss = levelBoss;
        this.difficulty = difficulty;
        this.scoreThreshold = 0;
        this.obstacles = obstacles;
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
            this.scoreThreshold = 40;
            maxVents = 2;
            break;
        case 2:
            spawnRateIncrease = 0.05;
            this.scoreThreshold = 70;
            maxVents = 4;
            break;
        case 3:
            spawnRateIncrease = 0.08;
            this.scoreThreshold = 100;
            maxVents = 4;
            break;
        }
    }

    setColorZones(){
        randomColorZone(this);
    }

    setObstacles(){
        
    }
}  

function randomColorZone(level) {
    let randPreset = floor(random(0,3));

    switch (randPreset) {
    case 0: // Corners
        level.colorZones = [
        new Zone(50 + gameX, 100 + gameY, 150 * gs, 150 * gs, "red"),
        new Zone(50 + gameX, gameLayer.height - (200 * gs) + gameY, 150 * gs, 150 * gs, "blue"),
        new Zone(gameLayer.width - (200 * gs) + gameX, gameLayer.height - (200 * gs) + gameY, 150 * gs, 150 * gs, "purple"),
        new Zone(gameLayer.width - (200 * gs) + gameX, 100 + gameY, 150 * gs, 150 * gs, "green")
        ];
        break;
    case 1:
        level.colorZones = [
        new Zone(50 + gameX, 100 + gameY, 150 * gs, 150 * gs, "blue"),
        new Zone(50 + gameX, gameLayer.height - (200 * gs) + gameY, 150 * gs, 150 * gs, "green"),
        new Zone(gameLayer.width - (200 * gs) + gameX, gameLayer.height - (200 * gs) + gameY, 150 * gs, 150 * gs, "red"),
        new Zone(gameLayer.width - (200 * gs) + gameX, 100 + gameY, 150 * gs, 150 * gs, "purple")
        ];
        break;
    case 2:
        level.colorZones = [
        new Zone(50 + gameX, 100 + gameY, 150 * gs, 150 * gs, "purple"),
        new Zone(50 + gameX, gameLayer.height - (200 * gs) + gameY, 150 * gs, 150 * gs, "red"),
        new Zone(gameLayer.width - (200 * gs) + gameX, gameLayer.height - (200 * gs) + gameY, 150 * gs, 150 * gs, "green"),
        new Zone(gameLayer.width - (200 * gs) + gameX, 100 + gameY, 150 * gs, 150 * gs, "blue")
        ];
        break;
        
    default:
        level.colorZones = [
        new Zone(50 + gameX, 100 + gameY, 150 * gs, 150 * gs, "blue"),
        new Zone(50 + gameX, gameLayer.height - (200 * gs) + gameY, 150 * gs, 150 * gs, "green"),
        new Zone(gameLayer.width - (200 * gs) + gameX, gameLayer.height - (200 * gs) + gameY, 150 * gs, 150 * gs, "red"),
        new Zone(gameLayer.width - (200 * gs) + gameX, 100 + gameY, 150 * gs, 150 * gs, "purple")
        ];
    }
}

let levelSet = [];

function setBoss(){
    let randPreset = floor(random(0, 3));

    switch (randPreset) {
    case 0:
        levelSet = [
        new Level(0, 1, [], []),
        new Level(0, 2, [], []),
        new Level(1, 3, [], [])
        ];
        break;
    case 1:
        levelSet = [
        new Level(0, 1, [], []),
        new Level(0, 2, [], []),
        new Level(1, 3, [], [])
        ];
        break;
    case 2:
        levelSet = [
        new Level(0, 1, [], []),
        new Level(0, 2, [], []),
        new Level(1, 3, [], [])
        ];
        break;
    case 3:
        levelSet = [
        new Level(0, 1, [], []),
        new Level(0, 2, [], []),
        new Level(1, 3, [], [])
        ];
        break;
    }
}

function levelTransition(){
  image(gameLayer, gameX, gameY, gameLayer.width, gameLayer.height);
  gameLayer.background(117, 2, 0);

  push();
  fill(237, 204, 42);
  textAlign(CENTER, CENTER);
  textSize(30);
  text("Level " + levelSet[currentLevel].difficulty + " Complete", gameLayer.width / 2 + gameX, gameLayer.height / 2 + gameY - 50);
  textSize(12);
  pop();

  pauseButton.remove();
  scoreDisplay.remove();
  comboDisplay.remove();
  currentColor = color(0);
  currentCombo = 0;

  if(!transitionCreated){
    quitButton = new Sprite(400 + gameX, 550 + gameY);
    quitButton.text = "Quit";
    quitButton.width = 200;
    quitButton.height = 50;
    quitButton.color = "red";

    nextLevelButton = new Sprite(400 + gameX, 500 + gameY);
    nextLevelButton.text = "Next Level";
    nextLevelButton.width = 400;
    nextLevelButton.height = 50;
    nextLevelButton.color = "red";

    transitionCreated = true;
  }

  mouseOverButton(nextLevelButton, "lightred", "red");
  mouseOverButton(quitButton, "lightred", "red");

  currentMode = null;

  if(levelSet[currentLevel].difficulty == 3){
    nextLevelButton.remove();
    image(gameLayer, gameX, gameY, gameLayer.width, gameLayer.height);
    gameLayer.background(117, 2, 0);
    push();
    fill(237, 204, 42);
    textAlign(CENTER, CENTER);
    textSize(50)
    text("Victory", gameLayer.width / 2 + gameX, gameLayer.height / 2 + gameY - 50);
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

    setup();
    transitionCreated = false;
  }
  if(nextLevelButton.mouse.pressing()){
    state = 2;
    currentMode = "roguelike";
    currentLevel++;
    // reset game
    transitionCreated = false;
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
    pauseButton = new Sprite(750 + gameX, 50 + gameY);
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