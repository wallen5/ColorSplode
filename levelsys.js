class Level {
  constructor(difficulty, bossKey, lives, maxLives) {
    this.difficulty = difficulty;
    this.bossKey = bossKey;
    this.scoreThreshold = 1;
    this.obstacle = [];
    this.boss = null;
    this.colorZones = [];
    this.allActors = [];
    this.vents = [];
    this.maxVents = 4;
    this.ventSpawnTimer = 0;
    this.ventSpawnInterval = 20000;
    this.initLevel = false;
    this.score = 0;
    this.currentColor;
    this.currentCombo = 0;
    this.gameOver = false; 
    this.player = new Player(lives, maxLives);
    this.mode = "NONE";
  }

  setup() {
    if (this.initLevel) return;
    if(this.mode == "ROUGE"){
      this.setDifficulty(this.difficulty);
    }
    this.createRandomZones();
    if (this.vents.length < this.maxVents){
      this.createRandomVent();
    }
    this.initLevel = true;
    this.ventSpawnTimer = millis();
  }

  setDifficulty(difficulty) {
    if(difficulty >= 2){
      this.setObstacle();
      this.scoreThreshold = 1;
    }
    if(difficulty == 3){
      this.setBoss();
      this.scoreThreshold = this.boss.maxHealth;
    }

    for(let sp of this.vents){
      switch(difficulty){
      case 1:
        sp.spawnIncrease = 0.0046296;
        break;

      case 2:
        sp.spawnIncrease = 0.008342;
        break;

      case 3:
        sp.spawnIncrease = 0.01;
        break;
      }
    }
  }

  setObstacle() {
    const w = 50, h = 50;

    if (this.bossKey <= 1) {
      this.obstacle.push(new Cat(canvasWidth / 2, canvasHeight / 2, w * 1.2, h * 1.2, catSprite));
      console.log("cat");
    } else if (this.bossKey <= 2) {
      this.obstacle.push(new rougeBucket(canvasWidth / 2, canvasHeight / 2, w, h, rougeBucketSprite));
      console.log("rougeBucket");
    } else {
      this.obstacle = [];
    }

    for(let obstacle of this.obstacle){
      if (obstacle instanceof rougeBucket) {
        this.allActors.push(obstacle);
      }
    }
  }

  setBoss(){
    const w = 50, h = 50;

    if (this.bossKey <= 1) {
      this.boss = new Boss("Carmine Queen", 100, canvasWidth / 2, canvasHeight / 2, w, h, carmineIdle, carmineIdle, carmineSpec);
      console.log("Carmine Queen");
    } else if (this.bossKey <= 2) {
      this.boss = new Boss("Garnet Grimjack", 100, canvasWidth / 2, canvasHeight / 2, w, h, garnetIdle, garnetIdle, garnetSpec);
      console.log("Garnet Grimjack");
    } else {
      this.boss = null;
    }
  }

  update(){
    //if (!this.initLevel) return;

    for (let sp of this.vents) {
      if(!this.gameOver) sp.update(this);
    }
    //this.score = 0;
    // collect any coins clicked this frame
    const collected = [];
    for (let actor of this.allActors) {
      if(!this.gameOver) actor.update(this);
      if(!actor.alive && !actor.sorted){ this.player.lives -= 1; }

      // Coin collection: when a Coin is grabbed (player clicked it), increment player's coins and mark for removal
      if (typeof Coin !== 'undefined' && actor instanceof Coin) {
        // many coin implementations use a 'grabbed' flag when clicked
        if (actor.grabbed && !actor.scored) {
          this.player.coins = (this.player.coins || 0) + (actor.walletValue || 1);
          actor.scored = true; // mark handled
          collected.push(actor);
        }
      }
    }

    // remove collected coins from the actor list
    if (collected.length) {
      this.allActors = this.allActors.filter(a => !collected.includes(a));
    }
    if(this.player.lives <= 0){
      this.player.alive = false;
      this.gameOver = true; 
    }

    for(let obstacle of this.obstacle){
      obstacle.update(this);
    }

    if(this.boss){
      this.boss.update(this);
    }

    // Auto-spawn vents
    if (!this.gameOver && this.vents.length < this.maxVents) {
      if (millis() - this.ventSpawnTimer >= this.ventSpawnInterval) {
        this.createRandomVent();
        this.ventSpawnTimer = millis();
      }
    }
  }

  addScore(actor)
  {
    console.log("Add score");
    if(this.currentColor != actor.color)
    {
      console.log("New combo");
      console.log(this.currentColor)
      this.currentColor = actor.color;
      this.currentCombo = 1;
    }else
    {
      this.currentCombo++;
    }
    this.score += this.player.baseScore + round((this.currentCombo - 1) * this.player.comboMult);
    this.boss.health -= this.player.baseScore + round((this.currentCombo - 1) * this.player.comboMult);
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
      imageMode(CORNER);
      image(sp.texture, sp.x, sp.y, sp.width, sp.height);
      pop();
    }
    //this.score = 0;
    for (let actor of this.allActors) {
      actor.draw();
    }
    for(let obstacle of this.obstacle){
      obstacle.draw();
    }
    if(this.boss){
      this.boss.draw();
    }
  }

  splodeActors(){
    for (let actor of this.allActors) {
      if(!actor.sorted){actor.sprite =  deathSprite[actor.color]; actor.alive = false; }
    }
  }

  createRandomZones() {
    const zoneWidth = 150, zoneHeight = 150, inset = 25;
    let zoneColor = shuffle([0, 1, 2, 3]);
    let zoneMap; 
    if (this.mode === "ROUGE"){
      zoneMap = floor(random(0, 3));
    } else {zoneMap = 0;}
    this.currentZoneMap = zoneMap;

    switch(zoneMap){
      case 0: //corners
        this.colorZones = [
          new Zone(canvasWidth - zoneWidth - inset, canvasHeight - zoneHeight - inset, zoneWidth, zoneHeight, zoneColor[0]),
          new Zone(inset,                        canvasHeight - zoneHeight - inset, zoneWidth, zoneHeight, zoneColor[1]),
          new Zone(canvasWidth - zoneWidth - inset, inset,                         zoneWidth, zoneHeight, zoneColor[2]),
          new Zone(inset,                        inset,                         zoneWidth, zoneHeight, zoneColor[3]),
        ];
        break;
      case 1: //middle ends
        this.colorZones = [
          new Zone(canvasWidth - zoneWidth - inset, (canvasHeight / 2) + (inset * 3.5), zoneWidth, zoneHeight, zoneColor[0]), //bottom right
          new Zone(inset,                        (canvasHeight / 2) + (inset * 3.5), zoneWidth, zoneHeight, zoneColor[1]), //bottom left
          new Zone(canvasWidth - zoneWidth - inset, (canvasHeight / 2) - (inset * 3.5),                         zoneWidth, zoneHeight, zoneColor[2]), //top right
          new Zone(inset,                        (canvasHeight / 2) - (inset * 3.5),                         zoneWidth, zoneHeight, zoneColor[3]), //top left
        ];
        break;
      case 2: //bottom
        this.colorZones = [
          new Zone(canvasWidth - zoneWidth - inset, canvasHeight - zoneHeight - inset, zoneWidth, zoneHeight, zoneColor[0]),
          new Zone(inset,                        canvasHeight - zoneHeight - inset, zoneWidth, zoneHeight, zoneColor[1]),
          new Zone(canvasWidth - zoneWidth - (inset * 9), canvasHeight - zoneHeight - inset,                         zoneWidth, zoneHeight, zoneColor[2]),
          new Zone(inset * 9,                        canvasHeight - zoneHeight - inset,                         zoneWidth, zoneHeight, zoneColor[3]),
        ];
    }
  }

  createRandomVent() {
    if (this.vents.length >= this.maxVents) return;

    const walls = [
      { x: () => random(50, canvasWidth-100), y: () => 0, w: 70, h: 40, wallIndex: 0, tex: ventTop },
      { x: () => random(50, canvasWidth-100), y: () => canvasHeight-40, w: 70, h: 40, wallIndex: 1, tex: ventBottom },
      { x: () => 0, y: () => random(50, canvasHeight-100), w: 40, h: 70, wallIndex: 2, tex: ventLeft },
      { x: () => canvasWidth-40, y: () => random(50, canvasHeight-100), w: 40, h: 70, wallIndex: 3, tex: ventRight }
    ];

    const margin = 60, maxPerWall = this.currentZoneMap === 2 ? 2 : 1;

    for (let attempt = 0; attempt < 50; attempt++) {
      const wall = random(walls.filter(w => this.vents.filter(v =>
        (w.wallIndex===0 && v.y===0) || (w.wallIndex===1 && v.y+v.height===canvasHeight) ||
        (w.wallIndex===2 && v.x===0) || (w.wallIndex===3 && v.x+v.width===canvasWidth)
      ).length < maxPerWall));

      if (!wall) continue;

      const vent = { x: wall.x(), y: wall.y(), width: wall.w, height: wall.h, tex: wall.tex };
      const conflict = this.colorZones.concat(this.vents).some(z =>
        vent.x < z.x + z.width + margin &&
        vent.x + vent.width > z.x - margin &&
        vent.y < z.y + z.height + margin &&
        vent.y + vent.height > z.y - margin
      );

      if (!conflict) { this.vents.push(new SpawnPoint(vent.x, vent.y, vent.width, vent.height, Color.GRAY, vent.tex)); return; }
    }

    this.vents.push(new SpawnPoint(vent.x, vent.y, vent.width, vent.height, Color.GRAY, vent.tex));
  }
}

class Player {
  constructor(lives, maxLives){
    this.alive = true;
    this.lives = lives;
    this.maxLives = maxLives;
    this.coins = 0;
    this.baseScore = 1;
    this.comboMult = 1.0;
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

    this.spawnRate = 7; // seconds per spawn
    this.spawnIncrease = 0.0046296;
    this.lastSpawnTime = 0; // when the last spawn happened (ms)
    this.shouldSpawn = true;

    this.texture = tex;
  }

  update(level) {
    if(this.spawnRate > 2){
      this.spawnRate -= this.spawnIncrease;
    }

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
    // Chance to spawn a Coin instead of a Bucket
    const COIN_SPAWN_CHANCE = 0.15; // 15% chance
    if (typeof Coin !== 'undefined' && random() < COIN_SPAWN_CHANCE) {
      const coinSize = 24;
      const coin = new Coin(x, y, coinSize, null);
      level.allActors.push(coin);
    } else {
      const actor = new Bucket(x, y, 45, 45, floor(random(4)));
      level.allActors.push(actor);
    }
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
