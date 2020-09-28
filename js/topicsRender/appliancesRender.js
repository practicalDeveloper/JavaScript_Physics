/**
* Methods related to the topic 'Appliances'
*/
const appliancesDemo = {
    canvas: undefined,
    ctx: undefined,

    /**
    * Initialization
    */
    init: function () {

        let springDynamometer = new SpringDynamometer({
            startX: 100,
            startY: 50,
            canvas: this.canvas,
            angle: 90,
            length: 400,
            height: 60,
            strokeColor: "black",
            value: 20,
            animatedHolder: true,
            maxValue: 50
        });


        let ruler = new Ruler({
            startX: 200,
            startY: 50,
            canvas: this.canvas,
            length: 500,
            height: 60,
            strokeColor: "black",
            maxValue: 500
        });

        let spring = new Spring({
            radius: 30,
            startX: 200,
            startY: 150,
            length: 200,
            canvas: this.canvas,
            swings: 20
        });


        let dynamometer = new Dynamometer({
            centerX: 250,
            centerY: 300,
            radius: 100,
            ringColor: "red",
            innerRingColor: "yellow",
            canvas: this.canvas,
            rotateStep : 0.1,
            angle: 45,
            maxValue: 20
        });

        let appliance = new Appliance({
            centerX: 600,
            centerY: 300,
            radius: 100,
            canvas: this.canvas
        });


        let ball = new Ball({
            x: 510,
            y: 130,
            width: 40,
            height: 40,
            itemText: "Ball",
            canvas: this.canvas,
        });


        let brick = new Brick({
            x: 450,
            y: 130,
            width: 40,
            height: 40,
            fill: "LightGray",
            strokeColor: "black",
            itemText: "Brick",
            lineWidth: 2,
            canvas: this.canvas,
        });

        let hook = new Hook({
            x: 580,
            y: 130,
            size: 40,
            lineWidth: 2,
            canvas: this.canvas,
            angle: 0,
        });

        contextLayout.clearCanvas(this.canvas);
        brick.draw();
        ball.draw();
        hook.draw();
        ruler.draw();
        spring.draw();
        dynamometer.draw();
        dynamometer.setStaticValue(-2);

        appliance.draw();
        appliance.drawPointer(90);

        springDynamometer.draw();
    },
}