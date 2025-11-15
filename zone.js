//Class for objects on screen
class screenObject {
  constructor(x, y, w, h, active = false){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.active = active;
  }
}

//vent subclass
class Vent extends screenObject{
  constructor(x, y, w, h, wall, active = false, sprite = null){
    super(x, y, w, h, active);
    this.sprite = sprite;
    this.timer = 50;
    this.timeToSpawn = 100;
    this.rate = 1;
    this.activeActors = 0;
    this.wall = wall;
  }
}

//zone subclass
class Zone extends screenObject{
  constructor(x, y, w, h, color, active = true){
    super(x, y, w, h, active);
    this.color = color;
  }
}


// color zones
const colors = ["red","blue","purple","green"];

// draw colored drop zones
function drawColorZones(){
  push();
  stroke(0);
  strokeWeight(3);
  textAlign(CENTER, CENTER);
  textSize(14);
  if (levelSet[currentLevel] && levelSet[currentLevel].colorZones) {
    for (let z of levelSet[currentLevel].colorZones){
      fill(zoneFill(z.color));
      rect(z.x, z.y, z.w, z.h);
      fill(0);
      }
  }
  pop();
}

function zoneUnderActor(actor){ 

  const centerX = actor.x + actor.size/2;
  const centerY = actor.y + actor.size/2;
  for (let z of levelSet[currentLevel].colorZones){
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

//zone vars -- temp until zones are randomized
let zoneX = 50, zoneY1 = 100, zoneY2 = 620, zoneWidth = 150, zoneHeight = 150, gap = 20;


// create 4 drop zones along the bottom
function makeColorZones() {
  levelSet[currentLevel].colorZones = [
        new Zone(50 + gameX, 100 + gameY, 150 * gs, 150 * gs, "blue"),
        new Zone(50 + gameX, gameLayer.height - (200 * gs) + gameY, 150 * gs, 150 * gs, "green"),
        new Zone(gameLayer.width - (200 * gs) + gameX, gameLayer.height - (200 * gs) + gameY, 150 * gs, 150 * gs, "red"),
        new Zone(gameLayer.width - (200 * gs) + gameX, 100 + gameY, 150 * gs, 150 * gs, "purple")
        ];
}

// Sets random X and Y for color zones for testing (Could expand on this if we want to implement this as a feature later on)
function randomizeZonePlacements()
{
  levelSet[currentLevel].colorZones = colors.map(color => new Zone({ 
  x: random(0, gameLayer.width - zoneWidth), 
  y: random(0, gameLayer.height - zoneHeight), 
  w: zoneWidth,
  h: zoneHeight,
  color: color
  }));
}

// Vents

let spawnLogic = new Vent;
let vents = [];
const wall = ["left","right","top","bottom"];



// For now coords are set, could randomize later
function makeVents(){
  let zoneMap = floor(random(0, 3));
  levelSet[currentLevel].zoneMap = zoneMap;

  //console.log("makeVents: " + zoneMap);
  if (zoneMap === 0){ //corner zones
    console.log("map = corners");
    vents = [
        new Vent((-50 * gs), (350 * gs), 100 * gs, 75 * gs, "left", false, ventLeft),
        new Vent((350 * gs), (650 * gs), 75 * gs, 100 * gs, "bottom", false, ventBottom),
        new Vent(gameLayer.width - (150 * gs), (350 * gs), 100 * gs, 75 * gs, "right", false, ventRight),
        new Vent((350 * gs), (-50 * gs), 75 * gs, 100 * gs, "top", false, ventTop)
      ];
  } else if (zoneMap === 1){ // middle ends
    //console.log("map = middle");
    vents = [
      new Vent((-50 * gs), (150 * gs), 100 * gs, 75 * gs, "left", false, ventLeft),
      new Vent((-50 * gs), (600 * gs), 100 * gs, 75 * gs, "left", false, ventLeft),
      new Vent((300 * gs), (-50 * gs), 75 * gs, 100 * gs, "top", false, ventTop),
      new Vent((350 * gs), (650 * gs), 75 * gs, 100 * gs, "bottom", false, ventBottom),
      new Vent(gameLayer.width - (150 * gs), (150 * gs), 100 * gs, 75 * gs, "right", false, ventRight),
      new Vent(gameLayer.width - (150 * gs), (600 * gs), 100 * gs, 75 * gs, "right", false, ventRight)
    ];
  } else if (zoneMap === 2){ //bottom
    //console.log("map = bottom");
    vents = [
      new Vent((-50 * gs), (150 * gs), 100 * gs, 75 * gs, "left", false, ventLeft),
      new Vent(gameLayer.width - (150 * gs), (150 * gs), 100 * gs, 75 * gs, "right", false, ventRight),
      new Vent((275 * gs), (-50 * gs), 75 * gs, 100 * gs, "top", false, ventTop), 
      new Vent((375 * gs), (-50 * gs), 75 * gs, 100 * gs, "top", false, ventTop)
    ];
  }
}

// Draw the vents if active with correct sprite
function drawVents() {
  for (let vent of vents) {
    let spriteToDraw;
    if (vent.wall === "left") spriteToDraw = vent.sprite;
    else if (vent.wall === "right") spriteToDraw = vent.sprite;
    else if (vent.wall === "top") spriteToDraw = vent.sprite;
    else if (vent.wall === "bottom") spriteToDraw = vent.sprite;
    if (vent.active == true){
      let drawX = vent.x + vent.w/2 + (typeof gameX !== 'undefined' ? gameX : 0);
      let drawY = vent.y + vent.h/2 + (typeof gameY !== 'undefined' ? gameY : 0);
      image(vent.sprite, drawX, drawY, vent.w, vent.h);
    }
  }
}

// Sets a random inactive vent to active
function activateRandomVent(){
  let inactiveVents = vents.filter(vent => !vent.active);
  if (inactiveVents.length === 0) return;

  let randomVent = random(inactiveVents);
  randomVent.active = true;
}

function switchVent(vent){
  if(!vent.active){
    vent.active = true;
  } else if(vent.active){
    vent.active = false;
  }
}

// Closes every vent and resets gif, could change to selected vent later for items
function closeAllVents(){
  for (let vent of vents) {
    vent.active = false;
    vent.sprite.reset();
  }
}
