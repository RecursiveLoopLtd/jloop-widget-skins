function inherits(ctor, superCtor) {
  ctor.prototype = Object.create(superCtor.prototype);
  ctor.prototype.constructor = ctor;
}

function bind(context, fn) {
  var args = Array.prototype.slice.call(arguments);

  return function() {
    return fn.apply(context, args.concat(Array.prototype.slice.call(arguments)));
  };
}

function Future() {
  var _fn = null;

  this.then = function(fn) {
    _fn = fn;
  }

  this.ready = function() {
    return _fn.apply(null, arguments);
  };
}

module.exports = {
  inherits: inherits,
  bind: bind,
  Future: Future
};

