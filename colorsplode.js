var player;
var character;
var playerX = 375;
var playerY = 375;
let time = 0;
//start menu global vars
let r = 250;
let g = 0;
let b = 0;

let state = 0;
let startButton;

let compressor;

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

//zone vars
let zoneX = 60, zoneY = 620, zoneWidth = 150, zoneHeight = 150, gap = 20;
// color zones
const colors = ["red","blue","purple","green"];
let colorZones = [];


function preload(){
  character = loadImage("images/redpaintbucketgif.gif");
  myFont = loadFont('font/PressStart2P-Regular.ttf');
  bg = loadImage("images/menubackground.png");
  menuMusic = loadSound('sounds/menu_music.mp3');
  levelMusic = loadSound('sounds/level_music.mp3');
  pauseSound = loadSound('sounds/pause.wav');
  pickup = loadSound('sounds/pickup.wav');
  chrSprite[0] = loadImage("images/redpaintbucket.png");
  chrSprite[1] = loadImage("images/bluepaintbucket.png");
  chrSprite[2] = loadImage("images/purplepaintbucket.png");
  chrSprite[3] = loadImage("images/greenpaintbucket.png");
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
        roamingMovement(this);
      } else if (this.state === "GRABBED") {
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

  ourCharacters.push(new Actor(100, 100, chrSprite[0]));
  ourCharacters.push(new Actor(200, 200, chrSprite[1]));
  ourCharacters.push(new Actor(300, 300, chrSprite[2]));
  ourCharacters.push(new Actor(400, 400, chrSprite[3]));

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
  }
}

function startMenu(){
   background(bg);

  colorFluctuation();
  fill(r, g, b);
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
    menuMusic.stop();
    levelMusic.loop();
  }
}

function gameMenu(){

  background(220);

   drawColorZones();

  for (let actor of ourCharacters) {
    actor.update();
    image(actor.sprite, actor.x, actor.y, actor.size, actor.size);
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
  if(r > 230 || b > 220 || g > 220){
      r = random(0,100);
      b = random(0,100);
      g = random(0,100);
    }
    r += random(0,1);
    g += random(0,3);
    b += random(0,3);
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

    pauseSound.play();
    levelMusic.setVolume(0.005, 0.2); 
    levelMusic.rate(0.85, 0.2);
    compressor.threshold(-50);
    compressor.ratio(10);

  }
  else{ // Remove the resume button
    resumeButton.remove();
    resumeButton = null;
    quitButton.remove();
    quitButton = null;

    pauseSound.play();
    levelMusic.setVolume(0.05, 0.2); 
    levelMusic.rate(1.0, 0.2);
    compressor.threshold(-24);
    compressor.ratio(4);
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

  ourCharacters = []; // Removes all enemies to prevent duplicates
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

function zoneUnderActor(actor){
  // Use actor center to test
  const centerX = actor.x + actor.size/2;
  const centerY = actor.y + actor.size/2;
  for (let z of colorZones){
    if (centerX >= z.x && centerX <= z.x + z.w && centerY >= z.y && centerY <= z.y + z.h){
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
