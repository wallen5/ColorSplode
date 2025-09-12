
var player;
var character;
var playerX = 375;
var playerY = 375;
let time = 0;
let r = 250;
let g = 0;
let b = 0;

let state = 0;
let startButton;


function preload(){
  character = loadImage("images/redpaintbucketgif.gif");
  myFont = loadFont('font/PressStart2P-Regular.ttf');
  bg = loadImage("images/background.png");


let chrSprite =[]; //array of character sprits
let ourCharacters = []; //array of character objects

// The mouse's 'grabbed' character
let grabbedCharacter; 
let backgroundImage;

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
    if (this.state === "FREE") {
      roamingMovement(this);
    } else if (this.state === "GRABBED") {
      grabbedMovement(this);
    }
  } 

  //makes sure the mouse is over the character
  isMouseOver() { 
    return mouseX > this.x && mouseX < this.x + this.size &&
           mouseY > this.y && mouseY < this.y + this.size;
    }
}



function preload(){
  chrSprite[0] = loadImage("images/redpaintbucket.png");
  chrSprite[1] = loadImage("images/bluepaintbucket.png");
  chrSprite[2] = loadImage("images/purplepaintbucket.png");
  chrSprite[3] = loadImage("images/greenpaintbucket.png");

}


function setup() {

  
  createCanvas(800, 800);

  character.resize(50, 50);

  //start button
  textFont(myFont);
  startButton = new Sprite(400, 450);
  startButton.text = "Play Game";
  startButton.width = 120;
  startButton.height = 50;
  startButton.color = "lightgreen";
  background(220);

  ourCharacters.push(new Actor(100, 100, chrSprite[0]));
  ourCharacters.push(new Actor(200, 200, chrSprite[1]));
  ourCharacters.push(new Actor(300, 300, chrSprite[2]));
  ourCharacters.push(new Actor(400, 400, chrSprite[3]));

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
    state = 1;
  }
}

function gameMenu(){
  background(220);
  for (let actor of ourCharacters) {
    actor.update();
    image(actor.sprite, actor.x, actor.y, actor.size, actor.size);
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

function keyReleased(){
  character.reset();
  character.pause();

function mousePressed() { 
  for (let actor of ourCharacters){
    if (actor.state === "FREE" && actor.isMouseOver()){
      actor.state = "GRABBED";
      grabbedCharacter = actor;
      break;
    }
  }

}

function mouseReleased() {
  if (grabbedCharacter.state === "GRABBED") {
    grabbedCharacter.state = "FREE";
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
  if (actor.x < 0 || actor.x > width - 50) actor.xspeed *= -1;
  if (actor.y < 0 || actor.y > height - 50) actor.yspeed *= -1;

}

function grabbedMovement(actor) {
  actor.x = mouseX - actor.size/2;
  actor.y = mouseY - actor.size/2;
}
