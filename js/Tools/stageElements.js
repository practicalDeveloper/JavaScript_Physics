/**
 * Canvas drawn movable object
 */
function MovableItem(options = {}) {

  /**
   * default values for an item
   */
  Object.assign(this, {
    x: 0,
    x: 0,
    width: 40,
    height: 40,
    fill: "#7aa7ca",
    strokeColor: "black",
    isDragging: false,
    weight: 1,
    itemText: "item",
    lineWidth : 2,
    canvas: undefined,
  }, options);


  /**
   * properties of MovableItem for internal usage
   */
  this.props = {
    getItemFont: () => this.width * 0.35 + "px Tahoma", // font of label for item
    getHookSize: () => this.height/2, // Width and height of bottom hook
    getUpperHookSize: () => this.height/5, // height of upper hook
    geItemHeight: () => this.height + this.props.getHookSize() + this.props.getUpperHookSize(), // total height of element

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
      let xCoord = this.x + this.width/2;
      let yCoord = this.y + this.height;

      ctx.lineWidth = this.lineWidth; 
      ctx.beginPath();
      let hLine = this.props.getUpperHookSize();
      //draw upper line
      ctx.moveTo(this.x + this.width/2, this.y);
      ctx.lineTo(this.x + this.width/2, this.y - hLine);
      ctx.stroke();

      var hook = new Hook({ x: xCoord, y: yCoord, size: this.props.getHookSize(),  canvas: appElements.canvas});
      hook.draw();
    }, // drawHook

  }; // this.props



} // MovableItem





function Cargo(options) {

  // inheritance from MovableItem
  MovableItem.call(this, options);
  // default values for Cargo
  Object.assign(this, options);

}// Cargo

Cargo.prototype = Object.create(MovableItem.prototype);
Cargo.prototype.constructor = Cargo;

Cargo.prototype.draw = function () {
  let ctx = this.canvas.getContext("2d");
  ctx.save();

  // draws body with shadow
  ctx.save();
  contextLayout.applyShadow(ctx);
  ctx.beginPath();
  let h = this.height / 9;
  ctx.moveTo(this.x, this.y);
  ctx.lineTo(this.x, this.y + (this.height - h));
  ctx.quadraticCurveTo(this.x + this.width / 2, this.y + this.height, this.x + this.width, this.y + (this.height - h));
  ctx.lineTo(this.x + this.width, this.y);
  ctx.fillStyle = this.props.linearGradient(ctx);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  //Upper ellipse
  ctx.beginPath();
  ctx.ellipse(
    this.x + this.width / 2,
    this.y,
    this.width / 2,
    h / 2,
    0, 0, 2 * Math.PI);
  ctx.fillStyle = "white";
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  this.props.drawHook(ctx);

  ctx.restore();
}//Cargo.prototype.draw




function Brick(options) {

  // inheritance from MovableItem
  MovableItem.call(this, options);

  // default values for Brick
  Object.assign(this,{
    roundRadius: 5,
  }, 
  options);

}// Brick

Brick.prototype = Object.create(MovableItem.prototype);
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






function Ball(options) {

  // inheritance from MovableItem
  MovableItem.call(this, options);

  // default values for Ball
  Object.assign(this, options);

}// Ball

Ball.prototype = Object.create(MovableItem.prototype);
Ball.prototype.constructor = Ball;


Ball.prototype.draw = function () {
  let ctx = this.canvas.getContext("2d");

  ctx.save();

  ctx.beginPath();
  ctx.ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, this.height / 2, 0, 0, 2 * Math.PI);
  ctx.fillStyle = this.fill;

  ctx.closePath();
  ctx.fill();

  ctx.stroke();
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
    x: 0,
    y: 0,
    size: 40,
    lineWidth : 2,
    canvas: undefined,
    angle :0,
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
    let hLine = this.size/6;
    let hookR = this.size/2;
    ctx.strokeStyle = this.strokeColor;
    //draw upper line
    ctx.moveTo(this.x , this.y);
    ctx.lineTo(this.x, this.y + this.size - 2* (hookR - hLine));
    ctx.stroke();
    
    //draw half circle 
    ctx.beginPath();
    ctx.arc(this.x, this.y + hLine + hookR, 
      hookR - hLine , application.degrToRad(270), application.degrToRad(180));
    ctx.stroke();

    ctx.restore();
  } //Hook.prototype.draw







