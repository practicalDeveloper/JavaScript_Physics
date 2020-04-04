/**
 * Canvas drawn object to create measure tools like clocks, dynamometers, timers
 */


 /**
  * Canvas drawn object to create measure tools like clocks, dynamometers, timers
  * @options {obj} destructing parameters
  */
function Appliance(options = {}) {

  // default values for the appliance
  Object.assign(this, {
    centerX: 0, 
    centerY: 0, 
    radius: 50,
    angle: 0, // rotation angle around center point
    ringColor: "#5f5f5f",
    backRingColor: "#e9e9e9",
    innerRingColor: "#7e7e7e",
    pointerColor: "#d95358",
    canvas: undefined,
    value: 0
  }, options);

  // canvas' context 
  this.context =  this.canvas.getContext("2d");

  // private fields and methods of Appliance 
  this.fieldsAppl = {

    // draws dot in the center of Appliance's face
    drawCenterDot: function () {
      this.context.beginPath();
      this.context.fillStyle = 'black';
      this.context.arc(this.centerX, this.centerY, this.radius * 0.02, 0, application.arcPath);
      this.context.fill();
    }, // drawCenterDot

    // Function to draw arcs of Appliance's face
    drawArc: function ({ radius = this.radius,
      fillStyle = undefined,
      strokeStyle = undefined,
      lineWidth = undefined,
      shadowColor = undefined,
      shadowOffset = undefined,
      shadowBlur = undefined }) {

        this.context.save();
        this.context.beginPath();

      // shadow color
      if (!application.isUndefined(shadowColor)) { this.context.shadowColor = shadowColor; }

      // shadow color
      if (!application.isUndefined(shadowOffset)) {
        this.context.shadowOffsetX = shadowOffset;
        this.context.shadowOffsetY = shadowOffset;
      }

      // shadow blur
      if (!application.isUndefined(shadowBlur)) { this.context.shadowBlur = shadowBlur; }

      // fill style
      if (!application.isUndefined(fillStyle)) { this.context.fillStyle = fillStyle; }

      // stroke style
      if (!application.isUndefined(strokeStyle)) { this.context.strokeStyle = strokeStyle; }

      // line width
      if (!application.isUndefined(lineWidth)) { this.context.lineWidth = lineWidth; }

      this.context.arc(this.centerX, this.centerY, radius, 0, application.arcPath);
      this.context.fill();

      // stroke applying
      if (!application.isUndefined(strokeStyle)) { this.context.stroke(); }

      this.context.restore();
    }, //drawArc 

  } // fieldsAppl


  // properties of Appliance for internal usage
  this.propsAppl = {
    getShadowBlur: () => this.radius * 0.2,
    getShadowOffset: () => this.radius * 0.05,
    getInnerCircleWidth: () => this.radius * 0.1,
    getInnerRadius: () => this.radius * 0.88,
    getFaceLineWidth: () => this.radius * 0.02,
    getLineOutCoord: () => this.propsAppl.getInnerRadius() - this.propsAppl.getFaceLineWidth() - this.propsAppl.getInnerCircleWidth() / 2,
    getCenterRingWidth: () => this.radius * 0.25,
    getCenterInnerRingWidth: () => this.radius * 0.15,

    // rotates canvas around it's center point
    rotateCanvas: () => {
      contextLayout.rotateCanvas(this.context, this.centerX, this.centerY, this.angle);
    },

    // Gets coordinates relatively to radius of face's inner circle
    coordCalc: (angle, lineLength) => {
      let shiftCoordOut = this.propsAppl.getInnerRadius() - lineLength - this.propsAppl.getInnerCircleWidth() / 2;
      let x1_out = this.centerX + (this.propsAppl.getLineOutCoord() * Math.cos(angle));
      let y1_out = this.centerY + (this.propsAppl.getLineOutCoord() * Math.sin(angle));

      let x2_out = this.centerX + (shiftCoordOut * Math.cos(angle));
      let y2_out = this.centerY + (shiftCoordOut * Math.sin(angle));

      return {
        x1_out: x1_out,
        y1_out: y1_out,
        x2_out: x2_out,
        y2_out: y2_out
      };
    }, //coordCalc


    // Draws tetx on Appliance's face
    drawText: (angle, shiftRatio, font, text) => {
      let { x2_out, y2_out } = this.propsAppl.coordCalc(angle, this.radius * shiftRatio);
      this.context.beginPath()
      contextLayout.drawCenterText(this.context, font,
        text, x2_out, y2_out);
        this.context.stroke();
    },

    // Draws inner circles of Appliance's face
    drawInnerFace: () => {
      let grad = this.context.createLinearGradient(this.centerX, this.centerY + this.radius * 0.25, this.centerX, this.centerY - this.radius);

      // inner circle
      this.fieldsAppl.drawArc.call(this, {
        radius: this.propsAppl.getInnerRadius(), fillStyle: this.backRingColor,
        strokeStyle: this.innerRingColor, lineWidth: this.propsAppl.getInnerCircleWidth(), shadowColor: 'black', shadowOffset: 1, shadowBlur: 1
      });

      // center outer ring 
      grad.addColorStop(0, 'white');
      grad.addColorStop(0.5, this.innerRingColor);
      this.fieldsAppl.drawArc.call(this, { radius: this.propsAppl.getCenterRingWidth(), fillStyle: grad, shadowColor: 'black', shadowOffset: 1, shadowBlur: 1 });

      // center inner ring 
      grad = this.context.createLinearGradient(this.centerX, this.centerY + this.radius * 0.7, this.centerX, this.centerY - this.radius);
      grad.addColorStop(0, this.innerRingColor);
      grad.addColorStop(0.5, 'white');
      this.fieldsAppl.drawArc.call(this, { radius: this.propsAppl.getCenterInnerRingWidth(), fillStyle: grad, shadowColor: 'black', shadowOffset: 1, shadowBlur: 1 });
    }, // drawInnerFace

    // Draws outer circle with shadow of Appliance's face
    drawOuterFace: () => {
      // outer circle with shadow
      this.fieldsAppl.drawArc.call(this, {
        fillStyle: this.ringColor, strokeStyle: 'black', lineWidth: 1,
        shadowColor: '#464646', shadowOffset: this.propsAppl.getShadowOffset(), shadowBlur: this.propsAppl.getShadowBlur()
      });
    }, // drawOuterFace


  } // this.propsAppl



} //Appliance 


Appliance.prototype = {

  /**
   * Draws appliance
   */
  draw : function () {
    this.context.save();
    this.propsAppl.rotateCanvas();

    // outer circle
    this.propsAppl.drawOuterFace();

    // inner circles
    this.propsAppl.drawInnerFace();

    this.context.restore();

    // small inner dot  
    this.fieldsAppl.drawCenterDot.call(this);
  }, //draw


  // Draws arrow indicator 
  drawPointer : function (angle = 0, arcWidth = 10) {

    this.context.save();
    this.propsAppl.rotateCanvas(this.centerX, this.centerY, this.radius, this.radius);

    this.context.beginPath();
    this.context.strokeStyle = 'black'; // border color of the needle 

    let startAngle = application.degrToRad(angle);
    let a_end_ang = application.degrToRad((angle + 180 + arcWidth));
    let a_start_ang = application.degrToRad((angle + 180 - arcWidth));

    this.context.shadowColor = '#464646';
    this.context.shadowOffsetX = 5;
    this.context.shadowOffsetY = 5;
    this.context.shadowBlur = 5;

    let y1_out = this.centerY + (this.propsAppl.getLineOutCoord() * Math.sin(startAngle));
    let x1_out = this.centerX + (this.propsAppl.getLineOutCoord() * Math.cos(startAngle));

    this.context.moveTo(x1_out, y1_out); // Coordinate of tip of the needle
    this.context.arc(this.centerX, this.centerY, 0.3 * this.radius, a_start_ang, a_end_ang);
    this.context.lineTo(x1_out, y1_out);
    this.context.fillStyle = this.pointerColor;
    this.context.fill();
    this.context.stroke();

    this.context.restore();

    this.fieldsAppl.drawCenterDot.call(this);
  }// drawPointer

}