/**
* Methods and properties of the main page
*/
const applicationRendering = {
  topics: {  forcesAdditionByAngleId: 2, ArchimedesPrincipleId: 3 }, // all data-topic attributes from the HTML menu
  currentTopic: undefined, // to set current selected topic in the menu
  canvas: appElements.canvas, // main canvas in the application
  context: appElements.context, // main canvas' context in the application
  topicVariables: undefined, // variables in JSON format from frames

  /**
  * intitial initialization of the application
  */
  intitialInit: function () {
    this.currentTopic = applicationRendering.topics.ArchimedesPrincipleId;
    contextLayout.stretchCanvas(this.canvas, "divCanvas");

    dragRendering.canvas = forcesbyAngle.canvas =
       archimedesPrinciple.canvas = this.canvas;
    forcesbyAngle.ctx = archimedesPrinciple.ctx = this.context;

    //forcesAddition.init();

    //archimedesPrinciple.init();
    this.renderMenu();
  }, // intitialInit

  /**
  * performs actions for selected topic
  */
  runExperiment: function () {
    
    switch (applicationRendering.currentTopic) {
      case this.topics.forcesAdditionByAngleId:
        // forcesbyAngle.dynamometers.dynamLeft.setValue(
        //   this.topicVariables.xWeight
        // );
        break;
      case this.topics.ArchimedesPrincipleId:
        //forcesbyAngle.dynamometers.dynamLeft.setValue(
        //  this.topicVariables.xWeight
        // );
        break;
      default:
        alert("No values");
    }
  }, // runExperiment

  /**
* performs actions for selected topic
*/
  receiveData: function (data) {
    switch (applicationRendering.currentTopic) {
      case this.topics.forcesAdditionByAngleId:
        forcesbyAngle.receivedMessage();
        break;
      case this.topics.ArchimedesPrincipleId:
        archimedesPrinciple.receivedMessage();
        break;
      default:
        alert("No values");
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

            //renders canvas depending on the current topic
            switch (applicationRendering.currentTopic) {
              case applicationRendering.topics.forcesAdditionByAngleId:
                forcesbyAngle.init();
                break;
              case applicationRendering.topics.ArchimedesPrincipleId:
                archimedesPrinciple.init();
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
    forcesbyAngle.empty();
  } // clearTopics
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

appElements.canvas.onmousedown = function (e) {
  dragRendering.canvasMouseDown(e);
};
appElements.canvas.onmouseup = function (e) {
  dragRendering.canvasMouseUp(e);
};
appElements.canvas.onmousemove = function (e) {
  dragRendering.canvasMouseMove(e);
};

// document.getElementById("clickIt").onclick = function () {
//   applicationRendering.runExperiment();
// };
