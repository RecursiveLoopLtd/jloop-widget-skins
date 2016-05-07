function inherits(ctor, superCtor) {
  ctor.prototype = Object.create(superCtor.prototype);
  ctor.prototype.constructor = ctor;
}

exports.inherits = inherits;

