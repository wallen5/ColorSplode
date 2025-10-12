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
        rect(0, 0, width, height);
      } else {
        flashScreen = false;
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