class Level {
  constructor(score, lives, maxLives) {
    this.scoreThreshold = score;
    this.obstacle = null;
    this.colorZones = [];
    this.allActors = [];
    this.vents = [];
    this.initLevel = false;
    this.score = 0;
    this.gameOver = false; 
    this.player = new Player(lives, maxLives);
    this.mode = "NONE";
  }

  setup() {
    if(this.mode == "ROUGE"){
      this.setObstacle();
    }
    this.createRandomZones();
    this.createRandomVent();
    this.initLevel = true;
  }

  setObstacle() {
    const rand = random(3);
    const w = 50, h = 50;

    if (rand <= 1) {
      this.obstacle = new Cat(canvasWidth / 2, canvasHeight / 2, w, h, catSprite);

    } else if (rand <= 2) {
      this.obstacle = new EnemyBucket(canvasWidth / 2, canvasHeight / 2, w, h, rougeBucketSprite);

    } else {
      this.obstacle = null;
    }
  }

  update(){
    console.log("player lives: " + this.player.lives);
    for (let sp of this.vents) {
      if(!this.gameOver) sp.update(this);
    }
    this.score = 0;
    for (let actor of this.allActors) {
      if(!this.gameOver) actor.update(this);
      if(actor.sorted){ this.score = this.score + 1; }
      if(!actor.alive && !actor.sorted){ this.player.lives -= 1; } // maybe put this somewhere else?
    }
    if(this.player.lives <= 0){
      this.player.alive = false;
      this.gameOver = true; 
    }
    if(this.obstacle){
      this.obstacle.update(this);
    }

  }

  draw() {
    for (let zone of this.colorZones) {
      push();
      fill(SOFTPALETTE[zone.color]);
      strokeWeight(zone.borderWidth);
      rect(zone.x, zone.y, zone.width, zone.height);
      pop();
    }
    for (let sp of this.vents) {
      push();
      fill(PALETTE[sp.color]);
      image(sp.texture, sp.x, sp.y, sp.width, sp.height);
      pop();
    }
    this.score = 0;
    for (let actor of this.allActors) {
      actor.draw();
    }
    if(this.obstacle){
      this.obstacle.draw();
    }
  }

  splodeActors(){
    for (let actor of this.allActors) {
      if(!actor.sorted){actor.sprite =  deathSprite[actor.color]; actor.alive = false; actor.fixDeathAnim();}
    }
  }

  createRandomZones() {
    const zoneWidth = 150, zoneHeight = 150, inset = 25;
    let zoneColor = shuffle([0, 1, 2, 3]);

    this.colorZones = [
      new Zone(canvasWidth - zoneWidth - inset, canvasHeight - zoneHeight - inset, zoneWidth, zoneHeight, zoneColor[0]),
      new Zone(inset,                        canvasHeight - zoneHeight - inset, zoneWidth, zoneHeight, zoneColor[1]),
      new Zone(canvasWidth - zoneWidth - inset, inset,                         zoneWidth, zoneHeight, zoneColor[2]),
      new Zone(inset,                        inset,                         zoneWidth, zoneHeight, zoneColor[3]),
    ];
  }

  createRandomVent() {
    const wall = int(random(4)); // 0=top, 1=bottom, 2=left, 3=right
    let ventWidth = 50, ventHeight = 75;
    let x, y, texture;

    switch (wall) {
      case 0: // top
        x = canvasWidth / 2 - ventWidth / 2;
        y = 0;
        texture = ventTop;
        break;
      case 1: // bottom
        x = canvasWidth / 2 - ventWidth / 2;
        y = canvasHeight - ventHeight;
        texture = ventBottom;
        break;
      case 2: // left
        ventWidth = 75; ventHeight = 50;
        x = 0;
        y = canvasHeight / 2 - ventHeight / 2;
        texture = ventLeft;
        break;
      default: // right
        ventWidth = 75; ventHeight = 50;
        x = canvasWidth - ventWidth;
        y = canvasHeight / 2 - ventHeight / 2;
        texture = ventRight;
        break;
    }

    this.vents.push(new SpawnPoint(x, y, ventWidth, ventHeight, Color.GRAY, texture));
  }
}

class Player {
  constructor(lives, maxLives){
    this.alive = true;
    this.lives = lives;
    this.maxLives = maxLives;
  }
}

class Zone {
    constructor(x, y, width, height, color){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.borderWidth = 4;
    }
}

class SpawnPoint {
  constructor(x, y, width, height, color, tex) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;

    this.spawnRate = 1; // seconds per spawn
    this.lastSpawnTime = 0; // when the last spawn happened (ms)
    this.shouldSpawn = true;

    this.texture = tex;
  }

  update(level) {
    // Check time elapsed since last spawn
    if (millis() - this.lastSpawnTime >= this.spawnRate * 1000 && this.shouldSpawn) {
      this.spawnActor(level);
      this.lastSpawnTime = millis();
    }
  }

  spawnActor(level) {
    // spawn new Actor inside the spawnpoint rectangle
    const x = this.x + this.width / 2 - 15;  // center it
    const y = this.y + this.height / 2 - 15;
    const actor = new Bucket(x, y, 45, 45, floor(random(4)));

    level.allActors.push(actor);
  }
}

class AudioManager {
  constructor(s){
    this.current = s;
  }
  play(){
    this.current.play();
  }
  stop(){
    this.current.stop();
  }
}