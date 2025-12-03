const itemID = ["MAGNET", "FREEZE", "TOTEM", "BOMB"];

class Item {
    constructor(id, sprite){
        this.id = id;
        this.sprite = sprite;
    }
}

class PermItem extends Item {
    constructor(id, sprite, cost, description = "") {
        super(id, sprite);
        this.cost = cost;        // coin cost to purchase
        this.bought = 0;         // number of times purchased
        this.description = description;
    }

    applyUpgrade(player) { 
      switch (this.id) { 
        case "WET PALETTE":

        break;
        
        case "HEART":
         player.lives += 1;
         player.maxLives += 1;

        break;

        case "ABRASIVE BRUSH":

        break;

      }
    }
    
}

  


let ITEM_POOL = [];
let PERM_ITEMS = [];

function itemEffectMagnet(level) {
  const magnetWidth = 25;
  const magnetHeight = 25;
  const mx = mouseX - gameOffsetX;
  const my = mouseY - gameOffsetY;
  const x = mx - magnetWidth / 2;
  const y = my - magnetHeight / 2;

  for (let actor of level.allActors) {
    if (rectsOverlap(x, y, magnetWidth, magnetHeight, actor.x, actor.y, actor.width, actor.height)) {
      // calculate center of actor
      const ax = actor.x + actor.width / 2;
      const ay = actor.y + actor.height / 2;

      // direction vector from actor to mouse
      const dx = mx - ax;
      const dy = my - ay;

      // distance between actor and mouse
      const distToMouse = Math.sqrt(dx * dx + dy * dy);

      if (distToMouse > 1) { // avoid jitter when too close
        // normalize and apply magnet strength
        const strength = 3.0; // tweak this for how strong the pull is
        const stepX = (dx / distToMouse) * strength;
        const stepY = (dy / distToMouse) * strength;

        actor.x += stepX;
        actor.y += stepY;
      }
    }
  }
}

function itemEffectScrape(level, splodingActor) {
  const scrapeRadius = 25;
  const x = splodingActor.x
  const y = splodingActor.y


  for (let actor of level.allActors) {
    if (rectsOverlap(x, y, scrapeRadius, scrapeRadius, actor.x, actor.y, actor.width, actor.height)) {
      actor.maxTimeAlive += 3000;
    }
  }

  // Scrape the paint (make a hole where the actor is)
  paintLayer.push();
  paintLayer.erase();
  paintLayer.circle(x, y, scrapeRadius);   // or rect(), or line(), etc.
  paintLayer.noErase();
  paintLayer.pop();
}

function itemEffectFreeze(level) {
  const magnetWidth = 15;
  const magnetHeight = 15;
  const mx = mouseX - gameOffsetX;
  const my = mouseY - gameOffsetY;
  const x = mx - magnetWidth / 2;
  const y = my - magnetHeight / 2;

  for (let actor of level.allActors) {
    if (rectsOverlap(x, y, magnetWidth, magnetHeight, actor.x, actor.y, actor.width, actor.height)) {
      if (actor.freezeActor instanceof Function) {
        actor.freezeActor();
      }
    }
  }
}

let bombTimer = 0;

function itemEffectBomb(level){
  //timer from bomb gif
  bombTimer = 140;
  
  explodeGif.reset();
  bombSound.play();

  // add scores
  for (let actor of level.allActors) {
    level.addScore(actor);
  }
  
  // erase buckets
  level.allActors = [];
}

