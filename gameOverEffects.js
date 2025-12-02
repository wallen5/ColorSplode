function generateRandomSplat(){
  let splatImages = [splat1, splat2, splat3, splat4, splat5, splat6, splatD];
  let randSplat = random(splatImages);
  let randColorIdx = int(random(0, 4));

  // Math logic
  let x = random(1200);
  let y = random(1000);
  let sizeMult = random(40, 80);
  let w = 20 * sizeMult;
  let h = 20 * sizeMult;

  // object to be pushed into activeSplats
  let newSplat = {
    img: randSplat,
    x: x,
    y: y,
    w: w,
    h: h,
    cIdx: randColorIdx
  };

  // will be used to displays the splats in drawActiveSplats()
  level.activeSplats.push(newSplat);
}

function drawActiveSplats() {
  let initialDelay = 1000; // Wait 1 second before drawing splats
  let interval = 100;     // New splat every 0.5 seconds
  
  let timeSinceGameOver = millis() - level.gameOverTime;

  // cannot draw until 1 second has passed
  if (timeSinceGameOver < initialDelay) return;

  // time that has passed after game has ended, minus the delay
  let timeInSequence = timeSinceGameOver - initialDelay;

  //number of visible splats
  let visibleCount = floor(timeInSequence / interval) + 1;

  let limit = min(visibleCount, level.activeSplats.length);

  noSmooth();
  imageMode(CENTER);

  for (let i = 0; i < limit; i++) {
    let s = level.activeSplats[i]; 
    
    switch(s.cIdx) {
        case 0: tint(255, 0, 0); break;   
        case 1: tint(0, 0, 255); break;   
        case 2: tint(0, 255, 0); break;   
        case 3: tint(150, 0, 255); break; 
      }

    
    image(s.img, s.x, s.y, s.w, s.h);
  }
  
  //clean up
  noTint(); 
  smooth();
  imageMode(CORNER);
}

function generateAndDrawSplats(){
  // draw paint splats on game over
    if(level.splatsTriggered){  
      for (let i = 0; i < 8; ++i) {
        generateRandomSplat(); //gernate splats, does not draw
      }
      level.gameOverTime = millis(); //used in drawActiveSplats()
    }
    level.splatsTriggered = false;
    drawActiveSplats();
}

function gameOverText(){
  let s = second();
  if (s !== lastSecond) {
    lastSecond = s;
    currentColor = random(SOFTPALETTE);
  }

  stroke(0);
  strokeWeight(4);
  fill(currentColor);
  textSize(20);
  text("Game Over!",  canvasWidth/2 - 70, canvasHeight/2 - 70);

  text(`Final score: ${level.score}`, canvasWidth/2 - 120, height/2 - 90);

  //reset to normal values
  textSize(12);
  fill("black");
  strokeWeight(0);
}