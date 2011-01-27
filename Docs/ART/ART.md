ART {#ART}
==========

ART creates a new canvas to draw on.

ART method: constructor
-----------------------

Creates a new canvas.

### Syntax:

	var art = new ART([width, height]);

### Arguments:

1. width - (*number*, optional) The width of the element in pixels
2. height - (*number*, optional) The height of the element in pixels

### Example:

	var art = new ART(300, 400);
	// Inject it in our page
	$('myElement').adopt(art);


ART method: resize {#ART:resize}
--------------------------------

Resizes the canvas to a new width and height.

### Syntax:

	art.resize(width, height);

### Arguments:

1. width - (*number*) The width of the element in pixels
2. height - (*number*) The height of the element in pixels

