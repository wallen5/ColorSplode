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
        this.obstacles = [];
      
        if (this.difficulty === 1) {
            //this.obstacles.push(rougeActor);
        } else if (this.difficulty === 2) {
            setTimeout(() => {spawnRougeActor();}, 2000);
            if (rougeCharacter) {
                this.obstacles.push(rougeCharacter);
            }
            //add more later
        }
      }
      
}  

function clearObstacles() {
    if (levelSet[currentLevel]) {
        levelSet[currentLevel].obstacles = [];
    }
    rougeCharacter = null;
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
  background(117, 2, 0);

  push();
  fill(237, 204, 42);
  textAlign(CENTER, CENTER);
  textSize(30);
  text("Level " + levelSet[currentLevel].difficulty + " Complete", width / 2, height / 2 - 50);
  textSize(12);
  pop();

  pauseButton.remove();
  scoreDisplay.remove();
  comboDisplay.remove();
  currentColor = color(0);
  currentCombo = 0;

  if(!transitionCreated){
    quitButton = new Sprite(400, 550);
    quitButton.text = "Quit";
    quitButton.width = 200;
    quitButton.height = 50;
    quitButton.color = "red";

    nextLevelButton = new Sprite(400, 500);
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
    background(117, 2, 0);
    push();
    fill(237, 204, 42);
    textAlign(CENTER, CENTER);
    textSize(50)
    text("Victory", width / 2, height / 2 - 50);
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
