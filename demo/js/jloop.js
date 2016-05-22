var model = require("./model");
var session = require("./session");
var utils = require("./utils");

function JLoopException(msg) {
  this.message = msg;
}

function ServerException(msg, status) {
  JLoopException.call(this, msg);
  this.status = status;
}

utils.inherits(ServerException, JLoopException);

var SERVER_LOOKUP_BASE_URI ="localhost:9090/core-lookup/api";

var jLoopChat = function(spec, my) {
  // Private
  //
  var _fnOnAgentMessage = null;
  var _fnOnAgentStatusChange = null;

  function _checkInitialised() {
    if (my.initialised === false) {
      throw new JLoopException("jLoopChat not initialised");
    }
  }

  function _onAgentMessage(e) {
    if (_fnOnAgentMessage) {
      _fnOnAgentMessage(e);
    }
  }

  function _onAgentStatusChange(e) {
    if (_fnOnAgentStatusChange) {
      _fnOnAgentStatusChange(e);
    }
  }

  function _onMessage(m) {
    var e = JSON.parse(m.data);
    console.log(e);

    var sess = session.getSession();
    sess.transcript.addEvent(e);
    session.setSession(sess);

    if (e.eventType == "AgentMessage") {
      _onAgentMessage(e);
    }
    else if (e.eventType == "AgentStatusChange") {
      _onAgentStatusChange(e);
    }
    else {
      throw new JLoopException("Unknown event type '" + eventType + "'");
    }
  }

  // Protected
  //
  my = my || {};
  my.initialised = false;
  my.websocket = null;
  my.endpoint = null;

  // Public
  //
  var that = {};
  that.customerId = spec.customerId;
  that.visitorId = null;

  that.setOnAgentMessage = function(fn) {
    _fnOnAgentMessage = fn;
  };

  that.setOnAgentStatusChange = function(fn) {
    _fnOnAgentStatusChange = fn;
  };

  /**
  * @method initialise
  * @param {Function} fnSuccess A no-argument function
  * @param {Function} fnFailure (Optional) A no argument function
  */
  that.initialise = function(fnSuccess, fnFailure) {
    var sess = session.getSession();
    that.visitorId = sess.visitorId;

    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "http://" + SERVER_LOOKUP_BASE_URI + "/endpoint?cid=" + that.customerId, true);
    xhttp.onreadystatechange = function() {
      if (xhttp.readyState == 4) {
        if (xhttp.status == 200) {
          my.endpoint = new model.ServerEndpoint(JSON.parse(xhttp.responseText));
          var baseUrl = my.endpoint.url.replace(/^.*?:\/\//g, "");

          my.websocket = new WebSocket("ws://" + baseUrl + "/api/customer/" + that.customerId + "/socket/" + that.visitorId);
          my.websocket.onmessage = _onMessage;
          my.initialised = true;

          fnSuccess();
        }
        else {
          if (fnFailure) {
            fnFailure();
          }
        }
      }
    };
    xhttp.send();
  };

  /**
  * @method fetchAgents
  * @param {Function} fnSuccess A function that accepts an AgentList
  * @param {Function} fnFailure A function that accepts a numeric status code
  */
  that.fetchAgents = function(fnSuccess, fnFailure) {
    _checkInitialised();

    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", my.endpoint.url + "/api/customer/" + that.customerId + "/agent", true);
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
    _checkInitialised();

    console.log("Sending...");
    console.log(msg);
    my.websocket.send(JSON.stringify(msg));
  };

  that.closeConnection = function(agentId) {
    _checkInitialised();

    var event = new model.VisitorStatusChange({
      visitorId: that.visitorId,
      customerId: that.customerId,
      agentId: agentId,
      status: "offline"
    });

    console.log("Sending..."); // TODO
    console.log(event);

    my.websocket.send(JSON.stringify(event));
  };

  return that;
};

module.exports = {
  jLoopChat: jLoopChat,
  JLoopException: JLoopException,
  ServerException: ServerException
};

