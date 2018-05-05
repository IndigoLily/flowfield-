function Vector(x = 0, y = 0) {
    this.x = x;
    this.y = y;
}

Vector.prototype.mag = function() {
    return Math.hypot(this.x, this.y);
}

Vector.prototype.magSq = function() {
    return this.x*this.x + this.y*this.y;
}

Vector.prototype.angle = function(rad = false) {
    const angle = Math.atan2(this.y, this.x);
    return rad ? angle : angle / Math.PI * 180;
}

Vector.prototype.add = function(addend) {
    this.x += addend.x || 0;
    this.y += addend.y || 0;
}

Vector.prototype.sub = function(subtr) {
    this.x -= subtr.x || 0;
    this.y -= subtr.y || 0;
}

Vector.prototype.mult = function(factor) {
    this.x *= factor;
    this.y *= factor;
}

Vector.prototype.div = function(divisor) {
    this.x /= divisor;
    this.y /= divisor;
}

Vector.prototype.normalize = function() {
    let mag = this.mag();
    this.div(mag);
}

Vector.prototype.setMag = function(length) {
    let mag = this.mag();
    this.div(mag);
    this.mult(length);
}

Vector.prototype.setAngle = function(angle) {
    const mag = this.mag();
    this.x = Math.cos(angle) * mag;
    this.y = Math.sin(angle) * mag;
}

Vector.prototype.rotate = function(angle) {
    this.setAngle(this.angle(true) + angle);
}

Vector.prototype.clamp = function(mag) {
    if (this.magSq() > mag*mag) {
        this.setMag(mag);
    }
}

Vector.prototype.copy = function() {
    return new Vector(this.x, this.y);
}


function vecAdd(v1, v2) {
    let v3 = v1.copy();
    v3.add(v2);
    return v3;
}

function vecSub(v1, v2) {
    let v3 = v1.copy();
    v3.sub(v2);
    return v3
}

function vecMult(v1, v2) {
    let v3 = v1.copy();
    v3.mult(v2);
    return v3
}

function vecDiv(v1, v2) {
    let v3 = v1.copy();
    v3.div(v2);
    return v3
}

function vecPolar(a, r) {
    return new Vector(Math.cos(a) * r, Math.sin(a) * r);
}
