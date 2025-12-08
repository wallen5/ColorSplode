
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

let TESTS_RAN = false;

let levelNum = 1;
let randBoss = 1;
let level = new Level(levelNum, randBoss, healthAmount, healthAmount);

// These are used to update button position with window resizing
let buttonBaseX;
let buttonBaseY;

let zoneSprites = [];
chrSprite =[];
grabSprite =[];
deathSprite =[];

const canvasWidth = 800;
const canvasHeight = 800;

let gameOffsetX = 0;
let gameOffsetY = 0;
let currentColor = SOFTPALETTE[0]; // used in showMainMenu color cycling


const ITEM_SCORE_STEP = 5;       // gain an item every 8 points
let nextItemScoreThreshold = ITEM_SCORE_STEP;
let inventory = [];              // all items you’ve picked so far (if you want)
let currentItem = null;          // the item you can currently use
let pendingItemChoices = null;   // when non-null, the item choice UI is open

let ourPlayer = null;

let coinCount = 0;
 let grabbing = false;


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
  angleMode(RADIANS);
  myFont = loadFont('font/PressStart2P-Regular.ttf');
  bg = loadImage("images/menubackground.png");
  itemBG = loadImage("images/itembackground.png")
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

  zoneSprites[0] = loadImage("images/redzone.png");
  zoneSprites[1] = loadImage("images/bluezone.png");
  zoneSprites[2] = loadImage("images/purplezone.png");
  zoneSprites[3] = loadImage("images/greenzone.png");

  bomb = loadImage("images/Bomb.png");
  rougeBucketSprite = loadImage("images/susbucket.gif");
  catSprite = loadImage("images/catimage.gif");
  graffitiSprite = loadImage("images/Graffiti.png");
  coinSprite = loadImage("images/Coin.png");
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
  levelNum = 1;
  randBoss = random(2);
  level = new Level(levelNum, randBoss, healthAmount, healthAmount);
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
  if (level.player != null) ourPlayer = level.player;
}


const gameStates = {
  MAINMENU: () => showMainMenu(),
  CLASSIC: () => runClassicMode(),
  ROUGE: () => runRougeMode(),
  LEVELTRANS: () => showLevelTransition(),
  PERMITEMSCREEN: () => showPermItem()
};

// ,_______________
// | Entrypoint   |
// |______________|
function setup() {
  // canvas is full-page
  createCanvas(windowWidth, windowHeight);
  if (!TESTS_RAN) { //simple test flag
    runTests();
    TESTS_RAN = true;
  }
  // 800x800 paint layer for your game world
  paintLayer = createGraphics(canvasWidth, canvasHeight);
  paintLayer.background(levelBackground);

  textFont(myFont);

  // Start at the main menu
  currentState = "MAINMENU";

  ITEM_POOL = [
    new Item("MAGNET", magnet, "Pull buckets to the mouse"),
    new Item("FREEZE", freeze, "Freeze buckets in place"),
    new Item("TOTEM", totem, "Get an extra chance on gameover"),
    new Item("SCRAPER", scraper, "Sploding resets nearby timers"),
    new Item("BOMB", bomb, "Press 'b' to explode"),
    new Item("PALLET", selectivePallet, "Increase base combo score"),
    new Item("BRUSH", thickerBrush, "Increase combo multiplier")
  ];

  PERM_ITEMS = [
    new PermItem("WET PALETTE", selectivePallet, 1, "Increases\ninvincibility\nframes."),
    new PermItem("HEART", heart, 3, "Start with\nan extra\nheart."),
    new PermItem("ABRASIVE BRUSH", thickerBrush, 2, "Extra damage\nto bosses.")
  ];

  if (!ourPlayer) {
    if (level && level.player) {
      ourPlayer = level.player;
    } else {
      ourPlayer = new Player(healthAmount, healthAmount);
    }
  }

  updateGameOffsets();
  randBoss = random(2);
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

  buttonBaseX = windowWidth/2 - canvasWidth/2;
  buttonBaseY = windowHeight/2 - canvasHeight/2;

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

  if (keyCode === ESCAPE && currentState !== "MAINMENU" && currentState !== "LEVELTRANS") {
    // Don't allow pausing in the middle of an item choice
    if (!pendingItemChoices) {
      isPaused = !isPaused;
    }
    if(this.resumeButton) this.resumeButton.remove();
    if(this.quitButton) this.quitButton.remove();
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
      if(this.resumeButton) this.resumeButton.remove();
      if(this.quitButton) this.quitButton.remove();
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
        nextItemScoreThreshold += ITEM_SCORE_STEP + round(nextItemScoreThreshold/3);;
      }
      for(let b of this.choiceButtons)
      {
        b.remove();
      }
      this.choiceButtons = null;
    }
    return;
  }

  if(currentState === "LEVELTRANS") {
    if(key === '1' && level.difficulty < 3) {
      paintLayer = createGraphics(canvasWidth, canvasHeight);
      paintLayer.background(levelBackground);
      levelNum++;
      level = new Level(levelNum, randBoss, healthAmount, healthAmount)
      currentState = "ROUGE";
      if(music) music.stop();
      music = levelMusic;
      music.play();
      this.nextLevelButton.remove();
    }
  }
  if (currentState === "PERMITEMSCREEN") {
    if (key === ESCAPE) {
      reset();
    }
  }

  if (currentState === "MAINMENU") {
    if (key === '1') {
      currentState = "CLASSIC";
      if(music) music.stop();
      music = levelMusic;
      music.play();
      this.startButton.remove();
      this.rougeLikeButton.remove();
      this.permItemButton.remove();
      level = new Level(levelNum, null, 1, 1);
    }
    if (key === '2'){
      currentState = "ROUGE";
      if(music) music.stop();
      music = levelMusic;
      music.play();
      this.rougeLikeButton.remove();
      this.startButton.remove();
      this.permItemButton.remove();
    }

    if (key === '3'){
      currentState = "PERMITEMSCREEN";
      this.rougeLikeButton.remove();
      this.startButton.remove();
      this.permItemButton.remove();

    }

  }
  if(currentState !== "MAINMENU"){
    if(key === 'r'){

      reset();
      music.stop();
      music = menuMusic;
      music.play();
      if(this.restartButton) this.restartButton.remove();
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
    const padding = actor.width/4; // Feels better when slightly more forgiving
    if (
      gx >= (actor.x-padding) &&
      gx <= (actor.x + actor.width + padding) &&
      gy >= (actor.y-padding) &&
      gy <= (actor.y + actor.height + padding) &&
      !actor.sorted &&
      actor.alive
    ) {
      actor.grabbed = true;
      grabbing = true;
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
    grabbing = false;
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
  textSize(15);
  // Creates button if either: it doesn't exist OR it doesn't have a sprite
  // Kind of a mouth full, but in this way we make it so buttons functionality is completely separate
  // Note: you do NOT have to make a whole prototype function into the button. You can also just put "[function]"
  // without the () and have it work the exact same!
  if(!this.startButton || !this.startButton.sprite)
  {
    this.startButton = new Button(canvasWidth/2, canvasHeight/2 + 120, 500, 50, "lightgreen", "darkgreen", "Play Classic Mode - 1",
      () =>{
        currentState = "CLASSIC";
        if(music) music.stop();
        music = levelMusic;
        music.play();
        this.rougeLikeButton.remove();
        this.startButton.remove();
        this.permItemButton.remove();
        level = new Level(levelNum, null, 1, 1);
      }
    );
  }
  if(!this.rougeLikeButton || !this.rougeLikeButton.sprite)
  {
    this.rougeLikeButton = new Button(canvasWidth/2, canvasHeight/2 + 200, 500, 50, "red", "darkred", "Play Rougelike Mode - 2",
      () =>{
        currentState = "ROUGE";
        if(music) music.stop();
        music = levelMusic;
        music.play();
        this.rougeLikeButton.remove();
        this.startButton.remove();
        this.permItemButton.remove();
      }
    );
  }

  if(!this.permItemButton || !this.permItemButton.sprite)
  {
    this.permItemButton = new Button(canvasWidth/2, canvasHeight/2 + 280, 500, 50, "lightblue", "darkblue", "Buy Upgrades - 3",
      () =>{
        currentState = "PERMITEMSCREEN";
        this.rougeLikeButton.remove();
        this.startButton.remove();
        this.permItemButton.remove();
      }
    );
  }

  this.startButton.update();
  this.rougeLikeButton.update();
  this.permItemButton.update();
  //text("Press 1 for Classic Mode", canvasWidth/2, canvasHeight/2);
  //text("Press 2 for Rouge Mode", canvasWidth/2, canvasHeight/2 + 30);

}

function showPermItem() {
  push();

  image(itemBG, 0, 0, canvasWidth, canvasHeight);

  // Title
  textAlign(CENTER, TOP);
  textSize(28);
  fill(255);
  stroke(0);
  strokeWeight(3);
  text("Permanent Upgrades", canvasWidth/2, canvasHeight/9);

  // Use player's coins (fall back to 0 if ourPlayer null)
  const coinAmt = coinCount;

  // Coin display 
  textSize(18);
  stroke(255);
  fill(0);
  text(`Coins: ${coinAmt}`, canvasWidth/2, canvasHeight/7 + 10);

  // Layout parameters
  const startX = 35;
  const startY = 200;
  const cardW = 220;
  const cardH = 250;
  const spacingX = 40;
  imageMode(CORNER);
  textAlign(LEFT, TOP);
  textSize(14);

  // Create buy buttons array if not present
  if(!this.permBuyButtons) this.permBuyButtons = [];

  for (let i = 0; i < PERM_ITEMS.length; ++i) {
    const u = PERM_ITEMS[i];

    const x = startX + i * (cardW + spacingX);
    const y = startY;

    // card background
    push();
    stroke(0);
    strokeWeight(2);
    fill(60, 60, 60, 220);
    rect(x, y, cardW, cardH, 8);
    pop();

    // sprite (if available) centered near top of card
    if (u.sprite) {
      const imgW = 64, imgH = 64;
      imageMode(CENTER);
      image(u.sprite, x + cardW/2, y + 46, imgW, imgH);
      imageMode(CORNER);
    }

    // Name
    fill(255);
    noStroke();
    textSize(16);
    textAlign(CENTER, TOP);
    text(u.name, x + cardW/2, y + 90);

    // Cost and Bought tracker
    fill(255);
    textSize(14);
    textAlign(LEFT, TOP);
    text(`${u.description}`, x + 20, y + 90);
    text(`Bought: ${u.bought}`, x + 20, y + cardH * (3/4) + 4);
  


    // affordability indicator
    const affordable = coinAmt >= u.cost;
    if (!affordable) {
      fill(220, 100, 100);
      textSize(12);
      textAlign(RIGHT, TOP);
      text("Too expensive!!", x + cardW - 12, y + cardH + 12);
      textAlign(LEFT, TOP);
    }

    // Buy button (create if doesn't exist)
    if (this.permBuyButtons.length <= i || !this.permBuyButtons[i] || !this.permBuyButtons[i].sprite) {
      // create button and store it
      this.permBuyButtons[i] = new Button(x + cardW/2, y + cardH - 20, 160, 34,
        // choose a slightly different color when unaffordable so it's visually clear
        affordable ? "lightgreen" : "darkgray",
        affordable ? "darkgreen" : "gray",
        `Buy: $${u.cost}`,
        (() => {
          // closure to capture i
          const idx = i;
          return () => {
            const upgrade = PERM_ITEMS[idx];
            // ensure we reference the player's coins
            const playerCoins = coinCount;
            if (playerCoins >= upgrade.cost) {
              // deduct and increment bought on the player-level coin store
              coinCount -= upgrade.cost;
              upgrade.bought += 1;
              upgrade.applyUpgrade(ourPlayer);
            } else {
              console.log("Not enough coins to buy", upgrade.id);
            }
          };
        })()
      );
    }

    // Keep button positioned in case layout changes
    if (this.permBuyButtons[i]) {
      this.permBuyButtons[i].x = x + cardW/2;
      this.permBuyButtons[i].y = y + cardH - 20;
      // Update the button visual to reflect affordability each frame:
      // (If your Button class stores colors inside and doesn't respond to repeated constructor calls,
      //  we only set the position and call update() — color-change requires re-creation,
      //  so recreate when affordability changes.)
      const needsRecreate = (this.permBuyButtons[i].label !== undefined && this.permBuyButtons[i].label !== `Buy (${u.cost})`)
      // Defensive: ensure update called
      this.permBuyButtons[i].update();
    }
  } // end upgrades loop

  // Back button (to MAINMENU)
  if(!this.permBackButton || !this.permBackButton.sprite) {
    this.permBackButton = new Button(canvasWidth/2, canvasHeight - 60, 200, 44, "red", "darkred", "Back",
      () => {
        // remove all perm screen buttons and go back to main menu
        if(this.permBackButton) this.permBackButton.remove();
        if(this.permBuyButtons) {
          for(let b of this.permBuyButtons) if(b) b.remove();
          this.permBuyButtons = null;
        }
        currentState = "MAINMENU";
        // main menu buttons will be lazily recreated by showMainMenu()
      }
    );
  }
  // update back button
  this.permBackButton.update();

  pop();
}


// ,________________
// | Game Modes    |
// |_______________|

function runClassicMode() {

  if(!isPaused)
    createPauseButton();
  
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

    //random splats on screen
    generateAndDrawSplats();

    level.splodeActors();

    //draw game over!
    gameOverText();
    drawGameOverButton();
  }
  let comboColorIndex = level.currentColor; // make sure this is 0,1,2,3
  if (typeof comboColorIndex === 'number' && comboColorIndex >= 0 && comboColorIndex < SOFTPALETTE.length) {
    fill(SOFTPALETTE[comboColorIndex]); 
  } else {
    fill(255); // fallback
  }
  
  stroke(1);
  textAlign(CENTER);
  textSize(16);
  text(`Combo\n    ${ level.currentCombo}`, -200,114, 300);
  fill(255);
  text(`Score\n    ${ level.score}`, -200,64, 300);
  text(`Coins\n    ${ coinCount}`, -200,164, 300)

  if (ourPlayer) { ourPlayer.trackInv++; }
}

function runRougeMode(){

  if(!isPaused)
    createPauseButton();

  drawHeartIcons();
  drawInventoryHUD();

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

  drawExplosion(); // shows bomb explode gif when bomb dropped. Triggered by itemEffectBomb(level)

  let baseScoreAddition = 1
  let comboMult = 1.0;
  
  for(item of inventory){
    if (item.id === "MAGNET") {
      itemEffectMagnet(level);
    } else if (item.id === "FREEZE") {
      itemEffectFreeze(level);
    } else if (item.id === "TOTEM") {
      
    } else if (item.id === "BOMB" && (key === 'b' || key === 'B')) {
      itemEffectBomb(level); // used to activate drawExplosion()
      let index = inventory.indexOf(item);
      inventory.splice(index,1); // remove bomb after it is used
      break;
    } else if (item.id === "BRUSH")
    {
      baseScoreAddition += 1;
    } else if (item.id === "PALLET")
    {
      comboMult += 0.25
    }
  }
  level.player.baseScore = baseScoreAddition;
  level.player.comboMult = comboMult;
  

  // everything is updated when the level gets drawn
  level.draw();
  if(!isPaused){
    level.update();
  }

  if(level.score >= level.scoreThreshold){
    currentState = "LEVELTRANS";
  }

  if(level.gameOver){

    //random splats on screen
    generateAndDrawSplats();

    level.splodeActors();

    //draw game over!
    gameOverText();
    drawGameOverButton();
  }

  let comboColorIndex = level.currentColor; // make sure this is 0,1,2,3
  if (typeof comboColorIndex === 'number' && comboColorIndex >= 0 && comboColorIndex < SOFTPALETTE.length) {
    fill(SOFTPALETTE[comboColorIndex]); 
  } else {
    fill(255); // fallback
  }
  
  stroke(1);
  textAlign(CENTER);
  textSize(16);
  text(`Combo\n    ${ level.currentCombo}`, -200,114, 300);
  fill(255);
  text(`Score\n    ${ level.score}`, -200,64, 300);
  text(`Coins\n    ${ coinCount}`, -200,164, 300)

  if (ourPlayer) {
    ourPlayer.trackInv++;
  }

  console.log("Lives: " + ourPlayer.lives + "Max Lives: " + ourPlayer.maxLives + "Health Amt: " + healthAmount);
  console.log("InvincTimer: " + ourPlayer.invincTimer + ": " + invincAmt );

}

function showLevelTransition() {
  push();
  fill(128, 0, 0);
  rect(0, 0, canvasWidth, canvasHeight);

  if (level.fade < 255){level.fade += level.fadeSpeed;}
  if (level.slide < canvasWidth / 2){level.slide += level.slideSpeed}

  stroke(0);
  strokeWeight(4);
  textSize(30);
  fill(237, 204, 42);
  if(level.difficulty != 3){
    text("Level " + level.difficulty + " Complete", canvasWidth / 5, level.slide / 1.5);
    textSize(20);
    fill(255);
    if(!this.nextLevelButton || !this.nextLevelButton.sprite)
    {
      this.nextLevelButton = new Button(canvasWidth / 5, canvasHeight/2, 300, 50, "lightgreen", "darkgreen", "Continue - 1", 
        () =>{
          paintLayer = createGraphics(canvasWidth, canvasHeight);
          paintLayer.background(levelBackground);
          levelNum++;
          level = new Level(levelNum, randBoss, healthAmount, healthAmount)
          currentState = "ROUGE";
          if(music) music.stop();
          music = levelMusic;
          music.play();
          this.nextLevelButton.remove();
        }
      )  
    }
    this.nextLevelButton.x = level.slide
    this.nextLevelButton.update();
  } else {
    textSize(43);
    text("Victory!", canvasWidth / 3.5, level.slide);
  }
  pop();
}

function createPauseButton()
{
  if(!this.pauseButton || !this.pauseButton.sprite)
  {
    this.pauseButton = new Button(canvasWidth + 30, 25, 50, 50, "darkgray", "gray", "||", 
      () =>{
        if (!pendingItemChoices) {
          isPaused = !isPaused;
          this.pauseButton.remove();
        }
      }
    )
  }
  this.pauseButton.update();
}

function drawHeartIcons() {
  if (!ourPlayer) return;

  const heartSize = 32;          // width & height of each heart icon
  const spacing = 8;             // vertical space between hearts
  const startX = canvasWidth + 15; // same X as pause button
  const startY = 25 + 60;        // start Y below the pause button

  push();
  imageMode(CORNER);

  // Draw "empty" hearts first (gray for max lives)
  for (let i = 0; i < ourPlayer.maxLives; i++) {
    const y = startY + i * (heartSize + spacing);
    tint(100, 100, 100); // gray out
    image(heart, startX, y, heartSize, heartSize);
  }

  // Draw "full" hearts for current lives
  noTint();
  for (let i = 0; i < ourPlayer.lives; i++) {
    const y = startY + i * (heartSize + spacing);
    image(heart, startX, y, heartSize, heartSize);
  }

  pop();
}


function drawInventoryHUD() {
  if (!ourPlayer) return;

  // Change based on how many hearts we have
  const heartSize = 32;     // Size of each heart icon (same as in drawHeartsHUD)
  const heartSpacing = 8;   // Space between hearts
  const totalHeartsHeight = ourPlayer.maxLives * (heartSize + heartSpacing);

  const startX = canvasWidth + 15;           // X position for inventory display
  const startY = 100 + totalHeartsHeight;   // Y position below hearts
  const itemSize = 32;                      // Icon size
  const itemSpacing = 8;                    // Vertical spacing between items

  textAlign(LEFT, TOP);
  textSize(16);
  fill(255);

  for (let i = 0; i < inventory.length; i++) {
    const item = inventory[i];
    const yPos = startY + 20 + i * (itemSize + itemSpacing);

    // Draw the item's sprite
    if (item.sprite) {
      image(item.sprite, startX, yPos, itemSize, itemSize);
    }

    // Draw the item's name/ID next to the sprite
    text(item.id, startX + itemSize + 5, yPos + 5);
  }
}



function drawGameOverButton()
{
  level.splodeActors();
  this.pauseButton.remove();
  if(!this.restartButton || !this.restartButton.sprite)
  {
    this.restartButton = new Button(canvasWidth/2, canvasHeight/2, 150, 40, "lightgreen", "darkgreen", "Restart - r", 
      () =>{
        reset();
        music.stop();
        music = menuMusic;
        music.play();
        this.restartButton.remove();
      }
    )
  }
  this.restartButton.update();
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
  text("Choose an item!", canvasWidth / 2, canvasHeight / 2 - 150);

  const baseX = canvasWidth / 2;
  const baseY = canvasHeight / 2;
  const spacing = 220;

  imageMode(CENTER);
  textSize(16);
  if(!this.choiceButtons) this.choiceButtons = [];

  for (let i = 0; i < pendingItemChoices.length; ++i) {
    const item = pendingItemChoices[i];
    const x = baseX + (i - 1) * spacing;
    const y = baseY;

    // item card background
    fill(50, 50, 50, 220);
    rect(x - 80, y - 80, 160, 200, 10);

    // item icon
    if (item.sprite) {
      image(item.sprite, x, y - 20, 64, 64);
    }

    // item name
    fill(255);
    textSize(16);
    text(item.id, x, y + 20);  // below the icon

    // item description
    textSize(12);
    textAlign(CENTER);
    text(item.desc, x - 70, y + 60, 150);  // below the item name
    
    // create button if it doesn't exist
    if(this.choiceButtons.length < 3) {
      this.choiceButtons[i] = new Button(x, y + 120, 150, 40, "lightgreen", "darkgreen", `${i + 1}: Select`, 
        () => {
          const chosen = pendingItemChoices[i];
          setCurrentItem(chosen);
          pendingItemChoices = null;
          nextItemScoreThreshold += ITEM_SCORE_STEP + round(nextItemScoreThreshold/3);
          for(let b of this.choiceButtons) b.remove();
          this.choiceButtons = null;
        }
      );
    }
  }

  // update buttons each frame
  if(this.choiceButtons) {
    for(let b of this.choiceButtons)
      b.update();
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

  pop();

  if(!this.resumeButton || !this.resumeButton.sprite)
  {
    this.resumeButton = new Button(canvasWidth/2, canvasHeight/2 + 80, 170, 40, "lightgreen", "darkgreen", "Resume - ESC",
      () =>
      {
        isPaused = !isPaused;
        this.resumeButton.remove();
        this.quitButton.remove();
      }
    )
  }
  if(!this.quitButton || !this.quitButton.sprite)
  {
    this.quitButton = new Button(canvasWidth/2, canvasHeight/2 + 140, 170, 40, "red", "darkred", "Quit game - M",
      () =>
      {
        reset();
        if (music) music.stop();
        music = menuMusic;
        music.play();
        isPaused = false;
        this.resumeButton.remove();
        this.quitButton.remove();
      }
    )
  }
  this.resumeButton.update();
  this.quitButton.update();
}


function drawExplosion() {
  // Only run if timer is active
  if (bombTimer > 0) {
    push();
    imageMode(CENTER);
    image(explodeGif, canvasWidth / 2, canvasHeight / 2, 800, 800);
    pop();

    // Count down
    bombTimer--;
  }
}
