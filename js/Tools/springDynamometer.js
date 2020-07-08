/**
 * Canvas drawn Spring Dynamometer
 */
function SpringDynamometer(options = {}) {
  // default values for the ruler
  Object.assign(this, {
    canvas: undefined,
    startX: 0, // left top start X coordinate of spring dynamometer 
    startY: 0, // // left top start Y coordinate of spring dynamometer 
    length: 200,
    height: 50,
    maxValue: 10, // maximum possible value of spring dynamometer
    backColor: "orange",
    strokeColor: "black",
    angle: 0, // rotation angle relatively of upper left corner
    animatedHolder: false, // are holder and hook animated
    value: 0, // current  value of spring dynamometer
    animationStep: undefined // speed of animation of arrow
  }, options);

  // function to call during value changing
  this.valueOnChange = function (value) { }

  // fields and methods of Spring Dynamometer 
  this.fields = {
    spring: undefined, // canvas drawn spring
    ruler: undefined, // canvas drawn ruler
    hook: undefined, // canvas drawn hook


    // different metrics of Spring Dynamometer 
    getMeasures: function () {
      let springL = this.length / 5; // initial length of spring
      let swingWidth = springL / 30;
      let rulerLength = this.length - springL - swingWidth;
      let animationStep = (this.animationStep === undefined) ? this.maxValue * 0.018 : this.animationStep;
      let springH = this.height - this.height / 3;
      let holderL = 0;
      if (this.animatedHolder) {
        holderL = this.length - (springL + swingWidth);
      }
      else {
        holderL = this.length - swingWidth + this.length / 20;
      }


      let valueLength = this.value > this.maxValue ? this.maxValue : this.value;
      let springValueL = springL + valueLength * (rulerLength / this.maxValue);
      let holderValueL = holderL - springValueL;
      let initialLeftX = this.startX - springH * Math.sin(application.degrToRad(this.angle)); //x coord on the left side for spring
      let initialLeftY = this.startY + springH * Math.cos(application.degrToRad(this.angle)); //y coord on the left side for spring,
      let hookSize = this.height / 2.5;

      let hookX = 0;
      let hookY = 0;

      if (this.animatedHolder) {
        hookX = initialLeftX + Math.cos(application.degrToRad(this.angle)) * (springValueL + swingWidth + holderL);
        hookY = initialLeftY + Math.sin(application.degrToRad(this.angle)) * (springValueL + swingWidth + holderL);
      }
      else {
        hookX = initialLeftX + Math.cos(application.degrToRad(this.angle)) * (swingWidth + holderL);
        hookY = initialLeftY + Math.sin(application.degrToRad(this.angle)) * (swingWidth + holderL);
      }

      let springX = initialLeftX + Math.cos(application.degrToRad(this.angle)) * swingWidth;
      let springY = initialLeftY + Math.sin(application.degrToRad(this.angle)) * swingWidth;

      let l = swingWidth + springL; // width of gap between ruler and left side 
      let rulerX = this.startX + l * Math.cos(application.degrToRad(this.angle));
      let rulerY = this.startY + l * Math.sin(application.degrToRad(this.angle));

      return {
        initialSpringL: springL, // initial length of spring
        swingWidth: swingWidth, // width of each swing of the spring 
        rulerL: rulerLength, // initial length of the ruler
        animationStep: animationStep,
        springH: springH, // height of spring
        holderL: holderL, // length of the holder for hook
        holderValueL: holderValueL, // length of the holder for hook depending on the value
        springValueL: springValueL,  // length of spring depending on the value
        initialLeftX: initialLeftX, //x coord on the left side for spring
        initialLeftY: initialLeftY, //y coord on the left side for spring,
        hookX: hookX, //x coord of the hook 
        hookY: hookY, //y coord of the hook 
        hookSize: hookSize,
        springX: springX,
        springY: springY,
        rulerX: rulerX,
        rulerY: rulerY

      };
    }, // getMeasures

    // inizialization 
    init: function () {
      let measures = this.fields.getMeasures.call(this);
      let swingsN = measures.initialSpringL / measures.swingWidth; //number of swings for spring

      this.fields.spring = new Spring({
        radius: this.height / 4,
        swings: swingsN, //number of swings for spring
      });


      this.fields.ruler = new Ruler({
        showBackground: false,
        showBottom: false
      });

      this.fields.applyRulerStyle.call(this);
      this.fields.hook = new Hook();
    },// init


    applyRulerStyle: function () {
      this.fields.ruler.showMinorLines = this.showMinorLines;
      this.fields.ruler.showOddMarks = this.showOddMarks;
      this.fields.ruler.maxValue = this.maxValue;
    } // applyRulerStyle

  }

  this.fields.init.call(this);


  /**
   * Gets total height of dynamometer with holder and hook
   */
  this.getTotalLength = () => {
    let measures = this.fields.getMeasures.call(this);
    return (measures.springValueL + measures.swingWidth + measures.holderL + measures.hookSize);
  }

  /**
 * Gets coordinates of the end of hook on the holder
 */
  this.getFinishCoord = () => {
    let measures = this.fields.getMeasures.call(this);
    let x = measures.hookX + Math.cos(application.degrToRad(this.angle)) * (measures.hookSize);
    let y = measures.hookY + Math.sin(application.degrToRad(this.angle)) * (measures.hookSize);
    return { x: x, y: y };
  }
}

SpringDynamometer.prototype = {

  /**
   * draws entire Spring Dynamometer
   */
  draw: function () {

    let ctx = this.canvas.getContext("2d");
    let measures = this.fields.getMeasures.call(this);

    ctx.save();
    contextLayout.rotateCanvas(ctx, this.startX, this.startY, this.angle);

    // background 
    ctx.beginPath();
    ctx.strokeStyle = this.strokeColor;
    ctx.fillStyle = this.backColor;
    ctx.fillRect(this.startX, this.startY, this.length, this.height);
    ctx.rect(this.startX, this.startY, this.length, this.height);
    ctx.stroke();

    // cargo holder line 
    ctx.beginPath();

    let lineY = this.startY + measures.springH;
    let lineX = this.startX + measures.springValueL + measures.swingWidth;
    let endLineX = this.animatedHolder ? lineX + measures.holderL : lineX + measures.holderValueL;

    ctx.moveTo(lineX, lineY);

    ctx.lineTo(endLineX, lineY);

    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // hook initialization
    this.fields.hook.x = measures.hookX;
    this.fields.hook.y = measures.hookY;
    this.fields.hook.size = measures.hookSize;
    this.fields.hook.canvas = this.canvas;
    this.fields.hook.angle = this.angle - 90;
    this.fields.hook.strokeColor = this.strokeColor;


    // spring initialization
    this.fields.spring.startX = measures.springX;
    this.fields.spring.startY = measures.springY;
    this.fields.spring.canvas = this.canvas;
    this.fields.spring.length = measures.springValueL;
    this.fields.spring.angle = this.angle;
    this.fields.spring.swingWidth = measures.swingWidth,

    // ruler initialization
    this.fields.ruler.startX = measures.rulerX;
    this.fields.ruler.startY = measures.rulerY;
    this.fields.ruler.canvas = this.canvas;
    this.fields.ruler.length = measures.rulerL;
    this.fields.ruler.angle = this.angle;
    this.fields.ruler.strokeColor = this.strokeColor;


    this.fields.applyRulerStyle.call(this);
    this.fields.spring.length = measures.springValueL;
    this.fields.ruler.draw();
    this.fields.spring.draw();
    this.fields.hook.draw();
  },// draw

  /**
   * sets spring indicator to value without animation
   */
  setStaticValue: function (valuePointer = 0) {

    this.value = valuePointer;
    this.valueOnChange(valuePointer);
    this.draw();
  }, // setStaticValue


  /**
  * sets spring indicator to value with animation
  */
  setValue: async function (valuePointer = 0) {
    if (valuePointer < 0) return;

    let setStaticValue = this.setStaticValue.bind(this);

    let moveSpeed = this.fields.getMeasures.call(this).animationStep;
    let currentValue = this.value;
    let initValue = currentValue;
    let maxValue = valuePointer <= this.maxValue ? valuePointer : this.maxValue;

    // recursion function to draw spring indicator during setTimeout
    async function tick() {

      // draws value pointer according to condition
      async function setTimer(condition) {
        if (condition) {
          setStaticValue(currentValue);
          await application.timeout(1);
          return await tick();
        }
        // stops timer
        else {
          setStaticValue(maxValue);
          return;
        }
      } // setTimer

      if (initValue <= maxValue) {
        currentValue = application.roundTwoDigits(currentValue + moveSpeed);
        return await setTimer(currentValue <= maxValue);
      }

      if (initValue > maxValue) {
        currentValue = application.roundTwoDigits(currentValue - moveSpeed);
        return await setTimer(currentValue >= maxValue);
      }
    } // tick

    return tick(); //awaits for promise

  }// setValue


}