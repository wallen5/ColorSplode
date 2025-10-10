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
}