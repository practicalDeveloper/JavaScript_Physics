/**
 * Canvas drawn object for physics experiments like cargo, brick etc.
 */
function StageItem(options = {}) {

  /**
   * default values for an item
   */
  Object.assign(this, {
    x: 0, // left top start X coordinate of item 
    y: 0, // left top start Y coordinate of item 
    width: 40, // width of item in pixels
    height: 40, // height of item in pixels
    fill: "#7aa7ca", // background color of item
    strokeColor: "black", // stroke color of item
    weight: 1, // weight of item ( can be kg, g, pound etc.)
    itemText: "item", // text on item
    lineWidth: 2, // stroke width of item
    canvas: undefined,
  }, options);


  /**
   * properties of StageItem for internal usage
   */
  this.props = {
    getItemFont: () => this.width * 0.35 + "px Tahoma", // font of label for item

    /**
    * creates and returns linear gradient
    */
    linearGradient: (ctx) => {
      let gradient = ctx.createLinearGradient(
        this.x,
        this.y,
        this.x + this.width,
        this.y);

      gradient.addColorStop(0, this.fill);
      gradient.addColorStop(.4, 'white');
      gradient.addColorStop(.6, 'white');
      gradient.addColorStop(1, this.fill);
      return gradient
    }, // linearGradient

    /**
     * draws a hook for an item
     */
    drawHook: (ctx) => {
      let xCoord = this.x + this.width / 2;
      let yCoord = this.y + this.height;

      ctx.lineWidth = this.lineWidth;
      ctx.beginPath();
      let hLine = this.getUpperHookSize();
      //draw upper line
      ctx.moveTo(this.x + this.width / 2, this.y);
      ctx.lineTo(this.x + this.width / 2, this.y - hLine);
      ctx.stroke();

      var hook = new Hook({ x: xCoord, y: yCoord, size: this.getHookSize() });
      hook.canvas = this.canvas;
      hook.draw();
    }, // drawHook

  }; // this.props


  /**
  * Gets width and height of bottom hook
  */
  this.getHookSize = () => {
    return this.height / 2;
  }

  /**
  * Gets height of upper hook
  */
  this.getUpperHookSize = () => {
    return this.height / 5;
  }

  /**
  * Gets total height of element
  */
  this.geItemHeight = () => {
    return this.height + this.getHookSize() + this.getUpperHookSize();
  }

} // StageItem




/**
 * Canvas drawn brick object
 */
function Brick(options) {

  // inheritance from StageItem
  StageItem.call(this, options);

  // default values for Brick
  Object.assign(this, {
    roundRadius: 5, // round roudius of rectangle
  },
    options);

}// Brick

Brick.prototype = Object.create(StageItem.prototype);
Brick.prototype.constructor = Brick;


Brick.prototype.draw = function () {
  let ctx = this.canvas.getContext("2d");

  // element drawing
  ctx.save();
  contextLayout.applyShadow(ctx);
  contextLayout.roundRect(ctx, this.x, this.y, this.width, this.height, this.roundRadius, this.lineWidth, this.fill);
  ctx.restore();

  // text drawing and hook drawing
  ctx.save();
  this.props.drawHook(ctx);
  contextLayout.drawCenterText(ctx, this.props.getItemFont(),
    this.itemText, this.x + this.width / 2, this.y + this.height / 2);
  ctx.restore();
} //Brick.prototype.draw



/**
 * Canvas drawn ball object
 */
function Ball(options) {

  // inheritance from StageItem
  StageItem.call(this, options);

  // default values for Ball
  Object.assign(this, options);

}// Ball

Ball.prototype = Object.create(StageItem.prototype);
Ball.prototype.constructor = Ball;


Ball.prototype.draw = function () {
  let ctx = this.canvas.getContext("2d");

  ctx.save();
  
  // background
  ctx.beginPath();
  contextLayout.applyShadow(ctx);
  ctx.ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, this.height / 2, 0, 0, 2 * Math.PI);
  ctx.fillStyle = this.fill;
  
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.save();

  // border
  ctx.beginPath();
  ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, 2 * Math.PI, false);
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'black';  
   ctx.stroke();

  // hook
  this.props.drawHook(ctx);
  contextLayout.drawCenterText(ctx, this.props.getItemFont(),
    this.itemText, this.x + this.width / 2, this.y + this.height / 2);
  ctx.restore();
}//Ball.prototype.draw




/**
 * Canvas drawn hook object
 */
function Hook(options = {}) {
  /**
   * default values for a hook
   */
  Object.assign(this, {
    x: 0, // top center start X coordinate of hook 
    y: 0, // top center start Y coordinate of hook 
    size: 40, // width and heigh of hook in pixels
    lineWidth: 2, // stroke width of hook
    canvas: undefined,
    angle: 0, // rotation angle relatively of top center point
  }, options);

}

/**
 * Draws hook
 */
Hook.prototype.draw = function () {
  let ctx = this.canvas.getContext("2d");
  ctx.save();
  contextLayout.rotateCanvas(ctx, this.x, this.y, this.angle);

  ctx.lineWidth = this.lineWidth;

  ctx.beginPath();
  let hLine = this.size / 6;
  let hookR = this.size / 2;
  ctx.strokeStyle = this.strokeColor;

  //draw upper line
  ctx.moveTo(this.x, this.y);
  ctx.lineTo(this.x, this.y + this.size - 2 * (hookR - hLine));
  ctx.stroke();

  //draw half circle 
  ctx.beginPath();
  ctx.arc(this.x, this.y + hLine + hookR,
    hookR - hLine, application.degrToRad(270), application.degrToRad(180));
  ctx.stroke();

  ctx.restore();
} //Hook.prototype.draw







