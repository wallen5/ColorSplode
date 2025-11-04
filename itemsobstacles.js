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

function makeItems(){
  allItems = [
    new Item("Magnet", magnet, "Buckets move slowly towards the mouse"), 
    new Item("Freeze", freeze, "Hovering over a bucket freezes it for a short time"),
    //new Item("Yarn Ball", placeholder, "Unfinished: Control the meow thing"),
    //new Item("Mixer", placeholder, "Unfinished: Combine two colors"),
    new Item("Blatant Copyright", totem, "Revive...like in Minecraft"),
    new Item("Bomb", bomb, "Destroy all the paint buckets. Press 'b' to use." ),
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
        image(explodeGif, explosionX, explosionY, 700, 700);
        pop();
        // Check if explosion duration is over
        if (timer > explosionDuration) {
          explosionActive = false;
        }
        ++timer;
      }
}