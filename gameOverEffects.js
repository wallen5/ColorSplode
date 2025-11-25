function generateRandomSplat(){
  let splatImages = [splat1, splat2, splat3, splat4, splat5, splat6, splatD];
  let randSplat = random(splatImages);
  let randColorIdx = int(random(0, 4));

  // Math logic
  let x = random(1200);
  let y = random(1000);
  let sizeMult = random(40, 80);
  //if (20 >= 15) sizeMult = 20;
  let w = 20 * sizeMult;
  let h = 20 * sizeMult;

  // Create a plain Javascript Object (like a C++ struct)
  let newSplat = {
    img: randSplat,
    x: x,
    y: y,
    w: w,
    h: h,
    cIdx: randColorIdx
  };

  // Save it to the array
  level.activeSplats.push(newSplat);
}

function drawActiveSplats() {
  let initialDelay = 1000; // Wait 1 second before starting
  let interval = 100;     // New splat every 0.5 seconds
  
  // Calculate how much time has passed since the "Game Over" moment
  let timeSinceGameOver = millis() - level.gameOverTime;

  // If we haven't reached the initial delay, draw nothing and exit
  if (timeSinceGameOver < initialDelay) return;

  // Calculate the time inside the "Sequence"
  let timeInSequence = timeSinceGameOver - initialDelay;

  // Math: Time / Interval = How many should be on screen
  // e.g., 1500ms / 500ms = 3 splats
  let visibleCount = floor(timeInSequence / interval) + 1;

  // Don't try to draw more than we actually have!
  let limit = min(visibleCount, level.activeSplats.length);

  noSmooth();
  imageMode(CENTER);

  // LOOP only up to 'limit', not the full length
  for (let i = 0; i < limit; i++) {
    let s = level.activeSplats[i]; 
    
    switch(s.cIdx) {
        case 0: tint(255, 0, 0); break;   // red
        case 1: tint(0, 0, 255); break;   // blue
        case 2: tint(0, 255, 0); break;   // green
        case 3: tint(150, 0, 255); break; // purple
      }

    
    image(s.img, s.x, s.y, s.w, s.h);
  }
  
  noTint(); 
  smooth();
  imageMode(CORNER);// ... cleanup ...
}

function generateAndDrawSplats(){
  // draw paint splats on game over
    if(level.splatsTriggered){  
      for (let i = 0; i < 8; ++i) {
        generateRandomSplat(); //gernate splats, does not draw
      }
      level.gameOverTime = millis();
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

  text(`Final score: ${level.score}`, canvasWidth/2 - 120, height/2 - 30);
  text("Press R to restart", canvasWidth/2 - 155, height/2)

  //reset to normal values
  textSize(12);
  fill("black");
  strokeWeight(0);
}