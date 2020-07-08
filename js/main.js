/**
* Methods and properties of the main page
*/
const applicationRendering = {
  topics: {  forcesAdditionByAngleId: 1, ArchimedesPrincipleId: 2 , 
    pendulumDemoId : 3, AppliancesDemoId: 4}, // all data-topic attributes from the HTML menu
  currentTopic: undefined, // to set current selected topic in the menu
  canvas: application.canvas, // main canvas in the application
  context: application.context, // main canvas' context in the application
  topicVariables: undefined, // variables in JSON format from frames

  /**
  * intitial initialization of the application
  */
  intitialInit: function () {
    //this.currentTopic = applicationRendering.topics.forcesAdditionByAngleId;
    contextLayout.stretchCanvas(this.canvas, "divCanvas");

    dragRendering.canvas = forcesbyAngleDemo.canvas =
    archimedesPrincipleDemo.canvas = pendulumDemo.canvas = appliancesDemo.canvas = this.canvas;
       forcesbyAngleDemo.ctx = archimedesPrincipleDemo.ctx = pendulumDemo.ctx = appliancesDemo.ctx = this.context;
    //forcesbyAngleDemo.init();

    this.renderMenu();
  }, // intitialInit


  /**
* performs actions for selected topic
*/
  receiveData: function (data) {
    switch (applicationRendering.currentTopic) {
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
        alert("No data");
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

      if (div !== undefined) {
        let divElements = div.querySelectorAll("div");
        for (let elementDiv of divElements) {
          elementDiv.onclick = function () {
            let header = document.getElementById("ApplicationHeader");
            //applies title text
            header.innerText = elementDiv.innerText;
            //applies title color
            let css = "--" + leveleId + "-color";
            //gets color from CSS c=variables
            let titleColor = application.getRootVarCSS(css);
            header.style.color = titleColor;

            //sets current topic for topics enumeration
            applicationRendering.currentTopic = Number(
              elementDiv.dataset.topic
            );
            contextLayout.clearCanvas(applicationRendering.canvas);
            applicationRendering.clearTopics();
            pendulumDemo.stopTimer();
            
            //renders canvas depending on the current topic
            switch (applicationRendering.currentTopic) {
              case applicationRendering.topics.forcesAdditionByAngleId:
                forcesbyAngleDemo.init();
                break;
              case applicationRendering.topics.ArchimedesPrincipleId:
                archimedesPrincipleDemo.init();
                break;
                case applicationRendering.topics.pendulumDemoId:
                  pendulumDemo.init();
                  break;
                case applicationRendering.topics.AppliancesDemoId:
                  appliancesDemo.init();
                  break;
              default:
                alert("No values");
            } // switch
          } //elementDiv.onclick
        }
      }
    }

  }, // renderMenu

  // clears variables in all topics
  clearTopics: function () {
    dragRendering.dragElements = [];
    forcesbyAngleDemo.empty();
  }, // clearTopics

  /**
   * Passes message to the IFrame
   */
  sendFrameMessage: function (passData) {
    let frame = window.frames.BoardFrame;
    frame.postMessage(JSON.stringify(passData), "*");
  }, // clearTopics

}; // applicationRendering

applicationRendering.intitialInit();

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
