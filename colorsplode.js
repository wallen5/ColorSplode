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

}

function draw() {
  if(state == 0){ //start screen
    background("grey");

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

    
  } else if (state == 1){ //game screen
      background(220);
      playerMovement();
  }
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
}

function keyPressed(){
  character.play();
}

function playerMovement(){
  image(character, playerX, playerY);
  
  if(keyIsDown(87) == true){
    if(playerY - 5 >= 0){
      playerY -= 5;
    }
  }
  if(keyIsDown(65) == true){
    if(playerX - 5 >= 0){
      playerX -= 5;
    }
  }
  if(keyIsDown(68) == true){
    if(playerX + 5 <= 750){
      character.play();
      playerX += 5;
    }
  }
  if(keyIsDown(83) == true){
    if(playerY + 5 <= 750){
      character.play();
      playerY += 5;
    }
  }
}
