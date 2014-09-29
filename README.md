UniCube
=======

A Dynamic Content 3d Cube with Touch/Swipe

See a live demo at http://zackargyle.github.io/UniCube/

Creating a Cube

1. Add a viewport
```
<article class="viewport">
    <section id="cubeContainer"></section>
</article>
```
2. Instance UniCube
```
var container = document.getElementById("cubeContainer");
var cube = new UniCube(container, [
    "<center>Welcome to UniCube</center>",
    ["<div class='opaque2'>2 Bottom</div>", "<div class='opaque2'>2 Center</div>", "<div class='opaque2'>2 Top</div>"],
    ["<div class='opaque3'>3 Bottom</div>", "<div class='opaque3'>3 Center</div>", "<div class='opaque3'>3 Top</div>"],
    ["<div class='opaque4'>4 Bottom</div>", "<div class='opaque4'>4 Center</div>", "<div class='opaque4'>4 Top</div>"],
    ["<div class='opaque5'>5 Bottom</div>", "<div class='opaque5'>5 Center</div>", "<div class='opaque5'>5 Top</div>"]
]);
```
 - The first param is the container, and the second is an array of side content. 
 - The content may be either an HTMLElement or a string to be set as innerHTML. If the side is an array with 3 content objects, it will set the bottom, middle, and top faces. If the side is not an array, the top and bottom sides will be disabled for that face.

3. Dynamically append more content
```
var element = document.createElement("div");
element.innerHTML = "HELLO WORLD";
cube.appendValue(element);
```
4. Listen in on the end of flip event
```
cube.onFlipEnd(function(direction, side) {
    console.log(direction, side);
});
```

NOTES:
 - Valid directions are "LEFT", "RIGHT", "UP", "DOWN"
 - Valid content is HTMLElement or String (innerHTML)

List of APIs
=======
UniCube.prototype.flip(direction) -> Flip cube to face at direction
UniCube.prototype.appendvalue(content) -> Add another face to the cube
UniCube.prototype.reset() -> Flip cube back to it's initial state
UniCube.prototype.disableTouch(value) -> Disable or enable touch/swipe
UniCube.prototype.onFlipEnd(function) -> Callback for after cube settles on a face

