/**
 * Canvas drawn dynamometer
 */
function Dynamometer(options) {

  // inheritance from Appliance
  Appliance.call(this, options);
  
  // default values for Dynamometer
  Object.assign(this, {
    maxValue: 10, // maximum possible value of dynamometer
    value: 0, // current  value of dynamometer
    rotateStep : undefined // speed of rotation of the arrow (i.e. change of value by time period)
  }, options);


  // function to call during value changing
  this.valueOnChange = function (value) { }

  /**
   * properties of Dynamometer for internal usage
   */
  this.propsDynam = {
    getAngleJump: () => application.roundTwoDigits((180 / this.maxValue) / 2),
    getIndicFont: () => this.radius * 0.1 + "px Times New Roman",
    getFontNewton: () => this.radius * 0.15 + "px Times New Roman",
    getMidMaxValue: () => Math.trunc(this.maxValue / 2),
    getRotateStep: () => { return (this.rotateStep === undefined) ? this.maxValue * 0.018 : this.rotateStep; },

    // Draws face number indicators and lines
    drawFaceIndicators: () => {
      let yTextGap = 0.16;
      let yNewtonGap = 0.3;
      let arcNumber = 0;
      let isOddMaxValue = this.maxValue % 2;
      let isFractionalArc = isOddMaxValue; // determines fractional or integral arc

      let text = isOddMaxValue ? this.propsDynam.getMidMaxValue() + 1 : this.propsDynam.getMidMaxValue();
      let arcCount = isOddMaxValue ? (this.maxValue * 4) - 1 : (this.maxValue * 4);

      let currentAngle = 0;
      this.context.save();

      // To show indicating values and lines 
      for (let arc = 0; arc <= arcCount; arc++) {
        currentAngle = + application.roundTwoDigits(currentAngle + this.propsDynam.getAngleJump());
        let angle = application.degrToRad(currentAngle);

        //Draws face lines
        this.fields.drawFaceLine.call(this, angle, isFractionalArc);

        // determines fractional or integral arc
        if (isFractionalArc) {

          text = this.fields.getDrawFaceNumber.call(this, currentAngle, arcNumber, text);
          arcNumber++;
          // Draws text
          if (arcNumber % 2) {
            this.propsAppl.drawText(angle, yTextGap, this.propsDynam.getIndicFont(), text);
          }
        }

        isFractionalArc = !isFractionalArc;
      } // for

      // Draws N text
      this.propsAppl.drawText(application.degrToRad(270), yNewtonGap, this.propsDynam.getFontNewton(), "N");

      this.context.restore();
    } // drawFaceIndicators

  } // this.propsDynam


  // private fields and methods of Dynamometer 
  this.fields = {
    maxValueAngle: 270,

    // Draws short or long lines indicators
    redrawPointer: function (valuePointer = 0) {
      let pointerAngle = 0;

      // Redraws face area
      this.propsAppl.drawInnerFace();
      this.context.save();
      this.propsAppl.rotateCanvas();
      this.propsDynam.drawFaceIndicators();
      this.context.restore();

      if (valuePointer > this.maxValue || valuePointer < (this.maxValue * (-1))) {
        Appliance.prototype.drawPointer.call(this, this.fields.maxValueAngle);
      }
      else {
        pointerAngle = 90 - ((valuePointer * 2) * this.propsDynam.getAngleJump());
        Appliance.prototype.drawPointer.call(this, pointerAngle);
      }
    },// redrawPointer

    // draws short or long lines indicators
    drawFaceLine: function (angle, isLongLine) {
      this.context.beginPath()

      let shortLineH = this.radius * 0.04;
      let longLineH = this.radius * 0.08;
      let lineHeight = isLongLine ? longLineH : shortLineH;

      let coord = this.propsAppl.coordCalc(angle, lineHeight);

      this.context.fillStyle = 'black';
      this.context.moveTo(coord.x1_out, coord.y1_out);
      this.context.lineWidth = this.propsAppl.getFaceLineWidth();
      this.context.lineTo(coord.x2_out, coord.y2_out);
      this.context.stroke();
    }, // drawFaceLines


    // gets number to draw on face of Dynamometer
    getDrawFaceNumber: function (currentAngle, arcNumber, text) {
      let isOddMaxValue = this.maxValue % 2;

      // to detect max text reached
      let maxTextCondition = !isOddMaxValue ?
        (3 * this.propsDynam.getMidMaxValue()) - 1 :
        (3 * this.propsDynam.getMidMaxValue() + 1);

      // first quarter text drawing condition
      let firstQuarterCondition = !isOddMaxValue ?
        arcNumber <= this.propsDynam.getMidMaxValue() - 1 :
        arcNumber <= this.propsDynam.getMidMaxValue();

      // second half text drawing condition
      let secondHalfCondition = !isOddMaxValue ?
        arcNumber > this.propsDynam.getMidMaxValue() - 1 && arcNumber <= maxTextCondition :
        arcNumber > this.propsDynam.getMidMaxValue() && arcNumber <= maxTextCondition;

      // fourth quarter text drawing condition
      let fourthQuarterCondition = !isOddMaxValue ?
        arcNumber > maxTextCondition :
        arcNumber > maxTextCondition;

      let isMaxValueReached = arcNumber == maxTextCondition;

      if (arcNumber >= 0 && firstQuarterCondition) {
        text--;
      }

      if (secondHalfCondition) {
        text++;
      }
      if (fourthQuarterCondition) {
        text--;
      }

      if (isMaxValueReached) {
        this.fields.maxValueAngle = currentAngle;
      }

      return text;
    } // drawFaceNumber

  } // fields

} // Dynamometer

Dynamometer.prototype = Object.create(Appliance.prototype);
Dynamometer.prototype.constructor = Dynamometer;

Dynamometer.prototype = {

  /**
   * draws entire Dynamometer
   */
  draw: function () {
    Appliance.prototype.draw.call(this);
    this.context.save();
    this.propsAppl.rotateCanvas();
    let indicators = this.propsDynam.drawFaceIndicators.bind(this);
    indicators();
    this.context.restore();
  },// draw

  /**
   * sets arrow indicator to value without animation
   */
  setStaticValue: function (valuePointer = 0) {
    this.fields.redrawPointer.call(this, valuePointer);
    this.value = valuePointer;
    this.valueOnChange(valuePointer);
  }, // setStaticValue


  
  /**
   * sets arrow indicator to value with animation
   */
  setValue: async function (valuePointer = 0) {
    let value = this.setStaticValue.bind(this);
    let context = this.context;
    let redraw = this.fields.redrawPointer.bind(this);
    let indicators = this.propsDynam.drawFaceIndicators.bind(this);
    let face = this.propsAppl.drawInnerFace.bind(this);
    let rotate = this.propsAppl.rotateCanvas.bind(this);

    let rotateSpeed = this.propsDynam.getRotateStep();
    let currentValue = this.value;
    let initValue = currentValue;

    // to check if the value outside maximum value range
    if (this.value > this.maxValue) { currentValue = this.maxValue; }
    if (this.value < -this.maxValue) { currentValue = -this.maxValue; }

    // recursion function to draw value pointer during setTimeout
    async function tick() {
      face();
      context.save();
      rotate();
      indicators();
      context.restore();

      // draws value pointer according to condition
      async function setTimer(condition) {
        if (condition) {
          value(currentValue);
          await application.timeout(1);
          return await tick();
        }
        // stops timer
        else {
          redraw(valuePointer);
          value(valuePointer);  
          return;
        }
      } // setTimer
      
      if (initValue <= valuePointer) {
        currentValue = application.roundTwoDigits(currentValue + rotateSpeed);
        return await setTimer(currentValue <= valuePointer);
      }

      if (initValue > valuePointer) {
        currentValue = application.roundTwoDigits(currentValue - rotateSpeed);
        return await setTimer(currentValue >= valuePointer);
      }
    } // tick

    return tick(); //awaits for promise

  }, // setValue


} //Dynamometer.prototype

