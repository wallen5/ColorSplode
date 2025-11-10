let time = 0;
let spawnTime = 25;
let score = 0;

let state = 0;
let currentMode = null;
let startButton1 //classic mode
let startButton2; //roguelike mode
let ventSprite;

let compressor;
let pickupSounds = [];
let currentVolume = 0.5;

let colorBlindCheckbox;
let colorBlindMode = false;

let splatAmt = 8;
let doneSpotlight = 0;

// Items arrays
let allItems;
let Choices;

let chrSprite =[]; //array of character sprits
let grabSprite =[]; //array of grab animations
let deathSprite =[]; //array of death animations
let ourCharacters = []; //array of character objects
let icons = [];

//obstacles
let rougeCharacter = null;
let rougeBucketSprite;
let cat = null;
let catSprite;

let graffitiActors = [];
let graffiti; // Graffiti Sprite
let graffitiTime = 1000;
 
// The mouse's 'grabbed' character
let grabbedCharacter; 
let backgroundImage;
let mousePressedHandled = false;

// Pause buttons
let gamePaused = false;
let pauseButton;
let resumeButton; // Stored here so we can detect drawing it ONCE
let quitButton;
let restartButton;

let chooseButtons;
let chooseButton1;
let chooseButton2;
let chooseButton3;
let chooseButton4;
let chooseButton5;
let chooseButton6;
let chooseButton7;
let chooseButton8;
let chooseButton9;

let nextLevelButton;
let transitionCreated = false;
let volumeSlider;
let volumeLabel;

//Level Up Buttons
let levelUpActive = false;
let levelUpTriggered = {};
let levelUpTrigger = [1, 39, 49, 100, 200];

//Game Over Buttons
let buttonCreated = false;
let retryButton;
let exitButton;
let drawGameOver = false;

// Paint trail layer
let paintLayer;
let gameLayer;
let gameX, gameY;

const BASE_CANVAS_WIDTH = 1500;
const BASE_CANVAS_HEIGHT = 1100;
const BASE_GAME_WIDTH = 800;
const BASE_GAME_HEIGHT = 800;

let gs = 1;

//used to check if b is pressed.
let bPressed = false;

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
let comboMultiplier = 1;
let baseScore = 1;

let bombSound;
let explodeGif;
let explosionActive = false;
let explosionDuration = 500/3; // 1 second duration


//const levelChoices = [];


function preload(){
  myFont = loadFont('font/PressStart2P-Regular.ttf');
  bg = loadImage("images/menubackground.png");
  gameOverBG = loadImage("images/gameoverbackground.png");
  menuMusic = loadSound('sounds/menu_music.mp3');
  levelMusic = loadSound('sounds/level_music.mp3');
  pauseSound = loadSound('sounds/pause.wav');
  pickupSounds.push(loadSound('sounds/pickup.wav'));
  pickupSounds.push(loadSound('sounds/pickup2.wav'));
  pickupSounds.push(loadSound('sounds/pickup3.wav'));
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
  deathSprite[0] = loadImage("images/redpaintdeathupdate.gif");
  deathSprite[1] = loadImage("images/bluepaintdeathupdate.gif");
  deathSprite[2] = loadImage("images/purplepaintdeathupdate.gif");
  deathSprite[3] = loadImage("images/greenpaintdeathupdate.gif");
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
  scraper = loadImage("images/paintscraper.png");

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
  catSprite = loadImage("images/catimage.gif");
  thickerBrush = loadImage("images/ThickerBrush.png");
  selectivePallet = loadImage("images/SelectivePallet.png");
  graffiti = loadImage("images/Graffiti.png");
  levelBackground = loadImage("images/levelBackground.png");
  
}

function setup() {
  currentCombo = 0;
  currentColor = color(0);
  baseScore = 1;
  comboMultiplier = 1;
  createCanvas(windowWidth, windowHeight);
  paintLayer = createGraphics(BASE_GAME_WIDTH/4, BASE_GAME_HEIGHT/4);
  //paintLayer.background(255);
  paintLayer.noSmooth();

  currentColor = color(0)
  const scaleX = windowWidth / BASE_CANVAS_WIDTH;
  const scaleY = windowHeight / BASE_CANVAS_HEIGHT;
  gs = Math.min(scaleX, scaleY);

  gameLayer = createGraphics(BASE_GAME_WIDTH * gs, BASE_GAME_HEIGHT * gs);
  gameX = (width - gameLayer.width) / 2;
  gameY = (height - gameLayer.height) / 2;

  //start button
  textFont(myFont);
  textSize(12 * gs); // Sets a font size to keep text size consistent
  startButton1 = new Sprite(320 * gs + gameX, 450 * gs + gameY);
  startButton1.text = "Play\n Classic Mode";
  startButton1.width = 180 * gs;
  startButton1.height = 50 * gs;
  startButton1.color = "lightgreen";

  startButton2 = new Sprite(520 * gs + gameX, 450 * gs + gameY);
  startButton2.text = "Play\n Rougelike Mode";
  startButton2.width = 200 * gs;
  startButton2.height = 50 * gs;
  startButton2.color = "red";
  image(gameLayer, gameX, gameY, gameLayer.width, gameLayer.height);
  //gameLayer.background(220);
  
  compressor = new p5.Compressor();
  for (let s of pickupSounds) {
    s.setVolume(0.2);
  }
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
  zoneX = 50 + gameX;
  zoneY1 = 100 + gameY;
  zoneY2 = 620 + gameY;
  zoneWidth = 150;
  zoneHeight = 150;

  setBoss();
  makeColorZones(); //classic mode only
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
      dropBomb();
      drawExplosion();
      player.checkTotem();    
  } else if (state == 3){ //gameover
      gameOver();
  } else if(state == 4){
      levelTransition();
  }

}


function startMenu(){
  drawBorder();
  image(gameLayer, gameX, gameY);
  gameLayer.background(bg);

  colorFluctuation();

  fill(titleColor.r, titleColor.g, titleColor.b);

  stroke("black");
  strokeWeight(5 * gs);
  textSize(30 * gs);
  textStyle("bold");
    
  text("ColorSplode", 250 * gs + gameX, 350 * gs + gameY);

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
    pauseButton = new Sprite(750 * gs + gameX, 50 * gs + gameY);
    pauseButton.text = "||";
    pauseButton.width = 70 * gs;
    pauseButton.height = 50 * gs;
    pauseButton.color = "lightgreen";
    menuMusic.stop();
    levelMusic.loop();
    drawScore();
  }
}


function gameMenu1(){
  clear();
  drawBorder();
  baseScore = 1;
  image(gameLayer, gameX, gameY, gameLayer.width, gameLayer.height);
  gameLayer.background(levelBackground);
  image(paintLayer, gameX, gameY, gameLayer.width, gameLayer.height);
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
  console.log(player.isInvFrames());

  if(!gamePaused){time++;}
  if(time == 60 * spawnTime  || time == 60 * spawnTime * 2 || time == 60 * 3 * spawnTime ){ //spawnTime is the interval at which a new vent spawns
    activateRandomVent();
  }
}

function gameMenu2(){ //game menu for roguelike mode
  clear();
  drawBorder();
  image(gameLayer, gameX, gameY, gameLayer.width, gameLayer.height);
  gameLayer.background(levelBackground);
  image(paintLayer, gameX, gameY, gameLayer.width, gameLayer.height);
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

  // if graffiti
  if (levelSet[currentLevel].obstacleTypes.includes("graffiti")) {
  if ((random() < 0.8) && (time % graffitiTime == 0)) { // chance to spawn a graffiti
        console.log("Time to do some graffiti!");
        let burstAmt = levelSet[currentLevel].graffitiBurst;
        spawnGraffitiActor(burstAmt);
    }
   for (let grafActor of graffitiActors) {
      grafActor.update();
      grafActor.draw();
      
    }
  }

  // only run these if rougeCharacter exists
  if (rougeCharacter) {

    //freeze item 
    if (player.hasItem("Freeze") && !rougeCharacter.frozen && rougeCharacter.isMouseOver()) {
      rougeCharacter.frozen = true;
      rougeCharacter.freezeTimer = 120;
    }

    if (rougeCharacter.frozen) {
      rougeCharacter.freezeTimer--;
      if (rougeCharacter.freezeTimer <= 0) {
        rougeCharacter.frozen = false;
      }
    }

    //only update if not frozen
    if (!rougeCharacter.frozen || rougeCharacter.state === "GRABBED") {
      rougeCharacter.update();
    }

    push();
    if (rougeCharacter.frozen) {
      tint(150, 150, 255); //light blue tint when frozen
    } else {
      tint(255);
    }
    rougeCharacter.draw();
    pop();
  }

  if (cat){
    cat.update();
    cat.draw();
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
  strokeWeight(5 * gs);
  textSize(50 * gs);
  textStyle("bold");
  fill("red");

  colorFluctuation();
  fill(titleColor.r, titleColor.g, titleColor.b);
  text("Game Over!", 195 * gs + gameX, 350 * gs + gameY);
  scoreDisplay.text = "Score:" + score;

  stroke("black");
  strokeWeight(7.5 * gs);
  textSize(30 * gs);
  fill("white");
  let x = 300 * gs + gameX;
  let y = 400 * gs + gameY;
  text("Score: " + score, x , y );

  if (!buttonCreated){
    strokeWeight(5 * gs);
    textSize(20 * gs);
    retryButton = new Sprite(400 * gs + gameX, 450 * gs + gameY);
    retryButton.text = "Retry";
    retryButton.width = 120 * gs;
    retryButton.height = 50 * gs;

    exitButton = new Sprite(400 * gs + gameX, 515 * gs + gameY);
    exitButton.text = "Quit";
    exitButton.width = 120 * gs;
    exitButton.height = 50 * gs;

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
  gamePaused = false;

  // Remove pause menu buttons if they exist
  if (resumeButton) { resumeButton.remove(); resumeButton = null; }
  if (restartButton) { restartButton.remove(); restartButton = null; }
  if (quitButton) { quitButton.remove(); quitButton = null; }
  if (volumeSlider) { volumeSlider.remove(); volumeSlider = null; }
  if (volumeLabel) { volumeLabel.remove(); volumeLabel = null; }
  if (colorBlindCheckbox) { colorBlindCheckbox.remove(); colorBlindCheckbox = null; } // This will "unpause" the game
  //remove characters and buttons
  ourCharacters = [];
  levelUpTriggered = {};
  player.inventory = [];
  currentLevel = 0;
  //display score
  score = 0;
  time = 0;

  //clear buttons
  chooseButtons = [];

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
  baseScore = 1;
  comboMultiplier = 1;

  //paintLayer.background(255);

  makeItems();
  if (currentMode === "roguelike") {
    levelSet[currentLevel].setup();
  }
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
  //paintLayer.background(255);
  
  

  clearObstacles();

  //set style
  stroke("black");
  strokeWeight(5 * gs);
  textSize(30 * gs);
  textStyle("bold");
  fill(200);

  //create pause button
  pauseButton = new Sprite(750 * gs + gameX, 50 * gs + gameY);
  pauseButton.text = "||";
  pauseButton.width = 70 * gs;
  pauseButton.height = 50 * gs;
  pauseButton.color = "lightgreen";

  //display score
  currentColor = color(0);
  currentCombo = 0;
  baseScore = 1;
  comboDisplay = 1;
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
  //paintLayer.background(255);

  makeItems();
  if (currentMode === "roguelike") {
    levelSet[currentLevel].setup();
  }
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
  if((keyCode === ESCAPE || key === 'p') && (state == 1 || state == 2) && levelUpActive === false) // When press 'p', pause the game (We can probably change this to esc too, just not sure what key it is)
  {
    pauseGame();
  } else if(state == 0 || state == 3){
    if (resumeButton) {
      resumeButton.remove();
      resumeButton = null;
    }
  }
  if(['0', '1', '2', '3', '4', '5', '6', '7'].includes(key)) // Simple test function that let's us give ourselves an item for testing
  {
    player.addItem(allItems[key - 0]);
  }

  if (key === 'b' || key === 'B') {
    bPressed = true;
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
    resumeButton = new Sprite(400 * gs + gameX, 450 * gs + gameY);
    resumeButton.text = "Resume";
    resumeButton.width = 200 * gs;
    resumeButton.height = 50 * gs;
    resumeButton.color = "lightgreen";

    push();
    textSize(27 * gs);
    restartButton = new Sprite(400 * gs + gameX, 500 * gs + gameY);
    restartButton.text = "Restart";
    restartButton.width = 200 * gs;
    restartButton.height = 50 * gs;
    restartButton.color = "lightgreen";

    pop();

    quitButton = new Sprite(400 * gs + gameX, 550 * gs + gameY);
    quitButton.text = "Quit";
    quitButton.width = 200 * gs;
    quitButton.height = 50 * gs;
    quitButton.color = "lightgreen";

    volumeLabel = createP('Volume');
    volumeLabel.position(windowWidth / 2 - 25, windowHeight / 2 + 200);
    volumeLabel.style('color', 'white');
    volumeLabel.style('font-family', 'PressStart2P-Regular');
    volumeLabel.style('font-size', '10px');
    volumeLabel.style('margin', '0');

    volumeSlider = createSlider(0, 1, currentVolume, 0.01);
    volumeSlider.position(windowWidth / 2 - 75, windowHeight / 2 + 225);
    volumeSlider.style('width', '150px');

    colorBlindCheckbox = createCheckbox('Color Blind Mode', colorBlindMode);
    colorBlindCheckbox.position(windowWidth / 2 - 75, windowHeight / 2 + 260);
    colorBlindCheckbox.style('color', 'white');
    colorBlindCheckbox.style('font-family', 'PressStart2P-Regular');
    colorBlindCheckbox.style('font-size', '10px');
    colorBlindCheckbox.changed(() => {
    colorBlindMode = colorBlindCheckbox.checked();
    //applyColorBlindMode(); // not yet implemented
});
    
    pauseSound.play();
    levelMusic.rate(0.8, 0.3); // slower
    smoothCompressorChange(-50, 10, 0.4);

  }
  else{ // Remove the resume button
    if (resumeButton) { resumeButton.remove(); resumeButton = null; }
    if (restartButton) { restartButton.remove(); restartButton = null; }
    if (quitButton) { quitButton.remove(); quitButton = null; }
    if (volumeSlider) { volumeSlider.remove(); volumeSlider = null; }
    if (volumeLabel) { volumeLabel.remove(); volumeLabel = null; }
    if (colorBlindCheckbox) { colorBlindCheckbox.remove(); colorBlindCheckbox = null; }

    pauseSound.play();
    levelMusic.rate(1.0, 0.3); // restore speed
    //smoothCompressorChange(-24, 4, 0.4);
  }
}

function drawPauseMenu(){
  push(); // save current drawing settings

  // Creates the semi-transparent background for the pause menu
  fill(0, 0, 0, 150);
  noStroke();
  rect(gameX, gameY, gameLayer.width, gameLayer.height);

  

  // pause text
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(32 * gs);
  text("Paused", gameLayer.width / 2 + gameX, gameLayer.height / 2 - 50 + gameY);
  textSize(12 * gs);

  // changes color of button when mouse hovers over
  mouseOverButton(quitButton, "green", "lightgreen");
  mouseOverButton(restartButton, "green", "lightgreen");
  mouseOverButton(resumeButton, "green", "lightgreen");


  if (volumeSlider) {
  let vol = volumeSlider.value();
  currentVolume = vol; // remember value

  // Adjust main music volume dynamically
  if (levelMusic && levelMusic.isPlaying()) levelMusic.setVolume(vol * 0.1);
  if (menuMusic && menuMusic.isPlaying()) menuMusic.setVolume(vol * 0.1);
  if (pauseSound) pauseSound.setVolume(vol * 0.05);

  // If you have arrays of pickup / enemy sounds
  if (pickupSounds) {
    for (let s of pickupSounds) {
      s.setVolume(vol * 0.2);
    }
  }
}

  pop(); // restore settings
  if(quitButton && quitButton.mouse.pressed()){
    state = 0;
    quitGame();
  }
  else if(resumeButton && resumeButton.mouse.pressed()){ // I dunno why, but an instance check is required specifically for this button :/
    pauseGame();

    if (resumeButton) { resumeButton.remove(); resumeButton = null; }
    if (restartButton) { restartButton.remove(); restartButton = null; }
    if (quitButton) { quitButton.remove(); quitButton = null; }
    if (volumeSlider) { volumeSlider.remove(); volumeSlider = null; }
    if (volumeLabel) { volumeLabel.remove(); volumeLabel = null; }
    if (colorBlindCheckbox) { colorBlindCheckbox.remove(); colorBlindCheckbox = null; }
  }
  else if(restartButton && restartButton.mouse.pressed())
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
    levelChoices = [allItems[0], allItems[1], allItems[2], allItems[3], allItems[4], allItems[5], allItems[6], allItems[7], allItems[8]];

    push();
    textSize(15);

    textSize(15 * gs);

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
    chooseButton4.remove();
    chooseButton4 = null;
    chooseButton5.remove();
    chooseButton5 = null;
    chooseButton6.remove();
    chooseButton6 = null;
    chooseButton7.remove();
    chooseButton7 = null;
    chooseButton8.remove();
    chooseButton8 = null;
    chooseButton9.remove();
    chooseButton9 = null;

    pauseSound.play();
    levelMusic.setVolume(0.05, 0.2); 
    levelMusic.rate(1.0, 0.2);
    compressor.threshold(-24);
    compressor.ratio(4);

    pauseButton = new Sprite(750 * gs + gameX, 50 * gs + gameY);
    pauseButton.text = "||";
    pauseButton.width = 70 * gs;
    pauseButton.height = 50 * gs;
    pauseButton.color = "lightgreen";
  }
}

function drawLevelMenu(){
  push();

  // Creates the semi-transparent background for the level menu
  fill(0, 0, 0, 150);
  noStroke();
  rect(gameX, gameY, gameLayer.width, gameLayer.height);

  image(levelUpChoice, 15*gs + gameX, 60*gs + gameY, 770*gs, 750*gs);

  // create/keep an array of choose buttons so we can manage them collectively
  if (typeof chooseButtons === 'undefined' || !Array.isArray(chooseButtons)) {
    chooseButtons = [];
  }

  drawItemMenu();
  itemButtonLogic();
}

function drawItemMenu(){
  // Draw level choices in a 3x3 grid
  let cols = 3;
  let imageSize = 60;
  let startX = 130;
  let startY = 160;

  let items = 3;
  let itemSpacing = 240;
  let buyScreenWidth = 800;

  for (let i = 0; i < levelChoices.length; i++) {
    let row = Math.floor(i / cols);
    let x = startX + (((i%items)*itemSpacing)%buyScreenWidth) // controls column spacing
    let y = startY + row * 235; // controls row spacing

    if (levelChoices[i] && levelChoices[i].sprite) {
                                    //scale to fit screen
      image(levelChoices[i].sprite, x * gs + gameX, (y-20) * gs + gameY , imageSize * gs, imageSize * gs);
      textSize(14 * gs);
      fill(0);
      text(levelChoices[i].name, (x - 20) * gs + gameX, (y - 40) * gs + gameY , 150 * gs);
      textSize(12 * gs);
      text(levelChoices[i].description, (x - 50) * gs + gameX, (y + 60) * gs + gameY , 200 * gs);

      // Only create "Choose" buttons for the first three visible choices
      if (i < 9) {
        // place button roughly centered under the block (column width 150)
        let btnX = (x + 25) * gs + gameX;
        let btnY = (y + imageSize + 70) * gs + gameY;

        if (!chooseButtons[i]) {
          chooseButtons[i] = new Sprite(btnX, btnY);
          chooseButtons[i].text = "Buy: $X";
          chooseButtons[i].width = 100;
          chooseButtons[i].height = 20;
          // color by index for quick visual distinction
          const btnColors = ["red", "green", "blue"];
          chooseButtons[i].color = btnColors[i%3] || "lightgreen";
        } else {
          // update position each frame so the button follows layout changes
          chooseButtons[i].x = btnX;
          chooseButtons[i].y = btnY;
        }
      }
    }
  }
}

function itemButtonLogic(){
   // assign buttons
  chooseButton1 = chooseButtons[0];
  chooseButton2 = chooseButtons[1];
  chooseButton3 = chooseButtons[2];
  chooseButton4 = chooseButtons[3];
  chooseButton5 = chooseButtons[4];
  chooseButton6 = chooseButtons[5];
  chooseButton7 = chooseButtons[6];
  chooseButton8 = chooseButtons[7];
  chooseButton9 = chooseButtons[8];

  // changes color of button when mouse hovers over
  mouseOverButton(chooseButton1, "pink", "red");
  mouseOverButton(chooseButton2, "lightgreen", "green");
  mouseOverButton(chooseButton3, "lightblue", "deepskyblue"); //"steelblue","dodgerblue","deepskyblue","skyblue","cornflowerblue","lightblue"
  mouseOverButton(chooseButton4, "pink", "red");
  mouseOverButton(chooseButton5, "lightgreen", "green");
  mouseOverButton(chooseButton6, "lightblue", "deepskyblue"); //"steelblue","dodgerblue","deepskyblue","skyblue","cornflowerblue","lightblue"
  mouseOverButton(chooseButton7, "pink", "red");
  mouseOverButton(chooseButton8, "lightgreen", "green");
  mouseOverButton(chooseButton9, "lightblue", "deepskyblue");


  pop(); // restore settings
  if (chooseButton1 && chooseButton1.mouse.pressed() && !player.hasItem("Magnet")) {
    player.addItem(levelChoices[0]);
    levelUp();
    makeItems();
    chooseButtons = [];
  }
  if (chooseButton2 && chooseButton2.mouse.pressed() && !player.hasItem("Freeze")) {
    player.addItem(levelChoices[1]);
    levelUp();
    makeItems();
    chooseButtons = [];

  }
  if (chooseButton3 && chooseButton3.mouse.pressed() && !player.hasItem("Blatant Copyright")) {
    player.addItem(levelChoices[2]);
    levelUp();
    makeItems();
    chooseButtons = [];

  }
  if (chooseButton4 && chooseButton4.mouse.pressed() && !player.hasItem("Bomb")) {
    player.addItem(levelChoices[3]);
    levelUp();
    makeItems();
    chooseButtons = [];
  }
  if (chooseButton5 && chooseButton5.mouse.pressed() && !player.hasItem("Paint Scraper")) {
    player.addItem(levelChoices[4]);
    levelUp();
    makeItems();
    chooseButtons = [];
  }
  if (chooseButton6 && chooseButton6.mouse.pressed() && !player.hasItem("Paint Thinner")) {
    player.addItem(levelChoices[5]);
    levelUp();
    makeItems();
    chooseButtons = [];
  }
  if (chooseButton7 && chooseButton7.mouse.pressed() && !player.hasItem("Heart Canister")) {
    player.addItem(levelChoices[6]);
    levelUp();
    makeItems();
    chooseButtons = [];
  }
  if (chooseButton8 && chooseButton8.mouse.pressed()) {
    player.addItem(levelChoices[7]);
    levelUp();
    makeItems();
    chooseButtons = [];
  }
  if (chooseButton9 && chooseButton9.mouse.pressed()) {
    player.addItem(levelChoices[8]);
    levelUp();
    makeItems();
    chooseButtons = [];
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

  if (volumeSlider) {
    volumeSlider.remove();
    volumeSlider = null;
  }
  if (volumeLabel) {
    volumeLabel.remove();
    volumeLabel = null;
  }

  if (volumeSlider) volumeSlider.remove();
  if (volumeLabel) volumeLabel.remove();
  if (colorBlindCheckbox) colorBlindCheckbox.remove();

  levelMusic.stop();
  scoreDisplay.remove()
  scoreDisplay = null;
  comboDisplay.remove();
  comboDisplay = null;
  score = 0;
  baseScore = 1;
  currentCombo = 0;
  comboMultiplier = 1;
  time = 0;

  chooseButtons = [];
  ourCharacters = []; // Removes all enemies to prevent duplicates
  levelUpTriggered = {};
  player.inventory = [];
  player.health = player.startHealth;
  currentLevel = 0;
  clearObstacles();

  //remove buy-menu buttons
  chooseButtons = [];

  //reset spawn logic after quit
  closeAllVents();
  spawnLogic.timer = 50;
  spawnLogic.timeToSpawn =  100;
  spawnLogic.rate = 1;
  spawnLogic.activeActors = 0;

  if (levelMusic && levelMusic.isPlaying()) {
    levelMusic.rate(1.0);           // normal speed
    levelMusic.setVolume(currentVolume); // keep same volume
  }
  compressor.threshold(-24); // restore default compression
  compressor.ratio(4);

  setup();
}

// Grabs enemies
function mousePressed() { 
  //prevent grabbing while paused, or if anything is already grabbed
  if (gamePaused || grabbedCharacter || mousePressedHandled) return;
  mousePressedHandled = true;
  
  for (let actor of ourCharacters){
    if (actor.state === "FREE" && actor.isMouseOver() && !gamePaused&& grabbedCharacter == null){ // Ensures the player can't grab the actor when game is paused
      actor.state = "GRABBED";
      actor.splode();
      grabbedCharacter = actor;
      idx = chrSprite.indexOf(grabbedCharacter.sprite);
      grabbedCharacter.sprite = grabSprite[idx];
      let randomPickup = random(pickupSounds);
      randomPickup.setVolume(currentVolume * 0.2);
      randomPickup.play();
      break;
    }
  }

  //grab rougeBucket
  if (rougeCharacter && rougeCharacter.isMouseOver() &&!gamePaused && grabbedCharacter == null) {
    rougeCharacter.state = "GRABBED";
    grabbedCharacter = rougeCharacter;
    pickup.play();
    console.log("rougeBucket picked up")
    console.log("pickup state = " + grabbedCharacter.state);
    return;
  }

  // Press bomb icon
  // We can copy syntax like this if we want to try having more items that activate upon being clicked
  if(player.hasItem("Bomb"))
  {
    for(let i of icons)
    {
      if((mouseX > i.x && mouseX < i.x + i.size) && (mouseY > i.y && mouseY < i.y + i.size) && i.item.name == "Bomb")
      {
        bPressed = true;
      }
    }
  }
}

function mouseReleased() {
  mousePressedHandled = false;
  
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
          //only count towards combo is buckets hasn't been sorted before
          if (grabbedCharacter.scored === false){
            currentCombo += 1;
          } 
          if(currentCombo >= 5 && player.hasItem("Paint Scraper") && player.health < player.startHealth){
            player.health++;
          }
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
        // baseScore, and comboMultiplier are only important in rougelike
        if (grabbedCharacter.scored === false){
          score += baseScore + round((currentCombo - 1) * comboMultiplier);
        }
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
  scoreDisplay = new Sprite((150 * gs + gameX), 50 * gs + gameY);
  scoreDisplay.text = "Score:" + score;
  scoreDisplay.width = 250 * gs;
  scoreDisplay.height = 50 * gs;
  scoreDisplay.color = "lightgreen";

  comboDisplay = new Sprite(550 * gs + gameX, 50 * gs + gameY);
  comboDisplay.text = "Combo:" + currentCombo;
  comboDisplay.width = 250 * gs;
  comboDisplay.height = 50 * gs;
  comboDisplay.color = "white";
}


function drawScoreAtPos(x,y){
  scoreDisplay = new Sprite(x, y);
  scoreDisplay.text = "Score:" + score;
  scoreDisplay.width = 250 * gs;
  scoreDisplay.height = 50 * gs;
}

function drawBorder(){
  push();
  fill(0);
  rect(gameX - 10, gameY - 10, gameLayer.width + 20, gameLayer.height + 20);
  pop();
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
  //let randRot = random(-180,180);

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
  let x = random(gameLayer.width + gameX);
  let y = random(gameLayer.height + gameY);
  let sizeMult = random(1.5, 5);
  if (amt >= splatAmt-1) {
    sizeMult = 20;
  }
  let w = randSplat.width * sizeMult;
  let h = randSplat.height * sizeMult;
  imageMode(CENTER);
  //rotate(randRot); //Makes the splatters go offscreen sometimes? Weird. Fix l8r
  console.log("Splat sprite:", randSplat);
  image(randSplat, x, y, w, h);
  noTint();
  smooth();
  imageMode(CORNER);
}

