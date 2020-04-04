
/**
 * functions related to IFrame
 */
const frameRender = {

    // custom function to send message to parent from IFrame
    passControlsMessage: function () { },

    // function to bind change events of elements with message sending
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
            };// setRangeLabelValue

            setRangeLabelValue();

            elem.oninput = function () {
                setRangeLabelValue();
                passMsg();
            }
        }
    }// bindEvents
}

/**
 * 
 */
window.onload = function () {
    frameRender.bindEvents();
    frameRender.passControlsMessage();
};


