
/**
* functions related to dragging of items on canvas
*/
const dragRendering = {

    //canvas for drawing
    canvas: undefined,

    //elements of stage with id of an element 
    dragElements: [{ 
        id: undefined, // unique id of item 
        isDraggable : true, // is draggable element on canvas
        isDragging : false, // is item currently being dragged on canvas 
        elem: undefined // draggable element (see stageElement.js, Brick in particular) 
    }],

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
        return this.dragElements.find(el => el.id == id);
    },


    /**
    * Searches for an dragging element by id
    */
   findDragElem: function (id) {
    return this.dragElements.find(el => el.id == id);
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
        if (this.dragElements.length != 0  && this.dragElements[0].elem != undefined) {
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

        if (this.dragElements.length != 0  && this.dragElements[0].elem != undefined) {
            var dragElem = this.dragElements.find(el => el.isDragging == true);

            // clear all the dragging flags
            if (dragElem != undefined) {
                var dragElem = this.dragElements.find(el => el.isDragging == true);
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

        if (this.dragElements.length != 0  && this.dragElements[0].elem != undefined) {
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
            var dragElem = this.dragElements.find(el => el.isDragging == true && el.isDraggable == true);

            // if user is dragging anything
            if (dragElem != undefined) {

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