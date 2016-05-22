//var $ = require("../../vendor/jquery/dist/jquery");
var jloop = require("./jloop");
var model = require("./model");
var session = require("./session");
var utils = require("./utils");

function widgetClosed(jl, root) {
  var _jl = jl;
  var _eRoot = root;
  var _eOuter = null;
  var _fnOnClick = null;

  function _onClick() {
    if (_fnOnClick) {
      _fnOnClick();
    }
    return false;
  }

  var that = that || {};

  that.html = 
    "<div class='jloop jl-closed'>" +
    "  <div class='jl-tab jl-minimised'></div>" +
    "</div>";

  that.activate = function() {
    _eTab = _eRoot.getElementsByClassName("jl-tab")[0];
    _eTab.onclick = _onClick;
  };

  that.setOnClick = function(fn) {
    _fnOnClick = fn;
  };

  that.deactivate = function() {};

  return that;
};

function widgetOpen(jl, root) {
  var _jl = jl;
  var _eRoot = root;
  var _eFrmMain = null;
  var _eTxtName = null;
  var _eSctAgents = null;
  var _eTranscript = null;
  var _eTxtMessage = null;
  var _eBtnClose = null;
  var _eBtnClearSession = null; // TODO

  var _fnOnClick = null;

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
      customerId: _jl.customerId,
      agentId: _eSctAgents.value,
      visitorId: _jl.visitorId,
      visitorName: _eTxtName.value,
      message: _eTxtMessage.value,
      timestamp: new Date().getTime()
    });

    var sess = session.getSession();
    sess.visitorName = _eTxtName.value;
    sess.transcript.addEvent(msg);
    session.setSession(sess);

    _jl.sendMessage(msg);
    _eTxtMessage.value = "";
    _appendToTranscript(msg);

    return false;
  }

  function _onClose() {
    var agentId = _eSctAgents.value;
    _jl.closeConnection(agentId);

    // TODO: Append to transcript
  }

  function _onAgentStatusChange(e) {
    _appendToTranscript(e);

    // TODO
  }

  function _onAgentMessage(e) {
    _appendToTranscript(e);
  }

  function _loadName() {
    var sess = session.getSession();
    _eTxtName.value = sess.visitorName;
  }

  function _loadAgents() {
    var result = new utils.Future();

    _jl.fetchAgents(function(data) {
      data.agents.forEach(function(agent) {
        _agents[agent.agentId] = agent;

        var opt = document.createElement("option");
        opt.text = agent.displayName;
        opt.value = agent.agentId;
        _eSctAgents.add(opt);
      });

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

  function _onClick() {
    if (_fnOnClick) {
      _fnOnClick();
    }
  };

  var that = that || {};

  that.html = 
    "<div class='jloop jl-open'>" +
    "  <div class='jl-tab'></div>" +
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

  that.activate = function() {
    _eFrmMain = _eRoot.getElementsByClassName("jl-frm-main")[0];
    _eTxtName = _eRoot.getElementsByClassName("jl-txt-name")[0];
    _eSctAgents = _eRoot.getElementsByClassName("jl-sct-agents")[0];
    _eTranscript = _eRoot.getElementsByClassName("jl-transcript")[0];
    _eTxtMessage = _eRoot.getElementsByClassName("jl-txt-message")[0];
    _eBtnClose = _eRoot.getElementsByClassName("jl-btn-close")[0];
    _eTab = _eRoot.getElementsByClassName("jl-tab")[0];

    _eBtnClearSession = _eRoot.getElementsByClassName("jl-btn-clear-session")[0]; // TODO
    _eBtnClearSession.onclick = function() {
      session.setSession(new session.Session());
      return false;
    };

    _jl.initialise(function() {
      _loadName();
      _loadAgents().then(function() {
        _loadTranscript();

        _jl.setOnAgentMessage(_onAgentMessage);
        _jl.setOnAgentStatusChange(_onAgentStatusChange);
      });
    },
    function() {
      console.log("Error initialising jloopChat");
    });

    _eFrmMain.onsubmit = _onSend;
    _eBtnClose.onclick = _onClose;
    _eTab.onclick = _onClick;
  };

  that.deactivate = function() {};

  that.setOnClick = function(fn) {
    _fnOnClick = fn;
  };

  return that;
};

function jLoopClassic(spec, my) {
  // Protected
  //
  my = my || {};
  my.jloop = jloop.jLoopChat(spec);

  // Private
  //
  var _eRoot = document.getElementById(spec.parentElementId);

  var _states = [
    widgetClosed(my.jloop, _eRoot),
    widgetOpen(my.jloop, _eRoot)
  ];
  var _ST_CLOSED = 0;
  var _ST_OPEN = 1;
  var _currentState = null;

  _states[_ST_CLOSED].setOnClick(function() {
    _applyState(_ST_OPEN);
  });

  _states[_ST_OPEN].setOnClick(function() {
    _applyState(_ST_CLOSED);
  });

  function _applyState(idx) {
    if (_currentState) {
      _currentState.deactivate();
    }
    _currentState = _states[idx];
    _eRoot.innerHTML = _currentState.html;
    _currentState.activate();
  }

  _applyState(_ST_CLOSED);

  // Public
  //
  var that = {};

  return that;
}

module.exports = {
  jLoopClassic: jLoopClassic
};

