class screenObject {
  constructor(){
    this.timer = 50;
    this.timeToSpawn = 100;
    this.rate = 1;
    this.activeActors = 0;
  }
}

class Vent extends screenObject{
  constructor(){
  }
}

class Zone extends screenObject{
  constructor(){
  }
}


let spawnLogic = new screenObject;

// A Class of Our Actors/Characters
class Actor {
  constructor(x, y, sprite) {
    this.x = x;
    this.y = y;
    this.prevX = x; // Needed for "bouncing" collision detection
    this.prevY = y;
    this.size = 50;
    this.sprite = sprite;
    this.xspeed = random(-2,2);
    this.yspeed = random(-2,2);
    
    this.timer = 14.0;           // measured in seconds
    this.timerStart = millis();  // when the timer started
    this.timeAlive = 0.0;        // Tracks how long the actor has been alive while the game is UNPAUSED

    this.shakeThreshold = 3.0;   // how many seconds left to shake
    this.angle = 0;              // current rotation angle
    this.rotationSpeed = 80.0;  // how fast it rotates per frame
    this.rotationDirection = 1;  // 1 = clockwise, -1 = counter-clockwise
    this.rotationMax = 360;      // seems like a lot, but looks good (?)

    // state is currently a string. This is weird and bad. Fix l8r!
    this.state = "FREE";

    // actor particle array
    this.particles = [];
  }

  setState(newState) {
    this.state = newState;
  }

  // Update the position of the character
  update() {
    if(!gamePaused){ // If the game ISN'T Paused then we update their movement
      if (this.state === "FREE") {
        checkTimer(this);
        roamingMovement(this);
      } else if (this.state === "GRABBED") {
        checkTimer(this);
        grabbedMovement(this);
      } else if (this.state === "SNAPPED") {
        // Do nothing; actor is in a zone
      }
    }
  }
  
  draw(){
    push();
    translate(this.x + this.size/2, this.y + this.size/2); // move to center
    rotate(radians(this.angle)); // use actor.angle
    imageMode(CENTER);
    image(this.sprite, 0, 0, this.size, this.size);
    pop();

    // Draw the particles around the actor
    for (let i = this.particles.length-1; i >= 0; i--) {
      let p = this.particles[i];
      fill(p.color);
      noStroke();
      circle(p.x, p.y, p.size);
      p.x += p.vx;
      p.y += p.vy;

      // Fade and remove after set time is up
      if (millis() - p.born > 1500) {
        this.particles.splice(i,1);
      }
    }
  }

  //makes sure the mouse is over the character
  isMouseOver() { 
    return mouseX > this.x && mouseX < this.x + this.size &&
           mouseY > this.y && mouseY < this.y + this.size;
    }

  splode() {
    let numParticles = 5;
    let lifetime = 250; // ms

    for (let i = 0; i < numParticles; i++) {
      
      let vx = random(-10, 10);
      let vy = random(-10, 10);

      let p = {
        x: this.x + this.size/2,
        y: this.y + this.size/2,
        vx: vx,
        vy: vy,
        size: 8,
        born: millis(),
        color: this.sprite === chrSprite[0] ? color(255,0,0) :
              this.sprite === chrSprite[1] ? color(0,0,255) :
              this.sprite === chrSprite[2] ? color(160,0,255) :
              this.sprite === chrSprite[3] ? color(0,200,0) : color(255)
      };

      // push particle into a actor array
      this.particles.push(p);
    }
  }

}

//SPAWN LOGIC
// used for actor spawning

function spawnActor(){
  let rate = spawnLogic.timeToSpawn/spawnLogic.rate;
  const MAXACTORS = 10;

  if(spawnLogic.timer == Math.round(rate) && !gamePaused && spawnLogic.activeActors <= MAXACTORS){
    // position
    let newX = random(zoneX + 1, width - zoneX - 61);
    let newY = random(zoneY1 + 1, height - (height - zoneY2) - 61);
    
    // Loop to roll locations to randomize into
    let inZone = true;
    while(inZone)
    {
      inZone = false;
      for(let zone of colorZones)
      {
        // Treats our actors as a circle to make spawning more precise
        let hit = collideRectCircle(zone.x, zone.y, zone.w, zone.h, newX + 60/2, newY + 60/2, 60);

        // Rerolls the newX and newY if the spawn is invalid
        if(hit)
        {
          newX = random(zoneX + 1, width - zoneX - 61);
          newY = random(zoneY1 + 1, height - (height - (zoneY2 + zoneHeight)) - 61);
          inZone = true;
          break; // break lets us reroll again
        }
      }
    }

    // random sprite
    let randomSprite = random(chrSprite);
    
    // Creates new actor. adds it to the array
    ourCharacters.push(new Actor(newX, newY, randomSprite));

    ++spawnLogic.activeActors;
  }

}

function spawnRate(){
                  //needs to be whole number
  let rate = spawnLogic.timeToSpawn/spawnLogic.rate;

  if(spawnLogic.timer == Math.round(rate)){
    spawnLogic.timer = 0;

    //spawn rate starts to slow down.
    if (spawnLogic.rate < 2){
      spawnLogic.rate += 0.05; 
    } else {
      spawnLogic.rate += 0.0125;
    }
  }

  ++spawnLogic.timer;
}

//random character movement
function roamingMovement(actor) {
  if (frameCount % 120 === 0) {
    //random x and y speeds 
    actor.xspeed = random(-2, 2);
    actor.yspeed = random(-2, 2);
  }

  
  actor.prevX = actor.x;
  actor.prevY = actor.y
  actor.x += actor.xspeed;
  actor.y += actor.yspeed;

  //make sure characters don't go off screen
  if (actor.x < zoneX || actor.x > width - actor.size - zoneX) actor.xspeed *= -1;
  if (actor.y < zoneY1 || actor.y > height - actor.size - (height - (zoneY2 + zoneHeight))) actor.yspeed *= -1;

  checkActorCollision(actor)
}

function checkActorCollision(actor)
{
  for(let zone of colorZones)
  {
    // Collision works as follows: check the top left corner of rect 1, and top left corner of rect 2
    // Because our buckets are a square, you simply use actor.size for both the width and height
    hit = collideRectRect(zone.x, zone.y, zone.w, zone.h, actor.x, actor.y, actor.size, actor.size);
    if(hit)
    {
      // came from the left?
      if (actor.prevX + actor.size <= zone.x) {
        actor.x = zone.x - actor.size;   // push out
        actor.xspeed *= -1;
      }
      // came from the right?
      else if (actor.prevX >= zone.x + zone.w) {
        actor.x = zone.x + zone.w;       // push out
        actor.xspeed *= -1;
      }
      // came from the top?
      else if (actor.prevY + actor.size <= zone.y) {
        actor.y = zone.y - actor.size;
        actor.yspeed *= -1;
      }
      // came from the bottom?
      else if (actor.prevY >= zone.y + zone.h) {
        actor.y = zone.y + zone.h;
        actor.yspeed *= -1;
      }
    }
  }
}

function grabbedMovement(actor) {
  actor.x = constrain(mouseX - actor.size/2, zoneX, width - actor.size - zoneX);
  actor.y = constrain(mouseY - actor.size/2, zoneY1, height - actor.size - (height - (zoneY2 + zoneHeight)));
}

// Checks the actors timer
function checkTimer(actor) {
  
  actor.timeAlive += deltaTime / 1000.0; // Increments the timeAlive timer

  let remaining = max(actor.timer - actor.timeAlive, 0);
  let t = remaining / actor.timer; // goes 1 to 0 over time


  if (remaining <= 0) {
    onTimerFinished(actor);
    return;
  }
  
  if (remaining <= actor.shakeThreshold) {
  let speedMultiplier = 1 / (t + 0.05);  // tweak 0.1 to control max speed
  speedMultiplier = constrain(speedMultiplier, 0, 7);  // never shake faster than 7x normal
  actor.angle += actor.rotationSpeed * speedMultiplier * actor.rotationDirection;    
    

  let flipThreshold = actor.rotationMax * (1 + (1 - t) * 2);  
  if (abs(actor.angle) > flipThreshold) {
    actor.rotationDirection *= -1.0;
    actor.angle = constrain(actor.angle, -flipThreshold, flipThreshold);
    }
  }
}

// Called when timer finishes
function onTimerFinished(actor) {
  console.log("Timer finished for actor!");
  
  mouseReleased();

  if (actor.state === "SNAPPED") {
    return;
  }

  actor.angle = 0;
  idx = chrSprite.indexOf(actor.sprite);
  actor.sprite = deathSprite[idx];
  actor.state = "EXPLODED"; 
  state = 2; // triggers game over screen
}