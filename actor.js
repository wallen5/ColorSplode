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
    //(map with zones at bottom) new boundary to stop buckets from moving past zones.
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

    this.maxTimeAlive = 40000;
    this.wobbleTime   = 5000;
    this.alive        = true;
    this.scored = false;

    this.freeze = false;
    this.maxTimeFreeze = 5;

    this.angle = 45;

    this.lastBounceAt   = 0;   // ms
    this.bounceCooldown = 80;  // ms

    // NEW: logical timers that only advance when not paused
    this.lifeMs = 0;             // how long this bucket has been alive in “game time”
    this.freezeElapsedMs = 0;    // how long it has been frozen
    this.lastUpdateTime = millis(); // for dt tracking
  }

  draw() {
    const wobbleStart = Number.isFinite(this.wobbleTime) ? this.wobbleTime : 0; // ms
    const ageMs = this.lifeMs;  // use game-time instead of millis() directly
    let progress = constrain(ageMs / this.maxTimeAlive, 0, 1);

    const baseAmp = PI / 6;  // 30°
    const wobbleSpeed = 6.0 * lerp(1.0, 4.0, progress);
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

    if (ageMs >= wobbleStart && !this.sorted && this.alive) {
      const t = (ageMs - wobbleStart) / 1000.0;
      const theta = sin(t * wobbleSpeed) * wobbleAmp;

      push();
      imageMode(CENTER);
      translate(this.x + this.width / 2, this.y + this.height / 2);
      rotate(theta);
      if (this.freeze) tint(173, 216, 230);
      image(this.sprite, 0, 0, this.width, this.height);
      pop();

    } else {
      push();
      imageMode(CENTER);
      if (this.freeze) tint(173, 216, 230);
      image(this.sprite, this.cx, this.cy, this.width, this.height);
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

  update(level) {
    // compute dt every frame based on real time
    const now = millis();
    const dt = now - this.lastUpdateTime;
    this.lastUpdateTime = now;

    // if paused, do NOT advance timers, movement, paint, particles, etc.
    if (typeof isPaused !== "undefined" && isPaused) {
      return;
    }

    if (this.grabbed) {
      const gx = mouseX - gameOffsetX;
      const gy = mouseY - gameOffsetY;
      this.x = gx;
      this.y = gy;
    }

    this.sprite = this.sorted
      ? chrSprite[this.color]
      : (this.alive ? chrSprite[this.color] : deathSprite[this.color]);

    // time & freeze
    this.prevX = this.x; this.prevY = this.y;

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
    if (this.lifeMs >= this.maxTimeAlive) this.alive = false;

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

    const centerX = canvasWidth * 0.5;
    const centerY = canvasHeight * 0.5;

    // Use the bucket's center coordinates
    const bucketCX = this.target.cx; 
    const bucketCY = this.target.cy; 
    // Calculate the difference vector (dx, dy) from the bucket to the center of screen
    const dx = centerX - bucketCX;
    const dy = centerY - bucketCY;
    // This gives the exact angle pointing from (bucketCX, bucketCY) to (centerX, centerY).
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

  update(level) {
    if (this.grabbed) {
      // follow mouse (game-space coordinates expected)
      const gx = mouseX - (typeof gameOffsetX !== 'undefined' ? gameOffsetX : 0);
      const gy = mouseY - (typeof gameOffsetY !== 'undefined' ? gameOffsetY : 0);
      this.x = gx - this.width * 0.5;
      this.y = gy - this.height * 0.5;
      return;
    }

    // wandering movement
    this.roam();

    // simple bounds correction handled by Actor.roam
  }

  draw() {
    push();
    imageMode(CENTER);
    const cx = this.x + this.width * 0.5;
    const cy = this.y + this.height * 0.5;
    if (this.sprite) {
      image(this.sprite, cx, cy, this.width, this.height);
    } else {
      // fallback gold coin drawing
      noStroke();
      fill(255, 215, 0);
      ellipse(cx, cy, this.width, this.height);
      stroke(120, 80, 0);
      noFill();
      ellipse(cx, cy, this.width * 0.7, this.height * 0.7);
    }
    pop();
  }

}
