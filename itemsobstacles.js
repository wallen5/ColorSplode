class Item {
    constructor(name, sprite, description) {
        this.name = name;
        this.sprite = sprite;
        this.description = description;
    }
}

  // Item Logic
class Player {

    constructor() {
        this.inventory = [];
        this.health = 3;
        this.startHealth = 3;
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
        rect(0, 0, width, height);
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
        image(heart, 350 - ((this.health - 3) * 15) + (i * 35), 765, 30, 30);
      }
    }
  }

  drawInventory() { // Draws player inventory so they can see their items
    push();
    let startX = 250;
    let startY = -10;
    let size = 40;
    let spacing = 10;

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

    this.sprayRadius = 200; // how far graffiti affects
    this.sprayed = false;   // ensure AOE happens once
  }


  update() {
    if (!this.active || !this.target) return;

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
  image(this.sprite, 0, 0, this.size, this.size);
  pop();
  }

  
}

function spawnGraffitiActor(amtSpawn) {
  let spawnFlip = random([ -1, 1 ]);
  let spawnX = width * 1.2 * spawnFlip;
  spawnFlip = random([-1, 1]);
  let spawnY = height * 1.2 * spawnFlip;
  let g = new Graffiti(spawnX, spawnY);
  graffitiActors.push(g);
  console.log("TRYING TO MAKE GRAFFITI");
  setTimeout(() => {
    if (amtSpawn > 0) {
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
    new Item("Blatant Copyright", totem, "Revive...like in Minecraft"),
    new Item("Bomb", bomb, "Destroy all the paint buckets in the click of a button. Press 'b' to use." ),
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
  if (key.toLowerCase() === 'b' && bombisReady){
    //play sound effect
    bombSound.play();
    explodeGif.play();
    
    //Remove bomb fron inventory
    bombisReady = false;
    player.removeItem("Bomb");

    // Start explosion animation
    explosionActive = true;

    //remove paint buckets
    spawnLogic.activeActors = 0;
    ourCharacters = [];
    time = 0;
    
    // Store original
    const originalTimer = spawnLogic.timer;
    const originalTimeToSpawn = spawnLogic.timeToSpawn;
    
    // Stop spawning
    spawnLogic.rate = 0;
    let actorsDestroyed = spawnLogic.activeActors; 
    score += actorsDestroyed;  // Add score based on number of actors destroyed

    // Resume spawning after 5 seconds
    setTimeout(() => {
      spawnLogic.rate = 1;
      spawnLogic.timer = originalTimer;
      spawnLogic.timeToSpawn = originalTimeToSpawn;
    }, 5000);

    //explodeGif.position(50,350);
  }
}

function drawExplosion(){
  // Draw explosion if active
      if (explosionActive) {
        push();
        imageMode(CENTER);
        image(explodeGif, explosionX, explosionY, 700, 700);
        pop();
        // Check if explosion duration is over
        if (timer > explosionDuration) {
          explosionActive = false;
        }
        ++timer;
      }
}

