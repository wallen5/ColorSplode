//zone class
class Zone{
  constructor(x, y, w, h, color){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
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
  if (currentLevel && currentLevel.colorZones) {
    for (let z of currentLevel.colorZones){
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
  for (let z of currentLevel.colorZones){
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
  currentLevel.colorZones = [
    new Zone(zoneX, zoneY1, zoneWidth, zoneHeight, "red"),
    new Zone(zoneX, zoneY2, zoneWidth, zoneHeight, "blue"),
    new Zone(width - zoneWidth - zoneX, zoneY2, zoneWidth, zoneHeight, "purple"),
    new Zone(width - zoneWidth - zoneX, zoneY1, zoneWidth, zoneHeight, "green")
  ];
}

// Sets random X and Y for color zones for testing (Could expand on this if we want to implement this as a feature later on)
function randomizeZonePlacements()
{
  currentLevel.colorZones = colors.map(color => ({ 
  x: random(0, width - zoneWidth), 
  y: random(0, height - zoneHeight), 
  w: zoneWidth,
  h: zoneHeight,
  color: color
  }));
}
