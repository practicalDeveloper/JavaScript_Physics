/**
* Methods and properties of the main page
*/
const applicationRendering = {
  topics: {  forcesAdditionByAngleId: 1, ArchimedesPrincipleId: 2 , 
    pendulumDemoId : 3, AppliancesDemoId: 4}, // data attributes from the HTML menu corresponding to the physical topics 
  currentTopic: undefined, // to set current selected topic from HTML the menu
  canvas: application.canvas, // main canvas in the application
  context: application.canvas.getContext("2d"), // main canvas' context in the application
  topicVariables: undefined, // variables in JSON format from the IFrame

  /**
  * initial initialization of the application
  */
 initialInit: function () {
    contextLayout.stretchCanvas(this.canvas, "divCanvas");

    dragRendering.canvas = forcesbyAngleDemo.canvas =
    archimedesPrincipleDemo.canvas = pendulumDemo.canvas = appliancesDemo.canvas = this.canvas;
       forcesbyAngleDemo.ctx = archimedesPrincipleDemo.ctx = pendulumDemo.ctx = appliancesDemo.ctx = this.context;

    this.renderMenu();
  }, // initialInit


/**
* passes variables from the IFrame element to each topic
*/
  receiveData: function () {
    switch (this.currentTopic) {
      case this.topics.forcesAdditionByAngleId:
        forcesbyAngleDemo.receivedMessage();
        break;
      case this.topics.ArchimedesPrincipleId:
        archimedesPrincipleDemo.receivedMessage();
        break;
        case this.topics.pendulumDemoId:
          pendulumDemo.receivedMessage();
          break;
      default:
        // no topic provided

    }
  }, // receiveData

  /**
  * renders the HTML menu
  */
  renderMenu: function () {
    let menuElements = document.getElementsByClassName("menu-item");

    for (let elem of menuElements) {
      let leveleId = elem.id;
      let div = elem.getElementsByClassName("menu-sub-item")[0];
      elem.onclick = () => (div.hidden = !div.hidden);

      if (div != undefined) {
        let divElements = div.querySelectorAll("div");

        for (let elementDiv of divElements) {
          elementDiv.onclick = () => { 
            let header = document.getElementById("ApplicationHeader");
            //applies title text
            header.innerText = elementDiv.innerText;
            //applies title color
            let css = "--" + leveleId + "-color";
            //gets color from CSS c=variables
            let titleColor = application.getRootVarCSS(css);
            header.style.color = titleColor;

            //sets current topic for topics enumeration
            this.currentTopic = Number(
              elementDiv.dataset.topic
            );
            contextLayout.clearCanvas(this.canvas);
            this.clearTopics();
            pendulumDemo.stopTimer();
            
            //renders canvas depending on the current topic
            switch (this.currentTopic) {
              case this.topics.forcesAdditionByAngleId:
                forcesbyAngleDemo.init();
                break;
              case this.topics.ArchimedesPrincipleId:
                archimedesPrincipleDemo.init();
                break;
                case this.topics.pendulumDemoId:
                  pendulumDemo.init();
                  break;
                case this.topics.AppliancesDemoId:
                  appliancesDemo.init();
                  break;
              default:
                // no topic provided
            } // switch
          } //elementDiv.onclick
        }
      }
    }

  }, // renderMenu

  // clears variables for all topics
  clearTopics: function () {
    dragRendering.dragElements = [];
    forcesbyAngleDemo.reset();
    archimedesPrincipleDemo.reset();
    pendulumDemo.reset();
  }, // clearTopics

  /**
   * Passes message to the IFrame
   */
  sendFrameMessage: function (passData) {
    let frame = window.frames.BoardFrame;
    frame.postMessage(JSON.stringify(passData), "*");
  }, // clearTopics

}; // applicationRendering







// implementation
applicationRendering.initialInit();

window.addEventListener(
  "message",
  function (e) {
    var key = e.message ? "message" : "data";
    var data = e[key];
    applicationRendering.topicVariables = JSON.parse(data);
    applicationRendering.receiveData();
  },
  false
);

application.canvas.onmousedown = function (e) {
  dragRendering.canvasMouseDown(e);
};
application.canvas.onmouseup = function (e) {
  dragRendering.canvasMouseUp(e);
};
application.canvas.onmousemove = function (e) {
  dragRendering.canvasMouseMove(e);
};
