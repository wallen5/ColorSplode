// Utility
const reflectAngle = (angle, nx, ny) => {
  const vx = Math.cos(angle), vy = Math.sin(angle);
  const dot = vx * nx + vy * ny;
  const rx = vx - 2 * dot * nx, ry = vy - 2 * dot * ny;
  return Math.atan2(ry, rx);
};

class Actor {
  constructor(x, y, width, height, sprite) {
    this.x = x; this.y = y;
    this.width = width; this.height = height;
    this.sprite = sprite;
    this.speed = 0;
    this.moveAngle = random(TWO_PI);
  }
  // center x and y
  get cx() { return this.x + this.width  * 0.5; }
  get cy() { return this.y + this.height * 0.5; }
  // radius 
  get r () { return 0.5 * Math.max(this.width, this.height); }

  roam() {
    this.moveAngle += random(-0.12, 0.12);
    this.x += cos(this.moveAngle) * this.speed;
    this.y += sin(this.moveAngle) * this.speed;

    // canvas edge bounce
    if (this.x < 0) { this.x = 0; this.moveAngle = PI - this.moveAngle; }
    else if (this.x > canvasWidth - this.width) { this.x = canvasWidth - this.width; this.moveAngle = PI - this.moveAngle; }

   // Only for when all zones are located at the bottom of the canvas
    let effectiveBottom = canvasHeight; // Default to the absolute canvas bottom
    const zoneHeight = 150, inset = 25;
    // Create new boundary if conditions are met
    if (level?.currentZoneMap === 2 && !this.grabbed) {
        effectiveBottom = canvasHeight - zoneHeight - inset;
    }
    //(map with zones at bottom) new boundary to stop buckets from moving past zones. Otherwise, boundaries stay the same
     if (this.y < 0) { this.y = 0; this.moveAngle = -this.moveAngle; }
     else if (this.y > effectiveBottom - this.height) { this.y = effectiveBottom - this.height; this.moveAngle = -this.moveAngle; }
  }

  draw() {
    //if (!this.sprite) return;
    push();
    imageMode(CENTER);
    if (this.sprite){image(this.sprite, this.cx, this.cy, this.width, this.height);}
    pop();
  }

  update(level) {
    this.roam();
  }

}

class Bucket extends Actor {
  constructor(x, y, width, height, color, sprite) {
    super(x, y, width, height, sprite);
    this.color = color;

    this.prevX = x; this.prevY = y;
    this.particles = [];

    this.grabbed = false;
    this.freed = false;
    this.sorted  = false;
    this.speed   = 2;
    this.moveAngle = random(TWO_PI);

    this.destinationX = x;
    this.destinationY = y;

    this.maxTimeAlive = 14000;
    this.wobbleTime   = 5000;
    this.alive        = true;
    this.scored = false;

    this.freeze = false;
    this.maxTimeFreeze = 5;

    this.angle = 45;

    this.lastBounceAt   = 0;   // ms
    this.bounceCooldown = 80;  // ms

    this.timeSinceFlip = 0; // frames
    this.lookDir = 1; // 1 left, -1 right

    // NEW: logical timers that only advance when not paused
    this.lifeMs = 0;             // how long this bucket has been alive in “game time”
    this.freezeElapsedMs = 0;    // how long it has been frozen
    this.lastUpdateTime = millis(); // for dt tracking
  }

  draw() {

    const wobbleStart = Number.isFinite(this.wobbleTime) ? this.wobbleTime : 0; // ms
    const ageMs = this.lifeMs;  // use game-time instead of millis() directly
    let progress = constrain(ageMs / this.maxTimeAlive, 0, 1);

    const baseAmp = PI / 8;  // 22.5°
    const wobbleSpeed = 2.0 * lerp(1.0, 4.0, progress);
    const wobbleAmp   = baseAmp * lerp(1.0, 2.0, progress);

    // When paused, draw a static sprite (no wobble), but still tint if frozen
    if (isPaused) {
      this.lastUpdateTime = millis();
      push();
      imageMode(CENTER);
      if (this.freeze) tint(173, 216, 230);
      image(this.sprite, this.cx, this.cy, this.width, this.height);
      pop();
      return;
    }

    this.flipActor();

    if (ageMs >= wobbleStart && !this.sorted && this.alive) {
      const t = (ageMs - wobbleStart) / 1000.0;
      const theta = sin(t * wobbleSpeed) * wobbleAmp;

      push();
      imageMode(CENTER);
      translate(this.x + this.width / 2, this.y + this.height / 2);
      scale(this.lookDir, 1);
      rotate(theta);
      if (this.freeze) tint(173, 216, 230);
      image(this.sprite, 0, 0, this.width, this.height);
      pop();

    } else {
      push();
      imageMode(CENTER);
      translate(this.x + this.width / 2, this.y + this.height / 2);
      scale(this.lookDir, 1);
      if (this.freeze) tint(173, 216, 230);
      image(this.sprite, 0, 0, this.width, this.height);
      pop();
    }
  }

  collideWithActors(level) {
    if (!level.allActors) return;
    const now = millis(), r = this.r, cx = this.cx, cy = this.cy;

    for (let other of level.allActors) {
      if (other === this || this.sorted || !this.alive || other.sorted || !other.alive) continue;
      if (now - this.lastBounceAt < this.bounceCooldown || now - other.lastBounceAt < other.bounceCooldown) continue;

      const ro = other.r ?? 0.5 * Math.max(other.width, other.height);
      const dx = (other.cx ?? (other.x + other.width * 0.5)) - cx;
      const dy = (other.cy ?? (other.y + other.height * 0.5)) - cy;
      const minD = r + ro, d2 = dx*dx + dy*dy;
      if (d2 <= 0 || d2 >= minD*minD) continue;

      const d  = Math.sqrt(d2), nx = dx / d, ny = dy / d;

      // separate
      const overlap = (minD - d) * 0.5;
      this.x -= nx * overlap; this.y -= ny * overlap;
      other.x += nx * overlap; other.y += ny * overlap;

      // reflect
      this.moveAngle  = reflectAngle(this.moveAngle,  nx, ny);
      other.moveAngle = reflectAngle(other.moveAngle, -nx, -ny);

      this.lastBounceAt = other.lastBounceAt = now;
    }
  }

  collideWithZones(level) {
    if (!level.colorZones) return;

    for (let z of level.colorZones) {
      if (this.x >= z.x + z.width || this.x + this.width <= z.x ||
          this.y >= z.y + z.height || this.y + this.height <= z.y) continue;

      const oL = (this.x + this.width) - z.x;
      const oR = (z.x + z.width) - this.x;
      const oT = (this.y + this.height) - z.y;
      const oB = (z.y + z.height) - this.y;

      if (Math.min(oL, oR) < Math.min(oT, oB)) {
        this.x += (oL < oR ? -oL : oR);
        this.moveAngle = PI - this.moveAngle;
      } else {
        this.y += (oT < oB ? -oT : oB);
        this.moveAngle = -this.moveAngle;
      }
    }
  }

  freezeActor() {
    if (!this.freeze) {
      this.freeze = true;
      this.freezeElapsedMs = 0; // reset logical freeze timer
    }
  }

  flipActor() {
    this.timeSinceFlip++;
    if (this.timeSinceFlip < 12) return; // dont flip too often

    // flips too much without flipPadding, play around with value
    const flipPadding = 0.1;
    const moveAmt = (cos(this.moveAngle) * this.speed);


    console.log(moveAmt);
    if (moveAmt > (flipPadding)) {
      console.log("FLIPPING!");
      this.lookDir = -1;
      this.timeSinceFlip = 0;
    } 
    if (moveAmt < (-flipPadding)) {
      console.log("FLIPPING!");
      this.lookDir = 1;
      this.timeSinceFlip = 0;
    }
  }

  // without this, death anim is too small 
  fixDeathAnim() {
    if (!this.alive || this.sorted) return;
    this.width  *= 2; 
    this.height *= 2;
    this.x -= this.width/4;
    this.y -= this.height/4;
  }

  update(level) {

    const oldX = this.x;
    const oldY = this.y;
    // compute dt every frame based on real time
    const now = millis();
    const dt = now - this.lastUpdateTime;
    this.lastUpdateTime = now;

    // if paused, do NOT advance timers, movement, paint, particles, etc.
    if (typeof isPaused !== "undefined" && isPaused) {
      return;
    }

    if (this.grabbed) {
      const gx = mouseX - gameOffsetX - this.width/2;
      const gy = mouseY - gameOffsetY - this.height/2;
      this.x = gx;
      this.y = gy;
    }

    this.sprite = this.sorted
      ? chrSprite[this.color]
      : (this.alive ? chrSprite[this.color] : deathSprite[this.color]);
      

    // time & freeze

    if (this.freeze) {
      this.freezeElapsedMs += dt;
      if (this.freezeElapsedMs >= this.maxTimeFreeze * 1000) {
        this.freeze = false;
      } else {
        // while frozen, don't move or collide
        return;
      }
    }

    // advance life only when not paused
    this.lifeMs += dt;
    if ((this.lifeMs >= this.maxTimeAlive) && (this.alive)) {
      this.fixDeathAnim();
      this.alive = false;
      for(item of inventory){
        if (item.id === "SCRAPER") itemEffectScrape(level, this);
      }
    } 
    
    // motion/collisions
    if (!this.sorted && this.alive) {
      this.roam();
      this.collideWithActors(level);
      if (!this.grabbed) this.collideWithZones(level);
    }

    // trail paint (drawn to paintLayer)
    const wobbleStart = Number.isFinite(this.wobbleTime) ? this.wobbleTime : 0;
    const ageMs = this.lifeMs;
    if (!this.grabbed && this.alive && ageMs >= wobbleStart) {
      let w = pow((ageMs / 1000) / 3, 2);
      paintLayer.stroke(SOFTPALETTE[this.color]);
      paintLayer.strokeWeight(w + random(2));
      paintLayer.line(this.prevX + this.width/2, this.prevY + this.height/2, this.cx, this.cy);
    }

    // particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i], age = millis() - p.born, k = (deltaTime || 16.67) / 16.67;
      p.vy += 0.3; p.x += p.vx * k; p.y += p.vy * k; p.vx *= 0.98; p.vy *= 0.98;

      const c = color(PALETTE[this.color] || '#fff');
      push();
      c.setAlpha(map(age, 0, 1500, 255, 0, true));
      noStroke(); fill(c); circle(p.x, p.y, p.size);
      pop();
      if (age > 1500) this.particles.splice(i, 1);
    }

    // Change prevX
    this.prevX = oldX; this.prevY = oldY;

  }

  dropInZone(level)
  {
    console.log("Put into zone!");  
    for (let zone of level.colorZones) {
        const overlap = rectsOverlap(
          this.x, this.y, this.width, this.height,
          zone.x, zone.y, zone.width, zone.height
        );
        console.log(overlap)

      if (overlap && !this.sorted) {
        if (this.color === zone.color) {
          this.sorted = true;
          this.splode(); //remove if you want
          if(!this.freed)
            level.addScore(this);
          this.freed = true;
        }
        break;
      }
    }
    
  }  

  splode() {
    const n = 6, cx = this.cx, cy = this.cy;
    for (let i = 0; i < n; i++) {
      this.particles.push({ x: cx, y: cy, vx: random(-10, 10), vy: random(-10, 10), size: 6, born: millis() });
    }
  }
}

// Cat
class Cat extends Actor {
  constructor(x, y, width, height, sprite) {
    super(x, y, width, height, sprite);
    this.target = null;
    this.speed = 2.5;
    this.swipeRange = 30;
    this.lastSwipe = 0;
    this.swipeCooldown = 2000; // ms
    this.roamUntil = millis() + 2000;
  }

  findTarget(level) {
    for (let actor of level.allActors) {
      if (actor.alive && !actor.sorted) { this.target = actor; if (random(10) <= 2) return; }
    }
    this.target = null;
  }

  moveTowardTarget() {
    if (!this.target) return;
    const dx = this.target.cx - this.cx, dy = this.target.cy - this.cy;
    const d  = Math.hypot(dx, dy); if (d < 1) return;
    this.x += (dx / d) * this.speed; this.y += (dy / d) * this.speed;
    if (d < this.swipeRange) this.attackTarget();
  }

  attackTarget() {
    const now = millis();
    if (now - this.lastSwipe < this.swipeCooldown) return;
    if (this.target?.alive && !this.target.sorted) {
      this.target.splode();
      this.target.maxTimeAlive -= 3000;
      

    }
    this.lastSwipe = now; this.target = null;
  }

  update(level) {
    const now = millis();

    if (!this.target || !this.target.alive || this.target.sorted) {
      this.roam();
      if (now >= this.roamUntil) {
        this.findTarget(level);
        this.roamUntil = now + random(500, 1500);
      }
    } else if (!this.target.grabbed) {this.moveTowardTarget();} 
      else if (this.target.grabbed){this.roam();}
  }
}

// Enemy frees sorted actors
// Enemy frees sorted actors without state machine
class rougeBucket extends Actor {
  constructor(x, y, w, h, sprite) {
    super(x, y, w, h, sprite);
    this.speed = 1;
    this.freeRange = 30;

    this.targetColor = null;
    this.targets = [];
    this.target = null;
    this.grabbed = false;
    this.roamUntil = millis() + 1500;

    this.alive = true;
    this.freeze = false;
    this.freezeElapsedMs = 0;
    this.maxTimeFreeze = 5;
  }

  freezeActor() {
    if (!this.freeze) {
      this.freeze = true;
      this.freezeElapsedMs = 0;
    }
  }

  getClosestTarget() {
    if (!this.targets.length) return null;
    return this.targets.reduce((best, b) => {
      const d2 = (b.cx - this.cx)**2 + (b.cy - this.cy)**2;
      return (!best || d2 < best.d2) ? {b, d2} : best;
    }, null)?.b || null;
  }

  acquireTargetColor(level) {
    const sorted = level.allActors.filter(b => b.sorted);
    if (!sorted.length) return;

    const chosen = random(sorted);
    this.targetColor = chosen.color;
    this.targets = level.allActors.filter(b => b.sorted && b.color === this.targetColor);
    this.target = this.getClosestTarget();
  }

  moveTowardTarget() {
    if (!this.target) return;
    const dx = this.target.cx - this.cx, dy = this.target.cy - this.cy;
    const d = Math.hypot(dx, dy);
    if (d < 1) return;
    this.x += (dx / d) * this.speed;
    this.y += (dy / d) * this.speed;
  }

  freeTarget() {
    if (!this.target) return;
    this.target.lifeMs = 0;
    this.target.sorted = false;
    this.target.freed = true;
    this.target.alive = true;
    this.target.scored = true;

    // -- Used to nudge bucket towards center of screen after freed by rogue bucket
    const centerX = canvasWidth * 0.5;
    const centerY = canvasHeight * 0.5;
    // Use the bucket's center coordinates
    const bucketCX = this.target.cx; 
    const bucketCY = this.target.cy; 
    // Calculate the difference vector (dx, dy) from the bucket to the center of screen
    const dx = centerX - bucketCX;
    const dy = centerY - bucketCY;
    // This gives angle pointing from (bucketCX, bucketCY) to (centerX, centerY).
    this.target.moveAngle = Math.atan2(dy, dx);
    //when bucket is freed, it is moved towards center of screen to prevent bucket from going off canvas
    const nudgeDistance = this.target.width * 2.5;
    this.target.x += Math.cos(this.target.moveAngle) * nudgeDistance;
    this.target.y += Math.sin(this.target.moveAngle) * nudgeDistance;

    // remove from current target list
    this.targets = this.targets.filter(b => b !== this.target);
    this.target = this.getClosestTarget();

    // if none left → clear color and pause
    if (!this.target) {
      this.targetColor = null;
      this.roamUntil = millis() + 3000;
    }
  }

  update(level) {
    if (this.grabbed) {
      this.x = mouseX - gameOffsetX; this.y = mouseY - gameOffsetY;
      this.targetColor = null;
      this.targets = [];
      this.target = null;
      this.roamUntil = millis() + 3000;
      if (!mouseIsPressed) this.grabbed = false;
      return;
    }
    
    if (this.freeze) {
      this.freezeElapsedMs += deltaTime || 16.67;
      if (this.freezeElapsedMs >= this.maxTimeFreeze * 1000) this.freeze = false;
      else return;
    }

    // pause before acquiring new target color
    if (!this.targetColor) {
      this.roam();
      if (millis() >= this.roamUntil) this.acquireTargetColor(level);
      return;
    }

    // no current target → reset color and pause
    if (!this.target) {
      this.targetColor = null;
      this.roamUntil = millis() + 1000;
      return;
    }

    // move and free
    this.moveTowardTarget();
    if (Math.hypot(this.target.cx - this.cx, this.target.cy - this.cy) < this.freeRange) {
      this.freeTarget();
    }
  }
}

class Coin extends Actor {
  constructor(x, y, size = 28, sprite = null) {
    // Actor constructor signature: (x, y, width, height, sprite)
    super(x, y, size, size, sprite);
    this.width = size; this.height = size;
    this.sprite = sprite;

    this.walletValue = 1;
    this.grabbed = false;
    this.freed = false;
    this.sorted = false;
    this.alive = true;
    this.scored = false;
    this.speed = 1.5;
    this.moveAngle = random(TWO_PI);
  }
}

class Roller extends Actor {
  constructor(x, y, width, height, sprite) {
    super(x, y, width, height, sprite);
    this.target = null;
    this.speed = 2.5;
    this.freeRange = 40;
  }

  findTarget(level) {
    for (let actor of level.allActors) {
      if (!actor.grabbed) { this.target = actor; if (random(10) <= 2) return; }
    }
    this.target = null;
  }

  moveTowardTarget() {
    if (!this.target) return;
    const dx = this.target.cx - this.cx, dy = this.target.cy - this.cy;
    const d  = Math.hypot(dx, dy); if (d < 1) return;
    this.x += (dx / d) * this.speed; this.y += (dy / d) * this.speed;
    if (d < this.freeRange) this.freeTarget();
  }

  freeTarget() {
    if (this.target) {
      this.target.lifeMs = 0;
      this.target.sorted = false;
      this.target.freed = true;
      this.target.alive = true;
    }
    this.target = null;
  }

  update(level) {
    if (!this.target) this.findTarget(level);
    if (this.target && !this.grabbed) this.moveTowardTarget();
    if (this.grabbed) { this.x = mouseX; this.y = mouseY; }
  }


}

class Graffiti {
    constructor(sprite) {
        this.sprite = sprite;
        this.size = 55;
        this.speed = 5;
        this.sprayRadius = 140;

        this.active = false;
        this.exiting = false;
        this.sprayed = false;

        this.x = -200;
        this.y = -200;

        this.cooldown = 2000; //wait time before picking a new target
        this.lastActionTime = 0;
    }

    waitOffscreen() {
        this.active = this.exiting = this.sprayed = false;
        this.x = this.y = -200;
        this.lastActionTime = millis();
    }

    pickEdge(pxOff = 80, pyOff = 80) {
        const side = floor(random(4));
        switch (side) {
            case 0:
                return { x: -pxOff, y: random(height) };
            case 1:
                return { x: width + pxOff, y: random(height) };
            case 2:
                return { x: random(width), y: -pyOff };
            default:
                return { x: random(width), y: height + pyOff };
        }
    }

    pickEntryPoint() {
        const p = this.pickEdge(80, 80);
        this.x = p.x;
        this.y = p.y;
    }

    pickExitPoint() {
        const p = this.pickEdge(200, 200);
        this.exitX = p.x;
        this.exitY = p.y;
    }

    moveToward(tx, ty, s = this.speed) {
        const dx = tx - this.x,
            dy = ty - this.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < s * s) return true;
        const inv = 1 / Math.sqrt(d2);
        this.x += dx * inv * s;
        this.y += dy * inv * s;
        return false;
    }

    findTarget(level) {
        const candidates = [];

        for (let a of level.allActors) {
            if (a instanceof Bucket && a.alive && !a.sorted) {
                candidates.push(a);
            }
        }

        if (candidates.length === 0) return null;

        return candidates[floor(random(candidates.length))];
    }


    spray(level) {
        if (this.sprayed) return;
        this.sprayed = true;
        this.exiting = true;
        this.pickExitPoint();

        const r2 = this.sprayRadius * this.sprayRadius;

        for (let actor of level.allActors) {
            if (!(actor instanceof Bucket) || !actor.alive || actor.sorted) continue;

            const dx = (actor.x + actor.width / 2) - this.x;
            const dy = (actor.y + actor.height / 2) - this.y;
            const d2 = dx * dx + dy * dy;

            if (d2 < r2) {
                actor.color = floor(random(4));
                if (actor.splode) actor.splode();
            }
        }
    }

    update(level) {

        if (!this.active) {
            if (millis() - this.lastActionTime < this.cooldown) return;

            const t = this.findTarget(level);
            if (t) {
                this.active = true;
                this.target = t;
                this.pickEntryPoint();
            }
            return;
        }

        if (this.exiting) {
            if (this.moveToward(this.exitX, this.exitY, this.speed * 1.3)) {
                const offX = this.x < -150 || this.x > width + 150;
                const offY = this.y < -150 || this.y > height + 150;
                if (offX || offY) this.waitOffscreen();
            }
            return;
        }

        if (!this.target || !this.target.alive || this.target.sorted) {
            this.target = this.findTarget(level);
            if (!this.target) return;
        }

        if (this.moveToward(this.target.cx, this.target.cy)) {
            this.spray(level);
        }
    }

    draw() {
        push();
        imageMode(CENTER);
        if (this.sprite) image(this.sprite, this.x, this.y, this.size, this.size);
        else {
            fill(255, 0, 0);
            circle(this.x, this.y, this.size);
        }
        pop();
    }
}
