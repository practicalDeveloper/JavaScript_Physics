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
            value: 0,
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
            length : 200,
            canvas: this.canvas,
            swings : 20
          }); 


          var dynamometer = new Dynamometer({
            centerX: 250, 
            centerY: 300,
            radius: 100,
            ringColor: "red", 
            backRingColor: "yellow", 
            canvas: this.canvas,
            maxValue: 20
        });


        springDynamometer.valueOnChange = function () {
            contextLayout.clearCanvas(this.canvas);
            ruler.draw();
            spring.draw();
            dynamometer.draw();
            dynamometer.setStaticValue(-3);

        };

        springDynamometer.draw();
        springDynamometer.setValue(30).then(function () {
            springDynamometer.setValue(0);
        });
    },
}