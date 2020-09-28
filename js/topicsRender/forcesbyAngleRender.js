/**
* Methods related to the topic 'Forces By Angle'
*/
const forcesbyAngleDemo = {
    dynamometers: undefined,
    canvas: undefined,
    ctx: undefined,

    constants: Object.freeze({
        xBrickName: 'xBrick',
        yBrickName: 'yBrick',
        zBrickName: 'zBrick',
    }),

    settings: {
        boxHeight: 80, // height of the box with bricks
        boxWidth: 250, // width of the box with bricks
        boxCoord: { x: 0, y: 0 }, // coord of the box with bricks
        cargoSize: 40,
        cargoSizeWithHook: 0,
        upperHookHeight: 0,
        xCargoCoord: { x: 0, y: 0 },
        yCargoCoord: { x: 0, y: 0 },
        zCargoCoord: { x: 0, y: 0 },
        dynamRadius: 120,
        leftDynamCoord: { x: 0, y: 0 },
        rightDynamCoord: { x: 0, y: 0 },
        curveLength: 120, // length of the curve to suspend bricks
        dropAreaSize: 100 // size of an area where to drop movement brick
    },

    vars: {
        suspendedCount: 0, // count of suspended bricks
        startedDragCoord: { x: 0, y: 0 },
        totalWeight: 0 // suspended weight on the rope
    },

    applySettings: function () {
        let boxDisplacement = 30;
        let cargoDisplacement = 10;

        this.settings.boxCoord.x = boxDisplacement;
        this.settings.boxCoord.y = this.canvas.clientHeight - boxDisplacement - this.settings.boxHeight;

        let xCoord = boxDisplacement + 2 * cargoDisplacement;
        let yCoord = this.settings.boxCoord.y + cargoDisplacement;

        this.settings.xCargoCoord.x = xCoord;
        this.settings.xCargoCoord.y = yCoord;

        this.settings.yCargoCoord.x = this.settings.xCargoCoord.x + this.settings.cargoSize + 4 * cargoDisplacement;
        this.settings.yCargoCoord.y = yCoord;

        this.settings.zCargoCoord.x = this.settings.yCargoCoord.x + this.settings.cargoSize + 4 * cargoDisplacement;
        this.settings.zCargoCoord.y = yCoord;
    },

    /**
     * Initialization
     */
    init: function () {

        this.vars.suspendedCount = 0;
        this.applySettings();
        this.dynamometers = this.initRender();

        dragRendering.refresh = () => {  this.refreshDrawDrag(); }
        dragRendering.stoppedDragging = (elem) => {  this.stoppedDrawDrag(elem); }
        dragRendering.startedDragging = (elem) => { this.startedDrawDrag(elem); }
    },

    /**
     * Initial placement of canvas' elements
     */
    initRender: function () {
        // The left dynamometer
        let dynamLeft = new Dynamometer({
            centerX: 0, centerY: 0,
            radius: this.settings.dynamRadius,
            ringColor: "green", innerRingColor: "yellow", canvas: this.canvas
        });

        // The right dynamometer
        let dynamRight = new Dynamometer({
            centerX: 0, centerY: 0,
            radius: this.settings.dynamRadius,
            ringColor: "red", innerRingColor: "yellow", canvas: this.canvas
        });

        this.drawBox();
        this.drawRope();

        // Clears dragging elements for the canvas
        dragRendering.dragElements = [];


        const bricks = [
            {
                id: this.constants.xBrickName, elem: new Brick({
                    x: this.settings.xCargoCoord.x,
                    y: this.settings.xCargoCoord.y,
                    height: this.settings.cargoSize,
                    width: this.settings.cargoSize,
                    canvas: this.canvas,
                    itemText: "X"
                })
            },
            {
                id: this.constants.yBrickName, elem: new Brick({
                    x: this.settings.yCargoCoord.x,
                    y: this.settings.yCargoCoord.y,
                    height: this.settings.cargoSize,
                    width: this.settings.cargoSize,
                    canvas: this.canvas,
                    itemText: "Y"
                })
            },
            {
                id: this.constants.zBrickName, elem: new Brick({
                    x: this.settings.zCargoCoord.x,
                    y: this.settings.zCargoCoord.y,
                    height: this.settings.cargoSize,
                    width: this.settings.cargoSize,
                    canvas: this.canvas,
                    itemText: "Z"
                })
            },
        ];


        // Adds bricks to the canvas
        dragRendering.addElements(bricks);
        this.settings.cargoSizeWithHook = dragRendering.dragElements[0].elem.geItemHeight();
        this.settings.upperHookHeight = dragRendering.dragElements[0].elem.getUpperHookSize();

        // Draws dynamometers
        dynamLeft.draw();
        dynamRight.draw();
        dynamRight.setStaticValue(0);
        dynamLeft.setStaticValue(0);

        return {
            dynamLeft,
            dynamRight
        };

    },// initRender


    /**
     * Drawing of the box to store dragging bricks 
     */
    drawBox: function () {
        this.ctx.save();
        contextLayout.roundRect(this.ctx,
            this.settings.boxCoord.x,
            this.settings.boxCoord.y,
            this.settings.boxWidth, this.settings.boxHeight, 5, 2, "#e4e4e4");
        this.ctx.restore();
    },


    /**
     * Drawing of the rope to suspend bricks
     */
    drawRope: function () {
        if (this.dynamometers != undefined) {
            this.settings.curveLength = 250 + (applicationRendering.topicVariables.angle - 45);

            this.ctx.beginPath();
            let x1 = this.canvas.clientWidth / 2;
            let y1 = 3 * this.settings.dynamRadius;
            let r = this.settings.curveLength;

            let angle = applicationRendering.topicVariables.angle / 2 + 270; // rotation angle for the right dynam.
            let angle2 = 270 - applicationRendering.topicVariables.angle / 2;// rotation angle for the left dynam.


            let oppositeSideHeight = Math.cos(application.degrToRad(applicationRendering.topicVariables.angle / 2)) * r;
            let oppositeSideLength = Math.sqrt(r * r - oppositeSideHeight * oppositeSideHeight);

            //Set left dynam to required coord.
            this.dynamometers.dynamLeft.centerX = x1 - oppositeSideLength;
            this.dynamometers.dynamLeft.centerY = y1 - oppositeSideHeight;

            //Set right dynam to required coord.
            this.dynamometers.dynamRight.centerX = x1 + oppositeSideLength;
            this.dynamometers.dynamRight.centerY = y1 - oppositeSideHeight;

            //Rotate dynamometers
            this.dynamometers.dynamRight.angle = applicationRendering.topicVariables.angle / 2;
            this.dynamometers.dynamLeft.angle = 360 - applicationRendering.topicVariables.angle / 2;

            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x1 + r * Math.cos(application.degrToRad(angle)), y1 + r * Math.sin(application.degrToRad(angle)));

            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x1 + r * Math.cos(application.degrToRad(angle2)), y1 + r * Math.sin(application.degrToRad(angle2)));
            this.ctx.lineWidth = 1;
            this.ctx.stroke();

            // Small triangle
            this.ctx.save();
            this.ctx.beginPath();
            let shortSideLength = oppositeSideLength / 4;
            let sideLength = oppositeSideLength - shortSideLength;
            let shortSideHeight = (sideLength) / Math.tan(application.degrToRad(applicationRendering.topicVariables.angle / 2));
            let smallTriangleY = y1 - oppositeSideHeight + shortSideHeight;
            let smallTriangleXLeft = (x1 - oppositeSideLength) + sideLength;
            let smallTriangleXRight = (x1 + oppositeSideLength) - sideLength;

            this.ctx.moveTo((x1 - oppositeSideLength), y1 - oppositeSideHeight);
            this.ctx.lineTo(smallTriangleXLeft, smallTriangleY);

            this.ctx.moveTo((x1 + oppositeSideLength), y1 - oppositeSideHeight);
            this.ctx.lineTo(smallTriangleXRight, smallTriangleY);


            this.ctx.lineWidth = 5;
            this.ctx.stroke();

            this.ctx.restore();
        }
    },


    /**
     * Redrawing during bricks' dragging
     */
    refreshDrawDrag: function () {
        this.drawRope();
        this.drawBox();

        //saves and restores values of dynam. 
        let oldValueLeft = this.dynamometers.dynamLeft.value;
        let oldValueRight = this.dynamometers.dynamRight.value;
        this.dynamometers.dynamLeft.draw();
        this.dynamometers.dynamRight.draw();
        this.dynamometers.dynamLeft.setStaticValue(oldValueLeft);
        this.dynamometers.dynamRight.setStaticValue(oldValueRight);

    },

    /**
 * Function to call when started dragging 
 */
    startedDrawDrag: function (dragElem) {
        let el = dragRendering.findElem(dragElem.id).elem;
        this.vars.startedDragCoord.x = el.x;
        this.vars.startedDragCoord.y = el.y;
    },

    /**
     * gets position where to drop movement brick
     */
    getDropPosition: function () {
        let x = this.canvas.clientWidth / 2;
        let y = (3 * this.settings.dynamRadius) + this.settings.upperHookHeight +
            (this.vars.suspendedCount * this.settings.cargoSizeWithHook);

        return { x: x, y: y };
    },



    /**
     * Function to call when stopped dragging 
     */
    stoppedDrawDrag: function (dropElem) {

        let el = dragRendering.findElem(dropElem.id).elem;
        let setPos = (x, y) => { el.x = x; el.y = y; }

        let xDrop = this.getDropPosition().x;
        let yDrop = this.getDropPosition().y;

        // if brick is within borders of drop area
        if (dropElem.elem.x > (xDrop - this.settings.dropAreaSize) &&
            dropElem.elem.x < (xDrop + this.settings.dropAreaSize) &&
            dropElem.elem.y > (yDrop - this.settings.dropAreaSize) &&
            dropElem.elem.y < (yDrop + this.settings.dropAreaSize)) {
            setPos(xDrop - this.settings.cargoSize / 2, yDrop);

            // if element was taken from the box 
            if (el.x != this.vars.startedDragCoord.x && el.y != this.vars.startedDragCoord.y) {
                this.vars.suspendedCount++;
                dragRendering.redraw();
                this.vars.totalWeight += Number(el.weight);
            }
            // if element was taken from the rope 
            else {

                this.vars.totalWeight -= Number(el.weight);
                this.vars.suspendedCount--;
                setPos(xDrop - this.settings.cargoSize / 2, yDrop);
                dragRendering.redraw();

                this.vars.suspendedCount++;
                this.vars.totalWeight += Number(el.weight);
            }

        }

        // returns element to the box
        else {
            switch (dropElem.id) {
                case this.constants.xBrickName:
                    setPos(this.settings.xCargoCoord.x, this.settings.xCargoCoord.y);
                    break;
                case this.constants.yBrickName:
                    setPos(this.settings.yCargoCoord.x, this.settings.yCargoCoord.y);
                    break;
                case this.constants.zBrickName:
                    setPos(this.settings.zCargoCoord.x, this.settings.zCargoCoord.y);
                    break;
            }

            if (el.x != this.vars.startedDragCoord.x && el.y != this.vars.startedDragCoord.y) {
                this.vars.suspendedCount--;
                this.vars.totalWeight -= Number(el.weight);
            }
            dragRendering.redraw();
        }

        this.setDynamValues();

    }, // stoppedDrawDrag

    /**
     * sets dragging mark for bricks
     */
    setDraggingFlags: function () {
        // all bricks can be dragged
        if (this.vars.suspendedCount == 0 || this.vars.suspendedCount == 1) {
            dragRendering.dragElements.forEach(element => { element.isDraggable = true; });
        }
        else if (this.vars.suspendedCount > 1) {
            dragRendering.dragElements.forEach(element => { element.isDraggable = false; });

            let setDragging = function (element, id, x) {
                if (element.id === id) {
                    if (element.elem.x == x) {
                        element.isDraggable = true;
                    }
                    else {
                        element.isDraggable = false;
                    }
                }
            }

            //  only bricks in the box can be dragged
            dragRendering.dragElements.forEach(element => {
                setDragging(element, this.constants.xBrickName, this.settings.xCargoCoord.x);
                setDragging(element, this.constants.yBrickName, this.settings.yCargoCoord.x);
                setDragging(element, this.constants.zBrickName, this.settings.zCargoCoord.x);

            });

            //  only last brick on the rope can be dragged
            let pos = this.getDropPosition().y - this.settings.cargoSizeWithHook;
            dragRendering.dragElements.forEach(element => {
                if (element.elem.y == pos) {
                    element.isDraggable = true;
                }
            });
        }
    },


    /**
     *  function which calls during changing data in IFrame 
     */
    receivedMessage: function () {
        if( this.dynamometers != undefined)
        {
        // set weights of bricks
        dragRendering.findElem(this.constants.xBrickName).elem.weight = applicationRendering.topicVariables.xWeight;
        dragRendering.findElem(this.constants.yBrickName).elem.weight = applicationRendering.topicVariables.yWeight;
        dragRendering.findElem(this.constants.zBrickName).elem.weight = applicationRendering.topicVariables.zWeight;
        this.dynamometers.dynamLeft.maxValue = applicationRendering.topicVariables.maxValue;
        this.dynamometers.dynamRight.maxValue = applicationRendering.topicVariables.maxValue;
        this.clear();
        dragRendering.redraw();
        }
    },

    // reset all values and variables
    clear: function () {
        this.vars.suspendedCount = 0;
        this.vars.totalWeight = 0;
        if (dragRendering.dragElements.length > 0) {
            dragRendering.dragElements.forEach(element => { element.isDraggable = true; });
            let setPos = (el, x, y) => { el.x = x; el.y = y; }
            setPos(dragRendering.findElem(this.constants.xBrickName).elem, this.settings.xCargoCoord.x, this.settings.xCargoCoord.y);
            setPos(dragRendering.findElem(this.constants.yBrickName).elem, this.settings.yCargoCoord.x, this.settings.yCargoCoord.y);
            setPos(dragRendering.findElem(this.constants.zBrickName).elem, this.settings.zCargoCoord.x, this.settings.zCargoCoord.y);
        }

        if (this.dynamometers != undefined) {
            this.dynamometers.dynamLeft.setStaticValue(0);
            this.dynamometers.dynamRight.setStaticValue(0);
        }

        this.passFrameValue();
    },
    
    passFrameValue: function () {
        let pass_data = { 'force': application.roundTwoDigits(this.getForce()) };
        applicationRendering.sendFrameMessage(pass_data);
    },


    // clears all variables
    reset: function () {
        this.dynamometers = undefined;
        this.clear();
    },


    setDynamValues: function () {
        this.dynamometers.dynamLeft.setValue(this.getForce()).then(() => {
            this.setDraggingFlags();
            this.passFrameValue();
        })

        this.dynamometers.dynamRight.setValue(this.getForce()).then(() => {
            this.setDraggingFlags();
            this.passFrameValue();
        })
    },


    /**
     * Calculates force applied by angle and resultant force
     */
    getForce: function () {
        if(applicationRendering.topicVariables != undefined ){
        let angle = applicationRendering.topicVariables.angle;
        let force = this.vars.totalWeight / (2 * Math.cos(application.degrToRad(angle / 2)));
        return (application.kgToNewton(force));
        }
    },



} // forcesbyAngleDemo