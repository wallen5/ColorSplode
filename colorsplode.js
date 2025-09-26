var player;
var character;
var playerX = 375;
var playerY = 375;
let time = 0;
let score = 0;
//let canvas;

let state = 0;
let startButton;

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



// A Class of Our Actors/Characters
class Actor {
  constructor(x, y, sprite) {
    this.x = x;
    this.y = y;
    this.prevX = x; // Needed for "bouncing" collision detection
    this.prevY = y;
    this.size = 50;
    this.sprite = sprite;
    this.exSprite = 
    this.xspeed = random(-2,2);
    this.yspeed = random(-2,2);
    
    this.timer = 14.0;           // measured in seconds
    this.timerStart = millis();  // when the timer started

    this.shakeThreshold = 3.0;   // how many seconds left to shake
    this.angle = 0;              // current rotation angle
    this.rotationSpeed = 80.0;  // how fast it rotates per frame
    this.rotationDirection = 1;  // 1 = clockwise, -1 = counter-clockwise
    this.rotationMax = 360;      // seems like a lot, but looks good (?)

    // state is currently a string. This is weird and bad. Fix l8r!
    this.state = "FREE";

    // actor particle array
    this.particles = [];
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

  splode() {
    let numParticles = 5;
    let lifetime = 250; // ms

    for (let i = 0; i < numParticles; i++) {
      
      let vx = random(-10, 10);
      let vy = random(-10, 10);

      let p = {
        x: this.x + this.size/2,
        y: this.y + this.size/2,
        vx: vx,
        vy: vy,
        size: 8,
        born: millis(),
        color: this.sprite === chrSprite[0] ? color(255,0,0) :
              this.sprite === chrSprite[1] ? color(0,0,255) :
              this.sprite === chrSprite[2] ? color(160,0,255) :
              this.sprite === chrSprite[3] ? color(0,200,0) : color(255)
      };

      // push particle into a actor array
      this.particles.push(p);
    }
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
  
  if (remaining <= actor.shakeThreshold) {
  let speedMultiplier = 1 / (t + 0.05);  // tweak 0.1 to control max speed
  speedMultiplier = constrain(speedMultiplier, 0, 7);  // never shake faster than 7x normal
  actor.angle += actor.rotationSpeed * speedMultiplier * actor.rotationDirection;    
    

  let flipThreshold = actor.rotationMax * (1 + (1 - t) * 2);  
  if (abs(actor.angle) > flipThreshold) {
    actor.rotationDirection *= -1.0;
    actor.angle = constrain(actor.angle, -flipThreshold, flipThreshold);
    }
  }
}

// Called when timer finishes
function onTimerFinished(actor) {
  console.log("Timer finished for actor!");
  actor.angle = 0;
  idx = chrSprite.indexOf(actor.sprite);
  actor.sprite = deathSprite[idx];
  actor.state = "EXPLODED"; 
  }

// function centerCanvas() {
//   let x = (windowWidth - width) / 2;
//   let y = (windowHeight - height) / 2;
//   canvas.position(x, y);
// }

function setup() {
  createCanvas(800, 800);
  //canvas = createCanvas(800, 800);
  //centerCanvas();

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

  // Color zone spawn method (comment one in or out as needed)
  makeColorZones();
  //randomizeZonePlacements();
}

// create 4 drop zones along the bottom
function makeColorZones()
{
  colorZones = [
    { x: zoneX + 0*(zoneWidth+gap), y: 100, w: zoneWidth, h: zoneHeight, color: "red"    },
    { x: zoneX + 0*(zoneWidth+gap), y: zoneY, w: zoneWidth, h: zoneHeight, color: "blue"   },
    { x: zoneX + 3*(zoneWidth+gap), y: zoneY, w: zoneWidth, h: zoneHeight, color: "purple" },
    { x: zoneX + 3*(zoneWidth+gap), y: 100, w: zoneWidth, h: zoneHeight, color: "green"  },
  ];
}

// Sets random X and Y for color zones for testing (Could expand on this if we want to implement this as a feature later on)
function randomizeZonePlacements()
{
  colorZones = colors.map(color => ({ 
  x: random(0, width - zoneWidth), 
  y: random(0, height - zoneHeight), 
  w: zoneWidth,
  h: zoneHeight,
  color: color
  }));
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
  

    menuMusic.stop();
    levelMusic.loop();
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

    push();
    translate(actor.x + actor.size/2, actor.y + actor.size/2); // move to center
    rotate(radians(actor.angle)); // use actor.angle
    imageMode(CENTER);
    image(actor.sprite, 0, 0, actor.size, actor.size);
    pop();

    // Draw the particles around the actor
    for (let i = actor.particles.length-1; i >= 0; i--) {
      let p = actor.particles[i];
      fill(p.color);
      noStroke();
      circle(p.x, p.y, p.size);
      p.x += p.vx;
      p.y += p.vy;

      // Fade and remove after set time is up
      if (millis() - p.born > 1500) {
        actor.particles.splice(i,1);
      }
    }
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


//random character movement
function roamingMovement(actor) {
  if (frameCount % 120 === 0) {
    //random x and y speeds 
    actor.xspeed = random(-2, 2);
    actor.yspeed = random(-2, 2);
  }

  
  actor.prevX = actor.x;
  actor.prevY = actor.y
  actor.x += actor.xspeed;
  actor.y += actor.yspeed;

  //make sure characters don't go off screen
  if (actor.x < 0 || actor.x > width - actor.size) actor.xspeed *= -1;
  if (actor.y < 0 || actor.y > height - actor.size) actor.yspeed *= -1;

  checkActorCollision(actor)
}

function checkActorCollision(actor)
{
  for(let zone of colorZones)
  {
    // Collision works as follows: check the top left corner of rect 1, and top left corner of rect 2
    // Because our buckets are a square, you simply use actor.size for both the width and height
    hit = collideRectRect(zone.x, zone.y, zone.w, zone.h, actor.x, actor.y, actor.size, actor.size);
    if(hit)
    {
      // came from the left?
      if (actor.prevX + actor.size <= zone.x) {
        actor.x = zone.x - actor.size;   // push out
        actor.xspeed *= -1;
      }
      // came from the right?
      else if (actor.prevX >= zone.x + zone.w) {
        actor.x = zone.x + zone.w;       // push out
        actor.xspeed *= -1;
      }
      // came from the top?
      else if (actor.prevY + actor.size <= zone.y) {
        actor.y = zone.y - actor.size;
        actor.yspeed *= -1;
      }
      // came from the bottom?
      else if (actor.prevY >= zone.y + zone.h) {
        actor.y = zone.y + zone.h;
        actor.yspeed *= -1;
      }
    }
  }
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
    
    // Loop to roll locations to randomize into
    let inZone = true;
    while(inZone)
    {
      inZone = false;
      for(let zone of colorZones)
      {
        // Treats our actors as a circle to make spawning more precise
        let hit = collideRectCircle(zone.x, zone.y, zone.w, zone.h, newX + 60/2, newY + 60/2, 60);

        // Rerolls the newX and newY if the spawn is invalid
        if(hit)
        {
          print("Not Valid");
          newX = random(0, width - 50);
          newY = random(0, height - 210);
          inZone = true;
          break; // break lets us reroll again
        }
      }
    }

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

