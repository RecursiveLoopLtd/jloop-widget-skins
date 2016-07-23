var React = require("react");
var ReactDOM = require("react-dom");

var CCollapseBar = React.createClass({
  render: function() {
    return (
      <div className="collapse-bar" onClick={this.props.onActivate} />
    );
  }
});

var CAgentSelector = React.createClass({
  handleChange: function(e) {
    this.props.onAgentChange(e.target.value);
  },

  // ---

  render: function() {
    available = this.props.agents.filter(function(a) {
      return a.status.status == "online";
    });

    var optionNodes = available.map(function(a) {
      return (
        <option key={a.agentId} value={a.agentId}>
          {a.displayName}
        </option>
      );
    });

    return (
      <div className="agent-selector">
        <span className="label">Chat with</span>
        <select value={this.props.agentId} onChange={this.handleChange}>
          {optionNodes}
        </select>
      </div>
    );
  }
});

var CTranscriptBox = React.createClass({
  transcriptBox: null,

  // ---

  componentDidMount: function() {
    this.transcriptBox.scrollTop = this.transcriptBox.scrollHeight;
  },

  render: function() {
    var self = this;
    var transcriptElements = [];

    if (self.props.transcript) {
      transcriptElements = self.props.transcript.events.map(function(e) {
        var ts = new Date(e.timestamp);

        if (e.eventType == "VisitorMessage") {
          return (
            <span className="transcript-element" key={ts.getTime()}>
              <span className="timestamp">{ts.toTimeString().slice(0, 9)}</span>
              <span className="visitor-name">{e.visitorName}</span><br/>
              <span className="visitor-msg">{e.message}</span>
              <br/>
            </span>
          );
        }
        else if (e.eventType == "AgentMessage") {
          var agentName = self.props.agents.filter(function(a) {
            return a.agentId == e.agentId;
          })[0].displayName;

          return (
            <span className="transcript-element agent" key={ts.getTime()}>
              <span className="timestamp">{ts.toTimeString().slice(0, 9)}</span>
              <span className="agent-name">{agentName}</span><br/>
              <span className="agent-msg">{e.message}</span>
              <br/>
            </span>
          );
        }
        else if (e.eventType == "VisitorStatusChange") {
          return (
            <span className="transcript-element" key={ts.getTime()}>
              <span className="timestamp">{ts.toTimeString().slice(0, 9)}</span><br/>
              <span className="visitor-status-change">
                {self.props.visitorName} has changed their status to {e.status}
              </span>
              <br/>
            </span>
          );
        }
        else if (e.eventType == "AgentStatusChange") {
          var agentName = self.props.agents.filter(function(a) {
            return a.agentId == e.agentId;
          })[0].displayName;

          return (
            <span className="transcript-element agent" key={ts.getTime()}>
              <span className="timestamp">{ts.toTimeString().slice(0, 9)}</span><br/>
              <span className="agent-status-change">
                {agentName} has changed their status to {e.status}
              </span>
              <br/>
            </span>
          );
        }
      });
    }

    return (
      <div className={"transcript-box-wrap" + (this.props.connected ? "" : " disconnected")}>
        <div className="transcript-box" ref={function(c) { this.transcriptBox = c; }.bind(this)}>
          {transcriptElements}
        </div>
        <div className="cover">
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
      <div className={"message-form" + (this.props.connected ? "" : " disconnected")}>
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
      <div className="name-field">
        <span className="label">Name</span>
        <div className="input-wrap">
          <input
            className="txt-name"
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
  handleDisconnect: function(e) {
    this.props.onDisconnect();
  },

  handleConnect: function(e) {
    this.props.onConnect();
  },

  // ---

  render: function() {
    if (this.props.connected) {
      return (
        <button onClick={this.handleDisconnect}>Disconnect</button>
      );
    }
    else {
      return (
        <button onClick={this.handleConnect}>Connect</button>
      );
    }
  }
});

var CJLoopClassicExpanded = React.createClass({
  handleVisitorNameChange: function(value) {
    this.props.onVisitorNameChange(value);
  },

  handleAgentChange: function(value) {
    this.props.onAgentChange(value);
  },

  handleMessageChange: function(value) {
    this.props.onMessageChange(value);
  },

  handleMessageSubmit: function() {
    this.props.onMessageSubmit();
  },

  handleConnect: function() {
    this.props.onConnect();
  },

  handleDisconnect: function() {
    this.props.onDisconnect();
  },

  handleClearSession: function() {
    this.props.onClearSession();
  },

  // ---

  render: function() {
    return (
      <div className="jloop-classic expanded">
        <CAgentSelector
          agents={this.props.agents}
          agentId={this.props.agentId}
          onAgentChange={this.handleAgentChange} />
        <CTranscriptBox
          connected={this.props.connected}
          agents={this.props.agents}
          visitorName={this.props.visitorName}
          transcript={this.props.transcript} />
        <CNameField
          initiated={this.props.initiated}
          visitorName={this.props.visitorName}
          onVisitorNameChange={this.handleVisitorNameChange} />
        <CMessageForm message={this.props.message}
          connected={this.props.connected}
          onMessageChange={this.handleMessageChange}
          onSubmit={this.handleMessageSubmit} />
        <CConnectButton
          connected={this.props.connected}
          onConnect={this.handleConnect}
          onDisconnect={this.handleDisconnect} />
        <button onClick={this.handleClearSession}>Clear session</button>
      </div>
    );
  }
});

var CJLoopClassicExpandedNoAgents = React.createClass({
  render: function() {
    return (
      <div className="jloop-classic expanded">
        <div className="no-agents">
          <span>Unfortunately, there is no one available to chat right now.</span>
        </div>
      </div>
    );
  }
});

var CJLoopClassicCollapsed = React.createClass({
  render: function() {
    return (
      <div
        className={"jloop-classic collapsed" + (this.props.hasUnread ? " alert" : "")}
        onClick={this.props.onExpand}>
      </div>
    );
  }
});

var CJLoopClassic = React.createClass({
  doWelcomeMessage: function() {
    var self = this;
    var transcript = self.jlchat.getTranscript();

    transcript.clear();
    self.setState({ transcript: self.jlchat.getTranscript() });

    setTimeout(function() {
      if (self.state.connected && !self.state.initiated) {
        var agent = self.state.agents.filter(function(a) {
          return a.agentId == self.state.agentId;
        })[0];

        var msg = new jloop.model.AgentMessage({
          customerId: self.jlchat.customerId,
          agentId: self.state.agentId,
          visitorId: self.jlchat.visitorId,
          visitorName: self.state.visitorName,
          message: agent.welcomeMessage
        });

        transcript.addEvent(msg);
        self.setState({ transcript: self.jlchat.getTranscript() });
      }
    }, 5000);
  },

  handleCollapse: function() {
    this.setState({ expanded: false });
  },

  handleExpand: function() {
    this.setState({ expanded: true });

    if (this.state.connected && !this.state.initiated) {
      this.doWelcomeMessage();
    }
  },

  handleVisitorNameChange: function(value) {
    this.setState({ visitorName: value });
    jloop.session.put("visitorName", value);
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
      visitorId: this.jlchat.visitorId,
      visitorName: this.state.visitorName,
      message: this.state.message,
      timestamp: (new Date()).getTime()
    });

    this.jlchat.sendMessage(msg);
    this.setState({
      connected: true,
      initiated: true,
      transcript: this.jlchat.getTranscript()
    });

    jloop.session.put("connected", true);
    jloop.session.put("initiated", true);
  },

  handleAgentMessage: function(msg) {
    this.setState({
      transcript: this.jlchat.getTranscript(),
      hasUnread: !this.state.expanded
    });
  },

  handleAgentStatusChange: function(e) {
    var agents = this.state.agents;
    agents.forEach(function(a) {
      if (a.agentId == e.agentId) {
        a.status = new jloop.model.AgentStatus({
          agentId: e.agentId,
          status: e.status,
          timestamp: e.timestamp
        });
      }
    });

    this.setState({
      transcript: this.jlchat.getTranscript(),
      agents: agents,
      hasUnread: !this.state.expanded
    });
  },

  handleConnect: function() {
    this.jlchat.openConnection(this.state.visitorName, this.state.agentId);

    var e = new jloop.model.VisitorStatusChange({
      visitorId: this.jlchat.visitorId,
      customerId: this.jlchat.customerId,
      agentId: this.state.agentId,
      status: "online"
    });

    this.setState({
      connected: true,
      transcript: this.jlchat.getTranscript()
    });

    jloop.session.put("connected", true);

    if (!this.state.initiated) {
      this.doWelcomeMessage();
    }
  },

  handleDisconnect: function() {
    this.jlchat.closeConnection(this.state.agentId);

    var e = new jloop.model.VisitorStatusChange({
      visitorId: this.jlchat.visitorId,
      customerId: this.jlchat.customerId,
      agentId: this.state.agentId,
      status: "offline"
    });

    this.setState({
      connected: false,
      transcript: this.jlchat.getTranscript()
    });

    jloop.session.put("connected", false);
  },

  handleClearSession: function() {
    jloop.session.clear();
    this.setState({
      connected: true,
      initiated: false,
      visitorName: "Anon",
      transcript: null
    });

    this.doWelcomeMessage();
  },

  // ---

  getInitialState: function() {
    var self = this;

    self.jlchat = jloop.jLoopChat({
      customerId: self.props.customerId
    });

    self.jlchat.initialise(function() {
      self.setState({ transcript: self.jlchat.getTranscript() });

      self.jlchat.setOnAgentMessage(self.handleAgentMessage);
      self.jlchat.setOnAgentStatusChange(self.handleAgentStatusChange);

      self.jlchat.fetchAgents(function(agents) {
        self.setState({
          agents: agents.agents,
          agentId: agents.agents.length > 0 ? agents.agents[0].agentId : null
        });
      }, function(err) {
        throw new JLoopException("jlchat.fetchAgents returned code " + err);
      });
    }, function() {
      throw new JLoopException("jlchat failed to initialise");
    });

    return {
      connected: jloop.session.get("connected") !== false, // Treat null as true
      initiated: jloop.session.get("initiated") === true,
      expanded: false,
      visitorName: jloop.session.get("visitorName") || "Anon",
      agents: [],
      agentId: null,
      transcript: null
    };
  },

  render: function() {
    var available = this.state.agents.filter(function(a) {
      return a.status.status == "online";
    });

    if (this.state.expanded && available.length > 0) {
      this.state.hasUnread = false;

      return (
        <div className="widget-wrap">
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
            onClearSession={this.handleClearSession} />
        </div>
      );
    }
    else if (this.state.expanded && available.length === 0) {
      return (
        <div className="widget-wrap">
          <CCollapseBar
            onActivate={this.handleCollapse} />
          <CJLoopClassicExpandedNoAgents />
        </div>
      );
    }
    else {
      return (
        <div className="widget-wrap">
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

