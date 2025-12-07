class Button {
    constructor(x, y, width, height, normalColor, hoverColor, text, onClick) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.normalColor = normalColor;
        this.hoverColor = hoverColor;
        this.text = text;
        this.onClick = onClick;
        this.fontSize = 20;
        this.minFontSize = 8;

        // create sprite ONCE
        push()
        textSize(this.fontSize);
        this.sprite = new Sprite(this.x, this.y);
        this.sprite.width = this.width;
        this.sprite.height = this.height;
        this.sprite.color = normalColor;
        this.sprite.text = text;
        pop();

        this.fitText();
    }
    
    // Call this once, this will re-initialize the button! (for buttons that are only drawn once then leave the screen)
    draw()
    {
        // create sprite ONCE
        this.sprite = new Sprite(this.x, this.y);
        this.sprite.width = this.width;
        this.sprite.height = this.height;
        this.sprite.color = this.normalColor;
        this.sprite.text = this.text;
    }

    fitText() {
        let size = this.fontSize;

        // shrink text until it fits
        while (size > this.minFontSize) {
            push();
            textSize(size);
            let w = textWidth(this.text);
            const h = textAscent() + textDescent(); // rendered height
            pop();

            if (w <= this.width - 20 && h <= this.height) break;
            size--;
        }

        this.fontSize = size;
        this.sprite.textSize = size;
    }

    update() {
        if(!this.sprite) return; // Checks if there isn't a sprite and then returns it
        if (this.sprite.mouse.hovering())
            this.sprite.color = this.hoverColor;
        else
            this.sprite.color = this.normalColor;

        let currentSize = this.sprite.fontSize;
        this.fitText();
        this.sprite.x = buttonBaseX + this.x;
        this.sprite.y = buttonBaseY + this.y;
        if(this.sprite.mouse.pressed())
        {
            this.onClick();
        }
    }

    // Removes the button by simply removing the sprite
    remove()
    {
        console.log("Remove Sprite!");
        this.sprite.remove();
        this.sprite = null;
    }
}
