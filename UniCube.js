
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

function UniCube(cube, content) {
    this.horizontalFlip = false;
    this.touchDisabled = false;
    this.inMovement = false;
    this.direction = null;
    this.content = content;
    this.x = 0;
    this.y = 0;
    this.el = cube;

    var d = touch ? 50 : 200;
    this.el.style[transitionDurationProp] = d + "ms";

    this.sides = {};
    this._createSides();
    this._bindKeydown();
    this._setContent();
}

UniCube.prototype.flip = function(dir) {
    if (directions.indexOf(dir) !== -1) {
        this.direction = dir;
    }

    if (this.direction !== null) {
        this._setContent();
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

UniCube.prototype.disableTouch = function(value) {
    this.touchDisabled = value;
}

UniCube.prototype.onFlipEnd = function(fn) {
    var events = ["webkitTransitionEnd", "oTransitionEnd", "transitionend"];

    for (var i = 0, l = events.length; i < l; ++i) {
        this.el.addEventListener(events[i], function(e) {
            var side;
            if (this.x === 90) side = this.sides.bottom;
            else if (this.x === -90) side = this.sides.top;
            else side = this.sides[cycleArray(sides, Math.floor(-this.y / 90))];

            if (!this.inMovement) {
                fn(this.direction, side);
                this.direction = null;
            }
        }.bind(this));
    }
}

UniCube.prototype._setContent = function() {
    var indexSide = Math.floor(-this.y / 90)
      , dir = this.direction || "LEFT"
      , side1, side2, nextIndex, indexTop;

    if (this.horizontalFlip) {
        indexTop = (this.x === 90 ? 2 : (this.x === -90) ? 0 : 1);
        nextIndex = (dir === "UP" ? indexTop + 1 : indexTop - 1);

        if (indexTop === 2) {
            side1 = this.sides.top;
            side2 = this.sides[cycleArray(sides, indexSide)];
        } else if (indexTop === 0) {
            side1 = this.sides.bottom;
            side2 = this.sides[cycleArray(sides, indexSide)];
        } else {
            side1 = this.sides[cycleArray(sides, indexSide)];
            side2 = dir === "UP" ? this.sides.top : this.sides.bottom;
        }
        side1.innerHTML = cycleArray(this.content, indexSide)[indexTop];
        side2.innerHTML = cycleArray(this.content, indexSide)[nextIndex];
    } else {
        nextIndex = (dir === "LEFT" ? indexSide - 1 : indexSide + 1);
        side1 = this.sides[cycleArray(sides, indexSide)];
        side2 = this.sides[cycleArray(sides, nextIndex)];
        side1.innerHTML = cycleArray(this.content, indexSide)[1];
        side2.innerHTML = cycleArray(this.content, nextIndex)[1];
    }
}

UniCube.prototype._settle = function() {
    this.x = Math.round(this.x / 90) * 90;
    this.y = Math.round(this.y / 90) * 90;
    if (this.x > 90) this.x = 90;
    if (this.x < -90) this.x = -90;
    this.el.style[transformProp] = "rotateX("+this.x+"deg) rotateY("+this.y+"deg)";
}

UniCube.prototype._bindKeydown = function() {
    var _this = this;

    document.addEventListener("keydown", function(evt) {
        if (evt.keyCode === 27) {
            return _this.reset();
        }
        if (evt.keyCode >= 37 && evt.keyCode <= 40) {
            _this.direction = directions[evt.keyCode - 37];
            _this.flip(_this.direction);
        }
    });

    document.addEventListener("mousedown", startHandler);
    document.addEventListener("touchstart", startHandler);

    function startHandler(evt) {
        delete mouse.last;
        if(evt.target.nodeName === "a") return true;
        if (_this.touchDisabled) return ;

        evt.touches ? evt = evt.touches[0] : null;
        mouse.start.x = evt.pageX;
        mouse.start.y = evt.pageY;
        _this.startX = evt.pageX;
        _this.startY = evt.pageY;
        _this.direction = null;
        _this.inMovement = true;

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
        _this.inMovement = false;
    }

}

UniCube.prototype._handleMousemove = function(movedMouse) {
    // Reduce movement on touch screens
    var movementScaleFactor = touch ? 4 : 1;

    if (!this.direction || this._directionChanged(movedMouse)) {
        this._getTouchDirection(movedMouse);
        if (!this.direction) return
    }
    if (this._directionDisabled(movedMouse)) {
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
    this._setContent();
}

UniCube.prototype._createSides = function() {
    var sides = ["front", "right", "back", "left", "top", "bottom"];
    for (var i = 0, l = sides.length; i < l; ++i) {
        var side = document.createElement("div");
        side.className = "unicube-" + sides[i];
        this.el.appendChild(side);
        this.sides[sides[i]] = side;
    }
}

UniCube.prototype._directionChanged = function(movedMouse) {
    var diffX = this.startX - movedMouse.x;
    var diffY = this.startY - movedMouse.y;

    if (this.direction === "DOWN") {
        return diffY < 3;
    } else if (this.direction === "UP") {
        return diffY > 3;
    } else if (this.direction === "RIGHT") {
        return diffX > 3;
    } else if (this.direction === "LEFT") {
        return diffX < 3;
    }
}

UniCube.prototype._getTouchDirection = function(movedMouse) {
    var diffX = mouse.start.x - movedMouse.x;
    var diffY = mouse.start.y - movedMouse.y;

    if (Math.abs(diffX) > 3 || Math.abs(diffY) > 3) {
        if (!this.direction) {
            this.horizontalFlip = Math.abs(diffX) < Math.abs(diffY);
        }

        if (!this.horizontalFlip) {
            this.direction = diffX < 0 ? "LEFT" : "RIGHT";
        } else {
            this.direction = diffY < 0 ? "UP" : "DOWN";
        }
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

function cycleArray(array, index) {
    var len = array.length;
    index = index < 0 ? len - (-index % len) : index % len || 0;
    return array[index];
}

function forward(v1, v2) {
    return v1 >= v2 ? true : false;
}