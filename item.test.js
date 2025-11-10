const Item = require('./itemsobstacles');

describe('Item Class', () => { 
    test('testing constructor', () => {
        const name = "Health";
        const sprite = "heart.png";
        const description = "Restores HP";

        const item = new Item(name, sprite, description);

        expect(item.name).toBe(name);
        expect(item.sprite).toBe(sprite);
        expect(item.description).toBe(description);
    });

    test('independent items testing', () => {
        const item1 = new Item("Sword", "sword.png", "blade");
        const item2 = new Item("Shield", "shield.png", "protection");

        expect(item1.name).not.toBe(item2.name);
        expect(item1.sprite).not.toBe(item2.sprite);
        expect(item1.description).not.toBe(item2.description);
    });
});