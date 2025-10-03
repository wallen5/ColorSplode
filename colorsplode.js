let time = 0;
let score = 0;

let state = 0;
let currentMode = null;
let startButton1 //classic mode
let startButton2; //roguelike mode

let compressor;

let chrSprite =[]; //array of character sprits
let grabSprite =[]; //array of grab animations
let deathSprite =[]; //array of death animations
let ourCharacters = []; //array of character objects

// The mouse's 'grabbed' character
let grabbedCharacter; 
let backgroundImage;

// Pause buttons
let gamePaused = false;
let pauseButton;
let resumeButton; // Stored here so we can detect drawing it ONCE
let quitButton;
let restartButton;

//Game Over Buttons
let buttonCreated = false;
let retryButton;
let exitButton;
let drawGameOver = false;

//start menu text. acts as namespace
let titleColor = {
  r: 250,
  g: 0,
  b: 0
};

//Spawns. acts as namespace
let spawnLogic = {
  timer: 50,
  timeToSpawn: 100,
  rate: 1,
  activeActors: 0
};



function preload(){
  myFont = loadFont('font/PressStart2P-Regular.ttf');
  bg = loadImage("images/menubackground.png");
  gameOverBG = loadImage("images/gameoverbackground.png")
  menuMusic = loadSound('sounds/menu_music.mp3');
  levelMusic = loadSound('sounds/level_music.mp3');
  pauseSound = loadSound('sounds/pause.wav');
  pickup = loadSound('sounds/pickup.wav');
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
}

function setup() {
  createCanvas(800, 800);

  //start button
  textFont(myFont);
  textSize(12); // Sets a font size to keep text size consistent
  startButton1 = new Sprite(320, 450);
  startButton1.text = "Play\n Classic Mode";
  startButton1.width = 180;
  startButton1.height = 50;
  startButton1.color = "lightgreen";

  startButton2 = new Sprite(520, 450);
  startButton2.text = "Play\n Roguelike Mode";
  startButton2.width = 200;
  startButton2.height = 50;
  startButton2.color = "lightgreen";
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
  makeColorZones();
  //randomizeZonePlacements();
}


function draw() {
  if(state == 0){ //start screen
    startMenu();

  } else if (state == 1){ //play classic mode
      gameMenu1();
      spawnActor();
      spawnRate();
  } else if (state == 2){ //play roguelike mode
      gameMenu2();
      spawnActor();
      spawnRate();
  } else if (state == 3){ //gameover
      gameOver();
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
  if (startButton1.mouse.pressing() || startButton2.mouse.pressing()){
    startButton1.remove();
    startButton2.remove();
    pauseButton = new Sprite(750, 50);
    pauseButton.text = "||";
    pauseButton.width = 70;
    pauseButton.height = 50;
    pauseButton.color = "lightgreen";
    if (startButton1.mouse.pressing()){
      state = 1;
      currentMode = "classic";
    } else {
      state = 2;
      currentMode = "roguelike";
    }
  
    
    menuMusic.stop();
    levelMusic.loop();
    drawScore();
  }
}


function gameMenu1(){

  background(220);

  drawColorZones();

  //update the displayed score
  scoreDisplay.text = "Score:" + score;

  for (let actor of ourCharacters) {
    actor.update();
    actor.draw();
  }


  if(pauseButton.mouse.pressed()){
    pauseGame();
  }
  
  if (gamePaused) {
    drawPauseMenu();
  }
}

function gameMenu2(){ //game menu for roguelike mode

  background(220);

  drawColorZones();

  //update the displayed score
  scoreDisplay.text = "Score:" + score;

  for (let actor of ourCharacters) {
    actor.update();
    actor.draw();
  }

  if(pauseButton.mouse.pressed()){
    pauseGame();
  }
  
  if (gamePaused) {
    drawPauseMenu();
  }
}

function gameOver(){
  pauseButton.remove();
  scoreDisplay.remove();

  background(gameOverBG);
  stroke("black");
  strokeWeight(5);
  textSize(50);
  textStyle("bold");
  fill("red");

  myString = "Game Over!";

  colorFluctuation();
  fill(titleColor.r, titleColor.g, titleColor.b);
  text("Game Over!", 195 , 350 );
  scoreDisplay.text = "Score:" + score;

  if (!buttonCreated){
    textSize(20);
    retryButton = new Sprite(400, 425);
    retryButton.text = "Retry";
    retryButton.width = 120;
    retryButton.height = 50;
    retryButton.color = "lightred";

    exitButton = new Sprite(400, 485);
    exitButton.text = "Quit";
    exitButton.width = 120;
    exitButton.height = 50;
    exitButton.color = "lightred";

    buttonCreated = true;
  }

  if (retryButton.mouse.pressing()){
    retry();
  }

  if (exitButton.mouse.pressing()){
    exit();
  }
}

function exit(){
  ourCharacters = [];
  buttonCreated = false;
  exitButton.remove();
  retryButton.remove();

  levelMusic.stop();
  scoreDisplay.remove()
  scoreDisplay = null;
  score = 0;

  //reset spawn logic after quit
  spawnLogic.timer = 50;
  spawnLogic.timeToSpawn =  100;
  spawnLogic.rate = 1;
  spawnLogic.activeActors = 0;

  setup();
  state = 0;
}

function restart(){
  pauseGame(); // This will "unpause" the game

  //remove characters and buttons
  ourCharacters = [];

  //display score
  score = 0;

  //reset spawn logic after quit
  spawnLogic.timer = 50;
  spawnLogic.timeToSpawn =  100;
  spawnLogic.rate = 1;
  spawnLogic.activeActors = 0;
}

function retry(){
  gamePaused = false;

  //remove characters and buttons
  ourCharacters = [];
  buttonCreated = false;
  retryButton.remove();
  exitButton.remove();

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
  score = 0;
  drawScore();

  //reset spawn logic after quit
  spawnLogic.timer = 50;
  spawnLogic.timeToSpawn =  100;
  spawnLogic.rate = 1;
  spawnLogic.activeActors = 0;

  //return to game screen
  if (currentMode == "classic") state = 1;
  if (currentMode == "roguelike") state = 2;

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
  if((keyCode === ESCAPE || key === 'p') && (state == 1 || state == 2) // When press 'p', pause the game (We can probably change this to esc too, just not sure what key it is)
  {
    pauseGame();
  }
  else if(state == 0 || state == 3)
  {
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
  score = 0;


  ourCharacters = []; // Removes all enemies to prevent duplicates

  //reset spawn logic after quit
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

}

function mouseReleased() {
  if (grabbedCharacter && grabbedCharacter.state === "GRABBED") {
    const zone = zoneUnderActor(grabbedCharacter);
    if (zone) {
      const idx = grabSprite.indexOf(grabbedCharacter.sprite); 
      const actorColor = colors[idx]; // "red","blue","purple","green"
      if (zone.color === actorColor) {
        grabbedCharacter.xspeed = 0;
        grabbedCharacter.yspeed = 0;
        grabbedCharacter.state = "SNAPPED";
        //update score if character is in correct color zone
        score += 1;
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
}


function drawScore(){
  scoreDisplay = new Sprite(150, 50);
  scoreDisplay.text = "Score:" + score;
  scoreDisplay.width = 250;
  scoreDisplay.height = 50;
  scoreDisplay.color = "lightgreen";
}
