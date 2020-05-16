/**
* Methods related to the topic 'Archimedes' principle
*/
const archimedesPrinciple = {
    dynamometer: undefined,
    canvas: undefined,
    ctx: undefined,
    cancelTimer: false,

    constants: Object.freeze({
        brickName: 'brick',
        minCargoSize: 40, // min size of the cargo
        boxHeight: 80, // height of the box with bricks
        boxWidth: 120, // width of the box with bricks
        boxLiquidBigW: 200, // width of the big box with Liquid
        boxLiquidSmallW: 120, // width of the small box with Liquid
        dropAreaSize: 100, // size of an area where to drop movement brick
        dynamCoord: { x: 150, y: 10 }, // position of the spring dynamometer
        dynamWidth: 60,
    }),

    settings: {
        boxCoord: { x: 0, y: 0 }, // coord of the box with bricks
        bigLiquidBoxCoord: { x: 0, y: 0 }, // coord of the big box with Liquid.
        smallLiquidBoxCoord: { x: 0, y: 0 }, // coord of the small box with Liquid
        bigLiquidBoxH: 0, // height of the big box with Liquid
        liquidLevelH: 0, // height of the level of liquid
        smallLiquidBoxH: 0, // height of the small box with Liquid
        cargoSize: 0,
        dynamLength: 0,
        cargoSizeWithHook: 0,
        upperHookHeight: 0,
        cargoCoord: { x: 0, y: 0 },
        dropPosition: { x: 0, y: 0 }, // position where to drop movement brick
    },


    applySettings: function () {
        let boxDisplacement = 30;
        let cargoDisplacement = 10;

        this.settings.boxCoord.x = this.canvas.clientWidth - this.constants.boxWidth - boxDisplacement;
        this.settings.boxCoord.y = this.canvas.clientHeight - boxDisplacement - this.constants.boxHeight;

        let xCoord = this.settings.boxCoord.x + boxDisplacement + 2 * cargoDisplacement;
        let yCoord = this.settings.boxCoord.y + cargoDisplacement;

        this.settings.cargoCoord.x = xCoord;
        this.settings.cargoCoord.y = yCoord;

        this.settings.bigLiquidBoxH = this.canvas.clientHeight / 5;
        this.settings.bigLiquidBoxCoord.x = boxDisplacement;
        this.settings.bigLiquidBoxCoord.y = this.canvas.clientHeight - boxDisplacement - this.settings.bigLiquidBoxH;

        this.settings.dynamLength = this.canvas.clientHeight / 2.5;
        this.settings.liquidLevelH = this.settings.bigLiquidBoxH / 10;
    },


    passFrameValue: function (volume, buyonantForce, gravity) {

        let pass_data = {
            'volume': volume,
            'buyonantForce': buyonantForce,
            'gravity': gravity,
        };

        applicationRendering.sendFrameMessage(pass_data);
    },

    /**
    * Initialization
    */
    init: function () {
        this.applySettings();
        this.dynamometers = archimedesPrinciple.initRender();

        dragRendering.refresh = function () { archimedesPrinciple.refreshDrawDrag(); };
        dragRendering.stoppedDragging = function (elem) { archimedesPrinciple.stoppedDrawDrag(elem); };
        dragRendering.startedDragging = function (elem) { archimedesPrinciple.startedDrawDrag(elem); };
    },


    /**
     * Redrawing during bricks' dragging
     */
    refreshDrawDrag: function () {
        this.drawBox();
        this.drawLiquidBoxBig();
        this.dynamometers.springDynamometer.draw();
    },

    /**
    * Function to call when started dragging 
    */
    startedDrawDrag: function (dragElem) {

    },



    /**
     * Function to call when stopped dragging 
     */
    stoppedDrawDrag: function (dropElem) {
        let el = dragRendering.findElem(dropElem.id).elem;
        let setPos = (x, y) => { el.x = x; el.y = y; }

        let xEndDynam = this.getDropPosition().x;
        let yEndDynam = this.getDropPosition().y;

        // if brick is then borders of drop area
        if (dropElem.elem.x > (xEndDynam - this.constants.dropAreaSize) &&
            dropElem.elem.x < (xEndDynam + this.constants.dropAreaSize) &&
            dropElem.elem.y > (yEndDynam - this.constants.dropAreaSize) &&
            dropElem.elem.y < (yEndDynam + this.constants.dropAreaSize)) {

            setPos(xEndDynam, yEndDynam);
            dragRendering.redraw();
            dropElem.isDraggable = false;

            // passes vales to the iframe
            let weight = applicationRendering.topicVariables.weight;
            let bodyDensity = applicationRendering.topicVariables.bodyDensity;
            let liquidDensity = applicationRendering.topicVariables.liquidDensity;
            let volume = application.roundTwoDigits(weight / bodyDensity);
            let buyonantForce = application.roundTwoDigits(liquidDensity * 9.81 * volume);
            let gravityForce = this.getForce();
            archimedesPrinciple.cancelTimer = false;
            this.dynamometers.springDynamometer.setValue(gravityForce).then(function () {

                let force = gravityForce;
                if (buyonantForce > gravityForce) {
                    force = 0;
                }

                if (gravityForce > buyonantForce) {
                    force = gravityForce - buyonantForce;
                }

                archimedesPrinciple.animatePosition().then(function () {
                    archimedesPrinciple.dynamometers.springDynamometer.setValue(force).then(function () {
                        dropElem.isDraggable = true;
                    })
                })


            })


            this.passFrameValue(volume, buyonantForce, application.roundTwoDigits(this.getForce()));

        }

        // returns element to the box
        else {
            this.dynamometers.springDynamometer.setStaticValue(0);
            archimedesPrinciple.moveDynamometer(archimedesPrinciple.constants.dynamCoord.y);
            this.passFrameValue(0, 0, 0);
            setPos(this.settings.cargoCoord.x, this.settings.cargoCoord.y);
            dragRendering.redraw();
        }

    },



    animatePosition: async function () {

        let currentPosition = archimedesPrinciple.constants.dynamCoord.y;
        let initPosition = currentPosition;
        let moveSpeed = 2;

        let liquidLevelY = archimedesPrinciple.settings.bigLiquidBoxCoord.y + archimedesPrinciple.settings.liquidLevelH;
        let yEndDynam = archimedesPrinciple.getDropPosition().y;
        let oldPosition = archimedesPrinciple.dynamometers.springDynamometer.startY;
        let setCoord = oldPosition + (liquidLevelY - yEndDynam);

        // recursion function to move dynamometer during setTimeout
        async function tick() {

            // movevement according to condition
            async function setTimer(condition) {
                if (condition) {

                    archimedesPrinciple.moveDynamometer(currentPosition);
                    let timeout = application.timeoutCancellable(1);
                    if (archimedesPrinciple.cancelTimer == true) {
                        clearTimeout(timeout.timer);
                    }

                    await timeout.promise;

                    return await tick();
                }
                // stops timer
                else {
                    archimedesPrinciple.moveDynamometer(setCoord);
                    return;
                }
            } // setTimer

            if (initPosition <= setCoord) {
                currentPosition = application.roundTwoDigits(currentPosition + moveSpeed);
                return await setTimer(currentPosition <= setCoord);
            }

        } // tick

        return tick(); //awaits for promise

    },// moveDynamometer




    /**
     * Moves dynamometer to the box with liquid
     */
    moveDynamometer: function (yPosition) {
        contextLayout.clearCanvas(this.canvas);

        // moves dynamometer
        this.dynamometers.springDynamometer.startY = yPosition;

        this.drawBox();
        this.drawLiquidBoxBig();
        this.dynamometers.springDynamometer.draw();

        // moves brick
        this.getBrick().x = this.getDropPosition().x;
        this.getBrick().y = this.getDropPosition().y;

        dragRendering.drawElements();
    },


    /**
     * Drawing of the box to store dragging bricks 
     */
    drawBox: function () {
        this.ctx.save();
        contextLayout.roundRect(this.ctx,
            this.settings.boxCoord.x,
            this.settings.boxCoord.y,
            this.constants.boxWidth,
            this.constants.boxHeight,
            5, 2, "#e4e4e4");
        this.ctx.restore();
    },


    /**
     * Drawing of the big box with Liquid
     */
    drawLiquidBoxBig: function () {
        this.ctx.save();
        let strokeW = 2;
        contextLayout.roundRect(this.ctx,
            this.settings.bigLiquidBoxCoord.x,
            this.settings.bigLiquidBoxCoord.y,
            this.constants.boxLiquidBigW,
            this.settings.bigLiquidBoxH,
            5, strokeW, "lightBlue");

        // hides upper area of the box
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(this.settings.bigLiquidBoxCoord.x,
            this.settings.bigLiquidBoxCoord.y - strokeW,
            this.constants.boxLiquidBigW,
            this.settings.bigLiquidBoxH / 10);

        this.ctx.restore();
    },

    getDropPosition: function () {
        let x = this.dynamometers.springDynamometer.getFinishCoord().x - this.settings.cargoSize / 2;
        let y = this.dynamometers.springDynamometer.getFinishCoord().y + this.getBrick().getUpperHookSize();
        return { x: x, y: y };
    },

    /**
     * Initial placement of canvas' elements
     */
    initRender: function () {
        var springDynamometer = new SpringDynamometer({
            startX: this.constants.dynamCoord.x,
            startY: this.constants.dynamCoord.y,
            canvas: this.canvas,
            angle: 90,
            length: this.settings.dynamLength,
            height: this.constants.dynamWidth,
            strokeColor: "black",
            value: 0
        });

        this.drawBox();
        this.drawLiquidBoxBig();

        // Clears dragging elements for the canvas
        dragRendering.dragElements = [];


        const bricks = [
            {
                id: this.constants.brickName,
                elem: new Brick({
                    x: this.settings.cargoCoord.x,
                    y: this.settings.cargoCoord.y,
                    height: this.settings.cargoSize,
                    width: this.settings.cargoSize,
                    canvas: this.canvas,
                    itemText: ""
                })
            },
        ];


        // Adds bricks to the canvas
        dragRendering.addElements(bricks);

        springDynamometer.draw();
        var drawBox = this.drawBox.bind(this);
        var drawLiquidBoxBig = this.drawLiquidBoxBig.bind(this);

        springDynamometer.valueOnChange = function () {

            contextLayout.clearCanvas(this.canvas);
            drawBox();
            drawLiquidBoxBig();
            dragRendering.drawElements();

        };

        // await springDynamometer.setValue(15);
        //await springDynamometer.setValue(0);

        return Object.freeze({
            springDynamometer
        });

    }, // initRender

    /**
    *  function which calls during changing data in IFrame 
    */
    receivedMessage: async function () {
        // set weights of bricks
        this.dynamometers.springDynamometer.maxValue = applicationRendering.topicVariables.maxValue;
        this.settings.cargoSize = (applicationRendering.topicVariables.weight * 0.2) + this.constants.minCargoSize;
        this.getBrick().x = this.settings.cargoCoord.x;
        this.getBrick().y = this.settings.cargoCoord.y;
        this.getBrick().height = this.getBrick().width = this.settings.cargoSize;
        this.moveDynamometer(this.constants.dynamCoord.y);
        this.clear();
        archimedesPrinciple.cancelTimer = true;

        dragRendering.dragElements[0].isDraggable = true;
        dragRendering.redraw();
    },

    /**
     * Calculates force (in Newtons) by weight
     */
    getForce: function () {
        let weight = applicationRendering.topicVariables.weight;
        return (application.kgToNewton(weight));
    },


    getBrick: function () {
        return dragRendering.findElem(this.constants.brickName).elem;
    },


    // reset all values and variables
    clear: function () {
        this.getBrick().x = this.settings.cargoCoord.x;
        this.getBrick().y = this.settings.cargoCoord.y;

        if (this.dynamometers !== undefined) {
            this.dynamometers.springDynamometer.setStaticValue(0);

        }

        this.passFrameValue(0, 0, 0);
    },

} // archimedesPrinciple