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
  }
  // center x and y
  get cx() { return this.x + this.width  * 0.5; }
  get cy() { return this.y + this.height * 0.5; }
  // radius 
  get r () { return 0.5 * Math.max(this.width, this.height); }

  draw() {
    push();
    imageMode(CENTER);
    image(this.sprite, this.cx, this.cy, this.width, this.height);
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

    this.maxTimeAlive = 14000;
    this.wobbleTime   = 5000;
    this.alive        = true;

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
      if (this.freeze) tint('blue');
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
      if (this.freeze) tint('blue');
      image(this.sprite, 0, 0, this.width, this.height);
      pop();

    } else {
      push();
      imageMode(CENTER);
      if (this.freeze) tint('blue');
      image(this.sprite, this.cx, this.cy, this.width, this.height);
      pop();
    }
  }

  roam() {
    this.moveAngle += random(-0.12, 0.12);
    this.x += cos(this.moveAngle) * this.speed;
    this.y += sin(this.moveAngle) * this.speed;

    // canvas edge bounce
    if (this.x < 0) { this.x = 0; this.moveAngle = PI - this.moveAngle; }
    else if (this.x > width - this.width) { this.x = width - this.width; this.moveAngle = PI - this.moveAngle; }
    if (this.y < 0) { this.y = 0; this.moveAngle = -this.moveAngle; }
    else if (this.y > height - this.height) { this.y = height - this.height; this.moveAngle = -this.moveAngle; }
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

    if(!this.freed){
      for (let zone of level.colorZones) {
        const overlap = rectsOverlap(
          this.x, this.y, this.width, this.height,
          zone.x, zone.y, zone.width, zone.height
        );

        if (overlap) {
          if (this.color === zone.color) {
            this.sorted = true;
            zone.count += 1;
          }
          break;
        }
      }
    }

    if (this.grabbed) {
      this.x = mouseX;
      this.y = mouseY;
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
    this.grabbed = false;
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
    if (!this.target || !this.target.alive || this.target.sorted) this.findTarget(level);
    if (this.target && !this.grabbed) this.moveTowardTarget();
    if (this.grabbed) { this.x = mouseX; this.y = mouseY; }
  }
}

// Enemy frees sorted actors
class EnemyBucket extends Actor {
  constructor(x, y, width, height, sprite) {
    super(x, y, width, height, sprite);
    this.target = null;
    this.speed = 2.5;
    this.freeRange = 30;
    this.grabbed = false;
  }

  findTarget(level) {
    for (let actor of level.allActors) {
      if (actor.sorted) { this.target = actor; if (random(10) <= 2) return; }
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