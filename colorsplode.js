let time = 0;
let spawnTime = 25;
let score = 0;

let state = 0;
let currentMode = null;
let startButton1 //classic mode
let startButton2; //roguelike mode
let ventSprite;

let compressor;

let splatAmt = 8;
let doneSpotlight = 0;

// Items arrays
let allItems;
let levelChoices;

let chrSprite =[]; //array of character sprits
let grabSprite =[]; //array of grab animations
let deathSprite =[]; //array of death animations
let ourCharacters = []; //array of character objects

let rougeCharacter = null;
let rougeBucketSprite;

// The mouse's 'grabbed' character
let grabbedCharacter; 
let backgroundImage;

// Pause buttons
let gamePaused = false;
let pauseButton;
let resumeButton; // Stored here so we can detect drawing it ONCE
let quitButton;
let restartButton;
let chooseButton1;
let chooseButton2;
let chooseButton3;
let nextLevelButton;
let transitionCreated = false;

//Level Up Buttons
let levelUpActive = false;
let levelUpTriggered = {};
let levelUpTrigger = [29, 39, 49, 100, 200];

//Game Over Buttons
let buttonCreated = false;
let retryButton;
let exitButton;
let drawGameOver = false;

// Paint trail layer
let paintLayer;

//start menu text. acts as namespace
let titleColor = {
  r: 250,
  g: 0,
  b: 0
};

// Vars for flashing screen
let flashScreen = false;
let flashTimer = 0;
let flashDuration = 200;


// Level Stuff
let currentLevel = 0;
let currentVents = 1;
let maxVents = 4;
let spawnRateIncrease = 0.05;

// Score combo stuff
let currentColor;
let currentCombo = 0;

let bombSound;
let explodeGif;
let explosionActive = false;
let explosionDuration = 500/3; // 1 second duration
let explosionX = 400;
let explosionY = 400;

function preload(){
  myFont = loadFont('font/PressStart2P-Regular.ttf');
  bg = loadImage("images/menubackground.png");
  gameOverBG = loadImage("images/gameoverbackground.png");
  menuMusic = loadSound('sounds/menu_music.mp3');
  levelMusic = loadSound('sounds/level_music.mp3');
  pauseSound = loadSound('sounds/pause.wav');
  pickup = loadSound('sounds/pickup.wav');
  bombSound = loadSound('sounds/nuclear-explosion.mp3');
  explodeGif = loadImage("images/explosion.gif");
  chrSprite[0] = loadImage("images/redpaintupdate.gif");
  chrSprite[1] = loadImage("images/bluepaintupdate.gif");
  chrSprite[2] = loadImage("images/purplepaintupdate.gif");
  chrSprite[3] = loadImage("images/greenpaintupdate.gif");
  grabSprite[0] = loadImage("images/redpaintgrabbed.gif");
  grabSprite[1] = loadImage("images/bluepaintgrabbed.gif");
  grabSprite[2] = loadImage("images/purplepaintgrabbed.gif");
  grabSprite[3] = loadImage("images/greenpaintgrabbed.gif");
  deathSprite[0] = loadImage("images/redpaintdeath.gif");
  deathSprite[1] = loadImage("images/bluepaintdeath.gif");
  deathSprite[2] = loadImage("images/purplepaintdeath.gif");
  deathSprite[3] = loadImage("images/greenpaintdeath.gif");
  ventTop = loadImage("images/ventTopUpdate.gif");
  ventBottom = loadImage("images/ventBottomUpdate.gif");
  ventRight = loadImage("images/ventRightUpdate.gif");
  ventLeft = loadImage("images/ventLeftUpdate.gif");
  levelUpChoice = loadImage("images/levelChoice.png");
  magnet = loadImage("images/Magnet.png");
  thinner = loadImage("images/paint_thinner.png")
  freeze = loadImage("images/Freeze.png");
  totem = loadImage("images/TotemOfUndying.png");
  placeholder = loadImage("images/Placeholder.png");
  heart = loadImage("images/Heart.png");

  // Splats
  splat1 = loadImage("images/Splats/splat1.png");
  splat2 = loadImage("images/Splats/splat2.png");
  splat3 = loadImage("images/Splats/splat3.png");
  splat4 = loadImage("images/Splats/splat4.png");
  splat5 = loadImage("images/Splats/splat5.png");
  splat6 = loadImage("images/Splats/splat6.png");
  splatD = loadImage("images/Splats/splatDeLozier.png");


  bomb = loadImage("images/Bomb.png");
  rougeBucketSprite = loadImage("images/susbucket.gif");
}

function setup() {
  createCanvas(800, 800);
  paintLayer = createGraphics(200, 200);
  paintLayer.background(255);
  paintLayer.noSmooth();

  currentColor = color(0)

  //start button
  textFont(myFont);
  textSize(12); // Sets a font size to keep text size consistent
  startButton1 = new Sprite(320, 450);
  startButton1.text = "Play\n Classic Mode";
  startButton1.width = 180;
  startButton1.height = 50;
  startButton1.color = "lightgreen";

  startButton2 = new Sprite(520, 450);
  startButton2.text = "Play\n Rougelike Mode";
  startButton2.width = 200;
  startButton2.height = 50;
  startButton2.color = "red";
  background(220);
  
  compressor = new p5.Compressor();
  pickup.setVolume(0.2) ;
  menuMusic.setVolume(0.01);
  levelMusic.setVolume(0.05);
  pauseSound.setVolume(0.02);
  menuMusic.play();
  

  levelMusic.disconnect();
  levelMusic.connect(compressor);
  compressor.connect();

  //normal compressor settings
  compressor.threshold(-24);
  compressor.ratio(4);
  compressor.attack(0.003);
  compressor.release(0.25);

  // Color zone spawn method (comment one in or out as needed)
  //makeColorZones();
  //randomizeZonePlacements();

  // Define missing zone variables for makeColorZones()
  // Initialize global zone placement variables defined in zone.js (defaults match zone.js)
  zoneX = 50;
  zoneY1 = 100;
  zoneY2 = 620;
  zoneWidth = 150;
  zoneHeight = 150;

  setBoss();
  makeColorZones();
  makeVents();
  //randomizeZonePlacements();

  makeItems();
  player = new Player();

}

let timer = 0;

function draw() {
  cursor("images/pointerHand.png", 10, 10);
  
  if(state == 0){ //start screen
    startMenu();

  } else if (state == 1){ //play classic mode
      gameMenu1();
      spawnActor();
      spawnRate();
      setGameCusor();
  } else if (state == 2){ //play roguelike mode
      gameMenu2();
      spawnActor();
      spawnRate();
      setGameCusor();
      player.drawInventory();
      drawExplosion();
      dropBomb();
      player.checkTotem(); 
      for (let obstacle of levelSet[currentLevel].obstacles) {
        obstacle.update();
        obstacle.display();
      }    
  } else if (state == 3){ //gameover
      gameOver();
  } else if(state == 4){
      levelTransition();
  }
}


function startMenu(){
  background(bg);

  colorFluctuation();

  fill(titleColor.r, titleColor.g, titleColor.b);

  stroke("black");
  strokeWeight(5);
  textSize(30);
  textStyle("bold");
    
  text("ColorSplode", 250 , 350 );

  currentMode = null;


  //button colors
  mouseOverButton(startButton1, "green", "lightgreen");
  mouseOverButton(startButton2, "darkred", "red");

  if (startButton1.mouse.pressing()){
    state = 1;
    currentMode = "classic";
    activateRandomVent();
    player.startHealth = 0;
    player.health = player.startHealth;
  } 
  if (startButton2.mouse.pressing()) {
    state = 2;
    currentMode = "roguelike";
    switchVent(vents[1]);
    levelSet[currentLevel].setup();
    player.health = player.startHealth;
  }   

  if (currentMode != null){
    startButton1.remove();
    startButton2.remove();
    pauseButton = new Sprite(750, 50);
    pauseButton.text = "||";
    pauseButton.width = 70;
    pauseButton.height = 50;
    pauseButton.color = "lightgreen";
    menuMusic.stop();
    levelMusic.loop();
    drawScore();
  }
}


function gameMenu1(){

  background(220);
  image(paintLayer, 0, 0, width, height);
  drawColorZones();
  drawVents();
  
  //update the displayed score
  scoreDisplay.text = "Score:" + score;
  comboDisplay.text = "Combo:" + currentCombo

    
  for (let actor of ourCharacters) {
    actor.update();
    actor.draw();
  }
  
  stroke(0); // Makes sure buttons stay outlined

  //change color if cursor over pause button
  mouseOverButton(pauseButton, "green", "lightgreen");

  if(pauseButton.mouse.pressed()){
    pauseGame();
  }
  
  if (gamePaused) {
    drawPauseMenu();
  }

  if(!gamePaused){time++;}
  if(time == 60 * spawnTime  || time == 60 * spawnTime * 2 || time == 60 * 3 * spawnTime ){ //spawnTime is the interval at which a new vent spawns
    activateRandomVent();
  }
}

function gameMenu2(){ //game menu for roguelike mode

  background(220);
  image(paintLayer, 0, 0, width, height);
  drawColorZones();
  drawVents();
  player.drawHealth();
  
  //change color if cursor over pause button
  mouseOverButton(pauseButton, "green", "lightgreen");

  //update the displayed score
  scoreDisplay.text = "Score:" + score;
  comboDisplay.text = "Combo:" + currentCombo;

  for (let actor of ourCharacters) {
  // Freeze powerup
  if (actor.isMouseOver() && !actor.frozen && player.hasItem("Freeze")) {
    actor.frozen = true;
    actor.freezeTimer = 120;    // The amount of time they are frozen for (Need to be careful with this for balance, it prevents explosion)
  }
  if (actor.frozen) {
    actor.freezeTimer--;
    if (actor.freezeTimer <= 0) {
      actor.frozen = false;
    }
  }
  if (!actor.frozen || actor.state === "GRABBED") {
    actor.update();
  }
  

  push();
  if (actor.frozen) {
    tint(150, 150, 255); // light blue tint to frozen buckets
  } else {
    tint(255,255,255,actor.opacity); // update opacity
  }
  
  actor.draw();
  pop();
  }

  // only run these if rougeCharacter exists
  if (rougeCharacter) {
    rougeCharacter.update();
    rougeCharacter.draw();
  }

  stroke(0);

  if(pauseButton.mouse.pressed()){
    pauseGame();
  }
  
  if (gamePaused) {
    drawPauseMenu();
  }

  for (let s of levelUpTrigger) {  // Level ups trigger based on the arrays, can alter when they happen
    if (score >= s && !levelUpTriggered[s]) {
        levelUp();
        levelUpTriggered[s] = true;
    }
  }

  if(levelUpActive){
    drawLevelMenu();
  }

  if(score >= levelSet[currentLevel].scoreThreshold && !levelUpActive && state != 0){
    state = 4;
  }

  if(!gamePaused && !levelUpActive){time++;}
  if(!levelUpActive && (time == 60 * spawnTime * currentVents) && currentVents < maxVents){ //spawnTime is the interval at which a new vent spawns
    activateRandomVent();
  } 

  //createExplosion();

}

function gameOver(){
  time++;
  pauseButton.remove();
  scoreDisplay.remove();
  comboDisplay.remove();

  if ((doneSpotlight < splatAmt) && (time % (4+doneSpotlight*3) == 0)) {
  generateRandomSplat(doneSpotlight);
  doneSpotlight++;
  }
  
  stroke("black");
  strokeWeight(5);
  textSize(50);
  textStyle("bold");
  fill("red");

  colorFluctuation();
  fill(titleColor.r, titleColor.g, titleColor.b);
  text("Game Over!", 195 , 350 );
  scoreDisplay.text = "Score:" + score;

  stroke("black");
  strokeWeight(7.5);
  textSize(30);
  fill("white");
  let x = 300;
  let y = 400;
  text("Score: " + score, x , y );

  if (!buttonCreated){
    strokeWeight(5);
    textSize(20);
    retryButton = new Sprite(400, 450);
    retryButton.text = "Retry";
    retryButton.width = 120;
    retryButton.height = 50;

    exitButton = new Sprite(400, 515);
    exitButton.text = "Quit";
    exitButton.width = 120;
    exitButton.height = 50;

    buttonCreated = true;
  }
 
  //change button color when mouse hovers over
  mouseOverButton(retryButton, "green", "lightgreen");
  mouseOverButton(exitButton, "green", "lightgreen");

  if (retryButton.mouse.pressing()){
    scoreDisplay.remove();
    retry();
  }

  if (exitButton.mouse.pressing()){
    scoreDisplay.remove();
    exit();
  }
}

function mouseOverButton(button1, hoverColor, defualtColor){ 
  if(button1.mouse.hovering()){
     button1.color = hoverColor;
  } else{
    button1.color = defualtColor;
  }
}

function exit(){ 
  ourCharacters = [];
  levelUpTriggered = {};
  player.inventory = [];
  currentLevel = 0;
  player.health = player.startHealth;
  buttonCreated = false;
  exitButton.remove();
  retryButton.remove();
  clearObstacles();

  levelMusic.stop();
  scoreDisplay.remove()
  scoreDisplay = null;
  comboDisplay.remove();
  comboDisplay = null;
  score = 0;
  time = 0;

  //reset spawn logic after quit
  closeAllVents();
  spawnLogic.timer = 50;
  spawnLogic.timeToSpawn =  100;
  spawnLogic.rate = 1;
  spawnLogic.activeActors = 0;
  time = 0;

  setup();
  state = 0;
}

function restart(){
  pauseGame(); // This will "unpause" the game
  //remove characters and buttons
  ourCharacters = [];
  levelUpTriggered = {};
  player.inventory = [];
  currentLevel = 0;
  //display score
  score = 0;
  time = 0;

  clearObstacles();

  //reset spawn logic after quit
  closeAllVents();
  activateRandomVent();
  randomColorZone(currentLevel);
  spawnLogic.timer = 50;
  spawnLogic.timeToSpawn =  100;
  spawnLogic.rate = 1;
  spawnLogic.activeActors = 0;
  currentColor = color(0);
  currentCombo = 0;

  paintLayer.background(255);

  makeItems();
}

function retry(){
  gamePaused = false;

  //remove characters and buttons
  ourCharacters = [];
  levelUpTriggered = {};
  player.inventory = [];
  player.health = player.startHealth;
  currentLevel = 0;
  doneSpotlight = 0;
  buttonCreated = false;
  retryButton.remove();
  exitButton.remove();
  paintLayer.background(255);
  
  clearObstacles();

  //set style
  stroke("black");
  strokeWeight(5);
  textSize(30);
  textStyle("bold");
  fill(200);

  //create pause button
  pauseButton = new Sprite(750, 50);
  pauseButton.text = "||";
  pauseButton.width = 70;
  pauseButton.height = 50;
  pauseButton.color = "lightgreen";

  //display score
  currentColor = color(0);
  currentCombo = 0;
  score = 0;
  drawScore();

  //reset spawn logic after quit
  time = 0;
  closeAllVents();
  activateRandomVent();
  spawnLogic.timer = 50;
  spawnLogic.timeToSpawn =  100;
  spawnLogic.rate = 1;
  spawnLogic.activeActors = 0;

  //return to game screen
  if (currentMode == "classic") state = 1;
  if (currentMode == "roguelike") state = 2;
  paintLayer.background(255);

  makeItems();
}

function colorFluctuation(){
  if(titleColor.r > 230 || titleColor.b > 220 || titleColor.g > 220){
      titleColor.r = random(0,100);
      titleColor.b = random(0,100);
      titleColor.g = random(0,100);
  }
    titleColor.r += random(0,1);
    titleColor.g += random(0,3);
    titleColor.b += random(0,3);

}

function keyPressed() // Generic Keypress function
{
  if((keyCode === ESCAPE || key === 'p') && (state == 1 || state == 2)) // When press 'p', pause the game (We can probably change this to esc too, just not sure what key it is)
  {
    pauseGame();
  } else if(state == 0 || state == 3){
    if (resumeButton) {
      resumeButton.remove();
      resumeButton = null;
    }
  }
}

function pauseGame(){
  gamePaused = !gamePaused; 

  for(let actor of ourCharacters){
    if(actor.state === "GRABBED"){ // Ensures the player can't click, and then pause and move the enemy
      actor.state = "FREE";
    }
  }
  if(gamePaused){ // if game paused, draw the new buttons
    resumeButton = new Sprite(400, 450);
    resumeButton.text = "Resume";
    resumeButton.width = 200;
    resumeButton.height = 50;
    resumeButton.color = "lightgreen";

    push();
    textSize(27);
    restartButton = new Sprite(400, 500);
    restartButton.text = "Restart";
    restartButton.width = 200;
    restartButton.height = 50;
    restartButton.color = "lightgreen";

    pop();

    quitButton = new Sprite(400, 550);
    quitButton.text = "Quit";
    quitButton.width = 200;
    quitButton.height = 50;
    quitButton.color = "lightgreen";

    pauseSound.play();
    levelMusic.setVolume(0.005, 0.2); 
    levelMusic.rate(0.85, 0.2);
    compressor.threshold(-50);
    compressor.ratio(10);

  }
  else{ // Remove the resume button
    resumeButton.remove();
    resumeButton = null;
    restartButton.remove();
    restartButton = null;
    quitButton.remove();
    quitButton = null;

    pauseSound.play();
    levelMusic.setVolume(0.05, 0.2); 
    levelMusic.rate(1.0, 0.2);
    compressor.threshold(-24);
    compressor.ratio(4);
  }
}

function drawPauseMenu(){
  push(); // save current drawing settings

  // Creates the semi-transparent background for the pause menu
  fill(0, 0, 0, 150);
  noStroke();
  rect(0, 0, width, height);

  

  // pause text
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(32);
  text("Paused", width / 2, height / 2 - 50);
  textSize(12);

  // changes color of button when mouse hovers over
  mouseOverButton(quitButton, "green", "lightgreen");
  mouseOverButton(restartButton, "green", "lightgreen");
  mouseOverButton(resumeButton, "green", "lightgreen");

  pop(); // restore settings
  if(quitButton.mouse.pressed()){
    state = 0;
    quitGame();
  }
  if(resumeButton && resumeButton.mouse.pressed()){ // I dunno why, but an instance check is required specifically for this button :/
    pauseGame();
  }
  if(restartButton && restartButton.mouse.pressed())
  {
    restart();
  }
}

function levelUp(){
  levelUpActive = !levelUpActive; 

  for(let actor of ourCharacters){
    if(actor.state === "GRABBED"){
      actor.state = "FREE";
    }
  }

  if(levelUpActive){
    levelChoices = [random(allItems), random(allItems), random(allItems)];

    push();
    textSize(15);
    chooseButton1 = new Sprite(150, 500);
    chooseButton1.text = "Choose";
    chooseButton1.width = 100;
    chooseButton1.height = 30;
    chooseButton1.color = "red";

    chooseButton2 = new Sprite(400, 500);
    chooseButton2.text = "Choose";
    chooseButton2.width = 100;
    chooseButton2.height = 30;
    chooseButton2.color = "green";

    chooseButton3 = new Sprite(650, 500);
    chooseButton3.text = "Choose";
    chooseButton3.width = 100;
    chooseButton3.height = 30;
    chooseButton3.color = "blue";

    pop();

    pauseSound.play();
    levelMusic.setVolume(0.005, 0.2); 
    levelMusic.rate(0.85, 0.2);
    compressor.threshold(-50);
    compressor.ratio(10);

    if (pauseButton) {
      pauseButton.remove();
    }
  }
  else{
    chooseButton1.remove();
    chooseButton1 = null;
    chooseButton2.remove();
    chooseButton2 = null;
    chooseButton3.remove();
    chooseButton3 = null;

    pauseSound.play();
    levelMusic.setVolume(0.05, 0.2); 
    levelMusic.rate(1.0, 0.2);
    compressor.threshold(-24);
    compressor.ratio(4);

    pauseButton = new Sprite(750, 50);
    pauseButton.text = "||";
    pauseButton.width = 70;
    pauseButton.height = 50;
    pauseButton.color = "lightgreen";
  }
}

function drawLevelMenu(){
  push();

  // Creates the semi-transparent background for the level menu
  fill(0, 0, 0, 150);
  noStroke();
  rect(0, 0, width, height);

  image(levelUpChoice, 0, 0);

  image(levelChoices[0].sprite, 120, 250, 60, 60);
  image(levelChoices[1].sprite, 370, 250, 60, 60);
  image(levelChoices[2].sprite, 610, 250, 60, 60);

  fill(0);

  textSize(15)
  text(levelChoices[0].name, 70, 220, 150);
  text(levelChoices[1].name, 320, 220, 150);
  text(levelChoices[2].name, 570, 220, 150);

  textSize(12);
  text(levelChoices[0].description, 70, 370, 180);
  text(levelChoices[1].description, 320, 370, 180);
  text(levelChoices[2].description, 570, 370, 180);



  // changes color of button when mouse hovers over
  mouseOverButton(chooseButton1, "pink", "red");
  mouseOverButton(chooseButton2, "lightgreen", "green");
  mouseOverButton(chooseButton3, "lightblue", "blue");


  pop(); // restore settings
  if(chooseButton1.mouse.pressed()){
    player.addItem(levelChoices[0]);
    if (levelChoices[0].name === "Bomb") bombisReady = true;
    allItems.splice(allItems.indexOf(levelChoices[0]), 1);
    levelUp();
  }
  if(chooseButton2 && chooseButton2.mouse.pressed()){
    player.addItem(levelChoices[1]);
    if (levelChoices[1].name === "Bomb") bombisReady = true;
    allItems.splice(allItems.indexOf(levelChoices[1]), 1);
    levelUp();
  }
  if(chooseButton3 && chooseButton3.mouse.pressed()){
    player.addItem(levelChoices[2]);
    if (levelChoices[2].name === "Bomb") bombisReady = true;
    allItems.splice(allItems.indexOf(levelChoices[2]), 1);
    levelUp();
  }
}


// Quits the game, resets game state
function quitGame(){
  quitButton.remove();
  quitButton = null;
  resumeButton.remove();
  resumeButton = null;
  pauseButton.remove();
  pauseButton = null;
  restartButton.remove();
  restartButton = null;
  gamePaused = false;

  levelMusic.stop();
  scoreDisplay.remove()
  scoreDisplay = null;
  comboDisplay.remove();
  comboDisplay = null;
  score = 0;
  currentCombo = 0;
  time = 0;


  ourCharacters = []; // Removes all enemies to prevent duplicates
  levelUpTriggered = {};
  player.inventory = [];
  player.health = player.startHealth;
  currentLevel = 0;
  clearObstacles();

  //reset spawn logic after quit
  closeAllVents();
  spawnLogic.timer = 50;
  spawnLogic.timeToSpawn =  100;
  spawnLogic.rate = 1;
  spawnLogic.activeActors = 0;

  setup();
}

// Grabs enemies
function mousePressed() { 
  for (let actor of ourCharacters){
    if (actor.state === "FREE" && actor.isMouseOver() && !gamePaused){ // Ensures the player can't grab the actor when game is paused
      actor.state = "GRABBED";
      actor.splode();
      grabbedCharacter = actor;
      idx = chrSprite.indexOf(grabbedCharacter.sprite);
      grabbedCharacter.sprite = grabSprite[idx];
      pickup.play();
      break;
    }
  }

  //grab rougeBucket
  if (rougeCharacter && rougeCharacter.isMouseOver() &&!gamePaused) {
    rougeCharacter.state = "GRABBED";
    grabbedCharacter = rougeCharacter;
    pickup.play();
    console.log("rougeBucket picked up")
    console.log("pickup state = " + grabbedCharacter.state);
    return;
  }
}

function mouseReleased() {
  if (grabbedCharacter && grabbedCharacter.state === "GRABBED") {
    //release all grabbed buckets
    for (let actor of ourCharacters) {
      if (actor.state === "GRABBED" && actor !== grabbedCharacter) {
        actor.state = "FREE";
        const idx = chrSprite.indexOf(actor.sprite);
        if (idx >= 0) actor.sprite = chrSprite[idx];
        console.warn("Released stray grabbed actor.");
      }
    }
    
    if (grabbedCharacter instanceof rougeActor) {
      grabbedCharacter.state = "IDLE";
      grabbedCharacter.sprite = rougeBucketSprite;
      console.log("release state = " + grabbedCharacter.state);
      grabbedCharacter = null;
      console.log("rouge bucket released");
      return;
    }

    const zone = zoneUnderActor(grabbedCharacter);
    if (zone) {
      const idx = grabSprite.indexOf(grabbedCharacter.sprite); 
      const actorColor = colors[idx]; // "red","blue","purple","green"
      if (zone.color === actorColor) {
        if(currentColor.toString() == grabbedCharacter.color.toString())
        {
          currentCombo += 1;
        }
        else
        {
          currentColor = grabbedCharacter.color;
          currentCombo = 1;
          comboDisplay.color = currentColor;
        }
        grabbedCharacter.xspeed = 0;
        grabbedCharacter.yspeed = 0;
        grabbedCharacter.state = "SNAPPED";
        //update score if character is in correct color zone
        score += 1 * currentCombo;
      } else {
        // wrong zone release normally
        grabbedCharacter.state = "FREE";
        grabbedCharacter.sprite = chrSprite[idx];
      }
    } else {
      // no zone is a normal release
      grabbedCharacter.state = "FREE";
      grabbedCharacter.sprite = chrSprite[idx];
    }
    grabbedCharacter = null;
  }

  // Final cleanup: ensure no one stays grabbed
    for (let actor of ourCharacters) {
      if (actor.state === "GRABBED") actor.state = "FREE";
    }

}


function drawScore(){
  scoreDisplay = new Sprite(150, 50);
  scoreDisplay.text = "Score:" + score;
  scoreDisplay.width = 250;
  scoreDisplay.height = 50;
  scoreDisplay.color = "lightgreen";

  comboDisplay = new Sprite(550, 50);
  comboDisplay.text = "Combo:" + currentCombo;
  comboDisplay.width = 250;
  comboDisplay.height = 50;
  comboDisplay.color = "white";
}


function drawScoreAtPos(x,y){
  scoreDisplay = new Sprite(x, y);
  scoreDisplay.text = "Score:" + score;
  scoreDisplay.width = 250;
  scoreDisplay.height = 50;
}

function setGameCusor(){
  if(mouseIsPressed === true){
    cursor("images/fistCursor.png", 10, 10);
  } else if (gamePaused){
    cursor("images/pointerHand.png", 10, 10);
  } else{
    cursor("images/handCursor.png", 10, 10);
  }
}

function generateRandomSplat(amt){
  noSmooth();
  let splatImages = [splat1, splat2, splat3, splat4, splat5, splat6, splatD];
  let randSplat = random(splatImages);
  let randColor = int(random(0, 4));
  let randRot = random(-180,180);

  switch(randColor){
        case 0: // red
      tint(255, 0, 0);
      break;
    case 1: // blue
      tint(0, 0, 255);
      break;
    case 2: // green
      tint(0, 255, 0);
      break;
    case 3: // purple
      tint(150, 0, 255);
      break;
  }

    // Draw the splat somewhere random
  let x = random(width);
  let y = random(height);
  let sizeMult = random(1.5, 5);
  if (amt >= splatAmt-1) {
    sizeMult = 20;
  }
  let w = randSplat.width * sizeMult;
  let h = randSplat.height * sizeMult;
  imageMode(CENTER);
  //rotate(randRot); //Makes the splatters go offscreen sometimes? Weird. Fix l8r
  image(randSplat, x, y, w, h);
  noTint();
  imageMode(CORNER);
  smooth();
}