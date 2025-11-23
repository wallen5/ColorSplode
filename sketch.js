
// ,_________
// | Global |
// |________|
const Color = { RED: 0, BLUE: 1, PURPLE: 2, GREEN: 3, GRAY: 3 };
const PALETTE = ["red", "blue", "purple", "green", "gray"];
const SOFTPALETTE = [
  "#ffb3b3", // pastel red
  "#b3c6ff", // pastel blue
  "#d6b3ff", // pastel purple
  "#b3ffb3", // pastel green
  "#d9d9d9"  // pastel gray
];

let currentState;
let isPaused = false;
let music; 
let paintLayer;
let level = new Level(1, 5, 1, 1);

chrSprite =[];
grabSprite =[];
deathSprite =[];

const canvasWidth = 800;
const canvasHeight = 800;

let gameOffsetX = 0;
let gameOffsetY = 0;
let currentColor = SOFTPALETTE[0]; // used in showMainMenu color cycling


const ITEM_SCORE_STEP = 5;       // gain an item every 5 points
let nextItemScoreThreshold = ITEM_SCORE_STEP;
let inventory = [];              // all items you’ve picked so far (if you want)
let currentItem = null;          // the item you can currently use
let pendingItemChoices = null;   // when non-null, the item choice UI is open

// ,_________
// | Helper |
// |________|
function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw &&
         ax + aw > bx &&
         ay < by + bh &&
         ay + ah > by;
}

// helper to update offsets so the game screen is centered
function updateGameOffsets() {
  gameOffsetX = (width  - canvasWidth)  * 0.5;
  gameOffsetY = (height - canvasHeight) * 0.5;
}

// convert screen mouse to game-space mouse
function getGameMouse() {
  return {
    x: mouseX - gameOffsetX,
    y: mouseY - gameOffsetY
  };
}

// check if the mouse is over the 800x800 game area at all
function mouseInGameArea() {
  return (
    mouseX >= gameOffsetX &&
    mouseX <= gameOffsetX + canvasWidth &&
    mouseY >= gameOffsetY &&
    mouseY <= gameOffsetY + canvasHeight
  );
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateGameOffsets();
}


// ,__________
// | Preload |
// |_________|
function preload(){
  myFont = loadFont('font/PressStart2P-Regular.ttf');
  bg = loadImage("images/menubackground.png");
  gameOverBG = loadImage("images/gameoverbackground.png");
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
  levelBackground = loadImage("images/levelBackground.png");

  garnetIdle = loadImage("images/GrimjackIdle.gif");
  garnetSpec = loadImage("images/Grimjack Gunfire.gif");
  carmineIdle = loadImage("images/CarmineQueenIdle.gif");
  carmineSpec = loadImage("images/CarmineQueenSpecial.gif");

  menuMusic = loadSound('sounds/menu_music.mp3');
  levelMusic = loadSound('sounds/level_music.mp3');
  pauseSound = loadSound('sounds/pause.wav');
  bombSound = loadSound('sounds/nuclear-explosion.mp3');
  pickup = loadSound('sounds/pickup.wav');
}

// ,__________
// | State   |
// |_________|
function reset() {
  currentState = "MAINMENU";
  level = null;
  level = new Level(1, 5, 1, 1);
  level.initLevel = false;
  level.mode = "NONE";
  paintLayer = createGraphics(canvasWidth, canvasHeight);
  paintLayer.background(levelBackground);
  ventTop = loadImage("images/ventTopUpdate.gif");
  ventBottom = loadImage("images/ventBottomUpdate.gif");
  ventLeft = loadImage("images/ventLeftUpdate.gif");
  ventRight = loadImage("images/ventRightUpdate.gif");
  // reset item system
  inventory = [];
  currentItem = null;
  pendingItemChoices = null;
  nextItemScoreThreshold = ITEM_SCORE_STEP;
}


const gameStates = {
  MAINMENU: () => showMainMenu(),
  CLASSIC: () => runClassicMode(),
  ROUGE: () => runRougeMode(),
  LEVELTRANS: () => showLevelTransition()
};

// ,_______________
// | Entrypoint   |
// |______________|
function setup() {
  // canvas is full-page
  createCanvas(windowWidth, windowHeight);

  // 800x800 paint layer for your game world
  paintLayer = createGraphics(canvasWidth, canvasHeight);
  paintLayer.background(levelBackground);

  textFont(myFont);

  // Start at the main menu
  currentState = "MAINMENU";

  ITEM_POOL = [
    new Item("MAGNET", magnet),
    new Item("FREEZE", freeze),
    new Item("TOTEM", totem)
  ];

  updateGameOffsets();
}
// ,_______________
// | Main loop    |
// |______________|
function draw() {
  clear();
  // full-page background
  background(220);

  // keep offsets up-to-date (in case window was resized)
  updateGameOffsets();

  // draw the game centered
  push();
  translate(gameOffsetX, gameOffsetY);

  // optional: draw a border/backdrop for the game area
  push();
  noStroke();
  fill(255);
  rect(0, 0, canvasWidth, canvasHeight);
  pop();

  // everything inside here is in "game space" (0..800)
  if (gameStates[currentState]) {
    gameStates[currentState]();
  }

  pop(); // back to full-page coordinates

  // pause overlay covers the whole page
  if (isPaused && (currentState === "CLASSIC" || currentState === "ROUGE")) {
    drawPauseOverlay();
  }
}



// ,______________________
// | Keyboard controlled |
// | state.              |
// |_____________________|
function keyPressed() {

  if (keyCode === ESCAPE && currentState !== "MAINMENU") {
    // Don't allow pausing in the middle of an item choice
    if (!pendingItemChoices) {
      isPaused = !isPaused;
    }
    return;
  }

  // While paused: only respond to M (main menu)
  if (isPaused) {
    if (key === 'm' || key === 'M') {
      reset();
      if (music) music.stop();
      music = menuMusic;
      music.play();
      //currentState = "MAINMENU";
      isPaused = false;
    }
    return;
  }

  if (currentState === "ROUGE" && pendingItemChoices) {
    if (key === '1' || key === '2' || key === '3') {
      const idx = int(key) - 1;
      if (idx >= 0 && idx < pendingItemChoices.length) {
        const chosen = pendingItemChoices[idx];
        setCurrentItem(chosen);
        pendingItemChoices = null;
        nextItemScoreThreshold += ITEM_SCORE_STEP;
      }
    }
    return;
  }

  if (currentState === "ROUGE");

  if(currentState === "LEVELTRANS") {
    if(key === '1') {
      currentState = "ROUGE";

    }
  }

  if (currentState === "MAINMENU") {
    if (key === '1') {
      currentState = "CLASSIC";
      if(music) music.stop();
      music = levelMusic;
      music.play();
    }
    if (key === '2'){
      currentState = "ROUGE";
      if(music) music.stop();
      music = levelMusic;
      music.play();
    }

  }
  if(currentState !== "MAINMENU"){
    if(key === 'r'){

      reset();
      music.stop();
      music = menuMusic;
      music.play();
      //currentState = "MAINMENU";
    }
  }
}
// ,_________
// | Mouse  |
// |________|
function mousePressed() {
  console.log("Mouse pressed!", mouseX, mouseY);
  if (isPaused) return;

  const { x: gx, y: gy } = getGameMouse();


  for (let actor of level.allActors) {
    if (
      gx >= actor.x &&
      gx <= actor.x + actor.width &&
      gy >= actor.y &&
      gy <= actor.y + actor.height &&
      !actor.sorted &&
      actor.alive
    ) {
      actor.grabbed = true;
      actor.splode();
      pickup.play();
    }
  }
}

function mouseReleased() {
  for (let actor of level.allActors) {
    if(actor.grabbed)
    {
      actor.dropInZone(level)
    }
    actor.grabbed = false;
  }
}

// ,________________
// | Main Menu     |
// |_______________|

let lastSecond = -1;

function showMainMenu() {
  image(bg, 0, 0, canvasWidth, canvasHeight)
  fill(255);
  stroke(0);
  strokeWeight(4);
  textAlign(CENTER, CENTER);
  textSize(32);
  push();
  let s = second();
  if (s !== lastSecond) {
    lastSecond = s;
    currentColor = random(SOFTPALETTE);
  }
  fill(currentColor);
  text("ColorSplode", canvasWidth/2, canvasHeight/2 - 50);
  pop();
  textSize(20);
  text("Press 1 for Classic Mode", canvasWidth/2, canvasHeight/2);
  text("Press 2 for Rouge Mode", canvasWidth/2, canvasHeight/2 + 30);

}

// ,________________
// | Game Modes    |
// |_______________|

function runClassicMode() {

  if(!level.initLevel){
    level.mode = "CLASSIC";
    level.setup();
  }

  image(paintLayer, 0,0,canvasWidth,canvasHeight);

  // everything is updated when the level gets drawn
  level.draw();
  if(!isPaused){
    level.update();
  }
  
  if(level.gameOver){
    level.splodeActors();
    text("Game Over!",  width/2, height/2 - 60)
    text(`Final score: ${level.score}`, width/2, height/2 - 30);
    text("Press R to restart", width/2, height/2)
  }

  text(`Score: ${level.score}`, 100,210, 25);
  text(`Combo: ${level.currentCombo}`, 100,250, 25);

}

function runRougeMode(){

  if(!level.initLevel){
    level.mode = "ROUGE";
    level.setup();
  }

  image(paintLayer, 0,0,canvasWidth,canvasHeight);

  if (!level.gameOver &&
      !pendingItemChoices &&
      level.score >= nextItemScoreThreshold) {
    openItemChoiceScreen();
  }

  // if we are in the middle of an item choice, draw its UI
  if (pendingItemChoices) {
    drawItemChoiceUI();
    return;
  }

  for(item of inventory){
    if (item.id === "MAGNET") {
      itemEffectMagnet(level);
    } else if (item.id === "FREEZE") {
      itemEffectFreeze(level);
    } else if (item.id === "TOTEM") {
      
    }
  }

  // everything is updated when the level gets drawn
  level.draw();
  if(!isPaused){
    level.update();
  }

  if(level.gameOver){
    level.splodeActors();
    text("Game Over!",  width/2, height/2 - 60)
    text(`Final score: ${level.score}`, width/2, height/2 - 30);
    text("Press R to restart", width/2, height/2)
  }

  text(`Score: ${level.score}`, 100,210, 25);
  text(`Combo: ${level.currentCombo}`, 100,250, 25);
  
}

function openItemChoiceScreen() {
  // pick up to 3 random distinct items from ITEM_POOL
  let pool = ITEM_POOL.slice(); // copy
  pendingItemChoices = [];

  for (let i = 0; i < 3 && pool.length > 0; ++i) {
    const idx = floor(random(pool.length));
    pendingItemChoices.push(pool.splice(idx, 1)[0]);
  }
}

function drawItemChoiceUI() {
  if (!pendingItemChoices) return;

  push();

  // dark overlay for the 800x800 game screen
  noStroke();
  fill(0, 180);
  rect(0, 0, canvasWidth, canvasHeight);

  textAlign(CENTER, CENTER);
  fill(255);
  textSize(24);
  text("Choose an item! (1-3)", canvasWidth / 2, canvasHeight / 2 - 150);

  const baseX = canvasWidth / 2;
  const baseY = canvasHeight / 2;
  const spacing = 220;

  imageMode(CENTER);
  textSize(16);

  for (let i = 0; i < pendingItemChoices.length; ++i) {
    const item = pendingItemChoices[i];
    const x = baseX + (i - 1) * spacing;
    const y = baseY;

    // item card background
    fill(50, 50, 50, 220);
    rect(x - 80, y - 80, 160, 160, 10);

    // item icon
    if (item.sprite) {
      image(item.sprite, x, y - 20, 64, 64);
    }

    // label
    fill(255);
    text(`${i + 1}: ${item.id}`, x, y + 50);
  }

  pop();
}


// optional: small helper to set the currently active item
function setCurrentItem(item) {
  currentItem = item;
  inventory.push(item); // store in inventory if you want to show later
}

function drawPauseOverlay() {
  push();
  noStroke();
  fill(0, 150);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);
  fill(255);
  textSize(28);
  text("Paused", width / 2, height / 2 - 40);

  textSize(16);
  text("ESC - Resume\nM - Main Menu", width / 2, height / 2 + 10);
  pop();
}
