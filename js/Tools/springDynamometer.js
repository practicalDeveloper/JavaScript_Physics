/**
 * Canvas drawn Spring Dynamometer
 */
function SpringDynamometer(options = {}) {
  // default values for the ruler
  Object.assign(this, {
    canvas: undefined,
    startX: 0,
    startY: 0,
    length: 200,
    height: 50,
    maxValue: 10,
    backColor: "orange",
    strokeColor: "black",
    showMinorLines: true, //shows/hides minor lines for ruler
    showOddMarks: true, //shows/hides odd labels for ruler
    angle: 0, // rotation angle relatively of upper left corner
    value: 0,
    animationStep: undefined
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
      let valueRulerLength = rulerLength / this.maxValue;
      let animationStep = (this.animationStep === undefined) ? this.maxValue * 0.018 : this.animationStep;
      let springH = this.height - this.height / 3;
      let holderL = this.length - (springL + swingWidth);
      let springValueL = springL + this.value * valueRulerLength;
      let initialLeftX = this.startX - springH * Math.sin(application.degrToRad(this.angle)); //x coord on the left side for spring
      let initialLeftY = this.startY + springH * Math.cos(application.degrToRad(this.angle)); //y coord on the left side for spring,
      let hookSize = this.height / 2.5;

      return {
        initialSpringL: springL,
        swingWidth: swingWidth,
        rulerL: rulerLength,
        valueRulerL: valueRulerLength,
        animationStep: animationStep,
        springH: springH,
        holderL: holderL,
        springValueL: springValueL,
        initialLeftX: initialLeftX,
        initialLeftY: initialLeftY,
        hookSize: hookSize

      };
    }, // getMeasures

    // inizialization 
    init: function () {
      let measures = this.fields.getMeasures.call(this);

      let swingsN = measures.initialSpringL / measures.swingWidth; //number of swings for spring
      let springX = measures.initialLeftX + Math.cos(application.degrToRad(this.angle)) * measures.swingWidth;
      let springY = measures.initialLeftY + Math.sin(application.degrToRad(this.angle)) * measures.swingWidth;

      let l = measures.swingWidth + measures.initialSpringL; // width of gap between ruler and left side 
      let rulerX = this.startX + l * Math.cos(application.degrToRad(this.angle));
      let rulerY = this.startY + l * Math.sin(application.degrToRad(this.angle));

      this.fields.spring = new Spring({
        startX: springX,
        startY: springY,
        canvas: this.canvas,
        radius: this.height / 4,
        swings: swingsN,
        length: measures.springValueL,
        swingWidth: measures.swingWidth,
        angle: this.angle
      });


      this.fields.ruler = new Ruler({
        startX: rulerX,
        startY: rulerY,
        canvas: this.canvas,
        length: measures.rulerL,
        height: this.height,
        angle: this.angle,
        showBackground: false,
        strokeColor: this.strokeColor,
        showBottom: false
      });

      this.fields.applyRulerStyle.call(this);
      this.fields.hook = new Hook();
    },// init


    applyRulerStyle: function () {
      this.fields.ruler.showMinorLines = this.showMinorLines;
      this.fields.ruler.showOddMarks = this.showOddMarks;
      this.fields.ruler.maxValue = this.maxValue;
    }// applyRulerStyle

  }

  this.fields.init.call(this);
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
    ctx.moveTo(lineX, lineY);
    ctx.lineTo(lineX + measures.holderL, lineY);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    let hookX = measures.initialLeftX +
      Math.cos(application.degrToRad(this.angle)) * (measures.springValueL + measures.swingWidth + measures.holderL);
    let hookY = measures.initialLeftY +
      Math.sin(application.degrToRad(this.angle)) * (measures.springValueL + measures.swingWidth + measures.holderL);

    // hook initialization
    this.fields.hook.x = hookX;
    this.fields.hook.y = hookY;
    this.fields.hook.size = measures.hookSize;
    this.fields.hook.canvas = this.canvas;
    this.fields.hook.angle = this.angle - 90;
    this.fields.hook.strokeColor = this.strokeColor;

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
  * @param {valuePointer} Value of dynamometer
  */
  setValue: async function (valuePointer = 0) {
    if (valuePointer < 0) return;

    let value = this.setStaticValue.bind(this);
    let moveSpeed = this.fields.getMeasures.call(this).animationStep;
    let currentValue = this.value;
    let initValue = currentValue;
    let maxValue = valuePointer <= this.maxValue ? valuePointer : this.maxValue;

    const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

    // recursion function to draw spring indicator during setTimeout
    async function tick() {

      // draws value pointer according to condition
      async function setTimer(condition) {
        if (condition) {
          value(currentValue);
          await timeout(1);
          return await tick();
        }
        // stops timer
        else {
          value(maxValue);
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