/**
* Methods and properties of whole application
*/
const application = {
    arcPath: (2 * Math.PI),
    degrToRad: (degrees) => (Math.PI / 180) * degrees,
    kgToNewton: (kg) =>  kg * 9.81,
    canvas: document.getElementById("Canvas"),
    timeout : ms => new Promise(resolve => setTimeout(resolve, ms)),
    roundTwoDigits: (param) => (Math.round(param * 100) / 100),

    /**
    * Gets promise with setTimeout
    */
    timeoutPromise :  ms => {
        let timer = 0;
        const promise = new Promise((resolve) => {
            timer = setTimeout(resolve, ms);
        });
        return { promise , timer  };
    },

    /**
    * Gets value of global CSS variable
    * @param {string} varName Variable name in CSS file 
    */
    getRootVarCSS: (varName) => {
        let root = document.querySelector(':root');
        let rootStyles = getComputedStyle(root);
        return rootStyles.getPropertyValue(varName);
    },
    // validates decimal numbers
    isNumber: (n) => !isNaN(parseFloat(n)) && isFinite(n),
}// application



/**
* Functions related to canvas
*/
const contextLayout = {

    /**
    * clears whole canvas area
    */
    clearCanvas: function (canvas) {
        let context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
    },// clearCanvas

    /**
    * rotates canvas around a point
    */
    rotateCanvas: function (context, x, y, angle) {
        context.translate(x, y);
        context.rotate(application.degrToRad(angle));
        context.translate(-x, -y);
    },// rotateCanvas

    /**
    * fits canvas size to element
    */
    stretchCanvas: function (canvas, elementName) {
        let div = document.getElementById(elementName);
        canvas.width = div.clientWidth;
        canvas.height = div.clientHeight;
    },// stretchCanvas


    /**
    * sets shadow for canvas 
    */
    applyShadow: function (context) {
        context.shadowColor = '#464646';
        context.shadowOffsetX = 5;
        context.shadowOffsetY = 5;
        context.shadowBlur = 5;
    },// applyShadow

    /**
    * draws text aligned to center 
    */
    drawCenterText: function (context, font, text, x, y) {
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = font;
        context.fillText(text, x, y);
    },// drawCenterText


    /**
    * rectangle with rounded corners
    */
    roundRect: function (context, x, y, width, height, radius, lineWidth = 0, fill = "white") {
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        context.save();
        context.beginPath();

        context.moveTo(x + radius, y);
        context.arcTo(x + width, y, x + width, y + height, radius);
        context.arcTo(x + width, y + height, x, y + height, radius);
        context.arcTo(x, y + height, x, y, radius);
        context.arcTo(x, y, x + width, y, radius);
        context.lineWidth = lineWidth;
        context.fillStyle = fill;

        if (lineWidth > 0) {
            context.stroke();
        }

        context.closePath();
        context.fill();

        context.restore();
    }// roundRect


}// contextLayout

