/**
* Methods and properties of whole application
*/
const application = {
    arcPath: (2 * Math.PI),
    degrToRad: (degrees) => (Math.PI / 180) * degrees,
    isUndefined: (param) => typeof (param) === 'undefined',
    roundTwoDigits: (param) => (Math.round(param * 100) / 100),
    kgToNewton: (kg) =>  kg * 9.8,
    
    /**
    * Gets value of global CSS variable
    * @param {string} varName Variable name in CSS file 
    */
    getRootVarCSS: (varName) => {
        let root = document.querySelector(':root');
        let rootStyles = getComputedStyle(root);
        return rootStyles.getPropertyValue(varName);
    },
    // validates decimal numbers
    isNumber: (n) => !isNaN(parseFloat(n)) && isFinite(n),




    // not required
    getFrameElement: (elementName) => document.getElementById('myframe1').contentWindow.document.getElementById(elementName),
    roundOneDigit: (param) => (Math.round(param * 10) / 10),
    round: (param, step) => {
        step || (step = 1.0);
        var inv = 1.0 / step;
        return Math.round(param * inv) / inv;
    },
    getElementById: (elementName) => document.getElementById(elementName),
}// application


/**
* Elements by their ID from whole application
*/
const appElements = {
    canvas: document.getElementById("Canvas"),
    context: document.getElementById("Canvas") != undefined ? document.getElementById("Canvas").getContext("2d") : undefined,
}// appElements


/**
* Functions related to canvas
*/
const contextLayout = {

    /**
    * clears whole canvas area
    */
    clearCanvas: function (canvas) {
        let context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
    },// clearCanvas

    /**
    * rotates canvas around a point
    */
    rotateCanvas: function (context, x, y, angle) {
        context.translate(x, y);
        context.rotate(application.degrToRad(angle));
        context.translate(-x, -y);
    },// rotateCanvas

    /**
    * fits canvas size to element
    */
    stretchCanvas: function (canvas, elementName) {
        let div = document.getElementById(elementName);
        canvas.width = div.clientWidth;
        canvas.height = div.clientHeight;
    },// stretchCanvas


    /**
    * sets shadow for canvas 
    */
    applyShadow: function (context) {
        context.shadowColor = '#464646';
        context.shadowOffsetX = 5;
        context.shadowOffsetY = 5;
        context.shadowBlur = 5;
    },// applyShadow

    /**
    * draws text aligned to center 
    */
    drawCenterText: function (context, font, text, x, y) {
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = font;
        context.fillText(text, x, y);
    },// drawCenterText


    /**
    * rectangle with rounded corners
    */
    roundRect: function (context, x, y, width, height, radius, lineWidth = 0, fill = "white") {
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        context.save();
        context.beginPath();

        context.moveTo(x + radius, y);
        context.arcTo(x + width, y, x + width, y + height, radius);
        context.arcTo(x + width, y + height, x, y + height, radius);
        context.arcTo(x, y + height, x, y, radius);
        context.arcTo(x, y, x + width, y, radius);
        context.lineWidth = lineWidth;
        context.fillStyle = fill;

        if (lineWidth > 0) {
            context.stroke();
        }

        context.closePath();
        context.fill();

        context.restore();
    }// roundRect


}// contextLayout


/**
* functions related to dragging of items on canvas
*/
const dragRendering = {

    //canvas for drawing
    canvas: undefined,

    //elements on stage with id of an element and an element (see stageElement.js) in particular
    dragElements: [{ id: undefined, isDraggable : true, elem: undefined }],

    /**
     * custom function to determine end of dragging
     * @param {*} elem stopped dragging element
     */
    stoppedDragging: function (elem) { },

        /**
     * custom function to determine begin of dragging
     * @param {*} elem started dragging element
     */
    startedDragging: function (elem) { },

    /**
    * custom function to draw on canvas during dragging
    */
    refresh: function () { },

    startMouseX: 0,
    startMouseY: 0,

    /**
    * adds dragging elements
    */
    addElements: function (elements) {
        this.dragElements = elements.slice();
        this.dragElements.forEach(element => {  element.isDraggable = true; });
        this.drawElements();
    },

    /**
    * Searches for an dragging element by id
    */
    findElem: function (id) {
        return this.dragElements.find(el => el.id === id).elem;
    },


    /**
    * Searches for an dragging element by id
    */
   findDragElem: function (id) {
    return this.dragElements.find(el => el.id === id);
},

    /**
    * draws an each item in the dragElements[] array
    */
    drawElements: function () {
        for (let i = 0; i < this.dragElements.length; i++) {
            let el = this.dragElements[i].elem;
            el.draw();
        }
    },

    /**
    * redraws whole canvas area
    */
    redraw: function () {
        contextLayout.clearCanvas(this.canvas);
        this.refresh();
        this.drawElements();

    },// redraw

    /**
    * mouse down event for canvas 
    */
    canvasMouseDown: function (e) {
        let coord = this.elementCoord(e);

        e.preventDefault();
        e.stopPropagation();
        if (this.dragElements.length > 0) {
            // get the current mouse position
            let mx = coord.mx;
            let my = coord.my;

            // test each movable item if mouse is inside
            for (let i = 0; i < this.dragElements.length; i++) {
                let el = this.dragElements[i];
                let conditionEnter = this.isPointerInElement(e, el.elem);
                if (conditionEnter && el.isDraggable) {
                    el.isDragging = true;
                    this.startedDragging(el);
                    this.canvas.style.cursor = 'pointer';
                    break;
                }
            }
            // save the current mouse position
            this.startMouseX = mx;
            this.startMouseY = my;
        }
    },// canvasMouseDown

    /**
    * mouse up event for canvas
    */
    canvasMouseUp: function (e) {
        // handling  of mouse event
        e.preventDefault();
        e.stopPropagation();

        if (this.dragElements.length > 0) {
            var dragElem = this.dragElements.find(el => el.isDragging === true);

            // clear all the dragging flags
            if (dragElem !== undefined) {
                var dragElem = this.dragElements.find(el => el.isDragging === true);
                this.stoppedDragging(dragElem);
                dragElem.isDragging = false;
            }

        }

    },// canvasMouseUp

    /**
    * gets the current mouse positions
    */
    elementCoord: function (e) {
        let canvasX = this.canvas.getBoundingClientRect().left;
        let canvasY = this.canvas.getBoundingClientRect().top;

        let mx = parseInt(e.clientX - canvasX);
        let my = parseInt(e.clientY - canvasY);
        return { mx, my };

    },// elementCoord

    // checks if pointer inside an element
    isPointerInElement: function (e, el) {
        let element = this.elementCoord(e);
        let conditionEnter = (element.mx > el.x && element.mx < el.x + el.width && element.my > el.y && element.my < el.y + el.height);
        return conditionEnter;

    },// isPointerInElement


    /**
    * mouse move event for canvas
    */
    canvasMouseMove: function (e) {
        e.preventDefault();
        e.stopPropagation();
        let conditionEnter = false;
        let coord = this.elementCoord(e);
        let mx = coord.mx;
        let my = coord.my;

        if (this.dragElements.length > 0) {
            for (var i = 0; i < this.dragElements.length; i++) {
                var el = this.dragElements[i];
                if(el.isDraggable)
                {
                    conditionEnter = this.isPointerInElement(e, el.elem);
                    if (conditionEnter) {
                        break;
                    }
                }
            }

            this.canvas.style.cursor = conditionEnter ? 'pointer' : 'default';
            var dragElem = this.dragElements.find(el => el.isDragging === true && el.isDraggable === true);

            // if user is dragging anything
            if (dragElem !== undefined) {

                // calculate the distance the mouse has moved
                let dx = mx - this.startMouseX;
                let dy = my - this.startMouseY;

                // move each movable item 
                for (var i = 0; i < this.dragElements.length; i++) {
                    var el = this.dragElements[i];
                    if (el.isDragging) {
                        el.elem.x += dx;
                        el.elem.y += dy;
                    }
                }

                // redraw the scene with the new items' positions
                this.redraw();

                // reset the starting mouse position for the next mousemove
                this.startMouseX = mx;
                this.startMouseY = my;

            }
        }



    },// canvasMouseMove

}// dragRendering