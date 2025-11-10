class Item {
    constructor(name, sprite, description) {
        this.name = name;
        this.sprite = sprite;
        this.description = description;
    }
}

module.exports = Item;

// Item Logic
class Player {

    constructor() {
        this.inventory = [];
        this.health = 3;
        this.startHealth = 3;
        this.invFrames = 2000;
        this.invStartTime = null;
    }

  startInvFrames() {
    this.invStartTime = millis();
  }

  isInvFrames() {
    
    if (this.invStartTime === null) return false;
    return (this.invStartTime !== null && (millis() - this.invStartTime) < this.invFrames);
  }

  addItem(item) {
    this.inventory.push(item);
    if (item.name === "Bomb") bombisReady = true;
    if(item.name === "Selective Pallet"){
      comboMultiplier += 0.25;
    }
    else if (item.name === "Thicker Brush")
    {
      baseScore += 1;
    }
    else  // Only remove items that AREN'T the brush and pallet
      allItems.splice(allItems.indexOf(item), 1);
  }

  removeItem(itemName) {
    this.inventory = this.inventory.filter(i => i.name !== itemName);
  }

  hasItem(itemName) {
    return this.inventory.some(i => i.name === itemName);
  }

  checkTotem(){ // Draws the flash effect if the totem has been triggered
    if (flashScreen) {
    let elapsed = millis() - flashTimer;
      if (elapsed < flashDuration) {
        fill(255, 255, 0, 150);
        noStroke();
        rect(gameX, gameY, gameLayer.width, gameLayer.height);
      } else {
        flashScreen = false;
      }
    }
  }

  drawHealth(){
    if(this.hasItem("Heart Canister") && this.startHealth == 3){
      this.health++;
      this.startHealth++;
    }
    for(let i = 0; i < this.health; ++i){
      if(player.health >= 1){
        image(heart, gs * (1300 - ((this.health - 3) * 15) + (i * 35)), gs * 990, gs * 30, gs * 30);
      }
    }
  }

  drawInventory() { // Draws player inventory so they can see their items
    push();
    let startX = 550 * gs;
    let startY = 950 * gs;
    let size = 40 * gs;
    let spacing = 10 * gs;

    for (let i = 0; i < player.inventory.length; i++) {
      let item = player.inventory[i];
      if (item.sprite) {
        image(item.sprite, startX + i * (size + spacing) + size, startY + size, size, size);
      }
    }
    pop();
  }
}

//
// The graffiti can moves over buckets (doesnt collide), then sprays an AOE
// and changes the color of the bucket
class Graffiti{
  constructor(x,y) {
    this.spawnX = x;
    this.spawnY = y;
    this.x = x;
    this.y = y;
    this.sprite = graffiti;
    this.size = 50;

    this.destX = 0;
    this.destY = 0;

    this.speed = 6.0; // Pixels per frame
    this.progress = 0.0; 
    this.active = true;

    this.target = random(ourCharacters);
    if (this.target) {
      this.destX = this.target.x + this.target.size / 2;
      this.destY = this.target.y + this.target.size / 2;
    } else {
      this.active = false;
    }

    this.sprayRadius = 150; // how far graffiti affects
    this.sprayed = false;   // ensure AOE happens once
  }


  update() {
    if (!this.active || !this.target || gamePaused) return;

    // Move toward destination
    let dx = this.destX - this.x;
    let dy = this.destY - this.y;
    let distToTarget = sqrt(dx * dx + dy * dy);

    if (distToTarget > this.speed) {
      this.x += (dx / distToTarget) * this.speed;
      this.y += (dy / distToTarget) * this.speed;
    } else if (!this.sprayed) {
      // reached the target
      this.spray();
      this.sprayed = true;
      // dissappear 
      setTimeout(() => {
      
        this.active = false;
        let index = graffitiActors.indexOf(this);
        if (index !== -1) {
        graffitiActors.splice(index, 1);
        }
      
      }, 2000);
    }
  }

spray() {
  for( let actor of ourCharacters) {
    let distToActor = dist(actor.x,actor.y, this.x,this.y);
    if (distToActor < this.sprayRadius) {
      actor.newRandomColor();
      actor.splode();   
    }
  }

  setTimeout(() => {
    let tempX = this.destX;
    let tempY = this.destY;

    this.destX = this.spawnX;
    this.destY = this.spawnY;

    this.x = tempX;
    this.y = tempY;
    }, 1000);

}

draw() {
  push();
  translate(this.x + this.size / 2, this.y + this.size / 2);
  imageMode(CENTER);
  //console.log("Graffiti sprite:", this.sprite);
  image(this.sprite, 0, 0, this.size, this.size);
  pop();
  }

  
}

function spawnGraffitiActor(amtSpawn) {

  if (gamePaused) {
    // Try again after 500ms
    setTimeout(() => spawnGraffitiActor(amtSpawn), 500);
    return;
  }

  let spawnFlip = random([ -1, 1 ]);

  let spawnX = width * 1.2 * spawnFlip;
  spawnFlip = random([-1, 1]);
  let spawnY = height * 1.2 * spawnFlip;
  let g = new Graffiti(spawnX, spawnY);
  graffitiActors.push(g);
  console.log("TRYING TO MAKE GRAFFITI");
  setTimeout(() => {
    if ((amtSpawn > 0) && (state === 2)) {
      spawnGraffitiActor(amtSpawn-1);
    }
    }, 1000);

}



function makeItems(){
  allItems = [
    new Item("Magnet", magnet, "Buckets move slowly towards the mouse"), 
    new Item("Freeze", freeze, "Hovering over a bucket freezes it for a short time"),
    //new Item("Yarn Ball", placeholder, "Unfinished: Control the meow thing"),
    //new Item("Mixer", placeholder, "Unfinished: Combine two colors"),
    new Item("Bomb", bomb, "Destroy all the paint buckets. Press 'b' to use." ),
    new Item("Totem of Varnish", totem, "Revive...like in Minecraft"),
    new Item("Paint Scraper", scraper, "Heal after a combo of 5+"),
    //new Item("Lock", placeholder, "Unfinished: Lock a zone to prevent movement"),
    //new Item("Sponge", placeholder, "Unfinished: Will soak up paint")
    new Item("Paint Thinner", thinner, "Sploded Buckets remove nearby buckets"),
    new Item("Heart Canister", heart, "Start each level with an extra heart"),
    new Item("Thicker Brush", thickerBrush, "Increases base score by +1 (stackable)"),
    new Item("Selective Pallet", selectivePallet, "Increases combo multiplier by .25x (stackable)")
  ];
}

let bombisReady = false;
//let explosion;

function dropBomb(){
  if (bPressed && bombisReady){
    //reset animation timer: used in drawExplosion()
    timer = 0;

    //reset animation
    explodeGif.reset();

    //play sound effect
    bombSound.play();
    
    //Remove bomb fron inventory
    bombisReady = false;
    player.removeItem("Bomb");

    // activates explosion animation, in drawExplosion()
    explosionActive = true;

    //remove paint buckets
    spawnLogic.activeActors = 0;
    ourCharacters = [];
    time = 0;
    
    // Store original spawn logic
    const originalTimer = spawnLogic.timer;
    const originalTimeToSpawn = spawnLogic.timeToSpawn;
    
    // Stop spawning
    spawnLogic.rate = 0;
    let actorsDestroyed = spawnLogic.activeActors; 
    score += actorsDestroyed;  // Add score based on number of actors destroyed

    bPressed = false;

    // Resume spawning after 3 seconds
    setTimeout(() => {
      spawnLogic.rate = 1;
      spawnLogic.timer = originalTimer;
      spawnLogic.timeToSpawn = originalTimeToSpawn;
    }, 3000);
  }
}

function drawExplosion(){
  // Draw explosion if active
      if (explosionActive) {
        push();
        imageMode(CENTER);
        image(explodeGif, 400 * gs + gameX, 400 * gs + gameY, 700 * gs + gameX, 700 * gs + gameY);
        pop();
        // Check if explosion duration is over
        if (timer > explosionDuration) {
          explosionActive = false;
        }
        ++timer;
      }
}

