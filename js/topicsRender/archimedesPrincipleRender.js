/**
* Methods related to the topic 'Archimedes' principle'
*/
const archimedesPrinciple = {
    dynamometer: undefined,
    canvas: undefined,
    ctx: undefined,

    constants: Object.freeze({
        xBrickName: 'xBrick',
    }),

    settings: {
        boxHeight: 80, // height of the box with bricks
        boxWidth: 120, // width of the box with bricks
        boxCoord: { x: 0, y: 0 }, // coord of the box with bricks
        cargoSize: 40,
        cargoSizeWithHook: 0,
        upperHookHeight: 0,
        cargoCoord: { x: 0, y: 0 },
        dynamCoord: { x: 0, y: 0 },
        dropPosition: { x: 0, y: 0 }, // position where to drop movement brick
        dropAreaSize: 100 // size of an area where to drop movement brick
    },

    vars: {
        startedDragCoord: { x: 0, y: 0 }
    },

    applySettings: function () {
        let boxDisplacement = 30;
        let cargoDisplacement = 10;

        this.settings.boxCoord.x = boxDisplacement;
        this.settings.boxCoord.y = this.canvas.clientHeight - boxDisplacement - this.settings.boxHeight;

        let xCoord = boxDisplacement + 2 * cargoDisplacement;
        let yCoord = this.settings.boxCoord.y + cargoDisplacement;

        this.settings.cargoCoord = xCoord;
        this.settings.cargoCoord = yCoord;

    },

    /**
    * Initialization
    */
    init: function () {
        this.applySettings();
        this.dynamometers = archimedesPrinciple.initRender();
        this.drawArea();
        //dragRendering.dragElements = [];
    },


    stoppedDrawDrag: function (v) {

    },

    /**
     * Redrawing after value changed of spring dynamomemter
     */
    refreshOnValueChanged: function () {
        contextLayout.clearCanvas(this.canvas);
        this.drawArea();
    },

    /**
    * Drawing of canvas area
    */
    drawArea: function () {
        this.drawBox();
    },

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
     * Initial placement of canvas' elements
     */
    initRender: function () {
        var springDynamometer = new SpringDynamometer({
            startX: 500,
            startY: 30,
            canvas: this.canvas,
            maxValue: 10,
            angle: 90,
            length: 500,
            height: 60,
            strokeColor: "black",
            // showOddMarks : false,
            showMinorLines: true,
            value: 0
            //animationStep : 0.1
        });


        springDynamometer.draw();
        var refresh = this.refreshOnValueChanged.bind(this);
        springDynamometer.valueOnChange = function (v) {
            refresh();

        };


        return Object.freeze({
            springDynamometer
        });

    }, // initRender

    /**
    *  function which calls during changing data in IFrame 
    */
    receivedMessage: async function () {
        this.clear();
        await this.dynamometers.springDynamometer.setValue(10);
        await this.dynamometers.springDynamometer.setValue(0);

        //dragRendering.redraw();
    },



    // reset all values and variables
    clear: function () {

    },

} // archimedesPrinciple