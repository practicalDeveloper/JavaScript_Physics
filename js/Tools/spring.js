/**
 * Canvas drawn spring object 
 */
function Spring(options = {}) {
  // default values for the spring
  Object.assign(this, {
    canvas: undefined,
    swingFrontColor: "lightGray", //  color of front swing
    swingBackColor: "gray",//  color to simulate back swing 
    startX: 0, // star X coordinate of spring 
    startY: 0,// star Y coordinate of spring 
    length: 100, // length of spring
    radius: 50, // radius of sine wave 
    swings: 5, // number of swings
    angle: 0, // rotation angle relatively of upper left corner
    swingWidth: 3 // width of each swing
  }, options);
}

Spring.prototype.draw = function () {
  let ctx = this.canvas.getContext("2d");
  ctx.save();
  ctx.lineCap = "round";
  contextLayout.rotateCanvas(ctx, this.startX, this.startY, this.angle);

  let swingLength = this.length / this.swings; // length of each short swing

  let drawSinusWave = function (lineColor, lineWidth, isFullWave) {
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;
    let currentSwing = 0;
    
    // drawing of an each swing in cycle
    while (currentSwing < this.swings) {
      let beginX = this.startX + swingLength * currentSwing;
      let endX = beginX + swingLength;
      let waveStepX = (endX - beginX) / 360;
      // drawing of particular swing
      for (let x = 0; x <= endX - beginX; x += waveStepX) {
        y = this.startY - (Math.sin((1 / waveStepX) * (x * Math.PI / 180))) * this.radius;
        if (isFullWave) {
          ctx.lineTo(beginX + x, y);
        }
        // to draw wave only in the period between 90 and 270 degrees
        else {
          if (((1 / waveStepX) * x) > 90 && ((1 / waveStepX) * x) < 270) {
            ctx.lineTo(beginX + x, y);
          }
          else {
            ctx.moveTo(beginX + x, y);
          }
        }
      }

      currentSwing++;
    }
    ctx.stroke();
  }; //drawSinusWave


  // border
  drawSinusWave.call(this, 'black', this.swingWidth, true);
  // back wave
  drawSinusWave.call(this, this.swingBackColor, this.swingWidth - 1, true);
  // front wave
  drawSinusWave.call(this, this.swingFrontColor, this.swingWidth - 1, false);

  ctx.restore();
}





