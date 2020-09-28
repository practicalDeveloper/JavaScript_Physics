/**
 * Canvas drawn ruler object 
 */
function Ruler(options = {}) {
  // default values for ruler
  Object.assign(this, {
    canvas: undefined,
    startX: 0, // left top start X coordinate of ruler 
    startY: 0,  // left top start Y coordinate of ruler 
    length: 200, // length of ruler
    height: 50, // height of ruler
    maxValue: 10, // max ruler value
    backColor: "orange", // background color of ruler
    strokeColor: "black", //  line color 
    showBackground: true,  //shows/hides background of ruler
    showBottom: true, //shows/hides bottom strokes of ruler
    angle: 0, // rotation angle relatively of upper left corner
  }, options);

}


Ruler.prototype.draw = function () {

  let ctx = this.canvas.getContext("2d");
  let endX = this.startX + this.length;
  let divisor = 10;
  let step = (endX - this.startX) / (this.maxValue * divisor);
  let shortLineHeight = this.height / 6;
  let lineHeight = shortLineHeight;
  let font = (step + 10) + "px Times New Roman";
  let stepHideCondition = step > 2;

  ctx.save();
  contextLayout.rotateCanvas(ctx, this.startX, this.startY, this.angle);

  if (this.showBackground) {
    ctx.beginPath();
    ctx.fillStyle = this.backColor;
    ctx.strokeStyle = this.strokeColor;
    ctx.fillRect(this.startX, this.startY, this.length, this.height);
    ctx.rect(this.startX, this.startY, this.length, this.height);
    ctx.stroke();
  }


  ctx.beginPath();
  ctx.strokeStyle = this.strokeColor;
  ctx.fillStyle = this.strokeColor;
  ctx.lineWidth = 1;


  for (let x = 1; x <= (this.maxValue * divisor) - 1; x++) {
    let xCoord = this.startX + x * step;

    if (x % divisor == 0)
    //long lines
    {
      lineHeight = this.height / 3;
      let currentValue = x / divisor;
      let metrics = ctx.measureText(currentValue); // width and height of text

      // draws labels with text, depending on the maximum value
      let drawCondition = (intervalStart, intervalEnd, conditionNumber) => {
        if (this.maxValue > intervalStart && this.maxValue <= intervalEnd) {
          // big interval drawing condition
          if (currentValue % conditionNumber == 0) {
            // Don't draw, if coord. of text is outside of control
            if (xCoord + metrics.width / 2 < endX) {
              contextLayout.drawCenterText(ctx, font, currentValue, xCoord, this.startY + this.height / 2);
            }
          }
          else {
            // small interval drawing condition
            if (currentValue % (Math.round(conditionNumber / divisor)) == 0) {
              lineHeight = shortLineHeight;
            }
            else {
              lineHeight = 0;
            }
          }

        }
      }

      let conditionNumber = stepHideCondition ? 1 : divisor;
      let interval = 100;

      // 10 -100 interval
      drawCondition(divisor, interval, conditionNumber);

      // 100 -1000 interval
      for (i = 1; i < divisor; i++) {
        let beginInterval = i * interval;
        let endInterval = (i * interval) + interval;
        let condition = i * conditionNumber;
        drawCondition(beginInterval, endInterval, condition);
      }


      if (this.maxValue <= divisor) {
        contextLayout.drawCenterText(ctx, font, x / divisor, xCoord, this.startY + this.height / 2);
      }
    }

    // short lines
    else {
      lineHeight = stepHideCondition ? shortLineHeight : 0;
    }

    // ruler lines
    ctx.moveTo(xCoord, this.startY);
    ctx.lineTo(xCoord, this.startY + lineHeight);

    if (this.showBottom) {
      ctx.moveTo(xCoord, this.startY + this.height);
      ctx.lineTo(xCoord, (this.startY + this.height) - lineHeight);
    }
  }
  ctx.stroke();
  ctx.restore();

}



