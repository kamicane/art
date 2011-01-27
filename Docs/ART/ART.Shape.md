ART.Shape {#ART-Shape}
======================

ART.Shape is usually used to inherit from. For example [ART.Shapes][] inherit from
ART.Shape so each shape gets all common ART.Shape methods

ART.Shape method: constructor
-----------------------------

Creates a new shape.

### Syntax:

	var shape = new ART.Shape([path, width, height]);

### Arguments:

1. path - (*ART.Path*, optional) An [ART.Path][] instance.
2. width - (*number*, optional) The width of the shape in pixels.
3. height - (*number*, optional) The height of the shape in pixels.


ART.Shape method: draw {#ART-Shape:draw}
----------------------------------------

Draws the provided path on the canvas.

### Syntax:

	shape.draw(path, height, width);

### Arguments:

1. path - (*ART.Path*, optional) An [ART.Path][] instance.
2. width - (*number*, optional) The width of the shape in pixels.
3. height - (*number*, optional) The height of the shape in pixels.

### Returns:

* The ART.Shape instance


ART.Shape method: inject {#ART-Shape:inject}
--------------------------------------------

Injects a into another element or [ART][] instance.

### Syntax:

	shape.inject(container);

### Arguments:

1. container - (*mixed*) an [ART][] instance or another [ART.Shape][]

### Returns:

* The ART.Shape instance

### Example:

	var art = new ART(500, 500);
	var shape = new ART.Rectangle(400, 200).fill('black').inject(art);


// TODO: the other methods

[ART]: /art/ART/ART
[ART.Shape]: /art/ART/ART.Shape
[ART.Shapes]: /art/ART/ART.Shapes
[ART.Path]: /art/ART/ART.Path

