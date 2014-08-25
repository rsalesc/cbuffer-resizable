/**
 * Created by root on 25/08/14.
 */

var CBuffer = require('CBuffer');
var util = require('util');

function CBufferR(){
// handle cases where "new" keyword wasn't used
    if (!(this instanceof CBufferR)) {
        // multiple conditions need to be checked to properly emulate Array
        if (arguments.length > 1 || typeof arguments[0] !== 'number') {
            return CBufferR.apply(new CBufferR(arguments.length), arguments);
        } else {
            return new CBufferR(arguments[0]);
        }
    }
    CBuffer.prototype.constructor.apply(this, Array.prototype.slice.call(arguments));
    this._resizeFactor = 2;  // default resize factor is 2
};

util.inherits(CBufferR, CBuffer);

CBufferR.prototype.constructor = CBufferR;

CBufferR.prototype.resizeFactor = function(value){
    if(value === undefined || value == null) return this._resizeFactor;
    this._resizeFactor = value;
};

CBufferR.prototype.resize = function(new_length){
    var data = new Array(new_length);
    for(var i = this.start, p = 0; i < this.size; i++, p++){
        data[p] = this.data[i % this.length];
    }
    this.data = data;
    this.length = new_length;
    this.start = 0;
    this.end = this.size - 1;
};

CBufferR.prototype.push = function(){
    var i = 0;
    // check if buffer is about to be overflowed
    var future_size = this.size + arguments.length;
    if (future_size > this.length) {
        var future_length = Math.round(this.length * this._resizeFactor);
        this.resize(future_length > future_size ? future_length : Math.round(future_size * this._resizeFactor));
    }
    // push items as usual
    // push items to the end, wrapping and erasing existing items
    // using arguments variable directly to reduce gc footprint
    for (i = 0; i < arguments.length; i++) {
        this.data[(this.end + i + 1) % this.length] = arguments[i];
    }
    // recalculate size
    if (this.size < this.length) {
        if (this.size + i > this.length) this.size = this.length;
        else this.size += i;
    }
    // recalculate end
    this.end = (this.end + i) % this.length;
    // recalculate start
    this.start = (this.length + this.end - this.size + 1) % this.length;
    // return number current number of items in CBuffer
    return this.size;
};

module.exports = CBufferR;