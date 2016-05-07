var jloop = require("./jloop");
var model = require("./model");

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

  "  </form>" +
  "</div>";

function jLoopClassic(spec, my) {
  my = my || {};

  var that = jLoopChat(spec, my);

  var _eRoot = document.getElementById(spec.parentElementId);
  _eRoot.innerHTML = WIDGET_HTML;
  var _eFrmMain = _eRoot.getElementsByClassName("jl-frm-main")[0];
  var _eTxtName = _eRoot.getElementsByClassName("jl-txt-name")[0];
  var _eSctAgents = _eRoot.getElementsByClassName("jl-sct-agents")[0];
  var _eTranscript = _eRoot.getElementsByClassName("jl-transcript")[0];
  var _eTxtMessage = _eRoot.getElementsByClassName("jl-txt-message")[0];
  var _eBtnClose = _eRoot.getElementsByClassName("jl-btn-close")[0];

  // Maps agent IDs to agents
  var _agents = {};

  that.fetchAgents(function(data) {
    data.agents.forEach(function(agent) {
      _agents[agent.agentId] = agent;

      var opt = document.createElement("option");
      opt.text = agent.displayName;
      opt.value = agent.agentId;
      _eSctAgents.add(opt);
    });
  },
  function(status) {
    console.log("Error retrieving agents list");
  });

  function _appendVisitorMsg(msg) {
    _eTranscript.innerHTML +=
      "<span class='jl-timestamp'>" + new Date(msg.timestamp).toTimeString().slice(0, 9) + "</span> " +
      "<span class='jl-visitor-name'>" + msg.visitorName + "</span> " +
      "<span class='jl-visitor-msg'>" + msg.message + "</span><br>";
  }

  function _appendAgentMsg(agentName, msg) {
    _eTranscript.innerHTML +=
      "<span class='jl-timestamp'>" + new Date(msg.timestamp).toTimeString().slice(0, 9) + "</span> " +
      "<span class='jl-agent-name'>" + agentName + "</span> " +
      "<span class='jl-agent-msg'>" + msg.message + "</span><br>";
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

    that.sendMessage(msg);
    _eTxtMessage.value = "";
    _appendVisitorMsg(msg);

    return false;
  }

  function _onClose() {
    that.closeConnection();
  }

  function _onAgentStatusChange(e) {
    
  }

  function _onAgentMessage(e) {
    var agentName = _agents[e.agentId].displayName;
    _appendAgentMsg(agentName, e);
  }

  my.websocket.onmessage = function(m) {
    var e = JSON.parse(m.data);
    console.log(e);

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

  _eFrmMain.onsubmit = _onSend;
  _eBtnClose.onclick = _onClose;

  return that;
}

module.exports = {
  jLoopClassic: jLoopClassic
};

