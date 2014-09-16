
var el = document.createElement('div'),
    transformProps = 'transform WebkitTransform MozTransform OTransform msTransform'.split(' '),
    transformProp = support(transformProps),
    transitionDuration = 'transitionDuration WebkitTransitionDuration MozTransitionDuration OTransitionDuration msTransitionDuration'.split(' '),
    transitionDurationProp = support(transitionDuration);

function support(props) {
    for(var i = 0, l = props.length; i < l; i++) {
        if(typeof el.style[props[i]] !== "undefined") {
            return props[i];
        }
    }
}

var mouse = { start : {} }
  , touch = document.ontouchmove !== undefined
  , directions = ["LEFT", "UP", "RIGHT", "DOWN"]
  , sides = ["front", "right", "back", "left"];

function UniCube(data) {
    this.horizontalFlip = true;
    this.direction = null;
    this.x = 0;
    this.y = 0;
    this.el = document.querySelectorAll(".cube")[0];

    var d = touch ? 50 : 200;
    this.el.style[transitionDurationProp] = d + "ms";

    this._bindKeydown();
}

UniCube.prototype.flip = function(dir) {
    if (directions.indexOf(dir) !== -1) {
        this.direction = dir;
    }
    if (dir === "LEFT") {
        this.move({y: this.y + 90});
    } else if (dir === "RIGHT") {
        this.move({y: this.y - 90});
    } else if (dir === "UP") {
        this.move({x: this.x - 90});
    } else if (dir === "DOWN") {
        this.move({x: this.x + 90});
    }
}

UniCube.prototype.reset = function() {
    this.move({x: 0, y: 0});
}

UniCube.prototype.move = function(coords) {
    if(coords && !this._directionDisabled()) {
        if(typeof coords.x === "number") this.x = coords.x;
        if(typeof coords.y === "number") this.y = coords.y;
    }
    this.el.style[transformProp] = "rotateX("+this.x+"deg) rotateY("+this.y+"deg)";
}

UniCube.prototype.onFlipEnd = function(fn) {
    var events = ["webkitTransitionEnd", "oTransitionEnd", "transitionend"];

    for (var i = 0, l = events.length; i < l; ++i) {
        this.el.addEventListener(events[i], function(e) {
            fn(this.direction);
            this.direction = null;
        }.bind(this));
    }
}

UniCube.prototype._settle = function() {
    this.x = Math.round(this.x / 90) * 90;
    this.y = Math.round(this.y / 90) * 90;
    this.el.style[transformProp] = "rotateX("+this.x+"deg) rotateY("+this.y+"deg)";
}

UniCube.prototype._bindKeydown = function() {
    var _this = this;

    document.addEventListener("keydown", function(evt) {
        if (evt.keyCode === 27) {
            return _this.reset();
        }
        _this.direction = directions[evt.keyCode - 37];
        _this.flip(_this.direction);
    });

    document.addEventListener("mousedown", startHandler);
    document.addEventListener("touchstart", startHandler);

    function startHandler(evt) {
        delete mouse.last;
        if(evt.target.nodeName === "a") return true;

        evt.touches ? evt = evt.touches[0] : null;
        mouse.start.x = evt.pageX;
        mouse.start.y = evt.pageY;
        this.direction = null;

        document.addEventListener("mousemove", moveHandler);
        document.addEventListener("touchmove", moveHandler);

        document.addEventListener("mouseup", stopHandler);
        document.addEventListener("touchend", stopHandler);
    }

    function moveHandler(event) {
        // Only perform rotation if one touch or mouse (e.g. still scale with pinch and zoom)
        if(!touch || !(event && event.touches.length > 1)) {
            event.preventDefault();
            // Get touch co-ords
            event.touches ? event = event.touches[0] : null;
            _this._handleMousemove({x: event.pageX, y: event.pageY})
        }
    }

    function stopHandler() {
        document.removeEventListener("mousemove", moveHandler);
        document.removeEventListener("touchmove", moveHandler);
        _this._settle();
    }

}

UniCube.prototype._handleMousemove = function(movedMouse) {
    // Reduce movement on touch screens
    var movementScaleFactor = touch ? 4 : 1;

    if (!this.direction) {
        this._getTouchDirection(movedMouse);
        if (!this.direction) return
    } else if (this._directionDisabled()) {
        return;
    }

    if (!mouse.last) {
        mouse.last = mouse.start;
    } else {
        if (forward(mouse.start.x, mouse.last.x) != forward(mouse.last.x, movedMouse.x)) {
            mouse.start.x = mouse.last.x;
        }
        if (forward(mouse.start.y, mouse.last.y) != forward(mouse.last.y, movedMouse.y)) {
            mouse.start.y = mouse.last.y;
        }
    }

    var x, y;
    if (this.horizontalFlip) {
        x = this.x + parseInt((mouse.start.y - movedMouse.y) / movementScaleFactor);
        y = this.y;
    } else {
        x = this.x;
        y = this.y - parseInt((mouse.start.x - movedMouse.x) / movementScaleFactor);
    }
    this.move({ x: x, y: y });

    mouse.last.x = movedMouse.x;
    mouse.last.y = movedMouse.y;
}

UniCube.prototype._getTouchDirection = function(movedMouse) {
    var diffX = mouse.start.x - movedMouse.x;
    var diffY = mouse.start.y - movedMouse.y;

    if (Math.abs(diffX) > 3 || Math.abs(diffY) > 3) {
        this.horizontalFlip = Math.abs(diffX) < Math.abs(diffY);

        if (!this.horizontalFlip) {
            this.direction = diffX < 0 ? "LEFT" : "RIGHT";
        } else {
            this.direction = diffY < 0 ? "UP" : "DOWN";
        }
    } else {
        this.direction = null;
    }
}

UniCube.prototype._directionDisabled = function() {
    if (this.direction === "UP") {
        return this.x <= -90;
    } else if (this.direction === "DOWN") {
        return this.x >= 90;
    } else if (this.direction === "RIGHT" || this.direction === "LEFT") {
        return this.x >= 90 || this.x <= -90;
    }
}

function forward(v1, v2) {
    return v1 >= v2 ? true : false;
}