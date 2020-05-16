const forcesAddition = {
    dynamometers: undefined,
    canvas : undefined,

    init: function () {
        this.dynamometers = forcesAddition.initRender();
    },

    initRender: function () {
        
        var dynam3 = new Dynamometer({
            centerX: 800, centerY: 450, radius: 250, angle: 40, maxValue: 50,
            ringColor: "red", backRingColor: "yellow", canvas: appElements.canvas
        });
        dynam3.value = 6;
        dynam3.draw();

        var dynam2 = new Dynamometer({ centerX: 100, centerY: 250, radius: 90, angle: 0, maxValue: 8, canvas: appElements.canvas, maxValue: 4, });
        dynam2.draw();
        dynam2.setValue(-1.23);

        return Object.freeze({
            dynam2,
            dynam3
        });

    },// initRender

    // clears all variables
    empty: function () {
        this.dynamometers = undefined;
    },

} //forcesAddition



