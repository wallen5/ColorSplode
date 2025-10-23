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
        image(heart, 1000 - ((this.health - 3) * 15) + (i * 35), 990, 30, 30);
      }
    }
  }

  drawInventory() { // Draws player inventory so they can see their items
    push();
    let startX = 320;
    let startY = 950;
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
    new Item("Totem of Varnish", totem, "Revive...like in REDACTED"),
    new Item("Paint Scraper", scraper, "Heal after achieving a Combo of 5+"),
    //new Item("Lock", placeholder, "Unfinished: Lock a zone to prevent movement"),
    //new Item("Sponge", placeholder, "Unfinished: Will soak up paint")
    new Item("Paint Thinner", thinner, "Sploded Buckets remove nearby buckets"),
    new Item("Heart Canister", heart, "Start each level with an extra heart")
  ];
}