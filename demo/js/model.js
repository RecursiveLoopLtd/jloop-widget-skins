var utils = require("./utils");

Event = function(eventType) {
  this.eventType = eventType;
};

VisitorMessage = function(spec) {
  Event.call(this, "VisitorMessage");
  this.customerId = spec.customerId;
  this.agentId = spec.agentId;
  this.visitorId = spec.visitorId;
  this.visitorName = spec.visitorName;
  this.message = spec.message;
  this.timestamp = spec.timestamp || new Date().getTime();
};

utils.inherits(VisitorMessage, Event);

AgentMessage = function(spec) {
  Event.call(this, "AgentMessage");
  this.customerId = spec.customerId;
  this.agentId = spec.agentId;
  this.visitorId = spec.visitorId;
  this.visitorName = spec.visitorName;
  this.message = spec.message;
  this.timestamp = spec.timestamp || new Date().getTime();
};

utils.inherits(AgentMessage, Event);

VisitorStatusChange = function(spec) {
  Event.call(this, "VisitorStatusChange");
  this.visitorId = spec.visitorId;
  this.status = spec.status;
  this.timestamp = spec.timestamp || new Date().getTime();
};

utils.inherits(VisitorStatusChange, Event);

AgentStatusChange = function() {
  Event.call(this, "AgentStatusChange");
  this.agentId = spec.agentId;
  this.status = spec.status;
  this.timestamp = spec.timestamp || new Date().getTime();
};

utils.inherits(AgentStatusChange, Event);

AgentList = function() {

};

module.exports = {
  Event: Event,
  VisitorMessage: VisitorMessage,
  AgentMessage: AgentMessage,
  VisitorStatusChange: VisitorStatusChange,
  AgentStatusChange: AgentStatusChange,
  AgentList: AgentList
};

