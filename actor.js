// A Class of Our Actors/Characters
class Actor {
  constructor(x, y, sprite, color) {
    this.x = x;
    this.y = y;
    this.prevX = x; // Needed for "bouncing" collision detection
    this.prevY = y;
    this.size = 50;
    this.sprite = sprite;
    this.originalSprite = sprite;
    this.color = color;
    this.xspeed = random(-2,2);
    this.yspeed = random(-2,2);
    
    this.timer = 14.0;           // measured in seconds
    this.timerStart = millis();  // when the timer started
    this.timeAlive = 0.0;        // Tracks how long the actor has been alive while the game is UNPAUSED

    this.shakeThreshold = 5.0;   // how many seconds left to shake
    this.angle = 0;              // current rotation angle
    this.rotationSpeed = 80.0;  // how fast it rotates per frame
    this.rotationDirection = 1;  // 1 = clockwise, -1 = counter-clockwise
    this.rotationMax = 360;      // seems like a lot, but looks good (?)

    this.opacity = 255;


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
    if(!gamePaused && !levelUpActive){ // If the game ISN'T Paused then we update their movement
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

    this.paintTrail();
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

  paintTrail(){
    let remaining = max(this.timer - this.timeAlive, 0);
    if(this.state != "GRABBED" && this.state != "SNAPPED" && this.state != "EXPLODED" && remaining <= (this.shakeThreshold + 2))
    {
      let scaleFactor = paintLayer.width / width;
      let px = (this.x + this.size / 2) * scaleFactor;
      let py = (this.y + this.size / 2) * scaleFactor;
      let pPrevX = (this.prevX + this.size / 2) * scaleFactor;
      let pPrevY = (this.prevY + this.size / 2) * scaleFactor;

      // Growth curve for stroke weight
      let lifeProgress = constrain(this.timeAlive / this.timer, 0, 1);
      let growthCurve = pow(lifeProgress, 3);
      let weight = map(growthCurve, 0, 1, 1, 6); // smaller range, since layer is scaled up later

      paintLayer.stroke(this.color);
      paintLayer.strokeWeight(weight);
      paintLayer.line(pPrevX, pPrevY, px, py);
    }
  }

  //makes sure the mouse is over the character
  isMouseOver() { 
    return mouseX > this.x && mouseX < this.x + this.size &&
            mouseY > this.y && mouseY < this.y + this.size;
    }

  
  fadeAway() {
    
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

  isInZone(zone, bucket = null) {
    const obj = bucket || this;
    const margin = 3; // a little tolerance so it’s easier to “stay in zone”
    const objLeft = obj.x - margin;
    const objRight = obj.x + obj.size + margin;
    const objTop = obj.y - margin;
    const objBottom = obj.y + obj.size + margin;

    return !(
      objRight < zone.x ||
      objLeft > zone.x + zone.w ||
      objBottom < zone.y ||
      objTop > zone.y + zone.h
    );
  }

}
  
  //SPAWN LOGIC
  // used for actor spawning with vents
  
  function spawnActor(){
    if (spawnLogic.rate <= 0) return; //checks if a bucket has exploded and stops spawning
  
    let rate = spawnLogic.timeToSpawn/spawnLogic.rate;
    const MAXACTORS = 10;
  
    let activeVents = vents.filter(v => v.active); // Will only choose from active vents
    if (activeVents.length === 0) return;
    
    // Chooses a random active vent to spawn from
    let randomVent = random(activeVents);
    if (spawnLogic.timer == Math.round(rate) && !gamePaused && !levelUpActive && spawnLogic.activeActors <= MAXACTORS) {
      let newX, newY;
  
      // Makes sure coordinate for spawnpoint is at the right place
      switch(randomVent.wall){
      case "left":
        newX = randomVent.x + 130;
        newY = randomVent.y + 40;
        break;
      case "top":
        newX = randomVent.x + 40;
        newY = randomVent.y + 150;
        break;
      case "right":
        newX = randomVent.x;
        newY = randomVent.y + 40;
        break;
      case "bottom":
        newX = randomVent.x + 40;
        newY = randomVent.y;
        break;
      }
  
      let randIndex = int(random(0, chrSprite.length));
      let randColor;
      if(randIndex == 0) randColor = color(255, 0, 0)
      if(randIndex == 1) randColor = color(0, 0, 255)
      if(randIndex == 2) randColor = color(128, 0, 128)
      if(randIndex == 3) randColor = color(0, 255, 0);
  
      randColor = lerpColor(randColor, color(255,255,255), 0.7); // Gives the colors a pastel look
  
      // Chooses and pushes a random bucket to be spawned
      ourCharacters.push(new Actor(newX, newY, chrSprite[randIndex], randColor));
      ++spawnLogic.activeActors;
    }

    
  }
  
  function spawnRate(){
                    //needs to be whole number
    let rate = spawnLogic.timeToSpawn/spawnLogic.rate;
  
    if(spawnLogic.timer == Math.round(rate)){
      spawnLogic.timer = 0;
  
      //spawn rate starts to slow down.
      if (spawnLogic.rate < 1.5){
        spawnLogic.rate += spawnRateIncrease; 
      } else if(spawnLogic.rate < 2) {
        spawnLogic.rate += (spawnRateIncrease / 2);
      }
    }
    ++spawnLogic.timer;
  }
  
  //random character movement
  function roamingMovement(actor) {
    
    if (actor.xspeed === undefined) actor.xspeed = random(-1, 1);
    if (actor.yspeed === undefined) actor.yspeed = random(-1, 1); //identify speed
    
  
    let velocity = createVector(actor.xspeed, actor.yspeed); //create velocity from speed
    if (velocity.mag() < 0.1) {
  
  
      velocity = p5.Vector.random2D().mult(1); //if actor still, nudge
    }
  
    let jitter = p5.Vector.random2D().mult(0.2);
    velocity.add(jitter);
    velocity.setMag(actor.maxSpeed || 2); //max speed
    
    actor.prevX = actor.x; //save coordinate
    actor.prevY = actor.y;
  
    actor.x += velocity.x;//update coordinates
    actor.y += velocity.y;
  
    
  
    actor.xspeed = velocity.x;
    actor.yspeed = velocity.y; //velocity transfer, probably an easier way to do this
    
        // Magnet PowerUp
    if (player && player.hasItem("Magnet")) {
      const magnetRange = 150; 
      const magnetStrength = 30.0; 
  
      let mouseVector = createVector(mouseX, mouseY);
      let actorVector = createVector(actor.x + actor.size/2, actor.y + actor.size/2);
  
      let toMouse = p5.Vector.sub(mouseVector, actorVector);
      let distance = toMouse.mag();
          
      if ((distance < magnetRange) && (distance > 12)) {
          // pull actor toward mouse
          // second condition gives the magnet a nice bounce-back, not jittery
          toMouse.setMag(magnetStrength);
          actor.xspeed += toMouse.x;
          actor.yspeed += toMouse.y;
      }  
    }
  
  
    if (actor.x < zoneX) {
      actor.x = zoneX;
      actor.xspeed *= -1;
    }
    if (actor.x > width - actor.size - zoneX) {
      actor.x = width - actor.size - zoneX;
      actor.xspeed *= -1;
    }
    if (actor.y < zoneY1) {
      actor.y = zoneY1;
      actor.yspeed *= -1;
    }
    if (actor.y > height - actor.size - (height - (zoneY2 + zoneHeight))) {
      actor.y = height - actor.size - (height - (zoneY2 + zoneHeight));
      actor.yspeed *= -1;
    }
  
    checkActorCollision(actor);
    checkActorToActorCollisions();
  }
  
  function checkActorCollision(actor){
    for (let zone of (levelSet[currentLevel] && levelSet[currentLevel].colorZones ? levelSet[currentLevel].colorZones : [])) {
      // Collision works as follows: check the top left corner of rect 1, and top left corner of rect 2
      // Because our buckets are a square, you simply use actor.size for both the width and height
      let hit = collideRectRect(zone.x, zone.y, zone.w, zone.h, actor.x, actor.y, actor.size, actor.size);
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
  
 
  function checkActorToActorCollisions() {
    const allActors = [...ourCharacters];
    if (rougeCharacter) allActors.push(rougeCharacter);
  
    for (let i = 0; i < allActors.length; i++) {
      let actor1 = allActors[i];
      if (actor1.state !== "FREE" && !(actor1 instanceof rougeActor)) continue;
  
      for (let j = i + 1; j < allActors.length; j++) {
        let actor2 = allActors[j];
        if (actor2.state !== "FREE" && !(actor2 instanceof rougeActor)) continue;
  
        //distance between actor centers
        let xDist = (actor2.x + actor2.size / 2) - (actor1.x + actor1.size / 2);
        let yDist = (actor2.y + actor2.size / 2) - (actor1.y + actor1.size / 2);
        let dist = Math.sqrt(xDist * xDist + yDist * yDist);
        let minDist = (actor1.size + actor2.size) / 2;
  
        if (dist < minDist && dist > 0) {
          let impactX = xDist / dist;
          let impactY = yDist / dist;
          let overlap = (minDist - dist);
  
          //rouge bucket collisions
          if (actor1 instanceof rougeActor && !(actor2 instanceof rougeActor)) {
            actor2.x += impactX * overlap;
            actor2.y += impactY * overlap;
  
            // Reflect velocity (real bounce)
            const dot = actor2.xspeed * impactX + actor2.yspeed * impactY;
            actor2.xspeed -= 2 * dot * impactX;
            actor2.yspeed -= 2 * dot * impactY;
  
            //dampen for stability
            actor2.xspeed *= 0.5;
            actor2.yspeed *= 0.5;
            continue;
          } 
          else if (actor2 instanceof rougeActor && !(actor1 instanceof rougeActor)) {
            actor1.x -= impactX * overlap;
            actor1.y -= impactY * overlap;
  
            const dot = actor1.xspeed * impactX + actor1.yspeed * impactY;
            actor1.xspeed -= 2 * dot * impactX;
            actor1.yspeed -= 2 * dot * impactY;
  
            actor1.xspeed *= 0.5;
            actor1.yspeed *= 0.5;
            continue;
          }
  
          //normal bucket collisions
          if (!(actor1 instanceof rougeActor) && !(actor2 instanceof rougeActor)) {
            let halfOverlap = 0.5 * overlap;
            //separate the actors
            actor1.x -= impactX * halfOverlap;
            actor1.y -= impactY * halfOverlap;
            actor2.x += impactX * halfOverlap;
            actor2.y += impactY * halfOverlap;

            //return speed to actor
            let relXSpeed = actor1.xspeed - actor2.xspeed;
            let relYSpeed = actor1.yspeed - actor2.yspeed;
            let bounceFactor = 2 * (impactX * relXSpeed + impactY * relYSpeed);
  
            actor1.xspeed -= bounceFactor * impactX;
            actor1.yspeed -= bounceFactor * impactY;
            actor2.xspeed += bounceFactor * impactX;
            actor2.yspeed += bounceFactor * impactY;
          }
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
      // Totem Powerup
      if(player.hasItem("Blatant Copyright") && player.health < 2){
        mouseReleased();
        idx = chrSprite.indexOf(actor.sprite); // The actor that would explode shows their death sprite
        if (idx >= 0) actor.sprite = deathSprite[idx];  
        actor.state = "EXPLODED";
  
        for (let i = ourCharacters.length - 1; i >= 0; i--) {  // Every other actor gets removed when the totem explodes (Can change later)
          if (ourCharacters[i] != actor && ourCharacters[i].state != "SNAPPED") {
            ourCharacters.splice(i, 1);
            spawnLogic.activeActors--;
          }
        }
        player.removeItem("Blatant Copyright");
        flashScreen = true;   // Makes a cool flashing screen effect
        flashTimer = millis();
      } else if(player.health >= 2){
        player.health--;
        mouseReleased();
        idx = chrSprite.indexOf(actor.sprite);
        if (idx >= 0) actor.sprite = deathSprite[idx];  
        actor.state = "EXPLODED";
  
          if (player.hasItem("Paint Thinner")) {
      console.log("has thinner")
        for (let char of ourCharacters) {
        if (char != actor) {
          let distToActor = abs(dist(actor.x, actor.y, char.x, char.y));
          if (distToActor < 600) {
              char.angle = 0;
              char.timer = 25; // Much Longer Timer
              console.log("Time After:", char.timeAlive);
            }
          }
        }
      }
  
  
  
      } else {
        player.health--;
        onTimerFinished(actor);
        return;
      }
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
  
  function onTimerFinished(actor) {
    console.log("Timer finished for actor!");
  
    mouseReleased();
  
    if (actor.state === "SNAPPED" || actor.state === "EXPLODED") return;
  
    //stop spawning
    spawnLogic.rate = 0;
  
    //first bucket explodes
    actor.state = "EXPLODED";
    actor.splode();
    idx = chrSprite.indexOf(actor.sprite);
    if (idx >= 0) actor.sprite = deathSprite[idx];
  
    //explode all buckets not sorted
    setTimeout(() => {
      for (let a of ourCharacters) {
        if (a !== actor && a.state !== "EXPLODED") {
          idx = chrSprite.indexOf(a.sprite);
          a.splode();
          if (idx >= 0) a.sprite = deathSprite[idx];
          a.state = "EXPLODED";
        }
      }
    }, 550); 
  
    //delays gameover so death animation plays
  
    setTimeout(() => state = 3, 2000);
  }
  
  function distBetween(x1, y1, x2, y2) {
    return sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }
  



  function spawnRougeActor() {
  
    let spawnX = width / 2 - 25;
    let spawnY = height / 2 - 25;
  
    rougeCharacter = new rougeActor(spawnX, spawnY, rougeBucketSprite);
  }

  class rougeActor extends Actor {
    constructor(x, y, sprite) {
      super(x, y, sprite, color(255, 255, 0));
      this.state = "IDLE";  
      this.speed = 3;       
      this.targetZone = null;  // current target zone
      this.lastZone = null; //last target zone
      this.currentBuckets = [];  //buckets rougeActor is trying to free
      this.timer = Infinity; //never explodes
      this.zoneCommitted = false; 
      this.leaveTarget = null; 
      this.unsnapTimer = 0;
      this.unsnapInterval = 50; //how fast buckets are freed
      this.idleStart = millis();
      this.idleDelay = 1000;
      this.inZoneFrames = 0;
    }
  
    update() {
      if (gamePaused || levelUpActive) return;
      //console.log("game state = " + this.state);
  
      //allow player to grab actor
      if (this.isMouseOver() && this.state === "IDLE" && mouseIsPressed) {
        this.state = "GRABBED";
        grabbedCharacter = this;
        pickup.play();
        return;
      }
  
      if (this.state === "GRABBED") {
        grabbedMovement(this);
    
        //reset leaving / target logic because player moved the actor manually
        this.targetZone = null;
        this.leaveTarget = null;
        this.zoneCommitted = false;
        this.currentBuckets = [];
        this.unsnapTimer = 0;
        this.inZoneFrames = 0;
        
        return;
      }
    
  
      //if idle pick target zone
      if (this.state === "IDLE") {
        if (millis() - this.idleStart >= this.idleDelay) {
          if (!this.targetZone) this.pickRandomZone();
          if (this.targetZone) this.state = "MOVING_TO_ZONE";
        }
      }
  
      //moves towards target zone
      if (this.state === "MOVING_TO_ZONE") {
        if (this.targetZone) {
          const reached = this.moveToZone(this.targetZone);
          if (reached) {
            this.state = "UNSNAPPING_BUCKETS";
            this.identifyBucketsInZone();
          }
        } else {
          this.state = "IDLE";
          this.idleStart = millis();
        }
      }
  
      //free buckets in target zone
      if (this.state === "UNSNAPPING_BUCKETS") {
        this.unsnapTimer++;
        if (!this.isInZone(this.targetZone)) {
          this.currentBuckets = [];
          this.state = "LEAVING_ZONE";
          this.leaveTarget = this.chooseLeaveTarget(this.targetZone);
          return;
        }
  
        //rate buckets are freed
        if (this.unsnapTimer >= this.unsnapInterval) {
          this.unsnapTimer = 0;
          this.identifyBucketsInZone();
          this.unsnapBuckets();
  
          const stillSnapped = ourCharacters.some(
            b => b.state === "SNAPPED" && this.isInZone(this.targetZone, b)
          );
          if (!stillSnapped) { //reset bucket that is freed
            this.state = "LEAVING_ZONE";
            this.leaveTarget = this.chooseLeaveTarget(this.targetZone);
          }
        }
      }
  
      //leave zone
      if (this.state === "LEAVING_ZONE") {
        this.leaveZoneSmooth();
      }
  
      if (this.state === "IDLE") super.update();
    }
  
    moveToZone(zone) {
      if (!zone) return true;
  
      const targetX = zone.x + zone.w / 2 - this.size / 2;
      const targetY = zone.y + zone.h / 2 - this.size / 2;
      let dx = targetX - this.x;
      let dy = targetY - this.y;
      let distance = sqrt(dx*dx + dy*dy);
  
      if (distance < this.speed * 2) {
          //console.log("rouge actor reached zone");
          this.x = targetX;
          this.y = targetY;
          return true;
      }
  
      //prevent getting stuck
      if (!this._stuckTimer) this._stuckTimer = millis();

      if (millis() - this._stuckTimer > 1000 && distance < 5) {
          this.x = targetX;
          this.y = targetY;
          this._stuckTimer = null;
          return true;
      }
  
      const moveSpeed = this.speed;
      this.x += (dx / distance) * moveSpeed;
      this.y += (dy / distance) * moveSpeed;
  
       if (distance > 5) this._stuckTimer = millis();
  
       return false;
    }
  
  
    pickRandomZone() {
      if (this.zoneCommitted) return;
      const zones = levelSet[currentLevel]?.colorZones || [];
      if (zones.length === 0) return;
  
      //find all zones with sorted buckets
      const zonesWithBuckets = zones.filter(z =>
          ourCharacters.some(b => b.state === "SNAPPED" && this.isInZone(z, b))
      );
  
      if (zonesWithBuckets.length === 0) {
          //don't move if there aren't any sorted buckets
          this.targetZone = null;
          this.zoneCommitted = false;
          this.idleStart = millis();
          return;
      }
  
      //avoid picking the same zone again if possible
      let candidateZones = zonesWithBuckets;
      if (this.lastZone && zonesWithBuckets.length > 1) {
          candidateZones = zonesWithBuckets.filter(z => z !== this.lastZone);
          if (candidateZones.length === 0) {
              // Only the same zone has buckets, so allow it
              candidateZones = zonesWithBuckets;
          }
      }
  
      //pick random zone
      this.targetZone = random(candidateZones);
      this.zoneCommitted = true;
      this.lastZone = this.targetZone; //remember last zone
    }
  
  
  
    chooseLeaveTarget(zone) {
      //if no other zone to go to head to center
      if (!zone) return { x: width / 2 - this.size / 2, y: height / 2 - this.size / 2 };
  
      const zoneCenterX = zone.x + zone.w / 2;
      const zoneCenterY = zone.y + zone.h / 2;
  
      let dx = this.x - zoneCenterX;
      let dy = this.y - zoneCenterY;
  
      const dist = sqrt(dx * dx + dy * dy);
      if (dist === 0) {
          const angle = random(TWO_PI);
          dx = cos(angle);
          dy = sin(angle);
      } else {
          dx /= dist;
          dy /= dist;
      }
  
      //distance between canvas center and actor
      const canvasCenterX = width / 2 - this.size / 2;
      const canvasCenterY = height / 2 - this.size / 2;
  
      //point between canvas center and actor
      const leaveFactor = 0.7; // closer to canvas center
      const targetX = lerp(this.x, canvasCenterX, leaveFactor);
      const targetY = lerp(this.y, canvasCenterY, leaveFactor);
  
      return { x: targetX, y: targetY };
    }
  
    leaveZoneSmooth() {
      if (!this.leaveTarget) this.leaveTarget = this.chooseLeaveTarget(this.targetZone);

      if (this.state === "UNSNAPPING_BUCKETS" && this.targetZone) {
        //if no more sorted buckets leave
        const stillSnapped = ourCharacters.some(
            b => b.state === "SNAPPED" && this.isInZone(this.targetZone, b)
        );
        if (!stillSnapped) {
            this.state = "LEAVING_ZONE";
            this.leaveTarget = this.chooseLeaveTarget(this.targetZone);
            return;
        }
      }
  
      const dx = this.leaveTarget.x - this.x;
      const dy = this.leaveTarget.y - this.y;
      const dist = sqrt(dx * dx + dy * dy);

      if (dist < 3) {
          this.state = "IDLE";
          this.leaveTarget = null;
          this.zoneCommitted = false;

          //immediately pick a new target zone if possible
          this.pickRandomZone();
          if (this.targetZone) {
              this.state = "MOVING_TO_ZONE";
          } else { //go idle otherwise
              this.idleStart = millis();
          }
          return;
      }

      //move smoothly toward target
      const moveSpeed = this.speed;
      this.x += (dx / dist) * moveSpeed;
      this.y += (dy / dist) * moveSpeed;

    }

    //find buckets in the zones
    identifyBucketsInZone() {
      if (!this.targetZone) return;
      this.currentBuckets = ourCharacters.filter(
        bucket => bucket.state === "SNAPPED" && this.isInZone(this.targetZone, bucket)
      );
    }
  
    //free buckets
    unsnapBuckets() {
      if (!this.currentBuckets || this.currentBuckets.length === 0) return;

      const bucket = this.currentBuckets[0];
      if (!bucket) return;

      if (bucket.state === "SNAPPED" && this.isInZone(this.targetZone, bucket)) {
        bucket.state = "FREE";
        bucket.timeAlive = 0;
        if (bucket.originalSprite) bucket.sprite = bucket.originalSprite;
        bucket.x += random(-10, 10);
        bucket.y += random(-10, 10);
      }

      this.currentBuckets.shift(); //remove and return bucket
    }
  
    //check that the bucket is in a zone
    isInZone(zone, bucket = null) {
      if (!zone) return false; 
      const obj = bucket || this;
      const margin = 3;
      const objLeft = obj.x - margin;
      const objRight = obj.x + obj.size + margin;
      const objTop = obj.y - margin;
      const objBottom = obj.y + obj.size + margin;
  
      return !(
        objRight < zone.x ||
        objLeft > zone.x + zone.w ||
        objBottom < zone.y ||
        objTop > zone.y + zone.h
      );
    }
  
    draw() {
      push();
      translate(this.x + this.size / 2, this.y + this.size / 2);
      imageMode(CENTER);
      image(this.sprite, 0, 0, this.size, this.size);
      pop();
    }
  }
