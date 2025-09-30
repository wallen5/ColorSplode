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

function zoneUnderActor(actor){

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

// create 4 drop zones along the bottom
function makeColorZones()
{
  colorZones = [
    { x: zoneX, y: zoneY1, w: zoneWidth, h: zoneHeight, color: "red"    },
    { x: zoneX, y: zoneY2, w: zoneWidth, h: zoneHeight, color: "blue"   },
    { x: width - zoneWidth - zoneX, y: zoneY2, w: zoneWidth, h: zoneHeight, color: "purple" },
    { x: width - zoneWidth - zoneX, y: zoneY1, w: zoneWidth, h: zoneHeight, color: "green"  },
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
