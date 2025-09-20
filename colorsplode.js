var player;
var character;
var playerX = 375;
var playerY = 375;
let time = 0;
let score = 0;

let state = 0;
let startButton;

let chrSprite =[]; //array of character sprits
let ourCharacters = []; //array of character objects

// The mouse's 'grabbed' character
let grabbedCharacter; 
let backgroundImage;

// Pause buttons
let gamePaused = false;
let pauseButton;
let resumeButton; // Stored here so we can detect drawing it ONCE
let quitButton;

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

//zone vars
let zoneX = 60, zoneY = 620, zoneWidth = 150, zoneHeight = 150, gap = 20;

// color zones
const colors = ["red","blue","purple","green"];
let colorZones = [];


function preload(){
  character = loadImage("images/redpaintbucketgif.gif");
  myFont = loadFont('font/PressStart2P-Regular.ttf');
  bg = loadImage("images/menubackground.png");
  chrSprite[0] = loadImage("images/redpaintbucket.png");
  chrSprite[1] = loadImage("images/bluepaintbucket.png");
  chrSprite[2] = loadImage("images/purplepaintbucket.png");
  chrSprite[3] = loadImage("images/greenpaintbucket.png");
  pickup = loadSound('sounds/pickup.wav')
}



// A Class of Our Actors/Characters
class Actor {
  constructor(x, y, sprite) {
    this.x = x;
    this.y = y;
    this.size = 50;
    this.sprite = sprite;
    this.xspeed = random(-2,2);
    this.yspeed = random(-2,2);

    this.timer = 10.0;           // measured in seconds
    this.timerStart = millis();  // when the timer started

    this.shakeThreshold = 8.0;   // when the bucket starts shaking
    this.angle = 0;              // current rotation angle
    this.rotationSpeed = 100.0;  // how fast it rotates per frame
    this.rotationDirection = 1;  // 1 = clockwise, -1 = counter-clockwise
    this.rotationMax = 480;      // seems like a lot, but looks good (?)

    // state is currently a string. This is weird and bad. Fix l8r!
    this.state = "FREE";
  }

  setState(newState) {
    this.state = newState;
  }

  // Update the position of the character
  update() {
    if(!gamePaused){ // If the game ISN'T Paused then we update their movement
      
      if (this.state === "FREE") {
        checkTimer(this);
        roamingMovement(this);
      } else if (this.state === "GRABBED") {
        checkTimer(this);
        grabbedMovement(this);
      } else if (this.state === "SNAPPED") {
        // Do nothing; actor is in a zone
      }
      
    
    }
  } 
  
  //makes sure the mouse is over the character
    isMouseOver() { 
    return mouseX > this.x && mouseX < this.x + this.size &&
           mouseY > this.y && mouseY < this.y + this.size;
    }
}

// Checks the actors timer
function checkTimer(actor) {
  
  let elapsed = (millis() - actor.timerStart) / 1000.0;
  let remaining = max(actor.timer - elapsed, 0);
  let t = remaining / actor.timer; // goes 1 to 0 over time


  if (remaining <= 0) {
    onTimerFinished(actor);
    return;
  }
  
  let speedMultiplier = 1 / (t + 0.05);  // tweak 0.05 to control max speed
  actor.angle += actor.rotationSpeed * speedMultiplier * actor.rotationDirection;    
    

  let flipThreshold = actor.rotationMax * (1 + (1 - t) * 2);  
  if (abs(actor.angle) > flipThreshold) {
    actor.rotationDirection *= -1.0;
    actor.angle = constrain(actor.angle, -flipThreshold, flipThreshold);
    }
  }


// Called when timer finishes
function onTimerFinished(actor) {
  console.log("Timer finished for actor!");
  actor.state = "EXPLODED"; 
  }


function setup() {
  createCanvas(800, 800);

  character.resize(50, 50);

  //start button
  textFont(myFont);
  textSize(12); // Sets a font size to keep text size consistent
  startButton = new Sprite(400, 450);
  startButton.text = "Play Game";
  startButton.width = 120;
  startButton.height = 50;
  startButton.color = "lightgreen";
  background(220);

    // create 4 drop zones along the bottom
  colorZones = [
    { x: zoneX + 0*(zoneWidth+gap), y: zoneY, w: zoneWidth, h: zoneHeight, color: "red"    },
    { x: zoneX + 1*(zoneWidth+gap), y: zoneY, w: zoneWidth, h: zoneHeight, color: "blue"   },
    { x: zoneX + 2*(zoneWidth+gap), y: zoneY, w: zoneWidth, h: zoneHeight, color: "purple" },
    { x: zoneX + 3*(zoneWidth+gap), y: zoneY, w: zoneWidth, h: zoneHeight, color: "green"  },
  ];


}


function draw() {
  if(state == 0){ //start screen
    startMenu();

  } else if (state == 1){ //game screen
      gameMenu();
      spawnActor();
      spawnRate();
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

  if (startButton.mouse.pressing()){
    startButton.remove();
    pauseButton = new Sprite(750, 50);
    pauseButton.text = "||";
    pauseButton.width = 70;
    pauseButton.height = 50;
    pauseButton.color = "lightgreen";
    state = 1;
    drawScore();
  }
}


function gameMenu(){

  background(220);

   drawColorZones();
   //update the displayed score
   scoreDisplay.text = "Score:" + score;

  for (let actor of ourCharacters) {
    actor.update();

    // draw the actor rotated around its center
    push();
    translate(actor.x + actor.size/2, actor.y + actor.size/2);
    rotate(radians(actor.angle || 0));        // rotate (use 0 if angle undefined)
    image(actor.sprite, -actor.size/2, -actor.size/2, actor.size, actor.size);
    pop();
  }

  if(pauseButton.mouse.pressed()){
    pauseGame();
  }
  
  if (gamePaused) {
    push(); // save current drawing settings

    // Creates the semi-transparent background for the pause menu
    fill(0, 0, 0, 150);
    noStroke();
    rect(0, 0, width, height);

    // pause text
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(32);
    text("Paused", width / 2, height / 2);
    textSize(12);

    pop(); // restore settings
    if(quitButton.mouse.pressed()){
      state = 0;
      quitGame();
    }
    if(resumeButton && resumeButton.mouse.pressed()){ // I dunno why, but an instance check is required specifically for this button :/
      pauseGame();
    }
  }
  text("X: " + mouseX + " Y: " + mouseY, 10, 20);
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

// function keyReleased(){
//   character.reset();
//   character.pause();
// }

function keyPressed() // Generic Keypress function
{
  if((keyCode === ESCAPE || key === 'p') && state == 1) // When press 'p', pause the game (We can probably change this to esc too, just not sure what key it is)
  {
    pauseGame();
  }
  else if(state != 1)
  {
    resumeButton.remove();
    resumeButton = null;
  }
}

function pauseGame(){
  gamePaused = !gamePaused;
  for(let actor of ourCharacters){
    if(actor.state === "GRABBED"){ // Ensures the player can't click, and then pause and move the enemy
      actor.state = "FREE"
    }
  }
  if(gamePaused){ // if game paused, draw the new buttons
    resumeButton = new Sprite(400, 450);
    resumeButton.text = "Resume";
    resumeButton.width = 200;
    resumeButton.height = 50;
    resumeButton.color = "lightgreen";

    quitButton = new Sprite(400, 500);
    quitButton.text = "Quit";
    quitButton.width = 200;
    quitButton.height = 50;
    quitButton.color = "lightgreen";
  }
  else{ // Remove the resume button
    resumeButton.remove();
    resumeButton = null;
    quitButton.remove();
    quitButton = null;
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
  gamePaused = false;
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
      grabbedCharacter = actor;
      pickup.play();
      break;
    }
  }

}

function mouseReleased() {
  if (grabbedCharacter && grabbedCharacter.state === "GRABBED") {
    const zone = zoneUnderActor(grabbedCharacter);
    if (zone) {
      const idx = chrSprite.indexOf(grabbedCharacter.sprite); 
      const actorColor = colors[idx]; // "red","blue","purple","green"
      if (zone.color === actorColor) {
        grabbedCharacter.xspeed = 0;
        grabbedCharacter.yspeed = 0;
        grabbedCharacter.state = "SNAPPED";
        //update score if character is in correct zone
        score += 1;
      } else {
        // wrong zone release normally
        grabbedCharacter.state = "FREE";
      }
    } else {
      // no zone is a normal release
      grabbedCharacter.state = "FREE";
    }
    grabbedCharacter = null;
  }
}


//random character movement
function roamingMovement(actor) {
  if (frameCount % 120 === 0) {
    //random x and y speeds 
    actor.xspeed = random(-2, 2);
    actor.yspeed = random(-2, 2);
  }

  actor.x += actor.xspeed;
  actor.y += actor.yspeed;

  //make sure characters don't go off screen
  if (actor.x < 0 || actor.x > width - actor.size) actor.xspeed *= -1;
  if (actor.y < 0 || actor.y > zoneY - actor.size) actor.yspeed *= -1;

}

function grabbedMovement(actor) {
  actor.x = constrain(mouseX - actor.size/2, 0, width - actor.size);
  actor.y = constrain(mouseY - actor.size/2, 0, width - actor.size);
}

// draw colored drop zones 
function drawColorZones(){
  push();
  stroke(0);
  strokeWeight(3);
  textAlign(CENTER, CENTER);
  textSize(14);
  for (let z of colorZones){
    fill(zoneFill(z.color));
    rect(z.x, z.y, z.w, z.h);
    fill(0);
  }
  pop();
}

function drawScore(){
  scoreDisplay = new Sprite(150, 50);
  scoreDisplay.text = "Score:" + score;
  scoreDisplay.width = 250;
  scoreDisplay.height = 50;
  scoreDisplay.color = "lightgreen";
}

function zoneUnderActor(actor){
  // Use actor center to test
  const centerX = actor.x + actor.size/2;
  const centerY = actor.y + actor.size/2;
  for (let z of colorZones){
    if (centerX >= z.x && centerX <= z.x + z.w && centerY >= z.y && centerY <= z.y + z.h){
      --spawnLogic.activeActors;
      return z;
    }
  }

  
  return null;
}

function zoneFill(colorName){
  if (colorName === "red")    return color(255,180,180);
  if (colorName === "blue")   return color(180,180,255);
  if (colorName === "purple") return color(210,180,255);
  if (colorName === "green")  return color(180,255,180);
  return color(230);
}


//SPAWN LOGIC
//////////////////////////////////////
// used for actor spawning

function spawnActor(){

  let rate = spawnLogic.timeToSpawn/spawnLogic.rate;
  const MAXACTORS = 10;

  if(spawnLogic.timer == Math.round(rate) && !gamePaused && spawnLogic.activeActors <= MAXACTORS){
    // position
    let newX = random(0, width - 50);
    let newY = random(0, height - 210);

    // random sprite
    let randomSprite = random(chrSprite);
    
    // Creates new actor. adds it to the array
    ourCharacters.push(new Actor(newX, newY, randomSprite));

    ++spawnLogic.activeActors;
  }

}

function spawnRate(){
                  //needs to be whole number
  let rate = spawnLogic.timeToSpawn/spawnLogic.rate;

  if(spawnLogic.timer == Math.round(rate)){
    spawnLogic.timer = 0;

    //spawn rate starts to slow down.
    if (spawnLogic.rate < 2){
      spawnLogic.rate += 0.05; 
    } else {
      spawnLogic.rate += 0.0125;
    }
  }

  ++spawnLogic.timer;
}

///////////////////////////
