var React = require("react");
var ReactDOM = require("react-dom");

function availableAgents(agentList) {
  return agentList.filter(function(agent) {
    return agent.status.status == "online";
  });
}

function agentListToMap(agentList) {
  var m = {};

  for (var i = 0; i < agentList.length; ++i) {
    m[agentList[i].agentId] = agentList[i];
  }

  return m;
}

function handleError(e) {
  console.log(e); // TODO
}

var CCollapseBar = React.createClass({
  render: function() {
    return (
      <div className="jl-collapse-bar" onClick={this.props.onActivate} />
    );
  }
});

var CTranscriptBox = React.createClass({
  transcriptBox: null,

  scrollToEnd: function() {
    if (this.transcriptBox) {
      this.transcriptBox.scrollTop = this.transcriptBox.scrollHeight;
    }
  },

  // ---

  render: function() {
    var self = this;
    var transcriptElements = [];

    if (self.props.scrolledToEnd) {
      setTimeout(function() {
        self.scrollToEnd();
      }, 0);
    }

    if (self.props.transcript) {
      transcriptElements = self.props.transcript.getEvents().map(function(e) {
        var ts = new Date(e.timestamp);

        if (e.eventType == "VisitorMessage") {
          return (
            <span className="jl-transcript-element" key={ts.getTime()}>
              <span className="jl-timestamp">{ts.toTimeString().slice(0, 9)}</span>
              <span className="jl-visitor-name">{e.visitorName}</span><br/>
              <span className="jl-visitor-msg">{e.message}</span>
              <br/>
            </span>
          );
        }
        else if (e.eventType == "AgentMessage") {
          var agent = self.props.agents.filter(function(a) {
            return a.agentId == e.agentId;
          });

          var agentName = agent.length > 0 ? agent[0].displayName : "Agent";

          return (
            <span className="jl-transcript-element jl-agent" key={ts.getTime()}>
              <span className="jl-timestamp">{ts.toTimeString().slice(0, 9)}</span>
              <span className="jl-agent-name">{agentName}</span><br/>
              <span className="jl-agent-msg">{e.message}</span>
              <br/>
            </span>
          );
        }
        else if (e.eventType == "VisitorStatusChange") {
          return (
            <span className="jl-transcript-element" key={ts.getTime()}>
              <span className="jl-timestamp">{ts.toTimeString().slice(0, 9)}</span><br/>
              <span className="jl-visitor-status-change">
                {self.props.visitorName} has changed their status to {e.status}
              </span>
              <br/>
            </span>
          );
        }
        else if (e.eventType == "AgentStatusChange") {
          var agent = self.props.agents.filter(function(a) {
            return a.agentId == e.agentId;
          });

          var agentName = agent.length > 0 ? agent[0].displayName : "Agent";

          return (
            <span className="jl-transcript-element jl-agent" key={ts.getTime()}>
              <span className="jl-timestamp">{ts.toTimeString().slice(0, 9)}</span><br/>
              <span className="jl-agent-status-change">
                {agentName} has changed their status to {e.status}
              </span>
              <br/>
            </span>
          );
        }
      });
    }

    return (
      <div className={"jl-transcript-box-wrap" +
        (this.props.connected ? "" : " jl-disconnected")}>

        <div className="jl-transcript-box"
          onScroll={this.props.onTranscriptScroll}
          ref={function(c) { this.transcriptBox = c; }.bind(this)}>

          {transcriptElements}
        </div>
        <div className="jl-cover">
          <span>Chat disconnected. To resume, click connect or send a new message.</span>
        </div>
      </div>
    );
  }
});

var CMessageForm = React.createClass({
  ctrl: false,

  handleChange: function(e) {
    this.props.onMessageChange(e.target.value);
  },

  handleKeyDown: function(e) {
    switch (e.keyCode) {
      case 13:
        if (!this.ctrl) {
          this.props.onSubmit();

          e.target.value = "";
          this.handleChange(e);

          e.preventDefault();
        }

        e.target.value += "\n";

        break;
      case 17:
        this.ctrl = true;
        break;
    }
  },

  handleKeyUp: function(e) {
    switch (e.keyCode) {
      case 17:
        this.ctrl = false;
        break;
    }
  },

  // ---

  render: function() {
    return (
      <div className={"jl-message-form" + (this.props.connected ? "" : " jl-disconnected")}>
        <textarea
          value={this.props.message}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
          onKeyUp={this.handleKeyUp} /><br/>
      </div>
    );
  }
});

var CNameField = React.createClass({
  handleChange: function(e) {
    this.props.onVisitorNameChange(e.target.value);
  },

  // ---

  render: function() {
    return (
      <div className="jl-panel">
        <div className="jl-panel-item jl-shrink">
          <span className="jl-label">Name</span>
        </div>
        <div className="jl-panel-item">
          <input
            className="jl-txt-name"
            disabled={this.props.initiated}
            type="text"
            placeholder="Your name"
            value={this.props.visitorName}
            onChange={this.handleChange} />
        </div>
      </div>
    );
  }
});

var CConnectButton = React.createClass({
  render: function() {
    if (this.props.connected) {
      return (
        <div onClick={this.props.onDisconnect} className="jl-panel-item jl-icon-btn jl-btn-disconnect"></div>
      );
    }
    else {
      return (
        <div onClick={this.props.onConnect} className="jl-panel-item jl-icon-btn jl-btn-connect"></div>
      );
    }
  }
});

var CAgentSelector = React.createClass({
  handleChange: function(e) {
    this.props.onAgentChange(e.target.value);
  },

  // ---

  render: function() {
    var available = availableAgents(this.props.agents);

    var optionNodes = available.map(function(a) {
      return (
        <option key={a.agentId} value={a.agentId}>
          {a.displayName}
        </option>
      );
    });

    return (
      <div className="jl-agent-selector jl-panel-item">
        <div className="jl-panel">
          <div className="jl-panel-item jl-shrink"><span className="jl-label">Chat with</span></div>
          <div className="jl-panel-item">
            <select value={this.props.agentId} onChange={this.handleChange}>
              {optionNodes}
            </select>
          </div>
        </div>
      </div>
    );
  }
});

CPanel = React.createClass({
  render: function() {
    return (
      <div className="jl-panel">
        <CAgentSelector
          agents={this.props.agents}
          agentId={this.props.agentId}
          onAgentChange={this.props.onAgentChange} />
        <CConnectButton
          connected={this.props.connected}
          onConnect={this.props.onConnect}
          onDisconnect={this.props.onDisconnect} />
        <div className="jl-panel-item jl-icon-btn jl-btn-clear" onClick={this.props.onClearSession}></div>
      </div>
    );
  }
});

var CJLoopClassicExpanded = React.createClass({
  render: function() {
    return (
      <div className="jl-jloop-classic jl-widget-expanded">
        <CPanel
          agents={this.props.agents}
          agentId={this.props.agentId}
          onAgentChange={this.props.onAgentChange}
          connected={this.props.connected}
          onConnect={this.props.onConnect}
          onDisconnect={this.props.onDisconnect}
          onClearSession={this.props.onClearSession} />
        <CTranscriptBox
          connected={this.props.connected}
          agents={this.props.agents}
          visitorName={this.props.visitorName}
          transcript={this.props.transcript}
          onTranscriptScroll={this.props.onTranscriptScroll}
          scrolledToEnd={this.props.scrolledToEnd} />
        <CNameField
          initiated={this.props.initiated}
          visitorName={this.props.visitorName}
          onVisitorNameChange={this.props.onVisitorNameChange} />
        <CMessageForm message={this.props.message}
          connected={this.props.connected}
          onMessageChange={this.props.onMessageChange}
          onSubmit={this.props.onMessageSubmit} />
        <span className="jl-powered-by">
          Powered by <a href="http://recursiveloop.org/projects?scrollTo=jloop">JLoop</a>
        </span>
      </div>
    );
  }
});

var CJLoopClassicExpandedNoAgents = React.createClass({
  render: function() {
    return (
      <div className="jl-jloop-classic jl-widget-expanded">
        <div className="jl-no-agents">
          <span className="jl-no-agents-msg">
            Unfortunately, there is no one available to chat right now.
          </span>
          <span className="jl-powered-by">
            Powered by <a href="http://recursiveloop.org/projects?scrollTo=jloop">JLoop</a>
          </span>
        </div>
      </div>
    );
  }
});

var CJLoopClassicCollapsed = React.createClass({
  render: function() {
    return (
      <div
        className={"jl-jloop-classic jl-widget-collapsed" +
          (this.props.hasUnread ? " jl-alert" : "")}

        onClick={this.props.onExpand}>

        <span className="jl-logo"></span>
        <span className="jl-live-chat">Live Chat</span>
      </div>
    );
  }
});

var CJLoopClassic = React.createClass({
  doWelcomeMessage: function() {
    var self = this;

    self.state.transcript.clear();
    self.setState({
      scrolledToEnd: true
    });

    setTimeout(function() {
      if (self.state.connected &&
        self.state.transcript.isEmpty() &&
        self.state.agents.length > 0) {

        var agent = self.state.agents.filter(function(a) {
          return a.agentId == self.state.agentId;
        })[0];

        var msg = new jloop.model.AgentMessage({
          customerId: self.jlchat.customerId,
          agentId: self.state.agentId,
          visitorId: self.jlchat.session.getId(),
          visitorName: self.state.visitorName,
          message: agent.welcomeMessage
        });

        self.state.transcript.addEvent(msg);
        self.setState({
          scrolledToEnd: true
        });
      }
    }, 5000);
  },

  handleCollapse: function() {
    this.setState({ expanded: false });
  },

  handleExpand: function() {
    this.setState({ expanded: true });

    if (this.state.connected && this.state.transcript.isEmpty()) {
      this.doWelcomeMessage();
    }
  },

  handleVisitorNameChange: function(value) {
    this.setState({ visitorName: value });
    this.jlchat.session.put("visitorName", value);
  },

  handleAgentChange: function(value) {
    this.setState({ agentId: value });
  },

  handleMessageChange: function(value) {
    this.setState({ message: value });
  },

  handleMessageSubmit: function() {
    var msg = new jloop.model.VisitorMessage({
      customerId: this.jlchat.customerId,
      agentId: this.state.agentId,
      visitorId: this.jlchat.session.getId(),
      visitorName: this.state.visitorName,
      message: this.state.message,
      timestamp: (new Date()).getTime()
    });

    this.jlchat.sendMessage(msg);
    this.setState({
      connected: true,
      initiated: true,
      scrolledToEnd: true
    });

    this.jlchat.session.put("connected", true);
    this.jlchat.session.put("initiated", true);
  },

  handleAgentMessage: function(msg) {
    this.setState({
      hasUnread: !this.state.expanded,
      scrolledToEnd: true
    });
  },

  handleAgentStatusChange: function(e) {
    var agentId = this.state.agentId;
    var agentMap = agentListToMap(this.state.agents);
    var agent = agentMap[agentId];

    agentMap[e.agentId].status = new jloop.model.AgentStatus({
      agentId: e.agentId,
      status: e.status,
      timestamp: e.timestamp
    });

    var available = availableAgents(this.state.agents);

    if (available.length === 0) {
      agentId = null;
    }
    else {
      if (!agentMap.hasOwnProperty(agentId) || agentMap[agentId].status.status !== "online") {
        agentId = available[0].agentId;
      }
    }

    this.setState({
      scrolledToEnd: true,
      agentId: agentId,
      hasUnread: !this.state.expanded
    });
  },

  handleConnect: function() {
    var e = this.jlchat.openConnection(this.state.visitorName, this.state.agentId);

    this.setState({
      connected: true,
      scrolledToEnd: true
    });

    this.jlchat.session.put("connected", true);

    if (this.state.transcript.isEmpty()) {
      this.doWelcomeMessage();
    }
  },

  handleDisconnect: function() {
    this.jlchat.closeConnection(this.state.visitorName, this.state.agentId);

    this.setState({
      connected: false,
      scrolledToEnd: true
    });

    this.jlchat.session.put("connected", false);
  },

  handleClearSession: function() {
    this.jlchat.reset(this.state.visitorName, this.state.agentId);

    this.setState({
      connected: true,
      initiated: false,
      visitorName: "Anon",
      scrolledToEnd: true
    });

    this.doWelcomeMessage();
  },

  handleTranscriptScroll: function() {
    this.setState({
      scrolledToEnd: false
    });
  },

  // ---

  getInitialState: function() {
    var self = this;

    self.jlchat = jloop.jLoopChat({
      customerId: self.props.customerId
    });

    self.jlchat.initialise(function() {
      self.setState({
        scrolledToEnd: true
      });

      self.jlchat.setOnAgentMessage(self.handleAgentMessage);
      self.jlchat.setOnAgentStatusChange(self.handleAgentStatusChange);

      self.jlchat.fetchAgents(function(agentsObj) {
        var agents = agentsObj.agents;

        var available = availableAgents(agents);

        self.setState({
          agents: agents,
          agentId: available.length > 0 ? available[0].agentId : null
        });
      }, function(err) {
        handleError(new jloop.error.JLoopException("jlchat.fetchAgents returned code " + err));
      });
    }, function() {
      handleError(new jloop.error.JLoopException("jlchat failed to initialise"));
    });

    return {
      connected: self.jlchat.session.get("connected") !== false, // Treat null as true
      initiated: self.jlchat.session.get("initiated") === true,
      expanded: false,
      visitorName: self.jlchat.session.get("visitorName") || "Anon",
      agents: [],
      agentId: null,
      transcript: self.jlchat.transcript,
      scrolledToEnd: true
    };
  },

  render: function() {
    var available = availableAgents(this.state.agents);

    if (this.state.expanded && available.length > 0) {
      this.state.hasUnread = false;

      return (
        <div className="jl-widget-wrap jl-expanded">
          <CCollapseBar
            onActivate={this.handleCollapse} />
          <CJLoopClassicExpanded
            connected={this.state.connected}
            initiated={this.state.initiated}
            visitorName={this.state.visitorName}
            onVisitorNameChange={this.handleVisitorNameChange}
            agents={this.state.agents}
            agentId={this.state.agentId}
            onAgentChange={this.handleAgentChange}
            transcript={this.state.transcript}
            message={this.state.message}
            onMessageChange={this.handleMessageChange}
            onMessageSubmit={this.handleMessageSubmit}
            onConnect={this.handleConnect}
            onDisconnect={this.handleDisconnect}
            onClearSession={this.handleClearSession}
            onTranscriptScroll={this.handleTranscriptScroll}
            scrolledToEnd={this.state.scrolledToEnd} />
        </div>
      );
    }
    else if (this.state.expanded && available.length === 0) {
      return (
        <div className="jl-widget-wrap jl-expanded">
          <CCollapseBar
            onActivate={this.handleCollapse} />
          <CJLoopClassicExpandedNoAgents />
        </div>
      );
    }
    else {
      return (
        <div className="jl-widget-wrap jl-collapsed">
          <CJLoopClassicCollapsed
            onExpand={this.handleExpand}
            hasUnread={this.state.hasUnread} />
        </div>
      );
    }
  }
});

exports.init = function(elementId, customerId) {
  ReactDOM.render(
    <CJLoopClassic customerId={customerId} />,
    document.getElementById(elementId)
  );
};

