var model = require("./model");

SERVER_BASE_URI = "localhost:9090/core-main/api";

function generateUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0;
    var v = c == 'x' ? r : (r & 0x3 | 0x8);

    return v.toString(16);
  });
}

jLoopChat = function(spec, my) {
  my = my || {};
  my.customerId = spec.customerId;
  my.visitorId = generateUuid(); // TODO: Retrieve from cookie
  my.websocket = new WebSocket("ws://" + SERVER_BASE_URI + "/customer/" + my.customerId + "/socket/" + my.visitorId);

  var that = {};

  that.fetchAgents = function(fnSuccess, fnFailure) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "http://" + SERVER_BASE_URI + "/customer/" + my.customerId + "/agent", true);
    xhttp.onreadystatechange = function() {
      if (xhttp.readyState == 4) {
        if (xhttp.status == 200) {
          fnSuccess(JSON.parse(xhttp.responseText));
        }
        else {
          fnFailure(xhttp.status);
        }
      }
    };
    xhttp.send();
  };

  that.sendMessage = function(msg) {
    console.log("Sending...");
    console.log(msg);
    my.websocket.send(JSON.stringify(msg));
  };

  that.closeConnection = function() {
    var event = new model.VisitorStatusChange({
      visitorId: my.visitorId,
      status: "offline"
    });

    console.log("Sending..."); // TODO
    console.log(event);

    my.websocket.send(JSON.stringify(event));
  };

  return that;
};

module.exports = {
  jLoopChat: jLoopChat
};

