
/**
 * functions related to IFrame
 */
const frameRender = {

    /**
     * custom function to send message to parent from IFrame
     */
    passControlsMessage: function () { },

    /**
     * function to bind change events of elements with message sending
     */
    bindEvents: function () {
        let passMsg = this.passControlsMessage.bind(this);
        let divElement = document.querySelector('body');

        // all input elements
        let inputElements = divElement.querySelectorAll('input');
        for (let elem of inputElements) {

            // sets label value for range slider
            let setRangeLabelValue = function() {
                if (elem.type == "range") {
                    // finds label element next from slider
                    let next = elem.nextElementSibling;
                    next.innerHTML = elem.value;
                }
            };

            setRangeLabelValue();

            elem.oninput = function () {
                setRangeLabelValue();
                passMsg();
            }
        }
    },// bindEvents

    /**
     * custom function to call when data from the main window received
     */
    receiveData: function (data) {

    }
}


window.onload = function () {
    frameRender.bindEvents();
    frameRender.passControlsMessage();
};


window.addEventListener(
    "message",
    function (e) {
      var key = e.message ? "message" : "data";
      var data = e[key];
      frameRender.receiveData(data);
    },
    false
  );


