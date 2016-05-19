var jloop = require("./jloop");
var model = require("./model");
var session = require("./session");
var utils = require("./utils");

var WIDGET_HTML =
  "<div class='jloop'>" +
  "  <form class='jl-frm-main'>" +

  "    <strong>Name</strong>" +
  "    <input class='jl-txt-name' type='text'></input><br>" +

  "    <strong>Agent</strong>" +
  "    <select class='jl-sct-agents'></select><br>" +

  "    <div class='jl-transcript'></div><br>" +

  "    <textarea class='jl-txt-message'></textarea><br>" +

  "    <input type='submit' value='Send'>" +
  "    <button type='button' class='jl-btn-close'>Close Connection</button>" +
  "    <button type='button' class='jl-btn-clear-session'>Clear session</button>" +

  "  </form>" +
  "</div>";

function jLoopClassic(spec, my) {
  my = my || {};

  var that = jloop.jLoopChat(spec, my);

  var _eRoot = document.getElementById(spec.parentElementId);
  _eRoot.innerHTML = WIDGET_HTML;
  var _eFrmMain = _eRoot.getElementsByClassName("jl-frm-main")[0];
  var _eTxtName = _eRoot.getElementsByClassName("jl-txt-name")[0];
  var _eSctAgents = _eRoot.getElementsByClassName("jl-sct-agents")[0];
  var _eTranscript = _eRoot.getElementsByClassName("jl-transcript")[0];
  var _eTxtMessage = _eRoot.getElementsByClassName("jl-txt-message")[0];
  var _eBtnClose = _eRoot.getElementsByClassName("jl-btn-close")[0];

  var _eBtnClearSession = _eRoot.getElementsByClassName("jl-btn-clear-session")[0]; // TODO
  _eBtnClearSession.onclick = function() {
    session.setSession(new session.Session());
    return false;
  };

  // Maps agent IDs to agents
  var _agents = {};

  function _appendToTranscript(event) {
    if (event.eventType == "VisitorMessage" || event.eventType == "AgentMessage") {
      _eTranscript.innerHTML +=
        "<span class='jl-timestamp'>" + new Date(event.timestamp).toTimeString().slice(0, 9) + "</span>";

      if (event.eventType == "VisitorMessage") {
        _eTranscript.innerHTML +=
          "<span class='jl-visitor-name'>" + event.visitorName + "</span> ";
      }
      else if (event.eventType == "AgentMessage") {
        var agentName = _agents[event.agentId].displayName;

        _eTranscript.innerHTML +=
          "<span class='jl-agent-name'>" + agentName + "</span> ";
      }

      _eTranscript.innerHTML +=
        "<span class='jl-agent-msg'>" + event.message + "</span><br>";
    }
  }

  function _onSend() {
    var msg = new model.VisitorMessage({
      customerId: my.customerId,
      agentId: _eSctAgents.value,
      visitorId: my.visitorId,
      visitorName: _eTxtName.value,
      message: _eTxtMessage.value,
      timestamp: new Date().getTime()
    });

    var sess = session.getSession();
    sess.visitorName = _eTxtName.value;
    sess.transcript.addEvent(msg);
    session.setSession(sess);

    that.sendMessage(msg);
    _eTxtMessage.value = "";
    _appendToTranscript(msg);

    return false;
  }

  function _onClose() {
    var agentId = _eSctAgents.value;
    that.closeConnection(agentId);

    // TODO: Append to transcript
  }

  function _onAgentStatusChange(e) {
    _appendToTranscript(e);

    // TODO
  }

  function _onAgentMessage(e) {
    _appendToTranscript(e);
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
      console.log("Unknown event type '" + e.eventType + "'"); // TODO
    }
  };

  function _loadName() {
    var sess = session.getSession();
    _eTxtName.value = sess.visitorName;
  }

  function _loadAgents() {
    var result = new utils.Future();

    that.fetchAgents(function(data) {
      data.agents.forEach(function(agent) {
        _agents[agent.agentId] = agent;

        var opt = document.createElement("option");
        opt.text = agent.displayName;
        opt.value = agent.agentId;
        _eSctAgents.add(opt);
      });

      my.websocket.onmessage = _onMessage;
      result.ready();
    },
    function(status) {
      console.log("Error retrieving agents list. Server returned code " + status);
      result.ready();
    });

    return result;
  }

  function _loadTranscript() {
    var sess = session.getSession();

    _eTranscript.innerHTML = "";
    for (var i = 0; i < sess.transcript.events.length; ++i) {
      var event = sess.transcript.events[i];
      _appendToTranscript(event);
    }
  }

  that.initialise(function() {
    _loadName();
    _loadAgents().then(function() {
      _loadTranscript();
    });
  },
  function() {
    console.log("Error initialising jloopChat");
  });

  _eFrmMain.onsubmit = _onSend;
  _eBtnClose.onclick = _onClose;

  return that;
}

module.exports = {
  jLoopClassic: jLoopClassic
};

