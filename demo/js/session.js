var model = require("./model");

function generateUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0;
    var v = c == 'x' ? r : (r & 0x3 | 0x8);

    return v.toString(16);
  });
}

function Transcript(spec) {
  spec = spec || {};

  // List of model.Event objects
  this.events = spec.events || [];
};

Transcript.prototype.addEvent = function(event) {
  this.events.push(event);
};

function Session(spec) {
  spec = spec || {};

  var _d = new Date();
  _d.setTime(_d.getTime() + 24 * 60 * 60 * 1000);
  var _defaultExpiration = _d;

  this.visitorId = spec.visitorId || generateUuid();
  this.visitorName = spec.visitorName || "";
  this.transcript = spec.transcript ? new Transcript(spec.transcript) : new Transcript();
  this.expirationDate = spec.expirationDate ? new Date(spec.expirationDate) : _defaultExpiration;
};

function getSession() {
  var all = document.cookie.split(";");
  for (var i = 0; i < all.length; ++i) {
    var cookie = all[i];
    if (cookie.indexOf("jloop=") === 0) {
      var val = cookie.substring("jloop=".length);
      console.log("Parsing cookie: " + val);
      return new Session(JSON.parse(val));
    }
  }

  setSession(new Session());
  return getSession();
}

function setSession(session) {
  var cookie = "jloop=" + JSON.stringify(session) + "; expires=" + session.expirationDate.toUTCString();
  console.log("Writing cookie: " + cookie);
  document.cookie = cookie;
}

module.exports = {
  Transcript: Transcript,
  Session: Session,
  getSession: getSession,
  setSession: setSession
};

