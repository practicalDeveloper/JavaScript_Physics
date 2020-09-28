/**
* Methods related to the topic 'Mechanical Oscillations' principle
*/
const pendulumDemo = {
    canvas: undefined,
    ctx: undefined,
    timer: undefined,

    constants: Object.freeze({
        ballRadiaus: 20,
        smallBallRadiaus: 6,
    }),

    settings: {
        pendulumLength: 0,
        pendulumLength2: 0,
        pendulumCoord: { x: 0, y: 0 }, // pendulum's center coord
    },


    applySettings: function () {
        this.settings.pendulumCoord.x = this.canvas.clientWidth / 2;
        this.settings.pendulumCoord.y = this.canvas.clientHeight / 8;

    },


    /**
    * Initialization
    */
    init: function () {
        this.applySettings();
    },


    /**
    * Drawing of the pendulum 
    */
    drawPendulum: function (xCoord, yCoord, ballColor) {

        //holder
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(this.settings.pendulumCoord.x, this.settings.pendulumCoord.y);
        this.ctx.lineTo(xCoord, yCoord);
        this.ctx.strokeStyle = "#003300";
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        this.ctx.fill();
        this.ctx.restore();


        //main ball
        this.ctx.save();

        this.ctx.beginPath();
        this.ctx.fillStyle = ballColor;
        this.ctx.arc(xCoord, yCoord, this.constants.ballRadiaus, 0, 180);
        this.ctx.fill();
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = '#003300';
        this.ctx.stroke();

        this.ctx.restore();

        
        //small center ball
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.fillStyle = 'yellow';
        this.ctx.arc(this.settings.pendulumCoord.x, 
            this.settings.pendulumCoord.y, this.constants.smallBallRadiaus, 0, 180);
        this.ctx.fill();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = '#003300';
        this.ctx.stroke();

        this.ctx.restore();
    },


    animatePendulum: function (startAngle, timeInterval, startAngle2, timeInterval2) {

        let interval = 20; // interval for the timer in ms
        var expected = Date.now() + interval;
        let canvas = this.canvas;

        let calculateSettings = (angle, period) => {
            let angleStep = 0; // speed movement of the pendulum according to timeInterval
            let endAngle = 0;
            let degrDiff = 0;
            let currentAngle = angle;
            
    
            if (angle >= 180 && angle <= 270) {
                angle = 270 + (270 - angle);
            }
    
            if (angle > 90 && angle < 180) {
                angle = 90 - (angle - 90);
            }
    
    
            if (angle >= 0 && angle <= 90) {
                endAngle = 180 - angle;
            }
    
            if (angle >= 270 && angle <= 360) {
                endAngle = (angle + 360) - 2 * (angle - 270);
            }
    
            degrDiff = endAngle - angle;
    
            angleStep = ((2 * degrDiff) * interval) / period; // speed movement of the pendulum according to timeInterval
    
            if (currentAngle > 90) {
                currentAngle = endAngle;
                angleStep = -angleStep;
            }

            return { 
                    angleStep,
                    endAngle ,
                    degrDiff ,
                    currentAngle ,
                    angle 
                }
        }


        let currentPosition = { x: 0, y: 0 };
        let radius = this.settings.pendulumLength;
        let firstSettings = calculateSettings(startAngle, timeInterval);

        startAngle = firstSettings.angle;
        let angleStep = firstSettings.angleStep; // speed movement of the pendulum according to timeInterval
        let endAngle = firstSettings.endAngle;
        let currentAngle = firstSettings.currentAngle;

        let currentPosition2 = { x: 0, y: 0 };
        let radius2 = this.settings.pendulumLength2;
        let secondSettings = calculateSettings(startAngle2, timeInterval2);

        startAngle2 = secondSettings.angle;
        let angleStep2 = secondSettings.angleStep;
        let endAngle2 = secondSettings.endAngle;
        let currentAngle2 = secondSettings.currentAngle;

        let step = () => { 
            var dt = Date.now() - expected;
            contextLayout.clearCanvas(this.canvas);
            expected += interval;

            currentAngle = application.roundTwoDigits(currentAngle + angleStep);
            if (currentAngle >= endAngle || currentAngle <= startAngle) {
                angleStep = - angleStep;
            }

            currentPosition.x = this.settings.pendulumCoord.x + (Math.cos(application.degrToRad(currentAngle)) * radius);
            currentPosition.y = this.settings.pendulumCoord.y + (Math.sin(application.degrToRad(currentAngle)) * radius);



            currentAngle2 = application.roundTwoDigits(currentAngle2 + angleStep2);
            if (currentAngle2 >= endAngle2 || currentAngle2 <= startAngle2) {
                angleStep2 = - angleStep2;
            }

            currentPosition2.x = this.settings.pendulumCoord.x + (Math.cos(application.degrToRad(currentAngle2)) * radius2);
            currentPosition2.y = this.settings.pendulumCoord.y + (Math.sin(application.degrToRad(currentAngle2)) * radius2);

            contextLayout.clearCanvas(canvas);
            this.drawPendulum(currentPosition.x, currentPosition.y, 'red');
            this.drawPendulum(currentPosition2.x, currentPosition2.y, 'blue');
            
            this.timer = setTimeout(step, Math.max(0, interval - dt)); 
        }

        this.timer = setTimeout(step, interval);
    },

    /**
    *  function which calls during changing data in IFrame 
    */
    receivedMessage: async function () {
        this.stopTimer();

        let initialPendulumL = this.canvas.clientHeight / 15;
        this.settings.pendulumLength = initialPendulumL * applicationRendering.topicVariables.firstLength;
        this.settings.pendulumLength2 = initialPendulumL * applicationRendering.topicVariables.secondLength;


        this.animatePendulum(Number(applicationRendering.topicVariables.firstAngle), 
            applicationRendering.topicVariables.firstPeriod * 1000,
             Number(applicationRendering.topicVariables.secondAngle), 
             applicationRendering.topicVariables.secondPeriod * 1000);
    },

    stopTimer: function () {
        if (this.timer != undefined) {
            clearTimeout(this.timer);
        }
    },

    // clears all variables
    reset: function () {
        this.stopTimer();
    },


} // pendulumDemo