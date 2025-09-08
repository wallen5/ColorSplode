var player;
var character;
var playerX = 375;
var playerY = 375;


function preload(){
  character = loadImage("images/redpaintbucketgif.gif");
}

function setup() {
  createCanvas(800, 800);
  character.resize(50, 50);
}

function draw() {
  background(220);
  playerMovement();
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
