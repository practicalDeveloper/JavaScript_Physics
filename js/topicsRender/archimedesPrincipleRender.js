/**
 * Methods related to the topic 'Archimedes' principle
 */
const archimedesPrinciple = {
  dynamometer: undefined,
  canvas: undefined,
  ctx: undefined,

  constants: Object.freeze({
    xBrickName: "xBrick",
  }),

  settings: {
    boxHeight: 80, // height of the box with bricks
    boxWidth: 120, // width of the box with bricks
    boxCoord: { x: 0, y: 0 }, // coord of the box with bricks
    cargoSize: 40,
    cargoSizeWithHook: 0,
    upperHookHeight: 0,
    cargoCoord: { x: 0, y: 0 },
    dynamCoord: { x: 200, y: 50 },
    dropPosition: { x: 0, y: 0 }, // position where to drop movement brick
    dropAreaSize: 100, // size of an area where to drop movement brick
  },

  applySettings: function () {
    let boxDisplacement = 30;
    let cargoDisplacement = 10;

    this.settings.boxCoord.x =
      this.canvas.clientWidth - this.settings.boxWidth - boxDisplacement;
    this.settings.boxCoord.y =
      this.canvas.clientHeight - boxDisplacement - this.settings.boxHeight;

    let xCoord =
      this.settings.boxCoord.x + boxDisplacement + 2 * cargoDisplacement;
    let yCoord = this.settings.boxCoord.y + cargoDisplacement;

    this.settings.cargoCoord.x = xCoord;
    this.settings.cargoCoord.y = yCoord;
  },

  /**
   * Initialization
   */
  init: function () {
    this.applySettings();
    this.dynamometers = archimedesPrinciple.initRender();

    dragRendering.refresh = function () {
      archimedesPrinciple.refreshDrawDrag();
    };
    dragRendering.stoppedDragging = function (elem) {
      archimedesPrinciple.stoppedDrawDrag(elem);
    };
    dragRendering.startedDragging = function (elem) {
      archimedesPrinciple.startedDrawDrag(elem);
    };
  },

  /**
   * Redrawing during bricks' dragging
   */
  refreshDrawDrag: function () {
    this.drawBox();
    this.dynamometers.springDynamometer.draw();
  },

  /**
   * Function to call when started dragging
   */
  startedDrawDrag: function (dragElem) {},

  /**
   * Function to call when stopped dragging
   */
  stoppedDrawDrag: function (dropElem) {
    let el = dragRendering.findElem(dropElem.id);
    let setPos = (x, y) => {
      el.x = x;
      el.y = y;
    };

    let xEndDynam = this.getDropPosition().x;
    let yEndDynam = this.getDropPosition().y;

    // if brick is then borders of drop area
    if (
      dropElem.elem.x > xEndDynam - this.settings.dropAreaSize &&
      dropElem.elem.x < xEndDynam + this.settings.dropAreaSize &&
      dropElem.elem.y > yEndDynam - this.settings.dropAreaSize &&
      dropElem.elem.y < yEndDynam + this.settings.dropAreaSize
    ) {
      setPos(xEndDynam, yEndDynam);
      //archimedesPrinciple.refreshDrawDrag();
      dragRendering.redraw();
      dropElem.isDraggable = false;

      let force = this.getForce();
      this.dynamometers.springDynamometer.setValue(force).then(function () {
        dropElem.isDraggable = true;
      });
    }

    // returns element to the box
    else {
      setPos(this.settings.cargoCoord.x, this.settings.cargoCoord.y);
      //archimedesPrinciple.refreshDrawDrag();
      dragRendering.redraw();

      dropElem.isDraggable = false;
      this.dynamometers.springDynamometer.setValue(0).then(function () {
        dropElem.isDraggable = true;
      });
    }
  },

  /**
   * Redrawing after value changed of spring dynamomemter
   */
  refreshOnValueChanged: function () {
    if (dragRendering.dragElements[0].elem.x != this.settings.cargoCoord.x) {
      dragRendering.dragElements[0].elem.x = this.getDropPosition().x;
      dragRendering.dragElements[0].elem.y = this.getDropPosition().y;
    }
  },

  /**
   * Drawing of the box to store dragging bricks
   */
  drawBox: function () {
    this.ctx.save();
    contextLayout.roundRect(
      this.ctx,
      this.settings.boxCoord.x,
      this.settings.boxCoord.y,
      this.settings.boxWidth,
      this.settings.boxHeight,
      5,
      2,
      "#e4e4e4"
    );
    this.ctx.restore();
  },

  getDropPosition: function () {
    let x =
      this.dynamometers.springDynamometer.getFinishCoord().x -
      this.settings.cargoSize / 2;
    let y =
      this.dynamometers.springDynamometer.getFinishCoord().y +
      dragRendering.dragElements[0].elem.getUpperHookSize();
    return { x: x, y: y };
  },

  /**
   * Initial placement of canvas' elements
   */
  initRender: function () {
    var springDynamometer = new SpringDynamometer({
      startX: this.settings.dynamCoord.x,
      startY: this.settings.dynamCoord.y,
      canvas: this.canvas,
      maxValue: 20,
      angle: 90,
      length: 400,
      height: 60,
      strokeColor: "black",
      value: 0,
      //animationStep : 0.1
    });

    this.drawBox();

    // Clears dragging elements for the canvas
    dragRendering.dragElements = [];

    const bricks = [
      {
        id: this.constants.xBrickName,
        elem: new Brick({
          x: this.settings.cargoCoord.x,
          y: this.settings.cargoCoord.y,
          height: this.settings.cargoSize,
          width: this.settings.cargoSize,
          canvas: this.canvas,
          itemText: "X",
        }),
      },
    ];

    // Adds bricks to the canvas
    dragRendering.addElements(bricks);

    springDynamometer.draw();
    var refresh = this.refreshOnValueChanged.bind(this);
    var box = this.drawBox.bind(this);
    springDynamometer.valueOnChange = function (v) {
      contextLayout.clearCanvas(this.canvas);
      refresh();
      box();
      dragRendering.drawElements();

      // refresh();
      // dragRendering.redraw();
    };

    //springDynamometer.setValue(5);

    //  springDynamometer.setValue(10).then(function() {
    //     springDynamometer.setValue(0);
    //    //alert(springDynamometer.value);
    //  })

    // await springDynamometer.setValue(15);
    //await springDynamometer.setValue(0);

    return Object.freeze({
      springDynamometer,
    });
  }, // initRender

  /**
   *  function which calls during changing data in IFrame
   */
  receivedMessage: async function () {
    // set weights of bricks
    this.dynamometers.springDynamometer.maxValue =
      applicationRendering.topicVariables.maxValue;
    this.clear();
    dragRendering.redraw();
  },

  /**
   * Calculates force (in Newtons) by weight
   */
  getForce: function () {
    let weight = applicationRendering.topicVariables.weight;
    return application.kgToNewton(weight);
  },

  // reset all values and variables
  clear: function () {
    dragRendering.dragElements[0].elem.x = this.settings.cargoCoord.x;
    dragRendering.dragElements[0].elem.y = this.settings.cargoCoord.y;

    if (this.dynamometers !== undefined) {
      this.dynamometers.springDynamometer.setStaticValue(0);
    }
  },
}; // archimedesPrinciple
