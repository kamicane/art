ART.Path {#ART-Path}
====================

ART.Path lets you draw paths which you could pass into [ART.Shape][].

ART.Path method: constructor
----------------------------

### Syntax:

	var path = new ART.Path([path]);

### Arguments:

1. path - (*mixed*, optional) An already existing path. The following options are possible:
	- *ART.Path* - If path is already an instance of ART.Path, it will copy the path.
	- *string* - A SVG path that will be parsed by ART.Path


ART.Path method: push {#ART-Path:push}
--------------------------------------

// write me

ART.Path method: reset {#ART-Path:reset}
--------------------------------------

// write me

ART.Path method: move {#ART-Path:move}
--------------------------------------

Moves the pointer relatively to the last point.

### Syntax:

	path.move(x, y);

### Arguments:

1. x - (*number*) The amount of pixels in horizontal direction.
2. y - (*number*) The amount of pixels in vertical direction.


ART.Path method: moveTo {#ART-Path:moveTo}
------------------------------------------

Moves the pointer to an absolute point.

### Syntax:

	path.moveTo(x, y);

### Arguments:

1. x - (*number*) The position in horizontal direction.
2. y - (*number*) The position in vertical direction.


ART.Path method: line {#ART-Path:line}
--------------------------------------

Draws a line relatively from the last point.

### Syntax:

	path.line(x, y);

### Arguments:

1. x - (*number*) The amount of pixels in horizontal direction.
2. y - (*number*) The amount of pixels in vertical direction.


ART.Path method: lineTo {#ART-Path:lineTo}
------------------------------------------

Draws a line to an absolute point.

### Syntax:

	path.lineTo(x, y);

### Arguments:

1. x - (*number*) The position in horizontal direction.
2. y - (*number*) The position in vertical direction.


ART.Path method: curve {#ART-Path:curve}
----------------------------------------

// write me


ART.Path method: curveTo {#ART-Path:curveTo}
--------------------------------------------

// write me


ART.Path method: arc {#ART-Path:arc}
------------------------------------

// write me


ART.Path method: arcTo {#ART-Path:arcTo}
----------------------------------------

// write me


ART.Path method: counterArc {#ART-Path:counterArc}
--------------------------------------------------

// write me


ART.Path method: counterArcTo {#ART-Path:counterArcTo}
------------------------------------------------------

// write me


ART.Path method: close {#ART-Path:close}
----------------------------------------

// write me


All other methods
-----------------

// add me
[ART.Shape]: /art/ART.Shape
